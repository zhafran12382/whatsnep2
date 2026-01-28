import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Check, X, AlertCircle } from 'lucide-react';

const Input = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  success,
  disabled = false,
  className = '',
  icon: Icon,
  showPasswordToggle = false,
  showValidation = false,
  validationMessage,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputType = showPasswordToggle && type === 'password' 
    ? (showPassword ? 'text' : 'password') 
    : type;

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <motion.input
          type={inputType}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full px-4 py-3 bg-dark-300 border rounded-xl text-white placeholder-gray-500
            transition-all duration-300 focus:outline-none
            ${Icon ? 'pl-10' : ''}
            ${showPasswordToggle || showValidation ? 'pr-10' : ''}
            ${error 
              ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
              : success 
                ? 'border-green-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20'
                : 'border-dark-100 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          animate={{
            boxShadow: isFocused 
              ? '0 0 0 3px rgba(147, 51, 234, 0.1)' 
              : '0 0 0 0px rgba(147, 51, 234, 0)',
          }}
          {...props}
        />
        {showPasswordToggle && type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300 transition-colors"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        )}
        {showValidation && !showPasswordToggle && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {error && <X className="h-5 w-5 text-red-500" />}
            {success && <Check className="h-5 w-5 text-green-500" />}
          </div>
        )}
      </div>
      {(error || validationMessage) && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-1.5 text-sm flex items-center gap-1 ${
            error ? 'text-red-400' : 'text-gray-400'
          }`}
        >
          {error && <AlertCircle className="h-4 w-4" />}
          {error || validationMessage}
        </motion.p>
      )}
    </div>
  );
};

export default Input;
