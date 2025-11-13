import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light-border.css";
// import '@fortawesome/fontawesome-free/css/all.min.css';
import "@fortawesome/fontawesome-free/css/all.css";
import { useSelector, useDispatch } from "react-redux";
import successGif from "../assets/Images/SuccessGif.gif";
import EtcLogo from "../assets/Images/ETClogo.png";
import { motion, AnimatePresence } from "framer-motion";
import errorGif from "../assets/Images/404-error.gif";
import jsPDF from "jspdf";
import "jspdf-autotable";
import ".././assets/css/PlanTable.css";
import SalesIqBot from "./SalesIqBot";
import { MoveLeft } from "lucide-react";
import { useNavigate } from "react-router";
import axios from 'axios';

import { useLocation } from "react-router";
  import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
  AlignmentType,
  HeadingLevel,
  ImageRun,
} from "docx";


function PlanTable() {
  const [activePlan, setActivePlan] = useState("Basic");
  const [customSelections, setCustomSelections] = useState({});
  const [manualSelections, setManualSelections] = useState({});
  const [autoSelectedByRoles, setAutoSelectedByRoles] = useState([]);
  const [total, setTotal] = useState("");
  const [showGifPopup, setShowGifPopup] = useState(false);
  const [popupType, setPopupType] = useState("success");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [loading, setLoading] = useState(false); // Set initial loading to true
  const navigate = useNavigate();
  const handleNavigate = () => {
    navigate("/bundlePage");
  };

  const users = useSelector((state) => state.user);
  console.log("User0", users);

  const productsName = sessionStorage.getItem("productName");

  const users_last_name = users.last_name;
  const users_first_name = users.first_name;
  console.log("users_firstname", users_first_name);
  console.log("users_lastname", users_last_name);
  const emailUser = useSelector((state) => state.user.email_id);

  // Initialize tasks as an empty array
  const [tasks, setTasks] = useState([]);
const location = useLocation();
  const product = location.state?.product;


  console.log(product)

  useEffect(() => {
    if (product) {
      setTasks([product]); 
    }
  }, [product]);





  // *** REPLACED USEEFFECT HOOK ***
  // useEffect(() => {
  //   const fetchTaskDetails = async () => {
  //     setLoading(true); // Start loading indicator
  //     try {
  //       const response = await axios.get(`/server/plandetails/get-plan-details`);

  //       // 1. Access the nested 'data' array from the API response
  //       const apiData = response.data.data;

  //       if (!Array.isArray(apiData)) {
  //         throw new Error("API response is not in the expected format.");
  //       }

  //       // 2. Transform the API data to match the component's expected structure
  //       const transformedTasks = apiData.map(task => ({
  //         // Fix casing: 'module' -> 'Module'
  //         Module: task.module,
  //         // The component expects 'dependsOn' to exist, so we ensure it's an array
  //         dependsOn: task.dependsOn || [],

  //         Activities: task.Activities.map(activity => ({
  //           // Fix casing: 'subtask' -> 'Subtask'
  //           Subtask: activity.subtask,
  //           // Fix casing: 'description' -> 'Description'
  //           Description: activity.description,
  //           // Convert estimatedTime to a number, defaulting to 0 if empty/invalid
  //           EstimatedTime: Number(activity.estimatedTime) || 0,

  //           // 3. Add the missing plan booleans.
  //           // IMPORTANT: The API response doesn't specify which plan an activity
  //           // belongs to. We are assuming all activities are available in all
  //           // predefined plans. Your API should ideally provide this info.
  //           Basic: true,
  //           Intermediate: true,
  //           Advanced: true,
  //         }))
  //       }));

  //       console.log("Transformed data for component:", transformedTasks);
  //       setTasks(transformedTasks); // Set the correctly formatted data

  //     } catch (err) {
  //       console.error("Error fetching or transforming task details:", err);
  //       // Optionally, set an error state here to show a message to the user
  //     } finally {
  //       setLoading(false); // Stop loading indicator
  //     }
  //   };

  //   fetchTaskDetails();

  // }, []); // Empty dependency array ensures this runs only once on component mount

  const handleCustomCheckboxChange = (module, subtask, isChecked) => {
    const key = `${module}-${subtask}`;
    setCustomSelections((prev) => ({ ...prev, [key]: isChecked }));

    if (isChecked) {
      setManualSelections((prev) => ({ ...prev, [key]: true }));
    } else if (!manualSelections[key]) {
      setManualSelections((prev) => {
        const updated = { ...prev };
        delete updated[key];
        return updated;
      });
    }
    const handleDependencies = (mod) => {
      const task = tasks.find((t) => t.Module === mod);
      if (!task) return;

      const depModules = task.dependsOn || [];

      depModules.forEach((dep) => {
        const depTask = tasks.find((t) => t.Module === dep);
        if (!depTask) return;

        depTask.Activities.forEach((activity) => {
          const depKey = `${dep}-${activity.Subtask}`;

          if (isChecked) {
            setCustomSelections((prev) => ({ ...prev, [depKey]: true }));
            if (!manualSelections[depKey]) {
              setAutoSelectedByRoles((prev) => [...new Set([...prev, depKey])]);
            }
          } else {
            setCustomSelections((prev) => {
              const updated = { ...prev };
              if (!manualSelections[depKey]) delete updated[depKey];
              return updated;
            });
            setAutoSelectedByRoles((prev) => prev.filter((k) => k !== depKey));
          }
          handleDependencies(dep);
        });
      });
    };

    handleDependencies(module);
  };

  const calculateEstimatedTime = () => {
    let total = 0;
    tasks.forEach((task) => {
      task.Activities.forEach((activity) => {
        const key = `${task.Module}-${activity.Subtask}`;
        if (activePlan === "Custom") {
          if (customSelections[key]) total += activity.EstimatedTime;
        } else if (activity[activePlan]) {
          total += activity.EstimatedTime;
        }
      });
    });
    return total;
  };

  // useEffect(() => {
  //   const total = calculateEstimatedTime();
  //   setTotal(total);
  //   console.log("Updated total", total);
  // }, [customSelections, activePlan, tasks]);

  const generatePDF = async (payload) => {
    const doc = new jsPDF({ compress: true });

    const toBase64 = (url, opacity = 1.0) =>
      fetch(url)
        .then((res) => res.blob())
        .then((blob) => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const img = new Image();
              img.onload = () => {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");

                canvas.width = img.width;
                canvas.height = img.height;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.globalAlpha = opacity;
                ctx.drawImage(img, 0, 0);

                resolve(canvas.toDataURL("image/png"));
              };
              img.onerror = reject;
              img.src = reader.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        });

    const compressedImage = await toBase64(EtcLogo, 1.0);
    const watermarkImage = await toBase64(EtcLogo, 0.1);

    const drawExtras = (data) => {
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const wmWidth = 80;
      const wmHeight = 100;
      const centerX = (pageWidth - wmWidth) / 2;
      const centerY = (pageHeight - wmHeight) / 2;

      doc.addImage(watermarkImage, "JPEG", centerX, centerY, wmWidth, wmHeight);

      if (data.pageNumber === 1) {
        const logoWidth = 30;
        const logoHeight = 40;
        const margin = 10;
        const logoX = pageWidth - logoWidth - margin;
        const logoY = margin;

        doc.addImage(
          compressedImage,
          "JPEG",
          logoX,
          logoY,
          logoWidth,
          logoHeight
        );
      }
    };

    doc.setFontSize(16);
    doc.setTextColor(18, 95, 167);
    doc.setFont(undefined, "bold");
    doc.text("Enquiry Submission Details", 14, 20);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);

    doc.setFont(undefined, "bold");
    doc.text("Name: ", 14, 30);
    doc.setFont(undefined, "normal");
    doc.text(`${payload.user || "N/A"} ${payload.LastName || ""}`, 40, 30);

    doc.setFont(undefined, "bold");
    doc.text("Email: ", 14, 37);
    doc.setFont(undefined, "normal");
    doc.text(payload.Email || "N/A", 40, 37);

    doc.setFont(undefined, "bold");
    doc.text("Product: ", 14, 44);
    doc.setFont(undefined, "normal");
    doc.text(payload.ProductName || "N/A", 40, 44);

    const gap = 12;
    const selectedEnquiriesY = 44 + gap;

    doc.setFont(undefined, "bold");
    doc.text("Selected Enquiries:", 14, selectedEnquiriesY);

    const tableRows = payload.Plans.map((task) => [
      task.Module,
      task.Subtask,
      task.Description,
      // task.SelectedPlan,
      // `${task.EstimatedTime || 0}`,
    ]);

    // const totalHours = payload.Plans.reduce(
    //   (sum, t) => sum + Number(t.EstimatedTime || 0),
    //   0
    // );

    // tableRows.push([
    //   {
    //     content: "Total Hours",
    //     colSpan: 4,
    //     styles: {
    //       halign: "right",
    //       fontStyle: "bold",
    //       fillColor: [230, 230, 230],
    //     },
    //   },
    //   {
    //     content: `${totalHours}`,
    //     styles: { fontStyle: "bold", fillColor: [230, 230, 230] },
    //   },
    // ]);

    doc.autoTable({
      head: [["Module", "Subtask", "Description",
        //  "Plan", "Est.Hr"
        ]],
      body: tableRows,
      startY: 60,
      styles: {
        fontSize: 10,
        align: "center",
        cellPadding: 4,
        lineColor: "#05A4E5",
        lineWidth: 0.1,
      },
      headStyles: {
        halign: "center",
        fontSize: 12,
        fillColor: "#1F6CB6",
        textColor: [255, 255, 255],
      },
      columnStyles: {
        2: { cellWidth: 70 },
        4: { cellWidth: 20, halign: "center" },
      },
      didParseCell: function (data) {
        if (data.section === "body" && data.column.index === 0) {
          data.cell.styles.fontStyle = "bold";
        }
      },
      didDrawPage: drawExtras,
    });

    return new Promise((resolve) => {
      const pdfBlob = doc.output("blob");
      doc.save("Enquiry.pdf");
      resolve(pdfBlob);
    });
  };




const generateWord = async (payload, triggerDownload = false) => {
  // Optionally convert image to base64 for logo/watermark
  const convertImageToBase64 = async (url) => {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(",")[1]); // base64 part
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Optional: Base64 image support
  const logoBase64 = await convertImageToBase64(EtcLogo);

  // Total Hours
  const totalHours = payload.Plans.reduce(
    (sum, t) => sum + Number(t.EstimatedTime || 0),
    0
  );

  const doc = new Document({
    sections: [
      {
        children: [
          // Logo on top-right (optional)
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new ImageRun({
                data: Uint8Array.from(atob(logoBase64), (c) => c.charCodeAt(0)),
                transformation: {
                  width: 60,
                  height: 60,
                },
              }),
            ],
          }),

          // Title
          new Paragraph({
            text: "Enquiry Submission Details",
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 300 },
          }),

          // User Info
          new Paragraph({
            children: [
              new TextRun({ text: "Name: ", bold: true }),
              new TextRun(`${payload.user} ${payload.LastName}`),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Email: ", bold: true }),
              new TextRun(payload.Email),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Product: ", bold: true }),
              new TextRun(payload.ProductName),
            ],
            spacing: { after: 300 },
          }),

          // Section Header
          new Paragraph({
            text: "Selected Enquiries",
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 300 },
          }),

          // Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              // Table header row
              new TableRow({
                tableHeader: true,
                children: ["Module", "Subtask", "Description", 
                  // "Plan", 
                  // "Est.Hr"
                ].map((header) =>
                  new TableCell({
                    children: [
                      new Paragraph({
                        text: header,
                        bold: true,
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                  })
                ),
              }),

              // Data rows
              ...payload.Plans.map((task) =>
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({ text: task.Module, bold: true })],
                    }),
                    new TableCell({ children: [new Paragraph(task.Subtask)] }),
                    new TableCell({ children: [new Paragraph(task.Description)] }),
                    // new TableCell({ children: [new Paragraph(task.SelectedPlan)] }),
                    // new TableCell({
                    //   children: [
                    //     new Paragraph({
                    //       text: `${task.EstimatedTime}`,
                    //       alignment: AlignmentType.CENTER,
                    //     }),
                    //   ],
                    // }),
                  ],
                })
              ),

              // Total Hours row
              // new TableRow({
              //   children: [
              //     new TableCell({
              //       children: [new Paragraph({ text: "Total Hours", bold: true, alignment: AlignmentType.RIGHT })],
              //       columnSpan: 4,
              //     }),
              //     new TableCell({
              //       children: [
              //         new Paragraph({
              //           text: `${totalHours}`,
              //           bold: true,
              //           alignment: AlignmentType.CENTER,
              //         }),
              //       ],
              //     }),
              //   ],
              // }),
            ],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);

  if (triggerDownload) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Enquiry_Details.docx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return blob;
};




  const handleSubmit = async () => {
    const selectedTasks = [];

    tasks.forEach((task) => {
      task.Activities.forEach((activity) => {
        const key = `${task.Module}-${activity.Subtask}`;
        let isIncluded = false;

        if (activePlan === "Custom") {
          isIncluded = customSelections[key];
        } else {
          isIncluded = activity[activePlan];
        }

        if (isIncluded) {
          selectedTasks.push({
            Module: task.Module,
            Subtask: activity.Subtask,
            Description: activity.Description,
            SelectedPlan: activePlan,
            EstimatedTime: activity.EstimatedTime,
          });
        }
      });
    });

    const users_first_name = sessionStorage.getItem("first_name") || "User";
    const users_last_name = sessionStorage.getItem("last_name") || "";
    const emailUser = sessionStorage.getItem("email") || "unknown@example.com";

    const payload = {
      user: users_first_name,
      LastName: users_last_name,
      ProductName: productsName,
      Email: emailUser,
      Plans: selectedTasks,
      crmid: "",
    };

    try {
      setSubmitLoading(true);

      console.log("Payload for PDF/Word", payload);

      // ✅ Generate PDF (to upload) and Word (to download)
      // const [pdfBlob] = await Promise.all([
      //   generatePDF(payload),
      //   generateWord(payload, true), // This just downloads the file in browser
      // ]);
const pdfBlob = await generatePDF(payload);
      const pdfFile = new File([pdfBlob], "Generated.pdf", { type: "application/pdf" });

      // ✅ Create FormData for PDF only
      const formData = new FormData();
      formData.append("pdf", pdfFile);
      formData.append("payload", JSON.stringify(payload));

      const response = await fetch("/server/enquiries/insert-enquiry", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to submit enquiry");

      const data = await response.json();
      console.log("Submission Success:", data);

      setPopupType("success");
      setShowGifPopup(true);
      setTimeout(() => setShowGifPopup(false), 7000);
    } catch (error) {
      console.error("Submission Error:", error);
      setPopupType("error");
      setShowGifPopup(true);
      setTimeout(() => setShowGifPopup(false), 2500);
    } finally {
      setSubmitLoading(false);
    }
  };




  function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }


  const isAnyCustomCheckboxSelected = () => {
    return Object.values(customSelections).some(
      (selected) => selected === true
    );
  };

  const getPlanColumnStyle = (planType) =>
    activePlan === planType
      ? "border-l-[1px] border-r-[1px] border-[#008F39] bg-gradient-to-b from-[#008F39]/10 via-[#008799]/10 to-[#00417A]/10"
      : "";

  // Render a loading state
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading implementation plans...</div>;
  }

  return (
    <div className="flex flex-col p-8 pt-3 ">
      {/* ... (rest of your JSX code is unchanged) ... */}
      <div className="flex justify-between">
        <nav className="flex mb-5" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-2  !pl-0">
            <li>
              <Link
                to="/dashboard"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Dashboard
              </Link>
            </li>
            <span>/</span>
            <li>
              <Link
                to="/bundlePage"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Bundle Solutions
              </Link>
            </li>
            <span>/</span>
            <li className="text-sm text-[#6B7280] font-medium">
              Bundle solution plans
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

      <h1 className="text-2xl font-semibold mb-4 text-gray-800">
        Bundle Solution For Zoho Implementations
      </h1>

      <div className="overflow-x-auto w-[3/4] bg-white shadow-xl rounded-2xl border border-gray-200">
        <div className="min-w-[600px] max-w-[3/4] overflow-y-auto max-h-[calc(100vh-300px)] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <table className="w-full text-xs sm:text-sm md:text-md">
            <thead className="sticky top-0 bg-gray-200 text-gray-700 font-semibold z-10">
              <tr className="text-center">
                <th className="px-4 sm:px-4 py-2 w-[300px] min:w-[180px]">Module</th>
                <th className="px-2 sm:px-4 py-2">Subtask</th>
                {[
                  // "Basic", "Intermediate", "Advanced", 
                  "Custom"].map((plan) => (
                  <th
                    key={plan}
                    className={`px-2 sm:px-4 py-2 w-[120px] sm:w-[180px] ${getPlanColumnStyle(
                      plan
                    )}`}
                  >
                    {plan}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[product]?.map((task) =>
                task.Activities.map((activity, index) => (
                  <tr
                    key={`${task.Module}-${activity.Subtask}`}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    {index === 0 && (
                      <td
                        rowSpan={task.Activities.length}
                        className="px-4 sm:px-4 py-4 font-bold align-top bg-gray-50 text-gray-700"
                      >
                        {task.Module}
                      </td>
                    )}
                    <td className="px-2 sm:px-4 py-2 relative text-gray-700 break-words">
                      {activity.Subtask}
                      <Tippy
                        placement="right"
                        content={activity.Description}
                        theme="light-gray"
                        animation="scale"
                      >
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-xs text-gray-600">
                          <i className="fa fa-info-circle"></i>
                        </span>
                      </Tippy>
                    </td>

                    {/* {["Basic", "Intermediate", "Advanced"].map((plan) => (
                      <td
                        key={plan}
                        className={`text-center ${getPlanColumnStyle(plan)}`}
                      >
                        <div className="px-2 sm:px-4 py-2 flex justify-center">
                          <input
                            type="checkbox"
                            className={`w-4 h-4 cursor-default border-white ${activePlan === plan && activity[plan]
                              ? "accent-green-600 border"
                              : "accent-green-600"
                              }`}
                            checked={!!activity[plan]}
                            readOnly
                          />
                        </div>
                      </td>
                    ))} */}

                    <td
                      className={`text-center ${getPlanColumnStyle("Custom")}`}
                    >
                      <div className="px-2 sm:px-4 py-2 flex justify-center">
                        <input
                          type="checkbox"
                          className={`accent-green-600 w-4 h-4 ${activePlan === "Custom"
                            ? "cursor-pointer"
                            : "cursor-not-allowed"
                            }`}
                          checked={
                            !!customSelections[
                            `${task.Module}-${activity.Subtask}`
                            ]
                          }
                          disabled={activePlan !== "Custom"}
                          onChange={(e) =>
                            handleCustomCheckboxChange(
                              task.Module,
                              activity.Subtask,
                              e.target.checked
                            )
                          }
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot className="sticky bottom-0 bg-gray-100 z-10">
              <tr className="text-center text-xs sm:text-sm font-medium text-gray-600">
                <td colSpan={2} className="py-2 font-bold">
                  Select Access Level
                </td>
                {[
                  // "Basic", "Intermediate", "Advanced",
                 "Custom"].map((plan) => (
                  <td
                    key={plan}
                    className={`cursor-pointer transition px-2 sm:px-4 py-2 rounded ${activePlan === plan
                      ? "bg-gradient-to-r from-[#008F39] via-[#008799] to-[#00417A] text-white"
                      : "bg-white border hover:bg-gray-200 text-gray-700"
                      }`}
                    onClick={() => setActivePlan(plan)}
                  >
                    {activePlan === plan ? "Active" : "Access"}
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* <div className="mt-4 text-right pr-6 text-lg font-medium text-gray-700">
        Total Estimated Time ({activePlan}):{" "}
        <span className="text-green-700 font-bold">{total} hrs</span>
      </div> */}

      {(
        // activePlan === "Advanced" ||
        // activePlan === "Intermediate" ||
        // activePlan === "Basic" ||
        (activePlan === "Custom" && isAnyCustomCheckboxSelected())) && (
          <div className="mt-4 text-center text-lg font-medium text-gray-700">
            <button
              onClick={handleSubmit}
              className="bg-gradient-to-r from-[#008F40] to-[#00410C] hover:opacity-90 text-white px-20 py-2 rounded-2xl text-md font-semibold shadow-lg transition-all duration-300"
              disabled={submitLoading}
            >
              {submitLoading ? "Submitting..." : "Submit"}
            </button>
          </div>
        )}
      <AnimatePresence>
        {showGifPopup && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="bg-white shadow-2xl rounded-2xl p-6 max-w-sm w-full flex flex-col items-center"
            >
              <img
                src={popupType === "success" ? successGif : errorGif}
                alt={popupType === "success" ? "Success" : "Error"}
                className="w-94 h-94 object-cover"
              />
              <h2
                className={`text-xl font-bold mb-2 ${popupType === "success" ? "text-green-600" : "text-red-600"
                  }`}
              >
                {popupType === "success"
                  ? "Submission Successful!"
                  : "Submission Failed!"}
              </h2>
              <p className="text-gray-600 text-sm text-center">
                {popupType === "success"
                  ? "Your plan details were submitted successfully."
                  : "There was a problem submitting your plan details. Please try again."}
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default PlanTable;