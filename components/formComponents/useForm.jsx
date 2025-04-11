import React, { useEffect, useState } from "react";
import LoadingComponent from "../ui/LoadingComponent";
import { toast } from "react-toastify";
import { useRouter } from "next/router";

const UseForm = () => {
    const router = useRouter()
    const [useEntries, setUseEntries] = useState([{
        productId: "",
        quantity: "",
        fromStore: "",
        date: "",
        measurementType: "main",
    }])
    const [loading, setLoading] = useState(false)
    const [product, setProduct] = useState([])
    const [store, setStore] = useState([])
    const [selectedProducts, setSelectedProducts] = useState([])
    const [conversionPreviews, setConversionPreviews] = useState([])

    useEffect(() => {
        const getProduct = async () => {
            setLoading(true)
            try {
                const res = await fetch("/api/config/product/productForUse")
                if (!res.ok) {
                    return toast.error("Something went wrong!")
                }
                const data = await res.json()
                setProduct(data.data)
            } catch (error) {
                return toast.error("Data not found")
            }
        }
        getProduct()
    }, [])

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

      useEffect(() => {
        const newSelectedProducts = useEntries.map(entry => {
          if (entry.productId) {
            return product.find(p => p._id === entry.productId);
          }
          return null;
        });
        setSelectedProducts(newSelectedProducts);
      }, [useEntries, product]);

      useEffect(() => {
        const newConversionPreviews = useEntries.map((entry, index) => {
          if (selectedProducts[index] && entry.quantity) {
            return updateConversionPreview(entry.quantity, entry.measurementType, selectedProducts[index]);
          }
          return null;
        });
        setConversionPreviews(newConversionPreviews);
      }, [useEntries, selectedProducts]);

      const updateConversionPreview = (qty, type, prod) => {
        if (!prod || !qty || isNaN(qty) || qty <= 0) {
          return null;
        }
    
        const numQty = Number(qty);
        
        if (type === 'main' && prod.sub_measurment_name) { 
          const subUnits = numQty * prod.sub_measurment_value;
          return {
            from: `${numQty} ${prod.measurment_name}`,
            to: `${subUnits} ${prod.sub_measurment_name}`,
            calculationText: `${numQty} × ${prod.sub_measurment_value} = ${subUnits}`,
            equivalentText: `${numQty} ${prod.measurment_name} = ${subUnits} ${prod.sub_measurment_name}`
          };
        } else if (type === 'sub' && prod.sub_measurment_value) {
          const mainUnits = numQty / prod.sub_measurment_value;
          const isWholeNumber = mainUnits === Math.floor(mainUnits);
          const formattedMainUnits = isWholeNumber ? mainUnits.toString() : mainUnits.toFixed(4);
          
          return {
            from: `${numQty} ${prod.sub_measurment_name}`,
            to: `${formattedMainUnits} ${prod.measurment_name}`,
            calculationText: `${numQty} ÷ ${prod.sub_measurment_value} = ${formattedMainUnits}`,
            equivalentText: `${numQty} ${prod.sub_measurment_name} = ${formattedMainUnits} ${prod.measurment_name}`
          };
        }
        return null;
      };
    
      const handleInputChange = (index, e) => {
        const { name, value } = e.target;
        const newEntries = [...useEntries];
        newEntries[index] = { ...newEntries[index], [name]: value };
        setUseEntries(newEntries);
      };

      const addNewEntry = () => {
        setUseEntries([...useEntries, {
            productId: "",
            quantity: "",
            fromStore: "",
            date: "",
            measurementType: "main",
        }]);
      };

      const removeEntry = (index) => {
        const newEntries = useEntries.filter((_, i) => i !== index);
        setUseEntries(newEntries);
      };
    
      const validateUseForm = () => {
        for (const entry of useEntries) {
          if (!entry.productId) {
            toast.error("Please select a product for all entries");
            return false;
          }
          
          if (!entry.fromStore) {
            toast.error("Please select a store for all entries");
            return false;
          }
          
          if (!entry.quantity || isNaN(entry.quantity) || Number(entry.quantity) <= 0) {
            toast.error("Please enter a valid quantity for all entries");
            return false;
          }
          
          const selectedProduct = product.find(p => p._id === entry.productId);
          if (entry.measurementType === 'sub' && !selectedProduct?.sub_measurment_name) {
            toast.error("One or more products don't have a sub-measurement unit defined");
            return false;
          }
        }
        return true;
      };
    
      const saveUse = async (e) => {
        console.log(useEntries)
        e.preventDefault();
        
        if (!validateUseForm()) {
          return;
        }
        
        try {
          setLoading(true);
          const res = await fetch("/api/transaction/use", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(useEntries),
          });
          
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
          console.error("Use error:", error);
          toast.error(error.message || "An error occurred");
        } finally {
          setLoading(false);
        }
      };

      const QuickQuantityButton = ({ count, label, index }) => {
        const selectedProduct = selectedProducts[index];
        if (!selectedProduct || useEntries[index].measurementType !== 'sub') return null;
        
        return (
          <button
            type="button"
            className="text-xs bg-gray-200 hover:bg-gray-300 rounded px-2 py-1 mr-1"
            onClick={() => {
              const newEntries = [...useEntries];
              newEntries[index] = { ...newEntries[index], quantity: count.toString() };
              setUseEntries(newEntries);
            }}
          >
            {label || `${count} ${selectedProduct.sub_measurment_name}`}
          </button>
        );
      };

  return (
    <div className="bg-slate-100 px-4 py-3 rounded-md shadow-md">
      <form onSubmit={saveUse}>
        {loading ? (
          <LoadingComponent />
        ) : (
          <div>
            {useEntries.map((entry, index) => (
              <div key={index} className="grid md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4 p-4 border rounded-lg">
                <div>
                  <label className="block text-[0.7rem] font-semibold text-gray-900">
                    Store <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={entry.fromStore}
                    onChange={(e) => handleInputChange(index, e)}
                    name="fromStore"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
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
                  <label className="block text-[0.7rem] font-semibold text-gray-900">
                    Product <span className="text-red-600">*</span>
                  </label>
                  <select
                    onChange={(e) => handleInputChange(index, e)}
                    value={entry.productId}
                    name="productId"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
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
                  <label className="block text-[0.7rem] font-semibold text-gray-900">
                    Measurement Type <span className="text-red-600">*</span>
                  </label>
                  <select
                    onChange={(e) => handleInputChange(index, e)}
                    value={entry.measurementType}
                    name="measurementType"
                    disabled={!selectedProducts[index] || !selectedProducts[index].sub_measurment_name}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                  >
                    <option value="main">
                      {selectedProducts[index] ? selectedProducts[index].measurment_name : 'Main Unit'}
                    </option>
                    {selectedProducts[index]?.sub_measurment_name && (
                      <option value="sub">
                        {selectedProducts[index].sub_measurment_name}
                      </option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-[0.7rem] font-semibold text-gray-900">
                    Quantity <span className="text-red-600">*</span>
                  </label>
                  <div className="flex items-center">
                    <input
                      onChange={(e) => handleInputChange(index, e)}
                      value={entry.quantity}
                      name="quantity"
                      type='number'
                      step="any"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                      required
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      {entry.measurementType === 'main' 
                        ? (selectedProducts[index]?.measurment_name || '') 
                        : (selectedProducts[index]?.sub_measurment_name || '')}
                    </span>
                  </div>

                  {selectedProducts[index] && entry.measurementType === 'sub' && selectedProducts[index].sub_measurment_name.toLowerCase().includes('bottle') && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      <QuickQuantityButton count={6} label="6-pack" index={index} />
                      <QuickQuantityButton count={12} label="12-pack" index={index} />
                      <QuickQuantityButton count={24} label="24 (1 crate)" index={index} />
                      <QuickQuantityButton count={48} label="48 (2 crates)" index={index} />
                    </div>
                  )}

                  {conversionPreviews[index] && (
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                      <div className="text-sm font-medium text-blue-800">
                        {conversionPreviews[index].equivalentText}
                      </div>
                      <div className="text-xs text-blue-600">
                        {conversionPreviews[index].calculationText}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[0.7rem] font-semibold text-gray-900">
                    Date
                  </label>
                  <input
                    name="date"
                    value={entry.date}
                    onChange={(e) => handleInputChange(index, e)}
                    type="date"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                  />
                </div>

                <div className="flex items-end gap-2">
                  <button
                    type="button"
                    onClick={() => removeEntry(index)}
                    className="text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-3 py-2.5"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            <div className="flex justify-between items-center mt-4">
              <button
                type="button"
                onClick={addNewEntry}
                className="text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-3 py-2.5"
              >
                Add Another Entry
              </button>

              <button
                type="submit"
                disabled={loading}
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-3 py-2.5"
              >
                {loading ? 'Processing...' : 'Submit All'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default UseForm;