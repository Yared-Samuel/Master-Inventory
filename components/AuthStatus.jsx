import { useContext } from 'react';
import AuthContext from '@/pages/context/AuthProvider';

const AuthStatus = () => {
  const { auth } = useContext(AuthContext);
  
  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    return (
      <div style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        padding: '10px',
        background: '#f3f3f3',
        border: '1px solid #ccc',
        borderRadius: '5px',
        zIndex: 1000,
        fontSize: '12px',
        maxWidth: '300px'
      }}>
        <h4 style={{ margin: '0 0 5px 0' }}>Auth Status:</h4>
        <div>
          <strong>Name:</strong> {auth.name || 'Not set'}
        </div>
        <div>
          <strong>Email:</strong> {auth.email || 'Not set'}
        </div>
        <div>
          <strong>Role:</strong> {auth.role || 'Not set'}
        </div>
      </div>
    );
  }
  
  return null; // Don't render in production
};

export default AuthStatus; 