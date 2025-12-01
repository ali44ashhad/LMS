// // src/components/common/Footer.jsx
// import React from 'react';

// const Footer = () => {
//   return (
//     <footer className="bg-white border-t border-gray-200 mt-12">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
//           <div className="col-span-1">
//             <div className="flex items-center space-x-2">
//               <div className="bg-indigo-600 text-white p-2 rounded-lg">
//                 <i className="fas fa-graduation-cap"></i>
//               </div>
//               <span className="text-xl font-bold text-gray-900">LearnHub</span>
//             </div>
//             <p className="mt-4 text-gray-600">
//               Empowering learners worldwide with quality education and innovative learning experiences.
//             </p>
//           </div>
          
//           <div>
//             <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Platform</h3>
//             <ul className="mt-4 space-y-2">
//               <li><a href="#" className="text-gray-600 hover:text-gray-900">Features</a></li>
//               <li><a href="#" className="text-gray-600 hover:text-gray-900">Pricing</a></li>
//               <li><a href="#" className="text-gray-600 hover:text-gray-900">Mobile App</a></li>
//             </ul>
//           </div>
          
//           <div>
//             <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Support</h3>
//             <ul className="mt-4 space-y-2">
//               <li><a href="#" className="text-gray-600 hover:text-gray-900">Help Center</a></li>
//               <li><a href="#" className="text-gray-600 hover:text-gray-900">Contact Us</a></li>
//               <li><a href="#" className="text-gray-600 hover:text-gray-900">System Status</a></li>
//             </ul>
//           </div>
          
//           <div>
//             <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Legal</h3>
//             <ul className="mt-4 space-y-2">
//               <li><a href="#" className="text-gray-600 hover:text-gray-900">Privacy Policy</a></li>
//               <li><a href="#" className="text-gray-600 hover:text-gray-900">Terms of Service</a></li>
//               <li><a href="#" className="text-gray-600 hover:text-gray-900">Cookie Policy</a></li>
//             </ul>
//           </div>
//         </div>
        
//         <div className="mt-8 pt-8 border-t border-gray-200">
//           <p className="text-gray-500 text-sm text-center">
//             © 2025 LearnHub. All rights reserved.
//           </p>
//         </div>
//       </div>
//     </footer>
//   );
// };

// export default Footer;

// src/components/common/Footer.jsx
import React from 'react';

const Footer = () => {
  return (
    <footer className="relative bg-[#050611] border-t border-indigo-500/20 overflow-hidden">
      
      {/* holo grid background */}
      <div className="absolute inset-0 opacity-[0.09] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/graph-paper.png')]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Logo + Description */}
          <div className="col-span-1">
            <div className="flex items-center space-x-3">
              <div className="neo-logo p-2 rounded-xl">
                <i className="fas fa-graduation-cap text-white"></i>
              </div>
              <span className="text-2xl font-extrabold tracking-[0.18em] uppercase bg-clip-text text-transparent bg-gradient-to-r from-sky-300 to-indigo-400">
                LearnHub
              </span>
            </div>
            <p className="mt-4 text-slate-400 text-sm leading-relaxed">
              Empowering learners with futuristic, gamified education built for the next generation of innovators.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h3 className="footer-title">Platform</h3>
            <ul className="mt-4 space-y-2">
              {['Features', 'Pricing', 'Mobile App'].map((item) => (
                <li key={item}>
                  <a className="footer-link" href="#">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="footer-title">Support</h3>
            <ul className="mt-4 space-y-2">
              {['Help Center', 'Contact Us', 'System Status'].map((item) => (
                <li key={item}>
                  <a className="footer-link" href="#">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="footer-title">Legal</h3>
            <ul className="mt-4 space-y-2">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
                <li key={item}>
                  <a className="footer-link" href="#">{item}</a>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom */}
        <div className="mt-10 pt-6 border-t border-slate-700/50">
          <p className="text-slate-400 text-xs tracking-[0.18em] uppercase text-center">
            © 2025 LearnHub — All Rights Reserved
          </p>
        </div>
      </div>

      {/* neon bottom line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-sky-400 to-transparent shadow-[0_0_18px_rgba(56,189,248,0.9)]"></div>
    </footer>
  );
};

export default Footer;
