import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronRight, X } from 'lucide-react';
import { useNavigate } from 'react-router';

// ✅ Custom Dropdown Component
const CustomDropdown = ({ label, value, onChange, options, required }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();

  // ✅ Close dropdown on clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Selected Box */}
      <div
        onClick={() => setOpen(!open)}
        className="
          w-full px-3 py-2 border border-gray-300 rounded-lg bg-white 
          text-gray-700 cursor-pointer flex items-center justify-between
        "
      >
        <span>{value || "Choose"}</span>

        <svg
          className={`w-5 h-5 text-gray-500 transform transition-all ${
            open ? "rotate-180" : "rotate-0"
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Dropdown Menu */}
      {open && (
        <div
          className="
            absolute left-0 right-0 mt-1 bg-white border border-gray-200 
            rounded-lg shadow-md max-h-48 overflow-auto z-50
          "
        >
          {options.map((item) => (
            <div
              key={item}
              onClick={() => {
                onChange(item);
                setOpen(false);
              }}
              className="
                px-3 py-2 cursor-pointer hover:bg-gray-100 text-gray-700
              "
            >
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const MyAccountTable = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    workEmail: '',
    role: '',
    profile: ''
  });

  const users = [
    {
      slNo: 1,
      userName: 'Gowtham',
      emailId: 'gt@elitetechcorp.com',
      profile: 'Administrator',
      assignedRole: 'Developer',
      status: 'Active',
      createdDate: '24/07/2024',
      lastModified: '05/08/2024'
    },
    {
      slNo: 2,
      userName: 'Arun',
      emailId: 'ar@elitetechcorp.com',
      profile: 'Super Administrator',
      assignedRole: 'Developer',
      status: 'Active',
      createdDate: '24/07/2024',
      lastModified: '05/08/2024'
    }
  ];
  
  const handleUserName = () => {
    navigate('/sub-user-details');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddUser = () => {
    console.log('Form Data:', formData);
    setIsModalOpen(false);
    setFormData({
      firstName: '',
      lastName: '',
      workEmail: '',
      role: '',
      profile: ''
    });
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setFormData({
      firstName: '',
      lastName: '',
      workEmail: '',
      role: '',
      profile: ''
    });
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-6">

        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-600 mb-6">
          <span>Account Settings</span>
          <span style={{paddingLeft:'5px'}}> / </span>
          <span className="text-gray-900 pl-1">Sub User</span>
        </div>

        <div className="flex justify-end mb-6">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#344EA0] text-white px-4 py-2 rounded-md hover:bg-[#5067b1] flex items-center gap-2"
          >
            <span>+</span>
            <span>Add Sub User</span>
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200">
          {/* Search Bar */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative max-w-xs ml-auto">
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-4 pr-10 py-2 bg-[white] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#9EA2AD] uppercase">
                    Sl no
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#9EA2AD] uppercase">
                    User Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#9EA2AD] uppercase">
                    Email ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#9EA2AD] uppercase">
                    Profile
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#9EA2AD] uppercase">
                    Assigned Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#9EA2AD] uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#9EA2AD] uppercase">
                    Created Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#9EA2AD] uppercase">
                    Last Modified
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#9EA2AD] uppercase">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.slNo} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">{user.slNo}</td>
                    <td onClick={handleUserName} className="px-6 py-4 text-sm cursor-pointer">{user.userName}</td>
                    <td className="px-6 py-4 text-sm">{user.emailId}</td>
                    <td className="px-6 py-4 text-sm">{user.profile}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="inline-flex items-center px-3 py-1 rounded-md text-xs bg-gray-100 border border-gray-300">
                        {user.assignedRole}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-green-100 text-[#1FC16B]">
                        <span className="w-1.5 h-1.5 bg-[#1FC16B] rounded-full mr-2"></span>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">{user.createdDate}</td>
                    <td className="px-6 py-4 text-sm">{user.lastModified}</td>
                    <td className="px-6 py-4 text-sm">
                      <button className="mr-3 text-[#454A53]">Delete</button>
                      <button className="text-[#344EA0]">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>

          <div className="px-6 py-3 border-t border-gray-200 text-sm text-gray-600">
            Total Records - {users.length}
          </div>
        </div>
      </div>

      {/* ✅ Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-xl mx-4">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-2 border-b border-gray-200">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Add Sub User</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Complete all sections to add a new role member..
                </p>
              </div>
              <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-4">
              <div className="bg-gray-50 rounded-lg p-4 mb-4">

                <div className="flex items-center gap-2 mb-3">
                  <div style={{ border: '1px solid #E5E7EB', padding: '15px', borderRadius: '10px' }}>
                    <img src='https://profileicons-development.zohostratus.in/users.svg' alt='profile' />
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-900">User Information</h3>
                    <p className="text-xs text-gray-500">Basic details about the team member</p>
                  </div>
                </div>

                <div className="space-y-4">

                  {/* First & Last Name */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="Enter First Name"
                        className="w-full px-3 py-2 border bg-white rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Enter Last Name"
                        className="w-full px-3 py-2 border bg-white rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Work Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Work Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="workEmail"
                      value={formData.workEmail}
                      onChange={handleInputChange}
                      placeholder="Enter Organisation Email ID"
                      className="w-full px-3 py-2 border bg-white rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* ✅ Role Dropdown */}
                  <CustomDropdown
                    label="Role"
                    required={true}
                    value={formData.role}
                    options={["Developer", "Designer", "Manager"]}
                    onChange={(val) => setFormData({ ...formData, role: val })}
                  />

                  {/* ✅ Profile Dropdown */}
                  <CustomDropdown
                    label="Profile"
                    required={true}
                    value={formData.profile}
                    options={["Administrator", "Super Administrator", "User"]}
                    onChange={(val) => setFormData({ ...formData, profile: val })}
                  />

                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                className="px-4 py-2 text-sm font-medium text-white bg-[#344EA0] rounded-md hover:bg-[#4a5bc4]"
              >
                Add Sub User
              </button>
            </div>

          </div>
        </div>
      )}

    </>
  );
};

export default MyAccountTable;
