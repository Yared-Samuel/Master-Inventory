import { getCurrentPathName } from "@/actions";
import Layout from "@/components/Layout";
import TitleComponent from "@/components/TitleComponent";
import useRedirectLoggedOutUser from "@/lib/redirect";
import ProductForm from "@/components/formComponents/ProductForm";
import TableProductList from "@/components/TableComponents/TableProductList";

const ProductListPage = () => {
  useRedirectLoggedOutUser();
  const pathName = getCurrentPathName();

  return (
    
      <div className="px-4">
        <TitleComponent pathName={pathName}>Product</TitleComponent>
        <ProductForm />        
        <TableProductList />        
      </div>
    
  );
};

ProductListPage.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

export default ProductListPage;
