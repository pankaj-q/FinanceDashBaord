import { motion } from 'framer-motion';
import { User, Bell, Shield, Save } from 'lucide-react';
import { Button, Card, CardTitle, Input } from '../components/ui';
import { useAuthStore } from '../store/auth.store';

export function SettingsPage() {
  const { user } = useAuthStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-4xl"
    >
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account preferences</p>
      </div>

      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-primary-50">
            <User className="w-5 h-5 text-primary-600" />
          </div>
          <CardTitle>Profile Information</CardTitle>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Full Name" value={user?.name || ''} disabled />
            <Input label="Email" type="email" value={user?.email || ''} disabled />
          </div>
          <p className="text-sm text-gray-500">
            Contact an administrator to update your profile information.
          </p>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-purple-50">
            <Shield className="w-5 h-5 text-purple-600" />
          </div>
          <CardTitle>Role & Permissions</CardTitle>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="font-medium text-gray-900">Current Role</p>
              <p className="text-sm text-gray-500">Your access level in the system</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              user?.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
              user?.role === 'ANALYST' ? 'bg-blue-100 text-blue-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {user?.role}
            </span>
          </div>

          <div className="space-y-2">
            <p className="font-medium text-gray-900">Permissions</p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                View dashboard and summary data
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                View financial records
              </li>
              {(user?.role === 'ANALYST' || user?.role === 'ADMIN') && (
                <>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    Create and edit own records
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    View analytics and trends
                  </li>
                </>
              )}
              {user?.role === 'ADMIN' && (
                <>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    Edit any record
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    Manage users
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    Full administrative access
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-yellow-50">
            <Bell className="w-5 h-5 text-yellow-600" />
          </div>
          <CardTitle>Notifications</CardTitle>
        </div>
        
        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer">
            <div>
              <p className="font-medium text-gray-900">Email Notifications</p>
              <p className="text-sm text-gray-500">Receive updates about your account</p>
            </div>
            <input type="checkbox" className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500" />
          </label>

          <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer">
            <div>
              <p className="font-medium text-gray-900">Security Alerts</p>
              <p className="text-sm text-gray-500">Get notified about security events</p>
            </div>
            <input type="checkbox" className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500" defaultChecked />
          </label>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button leftIcon={<Save className="w-4 h-4" />}>
          Save Changes
        </Button>
      </div>
    </motion.div>
  );
}
