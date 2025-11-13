import React from "react";
import Dashboard from "../components/Dashboard";
import Sidebar from "../components/Sidebar";
import Dashboarddetailspages from "../components/Dashboarddetailspages";

function Dashboarddetails() {
  return (
    <Sidebar>
      <Dashboarddetailspages className="bg-[#D1D5DB] font-[Inter]" />
    </Sidebar>
  );
}

export default Dashboarddetails;
