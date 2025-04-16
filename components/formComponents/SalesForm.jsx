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
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [componentDetails, setComponentDetails] = useState([]);
  const [componentTotalCost, setComponentTotalCost] = useState(0);
  const [editableComponents, setEditableComponents] = useState([]);

  const { productId, quantity, fromStore, date, measurementType } = sales;
  
  useEffect(() => {
    const getProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/config/product/productForSales");
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
        const res = await fetch("/api/config/store/subStore");
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

  // Filter products when store changes
  useEffect(() => {
    if (fromStore && product.length > 0) {
      const validProducts = product.filter(p => 
        // Check if product has pricing for this store
        (p.selling_price && p.selling_price.some(sp => sp.storeId === fromStore)) && 
        // Only show forSale or finished products
        (p.type === 'forSale' || p.type === 'finished')
      );
      setFilteredProducts(validProducts);
      
      // Clear selected product if it's not valid for this store
      if (productId && !validProducts.some(p => p._id === productId)) {
        setSales(prev => ({ ...prev, productId: "" }));
      }
    } else {
      setFilteredProducts([]);
    }
  }, [fromStore, product, productId]);

  // Update selected product when productId changes
  useEffect(() => {
    if (productId) {
      const currentProduct = product.find(p => p._id === productId);
      setSelectedProduct(currentProduct);
      // Reset measurement type when product changes
      if (currentProduct && !currentProduct.sub_measurment_name) {
        setSales(prev => ({ ...prev, measurementType: 'main' }));
      }
      
      // Fetch component product details if this is a forSale product with components
      if (currentProduct && currentProduct.type === "forSale" && 
          currentProduct.used_products && currentProduct.used_products.length > 0) {
        fetchComponentDetails(currentProduct.used_products, fromStore);
      } else {
        setComponentDetails([]);
        setComponentTotalCost(0);
      }
    } else {
      setSelectedProduct(null);
      setComponentDetails([]);
      setComponentTotalCost(0);
    }
  }, [productId, product, fromStore]);
  
  // Calculate component costs when quantity changes
  useEffect(() => {
    if (componentDetails.length > 0 && quantity && !isNaN(Number(quantity))) {
      calculateComponentCosts(Number(quantity));
    } else {
      setComponentTotalCost(0);
    }
  }, [quantity, componentDetails, measurementType]);
  
  // Fetch details for component products
  const fetchComponentDetails = async (components, storeId) => {
    if (!components || components.length === 0 || !storeId) {
      setComponentDetails([]);
      setEditableComponents([]);
      return;
    }
    
    try {
      const componentIds = components.map(c => c.productId);
      const componentProdsFromState = product.filter(p => componentIds.includes(p._id));
      
      // Map component products with their quantities from used_products
      const detailedComponents = components.map(comp => {
        const compProduct = componentProdsFromState.find(p => p._id === comp.productId);
        if (!compProduct) return null;
        
        // Find price for this store
        const priceInfo = compProduct.selling_price && 
          compProduct.selling_price.find(price => price.storeId === storeId);
          
        return {
          ...compProduct,
          requiredQuantity: comp.quantity,
          pricePerUnit: priceInfo ? priceInfo.price_sub_measurment : 0
        };
      }).filter(Boolean);
      
      setComponentDetails(detailedComponents);
      
      // Initialize editable components with the same quantities
      const initialEditableComponents = detailedComponents.map(comp => ({
        productId: comp._id,
        quantity: comp.requiredQuantity
      }));
      setEditableComponents(initialEditableComponents);
    } catch (error) {
      console.error("Error fetching component details:", error);
      toast.error("Failed to load component details");
    }
  };
  
  // Handle change in component quantity
  const handleComponentQuantityChange = (productId, newQuantity) => {
    // Update editable components
    const updatedComponents = editableComponents.map(comp => 
      comp.productId === productId 
        ? { ...comp, quantity: parseFloat(newQuantity) } 
        : comp
    );
    setEditableComponents(updatedComponents);
    
    // Update component details for display purposes
    const updatedDetails = componentDetails.map(comp => 
      comp._id === productId 
        ? { ...comp, requiredQuantity: parseFloat(newQuantity) } 
        : comp
    );
    setComponentDetails(updatedDetails);
  };

  // Handle change in total required quantity
  const handleTotalRequiredChange = (productId, newTotal) => {
    const baseQty = quantity && !isNaN(Number(quantity)) ? Number(quantity) : 0;
    let adjustedQty = baseQty;
    
    // Adjust quantity if using sub-measurement
    if (selectedProduct && measurementType === 'sub' && selectedProduct.sub_measurment_value) {
      adjustedQty = baseQty / selectedProduct.sub_measurment_value;
    }

    // Calculate new required quantity per unit
    const newRequiredQuantity = adjustedQty > 0 ? parseFloat(newTotal) / adjustedQty : 0;

    // Update editable components
    const updatedComponents = editableComponents.map(comp => 
      comp.productId === productId 
        ? { ...comp, quantity: newRequiredQuantity } 
        : comp
    );
    setEditableComponents(updatedComponents);
    
    // Update component details for display purposes
    const updatedDetails = componentDetails.map(comp => 
      comp._id === productId 
        ? { ...comp, requiredQuantity: newRequiredQuantity } 
        : comp
    );
    setComponentDetails(updatedDetails);
  };
  
  // Calculate the cost of all components based on quantity
  const calculateComponentCosts = (qty, componentsToUse = componentDetails) => {
    if (!componentsToUse.length || !qty) {
      setComponentTotalCost(0);
      return;
    }
    
    // Adjust quantity if using sub-measurement
    let adjustedQty = qty;
    if (selectedProduct && measurementType === 'sub' && selectedProduct.sub_measurment_value) {
      adjustedQty = qty / selectedProduct.sub_measurment_value;
    }
    
    // Calculate total cost of all components
    const total = componentsToUse.reduce((sum, comp) => {
      const componentQty = comp.requiredQuantity * adjustedQty;
      const componentCost = componentQty * comp.pricePerUnit;
      return sum + componentCost;
    }, 0);
    
    setComponentTotalCost(total);
  };

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

    // Validate component quantities
    if (componentDetails.length > 0) {
      for (const comp of componentDetails) {
        const baseQty = quantity && !isNaN(Number(quantity)) ? Number(quantity) : 0;
        let adjustedQty = baseQty;
        
        if (selectedProduct && measurementType === 'sub' && selectedProduct.sub_measurment_value) {
          adjustedQty = baseQty / selectedProduct.sub_measurment_value;
        }
        
        const totalRequired = comp.requiredQuantity * adjustedQty;
        
        if (totalRequired <= 0) {
          toast.error(`${comp.name} quantity must be greater than 0`);
          return false;
        }
      }
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
          quantity: Number(quantity),
          measurementType,
          fromStore, 
          used_products: editableComponents || [],
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
          <>
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
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.name}
                      </option>
                    ))
                  ) : !fromStore ? (
                    <option disabled value="">Select a store first</option>
                  ) : (
                    <option disabled value="">No products available for this store</option>
                  )}
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
            
            {/* Component Products Section */}
            {componentDetails.length > 0 && (
              <div className="mt-4 border-t pt-3">
                <h3 className="font-medium text-gray-700 mb-2">Required Ingredients:</h3>
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-1">Ingredient</th>
                        <th className="text-left py-2 px-1">Required per Unit</th>
                        <th className="text-left py-2 px-1">Total Required</th>
                      </tr>
                    </thead>
                    <tbody>
                      {componentDetails.map((comp) => {
                        // Calculate quantities based on main product quantity
                        const baseQty = quantity && !isNaN(Number(quantity)) ? Number(quantity) : 0;
                        let adjustedQty = baseQty;
                        
                        // Adjust quantity if using sub-measurement
                        if (selectedProduct && measurementType === 'sub' && selectedProduct.sub_measurment_value) {
                          adjustedQty = baseQty / selectedProduct.sub_measurment_value;
                        }
                        
                        const totalRequired = comp.requiredQuantity * adjustedQty;
                        
                        return (
                          <tr key={comp._id} className="border-b border-gray-100">
                            <td className="py-2 px-1">{comp.name}</td>
                            <td className="py-2 px-1">
                              <div className="flex items-center">
                                <input
                                  type="number"
                                  step="any"
                                  min="0"
                                  value={comp.requiredQuantity}
                                  onChange={(e) => handleComponentQuantityChange(comp._id, e.target.value)}
                                  className="w-20 p-1 border rounded text-sm"
                                />
                                <span className="ml-2">{comp.measurment_name}</span>
                              </div>
                            </td>
                            <td className="py-2 px-1">
                              <div className="flex items-center">
                                <input
                                  type="number"
                                  step="any"
                                  min="0"
                                  value={totalRequired}
                                  onChange={(e) => handleTotalRequiredChange(comp._id, e.target.value)}
                                  className="w-20 p-1 border rounded text-sm"
                                />
                                <span className="ml-2">{comp.measurment_name}</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </form>
    </div>
  );
};

export default SalesForm;
