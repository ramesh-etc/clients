import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";

dayjs.extend(relativeTime);
dayjs.extend(isToday);
dayjs.extend(isYesterday);

const groupLogsByDate = (logs) => {
  const groups = {};
  logs.forEach((log) => {
    const date = dayjs(log.CREATEDTIME).format("YYYY-MM-DD");
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(log);
  });
  return groups;
};

const getDateLabel = (dateStr) => {
  const date = dayjs(dateStr);
  if (date.isToday()) return `Today - ${date.format("dddd, MMMM D, YYYY")}`;
  if (date.isYesterday())
    return `Yesterday - ${date.format("dddd, MMMM D, YYYY")}`;
  return date.format("dddd, MMMM D, YYYY");
};

const formatTime = (timestamp) => {
  return dayjs(timestamp).format("hh:mm A");
};

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

const renderActionText = (log) => {
  console.log("LogRender", log);
  const { action, table_name, new_data, old_data, user_name, product_name } =
    log;

  if (action === "UPDATE") {
    return (
      <div>
        <ul className="text-[14px] text-gray-700 !pl-0 !mb-0">
          {parseUpdatedData(log.new_data, log.old_data).map((field, i) => (
            <li key={i} className="mb-1">
              <span className="font-semibold">{user_name}</span> changed{" "}
              <span className="text-gray font-bold">{field.field}</span> from{" "}
              <span className="text-gray font-bold">{field.oldValue}</span> to{" "}
              <span className="text-gray font-bold">{field.newValue}</span> in{" "}
              <span className="font-semibold">{table_name}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (action === "INSERT") {
    return (
      <span className="text-black">
        <span>{user_name} has</span>
        <span className="text-gray-500"></span> created a new enquiry
        {/* <span className="font-semibold text-blue-700">{product_name}</span> */}
      </span>
    );
  }

  if (action === "DELETE") {
    return (
      <span className="text-black">
        <span className="text-gray-500"></span> Deleted data from{" "}
        <span className="font-semibold text-gray">{table_name}</span>
      </span>
    );
  }
  //   return (
  //     <span className="text-black">
  //       <span className="text-gray-500"></span> performed action{' '}
  //       <span className="font-semibold text-blue-700">{action}</span> on{' '}
  //       <span className="font-semibold text-blue-700">{table_name}</span>
  //     </span>
  //   );
};

const actionOptions = ["All", "INSERT", "UPDATE", "DELETE"];
const dateOptions = [
  "Today",
  "Last 7 Days",
  "Last 30 Days",
  "Custom Date",
  "Date Range",
];

const AuditLog = ({ moduleType }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [maxHeight, setMaxHeight] = useState("0px");
  const contentRef = useRef(null);
  const [specificDate, setSpecificDate] = useState('');
const [startDate, setStartDate] = useState('');
const [endDate, setEndDate] = useState('');

  const [filters, setFilters] = useState({
    // entity: 'All',
    // user: 'All',
    action: "All",
    date: "Last 30 Days",
    customDate: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    if (!moduleType) return;

    const fetchLogs = async () => {
      try {
        setLoading(true);
        setError("");

        const params = {
          module: moduleType,
          action: filters.action !== "All" ? filters.action : undefined,
          // user: filters.user !== 'All' ? filters.user : undefined,
          // entity: filters.entity !== 'All' ? filters.entity : undefined,
          date_filter: filters.date,
          custom_date: filters.date === 'Custom Date' ? specificDate : undefined,
          fromdate: filters.date === 'Date Range' ? startDate : undefined,
          todate: filters.date === 'Date Range' ? endDate : undefined,
        };

        const response = await axios.get(
          `/server/log_creator/log_details/filter`,
          {
            params,
          }
        );
        setLogs(response.data.result || []);
      } catch (err) {
        setError("Failed to fetch logs");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [moduleType, filters, specificDate, startDate, endDate]);

  useEffect(() => {
  if (contentRef.current) {
    setMaxHeight(showFilters ? `${contentRef.current.scrollHeight}px` : "0px");
  }
}, [showFilters, filters.date, specificDate, startDate, endDate]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const groupedLogs = groupLogsByDate(logs);

  return (
    <div className="p-4 mt-6 border-t">
      <h3 className="text-[22px] font-semibold mb-4">{moduleType} Logs</h3>
      <div className="bg-[#F4F7FF] p-4 mb-2 rounded-md w-3/4 border rounded-md">
        <div
          className="font-bold text-sm  flex items-center gap-2 cursor-pointer"
          onClick={() => setShowFilters((prev) => !prev)}
        >
          RECENT ACTIVITY{" "}
          <span
            className="text-md transform transition-all duration-500 ease-in-out"
            style={{
              transform: showFilters ? "rotate(180deg)" : "rotate(0deg)",
            }}
          >
            🔽
          </span>
        </div>

        <div
          className={`transition-all duration-500 ease-in-out overflow-hidden `}
          style={{ maxHeight }}
          ref={contentRef}
        >
          <div className="flex flex-wrap gap-3 mt-3">
            <select
              className="border px-3 py-1 rounded-md text-sm"
              value={filters.action}
              onChange={(e) => handleFilterChange("action", e.target.value)}
            >
              {actionOptions.map((action) => (
                <option key={action} value={action}>
                  {action === "All" ? "All Actions" : action}
                </option>
              ))}
            </select>

            <select
              className="border px-3 py-1 rounded-md text-sm"
              value={filters.date}
              onChange={(e) => handleFilterChange("date", e.target.value)}
            >
              {dateOptions.map((date) => (
                <option key={date}>{date}</option>
              ))}
            </select>

            {filters.date === "Custom Date" && (
                <div className="flex flex-row gap-2">
                    <label className="block text-sm font-medium text-gray-700 mt-2 whitespace-nowrap">
                    Specific Date
                    </label>
                    <input
                    type="date"
                    value={specificDate}
                    onChange={(e) => setSpecificDate(e.target.value)}
                    className="border px-3 py-2 rounded-md text-sm bg-white"
                    />
                </div>
            //   <input
            //     type="date"
            //     className="border px-3 py-1 rounded-md text-sm"
            //     value={filters.customDate}
            //     onChange={(e) =>
            //       handleFilterChange("customDate", e.target.value)
            //     }
            //   />
            )}

            {filters.date === "Date Range" && (
              <>
               <label className="block text-sm font-medium  mt-2 text-gray-700 ">
                Custom Date Range
                </label>
                <div className="flex items-center gap-2">
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="border px-3 py-2 rounded-md text-sm bg-white"
                />
                <span className="text-sm">to</span>
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border px-3 py-2 rounded-md text-sm bg-white"
                />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : logs.length === 0 ? (
        <p className="text-gray-500 text-center mr-60">No logs found</p>
      ) : (
        Object.entries(groupedLogs)
          .sort((a, b) => dayjs(b[0]).valueOf() - dayjs(a[0]).valueOf())
          .map(([date, logItems], index) => (
            <div key={index} className="mb-4">
              <div className="text-black font-medium ">
                {getDateLabel(date)}
              </div>
              <div className="space-y-3  rounded-md  p-2">
                {logItems.map((log, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-4 text-sm   last:border-b-0"
                  >
                    <div className="text-gray-500 text-[14px] w-20 text-right font-medium">
                      {formatTime(log.CREATEDTIME)}
                    </div>
                    <div>{renderActionText(log)}</div>
                  </div>
                ))}
              </div>
            </div>
          ))
      )}
    </div>
  );
};

export default AuditLog;
