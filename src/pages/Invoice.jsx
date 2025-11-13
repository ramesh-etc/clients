import React from "react";
import Sidebar from "../components/Sidebar";
import InvoiceDetails from "../components/InvoiceDetails";

function Invoice() {
  return (
    <Sidebar>
      <InvoiceDetails />
    </Sidebar>
  );
}

export default Invoice;
