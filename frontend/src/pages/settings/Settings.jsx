import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { FiUser, FiMail, FiPhone, FiShield, FiSun, FiMoon, FiMonitor, FiX, FiArrowLeft, FiLock, FiLink } from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL || '/api';

function ChangePasswordModal({ onClose }) {
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const sendCode = async () => {
    if (!email.trim()) { toast.error('Enter your email'); return; }
    setLoading(true);
    try {
      await axios.post(`${API}/auth/forgot-password`, { email });
      toast.success('Code sent!');
      setStep('code');
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setLoading(false); }
  };

  const resetPw = async () => {
    if (!code.trim() || !newPassword.trim()) { toast.error('Fill all fields'); return; }
    if (newPassword.length < 6) { toast.error('Minimum 6 characters'); return; }
    setLoading(true);
    try {
      await axios.post(`${API}/auth/reset-password`, { email, code, newPassword });
      toast.success('Password changed!');
      onClose();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Change Password</h3>
        <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"><FiX size={18} /></button>
      </div>
      {step === 'email' && (
        <div className="space-y-3">
          <p className="text-sm text-gray-500 dark:text-gray-400">Enter your email to receive a verification code.</p>
          <input type="email" className="input-field" placeholder="Your email" value={email} onChange={e => setEmail(e.target.value)} />
          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button onClick={sendCode} disabled={loading} className="btn-primary flex-1">{loading ? 'Sending...' : 'Send Code'}</button>
          </div>
        </div>
      )}
      {step === 'code' && (
        <div className="space-y-3">
          <p className="text-sm text-gray-500 dark:text-gray-400">Code sent to <strong>{email}</strong>. Enter it below with your new password.</p>
          <input type="text" className="input-field" placeholder="6-digit code" value={code} onChange={e => setCode(e.target.value)} maxLength={6} />
          <input type="password" className="input-field" placeholder="New password (min 6 chars)" value={newPassword} onChange={e => setNewPassword(e.target.value)} minLength={6} />
          <div className="flex gap-3 pt-1">
            <button onClick={() => setStep('email')} className="btn-secondary flex-1"><FiArrowLeft size={14} className="inline mr-1" /> Back</button>
            <button onClick={resetPw} disabled={loading} className="btn-primary flex-1">{loading ? 'Resetting...' : 'Change Password'}</button>
          </div>
        </div>
      )}
    </>
  );
}

export default function Settings() {
  const { user } = useAuth();
  const { dark, toggleDark } = useTheme();
  const [showPwModal, setShowPwModal] = useState(false);

  const handleLinkAccount = async () => {
    const API = import.meta.env.VITE_API_URL || '/api';
    try {
      const res = await axios.post(`${API}/account/link`, {}, { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } });
      toast.success(res.data.message);
    } catch (err) { toast.error(err?.response?.data?.error || 'Failed to link'); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Profile</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-primary-100 dark:bg-primary-800 rounded-full flex items-center justify-center">
                <span className="text-primary-700 dark:text-primary-300 font-bold text-xl">{user?.name?.charAt(0)?.toUpperCase()}</span>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{user?.name}</p>
                <p className="text-sm text-gray-500">{user?.role?.replace('_', ' ')}</p>
              </div>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
              <div className="flex items-center gap-3 text-sm"><FiMail className="text-gray-400" size={16} /><span className="text-gray-600 dark:text-gray-400">{user?.email}</span></div>
              <div className="flex items-center gap-3 text-sm"><FiPhone className="text-gray-400" size={16} /><span className="text-gray-600 dark:text-gray-400">{user?.phone}</span></div>
              <div className="flex items-center gap-3 text-sm"><FiShield className="text-gray-400" size={16} /><span className="text-gray-600 dark:text-gray-400">Role: {user?.role}</span></div>
              <div className="flex items-center gap-3 text-sm"><FiMonitor className="text-gray-400" size={16} /><span className="text-gray-600 dark:text-gray-400">Account: {user?.shopName}</span></div>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {dark ? <FiMoon className="text-gray-400" size={20} /> : <FiSun className="text-gray-400" size={20} />}
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Dark Mode</p>
                  <p className="text-sm text-gray-500">Toggle dark mode theme</p>
                </div>
              </div>
              <button onClick={toggleDark} className={`relative w-12 h-6 rounded-full transition-colors ${dark ? 'bg-primary-600' : 'bg-gray-300'}`}>
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${dark ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Info</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700"><span className="text-gray-500">Account Type</span><span className="font-medium text-gray-900 dark:text-white">{user?.role?.replace('_', ' ')}</span></div>
            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700"><span className="text-gray-500">Account ID</span><span className="font-medium text-gray-900 dark:text-white">#{user?.shopId}</span></div>
            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700"><span className="text-gray-500">Member Since</span><span className="font-medium text-gray-900 dark:text-white">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</span></div>
          </div>
        </div>

        {/* Change Password */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 rounded-xl"><FiLock className="w-5 h-5 text-blue-500" /></div>
            <div><h3 className="text-lg font-semibold text-gray-900 dark:text-white">Password & Security</h3><p className="text-sm text-gray-500">Change your account password</p></div>
          </div>
          <button onClick={() => setShowPwModal(true)} className="btn-primary text-sm">Change Password</button>
        </div>

        {/* Link Account */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-purple-50 dark:bg-purple-500/10 rounded-xl"><FiLink className="w-5 h-5 text-purple-500" /></div>
            <div><h3 className="text-lg font-semibold text-gray-900 dark:text-white">Link Account</h3><p className="text-sm text-gray-500">Link this login to existing friend records</p></div>
          </div>
          <button onClick={handleLinkAccount} className="btn-secondary text-sm">Sync My Account</button>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPwModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setShowPwModal(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm p-6">
            <ChangePasswordModal onClose={() => setShowPwModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
}