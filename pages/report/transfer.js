import { GetCurrentPathName } from '@/actions';
import Layout from '@/components/Layout';
import TransferReport from '@/components/reportDisplay/TransferReport';
import TitleComponent from '@/components/TitleComponent';
import useRedirectLoggedOutUser from '@/lib/redirect'

const Transfer = () => {
    useRedirectLoggedOutUser();
    const pathName = GetCurrentPathName();
  return (
    <div className='px-4'>
        <TitleComponent pathName={pathName}>Transfer</TitleComponent>
        <TransferReport />
    </div>
  )
}

Transfer.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>
}

export default Transfer 