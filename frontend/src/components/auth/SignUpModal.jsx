import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

/**
 * SignUpModal Component
 * 
 * This component handles authentication redirects.
 * When Clerk is integrated, it will redirect to Clerk's hosted sign-up/sign-in pages.
 * 
 * For now, it uses the simulated auth from AuthContext.
 * 
 * To integrate with Clerk:
 * 1. Install @clerk/clerk-react
 * 2. Wrap your app with ClerkProvider in main.jsx
 * 3. Use <SignIn /> and <SignUp /> components from Clerk
 * 4. Or use redirectToSignIn() and redirectToSignUp() for redirect mode
 */
const SignUpModal = () => {
  const { showSignUpModal, setShowSignUpModal, signUp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (showSignUpModal) {
      // When Clerk is integrated, uncomment this:
      // import { useClerk } from '@clerk/clerk-react';
      // const { redirectToSignUp } = useClerk();
      // redirectToSignUp();
      
      // For now, redirect to a sign-up page or open Clerk's modal
      // This will be replaced with Clerk's redirect when integrated
      
      // Navigate to sign-up route (create this route when integrating Clerk)
      // navigate('/sign-up');
      
      // Reset the modal state
      // setShowSignUpModal(false);
    }
  }, [showSignUpModal, navigate, setShowSignUpModal]);

  // Return null - no popup modal
  // Authentication is handled via redirect or Clerk's hosted pages
  return null;
};

export default SignUpModal;
