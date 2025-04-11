import { GetCurrentPathName } from '@/actions';
import UseForm from '@/components/formComponents/useForm';
import Layout from '@/components/Layout';
import TableUse from '@/components/TableComponents/TableUse';
import TitleComponent from '@/components/TitleComponent';
import useRedirectLoggedOutUser from '@/lib/redirect';
import React from 'react'

const Use = () => {
    useRedirectLoggedOutUser();
    const pathName = GetCurrentPathName();
  return (
    <div className='px-4'>
        <TitleComponent pathName={pathName}>Use</TitleComponent>
        <UseForm />
        <TableUse />
    </div>
  )
}

Use.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

export default Use;
