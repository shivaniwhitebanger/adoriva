import React, { useState } from 'react';
import { X, Lock, Mail, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, quickSwitch } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!password || password.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }

    setLoading(true);
    setError('');

    const success = await login(email, password);
    setLoading(false);
    if (success) {
      onClose();
    } else {
      setError('Invalid credentials. You may also click the quick demo buttons below.');
    }
  };

  const handleQuickDemo = () => {
    quickSwitch('customer');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#2A2222]/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative bg-[#F5F1EE] border border-[#E3C5C7] rounded-xl max-w-md w-full shadow-2xl p-6 sm:p-8 animate-scaleIn text-left">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#9A8582] hover:text-[#483A38] rounded-full hover:bg-[#E3C5C7]/50 hover:scale-105 active:scale-95 transition-all"
        >
          <X size={18} />
        </button>

        <div className="text-center mb-6">
          <span className="text-[10px] uppercase font-semibold tracking-widest text-[#9A8582] block mb-1">
            ADORIVA MAISON
          </span>
          <h2 className="font-serif text-2xl text-[#483A38] font-normal">
            {isRegister ? 'Create Patron Account' : 'Welcome to Adoriva'}
          </h2>
          <p className="text-xs text-[#483A38]/75 mt-1 font-light">
            {isRegister
              ? 'Join our private gifting circle for curated previews & points.'
              : 'Sign in to access your order histories, wishlists & addresses.'}
          </p>
        </div>

        {/* 1-Click Patron Testing Sign-in */}
        <div className="bg-[#E3C5C7]/40 p-3 rounded-lg border border-[#E3C5C7] mb-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#483A38]">
              Testing Patron Account:
            </span>
            <button
              type="button"
              onClick={handleQuickDemo}
              className="py-1 px-3 bg-[#483A38] hover:bg-[#342726] text-xs font-medium text-[#F5F1EE] rounded transition cursor-pointer"
            >
              Demo Patron Login
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isRegister && (
            <div>
              <label className="text-[11px] font-semibold text-[#483A38] block mb-1">Full Name</label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-3 text-[#9A8582]" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Elena Rostova"
                  className="w-full bg-[#F5F1EE] border border-[#E3C5C7] pl-9 pr-3 py-2 text-xs text-[#483A38] outline-none focus:border-[#D4AF7C]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-[11px] font-semibold text-[#483A38] block mb-1">Email Address</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-3 text-[#9A8582]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-[#F5F1EE] border border-[#E3C5C7] pl-9 pr-3 py-2 text-xs text-[#483A38] outline-none focus:border-[#D4AF7C]"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#483A38] block mb-1">Password</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-3 text-[#9A8582]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#F5F1EE] border border-[#E3C5C7] pl-9 pr-3 py-2 text-xs text-[#483A38] outline-none focus:border-[#D4AF7C]"
              />
            </div>
          </div>

          {error && <p className="text-xs text-[#C49A9C] font-medium">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#483A38] hover:bg-[#342726] text-[#F5F1EE] text-xs font-semibold uppercase tracking-[0.15em] py-3 btn-luxury-shimmer active:scale-[0.98] transition-all mt-2 cursor-pointer shadow-sm hover:shadow-md disabled:opacity-50"
          >
            {loading ? 'Processing...' : isRegister ? 'REGISTER NOW' : 'SIGN IN'}
          </button>
        </form>

        <div className="text-center mt-5 pt-4 border-t border-[#E3C5C7] text-xs text-[#483A38]/75">
          {isRegister ? (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                className="text-[#483A38] font-semibold underline ml-1 cursor-pointer"
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              New to Adoriva?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(true)}
                className="text-[#483A38] font-semibold underline ml-1 cursor-pointer"
              >
                Create Account
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
