import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiPlus, FiChevronDown, FiFilter, FiArrowUp, FiArrowDown, FiUser, FiEdit2, FiTrash2, FiX, FiDownload, FiBell, FiChevronLeft, FiChevronRight, FiClock, FiSend } from 'react-icons/fi';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../../services/customerService';
import { getCustomerTransactions, giveCredit, receivePayment, updateTransaction, deleteTransaction } from '../../services/transactionService';
import { useDebounce } from '../../hooks/useDebounce';
import { generateLedgerPDF, downloadPDF } from '../../utils/pdfGenerator';
import axios from 'axios';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL || '/api';
function token() { return localStorage.getItem('accessToken'); }

const pastels = ['bg-red-100 text-red-600', 'bg-blue-100 text-blue-600', 'bg-green-100 text-green-600', 'bg-purple-100 text-purple-600', 'bg-yellow-100 text-yellow-600', 'bg-pink-100 text-pink-600', 'bg-indigo-100 text-indigo-600', 'bg-teal-100 text-teal-600'];
function getAvatarColor(id) { return pastels[Number(id || 0) % pastels.length]; }

const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN');
const cardHover = { whileHover: { y: -2, transition: { duration: 0.2 } } };

function TransactionCard({ txn, perspective, onEdit, onDelete }) {
  const isCredit = txn.type === 'CREDIT_GIVEN';
  const fromFP = perspective === 'linked' ? !isCredit : isCredit;
  const date = new Date(txn.createdAt);
  const timeStr = date.toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit' });

  if (txn.deleted) {
    return (
      <div className="flex justify-center py-1.5">
        <div className="bg-gray-100/50 dark:bg-white/[0.02] text-gray-400 dark:text-gray-500 text-[11px] px-3.5 py-1.5 rounded-full italic flex items-center gap-2 border border-gray-100 dark:border-white/5">
          <FiTrash2 size={11} />
          <span className="line-through">{fmt(txn.amount)} deleted</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      {...cardHover}
      className="group relative bg-white dark:bg-white/[0.02] rounded-xl border border-gray-100 dark:border-white/[0.05] p-3.5 hover:border-blue-500/20 dark:hover:border-blue-500/20 hover:shadow-md hover:shadow-blue-500/5 dark:hover:shadow-blue-500/5 transition-all"
    >
      {/* Timeline dot */}
      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-100 dark:bg-white/5 rounded-full group-hover:bg-blue-400/30 transition-colors" />

      <div className="flex items-start gap-3 pl-3">
        <div className={`p-2 rounded-xl flex-shrink-0 ${fromFP ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'} group-hover:scale-110 transition-transform`}>
          {fromFP ? <FiArrowUp size={16} /> : <FiArrowDown size={16} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <p className={`text-xl font-bold tracking-tight ${fromFP ? 'text-red-400' : 'text-green-400'}`}>
              {fromFP ? '+' : '-'}{fmt(txn.amount)}
            </p>
            <span className="text-[10px] text-gray-500 dark:text-gray-500 flex-shrink-0 font-medium">{timeStr}</span>
          </div>
          {txn.description && <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-0.5">{txn.description}</p>}
          <div className="flex items-center gap-2 mt-1.5">
            <FiClock size={10} className="text-gray-400/60" />
            <span className="text-[10px] text-gray-400 dark:text-gray-500">{fmt(txn.balanceAfter)} balance</span>
          </div>
        </div>
        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 pt-0.5">
          <button onClick={() => onEdit({ ...txn, editAmount: String(txn.amount), editDescription: txn.description || '', editNote: txn.note || '' })} className="p-1 text-gray-400 hover:text-blue-400 hover:bg-white/10 rounded-lg transition-all"><FiEdit2 size={13} /></button>
          <button onClick={() => onDelete(txn)} className="p-1 text-gray-400 hover:text-red-400 hover:bg-white/10 rounded-lg transition-all"><FiTrash2 size={13} /></button>
        </div>
      </div>
    </motion.div>
  );
}

function DateGroup({ label, children }) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex items-center gap-2 mb-2.5 px-1">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">{label}</span>
        <div className="flex-1 h-px bg-gray-100 dark:bg-white/5" />
      </div>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
}

export default function Transactions() {
  const [customers, setCustomers] = useState([]);
  const [linkedFriends, setLinkedFriends] = useState([]);
  const [mergedList, setMergedList] = useState([]);
  const [selected, setSelected] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [txnLoading, setTxnLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editTxn, setEditTxn] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', phone: '', email: '' });
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailAddr, setEmailAddr] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [showEditFriend, setShowEditFriend] = useState(false);
  const [editFriendForm, setEditFriendForm] = useState({ name: '', phone: '' });
  const chatEnd = useRef(null);

  const debouncedSearch = useDebounce(search);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [ownRes, friendRes] = await Promise.all([
        getCustomers({ search: debouncedSearch || undefined, size: 100 }),
        axios.get(`${API}/friend/dashboard`, { headers: { Authorization: `Bearer ${token()}` } }).then(r => r.data).catch(() => ({ friends: [] })),
      ]);
      const own = (ownRes.content || []).map(c => ({ ...c, relation: 'own', addedBy: null }));
      const linked = ((friendRes.friends || [])).map(f => ({ ...f, relation: 'linked' }));
      setCustomers(own);
      setLinkedFriends(linked);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  }, [debouncedSearch]);

  useEffect(() => { fetchAll(); }, [fetchAll, refreshKey]);

  useEffect(() => {
    let merged = [...customers];
    for (const f of linkedFriends) {
      if (!merged.find(m => m.id === f.id)) merged.push(f);
    }
    if (debouncedSearch) merged = merged.filter(m => m.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) || m.phone?.includes(debouncedSearch));
    setMergedList(merged);
  }, [customers, linkedFriends, debouncedSearch]);

  useEffect(() => {
    if (!selected) { setTransactions([]); return; }
    setTxnLoading(true);
    const fetchTxns = async () => {
      try {
        if (selected.relation === 'linked') {
          const res = await axios.get(`${API}/friend/dashboard`, { headers: { Authorization: `Bearer ${token()}` } });
          const friend = res.data.friends?.find(f => f.id === selected.id);
          setTransactions(friend?.transactions || []);
        } else {
          const data = await getCustomerTransactions(selected.id, { size: 100 });
          setTransactions(data.content || []);
        }
      } catch { toast.error('Failed to load'); }
      finally { setTxnLoading(false); }
    };
    fetchTxns();
  }, [selected, refreshKey]);

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [transactions]);

  useEffect(() => {
    if (selected) {
      const updated = mergedList.find(m => m.id === selected.id);
      if (updated) setSelected(updated);
    }
  }, [mergedList]);

  useEffect(() => {
    if (showEditFriend && selected) {
      setEditFriendForm({ name: selected.name || '', phone: selected.phone || '' });
    }
  }, [showEditFriend]);

  const handleTransaction = async (type) => {
    if (!amount || parseFloat(amount) <= 0) { toast.error('Enter amount'); return; }
    if (!selected) { toast.error('Select a friend'); return; }
    setSubmitting(true);
    try {
      const payload = { customerId: selected.id, amount: parseFloat(amount), description: note, note };
      if (type === 'CREDIT_GIVEN') { await giveCredit(payload); toast.success(`₹${amount} given`); }
      else { await receivePayment(payload); toast.success(`₹${amount} taken`); }
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
    catch { toast.error('Failed to delete'); }
  };

  const handleDownloadFriendPDF = async () => {
    if (!selected || transactions.length === 0) { toast.error('No transactions to export'); return; }
    try {
      const activeTxns = transactions.filter(t => !t.deleted);
      if (activeTxns.length === 0) { toast.error('No active transactions to export'); return; }
      const fName = selected.relation === 'linked' ? selected.addedBy : selected.name;
      const doc = generateLedgerPDF({
        reportTitle: `${fName} - Transaction Statement`,
        friendName: fName,
        perspective: selected.relation,
        netBalance: friendBalance,
        transactions: activeTxns,
      });
      downloadPDF(doc, `oweMe-${fName}-statement.pdf`);
      toast.success('Statement downloaded');
    } catch { toast.error('Failed to generate PDF'); }
  };

  const handleEmailFriendPDF = async () => {
    if (!emailAddr.trim()) { toast.error('Enter an email'); return; }
    if (!selected || transactions.length === 0) { toast.error('No transactions'); return; }
    setSendingEmail(true);
    try {
      const activeTxns = transactions.filter(t => !t.deleted);
      const fName = selected.relation === 'linked' ? selected.addedBy : selected.name;
      const doc = generateLedgerPDF({
        reportTitle: `${fName} - Transaction Statement`,
        friendName: fName,
        perspective: selected.relation,
        netBalance: friendBalance,
        transactions: activeTxns,
      });
      const pdfBase64 = doc.output('datauristring').split(',')[1];
      await axios.post(`${API}/email/send-report`, {
        to: emailAddr,
        subject: `OweMe Statement - ${fName}`,
        body: `Please find attached the transaction statement for ${fName} from your OweMe account.`,
        pdfBase64,
        pdfName: `oweMe-${fName}-statement.pdf`,
      }, { headers: { Authorization: `Bearer ${token()}` } });
      toast.success('Sent to ' + emailAddr);
      setShowEmailModal(false); setEmailAddr('');
    } catch (err) { toast.error(err?.response?.data?.error || 'Failed to send'); }
    finally { setSendingEmail(false); }
  };

  const handleEditFriend = async () => {
    if (!editFriendForm.name.trim()) { toast.error('Name is required'); return; }
    try {
      await updateCustomer(selected.id, editFriendForm);
      toast.success('Friend updated');
      setShowEditFriend(false);
      setRefreshKey(k => k + 1);
    } catch (err) { console.error('Edit friend error:', err); toast.error(err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Failed to update'); }
  };

  const handleDeleteFriend = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selected.name}? This will remove them from your list.`)) return;
    try {
      await deleteCustomer(selected.id);
      toast.success('Friend deleted');
      setShowEditFriend(false);
      setSelected(null);
      setRefreshKey(k => k + 1);
    } catch (err) { toast.error('Failed to delete friend'); }
  };

  const handleAddFriend = async (e) => {
    e.preventDefault();
    if (!addForm.name.trim()) { toast.error('Name is required'); return; }
    try { await createCustomer(addForm); toast.success('Friend added'); setShowAdd(false); setAddForm({ name: '', phone: '', email: '' }); setRefreshKey(k => k + 1); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const friendBalance = selected?.relation === 'linked' ? (selected.owedToMe > 0 ? selected.owedToMe : -selected.iowe) : selected?.runningBalance;
  const getBalance = (c) => c.relation === 'linked' ? Number(c.owedToMe || 0) - Number(c.iowe || 0) : Number(c.runningBalance || 0);
  const filteredMerged = mergedList.filter(c => { if (activeTab === 'all') return true; if (activeTab === 'friends') return c.relation === 'own'; return c.relation === 'linked'; });

  // Group transactions by date
  const groupedTxns = {};
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  for (const txn of [...transactions].reverse()) {
    const d = new Date(txn.createdAt).toDateString();
    let label;
    if (d === today) label = 'Today';
    else if (d === yesterday) label = 'Yesterday';
    else label = new Date(txn.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    if (!groupedTxns[label]) groupedTxns[label] = [];
    groupedTxns[label].push(txn);
  }

  return (
    <div className="relative h-full flex flex-col overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-purple-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative flex flex-col flex-1 min-h-0 space-y-4">
        <div className="hidden md:flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Transactions</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your ledger with friends</p>
          </div>
        </div>

        {/* Main container */}
        <div className="flex flex-1 min-h-0 bg-white dark:bg-white/[0.02] rounded-xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
          {/* Left panel */}
          <div className={`${selected ? 'hidden md:flex' : 'flex'} w-full md:w-[340px] bg-white dark:bg-white/[0.02] border-r border-gray-100 dark:border-white/5 flex-col flex-shrink-0 relative`}>
            <div className="px-4 pt-3 pb-2.5">
              <div className="relative">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                <input type="text" className="w-full pl-9 pr-3.5 py-2 bg-gray-50 dark:bg-white/[0.03] border-0 rounded-xl text-xs placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/30 focus:outline-none transition-all text-gray-900 dark:text-gray-100" placeholder="Search Friend" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </div>
            <div className="px-4 pb-2.5 flex items-center gap-3">
              <div className="flex gap-3 flex-1">
                {['all', 'friends', 'linked'].map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={`text-[10px] font-semibold pb-1 border-b-2 transition-all ${activeTab === tab ? 'text-blue-500 border-blue-500' : 'text-gray-400 border-transparent hover:text-gray-600 dark:hover:text-gray-300'}`}>
                    {tab === 'all' ? 'All' : tab === 'friends' ? 'Friends' : 'Added You'}
                  </button>
                ))}
              </div>
              <button className="p-1.5 rounded-lg bg-gray-50 dark:bg-white/[0.03] text-gray-400 hover:text-blue-500 transition-colors"><FiFilter size={14} /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 pb-20">
              {loading ? (
                [...Array(5)].map((_, i) => <div key={i} className="flex items-center gap-3 px-3 py-2.5"><div className="w-9 h-9 rounded-full skeleton" /><div className="flex-1 space-y-1.5"><div className="h-2.5 skeleton w-20 rounded" /><div className="h-2 skeleton w-12 rounded" /></div><div className="h-3 skeleton w-14 rounded" /></div>)
              ) : filteredMerged.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-xs">No friends yet</div>
              ) : (
                filteredMerged.map((c) => (
                  <motion.button key={c.id} {...cardHover} onClick={() => { setSelected(c); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-left ${selected?.id === c.id ? 'bg-blue-50 dark:bg-blue-500/10 shadow-sm' : 'hover:bg-gray-50 dark:hover:bg-white/[0.03]'}`}>
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${getAvatarColor(c.id)}`}>{(c.relation === 'linked' ? c.addedBy : c.name)?.charAt(0).toUpperCase()}</div>
                    <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{c.relation === 'linked' ? c.addedBy : c.name}</p><p className="text-[10px] text-gray-400 truncate">{c.relation === 'linked' ? (c.phone || c.name) : (c.phone || 'Friend')}</p></div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-xs font-bold ${getBalance(c) > 0 ? 'text-red-400' : 'text-green-400'}`}>{fmt(Math.abs(getBalance(c)))}</p>
                      <p className="text-[9px] text-gray-400">{getBalance(c) > 0 ? 'Due' : (getBalance(c) < 0 ? 'You owe' : 'Paid')}</p>
                    </div>
                  </motion.button>
                ))
              )}
            </div>
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2" style={{ width: 'calc(100% - 32px)', maxWidth: '300px' }}>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowAdd(true)} className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-lg hover:shadow-blue-500/20 text-white font-semibold py-2.5 px-5 rounded-xl flex items-center justify-center gap-2 transition-all text-xs">
                <FiPlus size={16} /> Add Friend
              </motion.button>
            </div>
          </div>

          {/* Right panel */}
          <div className={`${!selected ? 'hidden md:flex' : 'flex'} flex-1 flex-col min-h-0 bg-gray-50/50 dark:bg-gray-950/50`}>
            {selected ? (
            <div className="flex flex-col flex-1 min-h-0">
              {/* Header */}
              <div className="flex-shrink-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm px-3 md:px-5 py-2.5 md:py-3 border-b border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-1.5 md:gap-3">
                  <button onClick={() => { setSelected(null); setTransactions([]); }} className="md:hidden p-1 -ml-1 text-gray-500 hover:bg-white/10 rounded-lg flex-shrink-0"><FiChevronLeft size={18} /></button>
                  <div className={`w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center text-xs md:text-sm font-bold flex-shrink-0 ${getAvatarColor(selected.id)}`}>{(selected.relation === 'linked' ? selected.addedBy : selected.name)?.charAt(0).toUpperCase()}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5"><p className="font-bold text-sm md:text-sm text-gray-900 dark:text-gray-100 truncate">{selected.relation === 'linked' ? selected.addedBy : selected.name}</p>{selected.relation !== 'linked' && <button onClick={() => setShowEditFriend(true)} className="text-[10px] font-medium text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 px-2 py-0.5 rounded-md transition-all flex-shrink-0">Edit</button>}</div>
                    <p className="text-[10px] text-gray-400 truncate">{selected.relation === 'linked' ? 'Added you' : 'Friend'}</p>
                  </div>
                  <div className="flex items-center gap-0.5 md:gap-1 flex-shrink-0">
                    <button onClick={handleDownloadFriendPDF} className="p-1.5 md:p-1.5 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-white/10 transition-all"><FiDownload size={14} className="md:hidden" /><FiDownload size={15} className="hidden md:block" /></button>
                    <button onClick={() => setShowEmailModal(true)} className="p-1.5 md:p-1.5 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-white/10 transition-all"><FiSend size={14} className="md:hidden" /><FiSend size={15} className="hidden md:block" /></button>
                  </div>
                </div>
                <div className="md:hidden mt-2 flex items-center justify-between bg-gray-50 dark:bg-white/[0.03] rounded-xl px-3.5 py-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Balance</span>
                  <span className={`font-bold text-base ${friendBalance > 0 ? 'text-red-400' : 'text-green-400'}`}>{fmt(friendBalance || 0)}</span>
                </div>
              </div>

              {/* Transaction feed */}
              <div className="flex-1 overflow-y-auto p-4 md:p-5">
                {txnLoading ? (
                  <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-16 skeleton rounded-xl" />)}</div>
                ) : transactions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400"><FiUser size={40} className="mb-3 text-gray-300 dark:text-gray-600" /><p className="font-medium text-sm text-gray-500">No transactions yet</p><p className="text-xs mt-1">Record your first transaction below</p></div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(groupedTxns).map(([label, txns]) => (
                      <DateGroup key={label} label={label}>
                        {txns.map((txn) => (
                          <TransactionCard key={txn.id} txn={txn} perspective={selected.relation} onEdit={(d) => setEditTxn(d)} onDelete={handleDelete} />
                        ))}
                      </DateGroup>
                    ))}
                    <div ref={chatEnd} />
                  </div>
                )}
              </div>

              {/* Bottom form */}
              <div className="flex-shrink-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm border-t border-gray-100 dark:border-white/5 px-4 md:px-5 py-3">
                <div className="hidden md:flex items-center justify-between mb-2.5">
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Balance Due</span>
                  <span className={`font-bold text-base ${friendBalance > 0 ? 'text-red-400' : 'text-green-400'}`}>{fmt(friendBalance || 0)}</span>
                </div>
                <div className="flex gap-2 mb-2">
                  <input type="number" step="0.01" min="1" className="flex-1 bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 rounded-xl px-3.5 py-2.5 text-base font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 focus:outline-none transition-all text-gray-900 dark:text-gray-100 placeholder-gray-300 dark:placeholder-gray-600" placeholder="₹0" value={amount} onChange={(e) => setAmount(e.target.value)} />
                </div>
                <div className="flex gap-2 mb-2.5">
                  <input type="text" className="flex-1 bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 focus:outline-none transition-all text-gray-900 dark:text-gray-100 placeholder-gray-300 dark:placeholder-gray-600" placeholder="Add a note..." value={note} onChange={(e) => setNote(e.target.value)} />
                </div>
                <div className="flex gap-2">
                  <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={() => handleTransaction('PAYMENT_RECEIVED')} disabled={submitting || !amount} className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-2.5 rounded-xl hover:shadow-lg hover:shadow-green-500/20 transition-all disabled:opacity-40 text-xs">
                    <FiArrowDown size={15} /> Payment
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={() => handleTransaction('CREDIT_GIVEN')} disabled={submitting || !amount} className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold py-2.5 rounded-xl hover:shadow-lg hover:shadow-red-500/20 transition-all disabled:opacity-40 text-xs">
                    <FiArrowUp size={15} /> Credit
                  </motion.button>
                </div>
              </div>
            </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center"><FiUser size={56} className="mx-auto mb-3 text-gray-300 dark:text-gray-600" /><p className="font-medium text-sm text-gray-500">Select a friend</p><p className="text-xs mt-1">Choose from the left panel to view ledger</p></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          <div className="fixed inset-0 bg-black/30" onClick={() => setShowAdd(false)} />
          <div className="relative bg-white dark:bg-gray-900 md:rounded-2xl rounded-t-2xl shadow-xl w-full max-w-sm p-5">
            <div className="flex items-center justify-between mb-3"><h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">Add Friend</h2><button onClick={() => setShowAdd(false)} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-white/10 rounded-lg"><FiX size={16} /></button></div>
            <form onSubmit={handleAddFriend} className="space-y-2.5">
              <div><label className="text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1 block">Name *</label><input type="text" className="w-full bg-gray-50 dark:bg-white/5 border-0 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/30 focus:outline-none text-gray-900 dark:text-gray-100" placeholder="Friend name" value={addForm.name} onChange={(e) => setAddForm(p => ({ ...p, name: e.target.value }))} required /></div>
              <div><label className="text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1 block">Phone</label><input type="tel" className="w-full bg-gray-50 dark:bg-white/5 border-0 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/30 focus:outline-none text-gray-900 dark:text-gray-100" placeholder="Phone number" value={addForm.phone} onChange={(e) => setAddForm(p => ({ ...p, phone: e.target.value }))} /></div>
              <div><label className="text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1 block">Email</label><input type="email" className="w-full bg-gray-50 dark:bg-white/5 border-0 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/30 focus:outline-none text-gray-900 dark:text-gray-100" placeholder="Email (for linking accounts)" value={addForm.email} onChange={(e) => setAddForm(p => ({ ...p, email: e.target.value }))} /></div>
              <div className="flex justify-end gap-2.5 pt-1.5"><button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 font-medium text-xs hover:bg-gray-200 dark:hover:bg-white/10 transition-all">Cancel</button><button type="submit" className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium text-xs hover:shadow-lg hover:shadow-blue-500/20 transition-all">Add Friend</button></div>
            </form>
          </div>
        </div>
      )}

      {editTxn && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          <div className="fixed inset-0 bg-black/30" onClick={() => setEditTxn(null)} />
          <div className="relative bg-white dark:bg-gray-900 md:rounded-2xl rounded-t-2xl shadow-xl w-full max-w-sm p-5">
            <div className="flex items-center justify-between mb-3"><h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">Edit Transaction</h2><button onClick={() => setEditTxn(null)} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-white/10 rounded-lg"><FiX size={16} /></button></div>
            <div className="space-y-2.5">
              <div><label className="text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1 block">Amount</label><input type="number" step="0.01" min="1" className="w-full bg-gray-50 dark:bg-white/5 border-0 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/30 focus:outline-none text-gray-900 dark:text-gray-100" value={editTxn.editAmount} onChange={(e) => setEditTxn(p => ({ ...p, editAmount: e.target.value }))} /></div>
              <div><label className="text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1 block">Description</label><input type="text" className="w-full bg-gray-50 dark:bg-white/5 border-0 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/30 focus:outline-none text-gray-900 dark:text-gray-100" value={editTxn.editDescription} onChange={(e) => setEditTxn(p => ({ ...p, editDescription: e.target.value }))} /></div>
              <div><label className="text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1 block">Note</label><textarea className="w-full bg-gray-50 dark:bg-white/5 border-0 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/30 focus:outline-none text-gray-900 dark:text-gray-100" rows={2} value={editTxn.editNote} onChange={(e) => setEditTxn(p => ({ ...p, editNote: e.target.value }))} /></div>
              <div className="flex justify-end gap-2.5 pt-1.5"><button onClick={() => setEditTxn(null)} className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 font-medium text-xs hover:bg-gray-200 dark:hover:bg-white/10 transition-all">Cancel</button><button onClick={handleEdit} disabled={submitting} className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium text-xs hover:shadow-lg hover:shadow-blue-500/20 transition-all disabled:opacity-50">{submitting ? 'Saving...' : 'Save'}</button></div>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/30" onClick={() => setShowEmailModal(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-sm p-5">
            <div className="flex items-center justify-between mb-3"><h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">Share Statement</h2><button onClick={() => setShowEmailModal(false)} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-white/10 rounded-lg"><FiX size={16} /></button></div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Send {selected?.relation === 'linked' ? selected?.addedBy : selected?.name}'s statement to an email.</p>
            <input type="email" className="w-full bg-gray-50 dark:bg-white/5 border-0 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/30 focus:outline-none text-gray-900 dark:text-gray-100 mb-3" placeholder="friend@example.com" value={emailAddr} onChange={(e) => setEmailAddr(e.target.value)} />
            <div className="flex justify-end gap-2.5">
              <button onClick={() => setShowEmailModal(false)} className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 font-medium text-xs hover:bg-gray-200 dark:hover:bg-white/10 transition-all">Cancel</button>
              <button onClick={handleEmailFriendPDF} disabled={sendingEmail} className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium text-xs hover:shadow-lg hover:shadow-blue-500/20 transition-all disabled:opacity-50">
                <FiSend size={13} className="inline mr-1" />{sendingEmail ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Friend Modal */}
      {showEditFriend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/30" onClick={() => setShowEditFriend(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-sm p-5">
            <div className="flex items-center justify-between mb-3"><h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">Edit {selected?.relation === 'linked' ? selected?.addedBy : selected?.name}</h2><button onClick={() => setShowEditFriend(false)} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-white/10 rounded-lg"><FiX size={16} /></button></div>
            <div className="space-y-2.5">
              <div><label className="text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1 block">Name</label><input type="text" className="w-full bg-gray-50 dark:bg-white/5 border-0 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/30 focus:outline-none text-gray-900 dark:text-gray-100" value={editFriendForm.name} onChange={e => setEditFriendForm(p => ({ ...p, name: e.target.value }))} /></div>
              <div><label className="text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1 block">Phone</label><input type="tel" className="w-full bg-gray-50 dark:bg-white/5 border-0 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/30 focus:outline-none text-gray-900 dark:text-gray-100" value={editFriendForm.phone} onChange={e => setEditFriendForm(p => ({ ...p, phone: e.target.value }))} /></div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-white/5 mt-1">
                {selected?.relation !== 'linked' ? (
                  <button onClick={handleDeleteFriend} className="text-[10px] font-semibold text-red-500 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-all">Delete Friend</button>
                ) : <div />}
                <div className="flex gap-2">
                  <button onClick={() => setShowEditFriend(false)} className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 font-medium text-xs hover:bg-gray-200 dark:hover:bg-white/10 transition-all">Cancel</button>
                  <button onClick={handleEditFriend} className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium text-xs hover:shadow-lg hover:shadow-blue-500/20 transition-all">Save</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}