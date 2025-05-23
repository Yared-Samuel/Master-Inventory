import { GetCurrentPathName } from '@/actions';
import PurchaseForm from '@/components/formComponents/PurchaseForm';
import Layout from '@/components/Layout';
import TablePurchase from '@/components/TableComponents/TablePurchase';
import TitleComponent from '@/components/TitleComponent';
import ToggleComponent from '@/components/ToggleComponent';
import useRedirectLoggedOutUser from '@/lib/redirect'
import React from 'react'

const Purchase = () => {
    useRedirectLoggedOutUser()
    
  return (
    <div className='px-4'>
        <TitleComponent >Purchase</TitleComponent>

        <ToggleComponent 
          showText="Purchase" 
          hideText="Close" 
          iconSrc={true}
          title="Add New Purchase Entry"
          buttonClassName="from-[#447DB5] to-[#155CA2] hover:from-[#316296] hover:to-[#0D3761]"
          contentClassName="rounded-lg shadow-md"
        >
        <PurchaseForm />
        </ToggleComponent>

        
        <TablePurchase />

    </div>
  )
}

Purchase.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>
}

export default Purchase