import React, { useEffect, useState, useMemo } from 'react';
import zohocatalyst from "../assets/Images/zohoCatalyst.png";
import zohoone from "../assets/Images/Zoho-one.png";
import axios from "axios";
import { RefreshCcw, Send } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";




function Dashboardteam() {
    const [viewMode, setViewMode] = useState("static");
    const [Monthfilter, setMonthfilter] = useState('this_week')
    const role_name = useSelector((state) => state.user.first_name);
    console.log("userroleid>>>", role_name);
    const [teamToalhr, setTeamtotalhr] = useState();
    const [spinning, setSpinning] = useState(false);
    const [zohoCatalystData, setZohoCatalystData] = useState(null);
    const [zohoOneData, setZohoOneData] = useState(null);
    const [isEditingCatalyst, setIsEditingCatalyst] = useState(false);
    const [isEditingZohoOne, setIsEditingZohoOne] = useState(false);



    const [loadingCatalyst, setLoadingCatalyst] = useState(false);
    const [zohoCatalystAvailableHr, setZohoCatalystAvailableHr] = useState("");
    const [zohoCatalystAvailableMin, setZohoCatalystAvailableMin] = useState("");
    const [zohoCatalystAllocatedHr, setZohoCatalystAllocatedHr] = useState("");
    const [zohoCatalystAllocatedMin, setZohoCatalystAllocatedMin] = useState("");
    const [zohoCatalystTotalHr, setZohoCatalystTotalHr] = useState("");


    const [loadingZohoOne, setLoadingZohoOne] = useState(false);
    const [zohoOneAvailableHr, setZohoOneAvailableHr] = useState("");
    const [zohoOneAvailableMin, setZohoOneAvailableMin] = useState("");
    const [zohoOneAllocatedHr, setZohoOneAllocatedHr] = useState("");
    const [zohoOneAllocatedMin, setZohoOneAllocatedMin] = useState("");
    const [zohoOneTotalHr, setZohoOneTotalHr] = useState("");

    const fetch = async () => {
        try {
            const res = await axios.get(`/server/custom-dashboard-data/custom-data`);
            const data = res.data;

            data?.forEach(item => {
                const teamData = item.CustomDashoboardData;
                if (teamData.team === "ZOHO_CATALYST") {
                    console.log("catalyst ", teamData)
                    setZohoCatalystData(teamData);
                } else if (teamData.team === "ZOHO_ONE") {
                    console.log("zoho data", teamData)
                    setZohoOneData(teamData);
                }
            });

            console.log("Fetched data", data);
        } catch (err) {
            console.error("Error fetching data", err);
        }
    };
    useEffect(() => {
        fetch()
    }, []);

    useEffect(() => {
        if (zohoCatalystData) {
            if (zohoCatalystData.available_hrs) {
                const [hr, min] = zohoCatalystData.available_hrs.split(":");
                setZohoCatalystAvailableHr(hr);
                setZohoCatalystAvailableMin(min);
            }
            if (zohoCatalystData.allocated_hrs) {
                const [hr, min] = zohoCatalystData.allocated_hrs.split(":");
                setZohoCatalystAllocatedHr(hr);
                setZohoCatalystAllocatedMin(min);
            }
            setZohoCatalystTotalHr(zohoCatalystData.total_hrs || "");
        }
    }, [isEditingCatalyst, zohoCatalystData]);

    useEffect(() => {
        if (zohoOneData) {
            if (zohoOneData.available_hrs) {
                const [hr, min] = zohoOneData.available_hrs.split(":");
                setZohoOneAvailableHr(hr);
                setZohoOneAvailableMin(min);
            }
            if (zohoOneData.allocated_hrs) {
                const [hr, min] = zohoOneData.allocated_hrs.split(":");
                setZohoOneAllocatedHr(hr);
                setZohoOneAllocatedMin(min);
            }
            setZohoOneTotalHr(zohoOneData.total_hrs || "");
        }
    }, [isEditingZohoOne, zohoOneData]);

    const calculateTotal = (availHr, availMin, allocHr, allocMin) => {
        const totalMinutes =
            (parseInt(availHr) || 0) * 60 +
            (parseInt(availMin) || 0) -
            (parseInt(allocHr) || 0) * 60 +
            (parseInt(allocMin) || 0);
        const totalHr = Math.floor(totalMinutes / 60);
        const totalMin = totalMinutes % 60;
        return `${totalHr}:${totalMin < 10 ? "0" : ""}${totalMin}`;
    };

    const parseTime = (timeStr) => {
        if (!timeStr || typeof timeStr !== "string") return 0;

        const hourMatch = timeStr.match(/(\d+)h/);
        const minuteMatch = timeStr.match(/(\d+)m/);

        const hours = hourMatch ? parseInt(hourMatch[1], 10) : 0;
        const minutes = minuteMatch ? parseInt(minuteMatch[1], 10) : 0;

        return hours * 60 + minutes;
    };


    const getPercentage = (value, total) => {
        if (!value || !total) return 0;
        return Math.min((value / total) * 100, 100);
    };

    const handleClick = () => {
        setSpinning(true);
        setTimeout(() => setSpinning(false), 500);
    };

    const handleSubmitCatalyst = async () => {
        if (!zohoCatalystData) {
            alert("Catalyst data is not loaded yet. Please wait a moment and try again.");
            return;
        }

        console.log("zohoCatalystAvailableHr", zohoCatalystAvailableHr, ":", zohoCatalystAvailableMin);
        setLoadingCatalyst(true);

        const payload = {
            available_hrs: `${zohoCatalystAvailableHr}:${zohoCatalystAvailableMin}`,
            allocated_hrs: `${zohoCatalystAllocatedHr}:${zohoCatalystAllocatedMin}`,
            total_hrs: calculateTotal(
                zohoCatalystAvailableHr,
                zohoCatalystAvailableMin,
                zohoCatalystAllocatedHr,
                zohoCatalystAllocatedMin
            ),
            team: "ZOHO_CATALYST",
            updated_by: role_name,
            ROWID: zohoCatalystData.ROWID,
        };

        console.log("Sending payload:", payload);

        try {
            let response;

            if (zohoCatalystData.ROWID) {
                alert("Updating existing Catalyst data...");
                response = await axios.put(
                    `/server/custom-dashboard-data/custom-data/${zohoCatalystData.ROWID}`,
                    payload
                );
            } else {
                alert("Creating new Catalyst data...");
                response = await axios.post(
                    "/server/custom-dashboard-data/custom-data",
                    payload
                );
            }

            console.log("Successfully submitted:", response.data);
            setIsEditingCatalyst(false);
            fetch();

        } catch (error) {
            console.error("Catalyst Submit Error:", error);
            const message = error.response?.data?.message || error.message || "Unknown error"
            // alert(`Zoho One Error: ${message}`);

        } finally {
            setLoadingCatalyst(false);
        }
    };

    const handleSubmitZohoOne = async () => {
        setLoadingZohoOne(true);

        const payload = {
            available_hrs: `${zohoOneAvailableHr}:${zohoOneAvailableMin}`,
            allocated_hrs: `${zohoOneAllocatedHr}:${zohoOneAllocatedMin}`,
            total_hrs: calculateTotal(
                zohoOneAvailableHr,
                zohoOneAvailableMin,
                zohoOneAllocatedHr,
                zohoOneAllocatedMin
            ),
            team: "ZOHO_ONE",
            updated_by: role_name,
        };

        try {
            let response;

            if (zohoOneData?.ROWID) {

                response = await axios.put(`/server/custom-dashboard-data/custom-data/${zohoOneData.ROWID}`, payload);
            } else {

                response = await axios.post("/server/custom-dashboard-data/custom-data/", payload);
            }

            console.log("Zoho One data submitted successfully:", response.data);
            setIsEditingZohoOne(false);
            fetch();


        } catch (error) {
            console.error("Zoho One Submit Error:", error);
            const message = error.response?.data?.message || error.message || "Unknown error";
            // alert(`Zoho One Error: ${message}`);
        } finally {
            setLoadingZohoOne(false);
        }
    };
    useEffect(() => {
        const fetch = async () => {
            try {
                const range = Monthfilter
                console.log("daterange", range);

                const res = await axios.get(
                    `/server/project-details/monthly-team-allocated-hrs/?range=${range}`
                );
                setTeamtotalhr(res.data);
                console.log("show_data", res.data);
            } catch (err) { }
        };
        if (Monthfilter) {
            fetch();
        }
    }, [Monthfilter]);
    function formatModifiedTime(rawTime) {
        if (!rawTime) return '';
        const match = rawTime.match(/^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2})/);
        return match ? `${match[1]} ${match[2]}` : rawTime;
    }



    return (
        <div className="border bg-white mb-3 p-4">
            <div className="flex">
                <button type="button" onClick={() => setViewMode("static")} className={`py-2.5 px-5 me-2 mb-2 text-sm font-medium rounded-lg border focus:outline-none focus:z-10 focus:ring-4
  ${viewMode === "static"
                        ? "text-white bg-blue-700 border-blue-700 hover:bg-blue-800 focus:ring-blue-300"
                        : "text-gray-900 bg-white border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:ring-gray-100"}
`}>static</button>
                <button type="button" onClick={() => setViewMode("dynamic")} className={`py-2.5 px-5 me-2 mb-2 text-sm font-medium rounded-lg border focus:outline-none focus:z-10 focus:ring-4
  ${viewMode === "dynamic"
                        ? "text-white bg-blue-700 border-blue-700 hover:bg-blue-800 focus:ring-blue-300"
                        : "text-gray-900 bg-white border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:ring-gray-100"}
`}>Dynamic</button>
            </div>
            {/* dynamic card */}
            {viewMode === "dynamic" && (
                <div className="">
                    <div className="flex justify-end items-end">
                        <div className="relative w-48">
                            <select
                                className="appearance-none w-full py-2 px-3 bg-white border border-gray-300 text-gray-700 text-sm rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10 cursor-pointer"
                                onChange={(e) => setMonthfilter(e.target.value)}
                                value={Monthfilter}
                            >
                                {/* <option value="">Dates</option> */}
                                <option value="this_week">This Week</option>
                                <option value="current_week">Current Week</option>
                                <option value="next_week">Next Week</option>
                                <option value="this_month">This Month</option>
                                <option value="current_month">Current Month</option>
                                <option value="next_month">Next Month</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-500">
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            </div>
                        </div>

                    </div>

                    <div className="flex flex-col lg:flex-row gap-4 items-center justify-center xl:w-[52%] xl:ml-[25%] w-full">
                        {/* Full Stack Card */}
                        <div className="border bg-white rounded-xl p-4 shadow-md w-full">
                            {/* Image + Team Name */}
                            <div className="flex items-center gap-4 mb-2">
                                <img src={zohocatalyst} alt="Zoho Catalyst" className="w-14 h-14 object-contain" />
                                <h3 className="text-xl font-semibold text-black">ZOHO CATALYST</h3>
                            </div>

                            {/* Hours Details */}
                            <div className="flex flex-col gap-2 mb-3">
                                <div className="flex justify-between items-center">
                                    <p className="text-lg text-black">Total Hrs</p>
                                    <h3 className="text-lg font-bold text-black">
                                        {teamToalhr?.["Full Stack"]?.total ?? "0h 0m"}
                                    </h3>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-lg text-black">Available Hrs</p>
                                    <h3 className="text-lg font-bold text-black">
                                        {teamToalhr?.["Full Stack"]?.available ?? "0h 0m"}
                                    </h3>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-lg text-black">Allocated Hrs</p>
                                    <h3 className="text-lg font-bold text-black">
                                        {teamToalhr?.["Full Stack"]?.allocated ?? "0h 0m"}
                                    </h3>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="relative group w-full h-5 bg-gray-200 rounded-full overflow-hidden mt-4">
                                {/* Allocated bar (Blue) */}
                                <div
                                    className="h-full bg-blue-500 absolute top-0 left-0"
                                    style={{
                                        width: `${getPercentage(
                                            parseTime(teamToalhr?.["Full Stack"]?.allocated),
                                            parseTime(teamToalhr?.["Full Stack"]?.total)
                                        )}%`,
                                    }}
                                />
                                {/* Available bar (Green) */}
                                <div
                                    className="h-full bg-green-400 absolute top-0"
                                    style={{
                                        left: `${getPercentage(
                                            parseTime(teamToalhr?.["Full Stack"]?.allocated),
                                            parseTime(teamToalhr?.["Full Stack"]?.total)
                                        )}%`,
                                        width: `${getPercentage(
                                            parseTime(teamToalhr?.["Full Stack"]?.available),
                                            parseTime(teamToalhr?.["Full Stack"]?.total)
                                        )}%`,
                                    }}
                                />
                            </div>
                        </div>

                        {/* Refresh Button */}
                        <div className="flex items-center justify-center w-full lg:w-auto">
                            <button
                                type="button"
                                onClick={handleClick}
                                className="p-3 rounded-full hover:bg-gray-400 hover:text-white transition-all"
                            >
                                <RefreshCcw
                                    size={20}
                                    className={`transition-transform duration-500 ${spinning ? "animate-spin" : ""
                                        }`}
                                />
                            </button>
                        </div>

                        {/* Zoho One Card */}
                        <div className="border bg-white rounded-xl p-4 shadow-md w-full">
                            {/* Image + Team Name */}
                            <div className="flex items-center gap-4 mb-2">
                                <img src={zohoone} alt="Zoho One" className="w-14 h-14 object-contain" />
                                <h3 className="text-xl font-semibold text-black">ZOHO ONE</h3>
                            </div>

                            {/* Hours Details */}
                            <div className="flex flex-col gap-2 mb-3">
                                <div className="flex justify-between items-center">
                                    <p className="text-lg text-black">Total Hrs</p>
                                    <h3 className="text-lg font-bold text-black">
                                        {teamToalhr?.["Zoho One"]?.total ?? "0h 0m"}
                                    </h3>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-lg text-black">Available Hrs</p>
                                    <h3 className="text-lg font-bold text-black">
                                        {teamToalhr?.["Zoho One"]?.available ?? "0h 0m"}
                                    </h3>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-lg text-black">Allocated Hrs</p>
                                    <h3 className="text-lg font-bold text-black">
                                        {teamToalhr?.["Zoho One"]?.allocated ?? "0h 0m"}
                                    </h3>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="relative group w-full h-5 bg-gray-200 rounded-full overflow-hidden mt-4">
                                {/* Allocated bar (Blue) */}
                                <div
                                    className="h-full bg-blue-500 absolute top-0 left-0"
                                    style={{
                                        width: `${getPercentage(
                                            parseTime(teamToalhr?.["Zoho One"]?.allocated),
                                            parseTime(teamToalhr?.["Zoho One"]?.total)
                                        )}%`,
                                    }}
                                />
                                {/* Available bar (Green) */}
                                <div
                                    className="h-full bg-green-400 absolute top-0"
                                    style={{
                                        left: `${getPercentage(
                                            parseTime(teamToalhr?.["Zoho One"]?.allocated),
                                            parseTime(teamToalhr?.["Zoho One"]?.total)
                                        )}%`,
                                        width: `${getPercentage(
                                            parseTime(teamToalhr?.["Zoho One"]?.available),
                                            parseTime(teamToalhr?.["Zoho One"]?.total)
                                        )}%`,
                                    }}
                                />
                            </div>
                        </div>
                    </div><br></br>

                </div>
            )}

            {/* static */}
            {viewMode === "static" && (
                <div>
                    <div className="flex flex-col lg:flex-row gap-4 items-center justify-center xl:w-[52%] xl:ml-[25%] w-full">
                        {/* ZOHO CATALYST Section */}
                        <div className="border bg-white rounded-xl p-4 shadow-md w-full">
                            <div className="flex justify-between items-center gap-4 mb-2">
                                <div className="flex items-center gap-4 mb-2">
                                    <img src={zohocatalyst} alt="Zoho Catalyst" className="w-14 h-14 object-contain" />
                                    <h3 className="text-xl font-semibold text-black">ZOHO CATALYST</h3>
                                </div>
                                {!isEditingCatalyst ? (
                                    <button
                                        onClick={() => setIsEditingCatalyst(true)}
                                        className="px-2 py-1 mb-3 text-white rounded-lg bg-gradient-to-r from-[#008F39] via-[#008799] to-[#00417A]"
                                    >
                                        Edit
                                    </button>
                                ) : (
                                    <div className="flex gap-2 mb-3">
                                        <button
                                            onClick={handleSubmitCatalyst}
                                            disabled={loadingCatalyst}
                                            className="px-3 py-1 text-white rounded-lg bg-green-600 hover:bg-green-700 flex items-center gap-2"
                                        >
                                            {loadingCatalyst ? (
                                                <svg
                                                    className="animate-spin h-5 w-5 text-white"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                    ></circle>
                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8v8H4z"
                                                    ></path>
                                                </svg>
                                            ) : (
                                                <Send />
                                            )}
                                            {loadingCatalyst ? "Saving..." : ""}
                                        </button>
                                        <button
                                            onClick={() => setIsEditingCatalyst(false)}
                                            disabled={loadingCatalyst}
                                            className="px-3 py-1 text-white rounded-lg bg-gray-600 hover:bg-gray-700"
                                        >
                                            X
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-3 mb-3">
                                {/* Available Hrs */}
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                    <label className="text-lg text-black w-full sm:w-[40%]">Available Hrs</label>
                                    {!isEditingCatalyst ? (
                                        <input
                                            type="text"
                                            className="w-full sm:w-[60%] px-2 py-1 border rounded bg-gray-100"
                                            value={zohoCatalystData?.available_hrs || ""}
                                            disabled
                                        />
                                    ) : (
                                        <div className="flex gap-2 w-full sm:w-[60%]">
                                            <input
                                                type="number"
                                                min="0"
                                                placeholder="Hr"
                                                className="w-1/2 px-2 py-1 border rounded"
                                                value={zohoCatalystAvailableHr}
                                                onChange={(e) => setZohoCatalystAvailableHr(e.target.value)}
                                                disabled={loadingCatalyst}
                                            />
                                            <input
                                                type="number"
                                                min="0"
                                                max="59"
                                                placeholder="Min"
                                                className="w-1/2 px-2 py-1 border rounded"
                                                value={zohoCatalystAvailableMin}
                                                onChange={(e) => setZohoCatalystAvailableMin(e.target.value)}
                                                disabled={loadingCatalyst}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Allocated Hrs */}
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                    <label className="text-lg text-black w-full sm:w-[40%]">Allocated Hrs</label>
                                    {!isEditingCatalyst ? (
                                        <input
                                            type="text"
                                            className="w-full sm:w-[60%] px-2 py-1 border rounded bg-gray-100"
                                            value={zohoCatalystData?.allocated_hrs || ""}
                                            disabled
                                        />
                                    ) : (
                                        <div className="flex gap-2 w-full sm:w-[60%]">
                                            <input
                                                type="number"
                                                min="0"
                                                placeholder="Hr"
                                                className="w-1/2 px-2 py-1 border rounded"
                                                value={zohoCatalystAllocatedHr}
                                                onChange={(e) => setZohoCatalystAllocatedHr(e.target.value)}
                                                disabled={loadingCatalyst}
                                            />
                                            <input
                                                type="number"
                                                min="0"
                                                max="59"
                                                placeholder="Min"
                                                className="w-1/2 px-2 py-1 border rounded"
                                                value={zohoCatalystAllocatedMin}
                                                onChange={(e) => setZohoCatalystAllocatedMin(e.target.value)}
                                                disabled={loadingCatalyst}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Total Hrs */}
                                <div className="flex justify-between items-center">
                                    <label className="text-lg text-black w-[40%]">Total Hrs</label>
                                    <input
                                        type="text"
                                        className={`w-[60%] px-2 py-1 border rounded ${!isEditingCatalyst ? "bg-gray-100" : ""}`}
                                        value={calculateTotal(
                                            zohoCatalystAvailableHr,
                                            zohoCatalystAvailableMin,
                                            zohoCatalystAllocatedHr,
                                            zohoCatalystAllocatedMin
                                        )}
                                        disabled
                                    />
                                </div>
                            </div>

                            <p className="text-sm">
                                Last modified by {zohoCatalystData?.updated_by} on {formatModifiedTime(zohoCatalystData?.MODIFIEDTIME)}
                            </p>
                        </div>

                        {/* Refresh Button */}
                        <div className="flex items-center justify-center w-full lg:w-auto">
                            <button
                                type="button"
                                onClick={handleClick}
                                className="p-3 rounded-full hover:bg-gray-400 hover:text-white transition-all"
                            >
                                <RefreshCcw size={20} className={`transition-transform duration-500`} />
                            </button>
                        </div>

                        {/* ZOHO ONE Section */}
                        <div className="border bg-white rounded-xl p-4 shadow-md w-full">
                            <div className="flex justify-between items-center gap-4 mb-2">
                                <div className="flex items-center gap-4 mb-2">
                                    <img src={zohocatalyst} alt="Zoho One" className="w-14 h-14 object-contain" />
                                    <h3 className="text-xl font-semibold text-black">ZOHO ONE</h3>
                                </div>
                                {!isEditingZohoOne ? (
                                    <button
                                        onClick={() => setIsEditingZohoOne(true)}
                                        className="px-2 py-1 mb-3 text-white rounded-lg bg-gradient-to-r from-[#008F39] via-[#008799] to-[#00417A]"
                                    >
                                        Edit
                                    </button>
                                ) : (
                                    <div className="flex gap-2 mb-3">
                                        <button
                                            onClick={handleSubmitZohoOne}
                                            disabled={loadingZohoOne}
                                            className="px-3 py-1 text-white rounded-lg bg-green-600 hover:bg-green-700 flex items-center gap-2"
                                        >
                                            {loadingZohoOne ? (
                                                <svg
                                                    className="animate-spin h-5 w-5 text-white"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                    ></circle>
                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8v8H4z"
                                                    ></path>
                                                </svg>
                                            ) : (
                                                <Send />
                                            )}
                                            {loadingZohoOne ? "Saving..." : ""}
                                        </button>
                                        <button
                                            onClick={() => setIsEditingZohoOne(false)}
                                            disabled={loadingZohoOne}
                                            className="px-3 py-1 text-white rounded-lg bg-gray-600 hover:bg-gray-700"
                                        >
                                            X
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-3 mb-3">
                                {/* Available Hrs */}
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                    <label className="text-lg text-black w-full sm:w-[40%]">Available Hrs</label>
                                    {!isEditingZohoOne ? (
                                        <input
                                            type="text"
                                            className="w-full sm:w-[60%] px-2 py-1 border rounded bg-gray-100"
                                            value={zohoOneData?.available_hrs || ""}
                                            disabled
                                        />
                                    ) : (
                                        <div className="flex gap-2 w-full sm:w-[60%]">
                                            <input
                                                type="number"
                                                min="0"
                                                placeholder="Hr"
                                                className="w-1/2 px-2 py-1 border rounded"
                                                value={zohoOneAvailableHr}
                                                onChange={(e) => setZohoOneAvailableHr(e.target.value)}
                                                disabled={loadingZohoOne}
                                            />
                                            <input
                                                type="number"
                                                min="0"
                                                max="59"
                                                placeholder="Min"
                                                className="w-1/2 px-2 py-1 border rounded"
                                                value={zohoOneAvailableMin}
                                                onChange={(e) => setZohoOneAvailableMin(e.target.value)}
                                                disabled={loadingZohoOne}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Allocated Hrs */}
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                    <label className="text-lg text-black w-full sm:w-[40%]">Allocated Hrs</label>
                                    {!isEditingZohoOne ? (
                                        <input
                                            type="text"
                                            className="w-full sm:w-[60%] px-2 py-1 border rounded bg-gray-100"
                                            value={zohoOneData?.allocated_hrs || ""}
                                            disabled
                                        />
                                    ) : (
                                        <div className="flex gap-2 w-full sm:w-[60%]">
                                            <input
                                                type="number"
                                                min="0"
                                                placeholder="Hr"
                                                className="w-1/2 px-2 py-1 border rounded"
                                                value={zohoOneAllocatedHr}
                                                onChange={(e) => setZohoOneAllocatedHr(e.target.value)}
                                                disabled={loadingZohoOne}
                                            />
                                            <input
                                                type="number"
                                                min="0"
                                                max="59"
                                                placeholder="Min"
                                                className="w-1/2 px-2 py-1 border rounded"
                                                value={zohoOneAllocatedMin}
                                                onChange={(e) => setZohoOneAllocatedMin(e.target.value)}
                                                disabled={loadingZohoOne}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Total Hrs */}
                                <div className="flex justify-between items-center">
                                    <label className="text-lg text-black w-[40%]">Total Hrs</label>
                                    <input
                                        type="text"
                                        className={`w-[60%] px-2 py-1 border rounded ${!isEditingZohoOne ? "bg-gray-100" : ""}`}
                                        value={calculateTotal(
                                            zohoOneAvailableHr,
                                            zohoOneAvailableMin,
                                            zohoOneAllocatedHr,
                                            zohoOneAllocatedMin
                                        )}
                                        disabled
                                    />
                                </div>
                            </div>

                            <p className="text-sm">
                                Last modified by {zohoOneData?.updated_by} on {formatModifiedTime(zohoOneData?.MODIFIEDTIME)}
                            </p>
                        </div>
                    </div>
                </div>
            )}






        </div>
    )
}

export default Dashboardteam