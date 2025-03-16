import React, { useEffect, useState } from "react";
import LoadingComponent from "../ui/LoadingComponent";
import { toast } from "react-toastify";
import { useRouter } from "next/router";

const initialState = {
  productId: "",
  quantity: 0,
  fromStore: "",
  toStore: "",
  date: "",
};

const TransferForm = () => {
  const router = useRouter();
  const [transfer, setTransfer] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState([]);
  const [store, setStore] = useState([]);
  const { productId, quantity, fromStore, toStore, date } = transfer;

  useEffect(() => {
    const getStore = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/config/store/store");
        if (!res.ok) {
          return toast.error("Something went wrong!");
        }
        const data = await res.json();
        setStore(data.data);
      } catch (error) {
        return toast.error("Data not found");
      } finally {
        setLoading(false);
      }
    };
    getStore();
  }, []);

  useEffect(() => {
    const getProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/config/product/productPurchase");
        if (!res.ok) {
          return toast.error("Something went wrong!");
        }
        const data = await res.json();
        setProduct(data.data);
      } catch (error) {
        return toast.error("Data not found");
      } finally {
        setLoading(false);
      }
    };
    getProduct();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTransfer({ ...transfer, [name]: value });
  };

  const saveTransfer = async (e) => {
    e.preventDefault();
    if (!productId || !quantity || !fromStore || !toStore) {
      return toast.error("All fields marked with * are required");
    }
    console.log(productId, quantity, fromStore, toStore, date)
    
    try {
      setLoading(true);
      const response = await fetch("/api/transaction/transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fromStore,
          toStore,
          productId,
          quantity: Number(quantity),
          date,
        }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success(data.message, {
          autoClose: 2000,
        });
        setTimeout(() => {
          router.reload();
        }, 2000);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-100 px-4 py-1 rounded-md shadow-md">
      <form onSubmit={saveTransfer}>
        {loading ? (
          <LoadingComponent />
        ) : (
          <div className="grid md:grid-cols-3 lg:grid-cols-6">
            <div>
              <label
                htmlFor="fromStore"
                className="block text-[0.7rem] font-semibold text-gray-900 dark:text-white"
              >
                From Store <span className="text-red-600">*</span>
              </label>
              <select
                id="fromStore"
                value={fromStore}
                onChange={handleInputChange}
                name="fromStore"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-5/6 p-1.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              >
                <option value="">Select Store</option>
                {store.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="toStore"
                className="block text-[0.7rem] font-semibold text-gray-900 dark:text-white"
              >
                To Store <span className="text-red-600">*</span>
              </label>
              <select
                id="toStore"
                value={toStore}
                onChange={handleInputChange}
                name="toStore"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-5/6 p-1.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              >
                <option value="">Select Store</option>
                {store.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="productId"
                className="block text-[0.7rem] font-semibold text-gray-900 dark:text-white"
              >
                Product <span className="text-red-600">*</span>
              </label>
              <select
                onChange={handleInputChange}
                value={productId}
                name="productId"
                id="productId"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-5/6 p-1.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              >
                <option value="">Select Product</option>
                {product.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="quantity"
                className="block text-[0.7rem] font-semibold text-gray-900 dark:text-white"
              >
                Quantity <span className="text-red-600">*</span>
              </label>
              <input
                onChange={handleInputChange}
                value={quantity}
                name="quantity"
                type="number"
                id="quantity"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-5/6 p-1.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label
                htmlFor="date"
                className="block text-[0.7rem] font-semibold text-gray-900 dark:text-white"
              >
                Date
              </label>
              <input
                name="date"
                value={date}
                onChange={handleInputChange}
                id="date"
                type="date"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-5/6 p-1.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Select date"
              />
            </div>
            <button
              type="submit"
              className="text-white my-auto mx-auto bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-1/2 sm:w-auto px-2.5 py-2 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              Transfer
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default TransferForm;
