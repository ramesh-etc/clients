import { React, useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Download,
  Receipt,
  ChevronUp,
  ChevronDown,
  FolderKanban,
  Table,
  Video,
} from "lucide-react";
import dummy from "../assets/Images/dummy.pdf";
import samplevideo from "../assets/Images/sample2.mp4";

function Sales_details() {
  const [searchData, setSearchData] = useState("");
  const [showVideo, setShowVideo] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="flex flex-col p-8 pt-3">
      <nav className="flex mb-5" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-2 !pl-0">
          <li className="inline-flex items-center">
            <Link
              to="/dashboard"
              className="text-[14px] text-gray-400 hover:text-gray-500"
            >
              Dashboard
            </Link>
          </li>
          <span>/</span>
          <li>
            <span className="text-[14px] text-[#DC2626]">Sales Details</span>
          </li>
        </ol>
      </nav>

      <div className="flex flex-col pl-2">
        <h1 className="text-[22px] font-semibold mb-1">Sales Details</h1>
      </div>

      <div className="flex justify-between">
        <div className="flex flex-row justify-between mt-3">
          <div className="relative w-full sm:w-96">
            <Search
              size={23}
              className="absolute left-4 top-5 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              className="w-full pl-12 pr-4 py-2 border bg-white font-bold rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400"
              placeholder="Search...."
              value={searchData}
              onChange={(e) => setSearchData(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="overflow-auto h-[570px] bg-white shadow-md rounded-lg mt-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <table className="min-w-full table-auto">
          <thead className="sticky top-0 bg-gray-200 ">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                Project ID
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                Project Name
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                Phone No
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                Created At
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                Updated At
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {[
              {
                Project_ID: "254623",
                Projects_name: "Test Project",
                email: "sg@elitetechpark.com",
                phone_no: "1234567895",
                created_at: "2022-01-01",
                updated_at: "2022-01-01",
              },
              {
                Project_ID: "254656",
                Projects_name: "Test Project",
                email: "sg@elitetechpark.com",
                phone_no: "1234567895",
                created_at: "2022-01-01",
                updated_at: "2022-01-01",
              },
              {
                Project_ID: "254623",
                Projects_name: "Test Project",
                email: "sg@elitetechpark.com",
                phone_no: "1234567895",
                created_at: "2022-01-01",
                updated_at: "2022-01-01",
              },
              {
                Project_ID: "254623",
                Projects_name: "Test Project",
                email: "sg@elitetechpark.com",
                phone_no: "1234567895",
                created_at: "2022-01-01",
                updated_at: "2022-01-01",
              },
            ].map((item, index) => (
              <tr
                key={index}
                className="hover:bg-gray-50 transition-all duration-200 text-sm text-gray-700"
              >
                <td className="px-6 py-3 whitespace-nowrap">
                  {item.Project_ID}
                </td>
                <td className="px-6 py-3">{item.Projects_name}</td>
                <td className="px-6 py-3">{item.email}</td>
                <td className="px-6 py-3">{item.phone_no}</td>
                <td className="px-6 py-3">{item.created_at}</td>
                <td className="px-6 py-3">{item.updated_at}</td>
                <td className="p-3 flex items-center justify-center space-x-2">
                  <a
                    href={dummy}
                    download="project-details.pdf"
                    className="p-2 bg-[green] rounded text-white flex items-center justify-center transition-transform duration-300 hover:scale-105"
                  >
                    <Download />
                  </a>
                  <button
                    className="bg-gray-200 p-2 rounded text-black flex items-center justify-center transition-transform duration-300 hover:scale-105"
                    onClick={() => setShowVideo(true)}
                  >
                    <Video />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {showVideo && (
          <div className="fixed inset-0 bg-gray-200 bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-sm shadow-xl w-[80%] relative">
              <button
                onClick={() => setShowVideo(false)}
                className="absolute top-2 right-2 text-black hover:text-red-600 text-xl font-bold"
              >
                ×
              </button>
              <video controls autoPlay className=" rounded w-full">
                <source src={samplevideo} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default Sales_details;
