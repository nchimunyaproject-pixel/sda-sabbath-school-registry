import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import { DatabaseSync } from 'node:sqlite';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// MySQL Connection Configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'sda_church_registry'
};

class SQLitePool {
  constructor(filename) {
    this.db = new DatabaseSync(filename);
    this.initDatabase();
  }

  initDatabase() {
    console.log("Initializing SQLite database...");
    try {
      // Disable FK enforcement during schema init so seed data loads safely
      this.db.exec('PRAGMA foreign_keys = OFF;');

      if (fs.existsSync('init.sql')) {
        let sql = fs.readFileSync('init.sql', 'utf8');
        // Convert MySQL to SQLite DDL
        sql = sql.replace(/^\s*SET\s+[^;]+;/gim, '');
        sql = sql.replace(/ENGINE\s*=\s*\w+/gi, '');
        sql = sql.replace(/DEFAULT\s+CHARSET\s*=\s*\w+/gi, '');
        sql = sql.replace(/COLLATE\s*=\s*\w+/gi, '');
        sql = sql.replace(/INT\s+AUTO_INCREMENT\s+PRIMARY\s+KEY/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT');
        sql = sql.replace(/ON\s+UPDATE\s+CURRENT_TIMESTAMP/gi, '');
        sql = sql.replace(/ENUM\([^)]+\)/gi, 'TEXT');
        sql = sql.replace(/START\s+TRANSACTION/gi, 'BEGIN TRANSACTION');
        sql = sql.replace(/UNIQUE\s+KEY\s+[`"'\w-]+\s*\(([^)]+)\)/gi, 'UNIQUE($1)');
        sql = sql.replace(/INSERT\s+IGNORE\s+INTO/gi, 'INSERT OR IGNORE INTO');

        // Split by semicolon and run each statement
        const statements = sql.split(';');
        for (let stmt of statements) {
          stmt = stmt.trim();
          if (stmt) {
            this.db.exec(stmt);
          }
        }
        console.log("SQLite database initialized successfully with init.sql schema.");
      } else {
        console.warn("init.sql not found, starting with empty SQLite database.");
      }

      // Re-enable FK enforcement for runtime operations
      this.db.exec('PRAGMA foreign_keys = ON;');
    } catch (e) {
      console.error("Failed to initialize SQLite database:", e);
      // Make sure FK is on even after error
      try { this.db.exec('PRAGMA foreign_keys = ON;'); } catch (_) {}
    }
  }

  async query(sql, params = []) {
    let normalizedSql = sql.replace(/INSERT\s+IGNORE\s+INTO/gi, 'INSERT OR IGNORE INTO');
    normalizedSql = normalizedSql.replace(/\bNOW\(\)/gi, "datetime('now')");

    // Handle MySQL bulk insert syntax: VALUES ?
    let normalizedParams = params || [];
    if (/VALUES\s*\?/i.test(normalizedSql) && normalizedParams.length === 1 && Array.isArray(normalizedParams[0])) {
      const rows = normalizedParams[0];
      if (rows.length === 0) {
        return [{ affectedRows: 0, insertId: 0 }, []];
      }
      const numCols = rows[0].length;
      const placeholders = rows.map(() => '(' + Array(numCols).fill('?').join(', ') + ')').join(', ');
      normalizedSql = normalizedSql.replace(/VALUES\s*\?/i, `VALUES ${placeholders}`);
      normalizedParams = rows.flat();
    }

    normalizedParams = normalizedParams.map(p => {
      if (typeof p === 'boolean') return p ? 1 : 0;
      if (p !== null && typeof p === 'object') return JSON.stringify(p);
      return p;
    });

    const isSelect = /^\s*(SELECT|SHOW|PRAGMA|DESCRIBE)/i.test(normalizedSql);
    const stmt = this.db.prepare(normalizedSql);

    if (isSelect) {
      const rows = stmt.all(...normalizedParams);
      return [rows, []];
    } else {
      const res = stmt.run(...normalizedParams);
      return [{ affectedRows: res.changes, insertId: res.lastInsertRowid }, []];
    }
  }

  async getConnection() {
    return {
      query: async (sql, params = []) => this.query(sql, params),
      beginTransaction: async () => {
        this.db.exec('BEGIN TRANSACTION');
      },
      commit: async () => {
        this.db.exec('COMMIT');
      },
      rollback: async () => {
        this.db.exec('ROLLBACK');
      },
      release: () => {}
    };
  }
}

let pool;
try {
  // Test connection to MySQL with short timeout
  const testConn = await mysql.createConnection({ ...dbConfig, connectTimeout: 1000 });
  await testConn.end();
  console.log("✅ Successfully connected to MySQL database: " + dbConfig.database);
  pool = mysql.createPool(dbConfig);
} catch (err) {
  console.warn("⚠️ MySQL Connection failed. Falling back to built-in SQLite database (sda_church.db).");
  pool = new SQLitePool('sda_church.db');
}


const mailTransport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

const resetTokens = new Map();
const RESET_TOKEN_TTL_MS = 1000 * 60 * 30; // 30 minutes

const getChurchId = (req) => {
  const headerId = req.headers['x-church-id'];
  if (headerId && typeof headerId === 'string') return headerId;
  const host = (req.hostname || '').split(':')[0];
  if (host && host !== 'localhost' && host !== '127.0.0.1') {
    const parts = host.split('.');
    if (parts.length >= 3) return parts[0];
  }
  return process.env.DEMO_CHURCH_ID || 'demo';
};

const toDateOnly = (value) => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().split('T')[0];
};

/* ============================
   HEALTH
============================ */
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'healthy', database: dbConfig.database });
  } catch (err) {
    res.status(500).json({ status: 'unhealthy', error: err.message });
  }
});

/* ============================
   AUTH — LOGIN
============================ */
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, role } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }

    const emailClean = email.toLowerCase().trim();
    // Query globally since Conference/District admins don't have a churchId
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [emailClean]);

    if (!users.length) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = users[0];

    // Check if church is approved for CLERK or TEACHER roles
    if (user.role === 'CLERK' || user.role === 'TEACHER') {
      if (user.churchId) {
        const [churches] = await pool.query('SELECT status, is_active FROM churches WHERE id = ?', [user.churchId]);
        if (churches.length && churches[0].status === 'pending') {
          return res.status(403).json({ error: 'Registration is pending administrator approval.' });
        }
        if (churches.length && !churches[0].is_active) {
          return res.status(403).json({ error: 'This church account has been deactivated.' });
        }
      }
    }

    // Password Match
    let passwordMatch = false;
    if (user.password && user.password.startsWith('$2')) {
      passwordMatch = await bcrypt.compare(password, user.password);
    } else {
      passwordMatch = user.password === password;
    }

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (role && user.role !== role) {
      return res.status(403).json({ error: 'Access denied for this role' });
    }

    // Update last login
    await pool.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    // Return user without password
    const { password: _p, ...safeUser } = user;
    res.json(safeUser);
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

/* ============================
   USERS / CLASSES / DATA
============================ */
app.get('/api/users', async (_, res) => {
  try {
    const churchId = getChurchId(_);
    const [users] = await pool.query('SELECT * FROM users WHERE churchId = ?', [churchId]);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Clerk password reset email (mock)
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      return res.status(500).json({ error: 'Email service not configured' });
    }

    const churchId = getChurchId(req);
    const [users] = await pool.query('SELECT id, role FROM users WHERE email = ? AND churchId = ?', [email, churchId]);
    if (!users.length || users[0].role !== 'CLERK') {
      return res.status(404).json({ error: 'Clerk account not found' });
    }

    const resetToken = `reset_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    const expiresAt = Date.now() + RESET_TOKEN_TTL_MS;
    resetTokens.set(resetToken, { email, expiresAt, churchId });
    const resetLink = `${process.env.APP_URL || 'http://localhost:5173'}/#/reset/${resetToken}`;

    await mailTransport.sendMail({
      from: process.env.EMAIL_FROM || process.env.GMAIL_USER,
      to: email,
      subject: 'SDA Registry Password Reset',
      text: `You requested a password reset. Use this link to continue: ${resetLink}`,
      html: `<p>You requested a password reset.</p><p><a href="${resetLink}">Click here to reset your password</a></p>`
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Failed to send reset email' });
  }
});

app.post('/api/auth/reset', async (req, res) => {
  try {
    const { token, password } = req.body || {};
    if (!token || !password) {
      return res.status(400).json({ error: 'Missing token or password' });
    }

    const entry = resetTokens.get(token);
    if (!entry || entry.expiresAt < Date.now()) {
      resetTokens.delete(token);
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    const [result] = await pool.query(
      'UPDATE users SET password = ? WHERE email = ? AND role = ? AND churchId = ?',
      [password, entry.email, 'CLERK', entry.churchId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Clerk account not found' });
    }

    resetTokens.delete(token);
    res.json({ success: true });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Notify teachers about upcoming Sabbath
app.post('/api/notifications/next-sabbath', async (req, res) => {
  try {
    const { message, sabbathDate, recipients } = req.body || {};
    if (!message) {
      return res.status(400).json({ error: 'Missing message' });
    }
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      return res.status(500).json({ error: 'Email service not configured' });
    }

    const churchId = getChurchId(req);
    const normalizeRecipients = (value) => {
      if (!value) return [];
      if (Array.isArray(value)) {
        return value.map(v => String(v).trim()).filter(v => v.includes('@'));
      }
      if (typeof value === 'string') {
        return value
          .split(/[,;\s]+/)
          .map(v => v.trim())
          .filter(v => v.includes('@'));
      }
      return [];
    };

    let targetRecipients = normalizeRecipients(recipients);
    if (targetRecipients.length === 0) {
      const [teachers] = await pool.query(
        'SELECT name, email FROM users WHERE role = ? AND churchId = ? AND email IS NOT NULL',
        ['TEACHER', churchId]
      );

      if (!teachers.length) {
        return res.status(404).json({ error: 'No teachers with email found' });
      }
      targetRecipients = teachers.map(t => t.email).filter(Boolean);
    }

    const dateOnly = toDateOnly(sabbathDate);
    const subjectDate = dateOnly ? ` - ${dateOnly}` : '';
    const subject = `Sabbath School Notice${subjectDate}`;
    const finalMessage = dateOnly ? `${message}\n\nDate: ${dateOnly}` : message;

    await mailTransport.sendMail({
      from: process.env.EMAIL_FROM || process.env.GMAIL_USER,
      to: process.env.EMAIL_FROM || process.env.GMAIL_USER,
      bcc: targetRecipients,
      subject,
      text: finalMessage,
      html: `<p>${finalMessage.replace(/\n/g, '<br />')}</p>`
    });

    res.json({ success: true, recipients: targetRecipients.length });
  } catch (err) {
    console.error('Next sabbath notification error:', err);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

// Create a new user (teacher/clerk/admin)
app.post('/api/users', async (req, res) => {
  try {
    const {
      id,
      name,
      email,
      password,
      role,
      assignedClass,
      language,
      churchName,
      churchId
    } = req.body;

    if (!id || !name || !email || !password || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const scopedChurchId = churchId || getChurchId(req);

    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ? AND churchId = ?',
      [email, scopedChurchId]
    );
    if (existing.length) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    await pool.query(
      `INSERT INTO users
       (id,name,email,password,role,assignedClass,language,churchName,churchId)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [
        id,
        name,
        email,
        password,
        role,
        assignedClass || null,
        language || null,
        churchName || null,
        scopedChurchId
      ]
    );

    res.status(201).json({
      id,
      name,
      email,
      password,
      role,
      assignedClass: assignedClass || null,
      language: language || null,
      churchName: churchName || null,
      churchId: scopedChurchId
    });
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update last login timestamp
app.put('/api/users/:id/last-login', async (req, res) => {
  try {
    const { id } = req.params;
    const churchId = getChurchId(req);
    const [result] = await pool.query(
      'UPDATE users SET last_login = NOW() WHERE id = ? AND churchId = ?',
      [id, churchId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Last login update error:', err);
    res.status(500).json({ error: 'Failed to update last login' });
  }
});

// Remove user (teacher/clerk/admin)
app.delete('/api/users/:id', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const churchId = getChurchId(req);
    await connection.beginTransaction();

    // Unassign classes for this teacher
    await connection.query(
      'UPDATE classes SET teacherId = "" WHERE teacherId = ? AND churchId = ?',
      [id, churchId]
    );

    const [result] = await connection.query('DELETE FROM users WHERE id = ? AND churchId = ?', [id, churchId]);
    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'User not found' });
    }

    await connection.commit();
    res.json({ success: true });
  } catch (err) {
    await connection.rollback();
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  } finally {
    connection.release();
  }
});

// Update user password
app.put('/api/users/:id/password', async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body || {};
    const churchId = getChurchId(req);

    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    // Hash the new password
    const hashed = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'UPDATE users SET password = ? WHERE id = ? AND churchId = ?',
      [hashed, id, churchId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Password update error:', err);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

// Update teacher assignment
app.put('/api/users/:id/assignment', async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedClass, language } = req.body;
    const churchId = getChurchId(req);

    if (!assignedClass) {
      return res.status(400).json({ error: 'Missing assignedClass' });
    }

    const [result] = await pool.query(
      'UPDATE users SET assignedClass = ?, language = COALESCE(?, language) WHERE id = ? AND churchId = ?',
      [assignedClass, language || null, id, churchId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Assignment update error:', err);
    res.status(500).json({ error: 'Failed to update assignment' });
  }
});

// Assign/replace a teacher for a class
app.put('/api/classes/:id/teacher', async (req, res) => {
  try {
    const { id } = req.params;
    const { teacherId, language } = req.body;
    const churchId = getChurchId(req);

    if (!teacherId) {
      return res.status(400).json({ error: 'Missing teacherId' });
    }

    const [result] = await pool.query(
      'UPDATE classes SET teacherId = ?, language = COALESCE(?, language) WHERE id = ? AND churchId = ?',
      [teacherId, language || null, id, churchId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Class not found' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Update class teacher error:', err);
    res.status(500).json({ error: 'Failed to update class teacher' });
  }
});

// Create a new class
app.post('/api/classes', async (req, res) => {
  try {
    const { id, name, teacherId, language } = req.body || {};
    const churchId = getChurchId(req);

    if (!name) {
      return res.status(400).json({ error: 'Missing class name' });
    }

    const classId = id || `class_${Date.now()}`;
    const classTeacherId = typeof teacherId === 'string' ? teacherId : '';
    const classLanguage = typeof language === 'string' && language.trim() ? language.trim() : 'English';

    // Ensure the church row exists before inserting (avoids FK constraint error in SQLite)
    await pool.query(
      `INSERT OR IGNORE INTO churches (id, church_name, status, districtId, conferenceId) VALUES (?, ?, 'approved', 'dist_001', 'conf_001')`,
      [churchId, churchId]
    );

    await pool.query(
      'INSERT INTO classes (id, name, teacherId, language, churchId) VALUES (?, ?, ?, ?, ?)',
      [classId, name, classTeacherId, classLanguage, churchId]
    );

    res.json({
      id: classId,
      name,
      teacherId: classTeacherId,
      language: classLanguage,
      students: []
    });
  } catch (err) {
    console.error('Create class error:', err);
    res.status(500).json({ error: 'Failed to create class' });
  }
});

app.get('/api/classes', async (_, res) => {
  try {
    const churchId = getChurchId(_);
    const [classes] = await pool.query('SELECT * FROM classes WHERE churchId = ?', [churchId]);

    const classesWithStudents = await Promise.all(
      classes.map(async c => {
        const [students] = await pool.query(
          `SELECT id,name,classId,email,phone,address,age,gender,baptized,member_since,
           emergency_contact,medical_notes,attendanceStatus,attendanceNote,
           lessonStudied = 1 AS lessonStudied
           FROM students WHERE classId = ? AND churchId = ?`,
          [c.id, churchId]
        );
        return { ...c, students };
      })
    );

    res.json(classesWithStudents);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch classes' });
  }
});

// Delete student
app.delete('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const churchId = getChurchId(req);
    const [result] = await pool.query('DELETE FROM students WHERE id = ? AND churchId = ?', [id, churchId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Delete student error:', err);
    res.status(500).json({ error: 'Failed to delete student' });
  }
});

// Create student
app.post('/api/students', async (req, res) => {
  try {
    const {
      id,
      name,
      classId,
      email,
      phone,
      address,
      age,
      gender,
      baptized,
      member_since,
      emergency_contact,
      medical_notes,
      attendanceStatus,
      lessonStudied,
      attendanceNote,
      churchId
    } = req.body;

    if (!id || !name || !classId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const scopedChurchId = churchId || getChurchId(req);

    await pool.query(
      `INSERT INTO students
       (id, name, classId, email, phone, address, age, gender, baptized, member_since, emergency_contact, medical_notes, attendanceStatus, lessonStudied, attendanceNote, churchId)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        id,
        name,
        classId,
        email || null,
        phone || null,
        address || null,
        age || null,
        gender || null,
        baptized ? 1 : 0,
        toDateOnly(member_since),
        emergency_contact || null,
        medical_notes || null,
        attendanceStatus || 'unmarked',
        lessonStudied ? 1 : 0,
        attendanceNote || null,
        scopedChurchId
      ]
    );

    res.status(201).json(req.body);
  } catch (err) {
    console.error('Create student error:', err);
    res.status(500).json({ error: 'Failed to create student' });
  }
});

// Update student
app.put('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const churchId = getChurchId(req);
    const {
      name,
      email,
      phone,
      age,
      gender,
      baptized,
      member_since,
      emergency_contact,
      medical_notes,
      address
    } = req.body;

    const [result] = await pool.query(
      `UPDATE students
       SET name = ?, email = ?, phone = ?, address = ?, age = ?, gender = ?, baptized = ?, member_since = ?, emergency_contact = ?, medical_notes = ?
       WHERE id = ? AND churchId = ?`,
      [
        name,
        email || null,
        phone || null,
        address || null,
        age || null,
        gender || null,
        baptized ? 1 : 0,
        toDateOnly(member_since),
        emergency_contact || null,
        medical_notes || null,
        id,
        churchId
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Update student error:', err);
    res.status(500).json({ error: 'Failed to update student' });
  }
});

/* ============================
   USER REGISTRATION
============================ */
app.post('/api/users/register', async (req, res) => {
  try {
    const {
      id,
      name,
      email,
      password,
      role,
      assignedClass,
      language,
      churchName,
      churchId
    } = req.body;

    // Basic validation
    if (!id || !name || !email || !password || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Prevent duplicate email
    const scopedChurchId = churchId || getChurchId(req);
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ? AND churchId = ?',
      [email, scopedChurchId]
    );

    if (existing.length) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    await pool.query(
      `INSERT INTO users
       (id,name,email,password,role,assignedClass,language,churchName,churchId)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [
        id,
        name,
        email,
        password,
        role,
        assignedClass || null,
        language || null,
        churchName || null,
        scopedChurchId
      ]
    );

    res.status(201).json({ success: true });
  } catch (err) {
    console.error('Register Error:', err);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

/* ============================
   ANNOUNCEMENTS (MISSING FIX)
============================ */
app.get('/api/announcements', async (_, res) => {
  try {
    const churchId = getChurchId(_);
    const [announcements] = await pool.query(
      'SELECT * FROM announcements WHERE churchId = ? ORDER BY timestamp DESC',
      [churchId]
    );
    res.json(announcements);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

/* ============================
   OFFERINGS
============================ */
app.get('/api/offerings', async (_, res) => {
  try {
    const churchId = getChurchId(_);
    const [rows] = await pool.query('SELECT * FROM offerings WHERE id = ? AND churchId = ?', ['current', churchId]);
    if (!rows.length) return res.json(null);
    res.json(rows[0]);
  } catch (err) {
    console.error('Offerings fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch offerings' });
  }
});

/* ============================
   ANNOUNCEMENTS CREATE
============================ */
app.post('/api/announcements', async (req, res) => {
  try {
    const {
      id,
      teacherId,
      teacherName,
      className,
      content,
      category,
      priority,
      status,
      timestamp,
      churchId
    } = req.body;

    if (!id || !teacherId || !teacherName || !className || !content || !timestamp) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const dbTimestamp = timestamp ? timestamp.slice(0, 19).replace('T', ' ') : null;
    const scopedChurchId = churchId || getChurchId(req);

    await pool.query(
      `INSERT INTO announcements
       (id, teacherId, teacherName, className, content, category, priority, status, timestamp, churchId)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [
        id,
        teacherId,
        teacherName,
        className,
        content,
        category || 'REPORT',
        priority || 'MEDIUM',
        status || 'pending',
        dbTimestamp,
        scopedChurchId
      ]
    );

    res.status(201).json(req.body);
  } catch (err) {
    console.error('Announcement create error:', err);
    res.status(500).json({ error: 'Failed to create announcement' });
  }
});

/* ============================
   ATTENDANCE CREATE
============================ */
app.post('/api/attendance', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const {
      id,
      date,
      classId,
      className,
      teacherId,
      teacherName,
      totalStudents,
      presentCount,
      absentCount,
      visitorCount,
      lessonStudyCount,
      records = [],
      visitors = [],
      churchId
    } = req.body;

    if (!id || !date || !classId || !className || !teacherId || !teacherName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const scopedChurchId = churchId || getChurchId(req);
    await connection.beginTransaction();

    await connection.query(
      `INSERT INTO attendance_records
       (id, date, classId, className, teacherId, teacherName, totalStudents, presentCount, absentCount, visitorCount, lessonStudyCount, churchId)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        id,
        date,
        classId,
        className,
        teacherId,
        teacherName,
        totalStudents || 0,
        presentCount || 0,
        absentCount || 0,
        visitorCount || 0,
        lessonStudyCount || 0,
        scopedChurchId
      ]
    );

    const attendanceRows = (records || [])
      .filter(r => r.id && r.name)
      .map(r => [id, r.id, r.name, r.attendanceStatus || 'unmarked', r.lessonStudied ? 1 : 0, r.attendanceNote || null, scopedChurchId]);

    if (attendanceRows.length > 0) {
      await connection.query(
        'INSERT INTO attendance_students (recordId, studentId, name, status, lessonStudied, notes, churchId) VALUES ?',
        [attendanceRows]
      );
    }

    const visitorRows = (visitors || [])
      .filter(v => v.id && v.name)
      .map(v => [
        v.id,
        id,
        v.name,
        v.classId || classId,
        v.contact || null,
        v.email || null,
        v.phone || null,
        v.location || null,
        v.purpose || null,
        scopedChurchId
      ]);

    if (visitorRows.length > 0) {
      await connection.query(
        `INSERT INTO visitors
         (id, recordId, name, classId, contact, email, phone, location, purpose, churchId)
         VALUES ?`,
        [visitorRows]
      );
    }

    await connection.commit();
    res.status(201).json(req.body);
  } catch (err) {
    await connection.rollback();
    console.error('Attendance create error:', err);
    res.status(500).json({ error: 'Failed to create attendance record' });
  } finally {
    connection.release();
  }
});

/* ============================
   STUDENT ATTENDANCE UPDATE
============================ */
app.put('/api/students/attendance', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { classId, students = [] } = req.body;
    if (!classId || !Array.isArray(students)) {
      return res.status(400).json({ error: 'Missing classId or students' });
    }
    const churchId = getChurchId(req);

    await connection.beginTransaction();
    for (const s of students) {
      if (!s.id) continue;
      await connection.query(
        'UPDATE students SET attendanceStatus = ?, lessonStudied = ?, attendanceNote = ? WHERE id = ? AND classId = ? AND churchId = ?',
        [s.attendanceStatus || 'unmarked', s.lessonStudied ? 1 : 0, s.attendanceNote || null, s.id, classId, churchId]
      );
    }
    await connection.commit();
    res.json({ success: true });
  } catch (err) {
    await connection.rollback();
    console.error('Update student attendance error:', err);
    res.status(500).json({ error: 'Failed to update student attendance' });
  } finally {
    connection.release();
  }
});

/* ============================
   ATTENDANCE — GET HISTORY
============================ */
app.get('/api/attendance', async (_, res) => {
  try {
    const churchId = getChurchId(_);
    const [records] = await pool.query(
      'SELECT * FROM attendance_records WHERE churchId = ? ORDER BY date DESC',
      [churchId]
    );

    const enriched = await Promise.all(
      records.map(async r => {
        const [students] = await pool.query(
          `SELECT studentId as id, name, status as attendanceStatus, lessonStudied, notes as attendanceNote
           FROM attendance_students WHERE recordId = ? AND churchId = ?`,
          [r.id, churchId]
        );
        const [visitors] = await pool.query(
          'SELECT * FROM visitors WHERE recordId = ? AND churchId = ?',
          [r.id, churchId]
        );
        return {
          ...r,
          date: r.date instanceof Date ? r.date.toISOString().split('T')[0] : r.date,
          records: students.map(s => ({ ...s, lessonStudied: !!s.lessonStudied })),
          visitors,
        };
      })
    );

    res.json(enriched);
  } catch (err) {
    console.error('Attendance fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch attendance records' });
  }
});

/* ============================
   ORIGINAL DATA ENDPOINT
============================ */
app.get('/api/data', async (_, res) => {
  try {
    const churchId = getChurchId(_);
    const [users] = await pool.query('SELECT * FROM users WHERE churchId = ?', [churchId]);
    const [classes] = await pool.query('SELECT * FROM classes WHERE churchId = ?', [churchId]);
    const [students] = await pool.query('SELECT * FROM students WHERE churchId = ?', [churchId]);
    const [announcements] = await pool.query('SELECT * FROM announcements WHERE churchId = ?', [churchId]);
    const [attendanceRecords] = await pool.query('SELECT * FROM attendance_records WHERE churchId = ?', [churchId]);
    const [attStudents] = await pool.query('SELECT * FROM attendance_students WHERE churchId = ?', [churchId]);
    const [visitors] = await pool.query('SELECT * FROM visitors WHERE churchId = ?', [churchId]);

    const admins = users.filter(u => u.role === 'ADMIN');
    const clerks = users.filter(u => u.role === 'CLERK');
    const teachers = users.filter(u => u.role === 'TEACHER');

    const formattedClasses = classes.map(c => ({
      ...c,
      students: students
        .filter(s => s.classId === c.id)
        .map(s => ({ ...s, lessonStudied: !!s.lessonStudied }))
    }));

    const formattedAttendance = attendanceRecords.map(r => ({
      ...r,
      date: r.date.toISOString().split('T')[0],
      records: attStudents
        .filter(a => a.recordId === r.id)
        .map(a => ({
          id: a.studentId,
          name: a.name,
          attendanceStatus: a.status,
          lessonStudied: !!a.lessonStudied,
          attendanceNote: a.notes || null
        })),
      visitors: visitors.filter(v => v.recordId === r.id)
    }));

    res.json({
      admins,
      clerks,
      teachers,
      classes: formattedClasses,
      announcements,
      attendanceRecords: formattedAttendance
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to read from MySQL' });
  }
});

app.post('/api/sync', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    // Default to empty arrays if keys are missing
    const {
      admins = [],
      teachers = [],
      classes = [],
      announcements = [],
      attendanceRecords = [],
      offerings = {
        weeklyMission: 0,
        thirteenthSabbath: 0,
        birthdayThank: 0,
        investmentFund: 0
      }
    } = req.body;
    const churchId = getChurchId(req);

    // Ensure church row exists (prevents FK constraint errors in SQLite fallback)
    await connection.query(
      `INSERT OR IGNORE INTO churches (id, church_name, status, districtId, conferenceId) VALUES (?, ?, 'approved', 'dist_001', 'conf_001')`,
      [churchId, churchId]
    );

    await connection.beginTransaction();

    // 1️⃣ Sync Users
    await connection.query('DELETE FROM users WHERE churchId = ?', [churchId]);


    const allUsers = [...admins, ...teachers].filter(u => u.id && u.name); // skip null/undefined
    if (allUsers.length > 0) {
      await connection.query(
        'INSERT INTO users (id,name,email,password,role,assignedClass,language,churchName,churchId) VALUES ?',
        [allUsers.map(u => [
          u.id,
          u.name,
          u.email || null,
          u.password || null,
          u.role,
          u.assignedClass || null,
          u.language || null,
          u.churchName || null,
          churchId
        ])]
      );
    }

    // 2️⃣ Sync Classes and Students
    await connection.query('DELETE FROM students WHERE churchId = ?', [churchId]);
    await connection.query('DELETE FROM classes WHERE churchId = ?', [churchId]);

    if (classes.length > 0) {
      await connection.query(
        'INSERT INTO classes (id, name, teacherId, language, churchId) VALUES ?',
        [classes.map(c => [
          c.id,
          c.name,
          c.teacherId || '',
          c.language || '',
          churchId
        ])]
      );

      const allStudents = classes.flatMap(c => 
        (c.students || [])
          .filter(s => s.id && s.name)
          .map(s => [
            s.id,
            s.name,
            c.id,
            s.email || null,
            s.phone || null,
            s.address || null,
            s.age || null,
            s.gender || null,
            s.baptized ? 1 : 0,
            toDateOnly(s.member_since),
            s.emergency_contact || null,
            s.medical_notes || null,
            s.attendanceStatus || 'unmarked',
            s.lessonStudied ? 1 : 0,
            s.attendanceNote || null,
            churchId
          ])
      );

      if (allStudents.length > 0) {
        await connection.query(
          'INSERT INTO students (id, name, classId, email, phone, address, age, gender, baptized, member_since, emergency_contact, medical_notes, attendanceStatus, lessonStudied, attendanceNote, churchId) VALUES ?',
          [allStudents]
        );
      }
    }

    // 3️⃣ Sync Announcements
    await connection.query('DELETE FROM announcements WHERE churchId = ?', [churchId]);
    if (announcements.length > 0) {
      await connection.query(
        'INSERT INTO announcements (id, teacherId, teacherName, className, content, timestamp, status, churchId) VALUES ?',
        [announcements.map(a => [
          a.id,
          a.teacherId || null,
          a.teacherName || null,
          a.className || null,
          a.content || null,
          a.timestamp ? a.timestamp.slice(0, 19).replace('T', ' ') : null,
          a.status || 'pending',
          churchId
        ])]
      );
    }

    // 3B️⃣ Sync Offerings
    await connection.query('DELETE FROM offerings WHERE churchId = ?', [churchId]);
    await connection.query(
      'INSERT INTO offerings (id, weeklyMission, thirteenthSabbath, birthdayThank, investmentFund, churchId) VALUES (?,?,?,?,?,?)',
      [
        'current',
        Number(offerings.weeklyMission || 0),
        Number(offerings.thirteenthSabbath || 0),
        Number(offerings.birthdayThank || 0),
        Number(offerings.investmentFund || 0),
        churchId
      ]
    );

    // 4️⃣ Sync Attendance Records + Students + Visitors
    await connection.query('DELETE FROM visitors WHERE churchId = ?', [churchId]);
    await connection.query('DELETE FROM attendance_students WHERE churchId = ?', [churchId]);
    await connection.query('DELETE FROM attendance_records WHERE churchId = ?', [churchId]);

    if (attendanceRecords.length > 0) {
      // Attendance Records
      await connection.query(
        'INSERT INTO attendance_records (id, date, classId, className, teacherId, teacherName, totalStudents, presentCount, absentCount, visitorCount, lessonStudyCount, churchId) VALUES ?',
        [attendanceRecords.map(r => [
          r.id,
          r.date,
          r.classId,
          r.className,
          r.teacherId,
          r.teacherName,
          r.totalStudents || 0,
          r.presentCount || 0,
          r.absentCount || 0,
          r.visitorCount || 0,
          r.lessonStudyCount || 0,
          churchId
        ])]
      );

      // Attendance Students
      const historyStudents = attendanceRecords.flatMap(r =>
        (r.records || []).filter(s => s.id && s.name).map(s => [
          r.id,
          s.id,
          s.name,
          s.attendanceStatus || 'unmarked',
          s.lessonStudied ? 1 : 0,
          s.attendanceNote || null,
          churchId
        ])
      );
      if (historyStudents.length > 0) {
        await connection.query(
          'INSERT INTO attendance_students (recordId, studentId, name, status, lessonStudied, notes, churchId) VALUES ?',
          [historyStudents]
        );
      }

      // Attendance Visitors
      const historyVisitors = attendanceRecords.flatMap(r =>
        (r.visitors || []).map(v => [
          v.id || `vis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          r.id,
          v.name,
          r.classId,
          v.contact || null,
          v.location || null,
          v.purpose || null,
          churchId
        ])
      );
      if (historyVisitors.length > 0) {
        await connection.query(
          'INSERT INTO visitors (id, recordId, name, classId, contact, location, purpose, churchId) VALUES ?',
          [historyVisitors]
        );
      }
    }

    await connection.commit();
    console.log(`[${new Date().toLocaleTimeString()}] SDA MySQL Sync Successful.`);
    res.json({ success: true });
  } catch (err) {
    await connection.rollback();
    console.error('MySQL Sync Error:', err);
    res.status(500).json({ error: 'Failed to sync database', message: err.message });
  } finally {
    connection.release();
  }
});



/* ============================================
   HIERARCHICAL CHURCH REGISTRATION & APPROVALS
============================================ */

// Public church self-registration
app.post('/api/churches/register', async (req, res) => {
  try {
    const {
      id,
      church_name,
      districtId,
      province,
      location,
      email,
      phone_number,
      clerkName,
      clerkEmail,
      pastor_name,
      membership
    } = req.body;

    if (!church_name || !districtId || !province || !location || !email || !phone_number || !clerkName || !clerkEmail) {
      return res.status(400).json({ error: 'Missing required registration fields' });
    }

    // Check if name is taken
    const [existingName] = await pool.query('SELECT id FROM churches WHERE church_name = ?', [church_name]);
    if (existingName.length) {
      return res.status(409).json({ error: 'Church name already registered' });
    }

    // Check if clerk email exists in users
    const [existingClerk] = await pool.query('SELECT id FROM users WHERE email = ?', [clerkEmail]);
    if (existingClerk.length) {
      return res.status(409).json({ error: 'Clerk email already registered to a user account' });
    }

    await pool.query(`
      INSERT INTO churches 
      (id, church_name, districtId, province, location, email, phone_number, clerkName, clerkEmail, pastor_name, membership, status, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', true)
    `, [
      id || `church_${Date.now()}`,
      church_name,
      districtId,
      province,
      location,
      email,
      phone_number,
      clerkName,
      clerkEmail,
      pastor_name || null,
      membership || 0
    ]);

    res.status(201).json({ success: true });
  } catch (err) {
    console.error('Church registration error:', err);
    res.status(500).json({ error: 'Failed to submit registration' });
  }
});

// Fetch pending church registrations
app.get('/api/admin/churches/pending', async (req, res) => {
  try {
    const { role, districtId } = req.query;
    let query = "SELECT * FROM churches WHERE status = 'pending'";
    let params = [];

    if (role === 'DISTRICT_ADMIN' && districtId) {
      query += " AND districtId = ?";
      params.push(districtId);
    }

    const [pending] = await pool.query(query, params);
    res.json(pending);
  } catch (err) {
    console.error('Fetch pending churches error:', err);
    res.status(500).json({ error: 'Failed to fetch pending church registrations' });
  }
});

// Approve a church registration
app.post('/api/admin/churches/:id/approve', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    await connection.beginTransaction();

    const [churches] = await connection.query('SELECT * FROM churches WHERE id = ?', [id]);
    if (!churches.length) {
      await connection.rollback();
      return res.status(404).json({ error: 'Church registration not found' });
    }

    const church = churches[0];
    await connection.query("UPDATE churches SET status = 'approved' WHERE id = ?", [id]);

    // Create a default Clerk user account
    const clerkId = `clerk_${Date.now()}`;
    const tempPass = `welcome_${Math.random().toString(36).slice(2, 7)}`;
    const hashed = await bcrypt.hash(tempPass, 10);

    await connection.query(`
      INSERT INTO users 
      (id, name, email, password, role, churchName, churchId, districtId, conferenceId, is_first_login, temp_password)
      VALUES (?, ?, ?, ?, 'CLERK', ?, ?, ?, 'conf_001', true, ?)
    `, [
      clerkId,
      church.clerkName,
      church.clerkEmail.toLowerCase().trim(),
      hashed,
      church.church_name,
      church.id,
      church.districtId,
      tempPass
    ]);

    // Seed default current offerings row for this church
    await connection.query(`
      INSERT IGNORE INTO offerings 
      (id, weeklyMission, thirteenthSabbath, birthdayThank, investmentFund, churchId)
      VALUES ('current', 0, 0, 0, 0, ?)
    `, [church.id]);

    await connection.commit();

    // Trigger registration email
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      try {
        await mailTransport.sendMail({
          from: process.env.EMAIL_FROM || process.env.GMAIL_USER,
          to: church.clerkEmail,
          subject: 'SDA Registry – Church Approved!',
          text: `Your church "${church.church_name}" has been approved!\n\nTemporary Login Credentials:\nEmail: ${church.clerkEmail}\nPassword: ${tempPass}\n\nYou will be prompted to change your password on first login.`,
          html: `<h3>Church Approved!</h3><p>Your church <strong>${church.church_name}</strong> is now active.</p><p><strong>Clerk Login Credentials:</strong><br/>Email: ${church.clerkEmail}<br/>Temporary Password: <code>${tempPass}</code></p><p>Please log in and update your password.</p>`
        });
      } catch (e) {
        console.error('Failed to send registration approved email:', e);
      }
    }

    res.json({ success: true, tempPass });
  } catch (err) {
    await connection.rollback();
    console.error('Approve church error:', err);
    res.status(500).json({ error: 'Failed to approve church registration' });
  } finally {
    connection.release();
  }
});

/* ============================================
   DISTRICT & CONFERENCE MANAGER ENDPOINTS
============================================ */

// Fetch all districts (and optionally approved churches)
app.get('/api/admin/districts', async (req, res) => {
  try {
    const [districts] = await pool.query('SELECT * FROM districts ORDER BY name ASC');
    const [churches] = await pool.query("SELECT * FROM churches WHERE status = 'approved'");
    
    const enriched = districts.map(d => ({
      ...d,
      is_active: !!d.is_active,
      churches: churches.filter(c => c.districtId === d.id)
    }));

    res.json(enriched);
  } catch (err) {
    console.error('Fetch districts error:', err);
    res.status(500).json({ error: 'Failed to fetch districts' });
  }
});

// Create new district
app.post('/api/admin/districts', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Missing district name' });
    }

    const id = `dist_${Date.now()}`;
    await pool.query('INSERT INTO districts (id, name, conferenceId, is_active) VALUES (?, ?, ?, true)', [
      id,
      name,
      'conf_001' // default conference
    ]);

    res.status(201).json({ id, name, conferenceId: 'conf_001', is_active: true });
  } catch (err) {
    console.error('Create district error:', err);
    res.status(500).json({ error: 'Failed to create district' });
  }
});

// Update district CRUD
app.put('/api/admin/districts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, is_active } = req.body;

    await pool.query('UPDATE districts SET name = COALESCE(?, name), is_active = COALESCE(?, is_active) WHERE id = ?', [
      name || null,
      is_active !== undefined ? (is_active ? 1 : 0) : null,
      id
    ]);

    res.json({ success: true });
  } catch (err) {
    console.error('Update district error:', err);
    res.status(500).json({ error: 'Failed to update district' });
  }
});

/* ============================================
   HIERARCHICAL ANNOUNCEMENTS & bulletins
============================================ */

// Publish hierarchy announcement
app.post('/api/admin/announcements', async (req, res) => {
  try {
    const {
      id,
      title,
      content,
      targetType,
      targetId,
      priority,
      teacherId,
      teacherName,
      className,
      timestamp
    } = req.body;

    if (!content || !targetType || !targetId) {
      return res.status(400).json({ error: 'Missing content, targetType, or targetId' });
    }

    const annId = id || `ann_${Date.now()}`;
    await pool.query(`
      INSERT INTO announcements 
      (id, title, content, targetType, targetId, priority, teacherId, teacherName, className, timestamp, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'compiled')
    `, [
      annId,
      title || 'Announcement',
      content,
      targetType,
      targetId,
      priority || 'NORMAL',
      teacherId || 'admin',
      teacherName || 'Administration',
      className || 'General Notice',
      timestamp ? timestamp.slice(0, 19).replace('T', ' ') : new Date().toISOString().slice(0, 19).replace('T', ' ')
    ]);

    // Send notifications to all recipients in background
    let titleStr = `New ${targetType.toLowerCase()} Bulletin`;
    let msgStr = content.slice(0, 150) + (content.length > 150 ? '...' : '');

    // Log a notification row for the recipient target
    const notifId = `notif_${Date.now()}`;
    await pool.query(`
      INSERT INTO notifications (id, title, message, senderId, senderName, recipientType, recipientId, isRead)
      VALUES (?, ?, ?, ?, ?, ?, ?, false)
    `, [
      notifId,
      titleStr,
      msgStr,
      teacherId || 'admin',
      teacherName || 'Administration',
      targetType === 'CONFERENCE' ? 'CONFERENCE' : targetType === 'DISTRICT' ? 'DISTRICT' : 'CHURCH',
      targetId
    ]);

    res.status(201).json({ id: annId, content, targetType, targetId });
  } catch (err) {
    console.error('Publish announcement error:', err);
    res.status(500).json({ error: 'Failed to publish announcement' });
  }
});

// Fetch my feed of announcements
app.get('/api/announcements/my-feed', async (req, res) => {
  try {
    const { churchId, districtId, conferenceId } = req.query;

    let query = `
      SELECT * FROM announcements 
      WHERE (targetType = 'CONFERENCE')
    `;
    let params = [];

    if (districtId) {
      query += " OR (targetType = 'DISTRICT' AND targetId = ?)";
      params.push(districtId);
    }
    if (churchId) {
      query += " OR (targetType = 'CHURCH' AND targetId = ?)";
      params.push(churchId);
    }

    query += " ORDER BY timestamp DESC";

    const [announcements] = await pool.query(query, params);
    
    // Parse readReceipts before sending to client
    const parsed = announcements.map(a => ({
      ...a,
      readReceipts: a.readReceipts ? JSON.parse(a.readReceipts) : []
    }));

    res.json(parsed);
  } catch (err) {
    console.error('Fetch feed error:', err);
    res.status(500).json({ error: 'Failed to fetch feed' });
  }
});

// Mark announcement read
app.post('/api/announcements/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'Missing userId' });

    const [announces] = await pool.query('SELECT readReceipts FROM announcements WHERE id = ?', [id]);
    if (!announces.length) return res.status(404).json({ error: 'Announcement not found' });

    let currentReceipts = [];
    try {
      if (announces[0].readReceipts) {
        currentReceipts = JSON.parse(announces[0].readReceipts);
      }
    } catch (_) {}

    if (!currentReceipts.includes(userId)) {
      currentReceipts.push(userId);
      await pool.query('UPDATE announcements SET readReceipts = ? WHERE id = ?', [
        JSON.stringify(currentReceipts),
        id
      ]);
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Mark read error:', err);
    res.status(500).json({ error: 'Failed to mark read' });
  }
});

/* ============================================
   IN-APP NOTIFICATIONS
============================================ */

app.get('/api/notifications', async (req, res) => {
  try {
    const { churchId, districtId, conferenceId, userId } = req.query;
    
    let query = `
      SELECT * FROM notifications 
      WHERE (recipientType = 'CONFERENCE' AND recipientId = ?)
    `;
    let params = [conferenceId || 'conf_001'];

    if (districtId) {
      query += " OR (recipientType = 'DISTRICT' AND recipientId = ?)";
      params.push(districtId);
    }
    if (churchId) {
      query += " OR (recipientType = 'CHURCH' AND recipientId = ?)";
      params.push(churchId);
    }
    if (userId) {
      query += " OR (recipientType = 'USER' AND recipientId = ?)";
      params.push(userId);
    }

    query += " ORDER BY created_at DESC";

    const [notifs] = await pool.query(query, params);
    res.json(notifs);
  } catch (err) {
    console.error('Fetch notifications error:', err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

app.put('/api/notifications/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE notifications SET isRead = true WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Read notification error:', err);
    res.status(500).json({ error: 'Failed to update notification status' });
  }
});

/* ============================================
   TEACHER REGISTRATION & FORCE PASSWORD CHANGE
============================================ */

// Create teacher account with temporary password & send email
app.post('/api/users/create-teacher', async (req, res) => {
  try {
    const { name, email, phone, assignedClass } = req.body;
    const churchId = getChurchId(req);

    if (!name || !email || !assignedClass) {
      return res.status(400).json({ error: 'Missing required details' });
    }

    // Check for duplicate email before attempting insert
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'A user with this email address already exists. Please use a different email.' });
    }

    const tempPass = `tmp_${Math.random().toString(36).slice(2, 7)}`;
    const hashed = await bcrypt.hash(tempPass, 10);
    const userId = `teacher_${Date.now()}`;

    // Get church name
    const [churches] = await pool.query('SELECT church_name, districtId FROM churches WHERE id = ?', [churchId]);
    const churchName = churches.length ? churches[0].church_name : 'Local Church';
    const districtId = churches.length ? churches[0].districtId : null;

    await pool.query(`
      INSERT INTO users 
      (id, name, email, password, role, assignedClass, language, churchName, churchId, districtId, conferenceId, is_first_login, temp_password)
      VALUES (?, ?, ?, ?, 'TEACHER', ?, 'English', ?, ?, ?, 'conf_001', true, ?)
    `, [
      userId,
      name,
      email.toLowerCase().trim(),
      hashed,
      assignedClass,
      churchName,
      churchId,
      districtId,
      tempPass
    ]);
    
    // Set teacherId in classes table for the assigned class
    if (assignedClass) {
      await pool.query(
        'UPDATE classes SET teacherId = ? WHERE id = ? AND churchId = ?',
        [userId, assignedClass, churchId]
      );
    }

    // Send credentials email
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      try {
        await mailTransport.sendMail({
          from: process.env.EMAIL_FROM || process.env.GMAIL_USER,
          to: email,
          subject: 'SDA Sabbath School – Teacher Credentials',
          text: `Welcome ${name}!\n\nYou have been registered as a Sabbath School Teacher at ${churchName}.\n\nTemporary Login Credentials:\nEmail: ${email}\nPassword: ${tempPass}\n\nYou must change your password on first login.`,
          html: `<h3>Welcome to Sabbath School!</h3><p>You have been registered as a Teacher at <strong>${churchName}</strong>.</p><p><strong>Login Credentials:</strong><br/>Email: ${email}<br/>Temporary Password: <code>${tempPass}</code></p><p>Please log in and update your password immediately.</p>`
        });
      } catch (e) {
        console.error('Failed to send teacher welcome email:', e);
      }
    }

    res.status(201).json({ success: true, tempPass });
  } catch (err) {
    console.error('Create teacher account error:', err);
    res.status(500).json({ error: 'Failed to create teacher account' });
  }
});

// Force change password endpoint
app.post('/api/users/change-password-force', async (req, res) => {
  try {
    const { userId, newPassword } = req.body;
    if (!userId || !newPassword) {
      return res.status(400).json({ error: 'Missing userId or newPassword' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    const [result] = await pool.query(
      'UPDATE users SET password = ?, is_first_login = false, temp_password = null WHERE id = ?',
      [hashed, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Force change password error:', err);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

/* ============================================
   MULTI-LEVEL STATISTICS REPORTING
============================================ */

app.get('/api/admin/stats', async (req, res) => {
  try {
    const { role, districtId, churchId } = req.query;

    if (role === 'CONFERENCE_ADMIN') {
      const [districts] = await pool.query('SELECT COUNT(*) as count FROM districts');
      const [churches] = await pool.query("SELECT COUNT(*) as count FROM churches WHERE status = 'approved'");
      const [members] = await pool.query("SELECT SUM(membership) as count FROM churches WHERE status = 'approved'");
      const [teachers] = await pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'TEACHER'");
      const [visitors] = await pool.query("SELECT COUNT(*) as count FROM visitors");
      const [students] = await pool.query("SELECT COUNT(*) as count FROM students");
      const [baptized] = await pool.query("SELECT COUNT(*) as count FROM students WHERE baptized = true");

      res.json({
        totalDistricts: districts[0].count,
        totalChurches: churches[0].count,
        totalMembers: members[0].count || 0,
        totalTeachers: teachers[0].count,
        totalVisitors: visitors[0].count,
        totalStudents: students[0].count,
        baptizedMembers: baptized[0].count
      });
    } else if (role === 'DISTRICT_ADMIN' && districtId) {
      const [churches] = await pool.query("SELECT COUNT(*) as count FROM churches WHERE districtId = ? AND status = 'approved'", [districtId]);
      const [members] = await pool.query("SELECT SUM(membership) as count FROM churches WHERE districtId = ? AND status = 'approved'", [districtId]);
      const [teachers] = await pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'TEACHER' AND districtId = ?", [districtId]);
      const [visitors] = await pool.query("SELECT COUNT(*) as count FROM visitors WHERE churchId IN (SELECT id FROM churches WHERE districtId = ?)", [districtId]);

      res.json({
        totalChurches: churches[0].count,
        totalMembers: members[0].count || 0,
        totalTeachers: teachers[0].count,
        totalVisitors: visitors[0].count
      });
    } else {
      res.status(400).json({ error: 'Invalid stats request parameters' });
    }
  } catch (err) {
    console.error('Stats query error:', err);
    res.status(500).json({ error: 'Failed to aggregate statistics' });
  }
});


/* ============================
   SERVER START
============================ */
app.listen(PORT, () => {
  console.log(`✅ SDA Backend running at http://localhost:${PORT}`);
});
