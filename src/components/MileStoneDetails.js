import { useEffect, useState, React, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  Search,
  Headset,
  MessageSquare,
  BotMessageSquare,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { setSort } from "../redux/actions/applicatorActions";
import SalesIqBot from "./SalesIqBot";

function MileStoneDetails() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);

  const mail = user?.email_id || "";
  const [data, setData] = useState([]);
  const [taskData, setTaskData] = useState([]);
  const [taskFilteredData, setTaskFilteredData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchData, setSearchData] = useState("");
  const [openRow, setOpenRow] = useState(null);
  const [selectedField, setSelectedField] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [taskLoading, setTaskLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const dropdownRef = useRef(null);
  const [totalData, setTotalData] = useState(0);
  const [nextToken, setNextToken] = useState(null);
  const [prevToken, setPrevToken] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalpages] = useState(0);
  const [sortedData, setSortedData] = useState([]);
  const [sortKey, setSortKey] = useState("");
  const [sortOrder, setSortOrder] = useState("");

  const itemsPerPage = 5;

  const location = useLocation();
  const { projectId } = location.state || {};

  console.log("ProjectIdd", projectId);

  const handleFieldChange = (e) => {
    setSelectedField(e.target.value);
    setSelectedStatuses([]);
    setSearchTerm("");
  };

  const handleCheckboxChange = (status) => {
    setSelectedStatuses((prevStatuses) =>
      prevStatuses.includes(status)
        ? prevStatuses.filter((s) => s !== status)
        : [...prevStatuses, status]
    );
  };

  const clearFilters = () => {
    setSelectedField("");
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
    setSelectedStatuses([]);
    setIsDropdownOpen(false);
  };
  const isFilterApplied = () => {
    return (
      selectedField ||
      searchTerm ||
      startDate ||
      endDate ||
      selectedStatuses.length > 0
    );
  };

  const handleSort = (field) => {
    const newSortOrder =
      sortKey === field && sortOrder === "asc" ? "desc" : "asc";
    setSortKey(field);
    setSortOrder(newSortOrder);

    const sortedData = [...filteredData].sort((a, b) => {
      const valA = a[field] ?? "";
      const valB = b[field] ?? "";

      if (typeof valA === "string" || typeof valB === "string") {
        return newSortOrder === "asc"
          ? String(valA).localeCompare(valB)
          : String(valB).localeCompare(valA);
      } else {
        return newSortOrder === "asc" ? valA - valB : valB - valA;
      }
    });

    setFilteredData(sortedData);
  };

  const loadData = async (offsetValue = 0) => {
    try {
      setLoading(true);
      const payload = {
        limit: itemsPerPage,
        offset: offsetValue,
        email: mail,
        projectId: projectId,
        startDate,
        endDate,
        search: searchData,
        status: selectedStatuses.join(","),
        sortKey,
        sortOrder,
      };
      const response = await axios.post(
        "/server/elite_tech_corp_function/new-get-milestones",
        payload
      );
      console.log("Response", response);
      const projects = response.data.data || [];
      setData(projects);
      setTotalData(response.data.totalRecords);
      setNextToken(response.data.nextToken);
      setPrevToken(response.data.prevToken);
      setTotalpages(Math.ceil(response.data.totalRecords / itemsPerPage));
      setFilteredData(projects);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(0);
  }, [
    mail,
    searchData,
    selectedStatuses,
    startDate,
    endDate,
    sortKey,
    sortOrder,
  ]);

  const toggleRow = (index, milestoneId) => {
    console.log("milestoneId", milestoneId);
    setOpenRow(openRow === index ? null : index);

    const loadTaskData = async () => {
      try {
        setTaskLoading(true);
        const params = {
          email: mail,
          milestoneId: milestoneId,
          projectId: projectId,
          startDate,
          endDate,
          search: searchData,
          status: selectedStatuses.join(","),
          sortKey,
          sortOrder,
        };
        console.log("Paramsss", params);
        const response = await axios.get(
          "/server/elite_tech_corp_function/new-get-tasks",
          {
            params,
          }
        );
        const projects = response.data.data || [];
        setTaskData(projects);
        setTaskFilteredData(projects);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setTaskLoading(false);
      }
    };
    loadTaskData();
  };

  useEffect(() => {
    let filtered = [...data];

    if (searchData) {
      filtered = filtered.filter(
        (item) =>
          item.new_sprint_table.sprintName
            ?.toLowerCase()
            .includes(searchData.toLowerCase()) ||
          item.new_sprint_table.contact_email
            ?.toLowerCase()
            .includes(searchData.toLowerCase()) ||
          item.new_sprint_table.contact_phone
            ?.toLowerCase()
            .includes(searchData.toLowerCase()) ||
          item.new_sprint_table.demo_date
            ?.toLowerCase()
            .includes(searchData.toLowerCase()) ||
          item.new_sprint_table.sprint_status
            ?.toLowerCase()
            .includes(searchData.toLowerCase())
      );
    }

    // Status filter
    if (selectedField === "Status" && selectedStatuses.length > 0) {
      filtered = filtered.filter((item) =>
        selectedStatuses.includes(item.new_sprint_table.sprint_status)
      );
    }

    setFilteredData(filtered);
    setTotalData(filteredData.length);
  }, [searchData, selectedField, selectedStatuses, data, sortKey, sortOrder]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function formatDateString(dateStr) {
    console.log("dateStr", dateStr);
    if (!dateStr || typeof dateStr !== "string") return "N/A";

    const fixedDateStr = dateStr.replace(/:(\d{3})$/, ".$1");
    const date = new Date(fixedDateStr);

    if (isNaN(date)) return "Invalid Date";

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  }

  const handleNext = () => {
    if (nextToken !== null) {
      setCurrentPage((prev) => prev + 1);
      loadData(nextToken);
    }
  };

  const handlePrev = () => {
    if (prevToken !== null) {
      setCurrentPage((prev) => prev - 1);
      loadData(prevToken);
    }
  };

  const pageChange = (page) => {
    setCurrentPage(page);
    const newOffset = page * itemsPerPage;
    loadData(newOffset);
  };

  const getPaginationRange = (currentPage, totalPages) => {
    console.log("Curretnpage", currentPage);
    console.log("TotalPages", totalPages);
    const delta = 1;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 0; i < totalPages; i++) {
      if (
        i === 0 ||
        i === totalPages - 1 ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i);
      }
    }

    for (let i of range) {
      if (l !== undefined) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  return (
    <div className="flex flex-col p-8 pt-3">
      <nav className="flex mb-5" aria-label="Breadcrumb">
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
          <li className="inline-flex items-center">
            <Link
              to="/project"
              className="text-[14px] text-gray-400 hover:text-gray-500"
            >
              Project Details
            </Link>
          </li>
          <span>/</span>
          <li>
            <span className="text-[14px] text-[#DC2626]">Milestones</span>
          </li>
        </ol>
      </nav>

      <div className="flex flex-col pl-2">
        <h1 className="text-[22px] font-semibold mb-1">Project Details</h1>
      </div>

      <div className="flex justify-between">
        <div className="flex flex-row justify-between mt-3">
          <div className="relative w-full sm:w-96">
            <Search
              size={23}
              className="absolute left-4 top-5 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              className="w-full pl-12 pr-4 py-2 border bg-white font-bold rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400"
              placeholder="Search...."
              value={searchData}
              onChange={(e) => setSearchData(e.target.value)}
            />
          </div>
        </div>

        <div className="my-1  flex flex-row justify-between gap-[16px] items-center">
          <div className="mt-4 flex flex-row items-center">
            {/* <button className="p-1 rounded-lg bg-gradient-to-r from-[#008F39] via-[#008799] to-[#00417A] text-white">
                   <ListFilter />
                 </button> */}
            <label className="mr-2 whitespace-nowrap">Filter by:</label>
            <select
              value={selectedField}
              onChange={handleFieldChange}
              className="border px-4 py-0 h-9 shadow-md rounded-md outline-none"
            >
              <option value="">Select Field</option>
              {/* <option value="Project_Name">Project Name</option> */}
              <option value="Status">Status</option>
              <option value="Date">Date</option>
            </select>
          </div>

          {/* Filter by Status */}
          {selectedField === "Status" && (
            <div className="mt-4 flex items-center">
              <label className="mr-2">Filter by Status:</label>
              <div className="relative inline-block" ref={dropdownRef}>
                <button
                  className="bg-white text-black px-4 shadow-md py-1 rounded-md border border-gray-300"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  {selectedStatuses.length > 0
                    ? `${selectedStatuses.length} Selected`
                    : "Select Statuses"}
                </button>

                {isDropdownOpen && (
                  <div className="absolute z-10 bg-white border rounded-md shadow-lg flex flex-col mt-2 max-w-xs w-full max-h-60 overflow-auto">
                    {[
                      "Completed",
                      "In Progress",
                      "Requested",
                      "Rejected",
                      "Not Started",
                    ].map((status) => (
                      <div key={status} className="flex items-center px-2 py-2">
                        <input
                          type="checkbox"
                          id={`status-${status}`}
                          checked={selectedStatuses.includes(status)}
                          onChange={() => handleCheckboxChange(status)}
                          className="w-[20%]"
                        />
                        <label
                          htmlFor={`status-${status}`}
                          className="text-gray-700 w-[80%] mt-1"
                        >
                          {status}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Filter by Date */}
          {selectedField === "Date" ? (
            <div className="mt-4 flex gap-5 items-center">
              <div className="flex flex-row items-center">
                <label className="mr-2 whitespace-nowrap">
                  Updated Start Date:
                </label>
                <input
                  type="Date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border shadow-md px-4 py-1 mt-1 rounded-md outline-none focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300"
                />
              </div>
              <div className="flex flex-row items-center">
                <label className="mr-2 whitespace-nowrap">
                  Updaetd End Date:
                </label>
                <input
                  type="Date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border shadow-md px-4 py-1 rounded-md outline-none focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300"
                />
              </div>
            </div>
          ) : null}

          {isFilterApplied() && (
            <div className="flex justify-end items-center mt-3">
              <button
                onClick={clearFilters}
                className="px-3 py-1 text-[13px] bg-red-500 text-white rounded-md hover:bg-red-400 transition-all duration-300"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto bg-white shadow-md rounded-lg mt-4">
        <div className="w-full   h-[500px]  overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <table className="min-w-full text-center   table-auto">
            <thead className="bg-gray-200 text-white">
              <tr className="text-gray-500">
                {/* <th className="p-2">Milestone Name</th> */}
                <th
                  className="p-1 cursor-pointer"
                  onClick={() => handleSort("Milestone_Name")}
                >
                  <div className="flex items-center justify-center gap-2">
                    {/* <FolderKanban size={17} /> */}
                    Milestone Name
                    <div className="flex flex-col leading-none text-[10px]">
                      <span
                        className={
                          sortKey === "Milestone_Name" && sortOrder === "asc"
                            ? "text-red-600 "
                            : "text-gray-400"
                        }
                      >
                        <ChevronUp size={10} />
                      </span>
                      <span
                        className={
                          sortKey === "Milestone_Name" && sortOrder === "desc"
                            ? "text-red-600"
                            : "text-gray-400"
                        }
                      >
                        <ChevronDown size={10} />
                      </span>
                    </div>
                  </div>
                </th>
                {/* <th className="p-2">Start Date</th> */}
                <th
                  className="p-1 cursor-pointer"
                  onClick={() => handleSort("Start_Date")}
                >
                  <div className="flex items-center justify-center gap-2">
                    {/* <FolderKanban size={17} /> */}
                    Start Date
                    <div className="flex flex-col leading-none text-[10px]">
                      <span
                        className={
                          sortKey === "Start_Date" && sortOrder === "asc"
                            ? "text-red-600 "
                            : "text-gray-400"
                        }
                      >
                        <ChevronUp size={10} />
                      </span>
                      <span
                        className={
                          sortKey === "Start_Date" && sortOrder === "desc"
                            ? "text-red-600"
                            : "text-gray-400"
                        }
                      >
                        <ChevronDown size={10} />
                      </span>
                    </div>
                  </div>
                </th>
                {/* <th className="p-2">End Date</th> */}
                <th
                  className="p-1 cursor-pointer"
                  onClick={() => handleSort("Project_Name")}
                >
                  <div className="flex items-center justify-center gap-2">
                    {/* <FolderKanban size={17} /> */}
                    End Date
                    <div className="flex flex-col leading-none text-[10px]">
                      <span
                        className={
                          sortKey === "Project_Name" && sortOrder === "asc"
                            ? "text-red-600 "
                            : "text-gray-400"
                        }
                      >
                        <ChevronUp size={10} />
                      </span>
                      <span
                        className={
                          sortKey === "Project_Name" && sortOrder === "desc"
                            ? "text-red-600"
                            : "text-gray-400"
                        }
                      >
                        <ChevronDown size={10} />
                      </span>
                    </div>
                  </div>
                </th>
                {/* <th className="p-2">Completion Status</th> */}
                <th
                  className="p-1 cursor-pointer"
                  onClick={() => handleSort("End_Date")}
                >
                  <div className="flex items-center justify-center gap-2">
                    {/* <FolderKanban size={17} /> */}
                    Completion Status
                    <div className="flex flex-col leading-none text-[10px]">
                      <span
                        className={
                          sortKey === "End_Date" && sortOrder === "asc"
                            ? "text-red-600 "
                            : "text-gray-400"
                        }
                      >
                        <ChevronUp size={10} />
                      </span>
                      <span
                        className={
                          sortKey === "End_Date" && sortOrder === "desc"
                            ? "text-red-600"
                            : "text-gray-400"
                        }
                      >
                        <ChevronDown size={10} />
                      </span>
                    </div>
                  </div>
                </th>
                {/* <th className="p-2">MileStone Status</th> */}
                <th
                  className="p-1 cursor-pointer"
                  onClick={() => handleSort("Completed_Percent")}
                >
                  <div className="flex items-center justify-center gap-2">
                    {/* <FolderKanban size={17} /> */}
                    Milestone Status
                    <div className="flex flex-col leading-none text-[10px]">
                      <span
                        className={
                          sortKey === "Completed_Percent" && sortOrder === "asc"
                            ? "text-red-600 "
                            : "text-gray-400"
                        }
                      >
                        <ChevronUp size={10} />
                      </span>
                      <span
                        className={
                          sortKey === "Completed_Percent" &&
                            sortOrder === "desc"
                            ? "text-red-600"
                            : "text-gray-400"
                        }
                      >
                        <ChevronDown size={10} />
                      </span>
                    </div>
                  </div>
                </th>
                {/* <th className="p-2">Demo Date</th> */}
                <th
                  className="p-1 cursor-pointer"
                  onClick={() => handleSort("Demo_Date")}
                >
                  <div className="flex items-center justify-center gap-2">
                    {/* <FolderKanban size={17} /> */}
                    Demo Date
                    <div className="flex flex-col leading-none text-[10px]">
                      <span
                        className={
                          sortKey === "Demo_Date" && sortOrder === "asc"
                            ? "text-red-600 "
                            : "text-gray-400"
                        }
                      >
                        <ChevronUp size={10} />
                      </span>
                      <span
                        className={
                          sortKey === "Demo_Date" && sortOrder === "desc"
                            ? "text-red-600"
                            : "text-gray-400"
                        }
                      >
                        <ChevronDown size={10} />
                      </span>
                    </div>
                  </div>
                </th>
                {/* <th className="p-2">Contact Email</th> */}
                <th
                  className="p-1 cursor-pointer"
                  onClick={() => handleSort("Contact_Email")}
                >
                  <div className="flex items-center justify-center gap-2">
                    {/* <FolderKanban size={17} /> */}
                    Contact Email
                    <div className="flex flex-col leading-none text-[10px]">
                      <span
                        className={
                          sortKey === "Contact_Email" && sortOrder === "asc"
                            ? "text-red-600 "
                            : "text-gray-400"
                        }
                      >
                        <ChevronUp size={10} />
                      </span>
                      <span
                        className={
                          sortKey === "Contact_Email" && sortOrder === "desc"
                            ? "text-red-600"
                            : "text-gray-400"
                        }
                      >
                        <ChevronDown size={10} />
                      </span>
                    </div>
                  </div>
                </th>
                {/* <th className="p-2">Contact Phone</th> */}
                <th
                  className="p-1 cursor-pointer"
                  onClick={() => handleSort("Contact_Phone")}
                >
                  <div className="flex items-center justify-center gap-2">
                    {/* <FolderKanban size={17} /> */}
                    Contact Phone
                    <div className="flex flex-col leading-none text-[10px]">
                      <span
                        className={
                          sortKey === "Contact_Phone" && sortOrder === "asc"
                            ? "text-red-600 "
                            : "text-gray-400"
                        }
                      >
                        <ChevronUp size={10} />
                      </span>
                      <span
                        className={
                          sortKey === "Contact_Phone" && sortOrder === "desc"
                            ? "text-red-600"
                            : "text-gray-400"
                        }
                      >
                        <ChevronDown size={10} />
                      </span>
                    </div>
                  </div>
                </th>
                {/* <th className="p-2">Created At</th> */}
                <th
                  className="p-1 cursor-pointer"
                  onClick={() => handleSort("CREATEDTIME")}
                >
                  <div className="flex items-center justify-center gap-2">
                    {/* <FolderKanban size={17} /> */}
                    Created At
                    <div className="flex flex-col leading-none text-[10px]">
                      <span
                        className={
                          sortKey === "CREATEDTIME" && sortOrder === "asc"
                            ? "text-red-600 "
                            : "text-gray-400"
                        }
                      >
                        <ChevronUp size={10} />
                      </span>
                      <span
                        className={
                          sortKey === "CREATEDTIME" && sortOrder === "desc"
                            ? "text-red-600"
                            : "text-gray-400"
                        }
                      >
                        <ChevronDown size={10} />
                      </span>
                    </div>
                  </div>
                </th>
                {/* <th className="p-2">Updated At</th> */}
                <th
                  className="p-1 cursor-pointer"
                  onClick={() => handleSort("MODIFIEDTIME")}
                >
                  <div className="flex items-center justify-center gap-2">
                    {/* <FolderKanban size={17} /> */}
                    Updated At
                    <div className="flex flex-col leading-none text-[10px]">
                      <span
                        className={
                          sortKey === "MODIFIEDTIME" && sortOrder === "asc"
                            ? "text-red-600 "
                            : "text-gray-400"
                        }
                      >
                        <ChevronUp size={10} />
                      </span>
                      <span
                        className={
                          sortKey === "MODIFIEDTIME" && sortOrder === "desc"
                            ? "text-red-600"
                            : "text-gray-400"
                        }
                      >
                        <ChevronDown size={10} />
                      </span>
                    </div>
                  </div>
                </th>
                {/* <th className="p-2">Action</th> */}
                <th className="p-1 cursor-pointer">
                  <div className="flex items-center justify-center gap-2">
                    {/* <FolderKanban size={17} /> */}
                    Action
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="p-4">
                    <div className="flex justify-center items-center h-20">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-gray-500"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredData.length > 0 ? (
                filteredData.map((item, index) => (
                  <>
                    <tr
                      key={index}
                      className="hover:bg-gray-100 text-center border border-gray-300 transition-all duration-300"
                    >
                      <td className="p-3">
                        {item.new_sprint_table.sprintName}
                      </td>
                      <td className="p-3">
                        {formatDateString(item.new_sprint_table.start_date)}
                      </td>
                      <td className="p-3">
                        {formatDateString(item.new_sprint_table.end_date)}
                      </td>
                      <td className="p-3">
                        <div className="relative w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                          <div
                            className={`h-4 rounded-full transition-all duration-500 ease-in-out ${item.new_sprint_table.completed_percent === "100%"
                              ? "bg-green-500 "
                              : "bg-blue-500"
                              }`}
                            style={{
                              width: `${item.new_sprint_table.completed_percent}`,
                            }}
                          ></div>
                          <span
                            className={`absolute inset-0 flex justify-center items-center text-xs font-bold text-gray-400 ${item.new_sprint_table.completed_percent === "100%"
                              ? "text-white "
                              : "text-gray-400"
                              }`}
                          >
                            {item.new_sprint_table.completed_percent}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        {{
                          1: "Upcoming",
                          2: "Active",
                          3: "Completed",
                        }[item.new_sprint_table.sprint_status] || "Unknown"}
                      </td>
                      <td className="p-3">
                        {formatDateString(item.new_sprint_table.demo_date)}
                      </td>
                      <td className="p-3">
                        {item.new_sprint_table.contact_email}
                      </td>
                      <td className="p-3">
                        {item.new_sprint_table.contact_phone}
                      </td>
                      <td className="p-3">
                        {formatDateString(item.new_sprint_table.CREATEDTIME)}
                      </td>
                      <td className="p-3">
                        {formatDateString(item.new_sprint_table.MODIFIEDTIME)}
                      </td>
                      <td className="p-3 flex items-center justify-center space-x-2">
                        <button
                          className={`p-2 rounded text-white transition-transform duration-300 p-2 text-[12px] px-3hover:scale-105 min-w-[80px] text-[13px] ${openRow === index ? "bg-red-600" : "bg-[green]"
                            }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleRow(index, item.new_sprint_table.sprintid);
                          }}
                        >
                          {openRow === index ? "Close" : "View"}
                        </button>
                        <button className="p-2 rounded text-gray-700 flex items-center justify-center transition-transform duration-300 hover:scale-105">
                          <BotMessageSquare />
                        </button>
                        <button className="bg-black p-2 rounded text-white flex items-center justify-center transition-transform duration-300 hover:scale-105">
                          <Headset />
                        </button>
                      </td>
                    </tr>

                    {/* Accordion Row */}
                    {openRow === index && (
                      <tr className="transition-all duration-500 ease-in-out">
                        <td colSpan="11" className="p-3">
                          <div className="overflow-hidden transition-all duration-500 ease-in-out">
                            <table className="w-full border-collapse border border-gray-300 mt-2">
                              <thead className="bg-gray-200">
                                <tr>
                                  {/* <th className="border border-gray-300 p-2">
                                    S.No
                                  </th> */}
                                  <th
                                    className="p-1 cursor-pointer"
                                    onClick={() => handleSort("")}
                                  >
                                    <div className="flex items-center justify-center gap-2">
                                      {/* <FolderKanban size={17} /> */}
                                      S.No
                                    </div>
                                  </th>
                                  {/* <th className="border border-gray-300 p-2">
                                    Module
                                  </th> */}
                                  {/* <th
                                    className="p-1 cursor-pointer"
                                    onClick={() => handleSort("")}
                                  >
                                    <div className="flex items-center justify-center gap-2">
                                      Module
                                      <div className="flex flex-col leading-none text-[10px]">
                                        <span
                                          className={
                                            sortKey === "Milestone_Name" &&
                                            sortOrder === "asc"
                                              ? "text-red-600 "
                                              : "text-gray-400"
                                          }
                                        >
                                          <ChevronUp size={10} />
                                        </span>
                                        <span
                                          className={
                                            sortKey === "Milestone_Name" &&
                                            sortOrder === "desc"
                                              ? "text-red-600"
                                              : "text-gray-400"
                                          }
                                        >
                                          <ChevronDown size={10} />
                                        </span>
                                      </div>
                                    </div>
                                  </th> */}
                                  {/* <th className="border border-gray-300 p-2">
                                    Task
                                  </th> */}
                                  <th
                                    className="p-1 cursor-pointer"
                                    onClick={() => handleSort("")}
                                  >
                                    <div className="flex items-center justify-center gap-2">
                                      {/* <FolderKanban size={17} /> */}
                                      Task
                                      <div className="flex flex-col leading-none text-[10px]">
                                        <span
                                          className={
                                            sortKey === "Milestone_Name" &&
                                              sortOrder === "asc"
                                              ? "text-red-600 "
                                              : "text-gray-400"
                                          }
                                        >
                                          <ChevronUp size={10} />
                                        </span>
                                        <span
                                          className={
                                            sortKey === "Milestone_Name" &&
                                              sortOrder === "desc"
                                              ? "text-red-600"
                                              : "text-gray-400"
                                          }
                                        >
                                          <ChevronDown size={10} />
                                        </span>
                                      </div>
                                    </div>
                                  </th>
                                  {/* <th className="border border-gray-300 p-2">
                                    Task Description
                                  </th> */}
                                  <th
                                    className="p-1 cursor-pointer"
                                    onClick={() => handleSort("")}
                                  >
                                    <div className="flex items-center justify-center gap-2">
                                      {/* <FolderKanban size={17} /> */}
                                      Task Description
                                      <div className="flex flex-col leading-none text-[10px]">
                                        <span
                                          className={
                                            sortKey === "Milestone_Name" &&
                                              sortOrder === "asc"
                                              ? "text-red-600 "
                                              : "text-gray-400"
                                          }
                                        >
                                          <ChevronUp size={10} />
                                        </span>
                                        <span
                                          className={
                                            sortKey === "Milestone_Name" &&
                                              sortOrder === "desc"
                                              ? "text-red-600"
                                              : "text-gray-400"
                                          }
                                        >
                                          <ChevronDown size={10} />
                                        </span>
                                      </div>
                                    </div>
                                  </th>
                                  {/* <th className="border border-gray-300 p-2">
                                    Team
                                  </th> */}
                                  <th
                                    className="p-1 cursor-pointer"
                                    onClick={() => handleSort("")}
                                  >
                                    <div className="flex items-center justify-center gap-2">
                                      {/* <FolderKanban size={17} /> */}
                                      Team
                                      <div className="flex flex-col leading-none text-[10px]">
                                        <span
                                          className={
                                            sortKey === "Milestone_Name" &&
                                              sortOrder === "asc"
                                              ? "text-red-600 "
                                              : "text-gray-400"
                                          }
                                        >
                                          <ChevronUp size={10} />
                                        </span>
                                        <span
                                          className={
                                            sortKey === "Milestone_Name" &&
                                              sortOrder === "desc"
                                              ? "text-red-600"
                                              : "text-gray-400"
                                          }
                                        >
                                          <ChevronDown size={10} />
                                        </span>
                                      </div>
                                    </div>
                                  </th>
                                  {/* <th className="border border-gray-300 p-2">
                                    Assigned to
                                  </th> */}
                                  <th
                                    className="p-1 cursor-pointer"
                                    onClick={() => handleSort("")}
                                  >
                                    <div className="flex items-center justify-center gap-2">
                                      {/* <FolderKanban size={17} /> */}
                                      Assigned to
                                      <div className="flex flex-col leading-none text-[10px]">
                                        <span
                                          className={
                                            sortKey === "Milestone_Name" &&
                                              sortOrder === "asc"
                                              ? "text-red-600 "
                                              : "text-gray-400"
                                          }
                                        >
                                          <ChevronUp size={10} />
                                        </span>
                                        <span
                                          className={
                                            sortKey === "Milestone_Name" &&
                                              sortOrder === "desc"
                                              ? "text-red-600"
                                              : "text-gray-400"
                                          }
                                        >
                                          <ChevronDown size={10} />
                                        </span>
                                      </div>
                                    </div>
                                  </th>
                                  {/* <th className="border border-gray-300 p-2">
                                    Action
                                  </th> */}
                                  <th className="p-1 cursor-pointer">
                                    <div className="flex items-center justify-center gap-2">
                                      {/* <FolderKanban size={17} /> */}
                                      Action
                                    </div>
                                  </th>
                                </tr>
                              </thead>

                              <tbody>
                                {taskLoading ? (
                                  <tr>
                                    <td colSpan="6" className="p-4">
                                      <div className="flex justify-center items-center h-20">
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-gray-500"></div>
                                      </div>
                                    </td>
                                  </tr>
                                ) : taskFilteredData.length > 0 ? (
                                  taskFilteredData.map((task, i) => (
                                    <tr key={i}>
                                      <td className="border border-gray-300 p-2 text-center">
                                        {i + 1}
                                      </td>
                                      {/* <td className="border border-gray-300 p-2 text-center">
                                        {task.new_item_table.Module}
                                      </td> */}
                                      <td className="border border-gray-300 p-2 text-center">
                                        {task.new_item_table.itemName}
                                      </td>
                                      <td className="border border-gray-300 p-2 text-center">
                                        {task.new_item_table.Task_Description}
                                      </td>
                                      <td className="border border-gray-300 p-2 text-center">
                                        {task.new_item_table.Team}
                                      </td>
                                      <td className="border border-gray-300 p-2 text-center">
                                        {task.new_item_table.assigned_user_name}
                                      </td>
                                      <td className="p-3 border border-gray-300 text-center">
                                        <button className="p-2 rounded text-blue-500 transition-transform duration-300 hover:scale-110">
                                          <MessageSquare />
                                        </button>
                                      </td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td colSpan="6" className="p-3 text-center">
                                      No Task found
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="p-3 text-center">
                    No Milestones found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* <div className="flex flex-col sm:flex-row justify-between items-center mt-4">
        <p className="text-gray-600">Total Records: {filteredData.length}</p>
      </div> */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-4">
        <p className="text-gray-600">Total Records: {totalData}</p>
        <div className="flex space-x-1">
          <button
            onClick={handlePrev}
            disabled={prevToken === null}
            className="px-3 py-1 rounded-md text-[#006389] hover:bg-[#006389] hover:bg-opacity-10 disabled:text-gray-400"
          >
            Previous
          </button>

          {getPaginationRange(currentPage, totalPages).map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === "number" && pageChange(page)}
              className={`w-8 h-8 rounded-full flex items-center justify-center
          ${currentPage === page
                  ? "bg-[#006389] text-white"
                  : "text-gray-700 hover:bg-gray-100"
                }
          ${page === "..." ? "cursor-default" : ""}`}
              disabled={page === "..."}
            >
              {typeof page === "number" ? page + 1 : "..."}
            </button>
          ))}

          <button
            onClick={handleNext}
            disabled={nextToken === null}
            className="px-3 py-1 rounded-md text-[#006389] hover:bg-[#006389] hover:bg-opacity-10 disabled:text-gray-400"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default MileStoneDetails;
