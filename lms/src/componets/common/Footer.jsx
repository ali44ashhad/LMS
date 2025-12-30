// src/components/common/Footer.jsx
import React from "react";

const Footer = () => {
  return (
    <footer className="relative w-full h-20 bg-transparent overflow-hidden">
      
      {/* MAIN FOOTER BODY */}
      <div
        className="
          absolute inset-0
          bg-[#CEECF7]
          border-t border-purple-400/40
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
      <div className="relative z-10 h-full flex items-center justify-center font-bold text-black">
        <span className="text-[10px] tracking-[0.35em] uppercase">
          Console Ready
        </span>
      </div>

    </footer>
  );
};

export default Footer;
