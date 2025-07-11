"use client";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  createColumnHelper,
  getSortedRowModel,
} from "@tanstack/react-table";
import { useState, useContext, useEffect } from "react";
import TanStackTable from "../tanStackTableComponents/TanStackTable";
import AuthContext from "@/pages/context/AuthProvider";
import { toast } from "react-toastify";

import { formatQuantityWithUnits } from "@/lib/utils/formatters";

const TableSales = () => {
  const { auth } = useContext(AuthContext);
  const [sorting, setSorting] = useState([]);
  const [filtering, setFiltering] = useState([]);
  const [updateId, setUpdateId] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [rowSelection, setRowSelection] = useState({});
  const [isModalOpen, setModalOpen] = useState(false);
  const [productData, setProductData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [params, setParams] = useState({
    startDate: new Date(),
    endDate: new Date()
  });

  const handleParamsChange = (e) => {
    setParams((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

    const handleView = async () => {
      setLoading(true);
      setError(null);
      try {
          const queryParams = new URLSearchParams(params).toString();
        const res = await fetch(`/api/transaction/filtered-view/sales?${queryParams}`);
        if (!res.ok) {
          return toast.error(`Something went wrong! ${res.status}`);
        }
        const data = await res.json();
        setData(data.data);
        setSummary(data.summary || null);
      } catch (error) {
        toast.error("not found");
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    handleView();
  }, [params]);

  // Filter data for storeMan/barMan roles
  useEffect(() => {
    let filtered = data;
    if ((auth.role === "storeMan" || auth.role === "barMan") && auth.store) {
      filtered = filtered.filter(item => item.fromStore?._id === auth.store);
    }
    setFilteredData(filtered);
  }, [data, auth.role, auth.store]);

  // Function to format currency values
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const columns = [
    {
      header: "Date",
      accessorKey: "date",
      cell: (info) => new Date(info.getValue()).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      enableSorting: true,
      sortingFn: (rowA, rowB, columnId) => {
        const a = rowA.getValue(columnId);
        const b = rowB.getValue(columnId);
        return new Date(a) - new Date(b);
      },
    },
    {
      header: "Store",
      accessorFn: (row) => row.fromStore?.name,
      enableSorting: true,
    },
    {
      header: "Product",
      accessorFn: (row) => row.productId?.name,
      enableSorting: true,
    },
    {
      header: "Quantity",
      accessorKey: "quantity",
      cell: ({ row }) => {
        const transaction = row.original;
        const product = transaction.productId;
        const formattedQuantity = formatQuantityWithUnits(transaction.quantity, product);
        return (
          <span className="bg-green-100 text-green-800 text-base me-2 px-2.5 py-0.5 rounded-sm dark:bg-green-900 dark:text-green-300">{formattedQuantity}</span>
        )
      },
      enableSorting: false,
    },
    {
      header: "Price",
      accessorKey: "totalPrice",
      cell: (info) => formatCurrency(info.getValue()),
      enableSorting: false,
    },    
    {
      header: "Remaining",
      accessorKey: "remaining",
      cell: ({ row }) => {
        const transaction = row.original;
        const product = transaction.productId;
        return formatQuantityWithUnits(transaction.remaining, product);
      },
      enableSorting: false,
    },    
  ];


  const table = useReactTable({
    data: filteredData,
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
    getSortedRowModel: getSortedRowModel(),
    onGlobalFilterChange: setFiltering,
    onRowSelectionChange: setRowSelection,
    getRowId: (row) => row._id, // Ensure unique IDs for rows
    enableRowSelection: true, // Enables row selection
  });
  
  return (
    <>
      <div className="bg-slate-100 mt-4 py-1 rounded-md shadow-md">
        <div className="flex items-center justify-between gap-2">

      <div className="flex items-center gap-2">
                      <input
                        type="date"
                        name="startDate"
                        onChange={handleParamsChange}
                        value={params.startDate}
                        placeholderText="Start Date"
                        className="px-2 py-1 text-sm border rounded"
                      />
                      <input
                        type="date"
                        name="endDate"
                        
                        onChange={handleParamsChange}
                        value={params.endDate}
                        placeholderText="End Date"
                        className="px-2 py-1 text-sm border rounded"
                      />
                    </div>
                    <button
                        onClick={handleView}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm flex items-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
</svg>
View 

                      </button>
        </div>
        <TanStackTable
          table={table}
          filtering={filtering}
          setFiltering={setFiltering}
          loading={loading}
        >
          Sales Transactions
        </TanStackTable>

      </div>
    </>
  );
};

export default TableSales; 