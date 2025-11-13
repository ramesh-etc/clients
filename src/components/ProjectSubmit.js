import React, { useEffect, useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useForm } from "react-hook-form";
import SignatureCanvas from 'react-signature-canvas';
import { useRef } from 'react';
import { Link, Navigate } from "react-router-dom";
import { useNavigate } from 'react-router-dom';

function ProjectSubmit() {
    const { id } = useParams();
    const isSidebarShrunk = useSelector((state) => state.sidebar.isSidebarShrunk);
      const user = useSelector((state)=>state.user.role_details);
    
    const [taskDetails, setTaskDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [edit,setEdit]=useState(false);
    const [update,setUpdate] = useState(false)
    const [paymentStatus, setPaymentStatus] = useState(false);
    const [materialStatus, setMaterialStatus] = useState(false);
    const [Project, setProject] = useState(false);
    const [Edited, setEdited] = useState(false);
    const [userAuth, setUserAuth] = useState("");
    const [originalTaskDetails, setOriginalTaskDetails] = useState({});
    const [isAdmin, setIsAdmin] = useState(false);
    const [isUser, setIsUser] = useState(false);
    // --------------------sign state--------------------------
    const sigCanvas = useRef(null);
    const [signatureId, setSignatureId] = useState(null);
    const [projectStatus, setProjectStatus] = useState("");
const [signed,setSigned] = useState(false)
const [paylod,setPayload] =useState()

useEffect(() => {
  if (user && user.role_name) {
      const isAdminUser = user.role_name === "App Administrator";
      setIsAdmin(isAdminUser);
      setIsUser(!isAdminUser);
  }
}, [user]);

// useEffect(() => {
//   fetch(`/server/tasks/get/task-details/${id}`)
//     .then((res) => res.json())
//     .then((data) => {
//       setTaskDetails(data);
//       setOriginalTaskDetails(data);
//     });
// }, []);


    const { register, handleSubmit, formState: { errors } } = useForm();
const navigate = useNavigate();
    // useEffect(() => {
    //     const fetchTaskDetails = async () => {
    //         try {
    //             const response = await axios.get(`/server/tasks/get/task-details/${id}`);
    //             setTaskDetails(response.data[0].Task_Details);

    //              const data = response.data[0].Task_Details;
    //             setProjectStatus(data.Project_Status || "");
    //             console.log(response.data[0].Task_Details);
    //         } catch (err) {
    //             console.error("Error fetching task details:", err);
    //         } finally {
    //             setLoading(false);
    //         }
    //     };

    //     if (id) {
    //         fetchTaskDetails();
    //     }
    // }, [id]);
    useEffect(() => {
      const fetchTaskDetails = async () => {
        try {
          const response = await axios.get(`/server/tasks/get/task-details/${id}`);
          const taskData = response.data[0].Task_Details;
          setTaskDetails(taskData);
          setOriginalTaskDetails({...taskData});
          setProjectStatus(taskData.Project_Status || "");
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
    

    if (loading) return <div>
        <div className='flex justify-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-t-4 border-gray-500 border-solid'></div>
        </div>
    </div> ;
    const onSubmit = async (data) => {
        if (projectStatus === "Completed" && (!signatureId || sigCanvas.current.isEmpty())) {
            alert("Signature is required when the project is completed.");
            return;
        }else if(projectStatus === "In Progress"){
setSignatureId("In Progress")
        }else{
            setSignatureId("not started")
        }
    
        const formData = new FormData();
    
        // Append form fields
        for (let key in data) {
            formData.append(key, data[key]);
        }
    
        // Append the signature ID if available
        if (signatureId) {
            formData.append("Signature_Id", signatureId);

        }
    if(id){
        formData.append("ROWID",id)
        console.log("row id",id)

    }
        console.log("Payload being sent:", Object.fromEntries(formData)); // Debugging
    const payload = Object.fromEntries(formData)
        try {
            const response = await axios.post("/server/tasks/update/task/", 
                payload);
    
            console.log("Response from server:", response.data);
            alert("Task submitted successfully!");
        } catch (error) {
            console.error("Error submitting task:", error);
            alert("Failed to submit the task.");
        }
    };

    // const onSubmit = (data) => {
    //     if (projectStatus === "Completed" && sigCanvas.current.isEmpty()) {
    //         alert("Signature is required when the project is completed.");
    //         return;
    //     }
    //     console.log("Form Submitted:", data);
       
    // };

    // -----------------------signature function----------------------------------
    const handleSave = () => {
        if (sigCanvas.current.isEmpty()) {
            alert("Please provide a signature first.");
            return;
        }
        // Save signature as a Data URL (Base64 PNG format)
        const signatureData = sigCanvas.current.toDataURL("image/png");
        console.log("sign", signatureData);

        const byteString = atob(signatureData.split(',')[1]); // Remove the "data:image/png;base64," part
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const uintArray = new Uint8Array(arrayBuffer);

        for (let i = 0; i < byteString.length; i++) {
            uintArray[i] = byteString.charCodeAt(i);
        }

        const file = new Blob([arrayBuffer], { type: "image/png" });
        const fileObject = new File([file], "signature.png", { type: "image/png" });
        console.log("FileObject", fileObject);

        var filestore = window.catalyst.file;
        console.log("called");
        var folder = filestore.folderId("9388000000039333");

        var uploadPromise = folder.uploadFile(fileObject).start();
        uploadPromise

            .then((response) => {

                const id = response.content.id;
                console.log(id);
                setSignatureId(id);
                setSigned(true)
                console.log("signatureId", signatureId);
                
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const handleEditClick = () => {
      setEdit(true);
      setEdited(true);
    };
    
    // Function to handle cancel button click
    const handleCancelClick = () => {
      setEdit(false);
      setEdited(false); 
      setTaskDetails({...originalTaskDetails});
      setProjectStatus(originalTaskDetails.Project_Status || "");
    };


    return (
        <div className="flex flex-col md:flex-row">
            <div className='p-8 pt-3 w-full'>
          <nav class="flex mb-5 ml-3" aria-label="Breadcrumb">
           <ol class="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
          <li class="inline-flex items-center">
            <Link to="/projectdetails" className="ms-1 text-[14px] text-gray-400  md:ms-2 dark:text-gray-400 dark:hover:text-gray-500">
               Project List
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
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 9 4-4-4-4" />
              </svg>
              <span class="inline-flex items-center text-[14px]  text-[#DC2626]">Project Details</span>
            </div>
          </li>
        </ol>
       </nav>

       
       <div className="flex flex-row justify-between m-3 mt-8">
       <div className="flex flex-col justify-between pl-2">
              <h1 className="text-[22px] font-semiBold font-arial mb-1">Project Details</h1>
        </div>          
       </div>
       <div className="p-6 border rounded-lg shadow-md   bg-gray-50">
      {taskDetails && (
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Row 1: Customer Name and Phone Number */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="Cus_Name">
                Customer Name
              </label>
              <input
                {...register("Cus_Name", { required: "Token ID is required" })}
                className="appearance-none border border-gray-300 rounded-lg w-full py-2.5 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 disabled:bg-gray-300 disabled:text-gray-500"
                id="Cus_Name"
                type="text"
                value={taskDetails.Cus_Name}
                disabled
              />
              {errors.Customer_Name && <p className="text-red-500 text-xs italic mt-1">{errors.Customer_Name.message}</p>}
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="Phone_No">
                Phone Number
              </label>
              <input
                {...register("Phone_No", { required: "Token ID is required" })}
                className="appearance-none border border-gray-300 rounded-lg w-full py-2.5 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 disabled:bg-gray-300 disabled:text-gray-500"
                id="Phone_Number"
                type="text"
                value={taskDetails.Phone_No}
                disabled
              />
              {errors.Phone_No && <p className="text-red-500 text-xs italic mt-1">{errors.Phone_No.message}</p>}
            </div>
          </div>
          
          {/* Row 2: Start Date and End Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="Start Date">
                Start Date
              </label>
              <input
                {...register("Start_Date", { required: "Token ID is required" })}
                className="appearance-none border border-gray-300 rounded-lg w-full py-2.5 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 disabled:bg-gray-300 disabled:text-gray-500"
                id="Start_Date"
                type="date"
                value={taskDetails.Start_Date}
                disabled
              />
              {errors.Start_Date && <p className="text-red-500 text-xs italic mt-1">{errors.Start_Date.message}</p>}
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="End_Date">
                End Date
              </label>
              <input
                {...register("End_Date", { required: "Token ID is required" })}
                className="appearance-none border border-gray-300 rounded-lg w-full py-2.5 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 disabled:bg-gray-300 disabled:text-gray-500"
                id="End_Date"
                type="date"
                value={taskDetails.End_Date}
                disabled
              />
              {errors.End_Date && <p className="text-red-500 text-xs italic mt-1">{errors.End_Date.message}</p>}
            </div>
          </div><hr/><br/>
          
          {/* Row 3: Project Name and Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="Project_Name">
                Project Name
              </label>
              <input
                {...register("Project_Name", { required: "Project Name is required" })}
                className="appearance-none border border-gray-300 rounded-lg w-full py-2.5 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 disabled:bg-gray-300 disabled:text-gray-500"
                id="Project_Name"
                type="text"
                value={taskDetails.Project_Name}
                disabled
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="Total_Sqft">
                Total Square Feet
              </label>
              <div className="flex">
                <input
                  {...register("Total_Sqft")}
                  className="appearance-none border border-gray-300 rounded-l-lg w-full py-2.5 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 disabled:bg-gray-300 disabled:text-gray-500"
                  id="Total_Sqft"
                  type="text"
                  value={taskDetails.Total_Sqft}
                  disabled
                />
                <div className="bg-gray-200 text-gray-700 px-3  border border-gray-300 border-l-0 rounded-r-lg h-10 mt-2 flex items-center">
                  Sq.ft
                </div>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="Project_Description">
                Project Description
              </label>
              <textarea
                {...register("Project_Description")}
                className="appearance-none border mt-2 border-gray-300 rounded-lg w-full py-2.5 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-100 disabled:text-gray-500 disabled:bg-gray-300"
                id="Project_Description"
                rows={1}
                value={taskDetails.Project_Description}
                disabled
              />
            </div>

            <div>
              <div className='flex justify-between'>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="Project_Status">
                Project Status <span className="text-red-600 text-base">*</span>
              </label>
              </div>
           
              <div className="relative mt-2">
                <select
                    {...register("Project_Status", { 
                      required: isUser && edit ? "Project Status is required" : false
                    })}
                  className="appearance-none border border-gray-300 rounded-lg w-full py-2.5 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-100 disabled:text-gray-500 disabled:bg-gray-300"
                  id="Project_Status"
                  value={taskDetails.Project_Status}
                  // onChange={(e) => setProjectStatus(e.target.value)}
                  // disabled={!Project || !Edited}
                  disabled={!isUser || !edit}
                  onChange={(e) => setTaskDetails({ ...taskDetails, Project_Status: e.target.value })}
                >
                  <option value="">Select Status</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Not Started">Not Started</option>
                  <option value="Completed">Completed</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
              {errors.Project_Status && (
                <p className="text-red-500 text-xs italic mt-1">{errors.Project_Status.message}</p>
              )}
            </div>

         
          </div>
          
          {/* Row 4: Project Amount and Payment Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="Project_Amount">
                Project Amount
              </label>
              <input
                {...register("Project_Amount")}
                className="appearance-none border border-gray-300 rounded-lg w-full py-2.5 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 disabled:bg-gray-300 disabled:text-gray-500"
                id="Project_Amount"
                type="text"
                value={taskDetails.Project_Amount}
                disabled
              />
              {errors.Project_Amount && <p className="text-red-500 text-xs italic mt-1">{errors.Project_Amount.message}</p>}
            </div>
            <div>
              <div className='flex justify-between'>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="Payment_Status">
                Payment Status <span className="text-red-600 text-base">*</span>
              </label>
              <div>
              </div>
              </div>
            
              <div className="relative">
                <select
                  // {...register("Payment_Status", { required: "Payment Status is required" })}
                  {...register("Payment_Status", { 
                    required: isAdmin && edit ? "Payment Status is required" : false 
                  })}
            
                  className="appearance-none border mt-2 border-gray-300 rounded-lg w-full py-2.5 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 disabled:text-gray-500 disabled:bg-gray-300" 
                  // disabled={!paymentStatus || !Edited}
                  disabled={!isAdmin || !edit}
                  id="Payment_Status" value={taskDetails.Payment_Status}
                  onChange={(e) => setTaskDetails({ ...taskDetails, Payment_Status: e.target.value })}
                >
                  <option value="">Select Status</option>
                  <option value="Paid">Paid</option>
                  <option value="Paid">Not Paid</option>
                  <option value="Pending">Partially Paid</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
              {errors.Payment_Status && (
                <p className="text-red-500 text-xs italic mt-1"disabled={!paymentStatus || !Edited}>{errors.Payment_Status.message}</p>
              )}
            </div>
          </div><hr/><br/>
          
          {/* Row 5: Materials and Material Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="Materials">
                Materials <span className="text-red-600 text-base">*</span>
              </label>
              <textarea
                // {...register("Materials", { required: "Material required" })}
                {...register("Materials", { 
                  required: isUser && edit ? "Material required" : false 
                })}
                className="appearance-none border border-gray-300 rounded-lg w-full py-2.5 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-200 disabled:text-gray-500 disabled:bg-gray-300"
                // disabled
                disabled={!isUser || !edit}
                id="Material_Status"
                rows={1}
                value={taskDetails.Materials}
              />
              {errors.Materials && <p className="text-red-500 text-xs italic mt-1" disabled>{errors.Materials.message}</p>}
            </div>
            <div>
              <div className='flex justify-between'>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="Material_Status">
                Materials Status <span className="text-red-600 text-base">*</span>
              </label>
              </div>
             
              <div className="relative">
                <select
                  // {...register("Material_Status", { required: "Material Status is required" })}
                  {...register("Material_Status", { 
                    required: isUser && edit ? "Material Status is required" : false 
                  })}
            
                  className="appearance-none border border-gray-300 rounded-lg w-full py-2.5 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-100 disabled:text-gray-500 disabled:bg-gray-300"
                  id="Material_Status" value={taskDetails.Material_Status}
                  // disabled={!materialStatus || !Edited}
                  disabled={!isUser || !edit}
                  onChange={(e) => setTaskDetails({ ...taskDetails, Material_Status: e.target.value })}
                >
                  <option value="">Select Status</option>
                  <option value="Recevied">Received</option>
                  <option value="Not Recevied">Not Received</option>
                  <option value="Delayed">Waiting For Material</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Shortage">Shortage</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
              {errors.Material_Status && (
                <p className="text-red-500 text-xs italic mt-1" disabled={!materialStatus || !Edited}>{errors.Material_Status.message}</p>
              )}
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-4'>
          <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="Contractor">
                Contractor
              </label>
              <input
                {...register("Contractor", { required: "Token ID is required" })}
                className="appearance-none border border-gray-300 rounded-lg w-full py-2.5 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 disabled:bg-gray-300 disabled:text-gray-500"
                id="Cus_Name"
                type="text"
                value={taskDetails.Contractor}
                disabled
              />
              {errors.Customer_Name && <p className="text-red-500 text-xs italic mt-1">{errors.Customer_Name.message}</p>}
            </div>
          </div>

          
          {/* Row 6: Total Square Feet and Project Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
         
          </div>
          
          {/* Signature Section - Only visible when project status is "Completed" */}
          {/* {projectStatus === "Completed" && (
            <div className="mb-6 w-full md:w-1/2">
              <label className="block text-gray-700 font-medium mb-2" htmlFor="signature">
                Signature{isUser && edit && <span className="text-red-600 text-base">*</span>}
              </label>
              <div className="relative border border-gray-300 rounded-lg bg-gray-100 w-full h-40 flex justify-center items-center">
                    <SignatureCanvas
                    ref={sigCanvas}
                    penColor="grey"
                    canvasProps={{
                    className: "w-full h-full rounded-lg",
                    }}
                   />
          
                 {(!isUser || !edit) && (
        <div className="absolute inset-0 bg-gray-300 opacity-50 cursor-not-allowed"></div>
      )}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  className={`px-4 py-2 rounded text-white transition-colors duration-200 ${
                    sigCanvas.current?.isEmpty() 
                      ? "bg-red-300 cursor-not-allowed" 
                      : "bg-red-500 hover:bg-green-600"
                  }`}
                  onClick={handleSave}
                >
                  Save
                </button>
                <button
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors duration-200"
                  onClick={() => sigCanvas.current?.clear()}
                >
                  Clear
                </button>
              </div>
            </div>
          )} */}
          
          {/* Submit and Cancel Buttons */}
          {/* <div className="flex flex-row gap-4 justify-center mt-8 border-t pt-6">
            <button
              className={`bg-red-500 text-white py-2.5 px-6 rounded-lg  ${
                projectStatus === "Completed" && sigCanvas.current?.isEmpty() 
                  ? "opacity-50 cursor-not-allowed" 
                  : "hover:bg-red-700"
              }`}
              type="submit"
            >
              Submit
            </button>
            <button
              className="bg-gray-500 text-white py-2.5 px-6 rounded-lg"
              onClick={() => navigate("/taskdetails")}
            >
              Cancel
            </button>
          </div> */}

          <div className='flex flex-row gap-4 justify-center mt-8 border-t pt-6'>
          {!edit && (
        <div className='flex gap-3'>
            <button 
                type="button" 
                className='bg-red-500 text-white py-2.5 px-6 rounded-lg'
                onClick={handleEditClick}
            >
                Edit
            </button>
            <Link to={"/projectdetails"}>
                <button className='bg-gray-500 text-white py-2.5 px-6 rounded-lg'>Back</button>
            </Link>
        </div>
    )}

{edit && (
        <div className='flex gap-3'>
            <button 
                type="submit" 
                className='bg-red-500 text-white py-2.5 px-6 rounded-lg'
            >
                Update
            </button>
            <button 
                type="button" 
                className='bg-gray-500 text-white py-2.5 px-6 rounded-lg'
                onClick={handleCancelClick}
            >
                Cancel
            </button>
        </div>
    )}

          </div>
        </form>
      )}
    </div>
</div>
                      </div>
    );
}

export default ProjectSubmit;
