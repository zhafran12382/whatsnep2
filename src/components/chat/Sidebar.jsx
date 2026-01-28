import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, MessageCircle, Settings, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatContext';
import Avatar from '../common/Avatar';
import UserSearch from './UserSearch';

const Sidebar = ({ isMobileOpen, onMobileClose, onOpenSettings }) => {
  const { profile, signOut } = useAuth();
  const { 
    conversations, 
    currentConversation, 
    setCurrentConversation, 
    onlineUsers,
    unreadCounts,
    typingUsers,
  } = useChat();
  
  const [showSearch, setShowSearch] = useState(false);
  const [filter, setFilter] = useState('');

  const handleSignOut = async () => {
    await signOut();
  };

  const handleSelectConversation = (conv) => {
    setCurrentConversation(conv);
    onMobileClose?.();
  };

  const filteredConversations = conversations.filter(conv => 
    conv.otherUser?.username?.toLowerCase().includes(filter.toLowerCase()) ||
    conv.otherUser?.display_name?.toLowerCase().includes(filter.toLowerCase())
  );

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onMobileClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        className={`
          fixed lg:relative inset-y-0 left-0 z-50
          w-80 bg-dark-300 border-r border-dark-100
          flex flex-col
          transition-transform duration-300 lg:transform-none
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="p-4 border-b border-dark-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar
                name={profile?.display_name}
                src={profile?.avatar_url}
                isOnline={true}
                size="md"
              />
              <div>
                <h3 className="font-semibold text-white">{profile?.display_name}</h3>
                <p className="text-xs text-gray-400">@{profile?.username}</p>
              </div>
            </div>
            <button
              onClick={onMobileClose}
              className="lg:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-dark-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-dark-200 border border-dark-100 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowSearch(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl text-white font-medium transition-all hover:shadow-lg hover:shadow-purple-500/25"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </motion.button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence>
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conv, index) => (
                <motion.button
                  key={conv.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleSelectConversation(conv)}
                  className={`
                    w-full flex items-center gap-3 p-4 text-left
                    hover:bg-dark-200 transition-colors
                    ${currentConversation?.id === conv.id ? 'bg-dark-200 border-r-2 border-purple-500' : ''}
                  `}
                >
                  <Avatar
                    name={conv.otherUser?.display_name}
                    src={conv.otherUser?.avatar_url}
                    isOnline={onlineUsers[conv.otherUser?.id]}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-white truncate">
                        {conv.otherUser?.display_name}
                      </h4>
                      <span className="text-xs text-gray-500">
                        {formatTime(conv.last_message_at)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-400 truncate">
                        {typingUsers[conv.id] 
                          ? 'typing...' 
                          : conv.last_message || 'No messages yet'}
                      </p>
                      {unreadCounts[conv.id] > 0 && (
                        <span className="ml-2 px-2 py-0.5 bg-purple-500 text-white text-xs rounded-full">
                          {unreadCounts[conv.id]}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.button>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="w-16 h-16 bg-dark-200 rounded-full flex items-center justify-center mb-4">
                  <MessageCircle className="h-8 w-8 text-gray-500" />
                </div>
                <h4 className="text-gray-300 font-medium mb-2">No conversations</h4>
                <p className="text-gray-500 text-sm">
                  Start a new chat to begin messaging
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-dark-100">
          <div className="flex items-center justify-between">
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-dark-200 rounded-lg transition-colors"
            >
              <Settings className="h-5 w-5" />
              <span className="text-sm">Settings</span>
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-red-400 hover:bg-dark-200 rounded-lg transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* User Search Modal */}
      <AnimatePresence>
        {showSearch && (
          <UserSearch onClose={() => setShowSearch(false)} />
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
