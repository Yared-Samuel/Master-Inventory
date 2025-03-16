import { getCurrentPathName } from "@/actions";
import SalesForm from "@/components/formComponents/SalesForm";
import Layout from "@/components/Layout";
import TableSales from "@/components/TableComponents/TableSales";
import TitleComponent from "@/components/TitleComponent";
import useRedirectLoggedOutUser from "@/lib/redirect";
import React from "react";

const Sales = () => {
  useRedirectLoggedOutUser();
  const pathName = getCurrentPathName();
  return (
    <div className="px-4">
      <TitleComponent pathName={pathName}>Sales</TitleComponent>
      <SalesForm />
      <TableSales />
    </div>
  );
};

Sales.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

export default Sales;
