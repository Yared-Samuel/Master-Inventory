"use client";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import TablePurchase from "@/components/TableComponents/TablePurchase";

const DailyPurchaseReport = () => {
  const [purchaseData, setPurchaseData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState("all");
  const [loadingStores, setLoadingStores] = useState(true);

  // Fetch stores list when component mounts
  useEffect(() => {
    const fetchStores = async () => {
      setLoadingStores(true);
      try {
        const res = await fetch('/api/config/store/store');
        if (!res.ok) {
          return toast.error(`Failed to fetch stores: ${res.status}`);
        }
        const data = await res.json();
        setStores(data.data || []);
      } catch (error) {
        toast.error("Failed to fetch stores");
        console.error(error);
      } finally {
        setLoadingStores(false);
      }
    };
    
    fetchStores();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Format dates for API
        const formattedStartDate = startDate.toISOString().split('T')[0];
        const formattedEndDate = endDate.toISOString().split('T')[0];
        
        // Build URL with query parameters
        let url = `/api/report/daily-purchase?startDate=${formattedStartDate}&endDate=${formattedEndDate}`;
        
        // Add store filter if a specific store is selected
        if (selectedStore !== "all") {
          url += `&storeId=${selectedStore}`;
        }
        
        const res = await fetch(url);
        if (!res.ok) {
          return toast.error(`Something went wrong! ${res.status}`);
        }
        const data = await res.json();
        setPurchaseData(data.data);
      } catch (error) {
        toast.error("Failed to fetch purchase data");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [startDate, endDate, selectedStore]); // Add selectedStore as dependency

  const handleStartDateChange = (e) => {
    setStartDate(new Date(e.target.value));
  };

  const handleEndDateChange = (e) => {
    setEndDate(new Date(e.target.value));
  };

  const handleStoreChange = (e) => {
    setSelectedStore(e.target.value);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white p-4 rounded-md shadow-sm">
        
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex items-center gap-2">
            <label htmlFor="start-date" className="text-sm font-medium">
              Start Date:
            </label>
            <input
              id="start-date"
              type="date"
              value={startDate.toISOString().split('T')[0]}
              onChange={handleStartDateChange}
              className="border rounded-md p-1.5"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <label htmlFor="end-date" className="text-sm font-medium">
              End Date:
            </label>
            <input
              id="end-date"
              type="date"
              value={endDate.toISOString().split('T')[0]}
              onChange={handleEndDateChange}
              className="border rounded-md p-1.5"
            />
          </div>
          
          {/* Store selection dropdown */}
          <div className="flex items-center gap-2">
            <label htmlFor="store-select" className="text-sm font-medium">
              Store:
            </label>
            <select
              id="store-select"
              value={selectedStore}
              onChange={handleStoreChange}
              className="border rounded-md p-1.5"
              disabled={loadingStores}
            >
              <option value="all">All Stores</option>
              {stores.map(store => (
                <option key={store._id} value={store._id}>
                  {store.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <TablePurchase data={purchaseData} loading={loading} />
      </div>
    </div>
  );
};

export default DailyPurchaseReport;
