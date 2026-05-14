import { useTheme } from '../context/ThemeContext';
import { FiSun, FiMoon } from 'react-icons/fi';

export default function AuthLayout({ children }) {
  const { dark, toggleDark } = useTheme();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleDark}
          className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          {dark ? <FiSun size={20} /> : <FiMoon size={20} />}
        </button>
      </div>
      {children}
    </div>
  );
}