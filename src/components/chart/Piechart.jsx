import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
import { Chart } from "react-google-charts";
const LOCAL_STORAGE_KEY = "mrtProjectDetailsTableState";

export const Piechart = () => {
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
        left: ["project_display_id", "project_name"],
        right: [],
      },
    };
  };

  const [tableState] = useState(getInitialTableState);
  const [pagination] = useState(
    tableState.pagination || { pageIndex: 0, pageSize: 10 }
  );
  const [chartData, setChartData] = useState([
    ["Ticket", "Count"],
    // ["Total", 0],
    ["Completed", 0],
    ["In Progress", 0],
  ]);
  const [summary, setSummary] = useState({
    // total: 0,
    completed: 0,
    inProgress: 0,
  });

  const fetchChartData = useCallback(async () => {
    try {
      const payload = {
        limit: pagination.pageSize,
      };

      const response = await axios.post(
        "/server/sprints-projects-sync/get_project",
        payload
      );

      const data = response.data || {};

      const total = data.totalProjects || 0;
      const completed = data.completedProjects || 0;
      const inProgress = data.inProgressProjects || 0;

      const chartArray = [
        ["Ticket", "Count"],
        // ["Total", total],
        ["Completed", completed],
        ["In Progress", inProgress],
      ];

      setChartData(chartArray);
      setSummary({ total, completed, inProgress });
    } catch (error) {
      console.error("Error fetching chart data:", error);
    }
  }, [pagination.pageIndex]);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  const options = {
    pieHole: 0.9,
    is3D: true,
    pieStartAngle: 100,
    sliceVisibilityThreshold: 0.02,
    legend: {
      position: "top",
      alignment: "center",
      textStyle: {
        color: "#233238",
        fontSize: 14,
      },
    },
    colors: ["#005081", "#008E43", "#008699"],
  };

  return (
    <div className="w-full text-center">
      <p className="text-2xl text-gray-800 mb-4">Projects Status</p>
      <Chart
        chartType="PieChart"
        data={chartData}
        options={options}
        height={"450px"}
      />
      {/* <div className="mt-4 text-lg flex justify-center gap-8 flex-wrap">
        <span className="text-#005081 font-semibold">
          Total: {summary.total}
        </span>
        <span className="text-#008E43 font-semibold">
          Completed: {summary.completed}
        </span>
        <span className="text-##008699 font-semibold">
          In Progress: {summary.inProgress}
        </span>
      </div> */}
    </div>
  );
};

export default Piechart;
