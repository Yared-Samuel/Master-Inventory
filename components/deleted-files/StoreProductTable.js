"use client";
import { useReactTable, getCoreRowModel, getPaginationRowModel, getFilteredRowModel, getSortedRowModel } from "@tanstack/react-table";
import TanStackTable from "../tanStackTableComponents/TanStackTable";
import { useState } from "react";
import { formatQuantity, debugQuantity } from "@/lib/client/quantityUtils";

const StoreProductTable = ({ products, storeName, filtering, setFiltering }) => {
  const [debug, setDebug] = useState(false);

  // Log the first product for debugging
  if (products && products.length > 0 && process.env.NODE_ENV === "development") {
    console.log("Sample store product:", products[0]);
  }

  const columns = [
    {
      header: "Product",
      accessorKey: "productName",
    },
    {
      header: "Remaining",
      cell: ({ row }) => {
        const product = row.original;
        
        // Show debug info if enabled
        if (debug) {
          return <pre>{JSON.stringify(debugQuantity(product.encodedRemaining || product.remaining), null, 2)}</pre>;
        }
        
        // If displayRemaining is available, use it
        if (product.displayRemaining) {
          return product.displayRemaining;
        }
        
        // Use our client-side utility for consistent formatting
        return formatQuantity(
          product.encodedRemaining || product.remaining, 
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

  const table = useReactTable({
    data: products || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      globalFilter: filtering,
    },
    onGlobalFilterChange: setFiltering,
  });

  return (
    <div className="bg-slate-100 mt-4 py-1 rounded-md shadow-md">
      <h1>Yared Delete this </h1>
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
      >
        {storeName} Products
      </TanStackTable>
    </div>
  );
};

export default StoreProductTable; 