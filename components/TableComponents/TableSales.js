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
import Link from "next/link";
import Image from "next/image";
import TanStackTable from "../tanStackTableComponents/TanStackTable";
import AuthContext from "@/pages/context/AuthProvider";
import { toast } from "react-toastify";
import { useRouter } from "next/router";

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

  // Function to format currency values
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  // Helper function for quantity display
  const formatQuantity = (row) => {
    // If we have a display quantity string already formatted, use it
    if (row.displayQuantity) {
      return row.displayQuantity;
    }
    
    // If we have whole units and remainder, use that format
    if (row.wholeUnits !== undefined && row.remainderSubUnits !== undefined) {
      const product = row.productId;
      if (!product) return row.quantity;
      
      let formattedText = `${row.wholeUnits} ${product.measurment_name}`;
      if (row.remainderSubUnits > 0) {
        formattedText += ` and ${row.remainderSubUnits} ${product.sub_measurment_name}`;
      }
      return formattedText;
    }
    
    // If we have formatted quantity from the API, use it
    if (row.formattedQuantity) {
      return row.formattedQuantity;
    }
    
    // Fall back to building the string ourselves
    const product = row.productId;
    if (!product) return row.quantity;
    
    // If using sub-measurement, convert to proper display format
    if (row.measurementType === 'sub' && row.originalQuantity && product.sub_measurment_value) {
      const totalBottles = row.originalQuantity;
      const bottlesPerCrate = product.sub_measurment_value;
      
      const wholeUnits = Math.floor(totalBottles / bottlesPerCrate);
      const remainderBottles = totalBottles % bottlesPerCrate;
      
      if (wholeUnits > 0 && remainderBottles > 0) {
        return `${wholeUnits} ${product.measurment_name} and ${remainderBottles} ${product.sub_measurment_name}`;
      } else if (wholeUnits > 0) {
        return `${wholeUnits} ${product.measurment_name}`;
      } else {
        return `${remainderBottles} ${product.sub_measurment_name}`;
      }
    }
    
    // Default case - just show with the measurement unit
    if (row.measurementUnit) {
      return `${row.quantity} ${row.measurementUnit}`;
    }
    
    return row.quantity;
  };

  const columns = [
    {
      header: "Transaction Type",
      accessorKey: "transactionType",
      cell: (info) => info.getValue().charAt(0).toUpperCase() + info.getValue().slice(1)
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
      cell: ({ row }) => formatQuantity(row.original),
      // Custom sorting for quantity
      sortingFn: (rowA, rowB) => {
        // Always sort by the actual quantity value
        return rowA.original.quantity - rowB.original.quantity;
      }
    },
    {
      header: "Price",
      accessorKey: "totalPrice",
      cell: (info) => formatCurrency(info.getValue())
    },    
    {
      header: "Remaining",
      accessorKey: "remaining",
      cell: ({ row }) => {
        // If we have a formatted remaining value, use it directly
        if (row.original.formattedRemaining) {
          return row.original.formattedRemaining;
        }
        
        // Otherwise, use the whole units and remainder if available
        if (row.original.wholeUnits !== undefined && row.original.remainderSubUnits !== undefined) {
          const product = row.original.productId;
          if (!product) return row.original.remaining;
          
          let formattedText = `${row.original.wholeUnits} ${product.measurment_name}`;
          if (row.original.remainderSubUnits > 0) {
            formattedText += ` and ${row.original.remainderSubUnits} ${product.sub_measurment_name}`;
          }
          return formattedText;
        }
        
        // Fallback to original display
        const product = row.original.productId;
        if (!product) return row.original.remaining;
        
        return `${row.original.remaining} ${product.measurment_name}`;
      }
    },    
    {
      header: "Date",
      accessorKey: "date",
      cell: (info) => new Date(info.getValue()).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    },
       
    ...(auth.role === "admin"
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
                      href={`#`}
                      onClick={(e) => {
                        e.preventDefault();
                        setUpdateId(row.original._id);
                      }}
                    >
                      <Image
                        src={"/icons/edit-icon.svg"}
                        alt="update"
                        width={20}
                        height={20}
                      />
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
        
        {/* Summary Section */}
        {summary && !loading && (
          <div className="bg-white p-4 m-4 rounded-md shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Transaction Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-3 rounded-md">
                <p className="text-sm text-blue-800">Total Transactions</p>
                <p className="text-2xl font-bold">{summary.totalTransactions}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-md">
                <p className="text-sm text-green-800">Total Quantity</p>
                <p className="text-2xl font-bold">{summary.totalQuantity.toFixed(2)}</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-md">
                <p className="text-sm text-purple-800">Total Sales</p>
                <p className="text-2xl font-bold">{formatCurrency(summary.totalSales)}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default TableSales; 