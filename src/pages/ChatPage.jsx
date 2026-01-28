import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { ChatProvider } from '../contexts/ChatContext';
import Sidebar from '../components/chat/Sidebar';
import ChatArea from '../components/chat/ChatArea';
import SettingsModal from '../components/chat/SettingsModal';
import { LoadingScreen } from '../components/common/Loading';

const ChatPage = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <LoadingScreen message="Loading your chats..." />;
  }

  if (!user) {
    return null;
  }

  return (
    <ChatProvider>
      <div className="h-screen bg-dark-400 flex overflow-hidden">
        <Sidebar
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={() => setIsMobileSidebarOpen(false)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
        <ChatArea onMenuClick={() => setIsMobileSidebarOpen(true)} />

        {/* Settings Modal */}
        <AnimatePresence>
          {isSettingsOpen && (
            <SettingsModal onClose={() => setIsSettingsOpen(false)} />
          )}
        </AnimatePresence>
      </div>
    </ChatProvider>
  );
};

export default ChatPage;
