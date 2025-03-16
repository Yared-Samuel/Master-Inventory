import { getCurrentPathName } from '@/actions'
import StoreForm from '@/components/formComponents/StoreForm'
import Layout from '@/components/Layout'
import TableStoreList from '@/components/TableComponents/TableStoreList'
import TitleComponent from '@/components/TitleComponent'
import useRedirectLoggedOutUser from '@/lib/redirect'
import React from 'react'

const StorePage = () => {
    useRedirectLoggedOutUser()
    const pathName = getCurrentPathName()
  return (
    <div className='px-4'>
        <TitleComponent pathName={pathName}>Stores</TitleComponent>
        <StoreForm />
        <TableStoreList />
        {/* <StoresData /> */}
    </div>
  )
}

StorePage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>
}

export default StorePage