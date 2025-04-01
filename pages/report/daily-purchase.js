import { GetCurrentPathName } from '@/actions';
import Layout from '@/components/Layout';
import DailyPurchaseReport from '@/components/reportDisplay/DailyPurchaseReport';
import TitleComponent from '@/components/TitleComponent';
import useRedirectLoggedOutUser from '@/lib/redirect'

const DailyPurchase = () => {
    useRedirectLoggedOutUser();
    const pathName = GetCurrentPathName();
  return (
    <div className='px-4'>
        <TitleComponent pathName={pathName}>Daily Purchase</TitleComponent>
        <DailyPurchaseReport />
    </div>
  )
}

DailyPurchase.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>
}

export default DailyPurchase 