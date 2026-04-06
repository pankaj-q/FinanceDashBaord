import { Bell, Search, User } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { motion } from 'framer-motion';

export function Header() {
  const { user } = useAuthStore();

  const roleColors = {
    ADMIN: 'bg-purple-100 text-purple-700',
    ANALYST: 'bg-blue-100 text-blue-700',
    VIEWER: 'bg-gray-100 text-gray-700',
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search records, categories..."
              className="pl-10 pr-4 py-2 w-80 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </motion.button>

          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <User className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{user?.name}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full ${roleColors[user?.role || 'VIEWER']}`}>
                {user?.role}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
