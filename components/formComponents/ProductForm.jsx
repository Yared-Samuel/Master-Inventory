import { productTypes } from '@/lib/constants';
import LoadingComponent from '../ui/LoadingComponent'
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from 'next/router';

const initialState = {
  name: "",
  type: "",
  measurment_name: "",
  sub_measurment_name: "",
  sub_measurment_value: 1,
  used_products: [], // Initialize empty array for used products
  selling_price: [] // Initialize empty array for selling prices
};

const ProductForm = () => {
  const router = useRouter()
  const [product, setPoduct] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]); // State to hold available products for selection
  const [stores, setStores] = useState([]); // State to hold available stores for selection
  const [tempProduct, setTempProduct] = useState({ productId: "", quantity: 1 }); // Temporary state for product being added
  const [tempPrice, setTempPrice] = useState({
    storeId: "",
    price_sub_measurment: 0,
    price_main_measurment: null
  }); // Temporary state for price being added

  const {
    name,
    type,
    measurment_name,
    sub_measurment_name,
    sub_measurment_value,
    used_products,
    selling_price
  } = product;

  // Fetch available products and stores when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch products
        const productsResponse = await fetch("/api/config/product/productForUse");
        const productsData = await productsResponse.json();
        if (productsData.success) {
          setProducts(productsData.data);
        }

        // Fetch stores
        const storesResponse = await fetch("/api/config/store/subStore");
        const storesData = await storesResponse.json();
        if (storesData.success) {
          setStores(storesData.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPoduct({ ...product, [name]: value });
  };

  const handleTempProductChange = (e) => {
    const { name, value } = e.target;
    setTempProduct({ ...tempProduct, [name]: name === "quantity" ? Number(value) : value });
  };

  const handleTempPriceChange = (e) => {
    const { name, value } = e.target;
    // For price fields, convert to Number or null if empty
    if (name === 'price_main_measurment') {
      const numValue = value === '' ? null : Number(value);
      setTempPrice({ ...tempPrice, [name]: numValue });
    } else if (name === 'price_sub_measurment') {
      setTempPrice({ ...tempPrice, [name]: Number(value) });
    } else {
      setTempPrice({ ...tempPrice, [name]: value });
    }
  };

  const addUsedProduct = () => {
    if (!tempProduct.productId) {
      toast.error("Please select a product");
      return;
    }
    
    // Check if product already exists in the list
    const exists = used_products.some(p => p.productId === tempProduct.productId);
    
    if (exists) {
      toast.error("This product is already added");
      return;
    }

    setPoduct({
      ...product,
      used_products: [...used_products, { ...tempProduct }]
    });
    
    // Reset temp product
    setTempProduct({ productId: "", quantity: 1 });
  };

  const removeUsedProduct = (index) => {
    const updatedProducts = [...used_products];
    updatedProducts.splice(index, 1);
    setPoduct({ ...product, used_products: updatedProducts });
  };

  const addSellingPrice = () => {
    if (!tempPrice.storeId) {
      toast.error("Please select a store");
      return;
    }
    
    if (tempPrice.price_sub_measurment <= 0) {
      toast.error("Sub measurement price must be greater than 0");
      return;
    }
    
    // Check if store already exists in the list
    const exists = selling_price.some(p => p.storeId === tempPrice.storeId);
    
    if (exists) {
      toast.error("Pricing for this store is already added");
      return;
    }

    // Add new selling price with proper structure
    setPoduct({
      ...product,
      selling_price: [...selling_price, { 
        storeId: tempPrice.storeId,
        price_sub_measurment: tempPrice.price_sub_measurment,
        price_main_measurment: tempPrice.price_main_measurment
      }]
    });
    
    // Reset temp price
    setTempPrice({
      storeId: "",
      price_sub_measurment: 0,
      price_main_measurment: null
    });
  };

  const removeSellingPrice = (index) => {
    const updatedPrices = [...selling_price];
    updatedPrices.splice(index, 1);
    setPoduct({ ...product, selling_price: updatedPrices });
  };

  const saveProduct = async (e) => {
    e.preventDefault();

    if(!name || !type || !measurment_name) {
      toast.error("The first 3 fields are required");
      return;
    }

    // Validate used_products if type is forSale
    if (type === "forSale" && used_products.length === 0) {
      toast.error("For sale products must include used products");
      return;
    }

    // Validate at least one selling price is added
 
    if (type === "finished" && selling_price.length === 0) {
      toast.error("Please add at least one store pricing");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/config/product/product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          type,
          measurment_name,
          sub_measurment_name,
          sub_measurment_value,
          used_products: type === "forSale" ? used_products : undefined,
          selling_price: selling_price
        }),
      });
      const data = await response.json();

      if (data.success) {
        toast.success(data.message, {
          autoClose: 2000, // Display toast for 3 seconds
        });
        setTimeout(() => {
          router.reload(); // Reload the page after a delay
        }, 2000);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("An error occurred while saving the product");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" px-4 py-1">
      <form onSubmit={saveProduct}>
        {
          loading ? <LoadingComponent /> : (
            <>
              <div className="grid md:grid-cols-3 lg:grid-cols-5">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Product Name{" "}
                    {/* <span className="text-white bg-slate-600 p-1 border rounded-lg">
                      የምርት ስም
                    </span> */}
                  </label>
                  <input
                    name="name"
                    value={product?.name}
                    onChange={handleInputChange}
                    type="text"
                    id="name"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-5/6 p-1.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="type"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Type{" "}
                    {/* <span className="text-white bg-slate-600 p-1 border rounded-lg">
                      አይነት
                    </span> */}
                  </label>
                  <select
                    id="type"
                    value={product?.type}
                    onChange={handleInputChange}
                    name="type"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-5/6 p-1.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  >
                    <option value="" >Select Type</option>
                    {productTypes.map((item) => (
                      <option key={item.type} value={item.type}>
                        {item.type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="measurmant_name"
                    className="block text-sm font-medium text-gray-700 text-wrap"
                  >
                    Measurment Name{" "}
                    {/* <span className="text-white bg-slate-600 p-1 border rounded-lg">
                      የመለኪያ ስም
                    </span> */}
                  </label>
                  <input
                    name="measurment_name"
                    value={product?.measurment_name}
                    onChange={handleInputChange}
                    type="text"
                    id="measurmant_name"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-5/6 p-1.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="sub_measurment_name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Sub-Measurment{" "}
                    {/* <span className="text-white bg-slate-600 p-1 border rounded-lg">
                      ችርቻሮ መለኪያ
                    </span> */}
                  </label>
                  <input
                    name="sub_measurment_name"
                    value={product?.sub_measurment_name}
                    onChange={handleInputChange}
                    type="text"
                    id="sub_measurment_name"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-5/6 p-1.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    
                  />
                </div>
                <div>
                  <label
                    htmlFor="sub_measurment_value"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Sub-Measurment Value{" "}
                    {/* <span className="text-white bg-slate-600 p-1 border rounded-lg">
                      ችርቻሮ መጠን
                    </span> */}
                  </label>
                  <input
                    name="sub_measurment_value"
                    value={product?.sub_measurment_value}
                    onChange={handleInputChange}
                    type="number"
                    id="sub_measurment_value"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-5/6 p-1.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    
                  />
                </div>
              </div>

              {/* Used Products Section - Only shown when type is forSale */}
              {type === "forSale" && (
                <div className="mt-4 border-t pt-4 border-gray-300">
                  <h3 className="text-md font-semibold mb-4 text-gray-800">Used Products</h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Left side - Add new used product */}
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Add Product Components</h4>
                      
                      <div className="space-y-3">
                        <div>
                          <label 
                            htmlFor="productId" 
                            className="block text-[0.7rem] font-semibold text-gray-700"
                          >
                            Select Product
                          </label>
                          <select
                            id="productId"
                            name="productId"
                            value={tempProduct.productId}
                            onChange={handleTempProductChange}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                          >
                            <option value="">Select Product</option>
                            {products.map((p) => (
                              <option key={p._id} value={p._id}>
                                {p.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label 
                            htmlFor="quantity" 
                            className="block text-[0.7rem] font-semibold text-gray-700"
                          >
                            Quantity
                          </label>
                          <input
                            id="quantity"
                            name="quantity"
                            type="number"
                            min="1"
                            value={tempProduct.quantity}
                            onChange={handleTempProductChange}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                          />
                        </div>
                        
                        <button
                          type="button"
                          onClick={addUsedProduct}
                          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-colors text-sm font-medium flex items-center justify-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                          </svg>
                          Add Product
                        </button>
                      </div>
                    </div>
                    
                    {/* Right side - List of added used products */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden">
                      <div className="bg-gray-50 py-2 px-4 border-b border-gray-200">
                        <h4 className="text-sm font-medium text-gray-700">Product Components List</h4>
                      </div>
                      
                      {used_products.length > 0 ? (
                        <div className="max-h-60 overflow-y-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Product
                                </th>
                                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Qty
                                </th>
                                <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Action
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {used_products.map((item, index) => {
                                const productName = products.find(p => p._id === item.productId)?.name || 'Unknown Product';
                                return (
                                  <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                      {productName}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                      {item.quantity}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                                      <button
                                        type="button"
                                        onClick={() => removeUsedProduct(index)}
                                        className="text-red-500 hover:text-red-700 transition-colors focus:outline-none"
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-40 px-4">
                          <p className="text-sm text-gray-500 italic flex flex-col items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            No products added yet
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Selling Price Section */}
              <div className="mt-4 border-t pt-4 border-gray-300">
                <h3 className="text-md font-semibold mb-4 text-gray-800">Selling Price</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Left side - Add new store price */}
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Add Store Price</h4>
                    
                    <div className="space-y-3">
                      <div>
                        <label 
                          htmlFor="storeId" 
                          className="block text-[0.7rem] font-semibold text-gray-700"
                        >
                          Select Store
                        </label>
                        <select
                          id="storeId"
                          name="storeId"
                          value={tempPrice.storeId}
                          onChange={handleTempPriceChange}
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                        >
                          <option value="">Select Store</option>
                          {stores.map((store) => (
                            <option key={store._id} value={store._id}>
                              {store.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label 
                          htmlFor="price_sub_measurment" 
                          className="block text-[0.7rem] font-semibold text-gray-700"
                        >
                          Sub-Measurement Price
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <span className="text-gray-500">$</span>
                          </div>
                          <input
                            id="price_sub_measurment"
                            name="price_sub_measurment"
                            type="number"
                            min="0"
                            step="0.01"
                            value={tempPrice.price_sub_measurment}
                            onChange={handleTempPriceChange}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-8 p-2"
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      <div>
                        <label 
                          htmlFor="price_main_measurment" 
                          className="block text-[0.7rem] font-semibold text-gray-700"
                        >
                          Main Measurement Price (Optional)
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <span className="text-gray-500">$</span>
                          </div>
                          <input
                            id="price_main_measurment"
                            name="price_main_measurment"
                            type="number"
                            min="0"
                            step="0.01"
                            value={tempPrice.price_main_measurment === null ? '' : tempPrice.price_main_measurment}
                            onChange={handleTempPriceChange}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-8 p-2"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        onClick={addSellingPrice}
                        className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-green-800 transition-colors text-sm font-medium flex items-center justify-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                        </svg>
                        Add Price
                      </button>
                    </div>
                  </div>
                  
                  {/* Right side - List of added store prices */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden">
                    <div className="bg-gray-50 py-2 px-4 border-b border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700">Store Pricing List</h4>
                    </div>
                    
                    {selling_price.length > 0 ? (
                      <div className="max-h-60 overflow-y-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Store
                              </th>
                              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Sub Price
                              </th>
                              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Main Price
                              </th>
                              <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Action
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {selling_price.map((item, index) => {
                              const storeName = stores.find(s => s._id === item.storeId)?.name || 'Unknown Store';
                              return (
                                <tr key={index} className="hover:bg-gray-50">
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                    {storeName}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                    ${item.price_sub_measurment.toFixed(2)}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                    {item.price_main_measurment ? `$${item.price_main_measurment.toFixed(2)}` : '-'}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                                    <button
                                      type="button"
                                      onClick={() => removeSellingPrice(index)}
                                      className="text-red-500 hover:text-red-700 transition-colors focus:outline-none"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                      </svg>
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-40 px-4">
                        <p className="text-sm text-gray-500 italic flex flex-col items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          No pricing added yet
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )
        }
        
        <button
          type="submit"
          className="text-white mt-4 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-1/2 sm:w-auto px-4 py-1.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          Submit
        </button>
      </form>
    </div>
  );
}

export default ProductForm;