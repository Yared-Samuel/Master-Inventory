"use client";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  createColumnHelper,
  getSortedRowModel,
} from "@tanstack/react-table";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import TanStackTable from "../tanStackTableComponents/TanStackTable";
import { toast } from "react-toastify";
import { decodeQuantity, formatQuantity, debugQuantity } from "@/lib/client/quantityUtils";

const TableBalance = () => {
  const [sorting, setSorting] = useState([]);
  const [filtering, setFiltering] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debug, setDebug] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/report/allRemaining");
        if (!res.ok) {
          return toast.error(`Something went wrong! ${res.status}`);
        }
        const data = await res.json();
        
        // Log the first product to debug
        if (data?.data?.stores?.length > 0 && data.data.stores[0].products.length > 0) {
          console.log("Sample product data:", data.data.stores[0].products[0]);
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

  const columns = [
    {
      header: "Store",
      accessorFn: (row) => row.storeName,
    },
    {
      header: "Product",
      accessorFn: (row) => row.productName,
    },
    {
      header: "Remaining",
      cell: ({ row }) => {
        const product = row.original;
        
        // If we have a debug flag set, return detailed debug info
        if (debug) {
          const debugInfo = debugQuantity(product.remaining);
          return <pre>{JSON.stringify(debugInfo, null, 2)}</pre>;
        }
        
        // If displayRemaining from API is available and not empty, use it
        if (product.displayRemaining) {
          return product.displayRemaining;
        }
        
        // Use our client-side utility for consistent formatting
        return formatQuantity(
          product.remaining, 
          product.measurementUnit, 
          product.subMeasurementUnit, 
          product.subMeasurementValue || 1
        );
      }
    },
    {
      header: "Unit",
      accessorKey: "measurementUnit",
    },
    {
      header: "Last Updated",
      accessorKey: "lastUpdated",
      cell: ({ getValue }) => getValue() ? new Date(getValue()).toLocaleDateString() : 'N/A',
    },
    {
      header: "Last Transaction",
      accessorKey: "lastTransactionType",
      cell: ({ getValue }) => getValue() ? getValue().charAt(0).toUpperCase() + getValue().slice(1) : 'N/A',
    },
  ];

  // Flatten the data structure for the table
  const flattenedData = data?.stores?.flatMap(store =>
    store.products.map(product => ({
      storeId: store.storeId,
      storeName: store.storeName,
      productId: product.productId,
      productName: product.productName,
      remaining: product.encodedRemaining, // Use the encoded value directly
      displayRemaining: product.displayRemaining, // Use display string from API if available
      measurementUnit: product.measurementUnit,
      subMeasurementUnit: product.subMeasurementUnit,
      subMeasurementValue: product.subMeasurementValue,
      lastUpdated: product.lastUpdated,
      lastTransactionType: product.lastTransactionType,
    }))
  ) || [];

  const table = useReactTable({
    data: flattenedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting: sorting,
      globalFilter: filtering,
    },
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onGlobalFilterChange: setFiltering,
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
          Balance Report
        </TanStackTable>
      </div>
    </>
  );
};

export default TableBalance; 