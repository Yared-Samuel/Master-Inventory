import { GetCurrentPathName } from '@/actions';
import TransferForm from '@/components/formComponents/TransferForm';
import Layout from '@/components/Layout';
import TableTransfer from '@/components/TableComponents/TableTransfer';
import TitleComponent from '@/components/TitleComponent'
import useRedirectLoggedOutUser from '@/lib/redirect';
import React from 'react'

const Transfer = () => {
  useRedirectLoggedOutUser()
    const pathName = GetCurrentPathName();
  return (
    <div className='px-4'>
        <TitleComponent pathName={pathName}>Transfer</TitleComponent>
        <TransferForm />
        <TableTransfer />
    </div>
  )
}

Transfer.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>
}

export default Transfer