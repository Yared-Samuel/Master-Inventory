import React, { useEffect, useState } from "react";
import LoadingComponent from "../ui/LoadingComponent";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
const initialState = {
  productId: "",
  quantity: "",
  fromStore: "",
  date: "",
  measurementType: "main", // 'main' or 'sub'
};

const SalesForm = () => {
  const router = useRouter();

  const [sales, setSales] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState([]);
  const [store, setStore] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [conversionPreview, setConversionPreview] = useState(null);

  const { productId, quantity, fromStore, date, measurementType } = sales;
  
  useEffect(() => {
    const getProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/config/product/productPurchase");
        if (!res.ok) {
          return toast.error("Something went wrong!");
        }
        const data = await res.json();
        setProduct(data.data);
      } catch (error) {
        return toast.error("Data not found");
      } finally {
        setLoading(false);
      }
    };
    getProduct();
  }, []);

  useEffect(() => {
    const getStore = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/config/store/store");
        if (!res.ok) {
          return toast.error("Something went wrong!");
        }
        const data = await res.json();
        setStore(data.data);
      } catch (error) {
        return toast.error("Data not found");
      } finally {
        setLoading(false);
      }
    };
    getStore();
  }, []);

  // Update selected product when productId changes
  useEffect(() => {
    if (productId) {
      const currentProduct = product.find(p => p._id === productId);
      setSelectedProduct(currentProduct);
      // Reset measurement type when product changes
      if (currentProduct && !currentProduct.sub_measurment_name) {
        setSales(prev => ({ ...prev, measurementType: 'main' }));
      }
    } else {
      setSelectedProduct(null);
    }
  }, [productId, product]);

  // Update conversion preview when quantity or measurement type changes
  useEffect(() => {
    if (selectedProduct && quantity) {
      updateConversionPreview(quantity, measurementType, selectedProduct);
    } else {
      setConversionPreview(null);
    }
  }, [quantity, measurementType, selectedProduct]);

  const updateConversionPreview = (qty, type, prod) => {
    if (!prod || !qty || isNaN(qty) || qty <= 0) {
      setConversionPreview(null);
      return;
    }

    const numQty = Number(qty);
    
    if (type === 'main' && prod.sub_measurment_name) {
      // Convert from main to sub (e.g., crates to bottles)
      const subUnits = numQty * prod.sub_measurment_value;
      setConversionPreview({
        from: `${numQty} ${prod.measurment_name}`,
        to: `${subUnits} ${prod.sub_measurment_name}`,
        calculationText: `${numQty} × ${prod.sub_measurment_value} = ${subUnits}`,
        equivalentText: `${numQty} ${prod.measurment_name} = ${subUnits} ${prod.sub_measurment_name}`
      });
    } else if (type === 'sub' && prod.sub_measurment_value) {
      // Convert from sub to main (e.g., bottles to crates)
      const mainUnits = numQty / prod.sub_measurment_value;
      const isWholeNumber = mainUnits === Math.floor(mainUnits);
      const formattedMainUnits = isWholeNumber ? mainUnits.toString() : mainUnits.toFixed(4);
      
      setConversionPreview({
        from: `${numQty} ${prod.sub_measurment_name}`,
        to: `${formattedMainUnits} ${prod.measurment_name}`,
        calculationText: `${numQty} ÷ ${prod.sub_measurment_value} = ${formattedMainUnits}`,
        equivalentText: `${numQty} ${prod.sub_measurment_name} = ${formattedMainUnits} ${prod.measurment_name}`
      });
    } else {
      setConversionPreview(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSales({ ...sales, [name]: value });
  };

  const calculateActualQuantity = () => {
    if (!selectedProduct || !quantity || isNaN(parseFloat(quantity))) {
      return 0;
    }
    
    const numQuantity = parseFloat(quantity);
    
    // If using main measurement unit, return quantity as is
    if (measurementType === 'main') {
      return numQuantity;
    }
    
    // If using sub-measurement unit, convert to main unit
    if (measurementType === 'sub' && selectedProduct.sub_measurment_value) {
      // Ensure precision for the conversion
      const conversion = numQuantity / selectedProduct.sub_measurment_value;
      // Return with appropriate precision
      return parseFloat(conversion.toFixed(6));
    }
    
    return numQuantity;
  };

  const validateSalesForm = () => {
    if (!productId) {
      toast.error("Please select a product");
      return false;
    }
    
    if (!fromStore) {
      toast.error("Please select a store");
      return false;
    }
    
    if (!quantity || isNaN(quantity) || Number(quantity) <= 0) {
      toast.error("Please enter a valid quantity");
      return false;
    }
    
    if (measurementType === 'sub' && !selectedProduct.sub_measurment_name) {
      toast.error("This product doesn't have a sub-measurement unit defined");
      return false;
    }
    
    return true;
  };

  const saveSales = async (e) => {
    e.preventDefault();
    
    if (!validateSalesForm()) {
      return;
    }
    
    const actualQuantity = calculateActualQuantity();
    
    try {
      setLoading(true);
      const res = await fetch("/api/transaction/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId, 
          quantity: actualQuantity,  // This is the converted quantity in main units (e.g., crates)
          originalQuantity: Number(quantity),  // Original input (e.g., bottles)
          measurementType,
          fromStore, 
          date: date || new Date().toISOString().split('T')[0]
        }),
      });
      
      // Handle response
      if (!res.ok) {
        const errorData = await res.json();
        return toast.error(errorData.message || "Something went wrong");
      }
      
      const data = await res.json();
      if (!data.success) {
        return toast.error(data.message);
      }
      
      toast.success(data.message, {
        autoClose: 2000,
      });
      setTimeout(() => {
        router.reload();
      }, 2000);
    } catch (error) {
      console.error("Sales error:", error);
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Quick quantity buttons for common bottle counts
  const QuickQuantityButton = ({ count, label }) => {
    if (!selectedProduct || measurementType !== 'sub') return null;
    
    return (
      <button
        type="button"
        className="text-xs bg-gray-200 hover:bg-gray-300 rounded px-2 py-1 mr-1"
        onClick={() => setSales({ ...sales, quantity: count.toString() })}
      >
        {label || `${count} ${selectedProduct.sub_measurment_name}`}
      </button>
    );
  };
  
  return (
    <div className="bg-slate-100 px-4 py-3 rounded-md shadow-md">
      <form onSubmit={saveSales}>
        {loading ? (
          <LoadingComponent />
        ) : (
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label
                htmlFor="fromStore"
                className="block text-[0.7rem] font-semibold text-gray-900 dark:text-white"
              >
                Store <span className="text-red-600">*</span>
              </label>
              <select
                id="fromStore"
                value={sales?.fromStore}
                onChange={handleInputChange}
                name="fromStore"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              >
                <option value="">Select Store</option>
                {store.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="productId"
                className="block text-[0.7rem] font-semibold text-gray-900 dark:text-white"
              >
                Product <span className="text-red-600">*</span>
              </label>
              <select
                onChange={handleInputChange}
                value={sales?.productId}
                name="productId"
                id="productId"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              >
                <option value="">Select Product</option>
                {product.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label
                htmlFor="measurementType"
                className="block text-[0.7rem] font-semibold text-gray-900 dark:text-white"
              >
                Measurement Type <span className="text-red-600">*</span>
              </label>
              <select
                onChange={handleInputChange}
                value={sales?.measurementType}
                name="measurementType"
                id="measurementType"
                disabled={!selectedProduct || !selectedProduct.sub_measurment_name}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              >
                <option value="main">
                  {selectedProduct ? selectedProduct.measurment_name : 'Main Unit'}
                </option>
                {selectedProduct && selectedProduct.sub_measurment_name && (
                  <option value="sub">
                    {selectedProduct.sub_measurment_name}
                  </option>
                )}
              </select>
              {selectedProduct && selectedProduct.sub_measurment_value && (
                <div className="text-xs text-gray-500 mt-1">
                  1 {selectedProduct.measurment_name} = {selectedProduct.sub_measurment_value} {selectedProduct.sub_measurment_name}
                </div>
              )}
            </div>
            
            <div>
              <label
                htmlFor="quantity"
                className="block text-[0.7rem] font-semibold text-gray-900 dark:text-white"
              >
                Quantity <span className="text-red-600">*</span>
              </label>
              <div className="flex items-center">
                <input
                  onChange={handleInputChange}
                  value={sales?.quantity}
                  name="quantity"
                  type='number'
                  step="any"
                  id="quantity"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  required
                />
                <span className="ml-2 text-sm text-gray-600">
                  {measurementType === 'main' 
                    ? (selectedProduct?.measurment_name || '') 
                    : (selectedProduct?.sub_measurment_name || '')}
                </span>
              </div>
              
              {/* Quick buttons for common bottle quantities */}
              {selectedProduct && measurementType === 'sub' && selectedProduct.sub_measurment_name.toLowerCase().includes('bottle') && (
                <div className="mt-1 flex flex-wrap gap-1">
                  <QuickQuantityButton count={6} label="6-pack" />
                  <QuickQuantityButton count={12} label="12-pack" />
                  <QuickQuantityButton count={24} label="24 (1 crate)" />
                  <QuickQuantityButton count={48} label="48 (2 crates)" />
                </div>
              )}
              
              {/* Conversion preview */}
              {conversionPreview && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="text-sm font-medium text-blue-800">
                    {conversionPreview.equivalentText}
                  </div>
                  <div className="text-xs text-blue-600">
                    {conversionPreview.calculationText}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="date"
                className="block text-[0.7rem] font-semibold text-gray-900 dark:text-white"
              >
                Date
              </label>
              <input
                name="date"
                value={sales?.date}
                onChange={handleInputChange}
                id="date"
                type="date"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Select date"
              />
            </div>
            
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full px-3 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:opacity-70"
              >
                {loading ? 'Processing...' : 'Sell'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default SalesForm;
