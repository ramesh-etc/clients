import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Chart options
export const options = {
  plugins: {
    title: {
      display: true,
      text: 'Weekly Report',
    },
  },
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      stacked: true,
    },
    y: {
      stacked: true,
    },
  },
};

// Chart data
const labels = [ 'Apr 18, 2025', 'Apr 19, 2025', 'Apr 20, 2025', 'Apr 21, 2025', 'Apr 22, 2025', 'Apr 23, 2025', 'Apr 24, 2025', 'Apr 25, 2025'];

export const data = {
  labels,
  datasets: [
    {
      label: 'Full Stack',
      data: [300, 500, -200, 800, -150, 400, 100],
      backgroundColor: '#008E43',
    },
    {
      label: 'Zoho One',
      data: [-100, 400, 250, -300, 200, 600, -400],
      backgroundColor: '#008699',
    },
  ],
};

// Chart component
 function Barchart() {
  return (
    <div className="w-full h-[400px]">
      <Bar options={options} data={data} width={800} height={500}/>
    </div>
  );
}
export default Barchart;