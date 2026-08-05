import React, { useState, useEffect, useRef } from 'react';
import { useNavigate as useNav } from 'react-router-dom';
import { User, Role } from '../types.ts';
import SDALogo from '../components/SDALogo.tsx';
import {
  Eye, EyeOff, LogIn, Mail, Lock, ChevronRight, RefreshCw,
  AlertTriangle, ShieldCheck, Sparkles, Building2, Church as ChurchIcon,
  Globe, Zap, ArrowRight, CheckCircle2, UserCheck, KeyRound
} from 'lucide-react';
import sdaLogoImg from '../sda.png';

interface LoginPageProps {
  isBackendConnected: boolean;
  onLogin: (user: User) => void;
  teachers: User[];
  admins: User[];
  onTeacherResetRequest: (email: string) => boolean;
  onClerkResetEmail: (email: string) => Promise<boolean>;
  onForceChangePassword: (userId: string, newPass: string) => Promise<boolean>;
}

// ----------------------------------------------------
// 3D Animated Church Connection Canvas Component
// ----------------------------------------------------
const ChurchNetworkCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // Network Nodes Definition (Central Union Hub + Districts + Local Churches)
    interface Node {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      type: 'union' | 'district' | 'church';
      label: string;
      pulse: number;
      pulseSpeed: number;
    }

    const nodes: Node[] = [];

    // Central Union Hub
    nodes.push({
      x: width * 0.5,
      y: height * 0.35,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: 14,
      type: 'union',
      label: 'Division HQ',
      pulse: 0,
      pulseSpeed: 0.03
    });

    // 4 District Hubs
    const districtCoords = [
      { x: 0.22, y: 0.25, label: 'North District' },
      { x: 0.78, y: 0.25, label: 'Central District' },
      { x: 0.28, y: 0.75, label: 'South District' },
      { x: 0.72, y: 0.75, label: 'East District' }
    ];

    districtCoords.forEach((d) => {
      nodes.push({
        x: width * d.x,
        y: height * d.y,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: 9,
        type: 'district',
        label: d.label,
        pulse: Math.random() * Math.PI,
        pulseSpeed: 0.04
      });
    });

    // 16 Local Church Leaf Nodes
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const dist = 140 + Math.random() * 180;
      nodes.push({
        x: width * 0.5 + Math.cos(angle) * dist,
        y: height * 0.5 + Math.sin(angle) * dist,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: 5,
        type: 'church',
        label: `SDA Church #${i + 1}`,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.05
      });
    }

    // Moving signal particles along connections
    interface SignalParticle {
      fromIdx: number;
      toIdx: number;
      progress: number;
      speed: number;
      color: string;
    }

    const signals: SignalParticle[] = [];
    const createSignal = () => {
      if (nodes.length < 2) return;
      const fromIdx = Math.floor(Math.random() * nodes.length);
      let toIdx = Math.floor(Math.random() * nodes.length);
      while (toIdx === fromIdx) toIdx = Math.floor(Math.random() * nodes.length);

      signals.push({
        fromIdx,
        toIdx,
        progress: 0,
        speed: 0.005 + Math.random() * 0.008,
        color: Math.random() > 0.4 ? '#f59e0b' : '#38bdf8'
      });
    };

    // Render loop
    let frame = 0;
    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      // Draw faint geometric grid overlay
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      const gridSize = 60;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Update node positions gently
      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        n.pulse += n.pulseSpeed;

        if (n.x < 40 || n.x > width - 40) n.vx *= -1;
        if (n.y < 40 || n.y > height - 40) n.vy *= -1;
      });

      // Draw connection lines
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          const maxDist = nodes[i].type === 'union' || nodes[j].type === 'union' ? 320 : 180;

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.25;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
            ctx.lineWidth = 1.2;
            ctx.stroke();
          }
        }
      }

      // Spawn signal particles
      if (frame % 25 === 0 && signals.length < 24) {
        createSignal();
      }

      // Draw active signal beams
      for (let s = signals.length - 1; s >= 0; s--) {
        const sig = signals[s];
        sig.progress += sig.speed;

        if (sig.progress >= 1) {
          signals.splice(s, 1);
          continue;
        }

        const n1 = nodes[sig.fromIdx];
        const n2 = nodes[sig.toIdx];
        if (!n1 || !n2) continue;

        const curX = n1.x + (n2.x - n1.x) * sig.progress;
        const curY = n1.y + (n2.y - n1.y) * sig.progress;

        // Glowing particle
        const grad = ctx.createRadialGradient(curX, curY, 0, curX, curY, 8);
        grad.addColorStop(0, sig.color);
        grad.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(curX, curY, 8, 0, Math.PI * 2);
        ctx.fill();

        // Core dot
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(curX, curY, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw nodes
      nodes.forEach((n) => {
        const pulseR = n.radius + Math.sin(n.pulse) * 4;

        // Outer glow
        const glowColor = n.type === 'union' ? 'rgba(245, 158, 11, 0.4)' : n.type === 'district' ? 'rgba(168, 85, 247, 0.4)' : 'rgba(56, 189, 248, 0.3)';
        const coreColor = n.type === 'union' ? '#f59e0b' : n.type === 'district' ? '#c084fc' : '#38bdf8';

        ctx.fillStyle = glowColor;
        ctx.beginPath();
        ctx.arc(n.x, n.y, pulseR + 8, 0, Math.PI * 2);
        ctx.fill();

        // Node circle
        ctx.fillStyle = coreColor;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />;
};

// ----------------------------------------------------
// Main Login Page Component
// ----------------------------------------------------
const LoginPage: React.FC<LoginPageProps> = ({
  isBackendConnected,
  onLogin,
  teachers,
  admins,
  onTeacherResetRequest,
  onClerkResetEmail,
  onForceChangePassword
}) => {
  const navigate = useNav();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [resetMode, setResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMsg, setResetMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Force Password Change states
  const [showForceChangeModal, setShowForceChangeModal] = useState(false);
  const [tempUser, setTempUser] = useState<User | null>(null);
  const [newPass, setNewPass] = useState('');
  const [confirmNewPass, setConfirmNewPass] = useState('');
  const [forceChangeError, setForceChangeError] = useState('');

  // Quick Demo Account Pill selector
  const fillDemoAccount = (roleEmail: string, rolePass: string = 'password123') => {
    setEmail(roleEmail);
    setPassword(rolePass);
    setError('');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const emailClean = email.trim().toLowerCase();

    if (isBackendConnected) {
      try {
        const response = await fetch('http://localhost:3001/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: emailClean, password })
        });

        if (response.ok) {
          const userData = await response.json();
          if (userData.is_first_login) {
            setTempUser(userData);
            setShowForceChangeModal(true);
            setIsLoading(false);
            return;
          }
          onLogin(userData);
        } else {
          const errData = await response.json().catch(() => ({}));
          setError(errData.error || 'Invalid credentials or registration is pending approval.');
        }
      } catch (err) {
        console.error('API login failed, falling back to local credentials', err);
        fallbackLocalLogin(emailClean);
      } finally {
        setIsLoading(false);
      }
    } else {
      setTimeout(() => {
        fallbackLocalLogin(emailClean);
        setIsLoading(false);
      }, 500);
    }
  };

  const fallbackLocalLogin = (emailClean: string) => {
    const allLocalUsers = [
      ...admins,
      ...teachers,
      { id: 'conf_admin_001', name: 'Elder Mutale', email: 'conference@church.com', password: 'password123', role: Role.CONFERENCE_ADMIN },
      { id: 'dist_admin_001', name: 'Pastor Phiri', email: 'district@church.com', password: 'password123', role: Role.DISTRICT_ADMIN, districtId: 'dist_001' }
    ];

    const match = allLocalUsers.find(
      u => u.email?.toLowerCase() === emailClean && u.password === password
    );

    if (match) {
      if (match.is_first_login) {
        setTempUser(match);
        setShowForceChangeModal(true);
      } else {
        onLogin(match);
      }
    } else {
      setError('Invalid credentials. Please verify your email address and password.');
    }
  };

  const handleForcePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setForceChangeError('');

    if (newPass.length < 6) {
      setForceChangeError('New password must be at least 6 characters long.');
      return;
    }
    if (newPass !== confirmNewPass) {
      setForceChangeError('Passwords do not match.');
      return;
    }
    if (!tempUser) return;

    setIsLoading(true);
    try {
      const ok = await onForceChangePassword(tempUser.id, newPass);
      if (ok) {
        setShowForceChangeModal(false);
        const updatedUser = { ...tempUser, is_first_login: false };
        onLogin(updatedUser);
      } else {
        setForceChangeError('Failed to update password. Please try again.');
      }
    } catch (err) {
      setForceChangeError('Error updating password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetMsg('');
    setIsLoading(true);

    const emailClean = resetEmail.trim();
    const isTeacher = teachers.some(t => t.email?.toLowerCase() === emailClean.toLowerCase());

    if (isTeacher) {
      const ok = onTeacherResetRequest(emailClean);
      setResetMsg(
        ok
          ? '✅ Password reset request submitted to your Church Clerk.'
          : '❌ Teacher email address not found in registry.'
      );
    } else {
      const ok = await onClerkResetEmail(emailClean);
      setResetMsg(
        ok
          ? '✅ Password reset link generated and dispatched.'
          : '❌ Account not found or email delivery offline.'
      );
    }
    setIsLoading(false);
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-white flex flex-col items-center justify-between p-4 md:p-8 overflow-hidden font-sans select-none">
      {/* 3D Animated Church Connection Mesh Background */}
      <ChurchNetworkCanvas />

      {/* Ambient Radial Color Nebulae */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-10 left-10 w-[450px] h-[450px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Top Header & Status Bar */}
      <header className="relative z-10 w-full max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4 py-3 border-b border-white/10 mb-6 backdrop-blur-md bg-slate-950/40 rounded-2xl px-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center">
            <div className="bg-slate-950 w-full h-full rounded-[10px] flex items-center justify-center">
              <SDALogo size={24} />
            </div>
          </div>
          <div>
            <h2 className="text-sm font-black tracking-wide text-white flex items-center gap-2">
              SDA DIGITAL REGISTRY
              <span className="bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                Global Union Network
              </span>
            </h2>
            <p className="text-[11px] text-slate-400 font-medium">Seventh-day Adventist Church Sabbath School Platform</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-semibold">
            <span className={`w-2 h-2 rounded-full animate-pulse ${isBackendConnected ? 'bg-emerald-400 shadow-emerald-500/50 shadow-md' : 'bg-amber-400'}`} />
            <span className="text-slate-300">
              {isBackendConnected ? 'Database Connected' : 'Local Storage Mode'}
            </span>
          </div>
        </div>
      </header>

      {/* Central Interactive Hero & Login Section */}
      <main className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-auto">
        
        {/* Left Side: Brand Story & Live Network Visuals */}
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-400/20 px-4 py-1.5 rounded-full text-xs font-bold text-blue-300">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Digital Transformation for Sabbath School Registry</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
            Connecting Local Churches &amp; Conferences <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 bg-clip-text text-transparent">
              In Real-Time Unity.
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl mx-auto lg:mx-0">
            Seamlessly record Sabbath School attendance, manage class rosters, publish union bulletin announcements, and aggregate mission offerings across your conference network.
          </p>

          {/* Network Badges */}
          <div className="grid grid-cols-3 gap-3 pt-2 max-w-lg mx-auto lg:mx-0">
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 text-center backdrop-blur-md">
              <ChurchIcon className="w-5 h-5 text-amber-400 mx-auto mb-1" />
              <div className="text-lg font-black text-white">500+</div>
              <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Churches</div>
            </div>
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 text-center backdrop-blur-md">
              <Building2 className="w-5 h-5 text-purple-400 mx-auto mb-1" />
              <div className="text-lg font-black text-white">50+</div>
              <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Districts</div>
            </div>
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 text-center backdrop-blur-md">
              <Globe className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
              <div className="text-lg font-black text-white">100%</div>
              <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Synchronized</div>
            </div>
          </div>

          {/* One-Click Quick Role Auto-Fill Pills */}
          <div className="pt-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5">
              ⚡ Quick Demo Account Selector (1-Click Fill)
            </p>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
              <button
                type="button"
                onClick={() => fillDemoAccount('conference@church.com')}
                className="bg-purple-950/60 border border-purple-500/40 hover:border-purple-400 text-purple-200 text-xs font-bold px-3 py-1.5 rounded-xl transition-all hover:scale-105 flex items-center gap-1.5"
              >
                🏛️ Conference Admin
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('district@church.com')}
                className="bg-indigo-950/60 border border-indigo-500/40 hover:border-indigo-400 text-indigo-200 text-xs font-bold px-3 py-1.5 rounded-xl transition-all hover:scale-105 flex items-center gap-1.5"
              >
                🏢 District Admin
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('clerk@church.com')}
                className="bg-blue-950/60 border border-blue-500/40 hover:border-blue-400 text-blue-200 text-xs font-bold px-3 py-1.5 rounded-xl transition-all hover:scale-105 flex items-center gap-1.5"
              >
                ⛪ Church Clerk
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('john@church.com')}
                className="bg-amber-950/60 border border-amber-500/40 hover:border-amber-400 text-amber-200 text-xs font-bold px-3 py-1.5 rounded-xl transition-all hover:scale-105 flex items-center gap-1.5"
              >
                📖 SS Teacher
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Ultra-Modern Glassmorphic Login Card */}
        <div className="lg:col-span-5">
          <div className="relative bg-slate-900/80 border border-amber-500/20 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-2xl shadow-blue-950/80 hover:border-amber-500/40 transition-all duration-300">
            
            {/* Top Card Branding */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <img src={sdaLogoImg} alt="SDA Logo" className="w-12 h-12 object-contain drop-shadow-md" />
                <div>
                  <h3 className="font-black text-lg text-white tracking-wide">Account Login</h3>
                  <p className="text-xs text-amber-300 font-medium">Access your assigned registry dashboard</p>
                </div>
              </div>
              <ShieldCheck className="w-6 h-6 text-amber-400 opacity-80" />
            </div>

            {!resetMode ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/80" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      placeholder="e.g. clerk@church.com"
                      className="w-full bg-slate-950/80 border border-slate-700 focus:border-amber-500 text-white placeholder-slate-500 rounded-xl pl-11 pr-4 py-3 text-sm outline-none transition-all duration-200"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => { setResetMode(true); setError(''); }}
                      className="text-xs text-amber-400 hover:text-amber-300 font-semibold transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/80" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full bg-slate-950/80 border border-slate-700 focus:border-amber-500 text-white placeholder-slate-500 rounded-xl pl-11 pr-12 py-3 text-sm outline-none transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/20 border border-red-500/40 rounded-xl p-3 text-red-300 text-xs font-semibold flex items-center gap-2 animate-shake">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 disabled:opacity-50 text-slate-950 font-black py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 text-sm uppercase tracking-wider mt-2 group"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      Sign In To Dashboard
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Password Reset Form */
              <form onSubmit={handleResetSubmit} className="space-y-4">
                <div className="text-center mb-4">
                  <KeyRound className="w-10 h-10 text-amber-400 mx-auto mb-2" />
                  <h4 className="font-bold text-white text-base">Account Password Recovery</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Enter your email. The system will route the reset request to your administrator or send a direct link.
                  </p>
                </div>

                <div>
                  <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-1.5">
                    Your Registered Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/80" />
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={e => setResetEmail(e.target.value)}
                      required
                      placeholder="name@church.com"
                      className="w-full bg-slate-950/80 border border-slate-700 focus:border-amber-500 text-white placeholder-slate-500 rounded-xl pl-11 pr-4 py-3 text-sm outline-none transition-all duration-200"
                    />
                  </div>
                </div>

                {resetMsg && (
                  <div className={`rounded-xl p-3 text-xs font-semibold ${resetMsg.startsWith('✅') ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300' : 'bg-red-500/20 border border-red-500/40 text-red-300'}`}>
                    {resetMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black py-3 rounded-xl transition-all text-sm uppercase tracking-wider"
                >
                  {isLoading ? <RefreshCw className="w-4 h-4 animate-spin mx-auto" /> : 'Send Reset Request'}
                </button>

                <button
                  type="button"
                  onClick={() => { setResetMode(false); setResetMsg(''); }}
                  className="w-full text-slate-400 hover:text-white text-xs font-semibold text-center transition-colors pt-2"
                >
                  ← Return to Login
                </button>
              </form>
            )}

            {/* Quick Demo Credentials Footer Note */}
            <div className="mt-6 pt-4 border-t border-white/10 text-center">
              <p className="text-[11px] text-slate-400">
                Default password for demo accounts: <code className="bg-slate-950 px-1.5 py-0.5 rounded text-amber-300 font-mono">password123</code>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Registration Hub Cards */}
      <footer className="relative z-10 w-full max-w-5xl mt-8 pt-6 border-t border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Card 1: Register New Local Church */}
          <div className="bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-4 backdrop-blur-md flex items-center justify-between transition-all group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-400/20 flex items-center justify-center text-amber-400">
                <ChurchIcon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Register a New Church</h4>
                <p className="text-xs text-slate-400">Submit local church &amp; clerk details for conference approval</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/register-church')}
              className="bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all flex items-center gap-1 shrink-0"
            >
              Register Church <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Card 2: Register New District Admin */}
          <div className="bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 rounded-2xl p-4 backdrop-blur-md flex items-center justify-between transition-all group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-400/20 flex items-center justify-center text-purple-300">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Register as District Admin</h4>
                <p className="text-xs text-slate-400">Join or register a district for conference verification</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/register-district')}
              className="bg-slate-800 hover:bg-purple-600 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all flex items-center gap-1 shrink-0"
            >
              Register District <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>

        <div className="text-center mt-6 text-slate-500 text-[11px]">
          &copy; {new Date().getFullYear()} Seventh-day Adventist Church • Digital Sabbath School Registry System
        </div>
      </footer>

      {/* Force Password Change Modal */}
      {showForceChangeModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-md w-full shadow-2xl text-white animate-fade-in">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-amber-500/20 border border-amber-500/40 rounded-full flex items-center justify-center mx-auto mb-3 text-amber-400">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-white">Set Your Account Password</h3>
              <p className="text-xs text-slate-400 mt-1">
                You are logging in with a temporary password. You must set a new permanent password to continue.
              </p>
            </div>

            <form onSubmit={handleForcePasswordChange} className="space-y-4">
              <div>
                <label className="block text-slate-300 text-xs font-bold mb-1">New Password</label>
                <input
                  type="password"
                  value={newPass}
                  onChange={e => setNewPass(e.target.value)}
                  placeholder="Min. 6 characters"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-bold mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmNewPass}
                  onChange={e => setConfirmNewPass(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 text-white"
                />
              </div>

              {forceChangeError && (
                <div className="bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-semibold p-3 rounded-xl">
                  {forceChangeError}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded-xl text-sm transition-all uppercase tracking-wider"
              >
                {isLoading ? 'Updating...' : 'Save Password & Access Dashboard'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
