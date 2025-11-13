import React, { useState, useRef, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { Link } from "react-router-dom";
import { Pencil, ChevronDown } from "lucide-react";


const SubUserAdmin = () => {
    const [activeTab, setActiveTab] = useState("profile");
    const [activeSubTab, setActiveSubTab] = useState("Dashboard");
    const [isEditing, setIsEditing] = useState(false);
    const [showAddProjectModal, setShowAddProjectModal] = useState(false);
    const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState("Choose");
    const [openDropdowns, setOpenDropdowns] = useState({});
    const [permissions, setPermissions] = useState({});
    const [projectActions, setProjectActions] = useState({});
    const [modalProjectRoles, setModalProjectRoles] = useState({});
    const [enabledModules, setEnabledModules] = useState({});

    const roles = ["Admin", "Developer", "Manager"];

    const projectsData = [
        { name: "Technicarft", tag: "Zoho One", id: "ETC1234", action: "Edit" },
        { name: "Lulu Holidays", tag: "Full-stack", id: "ETC1234", action: "View" },
        { name: "Megawin", tag: "Zoho One", id: "ETC1234", action: "Edit" },
        { name: "Megawin", tag: "Zoho One", id: "ETC1234", action: "Edit" },
    ];

    const modalProjectsData = [
        { name: "Technicarft", tag: "Zoho One", id: "ETC1234", role: "Edit" },
        { name: "Technicarft", tag: "Zoho One", id: "ETC1234", role: "Edit" },
        { name: "Technicarft", tag: "Zoho One", id: "ETC1234", role: "Edit" },
        { name: "Technicarft", tag: "Zoho One", id: "ETC1234", role: "Edit" },
    ];


    const permissionsData = {
        "modules": {
            "Dashboard": [
                {
                    "title": "Basic Permission",
                    "items": [
                        { "name": "Dashboard", "actions": ["View", "Create", "Edit", "Delete"] },
                        { "name": "Analytics", "actions": ["View", "Edit"] },
                        { "name": "Reports", "actions": ["View", "Create", "Delete"] },
                        { "name": "Notifications", "actions": ["View", "Edit", "Delete"] }
                    ]
                },
                {
                    "title": "Dashboard Submodules",
                    "parent": "Dashboard-Dashboard",
                    "items": [
                        { "name": "Overview", "actions": ["All Projects", "Zoho One", "Zoho Catalyst"] },
                        { "name": "Statistics", "actions": ["View", "Create", "Edit", "Delete"] },
                        { "name": "Availability", "actions": ["All team", "Full Stack", "Zoho One", "Testing"] },
                        { "name": "Project Team Allocations", "actions": ["View", "Create"] }
                    ]
                },
                {
                    "title": "Statistics Submodules",
                    "parent": "Dashboard-Dashboard-Statistics",
                    "items": [
                        { "name": "OverAll Project Status", "actions": ["All Projects", "tecnicrafts"] }
                    ]
                }
            ],
            "Project Overview": [
                {
                    "title": "Project Overview",
                    "items": [
                        { "name": "Project Log", "actions": ["View", "Create", "Edit"] },
                        { "name": "User Status", "actions": ["View", "Edit"] },
                        { "name": "Activity Timeline", "actions": ["View", "Create", "Edit", "Delete"] }
                    ]
                }
            ],
            "Updates": [
                {
                    "title": "Updates",
                    "items": [
                        { "name": "Audit Log", "actions": ["View", "Edit"] },
                        { "name": "Release Notes", "actions": ["View", "Create", "Edit", "Delete"] }
                    ]
                }
            ],
            "Account": [
                {
                    "title": "Account",
                    "items": [
                        { "name": "Profile Info", "actions": ["View", "Edit"] },
                        { "name": "User Settings", "actions": ["View", "Create", "Edit", "Delete"] },
                        { "name": "Password Reset", "actions": ["View", "Edit"] }
                    ]
                }
            ]
        }

    }



    const sectionRefs = {
        Dashboard: useRef(null),
        "Basic Permission": useRef(null),
        "Project Overview": useRef(null),
        Updates: useRef(null),
        Account: useRef(null),
    };


    useEffect(() => {
        const initialPermissions = {};
        const initialEnabledModules = {};

        Object.keys(permissionsData.modules).forEach((sectionKey) => {
            permissionsData.modules[sectionKey].forEach((section) => {

                section.items.forEach((item) => {
                    const itemKey = `${sectionKey}-${item.name}`;
                    initialPermissions[itemKey] = [];
                    // 🚫 Disabled by default
                    initialEnabledModules[itemKey] = false;
                });
            });
        });

        setPermissions(initialPermissions);
        setEnabledModules(initialEnabledModules);

        const initialActions = {};
        projectsData.forEach((proj, index) => {
            initialActions[index] = proj.action;
        });
        setProjectActions(initialActions);

        const initialModalRoles = {};
        modalProjectsData.forEach((proj, index) => {
            initialModalRoles[index] = proj.role;
        });
        setModalProjectRoles(initialModalRoles);
    }, []);


    useEffect(() => {
        const ref = sectionRefs[activeSubTab];
        if (ref?.current) {
            ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, [activeSubTab]);

    const toggleDropdown = (key) => {
        setOpenDropdowns((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const togglePermission = (itemKey, permission) => {
        setPermissions((prev) => {
            const current = prev[itemKey] || [];
            const newPermissions = current.includes(permission)
                ? current.filter((p) => p !== permission)
                : [...current, permission];
            return {
                ...prev,
                [itemKey]: newPermissions,
            };
        });
    };

    const getPermissionLabel = (itemKey) => {
        const selected = permissions[itemKey] || [];
        if (selected.length === 0) return "No Access";
        if (selected.length === 4) return "View, Create, Edit, Delete";
        return selected.join(", ");
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest(".permission-dropdown")) {
                setOpenDropdowns({});
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);



    const renderSubmodules = (parentKey) => {
        const subModules =
            Object.values(permissionsData.modules)
                .flat()
                .find((sec) => sec.parent === parentKey)?.items || []


        if (!subModules.length) return null;

        return (
            <div className="ml-8 border-l border-gray-100 pl-4 mt-1">
                {subModules.map((sub, idx) => {
                    const subKey = `${parentKey}-${sub.name}`;
                    const subOpen = openDropdowns[subKey];
                    const subActions = sub.actions;
                    const isSubEnabled = enabledModules[subKey] || false;

                    return (
                        <div key={idx} className="flex flex-col">
                            <div className="flex justify-between items-center px-4 py-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-700 text-sm">{sub.name}</span>
                                    <span className="text-gray-400 text-xs">ⓘ</span>
                                </div>

                                <div className="flex items-center gap-4">
                                    {/* Toggle */}
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={isSubEnabled}
                                            onChange={(e) =>
                                                setEnabledModules((prev) => ({
                                                    ...prev,
                                                    [subKey]: e.target.checked,
                                                }))
                                            }
                                        />
                                        <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-[#15803D] transition-all"></div>
                                        <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-5 transition-all"></div>
                                    </label>

                                    {/* Permission dropdown */}
                                    <div className="relative permission-dropdown">
                                        <button
                                            onClick={() => toggleDropdown(subKey)}
                                            className="w-[220px] border border-gray-300 rounded-md text-sm text-gray-700 px-3 py-2 appearance-none pr-8 focus:ring-2 focus:ring-[#344EA0] focus:outline-none transition flex items-center justify-between"
                                        >
                                            <span className="truncate">{getPermissionLabel(subKey)}</span>
                                            <ChevronDown
                                                size={16}
                                                className={`text-gray-500 flex-shrink-0 transition-transform ${subOpen ? "rotate-180" : ""
                                                    }`}
                                            />
                                        </button>

                                        {subOpen && (
                                            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                                                {subActions.map((permission) => (
                                                    <label
                                                        key={permission}
                                                        className="flex items-center gap-3 px-3 py-2 hover:bg-[#f3f6ff] cursor-pointer transition-colors"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={permissions[subKey]?.includes(permission) || false}
                                                            onChange={() => togglePermission(subKey, permission)}
                                                            className="w-4 h-4 text-[#344EA0] border-gray-300 rounded focus:ring-[#344EA0] accent-[#344EA0]"
                                                        />
                                                        <span className="text-sm text-gray-700">{permission}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* 🔁 Recursive render next-level submodules */}
                            {isSubEnabled && renderSubmodules(subKey)}
                        </div>
                    );
                })}
            </div>
        );
    };



    return (
        <Sidebar>




            <div className="flex items-center justify-between p-4">
                <nav className="text-sm flex items-center gap-2">
                    <Link
                        to="/profile"
                        style={{ textDecoration: "none" }}
                        className="text-gray-600 hover:text-gray-800"
                    >
                        Profile
                    </Link>
                    <span className="text-gray-400">/</span>
                    <span className="text-gray-800">Sub User</span>
                </nav>

                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center gap-2 bg-[#344EA0] text-white px-4 py-2 rounded hover:bg-[#2c3a8a] transition-colors"
                >
                    <Pencil size={16} /> {isEditing ? "Save" : "Edit"}
                </button>
            </div>

            <div className="bg-white">


                <div className="px-6 pb-6 pt-5">
                    <div className="flex flex-col sm:flex-row items-start gap-4 -mt-10">
                        <img
                            src="https://profileicons-development.zohostratus.in/6a4295e3745c5cf5e510d6492434ad8cae4e0178.jpg"
                            alt="User"
                            className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                        />
                        <div className="mt-3 sm:mt-10">
                            <p className="text-xs text-gray-500 mb-1">Internal User</p>
                            <div className="flex items-center gap-3">
                                <h2 className="text-2xl font-normal text-gray-900">Gowtham</h2>
                                <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded border border-gray-200">
                                    Developer
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            <div className="border-b w-full bg-white">
                <div className="flex px-6 gap-8 text-sm">
                    <button
                        className={`pb-3 ${activeTab === "profile"
                            ? "border-b-2 border-[#344EA0] text-[#344EA0] font-medium"
                            : "text-gray-600 hover:text-gray-800"
                            }`}
                        onClick={() => setActiveTab("profile")}
                    >
                        Profile Details
                    </button>
                    <button
                        className={`pb-3 ${activeTab === "access"
                            ? "border-b-2 border-[#344EA0] text-[#344EA0] font-medium"
                            : "text-gray-600 hover:text-gray-800"
                            }`}
                        onClick={() => setActiveTab("access")}
                    >
                        User Access Control
                    </button>
                    <button
                        className={`pb-3 ${activeTab === "project"
                            ? "border-b-2 border-[#344EA0] text-[#344EA0] font-medium"
                            : "text-gray-600 hover:text-gray-800"
                            }`}
                        onClick={() => setActiveTab("project")}
                    >
                        Project Access
                    </button>
                </div>
            </div>

            {activeTab === "profile" && (
                <div className="p-6 bg-white">
                    <div className="grid sm:grid-cols-2 gap-x-8 gap-y-6">
                        <div>
                            <label className="block text-sm text-gray-800 mb-2">
                                First Name
                            </label>
                            <input
                                type="text"
                                placeholder="Enter First Name"
                                disabled={!isEditing}
                                className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none disabled:bg-gray-50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-800 mb-2">
                                Last Name
                            </label>
                            <input
                                type="text"
                                placeholder="Enter Last Name"
                                disabled={!isEditing}
                                className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none disabled:bg-gray-50"
                            />
                        </div>
                    </div>

                    <div className="mt-6">
                        <label className="block text-sm text-gray-800 mb-2">
                            Work Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            placeholder="Enter Organisation Email ID"
                            disabled={!isEditing}
                            className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none disabled:bg-gray-50"
                        />
                    </div>

                    <div className="mt-6 sm:w-1/2 sm:pr-4">
                        <label className="block text-sm text-gray-800 mb-2">
                            Role <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <div
                                onClick={() =>
                                    isEditing && setIsRoleDropdownOpen(!isRoleDropdownOpen)
                                }
                                className={`w-full border border-gray-300 bg-white rounded px-3 py-2.5 text-sm flex justify-between items-center cursor-pointer ${!isEditing ? "bg-gray-50" : "hover:border-[#344EA0]"
                                    }`}
                            >
                                <span
                                    className={`${selectedRole === "Choose"
                                        ? "text-gray-400"
                                        : "text-gray-900"
                                        }`}
                                >
                                    {selectedRole}
                                </span>
                                <ChevronDown
                                    size={16}
                                    className={`text-gray-500 transition-transform duration-200 ${isRoleDropdownOpen ? "rotate-180" : ""
                                        }`}
                                />
                            </div>

                            {isRoleDropdownOpen && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                                    {roles.map((role) => (
                                        <div
                                            key={role}
                                            onClick={() => {
                                                setSelectedRole(role);
                                                setIsRoleDropdownOpen(false);
                                            }}
                                            className="px-3 py-2 text-sm text-gray-700 hover:bg-[#f3f6ff] hover:text-[#344EA0] cursor-pointer transition-all"
                                        >
                                            {role}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {activeTab === "access" && (
                <div className="flex h-[65vh]">
                    {/* LEFT SIDEBAR */}
                    <div className="w-64 border-r bg-[white] p-4 flex-shrink-0">
                        <h3 className="text-[20px] font-semibold text-gray-700 mb-3">
                            Module Permission
                        </h3>
                        <div className="flex flex-col gap-1 mb-5">
                            {["Basic Permission", "Project Overview", "Updates", "Account"].map(
                                (item) => (
                                    <button
                                        key={item}
                                        className={`text-sm text-left px-3 py-2 rounded transition-all ${activeSubTab === item
                                            ? "bg-[#F3F4F6] text-gray-900 font-medium"
                                            : "text-gray-500 hover:text-gray-800"
                                            }`}
                                        onClick={() => setActiveSubTab(item)}
                                    >
                                        {item}
                                    </button>
                                )
                            )}
                        </div>

                        <h3 className="text-[20px] font-semibold text-gray-700 mb-3">
                            Module Configuration
                        </h3>

                        <div className="flex flex-col gap-2 mt-2">
                            {Object.keys(enabledModules)
                                .filter((key) => enabledModules[key])
                                .map((key) => {
                                    const parts = key.split("-");
                                    const formattedLabel = parts.slice(1).join(" → ");
                                    return (
                                        <div
                                            key={key}
                                            className="text-sm text-gray-700 bg-[#F9FAFB] border border-gray-200 rounded px-3 py-1"
                                        >
                                            {formattedLabel}
                                        </div>
                                    );
                                })}
                        </div>
                    </div>

                    {/* RIGHT CONTENT */}
                    <div className="flex-1 bg-white pt-3 p-6 overflow-y-auto scroll-smooth">
                        {Object.keys(permissionsData.modules).map((sectionKey) => (
                            <div key={sectionKey} ref={sectionRefs[sectionKey]} className="mb-10">

                                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                                    {sectionKey}
                                </h2>

                                {permissionsData.modules[sectionKey]
                                    ?.filter((section) => !section.parent)
                                    .map((section) => (

                                        <div
                                            key={section.title}
                                            className="border border-gray-200 rounded-xl mb-5 mt-3 overflow-hidden"
                                        >
                                            <div className="px-4 py-3 bg-gray-50 font-medium text-gray-800 text-sm">
                                                {section.title}
                                            </div>

                                            <div className="divide-y">
                                                {section.items.map((item, i) => {
                                                    const itemKey = `${sectionKey}-${item.name}`;
                                                    const isOpen = openDropdowns[itemKey];
                                                    const isEnabled = enabledModules[itemKey] || false;
                                                    const availableActions = item.actions;

                                                    return (
                                                        <div key={i} className="flex flex-col">
                                                            {/* Parent Row */}
                                                            <div className="flex justify-between items-center px-4 py-3">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-gray-700 text-sm">
                                                                        {item.name}
                                                                    </span>
                                                                    <span className="text-gray-400 text-xs">ⓘ</span>
                                                                </div>

                                                                <div className="flex items-center gap-4">
                                                                    {/* Toggle */}
                                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                                        <input
                                                                            type="checkbox"
                                                                            className="sr-only peer"
                                                                            checked={isEnabled}
                                                                            onChange={(e) =>
                                                                                setEnabledModules((prev) => ({
                                                                                    ...prev,
                                                                                    [itemKey]: e.target.checked,
                                                                                }))
                                                                            }
                                                                        />
                                                                        <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-[#15803D] transition-all"></div>
                                                                        <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-5 transition-all"></div>
                                                                    </label>

                                                                    {/* Permission Dropdown */}
                                                                    <div className="relative permission-dropdown">
                                                                        <button
                                                                            onClick={() => {
                                                                                if (isEnabled) toggleDropdown(itemKey);
                                                                            }}
                                                                            disabled={!isEnabled}
                                                                            className={`w-[220px] border rounded-md text-sm px-3 py-2 appearance-none pr-8 flex items-center justify-between transition 
                                  ${isEnabled
                                                                                    ? "border-gray-300 text-gray-700 bg-white hover:border-[#344EA0] cursor-pointer"
                                                                                    : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-70"
                                                                                }`}
                                                                        >
                                                                            <span className="truncate">
                                                                                {getPermissionLabel(itemKey)}
                                                                            </span>
                                                                            <ChevronDown
                                                                                size={16}
                                                                                className={`flex-shrink-0 transition-transform ${isEnabled ? "text-gray-500" : "text-gray-300"
                                                                                    } ${isOpen ? "rotate-180" : ""}`}
                                                                            />
                                                                        </button>

                                                                        {isEnabled && isOpen && (
                                                                            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                                                                                {availableActions.map((permission) => (
                                                                                    <label
                                                                                        key={permission}
                                                                                        className="flex items-center gap-3 px-3 py-2 hover:bg-[#f3f6ff] cursor-pointer transition-colors"
                                                                                    >
                                                                                        <input
                                                                                            type="checkbox"
                                                                                            checked={
                                                                                                permissions[itemKey]?.includes(
                                                                                                    permission
                                                                                                ) || false
                                                                                            }
                                                                                            onChange={() =>
                                                                                                togglePermission(itemKey, permission)
                                                                                            }
                                                                                            className="w-4 h-4 text-[#344EA0] border-gray-300 rounded focus:ring-[#344EA0] accent-[#344EA0]"
                                                                                        />
                                                                                        <span className="text-sm text-gray-700">
                                                                                            {permission}
                                                                                        </span>
                                                                                    </label>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* ✅ Recursive Submodules */}
                                                            {isEnabled && renderSubmodules(itemKey)}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        ))}
                    </div>
                </div>
            )}






            {activeTab === "project" && (
                <div className="p-6 bg-white min-h-[70vh]">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-lg font-semibold text-gray-800">Project Access</h2>
                        <button
                            onClick={() => setShowAddProjectModal(true)}
                            className="flex items-center gap-2 bg-[#344EA0] text-white text-sm px-4 py-2 rounded hover:bg-[#2c3a8a] transition-colors"
                        >
                            + Add Project
                        </button>
                    </div>

                    <div className="border border-gray-200 rounded-md divide-y">
                        {projectsData.map((proj, index) => {
                            const dropdownKey = `project-${index}`;
                            const isOpen = openDropdowns[dropdownKey];
                            const currentAction = projectActions[index] || proj.action;

                            return (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-2 ml-4 hover:bg-gray-50 transition-colors"
                                >
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <p className="text-gray-800 font-medium">{proj.name}</p>
                                            <span className="text-xs bg-gray-100 text-gray-700 mb-2 px-2 py-0.5 rounded border border-gray-200">
                                                {proj.tag}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">ID: {proj.id}</p>
                                    </div>
                                    <div className="relative permission-dropdown">
                                        <div
                                            onClick={() => toggleDropdown(dropdownKey)}
                                            className="border border-gray-300 bg-white rounded-md text-sm text-gray-700 px-3 py-1.5 flex items-center gap-1 cursor-pointer hover:border-[#344EA0] transition"
                                        >
                                            <span>{currentAction}</span>
                                            <ChevronDown
                                                size={14}
                                                className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                                            />
                                        </div>

                                        {isOpen && (
                                            <div className="absolute right-0 z-10 w-32 mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                                                {['View', 'Edit', 'Admin'].map((option) => (
                                                    <div
                                                        key={option}
                                                        onClick={() => {
                                                            setProjectActions(prev => ({
                                                                ...prev,
                                                                [index]: option
                                                            }));
                                                            toggleDropdown(dropdownKey);
                                                        }}
                                                        className="px-3 py-2 text-sm text-gray-700 hover:bg-[#f3f6ff] hover:text-[#344EA0] cursor-pointer transition-all"
                                                    >
                                                        {option}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}


            {showAddProjectModal && (
                <div className="fixed inset-0 bg-[#6c7077] bg-opacity-40 flex items-center justify-center z-50">
                    <div className="relative bg-white w-[95%] sm:w-[620px] rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
                        <div className="px-6 pt-5 pb-3 border-b relative">
                            <h2 className="text-lg font-semibold text-gray-900">Add Project</h2>
                            <p className="text-xs text-gray-500 mt-1">
                                Complete all sections to add a new role member.
                            </p>
                            <button
                                onClick={() => setShowAddProjectModal(false)}
                                className="absolute right-5 top-5 text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-5">
                            <div className="border rounded-lg overflow-hidden">
                                <div className="flex items-center justify-between bg-gray-50 px-4 py-0 border-b">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-[#EEF2FF] p-2 rounded-md">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth="1.5"
                                                stroke="currentColor"
                                                className="w-5 h-5 text-[#344EA0]"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M3.75 6.75h4.5l1.5 1.5h10.5A1.5 1.5 0 0121.75 9.75v7.5a1.5 1.5 0 01-1.5 1.5H3.75a1.5 1.5 0 01-1.5-1.5v-9a1.5 1.5 0 011.5-1.5z"
                                                />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-800">Project Access</p>
                                            <p className="text-xs text-gray-500">Configure access to Project</p>
                                        </div>
                                    </div>
                                    <ChevronDown size={16} className="text-gray-500" />
                                </div>

                                {/* Search Input */}
                                <div className="flex items-center gap-2 px-4 py-4 border-b">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="w-4 h-4 text-gray-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth="1.5"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 18a7.5 7.5 0 006.15-3.35z"
                                        />
                                    </svg>
                                    <input
                                        type="text"
                                        placeholder="Search Project Folder"
                                        className="w-full p-2 bg-white border border-gray-50 text-sm placeholder-gray-400 border-none focus:ring-0 focus:outline-none"
                                    />
                                </div>

                                {/* Project List */}
                                <div className="p-3 space-y-4 max-h-[320px] overflow-y-auto bg-white">
                                    <p className="text-sm font-medium text-gray-900 mb-3">
                                        4 Projects Selected
                                    </p>

                                    {modalProjectsData.map((proj, i) => {
                                        const modalDropdownKey = `modal-${i}`;
                                        const isModalOpen = openDropdowns[modalDropdownKey];
                                        const currentRole = modalProjectRoles[i] || proj.role;

                                        return (
                                            <div
                                                key={i}
                                                className="flex items-center justify-between rounded-lg px-4 py-2 hover:bg-gray-50 transition-all duration-150"
                                            >
                                                <div className="flex items-start gap-3 w-[20%]">
                                                    <input
                                                        type="checkbox"
                                                        checked
                                                        readOnly
                                                        className="accent-[#344EA0] mt-1"
                                                    />

                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-sm text-gray-800">{proj.name}</p>
                                                            {proj.tag && (
                                                                <span className="text-xs bg-[#F3F4F6] w-[100px] text-gray-700 px-2 py-0.5 rounded-md border border-gray-300">
                                                                    {proj.tag}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {proj.id && (
                                                            <p className="text-xs text-gray-500 mt-0.5">ID: {proj.id}</p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="relative permission-dropdown">
                                                    <div
                                                        onClick={() => toggleDropdown(modalDropdownKey)}
                                                        className="w-[120px] border border-gray-300 bg-white rounded px-3 py-1.5 text-sm flex justify-between items-center cursor-pointer hover:border-[#344EA0]"
                                                    >
                                                        <span className="text-gray-900">{currentRole}</span>
                                                        <ChevronDown
                                                            size={14}
                                                            className={`text-gray-500 transition-transform ${isModalOpen ? 'rotate-180' : ''}`}
                                                        />
                                                    </div>

                                                    {isModalOpen && (
                                                        <div className="absolute right-0 z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                                                            {['Edit', 'View', 'Admin'].map((option) => (
                                                                <div
                                                                    key={option}
                                                                    onClick={() => {
                                                                        setModalProjectRoles(prev => ({
                                                                            ...prev,
                                                                            [i]: option
                                                                        }));
                                                                        toggleDropdown(modalDropdownKey);
                                                                    }}
                                                                    className="px-3 py-2 text-sm text-gray-700 hover:bg-[#f3f6ff] hover:text-[#344EA0] cursor-pointer transition-all"
                                                                >
                                                                    {option}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                            </div>
                        </div>


                        {/* Footer */}
                        <div className="flex justify-end gap-3 border-t bg-gray-50 px-6 py-3">
                            <button
                                onClick={() => setShowAddProjectModal(false)}
                                className="border border-gray-300 rounded px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button className="bg-[#344EA0] text-white rounded px-4 py-2 text-sm hover:bg-[#2c3a8a]">
                                Add Project
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Sidebar>
    );
};

export default SubUserAdmin;