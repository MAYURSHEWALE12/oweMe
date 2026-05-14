import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiDownload, FiCalendar, FiFileText, FiTrendingUp, FiDollarSign, FiUsers,
  FiBarChart2, FiClock, FiArrowUp, FiArrowDown, FiDownloadCloud, FiActivity,
  FiAward, FiRefreshCw, FiPaperclip, FiSend, FiX,
} from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { downloadMonthlyReport } from '../../services/reportService';
import { getCustomers } from '../../services/customerService';
import { getDashboardStats } from '../../services/dashboardService';
import { generateLedgerPDF, downloadPDF } from '../../utils/pdfGenerator';
import axios from 'axios';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL || '/api';
function token() { return localStorage.getItem('accessToken'); }

const fadeUp = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-30px' }, transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] } };
const stagger = { initial: { opacity: 0, y: 16 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.45, staggerChildren: 0.07 } };
const hoverLift = { whileHover: { y: -2, transition: { duration: 0.2 } } };

export default function Reports() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [downloading, setDownloading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailAddr, setEmailAddr] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [stats, setStats] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [s, c, friendRes] = await Promise.all([
          getDashboardStats(),
          getCustomers({ size: 200 }).then(r => r.content || []).catch(() => []),
          axios.get(`${API}/friend/dashboard`, { headers: { Authorization: `Bearer ${token()}` } }).then(r => r.data).catch(() => ({ friends: [] })),
        ]);
        const linked = (friendRes.friends || []).map(f => ({ ...f, relation: 'linked' }));
        const all = [...c, ...linked.filter(l => !c.find(x => x.id === l.id))];
        setStats(s); setCustomers(all);
      } catch {} finally { setLoading(false); }
    })();
  }, []);

  const totalLent = stats?.totalCreditGiven || 0;
  const totalReceived = stats?.totalPaymentReceived || 0;
  const totalReceivable = stats?.totalReceivable || 0;
  const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN');
  const getBalance = (c) => c.relation === 'linked' ? Number(c.owedToMe || 0) - Number(c.iowe || 0) : Number(c.runningBalance || 0);

  // Calculate from merged customers (includes both own and linked)
  let calcLent = 0, calcReceived = 0;
  for (const c of customers) {
    const bal = getBalance(c);
    if (bal > 0) calcLent += bal;
    else if (bal < 0) calcReceived += Math.abs(bal);
  }
  const displayLent = calcLent || totalLent;
  const displayReceived = calcReceived || totalReceived;
  const displayReceivable = calcLent - calcReceived || totalReceivable;

  const chartData = stats?.weeklyChart
    ? Object.keys(stats.weeklyChart.creditData).map(k => ({ name: k, lent: Number(stats.weeklyChart.creditData[k]) || 0, received: Number(stats.weeklyChart.paymentData[k]) || 0 }))
    : [];

  const highestPending = customers.length > 0 ? customers.reduce((a, b) => getBalance(a) > getBalance(b) ? a : b) : null;
  const topPending = highestPending ? getBalance(highestPending) : 0;

  const dummyExports = [
    { name: 'Complete_Ledger_May_2026.pdf', type: 'Ledger Report', date: '14 May 2026', size: '1.2 MB' },
    { name: 'Monthly_April_2026.xlsx', type: 'Monthly Excel', date: '01 May 2026', size: '0.8 MB' },
    { name: 'April_2026_Ledger.pdf', type: 'Ledger Report', date: '28 Apr 2026', size: '1.5 MB' },
  ];

  const months = [
    { value: 1, label: 'Jan' }, { value: 2, label: 'Feb' }, { value: 3, label: 'Mar' },
    { value: 4, label: 'Apr' }, { value: 5, label: 'May' }, { value: 6, label: 'Jun' },
    { value: 7, label: 'Jul' }, { value: 8, label: 'Aug' }, { value: 9, label: 'Sep' },
    { value: 10, label: 'Oct' }, { value: 11, label: 'Nov' }, { value: 12, label: 'Dec' },
  ];
  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i);

  const handleDownload = async () => {
    setDownloading(true);
    try { await downloadMonthlyReport(month, year); toast.success('Report downloaded'); } catch { toast.error('Failed'); } finally { setDownloading(false); }
  };

  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    try {
      let customers = [];
      try { const data = await getCustomers({ size: 200 }); customers = data.content || []; } catch {}
      const doc = generateLedgerPDF({ reportTitle: 'Complete Ledger Report', customers });
      downloadPDF(doc, 'oweMe-ledger-report.pdf');
      toast.success('PDF generated');
    } catch { toast.error('Failed'); } finally { setPdfLoading(false); }
  };

  const handleEmailPDF = async () => {
    if (!emailAddr.trim()) { toast.error('Enter an email address'); return; }
    setSendingEmail(true);
    try {
      let customers = [];
      try { const data = await getCustomers({ size: 200 }); customers = data.content || []; } catch {}
      const doc = generateLedgerPDF({ reportTitle: 'Complete Ledger Report', customers });
      const pdfBase64 = doc.output('datauristring').split(',')[1];
      const API = import.meta.env.VITE_API_URL || '/api';
      await axios.post(`${API}/email/send-report`, {
        to: emailAddr,
        subject: 'Your OweMe Ledger Report',
        body: 'Please find attached your complete ledger report generated by OweMe.',
        pdfBase64,
        pdfName: 'oweMe-ledger-report.pdf',
      }, { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } });
      toast.success('Report sent to ' + emailAddr);
      setShowEmailModal(false);
      setEmailAddr('');
    } catch (err) { toast.error(err?.response?.data?.error || 'Failed to send email'); }
    finally { setSendingEmail(false); }
  };

  return (
    <div className="relative min-h-full pt-2">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative space-y-6">
        {/* ===== HEADER ===== */}
        <motion.div {...fadeUp} className="flex items-start justify-between pb-1">
          <div>
            <div className="flex items-center gap-2 text-[11px] text-gray-400 mb-1.5">
              <span>Home</span><span className="text-gray-300">/</span><span className="text-blue-500 font-medium">Reports</span>
            </div>
            <h1 className="text-[28px] md:text-[32px] font-bold text-gray-900 dark:text-gray-100 tracking-tight leading-none">Reports & Analytics</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">Export, analyze, and download your financial data</p>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-white dark:bg-white/[0.03] rounded-xl px-3.5 py-2 border border-gray-100 dark:border-white/5">
            <FiActivity size={13} className="text-blue-400" />
            <span className="text-[11px] text-gray-500 dark:text-gray-400">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>
        </motion.div>

        {/* ===== STATS CARDS ===== */}
        <motion.div {...stagger} className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: FiArrowUp, label: 'Total Lent', value: fmt(displayLent), color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
            { icon: FiArrowDown, label: 'Total Received', value: fmt(displayReceived), color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
            { icon: FiDollarSign, label: 'Outstanding', value: fmt(displayReceivable), color: displayReceivable >= 0 ? 'text-blue-400' : 'text-red-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
            { icon: FiUsers, label: 'Active Friends', value: String(customers.length), color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
          ].map(({ icon: Icon, label, value, color, bg, border }) => (
            <motion.div key={label} {...stagger} {...hoverLift} className="bg-white dark:bg-white/[0.03] backdrop-blur-sm rounded-xl border border-gray-100 dark:border-white/[0.06] p-4 hover:shadow-md hover:shadow-gray-200/50 dark:hover:shadow-black/20 transition-all">
              <div className="flex items-center justify-between mb-2.5">
                <div className={`p-2 rounded-lg ${bg} ${color}`}><Icon size={15} /></div>
              </div>
              <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">{value}</p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 font-medium">{label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* ===== MAIN GRID ===== */}
        <div className="grid lg:grid-cols-3 gap-5">
          {/* Left + Center */}
          <div className="lg:col-span-2 space-y-5">
            {/* Chart */}
            <motion.div {...fadeUp} {...hoverLift} className="bg-white dark:bg-white/[0.03] backdrop-blur-sm rounded-xl border border-gray-100 dark:border-white/[0.06] p-5 hover:shadow-md hover:shadow-gray-200/50 dark:hover:shadow-black/20 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-blue-500/10"><FiTrendingUp size={14} className="text-blue-400" /></div>
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">Weekly Trend</h3>
                </div>
                <span className="text-[10px] text-gray-400 font-medium">Lent vs Received</span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData.length > 0 ? chartData : [{ name: 'No data', lent: 0, received: 0 }]} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-100 dark:stroke-white/5" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} className="text-[10px]" tick={{ fill: '#9ca3af' }} />
                  <YAxis axisLine={false} tickLine={false} className="text-[10px]" tick={{ fill: '#9ca3af' }} />
                  <Tooltip
                    contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '11px', boxShadow: '0 8px 30px rgba(0,0,0,0.3)' }}
                    cursor={{ fill: 'rgba(59,130,246,0.05)' }}
                  />
                  <Bar dataKey="lent" fill="#ef4444" radius={[6, 6, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="received" fill="#22c55e" radius={[6, 6, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Recent Exports */}
            <motion.div {...fadeUp} {...hoverLift} className="bg-white dark:bg-white/[0.03] backdrop-blur-sm rounded-xl border border-gray-100 dark:border-white/[0.06] p-5 hover:shadow-md hover:shadow-gray-200/50 dark:hover:shadow-black/20 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-purple-500/10"><FiClock size={14} className="text-purple-400" /></div>
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">Recent Exports</h3>
                </div>
              </div>
              <div className="space-y-1.5">
                {dummyExports.map((exp, i) => (
                  <div key={i} className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.02] hover:bg-gray-100 dark:hover:bg-white/[0.04] transition-all group cursor-pointer">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 flex-shrink-0"><FiFileText size={13} /></div>
                      <div className="min-w-0"><p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">{exp.name}</p><p className="text-[10px] text-gray-400 mt-0.5">{exp.type} <span className="mx-1">•</span> {exp.date}</p></div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[10px] text-gray-400">{exp.size}</span>
                      <FiDownload size={13} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-5">
            {/* Export cards */}
            <motion.div {...fadeUp} {...hoverLift} className="bg-white dark:bg-white/[0.03] backdrop-blur-sm rounded-xl border border-gray-100 dark:border-white/[0.06] p-5 hover:shadow-md hover:shadow-gray-200/50 dark:hover:shadow-black/20 transition-all">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="p-1.5 rounded-lg bg-blue-500/10"><FiDownloadCloud size={14} className="text-blue-400" /></div>
                <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">Export Reports</h3>
              </div>
              <div className="space-y-3">
                <div className="bg-gray-50 dark:bg-white/[0.02] rounded-xl p-3.5 border border-gray-50 dark:border-white/[0.02]">
                  <div className="flex items-center gap-2 mb-2.5">
                    <FiCalendar size={13} className="text-blue-400" />
                    <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">Monthly Report</span>
                  </div>
                  <div className="flex gap-1.5 mb-2.5">
                    <select className="w-full bg-white dark:bg-white/5 border-0 rounded-lg px-2 py-1.5 text-[10px] focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 dark:text-gray-100" value={month} onChange={e => setMonth(Number(e.target.value))}>
                      {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                    <select className="w-full bg-white dark:bg-white/5 border-0 rounded-lg px-2 py-1.5 text-[10px] focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 dark:text-gray-100" value={year} onChange={e => setYear(Number(e.target.value))}>
                      {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={handleDownload} disabled={downloading} className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow-lg hover:shadow-blue-500/25 text-white font-semibold py-2 rounded-lg transition-all text-[11px] disabled:opacity-50">
                    <FiDownload size={12} /> {downloading ? 'Downloading...' : 'Download Excel'}
                  </motion.button>
                </div>
                <div className="bg-gray-50 dark:bg-white/[0.02] rounded-xl p-3.5 border border-gray-50 dark:border-white/[0.02]">
                  <div className="flex items-center gap-2 mb-2.5">
                    <FiFileText size={13} className="text-purple-400" />
                    <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">PDF Ledger Report</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mb-2.5 leading-relaxed">Complete ledger with all friends and balances</p>
                  <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={handleDownloadPDF} disabled={pdfLoading} className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-purple-500 to-purple-600 hover:shadow-lg hover:shadow-purple-500/25 text-white font-semibold py-2 rounded-lg transition-all text-[11px] disabled:opacity-50">
                    <FiFileText size={12} /> {pdfLoading ? 'Generating...' : 'Download PDF'}
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={() => setShowEmailModal(true)} className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:shadow-lg hover:shadow-blue-500/20 text-white font-semibold py-2 rounded-lg transition-all text-[11px] mt-2">
                    <FiSend size={12} /> Share via Email
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ===== SETTLEMENT SUMMARY ===== */}
        <motion.div {...fadeUp} className="bg-white dark:bg-white/[0.03] backdrop-blur-sm rounded-xl border border-gray-100 dark:border-white/[0.06] p-5 hover:shadow-md hover:shadow-gray-200/50 dark:hover:shadow-black/20 transition-all">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="p-1.5 rounded-lg bg-green-500/10"><FiRefreshCw size={14} className="text-green-400" /></div>
            <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">Settlement Summary</h3>
          </div>
          {customers.length === 0 ? (
            <p className="text-xs text-gray-400">No friends to show settlements for.</p>
          ) : (
            <div className="space-y-2">
              {customers.filter(c => getBalance(c) > 0).slice(0, 5).map(c => (
                <div key={c.id} className="flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-red-50/50 dark:bg-red-500/5 border border-red-100 dark:border-red-500/10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400">{(c.relation === 'linked' ? c.addedBy : c.name)?.charAt(0)}</div>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{c.relation === 'linked' ? c.addedBy : c.name}</span>
                  </div>
                  <span className="text-xs font-bold text-red-500">owes you {fmt(getBalance(c))}</span>
                </div>
              ))}
              {customers.filter(c => getBalance(c) < 0).slice(0, 5).map(c => (
                <div key={c.id} className="flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-green-50/50 dark:bg-green-500/5 border border-green-100 dark:border-green-500/10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400">{(c.relation === 'linked' ? c.addedBy : c.name)?.charAt(0)}</div>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{c.relation === 'linked' ? c.addedBy : c.name}</span>
                  </div>
                  <span className="text-xs font-bold text-green-600">you owe {fmt(Math.abs(getBalance(c)))}</span>
                </div>
              ))}
              {customers.filter(c => getBalance(c) === 0).length === customers.length && customers.length > 0 && (
                <p className="text-xs text-gray-400 text-center py-3">All settled up! No outstanding balances.</p>
              )}
            </div>
          )}
        </motion.div>

        {/* ===== FEATURES ===== */}
        <motion.div {...fadeUp} {...hoverLift} className="bg-white dark:bg-white/[0.03] backdrop-blur-sm rounded-xl border border-gray-100 dark:border-white/[0.06] p-5 hover:shadow-md hover:shadow-gray-200/50 dark:hover:shadow-black/20 transition-all">
          <div className="flex items-center gap-2.5 mb-3.5">
            <div className="p-1.5 rounded-lg bg-cyan-500/10"><FiBarChart2 size={14} className="text-cyan-400" /></div>
            <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">Report Features</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {['Date-wise history', 'PDF with branding', 'Monthly summaries', 'Running balances', 'Multi-page support', 'Print-ready format', 'Share via WhatsApp', 'Mobile-friendly'].map(f => (
              <div key={f} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-white/[0.02]">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                <span className="text-[11px] text-gray-600 dark:text-gray-400">{f}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setShowEmailModal(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">Share via Email</h2>
              <button onClick={() => setShowEmailModal(false)} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg"><FiX size={16} /></button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Enter an email to send the full ledger PDF report.</p>
            <input type="email" className="w-full bg-gray-50 dark:bg-white/5 border-0 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/30 focus:outline-none text-gray-900 dark:text-gray-100 mb-3" placeholder="friend@example.com" value={emailAddr} onChange={(e) => setEmailAddr(e.target.value)} />
            <div className="flex justify-end gap-2.5">
              <button onClick={() => setShowEmailModal(false)} className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 font-medium text-xs hover:bg-gray-200 dark:hover:bg-white/10 transition-all">Cancel</button>
              <button onClick={handleEmailPDF} disabled={sendingEmail} className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium text-xs hover:shadow-lg hover:shadow-blue-500/20 transition-all disabled:opacity-50">
                <FiSend size={13} className="inline mr-1" />{sendingEmail ? 'Sending...' : 'Send Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}