import React, { useEffect, useState } from "react";
import LoadingComponent from "../ui/LoadingComponent";
import { toast } from "react-toastify";
import { useRouter } from "next/router";

const initialState = {
  productId: "",
  quantity: 0,
  fromStore: "",
  toStore: "",
  date: "",
  measurementType: "main",
};

const TransferForm = () => {
  const router = useRouter();
  const [transfer, setTransfer] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState([]);
  const [store, setStore] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [conversionPreview, setConversionPreview] = useState(null);
  
  const { productId, quantity, fromStore, toStore, date, measurementType } = transfer;

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
    if (productId) {
      const currentProduct = product.find(p => p._id === productId);
      setSelectedProduct(currentProduct);
      if (currentProduct && !currentProduct.sub_measurment_name) {
        setTransfer(prev => ({ ...prev, measurementType: 'main' }));
      }
    } else {
      setSelectedProduct(null);
    }
  }, [productId, product]);

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
      const subUnits = numQty * prod.sub_measurment_value;
      setConversionPreview({
        from: `${numQty} ${prod.measurment_name}`,
        to: `${subUnits} ${prod.sub_measurment_name}`,
        calculationText: `${numQty} × ${prod.sub_measurment_value} = ${subUnits}`,
        equivalentText: `${numQty} ${prod.measurment_name} = ${subUnits} ${prod.sub_measurment_name}`
      });
    } else if (type === 'sub' && prod.sub_measurment_value) {
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
    setTransfer({ ...transfer, [name]: value });
  };

  // This function validates and returns the quantity value
  // Returns 0 if quantity is missing or invalid
  // Otherwise returns the parsed quantity as-is, letting backend handle any unit conversions
  const calculateActualQuantity = () => {
    if (!selectedProduct || !quantity || isNaN(parseFloat(quantity))) {
      return 0;
    }    
    return parseFloat(quantity);
  };

  const saveTransfer = async (e) => {
    e.preventDefault();
    if (!productId || !quantity || !fromStore || !toStore) {
      return toast.error("All fields marked with * are required");
    }
    
    if (measurementType === 'sub' && !selectedProduct.sub_measurment_name) {
      return toast.error("This product doesn't have a sub-measurement unit defined");
    }
    
    const actualQuantity = calculateActualQuantity();
    
    try {
      setLoading(true);
      const response = await fetch("/api/transaction/transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fromStore,
          toStore,
          productId,
          quantity: actualQuantity,
          measurementType,
          date: date || new Date().toISOString().split('T')[0]
        }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success(data.message, {
          autoClose: 2000,
        });
        setTimeout(() => {
          router.reload();
        }, 2000);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const QuickQuantityButton = ({ count, label }) => {
    if (!selectedProduct || measurementType !== 'sub') return null;
    
    return (
      <button
        type="button"
        className="text-xs bg-gray-200 hover:bg-gray-300 rounded px-2 py-1 mr-1"
        onClick={() => setTransfer({ ...transfer, quantity: count.toString() })}
      >
        {label || `${count} ${selectedProduct.sub_measurment_name}`}
      </button>
    );
  };

  return (
    <div className="bg-slate-100 px-4 py-1 rounded-md shadow-md">
      <form onSubmit={saveTransfer}>
        {loading ? (
          <LoadingComponent />
        ) : (
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label
                htmlFor="fromStore"
                className="block text-[0.7rem] font-semibold text-gray-900 dark:text-white"
              >
                From Store <span className="text-red-600">*</span>
              </label>
              <select
                id="fromStore"
                value={fromStore}
                onChange={handleInputChange}
                name="fromStore"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
                htmlFor="toStore"
                className="block text-[0.7rem] font-semibold text-gray-900 dark:text-white"
              >
                To Store <span className="text-red-600">*</span>
              </label>
              <select
                id="toStore"
                value={toStore}
                onChange={handleInputChange}
                name="toStore"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
                value={productId}
                name="productId"
                id="productId"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
                value={measurementType}
                name="measurementType"
                id="measurementType"
                disabled={!selectedProduct || !selectedProduct.sub_measurment_name}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              >
                {/* <option value={null}>Select Measurement Type</option> */}
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
                  value={quantity}
                  name="quantity"
                  type="number"
                  step="any"
                  id="quantity"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  required
                />
                <span className="ml-2 text-sm text-gray-600">
                  {measurementType === 'main' 
                    ? (selectedProduct?.measurment_name || '') 
                    : (selectedProduct?.sub_measurment_name || '')}
                </span>
              </div>
              
              {selectedProduct && measurementType === 'sub' && selectedProduct.sub_measurment_name.toLowerCase().includes('bottle') && (
                <div className="mt-1 flex flex-wrap gap-1">
                  <QuickQuantityButton count={6} label="6-pack" />
                  <QuickQuantityButton count={12} label="12-pack" />
                  <QuickQuantityButton count={24} label="24 (1 crate)" />
                </div>
              )}
              
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
                value={date}
                onChange={handleInputChange}
                id="date"
                type="date"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Select date"
              />
            </div>
            
            <div className="flex items-end">
              <button
                type="submit"
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full px-3 py-2 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                Transfer
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default TransferForm;
