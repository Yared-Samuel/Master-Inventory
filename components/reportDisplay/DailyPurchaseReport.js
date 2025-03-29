"use client";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import TablePurchase from "@/components/TableComponents/TablePurchase";
import DailyPurchaseList from "../TableComponents/DailyPurchaseList";

const DailyPurchaseReport = () => {

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState("all");
  const [loadingStores, setLoadingStores] = useState(true);
  const [error, setError] = useState(null);


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
    const fetchDailyPurchase = async () => {
      setLoading(true);

      try {
        const res = await fetch("/api/report/daily-purchase")
        if (!res.ok) {
          throw new Error(`Failed to fetch daily sales: ${res.status}`);
        }
        const data = await res.json();
        setData(data.data || []);
        
      } catch (error) {
        console.error("Store fetch error:", error);
        setError(error)

        toast.error("Failed to fetch stores");
      } finally { 
        setLoading(false);
      }
    }
    fetchDailyPurchase();
  },[])

  const handleStoreChange = (e) => {
    setSelectedStore(e.target.value);
  };

  if (error) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="text-red-500">
          Error loading sales data: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="px-6 py-4 bg-primary-700 border-b border-primary-600">
            <h1 className="text-2xl font-bold text-white">Daily Purchase Report</h1>
          </div>
          
          <div className="p-6">
            {/* Store selection dropdown */}
            <div className="mb-6">
              <label 
                htmlFor="store-select" 
                className="block text-sm font-medium text-secondary-700 mb-2"
              >
                Select Store
              </label>
              <select
                id="store-select"
                value={selectedStore}
                onChange={handleStoreChange}
                className="w-full max-w-xs px-3 py-2 rounded-lg border border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700"></div>
              </div>
            ) : (
        
        <DailyPurchaseList data={data} loading={loading} />
      )}
      </div>
    </div>
  </div>
</div>
  );
};

export default DailyPurchaseReport;
