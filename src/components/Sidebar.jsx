import React, { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  Home,
  List,
  User,
  SquareUser,
  StickyNote,
  NotebookTabs,
  NotepadText,
  FileSpreadsheet,
  Logs,
  User2Icon,
  ScanEye,
  NotepadTextDashed,
  PanelsTopLeft,
  Bell,
  Users,
  LogOut,
  UserPen,
  Settings,
  ArrowRightFromLine,
  ArrowUpFromLine,
  LayoutDashboard,
  Folder,
  BriefcaseBusiness,
  Wallet,
  SquareUserRound
} from "lucide-react";
import profile from "../assets/Images/profile.png";
import userProfile from "../assets/Images/logo.svg";
import Open from "../assets/Images/elite.png";
import little from "../assets/Images/small_logo.png";
import ".././assets/css/PlanTable.css";
import ETCLogo from "../assets/Images/ETC-logo.png";
import smallogo from "../assets/Images/logo.svg";
import { setUserPermission } from "../redux/actions/userpermission";
import { ProfilePage } from "../pages/ProfilePage";
import profileAvatar from '../assets/Images/profileAva.jpg'

const Sidebar = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [profiledetails, setProfiledetails] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const isSidebarShrunk = useSelector((state) => state.sidebar.isSidebarShrunk);
  const user = useSelector((state) => state.user.role_details);
  const users = useSelector((state) => state.user.first_name);
  const last_name = useSelector((state) => state.user.last_name);
  const role_id = useSelector((state) => state.user.role_details.role_id);
  const rolepremission = useSelector((state) => state.userpermission);

  useEffect(() => {
    const fetchUserPermission = async () => {
      try {
        const res = await fetch(`/server/usermanagement/user-permission/${role_id}`);
        const data = await res.json();
        dispatch(setUserPermission(data));
      } catch (err) {
        console.error("Failed to fetch user details:", err);
      }
    };

    if (role_id) {
      fetchUserPermission();
    }
  }, [role_id, dispatch]);

  const [Arrow, setArrow] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const myAccountPaths = ['/myAccount', '/sub-user', '/userControl', '/role-admin','/sub-user-details'];
  const isMyAccountSection = myAccountPaths.some(path =>
    location.pathname === path ||
    location.hash === `#${path}` ||
    window.location.hash === `#${path}`
  );

  const hasPermissionForModule = (moduleLabel) => {
    const permissions = rolepremission?.permissiondata?.data;
    if (!permissions || !Array.isArray(permissions)) return false;

    return permissions.some((role) =>
      role.modules.some((module) => module.module === moduleLabel)
    );
  };

  const toggleSidebar = () => {
    dispatch({ type: "TOGGLE_SIDEBAR" });
  };

  const logout = useCallback(() => {
    sessionStorage.clear();
    window.catalyst.auth.signOut("/");
  }, []);

  const handleResize = () => {
    setIsMobile(window.innerWidth < 768);
    if (window.innerWidth >= 768) {
      setMobileOpen(false);
    }
  };

  const handleHome = () => {
    navigate('/dashboard');
  }

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handlemyAccount = () => {
    navigate('/myAccount');
  }


  const isActive = (path) => {
    const currentPath = location.pathname;
    return (
      currentPath === path ||
      (path === "/project" && currentPath === "/milestone") ||
      (path === "/project" && currentPath === "/projectview") ||
      (path === "/enquiry" && currentPath === "/enquiry/viewEnquiry") ||
      (path === "/bundlePage" && currentPath === "/viewPlans")
    );
  };

  const mainMenuLinks = [
    { path: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={24} className="text-[#6B7280]" /> },
    { path: "/bundlePage", label: "Bundle Solutions", icon: <Folder size={24} className="text-[#6B7280]" /> },
    { path: "/enquiry", label: "Enquiry", icon: <User size={24} className="text-[#6B7280]" /> },
    { path: "/project", label: "Project Details", icon: <BriefcaseBusiness size={24} className="text-[#6B7280]" /> },
    { path: "/invoice", label: "Invoice Details", icon: <Wallet size={24} className="text-[#6B7280]" /> },
    { path: "/LogDetails", label: "Logs", icon: <Logs size={24} className="text-[#6B7280]" /> },
    { path: "/screening", label: "Screen Settings", icon: <ScanEye size={24} className="text-[#6B7280]" /> },
    { path: "/profile", label: "Profile", icon: <User size={24} className="text-[#6B7280]" /> },
    { path: "/users", label: "User Management", icon: <Users size={24} className="text-[#6B7280]" /> },
  ];

  const overallUpdatesLinks = [
    { path: "/projectslogs", label: "Project Log", icon: <NotepadTextDashed size={24} className="text-[#6B7280]" /> },
    { path: "/userproject", label: "User Projects Status", icon: <SquareUserRound size={24} className="text-[#6B7280]" /> },
  ];

  const myAccountSidebarLinks = [
    { path: "/myAccount", label: "My Account", icon: <User size={24} className="text-[#6B7280]" />, skipPermission: true },
    { path: "/sub-user", label: "Sub Users", icon: <img src="https://svgicons-development.zohostratus.in/SubUsers.svg" />, skipPermission: true },
    { path: "/userControl", label: "Profile", icon: <img src="https://svgicons-development.zohostratus.in/userControls.svg" />, skipPermission: true },
    { path: "/role-admin", label: "Role", icon: <img src="https://svgicons-development.zohostratus.in/userControls.svg" />, skipPermission: true }
  ]

  const filterLinks = (links) => {
    return links.filter((link) => {
      if (link.skipPermission) return true;
      return hasPermissionForModule(link.label) && (link.condition === undefined || link.condition);
    });
  };

  const filteredMainMenu = filterLinks(mainMenuLinks);
  const filteredOverallUpdates = filterLinks(overallUpdatesLinks);


  return (
    <div className="flex min-h-screen bg-gray-100">
      <div
        className={`fixed top-0 left-0 bottom-0 flex flex-col border bg-white transition-all duration-300 ease-in-out z-50
        ${isMobile ? (mobileOpen ? "translate-x-0" : "-translate-x-full") : ""} 
        ${isMobile ? "w-full" : isSidebarShrunk ? "w-[80px] md:w-[90px]" : "w-[200px] md:w-[270px]"}`}
      >
        <div className="p-4 flex items-center justify-between bg-white border h-[73px] transition-all duration-300 ease-in-out">
          <div className="flex items-center transition-all duration-300 ease-in-out">
            {isSidebarShrunk && !isMobile ? (
              <img src={smallogo} alt="Logo" className="h-50 w-100 transition-all duration-300 ease-in-out" />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <img onClick={handleHome} src={smallogo} alt="Logo" className="h-20 transition-all duration-300 ease-in-out p-3 max-sm:h-20 max-sm:p-10 max-sm:w-[20px] cursor-pointer" />
                <p onClick={handleHome} style={{ fontSize: '18px', margin: '0', padding: "0", fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter' }}>Elite Tech Corp</p>
              </div>
            )}
            <button className="md:hidden text-black transition-opacity duration-300 ease-in-out" onClick={() => setMobileOpen(false)}>
              ✕
            </button>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto " onClick={() => setMobileOpen(false)}>
  
          {!isMyAccountSection && (
            <>
              {(!isSidebarShrunk || isMobile) && (
                <div className="px-6 pb-1 pt-1">
                  <span className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider font-[Inter]">Menu</span>
                </div>
              )}
              <ul className="mt-2 p-1">
                {filteredMainMenu.map(({ path, label, icon }) => (
                  <li
                    key={path}
                    className={`flex items-center cursor-pointer mt-2 rounded-lg text-[18px] transition-all ${isActive(path) ? "bg-[#E5E7EB] text-black" : "hover:bg-gray-200 text-black"
                      } ${isSidebarShrunk && !isMobile ? "justify-center px-2 py-3 mx-2" : "px-6 py-2"}`}
                    onClick={() => handleNavigate(path)}
                  >
                    {isSidebarShrunk && !isMobile ? (
                      icon
                    ) : (
                      <>
                        {icon}
                        <span className="ml-3 text-[16px]">{label}</span>
                        <span className="ml-auto text-gray-500">&#10095;</span>
                      </>
                    )}
                  </li>
                ))}
              </ul>
              {/* Overall */}
              {filteredOverallUpdates.length > 0 && (
                <>
                  {(!isSidebarShrunk || isMobile) && (
                    <div className="px-6 pb-1 pt-2">
                      <span className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider font-[Inter]">Overall Updates</span>
                    </div>
                  )}
                  {(isSidebarShrunk && !isMobile) && (
                    <div className="border-t border-gray-300 my-4 mx-2"></div>
                  )}
                  <ul className="mt-2 p-1">
                    {filteredOverallUpdates.map(({ path, label, icon }) => (
                      <li
                        key={path}
                        className={`flex items-center cursor-pointer mt-2 rounded-lg text-[18px] transition-all ${isActive(path) ? "bg-[#E5E7EB] text-black" : "hover:bg-gray-200 text-black"
                          } ${isSidebarShrunk && !isMobile ? "justify-center px-2 py-3 " : "px-6 py-2"}`}
                        onClick={() => handleNavigate(path)}
                      >
                        {isSidebarShrunk && !isMobile ? (
                          icon
                        ) : (
                          <>
                            {icon}
                            <span className="ml-3 text-[16px] font-[Inter]">{label}</span>
                            <span className="ml-auto text-gray-500">&#10095;</span>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </>
          )}

         {isMyAccountSection && (
  <>

    {/* ACCOUNT SETTINGS LABEL */}
    {(!isSidebarShrunk || isMobile) && (
      <div className="px-6 pb-0 pt-2">
        <span className="text-[12px] ml-5 font-semibold text-gray-500 uppercase tracking-wider font-[Inter]">
          Account Settings
        </span>
      </div>
    )}

    {/* ✅ GROUP 1 : My Account + Sub Users */}
    <ul className="mt-3">
      {filterLinks(myAccountSidebarLinks)
        .filter(item => item.label === "My Account" || item.label === "Sub Users")
        .map(({ path, label, icon }) => (
          <li
            key={path}
            className={`flex items-center py-3 cursor-pointer mt-2 rounded-lg text-[18px] transition-all ${
              isActive(path) ? "bg-[#E5E7EB] text-black" : "hover:bg-gray-200 text-black"
            } ${isSidebarShrunk && !isMobile ? "justify-center px-2" : "px-6"}`}
            onClick={() => handleNavigate(path)}
          >
            {icon}
            {(!isSidebarShrunk || isMobile) && (
              <span className="ml-3 text-[16px]">{label}</span>
            )}
            {(!isSidebarShrunk || isMobile) && (
              <span className="ml-auto text-gray-500">&#10095;</span>
            )}
          </li>
        ))}
    </ul>


    {(!isSidebarShrunk || isMobile) && (
      <div className="px-6 pb-0 pt-1">
        <span className="text-[12px] ml-5 font-semibold text-gray-500 uppercase tracking-wider font-[Inter]">
        Security Control
        </span>
      </div>
    )}

    <ul className="mt-3">
      {filterLinks(myAccountSidebarLinks)
        .filter(item => item.label === "Profile" || item.label === "Role")
        .map(({ path, label, icon }) => (
          <li
            key={path}
            className={`flex items-center py-3 cursor-pointer mt-2 rounded-lg text-[18px] transition-all ${
              isActive(path) ? "bg-[#E5E7EB] text-black" : "hover:bg-gray-200 text-black"
            } ${isSidebarShrunk && !isMobile ? "justify-center px-2" : "px-6"}`}
            onClick={() => handleNavigate(path)}
          >
            {icon}
            {(!isSidebarShrunk || isMobile) && (
              <span className="ml-3 text-[16px]">{label}</span>
            )}
            {(!isSidebarShrunk || isMobile) && (
              <span className="ml-auto text-gray-500">&#10095;</span>
            )}
          </li>
        ))}
    </ul>

  </>
)}





        </div>

        <div className="relative">
          <div
            className="flex items-center py-2 px-3 cursor-pointer border-t border-gray-300 hover:bg-gray-200 transition-all"
            onClick={() => {
              setShowDropdown(!showDropdown);
              setArrow(!Arrow);
            }}
          >
            <img src={userProfile} alt="Profile" className="w-10 h-10 rounded-full border border-gray-400 p-1" />
            {(!isSidebarShrunk || isMobile) && <span className="ml-3 text-[18px] font-[Inter] truncate">{users}</span>}
            {(!isSidebarShrunk || isMobile) && (!showDropdown ? <ArrowRightFromLine className="ml-auto" /> : <ArrowUpFromLine className="ml-auto" />)}
          </div>

          {showDropdown && (
            <div className={`absolute bottom-full bg-white border rounded-md z-50 ${isSidebarShrunk && !isMobile ? 'w-auto' : 'w-full'}`}>
              <ul>
                <li
                  className={`flex items-center text-gray-700 hover:bg-gray-100 cursor-pointer ${isSidebarShrunk && !isMobile ? 'px-3 py-2 w-full' : 'px-2 py-2 mr-[20px] w-full'
                    }`}
                  onClick={logout}
                >
                  <LogOut className={isSidebarShrunk && !isMobile ? '' : 'mr-3'} size={20} />
                  {(!isSidebarShrunk || isMobile) && <span className="font-[Inter]">Logout</span>}
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      <div
        className={`flex-grow transition-all duration-300 ${isMobile ? (mobileOpen ? "ml-[250px]" : "ml-0") : isSidebarShrunk ? "ml-[90px]" : "ml-[250px]"
          }`}
      >
        <div
          className={`fixed top-0 left-0 right-0 h-[73px] flex justify-between items-center px-4 bg-white border z-40 ${isMobile ? "" : isSidebarShrunk ? "ml-[90px]" : "ml-[250px]"
            }`}
        >
          <div className="flex justify-between">
            <button
              onClick={() => {
                if (isMobile) {
                  setMobileOpen(true);
                } else {
                  toggleSidebar();
                }
              }}
              className="text-black text-xl flex ml-3"
            >
              <PanelsTopLeft style={{ color: '#6B7280' }} className="text-md me-2" />
            </button>
          </div>

          <div className="flex gap-3 items-center">
            <img style={{ border: '1px solid', padding: '2px' }} src={profileAvatar} className="w-[30px] h-[30px] rounded-full" alt="Profile" />
            <h3 onClick={handlemyAccount} className="text-[14px] font-[Inter] mt-2 cursor-pointer hover:text-blue-600">{users}</h3>
            <div className="relative">
              <Bell className="border rounded-full p-2 w-[40px] h-[40px] cursor-pointer hover:bg-gray-100" />
              <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                5
              </span>
            </div>
          </div>
        </div>
        <div className="pt-20 bg-[#ffffff] min-w-full overflow-x-hidden px-4 bundlePage">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;