import { GetCurrentPathName } from '@/actions';
import UseForm from '@/components/formComponents/useForm';
import Layout from '@/components/Layout';
import TableUse from '@/components/TableComponents/TableUse';
import TitleComponent from '@/components/TitleComponent';
import useRedirectLoggedOutUser from '@/lib/redirect';
import ToggleComponent from '@/components/ToggleComponent';


const Use = () => {
    useRedirectLoggedOutUser();
    const pathName = GetCurrentPathName();
  return (
    <div className='px-4'>
        <TitleComponent pathName={pathName}>Use</TitleComponent>
        
          <ToggleComponent 
            showText="Use" 
            hideText="Close Form" 
            iconSrc={true}
            title="Add New Raw Product Usage"
            buttonClassName="mb-4 from-[#447DB5] to-[#155CA2] hover:from-[#316296] hover:to-[#0D3761]"
            contentClassName="bg-white rounded-lg shadow-md"
          >
            <UseForm />
          </ToggleComponent>
        
        
        
        <TableUse />

        

       
    </div>
  )
}

Use.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

export default Use;
