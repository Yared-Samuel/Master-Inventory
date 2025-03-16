import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import CompanyForm from '@/components/CompanyForm';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CreateCompanyPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Check if user is admin on page load
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
        
        setIsAdmin(true);
        setLoading(false);
      } catch (error) {
        console.error('Auth check failed:', error);
        // If auth check fails, redirect to login
        router.push('/login');
      }
    };
    
    checkAuth();
  }, [router]);
  
  const handleCompanyCreated = (company) => {
    // Redirect to companies list page
    router.push('/admin/companies');
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  if (!isAdmin) {
    return null; // Will redirect via useEffect
  }
  
  return (
    <>
      <Head>
        <title>Create Company | Admin Panel</title>
      </Head>
      
      <div className="min-h-screen bg-gray-100 py-12">
        <ToastContainer />
        
        <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between mb-6">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                Create New Company
              </h2>
            </div>
            <div className="mt-4 flex md:mt-0">
              <Link href="/admin/companies" className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Back to Companies
              </Link>
            </div>
          </div>
          
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <CompanyForm onSuccess={handleCompanyCreated} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateCompanyPage; 