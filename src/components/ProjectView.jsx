import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { Mail, Milestone } from "lucide-react";
import { Phone } from "lucide-react";
import axios from "axios";
import Success from '.././assets/Images/Sucess.gif';
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setFormFields, setResponseData } from "../redux/actions/inputsheet";
import PlanOfAction from "./NewProjectDetails/PlanOfActions";
import ProjectDetails from "../components/NewProjectDetails/ProjectDetails";
import ConsumptionTime from "./NewProjectDetails/ConsumptionTime";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import Milestones from "./NewProjectDetails/Milestones";
import Taskdetails from "./NewProjectDetails/Tasktable";
import Loader from "./Loader";
import jsondata from '../assets/verge_cloud_hrm.json'
import Inputsheet from "./NewProjectDetails/Inputsheet";
import Projectdelayed from "./NewProjectDetails/ProjectDelayed";
import {
  FolderOpen,
  Timer,
  ListTodo,
  CalendarClock,
  Target,
  AlertTriangle,
  AlarmClock,
  FileText,
  ListChecks,
  ReceiptIndianRupee,
  FileClock,
  LayoutDashboard
} from "lucide-react";
import { useTheme } from "styled-components";
import MeetingTable from "./MeetingTable";
import ProjectDeviationTable from "./NewProjectDetails/ProjectDeviationTable";
import { useNavigate } from "react-router";
import { MoveLeft } from "lucide-react";
import { useSelector } from "react-redux";



export const ProjectView = () => {
  const dispatch = useDispatch()
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("activeProjectTab") || "projectDetails";
  });


  const [formError, setFormError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [formFields, setFormFields] = useState([]);
  const [mailId, setMailId] = useState("");
  const [milestoneId, setMilestoneId] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [responseData, setResponseData] = useState(null);
  const [submitForm, setSubmitForm] = useState("Submit");
  const [formSuccess, setFormSuccess] = useState(false);
  const [summary, setSummary] = useState();
  const [input, setInput] = useState([]);
  const isSidebarShrunk = useSelector((state) => state.sidebar.isSidebarShrunk);
  const [formLoader, setFormLoader] = useState(false)
  const [firstSprint, setFirstSprint] = useState(null);
  const [milestoneData, setMilestoneData] = useState([]);
  const [projectNo, setProjectNo] = useState("");
  const [filteredTasks, setFilteredTasks] = useState({
    parentTasks: [],
    subtaskMap: new Map()
  });
  const [sprintCount, setSprintCount] = useState(0);
  const [sprints, setSprints] = useState([]);
  const [extersprint, setExternalsprint] = useState([]);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [milestoneID, setMilestone] = useState()
  const [milestonename, setmilestonename] = useState()
  const [sprintList, setSprintList] = useState([]);
  const [datas, setDatas] = useState()
  const [totalTaskCountData, setTotalTaskCountData] = useState();
  const [totalhrs, setTotalhrs] = useState({
    total_estimated_hours: "00:00",
    total_billable_hours: "00:00",
    total_consumed_hours: "00:00",
    total_available_estimated_hrs: "00:00",
    total_available_billable_hrs: "00:00",
    total_approved_billable_hrs: "00:00"
  });
  const [sprintstask, setSprintstask] = useState()
  const location = useLocation();
  const project = location.state?.project;
  console.log("Received Project:", project);
  console.log("ProjectId", project.external_project_id);
  const projectId = project.external_project_id
  const projectsaname = project.project_name
  const projectsdispaly_id = project.project_display_id
  console.log("projects>>>", projectsdispaly_id);
  console.log("projecsgadfbf>>>", projectsaname);
  const rolepremission = useSelector((state) => state.userpermission)
  console.log("showuserpermission", rolepremission);
  const hasPermission = (moduleName, componentName) => {
    const permissions = rolepremission?.permissiondata?.data || [];

    for (const role of permissions) {
      for (const module of role.modules) {
        if (module.module === moduleName) {
          for (const component of module.components) {
            if (component.name === componentName) {
              const permissionArray = component.permissions.flatMap(p =>
                p.split(',').map(str => str.trim())
              );
              return permissionArray.includes("View");
            }
          }
        }
      }
    }

    return false;
  };
  const navigate = useNavigate();
  const handleNavigate = () => {
    navigate("/project");
  }

  useEffect(() => {
    async function fetchMilestones() {
      try {
        const res = await fetch(`/server/sprints-projects-sync/projects/${projectId}`);
        const data = await res.json();
        console.log("data>>>>", data);

        let sprints = data?.sprint_data || [];
        console.log("show sprints data", sprints);
        setDatas(sprints[0])

        let setDashBoardDisplayCount = data?.data || {};
        console.log(' setDashBoardDisplayCount : ', setDashBoardDisplayCount);
        setTotalTaskCountData(setDashBoardDisplayCount);


        setProjectNo(data.data.external_project_id);
        console.log(">SGQFGAGQEGRE", data.data.external_project_id);

        if (projectId === "") {
          setSprintCount(data?.sprint_data.length);
        } else {
          setSprintCount(data?.sprint_data.length);
        }
        console.log(">>>>>>>><<<<<<<<<<<<", data?.sprint_data.length);

        if (projectId === "39761000000056310") {
          sprints = sprints.map(sprint => ({
            ...sprint,
            sprintName: "test-5-5"
          }));
        }
        setSprints(sprints);
        console.log("sprint_Data", sprints);

        setSprintstask(data?.sprint_item_data || [])
        console.log("sprints_task", data?.sprint_item_data);
        setExternalsprint()

      } catch (error) {
        console.log("Error Fetching data", error);
      } finally {
        setLoading(false);
      }
    }

    fetchMilestones();
  }, [projectId, projectsaname]);

  useEffect(() => {
    async function fetchAllSprints() {
      try {
        const res = await fetch(`/server/sprint-sprints-sync/sprints/${projectId}`);
        const json = await res.json();
        console.log("Full API Response:", json);
        const sprints = json?.data;
        if (!Array.isArray(sprints)) {
          console.error("sprints is not an array:", sprints);
          return;
        }
        const formatted = sprints.map((s, i) => {
          console.log(`Sprint ${i}:`, s?.ProjectSprints);
          return {
            id: s.ProjectSprints?.display_sprint_id || "no-id",
            name: s.ProjectSprints?.sprint_name || "Unnamed Sprint",
          };
        });

        console.log(" Formatted sprints before state set:", formatted);
        setSprintList(formatted);
        const totalData = json?.total || {};
        console.log(" Total Data:", totalData);
        setTotalhrs({
          total_estimated_hours: totalData.total_estimated_hours || "00:00",
          total_billable_hours: totalData.total_billable_hours || "00:00",
          total_consumed_hours: totalData.total_consumed_hours || "00:00",
          total_available_estimated_hrs: totalData.total_available_estimated_hrs || "00:00",
          total_available_billable_hrs: totalData.total_available_billable_hrs || "00:00",
          total_approved_billable_hrs: totalData.total_approved_billable_hrs || "00:00"
        });

      } catch (err) {
        console.error(" Failed to fetch sprints", err);
      }
    }

    if (projectId) {
      console.log(" Using projectId:", projectId);
      fetchAllSprints();
    }
  }, [projectId]);

  useEffect(() => {
    console.log("Updated Sprint List (state):", sprintList);
    console.log("datsdvsdfavdf", datas);
  }, [sprintList, datas]);

  useEffect(() => {
    async function fetchMeetingDetails() {
      try {
        setError(null);
        setLoading(true);

        const res = await fetch(
          `/server/crm_project_delayed_remainder/get/delayed-reminders/${projectId}`
        );
        if (!res.ok) {
          throw new Error(`Error fetching data: ${res.status}`);
        }
        const json = await res.json();
        const meetingData = json.data;
        console.log("project_delayed_data", meetingData);
        setSummary(meetingData);
        // setSummary([meetingData]);
      } catch (error) {
        console.error(error);
        setError(error.message || "Error fetching data");
      } finally {
        setLoading(false);
      }
    }
    if (projectId) {
      fetchMeetingDetails();
    }
  }, [projectId]);

  useEffect(() => {
    if (sprints.length > 0 && activeTab === "projectDetails") {
      setActiveTab("projectDetails");
    }
  }, [sprints]);

  useEffect(() => {
    console.log("Filtered Parent Tasks:", filteredTasks.parentTasks);
    console.log("Subtask Map:");
    for (let [parentId, subtask] of filteredTasks.subtaskMap.entries()) {
      console.log(`Parent ID: ${parentId}`, subtask);
    }
  }, [filteredTasks]);

  // const staticTabs = [
  //   {
  //     id: "projectDetails",
  //     label: "Project Details",
  //     icon: <FolderOpen size={16} />,
  //   },
  //   {
  //     id: "consumptionTime",
  //     label: "Consumption Time",
  //     icon: <Timer size={16} />,
  //   },
  //   { id: "poa", label: "POA", icon: <ListTodo size={14} /> },
  // ];

  // const milestoneTabs = sprints.map((sprint, index) => ({
  //   id: `milestone${index + 1}`,
  //   label: sprint?.sprint_name,
  //   icon: <Target size={14} />,
  // }));

  // const additionalTabs = [
  //   {
  //     id: "meetingDetails",
  //     label: "Meeting Details",
  //     icon: <CalendarClock size={16} />,
  //   },
  //   {
  //     id: "deviationList",
  //     label: "Deviation List",
  //     icon: <AlertTriangle size={16} />,
  //   },
  //   {
  //     id: "projectDelayedReminders",
  //     label: "Project Delayed Reminders",
  //     icon: <AlarmClock size={16} />,
  //   },
  //   {
  //     id: "inputSheet",
  //     label: "Input Sheet",
  //     icon: <FileText size={14} />,
  //   },
  //   // {
  //   //   id:'Taskdetails',
  //   //   label:'Task_details',
  //   //   icons:''
  //   //   }
  // ];

  // const tabs = [...staticTabs, ...milestoneTabs, ...additionalTabs];

  //permissions
  const getFilteredTabs = () => {
    const staticTabs = [
      {
        id: "projectDetails",
        label: "Project Details",
        icon: <FolderOpen size={16} />,
        component: "Project Details",
      },
      {
        id: "consumptionTime",
        label: "Consumption Time",
        icon: <Timer size={16} />,
        component: "Consumption Time",
      },
      {
        id: "poa",
        label: "POA",
        icon: <ListTodo size={14} />,
        component: "POA",
      },
    ];

    const milestoneTabs = sprints.map((sprint, index) => ({
      id: `milestone${index + 1}`,
      label: sprint?.sprint_name,
      icon: <Target size={14} />,
      component: "milestone"

    }));

    const additionalTabs = [
      {
        id: "meetingDetails",
        label: "Meeting Details",
        icon: <CalendarClock size={16} />,
        component: "Meeting Details",
      },
      {
        id: "deviationList",
        label: "Deviation List",
        icon: <AlertTriangle size={16} />,
        component: "Deviation List",
      },
      {
        id: "projectDelayedReminders",
        label: "Project Delayed Reminders",
        icon: <AlarmClock size={16} />,
        component: "Project Delayed Reminders",
      },
      {
        id: "inputSheet",
        label: "Input Sheet",
        icon: <FileText size={14} />,
        component: "Input Sheet",
      },
    ];
    const allTabs = [...staticTabs, ...milestoneTabs, ...additionalTabs];
    const filteredTabs = allTabs.filter(tab => {
      if (!tab.component) {
        return true;
      }
      return hasPermission("Project view", tab.component);
    });
    return filteredTabs;
  };
  const tabs = getFilteredTabs();

  useEffect(() => {
    const validTabs = getFilteredTabs();
    const validTabIds = validTabs.map(tab => tab.id);
    if (!validTabIds.includes(activeTab) && validTabs.length > 0) {
      setActiveTab(validTabs[0].id);
      localStorage.setItem("activeProjectTab", validTabs[0].id);
    }
  }, [rolepremission, sprints]);

  // const renderTabContent = () => {
  //   switch (activeTab) {
  //     case "projectDetails":
  //       return <ProjectDetails projectId={projectId} projectsdisplayID={projectsdispaly_id} projectname={projectsaname} />
  //     case "consumptionTime":
  //       return <ConsumptionTime projectId={projectId} projectname={projectsaname} />
  //     case "poa":
  //       return <PlanOfAction projectIds={projectId} projectdet={project} />
  //     case "meetingDetails":
  //       return <MeetingTable projectId={projectId} milestone={sprintList} projectdet={project} />
  //     case "deviationList":
  //       return <ProjectDeviationTable projectId={projectId} projectdet={project} milestone={sprintList} />

  //     case "projectDelayedReminders":
  //       return <Projectdelayed projectId={projectId} milestone={sprintList} projectdet={project} />
  //     case "inputSheet":
  //       return <Inputsheet projectId={projectId} projectdet={project} milestone={sprintList} />;
  //     // case "Taskdetails":
  //     //   return <Taskdetails  proj_no={projectNo} task={sprintstask} projectId={projectId}/>
  //     default:
  //       if (activeTab.startsWith("milestone")) {
  //         const milestoneNumber = parseInt(activeTab.replace("milestone", ""));
  //         console.log("milestoneNumber", milestoneNumber);
  //         const sprint = sprints[milestoneNumber - 1];
  //         return <Milestones milestoneNumber={milestoneNumber} sprintData={sprint} proj_no={projectNo} task={sprintstask} projectId={projectId} />;
  //       }
  //       return null;
  //   }
  // };

  const renderTabContent = () => {

    const renderUnauthorized = (componentName) => (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <h3 className="text-xl font-semibold mb-2">Access Restricted</h3>
      </div>
    );

    switch (activeTab) {
      case "projectDetails":
        if (!hasPermission("Project view", "Project Details")) {
          return renderUnauthorized("Project Details");
        }
        return <ProjectDetails projectId={projectId} projectsdisplayID={projectsdispaly_id} projectname={projectsaname} />;

      case "consumptionTime":
        if (!hasPermission("Project view", "Consumption Time")) {
          return renderUnauthorized("Consumption Time");
        }
        return <ConsumptionTime projectId={projectId} projectname={projectsaname} />;

      case "poa":
        if (!hasPermission("Project view", "POA")) {
          return renderUnauthorized("POA");
        }
        return <PlanOfAction projectIds={projectId} projectdet={project} />;

      case "meetingDetails":
        if (!hasPermission("Project view", "Meeting Details")) {
          return renderUnauthorized("Meeting Details");
        }
        return <MeetingTable projectId={projectId} milestone={sprintList} projectdet={project} />;

      case "deviationList":
        if (!hasPermission("Project view", "Deviation List")) {
          return renderUnauthorized("Deviation List");
        }
        return <ProjectDeviationTable projectId={projectId} projectdet={project} milestone={sprintList} />;

      case "projectDelayedReminders":
        if (!hasPermission("Project view", "Project Delayed Reminders")) {
          return renderUnauthorized("Project Delayed Reminders");
        }
        return <Projectdelayed projectId={projectId} milestone={sprintList} projectdet={project} />;

      case "inputSheet":
        if (!hasPermission("Project view", "Input Sheet")) {
          return renderUnauthorized("Input Sheet");
        }
        return <Inputsheet projectId={projectId} projectdet={project} milestone={sprintList} />;

      default:
        if (activeTab.startsWith("milestone")) {
          const milestoneNumber = parseInt(activeTab.replace("milestone", ""));
          console.log("milestoneNumber", milestoneNumber);
          const sprint = sprints[milestoneNumber - 1];
          // if (!hasPermission("Project view", "Milestones")) {
          //   return renderUnauthorized("Milestones");
          // }
          return <Milestones milestoneNumber={milestoneNumber} sprintData={sprint} proj_no={projectNo} task={sprintstask} projectId={projectId} />;
        }
        return (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <h3 className="text-xl font-semibold mb-2">Content Not Found</h3>
          </div>
        );
    }
  };
  const PermissionWrapper = ({ moduleName, componentName, children, fallback }) => {
    if (!hasPermission(moduleName, componentName)) {
      return fallback || (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <div className="text-6xl mb-4"></div>
          <h3 className="text-xl font-semibold mb-2">Access Restricted</h3>
          <p className="text-center">
            You don't have permission to view the {componentName} component.
            <br />
            Please contact your administrator for access.
          </p>
        </div>
      );
    }
    return children;
  };
  const renderTabContentWithWrapper = () => {
    switch (activeTab) {
      case "projectDetails":
        return (
          <PermissionWrapper moduleName="Project view" componentName="Project Details">
            <ProjectDetails projectId={projectId} projectsdisplayID={projectsdispaly_id} projectname={projectsaname} />
          </PermissionWrapper>
        );

      case "consumptionTime":
        return (
          <PermissionWrapper moduleName="Project view" componentName="Consumption Time">
            <ConsumptionTime projectId={projectId} projectname={projectsaname} />
          </PermissionWrapper>
        );

      case "poa":
        return (
          <PermissionWrapper moduleName="Project view" componentName="POA">
            <PlanOfAction projectIds={projectId} projectdet={project} />
          </PermissionWrapper>
        );

      case "meetingDetails":
        return (
          <PermissionWrapper moduleName="Project view" componentName="Meeting Details">
            <MeetingTable projectId={projectId} milestone={sprintList} projectdet={project} />
          </PermissionWrapper>
        );

      case "deviationList":
        return (
          <PermissionWrapper moduleName="Project view" componentName="Deviation List">
            <ProjectDeviationTable projectId={projectId} projectdet={project} milestone={sprintList} />
          </PermissionWrapper>
        );

      case "projectDelayedReminders":
        return (
          <PermissionWrapper moduleName="Project view" componentName="Project Delayed Reminders">
            <Projectdelayed projectId={projectId} milestone={sprintList} projectdet={project} />
          </PermissionWrapper>
        );

      case "inputSheet":
        return (
          <PermissionWrapper moduleName="Project view" componentName="Input Sheet">
            <Inputsheet projectId={projectId} projectdet={project} milestone={sprintList} />
          </PermissionWrapper>
        );

      default:
        if (activeTab.startsWith("milestone")) {
          const milestoneNumber = parseInt(activeTab.replace("milestone", ""));
          const sprint = sprints[milestoneNumber - 1];
          return <Milestones milestoneNumber={milestoneNumber} sprintData={sprint} proj_no={projectNo} task={sprintstask} projectId={projectId} />;
        }

        return (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <h3 className="text-xl font-semibold mb-2">Content Not Found</h3>
            <p className="text-center">The requested tab content could not be found.</p>
          </div>
        );
    }
  };

  useEffect(() => {
    return () => {
      localStorage.removeItem("activeProjectTab");
    };
  }, []);


  const handleOpenForm = (mail_id, milestone_id) => {
    setOpenForm(true);
    setMailId(mail_id);
    setMilestoneId(milestone_id);
    fetchFormData(mail_id, milestone_id);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setIsEditMode(false);
    setFormFields([]);
    setResponseData(null);
  };

  const handleFormSubmit = async (e) => {
    setFormError("");
    setSubmitForm("Submitting...");
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    const payload = {};

    formFields.forEach((field) => {
      const { name, type } = field;

      if (type === "checkbox-group") {
        const values = formData.getAll(name);
        payload[name] = values;
      } else {
        payload[name] = formData.get(name);
      }
    });

    console.log("Submitted Payload:", JSON.stringify(payload));
    const responseData = JSON.stringify(payload);

    try {
      const response = await axios.post(
        "/server/elite_tech_corp_function/post/input-requirments", {
        email_id: mailId,
        milestone_id: milestoneId,
        response: responseData,
      }
      );
      console.log("Response", response);

      if (response.data?.status !== "Success") {
        throw new Error(response.data?.message || "Unexpected error");
      }
      setFormSuccess(true);
      setTimeout(() => {
        setFormSuccess(false);
        setIsEditMode(false);
        setOpenForm(false);
      }, 5000);
    } catch (error) {
      console.error("Error", error);

      setFormError(
        "Something went wrong. Please try again."
      );
    }
    setSubmitForm("Submit");
    setIsEditMode(false);
    setResponseData(null);
  };

  const fetchFormData = async (mail_id, milestone_id) => {
    try {
      const response = await axios.get(
        "/server/elite_tech_corp_function/get/input-requirments",
        {
          params: { email_id: mail_id, milestone_id: milestone_id },
        }
      );
      const rawFields = response.data.data[0]?.input_requirments?.input_fields;
      const parsedFields = JSON.parse(rawFields);
      console.log("ParsedFeildsss----------->", parsedFields);

      const rawResponse = response.data.data[0]?.input_requirments?.response_data;
      console.log(">>>>>>>>>>>>>>>>>responseviedata", rawResponse);

      const responseFields = rawResponse ? JSON.parse(rawResponse) : null;
      console.log("responseFeilds------>", responseFields);
      setResponseData(responseFields);
      setFormFields(parsedFields);
      dispatch(setResponseData(responseFields))

    } catch (error) {
      console.error("Failed to fetch form data:", error);
    }
  };

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      {hasPermission()}
      <div className="flex min-h-screen bg-[#ffffff] font=[inter]">
        <Sidebar isOpen={isSidebarOpen} onToggle={handleSidebarToggle}>
          <div
            className={`flex flex-col h-full bg-[#ffffff] transition-all duration-300 ease-in-out ${isSidebarShrunk
              ? "w-[calc(97vw-90px)]"
              : "w-[calc(98vw-270px)]"
              }`}
          >
            <div className="flex-shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
              <nav className="flex" aria-label="Breadcrumb">
                <ol className="inline-flex items-center space-x-1 md:space-x-2 !pl-4">
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
                    <span className="text-[14px] text-[#6B7280]">Project journey</span>
                  </li>
                </ol>
              </nav>
              {/* 
            <button
              className="bg-gray-300 p-2 rounded-full text-sm font-medium text-black flex items-center justify-center transition-transform duration-300 hover:scale-105 hover:bg-gray-400"
              onClick={() => handleNavigate()}
            >
              <MoveLeft />
            </button> */}
            </div>

            {/* Cards Grid - Full Width */}
            <div className="flex-shrink-0 flex flex-wrap gap-4 mb-6">
              {[
                {
                  title: "Total Task",
                  key: "totalProjects",
                  icon: <ListTodo size={20} />,
                  count: totalTaskCountData?.total_task_count || 0,
                  bg: "bg-[#D9F2E1]",
                },
                {
                  title: "Task Completed",
                  key: "Planning",
                  icon: <ListChecks size={20} />,
                  count: totalTaskCountData?.completed_task_count || 0,
                  bg: "bg-[#D9F2ED]",
                },
                {
                  title: "Total Estimated Hrs",
                  key: "total_estimated_hours",
                  icon: <FileClock size={20} />,
                  count: totalhrs?.total_estimated_hours || "00:00",
                  breakdown: {
                    consumed: totalhrs?.total_consumed_hours || "00:00",
                    available: totalhrs?.total_available_estimated_hrs || "00:00",
                  },
                  bg: "bg-[#D9EBF2]",
                },
                {
                  title: "Total Billing Hrs",
                  key: "total_billable_hours",
                  icon: <ReceiptIndianRupee size={20} />,
                  count: totalhrs?.total_billable_hours || "00:00",
                  breakdown: {
                    available: totalhrs?.total_available_billable_hrs || "00:00",
                    approved: totalhrs?.total_approved_billable_hrs || "00:00",
                  },
                  bg: "bg-[#D9DFF2]",
                },
              ].map((card, index) => {
                const formatTime = (time) => {
                  if (!time) return "0h 0m";
                  const isNegative = time.startsWith("-");
                  const clean = time.replace("-", "");
                  const [h, m] = clean.split(":").map((v) => parseInt(v || "0", 10));
                  const formatted = `${isNegative ? "-" : ""}${h}h ${m}m`;
                  return formatted;
                };

                const isTimeCard =
                  card.key === "total_estimated_hours" ||
                  card.key === "total_billable_hours";

                return (
                  <div
                    key={index}
                    className="flex-1 min-w-[200px] max-w-[300px] border-3 border-b-[#344EA0] font-[Inter] rounded-lg p-3 flex flex-col"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="text-[#374151] text-[14px] sm:text-[16px] font-medium line-clamp-2">
                        {card.title}
                      </h3>
                      <div className="text-[#9EA2AD] border rounded-full border-[#000000] p-2 flex items-center justify-center flex-shrink-0">
                        {card.icon}
                      </div>
                    </div>
                    <p
                      className={`text-[20px] sm:text-[20px] font-[Inter] font-bold mb-1 ${String(card.count).startsWith("-") ? "text-red-600" : "text-[#111827]"
                        }`}
                    >
                      {isTimeCard ? formatTime(card.count) : card.count}
                    </p>
                    {card.breakdown && (
                      <div className="text-xs sm:text-sm text-[#6B7280] flex justify-between gap-1">
                        {card.breakdown.available && (
                          <p>
                            Available:{" "}
                            <span
                              className={`font-[inter] ${card.breakdown.available.startsWith("-")
                                ? "text-red-600"
                                : "text-[#374151]"
                                }`}
                            >
                              {isTimeCard
                                ? formatTime(card.breakdown.available)
                                : card.breakdown.available}
                            </span>
                          </p>
                        )}
                        {card.breakdown.consumed && (
                          <p>
                            Consumed:{" "}
                            <span
                              className={`font-[inter] ${card.breakdown.consumed.startsWith("-")
                                ? "text-red-600"
                                : "text-[#374151]"
                                }`}
                            >
                              {isTimeCard
                                ? formatTime(card.breakdown.consumed)
                                : card.breakdown.consumed}
                            </span>
                          </p>
                        )}
                        {card.breakdown.approved && (
                          <p>
                            Approved:{" "}
                            <span
                              className={`font-[inter] ${card.breakdown.approved.startsWith("-")
                                ? "text-red-600"
                                : "text-[#374151]"
                                }`}
                            >
                              {isTimeCard
                                ? formatTime(card.breakdown.approved)
                                : card.breakdown.approved}
                            </span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {loading ? (
              <div className="flex items-center justify-center h-[60vh]">
                <Loader />
              </div>
            ) : (
              <div className="flex flex-col flex-grow min-h-0">
                <div className="flex-shrink-0 mb-3 font-[Inter] truncate">
                  <h2 className="text-[12px] text-[#9EA2AD]">{projectsdispaly_id}</h2>
                  <h2 className="text-[20px]">{projectsaname}</h2>
                </div>

                {/* Tabs container */}
                <div className="flex flex-col flex-grow ">
                  <div className="flex-shrink-0 bg-white  pt-2 overflow-x-auto shadow-sm rounded-t-lg">
                    <ul
                      className="flex flex-nowrap gap-2 sm:gap-4 text-sm sm:text-base font-[Inter] text-gray-600 dark:text-gray-300 whitespace-nowrap px-2 py-2"
                      role="tablist"
                    >
                      {tabs.map((tab) => (
                        <li key={tab.id} role="presentation" className="flex-shrink-0">
                          <button
                            type="button"
                            role="tab"
                            onClick={() => {
                              setActiveTab(tab.id);
                              localStorage.setItem("activeProjectTab", tab.id);
                            }}
                            className={`relative text-center whitespace-nowrap px-3 py-2 sm:px-4 sm:py-2 transition-all duration-300 ease-in-out ${activeTab === tab.id
                              ? "text-[#344EA0] font-bold after:w-full after:bg-gradient-to-r after:from-[#344EA0] after:via-[#344EA0] after:to-[#344EA0]"
                              : "text-gray-500 hover:text-[#344EA0] after:w-0 after:hover:w-3/4 after:bg-gray-300"
                              }
                          after:content-[''] after:absolute after:h-[2px] after:rounded-full after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:transition-all after:duration-300`}
                          >
                            <span className="flex flex-row items-center gap-1 leading-tight">
                              {tab.icon}
                              <span className="whitespace-nowrap">{tab.label}</span>
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex-grow bg-[#F3F4F6] rounded-b-lg shadow-sm overflow-auto min-h-0">
                    <div className="p-3 sm:p-4 w-full">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={activeTab}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.4 }}
                        >
                          {renderTabContent()}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Form Modal */}
            {openForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <div className="p-4 sm:p-6">
                    {!formSuccess ? (
                      <>
                        <h2 className="text-lg sm:text-xl font-semibold mb-4">Input Requirement Form</h2>

                        <form className="space-y-4" onSubmit={handleFormSubmit}>
                          {formFields.length === 0 ? (
                            <div className="text-center text-gray-500 py-8">
                              No form data found
                            </div>
                          ) : (
                            formFields.map((field, index) => {
                              const value = responseData?.[field.name];
                              switch (field.type) {
                                case "text":
                                case "number":
                                  return (
                                    <div key={index}>
                                      <label className="block font-medium mb-1 text-sm sm:text-base">
                                        {field.label}
                                      </label>
                                      <input
                                        type={field.type}
                                        name={field.name}
                                        placeholder={field.placeholder}
                                        required={field.required}
                                        defaultValue={value || ""}
                                        disabled={!!responseData && !isEditMode}
                                        className="w-full border px-3 py-2 rounded text-sm sm:text-base"
                                      />
                                    </div>
                                  );

                                case "textarea":
                                  return (
                                    <div key={index}>
                                      <label className="block font-medium mb-1 text-sm sm:text-base">
                                        {field.label}
                                      </label>
                                      <textarea
                                        name={field.name}
                                        placeholder={field.placeholder}
                                        required={field.required}
                                        defaultValue={value || ""}
                                        className="w-full border px-3 py-2 rounded text-sm sm:text-base"
                                        disabled={!!responseData && !isEditMode}
                                        rows={4}
                                      ></textarea>
                                    </div>
                                  );

                                case "checkbox-group":
                                  return (
                                    <div key={index}>
                                      <label className="block font-medium mb-1 text-sm sm:text-base">
                                        {field.label}
                                      </label>
                                      <div className="flex flex-col items-start gap-2">
                                        {field.values.map((option, idx) => {
                                          const isChecked =
                                            Array.isArray(responseData?.[field.name]) &&
                                            responseData[field.name].includes(option.value);

                                          return (
                                            <label key={idx} className="flex items-center gap-2 text-sm sm:text-base">
                                              <input
                                                type="checkbox"
                                                name={field.name}
                                                value={option.value}
                                                defaultChecked={isChecked}
                                                disabled={!!responseData && !isEditMode}
                                                className="accent-green-600"
                                              />
                                              <span>{option.label}</span>
                                            </label>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  );

                                default:
                                  return null;
                              }
                            })
                          )}

                          {formError && (
                            <div className="text-red-600 bg-red-100 p-3 rounded text-sm text-center">
                              {formError}
                            </div>
                          )}

                          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
                            <button
                              type="button"
                              className="w-full sm:w-auto bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition-colors"
                              onClick={() => {
                                setOpenForm(false);
                                setIsEditMode(false);
                                setFormError("");
                                setFormFields([]);
                                setResponseData(null);
                              }}
                            >
                              Close
                            </button>
                            {responseData && !isEditMode ? (
                              <button
                                type="button"
                                className="w-full sm:w-auto bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition-colors"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setIsEditMode(true);
                                }}
                              >
                                Edit
                              </button>
                            ) : (
                              <button
                                type="submit"
                                className="w-full sm:w-auto bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                              >
                                {submitForm}
                              </button>
                            )}
                          </div>
                        </form>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8">
                        <img
                          src={Success}
                          alt="Success"
                          className="w-48 h-48 sm:w-62 sm:h-62"
                        />
                        <p className="mt-4 text-green-600 font-semibold text-center">
                          Submitted successfully!
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </Sidebar>
      </div>
    </>
  );
};
