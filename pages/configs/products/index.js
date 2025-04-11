import { GetCurrentPathName } from "@/actions";
import Layout from "@/components/Layout";
import TitleComponent from "@/components/TitleComponent";
import useRedirectLoggedOutUser from "@/lib/redirect";
import ProductForm from "@/components/formComponents/ProductForm";
import TableProductList from "@/components/TableComponents/TableProductList";
import ToggleComponent from "@/components/ToggleComponent";

const ProductListPage = () => {
  useRedirectLoggedOutUser();
  const pathName = GetCurrentPathName();

  return (
    
      <div className="px-4">
        <TitleComponent pathName={pathName}>Product</TitleComponent>
        <ToggleComponent 
          showText="Product" 
          hideText="Close" 
          iconSrc={true}
          title="Add New Product"
          buttonClassName="from-[#447DB5] to-[#155CA2] hover:from-[#316296] hover:to-[#0D3761]"
          contentClassName="rounded-lg shadow-md"
        >

        <ProductForm />        
        </ToggleComponent>
        <TableProductList />        
      </div>
    
  );
};

ProductListPage.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

export default ProductListPage;
