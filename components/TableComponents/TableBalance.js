"use client";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";
import { useState, useEffect, useMemo } from "react";
import TanStackTable from "../tanStackTableComponents/TanStackTable";
import { toast } from "react-toastify";
import { formatQuantityWithUnits } from "@/lib/utils/formatters";

const TableBalance = () => {
  const [sorting, setSorting] = useState([]);
  const [filtering, setFiltering] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStore, setSelectedStore] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState("all");

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

  // Memoize the columns to prevent unnecessary re-creation
  const columns = useMemo(() => [
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
        
        // Get the remaining value
        const remaining = Number(product.remaining || product.encodedRemaining || 0);
        
        // Handle products with sub-measurement units (like bottle in a create)
        if (product.subMeasurementUnit && product.subMeasurementValue > 1) {
          const wholeUnits = Math.floor(remaining / product.subMeasurementValue);
          const remainderSubUnits = remaining % product.subMeasurementValue;
          
          if (wholeUnits > 0 && remainderSubUnits > 0) {
            return `${wholeUnits} ${product.measurementUnit} and ${remainderSubUnits} ${product.subMeasurementUnit}`;
          } else if (wholeUnits > 0) {
            return `${wholeUnits} ${product.measurementUnit}`;
          } else {
            return `${remainderSubUnits} ${product.subMeasurementUnit}`;
          }
        }
        
        // For products with no sub-measurement
        return `${remaining} ${product.measurementUnit}`;
      }
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
  ], []);

  // Memoize store options to prevent recalculation on every render
  const storeOptions = useMemo(() => 
    data?.stores?.map(store => ({
      id: store.storeId,
      name: store.storeName
    })) || [], 
    [data?.stores]
  );

  // Get all unique products across all stores
  const productOptions = useMemo(() => {
    if (!data?.stores?.length) return [];
    
    // Create a Map to deduplicate products
    const productsMap = new Map();
    
    data.stores.forEach(store => {
      store.products.forEach(product => {
        if (!productsMap.has(product.productId)) {
          productsMap.set(product.productId, {
            id: product.productId,
            name: product.productName
          });
        }
      });
    });
    
    // Convert Map to array
    return Array.from(productsMap.values());
  }, [data?.stores]);

  // Handle store selection change
  const handleStoreChange = (e) => {
    setSelectedStore(e.target.value);
  };

  // Handle product selection change
  const handleProductChange = (e) => {
    setSelectedProduct(e.target.value);
  };

  // Memoize the flattened data to prevent recalculation on every render
  const flattenedData = useMemo(() => {
    if (!data?.stores?.length) return [];
    
    // Case 1: Only product selected (show sum across all stores)
    if (selectedProduct !== "all" && selectedStore === "all") {
      // First, gather all occurrences of this product across stores
      const productInstances = [];
      
      data.stores.forEach(store => {
        const productInStore = store.products.find(p => p.productId === selectedProduct);
        if (productInStore) {
          productInstances.push({
            storeId: store.storeId,
            storeName: store.storeName,
            ...productInStore
          });
        }
      });
      
      // If no instances found, return empty array
      if (productInstances.length === 0) return [];
      
      // If only one instance, return it directly
      if (productInstances.length === 1) {
        const instance = productInstances[0];
        return [{
          storeId: instance.storeId,
          storeName: instance.storeName,
          productId: instance.productId,
          productName: instance.productName,
          remaining: instance.encodedRemaining,
          displayRemaining: instance.displayRemaining,
          measurementUnit: instance.measurementUnit,
          subMeasurementUnit: instance.subMeasurementUnit,
          subMeasurementValue: instance.subMeasurementValue,
          lastUpdated: instance.lastUpdated,
          lastTransactionType: instance.lastTransactionType,
        }];
      }
      
      // Calculate combined remaining quantity
      let totalRemaining = 0;
      productInstances.forEach(instance => {
        totalRemaining += Number(instance.encodedRemaining || 0);
      });
      
      // Use the first instance for product details
      const firstInstance = productInstances[0];
      
      // Check if this product has sub-measurement units
      let displayRemaining;
      if (firstInstance.subMeasurementUnit && firstInstance.subMeasurementValue > 1) {
        // Calculate whole units and remainder 
        const wholeUnits = Math.floor(totalRemaining / firstInstance.subMeasurementValue);
        const remainderSubUnits = totalRemaining % firstInstance.subMeasurementValue;
        
        if (wholeUnits > 0 && remainderSubUnits > 0) {
          displayRemaining = `${wholeUnits} ${firstInstance.measurementUnit} and ${remainderSubUnits} ${firstInstance.subMeasurementUnit}`;
        } else if (wholeUnits > 0) {
          displayRemaining = `${wholeUnits} ${firstInstance.measurementUnit}`;
        } else {
          displayRemaining = `${remainderSubUnits} ${firstInstance.subMeasurementUnit}`;
        }
      } else {
        // No sub-measurement
        displayRemaining = `${totalRemaining} ${firstInstance.measurementUnit}`;
      }
      
      // Return a single combined record
      return [{
        storeId: "multiple",
        storeName: "All Stores",
        productId: firstInstance.productId,
        productName: firstInstance.productName,
        remaining: totalRemaining,
        measurementUnit: firstInstance.measurementUnit,
        subMeasurementUnit: firstInstance.subMeasurementUnit,
        subMeasurementValue: firstInstance.subMeasurementValue,
        lastUpdated: new Date().toISOString(),
        lastTransactionType: "combined",
      }];
    }
    
    // Case 2: Standard filtering (specific store/product or all)
    return data.stores.flatMap(store => {
      // Skip this store if a specific store is selected and it's not this one
      if (selectedStore !== "all" && store.storeId !== selectedStore) {
        return [];
      }
      
      // Filter products if a specific product is selected
      let productsToInclude = store.products;
      if (selectedProduct !== "all") {
        productsToInclude = store.products.filter(p => p.productId === selectedProduct);
      }
      
      // Map the filtered products
      return productsToInclude.map(product => ({
        storeId: store.storeId,
        storeName: store.storeName,
        productId: product.productId,
        productName: product.productName,
        remaining: product.encodedRemaining,
        measurementUnit: product.measurementUnit,
        subMeasurementUnit: product.subMeasurementUnit,
        subMeasurementValue: product.subMeasurementValue,
        lastUpdated: product.lastUpdated,
        lastTransactionType: product.lastTransactionType,
      }));
    });
  }, [data?.stores, selectedStore, selectedProduct]);

  // Limit the initial page size for better performance
  const table = useReactTable({
    data: flattenedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting: sorting,
      globalFilter: filtering,
      pagination: {
        pageIndex: 0,
        pageSize: 25, // Set a reasonable page size
      },
    },
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onGlobalFilterChange: setFiltering,
  });

  // Render error message if there was an error loading data
  if (error) {
    return (
      <div className="bg-red-100 p-4 rounded-md shadow-md text-red-800">
        Error loading data: {error}
      </div>
    );
  }

  return (
    <>
      <div className="bg-slate-100 mt-4 py-1 rounded-md shadow-md">
        <div className="p-2 flex flex-wrap gap-4">
          {/* Store selection dropdown */}
          <div className="flex items-center space-x-2">
            <label htmlFor="store-select" className="text-sm font-medium">
              Select Store:
            </label>
            <select
              id="store-select"
              value={selectedStore}
              onChange={handleStoreChange}
              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-1.5"
            >
              <option value="all">All Stores</option>
              {storeOptions.map(store => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Product selection dropdown */}
          <div className="flex items-center space-x-2">
            <label htmlFor="product-select" className="text-sm font-medium">
              Select Product:
            </label>
            <select
              id="product-select"
              value={selectedProduct}
              onChange={handleProductChange}
              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-1.5"
            >
              <option value="all">All Products</option>
              {productOptions.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
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