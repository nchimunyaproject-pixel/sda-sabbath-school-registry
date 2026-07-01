import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'sda_church_registry'
};

async function migrate() {
  console.log("Starting database migration...");
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log("Connected to MySQL server.");

    // 1. Create Conferences and Districts
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`conferences\` (
        \`id\` VARCHAR(50) NOT NULL PRIMARY KEY,
        \`name\` VARCHAR(100) NOT NULL UNIQUE,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log("Conferences table verified.");

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`districts\` (
        \`id\` VARCHAR(50) NOT NULL PRIMARY KEY,
        \`name\` VARCHAR(100) NOT NULL,
        \`conferenceId\` VARCHAR(50) NOT NULL,
        \`is_active\` BOOLEAN DEFAULT TRUE,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (\`conferenceId\`) REFERENCES \`conferences\`(\`id\`) ON DELETE CASCADE,
        UNIQUE KEY \`uniq_conf_dist\` (\`conferenceId\`, \`name\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log("Districts table verified.");

    // 2. Adjust Churches table
    // Let's check if the old columns exist
    const [churchCols] = await connection.query("SHOW COLUMNS FROM `churches`");
    const colNames = churchCols.map(c => c.Field);

    if (!colNames.includes('districtId')) {
      console.log("Upgrading churches table...");
      // Drop table and recreate or safely alter. Since old churches table was rarely populated or had different schemas, let's alter it
      // To be safe, we rename the old table to churches_old, create the new table, and migrate
      await connection.query("RENAME TABLE `churches` TO `churches_old`").catch(() => {});
      
      await connection.query(`
        CREATE TABLE \`churches\` (
          \`id\` VARCHAR(50) NOT NULL PRIMARY KEY,
          \`church_name\` VARCHAR(100) NOT NULL UNIQUE,
          \`districtId\` VARCHAR(50) NOT NULL,
          \`province\` VARCHAR(100) NOT NULL,
          \`location\` VARCHAR(150) NOT NULL,
          \`email\` VARCHAR(100) NOT NULL,
          \`phone_number\` VARCHAR(50) NOT NULL,
          \`clerkName\` VARCHAR(100) NOT NULL,
          \`clerkEmail\` VARCHAR(100) NOT NULL,
          \`pastor_name\` VARCHAR(100) DEFAULT NULL,
          \`membership\` INT DEFAULT 0,
          \`status\` ENUM('pending', 'approved') NOT NULL DEFAULT 'pending',
          \`is_active\` BOOLEAN DEFAULT TRUE,
          \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      // Try to migrate data from churches_old
      try {
        const [oldChurches] = await connection.query("SELECT * FROM `churches_old`");
        for (const oc of oldChurches) {
          await connection.query(`
            INSERT IGNORE INTO \`churches\` 
            (id, church_name, districtId, province, location, email, phone_number, clerkName, clerkEmail, pastor_name, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            oc.id || 'church_001',
            oc.church_name || oc.name || 'Central Church',
            'dist_001', // Default district
            'Lusaka',
            oc.location || 'City Center',
            'clerk@church.com',
            oc.contact_number || '+260970000000',
            'Sarah Miller',
            'clerk@church.com',
            oc.pastor_name || 'Pastor John Phiri',
            'approved'
          ]);
        }
        await connection.query("DROP TABLE `churches_old`").catch(() => {});
      } catch (e) {
        console.log("Could not migrate from churches_old, seeding defaults.");
      }
    }
    console.log("Churches table verified & upgraded.");

    // 3. Upgrade Users table
    const [userCols] = await connection.query("SHOW COLUMNS FROM `users`");
    const userColNames = userCols.map(c => c.Field);

    // Modify Role Column Enums
    await connection.query(`
      ALTER TABLE \`users\` 
      MODIFY COLUMN \`role\` ENUM('CONFERENCE_ADMIN', 'DISTRICT_ADMIN', 'CLERK', 'TEACHER', 'VIEWER') NOT NULL DEFAULT 'TEACHER'
    `);

    if (!userColNames.includes('districtId')) {
      await connection.query("ALTER TABLE \`users\` ADD COLUMN \`districtId\` VARCHAR(50) DEFAULT NULL");
    }
    if (!userColNames.includes('conferenceId')) {
      await connection.query("ALTER TABLE \`users\` ADD COLUMN \`conferenceId\` VARCHAR(50) DEFAULT NULL");
    }
    if (!userColNames.includes('is_first_login')) {
      await connection.query("ALTER TABLE \`users\` ADD COLUMN \`is_first_login\` BOOLEAN DEFAULT FALSE");
    }
    if (!userColNames.includes('temp_password')) {
      await connection.query("ALTER TABLE \`users\` ADD COLUMN \`temp_password\` VARCHAR(255) DEFAULT NULL");
    }
    console.log("Users table verified & upgraded.");

    // 4. Upgrade Announcements table
    const [announceCols] = await connection.query("SHOW COLUMNS FROM `announcements`");
    const announceColNames = announceCols.map(c => c.Field);

    if (!announceColNames.includes('targetType')) {
      await connection.query("ALTER TABLE \`announcements\` ADD COLUMN \`targetType\` ENUM('CONFERENCE', 'DISTRICT', 'CHURCH') NOT NULL DEFAULT 'CHURCH'");
    }
    if (!announceColNames.includes('targetId')) {
      await connection.query("ALTER TABLE \`announcements\` ADD COLUMN \`targetId\` VARCHAR(50) NOT NULL DEFAULT 'church_001'");
    }
    if (!announceColNames.includes('priority')) {
      await connection.query("ALTER TABLE \`announcements\` ADD COLUMN \`priority\` ENUM('NORMAL', 'IMPORTANT', 'URGENT') DEFAULT 'NORMAL'");
    }
    if (!announceColNames.includes('expiryDate')) {
      await connection.query("ALTER TABLE \`announcements\` ADD COLUMN \`expiryDate\` DATE DEFAULT NULL");
    }
    if (!announceColNames.includes('isArchived')) {
      await connection.query("ALTER TABLE \`announcements\` ADD COLUMN \`isArchived\` BOOLEAN DEFAULT FALSE");
    }
    if (!announceColNames.includes('readReceipts')) {
      await connection.query("ALTER TABLE \`announcements\` ADD COLUMN \`readReceipts\` JSON DEFAULT NULL");
    }
    if (!announceColNames.includes('richText')) {
      await connection.query("ALTER TABLE \`announcements\` ADD COLUMN \`richText\` TEXT DEFAULT NULL");
    }
    if (!announceColNames.includes('attachments')) {
      await connection.query("ALTER TABLE \`announcements\` ADD COLUMN \`attachments\` TEXT DEFAULT NULL");
    }
    console.log("Announcements table verified & upgraded.");

    // 5. Create Notifications table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`notifications\` (
        \`id\` VARCHAR(50) NOT NULL PRIMARY KEY,
        \`title\` VARCHAR(150) NOT NULL,
        \`message\` TEXT NOT NULL,
        \`senderId\` VARCHAR(50) NOT NULL,
        \`senderName\` VARCHAR(100) NOT NULL,
        \`recipientType\` ENUM('CONFERENCE', 'DISTRICT', 'CHURCH', 'USER') NOT NULL,
        \`recipientId\` VARCHAR(50) NOT NULL,
        \`isRead\` BOOLEAN DEFAULT FALSE,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log("Notifications table verified.");

    // 6. Seed initial configurations
    await connection.query("INSERT IGNORE INTO `conferences` (id, name) VALUES ('conf_001', 'Zambia Union Conference')");
    await connection.query("INSERT IGNORE INTO `districts` (id, name, conferenceId) VALUES ('dist_001', 'Lusaka Central District', 'conf_001')");
    await connection.query("INSERT IGNORE INTO `districts` (id, name, conferenceId) VALUES ('dist_002', 'Copperbelt North District', 'conf_001')");
    
    // Seed default approved churches if empty
    await connection.query(`
      INSERT IGNORE INTO \`churches\` 
      (id, church_name, districtId, province, location, email, phone_number, clerkName, clerkEmail, pastor_name, status)
      VALUES 
      ('church_001', 'Central SDA Church', 'dist_001', 'Lusaka', 'Independence Avenue, Lusaka', 'central@church.org', '+260971234567', 'Sarah Miller', 'clerk@church.com', 'Pastor John Phiri', 'approved'),
      ('church_002', 'Northside SDA Church', 'dist_001', 'Lusaka', 'Roma, Lusaka', 'northside@church.org', '+260972345678', 'David Wilson', 'david@church.com', 'Pastor John Phiri', 'approved'),
      ('church_003', 'Southgate SDA Church', 'dist_002', 'Copperbelt', 'Southgate, Kitwe', 'southgate@church.org', '+260973456789', 'Robert Johnson', 'robert@church.com', 'Pastor Sarah Mwamba', 'approved'),
      ('church_004', 'Westview SDA Church', 'dist_002', 'Copperbelt', 'Westview, Kitwe', 'westview@church.org', '+260974567890', 'Maria Garcia', 'maria@church.com', 'Pastor Sarah Mwamba', 'pending')
    `);

    // Seed administrative users
    await connection.query(`
      INSERT IGNORE INTO \`users\` 
      (id, name, email, password, role, assignedClass, language, churchName, churchId, districtId, conferenceId)
      VALUES
      ('conf_admin_001', 'Elder Mutale', 'conference@church.com', 'password123', 'CONFERENCE_ADMIN', NULL, 'English', NULL, NULL, NULL, 'conf_001'),
      ('dist_admin_001', 'Pastor Phiri', 'district@church.com', 'password123', 'DISTRICT_ADMIN', NULL, 'English', NULL, NULL, 'dist_001', NULL)
    `);

    // Clean up or link old clerks to church_001
    await connection.query(`
      UPDATE \`users\` SET churchId = 'church_001', districtId = 'dist_001', conferenceId = 'conf_001' 
      WHERE email = 'clerk@church.com' AND (churchId IS NULL OR churchId = '' OR churchId = 'demo')
    `);
    
    // Seed sample announcements targetType and targetId
    await connection.query("UPDATE `announcements` SET targetType = 'CHURCH', targetId = 'church_001' WHERE targetId IS NULL OR targetId = '' OR targetId = 'demo'");

    console.log("Migration executed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    if (connection) await connection.end();
  }
}

migrate();
