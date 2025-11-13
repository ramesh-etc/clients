import React, { useEffect, useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { ChevronDown } from 'lucide-react';

export default function ProjectAllocationChart() {
  const [rawData, setRawData] = useState({});
  const [selectedProject, setSelectedProject] = useState('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const range = 'one-week';
        const res = await fetch(`/server/project-details/team-member-allocated-hrs`, {
          method: 'GET',
        });
        const json = await res.json();

        console.log("Fetched projects:", json.projects);
        setRawData(json.projects || {});
      } catch (err) {
        console.error('Failed to fetch:', err);
      }
    };

    fetchData();
  }, []);

  const allProjectNames = useMemo(() => Object.keys(rawData), [rawData]);
  const parseHourMinute = (str) => {
    if (!str || typeof str !== 'string') return 0;
    const match = str.match(/(\d+)h\s*(\d+)m/);
    if (!match) return 0;
    const [, h, m] = match;
    return parseInt(h, 10) + parseInt(m, 10) / 60;
  };

  const chartData = useMemo(() => {
    const entries = [];

    if (selectedProject === 'all') {
      allProjectNames.forEach(projectName => {
        const daily = rawData[projectName] || {};

        Object.entries(daily).forEach(([date, dayData]) => {
          const userCount = dayData.users ? Object.keys(dayData.users).length : 0;
          let entry = entries.find(e => e.date === date);

          if (!entry) {
            entry = { date, users: {} };
            entries.push(entry);
          }

          // Parse total hours to float
          const parsedTotal = parseHourMinute(dayData.total_allocated_hours || '0h 0m');
          entry[`${projectName}_hours`] = parsedTotal;
          entry[`${projectName}_user_count`] = userCount;

          // Merge parsed user allocations
          Object.entries(dayData.users || {}).forEach(([user, value]) => {
            const parsedUser = parseHourMinute(value);
            entry.users[user] = (entry.users[user] || 0) + parsedUser;
          });
        });
      });
    } else {
      const projectData = rawData[selectedProject] || {};

      Object.entries(projectData).forEach(([date, dayData]) => {
        const userCount = dayData.users ? Object.keys(dayData.users).length : 0;
        const userEntries = dayData.users || {};

        const parsedTotal = parseHourMinute(dayData.total_allocated_hours || '0h 0m');
        const parsedUsers = {};
        Object.entries(userEntries).forEach(([user, value]) => {
          parsedUsers[user] = parseHourMinute(value);
        });

        entries.push({
          date,
          [`${selectedProject}_hours`]: parsedTotal,
          [`${selectedProject}_user_count`]: userCount,
          users: parsedUsers
        });
      });
    }

    entries.sort((a, b) => new Date(a.date) - new Date(b.date));
    return entries;
  }, [rawData, selectedProject, allProjectNames]);



  const colors = [
    '#005081',
    '#008E43',
    '#FF7F0E',
    '#FF3E3E',
    '#9370DB',
    '#00BFFF',
    '#2E8B57',
    '#DAA520'
  ];
  const formatToHM = (val) => {
    const minutes = Math.round(val * 60);
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const users = payload[0]?.payload?.users || {};

      return (
        <div className="bg-white border rounded p-2 shadow text-sm">
          <p className="font-semibold mb-1">{label}</p>
          {payload.map((entry, i) => (
            <p key={i} className="text-gray-700">
              <span className="font-medium">{entry.name}:</span> {formatToHM(entry.value)}
            </p>
          ))}
          {Object.keys(users).length > 0 && (
            <>
              <hr className="my-1" />
              <p className="font-semibold">User Allocations:</p>
              {Object.entries(users).map(([user, hours]) => (
                <p key={user} className="text-gray-600">
                  {user}: {formatToHM(hours)}
                </p>
              ))}
            </>
          )}
        </div>
      );
    }
    return null;
  };


  return (
    <div className="w-full p-6 bg-white rounded-lg shadow">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">
          Project Allocation
        </h2>

        {/* Dropdown Filter */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(prev => !prev)}
            className="inline-flex items-center gap-2 px-4 py-2 border rounded bg-white text-sm shadow-sm hover:bg-gray-100"
          >
            {selectedProject === 'all' ? 'All Projects' : selectedProject}
            <ChevronDown size={16} />
          </button>

          {isDropdownOpen && (
            <div className="absolute z-10 mt-2 w-56 bg-white border rounded shadow-lg">
              <ul className="py-1">
                <li>
                  <button
                    onClick={() => {
                      setSelectedProject('all');
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    All Projects
                  </button>
                </li>
                {allProjectNames.map(name => (
                  <li key={name}>
                    <button
                      onClick={() => {
                        setSelectedProject(name);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      {name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
          <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />

          {(selectedProject === 'all' ? allProjectNames : [selectedProject]).map((project, index) => (
            <Line
              key={project}
              type="monotone"
              dataKey={`${project}_hours`}
              stroke={colors[index % colors.length]}
              strokeWidth={2}
              dot={{ r: 3 }}
              name={project}
            />
          ))}

        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
