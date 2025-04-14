"use client";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { useState, useContext, useEffect } from "react";
import { productTypes } from "@/lib/constants";
import Link from "next/link";
import Image from "next/image";
import TanStackTable from "../tanStackTableComponents/TanStackTable";
import AuthContext from "@/pages/context/AuthProvider";
import { toast } from "react-toastify";
import { useRouter } from "next/router";


const TableProductList = () => {
  
  const { auth } = useContext(AuthContext);
  const [sorting, setSorting] = useState([]);
  const [filtering, setFiltering] = useState([]);
  const [updateId, setUpdateId] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [product, setPoduct] = useState({
    name: "",
    type: "",
    selling_price: [],
    used_products: []
  });
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [stores, setStores] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  

  const router = useRouter();

  // fetch Data
  useEffect(() => {
    
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/config/product/product");
        if (!res.ok) {
          return toast.error(`Something went wrong! ${res.status}`);
        }
        const data = await res.json();
        
          setData(data.data);
       
      } catch (error) {
        
          toast.error("not found");
          setError(error.message);
        
      } finally {
        
          setLoading(false);
        
      }
    };
    fetchData();
   
  }, []);

  const columns = [
    // {
    //   header: "Order #",
    //   accessorFn: (row, rowIndex) => rowIndex + 1,
    //   id: "orderNumber",
    //   cell: (info) => info.getValue(),
    // },
    {
      header: "Name",
      accessorKey: "name",
    },
    {
      header: "Type",
      accessorKey: "type",
    },
    {
      header: "Measurment",
      accessorFn: (row) =>
        row.sub_measurment_value
          ? `${row.measurment_name}=${row.sub_measurment_value} ${row.sub_measurment_name}`
          : row.measurment_name,
    },
    ...(auth.role === "admin" || auth.role === "company_admin"
      ? [
          {
            header: "Created By",
            accessorFn: (row) => row.user.name,
          },
          {
            header: "Actions",
            cell: ({ row }) => (
              <button className="bg-transparent border-none">
                <Link
                  href={`/configs/products`}
                  onClick={(e) => {
                    e.preventDefault();
                    setUpdateId(row.original._id);
                  }}
                  className="group relative"
                >
                  <Image
                    src={"/icons/edit-icon.svg"}
                    alt="update"
                    width={20}
                    height={20}
                  />
                  {/* <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    Edit
                  </span> */}
                </Link>
              </button>
            ),
          },
        ]
      : []),
  ];
  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting: sorting,
      globalFilter: filtering,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setFiltering,
  });

  useEffect(() => {
    if (updateId) {
      const targetData = data.find((item) => item._id === updateId);
      if (targetData) {
        setFilteredData(targetData);
        setPoduct({ 
          name: targetData.name, 
          type: targetData.type,
          selling_price: targetData.selling_price || [],
          used_products: targetData.used_products || []
        });
        setModalOpen(true);
      }
    }
  }, [updateId, data]);

  // Fetch stores for selling price
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const res = await fetch("/api/config/store/subStore");
        if (res.ok) {
          const data = await res.json();
          setStores(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching stores:", error);
      }
    };
    
    // Only fetch when modal is open
    if (isModalOpen) {
      fetchStores();
    }
  }, [isModalOpen]);
  
  // Fetch available products for components
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/config/product/productForSales");
        if (res.ok) {
          const data = await res.json();
          setAvailableProducts(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    
    // Only fetch when modal is open
    if (isModalOpen) {
      fetchProducts();
    }
  }, [isModalOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPoduct({ ...product, [name]: value });
  };

  // Handle add/edit selling price
  const handleSellingPriceChange = (index, field, value) => {
    const updatedPrices = [...product.selling_price];
    updatedPrices[index] = {
      ...updatedPrices[index],
      [field]: field.includes('price') ? parseFloat(value) : value
    };
    setPoduct({ ...product, selling_price: updatedPrices });
  };

  // Add new selling price entry
  const addSellingPrice = () => {
    setPoduct({
      ...product,
      selling_price: [...product.selling_price, { storeId: "", price_sub_measurment: 0, price_main_measurment: null }]
    });
  };

  // Remove selling price entry
  const removeSellingPrice = (index) => {
    const updatedPrices = [...product.selling_price];
    updatedPrices.splice(index, 1);
    setPoduct({ ...product, selling_price: updatedPrices });
  };

  // Handle add/edit component product
  const handleComponentChange = (index, field, value) => {
    const updatedComponents = [...product.used_products];
    updatedComponents[index] = {
      ...updatedComponents[index],
      [field]: field === 'quantity' ? parseFloat(value) : value
    };
    setPoduct({ ...product, used_products: updatedComponents });
  };

  // Add new component entry
  const addComponent = () => {
    setPoduct({
      ...product,
      used_products: [...product.used_products, { productId: "", quantity: 1 }]
    });
  };

  // Remove component entry
  const removeComponent = (index) => {
    const updatedComponents = [...product.used_products];
    updatedComponents.splice(index, 1);
    setPoduct({ ...product, used_products: updatedComponents });
  };

  const updateProduct = async (e) => {
    e.preventDefault();

    const { name, type, selling_price, used_products } = product;
    
    if (!name || !type) {
      toast.error("Both name and type are required");
      return;
    }

    // Validate selling_price entries
    if (selling_price && selling_price.length > 0) {
      for (const price of selling_price) {
        if (!price.storeId) {
          toast.error("Each selling price must have a store selected");
          return;
        }
        if (!price.price_sub_measurment || isNaN(price.price_sub_measurment)) {
          toast.error("Each selling price must have a valid sub-measurement price");
          return;
        }
      }
    }

    // Validate used_products entries
    if (used_products && used_products.length > 0) {
      for (const component of used_products) {
        if (!component.productId) {
          toast.error("Each component must have a product selected");
          return;
        }
        if (!component.quantity || isNaN(component.quantity) || component.quantity <= 0) {
          toast.error("Each component must have a valid quantity");
          return;
        }
      }
    }

    try {
      const response = await fetch(`/api/config/product/${filteredData._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, type, selling_price, used_products }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message, { autoClose: 2000 });
        setTimeout(() => {
          router.reload();
        }, 2000);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("An error occurred while updating the product");
    }
  };

  const toggleModal = () => {
    setModalOpen((prev) => !prev);
  };

  return (
    <>
      <div className="bg-slate-100 mt-4 py-1 rounded-md shadow-md">
      <TanStackTable
        table={table}
        filtering={filtering}
        setFiltering={setFiltering}
        loading={loading}
      >
        Product List
      </TanStackTable>
      </div>
      {/* Update Modal */}
      {isModalOpen && (
        <div
          id="crud-modal"
          tabIndex="-1"
          className="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full md:inset-0 h-screen bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300"
        >
          <div className="relative w-full max-w-4xl p-4 animate-fadeIn">
            {/* Modal content */}
            <div className="relative bg-white rounded-xl shadow-2xl overflow-hidden">
              {/* Modal header */}
              <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 p-5 border-b">
                <h3 className="text-blue-700 font-bold text-xl flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Update Product
                </h3>
                <button
                  onClick={toggleModal}
                  type="button"
                  className="text-gray-600 bg-transparent hover:bg-red-100 hover:text-red-600 rounded-lg text-sm p-2 ml-auto inline-flex items-center transition-colors duration-200"
                >
                  <svg
                    className="w-5 h-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  <span className="sr-only">Close modal</span>
                </button>
              </div>
              
              {/* Modal body */}
              <div className="max-h-[calc(100vh-180px)] overflow-y-auto">
                <form onSubmit={updateProduct} className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-2">
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Product Name
                      </label>
                      <input
                        name="name"
                        value={product.name || ""}
                        onChange={handleInputChange}
                        type="text"
                        id="name"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 transition duration-150 ease-in-out"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="type"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Type
                      </label>
                      <select
                        id="type"
                        value={product.type || ""}
                        onChange={handleInputChange}
                        name="type"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 transition duration-150 ease-in-out"
                      >
                        <option disabled value="">
                          Select type
                        </option>
                        {productTypes.map((item) => (
                          <option key={item.type} value={item.type}>
                            {item.type}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  {/* Selling Price Section */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-gray-800 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Selling Prices
                      </h4>
                      <button
                        type="button"
                        onClick={addSellingPrice}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Price
                      </button>
                    </div>
                    
                    {product.selling_price && product.selling_price.length > 0 ? (
                      <div className="space-y-3 max-h-48 overflow-y-auto p-3 bg-gray-50 rounded-lg border border-gray-100">
                        {product.selling_price.map((price, index) => (
                          <div key={index} className="flex items-end space-x-3 bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                            <div className="flex-1">
                              <label className="block text-xs font-medium text-gray-700 mb-1">Store</label>
                              <select
                                value={price.storeId || ""}
                                onChange={(e) => handleSellingPriceChange(index, 'storeId', e.target.value)}
                                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                              >
                                <option value="">Select Store</option>
                                {stores.map((store) => (
                                  <option key={store._id} value={store._id}>
                                    {store.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            
                            <div className="w-24">
                              <label className="block text-xs font-medium text-gray-700 mb-1">Sub-Unit Price</label>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={price.price_sub_measurment || 0}
                                onChange={(e) => handleSellingPriceChange(index, 'price_sub_measurment', e.target.value)}
                                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 w-full"
                              />
                            </div>
                            
                            <div className="w-24">
                              <label className="block text-xs font-medium text-gray-700 mb-1">Main-Unit Price</label>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={price.price_main_measurment || ""}
                                onChange={(e) => handleSellingPriceChange(index, 'price_main_measurment', e.target.value)}
                                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 w-full"
                                placeholder="Optional"
                              />
                            </div>
                            
                            <button
                              type="button"
                              onClick={() => removeSellingPrice(index)}
                              className="p-2 text-red-600 bg-white rounded-lg hover:bg-red-50 transition-colors duration-200"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-sm text-gray-500 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        No selling prices defined
                      </div>
                    )}
                  </div>
                  
                  {/* Components/Ingredients Section - only show for forSale products */}
                  {product.type === 'forSale' && (
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium text-gray-800 flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                          Components/Ingredients
                        </h4>
                        <button
                          type="button"
                          onClick={addComponent}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Add Component
                        </button>
                      </div>
                      
                      {product.used_products && product.used_products.length > 0 ? (
                        <div className="space-y-3 max-h-48 overflow-y-auto p-3 bg-gray-50 rounded-lg border border-gray-100">
                          {product.used_products.map((component, index) => (
                            <div key={index} className="flex items-end space-x-3 bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                              <div className="flex-1">
                                <label className="block text-xs font-medium text-gray-700 mb-1">Product</label>
                                <select
                                  value={component.productId || ""}
                                  onChange={(e) => handleComponentChange(index, 'productId', e.target.value)}
                                  className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                                >
                                  <option value="">Select Product</option>
                                  {availableProducts
                                    .filter(p => p._id !== filteredData._id) // Prevent selecting self as component
                                    .map((prod) => (
                                    <option key={prod._id} value={prod._id}>
                                      {prod.name} ({prod.type})
                                    </option>
                                  ))}
                                </select>
                              </div>
                              
                              <div className="w-24">
                                <label className="block text-xs font-medium text-gray-700 mb-1">Quantity</label>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0.01"
                                  value={component.quantity || 1}
                                  onChange={(e) => handleComponentChange(index, 'quantity', e.target.value)}
                                  className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 w-full"
                                />
                              </div>
                              
                              <button
                                type="button"
                                onClick={() => removeComponent(index)}
                                className="p-2 text-red-600 bg-white rounded-lg hover:bg-red-50 transition-colors duration-200"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 text-sm text-gray-500 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          No components defined
                        </div>
                      )}
                    </div>
                  )}
                </form>
              </div>
              
              {/* Modal footer */}
              <div className="flex items-center justify-end space-x-3 bg-gray-50 px-6 py-4 border-t">
                <button
                  type="button"
                  onClick={toggleModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={updateProduct}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Update Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TableProductList;
