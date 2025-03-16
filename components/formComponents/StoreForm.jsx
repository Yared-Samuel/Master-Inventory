import { productTypes } from "@/lib/constants";
import LoadingComponent from "../ui/LoadingComponent";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/router";

const initialState = {
  name: "",
  type: "",
  Sprice: "",
  operator: "",
  description: "",
  mainStore: false,
  subStore: false,
};

const StoreForm = () => {
  const router = useRouter();
  const [store, setStore] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const { name, Sprice, operator, description, mainStore, subStore } = store;
  const [priceData, setPriceData] = useState([]);

  useEffect(() => {
    const getPrice = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/config/price/price");
        if (!res.ok) {
          return toast.error("Something went wrong!");
        }
        const data = await res.json();
        setPriceData(data.data);
      } catch (error) {
        return toast.error("Data not found");
      } finally {
        setLoading(false);
      }
    };
    getPrice();
  }, [])
  

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === "checkbox") {
      // Handle checkboxes
      if (name === "mainStore") {
        setStore({
          ...store,
          mainStore: checked,
          subStore: false, // Uncheck subStore
          Sprice: checked ? "" : store.Sprice, // Clear Sprice if mainStore is checked
        });
      } else if (name === "subStore") {
        setStore({
          ...store,
          subStore: checked,
          mainStore: false, // Uncheck mainStore
        });
      }
    } else {
      // Handle other inputs
      setStore({ ...store, [name]: value });
    }
  };

  const saveStore = async (e) => {
    e.preventDefault();
    console.log({name, Sprice, operator, description, mainStore, subStore})

    if (!name || (!Sprice && !mainStore)) {
      toast.error("Name and Selling Price are required unless Main Store is checked");
      return; // Stop execution if validation fails
    }

    try {
      setLoading(true);
      const response = await fetch("/api/config/store/store", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          Sprice: mainStore ? null : Sprice, // Send empty Sprice if mainStore is checked
          operator,
          description,
          mainStore,
          subStore,
        }),
      });
      const data = await response.json();

      if (data.success) {
        toast.success(data.message, {
          autoClose: 2000, // Display toast for 2 seconds
        });
        setTimeout(() => {
          router.reload(); // Reload the page after a delay
        }, 2000);
      } else {
        toast.error(data.message); // Show error message if the request fails
      }
    } catch (error) {
      toast.error("An error occurred while saving the store.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-100 px-4 py-1 rounded-md shadow-md">
      <form onSubmit={saveStore}>
        {loading ? (
          <LoadingComponent />
        ) : (
          <div className="grid md:grid-cols-3 lg:grid-cols-7">
            <div>
              <div className="ms-2 text-sm">
                <label
                  htmlFor="mainStore-checkbox"
                  className="block text-[0.7rem] font-semibold text-gray-900 dark:text-white"
                >
                  Main Store
                </label>
              </div>
              <div className="flex items-center h-5">
                <input
                  name="mainStore"
                  checked={store?.mainStore}
                  onChange={handleInputChange}
                  id="mainStore-checkbox"
                  aria-describedby="helper-checkbox-text"
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            </div>
            <div>
              <div className="ms-2 text-sm">
                <label
                  htmlFor="subStore-checkbox"
                  className="block text-[0.7rem] font-semibold text-gray-900 dark:text-white"
                >
                  Sub Store
                </label>
              </div>
              <div className="flex items-center h-5">
                <input
                  name="subStore"
                  checked={store?.subStore}
                  onChange={handleInputChange}
                  id="subStore-checkbox"
                  aria-describedby="helper-checkbox-text"
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            </div>   
            {subStore || mainStore ? (<>
              <div>
              <label
                htmlFor="name"
                className="block text-[0.7rem] font-semibold text-gray-900 dark:text-white"
              >
                Store Name
              </label>
              <input
                name="name"
                value={store?.name}
                onChange={handleInputChange}
                type="text"
                id="name"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-5/6 p-1.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                required
              />
            </div>
      
            <div>
                  <label
                    htmlFor="name"
                    className="block  text-[0.7rem] font-semibold text-gray-900 dark:text-white"
                  >
                    Selling Price{" "}
                    {/* <span className="text-white bg-slate-600 p-1 border rounded-lg">
                  አይነት
                </span> */}
                  </label>
                  <select
                    name="Sprice"
                    value={store?.Sprice}
                    onChange={handleInputChange}
                    type="text"
                    id="measurmant_name"
                    disabled={store.mainStore} // Disable if mainStore is checked
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-5/6 p-1.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    required={!store.mainStore} // Make it required only if mainStore is not checked
                  >
                    {priceData.map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>
            <div>
              <label
                htmlFor="operator"
                className="block text-[0.7rem] font-semibold text-gray-900 dark:text-white"
              >
                Operator
              </label>
              <input
                name="operator"
                value={store?.operator}
                onChange={handleInputChange}
                type="text"
                id="sub_measurment_name"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-5/6 p-1.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="description"
                className="block text-[0.7rem] font-semibold text-gray-900 dark:text-white"
              >
                Description
              </label>
              <input
                name="description"
                value={store?.description}
                onChange={handleInputChange}
                type="text"
                id="sub_measurment_name"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-5/6 p-1.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              />
            </div>
            </>) : 
            (<div className="flex items-center mb-4 text-sm text-blue-800 rounded-lg bg-blue-50 dark:bg-gray-800 dark:text-blue-400" role="alert">
              <svg className="shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
              </svg>
              <span className="sr-only">Info</span>
              <div>
                <span className="font-medium">Select to continue</span> 
              </div>
            </div>)}         
            
            
          </div>
        )}

        <button
          type="submit"
          className="text-white mt-1 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-1/2 sm:w-auto px-4 py-1.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default StoreForm;