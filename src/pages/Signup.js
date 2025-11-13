import "../assets/css/Signup.css";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Naming from "../assets/Images/Naming.svg";

import '../assets/css/Login.css'

function Signup() {

    const [displayText, setDisplayText] = useState("");
    const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    });
 
    const navigate = useNavigate(); 

    const [error, setError] = useState("");

    const [showForm, setShowForm] = useState(true);
    const nameRegex = /^[a-zA-Z \-_']+$/;
    const nameRegex1 = /^[a-zA-Z][a-zA-Z \-_]*$/;

    const handleSubmit = async (event) => {
    event.preventDefault();

    let hasErrors = false;
    let errorMessage = '';

    if (!nameRegex1.test(form.firstName) && !nameRegex.test(form.lastName)) {
        errorMessage = 'Please enter valid first and last name.';
        hasErrors = true;
    } 
    else if (!nameRegex1.test(form.firstName)) {
        errorMessage = 'First name must start with a letter and can contain letters, spaces, hyphens, underscores, or apostrophes.';
        hasErrors = true;
    } 
    else if (!nameRegex.test(form.lastName)) {
        errorMessage = 'Last name can only contain letters, spaces, hyphens, underscores, or apostrophes.';
        hasErrors = true;
    }

    setError(errorMessage.trim());
    
    if (hasErrors) {
      return;
    }

    setShowForm(false);

    var data = {
    first_name: form.firstName,
    last_name: form.lastName,
    email_id: form.email,
    platform_type: "web",
    };

    const auth = window.catalyst.auth;
    var signupResponse = await auth.signUp(data);
    debugger;
    if (signupResponse.status == 200) {
            setDisplayText(
                "An account verification email has been sent to your email address"
                );
                setTimeout(function () {
                window.location.href = "/";
                }, 3000);
    } 

    else {
            console.log(signupResponse.message);
            setDisplayText(
                signupResponse.message
            );
            // setTimeout(() => {
            //     navigate("/signup"); 
            // }, 3000);
            setTimeout(function () {
                window.location.href ="/";
                }, 3000);
            }
};


    return (
       <div className="  grid h-screen grid-cols-2" >

       
            <div className="jemkon-logo Mainloginpage h-full flex justify-end items-center" >
                      <img  src={Naming} alt='jemkon-image'/>
                    </div>
                
            
                <div style={{marginTop:'4%'}} className="flex justify-center items-center relative">
                    <div 
                        className="right-content" 
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '100%',
                            padding: 3,
                            borderRadius: '6px',
                        }}
                    >
                        {showForm ? (
                            <div className="right-div">
                                <form onSubmit={handleSubmit} className="modal-content">
                                    <center>
                                        <h1>Sign Up</h1>
                                    </center>
                                    <div className="input-container">
                                        <label htmlFor="firstName">
                                            <input
                                                name="firstName"
                                                className="inputs"
                                                placeholder="First Name"
                                                value={form.firstName}
                                                onChange={(e) => {
                                                    setForm({
                                                        ...form,
                                                        firstName: e.target.value,
                                                    });
                                                }}
                                                required
                                            />
                                        </label>

                                        <label htmlFor="lastName">
                                            <input
                                                className="inputs"
                                                placeholder="Last Name"
                                                value={form.lastName}
                                                onChange={(e) => {
                                                    setForm({
                                                        ...form,
                                                        lastName: e.target.value,
                                                    });
                                                }}
                                                required
                                            />
                                        </label>

                                        <label htmlFor="email">
                                            <input
                                                className="inputs"
                                                type="email"
                                                placeholder="Email address"
                                                value={form.email}
                                                onChange={(e) => {
                                                    setForm({ ...form, email: e.target.value });
                                                }}
                                                required
                                            />
                                        </label>
                                    </div>
                                    {error && (
                                        <p className="error-message">{error}</p>
                                    )}
                                    <center>
                                        <input type="submit" value="Sign Up" className="signupfnbtn" />
                                    </center>
                                </form>
                                <div className="or-divider">or</div>

                                <div className="sign-in-link">
                                    <p>
                                        Already have an account?{" "}
                                        <Link
                                            to="/"
                                            style={{ color: "#009CDC", textDecoration: "underline", padding: '5px', fontWeight: 'lighter' }}
                                        >
                                            Sign In
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <p>{displayText}</p>
                        )}
                    </div>
                </div>
               
                </div>  
    
    );
}
export default Signup;