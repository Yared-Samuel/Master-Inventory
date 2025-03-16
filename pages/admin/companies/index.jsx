import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CompaniesPage = () => {
  const router = useRouter();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Check if user is admin and fetch companies
  useEffect(() => {
    const initialize = async () => {
      try {
        // Check authentication
        const authResponse = await fetch('/api/users/me');
        const authData = await authResponse.json();
        
        if (!authData.success) {
          throw new Error(authData.message || 'Authentication failed');
        }
        
        if (authData.data.role !== 'admin') {
          // Not an admin, redirect to dashboard
          router.push('/dashboard');
          return;
        }
        
        setIsAdmin(true);
        
        // Fetch companies
        const companiesResponse = await fetch('/api/companies');
        const companiesData = await companiesResponse.json();
        
        if (!companiesData.success) {
          throw new Error(companiesData.message || 'Failed to fetch companies');
        }
        
        setCompanies(companiesData.data);
      } catch (error) {
        console.error('Initialization failed:', error);
        toast.error(error.message || 'Failed to load data');
        
        // If auth check fails, redirect to login
        if (error.message.includes('Authentication')) {
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    
    initialize();
  }, [router]);
  
  const handleToggleStatus = async (companyId, currentStatus) => {
    try {
      const response = await fetch('/api/companies', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          _id: companyId,
          isActive: !currentStatus
        })
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to update company status');
      }
      
      // Update the companies list
      setCompanies(prevCompanies => 
        prevCompanies.map(company => 
          company._id === companyId 
            ? { ...company, isActive: !currentStatus } 
            : company
        )
      );
      
      toast.success(`Company ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      toast.error(error.message || 'An error occurred');
    }
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
        <title>Companies | Admin Panel</title>
      </Head>
      
      <div className="min-h-screen bg-gray-100 py-12">
        <ToastContainer />
        
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <Link href="/admin/dashboard">Back to main page</Link>
          <div className="md:flex md:items-center md:justify-between mb-6">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                Companies
              </h2>
            </div>
            <div className="mt-4 flex md:mt-0">
              <Link href="/admin/companies/create" className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Create New Company
              </Link>
            </div>
          </div>
          
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            {companies.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg leading-6 font-medium text-gray-900">No companies found</h3>
                <p className="mt-2 text-sm text-gray-500">Get started by creating a new company.</p>
                <div className="mt-6">
                  <Link href="/admin/companies/create" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Create New Company
                  </Link>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Company Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subscription
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {companies.map(company => (
                      <tr key={company._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {company.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {company.email || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {company.subscription?.plan || 'Free'}
                            {company.subscription?.expiresAt && (
                              <span className="ml-2 text-xs text-gray-400">
                                (Expires: {new Date(company.subscription.expiresAt).toLocaleDateString()})
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            company.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {company.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(company.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleToggleStatus(company._id, company.isActive)}
                            className={`text-${company.isActive ? 'red' : 'green'}-600 hover:text-${company.isActive ? 'red' : 'green'}-900 mr-4`}
                          >
                            {company.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <Link href={`/admin/companies/edit/${company._id}`} className="text-indigo-600 hover:text-indigo-900">
                            Edit
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CompaniesPage; 