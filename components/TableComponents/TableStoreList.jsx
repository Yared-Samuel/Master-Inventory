import AuthContext from "@/pages/context/AuthProvider";
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useState } from "react";
import TanStackTable from "../tanStackTableComponents/TanStackTable";
import Link from "next/link";
import Image from "next/image";
import { toast } from "react-toastify";

const TableStoreList = () => {
  const { auth } = useContext(AuthContext);
  const [sorting, setSorting] = useState([]);
  const [filtering, setFiltering] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [updateId, setUpdateId] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [rowSelection, setRowSelection] = useState({});
  const [store, setStore] = useState({
    name: "",
    Sprice: "",
    operator: "",
    description: "",
    mainStore: false,
    subStore: false,
  });
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [priceData, setPriceData] = useState([]);


  const router = useRouter();
  const columnHelper = createColumnHelper();

  // Fetch data

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/config/store/store");
        if (!res.ok) {
          return toast.error(`Something went wrong! ${res.status}`);
        }
        const data = await res.json();
        setData(data.data);
      } catch (error) {
        toast.error("Data not found");
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Columns

  const columns = [
    
    {
      header: "Name",
      accessorKey: "name",
    },
    {
        header: "Selling Price",
        accessorFn: (row)=> row.Sprice?.name || " - ",
    },
    {
        header: "Store Type",
        accessorFn: (row) => {
          if (row.mainStore) return "Main Store";
          if (row.subStore) return "Sub Store";
          return "Unknown"; // Fallback for data integrity
        },
    },
    {
      header: "Description",
      accessorKey: "description",
    },
    {
      header: "Operator",
      accessorKey: "operator",
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
                      href={`/configs/stores`}
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
        ] : []
    )
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

  useEffect(() => {
    if (updateId) {
      const targetData = data.find((item) => item._id === updateId);
      if (targetData) {
        setFilteredData(targetData);
        setStore({
          name: targetData.name,
          Sprice: targetData.Sprice?._id || targetData.Sprice || "",
          operator: targetData.operator || "",
          description: targetData.description || "",
          mainStore: Boolean(targetData.mainStore),
          subStore: Boolean(targetData.subStore)
        });
        setModalOpen(true);
      }
    }
  }, [updateId, data]);


  // Get price
  useEffect(() => {
    const getPrice = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/config/price/price");
        if (!res.ok) {
          return toast.error("Something went wrong!");
        }
        const data = await res.json();
        setPriceData(data.data);
      } catch (error) {
        return toast.error("Data not found");
      } finally {
        setLoading(false);
      }
    };
    getPrice();
  }, [])

  // Update 

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === "checkbox") {
      // Handle checkboxes
      if (name === "mainStore") {
        setStore({
          ...store,
          mainStore: checked,
          subStore: false,
          Sprice: checked ? "" : store.Sprice,
        });
      } else if (name === "subStore") {
        setStore({
          ...store,
          subStore: checked,
          mainStore: false,
        });
      }
    } else {
      // Handle other inputs
      setStore({ ...store, [name]: value });
    }
  };

  const updateStore = async (e) => {
    e.preventDefault();

    const { name, Sprice, operator, description, mainStore, subStore } = store;
    
    if (!name) {
      toast.error("Store name is required");
      return;
    }
    
    if (!mainStore && !subStore) {
      toast.error("Please select a store type (Main Store or Sub Store)");
      return;
    }
    
    if (subStore && !Sprice) {
      toast.error("Selling price is required for sub store");
      return;
    }

    try {
      const response = await fetch(`/api/config/store/${filteredData._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          name,
          Sprice: mainStore ? null : Sprice,
          operator,
          description,
          mainStore,
          subStore,
        }),
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
      toast.error("An error occurred while updating the store");
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
          Store List
        </TanStackTable>
      </div>
           {/* Update Modal */}
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
                  Update Store
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
                <form className="w-full" onSubmit={updateStore}>
                  {/* Store Type Checkboxes */}
                  <div className="grid grid-cols-2 md:grid-cols-7 gap-4 mb-6">
                    <div>
                      <div className="ms-2 text-sm">
                        <label
                          htmlFor="mainStore-checkbox"
                          className="block text-[0.7rem] font-semibold text-gray-900 dark:text-white"
                        >
                          Main Store
                        </label>
                      </div>
                      <div className="flex items-center h-5">
                      <input
                        name="mainStore"
                        checked={store?.mainStore}
                        onChange={handleInputChange}
                        id="mainStore-checkbox"
                        aria-describedby="helper-checkbox-text"
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      </div>
                    </div>
                    <div>
                      <div className="ms-2 text-sm">
                        <label
                          htmlFor="subStore-checkbox"
                          className="block text-[0.7rem] font-semibold text-gray-900 dark:text-white"
                        >
                          Sub Store
                        </label>
                      </div>
                      <div className="flex items-center h-5">
                      <input
                        name="subStore"
                        checked={store?.subStore}
                        onChange={handleInputChange}
                        id="subStore-checkbox"
                        aria-describedby="helper-checkbox-text"
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      </div>
                    </div>
                  </div>

                  {/* Store Details */}
                  {store.subStore || store.mainStore ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-[0.7rem] font-semibold text-gray-900 dark:text-white"
                    >
                      Store Name
                    </label>
                    <input
                      name="name"
                      value={store.name || ""}
                      onChange={handleInputChange}
                      type="text"
                      id="name"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                  <label
                          htmlFor="Sprice"
                          className="block text-[0.7rem] font-semibold text-gray-900 dark:text-white"
                  >
                          Selling Price
                  </label>
                  <select
                    name="Sprice"
                    value={store?.Sprice}
                    onChange={handleInputChange}
                          id="Sprice"
                          disabled={store.mainStore}
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                          required={!store.mainStore}
                  >
                    <option value={null}>Select Price</option>
                    {priceData.map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
              <label
                htmlFor="operator"
                className="block text-[0.7rem] font-semibold text-gray-900 dark:text-white"
              >
                Operator
              </label>
              <input
                name="operator"
                value={store?.operator}
                onChange={handleInputChange}
                type="text"
                          id="operator"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              />
            </div>
                      
            <div>
              <label
                htmlFor="description"
                className="block text-[0.7rem] font-semibold text-gray-900 dark:text-white"
              >
                Description
              </label>
              <input
                name="description"
                value={store?.description}
                onChange={handleInputChange}
                type="text"
                          id="description"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              />
            </div>
                    </div>
                  ) : (
                    <div className="flex items-center mb-4 text-sm text-blue-800 rounded-lg bg-blue-50 dark:bg-gray-800 dark:text-blue-400" role="alert">
                      <svg className="shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
                      </svg>
                      <span className="sr-only">Info</span>
                      <div>
                        <span className="font-medium">Select to continue</span> 
                      </div>
                    </div>
                  )}

                <button
                  type="submit"
                  className="text-white inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                  Update store
                </button>
              </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TableStoreList;
