import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Menu, MoreVertical, Phone, Video, Smile } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatContext';
import Avatar from '../common/Avatar';
import { TypingIndicator } from '../common/Loading';

const MessageBubble = ({ message, isOwn, showAvatar }) => {
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}
    >
      {showAvatar && !isOwn ? (
        <Avatar
          name={message.sender?.display_name}
          src={message.sender?.avatar_url}
          size="sm"
          showStatus={false}
        />
      ) : (
        <div className="w-8" />
      )}
      <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
        <div
          className={`
            px-4 py-2.5 rounded-2xl
            ${isOwn 
              ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-br-md' 
              : 'bg-dark-200 text-white rounded-bl-md'
            }
          `}
        >
          <p className="text-sm leading-relaxed break-words">{message.content}</p>
        </div>
        <div className={`flex items-center gap-1 mt-1 px-2 ${isOwn ? 'justify-end' : ''}`}>
          <span className="text-xs text-gray-500">
            {formatTime(message.created_at)}
          </span>
          {isOwn && message.is_read && (
            <span className="text-xs text-cyan-400">✓✓</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const ChatArea = ({ onMenuClick }) => {
  const { user } = useAuth();
  const { 
    currentConversation, 
    messages, 
    sendMessage, 
    setTyping,
    typingUsers,
    onlineUsers,
  } = useChat();
  
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const otherUser = currentConversation?.otherUser;
  const isTyping = typingUsers[currentConversation?.id];
  const isOnline = onlineUsers[otherUser?.id] || otherUser?.is_online;

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on conversation change
  useEffect(() => {
    inputRef.current?.focus();
  }, [currentConversation?.id]);

  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    const convId = currentConversation?.id;
    if (!convId) return;

    // Set typing indicator
    setTyping(convId, true);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing indicator after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(convId, false);
    }, 2000);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentConversation?.id || sending) return;

    setSending(true);
    setTyping(currentConversation.id, false);
    
    const content = newMessage;
    setNewMessage('');
    
    await sendMessage(content, currentConversation.id);
    setSending(false);
    inputRef.current?.focus();
  };

  // No conversation selected
  if (!currentConversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-dark-400 p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative w-32 h-32 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-full animate-pulse" />
            <div className="relative w-full h-full bg-dark-300 rounded-full flex items-center justify-center">
              <svg
                className="w-16 h-16 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">WhatsNep</h2>
          <p className="text-gray-400 max-w-sm">
            Select a conversation or start a new chat to begin messaging
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-dark-400 min-w-0">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-dark-300 border-b border-dark-100">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-dark-200 transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Avatar
            name={otherUser?.display_name}
            src={otherUser?.avatar_url}
            isOnline={isOnline}
            size="md"
          />
          <div>
            <h3 className="font-semibold text-white">{otherUser?.display_name}</h3>
            <p className="text-xs text-gray-400">
              {isTyping 
                ? 'typing...' 
                : isOnline 
                  ? 'Online' 
                  : 'Offline'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-dark-200 transition-colors">
            <Phone className="h-5 w-5" />
          </button>
          <button className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-dark-200 transition-colors">
            <Video className="h-5 w-5" />
          </button>
          <button className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-dark-200 transition-colors">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence initial={false}>
          {messages.map((message, index) => {
            const isOwn = message.sender_id === user?.id;
            const prevMessage = messages[index - 1];
            const showAvatar = !prevMessage || prevMessage.sender_id !== message.sender_id;
            
            return (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={isOwn}
                showAvatar={showAvatar}
              />
            );
          })}
        </AnimatePresence>

        {/* Typing Indicator */}
        <AnimatePresence>
          {isTyping && (
            <TypingIndicator username={otherUser?.display_name} />
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSend} className="p-4 bg-dark-300 border-t border-dark-100">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-dark-200 transition-colors"
          >
            <Smile className="h-5 w-5" />
          </button>
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={handleTyping}
              placeholder="Type a message..."
              className="w-full px-4 py-3 bg-dark-200 border border-dark-100 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
          <motion.button
            type="submit"
            disabled={!newMessage.trim() || sending}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
              p-3 rounded-xl transition-all
              ${newMessage.trim() 
                ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-lg shadow-purple-500/25' 
                : 'bg-dark-200 text-gray-500'
              }
            `}
          >
            <Send className="h-5 w-5" />
          </motion.button>
        </div>
      </form>
    </div>
  );
};

export default ChatArea;
