import { getCurrentPathName } from '@/actions';
import PurchaseForm from '@/components/formComponents/PurchaseForm';
import Layout from '@/components/Layout';
import TablePurchase from '@/components/TableComponents/TablePurchase';
import TitleComponent from '@/components/TitleComponent';
import useRedirectLoggedOutUser from '@/lib/redirect'
import React from 'react'

const Purchase = () => {
    useRedirectLoggedOutUser()
    const pathName = getCurrentPathName();
    
  return (
    <div className='px-4'>
        <TitleComponent pathName={pathName}>Purchase</TitleComponent>
        <PurchaseForm />
        <TablePurchase />

    </div>
  )
}

Purchase.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>
}

export default Purchase