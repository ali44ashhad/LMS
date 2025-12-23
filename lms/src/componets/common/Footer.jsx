
// // src/components/common/Footer.jsx
// import React from "react";

// const Footer = () => {
//   return (
//     <footer className="relative bg-[#2FC1E8] overflow-hidden">

//       {/* Zigzag Top Shape */}
//       <div className="absolute top-0 left-0 w-full overflow-hidden leading-none">
//         <svg
//           className="relative block w-full h-[60px]"
//           viewBox="0 0 1200 120"
//           preserveAspectRatio="none"
//         >
//           <polygon
//             points="0,0 80,40 160,0 240,40 320,0 400,40 480,0 560,40 640,0 720,40 800,0 880,40 960,0 1040,40 1120,0 1200,40 1200,0"
//             fill="#6f3cff"
//           />
//         </svg>
//       </div>

//       {/* Holo grid overlay */}
//       <div className="absolute inset-0 opacity-[0.08] pointer-events-none 
//         bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.3)_1px,transparent_1px)]
//         bg-[length:18px_18px]"
//       />

//       {/* Footer Content */}
//       <div className="relative z-10 py-12 text-center text-white">
//         <p className="text-sm tracking-widest uppercase">
//           Powered by Gaming UI ⚡
//         </p>
//       </div>

//       {/* Neon Bottom Line */}
//       <div className="absolute bottom-0 left-0 right-0 h-[2px] 
//         bg-[#ff9d00] shadow-[0_0_18px_rgba(255,157,0,0.9)]"
//       />
//     </footer>
//   );
// };

// export default Footer;


// src/components/common/Footer.jsx
import React from "react";

const Footer = () => {
  return (
    <footer className="relative w-full h-20 bg-transparent overflow-hidden">

      {/* MAIN FOOTER BODY */}
      <div
        className="
          absolute inset-0
          bg-[#2FC1E8]
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

      {/* GRID OVERLAY (same theme as canvas area) */}
      <div
        className="
          absolute inset-0
          pointer-events-none
          opacity-[0.08]
          bg-[linear-gradient(rgba(255,255,255,0.35)_1px,transparent_1px),
              linear-gradient(90deg,rgba(255,255,255,0.35)_1px,transparent_1px)]
          bg-[size:16px_16px]
        "
      />

      {/* RIGHT CONTROL PANEL CUT */}
      <div
        className="
          absolute right-0 bottom-0
          w-28 h-full
          bg-[#7a46ff]
          border-l border-purple-300/40
          shadow-[-10px_0_25px_rgba(15,23,42,0.8)]
          [clip-path:polygon(20%_0,100%_0,100%_100%,0_100%)]
        "
      />

      {/* NEON ACCENT LINE */}
      <div className="absolute top-0 left-6 right-36 h-[2px] bg-[#ff9d00] shadow-[0_0_14px_rgba(255,157,0,0.9)]" />

      {/* OPTIONAL FOOTER TEXT (can remove if you want clean UI) */}
      <div className="relative z-10 h-full flex items-center justify-center">
        <span className="text-[10px] tracking-[0.35em] uppercase text-purple-100/80 saiba-font">
          Console Ready
        </span>
      </div>
    </footer>
  );
};

export default Footer;






