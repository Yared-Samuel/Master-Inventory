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

const TableTransferList = () => {
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

    const router = useRouter();

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
            header: "From",
            accessorFn: (row)=> row.fromStore?.name,
        },
        {
            header: "To",
            accessorFn: (row)=> row.ToStore?.name,
        },
        {
            header: "Store Type",
            accessorFn: (row)=> row.productId?.name,
        },
        {
          header: "Quantity",
          accessorKey: "quantity",
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
                  Product List
                </TanStackTable>
              </div>
            </>
  )
}

export default TableTransferList