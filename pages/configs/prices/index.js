import { getCurrentPathName } from '@/actions';

import PriceForm from '@/components/formComponents/PriceForm';
import Layout from '@/components/Layout';
import TablePriceList from '@/components/TableComponents/TablePriceList';
import TitleComponent from '@/components/TitleComponent';
import useRedirectLoggedOutUser from '@/lib/redirect';
import React from 'react'

const Sprice = () => {
    useRedirectLoggedOutUser()
    const pathName = getCurrentPathName()

  return (
    <div className='px-4'>
        <TitleComponent pathName={pathName}>Selling Price</TitleComponent>
        <PriceForm />
        <TablePriceList />
    </div>
  )
}

Sprice.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
  };
  

export default Sprice