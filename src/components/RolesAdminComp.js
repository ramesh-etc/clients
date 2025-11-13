import React, { useState } from "react";
import { FaPlus, FaMinus, FaEdit, FaTrashAlt, FaTimes } from "react-icons/fa";


const CustomDropdown = ({ label, value, onChange, options }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} <span className="text-red-500">*</span>
      </label>

      {/* Selected Box */}
      <div
        onClick={() => setOpen(!open)}
        className="
          w-full px-3 py-2 border border-gray-300 rounded-lg 
          bg-white text-gray-700 cursor-pointer
          flex items-center justify-between
        "
      >
        <span>{value || "Select"}</span>

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

      {/* Dropdown List */}
      {open && (
        <div
          className="
            absolute left-0 right-0 mt-1 bg-white rounded-lg shadow-lg
            border border-gray-200 z-50 max-h-48 overflow-auto
          "
        >
          {options.map((item) => (
            <div
              key={item}
              onClick={() => {
                onChange(item);
                setOpen(false);
              }}
              className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-gray-700"
            >
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


const RoleNode = ({ role, isRoot = true, isLast }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [showActions, setShowActions] = useState(false);

  return (
    <div className="relative">
      <div className="relative flex items-center py-1 pl-6">
        {!isRoot && (
          <>
            <div
              className={`absolute left-0 top-0 
              ${isLast ? "h-4" : "h-full"}
              border-l-2 border-dotted border-gray-400`}
            ></div>
            <div className="absolute left-0 top-1/2 w-6 border-t-2 border-dotted border-gray-400"></div>
          </>
        )}

        {role.children && role.children.length > 0 ? (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-4 h-4 flex items-center justify-center 
                       border border-gray-500 bg-white rounded text-black z-10"
          >
            {isOpen ? <FaMinus size={9} /> : <FaPlus size={9} />}
          </button>
        ) : (
          <div className="w-4 h-4"></div>
        )}

        <span 
          className="ml-2 text-black text-base cursor-pointer hover:text-blue-600 transition-colors"
          onClick={() => setShowActions(!showActions)}
        >
          {role.name}
        </span>

        {showActions && (
          <div className="flex items-center space-x-3 ml-3 text-gray-600">
            <FaPlus className="cursor-pointer hover:text-blue-600 transition-colors" size={12} />
            <FaEdit className="cursor-pointer hover:text-blue-600 transition-colors" size={12} />
            <FaTrashAlt className="cursor-pointer hover:text-blue-600 transition-colors" size={12} />
          </div>
        )}
      </div>

      {isOpen && role.children && (
        <div className="ml-6 relative">
          {!isRoot && (
            <div
              className="absolute left-0 border-l-2 border-dotted border-gray-400"
              style={{
                top: "0",
                bottom: "50%",
                height: "calc(100% - 12px)",
              }}
            ></div>
          )}

          {role.children.map((child, index) => (
            <RoleNode
              key={index}
              role={child}
              isRoot={false}
              isLast={index === role.children.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/* ✅ Add Role Modal WITH CUSTOM DROPDOWN */
const AddRoleModal = ({ isOpen, onClose }) => {
  const [userRole, setUserRole] = useState("");
  const [reportingTo, setReportingTo] = useState("");

  const reportingOptions = [
    "CEO",
    "Finance Manager",
    "Project Manager",
    "Full Stack Team"
  ];

  if (!isOpen) return null;

  const handleSubmit = () => {
    console.log("User Role:", userRole);
    console.log("Reporting To:", reportingTo);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Add User Role</h2>
            <p className="text-sm text-gray-500 mt-1">
              Complete all sections to add a new role member..
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User Role <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter User Role"
              value={userRole}
              onChange={(e) => setUserRole(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* ✅ Custom Dropdown Used Here */}
          <CustomDropdown
            label="Reporting To"
            value={reportingTo}
            onChange={setReportingTo}
            options={reportingOptions}
          />

        </div>

        <div className="flex items-center justify-end gap-3 p-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium text-white bg-[#344EA0] rounded-md hover:bg-[#4A5BA8] transition-colors"
          >
            Add User
          </button>
        </div>
      </div>
    </div>
  );
};

const roleHierarchyData = [
  {
    name: "Super Admin",
    children: [
      {
        name: "CEO",
        children: [
          {
            name: "Finance Manager",
            children: [
              { name: "Accounts Lead" },
              { name: "Accountant (CA)" },
              { name: "Admin" },
            ],
          },
          {
            name: "Project Manager",
            children: [
              { name: "Project Coordinator" },
              { name: "Project Admin" },
            ],
          },
          {
            name: "Full Stack Team",
            children: [
              { name: "Frontend Developer" },
              { name: "Backend Developer" },
              { name: "UI/UX Designer" },
            ],
          },
        ],
      },
    ],
  },
];

const Usercontroller = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="bg-white min-h-screen p-0">
      <div className="max-w-7xl px-6">
        <nav className="mb-5 text-sm p-2 pt-4">
          <span className="text-gray-500 hover:text-black cursor-pointer">
            Security Control
          </span>
          <span className="text-gray-500"> / </span>
          <span className="text-black font-medium">Role</span>
        </nav>

        <h1 className="text-xl font-bold text-black mb-3">Role</h1>
        <p className="text-gray-500 mb-6">
          This page helps define data sharing based on role hierarchy.
        </p>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center bg-[#344EA0] hover:bg-[#303f70] text-white font-semibold py-2 px-4 rounded mb-8 transition-colors"
        >
          <FaPlus className="mr-2" size={12} />
          Add Role
        </button>

        <div className="p-4 rounded bg-white">
          {roleHierarchyData.map((role, index) => (
            <RoleNode key={index} role={role} />
          ))}
        </div>
      </div>

      <AddRoleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default Usercontroller;
