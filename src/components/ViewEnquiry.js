import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback, // Import useCallback
} from "react";
import Sidebar from "./Sidebar"; // This might not be used in the provided snippet
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import SalesIqBot from "./SalesIqBot"; // This might not be used in the provided snippet
import axios from "axios";
import {
  Search,
  CheckCircle,
  XCircle,
  Download,
  SquareCheck,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { setSort } from "../redux/actions/applicatorActions"; // This might not be used
import { MoveLeft } from "lucide-react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { Box, Typography } from "@mui/material"; // Import Box and Typography from MUI
import { useLocation } from "react-router-dom";
// Define a key for localStorage for this specific table
const LOCAL_STORAGE_KEY = "mrtViewEnquiryTableState"; // Changed key for this table

function ViewEnquiry() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const mail = user?.email_id || "";
  const username = user?.first_name || "";
  const [data, setData] = useState([]); // This state seems unused, using fileData for table
  const [filteredData, setFilteredData] = useState([]); // This state seems unused
  const [loading, setLoading] = useState(false);
  const [searchData, setSearchData] = useState(""); // This is used for custom search
  const [fileSearchData, setFileSearchData] = useState(""); // This seems unused
  const [fileData, setFileData] = useState([]);
  const [fileFilterData, setFileFilterData] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [openApprove, setOpenApprove] = useState(false);
  const [selectedField, setSelectedField] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // This seems unused, searchData is used
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState([]); // This seems unused
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const dropdownRef = useRef(null);
  const [totalData, setTotalData] = useState(0);
  const [nextToken, setNextToken] = useState(null); // Used for custom pagination
  const [prevToken, setPrevToken] = useState(null); // Used for custom pagination
  const [currentPage, setCurrentPage] = useState(0); // Used for custom pagination
  const [totalPages, setTotalpages] = useState(0); // Used for custom pagination
  const [selectedId, setSelectedId] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("idle");
  const [downloadUrls, setDownloadUrls] = useState({});
  const [sortedData, setSortedData] = useState([]); // This seems unused
  const [sortKey, setSortKey] = useState(""); // Used for custom sorting
  const [sortOrder, setSortOrder] = useState(""); // Used for custom sorting
  const navigate = useNavigate();


    const location = useLocation();
  const { enquiryData } = location.state || {};
  // Function to get initial table state from localStorage or default

  console.log("sended data....................>",enquiryData.enquiryid)
  const getInitialTableState = () => {
    try {
      const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedState) {
        return JSON.parse(savedState);
      }
    } catch (error) {
      console.error(
        "Error parsing saved table state from localStorage:",
        error
      );
    }

    return {
      columnPinning: {
        left: ["serialNumber", "Enquiry_Documents.Document_Name"], // Pin by default
        right: ["actions"],
      },
      // You can add other initial states here if needed, like sorting, column order, etc.
      sorting: [],
      columnFilters: [],
      globalFilter: "",
    };
  };

  // MRT State Management - Now initialized from localStorage or defaults
  const [tableState, setTableState] = useState(getInitialTableState);
  const [columnFilters, setColumnFilters] = useState(
    tableState.columnFilters || []
  );
  const [globalFilter, setGlobalFilter] = useState(
    tableState.globalFilter || ""
  );
  const [sorting, setSorting] = useState(tableState.sorting || []);
  const [pagination, setPagination] = useState(
    tableState.pagination || { pageIndex: 0, pageSize: 10 } // Default for MRT pagination
  );

  const handleNavigate = () => {
    navigate("/enquiry");
  };

  const handleFieldChange = (e) => {
    setSelectedField(e.target.value);
    setSelectedStatuses([]);
    setSearchTerm(""); // This seems unused, searchData is used
    setStartDate(""); // Clear dates too
    setEndDate(""); // Clear dates too
    setGlobalFilter(""); // Clear global filter
    setColumnFilters([]); // Clear column filters
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
    setSearchTerm(""); // This seems unused, searchData is used
    setStartDate("");
    setEndDate("");
    setSelectedStatuses([]);
    setIsDropdownOpen(false);
    setSearchData(""); // Clear custom search
    setGlobalFilter(""); // Clear global filter
    setColumnFilters([]); // Clear column filters
    setPagination({ pageIndex: 0, pageSize: 10 }); // Reset pagination
    setSorting([]); // Reset sorting
  };

  const isFilterApplied = () => {
    return (
      selectedField ||
      searchTerm || // This seems unused, searchData is used
      startDate ||
      endDate ||
      selectedStatuses.length > 0 ||
      searchData || // Check custom search
      globalFilter || // Check MRT global filter
      columnFilters.length > 0 // Check MRT column filters
    );
  };

  const handleRejectPopup = (id) => {
    console.log("ROWID", id);
    setSelectedId(id);
    setIsOpen(true);
  };

  const handleApprovePopup = (id) => {
    console.log("ROWID", id);
    setSelectedId(id);
    setOpenApprove(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setOpenApprove(false);
    setReason("");
  };

  const getCurrentTimestamp = () => {
    const now = new Date();
    console.log("Data", now);
    const pad = (n) => n.toString().padStart(2, "0");

    const year = now.getFullYear();
    const month = pad(now.getMonth() + 1);
    const day = pad(now.getDate());
    const hours = pad(now.getHours());
    const minutes = pad(now.getMinutes());
    const seconds = pad(now.getSeconds());

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const handleDocumentAction = async (action) => {
    setUploadStatus("processing");
    const approvedTime = getCurrentTimestamp();
    console.log("approveTime", approvedTime);
    try {
      const response = await axios.post(
        "/server/elite_tech_corp_function/update-document-status",
        {
          ROWID: selectedId,
          status: action,
          ...(action === "Approved" && { approvedAt: approvedTime }),
          ...(action === "Rejected" && { reason: reason }),
          user: username,
        }
      );

      console.log("Approval Response:", response.data);
      setTimeout(() => {
        setUploadStatus("success");
      }, 2000);

      setTimeout(() => {
        handleClose();
        loadData(); // Reload data after action
        setUploadStatus("idle");
      }, 5000);
    } catch (error) {
      console.error(
        "Error approving document:",
        error?.response?.data || error.message
      );
      setUploadStatus("failure");

      setTimeout(() => {
        setUploadStatus("idle");
      }, 2000);
    }
  };

  useEffect(() => {
    let filteredFiles = [...fileData];

    if (searchData) {
      // This is your custom search, which might overlap with MRT's globalFilter
      filteredFiles = filteredFiles.filter(
        (item) =>
          item.Enquiry_Documents.Contact_Person?.toLowerCase().includes(
            searchData.toLowerCase()
          ) ||
          item.Enquiry_Documents.Email_id?.toLowerCase().includes(
            searchData.toLowerCase()
          ) ||
          item.Enquiry_Documents.Document_Name?.toLowerCase().includes(
            searchData.toLowerCase()
          ) ||
          item.Enquiry_Documents.Contact_No?.toLowerCase().includes(
            searchData.toLowerCase()
          ) ||
          item.Enquiry_Documents.Document_Version?.toLowerCase().includes(
            searchData.toLowerCase()
          )
      );
    }

    if (selectedField === "Status" && selectedStatuses.length > 0) {
      filteredFiles = filteredFiles.filter((item) =>
        selectedStatuses.includes(item.Enquiry_Documents.Document_Status)
      );
    }

    setFileFilterData(filteredFiles);
  }, [
    searchData,
    selectedField,
    selectedStatuses,
    startDate,
    endDate,
    fileData,
    // Note: MRT's globalFilter and columnFilters are handled internally by MRT,
    // so you might want to reconsider this custom filtering if you want MRT to manage it fully.
  ]);

  const itemsPerPage = 10; // Changed to 10 to match default MRT page size for better integration

  // Use useCallback for loadData to prevent unnecessary re-renders in useEffect
  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const payload = {
        limit: pagination.pageSize, // Use MRT's pageSize
        offset: pagination.pageIndex * pagination.pageSize, // Use MRT's pageIndex
        email: mail,
        search: globalFilter, // Use MRT's globalFilter for server-side search
        startDate,
        endDate,
        status: selectedStatuses.join(","),
        sortKey: sorting.length > 0 ? sorting[0].id : "", // Use MRT's sorting state
        sortOrder: sorting.length > 0 ? (sorting[0].desc ? "desc" : "asc") : "", // Use MRT's sorting state
        columnFilters: columnFilters.map((filter) => ({
          // Send MRT's column filters
          id: filter.id,
          value: filter.value,
         

        })),
         crmid:enquiryData.crm_id,
          enquiryid:enquiryData.enquiryid
      };
      console.log("Payload", payload);

      const response = await axios.post(
        "/server/enquiries/document-details",
        payload
      );

      console.log("Response Data:", response.data.data);

      const documents = response.data.data || [];

      setFileData(documents);
      setFileFilterData(documents); // This will be overwritten by MRT's filtering if enabled
      setTotalData(response.data.totalRecords);
      // Removed custom pagination states as MRT will handle this
      // setNextToken(response.data.nextToken);
      // setPrevToken(response.data.prevToken);
      // setTotalpages(Math.ceil(response.data.totalRecords / itemsPerPage));
      console.log(
        "zeroth Data",
        fileFilterData[0]?.Enquiry_Documents?.Document_Name
      );
    } catch (error) {
      console.error("Error fetching data:", error || error.message);
      setFileData([]); // Set data to empty array on error
      setFileFilterData([]); // Set data to empty array on error
      setTotalData(0); // Reset total data on error
    } finally {
      setLoading(false);
    }
  }, [
    mail,
    globalFilter, // Depend on MRT's globalFilter
    selectedStatuses,
    startDate,
    endDate,
    sorting, // Depend on MRT's sorting
    pagination.pageIndex, // Depend on MRT's pagination
    pagination.pageSize, // Depend on MRT's pagination
    columnFilters, // Depend on MRT's columnFilters
  ]);

  useEffect(() => {
    loadData();
    // Re-evaluate if custom search and filter logic in the other useEffect (the one
    // dependent on searchData, selectedField, etc.) is still needed if MRT handles
    // globalFilter and columnFilters. They might conflict.
  }, [loadData]); // Depend on memoized loadData

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

//   const PdfPreview = async (fileId) => {
//   const res = await fetch(`/server/enquiries/get-file`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({ file_id: fileId }),
//   });

//   const blob = await res.blob();
//   const blobUrl = URL.createObjectURL(blob);
//   window.open(blobUrl, '_blank'); // This previews the file
// };
const PdfPreview = (fileId) => {
  if (!fileId) {
    console.error("Missing fileId");
    return;
  }
  window.open(`/server/enquiries/get-file?file_id=${fileId}`, '_blank');
};


  const fetchPdfPreview = async (fileId) => {

  alert("fileid",fileId)
    try {
      if (!fileId) {
        console.error("Missing or invalid fileId");
        return;
      }

      const filestore = window.catalyst.file;
      const folderId = "5053000000858042"; // Ensure this folder ID is correct
      const folder = filestore.folderId(folderId);
      const file = folder.fileId(fileId);

      // No need to await file.get() if you only need the download link
      // const fileDetailsPromise = await file.get();
      // const fileDetails = await fileDetailsPromise;

      const response = await file.getDownloadLink();

      const downloadUrl = response.content.download_url;

      setDownloadUrls((prev) => ({
        ...prev,
        [fileId]: downloadUrl,
      }));

      // Directly open in new tab if it's a PDF, or download if specified by the browser
      window.open(downloadUrl, "_blank");

      // The following lines force download but might be blocked by browsers as pop-ups
      // const link = document.createElement("a");
      // link.href = downloadUrl;
      // link.download = ""; // Empty string might hint browser to open
      // document.body.appendChild(link);
      // link.click();
      // document.body.removeChild(link);
    } catch (err) {
      console.error("Error fetching PDF preview:", err);
      // Handle Catalyst errors specifically if possible
      if (err.response && err.response.data && err.response.data.message) {
        alert("Error downloading file: " + err.response.data.message);
      } else {
        alert("Error downloading file. Please try again.");
      }
    }
  };

  function capitalizeFirstLetter(str) {
    if (!str) return "";

    return str
      .toLowerCase()
      .split(" ")
      .map((word) => {
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(" ");
  }

  // Material React Table Columns
  const columns = useMemo(
    () => [
      {
        accessorKey: "serialNumber",
        header: "S.NO",
        size: 100,
        flexGrow: 1,
        Cell: ({ row }) =>
          row.index + 1 + pagination.pageIndex * pagination.pageSize, // Adjust serial number for pagination
        enableSorting: false,
        enableColumnFilters: false, // Disable filter for S.NO
        enableColumnPinning: true,
      },
      {
        accessorKey: "Enquiry_Documents.Document_Name",
        header: "Document Name",
        size: 200,
        flexGrow: 10,
        Cell: ({ cell }) => {
          const docName = cell.getValue();
          const colorClass = docName?.toLowerCase().includes("pi/invoice")
            ? "bg-sky-500"
            : docName?.toLowerCase().includes("brd")
              ? "bg-green-500"
              : docName?.toLowerCase().includes("sow")
                ? "bg-orange-500"
                : docName?.toLowerCase().includes("estimation")
                  ? "bg-yellow-500"
                  : "bg-gray-500";

          return (
            <span
              className={`text-[13px] px-4 py-1 rounded-md text-white font-semibold ${colorClass}`}
            >
              {docName?.toUpperCase() || "N/A"}
            </span>
          );
        },
        enableColumnPinning: true,
      },
      // {
      //   accessorKey: "Enquiry_Documents.Contact_Person",
      //   header: "Contact Person",
      //   size: 200,
      // },
      {
        accessorKey: "Enquiry_Documents.Email_id",
        header: "Email",
        size: 250,
      },
      // {
      //   accessorKey: "Enquiry_Documents.Contact_No",
      //   header: "Contact Phone No",
      //   size: 250,
      // },
      // {
      //   accessorKey: "Enquiry_Documents.Uploaded_At",
      //   header: "Uploaded At",
      //   size: 240,
      //   Cell: ({ cell }) =>
      //     cell.getValue() ? cell.getValue().split(" ")[0] : "N/A", // Format date
      // },
      {
        accessorKey: "Enquiry_Documents.Document_Status",
        header: "Document Status",
        size: 250,
        Cell: ({ cell }) => {
          const status = cell.getValue();
          const colorClass =
            status?.toLowerCase() === "rejected"
              ? "text-red-500"
              : status?.toLowerCase() === "approved"
                ? "text-green-500"
                : status?.toLowerCase() === "signed"
                  ? "text-yellow-500"
                  : "text-blue-500";

          return (
            <span className={`font-semibold ${colorClass}`}>
              {capitalizeFirstLetter(status) || "Pending"}
            </span>
          );
        },
      },
      {
        accessorKey: "Enquiry_Documents.changes_log",
        header: "Changes Log",
        size: 250,
      },
      {
        accessorKey: "Enquiry_Documents.Approved_At",
        header: "Approved At",
        size: 200,
        Cell: ({ row }) => {
          const status = row.original.Enquiry_Documents.Document_Status;
          const approvedAt = row.original.Enquiry_Documents.Approved_At;
          return status === "Approved" && approvedAt
            ? approvedAt.split(" ")[0]
            : "-"; // Format date
        },
      },
      {
        accessorKey: "Enquiry_Documents.Document_Version",
        header: "Document Version",
        size: 250,
        Cell: ({ cell }) => cell.getValue() || "V1",
      },
      {
        accessorKey: "actions",
        header: "Action",
        size: 200,
        enableSorting: false,
        enableColumnFilters: false, // Disable filter for actions
        enableColumnPinning: true,
        Cell: ({ row }) => {
          const item = row.original;
          const status = item.Enquiry_Documents.Document_Status;
          const documentId = item.Enquiry_Documents.document_id;
          const rowId = item.Enquiry_Documents.ROWID;
          const Attachment_Id = item.Enquiry_Documents.Attachment_Id

          return (
            <div className="flex justify-center gap-4">
              {status === "Rejected" ||
                status === "Approved" ||
                status === "Signed" ? (
                // Only show download if already approved, rejected, or signed
                downloadUrls[documentId] ? (
                  <a
                    href={downloadUrls[documentId]}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download
                      size={20}
                      className="text-gray-400 cursor-pointer hover:text-yellow-600"
                    />
                  </a>
                ) : (
                  <Download
                    size={20}
                    className="text-gray-400 cursor-pointer hover:text-yellow-600"
                    onClick={() => PdfPreview(documentId)}
                  />
                )
              ) : (
                // Show approve/reject for other statuses
                <>
                  <SquareCheck
                    size={20}
                    className="text-green-500 cursor-pointer hover:text-green-700"
                    onClick={() => handleApprovePopup(rowId)}
                  />
                  <XCircle
                    size={20}
                    className="text-red-500 cursor-pointer hover:text-red-700"
                    onClick={() => handleRejectPopup(rowId)}
                  />
                  {/* Also allow download for pending or other non-final statuses if applicable */}
                  {downloadUrls[documentId] ? (
                    <a
                      href={downloadUrls[documentId]}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download
                        size={20}
                        className="text-gray-400 cursor-pointer hover:text-yellow-600"
                      />
                    </a>
                  ) : (
                    <Download
                      size={20}
                      className="text-gray-400 cursor-pointer hover:text-yellow-600"
                      onClick={() => PdfPreview(documentId)}
                    />
                  )}
                </>
              )}
            </div>
          );
        },
      },
    ],
    [
      downloadUrls,
      handleApprovePopup,
      handleRejectPopup,
      fetchPdfPreview,
      pagination,
    ]
  );

  const table = useMaterialReactTable({
    columns,
    data: fileData, // Use fileData here, as MRT will handle filtering from this
    manualFiltering: true, // Server-side filtering
    manualPagination: true, // Server-side pagination
    manualSorting: true, // Server-side sorting
    rowCount: totalData, // Use totalData for rowCount

    // MRT's internal state management, now connected to our `tableState`
    state: {
      columnFilters,
      globalFilter,
      isLoading: loading,
      pagination,
      sorting,
      columnPinning: tableState.columnPinning, // Use the state from localStorage
    },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,

    // NEW: Callback to update and save column pinning state to localStorage
    onColumnPinningChange: (updater) => {
      setTableState((prev) => {
        // MRT sends either a new value or an updater function
        const newPinningState =
          updater instanceof Function ? updater(prev.columnPinning) : updater;
        const newState = { ...prev, columnPinning: newPinningState };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newState));
        return newState;
      });
    },
    // Enable / Disable MRT features
    enableColumnActions: true,
    enableColumnFilters: true, // Keep MRT column filters enabled
    enableGlobalFilter: true, // Keep MRT global filter enabled
    enableDensityToggle: false,
    enableHiding: true,
    enableStickyHeader: true,
    enableColumnResizing: true,
    enableColumnPinning: true, // Enable column pinning feature for the table
    enableFullScreenToggle: false, // Disable full screen toggle

    // Custom Bottom Toolbar to display total records
    renderBottomToolbarCustomActions: () => (
      <Box sx={{ p: "1rem", display: "flex", alignItems: "center" }}>
        <Typography variant="body2" color="textSecondary">
          Total Records: {totalData}
        </Typography>
      </Box>
    ),

    muiTableContainerProps: {
      sx: {
        maxHeight: "65vh",
        overflowX: "auto",
        maxWidth: "100%",
        border: "1px solid whitesmoke",
      },
    },
    muiTableProps: {
      sx: {
        tableLayout: "fixed",
        maxWidth: "80vw",
      },
    },
    muiTableHeadCellProps: {
      sx: {
        fontWeight: "bold",
        backgroundColor: "#f5f5f5",
        border: "1px solid whitesmoke",
        maxWidth: "80vw",
      },
    },
    muiTableBodyCellProps: {
      sx: {
        border: "1px solid whitesmoke",
      },
    },
    muiTableBodyRowProps: ({ row }) => ({
      // No navigation needed for this table, so removed onClick handler
      sx: {
        cursor: "default", // Changed to default as no navigation on row click
        "&:hover": {
          backgroundColor: "#f5f5f5", // Use the color from template
        },
      },
    }),
  });

  return (
    <div className="flex flex-col p-8 md:p-2 pt-3">
      <div className="flex p-0 justify-between">
        <nav className="flex mb-5" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-2  !pl-0">
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
                to="/enquiry"
                className="text-[14px] text-gray-400 hover:text-gray-500"
              >
                Enquiries
              </Link>
            </li>
            <span>/</span>
            <li>
              <span className="text-[14px] text-[#6B7280]">Enquiry Detail</span>
            </li>
          </ol>
        </nav>

        <div>
          <button
            className="bg-gray-300 p-2 rounded-full text-sm font-medium text-black flex items-center justify-center transition-transform duration-300 hover:scale-105 hover:bg-gray-400"
            onClick={() => handleNavigate()}
          >
            <MoveLeft />
          </button>
        </div>
      </div>

      <div className="flex flex-col pl-2">
        <h1 className="text-[22px] font-semibold mb-1">Uploaded Documents</h1>
      </div>

      {/* Material React Table */}
      <div className="mt-4 w-full overflow-x-auto">
        <MaterialReactTable table={table} />
      </div>

      {/* Rejection Modal */}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-5 rounded-lg shadow-lg w-96 text-center">
            <h2 className="text-lg font-semibold mb-3">
              {uploadStatus === "processing" && ""}
              {uploadStatus === "success" &&
                "Document Rejected Successfully ❌"}
              {uploadStatus === "failure" && "Failed to Reject. Try Again ⛔"}
              {uploadStatus === "idle" && "Rejected Reason *"}
            </h2>

            {uploadStatus === "idle" && (
              <>
                <textarea
                  className="w-full mt-2 p-2 border h-[150px] rounded-md"
                  placeholder="Enter rejection reason..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                ></textarea>

                <div className="flex justify-end mt-4">
                  <button
                    className="bg-gray-400 text-white px-2 font-medium py-1 rounded-md mr-2 hover:bg-gray-600"
                    onClick={handleClose}
                  >
                    Cancel
                  </button>
                  <button
                    className="bg-red-500 font-medium text-white px-2 py-1 rounded-md hover:bg-red-700"
                    onClick={() => handleDocumentAction("Rejected")}
                  >
                    Submit
                  </button>
                </div>
              </>
            )}

            {uploadStatus === "processing" && (
              <p className="text-blue-500 font-medium mt-4">Processing...</p>
            )}
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {openApprove && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 w-30">
          <div className="bg-white p-5 rounded-lg shadow-lg w-96 text-center">
            <h2 className="text-lg font-semibold mb-3">
              {uploadStatus === "processing" && ""}
              {uploadStatus === "success" && "Document Approved Successfully"}
              {uploadStatus === "failure" && "Failed to Approve. Try Again"}
              {uploadStatus === "idle" &&
                "Are you sure to Approve the Document?"}
            </h2>

            {uploadStatus === "idle" && (
              <div className="flex justify-center mt-4 gap-5">
                <button
                  className="bg-green-500 font-medium text-white px-3 py-1 rounded-md hover:bg-green-700"
                  onClick={() => handleDocumentAction("Approved")}
                >
                  Approve
                </button>
                <button
                  className="bg-gray-400 text-white px-3 py-1 font-medium rounded-md hover:bg-gray-600"
                  onClick={handleClose}
                >
                  Cancel
                </button>
              </div>
            )}

            {uploadStatus === "processing" && (
              <p className="text-blue-500 font-medium mt-2">Processing...</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewEnquiry;
