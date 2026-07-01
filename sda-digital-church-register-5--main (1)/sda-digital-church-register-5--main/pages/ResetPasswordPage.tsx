import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import SDALogo from '../components/SDALogo.tsx';

const BACKEND_URL = 'http://localhost:3001/api';

const ResetPasswordPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid or missing reset token.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (password.length < 6) {
      setMessage('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }

    setStatus('loading');

    try {
      const res = await fetch(`${BACKEND_URL}/auth/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      if (res.ok) {
        setStatus('success');
        setMessage('Password reset successfully! Redirecting to login...');
        setTimeout(() => navigate('/login'), 3000);
      } else {
        const body = await res.json().catch(() => ({}));
        setStatus('error');
        setMessage(body.error || 'Reset failed. The link may have expired.');
      }
    } catch {
      setStatus('error');
      setMessage('Could not connect to server. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950 flex flex-col items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-800 rounded-full opacity-20 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-700 rounded-full opacity-20 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-white rounded-3xl p-4 shadow-2xl mb-4">
            <SDALogo className="w-48 h-24" />
          </div>
          <h1 className="text-2xl font-black text-white">Reset Password</h1>
          <p className="text-blue-300 text-sm mt-1">Enter your new password below</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          {status === 'success' ? (
            <div className="text-center py-4">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <p className="text-white font-bold text-lg">Password Updated!</p>
              <p className="text-green-300 text-sm mt-2">{message}</p>
            </div>
          ) : status === 'error' && !password ? (
            <div className="text-center py-4">
              <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <p className="text-white font-bold text-lg">Invalid Link</p>
              <p className="text-red-300 text-sm mt-2">{message}</p>
              <button
                onClick={() => navigate('/login')}
                className="mt-6 text-amber-400 hover:text-amber-300 text-sm font-bold"
              >
                ← Back to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-blue-200 text-xs font-black uppercase tracking-widest mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Min. 6 characters"
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

              <div>
                <label className="block text-blue-200 text-xs font-black uppercase tracking-widest mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Repeat new password"
                    className="w-full bg-blue-950/60 border border-blue-700/50 text-white placeholder-blue-500 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              {message && (
                <div className={`rounded-xl px-4 py-2.5 text-sm font-medium ${
                  status === 'error'
                    ? 'bg-red-500/20 border border-red-500/40 text-red-300'
                    : 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                }`}>
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-blue-950 font-black py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                {status === 'loading' ? 'Resetting...' : 'Reset Password'}
              </button>

              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full text-blue-400 hover:text-blue-200 text-xs font-semibold transition-colors text-center"
              >
                ← Back to Login
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
