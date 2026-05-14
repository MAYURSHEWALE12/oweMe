import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiMoreVertical, FiPhone, FiDownload, FiBell, FiMessageSquare, FiPlus, FiMinus, FiChevronRight, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import { getCustomers } from '../../services/customerService';
import { getCustomerTransactions, giveCredit, receivePayment, updateTransaction, deleteTransaction } from '../../services/transactionService';
import axios from 'axios';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL || '/api';
function token() { return localStorage.getItem('accessToken'); }

const pastels = ['bg-blue-100 text-blue-600', 'bg-green-100 text-green-600', 'bg-purple-100 text-purple-600', 'bg-pink-100 text-pink-600', 'bg-yellow-100 text-yellow-600', 'bg-teal-100 text-teal-600'];

function getAvatarColor(id) { return pastels[Number(id || 0) % pastels.length]; }

function BalanceChip({ amount }) {
  return (
    <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full ${amount > 0 ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400' : 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400'}`}>
      Bal. ₹{Math.abs(Number(amount || 0)).toLocaleString()}
    </span>
  );
}

function TransactionRow({ txn, perspective, onEdit, onDelete }) {
  const isCredit = txn.type === 'CREDIT_GIVEN';
  const fromFP = perspective === 'linked' ? !isCredit : isCredit;
  const date = new Date(txn.createdAt);
  const isToday = new Date().toDateString() === date.toDateString();
  const dateStr = isToday ? 'Today' : date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  if (txn.deleted) {
    return (
      <div className="px-4 py-3 flex items-center justify-between opacity-40">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center"><FiTrash2 size={14} className="text-gray-400" /></div>
          <div><p className="text-xs text-gray-400 italic line-through">Transaction deleted</p><p className="text-[10px] text-gray-400">{dateStr}</p></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative px-4 py-3.5 bg-white dark:bg-white/[0.03] border-b border-gray-50 dark:border-white/[0.04] last:border-0 active:bg-gray-50 dark:active:bg-white/[0.06] transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-50 dark:bg-white/5">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center ${fromFP ? 'bg-red-50 dark:bg-red-500/10' : 'bg-green-50 dark:bg-green-500/10'}`}>
            {fromFP ? <FiPlus size={12} className="text-red-500" /> : <FiMinus size={12} className="text-green-500" />}
          </div>
        </div>
        <div className="flex-1 min-w-0 grid grid-cols-[1fr_auto_auto] gap-3 items-center">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{txn.description || (fromFP ? 'You Gave' : 'You Got')}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] text-gray-400 dark:text-gray-500">{dateStr}, {date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
              <BalanceChip amount={txn.balanceAfter} />
            </div>
          </div>
          <p className={`text-sm font-bold text-right ${fromFP ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
            {fromFP ? '+' : ''}₹{Number(txn.amount).toLocaleString()}
          </p>
          <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onEdit({ ...txn, editAmount: String(txn.amount), editDescription: txn.description || '', editNote: txn.note || '' })} className="p-1 text-gray-400 hover:text-blue-500 rounded"><FiEdit2 size={13} /></button>
            <button onClick={() => onDelete(txn)} className="p-1 text-gray-400 hover:text-red-500 rounded"><FiTrash2 size={13} /></button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function MobileLedger({ friend, onBack }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editTxn, setEditTxn] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const listRef = useRef(null);

  useEffect(() => {
    if (!friend) return;
    setLoading(true);
    const fetch = async () => {
      try {
        if (friend.relation === 'linked') {
          const res = await axios.get(`${API}/friend/dashboard`, { headers: { Authorization: `Bearer ${token()}` } });
          const f = res.data.friends?.find(x => x.id === friend.id);
          setTransactions(f?.transactions || []);
        } else {
          const data = await getCustomerTransactions(friend.id, { size: 100 });
          setTransactions(data.content || []);
        }
      } catch { toast.error('Failed to load'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [friend, refreshKey]);

  const handleTxn = async (type) => {
    if (!amount || parseFloat(amount) <= 0) { toast.error('Enter amount'); return; }
    setSubmitting(true);
    try {
      const payload = { customerId: friend.id, amount: parseFloat(amount), description: note, note };
      if (type === 'CREDIT_GIVEN') { await giveCredit(payload); toast.success(`₹${amount} recorded`); }
      else { await receivePayment(payload); toast.success(`₹${amount} recorded`); }
      setAmount(''); setNote('');
      setRefreshKey(k => k + 1);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const handleEdit = async () => {
    if (!editTxn) return;
    setSubmitting(true);
    try { await updateTransaction(editTxn.id, { amount: parseFloat(editTxn.editAmount), description: editTxn.editDescription, note: editTxn.editNote }); toast.success('Updated'); setEditTxn(null); setRefreshKey(k => k + 1); }
    catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (txn) => {
    if (!window.confirm('Delete this transaction?')) return;
    try { await deleteTransaction(txn.id); setRefreshKey(k => k + 1); }
    catch { toast.error('Failed'); }
  };

  const totalGiven = transactions.filter(t => t.type === 'CREDIT_GIVEN' && !t.deleted).reduce((s, t) => s + Number(t.amount), 0);
  const totalGot = transactions.filter(t => t.type === 'PAYMENT_RECEIVED' && !t.deleted).reduce((s, t) => s + Number(t.amount), 0);
  const friendBalance = friend?.relation === 'linked' ? (friend.iowe > 0 ? friend.iowe : -friend.owedToMe) : (friend?.runningBalance || 0);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-gray-950/95 backdrop-blur-xl border-b border-gray-100 dark:border-white/5 z-10 px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1 -ml-1 text-gray-600 dark:text-gray-400 active:scale-95 transition-transform"><FiArrowLeft size={22} /></button>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${getAvatarColor(friend?.id)}`}>
              {(friend?.relation === 'linked' ? friend?.addedBy : friend?.name)?.charAt(0)?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm text-gray-900 dark:text-gray-100 truncate">{friend?.relation === 'linked' ? friend?.addedBy : friend?.name}</p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500">Tap here for settings</p>
            </div>
          </div>
          <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 active:scale-95 transition-transform"><FiPhone size={18} /></button>
          <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 active:scale-95 transition-transform"><FiMoreVertical size={18} /></button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-950/50 border-b border-gray-100 dark:border-white/5">
        <div className="flex px-4 py-2.5">
          {[
            { icon: FiDownload, label: 'Report' },
            { icon: FiBell, label: 'Reminder' },
            { icon: FiMessageSquare, label: 'SMS' },
          ].map(({ icon: Icon, label }) => (
            <button key={label} className="flex-1 flex flex-col items-center gap-1 py-1 active:scale-95 transition-transform">
              <div className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center">
                <Icon size={16} className="text-gray-500 dark:text-gray-400" />
              </div>
              <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Table Header */}
      <div className="sticky top-0 bg-gray-50/95 dark:bg-gray-950/95 backdrop-blur-sm border-b border-gray-100 dark:border-white/5 z-10 px-4 py-2">
        <div className="grid grid-cols-[1fr_auto_auto] gap-3 items-center">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Entries</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-red-400 text-right">You Gave</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-green-400 text-right w-16">You Got</span>
        </div>
      </div>

      {/* Transactions List */}
      <div ref={listRef} className="flex-1 overflow-y-auto pb-20">
        {loading ? (
          <div className="p-6 space-y-4">{[...Array(5)].map((_, i) => <div key={i} className="h-14 skeleton rounded-xl" />)}</div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-4">
              <FiPlus size={24} className="text-gray-300 dark:text-gray-600" />
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No entries yet</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Record your first transaction</p>
          </div>
        ) : (
          <AnimatePresence>
            <div>
              {/* Summary row */}
              <div className="px-4 py-2.5 bg-gray-50/80 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/5">
                <div className="grid grid-cols-[1fr_auto_auto] gap-3 items-center text-xs font-semibold">
                  <span className="text-gray-500 dark:text-gray-400">Summary</span>
                  <span className="text-red-600 dark:text-red-400 text-right">₹{totalGiven.toLocaleString()}</span>
                  <span className="text-green-600 dark:text-green-400 text-right w-16">₹{totalGot.toLocaleString()}</span>
                </div>
              </div>
              {[...transactions].reverse().map((txn) => (
                <TransactionRow key={txn.id} txn={txn} perspective={friend?.relation} onEdit={(d) => setEditTxn(d)} onDelete={handleDelete} />
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-950/95 backdrop-blur-xl border-t border-gray-100 dark:border-white/5 px-4 py-3 pb-6 space-y-2 z-10 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
        <div className="flex gap-2">
          <input type="number" step="0.01" min="1" className="flex-1 bg-gray-50 dark:bg-white/5 border-0 rounded-2xl px-4 py-2.5 text-base font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 dark:text-gray-100 placeholder-gray-300 dark:placeholder-gray-600" placeholder="₹0" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <input type="text" className="w-24 bg-gray-50 dark:bg-white/5 border-0 rounded-2xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 dark:text-gray-100 placeholder-gray-300 dark:placeholder-gray-600" placeholder="Note" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleTxn('CREDIT_GIVEN')} disabled={submitting || !amount} className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold py-3 rounded-2xl active:scale-[0.98] transition-transform disabled:opacity-40 shadow-lg shadow-red-500/20 text-sm">
            <FiPlus size={18} /> You Gave ₹
          </button>
          <button onClick={() => handleTxn('PAYMENT_RECEIVED')} disabled={submitting || !amount} className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 rounded-2xl active:scale-[0.98] transition-transform disabled:opacity-40 shadow-lg shadow-green-500/20 text-sm">
            <FiMinus size={18} /> You Got ₹
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {editTxn && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="fixed inset-0 bg-black/40" onClick={() => setEditTxn(null)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-t-3xl w-full p-5 pb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Edit Entry</h2>
              <button onClick={() => setEditTxn(null)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-xl"><FiX size={18} /></button>
            </div>
            <div className="space-y-3">
              <input type="number" step="0.01" min="1" className="w-full bg-gray-50 dark:bg-white/5 border-0 rounded-2xl px-4 py-3 text-base font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Amount" value={editTxn.editAmount} onChange={(e) => setEditTxn(p => ({ ...p, editAmount: e.target.value }))} />
              <input type="text" className="w-full bg-gray-50 dark:bg-white/5 border-0 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Description" value={editTxn.editDescription} onChange={(e) => setEditTxn(p => ({ ...p, editDescription: e.target.value }))} />
              <textarea className="w-full bg-gray-50 dark:bg-white/5 border-0 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" rows={2} placeholder="Note" value={editTxn.editNote} onChange={(e) => setEditTxn(p => ({ ...p, editNote: e.target.value }))} />
              <div className="flex gap-3 pt-2">
                <button onClick={() => setEditTxn(null)} className="flex-1 py-3 rounded-2xl bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 font-medium text-sm active:scale-[0.98] transition-transform">Cancel</button>
                <button onClick={handleEdit} disabled={submitting} className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold text-sm active:scale-[0.98] transition-transform disabled:opacity-50">{submitting ? 'Saving...' : 'Save'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}