import { useState } from 'react';
import { X, User, Palette, Bell, Shield, Trash2, Moon, Sun, Globe, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const SettingsModal = ({ isOpen, onClose }) => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    theme: 'dark',
    language: 'en',
    notifications: true,
    soundEnabled: true,
    autoSave: true,
    streamingEnabled: true
  });

  const tabs = [
    { id: 'general', label: 'General', icon: Palette },
    { id: 'account', label: 'Account', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield }
  ];

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear all chat history? This cannot be undone.')) {
      // Clear history logic
      alert('Chat history cleared');
    }
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This cannot be undone.')) {
      signOut();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div 
              className="w-full max-w-2xl max-h-[85vh] bg-[#161b22] border border-[#30363d] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-[#30363d]">
                <h2 className="text-xl font-semibold text-white">Settings</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-[#21262d] rounded-lg text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-1 overflow-hidden">
                {/* Sidebar Tabs */}
                <div className="w-48 border-r border-[#30363d] p-3 hidden sm:block">
                  <nav className="space-y-1">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                            activeTab === tab.id
                              ? 'bg-[#21262d] text-white'
                              : 'text-gray-400 hover:text-white hover:bg-[#21262d]/50'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </nav>
                </div>

                {/* Mobile Tabs */}
                <div className="sm:hidden w-full border-b border-[#30363d] p-2 flex gap-1 overflow-x-auto">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs whitespace-nowrap transition-all ${
                          activeTab === tab.id
                            ? 'bg-[#21262d] text-white'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  {activeTab === 'general' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-medium text-white mb-4">Appearance</h3>
                        <div className="space-y-4">
                          {/* Theme */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {settings.theme === 'dark' ? (
                                <Moon className="w-5 h-5 text-gray-400" />
                              ) : (
                                <Sun className="w-5 h-5 text-amber-400" />
                              )}
                              <div>
                                <p className="text-sm text-white">Theme</p>
                                <p className="text-xs text-gray-500">Choose your preferred theme</p>
                              </div>
                            </div>
                            <select
                              value={settings.theme}
                              onChange={(e) => setSettings(prev => ({ ...prev, theme: e.target.value }))}
                              className="bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                            >
                              <option value="dark">Dark</option>
                              <option value="light">Light</option>
                              <option value="system">System</option>
                            </select>
                          </div>

                          {/* Language */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Globe className="w-5 h-5 text-gray-400" />
                              <div>
                                <p className="text-sm text-white">Language</p>
                                <p className="text-xs text-gray-500">Select your language</p>
                              </div>
                            </div>
                            <select
                              value={settings.language}
                              onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                              className="bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                            >
                              <option value="en">English</option>
                              <option value="es">Spanish</option>
                              <option value="fr">French</option>
                              <option value="de">German</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-[#30363d] pt-6">
                        <h3 className="text-sm font-medium text-white mb-4">Chat Settings</h3>
                        <div className="space-y-4">
                          {/* Sound */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {settings.soundEnabled ? (
                                <Volume2 className="w-5 h-5 text-gray-400" />
                              ) : (
                                <VolumeX className="w-5 h-5 text-gray-400" />
                              )}
                              <div>
                                <p className="text-sm text-white">Sound Effects</p>
                                <p className="text-xs text-gray-500">Play sounds for notifications</p>
                              </div>
                            </div>
                            <ToggleSwitch 
                              enabled={settings.soundEnabled} 
                              onToggle={() => handleToggle('soundEnabled')} 
                            />
                          </div>

                          {/* Streaming */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-5 h-5 flex items-center justify-center text-gray-400">⚡</div>
                              <div>
                                <p className="text-sm text-white">Streaming Responses</p>
                                <p className="text-xs text-gray-500">Show responses as they're generated</p>
                              </div>
                            </div>
                            <ToggleSwitch 
                              enabled={settings.streamingEnabled} 
                              onToggle={() => handleToggle('streamingEnabled')} 
                            />
                          </div>

                          {/* Auto-save */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-5 h-5 flex items-center justify-center text-gray-400">💾</div>
                              <div>
                                <p className="text-sm text-white">Auto-save Conversations</p>
                                <p className="text-xs text-gray-500">Automatically save all conversations</p>
                              </div>
                            </div>
                            <ToggleSwitch 
                              enabled={settings.autoSave} 
                              onToggle={() => handleToggle('autoSave')} 
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'account' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-medium text-white mb-4">Profile</h3>
                        <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-4">
                          <div className="flex items-center gap-4">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl ${
                              user ? 'bg-gradient-to-br from-emerald-500 to-cyan-500' : 'bg-gradient-to-br from-gray-500 to-gray-600'
                            }`}>
                              {user ? user.name?.charAt(0).toUpperCase() || 'U' : 'G'}
                            </div>
                            <div>
                              <p className="text-white font-medium">{user ? user.name || user.email : 'Guest User'}</p>
                              <p className="text-sm text-gray-400">{user ? user.email : 'Not signed in'}</p>
                              <p className="text-xs text-emerald-400 mt-1">
                                {user ? 'Pro Account' : 'Free Trial'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {user && (
                        <>
                          <div className="border-t border-[#30363d] pt-6">
                            <h3 className="text-sm font-medium text-white mb-4">Data</h3>
                            <button
                              onClick={handleClearHistory}
                              className="flex items-center gap-2 px-4 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-lg text-gray-300 hover:text-white hover:border-amber-500/50 transition-all text-sm"
                            >
                              <Trash2 className="w-4 h-4" />
                              Clear Chat History
                            </button>
                          </div>

                          <div className="border-t border-[#30363d] pt-6">
                            <h3 className="text-sm font-medium text-red-400 mb-4">Danger Zone</h3>
                            <button
                              onClick={handleDeleteAccount}
                              className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/20 transition-all text-sm"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete Account
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {activeTab === 'notifications' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-medium text-white mb-4">Notification Preferences</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-white">Push Notifications</p>
                              <p className="text-xs text-gray-500">Get notified about updates</p>
                            </div>
                            <ToggleSwitch 
                              enabled={settings.notifications} 
                              onToggle={() => handleToggle('notifications')} 
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'privacy' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-medium text-white mb-4">Privacy Settings</h3>
                        <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-4">
                          <p className="text-sm text-gray-300 leading-relaxed">
                            Your conversations are stored locally and on our secure servers. 
                            We never share your data with third parties without your consent.
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-[#30363d] pt-6">
                        <h3 className="text-sm font-medium text-white mb-4">Data Export</h3>
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-lg text-gray-300 hover:text-white hover:border-emerald-500/50 transition-all text-sm">
                          Export My Data
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Toggle Switch Component
const ToggleSwitch = ({ enabled, onToggle }) => (
  <button
    onClick={onToggle}
    className={`relative w-11 h-6 rounded-full transition-colors ${
      enabled ? 'bg-emerald-600' : 'bg-[#30363d]'
    }`}
  >
    <div
      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
        enabled ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);

export default SettingsModal;

