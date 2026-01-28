import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Lock, User, Bell, Palette, LogOut, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';
import Input from '../common/Input';

const SettingsModal = ({ onClose }) => {
  const { profile, changePassword, signOut, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('account');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    setLoading(true);
    const { error } = await changePassword(newPassword);
    setLoading(false);

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!displayName.trim()) {
      setMessage({ type: 'error', text: 'Display name cannot be empty' });
      return;
    }

    setLoading(true);
    const { error } = await updateProfile({ display_name: displayName.trim() });
    setLoading(false);

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-2xl bg-dark-300 rounded-2xl border border-dark-100 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-100">
          <h2 className="text-xl font-semibold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-dark-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex min-h-[400px]">
          {/* Sidebar */}
          <div className="w-48 border-r border-dark-100 p-4">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'text-gray-400 hover:text-white hover:bg-dark-200'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>

            <div className="mt-6 pt-6 border-t border-dark-100">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm font-medium">Sign Out</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Message */}
            {message.text && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-6 p-4 rounded-xl flex items-center gap-2 ${
                  message.type === 'success'
                    ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                    : 'bg-red-500/10 border border-red-500/20 text-red-400'
                }`}
              >
                {message.type === 'success' ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <AlertCircle className="h-5 w-5" />
                )}
                {message.text}
              </motion.div>
            )}

            {activeTab === 'account' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Account Settings</h3>
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Username
                      </label>
                      <p className="px-4 py-3 bg-dark-400 border border-dark-100 rounded-xl text-gray-400">
                        @{profile?.username}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Username cannot be changed
                      </p>
                    </div>
                    <Input
                      label="Display Name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Your display name"
                    />
                    <Button type="submit" loading={loading}>
                      Save Changes
                    </Button>
                  </form>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Change Password</h3>
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <Input
                      label="New Password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      showPasswordToggle
                    />
                    <Input
                      label="Confirm New Password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      showPasswordToggle
                    />
                    <Button type="submit" loading={loading}>
                      Update Password
                    </Button>
                  </form>
                </div>

                <div className="pt-6 border-t border-dark-100">
                  <h3 className="text-lg font-semibold text-white mb-2">Session Security</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    For your security, you will be automatically logged out when you close this browser tab.
                  </p>
                  <div className="flex items-center gap-3 p-4 bg-dark-400 rounded-xl">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <Check className="h-5 w-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Auto-logout enabled</p>
                      <p className="text-gray-400 text-sm">Sessions expire on tab close</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white mb-4">Notification Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-dark-400 rounded-xl">
                    <div>
                      <p className="text-white font-medium">Push Notifications</p>
                      <p className="text-gray-400 text-sm">Receive browser notifications</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-dark-100 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-dark-400 rounded-xl">
                    <div>
                      <p className="text-white font-medium">Message Sounds</p>
                      <p className="text-gray-400 text-sm">Play sound on new messages</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-dark-100 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white mb-4">Appearance</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-dark-400 rounded-xl">
                    <p className="text-white font-medium mb-3">Theme</p>
                    <div className="grid grid-cols-2 gap-3">
                      <button className="p-4 bg-dark-500 border-2 border-purple-500 rounded-xl text-center">
                        <div className="w-8 h-8 bg-dark-300 rounded-lg mx-auto mb-2" />
                        <span className="text-white text-sm">Dark</span>
                      </button>
                      <button className="p-4 bg-dark-500 border border-dark-100 rounded-xl text-center opacity-50 cursor-not-allowed">
                        <div className="w-8 h-8 bg-gray-200 rounded-lg mx-auto mb-2" />
                        <span className="text-gray-400 text-sm">Light (Soon)</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SettingsModal;
