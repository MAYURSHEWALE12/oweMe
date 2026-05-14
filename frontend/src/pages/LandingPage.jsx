import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { FiMenu, FiX, FiArrowRight, FiStar, FiCheck, FiArrowUp, FiArrowDown, FiPlus, FiUsers, FiBell, FiRefreshCw, FiTrendingUp, FiClock, FiShield, FiSmartphone, FiDollarSign, FiRepeat, FiSend, FiChevronRight, FiTwitter, FiGithub, FiLinkedin, FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';
import { LogoIcon } from '../components/Logo';

const fadeUp = { initial: { opacity: 0, y: 40 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-50px' }, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } };
const stagger = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5, staggerChildren: 0.1 } };
const scaleIn = { initial: { opacity: 0, scale: 0.9 }, whileInView: { opacity: 1, scale: 1 }, viewport: { once: true }, transition: { duration: 0.6, ease: 'easeOut' } };

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { dark, toggleDark } = useTheme();
  useEffect(() => { const onScroll = () => setScrolled(window.scrollY > 40); window.addEventListener('scroll', onScroll, { passive: true }); return () => window.removeEventListener('scroll', onScroll); }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/5' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <div className="flex items-center gap-2.5">
            <LogoIcon size={36} />
            <span className="font-bold text-xl text-gray-900 dark:text-white">OweMe</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {['Features', 'How It Works', 'Testimonials', 'FAQ'].map(item => (
              <a key={item} href={`#${item.toLowerCase().replace(/\s/g, '-')}`} className="text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-300">{item}</a>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-2">
            <button onClick={toggleDark} className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-all">
              {dark ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>
            <Link to="/login" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-4 py-2 transition-colors">Sign In</Link>
            <Link to="/register" className="text-sm font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white px-5 py-2.5 rounded-2xl hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300">Get Started Free</Link>
          </div>
          <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"><FiMenu size={24} /></button>
        </div>
      </div>
      <AnimatePresence>{open && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="md:hidden bg-white/80 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-100 dark:border-white/5 overflow-hidden">
          <div className="px-4 py-4 space-y-3">{[['Features'], ['How It Works'], ['Testimonials'], ['FAQ']].map(([item]) => (
            <a key={item} href={`#${item.toLowerCase().replace(/\s/g, '-')}`} onClick={() => setOpen(false)} className="block text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white py-2">{item}</a>
          ))}
            <div className="flex items-center gap-2 px-2 py-1">
              <button onClick={toggleDark} className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-all">{dark ? <FiSun size={18} /> : <FiMoon size={18} />}</button>
            </div>
            <div className="pt-2 flex gap-3"><Link to="/login" className="flex-1 text-center text-sm font-medium border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 py-2.5 rounded-2xl">Sign In</Link><Link to="/register" className="flex-1 text-center text-sm font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2.5 rounded-2xl">Get Started</Link></div>
          </div>
        </motion.div>
      )}</AnimatePresence>
    </nav>
  );
}

function FloatingCards() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <div className="relative w-full h-[500px] md:h-[600px]">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-cyan-500/5 rounded-3xl" />
      {[...Array(3)].map((_, i) => (
        <div key={i} className="absolute w-full h-full opacity-10 md:opacity-20">
          <div className={`absolute w-72 h-72 rounded-full blur-2xl md:blur-3xl ${i === 0 ? 'bg-blue-500 top-10 -left-20' : i === 1 ? 'bg-purple-500 bottom-10 -right-20' : 'bg-cyan-500 top-1/2 left-1/3'}`} />
        </div>
      ))}

      <motion.div animate={isMobile ? {} : { y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} className="absolute top-8 left-4 right-4 bg-white shadow-xl dark:bg-white/5 dark:shadow-none backdrop-blur-xl rounded-2xl border border-gray-100 dark:border-white/10 p-4 transform-gpu">
        <div className="flex items-center justify-between mb-3"><span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Recent Activity</span><span className="text-[10px] text-gray-400 dark:text-gray-500">Today</span></div>
        {[{ name: 'Priya', amt: '+₹500', color: 'text-green-400', bg: 'bg-green-500/10' }, { name: 'Rahul', amt: '-₹200', color: 'text-red-400', bg: 'bg-red-500/10' }, { name: 'Amit', amt: '₹0', color: 'text-gray-400', bg: 'bg-gray-500/10' }].map(({ name, amt, color, bg }) => (
          <div key={name} className="flex items-center gap-3 py-2.5 border-b border-gray-100 dark:border-white/5 last:border-0">
            <div className={`w-8 h-8 rounded-full ${bg} flex items-center justify-center text-xs font-bold ${color}`}>{name.charAt(0)}</div>
            <div className="flex-1"><p className="text-sm font-medium text-gray-900 dark:text-white">{name}</p><p className="text-[10px] text-gray-400 dark:text-gray-500">Dinner split</p></div>
            <span className={`text-sm font-bold ${color}`}>{amt}</span>
          </div>
        ))}
      </motion.div>

      <motion.div animate={isMobile ? {} : { y: [0, 8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }} className="absolute bottom-8 left-4 right-4 bg-white shadow-xl dark:bg-white/5 dark:shadow-none backdrop-blur-xl rounded-2xl border border-gray-100 dark:border-white/10 p-4 transform-gpu">
        <div className="flex items-center justify-between mb-3"><span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Split Summary</span><span className="text-[10px] text-gray-400 dark:text-gray-500">Trip to Goa</span></div>
        <div className="space-y-2">{['You paid ₹2,400', 'Rahul owes ₹800', 'Priya owes ₹1,200', 'Neha owes ₹400'].map((t, i) => (
          <div key={i} className="flex items-center gap-2 text-xs"><div className="w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center"><FiCheck size={10} className="text-blue-400" /></div><span className="text-gray-600 dark:text-gray-300">{t}</span></div>
        ))}</div>
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-white/5 flex justify-between"><span className="text-xs text-gray-400 dark:text-gray-500">You'll get back</span><span className="text-sm font-bold text-green-600 dark:text-green-400">₹2,400</span></div>
      </motion.div>

      <motion.div animate={isMobile ? {} : { scale: [1, 1.05, 1], opacity: [0.6, 1, 0.6] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} className="absolute top-1/3 -right-3 w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-xl shadow-green-500/20"><FiArrowDown size={24} className="text-white" /></motion.div>
      <motion.div animate={isMobile ? {} : { scale: [1, 1.05, 1], opacity: [0.6, 1, 0.6] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }} className="absolute bottom-1/3 -left-3 w-16 h-16 rounded-2xl bg-gradient-to-br from-red-400 to-rose-600 flex items-center justify-center shadow-xl shadow-red-500/20"><FiArrowUp size={24} className="text-white" /></motion.div>
    </div>
  );
}

function Hero() {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);
  const y = useTransform(scrollY, [0, 400], [0, 100]);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
      <div className="absolute inset-0 bg-gray-50 dark:bg-gray-950" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/10 via-gray-50 dark:via-gray-950 to-gray-50 dark:to-gray-950" />
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div className="absolute top-1/4 left-1/4 w-72 h-72 md:w-96 md:h-96 bg-blue-500/20 rounded-full blur-2xl md:blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 md:w-96 md:h-96 bg-purple-500/20 rounded-full blur-2xl md:blur-[120px]" />

      <motion.div style={{ opacity, y }} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
            <div className="inline-flex items-center gap-2 bg-black/5 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 text-blue-600 dark:text-blue-300 text-xs font-medium px-4 py-1.5 rounded-full mb-6">
              <FiStar size={12} className="text-yellow-400" /> Trusted by 50,000+ users
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white leading-[1.05] tracking-tight">
              Money Between<br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 text-transparent bg-clip-text">Friends,</span><br />
              Made Effortless.
            </h1>
            <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 mt-6 max-w-lg leading-relaxed">
              Track loans, split expenses, and settle dues with friends. No more forgotten IOUs — your digital financial companion.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link to="/register" className="group inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold px-7 py-3.5 rounded-2xl hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 text-sm">
                Start Tracking Free <FiArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="#how-it-works" className="inline-flex items-center gap-2 bg-black/5 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 font-medium px-7 py-3.5 rounded-2xl hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-300 text-sm">
                <FiSmartphone size={18} /> See How It Works
              </a>
            </div>
            <div className="flex flex-wrap items-center gap-6 mt-8 text-sm">
              <div className="flex -space-x-2">{['#3b82f6','#8b5cf6','#06b6d4','#10b981'].map((color, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-900" style={{ background: `linear-gradient(135deg, ${color}, ${color}88)` }} />
              ))}</div>
              <span className="text-gray-600 dark:text-gray-500"><strong className="text-gray-900 dark:text-white">10K+</strong> active users</span>
              <span className="text-gray-600 dark:text-gray-500"><strong className="text-gray-900 dark:text-white">4.8★</strong> rating</span>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="relative">
            <FloatingCards />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

function Stats() {
  return (
    <section className="relative py-20 px-4 border-t border-gray-100 dark:border-white/5">
      <div className="max-w-7xl mx-auto">
        <motion.div {...stagger} className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: '50K+', label: 'Active Users', icon: FiUsers },
            { value: '₹10Cr+', label: 'Money Tracked', icon: FiTrendingUp },
            { value: '99.9%', label: 'Uptime', icon: FiClock },
            { value: '4.8★', label: 'App Rating', icon: FiStar },
          ].map(({ value, label, icon: Icon }) => (
            <motion.div key={label} {...stagger} className="bg-white shadow-sm dark:bg-white/5 dark:shadow-none backdrop-blur-sm border border-gray-100 dark:border-white/10 rounded-2xl p-6 text-center hover:bg-gray-50 dark:hover:bg-white/10 transition-all duration-300">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-500/20 dark:to-purple-500/20 mb-4"><Icon size={22} className="text-blue-500 dark:text-blue-400" /></div>
              <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
              <p className="text-sm text-gray-600 dark:text-gray-500 mt-1">{label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    { icon: FiRepeat, title: 'Split Expenses', desc: 'Divide bills, trip costs, and shared expenses instantly. No more awkward calculations.' },
    { icon: FiBell, title: 'Smart Reminders', desc: 'Automatic reminders for pending dues. Never chase friends for money again.' },
    { icon: FiDollarSign, title: 'Track Loans', desc: 'Record who owes whom with one tap. Real-time balance updates for every transaction.' },
    { icon: FiUsers, title: 'Group Settlements', desc: 'Handle group expenses, roommates, and trip splits. Settle up with everyone at once.' },
    { icon: FiRefreshCw, title: 'Payment History', desc: 'Complete chat-style history with every friend. Edit or delete anytime.' },
    { icon: FiShield, title: 'Secure & Private', desc: 'Your financial data is encrypted. Only you see your transactions.' },
  ];

  return (
    <section id="features" className="relative py-24 md:py-32 px-4">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900/50 dark:to-gray-950" />
      <div className="max-w-7xl mx-auto relative">
        <motion.div {...fadeUp} className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-blue-500 dark:text-blue-400 font-semibold text-sm tracking-widest uppercase">Features</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mt-4 leading-tight">Everything you need<br />to manage money with friends</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-4 text-lg">No more spreadsheets, notes apps, or forgotten IOUs.</p>
        </motion.div>
        <motion.div {...stagger} className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <motion.div key={title} {...stagger} className="group relative bg-white shadow-sm dark:bg-white/[0.03] dark:shadow-none backdrop-blur-sm border border-gray-100 dark:border-white/[0.06] rounded-2xl p-6 hover:bg-gray-50 dark:hover:bg-white/[0.06] hover:border-gray-300 dark:hover:border-white/[0.12] transition-all duration-500">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-500/10 dark:to-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"><Icon size={22} className="text-blue-500 dark:text-blue-400" /></div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { num: '01', title: 'Add Friends', desc: 'Add friends by phone or email. If they\'re on OweMe, they\'ll see their transactions too.' },
    { num: '02', title: 'Track Transactions', desc: 'Record who paid for what. Tap "Given" or "Taken" — the balance updates instantly.' },
    { num: '03', title: 'Settle Easily', desc: 'See who owes whom at a glance. Settle up with cash, UPI, or any payment method.' },
  ];

  return (
    <section id="how-it-works" className="relative py-24 md:py-32 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div {...fadeUp} className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-blue-500 dark:text-blue-400 font-semibold text-sm tracking-widest uppercase">How It Works</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mt-4 leading-tight">Three simple steps</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-4 text-lg">Get started in under 30 seconds.</p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-px bg-gradient-to-r from-blue-500/0 via-blue-500/40 to-purple-500/0" />
          {steps.map(({ num, title, desc }, i) => (
            <motion.div key={num} {...fadeUp} transition={{ duration: 0.5, delay: i * 0.2 }} className="text-center relative">
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white shadow-xl shadow-blue-500/20 relative z-10">{num}</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs mx-auto">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const testimonials = [
    { name: 'Priya Sharma', role: 'College Student', text: 'My roommates and I use OweMe for all shared expenses. No more awkward "you owe me" conversations.', rating: 5, color: 'from-blue-400 to-cyan-500' },
    { name: 'Rahul Verma', role: 'Freelancer', text: 'I track all client payments and friend loans in one place. The chat view is brilliant.', rating: 5, color: 'from-purple-400 to-pink-500' },
    { name: 'Neha Patel', role: 'Travel Enthusiast', text: 'Trip splits used to be a nightmare. Now everyone can see what they owe in real-time.', rating: 5, color: 'from-green-400 to-emerald-500' },
  ];

  return (
    <section id="testimonials" className="relative py-24 md:py-32 px-4">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-white/80 to-gray-50 dark:from-gray-950 dark:via-gray-900/30 dark:to-gray-950" />
      <div className="max-w-7xl mx-auto relative">
        <motion.div {...fadeUp} className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-blue-500 dark:text-blue-400 font-semibold text-sm tracking-widest uppercase">Testimonials</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mt-4 leading-tight">Loved by thousands</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-4 text-lg">See what our users say about OweMe.</p>
        </motion.div>
        <motion.div {...stagger} className="grid md:grid-cols-3 gap-5">
          {testimonials.map(({ name, role, text, rating, color }) => (
            <motion.div key={name} {...stagger} className="bg-white shadow-sm dark:bg-white/[0.03] dark:shadow-none backdrop-blur-sm border border-gray-100 dark:border-white/[0.06] rounded-2xl p-6 hover:bg-gray-50 dark:hover:bg-white/[0.06] transition-all duration-500">
              <div className="flex gap-0.5 mb-4">{[...Array(rating)].map((_, i) => <FiStar key={i} size={16} className="fill-yellow-400 text-yellow-400" />)}</div>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-5">"{text}"</p>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-sm font-bold text-white`}>{name.charAt(0)}</div>
                <div><p className="font-semibold text-sm text-gray-900 dark:text-white">{name}</p><p className="text-xs text-gray-600 dark:text-gray-500">{role}</p></div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function FAQ() {
  const [openIdx, setOpenIdx] = useState(null);
  const faqs = [
    { q: 'Is OweMe really free?', a: 'Yes! OweMe is completely free for personal use. No hidden charges or subscriptions.' },
    { q: 'Can my friends see their transactions?', a: 'Yes! When you add a friend by email, they can register and see their own statement. Both parties stay informed.' },
    { q: 'Is my data safe?', a: 'Absolutely. We use encryption and secure authentication. Your financial data is private.' },
    { q: 'Can I export my data?', a: 'Yes. Download Excel reports and individual statements anytime.' },
    { q: 'What if I make a mistake?', a: 'Edit or delete any transaction. The balance recalculates automatically.' },
  ];

  return (
    <section id="faq" className="relative py-24 md:py-32 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div {...fadeUp} className="text-center mb-16">
          <span className="text-blue-500 dark:text-blue-400 font-semibold text-sm tracking-widest uppercase">FAQ</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mt-4">Frequently asked questions</h2>
        </motion.div>
        <div className="space-y-3">
          {faqs.map(({ q, a }, i) => (
            <motion.div key={i} {...fadeUp} transition={{ duration: 0.3, delay: i * 0.05 }} className="bg-white shadow-sm dark:bg-white/[0.03] dark:shadow-none backdrop-blur-sm border border-gray-100 dark:border-white/[0.06] rounded-2xl overflow-hidden hover:bg-gray-50 dark:hover:bg-white/[0.06] transition-all">
              <button onClick={() => setOpenIdx(openIdx === i ? null : i)} className="w-full flex items-center justify-between px-5 py-4 text-left">
                <span className="font-semibold text-sm text-gray-900 dark:text-white">{q}</span>
                <FiChevronRight size={16} className={`text-gray-400 dark:text-gray-500 transition-transform duration-300 ${openIdx === i ? 'rotate-90' : ''}`} />
              </button>
              <AnimatePresence>{openIdx === i && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <p className="px-5 pb-4 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{a}</p>
                </motion.div>
              )}</AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="relative py-24 md:py-32 px-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 via-white to-purple-100/50 dark:from-blue-600/20 dark:via-gray-950 dark:to-purple-600/20" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-blue-500/10 rounded-full blur-3xl md:blur-[150px]" />
      <motion.div {...fadeUp} className="max-w-2xl mx-auto text-center relative">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight">Start tracking money<br />with friends today</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-4 text-lg">Join 50,000+ users who never forget an IOU.</p>
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          <Link to="/register" className="group inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold px-7 py-3.5 rounded-2xl hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 text-sm">
            Get Started Free <FiArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-4">No credit card required • Free forever</p>
      </motion.div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-gray-100 dark:border-white/5 px-4 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4"><LogoIcon size={32} /><span className="font-bold text-gray-900 dark:text-white text-lg">OweMe</span></div>
            <p className="text-sm text-gray-600 dark:text-gray-500 leading-relaxed">Track loans, split expenses, and manage debts with friends.</p>
          </div>
          {[
            { title: 'Product', links: ['Features', 'How It Works', 'FAQ', 'Pricing'] },
            { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
            { title: 'Legal', links: ['Privacy', 'Terms', 'Security', 'Cookies'] },
          ].map(({ title, links }) => (
            <div key={title}><h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm">{title}</h4><ul className="space-y-2">{links.map(l => <li key={l}><a href="#" className="text-sm text-gray-600 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">{l}</a></li>)}</ul></div>
          ))}
        </div>
        <div className="border-t border-gray-100 dark:border-white/5 mt-10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">© 2026 OweMe. All rights reserved.</p>
          <div className="flex items-center gap-4">{['github','twitter','linkedin'].map(s => (
            <a key={s} href="#" className="p-2 text-gray-600 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">{s === 'github' ? <FiGithub size={18} /> : s === 'twitter' ? <FiTwitter size={18} /> : <FiLinkedin size={18} />}</a>
          ))}</div>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="bg-white dark:bg-gray-950 text-gray-900 dark:text-white antialiased font-sans overflow-x-hidden">
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <HowItWorks />
      <Testimonials />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}