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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/transaction/sales");
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
    fetchData();
  }, []);

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
      })
    },

    {
      header: "Store",
      accessorFn: (row) => row.fromStore?.name,
    },
    {
      header: "Product",
      accessorFn: (row) => row.productId?.name,
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
      }
    },
    {
      header: "Price",
      accessorKey: "totalPrice",
      cell: (info) => formatCurrency(info.getValue())
    },    
    // {
    //   header: "Remaining",
    //   accessorKey: "remaining",
    //   cell: ({ row }) => {
    //     const transaction = row.original;
    //     const product = transaction.productId;
    //     return formatQuantityWithUnits(transaction.remaining, product);
    //   }
    // },    
       

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