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
      const response = await fetch("/api/users/logginStatus");
      const data = await response.json();

      if (!data.success) {
        toast.error("Please loggin to continue!");        
        router.push("/login"); // Redirect client-side
        return;
      }
      
      if (!auth.name || !auth.email || !auth.role) {
        setAuth({
          name: data.name,
          email: data.email,
          role: data.role,
        });
      }
    };

    checkAuth();
  }, [router, auth.name, auth.email, auth.role, setAuth]);
}
