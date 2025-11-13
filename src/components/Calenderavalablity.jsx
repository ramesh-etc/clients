// import React from 'react';
// import {
//   Box,
//   Typography,
//   Select,
//   MenuItem,
//   FormControl,
//   InputLabel,
//   Table,
//   TableHead,
//   TableRow,
//   TableCell,
//   TableBody,
//   Paper,
// } from '@mui/material';

// const CalendarAvailability = ({ data }) => {
//   if (!data || !data.employees) {
//     return <div>Loading or no data available...</div>;
//   }

//   const [selectedTeam, setSelectedTeam] = React.useState('');
//   const [selectedEmployee, setSelectedEmployee] = React.useState('');

//   // Safe destructure with defaults to avoid undefined errors
//   const { week_start = '', week_end = '', employees = {} } = data || {};

//   const teamNames = React.useMemo(() => Object.keys(employees), [employees]);

//   const filteredEmployees = React.useMemo(() => {
//     if (!selectedTeam) {
//       let allEmployees = [];
//       for (const team of teamNames) {
//         const emps = Object.keys(employees[team] || {});
//         allEmployees = allEmployees.concat(emps.map((emp) => ({ team, emp })));
//       }
//       return allEmployees;
//     } else {
//       const emps = Object.keys(employees[selectedTeam] || {});
//       return emps.map((emp) => ({ team: selectedTeam, emp }));
//     }
//   }, [selectedTeam, employees, teamNames]);

//   const dateList = React.useMemo(() => {
//     const dates = [];
//     if (!week_start || !week_end) return dates;
//     let current = new Date(week_start);
//     const end = new Date(week_end);
//     while (current <= end) {
//       dates.push(current.toISOString().split('T')[0]);
//       current.setDate(current.getDate() + 1);
//     }
//     return dates;
//   }, [week_start, week_end]);

//   const finalEmployees = React.useMemo(() => {
//     if (selectedEmployee) {
//       return filteredEmployees.filter(({ emp }) => emp === selectedEmployee);
//     }
//     return filteredEmployees;
//   }, [filteredEmployees, selectedEmployee]);

//   // Now conditionally render UI based on data availability
//   if (!data || !data.employees) {
//     return <div>Loading or no data available...</div>;
//   }

//   return (
//     <Box p={2}>
//       <Typography variant="h6" mb={2}>
//         Employee Availability Calendar
//       </Typography>

//       <Box display="flex" gap={2} mb={3} flexWrap="wrap">
//         <FormControl sx={{ minWidth: 180 }}>
//           <InputLabel>Team</InputLabel>
//           <Select
//             value={selectedTeam}
//             onChange={(e) => {
//               setSelectedTeam(e.target.value);
//               setSelectedEmployee('');
//             }}
//             label="Team"
//           >
//             <MenuItem value="">All</MenuItem>
//             {teamNames.map((team) => (
//               <MenuItem key={team} value={team}>
//                 {team}
//               </MenuItem>
//             ))}
//           </Select>
//         </FormControl>

//         <FormControl sx={{ minWidth: 180 }} disabled={!selectedTeam && teamNames.length > 0}>
//           <InputLabel>Employee</InputLabel>
//           <Select
//             value={selectedEmployee}
//             onChange={(e) => setSelectedEmployee(e.target.value)}
//             label="Employee"
//           >
//             <MenuItem value="">All</MenuItem>
//             {filteredEmployees.map(({ emp }) => (
//               <MenuItem key={emp} value={emp}>
//                 {emp}
//               </MenuItem>
//             ))}
//           </Select>
//         </FormControl>
//       </Box>

//       <Paper>
//         <Table>
//           <TableHead>
//             <TableRow>
//               <TableCell>Team</TableCell>
//               <TableCell>Employee</TableCell>
//               {dateList.map((date) => (
//                 <TableCell key={date} align="center">
//                   {date}
//                 </TableCell>
//               ))}
//             </TableRow>
//           </TableHead>

//           <TableBody>
//             {finalEmployees.map(({ team, emp }) => (
//               <TableRow key={`${team}-${emp}`}>
//                 <TableCell>{team}</TableCell>
//                 <TableCell>{emp}</TableCell>

//                 {dateList.map((date) => {
//                   const dayData = employees?.[team]?.[emp]?.[date];

//                   let displayText = '-';
//                   let color = 'inherit';

//                   if (!dayData) {
//                     displayText = '-';
//                     color = 'text.secondary';
//                   } else if (dayData.status) {
//                     displayText = dayData.status;
//                     color = 'text.secondary';
//                   } else if (typeof dayData.available === 'number') {
//                     displayText = `${dayData.available}h`;
//                     color = dayData.available === 0 ? 'error.main' : 'success.main';
//                   }

//                   return (
//                     <TableCell key={date} align="center" sx={{ color }}>
//                       {displayText}
//                     </TableCell>
//                   );
//                 })}
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </Paper>
//     </Box>
//   );
// };

// export default CalendarAvailability;
