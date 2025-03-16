import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const UserForm = ({ onSuccess, initialData = {}, isAdmin = false }) => {
  const [companies, setCompanies] = useState([]);
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    email: initialData.email || '',
    password: '',
    confirmPassword: '',
    role: initialData.role || 'user',
    companyId: initialData.companyId?._id || initialData.companyId || '',
    isActive: initialData.isActive !== undefined ? initialData.isActive : true
  });
  
  const [loading, setLoading] = useState(false);
  const [fetchingCompanies, setFetchingCompanies] = useState(false);
  
  // Fetch companies for dropdown if admin
  useEffect(() => {
    const getCompanies = async () => {
      if (!isAdmin) return;
      
      setFetchingCompanies(true);
      try {
        const response = await fetch('/api/companies');
        const result = await response.json();
        
        if (result.success) {
          setCompanies(result.data);
        } else {
          toast.error(result.message || 'Failed to fetch companies');
        }
      } catch (error) {
        toast.error('Error fetching companies');
      } finally {
        setFetchingCompanies(false);
      }
    };
    
    getCompanies();
  }, [isAdmin]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const validateForm = () => {
    // Check required fields
    if (!formData.name || !formData.email || !formData.role || !formData.companyId) {
      toast.error('Please fill in all required fields');
      return false;
    }
    
    // Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    
    // Check password for new users
    if (!initialData._id) {
      if (!formData.password) {
        toast.error('Password is required for new users');
        return false;
      }
      
      if (formData.password.length < 6) {
        toast.error('Password must be at least 6 characters');
        return false;
      }
      
      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match');
        return false;
      }
    } else if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Prepare data for API
      const apiData = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        companyId: formData.companyId,
        isActive: formData.isActive
      };
      
      // Include password only if set
      if (formData.password) {
        apiData.password = formData.password;
      }
      
      // Include ID if editing
      if (initialData._id) {
        apiData._id = initialData._id;
      }
      
      // Determine endpoint and method
      const isUpdate = !!initialData._id;
      const endpoint = isAdmin ? '/api/admin/users' : '/api/users';
      const method = isUpdate ? 'PUT' : 'POST';
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(apiData)
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to save user');
      }
      
      toast.success(result.message || 'User saved successfully');
      
      if (onSuccess) {
        onSuccess(result.data);
      }
      
      // Reset form for new entries
      if (!isUpdate) {
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: 'user',
          companyId: formData.companyId, // Keep the selected company for convenience
          isActive: true
        });
      }
      
    } catch (error) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password {!initialData._id && '*'}
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required={!initialData._id}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          {initialData._id && (
            <p className="mt-1 text-xs text-gray-500">
              Leave blank to keep current password
            </p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password {!initialData._id && '*'}
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required={!initialData._id}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role *
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Select Role</option>
            {isAdmin && <option value="admin">System Admin</option>}
            <option value="company_admin">Company Admin</option>
            <option value="storeMan">Store Manager</option>
            <option value="barMan">Bar Manager</option>
            <option value="finance">Finance</option>
            <option value="user">Regular User</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Company *
          </label>
          <select
            name="companyId"
            value={formData.companyId}
            onChange={handleChange}
            required
            disabled={fetchingCompanies}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
          >
            <option value="">Select Company</option>
            {companies.map(company => (
              <option key={company._id} value={company._id}>
                {company.name} {!company.isActive && '(Inactive)'}
              </option>
            ))}
          </select>
          {fetchingCompanies && (
            <p className="mt-1 text-xs text-gray-500">
              Loading companies...
            </p>
          )}
        </div>
      </div>
      
      <div className="flex items-center">
        <input
          type="checkbox"
          name="isActive"
          id="isActive"
          checked={formData.isActive}
          onChange={handleChange}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
          Active
        </label>
      </div>
      
      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
        >
          {loading ? 'Saving...' : initialData._id ? 'Update User' : 'Create User'}
        </button>
      </div>
    </form>
  );
};

export default UserForm; 