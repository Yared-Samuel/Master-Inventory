import { GetCurrentPathName } from '@/actions';
import React, { useContext } from 'react'
import AuthContext from "@/pages/context/AuthProvider";

import TransferForm from '@/components/formComponents/TransferForm';
import Layout from '@/components/Layout';
import TableTransfer from '@/components/TableComponents/TableTransfer';
import TitleComponent from '@/components/TitleComponent'
import ToggleComponent from '@/components/ToggleComponent';
import useRedirectLoggedOutUser from '@/lib/redirect';


const Transfer = () => {
  useRedirectLoggedOutUser()
    const pathName = GetCurrentPathName();
    const auth = useContext(AuthContext);

  return (
    <div className='px-4'>
        <TitleComponent pathName={pathName}>Transfer</TitleComponent>
        {/* {auth.role === "company_admin" && ( */}
        <ToggleComponent 
          showText="Transfer" 
          hideText="Close" 
          iconSrc={true}
          title="Add Transfer Entry"
          buttonClassName="from-[#447DB5] to-[#155CA2] hover:from-[#316296] hover:to-[#0D3761]"
          contentClassName="rounded-lg shadow-md"
        >
        <TransferForm />
        </ToggleComponent>
        {/* )} */}
        <TableTransfer />
    </div>
  )
}

Transfer.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>
}

export default Transfer