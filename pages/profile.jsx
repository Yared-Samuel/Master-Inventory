import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import ProfileForm from '@/components/ProfileForm';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProfilePage = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/users/profile');
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.message || 'Failed to fetch profile');
        }
        
        setUser(result.data);
      } catch (error) {
        console.error('Profile fetch error:', error);
        toast.error(error.message || 'Failed to load profile');
        
        // If authentication error, redirect to login
        if (error.message.includes('Authentication')) {
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [router]);
  
  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  return (
    <>
      <Head>
        <title>My Profile | Inventory Management</title>
      </Head>
      
      <div className="min-h-screen bg-gray-100 py-12">
        <ToastContainer />
        
        <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              My Profile
            </h2>
          </div>
          
          {user ? (
            <ProfileForm user={user} onUpdate={handleProfileUpdate} />
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 text-center">
              <p className="text-gray-500">Failed to load profile information. Please try again later.</p>
            </div>
          )}
          
          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
            
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Account Information
              </h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>Additional account details and preferences.</p>
              </div>
              
              <div className="mt-5 border-t border-gray-200 pt-5">
                <dl className="divide-y divide-gray-200">
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-500">Company</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {user?.companyId?.name || 'N/A'}
                    </dd>
                  </div>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-500">Role</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {formatRole(user?.role)}
                    </dd>
                  </div>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-500">Last Login</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Helper function to format role names
function formatRole(role) {
  switch (role) {
    case 'admin':
      return 'System Administrator';
    case 'company_admin':
      return 'Company Administrator';
    case 'storeMan':
      return 'Store Manager';
    case 'barMan':
      return 'Bar Manager';
    case 'finance':
      return 'Finance Manager';
    case 'user':
      return 'User';
    default:
      return role || 'N/A';
  }
}

export default ProfilePage; 