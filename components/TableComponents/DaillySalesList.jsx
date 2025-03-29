"use client";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  getExpandedRowModel,
} from "@tanstack/react-table";
import React, { useState } from "react";
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const DaillySalesList = ({ data, loading }) => {
  const [sorting, setSorting] = useState([]);
  const [filtering, setFiltering] = useState("");
  const [expanded, setExpanded] = useState({});

  const columns = [
    {
      id: 'expander',
      size: 40,
      header: () => null,
      cell: ({ row }) => (
        <button
          onClick={() => row.toggleExpanded()}
          className="p-2 hover:bg-primary-100 rounded-full transition-colors"
        >
          {row.getIsExpanded() ? (
            <ChevronDownIcon className="h-5 w-5 text-primary-700" />
          ) : (
            <ChevronRightIcon className="h-5 w-5 text-primary-700" />
          )}
        </button>
      ),
    },
    {
      id: 'date',
      header: "Date",
      accessorKey: "date",
      cell: (info) => (
        <span className="font-medium text-secondary-700">
          {new Date(info.getValue()).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </span>
      )
    },    
    {
      id: 'totalSales',
      header: "Total Sales",
      accessorKey: "totalSales",
      cell: (info) => (
        <span className="font-semibold text-primary-900">
          ${info.getValue()}
        </span>
      )
    }
  ];

  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      globalFilter: filtering,
      expanded
    },
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onGlobalFilterChange: setFiltering,
    onExpandedChange: setExpanded,
    getRowId: (row) => row._id,
    enableRowSelection: true,
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
    renderSubComponent: ({ row }) => (
      <div className="p-4 bg-gray-50">
        <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
          {row.original.stores.map((store, index) => (
            <div 
              key={index} 
              className="bg-white p-3 rounded-lg shadow-sm"
            >
              <div className="text-xs md:text-sm text-gray-600">
                {store.storeName}
              </div>
              <div className="text-lg font-semibold text-gray-900">
                ${store.sales}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  });

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Search Bar */}
      <div className="p-4 bg-primary-50 border-b border-primary-100">
        <input
          type="text"
          value={filtering}
          onChange={e => setFiltering(e.target.value)}
          placeholder="Search transactions..."
          className="w-full max-w-md px-4 py-2 rounded-lg border border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-primary-700 text-white">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-sm font-semibold"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <React.Fragment key={row.id}>
                <tr className="border-b border-primary-100 hover:bg-primary-50 transition-colors">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-6 py-4">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
                {row.getIsExpanded() && (
                  <tr>
                    <td colSpan={columns.length}>
                      <div className="bg-primary-50 p-6 border-b border-primary-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {row.original.stores.map((store, index) => (
                            <div 
                              key={index} 
                              className="bg-white rounded-lg shadow-md p-4 border border-primary-100 hover:border-primary-300 transition-colors"
                            >
                              <div className="text-sm text-secondary-600 mb-1">
                                {store.storeName}
                              </div>
                              <div className="text-lg font-bold text-primary-900">
                                ${store.sales}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="bg-primary-50 px-4 py-3 flex items-center justify-between border-t border-primary-100">
        <div className="flex gap-2">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 rounded bg-primary-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-700 transition-colors"
          >
            {"<<"}
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 rounded bg-primary-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-700 transition-colors"
          >
            {"<"}
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 rounded bg-primary-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-700 transition-colors"
          >
            {">"}
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 rounded bg-primary-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-700 transition-colors"
          >
            {">>"}
          </button>
        </div>
        <span className="text-sm text-secondary-600">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </span>
      </div>
    </div>
  );
};

export default DaillySalesList;