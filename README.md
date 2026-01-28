# WhatsNep 💬

A modern, secure, and beautiful private messaging web application built with React and Supabase.

![WhatsNep](https://img.shields.io/badge/WhatsNep-Private%20Messaging-purple)

## ✨ Features

### 🔐 Authentication
- Simple signup with just username and password
- Real-time username availability check
- Visual password strength indicator
- Secure session management
- Auto-logout on tab close

### 💬 Chat Features
- Real-time direct messaging
- User search to find and start conversations
- Online/offline status indicators
- Typing indicators
- Message timestamps
- Unread message counts
- Conversation history

### 🎨 Design
- Modern minimalist dark theme
- Beautiful gradient accents (purple to cyan)
- Smooth animations powered by Framer Motion
- Fully responsive (desktop, tablet, mobile)
- Custom scrollbars and micro-interactions

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/zhafran12382/whatsnep2.git
cd whatsnep2
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Update `.env` with your Supabase credentials:
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

5. Set up Supabase database (see Database Setup section below)

6. Start the development server:
```bash
npm run dev
```

### Database Setup

Run these SQL commands in your Supabase SQL Editor:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create conversations table
CREATE TABLE conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participant1_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  participant2_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  last_message TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(participant1_id, participant2_id)
);

-- Create messages table
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Conversations policies
CREATE POLICY "Users can view own conversations" ON conversations
  FOR SELECT USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);

CREATE POLICY "Users can create conversations" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = participant1_id OR auth.uid() = participant2_id);

CREATE POLICY "Users can update own conversations" ON conversations
  FOR UPDATE USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);

-- Messages policies
CREATE POLICY "Users can view messages in their conversations" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND (conversations.participant1_id = auth.uid() OR conversations.participant2_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages to their conversations" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = conversation_id 
      AND (conversations.participant1_id = auth.uid() OR conversations.participant2_id = auth.uid())
    )
  );

CREATE POLICY "Users can update messages in their conversations" ON messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND (conversations.participant1_id = auth.uid() OR conversations.participant2_id = auth.uid())
    )
  );

-- Enable realtime for messages
ALTER publication supabase_realtime ADD TABLE messages;
ALTER publication supabase_realtime ADD TABLE profiles;
```

## 🛠️ Tech Stack

- **Frontend**: React 19 + Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Backend**: Supabase (Auth + Realtime Database)
- **Icons**: Lucide React
- **Routing**: React Router DOM

## 📁 Project Structure

```
src/
├── components/
│   ├── auth/          # Authentication components
│   ├── chat/          # Chat-related components
│   └── common/        # Reusable UI components
├── contexts/          # React contexts
│   ├── AuthContext.jsx
│   └── ChatContext.jsx
├── hooks/             # Custom React hooks
├── lib/               # Utilities and configs
│   └── supabase.js
├── pages/             # Page components
│   ├── LandingPage.jsx
│   ├── AuthPage.jsx
│   └── ChatPage.jsx
└── App.jsx
```

## 📱 Pages

1. **Landing Page** - Animated splash with feature highlights
2. **Auth Page** - Login/Register with smooth transitions
3. **Chat Dashboard** - Sidebar + Chat area + Settings

## 🔒 Security Features

- Password encryption via Supabase Auth
- Row Level Security (RLS) policies
- Session-based authentication
- Auto-logout on tab close
- Input validation

## 📄 License

MIT License - feel free to use this project for learning or personal use.

## 🙏 Acknowledgments

Built with ❤️ using React, Supabase, and Tailwind CSS.
