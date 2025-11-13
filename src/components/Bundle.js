import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import Desk from "../assets/Images/desk-logo.png";
import Inventory from "../assets/Images/Inventory-logo.png";
import Crm from "../assets/Images/Crm-logo.png";
import Books from "../assets/Images/Books-logo.png";
import Creator from "../assets/Images/Creator-logo.png";
import Analytics from "../assets/Images/Analytics-logo1.png";
import People from "../assets/Images/People-logo.png";
import Loader from "./Loader";
import zohoone from "../assets/Images/ZohoOne.png";
import ".././assets/css/Bundle.css";
import SalesIqBot from "./SalesIqBot";
import { useSelector } from "react-redux";
import axios from 'axios';


function Bundle() {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState();
  const navigate = useNavigate();
  const rolepremission = useSelector((state) => state.userpermission)
  console.log("showuserpermission", rolepremission);

  const hasPermission = (moduleName, componentName) => {
    const permissions = rolepremission?.permissiondata?.data || [];

    for (const role of permissions) {
      for (const module of role.modules) {
        if (module.module === moduleName) {
          for (const component of module.components) {
            const permissionArray = component.permissions.flatMap(p =>
              p.split(',').map(str => str.trim())
            );

            if (component.name === componentName && permissionArray.includes("View")) {
              return true;
            }
          }
        }
      }
    }

    return false;
  };

  const productName = sessionStorage.getItem("productName");


  const getProductImage = (task) => {
  // if (task.productImageLink) return task.productImageLink;

  switch (task.product) {
    case "Zoho CRM":
      return Crm;
    case "Zoho Books":
      return Books;
    default:
      return "";
  }
};
  useEffect(() => {
    const fetchTaskDetails = async () => {
      setLoading(true); // Start loading indicator
      try {
        const response = await axios.get(`/server/plandetails/get-plan-details`);

        // 1. Access the nested 'data' array from the API response
        const apiData = response.data.data;

        console.log("api data", apiData)

        if (!Array.isArray(apiData)) {
          throw new Error("API response is not in the expected format.");
        }



        // 2. Transform the API data to match the component's expected structure
        const transformedTasks = apiData.map(task => ({



          productName: task.product,
          productDescription: task.productDescription,
          imageUrl:task.productImageLink,
          altimage:getProductImage(task),
        
          Module: task.module,
        
          dependsOn: task.dependsOn || [],

          Activities: task.Activities.map(activity => ({
         
            Subtask: activity.subtask,
           
            Description: activity.description,
           
            EstimatedTime: Number(activity.estimatedTime) || 0,

            Basic: true,
            Intermediate: true,
            Advanced: true,
          }))
        }));

        console.log("Transformed data for component:", transformedTasks);
        setTasks(transformedTasks); // Set the correctly formatted data

      } catch (err) {
        console.error("Error fetching or transforming task details:", err);
        // Optionally, set an error state here to show a message to the user
      } finally {
        setLoading(false); // Stop loading indicator
      }
    };

    fetchTaskDetails();

  }, []);



  const zohoProducts = [
    {
      productName: "Zoho ONE",
      productDescription:
        "Zoho One is an all-in-one business suite that streamlines operations, automates tasks, and connects departments to boost productivity and drive business growth.",
      imageUrl: zohoone,
    },
    {
      productName: "Zoho CRM",
      productDescription:
        "Zoho CRM helps businesses manage their sales, marketing, and support in a single system. It automates tasks and drives revenue.",
      imageUrl: Crm,
    },
    {
      productName: "Zoho Books",
      productDescription:
        "Zoho Books is online accounting software that manages your finances, automates workflows, and is GST-compliant.",
      imageUrl: Books,
    },
    {
      productName: "Zoho Analytics",
      productDescription:
        "Zoho Analytics is a powerful business intelligence and analytics tool that allows users to visualize data, create reports, and gain actionable insights.",
      imageUrl: Analytics,
    },
    {
      productName: "Zoho Creator",
      productDescription:
        "Zoho Creator lets you build custom apps quickly with minimal coding using a powerful drag-and-drop builder.",
      imageUrl: Creator,
    },
    {
      productName: "Zoho Inventory",
      productDescription:
        "Zoho Inventory is an inventory management software that helps businesses track stock, manage orders, and streamline warehouse operations efficiently.",
      imageUrl: Inventory,
    },
    {
      productName: "Zoho People",
      productDescription:
        "Zoho People is a cloud-based HR software that helps businesses manage employee records, attendance, performance, and payroll effortlessly.",
      imageUrl: People,
    },
    // {
    //   productName: "Zoho Analytics",
    //   productDescription:
    //     "Zoho Analytics is a powerful business intelligence and analytics tool that allows users to visualize data, create reports, and gain actionable insights.",
    //   imageUrl: Analytics,
    // },
    // {
    //   productName: "Zoho Analytics",
    //   productDescription:
    //     "Zoho Analytics is a powerful business intelligence and analytics tool that allows users to visualize data, create reports, and gain actionable insights.",
    //   imageUrl: Analytics,
    // },
    // {
    //   productName: "Zoho Analytics",
    //   productDescription:
    //     "Zoho Analytics is a powerful business intelligence and analytics tool that allows users to visualize data, create reports, and gain actionable insights.",
    //   imageUrl: Analytics,
    // },
    // {
    //   productName: "Zoho Analytics",
    //   productDescription:
    //     "Zoho Analytics is a powerful business intelligence and analytics tool that allows users to visualize data, create reports, and gain actionable insights.",
    //   imageUrl: Analytics,
    // },
  ];
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

const handleNavigate = (product) => {
  
  sessionStorage.setItem("productName", product.productName);

  if (product.productName === "Zoho ONE") {
    navigate("/bundeltab", { state: { product } });
  } else {
    navigate("/viewPlans", { state: { product } });
  }
};


  return (
    <>
      {hasPermission("Bundle Solutions", "BundlePagex") ? (
        <div className="flex flex-col p-8 pt-3 bundlePage">
          <nav className="flex mb-3" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-2  !pl-0">
              <li className="inline-flex items-center">
                <Link
                  to="/dashboard"
                  className="text-[14px] text-gray-400 hover:text-gray-500"
                >
                  Dashboard
                </Link>
              </li>
              <span>/</span>
              <li>
                <span className="text-[14px] text-[]">Bundle Solutions</span>
              </li>
            </ol>
          </nav>

          <div className="flex flex-col pl-2">
            <h1 className="text-[22px] font-semibold mb-1">Bundle Solutions</h1>
          </div>
          <br />
          {loading ? (
            <div className="flex items-center justify-center h-[80vh] top-0">
              <Loader />
            </div>
          ) : (
  <div className="flex justify-center mb-10 font-[Instrument Sans]">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
  {tasks?.map((product, index) => (
    <div
      key={index}
      className="relative bg-white rounded-lg shadow-sm border border-gray-200 p-6 w-full max-w-[320px] mx-auto flex flex-col justify-between hover:shadow-md transition-shadow"
    >
      <div className="flex flex-col items-center text-center">
        <img
          src={product.imageUrl || product.altimage}
          alt={product.productName}
          className="w-16 h-16 object-contain mb-4"
        />
        <h2 className="text-base font-semibold text-gray-800 mb-2">
          {product.productName}
        </h2>
        <p className="text-gray-500 text-sm leading-relaxed">
          {product.productDescription}
        </p>
      </div>

      <div className="mt-6 flex justify-center">
        <button
          className="bg-[#344EA0] w-full hover:bg-[#2d4089] text-white text-sm px-6 py-2.5 rounded font-medium transition-colors"
          onClick={() => handleNavigate(product)}
        >
          View Plan <span className="font-bold">+</span>
        </button>
      </div>
    </div>
  ))}
</div>
    </div>

          )}
        </div>
      ) : (
        <div className="p-10 text-center text-red-600 font-semibold">
          You do not have permission to view this page.
        </div>
      )}

    </>

  );
}

export default Bundle;
