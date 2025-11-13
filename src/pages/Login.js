import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "../assets/css/Login.css";

import Naming from "../assets/Images/Naming.svg";
const Login = () => {
  useEffect(() => {
    const config = {
      css_url: "/app/embeddediframe.css",
      forgot_password_css_url: "/app/embedded_password_reset.css",
    };
    window.catalyst.auth.signIn("loginDiv", config);
    sessionStorage.setItem("isLoggedIn", "true");
  }, []);

  return (
    <section class="">
      <div className="grid h-screen grid-cols-2">
        <div className="Mainloginpage h-full flex justify-end items-center">
          <img
            className="ETP-logo absolute top-45 z-10"
            src={Naming}
            alt="ETC-image"
          />
        </div>
        <div className="flex justify-center items-center relative">
          <div
            className="loginpages"
            id="loginDiv"
            style={{
              height: "60vh",
              width: "50vw",
            }}
          ></div>

          <div
            className="homepage"
            style={{
              position: "absolute",
              // right: "30%",
              bottom: "15%",
              color: "black",
              fontSize: "20px",
              padding: "5px",
            }}
          >
            Don't have an account?{" "}
            <Link
              to="/signup"
              style={{
                textDecoration: "underline",
                color: "#009CDC",
              }}
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
