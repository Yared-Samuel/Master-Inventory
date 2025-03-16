import { useState, useEffect } from "react";
import { toast } from "react-toastify";

async function useFetch(url) {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

    useEffect(() => {
      let isMounted = true;
      const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
          const res = await fetch(url);
          if (!res.ok) {
            return toast.error(`Something went wrong! ${res.status}`);
          }
          const data = await res.json();
          if(isMounted){
            setData(data.data);
          }
        } catch (error) {
          if(isMounted){
            toast.error("not found");
            setError(error.message);
          }
        } finally {
          if(isMounted) {
            setLoading(false);
          }
        }
      };
      fetchData();
      return () => {
        isMounted = false; // Cleanup
      };
    }, []);
    console.log(data)
  return { data,  loading };
}

export default useFetch;
