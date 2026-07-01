import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Church, MapPin, Mail, Phone, User, Users, ChevronRight, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react';
import SDALogo from '../components/SDALogo.tsx';

interface RegisterChurchPageProps {
  isBackendConnected: boolean;
  districts: { id: string; name: string }[];
  onSubmitRegistration: (churchData: any) => Promise<boolean>;
}

const RegisterChurchPage: React.FC<RegisterChurchPageProps> = ({
  isBackendConnected,
  districts,
  onSubmitRegistration
}) => {
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [churchName, setChurchName] = useState('');
  const [districtId, setDistrictId] = useState(districts[0]?.id || 'dist_001');
  const [province, setProvince] = useState('');
  const [location, setLocation] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [clerkName, setClerkName] = useState('');
  const [clerkEmail, setClerkEmail] = useState('');
  const [pastorName, setPastorName] = useState('');
  const [membership, setMembership] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!churchName.trim() || !province.trim() || !location.trim() || !email.trim() || !phoneNumber.trim() || !clerkName.trim() || !clerkEmail.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);

    const registrationData = {
      id: `church_${Date.now()}`,
      church_name: churchName.trim(),
      districtId,
      province: province.trim(),
      location: location.trim(),
      email: email.trim().toLowerCase(),
      phone_number: phoneNumber.trim(),
      clerkName: clerkName.trim(),
      clerkEmail: clerkEmail.trim().toLowerCase(),
      pastor_name: pastorName.trim() || null,
      membership: Number(membership) || 0,
      status: 'pending',
      is_active: true
    };

    try {
      const ok = await onSubmitRegistration(registrationData);
      if (ok) {
        setSuccess(true);
      } else {
        setError('Failed to submit registration. Church Name or Clerk Email may already exist.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950 flex flex-col items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl text-center max-w-md w-full animate-fade-in">
          <div className="w-20 h-20 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Registration Submitted!</h2>
          <p className="text-blue-200 text-sm mb-6">
            Thank you for registering <strong>{churchName}</strong>. Your registration is now <strong>Pending Approval</strong> by the District or Conference Administrator.
          </p>
          <div className="bg-blue-950/40 border border-blue-800/40 rounded-2xl p-4 text-left text-xs text-blue-300 mb-6">
            <p className="font-bold mb-1 text-white">What happens next?</p>
            <ol className="list-decimal pl-4 space-y-1">
              <li>An administrator will review your application.</li>
              <li>Once approved, a clerk account will be created automatically.</li>
              <li>A temporary password will be sent to the clerk email: <strong>{clerkEmail}</strong>.</li>
            </ol>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-amber-500 hover:bg-amber-400 text-blue-950 font-black py-3 rounded-xl transition-all"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950 py-12 px-4 flex flex-col justify-center items-center">
      <div className="w-full max-w-2xl">
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 text-blue-300 hover:text-white transition-colors mb-6 text-sm font-bold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </button>

        {/* Logo Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-white rounded-3xl p-4 shadow-2xl mb-4">
            <SDALogo className="w-48 h-24" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-wide">Register Sabbath School Registry</h1>
          <p className="text-blue-300 text-sm mt-1">Submit your church for administrative approval</p>
        </div>

        {/* Form Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Section 1: Church details */}
            <div>
              <h3 className="text-amber-400 font-black text-sm uppercase tracking-wider mb-4 border-b border-white/10 pb-2">Church Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-blue-200 text-xs font-black uppercase tracking-widest mb-1.5">Church Name *</label>
                  <div className="relative">
                    <Church className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                    <input
                      type="text"
                      value={churchName}
                      onChange={e => setChurchName(e.target.value)}
                      placeholder="e.g. Lusaka Central Church"
                      required
                      className="w-full bg-blue-950/60 border border-blue-700/50 text-white placeholder-blue-500 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-blue-200 text-xs font-black uppercase tracking-widest mb-1.5">District *</label>
                  <select
                    value={districtId}
                    onChange={e => setDistrictId(e.target.value)}
                    className="w-full bg-blue-950/60 border border-blue-700/50 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                  >
                    {districts.map(d => (
                      <option key={d.id} value={d.id} className="bg-blue-950 text-white">{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-blue-200 text-xs font-black uppercase tracking-widest mb-1.5">Province *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                    <input
                      type="text"
                      value={province}
                      onChange={e => setProvince(e.target.value)}
                      placeholder="e.g. Lusaka Province"
                      required
                      className="w-full bg-blue-950/60 border border-blue-700/50 text-white placeholder-blue-500 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-blue-200 text-xs font-black uppercase tracking-widest mb-1.5">Physical Address / Location *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                    <input
                      type="text"
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      placeholder="e.g. Independence Ave, Plot 12"
                      required
                      className="w-full bg-blue-950/60 border border-blue-700/50 text-white placeholder-blue-500 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-blue-200 text-xs font-black uppercase tracking-widest mb-1.5">Church Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="e.g. central@church.org"
                      required
                      className="w-full bg-blue-950/60 border border-blue-700/50 text-white placeholder-blue-500 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-blue-200 text-xs font-black uppercase tracking-widest mb-1.5">Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={e => setPhoneNumber(e.target.value)}
                      placeholder="e.g. +260 97 1234567"
                      required
                      className="w-full bg-blue-950/60 border border-blue-700/50 text-white placeholder-blue-500 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Leadership */}
            <div>
              <h3 className="text-amber-400 font-black text-sm uppercase tracking-wider mb-4 border-b border-white/10 pb-2">Clerk &amp; Pastor Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-blue-200 text-xs font-black uppercase tracking-widest mb-1.5">Church Clerk Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                    <input
                      type="text"
                      value={clerkName}
                      onChange={e => setClerkName(e.target.value)}
                      placeholder="e.g. Sarah Miller"
                      required
                      className="w-full bg-blue-950/60 border border-blue-700/50 text-white placeholder-blue-500 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-blue-200 text-xs font-black uppercase tracking-widest mb-1.5">Clerk Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                    <input
                      type="email"
                      value={clerkEmail}
                      onChange={e => setClerkEmail(e.target.value)}
                      placeholder="e.g. clerk@church.com"
                      required
                      className="w-full bg-blue-950/60 border border-blue-700/50 text-white placeholder-blue-500 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-blue-200 text-xs font-black uppercase tracking-widest mb-1.5">Pastor Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                    <input
                      type="text"
                      value={pastorName}
                      onChange={e => setPastorName(e.target.value)}
                      placeholder="e.g. Pastor John Phiri"
                      className="w-full bg-blue-950/60 border border-blue-700/50 text-white placeholder-blue-500 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-blue-200 text-xs font-black uppercase tracking-widest mb-1.5">Total Membership Estimate</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                    <input
                      type="number"
                      value={membership}
                      onChange={e => setMembership(Number(e.target.value))}
                      placeholder="e.g. 250"
                      className="w-full bg-blue-950/60 border border-blue-700/50 text-white placeholder-blue-500 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/40 rounded-xl px-4 py-2.5 text-red-300 text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-blue-950 font-black py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
            >
              {loading ? 'Submitting Registration...' : 'Submit Church Registration'}
              {!loading && <ChevronRight className="w-5 h-5" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterChurchPage;
