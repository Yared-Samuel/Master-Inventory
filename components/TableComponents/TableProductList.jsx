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
  const [product, setPoduct] = useState();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  

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
              <div className="">
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
              </div>
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
        setPoduct({ name: targetData.name, type: targetData.type });
        setModalOpen(true);
      }
    }
  }, [updateId, data]);

  // Update

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPoduct((prevProduct) => ({
      ...prevProduct,
      [name]: value,
    }));
  };

  const updateProduct = async (e) => {
    e.preventDefault();

    const { name, type } = product;
    
    if (!name || !type) {
      toast.error("Both name and type are required");
      return;
    }

    try {
      const response = await fetch(`/api/config/product/${filteredData._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, type }),
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
          className=" overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full md:inset-0 h-screen"
        >
          <div className="relative w-full max-w-md">
            {/* <!-- Modal content --> */}
            <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
              {/* <!-- Modal header --> */}
              <div className="flex items-center justify-between bg-gray-50  p-4 md:p-5 border-b rounded-t dark:border-gray-600 ">
                <h3 className="text-blue-600 dark:text-white font-extrabold text-lg">
                  Update Product
                </h3>
                <button
                  onClick={toggleModal}
                  type="button"
                  className="text-red-600 outline outline-solid outline-red-600 bg-transparent hover:bg-red-600 hover:text-gray-200 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                >
                  <svg
                    className="w-3 h-3 "
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
              <form onSubmit={updateProduct} className="p-4 md:p-5">
                <div className="flex flex-col gap-4 md:flex-row mb-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-[0.7rem] font-semibold text-gray-900 dark:text-white"
                    >
                      Product Name
                    </label>
                    <input
                      name="name"
                      value={product.name || ""}
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
                      className="block text-[0.7rem] font-semibold text-gray-900 dark:text-white"
                    >
                      Type
                    </label>
                    <select
                      id="type"
                      value={product.type || ""}
                      onChange={handleInputChange}
                      name="type"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-5/6 p-1.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
                <button
                  type="submit"
                  className="text-white inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                  Update Product
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TableProductList;
