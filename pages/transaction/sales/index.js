import { GetCurrentPathName } from "@/actions";
import SalesForm from "@/components/formComponents/SalesForm";
import Layout from "@/components/Layout";
import TableSales from "@/components/TableComponents/TableSales";
import TitleComponent from "@/components/TitleComponent";
import ToggleComponent from "@/components/ToggleComponent";
import useRedirectLoggedOutUser from "@/lib/redirect";
import React from "react";

const Sales = () => {
  useRedirectLoggedOutUser();
  const pathName = GetCurrentPathName();
  return (
    <div className="px-4">
      <TitleComponent pathName={pathName}>Sales</TitleComponent>
      <ToggleComponent 
          showText="Sales" 
          hideText="Close" 
          iconSrc={true}
          title="Add New Sales Entry"
          buttonClassName="from-[#447DB5] to-[#155CA2] hover:from-[#316296] hover:to-[#0D3761]"
          contentClassName="rounded-lg shadow-md"
        >
      <SalesForm />
      </ToggleComponent>
      <TableSales />
    </div>
  );
};

Sales.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

export default Sales;
