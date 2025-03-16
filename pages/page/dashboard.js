'use client'
import useRedirectLoggedOutUser from "@/lib/redirect"
import { useContext, useState } from "react"
import Layout from "@/components/Layout"

import AuthContext from "../context/AuthProvider"


const Dashboard = () => {

  const { auth } = useContext(AuthContext)
  useRedirectLoggedOutUser()
  return (
    <>
    <h2>Well come - {auth.name}</h2>
    </>
  )
}

Dashboard.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>
}

export default Dashboard