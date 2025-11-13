import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, X, ArrowLeft } from "lucide-react";

// ✅ Reusable Custom Dropdown Component
const CustomDropdown = ({ label, value, onChange, options }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} <span className="text-red-500">*</span>
      </label>

      <div
        onClick={() => setOpen(!open)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg 
          bg-white text-gray-700 cursor-pointer flex items-center justify-between
          hover:border-[#344EA0]"
      >
        <span>{value || "Choose"}</span>
        <svg
          className={`w-5 h-5 text-gray-500 transform transition-all ${open ? "rotate-180" : "rotate-0"
            }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {open && (
        <div
          className="absolute left-0 right-0 mt-1 bg-white rounded-lg shadow-lg 
            border border-gray-200 z-50 max-h-48 overflow-auto"
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

// ✅ Multi-select dropdown with checkboxes
const MultiSelectDropdown = ({ options, selected, onChange }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (option) => {
    if (selected.includes(option)) {
      onChange(selected.filter((item) => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <div className="relative text-sm" ref={dropdownRef}>
      <div
        onClick={() => setOpen(!open)}
        className="border border-gray-300 rounded-md px-3 py-1.5 bg-white flex items-center justify-between cursor-pointer hover:border-[#344EA0]"
      >
        <span className="text-gray-700 truncate w-32">
          {selected.length > 0 ? selected.join(", ") : "Select Permissions"}
        </span>
        <svg
          className={`w-4 h-4 text-gray-500 transform transition-transform ${open ? "rotate-180" : "rotate-0"
            }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {open && (
        <div
          className="absolute left-0 mt-1 min-w-[180px] bg-white border border-gray-200 
               rounded-lg shadow-lg z-50 py-1 animate-fadeIn"
        >
          {options.map((opt) => (
            <label
              key={opt}
              className="flex items-center px-3 py-2 text-sm text-gray-700 
                   hover:bg-[#f9fafb] transition-colors duration-150 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => toggleOption(opt)}
                className="mr-2 w-4 h-4 accent-[#344EA0] cursor-pointer"
              />
              <span className="leading-5">{opt}</span>
            </label>
          ))}
        </div>
      )}



    </div>
  );
};

const ProfileDetail = ({ profile, onBack }) => {
  const permissionSections = [
    {
      title: "Basic Permission",
      items: [
        "Dashboard",
        "Enquiry",
        "Bundle Solution",
        "Project",
        "Invoice Details",
        "Payment",
        "Reports",
        "Notification",
      ],
    },
    {
      title: "Project Overview",
      items: [
        "Project Log",
        "User Status",
        "Task Management",
        "Milestone Tracking",
        "Resource Allocation",
      ],
    },
    {
      title: "Updates",
      items: ["Audit Log", "System Notifications", "User Activity", "Version Control"],
    },
    {
      title: "Account",
      items: ["Sub User", "Security Control", "Preferences", "Billing Information"],
    },
  ];

  const [permissions, setPermissions] = useState({});
  const [activeSection, setActiveSection] = useState("Basic Permission");

  const rightPanelRef = useRef(null);
  const sectionRefs = useRef({});

  // Scroll to section on click
  const handleSectionClick = (title) => {
    const section = sectionRefs.current[title];
    if (section && rightPanelRef.current) {
      rightPanelRef.current.scrollTo({
        top: section.offsetTop - 10,
        behavior: "smooth",
      });
      setActiveSection(title);
    }
  };

  // Track visible section while scrolling
  useEffect(() => {
    const rightPanel = rightPanelRef.current;
    if (!rightPanel) return;

    const handleScroll = () => {
      const scrollPosition = rightPanel.scrollTop;
      let current = activeSection;

      Object.entries(sectionRefs.current).forEach(([title, el]) => {
        if (el.offsetTop - 50 <= scrollPosition) {
          current = title;
        }
      });

      setActiveSection(current);
    };

    rightPanel.addEventListener("scroll", handleScroll);
    return () => rightPanel.removeEventListener("scroll", handleScroll);
  }, [activeSection]);

  return (
    <div className="bg-white min-h-[100%] p-8 rounded-md shadow-sm border flex flex-col">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center text-gray-700 hover:text-[#344EA0] mb-4"
      >
        <ArrowLeft className="w-5 h-5 mr-1" /> Back to Profiles
      </button>

      {/* Header */}
      <h2 className="text-xl font-semibold text-gray-900 mb-1">
        Profiles : <span className="text-[#344EA0]">{profile.name}</span>
      </h2>
      <hr className="my-3" />

      <div className="flex gap-6 flex-grow relative">
        {/* Left Panel */}
        <div
          className="w-[18%] border-r pr-4 flex-shrink-0 bg-white z-10"
          style={{
            position: "sticky",
            top: "100px",
            alignSelf: "flex-start",
            height: "100%",
          }}
        >
          <h3 className="text-[20px] font-semibold text-gray-700 mb-4">
            Module Permission
          </h3>

          <div className="flex flex-col space-y-1">
            {permissionSections.map((section) => (
              <div
                key={section.title}
                onClick={() => handleSectionClick(section.title)}
                className={`text-md text-left px-3 py-2 rounded-md cursor-pointer font-medium transition 
                ${activeSection === section.title
                    ? "bg-[#F3F4F6] text-black shadow-sm"
                    : "text-gray-800 hover:bg-gray-100"
                  }`}
              >
                {section.title}
              </div>
            ))}
          </div>

          <h3 className="text-sm font-semibold text-gray-700 mt-5 mb-2">
            Setup Permission
          </h3>
          <p className="text-xs text-gray-500 italic ml-3">No setup modules</p>
        </div>

        {/* Right Panel */}
        <div
          ref={rightPanelRef}
          className="w-[82%] bg-[#F9FAFB] p-3 overflow-y-auto pr-2 rightPanelScroll scroll-smooth"
          style={{ height: "75vh", borderRadius: "8px" }}
        >
          {permissionSections.map((section) => (
            <div
              key={section.title}
              ref={(el) => (sectionRefs.current[section.title] = el)}
              className="mb-8 scroll-mt-20"
            >
              <h3 className="text-base font-semibold text-gray-800 mb-2">
                {section.title}
              </h3>
              <div className="border rounded-md">
                {section.items.map((item, index) => (
                  <div
                    key={item}
                    className={`flex justify-between items-center px-4 py-2 border-b last:border-none ${index % 2 === 0 ? "bg-gray-50" : "bg-white"
                      }`}
                  >
                    <span className="font-medium text-gray-700">{item}</span>

                    <div className="flex items-center gap-3">
                      {/* Toggle */}
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-600 transition-colors duration-200"></div>
                        <span className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 peer-checked:translate-x-5"></span>
                      </label>

                      {/* MultiSelectDropdown */}
                      <MultiSelectDropdown
                        options={["View", "Create", "Edit", "Delete"]}
                        selected={permissions[item] || []}
                        onChange={(newSelected) =>
                          setPermissions((prev) => ({ ...prev, [item]: newSelected }))
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};




const Usercontroller = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cloneProfile, setCloneProfile] = useState("");
  const [selectedProfile, setSelectedProfile] = useState(null);

  const profiles = [
    { id: 1, name: "Administration", description: "Access to Maximum User action", created: "24/07/2024", modified: "05/08/2024" },
    { id: 2, name: "Standard", description: "Access to Moderate User action", created: "24/07/2024", modified: "05/08/2024" },
    { id: 3, name: "Expert View", description: "Access to Expert level actions", created: "24/07/2024", modified: "05/08/2024" },
    { id: 4, name: "Client Profile", description: "Limited access to view details only", created: "24/07/2024", modified: "05/08/2024" },
  ];

  const handleAddProfileClick = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const profileOptions = profiles.map((p) => p.name);

  if (selectedProfile) {
    return <ProfileDetail profile={selectedProfile} onBack={() => setSelectedProfile(null)} />;
  }

  return (
    <div className="p-6 bg-white min-h-screen relative">
      <nav className="mb-1 text-sm text-gray-600 flex items-center">
        <Link to="#" className="text-gray-500 hover:text-[#344EA0]">
          Security Control
        </Link>
        <span className="mx-1">/</span>
        <span className="text-gray-500">Profile</span>
      </nav>

      <hr />

      <div className="flex justify-between items-center mt-4 mb-4">
        <h1 className="text-xl font-semibold text-gray-900">Profiles</h1>
        <button
          onClick={handleAddProfileClick}
          className="bg-[#344EA0] text-white px-4 py-2 rounded hover:bg-[#2b3f8a] transition"
        >
          Add Profile
        </button>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Profile is a set of permissions dealing with module access and operations...
      </p>

      <div className="relative mb-4 w-72">
        <input
          type="text"
          placeholder="Search..."
          className="w-full border border-gray-300 rounded-md pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-[#344EA0] focus:outline-none bg-white"
        />
        <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="border px-3 py-2 text-left">Sl no</th>
              <th className="border px-3 py-2 text-left">Profile Name</th>
              <th className="border px-3 py-2 text-left">Description</th>
              <th className="border px-3 py-2 text-left">Created Date</th>
              <th className="border px-3 py-2 text-left">Last Modified</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((p, index) => (
              <tr
                key={p.id}
                className="hover:bg-gray-50 border-t text-gray-800 cursor-pointer"
              >
                <td className="border px-3 py-2">{index + 1}</td>
                <td
                  onClick={() => setSelectedProfile(p)}
                  className="border px-3 py-2 text-[#344EA0] font-medium hover:underline"
                >
                  {p.name}
                </td>
                <td className="border px-3 py-2">{p.description}</td>
                <td className="border px-3 py-2">{p.created}</td>
                <td className="border px-3 py-2">{p.modified}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="p-2 text-xs text-gray-600 bg-gray-50 border-t">
          Total Records - {profiles.length}
        </div>
      </div>

      {/* ✅ Add Profile Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg shadow-xl">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Add Profile</h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="p-4">
              <p className="text-sm text-gray-600 mb-4">
                Complete all sections to add a new role member..
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User Role <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter User Role"
                  className="w-full border bg-white border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-[#344EA0] outline-none"
                />
              </div>

              <CustomDropdown
                label="Clone Profile"
                value={cloneProfile}
                onChange={setCloneProfile}
                options={profileOptions}
              />

              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  placeholder="Write a message..."
                  rows="3"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-[#344EA0] outline-none resize-y"
                ></textarea>
              </div>
            </div>

            <div className="flex justify-end p-4 border-t space-x-2">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button className="px-4 py-2 text-white bg-[#344EA0] rounded hover:bg-[#2b3f8a] transition">
                Add Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Usercontroller;
