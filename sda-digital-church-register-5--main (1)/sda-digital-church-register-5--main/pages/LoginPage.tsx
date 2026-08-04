import React, { useState } from 'react';
import { useNavigate as useNav } from 'react-router-dom';
import { User, Role } from '../types.ts';
import SDALogo from '../components/SDALogo.tsx';
import { Eye, EyeOff, LogIn, Mail, Lock, ChevronRight, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';
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
          setError(errData.error || 'Invalid credentials or registration is pending.');
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
      }, 600);
    }
  };

  const fallbackLocalLogin = (emailClean: string) => {
    // Check in local admin lists (which include admins/clerks) and teachers
    const allLocalUsers = [...admins, ...teachers, 
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
      setError('Invalid credentials. Check your email or password.');
    }
  };

  const handleForcePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setForceChangeError('');

    if (newPass.length < 6) {
      setForceChangeError('New password must be at least 6 characters.');
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
        setForceChangeError('Failed to change password. Try again.');
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

    // Check if teacher reset
    const isTeacher = teachers.some(t => t.email?.toLowerCase() === emailClean.toLowerCase());
    if (isTeacher) {
      const ok = onTeacherResetRequest(emailClean);
      setResetMsg(
        ok
          ? '✅ Reset request submitted. Your Clerk will reset your password shortly.'
          : '❌ Teacher email not found.'
      );
    } else {
      const ok = await onClerkResetEmail(emailClean);
      setResetMsg(
        ok
          ? '✅ Password reset email link sent successfully.'
          : '❌ Account not found or email delivery offline.'
      );
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950 flex flex-col items-center justify-center p-4">
      {/* Background circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-800 rounded-full opacity-20 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-700 rounded-full opacity-20 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6 animate-fade-in">
          <div className="bg-white rounded-3xl p-3 shadow-2xl mb-4">
            <img src={sdaLogoImg} alt="SDA Logo" className="w-24 h-24 object-contain" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-wide text-center">
            Sabbath School Registry
          </h1>
          <p className="text-blue-300 text-sm mt-1 text-center font-medium">
            Seventh-day Adventist Registry Portal
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          {!resetMode ? (
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div>
                <label className="block text-blue-200 text-xs font-black uppercase tracking-widest mb-1.5 font-sans">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="name@church.com"
                    className="w-full bg-blue-950/60 border border-blue-700/50 text-white placeholder-blue-500 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-blue-200 text-xs font-black uppercase tracking-widest mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-blue-950/60 border border-blue-700/50 text-white placeholder-blue-500 rounded-xl pl-10 pr-12 py-3 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 hover:text-white transition-colors"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/40 rounded-xl px-4 py-2.5 text-red-300 text-sm font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-blue-950 font-black py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 mt-2 text-sm uppercase tracking-wider"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Access Dashboard
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => { setResetMode(true); setError(''); }}
                className="w-full text-blue-400 hover:text-blue-200 text-xs font-bold transition-colors text-center mt-2"
              >
                Forgot Password?
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div className="text-center mb-2">
                <p className="text-white font-bold text-sm">SDA Accounts Password Reset</p>
                <p className="text-blue-300 text-xs mt-1">
                  Enter your email. System will route request.
                </p>
              </div>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                <input
                  type="email"
                  value={resetEmail}
                  onChange={e => setResetEmail(e.target.value)}
                  required
                  placeholder="Your email address"
                  className="w-full bg-blue-950/60 border border-blue-700/50 text-white placeholder-blue-500 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              {resetMsg && (
                <div className={`rounded-xl px-4 py-2.5 text-xs font-semibold ${resetMsg.startsWith('✅') ? 'bg-green-500/20 border border-green-500/40 text-green-300' : 'bg-red-500/20 border border-red-500/40 text-red-300'}`}>
                  {resetMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-blue-950 font-black py-3 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Send Request'}
              </button>
              <button
                type="button"
                onClick={() => { setResetMode(false); setResetMsg(''); }}
                className="w-full text-blue-400 hover:text-blue-200 text-xs font-bold text-center"
              >
                ← Back to Login
              </button>
            </form>
          )}
        </div>

        {/* Links to Registration */}
        <div className="text-center mt-6 space-y-2">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-xs text-blue-300">
            <p>
              Register a Church?{' '}
              <button
                onClick={() => navigate('/register-church')}
                className="text-amber-400 font-black hover:text-amber-300 transition-colors bg-transparent border-0 p-0 cursor-pointer underline underline-offset-2"
              >
                Register Church
              </button>
            </p>
            <span className="hidden sm:inline text-blue-600">•</span>
            <p>
              District Admin?{' '}
              <button
                onClick={() => navigate('/register-district')}
                className="text-amber-400 font-black hover:text-amber-300 transition-colors bg-transparent border-0 p-0 cursor-pointer underline underline-offset-2"
              >
                Register District
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Force Password Change Modal */}
      {showForceChangeModal && (
        <div className="fixed inset-0 bg-blue-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-slate-800 animate-fade-in border border-slate-100">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Lock className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-black text-slate-900">Change Password Required</h3>
              <p className="text-xs text-slate-500 mt-1">
                You are logging in with a temporary password. You must set a new secure password to proceed.
              </p>
            </div>

            <form onSubmit={handleForcePasswordChange} className="space-y-4">
              <div>
                <label className="block text-slate-600 text-xs font-bold mb-1">New Password</label>
                <input
                  type="password"
                  value={newPass}
                  onChange={e => setNewPass(e.target.value)}
                  placeholder="Min. 6 characters"
                  required
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 text-xs font-bold mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmNewPass}
                  onChange={e => setConfirmNewPass(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              {forceChangeError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold p-3 rounded-xl">
                  {forceChangeError}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-950 hover:bg-blue-900 text-white font-bold py-3 rounded-xl text-sm transition-all"
              >
                {isLoading ? 'Updating...' : 'Update Password &amp; Login'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
