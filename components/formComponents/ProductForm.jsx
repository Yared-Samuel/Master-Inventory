import { productTypes } from '@/lib/constants';
import LoadingComponent from '../ui/LoadingComponent'
import React, { useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from 'next/router';
const initialState = {
  name: "",
  type: "",
  measurment_name: "",
  sub_measurment_name: "",
  sub_measurment_value: 1,
};
const ProductForm = () => {
  const router = useRouter()
  const [product, setPoduct] = useState(initialState);
  const [loading, setLoading] = useState(false)
  const {
    name,
    type,
    measurment_name,
    sub_measurment_name,
    sub_measurment_value,
  } = product;

  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPoduct({ ...product, [name]: value });
  };

  const saveProduct = async (e) => {
    e.preventDefault();

    if(!name || !type || !measurment_name) {
      toast.error("The first 3 fields are required")
    }

    try {
      setLoading(true)
      const response = await fetch("/api/config/product/product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          type,
          measurment_name,
          sub_measurment_name,
          sub_measurment_value,
        }),
      });
      const data = await response.json();
      

      if (data.success) {
        toast.success(data.message, {
          autoClose: 2000, // Display toast for 3 seconds
        });
        setTimeout(() => {
          router.reload(); // Reload the page after a delay
        }, 2000);
      }
    } catch (error) {
      toast.error(data.message);
    } finally {
      setLoading(false)
    }
  };
  return (

   
    
      <div className="bg-slate-100 px-4 py-1 rounded-md shadow-md">
        <form onSubmit={saveProduct}>
          {
            loading ? <LoadingComponent /> : (
              <div className="grid md:grid-cols-3 lg:grid-cols-5">
            <div>
              <label
                htmlFor="name"
                className="block  text-[0.7rem] font-semibold text-gray-900 dark:text-white"
              >
                Product Name{" "}
                {/* <span className="text-white bg-slate-600 p-1 border rounded-lg">
                  የምርት ስም
                </span> */}
              </label>
              <input
                name="name"
                value={product?.name}
                onChange={handleInputChange}
                type="text"
                id="name"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-5/6 p-1.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label
                htmlFor="type"
                className="block  text-[0.7rem] font-semibold text-gray-900 dark:text-white"
              >
                Type{" "}
                {/* <span className="text-white bg-slate-600 p-1 border rounded-lg">
                  አይነት
                </span> */}
              </label>
              <select
                id="type"
                value={product?.type}
                onChange={handleInputChange}
                name="type"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-5/6 p-1.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              >
                {productTypes.map((item) => (
                  <option key={item.type} value={item.type}>
                    {item.type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="measurmant_name"
                className="block  text-[0.7rem] font-semibold text-gray-900 dark:text-white text-wrap"
              >
                Measurment Name{" "}
                {/* <span className="text-white bg-slate-600 p-1 border rounded-lg">
                  የመለኪያ ስም
                </span> */}
              </label>
              <input
                name="measurment_name"
                value={product?.measurment_name}
                onChange={handleInputChange}
                type="text"
                id="measurmant_name"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-5/6 p-1.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label
                htmlFor="sub_measurment_name"
                className="block  text-[0.7rem] font-semibold text-gray-900 dark:text-white"
              >
                Sub-Measurment{" "}
                {/* <span className="text-white bg-slate-600 p-1 border rounded-lg">
                  ችርቻሮ መለኪያ
                </span> */}
              </label>
              <input
                name="sub_measurment_name"
                value={product?.sub_measurment_name}
                onChange={handleInputChange}
                type="text"
                id="sub_measurment_name"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-5/6 p-1.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                
              />
            </div>
            <div>
              <label
                htmlFor="sub_measurment_value"
                className="block  text-[0.7rem] font-semibold text-gray-900 dark:text-white"
              >
                Sub-Measurment Value{" "}
                {/* <span className="text-white bg-slate-600 p-1 border rounded-lg">
                  ችርቻሮ መጠን
                </span> */}
              </label>
              <input
                name="sub_measurment_value"
                value={product?.sub_measurment_value}
                onChange={handleInputChange}
                type="number"
                id="sub_measurment_value"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-5/6 p-1.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                
              />
            </div>
          </div>
            )
          }
          
          <button
            type="submit"
            className="text-white mt-1 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-1/2  sm:w-auto px-4 py-1.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Submit
          </button>
        </form>
      </div>
    
  )
}

export default ProductForm