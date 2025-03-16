import Layout from "@/components/Layout"
import Register from "@/components/Register"

const RegisterUser = () => {
  return (
    
    <Register />
    
  )
}

RegisterUser.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>
}

export default RegisterUser