import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Chart } from "react-google-charts";

export const Piecharts = () => {
  const [chartData, setChartData] = useState([
    ["Ticket", "Count"],
    ["Completed", 0],
    ["In-Process", 0],
  ]);

  const [summary, setSummary] = useState({ completed: 0, inProgress: 0 });
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedproject_org_id, setSelectedproject_org_id] = useState("");

  const STATUS_COLORS = {
    "Done": "#344EA0",
    "To Do": "#F39F9F",
    "In Progress": "#E5E7EB",
    "Waiting for Inputs": "#FFC29B",
    "Under Review": "#6B7280",
    "In Testing": "#9CA3AF",
    "Closed": "#4B5563",
    "Completed": "#10B981",
    // "In-Process": "#FBBF24",
    "Waiting for Client Confirmation": "#666cbe",
    "On Hold": "#4B5563",
    "In Review": "#6B7280"
  };

  const fetchProjects = useCallback(async () => {
    try {
      const response = await axios.post("/server/sprints-projects-sync/get_project", { limit: 100 });
      const allProjects = response.data?.data || [];

      const projectsWithIds = allProjects.map((project) => ({
        id: project.ROWID,
        org_id: project.project_org_id,
        name: project.project_name,
      }));

      setProjects(projectsWithIds);

    } catch (error) {
      console.error("Error fetching project list:", error);
    }
  }, []);

  const fetchProjectOverallStatus = useCallback(async (rowId) => {
    try {
      const url = rowId
        ? `/server/project-details/project-overallstatus?rowId=${rowId}`
        : `/server/project-details/project-overallstatus`;

      const response = await axios.get(url);
      const statusCounts = response.data?.statusCounts || {};

      const filteredStatuses = Object.entries(statusCounts)
        .filter(([_, count]) => Number(count) > 0)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([status, count]) => [status, Number(count)]);

      if (filteredStatuses.length === 0) {
        setChartData([
          ["Ticket", "Count"],
          ["In-Process", 1],
        ]);
        setSummary({ completed: 0, inProgress: 0 });
        return;
      }

      const chartArray = [["Ticket", "Count"], ...filteredStatuses];

      const completed = filteredStatuses.find(
        ([s]) => s.toLowerCase() === "done" || s.toLowerCase() === "completed"
      )?.[1] || 0;

      const inProgress =
        filteredStatuses.find(([s]) => s.toLowerCase() === "in progress")?.[1] || 0;

      setChartData(chartArray);
      setSummary({ completed, inProgress });
    } catch (error) {
      console.error("Error fetching project overall status:", error);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    fetchProjectOverallStatus(selectedProjectId);
  }, [selectedProjectId, fetchProjectOverallStatus]);

  const handleProjectChange = (e) => {
    const selectedProjectName = e.target.value;
    setFilter(selectedProjectName);

    if (!selectedProjectName) {
      setSelectedProjectId(""); // All projects
    } else {
      const selectedProject = projects.find((p) => p.name === selectedProjectName);
      if (selectedProject) {
        setSelectedProjectId(selectedProject.id);
      }
    }
  };

  const options = {
    pieHole: 0.5,
    legend: "none",
    pieSliceText: "none",
    slices: chartData.slice(1).reduce((acc, [status], index) => {
      acc[index] = { color: STATUS_COLORS[status] || "#E5E7EB" };
      return acc;
    }, {}),
    chartArea: { left: 0, top: 0, width: "100%", height: "100%" },
    backgroundColor: "transparent",
    tooltip: {
      trigger: "focus",
      showColorCode: true,
      text: "value"
    },
    animation: {
      duration: 500,
      easing: "easeInOut",
      startup: true,
    },
  };

  const total = summary.completed + summary.inProgress;
  const completedPercent = total > 0 ? ((summary.completed / total) * 100).toFixed(1) : "0";

  const legendStatuses = chartData.slice(1).map((item) => item[0]);

  return (
    <div className="w-full ">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h3 className="text-[#374151] text-lg sm:text-[20px] font-medium">Overall Project Status</h3>
        <div className="relative w-full sm:w-auto">
          <select
            className="appearance-none w-full py-1.5 px-4 bg-white border border-gray-300 text-gray-700 text-sm rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#344EA0] focus:border-[#344EA0] hover:border-gray-400 transition-all duration-200 pr-10 cursor-pointer font-medium"
            onChange={handleProjectChange}
            value={filter}
          >
            <option value="">All Projects</option>
            {projects.map((project) => (
              <option key={project.id} value={project.name}>
                {project.org_id ? `${project.org_id} - ${project.name}` : `${project.name}`}
              </option>
            ))}
          </select>

          <div className="pointer-events-none mb-1 absolute inset-y-0 right-0 flex items-center px-3">
            <svg
              className="w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      <hr className="border-[#D1D5DB] border-2 mb-4" />

      <div className="flex flex-col items-center justify-center py-8">
        <div className="flex flex-col items-center gap-6 w-full px-4 sm:px-0">
          <div style={{
            position: "relative",
            width: "100%",
            maxWidth: "250px",
            aspectRatio: "1"
          }}>
            <Chart
              chartType="PieChart"
              data={chartData}
              options={options}
              width={"100%"}
              height={"100%"}
              chartWrapperParams={{ style: { width: "100%", height: "100%" } }}
            />
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                textAlign: "center",
                userSelect: "none",
                pointerEvents: "none",
              }}
            >
              <div style={{ fontSize: "24px", fontWeight: "600", color: "#111827" }}>
                {completedPercent}%
              </div>
              <div style={{ fontSize: "14px", color: "#6B7280" }}>Completed</div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-3">
            {legendStatuses.map((status) => (
              <div key={status} className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: STATUS_COLORS[status] || "#E5E7EB" }}
                ></div>
                <span className="text-gray-700 font-medium">{status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Piecharts;
