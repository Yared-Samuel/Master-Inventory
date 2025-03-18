import Image from "next/image";
import React, { useEffect, useState, useRef, useContext } from "react";
import AuthContext from "@/pages/context/AuthProvider";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const Login = () => {
  const router = useRouter();

  const { setAuth, auth } = useContext(AuthContext);
  

  const [email, setEmail] = useState("");
  const [validEmail, setValidEmail] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const [password, setPassword] = useState("");
  
  useEffect(() => {
    const result = EMAIL_REGEX.test(email);
    setValidEmail(result);
  }, [email]);

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log({email, password})
    try {
      const response = await fetch("/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        const userData = data.data;
        
        
        // First set the auth state
        setAuth({
          name: userData.name,
          email: userData.email,
          role: userData.role,
          companyId: userData.companyId,
          permissions: userData.permissions || {}
        });
        
        // Show success message
        toast.success(data.message);
        
        // Then navigate based on role (after auth is set)
        setTimeout(() => {
          if (userData.role === 'admin') {
            router.push("/page/dashboard");
          } else {
            router.push("/configs/products");
          }
        }, 100);
      } else {
        toast.error(data.message || "Login failed");
        setErrMsg(data?.message || "Login failed");
      }
    } catch (error) {
      toast.error(error.message || "An error occurred");
      console.error("Error during login:", error);
      setErrMsg("An error occurred while logging in");
    }
  };
  return (
    <div>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900 dark:text-gray-200">
            Sign in to your account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form onSubmit={handleLogin} className="space-y-6 " >
            <div>
              <label
                htmlFor="email"
                className="block text-sm/6 font-medium text-gray-900 dark:text-gray-200"
              >
                Email
                <span className={validEmail ? "inline-block" : "hidden"}>
                  <Image
                    src="/icons/checked-circle.svg"
                    alt="info"
                    width={20}
                    height={20}
                  />
                </span>
                <span
                  className={validEmail || !email ? "hidden" : "inline-block"}
                >
                  <Image
                    src="/icons/danger-red.svg"
                    alt="info"
                    width={20}
                    height={20}
                  />
                </span>
              </label>
              <div className="mt-2">
                <input
                  type="email"
                  id="email"
                  // ref={emailRef}
                  aria-invalid={validEmail ? "false" : "true"}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setEmailFocus(true)}
                  onBlur={() => setEmailFocus(false)}
                  required
                  autoComplete="off"
                  className="block w-full rounded-md bg-white dark:bg-gray-500 px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
                <p
                  id="uemnote"
                  className={
                    emailFocus && email && !validEmail
                      ? "text-[12px] text-orange-700 flex gap-2 outline-[1px] outline-red-500 outline-offset-1 rounded-md mx-2 mt-2 bg-slate-100"
                      : "hidden"
                  }
                >
                  <Image
                    src="/icons/info-circle.svg"
                    alt="info"
                    width={30}
                    height={30}
                  />
                  Not valid Email!
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm/6 font-medium text-gray-900 dark:text-gray-200"
                >
                  Password
                </label>
                <div
                  className="text-sm"
                  onClick={() => alert("Contact your administrator.")}
                >
                  <a
                    href="#"
                    className="font-semibold text-indigo-600 dark:text-indigo-300 hover:text-indigo-500"
                  >
                    Forgot password?
                  </a>
                </div>
              </div>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="off"
                  className="block w-full rounded-md bg-white dark:bg-gray-500 px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                className="bg-indigo-500 p-2 px-4 rounded-md text-white w-1/4 font-semibold"
              >
                Login
              </button>
            </div>
          </form>

          <p className="mt-10 text-center text-sm/6 text-gray-500">
            Not a member?{" "}
            <a
              href="#"
              className="font-semibold text-indigo-600 dark:text-indigo-300 hover:text-indigo-500"
            >
              Contact your administrator.
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
