import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const PriceForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    products: []
  });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        products: initialData.products
      });
    }
    fetchProducts();
  }, [initialData]);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/config/product/product');
      if (!res.ok) {
        throw new Error(`API Error: ${res.status} - ${res.statusText}`);
      }
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Error loading products');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleProductPriceChange = (productId, price) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.map(p => 
        p.product._id === productId 
          ? { ...p, sellingPrice: parseFloat(price) }
          : p
      )
    }));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Price List Name
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Products</h3>
        <div className="space-y-2">
          {formData.products.map((product) => (
            <div key={product.product._id} className="flex items-center space-x-4">
              <span className="flex-1">{product.product.name}</span>
              <input
                type="number"
                value={product.sellingPrice}
                onChange={(e) => handleProductPriceChange(product.product._id, e.target.value)}
                className="w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                min="0"
                step="0.01"
                required
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
};

export default PriceForm; 