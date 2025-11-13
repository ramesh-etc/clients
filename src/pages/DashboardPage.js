import React from "react";
import Dashboard from "../components/Dashboard";
import Sidebar from "../components/Sidebar";
import Dashboarddetailspages from "../components/Dashboarddetailspages";

function DashboardPage() {
  return (
    <Sidebar>
      <Dashboard />
    </Sidebar>
  );
}

export default DashboardPage;
