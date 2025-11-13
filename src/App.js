import React, { useState, useEffect } from "react";
import { Routes, Route, HashRouter, BrowserRouter } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import DashboardPage from "./pages/DashboardPage";
import Signup from "./pages/Signup";
import { LogDetails } from "./components/LogDetails/LogDetails";
import LogDetailsPage from "./pages/LogDetailsPage";
import { useDispatch } from "react-redux";
import { addUser } from "./redux/actions/userAction";
import ProfilePage from "./pages/ProfilePage";
import Enquiry from "./pages/Enquiry";
import { Profiledetails } from "./pages/Profiledetails";
import Project from "./pages/Project";
import MileStone from "./pages/MileStone";
import Invoice from "./pages/Invoice";
import ViewEnquiryPage from "./pages/ViewEnquiryPage";
import BundlePage from "./pages/BundlePage";
import PlanTablePage from "./pages/PlanTablePage";
import Profiledatailspages from "./pages/ProfiledetailsPages";
import ProfileVerifyPage from "./pages/ProfileVerifyPage";
import { BundleFormPage } from "./pages/BundleFormPage";
import { ProjectView } from "./components/ProjectView";
import FormBuilderPage from "./pages/FormBuilderPage";
import Sales_detailspages from "./pages/Sales_detailspages";
import Access_viewpages from "./pages/Access_viewpages";
import { Bundeltab } from "./components/Bundletab";
import { useNavigate } from "react-router-dom";
import ScreenSettings from "./pages/ScreenSettings";
import { setUserPermission } from "./redux/actions/userpermission";
import { useSelector } from "react-redux";
import Projectdates from "./pages/Projectsdates";
import Dashboarddetails from "./pages/Dashboarddetail";
import Userprojectstatus from "./components/Userprojectstatus";
import UsersList from "./components/UsersList";
import MyAccount from "./pages/MyAccount";
import SubUserAdmin from "./pages/SubUserAdmin";
import UserControl from "./pages/UserControl";
import ProjectAccess from "./pages/ProjectAccess";
import AccountSettings from "./pages/AccountSettings";
import Userprojectsstatus from "./pages/Userprojectstatus";
import RolesAdmin from "./pages/RolesAdmin";
import SubUserAdmins from "./pages/SubUserAdmins";


const AuthWrapper = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userDetails, setUserDetails] = useState({ email_id: "" });


  const navigate = useNavigate();

  const dispatch = useDispatch();

  useEffect(() => {
    const authenticateUser = async () => {
      try {
        const authResult = await window.catalyst.auth.isUserAuthenticated();
        console.log("result", authResult.content);

        dispatch(addUser(authResult.content));
        if (!sessionStorage.getItem("userRole")) {
          const username = authResult.content.email_id;
          const firstName = authResult.content.first_name;
          const lastName = authResult.content.last_name;
          const userManagement = window.catalyst.userManagement;
          const currentUserResponse =
            await userManagement.getCurrentProjectUser();

          console.log("response", currentUserResponse);

          const userRole = currentUserResponse.content.role_details.role_name;
          const roleId = currentUserResponse.content.role_details.role_id;
          const userId = currentUserResponse.content.user_id;
          const email = currentUserResponse.content.email_id;
          sessionStorage.setItem("userRole", userRole);
          sessionStorage.setItem("roleId", roleId);
          sessionStorage.setItem("userId", userId);
          sessionStorage.setItem("email", email);
          sessionStorage.setItem("first_name", firstName);
          sessionStorage.setItem("lastname", lastName);
          // const tokenResponse = await fetch(
          //   "https://appsail-10083322628.development.catalystappsail.com/api/login",
          //   {
          //     method: "POST",
          //     headers: {
          //       "Content-Type": "application/json",
          //     },
          //     body: JSON.stringify({
          //       email: username,
          //       first_name: firstName,
          //       last_name: lastName,
          //     }),
          //   }
          // );
          // const tokenData = await tokenResponse.json();
          // console.log("response", tokenData);

          // sessionStorage.setItem("token", tokenData.TOKEN);

          // await Promise.all(sessionPromises);
          if (window.location.pathname !== "/dashboard") {
            window.location.href = "/#/dashboard";
          }
        }
      } catch (error) {
        console.error("Authentication error", error);
      } finally {
        window.catalyst.auth
          .isUserAuthenticated()
          .then((result) => {
            console.log("Authentication result:", result);

            const username = result.content.email_id;
            const firstName = result.content.first_name;
            const lastName = result.content.last_name;
            sessionStorage.setItem("email", username);
            sessionStorage.setItem("first_name", firstName);
            sessionStorage.setItem("last_name", lastName);
            setUserDetails({
              email_id: username,
              fName: firstName,
              lName: lastName,
            });
            setIsAuthenticated(true);
            console.log("FOUND USER??? ---> ", isAuthenticated);
          })
          .catch(() => {
            console.warn("auth errorr");
            setIsAuthenticated(false);

            if (!isAuthenticated) {
              navigate("/");
            }
          });

        console.log("FINALLYYY BLOCK IS USER AUTHENTICATED: ", isAuthenticated);
      }
    };
    if (!sessionStorage.getItem("token")) {
      authenticateUser();
    }
  }, [navigate]);

  // useEffect(() => {
  //   window.catalyst.auth
  //     .isUserAuthenticated()
  //     .then((result) => {
  //       console.log("Authentication result:", result);

  //       const username = result.content.email_id;
  //       const firstName = result.content.first_name;
  //       const lastName = result.content.last_name;

  //       setUserDetails({
  //         email_id: username,
  //         fName: firstName,
  //         lName: lastName,
  //       });
  //         setIsAuthenticated(true);

  //     })
  //     .catch(() => {
  //       console.log("auth errorr")
  //       setIsAuthenticated(false);

  //       if (!isAuthenticated) {
  //         navigate("/");
  //       }
  //     })
  //     // .finally(() => {
  //     //   console.log("FINALLY BLOCK IS USER AUTHENTICATED: ",isAuthenticated)

  //     //   setLoading(false);
  //     //   if (!isAuthenticated) {
  //     //     navigate("/");
  //     //   }
  //     // });
  // }, []);

  return null;
};

function App() {

  const role_id = useSelector((state) => state.user.role_details.role_id);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUserPermission = async () => {
      try {
        const res = await fetch(`/server/usermanagement/user-permission/${role_id}`);
        const data = await res.json();
        console.log("showres", res);
        console.log("Fetched permission data:", data);
        dispatch(setUserPermission(data));
      } catch (err) {
        console.error("Failed to fetch user details:", err);
      }
    };

    if (role_id) {
      fetchUserPermission();
    }
  }, [role_id, dispatch]);

  return (
    <HashRouter>
      {/* <AuthHandler /> */}
      <AuthWrapper />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        {/* <Route path="/dashboard" element={<DashboardPage />} /> */}
        <Route path="/enquiry" element={<Enquiry />} />
        <Route path="/milestone" element={<MileStone />} />
        <Route path="/enquiry/viewEnquiry" element={<ViewEnquiryPage />} />
        <Route path="/profile" element={<Profiledatailspages />} />
        <Route path="/project" element={<Project />} />
        <Route path="/invoice" element={<Invoice />} />
        <Route path="/profilepage" element={<ProfilePage />} />
        <Route path="/bundlePage" element={<BundlePage />} />
        <Route path="/viewPlans" element={<PlanTablePage />} />
        <Route path="/logDetails" element={<LogDetailsPage />} />
        <Route path="/verfiyProfile" element={<ProfileVerifyPage />} />
        {/* <Route path="/bundleform" element={<BundleFormPage />} /> */}
        <Route path="/formBuilder" element={<FormBuilderPage />} />
        <Route path="/projectview" element={<ProjectView />} />
        <Route path="/sales-details" element={<Sales_detailspages />} />
        <Route path="/accesspages" element={<Access_viewpages />} />
        <Route path="/bundeltab" element={<Bundeltab />} />
        <Route path="/screening" element={<ScreenSettings />} />
        <Route path="/myAccount" element={<MyAccount />} />
        <Route path="/sub-user-details" element={<SubUserAdmin />} />
        <Route path="/sub-user" element={<SubUserAdmins />} />
        <Route path="/userControl" element={<UserControl />} />
        <Route path="/role-admin" element={<RolesAdmin />} />
        <Route path="/projectAccess" element={<ProjectAccess />} />
        <Route path="/myAccountsettings" element={<AccountSettings />} />
        <Route path="/projectslogs" element={<Projectdates />} />
        <Route path="/dashboard" element={<Dashboarddetails />} />
        <Route path="/userproject" element={<Userprojectsstatus />} />
        <Route path="/users" element={<UsersList />} />
      </Routes>
    </HashRouter>
  );
}

function AuthHandler() {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  useEffect(() => {
    const authenticateUser = async () => {
      try {
        if (!window.catalyst || !window.catalyst.auth) {
          console.error("Catalyst SDK is not available");
          return;
        }
        const authResult = await window.catalyst.auth.isUserAuthenticated();
        console.log("result", authResult);
        dispatch(addUser(authResult.content));

        if (!sessionStorage.getItem("userRole")) {
          const username = authResult.content.email_id;
          const firstName = authResult.content.first_name;
          const lastName = authResult.content.last_name;

          const userManagement = window.catalyst.userManagement;
          const currentUserResponse = await userManagement.getCurrentProjectUser();
          console.log("response", currentUserResponse);



          const userRole = currentUserResponse.content.role_details.role_name;
          const roleId = currentUserResponse.content.role_details.role_id;
          const userId = currentUserResponse.content.user_id;
          const email = currentUserResponse.content.email_id;

          sessionStorage.setItem("userRole", userRole);
          sessionStorage.setItem("roleId", roleId);
          sessionStorage.setItem("userId", userId);
          sessionStorage.setItem("email", email);
          sessionStorage.setItem("first_name", firstName);
          sessionStorage.setItem("lastname", lastName);

          // const tokenResponse = await fetch(
          //   "https://appsail-10083322628.development.catalystappsail.com/api/login",
          //   {
          //     method: "POST",
          //     headers: {
          //       "Content-Type": "application/json",
          //     },
          //     body: JSON.stringify({
          //       email: username,
          //       first_name: firstName,
          //       last_name: lastName,
          //     }),
          //   }
          // );
          // const tokenData = await tokenResponse.json();
          // console.log("response", tokenData);
          // sessionStorage.setItem("token", tokenData.TOKEN);

          if (window.location.pathname !== "#/dashboard") {
            window.location.href = "/#/dashboard";
          }
        }
      } catch (error) {
        console.error("Authentication error", error);
      } finally {
        setLoading(false);
      }
    };
    authenticateUser();
    // if (!sessionStorage.getItem("token")) {
    //   authenticateUser();
    // } else {
    //   setLoading(false);
    // }
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        {/* <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-red-500 border-solid"></div> */}
      </div>
    );
  }

  return null;
}

export default App;
