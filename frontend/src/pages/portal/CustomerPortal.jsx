import { useState } from 'react';
import { FiSearch, FiArrowLeft, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || '/api';

export default function CustomerPortal() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!phone.trim()) return;
    setLoading(true);
    setError('');
    setSearched(true);
    try {
      const res = await axios.get(`${API}/public/customer-statement`, {
        params: { phone: phone.trim() },
      });
      if (res.data.found) {
        setData(res.data);
      } else {
        setData(null);
        setError(res.data.message || 'No customer found');
      }
    } catch {
      setError('Something went wrong. Please try again.');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center gap-3">
        <a href="/login" className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
          <FiArrowLeft size={20} />
        </a>
        <div>
          <h1 className="font-bold text-gray-900 dark:text-white">My Statement</h1>
          <p className="text-xs text-gray-500">View your transaction history</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4">
        {/* Search form */}
        <form onSubmit={handleSearch} className="card mb-4">
          <label className="input-label mb-2">Enter your phone number</label>
          <div className="flex gap-2">
            <input
              type="tel"
              className="input-field flex-1"
              placeholder="e.g. 9999999999"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <button type="submit" disabled={loading} className="btn-primary">
              <FiSearch size={18} />
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div className="card border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 mb-4">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <FiXCircle size={20} />
              <p className="font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Customer statement */}
        {data && (
          <div className="space-y-4">
            {/* Customer info */}
            <div className="card">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${
                  data.customer.runningBalance > 0
                    ? 'bg-red-50 dark:bg-red-900/30 text-red-600'
                    : 'bg-green-50 dark:bg-green-900/30 text-green-600'
                }`}>
                  {data.customer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">{data.customer.name}</h2>
                  <p className="text-sm text-gray-500">{data.customer.phone}</p>
                </div>
              </div>
              <div className={`text-2xl font-bold ${data.customer.runningBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {data.customer.runningBalance > 0
                  ? `₹${Number(data.customer.runningBalance).toLocaleString()} due`
                  : 'All settled'}
              </div>
            </div>

            {/* Transactions */}
            <div className="card p-0 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white">Transaction History</h3>
              </div>
              {data.transactions.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">No transactions found</div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {data.transactions.map((txn) => (
                    <div key={txn.id} className="px-4 py-3 flex items-center justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 ${txn.type === 'CREDIT_GIVEN' ? 'text-red-500' : 'text-green-500'}`}>
                          {txn.type === 'CREDIT_GIVEN' ? <FiXCircle size={18} /> : <FiCheckCircle size={18} />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {txn.type === 'CREDIT_GIVEN' ? 'Money Lent' : 'Payment Received'}
                          </p>
                          {txn.description && (
                            <p className="text-xs text-gray-500">{txn.description}</p>
                          )}
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(txn.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${txn.type === 'CREDIT_GIVEN' ? 'text-red-600' : 'text-green-600'}`}>
                          {txn.type === 'CREDIT_GIVEN' ? '+' : '-'}₹{Number(txn.amount).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-400">Balance: ₹{Number(txn.balanceAfter).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Powered by OweMe — Loan Tracker for Friends
        </p>
      </div>
    </div>
  );
}