import { GetCurrentPathName } from '@/actions'
import StoreForm from '@/components/formComponents/StoreForm'
import Layout from '@/components/Layout'
import TableStoreList from '@/components/TableComponents/TableStoreList'
import TitleComponent from '@/components/TitleComponent'
import ToggleComponent from '@/components/ToggleComponent'
import useRedirectLoggedOutUser from '@/lib/redirect'
import React from 'react'

const StorePage = () => {
    useRedirectLoggedOutUser()
    const pathName = GetCurrentPathName()
  return (
    <div className='px-4'>
        <TitleComponent pathName={pathName}>Stores</TitleComponent>
        <ToggleComponent 
          showText="Store" 
          hideText="Close" 
          iconSrc={true}
          title="Add New Storage Location"
          buttonClassName="from-[#447DB5] to-[#155CA2] hover:from-[#316296] hover:to-[#0D3761]"
          contentClassName="rounded-lg shadow-md"
        >
        <StoreForm />
        </ToggleComponent>
        <TableStoreList />
        {/* <StoresData /> */}
    </div>
  )
}

StorePage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>
}

export default StorePage