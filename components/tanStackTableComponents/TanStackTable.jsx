import React from 'react';
import LoadingComponent from '../ui/LoadingComponent';
import { flexRender } from '@tanstack/react-table';

const upArrow = String.fromCodePoint(0x2B06);
const downArrow = String.fromCodePoint(0x2B07);

const TanStackTable = ({ table, filtering, loading, children, setFiltering }) => {
  return (
    <div className="w-full overflow-x-auto">
      <div className="flex flex-col md:flex-row justify-between bg-gray-50 p-2">
        <h3 className="pl-2 text-blue-600 font-extrabold text-lg">{children}</h3>
        <div className="relative flex justify-end self-end w-full md:w-1/2 lg:w-1/3 xl:w-1/4 mt-2 md:mt-0">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <svg
              className="w-4 h-4 text-gray-500"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              />
            </svg>
          </div>
          <input
            type="search"
            value={filtering}
            onChange={(e) => setFiltering(e.target.value)}
            className="block w-full p-2 ps-10 text-sm text-gray-900 border border-gray-600 rounded-lg bg-gray-50 focus:ring-gray-100 focus:border-gray-300"
            placeholder="Search..."
          />
        </div>
      </div>

      {loading ? (
        <LoadingComponent />
      ) : (
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-2 md:px-4 py-1 border-b-4 border-t-4 font-bold cursor-pointer"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getIsSorted() && (header.column.getIsSorted() === 'asc' ? upArrow : downArrow)}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="bg-white even:bg-gray-50 border-b">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-2 md:px-4  text-gray-900">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="flex justify-center p-1">
        <nav aria-label="Page navigation example">
          <ul className="flex items-center space-x-2 text-sm">
            <li>
              <button
                onClick={() => table.setPageIndex(0)}
                className="px-3 py-1 border rounded-lg hover:bg-gray-200"
              >
                First
              </button>
            </li>
            <li>
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="px-3 py-1 border rounded-lg hover:bg-gray-200 disabled:opacity-50"
              >
                Prev
              </button>
            </li>
            <li>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="px-3 py-1 border rounded-lg hover:bg-gray-200 disabled:opacity-50"
              >
                Next
              </button>
            </li>
            <li>
              <button
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                className="px-3 py-1 border rounded-lg hover:bg-gray-200"
              >
                Last
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default TanStackTable;
