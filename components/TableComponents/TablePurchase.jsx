"use client";
import React, { useState, useContext, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  createColumnHelper,
  getSortedRowModel,
} from "@tanstack/react-table";
import Link from "next/link";
import Image from "next/image";
import TanStackTable from "../tanStackTableComponents/TanStackTable";
import AuthContext from "@/pages/context/AuthProvider";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { formatQuantity, debugQuantity, formatPurchaseQuantity } from "@/lib/client/quantityUtils";
import { formatQuantityWithUnits } from "@/lib/utils/formatters";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const TablePurchase = () => {
    const { auth } = useContext(AuthContext);
    const [sorting, setSorting] = useState([]);
    const [filtering, setFiltering] = useState([]);
    const [updateId, setUpdateId] = useState(null);
    const [rowSelection, setRowSelection] = useState({});
    const [isModalOpen, setModalOpen] = useState(false);
    const [productData, setProductData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const [debug, setDebug] = useState(false);
    const [showOnlyTin, setShowOnlyTin] = useState(false);
    const [filteredData, setFilteredData] = useState([]);
    const [columnVisibility, setColumnVisibility] = useState({});
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

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

      useEffect(() => {
        let filtered = data;

        // If user is storeMan or barMan, filter by their assigned store
        if ((auth.role === "storeMan" || auth.role === "barMan") && auth.store) {
          filtered = filtered.filter(item => item.fromStore?._id === auth.store);
        }

        // Date and TIN filtering
        filtered = filtered.filter(item => {
          let passesDateFilter = true;
          if (startDate && endDate) {
            const itemDate = new Date(item.date);
            const endOfDay = new Date(endDate);
            endOfDay.setHours(23, 59, 59, 999);
            passesDateFilter = itemDate >= startDate && itemDate <= endOfDay;
          }
          return passesDateFilter && (!showOnlyTin || (item.tin !== null && item.tin !== undefined));
        });

        setFilteredData(filtered);
      }, [data, showOnlyTin, startDate, endDate, auth.role, auth.store]);

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
            header: "Store",
            accessorFn: (row)=> row.fromStore?.name,
        },
        {
            header: "Product",
            accessorFn: (row)=> row.productId?.name,
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
          header: "Total Price",
          accessorKey: "totalPrice",
          cell: (info) => formatCurrency(info.getValue() || 0)
        },
        {
          header: "Remaining",
          accessorKey: "remaining",
          cell: ({ row }) => {
            const transaction = row.original;
            const product = transaction.productId;
            return formatQuantityWithUnits(transaction.remaining, product);
          }
        },
        ...(auth.role === "admin" || auth.role === "company_admin"
          ? [
              {
                header: "Tin",
                accessorKey: "tin",
              },
            ]
          : []),
        {
          header: "Date",
          accessorKey: "date",
          cell: (info) => info.getValue() ? new Date(info.getValue()).toLocaleDateString() : 'N/A'
        },
        ...(auth.role === "admin" || auth.role === "company_admin"
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
                          className="group relative"
                        >
                          <Image
                            src={"/icons/edit-icon.svg"}
                            alt="update"
                            width={20}
                            height={20}
                          />
                          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                            Update
                          </span>
                        </Link>
                      </div>
                    ),
                  },
            ] : []
        )
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
            columnVisibility
          },
          onSortingChange: setSorting,
          getSortedRowModel: getSortedRowModel(),
          onGlobalFilterChange: setFiltering,
          onRowSelectionChange: setRowSelection,
          getRowId: (row) => row._id,
          enableRowSelection: true,
          onColumnVisibilityChange: setColumnVisibility,
        });
        
        const exportToCSV = () => {
            try {
                // Prepare the data for export
                const exportData = filteredData.map(item => ({
                    Store: item.fromStore?.name || '',
                    Product: item.productId?.name || '',
                    Quantity: formatQuantityWithUnits(item.quantity, item.productId),
                    'Total Price': formatCurrency(item.totalPrice || 0).replace('$', ''),
                    Remaining: formatQuantityWithUnits(item.remaining, item.productId),
                    TIN: item.tin || '',
                    Date: item.date ? new Date(item.date).toLocaleDateString() : '',
                    'Created By': item.user?.name || ''
                }));

                // Create CSV content
                const headers = Object.keys(exportData[0]);
                let csvContent = "data:text/csv;charset=utf-8,";
                
                // Add headers
                csvContent += headers.join(",") + "\n";
                
                // Add data rows
                exportData.forEach(row => {
                    const values = headers.map(header => {
                        const value = String(row[header] || '');
                        // Escape quotes and wrap in quotes if contains comma
                        return value.includes(',') ? `"${value.replace(/"/g, '""')}"` : value;
                    });
                    csvContent += values.join(",") + "\n";
                });

                // Create download link
                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", `purchases_${new Date().toISOString().split('T')[0]}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                toast.success('Export successful!');
            } catch (error) {
                console.error('Error exporting to CSV:', error);
                toast.error('Failed to export data');
            }
        };

        return (
            <>
              <div className="bg-slate-100 mt-4 py-1 rounded-md shadow-md">
                <div className="px-4 flex items-center justify-between">
                  <div className="flex items-center gap-4 p-2">
                    {/* TIN checkbox: only show for company_admin */}
                    {auth.role === "admin" || auth.role === "company_admin" && (
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="showTin"
                          checked={showOnlyTin}
                          onChange={(e) => setShowOnlyTin(e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="showTin" className="text-sm text-gray-700">
                          TIN
                        </label>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <DatePicker
                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
                        selectsStart
                        startDate={startDate}
                        endDate={endDate}
                        placeholderText="Start Date"
                        className="px-2 py-1 text-sm border rounded"
                        dateFormat="yyyy-MM-dd"
                      />
                      <DatePicker
                        selected={endDate}
                        onChange={(date) => setEndDate(date)}
                        selectsEnd
                        startDate={startDate}
                        endDate={endDate}
                        minDate={startDate}
                        placeholderText="End Date"
                        className="px-2 py-1 text-sm border rounded"
                        dateFormat="yyyy-MM-dd"
                      />
                    </div>
                  </div>
                  {/* Export to CSV button: only show for company_admin */}
                  {auth.role === "admin" || auth.role === "company_admin" && (
                    <button
                      onClick={exportToCSV}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Export to CSV
                    </button>
                  )}
                </div>
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