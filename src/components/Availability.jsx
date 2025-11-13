import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Settings, Loader2 } from 'lucide-react';
import SemiCircleProgressBar from 'react-progressbar-semicircle';
import MultiProgress from 'react-multi-progress';
import { User, RotateCw } from "lucide-react";
import zohocatalyst from "../assets/Images/zohoCatalyst.png";
import zohoone from "../assets/Images/Zoho-one.png";

const Availability = () => {
  const [selectedTeam, setSelectedTeam] = useState('All Team');
  const [selectedDay, setSelectedDay] = useState('this_week');
  const [expandedSections, setExpandedSections] = useState({
    'Full Stack Team': false,
    'Zoho One Team': false,
    'Testing Team': false,
    'Project Management Team': false
  });

  const [availabilityData, setAvailabilityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTeamData, setCurrentTeamData] = useState(null);


  const parseHours = (hoursString) => {
    if (!hoursString || typeof hoursString === 'number') return hoursString || 0;

    // Match hours and minutes pattern like "1h 15m" or "38h 45m"
    const hourMatch = hoursString.match(/(\d+)h/);
    const minMatch = hoursString.match(/(\d+)m/);

    const hours = hourMatch ? parseFloat(hourMatch[1]) : 0;
    const minutes = minMatch ? parseFloat(minMatch[1]) / 60 : 0;

    return hours + minutes;
  };

  const colorCache = {};

  function getConsistentColor(name) {
    if (!name) return "#999";
    if (colorCache[name]) return colorCache[name];
    let colour = 0;
    for (let i = 0; i < name.length; i++) {
      colour = name.charCodeAt(i) + ((colour << 5) - colour);
    }
    const r = (colour >> 16) & 0xff;
    const g = (colour >> 8) & 0xff;
    const b = colour & 0xff;
    const adjust = (c) => Math.min(200, Math.max(60, c));

    const color = `rgb(${adjust(r)}, ${adjust(g)}, ${adjust(b)})`;
    colorCache[name] = color;
    return color;
  }

  const transformApiResponse = (apiData) => {
    if (!apiData) return null;
    const teams = {};
    teams["All Team"] = {
      allocatedHours: parseHours(apiData.overall_stats?.total_allocated_hours) || 0,
      totalHours: parseHours(apiData.overall_stats?.total_capacity_hours) || 0,
      availableHours: parseHours(apiData.overall_stats?.total_available_hours) || 0,
      percentage: apiData.overall_stats?.utilization_percentage || 0,
      subTeams: {}
    };

    if (apiData.team_allocations) {
      apiData.team_allocations.forEach(team => {
        const teamName = team.department;
        const allocatedHours = parseHours(team.allocated_hours) || 0;
        const totalHours = parseHours(team.total_capacity) || 0;
        const availableHours = parseHours(team.available_hours) || 0;
        const percentage = totalHours > 0 ? Math.round((allocatedHours / totalHours) * 100) : 0;

        teams["All Team"].subTeams[teamName] = {
          allocated: allocatedHours,
          available: availableHours,
          total: totalHours,
          percentage: percentage
        };

        // Group designations by team for subTeams
        const teamDesignations = {};
        if (apiData.designation) {
          apiData.designation.forEach(designation => {
            // Find members with this designation in the current team
            const teamMembers = apiData.members_availability?.filter(member =>
              member.department === teamName && member.designation === designation.designation
            ) || [];

            if (teamMembers.length > 0) {
              teamDesignations[designation.designation] = {
                allocated: parseHours(designation.allocated_hours) || 0,
                available: parseHours(designation.available_hours) || 0,
                total: parseHours(designation.capacity_hours) || 0
              };
            }
          });
        }

        teams[teamName] = {
          name: teamName,
          allocatedHours: allocatedHours,
          totalHours: totalHours,
          availableHours: availableHours,
          percentage: percentage,
          userCount: team.members_count || 0,
          icon: teamName === 'Zoho One' ? zohoone : (teamName === 'Full Stack' ? zohocatalyst : null),
          subTeams: teamDesignations
        };
      });
    }

    const members = {};

    if (apiData.members_availability) {
      apiData.members_availability.forEach(member => {
        const teamKey = `${member.department} `;

        if (!members[teamKey]) {
          members[teamKey] = [];
        }

        members[teamKey].push({
          id: member.user_id,
          name: member.name,
          role: member.designation,
          status: member.is_available ? 'available' : 'unavailable',
          availability: member.is_available ?
            `Available ${member.available_hours}` :
            'Not Available'
        });
      });
    }

    return {
      teams,
      members
    };
  };
  // Fetch data from API
  const fetchAvailabilityData = async (filter = selectedDay) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/server/project-details/project-availability?filter=${filter}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const rawData = await response.json();
      console.log('Raw API Response:', rawData);
      const transformedData = transformApiResponse(rawData);
      console.log('Transformed Data:', transformedData);

      setAvailabilityData(transformedData);

      if (transformedData?.teams) {
        const teams = Object.keys(transformedData.teams);
        const firstTeamKey = teams.includes("All Team") ? "All Team" : teams[0];
        setSelectedTeam(firstTeamKey);
        setCurrentTeamData(transformedData.teams[firstTeamKey]);
      }
    } catch (err) {
      console.error('Error fetching availability data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailabilityData(selectedDay);
  }, [selectedDay]);

  useEffect(() => {
    if (!availabilityData?.teams) return;

    const teamData = availabilityData.teams[selectedTeam] || availabilityData.teams["All Team"];
    setCurrentTeamData(teamData);

    if (selectedTeam !== 'All Team') {
      const teamKeyMapping = {
        'Full Stack': 'Full Stack Team',
        'Zoho One': 'Zoho One Team',
        'Testing': 'Testing Team',
        'Project Management': 'Project Management Team',
      };

      const correctTeamKey = teamKeyMapping[selectedTeam];

      if (correctTeamKey && availabilityData.members?.[correctTeamKey]) {
        setExpandedSections(prev => ({
          ...prev,
          [correctTeamKey]: true
        }));
        setTimeout(() => {
          const element = document.querySelector(`[data-team="${correctTeamKey}"]`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      }
    }
  }, [selectedTeam, availabilityData]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleRefresh = () => {
    fetchAvailabilityData(selectedDay);
  };

  const CircularProgress = ({ percentage, allocated, total }) => {
    return (
      <div className="relative flex flex-col items-center justify-center mb-4">
        <SemiCircleProgressBar
          percentage={percentage || 0}
          showPercentValue={false}
          stroke="#344EA0"
          strokeWidth={16}
          background="#e5e7eb"
          diameter={window.innerWidth < 420 ? 280 : 400}
        />
        <div className="absolute flex flex-col items-center justify-center mt-16">
          <div className="text-4xl font-bold text-gray-900">{(allocated || 0).toFixed(2)} hrs</div>
          <div className="text-gray-500">of {(total || 0).toFixed(2)} hrs</div>
        </div>
      </div>
    );
  };

  const ProgressBar = ({ percentage, allocated, available, total }) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">{(allocated || 0).toFixed(2)} hrs of ({(total || 0).toFixed(2)} hrs)</span>
      </div>
      <div className="flex items-center space-x-2">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-[#344EA0] h-2 rounded-full transition-all duration-300"
            style={{ width: `${percentage || 0}%` }}
          />
        </div>
        <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
          {percentage || 0}%
        </span>
      </div>
    </div>
  );

  const TeamCard = ({ teamName, data }) => {
    const generateDynamicColors = (count) => {
      const colors = [];
      const baseHues = [140, 190, 240, 280, 320, 30, 60, 100];
      for (let i = 0; i < count; i++) {
        const hue = baseHues[i % baseHues.length];
        const saturation = 65 + (i * 5) % 30;
        const lightness = 50 + (i * 3) % 20;
        colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
      }
      return colors;
    };

    const getProgressData = (subTeams) => {
      if (!subTeams || Object.keys(subTeams).length === 0) {
        return [{ value: 100, color: '#E5E7EB' }];
      }
      const subTeamCount = Object.keys(subTeams).length;
      const colors = generateDynamicColors(subTeamCount);
      const totalHours = Object.values(subTeams).reduce((sum, team) => sum + (team.allocated || 0), 0);
      if (totalHours === 0) {
        return [{ value: 100, color: '#E5E7EB' }]
      }
      return Object.entries(subTeams).map(([name, teamData], index) => ({
        value: ((teamData.allocated || 0) / totalHours) * 100,
        color: colors[index]
      }));
    };

    const progressData = getProgressData(data.subTeams || {});
    return (
      <div className='px-6 py-4 border-b border-gray-100'>
        <div className='flex justify-between items-center'>
          <div className='flex items-center gap-3'>
            {data.icon && <img src={data.icon} className="w-[40px] h-[40px] p-1 border border-[#D1D5DB] rounded-full" alt={teamName} />}
            <h3 className="text-md font-medium text-gray-900">{teamName}</h3>
          </div>
          <div className='flex items-center gap-2'>
            <span className="text-sm text-gray-500">{data.userCount || 0} users</span>
            <div className="flex -space-x-2">
              {(() => {
                const teamKey = `${teamName} Team`;
                const teamMembers = availabilityData?.members?.[teamKey] || [];

                return teamMembers.map((member, index) => {
                  const name = member.name || '?';
                  const nameWords = name.split(' ');
                  const initials =
                    nameWords.length >= 2
                      ? nameWords[0][0] + nameWords[1][0]
                      : nameWords[0][0] || '?';

                  const color = getConsistentColor(name);

                  return (
                    <div
                      key={index}
                      className={`
            w-6 h-6 rounded-full text-white text-xs 
            flex items-center justify-center border-2 border-white
            transform transition-all duration-300 ease-out cursor-pointer
            hover:scale-150 hover:z-10 hover:shadow-xl hover:-translate-y-1
            hover:rotate-3 hover:shadow-black/30
            relative group
          `}
                      title={name}
                      style={{
                        backgroundColor: color,
                        transformStyle: 'preserve-3d',
                        perspective: '1000px',
                      }}
                    >
                      {initials.toUpperCase()}

                      {/* Tooltip */}
                      <div className="
            absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2
            px-2 py-1 bg-gray-800 text-white text-xs rounded
            opacity-0 group-hover:opacity-100 transition-opacity duration-200
            pointer-events-none whitespace-nowrap z-20
          ">
                        {name}
                        <div className="
              absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 
              border-l-4 border-r-4 border-t-4 
              border-l-transparent border-r-transparent border-t-gray-800
            "></div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between gap-4 mb-2">
            <span className="text-sm font-medium text-gray-900">
              {(data.allocatedHours || 0).toFixed(2)} hrs Used ({(data.availableHours || 0).toFixed(2)} hrs available)
            </span>
            <span className="text-sm text-gray-500">{data.totalHours || 0} hrs Total</span>
          </div>

          {progressData.length > 0 && (
            <div className="mb-2">
              <MultiProgress
                elements={progressData.length > 0 ? progressData : [{ value: 100, color: '#E5E7EB' }]}
                height={8}
                backgroundColor="#E5E7EB"
                round={4}
              />
            </div>
          )}
          <div className="flex items-center gap-6 text-[12px] text-[#111827] flex-wrap">
            {data.subTeams && Object.keys(data.subTeams).length > 0 && (
              (() => {
                const subTeamCount = Object.keys(data.subTeams).length;
                const colors = generateDynamicColors(subTeamCount);

                return Object.keys(data.subTeams).map((subTeamName, index) => (
                  <div key={subTeamName} className="flex items-center gap-1">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: colors[index] }}
                    ></div>
                    <span>{subTeamName}</span>
                  </div>
                ));
              })()
            )}
          </div>

          {data.subTeams && Object.keys(data.subTeams).length > 0 && (
            <div className="mt-4 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <table className="table-fixed w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-100 font-medium text-left">
                    <th className="w-1/3 px-2 py-2">Team</th>
                    <th className="w-1/3 px-2 py-2 text-center">Allocated Hours</th>
                    <th className="w-1/3 px-2 py-2 text-center">Available Hours</th>
                  </tr>
                </thead>
                <tbody className='p-3'>
                  {Object.entries(data.subTeams).map(([subTeam, subData], index) => {
                    const subTeamCount = Object.keys(data.subTeams).length;
                    const colors = generateDynamicColors(subTeamCount);
                    const bgColor = colors[index].replace('hsl(', 'hsla(').replace(')', ', 0.15)');
                    const textColor = colors[index].replace(/\d+%\)$/, '35%)');

                    return (
                      <tr key={subTeam} className="border-b p-6">
                        <td className="px-2 py-2">
                          <span
                            className="inline-block px-2 py-1 rounded text-xs font-medium"
                            style={{
                              // backgroundColor: bgColor,
                              color: textColor,
                              border: `1px solid ${colors[index]}`
                            }}
                          >
                            {subTeam}
                          </span>
                        </td>
                        <td className="px-2 py-1 text-center">{(subData.allocated || 0).toFixed(2)} hrs</td>
                        <td className="px-2 py-1 text-center">{(subData.available || 0).toFixed(2)} hrs</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className='border-t-2 border-[#000000]'>
                  <tr className="  font-medium">
                    <td className="px-2 py-2">Total Hours -</td>
                    <td className="px-2 py-2 text-center">{(data.allocatedHours || 0).toFixed(2)} hrs</td>
                    <td className="px-2 py-2 text-center">{(data.availableHours || 0).toFixed(2)} hrs</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

        </div>
      </div>
    );
  };

  const getFilteredMembers = () => {
    if (!availabilityData?.members) return {};

    if (selectedTeam === 'All Team') {
      return availabilityData.members;
    }

    const teamKey = `${selectedTeam} Team`;
    if (availabilityData.members[teamKey]) {
      return { [teamKey]: availabilityData.members[teamKey] };
    }

    return availabilityData.members;
  };

  const getTeamStatus = (teamName) => {
    if (!availabilityData?.members?.[teamName]) return 'No Data';

    const members = availabilityData.members[teamName];
    const availableCount = members.filter(member => member.status === 'available').length;
    const totalHours = members.reduce((total, member) => {
      if (member.status === 'available' && member.availability) {
        const hourMatch = member.availability.match(/(\d+)h/);
        const minMatch = member.availability.match(/(\d+)m/);
        const hours = hourMatch ? parseInt(hourMatch[1]) : 0;
        const minutes = minMatch ? parseInt(minMatch[1]) : 0;
        return total + hours + (minutes / 60);
      }
      return total;
    }, 0);

    return availableCount === 0 ? 'Not Available' : `${Math.round(totalHours)}-hrs`;
  };
  const getAvailableTeams = () => {
    if (!availabilityData?.teams) return [];
    return Object.keys(availabilityData.teams);
  };


  if (!availabilityData || !availabilityData.teams || Object.keys(availabilityData.teams).length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-gray-600 mb-2">No availability data found</div>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-[#344EA0] text-white rounded-lg hover:bg-[#2d3f85]"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="font-[Inter]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h3 className="text-[#374151] text-lg sm:text-[20px] font-medium">Availability</h3>

        {/* <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          <RotateCw size={16} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Refreshing...' : 'Refresh'}
        </button> */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="rounded-lg shadow-sm border h-[650px]">
          <div className="border-b px-4 py-1">
            <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3'>
              <h3 className="text-[#374151] text-[20px] Weight-[500]">Via-Team</h3>
              <div className="flex bg-white h-[65px] border border-[#D1D5DB] w-[30vw] pl-2 rounded-md pt-3 gap-2 overflow-x-auto  scrollbar-thumb-gray-300 scrollbar-track-transparent newScrollBehaviour">
                {getAvailableTeams().map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setSelectedTeam(tab)}
                    className={`flex items-center rounded-md text-xs sm:text-[14px] px-2 py-1 font-medium transition-all duration-300 whitespace-nowrap ${selectedTeam === tab
                      ? "text-white bg-[#344EA0] shadow-inner"
                      : "text-[#9CA3AF]"
                      }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

            </div>
          </div>

          {selectedTeam === "All Team" && currentTeamData && (
            <div style={{ height: '50vh', overflowY: 'auto' }} className="p-3">
              <CircularProgress
                percentage={currentTeamData.percentage}
                allocated={currentTeamData.allocatedHours}
                total={currentTeamData.totalHours}
              />
              <div className="flex justify-center gap-8 mt-6 ">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#344EA0] rounded-full"></div>
                  <span className="text-sm text-gray-600">Allocated Hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
                  <span className="text-sm text-gray-600">Available Hours</span>
                </div>
              </div>
              {currentTeamData.subTeams && (
                <div className="space-y-6">
                  {Object.entries(currentTeamData.subTeams).map(([teamName, data]) => (
                    <div key={teamName}>
                      <h3 className="text-lg font-semibold text-gray-900 ">{teamName}</h3>
                      <ProgressBar
                        percentage={data.percentage}
                        allocated={data.allocated}
                        available={data.available}
                        total={data.total}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div>
            {selectedTeam !== 'All Team' && availabilityData.teams[selectedTeam] && (
              <TeamCard
                teamName={availabilityData.teams[selectedTeam].name || selectedTeam}
                data={availabilityData.teams[selectedTeam]}
              />
            )}
          </div>
        </div>

        <div className="rounded-lg shadow-sm border h-[650px]">
          <div className="border-b  px-4 sm:px-6 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h3 className="text-[#374151] text-lg sm:text-[20px] font-medium">Members Availability</h3>
            <div className="relative w-full sm:w-auto">
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="appearance-none bg-white px-4 py-2 pr-10 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#344EA0] focus:border-transparent text-sm font-medium text-gray-700 hover:border-gray-400 transition-colors cursor-pointer shadow-sm"
              >
                <option value="this_week">This Week</option>
                <option value="last_week">Last Week</option>
                <option value="Next Week">Next Week</option>
                <option value="last_30_days">Last 30 days</option>
                <option value="this_month">This Month</option>
                <option value="this_quarter">This Quarter</option>
                <option value="this_year">This Year</option>
                <option value="last_month">Last Month</option>
                <option value="last_quarter">Last Quarter</option>
                <option value="last_year">Last Year</option>
              </select>

              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                <ChevronDown size={16} className="text-gray-500" />
              </div>
            </div>
          </div>

          <div className="max-h-[550px] overflow-y-auto">
            {Object.entries(getFilteredMembers()).map(([teamName, members]) => (
              <div key={teamName} className="p-2 gap-3 rounded-md ">
                <button
                  onClick={() => toggleSection(teamName)}
                  className="w-full px-4 py-2 bg-gray-100 items-center border rounded-md justify-between "
                  data-team={teamName}
                >
                  <div className="flex items-center justify-between gap-3 py-3">
                    <div className=' flex gap-3'>
                      <span className="font-medium text-gray-900">{teamName}</span>
                      <span className={`px-2 rounded-full items-center  border-1 text-xs ${getTeamStatus(teamName) === 'Not Available'
                        ? ' border-[#FB3748] bg-[#FB37481A] text-[#FB3748]'
                        : ' border-[#1FC16B] bg-[#1FC16B1A] text-[#1FC16B] '
                        }`}>
                        {getTeamStatus(teamName)}
                      </span>

                    </div>
                    {expandedSections[teamName] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>

                  {expandedSections[teamName] && (
                    <div className="">
                      {members && members.length > 0 ? (
                        members.map((member, index) => (
                          <div key={member.id || index} className="flex items-center justify-between py-3 border-b last:border-b-0 flex-wrap gap-3">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="w-10 h-10 rounded-full bg-[#D3D3D3] text-black flex items-center justify-center text-sm font-medium">
                                <User />
                              </div>
                              <div>
                                <div className="text-[14px] text-left text-[#454A53]">{member.name || 'Unknown'}</div>
                                <div className="text-[14px] text-[#9EA2AD]">{member.role || 'No Role'}</div>
                              </div>
                            </div>
                            <span className={`px-3 py-1 text-green-600 text-xs sm:text-sm whitespace-nowrap ${member.status === 'available'
                              }`}>
                              {member.availability || 'No Data'}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="py-4 text-center text-gray-500">
                          No members found for this team
                        </div>
                      )}
                    </div>
                  )}
                </button>


              </div>
            ))}

            {Object.keys(getFilteredMembers()).length === 0 && (
              <div className="px-6 py-8 text-center text-gray-500">
                No team members data available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Availability;