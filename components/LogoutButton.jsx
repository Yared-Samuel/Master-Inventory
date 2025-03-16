import { useRouter } from 'next/router';
import { toast } from 'react-toastify';

const LogoutButton = ({ className, children }) => {
  const router = useRouter();
  
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/users/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Redirect to login page
        router.push('/login');
      } else {
        toast.error(result.message || 'Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout. Please try again.');
    }
  };
  
  return (
    <button
      type="button"
      onClick={handleLogout}
      className={className || "text-sm font-medium text-gray-700 hover:text-gray-900"}
    >
      {children || "Logout"}
    </button>
  );
};

export default LogoutButton; 