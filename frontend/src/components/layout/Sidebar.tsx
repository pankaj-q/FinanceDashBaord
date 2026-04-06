import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Receipt, 
  BarChart3, 
  Users, 
  Settings,
  LogOut
} from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['VIEWER', 'ANALYST', 'ADMIN'] },
  { name: 'Records', href: '/records', icon: Receipt, roles: ['VIEWER', 'ANALYST', 'ADMIN'] },
  { name: 'Analytics', href: '/analytics', icon: BarChart3, roles: ['ANALYST', 'ADMIN'] },
  { name: 'Users', href: '/users', icon: Users, roles: ['ADMIN'] },
];

export function Sidebar() {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  const filteredNav = navigation.filter(item => 
    user && item.roles.includes(user.role)
  );

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-100 flex flex-col">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
            <span className="text-white font-bold text-lg">F</span>
          </div>
          <div>
            <h1 className="font-bold text-gray-900">FinanceDash</h1>
            <p className="text-xs text-gray-500">{user?.role}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {filteredNav.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={clsx(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50'
              )}
            >
              <item.icon className={clsx('w-5 h-5', isActive ? 'text-primary-600' : '')} />
              <span className="font-medium">{item.name}</span>
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute left-0 w-1 h-8 bg-primary-600 rounded-r-full"
                />
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <NavLink
          to="/settings"
          className={clsx(
            'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
            location.pathname === '/settings'
              ? 'bg-primary-50 text-primary-700'
              : 'text-gray-600 hover:bg-gray-50'
          )}
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </NavLink>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-all duration-200 mt-2"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
