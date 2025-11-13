import React, {useState, useEffect } from "react";
import { LinearProgress, Box, Typography } from "@mui/material";
import "../assets/css/OpenLoader.css"; 

function Loader() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const body = document.querySelector("body");
    body.style.overflowY = "hidden"; // Disable scrolling

    const mainDiv = document.getElementById("mainDiv");
    const bottom = document.getElementById("bottom");
    const top = document.getElementById("top");
    const svg = document.getElementById("animate-svg");

    const progressDuration = 10000; 
    const updateInterval = 100; 
    const totalSteps = progressDuration / updateInterval; 
    const progressIncrement = 100 / totalSteps; 

    const progressInterval = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return oldProgress + progressIncrement;  
      });
    }, updateInterval); // Update progress every second

    const addClassToLoader = () => {
      bottom.classList.add("bottomactive");
      top.classList.add("topactive");
      svg.classList.add("animated-svg-active");

      setTimeout(() => {
        bottom.style.display = "none";
        top.style.display = "none";
        svg.style.display = "none";
        mainDiv.style.display = "none";
        body.style.overflowY = "scroll"; 
      }, 3000); 
    };

    const timer = setTimeout(addClassToLoader, progressDuration); 
    return () => {
      clearInterval(progressInterval);
      clearTimeout(timer);
      body.style.overflowY = "scroll"; 
    };
  }, []);

  return (
    <div id="mainDiv" className="main">
      <div id="top" className="top"></div>
      <svg
        id="animate-svg"
        className="animated-svg"
        version="1.0"
        xmlns="http://www.w3.org/2000/svg"
        width="496.000000pt"
        height="466.000000pt"
        viewBox="0 0 496.000000 466.000000"
        preserveAspectRatio="xMidYMid meet"
      >

        <defs>
          <linearGradient id="grad1" x1="100%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" style={{ stopColor: "#00cc51", stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: "#0072cf", stopOpacity: 1 }} />
          </linearGradient>
        </defs>

        <g
          className="svgpath"
          transform="translate(0.000000,466.000000) scale(0.100000,-0.100000)"
          fill="#000000"
          stroke="none"
        >
          <path
            id="path"
            d="M2330 4364 c-662 -61 -1227 -397 -1584 -940 -438 -670 -447 -1561
        -21 -2239 333 -530 877 -879 1498 -960 151 -19 393 -19 544 0 847 111 1540
        723 1748 1544 38 153 55 274 62 449 5 135 4 162 -8 162 -8 0 -268 -255 -579
        -566 -311 -311 -601 -594 -645 -628 -239 -186 -494 -280 -796 -293 -161 -6
        -259 4 -406 42 -518 136 -913 559 -1020 1092 -24 122 -24 394 0 516 120 598
        591 1042 1196 1128 113 16 350 6 461 -20 247 -56 468 -170 644 -333 89 -81
        116 -129 116 -203 0 -94 -18 -117 -354 -455 l-314 -315 -4 -76 c-9 -140 -88
        -260 -216 -325 -52 -26 -66 -29 -157 -29 -90 0 -105 3 -157 29 -77 39 -144
        108 -182 186 -28 59 -31 74 -31 160 0 82 4 103 26 151 65 139 206 229 358 229
        l56 0 208 208 c114 114 207 210 207 214 0 13 -112 65 -197 92 -435 137 -910
        -51 -1122 -445 -79 -146 -112 -278 -113 -449 -1 -173 29 -298 109 -450 210
        -405 704 -597 1145 -446 208 71 175 43 966 831 l713 711 -34 90 c-266 697
        -871 1190 -1612 1315 -116 19 -402 32 -505 23z m378 -95 c594 -64 1122 -388
        1452 -889 67 -103 141 -244 185 -354 l27 -69 -684 -682 c-740 -739 -730 -731
        -904 -794 -150 -55 -360 -65 -509 -25 -83 22 -215 85 -290 138 -181 130 -314
        363 -345 607 -27 217 66 493 223 665 98 107 222 184 384 241 72 25 91 27 233
        27 157 1 222 -9 317 -49 l37 -16 -154 -154 c-133 -133 -159 -155 -186 -155
        -45 0 -175 -35 -225 -61 -24 -12 -72 -50 -106 -85 -78 -77 -119 -159 -135
        -270 -10 -71 -9 -88 10 -161 25 -97 57 -156 121 -222 115 -118 282 -165 449
        -126 85 20 130 45 200 110 103 95 152 197 152 314 l0 55 323 326 c359 361 347
        344 347 481 -1 119 -36 176 -189 303 -256 212 -551 326 -887 343 -264 13 -568
        -60 -799 -193 -287 -166 -519 -429 -640 -729 -223 -553 -96 -1183 325 -1606
        239 -241 540 -385 896 -430 307 -38 707 58 969 234 111 74 158 119 669 626
        l508 506 -6 -75 c-80 -907 -792 -1656 -1697 -1785 -135 -19 -442 -19 -576 0
        -472 67 -941 330 -1240 696 -223 273 -371 602 -439 974 -25 137 -25 468 -1
        605 65 354 195 654 398 921 312 411 820 698 1339 758 109 12 336 13 448 0z"
            stroke="url(#grad1)"
          />
        </g>
      </svg>

      {/* <div className="LinearProgLoader">
        <Box sx={{ width: '80%', margin: '20px auto' }}>
          <LinearProgress
            variant="determinate"
            className="LinearProgress"
            value={progress}
            sx={{ height: '2px', borderRadius: '5px' }}
          />
        </Box>
        <Typography variant="h6" align="center" gutterBottom className="gutterBottom">
          Loading your Chats...
        </Typography>
      </div> */}

      <div id="bottom" className="bottom"></div>
    </div>
  );
}

export default Loader;