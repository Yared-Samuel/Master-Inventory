import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminDashboard from '@/components/AdminDashboard';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Link from 'next/link';

const AdminDashboardPage = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/users/me');
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.message || 'Authentication failed');
        }
        
        if (data.data.role !== 'admin') {
          // Not an admin, redirect to dashboard
          router.push('/dashboard');
          return;
        }
        
        setUser(data.data);
      } catch (error) {
        console.error('Auth check failed:', error);
        toast.error(error.message || 'Failed to verify authentication');
        // If auth check fails, redirect to login
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
  
  if (!user) {
    return null; // Will redirect via useEffect
  }
  
  return (
    <>
      <Head>
        <title>Admin Dashboard | Inventory Management</title>
      </Head>
      
      <div className="min-h-screen bg-gray-100 py-12">
        <ToastContainer />
        
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <Link href="/page/dashboard">back to Dashboard</Link>
          <div className="md:flex md:items-center md:justify-between mb-6">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                Admin Dashboard
              </h2>
            </div>
          </div>
          
          <AdminDashboard user={user} />
          
          {/* Additional dashboard content can be added here */}
        </div>
      </div>
    </>
  );
};

export default AdminDashboardPage; 