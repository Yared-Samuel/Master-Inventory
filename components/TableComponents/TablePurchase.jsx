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
import { formatQuantity, debugQuantity, formatPurchaseQuantity } from "@/lib/client/quantityUtils";

const TablePurchase = () => {
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
    const [debug, setDebug] = useState(false);
    const [columnVisibility, setColumnVisibility] = useState({
      tin: false,
    });

    const router = useRouter();
    const columnHelper = createColumnHelper();

    useEffect(() => {
        const fetchData = async () => {
          setLoading(true);
          setError(null);
          try {
            const res = await fetch("/api/transaction/purchase");
            if (!res.ok) {
              return toast.error(`Something went wrong! ${res.status}`);
            }
            const data = await res.json();
            
            // Debug the first item
            if (data?.data?.length > 0) {
              console.log("Sample purchase data:", data.data[0]);
            }
            
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

      // Function to format currency values
      const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(value);
      };

      // Columns
      const columns = [
        {
          header: "Transaction Type",
          accessorKey: "transactionType",
          cell: (info) => info.getValue()?.charAt(0).toUpperCase() + info.getValue()?.slice(1) || "Purchase"
        },
        {
            header: "Store",
            accessorFn: (row)=> row.fromStore?.name,
        },
        {
            header: "Product",
            accessorFn: (row)=> row.productId?.name,
        },
        {
          header: "Quantity",
          cell: ({ row }) => {
            const transaction = row.original;
            
            // Show debug info if enabled
            if (debug) {
              return <pre>{JSON.stringify(debugQuantity(transaction.quantity), null, 2)}</pre>;
            }
            
            // If formattedQuantity is already provided, use it
            if (transaction.formattedQuantity) {
              return transaction.formattedQuantity;
            }
            
            // Use our purchase-specific formatting utility
            const product = transaction.productId;
            if (product) {
              return formatPurchaseQuantity(
                transaction.quantity, 
                product.measurment_name
              );
            }
            
            // Fallback: just show the quantity
            return transaction.quantity || '0';
          },
        },
        {
          header: "Total Price",
          accessorKey: "totalPrice",
          cell: (info) => formatCurrency(info.getValue() || 0)
        },
        {
          header: "Remaining",
          cell: ({ row }) => {
            const transaction = row.original;
            
            // Show debug info if enabled
            if (debug) {
              return <pre>{JSON.stringify(debugQuantity(transaction.remaining), null, 2)}</pre>;
            }
            
            // If formattedRemaining is already provided, use it
            if (transaction.formattedRemaining) {
              return transaction.formattedRemaining;
            }
            
            // For remaining values, we still use the full formatting
            const product = transaction.productId;
            if (product) {
              return formatQuantity(
                transaction.remaining, 
                product.measurment_name, 
                product.sub_measurment_name, 
                product.sub_measurment_value || 1
              );
            }
            
            // Fallback: just show the remaining value
            return transaction.remaining || '0';
          },
        },
        {
          header: "Tin",
          accessorKey: "tin",
        },
        {
          header: "Date",
          accessorKey: "date",
          cell: (info) => info.getValue() ? new Date(info.getValue()).toLocaleDateString() : 'N/A'
        },
        ...(auth.role === "admin"
            ? [
                {
                    header: "Created By",
                    accessorFn: (row) => row.user?.name || 'N/A',
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
            columnVisibility
          },
          onSortingChange: setSorting,
          getSortedRowModel: getSortedRowModel(),
          onGlobalFilterChange: setFiltering,
          onRowSelectionChange: setRowSelection,
          getRowId: (row) => row._id, // Ensure unique IDs for rows
          enableRowSelection: true, // Enables row selection
          onColumnVisibilityChange: setColumnVisibility,
        });
        
        return (
            <>
              <div className="bg-slate-100 mt-4 py-1 rounded-md shadow-md">
                {process.env.NODE_ENV === "development" && (
                  <div className="p-2">
                    <button 
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-sm"
                      onClick={() => setDebug(!debug)}
                    >
                      {debug ? "Hide Debug Info" : "Show Debug Info"}
                    </button>
                  </div>
                )}
                <TanStackTable
                  table={table}
                  filtering={filtering}
                  setFiltering={setFiltering}
                  loading={loading}
                >
                  Purchase Transactions
                </TanStackTable>
              </div>
            </>
          );
        };

export default TablePurchase