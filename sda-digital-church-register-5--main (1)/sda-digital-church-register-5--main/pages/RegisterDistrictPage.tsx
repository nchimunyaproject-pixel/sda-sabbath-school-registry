import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Mail, Lock, Phone, User, ArrowLeft, CheckCircle, Clock, ChevronDown } from 'lucide-react';
import SDALogo from '../components/SDALogo.tsx';

interface RegisterDistrictPageProps {
  isBackendConnected: boolean;
  backendUrl: string;
}

const RegisterDistrictPage: React.FC<RegisterDistrictPageProps> = ({ isBackendConnected, backendUrl }) => {
  const navigate = useNavigate();

  const [conferences, setConferences] = useState<{ id: string; name: string }[]>([]);
  const [districts, setDistricts] = useState<{ id: string; name: string; conferenceId: string }[]>([]);

  const [step, setStep] = useState<'form' | 'success'>('form');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Form fields
  const [selectedConference, setSelectedConference] = useState('');
  const [districtMode, setDistrictMode] = useState<'existing' | 'new'>('existing');
  const [selectedDistrictId, setSelectedDistrictId] = useState('');
  const [newDistrictName, setNewDistrictName] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    // Load available conferences and districts from backend
    const load = async () => {
      try {
        const confRes = await fetch(`${backendUrl}/public/conferences`);
        if (confRes.ok) {
          const data = await confRes.json();
          setConferences(data);
          if (data.length > 0) setSelectedConference(data[0].id);
        }
        const distRes = await fetch(`${backendUrl}/public/districts`);
        if (distRes.ok) {
          const data = await distRes.json();
          setDistricts(data);
        }
      } catch (e) {
        // Fallback if public endpoints not yet available
        setConferences([{ id: 'conf_001', name: 'Southern Africa Indian Ocean Division' }]);
        setSelectedConference('conf_001');
      }
    };
    load();
  }, [backendUrl]);

  const filteredDistricts = districts.filter(d => d.conferenceId === selectedConference);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (adminPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (adminPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    const districtName = districtMode === 'existing'
      ? districts.find(d => d.id === selectedDistrictId)?.name || ''
      : newDistrictName.trim();

    if (!districtName) {
      setError('Please select or enter a district name.');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        districtName,
        districtId: districtMode === 'existing' ? selectedDistrictId : null,
        conferenceId: selectedConference,
        adminName: adminName.trim(),
        adminEmail: adminEmail.trim().toLowerCase(),
        phone_number: adminPhone.trim(),
        password: adminPassword
      };

      if (isBackendConnected) {
        const res = await fetch(`${backendUrl}/district-registrations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Registration failed');
        }
      }

      setStep('success');
    } catch (err: any) {
      setError(err.message || 'Failed to submit registration. Please try again.');
    }
    setIsLoading(false);
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-950 via-slate-900 to-blue-950 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-10 max-w-md w-full shadow-2xl text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-3">Registration Submitted!</h2>
          <p className="text-slate-500 text-sm mb-4">
            Your District Admin registration is pending approval from the Conference Administrator.
            You will be able to log in once your account is approved.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 text-left">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span className="text-amber-800 font-bold text-sm">What happens next?</span>
            </div>
            <ul className="text-xs text-amber-700 space-y-1 list-disc ml-4">
              <li>The Conference Admin will review your request</li>
              <li>You'll receive an email once approved</li>
              <li>A temporary password will be provided if needed</li>
              <li>You can then log in and manage your district</li>
            </ul>
          </div>
          <button onClick={() => navigate('/login')}
            className="w-full bg-blue-950 text-white font-bold py-3 rounded-xl hover:bg-blue-900 transition-all">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-slate-900 to-blue-950 flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <SDALogo size={64} />
          </div>
          <h1 className="text-2xl font-black text-white mb-1">District Admin Registration</h1>
          <p className="text-slate-400 text-sm">Register as a District Administrator — your account will require Conference approval before activation.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-950 to-slate-800 px-8 py-5">
            <p className="text-blue-200 text-xs font-bold uppercase tracking-widest">New District Admin Account</p>
            <h2 className="text-white font-black text-lg">Registration Form</h2>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm font-medium">
                ⚠️ {error}
              </div>
            )}

            {/* Conference Selection */}
            <div>
              <label className="block text-slate-700 text-xs font-bold mb-1.5 uppercase tracking-wider">Conference *</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select value={selectedConference} onChange={e => { setSelectedConference(e.target.value); setSelectedDistrictId(''); }}
                  className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-blue-500 appearance-none">
                  {conferences.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* District Mode Toggle */}
            <div>
              <label className="block text-slate-700 text-xs font-bold mb-2 uppercase tracking-wider">District *</label>
              <div className="flex gap-2 mb-3">
                <button type="button" onClick={() => setDistrictMode('existing')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${districtMode === 'existing' ? 'bg-blue-950 text-white border-blue-950' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                  Join Existing District
                </button>
                <button type="button" onClick={() => setDistrictMode('new')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${districtMode === 'new' ? 'bg-blue-950 text-white border-blue-950' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                  Register New District
                </button>
              </div>

              {districtMode === 'existing' ? (
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select value={selectedDistrictId} onChange={e => setSelectedDistrictId(e.target.value)} required
                    className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-blue-500 appearance-none">
                    <option value="">— Select a District —</option>
                    {filteredDistricts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    {filteredDistricts.length === 0 && <option disabled>No districts found for this conference</option>}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              ) : (
                <input type="text" value={newDistrictName} onChange={e => setNewDistrictName(e.target.value)} required
                  placeholder="Enter new district name e.g. 'Lusaka North District'"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500" />
              )}
            </div>

            <hr className="border-slate-100" />
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Your Admin Account Details</p>

            {/* Admin Name */}
            <div>
              <label className="block text-slate-700 text-xs font-bold mb-1.5 uppercase tracking-wider">Full Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" value={adminName} onChange={e => setAdminName(e.target.value)} required
                  placeholder="Your full name"
                  className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-blue-500" />
              </div>
            </div>

            {/* Admin Email */}
            <div>
              <label className="block text-slate-700 text-xs font-bold mb-1.5 uppercase tracking-wider">Email Address *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} required
                  placeholder="admin@church.org"
                  className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-blue-500" />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-slate-700 text-xs font-bold mb-1.5 uppercase tracking-wider">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="tel" value={adminPhone} onChange={e => setAdminPhone(e.target.value)}
                  placeholder="+260 97X XXX XXXX"
                  className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-blue-500" />
              </div>
            </div>

            {/* Password */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 text-xs font-bold mb-1.5 uppercase tracking-wider">Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} required
                    placeholder="Min 6 characters"
                    className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-slate-700 text-xs font-bold mb-1.5 uppercase tracking-wider">Confirm *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required
                    placeholder="Repeat password"
                    className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-blue-500" />
                </div>
              </div>
            </div>

            {/* Notice */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700">
              <strong>📋 Pending Approval Notice:</strong> After you submit, your account will be in <em>Pending</em> status. The Conference Administrator must approve your registration before you can log in. You will be notified by email.
            </div>

            <button type="submit" disabled={isLoading}
              className="w-full bg-blue-950 hover:bg-blue-900 disabled:opacity-50 text-white font-black py-3.5 rounded-xl transition-all text-sm flex items-center justify-center gap-2">
              {isLoading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</>
              ) : 'Submit Registration Request'}
            </button>

            <button type="button" onClick={() => navigate('/login')}
              className="w-full flex items-center justify-center gap-2 text-slate-500 text-sm hover:text-slate-700 transition-colors py-2">
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterDistrictPage;
