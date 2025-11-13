import React, { useState, useEffect } from "react";
import { FilePlus2, FilePenLine, Trash2, Funnel, FilterIcon } from "lucide-react";
import axios from "axios";
import { Link } from "react-router-dom";
import Loader from "../Loader";
import { useSelector } from "react-redux";

import './TimelineCom.css'


const TimelineCom = () => {
  const [logDetails, setLogDetails] = useState([]);
  const [sort, setSort] = useState("All");
  const [module, setModule] = useState("All");
  const [datefilter, setDatefilter] = useState({ fromdate: "", todate: "" });
  const [showfilter, setShowfilter] = useState(false);
  const [loading, setLoading] = useState(true);
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

  const fetchLogs = async () => {
    try {
      // setLoadingData(true);
      const response = await axios.get("/server/log_creator/log_details/filter", {
        params: {
          fromdate: datefilter.fromdate,
          todate: datefilter.todate,
          action: sort,
          module: module,
        },
      });
      setLogDetails(response.data.result);
    } catch (error) {
      console.error("Error fetching log details:", error);
    } finally {
      // setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [sort, module, datefilter]);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 3000);
  }, []);

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDatefilter((prev) => ({ ...prev, [name]: value }));
  };
  const getTypeColor = (type) => {
    const colors = {
      UPDATE: "bg-yellow-100 border-yellow-400 border-2 text-yellow-400",
      INSERT: "bg-green-100 border-green-400 border-2 text-green-400",
      DELETE: "bg-red-100 border-red-400 border-2 text-red-400",
    };
    return colors[type] || "bg-gray-500 border-gray-700 border-2 text-white";
  };

  // const getTypeColor = (type) => {
  //   const colors = {
  //     UPDATE: "bg-[#F4F7FF] border-gray-400 border-2 text-grey-200",
  //     INSERT: "bg-[#F4F7FF] border-gray-400 border-2 text-grey-200",
  //     DELETE: "bg-[#F4F7FF] border-gray-400 border-2 text-grey-200",
  //   };
  //   return colors[type] || "bg-gray-500 border-gray-700 border-2 text-white";
  // };

  const parseUpdatedData = (newDataStr, oldDataStr) => {
    try {
      const newData = JSON.parse(newDataStr);
      const oldData = JSON.parse(oldDataStr);
      const normalizedNew = {};
      const normalizedOld = {};
      Object.entries(newData).forEach(([key, value]) => {
        normalizedNew[key.toLowerCase()] = value;
      });
      Object.entries(oldData).forEach(([key, value]) => {
        normalizedOld[key.toLowerCase()] = value;
      });
      return Object.keys(normalizedNew)
        .filter((key) => normalizedNew[key] !== normalizedOld[key])
        .map((key) => ({
          field: key,
          oldValue: normalizedOld[key] || "N/A",
          newValue: normalizedNew[key],
        }));
    } catch (e) {
      console.error("Error parsing updated data:", e);
      return [];
    }
  };


  const parseDeletedData = (oldData) => {
    if (!oldData) return null;
    try {
      const oldDataChange = JSON.parse(oldData);
      const normalizedOld = {};
      Object.entries(oldDataChange).forEach(([key, value]) => {
        normalizedOld[key.toLowerCase()] = value;
      });
      return Object.entries(normalizedOld)
        .map(([key, value]) => `${key}: ${value}`)
        .join(", ");
    } catch (e) {
      console.error("Error parsing old_data:", e);
      return null;
    }
  };

  console.log("logDetails", logDetails);
  const groupedLogs = logDetails.reduce((acc, item) => {
    const logTime = item?.MODIFIEDTIME;
    console.log("ccccccccc", logTime)
    if (!logTime) return acc;

    const dateObj = new Date(logTime);
    const month = dateObj.toLocaleString("en-US", { month: "long" });
    const day = dateObj.getDate();
    const year = dateObj.getFullYear();
    const logDate = `${month},${day},${year}`; 

    if (!acc[logDate]) acc[logDate] = [];
    acc[logDate].push(item);

    return acc;
  }, {});

  return (
    <>
      {hasPermission("Logs", "LogDetails") ? (
        <div className="w-full h-screen p-4 overflow-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {/* Breadcrumb Navigation */}
          <nav className="flex mb-5" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-2 !pl-0">
              <li>
                <Link to="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
                  Dashboard
                </Link>
              </li>
              <span>/</span>
              <li className="text-sm text-[#6B7280] font-medium">Logs</li>
            </ol>
          </nav>

          {/* Loader */}
          {loading ? (
            <div className="flex items-center justify-center h-[80vh]">
              <Loader />
            </div>
          ) : (
            <>
              {/* Header & Filter Icon */}
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Activity Timeline</h2>
                <div
                  className="bg-gray-100 p-2 border-2 border-gray-300 rounded-md cursor-pointer"
                  onClick={() => setShowfilter(!showfilter)}
                >
                  <FilterIcon size={20} />
                </div>
              </div>

              {/* Filter Section */}
              {showfilter && (
                <div
                  className={`flex flex-col md:flex-row md:items-center md:justify-between bg-gray-100 border border-gray-200 rounded-lg p-4 mb-6 shadow-sm gap-4 transition-all duration-1000 ease-out`}
                >
                  {/* Date Filters */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:ml-10">
                    <div className="flex items-center gap-2">
                      <label className="font-semibold text-gray-700">From:</label>
                      <input
                        type="date"
                        name="fromdate"
                        value={datefilter.fromdate}
                        onChange={handleDateChange}
                        className="px-3 py-1.5 border rounded-md"
                      />
                    </div>
                    <div className="flex items-center gap-2 sm:ml-4">
                      <label className="font-semibold text-gray-700">To:</label>
                      <input
                        type="date"
                        name="todate"
                        value={datefilter.todate}
                        onChange={handleDateChange}
                        className="px-3 py-1.5 border rounded-md"
                      />
                    </div>
                  </div>

                  {/* Module & Action Filters */}
                  <div className="flex flex-col sm:flex-row gap-4 md:gap-10">
                    <div className="flex items-center gap-2">
                      <label className="font-semibold text-gray-700">Module</label>
                      <select
                        value={module}
                        onChange={(e) => setModule(e.target.value)}
                        className="px-3 py-1.5 border rounded-md"
                      >
                        <option value="All">All</option>
                        <option value="Enquiry">Enquiry</option>
                        <option value="Bundle Solutions">Bundle Solutions</option>
                        <option value="Projects">Projects</option>
                        <option value="Invoices">Invoices</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="font-semibold text-gray-700">Action</label>
                      <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        className="px-3 py-1.5 border rounded-md"
                      >
                        <option value="All">All</option>
                        <option value="INSERT">Insert</option>
                        <option value="UPDATE">Update</option>
                        <option value="DELETE">Delete</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Logs Timeline */}
              {logDetails.length === 0 ? (
                <p className="text-center text-gray-500 mt-10">No data found</p>
              ) : (
                <div className="flex mt-10 mx-auto">
                  <div className="relative">
                    {/* Timeline Line */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                    <div className="space-y-8">
                      {Object.entries(groupedLogs).map(([date, logs]) => (
                        <div key={date} className="relative">
                          {/* Date Label */}
                          <div className="text-sm font-normal absolute left-[210px] top-[-30px] text-gray-900 text-center px-3 bg-[#F4F7FF] w-[114px] rounded-md border border-[#d2d9e0]">
                            {date}
                          </div>

                          {/* Each Log Entry */}
                          {logs.map((item) => {
                            const updatedFields =
                              item.action.toUpperCase() === "UPDATE"
                                ? parseUpdatedData(item.new_data, item.old_data)
                                : [];
                            const deletedUser =
                              item.action === "DELETE"
                                ? parseDeletedData(item.old_data)
                                : null;
                            const Icon =
                              item.action === "INSERT"
                                ? FilePlus2
                                : item.action.toUpperCase() === "UPDATE"
                                  ? FilePenLine
                                  : Trash2;

                            return (
                              <div key={item.ROWID} className="relative flex items-center justify-right mt-4">
                                {/* Time */}
                                <div className="w-1/2 pr-7 text-right">
                                  <p className="text-xs text-gray-500">
                                    {new Date(item.MODIFIEDTIME)
                                      .toLocaleTimeString("en-GB", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: true,
                                      })
                                      .toUpperCase()}
                                  </p>
                                </div>

                                {/* Timeline Dot Icon */}
                                <div
                                  className={`absolute left-1/2 -translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full ${getTypeColor(
                                    item.action.toUpperCase()
                                  )} z-10`}
                                >
                                  <Icon size={16} />
                                </div>

                                {/* Log Description */}
                                <div className="w-1/2 pl-6">
                                  <div className="rounded-lg p-4 w-[500px]">
                                    {item.action === "INSERT" && (
                                      <p className="text-base font-bold text-gray-700 mb-1">
                                        {item.table_name === "enquiry_data"
                                          ? `Enquiry Created by ${item.user_name}`
                                          : item.table_name === "Projects_list"
                                            ? "Project Created"
                                            : item.table_name === "Task_Details"
                                              ? "Task Created"
                                              : item.table_name === "invoice_list"
                                                ? "Invoice Created"
                                                : "Log Created"}
                                      </p>
                                    )}

                                    {updatedFields.length > 0 && (
                                      <ul className="text-sm text-gray-700 !p-0">
                                        {updatedFields.map((field, i) => (
                                          <li key={i}>
                                            <span className="font-semibold">{item.user_name}</span> changed{" "}
                                            <span className="text-blue-600">{field.field}</span> from{" "}
                                            <span className="text-red-600">{field.oldValue}</span> to{" "}
                                            <span className="text-green-600">{field.newValue}</span> in{" "}
                                            <span className="font-semibold">{item.table_name}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    )}

                                    {deletedUser && (
                                      <p className="text-sm text-gray-700">
                                        <span className="font-semibold">{item.user_name}</span> deleted{" "}
                                        <span className="italic text-red-600">{deletedUser}</span> from{" "}
                                        <span className="font-semibold">{item.table_name}</span>
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="p-10 text-center text-red-600 font-semibold">
          You do not have permission to view this page.
        </div>
      )}

    </>
  );
};

export default TimelineCom;