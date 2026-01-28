import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const ChatContext = createContext({});

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { user, profile } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [onlineUsers, setOnlineUsers] = useState({});
  const [loading, setLoading] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});
  
  const channelRef = useRef(null);
  const typingTimeoutRef = useRef({});

  // Fetch all conversations for current user
  const fetchConversations = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          participant1:profiles!conversations_participant1_id_fkey(id, username, display_name, avatar_url, is_online, last_seen),
          participant2:profiles!conversations_participant2_id_fkey(id, username, display_name, avatar_url, is_online, last_seen)
        `)
        .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      const formattedConversations = (data || []).map(conv => ({
        ...conv,
        otherUser: conv.participant1_id === user.id ? conv.participant2 : conv.participant1,
      }));

      setConversations(formattedConversations);
      
      // Update online status for all participants
      const onlineStatus = {};
      formattedConversations.forEach(conv => {
        if (conv.otherUser) {
          onlineStatus[conv.otherUser.id] = conv.otherUser.is_online;
        }
      });
      setOnlineUsers(onlineStatus);
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Mark messages as read
  const markMessagesAsRead = useCallback(async (conversationId) => {
    if (!user?.id || !conversationId) return;
    
    try {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)
        .eq('is_read', false);

      setUnreadCounts(prev => ({
        ...prev,
        [conversationId]: 0,
      }));
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  }, [user?.id]);

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (conversationId) => {
    if (!conversationId) return;
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(id, username, display_name, avatar_url)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      // Mark messages as read
      await markMessagesAsRead(conversationId);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  }, [markMessagesAsRead]);

  // Send a message
  const sendMessage = async (content, conversationId) => {
    if (!user?.id || !content.trim() || !conversationId) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: content.trim(),
          created_at: new Date().toISOString(),
        })
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(id, username, display_name, avatar_url)
        `)
        .single();

      if (error) throw error;

      // Update conversation's last message
      await supabase
        .from('conversations')
        .update({
          last_message: content.trim(),
          last_message_at: new Date().toISOString(),
        })
        .eq('id', conversationId);

      return { data, error: null };
    } catch (err) {
      console.error('Error sending message:', err);
      return { data: null, error: err };
    }
  };

  // Start a new conversation with a user
  const startConversation = async (otherUserId) => {
    if (!user?.id || !otherUserId) return null;

    try {
      // Check if conversation already exists
      const { data: existing } = await supabase
        .from('conversations')
        .select('*')
        .or(
          `and(participant1_id.eq.${user.id},participant2_id.eq.${otherUserId}),and(participant1_id.eq.${otherUserId},participant2_id.eq.${user.id})`
        )
        .single();

      if (existing) {
        return existing;
      }

      // Create new conversation
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          participant1_id: user.id,
          participant2_id: otherUserId,
          created_at: new Date().toISOString(),
          last_message_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      await fetchConversations();
      return data;
    } catch (err) {
      console.error('Error starting conversation:', err);
      return null;
    }
  };

  // Search for users
  const searchUsers = async (query) => {
    if (!query.trim() || !user?.id) return [];

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, is_online')
        .neq('id', user.id)
        .ilike('username', `%${query.toLowerCase()}%`)
        .limit(10);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error searching users:', err);
      return [];
    }
  };

  // Set typing status
  const setTyping = useCallback((conversationId, isTyping) => {
    if (!user?.id || !conversationId || !channelRef.current) return;

    channelRef.current.send({
      type: 'broadcast',
      event: 'typing',
      payload: {
        user_id: user.id,
        conversation_id: conversationId,
        is_typing: isTyping,
        username: profile?.username,
      },
    });
  }, [user?.id, profile?.username]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user?.id) return;

    // Create channel for real-time updates
    const channel = supabase.channel(`user:${user.id}`)
      .on('broadcast', { event: 'typing' }, (payload) => {
        const { user_id, conversation_id, is_typing, username } = payload.payload;
        
        if (user_id !== user.id) {
          setTypingUsers(prev => ({
            ...prev,
            [conversation_id]: is_typing ? username : null,
          }));

          // Clear typing indicator after 3 seconds
          if (typingTimeoutRef.current[conversation_id]) {
            clearTimeout(typingTimeoutRef.current[conversation_id]);
          }
          if (is_typing) {
            typingTimeoutRef.current[conversation_id] = setTimeout(() => {
              setTypingUsers(prev => ({
                ...prev,
                [conversation_id]: null,
              }));
            }, 3000);
          }
        }
      })
      .subscribe();

    channelRef.current = channel;

    // Subscribe to new messages
    const messagesSubscription = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        async (payload) => {
          const newMessage = payload.new;
          
          // If this message is for the current conversation, fetch with sender info and add it
          if (currentConversation?.id === newMessage.conversation_id) {
            // Fetch sender profile for the new message
            const { data: senderProfile } = await supabase
              .from('profiles')
              .select('id, username, display_name, avatar_url')
              .eq('id', newMessage.sender_id)
              .single();
            
            const messageWithSender = {
              ...newMessage,
              sender: senderProfile,
            };
            
            setMessages(prev => [...prev, messageWithSender]);
            markMessagesAsRead(newMessage.conversation_id);
          } else if (newMessage.sender_id !== user.id) {
            // Increment unread count for other conversations
            setUnreadCounts(prev => ({
              ...prev,
              [newMessage.conversation_id]: (prev[newMessage.conversation_id] || 0) + 1,
            }));
          }
          
          // Refresh conversations to update last message
          fetchConversations();
        }
      )
      .subscribe();

    // Subscribe to online status changes (both online and offline)
    const presenceSubscription = supabase
      .channel('online-users')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
        },
        (payload) => {
          // Update online status for this user
          setOnlineUsers(prev => ({
            ...prev,
            [payload.new.id]: payload.new.is_online,
          }));
        }
      )
      .subscribe();

    // Copy ref value for cleanup
    const timeoutRefValue = typingTimeoutRef.current;

    // Cleanup typing timeouts on unmount
    return () => {
      channel.unsubscribe();
      messagesSubscription.unsubscribe();
      presenceSubscription.unsubscribe();
      // Clear all typing timeouts
      Object.values(timeoutRefValue).forEach(clearTimeout);
    };
  }, [user?.id, currentConversation?.id, fetchConversations, markMessagesAsRead]);

  // Fetch conversations on mount
  useEffect(() => {
    if (user?.id) {
      fetchConversations();
    }
  }, [user?.id, fetchConversations]);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (currentConversation?.id) {
      fetchMessages(currentConversation.id);
    } else {
      setMessages([]);
    }
  }, [currentConversation?.id, fetchMessages]);

  const value = {
    conversations,
    currentConversation,
    setCurrentConversation,
    messages,
    typingUsers,
    onlineUsers,
    loading,
    unreadCounts,
    sendMessage,
    startConversation,
    searchUsers,
    setTyping,
    fetchConversations,
    fetchMessages,
    markMessagesAsRead,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export default ChatProvider;
