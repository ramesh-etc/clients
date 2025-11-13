import React, { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

export const Profiledetails = () => {
  const { id } = useParams();
  const isSidebarShrunk = useSelector((state) => state.sidebar.isSidebarShrunk);
  const [loading, setLoading] = useState(true);
  const [userdatas, setUserDatas] = useState({});
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [data, setData] = useState([]); // For merged enquiry data if needed
  const mail = useSelector((state) => state.user)?.email_id;
  const navigate = useNavigate();

  console.log("Mail:", mail);

  // onSubmit sends the form data to the API endpoint
  const onSubmit = async (formData) => {
    console.log("Form Submitted", formData);
    try {
      // Send formData to the API (update the URL as needed)
      const response = await axios.post(
        "/server/elite_tech_corp_function/addprofile",
        formData
      );
      console.log("Update Response:", response.data);

      navigate("/dashboard");
      alert("Profile Submitted Successfully");
    } catch (error) {
      console.error(
        "Error updating profile:",
        error?.response?.data || error.message
      );
      alert("There was an error submitting the profile");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "/server/elite_tech_corp_function/get-enquiry",
          {
            params: { email: mail },
          }
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

  return (
    <div className="flex flex-col md:flex-row">
      <Sidebar />
      <div
        className={`flex-1 min-h-screen bg-gray-100 p-0 transition-all duration-300 ease-in-out ${
          isSidebarShrunk ? "ml-0 md:ml-[90px]" : ""
        }`}
      >
        <Header />
        <div className="p-6">
          <div className="flex flex-col sm:flex-row justify-between">
            <h1 className="text-2xl font-bold mb-4">Task Details</h1>
            <h3 className="text-l font-bold mb-4">
              <Link to="/dashboard" className="text-[#DC2626] hover:underline">
                Dashboard
              </Link>{" "}
              / Task Details
            </h3>
          </div>
          <div className="p-3 border border-gray-200 rounded-xl m-10 shadow-2xl">
            <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
              <h2 className="text-2xl font-bold mb-6">
                Profile & Company Details
              </h2>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-4">
                  <label className="block text-gray-700">First Name</label>
                  <input
                    {...register("first_name", {
                      required: "First Name is required",
                    })}
                    className="w-full p-2 border border-gray-300 rounded"
                    defaultValue={userdatas?.first_name || ""}
                  />
                  {errors.first_name && (
                    <p className="text-red-500 text-sm">
                      {errors.first_name.message}
                    </p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">Last Name</label>
                  <input
                    {...register("last_name", {
                      required: "Last Name is required",
                    })}
                    className="w-full p-2 border border-gray-300 rounded"
                    defaultValue={userdatas?.last_name || ""}
                  />
                  {errors.last_name && (
                    <p className="text-red-500 text-sm">
                      {errors.last_name.message}
                    </p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">Email</label>
                  <input
                    type="email"
                    {...register("email", { required: "Email is required" })}
                    className="w-full p-2 border border-gray-300 rounded"
                    defaultValue={userdatas?.email_id || ""}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">Mobile No</label>
                  <input
                    {...register("mobile_no", {
                      required: "Mobile no is required",
                    })}
                    className="w-full p-2 border border-gray-300 rounded"
                    defaultValue={userdatas?.phone || ""}
                  />
                  {errors.mobile_no && (
                    <p className="text-red-500 text-sm">
                      {errors.mobile_no.message}
                    </p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">Company Name</label>
                  <input
                    {...register("org_name", {
                      required: "Company Name is required",
                    })}
                    className="w-full p-2 border border-gray-300 rounded"
                    defaultValue={userdatas?.org_name || ""}
                  />
                  {errors.org_name && (
                    <p className="text-red-500 text-sm">
                      {errors.org_name.message}
                    </p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">Bussiness Type</label>
                  <select
                    {...register("bussiness_type", {
                      required: "Bussiness Type is required",
                    })}
                    className="p-2 border w-full border-gray-300 rounded bg-gray-100"
                    Value={userdatas?.bussiness_type}
                  >
                    <option value="">Choose your business</option>
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
                <div className="mb-4">
                  <label className="block text-gray-700">Company Email</label>
                  <input
                    type="email"
                    {...register("email", { required: "Email is required" })}
                    className="w-full p-2 border border-gray-300 rounded"
                    defaultValue={userdatas?.org_email || ""}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">Company Address</label>
                  <textarea id="message" rows="2" class="block p-2.5 w-full text-sm text-gray-900 bg-gray-200 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"></textarea>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">State</label>
                  <select
                    id="state"
                    className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  >
                    <option value="">Select State</option>
                    <option value="California">California</option>
                    <option value="Texas">Texas</option>
                    <option value="New York">New York</option>
                    <option value="Florida">Florida</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">Pincode</label>
                  <input
                    {...register("pincode", {
                      required: "Mobile no is required",
                    })}
                    className="w-full p-2 border border-gray-300 rounded"
                    defaultValue={userdatas?.pincode || ""}
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
                      id="country"
                      className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    >
                      <option value="">Select Country</option>
                      <option value="USA">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="India">India</option>
                      <option value="Australia">Australia</option>
                    </select>
                  </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Company Website</label>
                    <input
                    {...register("company_website", {
                      required: "First Name is required",
                    })}
                    className="w-full p-2 border border-gray-300 rounded"
                    defaultValue={userdatas?.company_website || ""}
                  />
                  {errors.company_website && (
                    <p className="text-red-500 text-sm">
                      {errors.first_name.message}
                    </p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">WhatsApp Number</label>
                  <input
                    type="tel"
                    {...register("whatsapp", {
                      required: "WhatsApp Number is required",
                    })}
                    className="w-full p-2 border border-gray-300 rounded"
                    defaultValue={userdatas?.whatsup_no || ""}
                  />
                  {errors.whatsapp && (
                    <p className="text-red-500 text-sm">
                      {errors.whatsapp.message}
                    </p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">GST/Tax Number</label>
                  <input
                    {...register("gst", {
                      required: "GST/Tax Number is required",
                    })}
                    className="w-full p-2 border border-gray-300 rounded"
                    defaultValue={userdatas?.gst_no || ""}
                  />
                  {errors.gst && (
                    <p className="text-red-500 text-sm">{errors.gst.message}</p>
                  )}
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#00ccc1] text-white py-2 rounded"
                >
                  Submit
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Profiledetails;
