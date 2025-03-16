import LoadingComponent from "../ui/LoadingComponent";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
const initialState = {
  name: "",
  products: [],
};
const PriceForm = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [productData, setProductData] = useState([]);
  const [sprice, setSprice] = useState(initialState);
  const { name, products } = sprice;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSprice({ ...sprice, [name]: value });
  };

  const handleProductChange = (index, key, value) => {
    
    const updatedProducts = [...sprice.products];    
    updatedProducts[index][key] = value;
    setSprice({ ...sprice, products: updatedProducts });
  };

  const handleAddProduct = () => {
    const newProduct = { product: "", sellingPrice: "" };
    setSprice({ ...sprice, products: [...sprice.products, newProduct] });
  };

  const handleRemoveProduct = (index) => {
    const updatedProducts = [...sprice.products];
    updatedProducts.splice(index, 1);
    setSprice({ ...sprice, products: updatedProducts });
  };

  useEffect(() => {
    const getProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/config/product/product");
        if (!res.ok) {
          return toast.error("Something went wrong!");
        }
        const data = await res.json();
        setProductData(data.data);
      } catch (error) {
        return toast.error("Data not found");
      } finally {
        setLoading(false);
      }
    };
    getProduct();
  }, []);

  const savePrice = async (e) => {
    e.preventDefault();

    if (!name || !products) {
      toast.error("All fields are required");
    }
    console.log({ name, products });
    try {
      setLoading(true);
      const response = await fetch("/api/config/price/price", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          products,
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
      setLoading(false);
    }
  };
  return (
    <div className="bg-slate-100 px-4 py-1 rounded-md shadow-md">
      <form onSubmit={savePrice}>
        {loading ? (
          <LoadingComponent />
        ) : (
          <div className="grid md:grid-cols-4 lg:grid-cols-6">
            <div>
              <label
                htmlFor="name"
                className="block  text-[0.7rem] font-semibold text-gray-900 dark:text-white"
              >
                Price Name{" "}
                {/* <span className="text-white bg-slate-600 p-1 border rounded-lg">
                  የምርት ስም
                </span> */}
              </label>
              <input
                name="name"
                value={sprice?.name}
                onChange={handleInputChange}
                type="text"
                id="name"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-5/6 p-1.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                required
              />
                <div className="--my">
              <button
                className="text-white mt-1 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-bold rounded-lg text-sm w-1/2  sm:w-auto px-4  text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                type="button"
                onClick={handleAddProduct}
              >
                +
              </button>
            </div>
            </div>
            {/* Product and their Price */}
            {sprice.products.map((product, index) => (
              <div key={index}>
                <div>
                  <label
                    htmlFor="name"
                    className="block  text-[0.7rem] font-semibold text-gray-900 dark:text-white"
                  >
                    Product{" "}
                    {/* <span className="text-white bg-slate-600 p-1 border rounded-lg">
                  አይነት
                </span> */}
                  </label>
                  <select
                    id="name"
                    value={product.product}
                    onChange={(e) =>
                      handleProductChange(index, "product", e.target.value)
                    }
                    name="name"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-5/6 p-1.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  >
                    <option value="">Select Product</option>
                    {productData.map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="sellingPrice"
                    className="block  text-[0.7rem] font-semibold text-gray-900 dark:text-white"
                  >
                    Price{" "}
                    {/* <span className="text-white bg-slate-600 p-1 border rounded-lg">
                  የምርት ስም
                </span> */}
                  </label>
                  <input
                    name="sellingPrice"
                    value={product.sellingPrice}
                    onChange={(e) =>
                      handleProductChange(
                        index,
                        "sellingPrice",
                        parseFloat(e.target.value)
                      )
                    }
                    type="number"
                    id="name"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-5/6 p-1.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    required
                  />
                </div>
                <button
                  className="text-white mt-1 bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-bold rounded-lg text-sm w-1/2  sm:w-auto px-4  text-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800"
                  type="button"
                  onClick={() => handleRemoveProduct(index)}
                >
                  -
                </button>
              </div>
            ))}
          
          </div>
        )}

        <button
          type="submit"
          className="text-white mt-1 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-1/2  sm:w-auto px-4 py-1.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          Save Price
        </button>
      </form>
    </div>
  );
};

export default PriceForm;
