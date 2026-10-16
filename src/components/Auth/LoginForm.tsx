import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLibrary } from '../../context/LibraryContext';
import { Button } from '../common/Button';
import { LogIn, Key, Mail, ShieldAlert, Sparkles, UserCheck } from 'lucide-react';

interface LoginFormProps {
  defaultRole?: 'student' | 'admin';
}

export const LoginForm: React.FC<LoginFormProps> = ({ defaultRole = 'student' }) => {
  const navigate = useNavigate();
  const { login } = useLibrary();

  const [role, setRole] = useState<'student' | 'admin'>(defaultRole);
  const [identifier, setIdentifier] = useState(
    defaultRole === 'student' ? 'vikram.sharma@example.com' : 'admin@focuszonelibrary.com'
  );
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!identifier.trim()) {
      setErrorMsg('Please enter your mobile number or email.');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsLoading(true);
    // Simulate auth latency
    await new Promise((resolve) => setTimeout(resolve, 500));
    login(role);
    setIsLoading(false);

    if (role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  const handleQuickDemo = (selectedRole: 'student' | 'admin') => {
    setRole(selectedRole);
    if (selectedRole === 'student') {
      setIdentifier('vikram.sharma@example.com');
      setPassword('studentPass2026');
    } else {
      setIdentifier('admin@focuszonelibrary.com');
      setPassword('adminPass2026');
    }
    login(selectedRole);
    navigate(selectedRole === 'admin' ? '/admin' : '/dashboard');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-6">
      
      {/* Role Toggle Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-semibold">
        <button
          type="button"
          onClick={() => {
            setRole('student');
            setIdentifier('vikram.sharma@example.com');
          }}
          className={`flex-1 py-2 text-center rounded-md transition-colors cursor-pointer ${
            role === 'student'
              ? 'bg-white text-emerald-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Student Portal
        </button>
        <button
          type="button"
          onClick={() => {
            setRole('admin');
            setIdentifier('admin@focuszonelibrary.com');
          }}
          className={`flex-1 py-2 text-center rounded-md transition-colors cursor-pointer ${
            role === 'admin'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Staff & Admin
        </button>
      </div>

      <div>
        <h3 className="text-xl font-bold text-slate-900 font-display">
          {role === 'student' ? 'Student Member Sign In' : 'Admin & Staff Portal'}
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          {role === 'student'
            ? 'Access your desk details, live RFID attendance, and renewal status'
            : 'Access seat matrix, live student entry logs, and fee ledger'}
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Quick Demo Access Bar */}
      <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 font-medium">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
          Quick Preview Mode:
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleQuickDemo('student')}
            className="px-2.5 py-1 rounded bg-white hover:bg-emerald-100 text-emerald-800 font-semibold border border-emerald-300 text-[11px] transition-colors cursor-pointer"
          >
            Demo Student
          </button>
          <button
            type="button"
            onClick={() => handleQuickDemo('admin')}
            className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[11px] transition-colors cursor-pointer"
          >
            Demo Admin
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Registered Mobile or Email
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              required
              placeholder="e.g. 9876543210 or name@example.com"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Password
            </label>
            <button
              type="button"
              onClick={() => alert('Password reset link sent to registered mobile/email in demo mode.')}
              className="text-xs text-emerald-700 hover:underline cursor-pointer"
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
              className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
            />
          </div>
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
          >
            <LogIn className="w-4 h-4 mr-2" />
            Sign In to {role === 'student' ? 'Student Portal' : 'Admin Console'}
          </Button>
        </div>
      </form>

      {/* Footer link to Register */}
      <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-600">
        <span>Not registered with FocusZone yet? </span>
        <Link to="/join" className="text-emerald-700 font-semibold hover:underline">
          Create Account / Apply for Desk
        </Link>
      </div>
    </div>
  );
};
