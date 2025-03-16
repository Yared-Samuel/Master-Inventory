import { useState } from 'react';
import { toast } from 'react-toastify';

const CompanyForm = ({ onSuccess, initialData = {} }) => {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    address: initialData.address || '',
    phone: initialData.phone || '',
    email: initialData.email || '',
    subscription: initialData.subscription?.plan || 'free',
    expiryDate: initialData.subscription?.expiresAt 
      ? new Date(initialData.subscription.expiresAt).toISOString().split('T')[0]
      : '',
    isActive: initialData.isActive !== undefined ? initialData.isActive : true
  });
  
  const [loading, setLoading] = useState(false);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Transform data for API
      const apiData = {
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        isActive: formData.isActive,
        ...(formData.subscription && {
          subscription: {
            plan: formData.subscription,
            ...(formData.expiryDate && { expiresAt: new Date(formData.expiryDate) })
          }
        })
      };
      
      // Determine if it's an update or create operation
      const method = initialData._id ? 'PUT' : 'POST';
      const url = '/api/companies';
      
      // If updating, include ID
      if (initialData._id) {
        apiData._id = initialData._id;
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(apiData)
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to save company');
      }
      
      toast.success(result.message || 'Company saved successfully');
      
      if (onSuccess) {
        onSuccess(result.data);
      }
      
      // Reset form if it's a new company
      if (!initialData._id) {
        setFormData({
          name: '',
          address: '',
          phone: '',
          email: '',
          subscription: 'free',
          expiryDate: '',
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
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Company Name *
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
          Email
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subscription Plan
          </label>
          <select
            name="subscription"
            value={formData.subscription}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="free">Free</option>
            <option value="standard">Standard</option>
            <option value="premium">Premium</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Expiry Date
          </label>
          <input
            type="date"
            name="expiryDate"
            value={formData.expiryDate}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
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
          {loading ? 'Saving...' : initialData._id ? 'Update Company' : 'Create Company'}
        </button>
      </div>
    </form>
  );
};

export default CompanyForm; 