import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import TimelineCom from "./TimelineCom";
import { Link } from "react-router-dom";
import SalesIqBot from "../SalesIqBot";

export const LogDetails = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [userId, setUserId] = useState(10); 


    const onSubmit = async (data) => {
        console.log("Submitting Data:", data);
        const authResult = await window.catalyst.auth.isUserAuthenticated();
        console.log("result", authResult);
        const firstName = authResult.content.first_name;
        const userRole = authResult.content.role_details.role_name;
        const roleId = authResult.content.role_details.role_id;
   
        const finalData = {
            ...data,
            user_id: userId,
            user: firstName +" "+userRole,
        };
        console.log("11111111",finalData)

        try {
            const response = await axios.post("/server/log_creator/create", finalData);
            console.log("API Response:", response.data);
            alert("Added Successfully!");
            
          
            setUserId(prevId => prevId + 1);
        } catch (error) {
            console.error("API Error:", error.response?.data || error.message);
            alert("Failed to add client. Check console.");
        }
    };

    return (
        <div className="flex row w-full">
            <div className="flex justify-center pl-4 items-center  bg-gray-100 w-full">
          
            
            
            <TimelineCom/>
            </div>
        </div>
    );
};