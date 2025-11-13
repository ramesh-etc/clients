import React, { useEffect, useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import PhoneInput from "react-phone-number-input";
import "./Profile_details.css";
import { Country, State } from 'country-state-city';
import "react-phone-number-input/style.css";
import Loader from "./Loader";
import SalesIqBot from "./SalesIqBot";
import {
  User,
  Mail,
  Phone,
  Building,
  ClipboardType,
  Laptop,
  NotebookTabs,
  ClipboardList,
  X,
} from "lucide-react";

export const Profile_details = () => {
  const { id } = useParams();
  const isSidebarShrunk = useSelector((state) => state.sidebar.isSidebarShrunk);
  const [loading, setLoading] = useState(true);
  const [webloading, setwebLoading] = useState(false);
  const [userdatas, setUserDatas] = useState({});
  const [otpEmailVisible, setOtpEmailVisible] = useState(false);
  const [otpPhoneVisible, setOtpPhoneVisible] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");
  const [otpPhone, setOtpPhone] = useState("");
  const [phoneNumber, setPhoneNumber] = useState(userdatas?.phone || "");
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm();
  const [data, setData] = useState([]);
  // const mail = useSelector((state) => state.user)?.email_id;
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [email, setEmail] = useState([]);
  const [webphonenumber, setwebPhonenumber] = useState([]);
  const [address, setAddress] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [website, setWebsite] = useState(userdatas?.company_website || "");
  const [companyInfo, setCompanyInfo] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const mail = sessionStorage.getItem("email");
  const [profile, setProfile] = useState(null);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const selectedCountry = watch("country");

  console.log("Mail:", mail);
  const rolepremission = useSelector((state) => state.userpermission)
  console.log("showuserpermission", rolepremission);
  const permissions = rolepremission?.permissiondata?.data || [];
  const role_name = permissions[0]?.roleName || sessionStorage.getItem("userRole");
  console.log("First Permission Check:", permissions[0]?.roleName);
  const hasPermission = (moduleName, componentName) => {
    const permissions = rolepremission?.permissiondata?.data || [];


    for (const role of permissions) {
      for (const module of role.modules) {
        if (module.module === moduleName) {
          for (const component of module.components) {
            const permissionArray = component.permissions.flatMap(p =>
              p.split(',').map(str => str.trim())
            );

            if (component.name === componentName && permissionArray.includes("View")) {
              return true;
            }
          }
        }
      }
    }

    return false;
  };

  const onSubmit = async (formData) => {
    console.log("Form Submitted", formData);
    try {
      const response = await axios.post(
        "/server/enquiries/profile/portal",
        formData
      );
      console.log("Update Response:", response.data);

      toast.success("Profile Submitted Successfully");
    } catch (error) {
      console.error(
        "Error updating profile:",
        error?.response?.data || error.message
      );
      toast.error("There was an error submitting the profile");
    }
  };
  const handleVerifyEmail = () => {
    setOtpEmailVisible(true);
  };
  const closeemail = () => {
    setOtpEmailVisible(false);
  };
  const closephone = () => {
    setOtpPhoneVisible(false);
  };
  const handleVerifyPhone = () => {
    setOtpPhoneVisible(true);
  };

  const handleOtpSubmit = (type) => {
    if (type === "email") {
      if (otpEmail.length === 6 && /^\d{6}$/.test(otpEmail)) {
        toast.success("Email Verified Successfully");
        setOtpEmailVisible(false); // Hide OTP field after successful verification
      } else {
        toast.error("Invalid OTP. Please enter a valid 6-digit OTP.");
      }
    } else if (type === "phone") {
      if (otpPhone.length === 6 && /^\d{6}$/.test(otpPhone)) {
        toast.success("Phone Verified Successfully");
        setOtpPhoneVisible(false); // Hide OTP field after successful verification
      } else {
        toast.error("Invalid OTP. Please enter a valid 6-digit OTP.");
      }
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const payload = {
        email: mail,
      };
      try {
        setLoading(true);
        const response = await axios.post(
          "/server/elite_tech_corp_function/get-enquiry",
          payload
        );
        console.log("Response Data:", response.data);

        const enquiries = response.data.parsedEnquiries || [];
        const userDataList =
          response.data.result2?.map((entry) => entry.user_data) || [];

        // Check for GST_NO and redirect if null
        const userData = userDataList.find((u) => u.email_id === mail);
        console.log("User Data:", userData);
        setUserDatas(userData);

        // Merge user data with enquiries if needed
        const mergedData = enquiries.map((enquiry) => {
          const user =
            userDataList.find((u) => u.CREATORID === enquiry.CREATORID) || {};
          return { ...enquiry, ...user };
        });

        setData(Array.isArray(mergedData) ? mergedData : []);
      } catch (error) {
        console.error(
          "Error fetching data:",
          error?.response?.data || error.message
        );
      } finally {
        setLoading(false);
      }
    };

    if (mail) {
      loadData();
    }
  }, [mail]);
  const closePopup = () => {
    setShowPopup(false);
    setWebsite("");
  };


  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const mail = sessionStorage.getItem("email");

        const response = await axios.get('/server/elite_tech_corp_function/getuserprofile', {
          params: {
            email: mail
          }
        });

        setProfile(response.data);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, []);


  useEffect(() => {
    // Load all countries once
    const allCountries = Country.getAllCountries();
    setCountries(allCountries);
  }, []);

  useEffect(() => {
    // When country changes, load corresponding states
    if (selectedCountry) {
      const countryObj = countries.find((c) => c.name === selectedCountry);
      if (countryObj) {
        const stateList = State.getStatesOfCountry(countryObj.isoCode);
        setStates(stateList);

      }
    }
  }, [selectedCountry]);

  useEffect(() => {
    // On initial load: If userdatas.country exists, load corresponding states
    if (countries.length > 0 && userdatas?.country) {
      const countryObj = countries.find(c => c.name === userdatas.country);
      if (countryObj) {
        const stateList = State.getStatesOfCountry(countryObj.isoCode);
        setStates(stateList);
      }
    }
  }, [countries, userdatas?.country]);


  useEffect(() => {
    if (userdatas?.state && states.length > 0) {
      setValue("state", userdatas.state); // set the value manually once data is available
    }
  }, [userdatas, states, setValue]);






  const handleWebsiteSearch = async () => {
    if (!website) return;

    console.log("Webiste", website);
    try {
      setwebLoading(true);
      const response = await fetch(
        `https://web-scraper-60025258148.development.catalystserverless.in/server/collect-data/scrape-tech?url=${encodeURIComponent(
          website
        )}`
      );
      const result = await response.json();
      console.log("respnse", result);
      setCompanyInfo(result);
      setAddress(result.addresses || []);
      setEmail(result.emails || []);
      setwebPhonenumber(result.phoneNumbers || []);
      setShowPopup(true);
    } catch (err) {
      console.error("Failed to fetch company info", err);
      alert("Could not fetch details. Please try again.");
    } finally {
      setwebLoading(false);
    }
  };

return (
  <>
    {hasPermission("Profile", "Profile") ? (
      <div className="flex flex-col md:flex-row">
        <div className="p-0 pt-3 w-full">
          {/* Breadcrumb */}
          <nav className="flex mb-3 sm:mb-4 md:mb-6 ml-3" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse !pl-0">
              <li className="inline-flex items-center">
                <Link
                  to="/dashboard"
                  className="ms-1 text-[14px] text-gray-400 md:ms-2 dark:text-gray-400 dark:hover:text-gray-500"
                >
                  Dashboard
                </Link>
              </li>
              <span>/</span>
              <li aria-current="page">
                <div className="flex items-center">
                  <span className="inline-flex it4sd items-center text-[14px] text-[#6B7280]">
                    Profile
                  </span>
                </div>
              </li>
            </ol>
          </nav>

          {/* Header */}
          <div className="flex flex-row justify-between m-3 mt-8">
            <div className="flex flex-col justify-between pl-2">
              <h1 className="text-[22px] font-semiBold font-arial mb-1">
                Personal Details
              </h1>
            </div>
          </div>

          {/* Loader */}
          {loading ? (
            <div className="flex items-center justify-center h-[60vh] top-0">
              <Loader />
            </div>
          ) : (
            <>
              {/* Body */}
              {role_name === "Client" ? (
                <div className="p-6 border rounded-lg shadow-md bg-gray-50">
                  {/* React-hook form */}
                   <form onSubmit={handleSubmit(onSubmit)}>
                    {/* Row-1 First and Last name */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
                      <div>
                        <label
                          className="block flex gap-1 text-gray-700 font-medium mb-2"
                          htmlFor="Cus_Name"
                        >
                          <span>
                            <User size={20} />
                          </span>
                          First Name <span className="text-red-600 text-base">*</span>
                        </label>
                        <input
                          {...register("first_name", {
                            required: "First Name is required",
                          })}
                          className="w-full p-2 border border-gray-300 rounded"
                          defaultValue={userdatas?.first_name || "Ikram"}
                        />
                        {errors.first_name && (
                          <p className="text-red-500 text-sm">
                            {errors.first_name.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label
                          className="block flex gap-1 text-gray-700 font-medium mb-2"
                          htmlFor="Phone_No"
                        >
                          <span>
                            <User size={20} />
                          </span>
                          Last Name <span className="text-red-600 text-base">*</span>
                        </label>
                        <input
                          {...register("last_name", {
                            required: "Last Name is required",
                          })}
                          className="w-full p-2 border border-gray-300 rounded"
                          defaultValue={userdatas?.last_name || "F"}
                        />
                        {errors.last_name && (
                          <p className="text-red-500 text-sm">
                            {errors.last_name.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Row 2: Email and Mobile */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
                      <div>
                        <div className="flex justify-between">
                          <label
                            className="block flex gap-1 text-gray-700 font-medium mt-4"
                            htmlFor="Start Date"
                          >
                            <span>
                              <Mail size={20} />
                            </span>
                            Email <span className="text-red-600 text-base">*</span>
                          </label>
                        </div>

                        <input
                          type="email"
                          {...register("email", { required: "Email is required" })}
                          className="w-full p-2 border border-gray-300 rounded"
                          defaultValue={
                            userdatas?.email_id || "ikram@elitetechcorp.com"
                          }
                        />
                        {errors.email && (
                          <p className="text-red-500 text-sm">
                            {errors.email.message}
                          </p>
                        )}

                        {otpEmailVisible && (
                          <div className="mb-4 flex gap-2">
                            <div>
                              <label
                                className="block text-gray-700"
                                htmlFor="otp-email"
                              >
                                Enter OTP
                              </label>
                              <input
                                type="text"
                                id="otp-email"
                                value={otpEmail}
                                onChange={(e) => setOtpEmail(e.target.value)}
                                className="w-full otp-input p-2 border border-gray-300 rounded"
                                maxLength="6"
                                placeholder="6-Digit OTP"
                              />
                            </div>

                            <button
                              type="button"
                              className="otp text-white bg-[green] h-[38px] hover:bg-green-700 font-medium rounded-lg text-sm px-3 py-2.5"
                              onClick={() => handleOtpSubmit("email")}
                            >
                              Submit OTP
                            </button>
                            <button
                              type="button"
                              className="otp text-white bg-red-500 text-center h-[38px] hover:bg-red-700 font-medium rounded-lg text-sm px-3 py-2"
                              onClick={closeemail}
                            >
                              <X size={20} className="bottom-4" />
                            </button>
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex justify-between">
                          <label
                            className="block flex gap-1 text-gray-700 font-medium mt-4"
                            htmlFor="End_Date"
                          >
                            <span>
                              <Phone size={20} />
                            </span>
                            Mobile <span className="text-red-600 text-base">*</span>
                          </label>
                        </div>

                        <Controller
                          name="mobile_no"
                          control={control}
                          rules={{ required: "Mobile no is required" }}
                          defaultValue={userdatas?.phone }
                          render={({ field }) => (
                            <PhoneInput
                              international
                              defaultCountry="IN"
                              value={field.value}
                              onChange={field.onChange}
                              className="PhoneInput w-full mt-1 h-[42px]"
                              placeholder="Enter mobile number"
                            />
                          )}
                        />
                        {errors.mobile_no && (
                          <p className="text-red-500 text-sm">
                            {errors.mobile_no.message}
                          </p>
                        )}
                        {otpPhoneVisible && (
                          <div className="mb-4 flex gap-3">
                            <div>
                              <label
                                className="block text-gray-700"
                                htmlFor="otp-phone"
                              >
                                Enter OTP
                              </label>
                              <input
                                type="text"
                                id="otp-phone"
                                value={otpPhone}
                                onChange={(e) => setOtpPhone(e.target.value)}
                                className="w-full otp-input p-2 border border-gray-300 rounded"
                                maxLength="6"
                                placeholder="6-Digit OTP"
                              />
                            </div>

                            <button
                              type="button"
                              className="otp text-white bg-[green] h-[38px] hover:bg-green-700 font-medium rounded-lg text-sm px-3 py-2.5"
                              onClick={() => handleOtpSubmit("phone")}
                            >
                              Submit OTP
                            </button>
                            <button
                              type="button"
                              className="otp text-white bg-red-500 text-center h-[38px] hover:bg-red-700 font-medium rounded-lg text-sm px-3 py-2.5"
                              onClick={closephone}
                            >
                              <X size={20} className="bottom-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <hr />
                    <br />
                    <h3 className="text-2xl">Company Details</h3>
                    <br />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
                      <div>
                        <label
                          className="block flex gap-1 text-gray-700 font-medium mb-2"
                          htmlFor="org_name"
                        >
                          <span>
                            <Building size={20} />
                          </span>
                          Company Name{" "}
                          <span className="text-red-600 text-base">*</span>
                        </label>
                        <input
                          {...register("org_name", {
                            required: "Company Name is required",
                          })}
                          className="w-full p-2 border border-gray-300 rounded"
                          defaultValue={userdatas?.org_name || "Elite tech Corp"}
                        />
                        {errors.org_name && (
                          <p className="text-red-500 text-sm">
                            {errors.org_name.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          className="block flex gap-1 text-gray-700 font-medium mb-2"
                          htmlFor="Total_Sqft"
                        >
                          <span>
                            <ClipboardType size={20} />
                          </span>
                          Business Type{" "}
                          <span className="text-red-600 text-base">*</span>
                        </label>
                        <select
                          {...register("bussiness_type", {
                            required: "Business Type is required",
                          })}
                          className="p-2 mt-1 border w-full border-gray-300 rounded"
                          defaultValue={userdatas?.bussiness_type || ""}
                          style={{ height: "42px" }}
                        >
                          <option value="Software">Software</option>
                          <option value="Education">Education</option>
                          <option value="Automation">Automation</option>
                          <option value="Healthcare Services">
                            Healthcare Services
                          </option>
                          <option value="Real Estate Agencies">
                            Real Estate Agencies
                          </option>
                        </select>
                        {errors.bussiness_type && (
                          <p className="text-red-500 text-sm">
                            {errors.bussiness_type.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Row 4: Company Email and Company Website */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
                      <div>
                        <label
                          className="block flex gap-1 text-gray-700 font-medium mb-2"
                          htmlFor="company_email"
                        >
                          <span>
                            <Mail size={20} />
                          </span>
                          Company Email{" "}
                          <span className="text-red-600 text-base">*</span>
                        </label>
                        <input
                          type="email"
                          {...register("org_email", {
                            required: "Company Email is required",
                          })}
                          className="w-full p-2 border border-gray-300 rounded"
                          defaultValue={
                            userdatas?.org_email || "sales@elitetechcorp.com"
                          }
                        />
                        {errors.org_email && (
                          <p className="text-red-500 text-sm">
                            {errors.org_email.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          className="block flex gap-1 text-gray-700 font-medium mb-2"
                          htmlFor="company_website"
                        >
                          <span>
                            <Laptop size={20} />
                          </span>
                          Company Website
                        </label>
                        <div className="flex sm:flex-wrap flex-1 gap-2">
                          <input
                            {...register("company_website", {
                              required: "Company Website is required",
                            })}
                            defaultValue={
                              userdatas?.company_website ||
                              "https://www.elitetechcorp.com/"
                            }
                            type="url"
                            onChange={(e) => setWebsite(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded"
                          />
                        </div>
                        {errors.company_website && (
                          <p className="text-red-500 text-sm">
                            {errors.company_website.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Row 5: Address (Left) and Pincode, State, Country (Right) */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
                      <div>
                        <label
                          className="block flex gap-1 text-gray-700 font-medium mb-2"
                          htmlFor="company_Address"
                        >
                          <span>
                            <NotebookTabs size={20} />
                          </span>
                          Address
                        </label>
                        <textarea
                          {...register("company_Address", {
                            required: "address is required",
                          })}
                          rows="2"
                          style={{ resize: "none", backgroundColor: "#f0f0f0", color: "#000000" }}
                          defaultValue={
                            userdatas?.company_Address ||
                            "F1, Kalpavriddhi building, Villankurichi Rd, Indhuma Nagar, VIP Nagar, Cheran ma Nagar, Coimbatore"
                          }
                          className="block p-2.5 w-full text-sm text-gray-900 bg-gray-200 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        ></textarea>
                        {errors.company_Address && (
                          <p className="text-red-500 text-sm">
                            {errors.company_Address.message}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="mb-4">
                          <label className="block text-gray-700" htmlFor="pincode">
                            Pincode
                          </label>
                          <input
                            {...register("pincode", {
                              required: "Pincode is required",
                            })}
                            className="w-full p-2 border border-gray-300 rounded"
                            defaultValue={userdatas?.pincode || "641035"}
                          />
                          {errors.pincode && (
                            <p className="text-red-500 text-sm">
                              {errors.pincode.message}
                            </p>
                          )}
                        </div>

                        <div className="mb-4">
                          <label className="block text-gray-700">Country</label>
                          <select
                            {...register("country", { required: "Country is required" })}
                            defaultValue={userdatas?.country || ""}
                            className="block mt-1 p-2.5 w-full text-sm text-gray-900 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                          >
                            <option value="">Select Country</option>
                            {countries.map((country) => (
                              <option key={country.isoCode} value={country.name}>
                                {country.name}
                              </option>
                            ))}
                          </select>
                          {errors.country && (
                            <p className="text-red-500 text-sm">{errors.country.message}</p>
                          )}
                        </div>

                        {/* State Select */}
                        <div className="mb-4">
                          <label className="block text-gray-700">State</label>
                          <select
                            {...register("state", { required: "State is required" })}
                            defaultValue={userdatas?.state || ""}
                            className="block mt-1 p-2.5 w-full text-sm text-gray-900 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                          >
                            <option value="">Select State</option>
                            {states.map((state) => (
                              <option key={state.isoCode} value={state.name}>
                                {state.name}
                              </option>
                            ))}
                          </select>
                          {errors.state && (
                            <p className="text-red-500 text-sm">{errors.state.message}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                      <div>
                        <label
                          className="block flex gap-1 text-gray-700 font-medium mb-2"
                          htmlFor="whatsapp"
                        >
                          <i className="bi bi-whatsapp"></i>
                          WhatsApp Number
                          <span className="text-red-600 text-base">*</span>
                        </label>
                        <input
                          type="tel"
                          {...register("whatsapp", {
                            required: "WhatsApp Number is required",
                          })}
                          className="w-full p-2 border border-gray-300 rounded"
                          defaultValue={userdatas?.whatsup_no || "9345523048"}
                        />
                        {errors.whatsapp && (
                          <p className="text-red-500 text-sm">
                            {errors.whatsapp.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          className="block flex gap-1 text-gray-700 font-medium mb-2"
                          htmlFor="gst_no"
                        >
                          <span>
                            <ClipboardList size={20} />
                          </span>
                          GST Number <span className="text-red-600 text-base">*</span>
                        </label>
                        <input
                          {...register("gst_no", { required: "GST is required" })}
                          className="w-full p-2 border border-gray-300 rounded"
                          defaultValue={userdatas?.gst_no || "GSTTN07"}
                        />
                        {errors.gst_no && (
                          <p className="text-red-500 text-sm">
                            {errors.gst_no.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <button
                        type="submit"
                        className="bg-blue-500 text-white px-6 py-2 rounded-full"
                      >
                        Submit
                      </button>
                    </div>
                    <ToastContainer />
                  </form>

                  {showPopup && companyInfo && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 w-30">
                      <div className="bg-white rounded-lg p-6 shadow-lg">
                        {(email.length > 0 ||
                          webphonenumber.length > 0 ||
                          address.length > 0) && (
                          <div className="mt-6 bg-white shadow-lg rounded-xl p-6 w-full container">
                            <h3 className="text-xl font-semibold mb-3">
                              Contact Information
                            </h3>

                            {email.length > 0 && (
                              <div className="mb-4">
                                <h4 className="font-semibold text-blue-600">
                                  Emails:
                                </h4>
                                <ul className="list-disc pl-5 text-gray-700">
                                  {[...new Set(email)].map((e, index) => (
                                    <li key={index}>{e}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {webphonenumber.length > 0 && (
                              <div className="mb-4">
                                <h4 className="font-semibold text-green-600">
                                  Phone Numbers:
                                </h4>
                                <ul className="list-disc pl-5 text-gray-700">
                                  {[...new Set(webphonenumber)].map((p, index) => (
                                    <li key={index}>{p}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {address.length > 0 && (
                              <div>
                                <h4 className="font-semibold text-purple-600">
                                  Addresses:
                                </h4>
                                <ul className="list-disc pl-5 text-gray-700 space-y-2">
                                  {[...new Set(address)].map((a, index) => (
                                    <li key={index}>{a}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                        <button
                          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
                          onClick={closePopup}
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
               <div className="p-6 border rounded-lg shadow-md bg-gray-50">
                  {/* React-hook form */}

                  <form onSubmit={handleSubmit(onSubmit)}>
                    {/* Row-1 First and Last name */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
                      <div>
                        <label
                          className="block flex gap-1 text-gray-700 font-medium mb-2"
                          htmlFor="Cus_Name"
                        >
                          <span>
                            <User size={20} />
                          </span>
                          First Name <span className="text-red-600 text-base">*</span>
                        </label>
                        <input
                          {...register("first_name", {
                            required: "First Name is required",
                          })}
                          className="w-full p-2 border border-gray-300 rounded"
                          defaultValue={userdatas?.first_name || "Ikram"}
                        />
                        {errors.first_name && (
                          <p className="text-red-500 text-sm">
                            {errors.first_name.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label
                          className="block flex gap-1 text-gray-700 font-medium mb-2"
                          htmlFor="Phone_No"
                        >
                          <span>
                            <User size={20} />
                          </span>
                          Last Name <span className="text-red-600 text-base">*</span>
                        </label>
                        <input
                          {...register("last_name", {
                            required: "Last Name is required",
                          })}
                          className="w-full p-2 border border-gray-300 rounded"
                          defaultValue={userdatas?.last_name || "F"}
                        />
                        {errors.last_name && (
                          <p className="text-red-500 text-sm">
                            {errors.last_name.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Row 2: Email and Mobile */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
                      <div>
                        <div className="flex justify-between">
                          <label
                            className="block flex gap-1 text-gray-700 font-medium mt-4"
                            htmlFor="Start Date"
                          >
                            <span>
                              <Mail size={20} />
                            </span>
                            Email <span className="text-red-600 text-base">*</span>
                          </label>
                        </div>

                        <input
                          type="email"
                          {...register("email", { required: "Email is required" })}
                          className="w-full p-2 border border-gray-300 rounded"
                          defaultValue={
                            userdatas?.email_id || "ikram@elitetechcorp.com"
                          }
                        />
                        {errors.email && (
                          <p className="text-red-500 text-sm">
                            {errors.email.message}
                          </p>
                        )}

                        {otpEmailVisible && (
                          <div className="mb-4 flex gap-2">
                            <div>
                              <label
                                className="block text-gray-700"
                                htmlFor="otp-email"
                              >
                                Enter OTP
                              </label>
                              <input
                                type="text"
                                id="otp-email"
                                value={otpEmail}
                                onChange={(e) => setOtpEmail(e.target.value)}
                                className="w-full otp-input p-2 border border-gray-300 rounded"
                                maxLength="6"
                                placeholder="6-Digit OTP"
                              />
                            </div>

                            <button
                              type="button"
                              className="otp text-white bg-[green] h-[38px] hover:bg-green-700 font-medium rounded-lg text-sm px-3 py-2.5"
                              onClick={() => handleOtpSubmit("email")}
                            >
                              Submit OTP
                            </button>
                            <button
                              type="button"
                              className="otp text-white bg-red-500 text-center h-[38px] hover:bg-red-700 font-medium rounded-lg text-sm px-3 py-2"
                              onClick={closeemail}
                            >
                              <X size={20} className="bottom-4" />
                            </button>
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex justify-between">
                          <label
                            className="block flex gap-1 text-gray-700 font-medium mt-4"
                            htmlFor="End_Date"
                          >
                            <span>
                              <Phone size={20} />
                            </span>
                            Mobile <span className="text-red-600 text-base">*</span>
                          </label>
                        </div>

                        <Controller
                          name="mobile_no"
                          control={control}
                          rules={{ required: "Mobile no is required" }}
                          defaultValue={userdatas?.phone}
                          render={({ field }) => (
                            <PhoneInput
                              international
                              defaultCountry="IN"
                              value={field.value}
                              onChange={field.onChange}
                              className="PhoneInput w-full mt-1 h-[42px]"
                              placeholder="Enter mobile number"
                            />
                          )}
                        />
                        {errors.mobile_no && (
                          <p className="text-red-500 text-sm">
                            {errors.mobile_no.message}
                          </p>
                        )}
                        {otpPhoneVisible && (
                          <div className="mb-4 flex gap-3">
                            <div>
                              <label
                                className="block text-gray-700"
                                htmlFor="otp-phone"
                              >
                                Enter OTP
                              </label>
                              <input
                                type="text"
                                id="otp-phone"
                                value={otpPhone}
                                onChange={(e) => setOtpPhone(e.target.value)}
                                className="w-full otp-input p-2 border border-gray-300 rounded"
                                maxLength="6"
                                placeholder="6-Digit OTP"
                              />
                            </div>

                            <button
                              type="button"
                              className="otp text-white bg-[green] h-[38px] hover:bg-green-700 font-medium rounded-lg text-sm px-3 py-2.5"
                              onClick={() => handleOtpSubmit("phone")}
                            >
                              Submit OTP
                            </button>
                            <button
                              type="button"
                              className="otp text-white bg-red-500 text-center h-[38px] hover:bg-red-700 font-medium rounded-lg text-sm px-3 py-2.5"
                              onClick={closephone}
                            >
                              <X size={20} className="bottom-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <hr />
                    <br />
                    <h3 className="text-2xl">Company Details</h3>
                    <br />


                    {/* Row 4: Company Email and Company Website */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
                      <div>
                        <label
                          className="block flex gap-1 text-gray-700 font-medium mb-2"
                          htmlFor="company_email"
                        >
                          <span>
                            <Mail size={20} />
                          </span>
                          Company Email{" "}
                          <span className="text-red-600 text-base">*</span>
                        </label>
                        <input
                          type="email"
                          {...register("org_email", {
                            required: "Company Email is required",
                          })}
                          className="w-full p-2 border border-gray-300 rounded"
                          defaultValue={
                            userdatas?.org_email || "sales@elitetechcorp.com"
                          }
                        />
                        {errors.org_email && (
                          <p className="text-red-500 text-sm">
                            {errors.org_email.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          className="block flex gap-1 text-gray-700 font-medium mb-2"
                          htmlFor="company_website"
                        >
                          <span>
                            <Laptop size={20} />
                          </span>
                          Personal Mail
                        </label>
                        <div className="flex sm:flex-wrap flex-1 gap-2">
                          <input
                            {...register("personal_mail", {
                              required: "Personal Mail is required",
                            })}
                            defaultValue={
                              userdatas?.personal_mail ||
                              "user@example.com"
                            }
                            type="email"
                            onChange={(e) => setWebsite(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded"
                          />
                        </div>
                        {errors.personal_mail && (
                          <p className="text-red-500 text-sm">
                            {errors.personal_mail.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Row 5: Address (Left) and Pincode, State, Country (Right) */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
                      <div>
                        <label
                          className="block flex gap-1 text-gray-700 font-medium mb-2"
                          htmlFor="company_Address"
                        >
                          <span>
                            <NotebookTabs size={20} />
                          </span>
                          Address
                        </label>
                        <textarea
                          {...register("company_Address", {
                            required: "address is required",
                          })}
                          rows="2"
                          style={{ resize: "none", backgroundColor: "#f0f0f0", color: "#000000" }}
                          defaultValue={
                            userdatas?.company_Address ||
                            "F1, Kalpavriddhi building, Villankurichi Rd, Indhuma Nagar, VIP Nagar, Cheran ma Nagar, Coimbatore"
                          }
                          className="block p-2.5 w-full text-sm text-gray-900 bg-gray-200 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        ></textarea>
                        {errors.company_Address && (
                          <p className="text-red-500 text-sm">
                            {errors.company_Address.message}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="mb-4">
                          <label className="block text-gray-700" htmlFor="pincode">
                            Pincode
                          </label>
                          <input
                            {...register("pincode", {
                              required: "Pincode is required",
                            })}
                            className="w-full p-2 border border-gray-300 rounded"
                            defaultValue={userdatas?.pincode || "641035"}
                          />
                          {errors.pincode && (
                            <p className="text-red-500 text-sm">
                              {errors.pincode.message}
                            </p>
                          )}
                        </div>

                        <div className="mb-4">
                          <label className="block text-gray-700">Country</label>
                          <select
                            {...register("country", { required: "Country is required" })}
                            defaultValue={userdatas?.country || ""}
                            className="block mt-1 p-2.5 w-full text-sm text-gray-900 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                          >
                            <option value="">Select Country</option>
                            {countries.map((country) => (
                              <option key={country.isoCode} value={country.name}>
                                {country.name}
                              </option>
                            ))}
                          </select>
                          {errors.country && (
                            <p className="text-red-500 text-sm">{errors.country.message}</p>
                          )}
                        </div>

                        {/* State Select */}
                        <div className="mb-4">
                          <label className="block text-gray-700">State</label>
                          <select
                            {...register("state", { required: "State is required" })}
                            defaultValue={userdatas?.state || ""}
                            className="block mt-1 p-2.5 w-full text-sm text-gray-900 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                          >
                            <option value="">Select State</option>
                            {states.map((state) => (
                              <option key={state.isoCode} value={state.name}>
                                {state.name}
                              </option>
                            ))}
                          </select>
                          {errors.state && (
                            <p className="text-red-500 text-sm">{errors.state.message}</p>
                          )}
                        </div>
                      </div>
                    </div>

                   

                    <div className="flex justify-center">
                      <button
                        type="submit"
                        className="bg-blue-500 text-white px-6 py-2 rounded-full"
                      >
                        Submit
                      </button>
                    </div>
                    <ToastContainer />
                  </form>
                
                </div>
              )}
            </>
          )}
        </div>
      </div>
    ) : (
      <div className="p-10 text-center text-red-600 font-semibold">
        You do not have permission to view this page.
      </div>
    )}
  </>
);
};
