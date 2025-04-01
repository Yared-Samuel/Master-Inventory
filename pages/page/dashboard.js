'use client'
import useRedirectLoggedOutUser from "@/lib/redirect"
import { useContext, useState } from "react"
import Layout from "@/components/Layout"
import AuthContext from "../context/AuthProvider"
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

const Dashboard = () => {

  const { auth } = useContext(AuthContext)
  useRedirectLoggedOutUser()

  // Sample data for the line chart
  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        fill: true,
        label: 'Monthly Revenue',
        data: [150, 180, 160, 170, 150, 170, 180, 190, 180, 185, 180, 175],
        borderColor: 'rgb(75, 100, 233)',
        backgroundColor: 'rgba(75, 100, 233, 0.1)',
        tension: 0.4,
      },
      {
        fill: true,
        label: 'Monthly Profit',
        data: [50, 60, 55, 45, 50, 55, 60, 65, 70, 75, 70, 65],
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.1)',
        tension: 0.4,
      }
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">$120,369</h2>
              <p className="text-sm text-gray-600">Active Deal</p>
            </div>
            <div className="text-green-500 text-sm">+20% From last month</div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">$234,210</h2>
              <p className="text-sm text-gray-600">Revenue Total</p>
            </div>
            <div className="text-green-500 text-sm">+9.0% From last month</div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">874</h2>
              <p className="text-sm text-gray-600">Closed Deals</p>
            </div>
            <div className="text-red-500 text-sm">-4.5% From last month</div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Statistics Chart */}
        <div className="md:col-span-2 bg-white rounded-lg p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Statistics</h3>
              <p className="text-sm text-gray-600">Target you have set for each month</p>
            </div>
            <div className="flex gap-4">
              <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md">Monthly</button>
              <button className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">Quarterly</button>
              <button className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">Annually</button>
            </div>
          </div>
          <div className="flex gap-8 mb-4">
            <div>
              <h4 className="text-2xl font-bold text-gray-800">$212,142.12</h4>
              <p className="text-sm text-gray-600">Avg. Yearly Profit</p>
              <span className="text-green-500 text-sm">+23.2%</span>
            </div>
            <div>
              <h4 className="text-2xl font-bold text-gray-800">$30,321.23</h4>
              <p className="text-sm text-gray-600">Avg. Yearly Profit</p>
              <span className="text-red-500 text-sm">-12.3%</span>
            </div>
          </div>
          <div className="h-[300px]">
            <Line options={chartOptions} data={chartData} />
          </div>
        </div>

        {/* Estimated Revenue */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Estimated Revenue</h3>
              <p className="text-sm text-gray-600">Target you have set for each month</p>
            </div>
            <button className="text-gray-400">•••</button>
          </div>
          
          <div className="w-48 h-48 mx-auto mb-6">
            <CircularProgressbar
              value={90}
              text="$90"
              styles={buildStyles({
                textSize: '16px',
                pathColor: '#4F46E5',
                textColor: '#1F2937',
                trailColor: '#E5E7EB',
              })}
            />
            <p className="text-center mt-2 text-sm text-gray-600">June Goals</p>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Marketing</span>
                <span>85%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full">
                <div className="h-2 bg-blue-600 rounded-full" style={{ width: '85%' }}></div>
              </div>
              <div className="text-right text-sm text-gray-600 mt-1">$30,569.00</div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Sales</span>
                <span>55%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full">
                <div className="h-2 bg-blue-600 rounded-full" style={{ width: '55%' }}></div>
              </div>
              <div className="text-right text-sm text-gray-600 mt-1">$20,486.00</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

Dashboard.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>
}

export default Dashboard