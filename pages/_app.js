import "@/styles/globals.css";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { AuthProvider } from "./context/AuthProvider";
import { ToastContainer } from "react-toastify";
// config.autoAddCss = false;

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  const getLayout = Component.getLayout || ((page) => page);
  return (
    <AuthProvider>
      {getLayout( 
        <>
        <Component {...pageProps} />
        <ToastContainer />
        </>

         )} 
     </AuthProvider>    
   
   
  )}
