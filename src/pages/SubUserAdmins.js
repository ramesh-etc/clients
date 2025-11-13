import React from 'react'
import Sidebar from '../components/Sidebar'
import SubUserAdmin from './SubUserAdmin'
import MyAccountTable from '../components/MyAccountTable/MyAccountTable'

const SubUserAdmins = () => {
  return (
    <>
    <Sidebar>
          <MyAccountTable/>
        {/* <SubUserAdmin/> */}
    </Sidebar>
    </>
  )
}

export default SubUserAdmins