import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

// Higher-order component to protect routes
const withAuth = (WrappedComponent, allowedRoles = []) => {
  const AuthWrapper = (props) => {
    const router = useRouter();
    const [authenticated, setAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
      const checkAuth = async () => {
        try {
          const response = await fetch('/api/users/me');
          const data = await response.json();
          
          if (!data.success) {
            throw new Error('Authentication failed');
          }
          
          // Check if user role is allowed
          if (allowedRoles.length > 0 && !allowedRoles.includes(data.data.role)) {
            throw new Error('Unauthorized access');
          }
          
          setAuthenticated(true);
        } catch (error) {
          console.error('Auth check failed:', error);
          router.push('/login');
        } finally {
          setLoading(false);
        }
      };
      
      checkAuth();
    }, [router]);
    
    if (loading) {
      return (
        <div className="min-h-screen flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      );
    }
    
    if (!authenticated) {
      return null; // Will redirect in useEffect
    }
    
    return <WrappedComponent {...props} />;
  };
  
  return AuthWrapper;
};

export default withAuth; 