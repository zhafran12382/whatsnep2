import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { MessageCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AuthForm from '../components/auth/AuthForm';

const AuthPage = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate('/chat');
    }
  }, [user, loading, navigate]);

  const handleSuccess = () => {
    navigate('/chat');
  };

  return (
    <div className="min-h-screen bg-dark-500 flex flex-col relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 p-6">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </Link>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-cyan-500 rounded-xl flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">WhatsNep</span>
          </motion.div>
        </div>
      </header>

      {/* Auth Form */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-6">
        <AuthForm onSuccess={handleSuccess} />
      </main>

      {/* Footer */}
      <footer className="relative z-10 p-6 text-center">
        <p className="text-gray-500 text-sm">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </footer>
    </div>
  );
};

export default AuthPage;
