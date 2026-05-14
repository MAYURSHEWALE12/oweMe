import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { LogoIcon } from '../../components/Logo';
import { FiX, FiArrowLeft } from 'react-icons/fi';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || '/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetStep, setResetStep] = useState('email');
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetting, setResetting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/reports');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const sendResetCode = async () => {
    if (!resetEmail.trim()) { toast.error('Enter your email'); return; }
    setResetting(true);
    try {
      await axios.post(`${API}/auth/forgot-password`, { email: resetEmail });
      toast.success('Reset code sent!');
      setResetStep('code');
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to send code'); }
    finally { setResetting(false); }
  };

  const doResetPassword = async () => {
    if (!resetCode.trim() || !newPassword.trim()) { toast.error('Fill all fields'); return; }
    if (newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setResetting(true);
    try {
      await axios.post(`${API}/auth/reset-password`, { email: resetEmail, code: resetCode, newPassword });
      toast.success('Password reset! You can now login.');
      setShowReset(false); setResetStep('email'); setResetEmail(''); setResetCode(''); setNewPassword('');
    } catch (err) { toast.error(err.response?.data?.error || 'Reset failed'); }
    finally { setResetting(false); }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <LogoIcon size={64} className="mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Sign in to your OweMe account</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="input-label">Email</label>
              <input type="email" className="input-field" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="input-label">Password</label>
              <input type="password" className="input-field" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className="flex justify-end -mt-2">
              <button type="button" onClick={() => { setShowReset(true); setResetEmail(email); }} className="text-xs text-primary-500 hover:text-primary-600 font-medium">Forgot password?</button>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Signing in...' : 'Sign in'}</button>
          </form>

          <p className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">Create one</Link>
          </p>

          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 text-center">
            <Link to="/my-statement" className="text-sm text-gray-400 hover:text-primary-600 transition-colors">Looking for your loan statement? Check here →</Link>
          </div>
        </div>
      </div>

      {/* Reset Password Modal */}
      {showReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setShowReset(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Reset Password</h2>
              <button onClick={() => setShowReset(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"><FiX size={18} /></button>
            </div>

            {resetStep === 'email' && (
              <div className="space-y-3">
                <p className="text-sm text-gray-500 dark:text-gray-400">Enter your email and we'll send a verification code.</p>
                <input type="email" className="input-field" placeholder="Your email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} />
                <div className="flex gap-3 pt-1">
                  <button onClick={() => setShowReset(false)} className="btn-secondary flex-1">Cancel</button>
                  <button onClick={sendResetCode} disabled={resetting} className="btn-primary flex-1">{resetting ? 'Sending...' : 'Send Code'}</button>
                </div>
              </div>
            )}

            {resetStep === 'code' && (
              <div className="space-y-3">
                <p className="text-sm text-gray-500 dark:text-gray-400">Enter the 6-digit code sent to <strong>{resetEmail}</strong> and your new password.</p>
                <input type="text" className="input-field" placeholder="6-digit code" value={resetCode} onChange={(e) => setResetCode(e.target.value)} maxLength={6} />
                <input type="password" className="input-field" placeholder="New password (min 6 chars)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={6} />
                <div className="flex gap-3 pt-1">
                  <button onClick={() => setResetStep('email')} className="btn-secondary flex-1"><FiArrowLeft size={14} className="inline mr-1" /> Back</button>
                  <button onClick={doResetPassword} disabled={resetting} className="btn-primary flex-1">{resetting ? 'Resetting...' : 'Reset Password'}</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}