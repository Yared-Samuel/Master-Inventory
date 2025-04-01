import { GetCurrentPathName } from '@/actions';
import Layout from '@/components/Layout';
import BalanceReport from '@/components/reportDisplay/BalanceReport';
import TitleComponent from '@/components/TitleComponent';
import useRedirectLoggedOutUser from '@/lib/redirect'

const Balance = () => {
    useRedirectLoggedOutUser();
    const pathName = GetCurrentPathName();
  return (
    <div className='px-4'>
        <TitleComponent pathName={pathName}>Balance</TitleComponent>
        <BalanceReport />
    </div>
  )
}

Balance.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>
}

export default Balance