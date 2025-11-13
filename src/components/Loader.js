import React from 'react';
import styled from 'styled-components';
import logo from '../assets/Images/logo.svg';

const Loader = () => {
  return (
    <div className="flex-col gap-4 w-full flex items-center justify-center">
    {/* Rotating border ring */}
    <div className="relative w-[65px] h-[65px]">
      <div className="w-full h-full border-4 border-gray-300 border-t-[#008D59] rounded-full animate-spin"></div>

      {/* Static centered image */}
      <div className="absolute inset-0 flex items-center justify-center">
        <img src={logo} alt="logo" className="w-8 h-8" />
      </div>
    </div>
  </div>
  );
};

// const StyledWrapper = styled.div`
//   .progress {
//     display: flex;
//     gap: 5px;
//     align-items: center;
//     justify-content: center;
//     text-align: center;
//     width: 300px;
//     margin-top: 30%;
//     backface-visibility: hidden;
//   }

//   .inner:nth-child(1),
//   .inner:nth-child(2),
//   .inner:nth-child(3),
//   .inner:nth-child(4),
//   .inner:nth-child(5) {
//     height: 20px;
//     width: 20px;
//     border-radius: 3px;
//     animation: progress 1.2s ease-in infinite;
//   }

//   .inner:nth-child(1) {
//     background-color: #2193b0;
//     animation-delay: 0.15s;
//   }

//   .inner:nth-child(2) {
//     background-color: #48b1bf;
//     animation-delay: 0.25s;
//   }

//   .inner:nth-child(3) {
//     background-color: #56ab2f;
//     animation-delay: 0.35s;
//   }

//   .inner:nth-child(4) {
//     background-color: #614385;
//     animation-delay: 0.45s;
//   }

//   .inner:nth-child(5) {
//     background-color: #185a9d;
//     animation-delay: 0.55s;
//   }

//   @keyframes progress {
//     0% {
//       transform: translateY(0px);
//       opacity: 1;
//     }

//     50% {
//       transform: translateY(-60px);
//       opacity: 0.8;
//     }

//     100% {
//       transform: translateY(0px);
//       opacity: 1;
//     }
//   }`;

export default Loader;
