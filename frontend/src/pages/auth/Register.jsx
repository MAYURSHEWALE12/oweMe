import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { LogoIcon } from '../../components/Logo';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const update = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created successfully!');
      navigate('/reports');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <LogoIcon size={64} className="mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create your account</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Track loans & expenses with friends</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="input-label">Your Name</label>
              <input type="text" className="input-field" placeholder="John Doe" value={form.name} onChange={update('name')} required />
            </div>
            <div>
              <label className="input-label">Email</label>
              <input type="email" className="input-field" placeholder="you@example.com" value={form.email} onChange={update('email')} required />
            </div>
            <div>
              <label className="input-label">Phone</label>
              <input type="tel" className="input-field" placeholder="9876543210" value={form.phone} onChange={update('phone')} required />
            </div>
            <div>
              <label className="input-label">Password</label>
              <input type="password" className="input-field" placeholder="At least 6 characters" value={form.password} onChange={update('password')} required minLength={6} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}