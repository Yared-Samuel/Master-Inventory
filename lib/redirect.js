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
      if (auth?.name && auth?.email && auth?.role) return;

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
        }));
      } catch (error) {
        console.error(error);
        router.push("/login");
      }
    };

    checkAuth();
  }, [router, setAuth, auth]); // Include auth but use early return to prevent loops
}
