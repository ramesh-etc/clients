import React from 'react'
import Sidebar from '../components/Sidebar'
import BundleForm from '../components/BundleForm'
import BundleDataUpload from '../components/BundleDataUpload'
import Bundletabel from '../components/Bundletabel'
// import Bundletabel from '../components/Bundletable'

export const BundleFormPage = () => {
  return (
    <Sidebar>
        <BundleForm/>
        <BundleDataUpload/>
        <Bundletabel/>
    </Sidebar>
  )
}
