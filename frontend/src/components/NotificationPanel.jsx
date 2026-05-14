import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell, FiX, FiCheck, FiArrowUp, FiArrowDown, FiClock, FiUserPlus, FiCheckCircle, FiInbox } from 'react-icons/fi';

const typeConfig = {
  CREDIT_GIVEN: { icon: FiArrowUp, bg: 'bg-red-50 dark:bg-red-900/20', color: 'text-red-500', border: 'border-red-100 dark:border-red-800' },
  PAYMENT_RECEIVED: { icon: FiArrowDown, bg: 'bg-green-50 dark:bg-green-900/20', color: 'text-green-500', border: 'border-green-100 dark:border-green-800' },
  REMINDER: { icon: FiClock, bg: 'bg-blue-50 dark:bg-blue-900/20', color: 'text-blue-500', border: 'border-blue-100 dark:border-blue-800' },
  FRIEND_REQUEST: { icon: FiUserPlus, bg: 'bg-purple-50 dark:bg-purple-900/20', color: 'text-purple-500', border: 'border-purple-100 dark:border-purple-800' },
};

function EmptyNotifications() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8">
      <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700/40 rounded-full flex items-center justify-center mb-5">
        <FiInbox size={28} className="text-gray-300 dark:text-gray-600" />
      </div>
      <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">All caught up!</p>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 text-center max-w-[200px] leading-relaxed">
        No notifications yet. We'll notify you when something arrives.
      </p>
    </div>
  );
}

function NotificationItem({ item }) {
  const config = typeConfig[item.type] || typeConfig.CREDIT_GIVEN;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative flex items-start gap-3.5 px-5 py-4 hover:bg-gray-50/80 dark:hover:bg-gray-700/20 transition-all duration-200 cursor-pointer border-b border-gray-50 dark:border-gray-700/30 last:border-0"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${config.bg} ${config.color} group-hover:scale-110 transition-transform duration-200`}>
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-snug">{item.title}</p>
        {item.message && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">{item.message}</p>
        )}
        <div className="flex items-center gap-2 mt-2">
          <FiClock size={10} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
          <span className="text-[11px] text-gray-400 dark:text-gray-500">
            {new Date(item.createdAt).toLocaleString('en-IN', {
              day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
            })}
          </span>
        </div>
      </div>
      {!item.isRead && (
        <span className="absolute right-5 top-5 w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 ring-2 ring-white dark:ring-gray-800" />
      )}
    </motion.div>
  );
}

export default function NotificationPanel({ isOpen, onClose, notifications, unreadCount, onMarkAllRead, onViewAll }) {
  const panel = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320, mass: 0.8 }}
            className="fixed right-4 md:right-6 top-[4.2rem] w-[calc(100vw-2rem)] sm:w-[400px] max-h-[75vh] bg-white dark:bg-gray-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-gray-100 dark:border-gray-700 z-50 flex flex-col overflow-hidden origin-top-right"
            onClick={(e) => e.stopPropagation()}
          >
            <style>{`
              .notif-scroll::-webkit-scrollbar { width: 4px; }
              .notif-scroll::-webkit-scrollbar-track { background: transparent; }
              .notif-scroll::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 99px; }
              .notif-scroll::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
              .dark .notif-scroll::-webkit-scrollbar-thumb { background: #4b5563; }
              .dark .notif-scroll::-webkit-scrollbar-thumb:hover { background: #6b7280; }
            `}</style>

            {/* Header */}
            <div className="sticky top-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm z-10 px-5 py-3.5 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">Notifications</h2>
                  {unreadCount > 0 && (
                    <span className="inline-flex items-center justify-center min-w-[20px] h-5 bg-primary-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-0.5">
                  {unreadCount > 0 && (
                    <button
                      onClick={onMarkAllRead}
                      className="flex items-center gap-1.5 text-[11px] font-medium text-primary-500 hover:text-primary-600 px-2.5 py-1.5 rounded-lg hover:bg-primary-50/80 dark:hover:bg-primary-900/15 transition-all"
                    >
                      <FiCheckCircle size={13} />
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto notif-scroll">
              {notifications.length === 0 ? (
                <EmptyNotifications />
              ) : (
                <div className="divide-y divide-gray-50 dark:divide-gray-700/20">
                  {notifications.slice(0, 30).map((item) => (
                    <NotificationItem key={item.id} item={item} />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="sticky bottom-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-t border-gray-100 dark:border-gray-700 px-5 py-2.5">
                <button
                  onClick={onViewAll}
                  className="w-full text-center text-xs font-semibold text-primary-500 hover:text-primary-600 py-2.5 rounded-xl hover:bg-primary-50/60 dark:hover:bg-primary-900/10 transition-all tracking-wide"
                >
                  View all notifications
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return isOpen ? createPortal(panel, document.body) : null;
}