// src/components/common/Footer.jsx
import React from "react";

const Footer = () => {
  return (
    <footer className="relative w-full h-20 bg-transparent overflow-hidden">
      
      {/* MAIN FOOTER BODY */}
      <div
        className="
          absolute inset-0
          bg-[#E7F6FE]
          border-t border-[#1EAAFF]
          shadow-[0_-8px_30px_rgba(15,23,42,0.9)]
          [clip-path:polygon(
            0_0,
            92%_0,
            96%_50%,
            92%_100%,
            6%_100%,
            0_70%
          )]
        "
      />

      {/* FOOTER TEXT */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center font-bold text-slate-800 text-center space-y-2">
  
  <span className=" ">
    Customer Support
  </span>
<div className="flex flex-row text-sm font-normal items-center justify-center">
Email - 
  <a
    href="mailto:robotics@nestatoys.com"
    className="mx-2 text-[#1EAAFF] hover:underline focus:outline-none focus:underline"
  >
   robotics@nestatoys.com
  </a>
  WhatsApp -
  <a
    href="https://wa.me/919701987812"
    target="_blank"
    rel="noopener noreferrer"
    className="mx-2 text-[#1EAAFF] hover:underline focus:outline-none focus:underline"
  >
 +91 9701987812
  </a>
</div>
</div>

    </footer>
  );
};

export default Footer;
