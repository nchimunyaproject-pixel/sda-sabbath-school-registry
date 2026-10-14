import React, { useState } from 'react';
import { User, Role } from '../types.ts';
import SDALogo from '../components/SDALogo.tsx';
import { Eye, EyeOff, UserPlus, Mail, Lock, User as UserIcon, Church, ChevronRight } from 'lucide-react';

interface SignupPageProps {
  onSignup: (user: User) => void;
}

const SignupPage: React.FC<SignupPageProps> = ({ onSignup }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [churchName, setChurchName] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !password || !churchName.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    const newUser: User = {
      id: `clerk_${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: Role.CLERK,
      churchName: churchName.trim(),
    };

    setTimeout(() => {
      onSignup(newUser);
      setIsLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950 flex flex-col items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-indigo-700 rounded-full opacity-20 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-800 rounded-full opacity-20 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-white rounded-3xl p-4 shadow-2xl mb-4">
            <SDALogo className="w-48 h-24" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-wide">Create Clerk Account</h1>
          <p className="text-blue-300 text-sm mt-1 text-center">Register to manage your Sabbath School</p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-blue-200 text-xs font-black uppercase tracking-widest mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  placeholder="Elder John Banda"
                  className="w-full bg-blue-950/60 border border-blue-700/50 text-white placeholder-blue-500 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            {/* Church Name */}
            <div>
              <label className="block text-blue-200 text-xs font-black uppercase tracking-widest mb-1.5">
                Church Name *
              </label>
              <div className="relative">
                <Church className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                <input
                  type="text"
                  value={churchName}
                  onChange={e => setChurchName(e.target.value)}
                  required
                  placeholder="Central SDA Church"
                  className="w-full bg-blue-950/60 border border-blue-700/50 text-white placeholder-blue-500 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-blue-200 text-xs font-black uppercase tracking-widest mb-1.5">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="clerk@church.org"
                  className="w-full bg-blue-950/60 border border-blue-700/50 text-white placeholder-blue-500 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-blue-200 text-xs font-black uppercase tracking-widest mb-1.5">
                Password *
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

            {/* Confirm Password */}
            <div>
              <label className="block text-blue-200 text-xs font-black uppercase tracking-widest mb-1.5">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Re-enter password"
                  className="w-full bg-blue-950/60 border border-blue-700/50 text-white placeholder-blue-500 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/40 rounded-xl px-4 py-2.5 text-red-300 text-sm font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-blue-950 font-black py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 mt-2"
            >
              <UserPlus className="w-4 h-4" />
              {isLoading ? 'Creating Account...' : 'Create Account'}
              {!isLoading && <ChevronRight className="w-4 h-4" />}
            </button>
          </form>
        </div>

        <p className="text-center text-blue-400 text-xs mt-6">
          Already have an account?{' '}
          <a href="/#/login" className="text-amber-400 font-bold hover:text-amber-300 transition-colors">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
