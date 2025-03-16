import Layout from "@/components/Layout";
import "@/styles/globals.css";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
import { AuthProvider } from "./context/AuthProvider";
import { ToastContainer } from "react-toastify";
import AuthDebug from '../components/AuthDebug';
// config.autoAddCss = false;

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  const getLayout = Component.getLayout || ((page) => page);
  return (
    <AuthProvider>
      {getLayout( 
        <>
        <Component {...pageProps} />
        <ToastContainer />
        {process.env.NODE_ENV !== 'production' && <AuthDebug />}
        </>

         )} 
     </AuthProvider>  
    
   
   
  )}
