import "@/styles/globals.css";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { AuthProvider } from "./context/AuthProvider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import dynamic from "next/dynamic";
import "../styles/globals.css";
import { SessionProvider } from 'next-auth/react';



// config.autoAddCss = false;

// Dynamically import AuthStatus with no SSR to avoid hydration issues
const AuthStatus = dynamic(() => import("@/components/AuthStatus"), { ssr: false });

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  const getLayout = Component.getLayout || ((page) => page);
  return (
    <SessionProvider session={session}>
      <AuthProvider>
        {getLayout( 
          <>
          <Component {...pageProps} />
          <ToastContainer />
          {process.env.NODE_ENV === "development" && <AuthStatus />}
          </>
        )} 
      </AuthProvider>    
    </SessionProvider>
  );
}
