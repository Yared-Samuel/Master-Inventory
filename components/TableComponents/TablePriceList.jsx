"use client";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  createColumnHelper,
} from "@tanstack/react-table";
import { useState, useContext, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import TanStackTable from "../tanStackTableComponents/TanStackTable";
import AuthContext from "@/pages/context/AuthProvider";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
const initialState = {
  name: "",
  products: [],
};
const TablePriceList = () => {
  const [sorting, setSorting] = useState([]);
  const [filtering, setFiltering] = useState([]);
  const [updateId, setUpdateId] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [rowSelection, setRowSelection] = useState({});
  const [sprice, setSprice] = useState(initialState);
  const [isModalOpen, setModalOpen] = useState(false);
  const [productData, setProductData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [openDropdownRowId, setOpenDropdownRowId] = useState(null); // State for open dropdown row
  const [priceData, setPriceData] = useState([]);
  const [editingPrice, setEditingPrice] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  const router = useRouter();
  const columnHelper = createColumnHelper();
  const { auth } = useContext(AuthContext);

  
  // Fetch data

  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/config/price/price");
        
        if (!res.ok) {
          console.error(`Price API error: ${res.status} - ${res.statusText}`);
          // Try to get more details about the error
          try {
            const errorDetails = await res.json();
            console.error("Error details:", errorDetails);
            return toast.error(`API Error: ${res.status} - ${errorDetails.message || res.statusText}`);
          } catch (jsonError) {
            // If we can't parse the JSON, just show the status
            return toast.error(`Something went wrong! ${res.status} - ${res.statusText}`);
          }
        }
        
        const data = await res.json();
        
        if (!data.success) {
          console.error("API returned success: false", data);
          toast.error(data.message || "Failed to load price data");
          return;
        }
        
        if (!data.data || !Array.isArray(data.data)) {
          console.error("API returned invalid data format:", data);
          toast.error("Invalid data format received from server");
          return;
        }
        
        setData(data.data);
        setPriceData(data.data);
        
      } catch (error) {
        console.error("Error fetching price data:", error);
        toast.error(`Error loading prices: ${error.message}`);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const columns = [
    {
      id: "select",
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
        />
      ),
    },
    columnHelper.accessor("name", {
      header: "User",
      cell: (info) => (
        <span
          onClick={(e) => {
            e.preventDefault();
            setOpenDropdownRowId(
              (prevRowId) => (prevRowId === info.row.id ? null : info.row.id) // Toggle dropdown for this row
            );
          }}
          id="dropdownDefaultButton"
          data-dropdown-toggle="dropdown"
          className="hover:cursor-pointer inline-flex items-center px-2 py-1 me-2 text-sm font-medium text-blue-800 bg-blue-100 rounded dark:bg-blue-900 dark:text-blue-300"
          type="button"
        >
          {info.getValue() || "N/A"}
          {" > "}
        </span>
      ),
    }),
    columnHelper.accessor("products", {
      header: "Products",
      cell: (info) => {
        // Render dropdown only for the clicked row
        return (
          openDropdownRowId === info.row.id && (
            <div
              id="dropdown"
              className="z-10  divide-y divide-gray-100 rounded-lg  dark:bg-gray-700"
            >
              <ul
                className=" text-sm text-gray-700 dark:text-gray-200"
                aria-labelledby="dropdownDefaultButton"
              >
                {info.getValue().map((product) => (
                  <li key={product._id}>
                    {product.product.name} - {product.sellingPrice}
                  </li>
                ))}
              </ul>
            </div>
          )
        );
      },
    }),
    ...(auth.role === "admin" || auth.role === "company_admin"
      ? [
          {
            header: "Created By",
            accessorFn: (row) => row.user.name,
          },
          {
            header: "Actions",
            cell: ({ row }) => (
              <div className="flex gap-2">
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
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    Edit
                  </span>
                </Link>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to duplicate this price list?')) {
                      fetch(`/api/config/price/duplicate/${row.original._id}`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          companyId: auth.companyId,
                          userId: auth.id,
                        }),
                      })
                      .then(res => res.json())
                      .then(data => {
                        if (data.success) {
                          router.reload();
                          toast.success('Price list duplicated successfully');
                          
                        } else {
                          toast.error(data.message || 'Failed to duplicate price list');
                        }
                      })
                      .catch(err => {
                        console.error('Error duplicating price list:', err);
                        toast.error('Error duplicating price list');
                      });
                    }
                  }}
                  className="group relative"
                >
                  <Image src={'/icons/copy.svg'} alt="copy" width={20} height={20} />
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    Copy
                  </span>
                </button>
              </div>
            ),
          },
        ]
      : []),
  ];

  const table = useReactTable({
    data: data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting: sorting,
      globalFilter: filtering,
      rowSelection,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setFiltering,
    onRowSelectionChange: setRowSelection,
    getRowId: (row) => row._id, // Ensure unique IDs for rows
    enableRowSelection: true, // Enables row selection
  });

  // get Product
  useEffect(() => {
    const getProduct = async () => {
      try {
        const res = await fetch("/api/config/product/product");
        
        if (!res.ok) {
          console.error(`Products API error: ${res.status} - ${res.statusText}`);
          // Try to get more details about the error
          try {
            const errorDetails = await res.json();
            console.error("Error details:", errorDetails);
            return toast.error(`API Error: ${res.status} - ${errorDetails.message || res.statusText}`);
          } catch (jsonError) {
            // If we can't parse the JSON, just show the status
            return toast.error(`Something went wrong! ${res.status} - ${res.statusText}`);
          }
        }
        
        const data = await res.json();
        
        if (!data.success) {
          console.error("API returned success: false", data);
          toast.error(data.message || "Failed to load product data");
          return;
        }
        
        if (!data.data || !Array.isArray(data.data)) {
          console.error("API returned invalid data format:", data);
          toast.error("Invalid data format received from server");
          return;
        }
        
        setProductData(data.data);
      } catch (error) {
        console.error("Error fetching product data:", error);
        toast.error(`Error loading products: ${error.message}`);
      }
    };
    getProduct();
  }, []);
  // Update price

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSprice({ ...sprice, [name]: value });
  };

  const handlePriceChange = (index, key, value) => {
    const updatedProducts = [...sprice.products];
    
    // Handle different types of values appropriately
    if (key === "sellingPrice") {
      // Ensure price is a valid number
      const numValue = parseFloat(value);
      updatedProducts[index][key] = isNaN(numValue) ? 0 : numValue;
    } else {
      updatedProducts[index][key] = value;
    }
    
    setSprice({ ...sprice, products: updatedProducts });
  };
  const handleAddProduct = () => {
    const newProduct = { product: "", sellingPrice: "" };
    setSprice({ ...sprice, products: [...sprice.products, newProduct] });
  };

  const handleRemovePrice = (index) => {
    const updatedProducts = [...sprice.products];
    updatedProducts.splice(index, 1);
    setSprice({ ...sprice, products: updatedProducts });
  };

  useEffect(() => {
    if (updateId) {
      const targetData = data.find((item) => item._id === updateId);
      if (targetData) {
        setFilteredData(targetData);
        // Initialize with the actual data from the selected price
        setSprice({
          name: targetData.name || "",
          products: targetData.products.map(product => ({
            product: product.product._id || product.product,
            sellingPrice: product.sellingPrice || 0
          })) || []
        });
        setModalOpen(true);
      }
    }
  }, [updateId, data]);

  const updatePrice = async (e) => {
    e.preventDefault();
    const { name, products } = sprice;
    
    // Validate required fields
    if (!name) {
      toast.error("Price list name is required");
      return;
    }
    
    if (!products || products.length === 0) {
      toast.error("At least one product is required");
      return;
    }
    
    // Validate each product has both product and price
    const invalidProducts = products.filter(p => !p.product || p.sellingPrice === undefined || p.sellingPrice === null);
    if (invalidProducts.length > 0) {
      toast.error("All products must have both a product selected and a selling price");
      return;
    }

    try {
      const response = await fetch(`/api/config/price/${filteredData._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, products }),
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
      toast.error("An error occurred while updating the price list");
    }
  };

  const toggleModal = () => {
    setModalOpen((prev) => !prev);
  };

  // Handle edit click
  const handleEditClick = (price) => {
    setEditingPrice(price);
    setShowModal(true);
  };

  // Handle update
  const handleUpdate = async (updatedData) => {
    try {
      const res = await fetch(`/api/config/price/price?id=${editingPrice._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      if (!res.ok) {
        throw new Error(`API Error: ${res.status} - ${res.statusText}`);
      }

      const result = await res.json();
      if (result.success) {
        toast.success("Price list updated successfully");
        fetchData(); // Refresh the data
        setShowModal(false);
        setEditingPrice(null);
      } else {
        toast.error(result.message || "Failed to update price list");
      }
    } catch (error) {
      console.error("Error updating price:", error);
      toast.error(error.message || "Error updating price list");
    }
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
          Price List
        </TanStackTable>
      </div>
      {isModalOpen && (
        <div
          id="crud-modal"
          tabIndex="-1"
          className="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full md:inset-0 h-screen bg-black bg-opacity-50"
        >
          <div className="relative w-full max-w-3xl max-h-full overflow-y-auto">
            {/* <!-- Modal content --> */}
            <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
              {/* <!-- Modal header --> */}
              <div className="sticky top-0 z-10 flex items-center justify-between bg-gray-50 p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                <h3 className="text-blue-600 dark:text-white font-extrabold text-lg">
                  Update Price List
                </h3>
                <button
                  onClick={toggleModal}
                  type="button"
                  className="text-red-600 outline outline-solid outline-red-600 bg-transparent hover:bg-red-600 hover:text-gray-200 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                >
                  <svg
                    className="w-3 h-3"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 14"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                    />
                  </svg>
                  <span className="sr-only">Close modal</span>
                </button>
              </div>
              <hr className="h-px bg-[#7249FF] border-0 dark:bg-gray-700"></hr>
              {/* <!-- Modal body --> */}
              <div className="p-4 md:p-5 overflow-y-auto max-h-[calc(100vh-120px)]">
                <form className="w-full" onSubmit={updatePrice}>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="md:col-span-4">
                      <label
                        htmlFor="name"
                        className="block text-[0.7rem] font-semibold text-gray-900 dark:text-white"
                      >
                        Price List Name
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          name="name"
                          value={sprice?.name}
                          onChange={handleInputChange}
                          type="text"
                          id="name"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                          required
                        />
                        <button
                          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-bold rounded-lg text-sm px-4 py-1.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                          type="button"
                          onClick={handleAddProduct}
                        >
                          Add Product
                        </button>
                      </div>
                    </div>
                    
                    {/* Product List */}
                    {sprice.products.length > 0 && (
                      <div className="md:col-span-4">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <h4 className="font-semibold mb-2">Products</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {sprice.products.map((product, index) => (
                              <div key={index} className="bg-white p-3 rounded-lg border">
                                <div className="mb-2">
                                  <label
                                    htmlFor={`product-${index}`}
                                    className="block text-[0.7rem] font-semibold text-gray-900 dark:text-white"
                                  >
                                    Product
                                  </label>
                                  <select
                                    id={`product-${index}`}
                                    value={product.product}
                                    onChange={(e) =>
                                      handlePriceChange(index, "product", e.target.value)
                                    }
                                    name="product"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                  >
                                    <option value="">Select Product</option>
                                    {productData.map((item) => (
                                      <option key={item._id} value={item._id}>
                                        {item.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div className="mb-2">
                                  <label
                                    htmlFor={`price-${index}`}
                                    className="block text-[0.7rem] font-semibold text-gray-900 dark:text-white"
                                  >
                                    Selling Price
                                  </label>
                                  <input
                                    name="sellingPrice"
                                    value={product.sellingPrice}
                                    onChange={(e) =>
                                      handlePriceChange(
                                        index,
                                        "sellingPrice",
                                        e.target.value
                                      )
                                    }
                                    type="number"
                                    id={`price-${index}`}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    required
                                  />
                                </div>
                                <button
                                  className="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-3 py-1 text-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800"
                                  type="button"
                                  onClick={() => handleRemovePrice(index)}
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="text-white inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                  >
                    Update Price List
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showModal && editingPrice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">Edit Price List</h2>
            <PriceForm
              initialData={editingPrice}
              onSubmit={handleUpdate}
              onCancel={() => {
                setShowModal(false);
                setEditingPrice(null);
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default TablePriceList;
