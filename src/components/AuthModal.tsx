import React, { useState, useEffect } from 'react';
import type { UserProfile, UserRole } from '../types';
import { apiService } from '../services/apiService';
import { Shield, Lock, Mail, User, Eye, EyeOff, CheckCircle2, AlertCircle, Sparkles, KeyRound, ArrowLeft } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onLoginSuccess: (user: UserProfile, token: string) => void;
  isMandatory?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess, isMandatory }) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD'>('LOGIN');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('EMPLOYEE');

  // Password Visibility Toggle State
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & Error States
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Reset form fields to empty whenever the modal opens
  useEffect(() => {
    if (isOpen) {
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      setShowConfirmPassword(false);
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isOpen]);

  const handleSwitchMode = (newMode: 'LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD') => {
    setMode(newMode);
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  if (!isOpen) return null;

  // Password Validation Rules
  const isMinLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isPasswordValid = isMinLength && hasLetter && hasNumber;
  const doPasswordsMatch = password.length > 0 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (mode === 'FORGOT_PASSWORD') {
      if (!isPasswordValid) {
        setErrorMsg('New password must be at least 8 characters long and contain both letters and numbers.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match. Please ensure both fields are identical.');
        return;
      }

      setIsLoading(true);
      try {
        const res = await apiService.resetPassword(email, password);
        setSuccessMsg(res.message || 'Password updated successfully! You can now log in with your new password.');
        setPassword('');
        setConfirmPassword('');
        setMode('LOGIN');
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to reset password. Please check the email address.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (mode === 'REGISTER' && !isPasswordValid) {
      setErrorMsg('Password must be at least 8 characters long and contain both letters and numbers.');
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'LOGIN') {
        const res = await apiService.login(email, password);
        onLoginSuccess(res.user, res.accessToken);
        if (onClose) onClose();
      } else {
        const res = await apiService.register(name, email, password, role);
        onLoginSuccess(res.user, res.accessToken);
        if (onClose) onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication request failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0b0f17] border border-cyan-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 relative overflow-hidden font-sans">
        
        {/* Glow Background Accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="text-center space-y-2 relative">
          <div className="inline-flex p-3 rounded-2xl bg-cyan-950/60 border border-cyan-800/80 text-cyan-400 mb-1">
            {mode === 'FORGOT_PASSWORD' ? <KeyRound className="w-6 h-6" /> : <Shield className="w-6 h-6" />}
          </div>
          <h2 className="text-xl font-extrabold text-slate-100 tracking-tight">
            {mode === 'FORGOT_PASSWORD' ? 'Reset Account Password' : 'IT Incident Copilot Authentication'}
          </h2>
          <p className="text-xs text-slate-400">
            {mode === 'LOGIN' ? 'Sign in to access your enterprise dashboard' :
             mode === 'REGISTER' ? 'Create a new account with BCrypt database security' :
             'Enter your registered email and your new password'}
          </p>
        </div>

        {/* Mode Selector Tabs (Hidden in FORGOT_PASSWORD mode) */}
        {mode !== 'FORGOT_PASSWORD' && (
          <div className="flex p-1 bg-slate-900/80 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => handleSwitchMode('LOGIN')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'LOGIN' ? 'bg-cyan-500 text-slate-950 shadow-glow-cyan' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => handleSwitchMode('REGISTER')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'REGISTER' ? 'bg-cyan-500 text-slate-950 shadow-glow-cyan' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Success Feedback Banner */}
        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error Feedback Banner */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {mode === 'REGISTER' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Thorne"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl glass-input border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-500 transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Corporate Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@corp.internal"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl glass-input border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-500 transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-300">
                {mode === 'FORGOT_PASSWORD' ? 'New Password' : 'Password'}
              </label>
              {mode === 'LOGIN' && (
                <button
                  type="button"
                  onClick={() => handleSwitchMode('FORGOT_PASSWORD')}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors font-semibold"
                >
                  Forgot password?
                </button>
              )}
            </div>

            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-10 py-2.5 rounded-xl glass-input border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-500 transition-all"
              />

              {/* Eye / EyeOff Show-Hide Password Toggle Icon */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-cyan-400 transition-colors p-0.5"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Real-time Password Validation Indicator Bar (Register & Forgot Password Modes) */}
            {(mode === 'REGISTER' || mode === 'FORGOT_PASSWORD') && password.length > 0 && (
              <div className="mt-2 space-y-1.5 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] font-mono">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Password Validation:</span>
                  <span className={isPasswordValid ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                    {isPasswordValid ? 'Strong Password' : 'Incomplete'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 text-[10px]">
                  <div className={`flex items-center gap-1 ${isMinLength ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <CheckCircle2 className="w-3 h-3" /> ≥ 8 Chars
                  </div>
                  <div className={`flex items-center gap-1 ${hasLetter ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <CheckCircle2 className="w-3 h-3" /> Contains Letter
                  </div>
                  <div className={`flex items-center gap-1 ${hasNumber ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <CheckCircle2 className="w-3 h-3" /> Contains Number
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Confirm New Password Field (Forgot Password Mode) */}
          {mode === 'FORGOT_PASSWORD' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl glass-input border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-500 transition-all"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-cyan-400 transition-colors p-0.5"
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {confirmPassword.length > 0 && (
                <div className={`mt-1 text-[11px] font-mono flex items-center gap-1 ${doPasswordsMatch ? 'text-emerald-400' : 'text-rose-400'}`}>
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{doPasswordsMatch ? 'Passwords match' : 'Passwords do not match'}</span>
                </div>
              )}
            </div>
          )}

          {mode === 'REGISTER' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Account Role Designation</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-3 py-2.5 rounded-xl glass-input border-slate-800 text-xs text-slate-200 bg-slate-900 focus:border-cyan-500 transition-all font-mono"
              >
                <option value="EMPLOYEE">Standard User / Employee (Ticket Submissions Only)</option>
                <option value="TECHNICIAN">Developer / IT Engineer (Full Control Access)</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs shadow-glow-cyan transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>
              {isLoading ? 'Processing...' :
               mode === 'LOGIN' ? 'Sign In' :
               mode === 'REGISTER' ? 'Create & Register Account' :
               'Reset & Save New Password'}
            </span>
          </button>

        </form>

        {/* Back to Sign In Link for Forgot Password */}
        {mode === 'FORGOT_PASSWORD' && (
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => handleSwitchMode('LOGIN')}
              className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors inline-flex items-center gap-1 font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </button>
          </div>
        )}

        {!isMandatory && onClose && mode !== 'FORGOT_PASSWORD' && (
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              Continue as Guest / Switch Persona
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
