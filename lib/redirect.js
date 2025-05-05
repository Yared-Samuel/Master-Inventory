"use client";
import { useContext, useEffect } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import AuthContext from "@/pages/context/AuthProvider";

export default function useRedirectLoggedOutUser() {
  const router = useRouter();
  const { auth, setAuth } = useContext(AuthContext);

  useEffect(() => {
    const checkAuth = async () => {
      if (auth?.name && auth?.email && auth?.role ) return;
      
      if(auth?.role == "storeMan" && !auth?.store) {
        console.log("auth?.role == storeMan && !auth?.store");
        toast.error("Something wrong in auth store");        
          router.push("/login");
          return;
      }
      if(auth?.role == "barMan" && !auth?.store) {
        console.log("auth?.role == barMan && !auth?.store");
        toast.error("Something wrong in auth store");        
          router.push("/login");
          return;
      }
      try {
        const response = await fetch("/api/users/logginStatus");
        const data = await response.json();
        if (!data.success || !data.data?.isLoggedIn) {
          toast.error("Please login to continue!");        
          router.push("/login");
          return;
        }
        setAuth(prev => ({
          ...prev,
          name: data.data.user.name,
          email: data.data.user.email,
          role: data.data.user.role,
          store: data.data.user.store,
          storeName: data.data.user.storeName,
          companyId: data.data.user.companyId,
          permissions: data.data.user.permissions || {},
          companyName: data.data.user.companyName
        }));
        console.log(auth);
      } catch (error) {
        console.error(error);
        router.push("/login");
        toast.error("Something wrong in auth");
      }
    };

    checkAuth();
  }, [router, setAuth, auth]); // Include auth but use early return to prevent loops
}
