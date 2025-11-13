// MyAccount.js
import React from "react";
import Sidebar from "../components/Sidebar";
import { Link } from "react-router";
import MyAccountAdmin from "../components/MyAccountAdmin";
import MyAccountTable from "../components/MyAccountTable/MyAccountTable";

const MyAccount = () => {
  return (
   <>
   <Sidebar>
     
 
     <MyAccountAdmin/>
   </Sidebar>
   </>
  );
};

export default MyAccount;
