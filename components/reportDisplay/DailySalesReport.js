"use client";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import TableTransfer from "@/components/TableComponents/TableTransfer";

const TransferReport = () => {
  const [transferData, setTransferData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Format dates for API
        const formattedStartDate = startDate.toISOString().split('T')[0];
        const formattedEndDate = endDate.toISOString().split('T')[0];
        
        const res = await fetch(`/api/report/transfers?startDate=${formattedStartDate}&endDate=${formattedEndDate}`);
        if (!res.ok) {
          return toast.error(`Something went wrong! ${res.status}`);
        }
        const data = await res.json();
        setTransferData(data.data);
      } catch (error) {
        toast.error("Failed to fetch transfer data");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [startDate, endDate]);

  const handleStartDateChange = (e) => {
    setStartDate(new Date(e.target.value));
  };

  const handleEndDateChange = (e) => {
    setEndDate(new Date(e.target.value));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white p-4 rounded-md shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Transfer Report</h2>
        
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
        </div>
        
        <TableTransfer data={transferData} loading={loading} />
      </div>
    </div>
  );
};

export default TransferReport;
