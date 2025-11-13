import { useState, React } from "react";
import { Link } from "react-router-dom";

function Access() {
  const [activePlan, setActivePlan] = useState("Basic");
  const [customSelections, setCustomSelections] = useState({});
  const [manualSelections, setManualSelections] = useState({});
  const [autoSelectedByRoles, setAutoSelectedByRoles] = useState([]);
  const [total, setTotal] = useState("");
  const [showGifPopup, setShowGifPopup] = useState(false);
  const [popupType, setPopupType] = useState("success");
  const [submitLoading, setSubmitLoading] = useState(false);
  return (
    <div className="flex flex-col md:flex-row">
      <div className="p-8 pt-3 w-full">
        <nav className="flex mb-5" aria-label="Breadcrumb">
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
        <h1 className="text-2xl font-semibold mb-4 text-gray-800">
          Access For User
        </h1>

        <div className="overflow-x-auto bg-white shadow-xl rounded-2xl border border-gray-200">
          <div className="overflow-y-auto max-h-[calc(100vh-300px)] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <table className="w-full text-md">
              <thead className="sticky top-0 bg-gray-200 text-gray-700 font-semibold z-10 py-4">
                <tr className="text-center">
                  <th className="px-4 py-4">User</th>
                  <th className="px-4 py-4">Dashboard</th>
                  <th className="px-4 py-4">Bundel Solution</th>
                  <th className="px-4 py-4">Enquiry</th>
                  <th className="px-4 py-4">Projects Details</th>
                  <th className="px-4 py-4">Invoices Details</th>
                  <th className="px-4 py-4">Logs</th>
                  <th className="px-4 py-4">Sales Details</th>
                </tr>
              </thead>

              <tbody className="max-h-[50vh] text-center">
                <tr className="border-b hover:bg-gray-50 transition">
                  <td className="px-4 py-4 font-bold align-top bg-gray-50 text-gray-700">
                    Super Admin
                  </td>
                  <td>
                    <input type="radio" />
                  </td>
                  <td>
                    <input type="checkbox" />
                  </td>
                  <td>
                    <input type="checkbox" />
                  </td>
                  <td>
                    <input type="checkbox" />
                  </td>
                  <td>
                    <input type="checkbox" />
                  </td>
                  <td>
                    <input type="checkbox" />
                  </td>
                  <td>
                    <input type="checkbox" />
                  </td>
                </tr>
                <tr className="border-b hover:bg-gray-50 transition">
                  <td className="px-4 py-4 font-bold align-top bg-gray-50 text-gray-700">
                    Manager
                  </td>
                </tr>
                <tr className="border-b hover:bg-gray-50 transition">
                  <td className="px-4 py-4 font-bold align-top bg-gray-50 text-gray-700">
                    Client
                  </td>
                </tr>
                <tr className="border-b hover:bg-gray-50 transition">
                  <td className="px-4 py-4 font-bold align-top bg-gray-50 text-gray-700">
                    Sales Person
                  </td>
                </tr>
                <tr className="border-b hover:bg-gray-50 transition">
                  <td className="px-4 py-4 font-bold align-top bg-gray-50 text-gray-700">
                    Sales Head
                  </td>
                </tr>
                <tr className="border-b hover:bg-gray-50 transition">
                  <td className="px-4 py-4 font-bold align-top bg-gray-50 text-gray-700">
                    Team Leader
                  </td>
                </tr>
                <tr className="border-b hover:bg-gray-50 transition">
                  <td className="px-4 py-4 font-bold align-top bg-gray-50 text-gray-700">
                    Software Developer
                  </td>
                </tr>
                <tr className="border-b hover:bg-gray-50 transition">
                  <td className="px-4 py-4 font-bold align-top bg-gray-50 text-gray-700">
                    Portal Developer
                  </td>
                </tr>
                <tr className="border-b hover:bg-gray-50 transition">
                  <td className="px-4 py-4 font-bold align-top bg-gray-50 text-gray-700">
                    Testing Team
                  </td>
                </tr>
                <tr className="border-b hover:bg-gray-50 transition">
                  <td className="px-4 py-4 font-bold align-top bg-gray-50 text-gray-700">
                    Accounts
                  </td>
                </tr>
                <tr className="border-b hover:bg-gray-50 transition">
                  <td className="px-4 py-4 font-bold align-top bg-gray-50 text-gray-700">
                    Accounts Head
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Access;
