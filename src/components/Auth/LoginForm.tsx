import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLibrary } from '../../context/LibraryContext';
import { Button } from '../common/Button';
import { 
  LogIn, 
  Key, 
  Mail, 
  ShieldAlert, 
  CheckCircle2, 
  Shield, 
  UserCheck,
  Info
} from 'lucide-react';
import { authApi } from '../../services';

interface LoginFormProps {
  defaultRole?: 'student' | 'admin';
}

export const LoginForm: React.FC<LoginFormProps> = ({ defaultRole = 'student' }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useLibrary();

  const initialRole = searchParams.get('role') === 'admin' ? 'admin' : defaultRole;
  const [role, setRole] = useState<'student' | 'admin'>(initialRole);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync role if query parameter changes
  useEffect(() => {
    if (searchParams.get('role') === 'admin') {
      setRole('admin');
    } else if (searchParams.get('role') === 'student') {
      setRole('student');
    }
  }, [searchParams]);

  // Reset errors when switching role
  useEffect(() => {
    setErrorMsg(null);
    setSuccessMsg(null);
  }, [role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!identifier.trim()) {
      setErrorMsg('Please enter your registered mobile number or email.');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Please enter your account password.');
      return;
    }

    setIsLoading(true);
    try {
      const data = await authApi.login({
        identifier: identifier.trim(),
        password: password.trim(),
      });

      const userRole = data.user.role || role;
      login(userRole, data.user, data.token);

      setSuccessMsg('Authentication successful! Redirecting...');

      setTimeout(() => {
        if (userRole === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }, 500);
    } catch (err: any) {
      setErrorMsg(
        err?.data?.error || 
        err?.message || 
        'Incorrect credentials. Please verify your mobile/email and password.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
      
      {/* Portal Role Selector */}
      <div className="flex items-center justify-between p-1.5 bg-slate-100 rounded-xl">
        <button
          type="button"
          onClick={() => setRole('student')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            role === 'student'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Student Member</span>
        </button>
        <button
          type="button"
          onClick={() => setRole('admin')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            role === 'admin'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Staff & Admin</span>
        </button>
      </div>

      {/* Header Info */}
      <div className="space-y-1">
        <h3 className="text-xl font-bold text-slate-900 font-display">
          {role === 'admin' ? 'Library Staff & Admin Console' : 'Student Member Portal'}
        </h3>
        <p className="text-xs text-slate-500">
          {role === 'admin'
            ? 'Sign in to access seat allocations, floor management, and the fees ledger.'
            : 'Sign in to view your assigned desk carrel, subscription status, and payment receipts.'}
        </p>
      </div>

      {/* Alerts */}
      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2 animate-in fade-in">
          <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Identifier Field */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            {role === 'admin' ? 'Staff Email or Mobile Number' : 'Registered Mobile Number or Email'} <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              required
              autoFocus
              placeholder={role === 'admin' ? 'e.g. admin@focuszonelibrary.com' : 'e.g. 7408085716 or student@gmail.com'}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600"
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Password <span className="text-rose-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => alert(`For password help or reset, please contact the library reception or administrator.`)}
              className="text-xs text-sky-700 hover:underline cursor-pointer"
            >
              Forgot Password?
            </button>
          </div>
          <div className="relative">
            <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
            className={`font-semibold h-11 text-sm ${
              role === 'admin' 
                ? 'bg-slate-900 hover:bg-slate-800' 
                : 'bg-sky-600 hover:bg-sky-700'
            }`}
          >
            <LogIn className="w-4 h-4 mr-2" />
            <span>Sign In to {role === 'admin' ? 'Admin Console' : 'Student Portal'}</span>
          </Button>
        </div>
      </form>

      {/* Account Policy Information */}
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            {role === 'student' ? (
              <>
                <strong>New Student Enrollment:</strong> Student accounts are created and configured by library administration during seat allocation and fee confirmation. There is no open public signup.
              </>
            ) : (
              <>
                <strong>Staff Access:</strong> Staff & admin accounts are provisioned exclusively through the backend master administrator and the internal admin panel.
              </>
            )}
          </p>
        </div>
      </div>

      {/* Quick Credentials hint */}
      <div className="pt-2 border-t border-slate-100 text-center text-[11px] text-slate-400">
        <span>Default access: Admin (<code>admin@focuszonelibrary.com</code> / <code>admin123</code>) · Student (<code>7408085716</code> / <code>student123</code>)</span>
      </div>
    </div>
  );
};
