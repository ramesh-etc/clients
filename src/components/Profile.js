import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { Link } from "react-router-dom";
import Loader from "./Loader";

function Profile() {
  const [formData, setFormData] = useState({
    email_id: "",
    first_name: "",
    last_name: "",
  });
  const isSidebarShrunk = useSelector((state) => state.sidebar.isSidebarShrunk);
  const user = useSelector((state) => state.user);
  const [loading, setLoading] = useState(true);

  const [url, setUrl] = useState("");
  const [email, setEmail] = useState([]);
  const [phonenumber, setPhonenumber] = useState([]);
  const [address, setAddress] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        email_id: user.email_id,
        first_name: user.first_name,
        last_name: user.last_name,
      });
    }
  }, [user]);

  const handleReset = (e) => {
    e.preventDefault();
    console.log(formData);

    axios.post("/server/resetpassword/reset", formData).then((res) => {
      console.log(res);
      alert("hi", res.responce);
    });
  };

  const handleSearch = async () => {
    try {
      setLoadingData(true);
      const response = await fetch(
        `https://web-scraper-60025258148.development.catalystserverless.in/server/collect-data/scrape-tech?url=${encodeURIComponent(
          url
        )}`
      );
      const data = await response.json();
      setEmail(data.email || []);
      setPhonenumber(data.phonenumber || []);
      setAddress(data.address || []);
      setShowPopup(true);
    } catch (error) {
      console.error("Error fetching contact data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 3000);
  }, []);

  //   const logout = useCallback(() => {
  //   window.catalyst.auth.signOut("/");
  //     }, []);

  return (
    <>
      <div className="flex flex-col md:flex-row">
        <div className="p-8 pt-3 w-full">
          <nav class="flex mb-5" aria-label="Breadcrumb">
            <ol class="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse  !pl-0">
              <li class="inline-flex items-center">
                <Link
                  to="/dashboard"
                  className="ms-1 text-[14px] text-gray-400  md:ms-2 dark:text-gray-400 dark:hover:text-gray-500"
                >
                  Dashboard
                </Link>
              </li>
              <li aria-current="page">
                <div class="flex items-center">
                  <svg
                    class="rtl:rotate-180 w-2 h-2.5 mx-1 text-gray-400 text-[14px]"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewdiv="0 0 6 10"
                  >
                    <path
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="m1 9 4-4-4-4"
                    />
                  </svg>
                  <span class="inline-flex items-center text-[14px]  text-[#DC2626]">
                    Profile
                  </span>
                </div>
              </li>
            </ol>
          </nav>
          {loading ? (
            <div className="flex items-center justify-center h-[80vh] top-0">
              <Loader />
            </div>
          ) : (
            <div className="flex justify-center items-center mt-10 sm:mt-16 md:mt-24 lg:mt-40 px-4">
              <div className="w-full max-w-4xl p-4 bg-white border rounded-md shadow-md">
                <form onSubmit={handleReset}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="block text-sm font-medium text-red-600 dark:text-white text-center p-4 sm:text-left">
                      Your Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                        <svg
                          className="w-4 h-4 text-gray-500"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="currentColor"
                          viewBox="0 0 20 16"
                        >
                          <path d="m10.036 8.278 9.258-7.79A1.979 1.979 0 0 0 18 0H2A1.987 1.987 0 0 0 .641.541l9.395 7.737Z" />
                          <path d="M11.241 9.817c-.36.275-.801.425-1.255.427-.428 0-.845-.138-1.187-.395L0 2.6V14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2.5l-8.759 7.317Z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        id="email-address-icon"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full ps-10 p-2.5"
                        value={formData.email_id}
                        disabled
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <label className="block text-sm font-medium text-red-600 text-center p-4 sm:text-left">
                      First Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                        <svg
                          className="w-4 h-4 text-gray-500"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        id="first-name-icon"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full ps-10 p-2.5"
                        placeholder="First Name"
                        value={formData.first_name}
                        disabled
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <label className="block text-sm font-medium text-red-600 text-center p-4 sm:text-left">
                      Last Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                        <svg
                          className="w-4 h-4 text-gray-500"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        id="last-name-icon"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full ps-10 p-2.5"
                        placeholder="Last Name"
                        value={formData.last_name}
                        disabled
                      />
                    </div>
                  </div>

                  <div className="text-center mt-6">
                    <button
                      type="submit"
                      className="bg-red-600 text-white p-2 rounded-md w-full sm:w-auto"
                    >
                      Reset Password
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
export default Profile;
