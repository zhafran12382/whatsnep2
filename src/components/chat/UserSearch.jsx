import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, MessageCircle } from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';
import Avatar from '../common/Avatar';
import { LoadingSpinner } from '../common/Loading';

const UserSearch = ({ onClose }) => {
  const { searchUsers, startConversation, setCurrentConversation, onlineUsers } = useChat();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      // Use a microtask to avoid sync setState in effect
      queueMicrotask(() => setResults([]));
      return;
    }

    const search = async () => {
      setLoading(true);
      const users = await searchUsers(query);
      setResults(users);
      setLoading(false);
    };

    const timeoutId = setTimeout(search, 300);
    return () => clearTimeout(timeoutId);
  }, [query, searchUsers]);

  const handleSelectUser = async (user) => {
    const conversation = await startConversation(user.id);
    if (conversation) {
      // Fetch the full conversation with user details
      setCurrentConversation({
        ...conversation,
        otherUser: user,
      });
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-20 px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className="w-full max-w-md bg-dark-300 rounded-2xl border border-dark-100 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="p-4 border-b border-dark-100">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search for users..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-3 bg-dark-200 border border-dark-100 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
            <button
              onClick={onClose}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="py-12">
              <LoadingSpinner size="md" />
            </div>
          ) : results.length > 0 ? (
            <div className="p-2">
              {results.map((user, index) => (
                <motion.button
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleSelectUser(user)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-dark-200 rounded-xl transition-colors text-left"
                >
                  <Avatar
                    name={user.display_name}
                    src={user.avatar_url}
                    isOnline={onlineUsers[user.id] || user.is_online}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-white truncate">
                      {user.display_name}
                    </h4>
                    <p className="text-sm text-gray-400 truncate">
                      @{user.username}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-purple-400">
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-sm">Chat</span>
                  </div>
                </motion.button>
              ))}
            </div>
          ) : query.trim() ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-dark-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-gray-500" />
              </div>
              <h4 className="text-gray-300 font-medium mb-2">No users found</h4>
              <p className="text-gray-500 text-sm">
                Try searching with a different username
              </p>
            </div>
          ) : (
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-dark-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-gray-500" />
              </div>
              <h4 className="text-gray-300 font-medium mb-2">Find Users</h4>
              <p className="text-gray-500 text-sm">
                Start typing to search for users
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default UserSearch;
