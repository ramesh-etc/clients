import React, { useEffect, useState, useRef } from 'react';
import { useForm } from "react-hook-form";
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import SignatureCanvas from 'react-signature-canvas';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

export const TaskSubmit = () => {
    const { id } = useParams();
    const isSidebarShrunk = useSelector((state) => state.sidebar.isSidebarShrunk);
    const [taskDetails, setTaskDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const sigCanvas = useRef(null);
    const [signatureId, setSignatureId] = useState(null);
    const [projectStatus, setProjectStatus] = useState("");

    const { register, handleSubmit, watch, formState: { errors } } = useForm();

    useEffect(() => {
        const fetchTaskDetails = async () => {
            try {
                const response = await axios.get(`/server/tasks/get/task-details/${id}`);
                const data = response.data[0].Task_Details;
                setTaskDetails(data);
            } catch (err) {
                console.error("Error fetching task details:", err);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchTaskDetails();
        }
    }, [id]);

    if (loading) return <div className='flex justify-center'>
        <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-gray-500 border-solid"></div>
    </div>;

    const handleSave = () => {
        if (sigCanvas.current.isEmpty()) {
            alert("Please provide a signature first.");
            return;
        }

        const signatureData = sigCanvas.current.toDataURL("image/png");
        const byteString = atob(signatureData.split(',')[1]);
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const uintArray = new Uint8Array(arrayBuffer);

        for (let i = 0; i < byteString.length; i++) {
            uintArray[i] = byteString.charCodeAt(i);
        }

        const file = new Blob([arrayBuffer], { type: "image/png" });
        const fileObject = new File([file], "signature.png", { type: "image/png" });

        var filestore = window.catalyst.file;
        var folder = filestore.folderId("9388000000039333");
        var uploadPromise = folder.uploadFile(fileObject).start();

        uploadPromise
            .then((response) => {
                const id = response.content.id;
                setSignatureId(id);
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const onSubmit = (data) => {
        if (projectStatus === "Completed" && sigCanvas.current.isEmpty()) {
            alert("Signature is required when the project is completed.");
            return;
        }
        console.log("Form Submitted:", data);
    };

    return (
        <div className="flex flex-col md:flex-row">
            <Sidebar />
            <div className={`flex-1 min-h-screen bg-gray-100 p-0 transition-all duration-300 ease-in-out 
                ${isSidebarShrunk ? "ml-0 md:ml-[90px]" : "ml-40"}`}>
                <Header />
                <div className='p-6'>
                    <div className="flex flex-col sm:flex-row justify-between">
                        <h1 className="text-2xl font-bold mb-4">Task Details</h1>
                        <h3 className="text-l font-bold mb-4">
                            <Link to="/dashboard" className="text-[#DC2626] hover:underline">
                                Dashboard
                            </Link> / Task Details
                        </h3>
                    </div>
                    <div className="p-3 border border-gray-200 rounded-xl m-10 shadow-2xl">
                        {taskDetails && (
                            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 p-10">
                                <div className="mb-4">
                                    <label className="block text-gray-700 font-medium mb-2">Project Name</label>
                                    <input className="border border-gray-400 rounded w-full py-2 px-3 bg-gray-200" type="text" value={taskDetails.Project_Name} disabled />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-gray-700 font-medium mb-2">Customer Name</label>
                                    <input className="border border-gray-400 rounded w-full py-2 px-3 bg-gray-200" type="text" value={taskDetails.Cus_Name} disabled />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-gray-700 font-medium mb-2">Project Status <span className="text-red-600">*</span></label>
                                    <select
                                        {...register("Project_Status", { required: "Project Status is required" })}
                                        className="border border-gray-400 bg-[#EBEBEB] rounded w-full py-2 px-3"
                                        value={projectStatus}
                                        onChange={(e) => setProjectStatus(e.target.value)}
                                    >
                                        <option value="">Select Status</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Not Started">Not Started</option>
                                        <option value="Completed">Completed</option>
                                    </select>
                                    {errors.Project_Status && <p className="text-red-500 text-xs italic">{errors.Project_Status.message}</p>}
                                </div>

                                {projectStatus === "Completed" && (
                                    <div className="mb-4">
                                        <label className="block text-gray-700 font-medium mb-1">Signature <span className="text-red-600">*</span></label>
                                        <div className="border border-gray-300 rounded-md bg-gray-100 
                                            w-full sm:max-w-full md:max-w-md lg:max-w-lg 
                                            h-40 flex justify-center items-center">
                                            <SignatureCanvas
                                                ref={sigCanvas}
                                                penColor="grey"
                                                canvasProps={{
                                                    className: "w-full h-full border border-grey-400 bg-[#ebebeb]",
                                                }}
                                            />
                                        </div>

                                        <div className="mt-3 flex flex-wrap gap-2">
                                            <button
                                                className={`px-4 py-2 rounded text-white 
                                                    ${sigCanvas.current?.isEmpty() ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"}`}
                                                onClick={handleSave}
                                                type="button"
                                                disabled={sigCanvas.current?.isEmpty()}
                                            >
                                                Save
                                            </button>
                                            <button
                                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                                type="button"
                                                onClick={() => sigCanvas.current?.clear()}
                                            >
                                                Clear
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <button
                                    className={`bg-indigo-500 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:shadow-outline ${projectStatus === "Completed" && sigCanvas.current?.isEmpty() ? "opacity-50 cursor-not-allowed" : ""}`}
                                    type="submit"
                                    disabled={projectStatus === "Completed" && sigCanvas.current?.isEmpty()}
                                >
                                    Submit
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
