import React, { useState } from "react";
import { Link } from "react-router";
import { ChevronDown } from "lucide-react";

const MyAccountAdmin = () => {
    const [activeTab, setActiveTab] = useState("profile");
    const [selectedRole, setSelectedRole] = useState("Choose");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const roles = ["Super Admin", "Admin", "User"];

    return (
        <>
            <div className="flex items-center justify-between">
                <nav className="mb-2 text-sm p-2 pt-4">
                    <Link
                        style={{ textDecoration: "none" }}
                        to="/myAccount"
                        className="text-gray-500"
                    >
                        Account Settings
                    </Link>{" "}
                    / <span className="text-[#6B7280]">My Account</span>
                </nav>
            </div>

            <div className="min-h-screen bg-white text-gray-800">
                <div className="relative">
                    <img
                        src="https://profileicons-development.zohostratus.in/71afdf4289ea7ca49e9e5994d1e1bfda637b5de8.jpg"
                        alt="Background"
                        className="w-full h-48 object-cover rounded-b-2xl"
                    />
                    <button className="absolute top-3 right-3 text-sm bg-white text-gray-800 px-3 py-1 rounded-md shadow hover:bg-gray-100">
                        Change Background
                    </button>

                    <div className="absolute -bottom-12 left-6 flex items-center space-x-4">
                        <img
                            src="https://profileicons-development.zohostratus.in/7fdcb712d245fafc11b2360efadd3ba1a94350db.jpg"
                            alt="Profile"
                            className="w-24 h-24 rounded-full border-4 border-white shadow-md"
                        />
                        <div className="flex mt-5">
                            <h2 className="text-xl font-semibold">Ikramul Karim</h2>
                            <span className="text-xs bg-white text-black border-2 border-[#D1D5DB] py-2 p-2 ml-6 rounded-md">
                                Super Admin
                            </span>
                        </div>
                    </div>
                </div>

                <div className="pt-16 px-6 border-b w-[750px] border-gray-300">
                    <div className="flex space-x-6 text-sm font-medium">
                        {[
                            { id: "profile", label: "Profile Details" },
                            { id: "organization", label: "Organization details" },
                            { id: "password", label: "Change Password" },
                            // { id: "delete", label: "Delete Account" },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`pb-2 ${
                                    activeTab === tab.id
                                        ? "text-[#344EA0] border-b-2 border-[#344EA0]"
                                        : "text-gray-500 hover:text-gray-800"
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

              
                {activeTab === "profile" && (
                    <div className="p-6">
                        <form className="max-w-3xl bg-white rounded-xl p-6 space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter First Name"
                                        className="mt-1 w-full border border-[#D1D5DB] bg-white rounded-md p-2 focus:ring-2 focus:ring-[#344EA0] focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter Last Name"
                                        className="mt-1 w-full border border-gray-300 bg-white rounded-md p-2 focus:ring-2 focus:ring-[#344EA0] focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600">
                                    Work Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    placeholder="Enter Organisation Email ID"
                                    className="mt-1 w-full border border-gray-300 bg-white rounded-md p-2 focus:ring-2 focus:ring-[#344EA0] focus:outline-none"
                                />
                            </div>

                            {/* ✅ Custom Dropdown */}
                            <div style={{ width: "350px" }}>
                                <label className="block text-sm font-medium text-gray-600">
                                    Role <span className="text-red-500">*</span>
                                </label>

                                <div className="relative mt-1">
                                    <div
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="w-full border border-gray-300 bg-white rounded-md p-2 flex justify-between items-center cursor-pointer hover:border-[#344EA0] transition-all duration-200"
                                    >
                                        <span
                                            className={`text-sm ${
                                                selectedRole === "Choose"
                                                    ? "text-gray-400"
                                                    : "text-gray-900"
                                            }`}
                                        >
                                            {selectedRole}
                                        </span>
                                        <ChevronDown
                                            className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                                                isDropdownOpen ? "rotate-180" : ""
                                            }`}
                                        />
                                    </div>

                                    {isDropdownOpen && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                                            {roles.map((role) => (
                                                <div
                                                    key={role}
                                                    onClick={() => {
                                                        setSelectedRole(role);
                                                        setIsDropdownOpen(false);
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

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    className="bg-[#344EA0] text-white px-4 py-2 rounded-md hover:bg-[#2c3a8a] transition"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {activeTab === "organization" && (
                    <div className="p-6">
                        <form className="max-w-3xl bg-white rounded-xl p-6 space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">
                                        Company Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter Company Name"
                                        className="mt-1 w-full border border-[#D1D5DB] bg-white rounded-md p-2 focus:ring-2 focus:ring-[#344EA0] focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">
                                        Company Website
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter Company Website"
                                        className="mt-1 w-full border border-gray-300 bg-white rounded-md p-2 focus:ring-2 focus:ring-[#344EA0] focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">
                                        Contact Email
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter Company Email"
                                        className="mt-1 w-full border border-[#D1D5DB] bg-white rounded-md p-2 focus:ring-2 focus:ring-[#344EA0] focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">
                                        Company Mobile
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter Company Mobile"
                                        className="mt-1 w-full border border-gray-300 bg-white rounded-md p-2 focus:ring-2 focus:ring-[#344EA0] focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600">
                                    Address <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    placeholder="Enter Address"
                                    className="mt-1 w-full border border-gray-300 bg-white rounded-md p-2 focus:ring-2 focus:ring-[#344EA0] focus:outline-none"
                                />
                            </div>



                             <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">
                                        Country
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter Company Email"
                                        className="mt-1 w-full border border-[#D1D5DB] bg-white rounded-md p-2 focus:ring-2 focus:ring-[#344EA0] focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">
                                        State
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter Company Mobile"
                                        className="mt-1 w-full border border-gray-300 bg-white rounded-md p-2 focus:ring-2 focus:ring-[#344EA0] focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">
                                       Pincode
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter Company Mobile"
                                        className="mt-1 w-full border border-gray-300 bg-white rounded-md p-2 focus:ring-2 focus:ring-[#344EA0] focus:outline-none"
                                    />
                                </div>
                            </div>

                           
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    className="bg-[#344EA0] text-white px-4 py-2 rounded-md hover:bg-[#2c3a8a] transition"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {activeTab === "password" && (
                    <div className="p-6">
                        <form className="max-w-3xl bg-white rounded-xl p-6 space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-1 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">
                                        Current Password
                                    </label>
                                    <input
                                        type="password"
                                        placeholder="Enter Current Password"
                                        className="mt-1 w-full border border-[#D1D5DB] bg-white rounded-md p-2 focus:ring-2 focus:ring-[#344EA0] focus:outline-none"
                                    />
                                </div>
                               
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-1 gap-5">

                                <div>
                                    <label className="block text-sm font-medium text-gray-600">
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        placeholder="Enter New Password"
                                        className="mt-1 w-full border border-gray-300 bg-white rounded-md p-2 focus:ring-2 focus:ring-[#344EA0] focus:outline-none"
                                    />
                                </div>
                            </div>


                             <div className="grid grid-cols-1 sm:grid-cols-1 gap-5">

                                <div>
                                    <label className="block text-sm font-medium text-gray-600">
                                        Re-enter New Password
                                    </label>
                                    <input
                                        type="password"
                                        placeholder="Re-enter New Password"
                                        className="mt-1 w-full border border-gray-300 bg-white rounded-md p-2 focus:ring-2 focus:ring-[#344EA0] focus:outline-none"
                                    />
                                </div>
                            </div>

                         

                           
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    className="bg-[#344EA0] text-white px-4 py-2 rounded-md hover:bg-[#2c3a8a] transition"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </>
    );
};

export default MyAccountAdmin;
