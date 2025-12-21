import { createContext, useContext, useState, useEffect } from 'react';

// Guest prompt limit
const GUEST_PROMPT_LIMIT = 5;

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [promptCount, setPromptCount] = useState(0);
  const [showSignUpModal, setShowSignUpModal] = useState(false);

  // Load guest prompt count from localStorage
  useEffect(() => {
    const savedCount = localStorage.getItem('nexusai_prompt_count');
    if (savedCount) {
      setPromptCount(parseInt(savedCount, 10));
    }
    
    // Check for saved user
    const savedUser = localStorage.getItem('nexusai_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    setIsLoaded(true);
  }, []);

  // Save prompt count to localStorage
  useEffect(() => {
    localStorage.setItem('nexusai_prompt_count', promptCount.toString());
  }, [promptCount]);

  const isGuest = !user;
  const hasReachedLimit = isGuest && promptCount >= GUEST_PROMPT_LIMIT;
  const remainingPrompts = Math.max(0, GUEST_PROMPT_LIMIT - promptCount);

  const incrementPromptCount = () => {
    if (isGuest) {
      const newCount = promptCount + 1;
      setPromptCount(newCount);
      
      if (newCount >= GUEST_PROMPT_LIMIT) {
        setShowSignUpModal(true);
      }
    }
  };

  const canSendMessage = () => {
    if (user) return true;
    return promptCount < GUEST_PROMPT_LIMIT;
  };

  // Simulated sign up (replace with Clerk when configured)
  const signUp = async (email, password, name) => {
    // Simulate API call
    const newUser = {
      id: Date.now().toString(),
      email,
      name: name || email.split('@')[0],
      createdAt: new Date().toISOString()
    };
    
    setUser(newUser);
    localStorage.setItem('nexusai_user', JSON.stringify(newUser));
    setShowSignUpModal(false);
    
    return newUser;
  };

  // Simulated sign in
  const signIn = async (email, password) => {
    const existingUser = {
      id: Date.now().toString(),
      email,
      name: email.split('@')[0],
      createdAt: new Date().toISOString()
    };
    
    setUser(existingUser);
    localStorage.setItem('nexusai_user', JSON.stringify(existingUser));
    setShowSignUpModal(false);
    
    return existingUser;
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('nexusai_user');
  };

  const value = {
    user,
    isLoaded,
    isGuest,
    promptCount,
    remainingPrompts,
    hasReachedLimit,
    showSignUpModal,
    setShowSignUpModal,
    incrementPromptCount,
    canSendMessage,
    signUp,
    signIn,
    signOut,
    GUEST_PROMPT_LIMIT
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

