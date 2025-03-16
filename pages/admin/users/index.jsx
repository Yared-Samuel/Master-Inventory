import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UsersPage = () => {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState('');
  
  // Check if user is admin and fetch data
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
        
        // Fetch companies for filter
        const companiesResponse = await fetch('/api/companies');
        const companiesData = await companiesResponse.json();
        
        if (!companiesData.success) {
          throw new Error(companiesData.message || 'Failed to fetch companies');
        }
        
        setCompanies(companiesData.data);
        
        // Fetch users
        await fetchUsers();
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
  
  const fetchUsers = async (companyId = '') => {
    setLoading(true);
    try {
      const url = `/api/admin/users${companyId ? `?companyId=${companyId}` : ''}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch users');
      }
      
      setUsers(data.data);
    } catch (error) {
      toast.error(error.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCompanyChange = (e) => {
    const companyId = e.target.value;
    setSelectedCompany(companyId);
    fetchUsers(companyId);
  };
  
  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          _id: userId,
          isActive: !currentStatus
        })
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to update user status');
      }
      
      // Update the users list
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === userId 
            ? { ...user, isActive: !currentStatus } 
            : user
        )
      );
      
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      toast.error(error.message || 'An error occurred');
    }
  };
  
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'company_admin':
        return 'bg-purple-100 text-purple-800';
      case 'storeMan':
        return 'bg-blue-100 text-blue-800';
      case 'barMan':
        return 'bg-green-100 text-green-800';
      case 'finance':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const formatRoleName = (role) => {
    switch (role) {
      case 'admin':
        return 'System Admin';
      case 'company_admin':
        return 'Company Admin';
      case 'storeMan':
        return 'Store Manager';
      case 'barMan':
        return 'Bar Manager';
      case 'finance':
        return 'Finance';
      default:
        return 'User';
    }
  };
  
  if (loading && !users.length) {
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
        <title>Users | Admin Panel</title>
      </Head>
      
      <div className="min-h-screen bg-gray-100 py-12">
        <ToastContainer />
        
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <Link href="/admin/dashboard">Back to main page</Link>

          <div className="md:flex md:items-center md:justify-between mb-6">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                Users
              </h2>
            </div>
            <div className="mt-4 flex md:mt-0">
              <Link href="/admin/users/create" className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Create New User
              </Link>
            </div>
          </div>
          
          {/* Filter by company */}
          <div className="mb-6">
            <label htmlFor="company-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Company
            </label>
            <select
              id="company-filter"
              value={selectedCompany}
              onChange={handleCompanyChange}
              className="max-w-md w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Companies</option>
              {companies.map(company => (
                <option key={company._id} value={company._id}>
                  {company.name} {!company.isActive && '(Inactive)'}
                </option>
              ))}
            </select>
          </div>
          
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            {users.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg leading-6 font-medium text-gray-900">No users found</h3>
                <p className="mt-2 text-sm text-gray-500">
                  {selectedCompany 
                    ? "No users found for the selected company." 
                    : "Get started by creating a new user."}
                </p>
                <div className="mt-6">
                  <Link href="/admin/users/create" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Create New User
                  </Link>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Company
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Login
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map(user => (
                      <tr key={user._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {user.companyId?.name || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                            {formatRoleName(user.role)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleToggleStatus(user._id, user.isActive)}
                            className={`text-${user.isActive ? 'red' : 'green'}-600 hover:text-${user.isActive ? 'red' : 'green'}-900 mr-4`}
                          >
                            {user.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <Link href={`/admin/users/edit/${user._id}`} className="text-indigo-600 hover:text-indigo-900">
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

export default UsersPage; 