import { getCurrentPathName } from '@/actions';
import Layout from '@/components/Layout';
import DailySalesReport from '@/components/reportDisplay/DailySalesReport';
import TitleComponent from '@/components/TitleComponent';
import useRedirectLoggedOutUser from '@/lib/redirect'

const DailySales = () => {
    useRedirectLoggedOutUser();
    const pathName = getCurrentPathName();
  return (
    <div className='px-4'>
        <TitleComponent pathName={pathName}>Daily Sales</TitleComponent>
        <DailySalesReport />
    </div>
  )
}

DailySales.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>
}

export default DailySales 