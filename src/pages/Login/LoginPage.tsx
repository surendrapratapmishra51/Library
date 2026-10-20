import React from 'react';
import { LoginForm } from '../../components/Auth/LoginForm';

export const LoginPage: React.FC = () => {
  return (
    <div className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xl mx-auto shadow-sm">
            F
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">
            Member & Staff Sign In
          </h1>
          <p className="text-xs text-slate-500">
            Sign in with the mobile or email credentials provided during your enrollment
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
};
