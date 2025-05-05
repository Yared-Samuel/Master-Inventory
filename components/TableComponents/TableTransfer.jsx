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
import { formatQuantityWithUnits } from "@/lib/utils/formatters";

const TableTransfer = () => {
    const { auth } = useContext(AuthContext);
    const [sorting, setSorting] = useState([]);
    const [filtering, setFiltering] = useState([]);
    const [updateId, setUpdateId] = useState(null);
    const [filteredData, setFilteredData] = useState([]);
    const [rowSelection, setRowSelection] = useState({});
    // const [sprice, setSprice] = useState(initialState);
    const [isModalOpen, setModalOpen] = useState(false);
    const [productData, setProductData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
          setLoading(true);
          setError(null);
          try {
            const res = await fetch("/api/transaction/transfer");
            console.log(res)
            if (!res.ok) {
              return toast.error(`Something went wrong! ${res.status}`);
            }
            const data = await res.json();
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

    // Filter data for storeMan/barMan roles
    useEffect(() => {
      let filtered = data;
      if ((auth.role === "storeMan" || auth.role === "barMan") && auth.store) {
        filtered = filtered.filter(item => item.fromStore?._id === auth.store);
      }
      setFilteredData(filtered);
    }, [data, auth.role, auth.store]);

    const columns = [
        {
          header: "Action",
          accessorKey: "transactionType",
          enableSorting: true,
        },
        {
            header: "Store",
            accessorFn: (row)=> row.fromStore?.name,
            enableSorting: true,
        },
        {
            header: "Product",
            accessorFn: (row)=> row.productId?.name,
            enableSorting: true,
        },
        {
          header: "Quantity",
          accessorKey: "quantity",
          cell: ({ row }) => {
            const transaction = row.original;
            const product = transaction.productId;
            return formatQuantityWithUnits(transaction.quantity, product);
          },
          enableSorting: false,
        },
        {
          header: "Total Price",
          accessorKey: "totalPrice",
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
        ...(auth.role === "admin" || auth.role === "company_admin"
            ? [
                {
                    header: "Created By",
                    accessorFn: (row) => row.user.name,
                    enableSorting: false,
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
                    enableSorting: false,
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
          // columnVisibility
        },
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onGlobalFilterChange: setFiltering,
        onRowSelectionChange: setRowSelection,
        getRowId: (row) => row._id, // Ensure unique IDs for rows
        enableRowSelection: true, // Enables row selection
        // onColumnVisibilityChange: setColumnVisibility,
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
        Transfer
      </TanStackTable>
    </div>
  </>
  )
}

export default TableTransfer