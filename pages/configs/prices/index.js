import { GetCurrentPathName } from '@/actions';

import PriceForm from '@/components/formComponents/PriceForm';
import Layout from '@/components/Layout';
import TablePriceList from '@/components/TableComponents/TablePriceList';
import TitleComponent from '@/components/TitleComponent';
import ToggleComponent from '@/components/ToggleComponent';
import useRedirectLoggedOutUser from '@/lib/redirect';
import React from 'react'

const Sprice = () => {
  
    useRedirectLoggedOutUser()
    const pathName = GetCurrentPathName()

  return (
    <div className='px-4'>
        <TitleComponent pathName={pathName}>Selling Price</TitleComponent>
        <ToggleComponent 
          showText="Price" 
          hideText="Close" 
          iconSrc={true}          
          title="Add New Selling Price"
          buttonClassName="from-[#447DB5] to-[#155CA2] hover:from-[#316296] hover:to-[#0D3761]"
          contentClassName="rounded-lg shadow-md"
        > 
        <PriceForm />
        </ToggleComponent>
        <TablePriceList />
    </div>
  )
}

Sprice.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
  };
  

export default Sprice