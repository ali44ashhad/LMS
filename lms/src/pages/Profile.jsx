// // src/pages/Profile.jsx
// import React, { useState, useEffect } from 'react';
// import { authAPI, enrollmentAPI } from '../services/api';

// const Profile = ({ user: propUser }) => {
//   const [activeTab, setActiveTab] = useState('profile');
//   const [user, setUser] = useState(propUser || JSON.parse(localStorage.getItem('user') || '{}'));
//   const [enrolledCourses, setEnrolledCourses] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchEnrolledCourses();
//   }, []);

//   const fetchEnrolledCourses = async () => {
//     try {
//       setLoading(true);
//       const response = await enrollmentAPI.getMy();
//       setEnrolledCourses(response.enrollments || []);
//     } catch (error) {
//       console.error('Error fetching enrolled courses:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleUpdateProfile = async () => {
//     try {
//       const response = await authAPI.updateProfile({
//         name: user.name,
//         email: user.email,
//         bio: user.bio || '',
//         address: user.address || '',
//         phone: user.phone || ''
//       });
      
//       // Update localStorage with new user data
//       const updatedUser = { ...user, ...response.user };
//       localStorage.setItem('user', JSON.stringify(updatedUser));
//       setUser(updatedUser);
      
//       alert('Profile updated successfully!');
//     } catch (error) {
//       console.error('Error updating profile:', error);
//       alert('Failed to update profile');
//     }
//   };

//   const completedCourses = enrolledCourses.filter(e => e.progress === 100);

//   return (
//     <div className="max-w-6xl mx-auto space-y-6">
//       <h1 className="text-3xl font-bold text-gray-900">Profile</h1>

//       <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
//         {/* Sidebar */}
//         <div className="lg:col-span-1">
//           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//             <div className="text-center">
//               <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <span className="text-2xl font-semibold text-indigo-600">
//                   {user.name?.substring(0, 2).toUpperCase() || 'US'}
//                 </span>
//               </div>
//               <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
//               <p className="text-gray-600 mt-1">{user.email}</p>
//               <p className="text-gray-500 text-sm mt-2">{user.address || 'No location set'}</p>
//               <p className="text-gray-500 text-sm">
//                 Member since {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
//               </p>
//             </div>

//             <nav className="mt-6 space-y-2">
//               {[
//                 { id: 'profile', label: 'Profile Information', icon: '👤' },
//                 { id: 'courses', label: 'My Courses', icon: '📚' }, 
//               ].map(item => (
//                 <button
//                   key={item.id}
//                   onClick={() => setActiveTab(item.id)}
//                   className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left ${
//                     activeTab === item.id
//                       ? 'bg-indigo-50 text-indigo-600 border-r-2 border-indigo-600'
//                       : 'text-gray-600 hover:bg-gray-100'
//                   }`}
//                 >
//                   <span>{item.icon}</span>
//                   <span className="font-medium">{item.label}</span>
//                 </button>
//               ))}
//             </nav>
//           </div>
//         </div>

//         {/* Main Content */}
//         <div className="lg:col-span-3">
//           {activeTab === 'profile' && (
//             <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//               <h3 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h3>
              
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Full Name
//                   </label>
//                   <input
//                     type="text"
//                     value={user.name}
//                     onChange={(e) => setUser({...user, name: e.target.value})}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
//                   />
//                 </div>
                
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Email
//                   </label>
//                   <input
//                     type="email"
//                     value={user.email}
//                     onChange={(e) => setUser({...user, email: e.target.value})}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
//                   />
//                 </div>
                
//                 <div className="md:col-span-2">
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Bio
//                   </label>
//                   <textarea
//                     value={user.bio}
//                     onChange={(e) => setUser({...user, bio: e.target.value})}
//                     rows={4}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
//                   />
//                 </div>
                
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Location
//                   </label>
//                   <input
//                     type="text"
//                     value={user.address || ''}
//                     onChange={(e) => setUser({...user, address: e.target.value})}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Phone
//                   </label>
//                   <input
//                     type="text"
//                     value={user.phone || ''}
//                     onChange={(e) => setUser({...user, phone: e.target.value})}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
//                   />
//                 </div>
//               </div>
              
//               <div className="mt-6 flex justify-end">
//                 <button 
//                   onClick={handleUpdateProfile}
//                   className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
//                 >
//                   Save Changes
//                 </button>
//               </div>
//             </div>
//           )}

//           {activeTab === 'courses' && (
//             <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//               <h3 className="text-lg font-semibold text-gray-900 mb-6">My Courses</h3>
              
//               {loading ? (
//                 <p className="text-gray-500">Loading courses...</p>
//               ) : enrolledCourses.length === 0 ? (
//                 <p className="text-gray-500">No enrolled courses yet.</p>
//               ) : (
//                 <div className="space-y-4">
//                   {enrolledCourses.map(enrollment => (
//                     <div key={enrollment._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
//                       <div className="flex items-center space-x-4">
//                         <div className="text-2xl">{enrollment.course?.image || '📚'}</div>
//                         <div>
//                           <h4 className="font-medium text-gray-900">{enrollment.course?.title || 'Course'}</h4>
//                           <p className="text-sm text-gray-600">{enrollment.course?.category || 'N/A'}</p>
//                         </div>
//                       </div>
                      
//                       <div className="text-right">
//                         <div className="text-sm font-medium text-gray-900">{enrollment.progress || 0}%</div>
//                         <div className="w-32 h-2 bg-gray-200 rounded-full mt-1">
//                           <div 
//                             className="h-2 bg-indigo-600 rounded-full"
//                             style={{ width: `${enrollment.progress || 0}%` }}
//                           ></div>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}

//               <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
//                 <div className="bg-gray-50 rounded-lg p-4">
//                   <div className="text-2xl font-bold text-indigo-600">{enrolledCourses.length}</div>
//                   <div className="text-sm text-gray-600">Enrolled Courses</div>
//                 </div>
//                 <div className="bg-gray-50 rounded-lg p-4">
//                   <div className="text-2xl font-bold text-green-600">{completedCourses.length}</div>
//                   <div className="text-sm text-gray-600">Completed</div>
//                 </div>
//                 <div className="bg-gray-50 rounded-lg p-4">
//                   <div className="text-2xl font-bold text-blue-600">
//                     {enrolledCourses.length > 0 
//                       ? Math.round(enrolledCourses.reduce((acc, e) => acc + (e.progress || 0), 0) / enrolledCourses.length)
//                       : 0}%
//                   </div>
//                   <div className="text-sm text-gray-600">Average Progress</div>
//                 </div>
//               </div>
//             </div>
//           )}
 
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Profile;

import React, { useState, useEffect } from 'react';
import { authAPI, enrollmentAPI } from '../services/api';

const Profile = ({ user: propUser, onUserUpdate, onCourseSelect }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState(
    propUser || JSON.parse(localStorage.getItem('user') || '{}')
  );
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const completedCourses = enrolledCourses.filter(e => e.progress === 100);

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const fetchEnrolledCourses = async () => {
    try {
      setLoading(true);
      const response = await enrollmentAPI.getMy();
      setEnrolledCourses(response.enrollments || []);
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const response = await authAPI.updateProfile({
        name: user.name,
        email: user.email,
        bio: user.bio || '',
        address: user.address || '',
        phone: user.phone || ''
      });

      const updatedUser = { ...user, ...response.user };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      // Notify parent component to update user state
      if (onUserUpdate) {
        onUserUpdate(updatedUser);
      }

      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  return (
    <div className="space-y-10 max-w-6xl mx-auto">
      {/* HEADER */}
      <div>
        <p className="text-[11px] uppercase tracking-[0.3em] text-sky-300/70 mb-1">
          User Dashboard
        </p>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-50 tracking-[0.14em] uppercase flex items-center gap-3">
          Profile
          <span className="inline-flex h-[2px] flex-1 bg-gradient-to-r from-indigo-400 via-sky-400 to-transparent shadow-[0_0_16px_rgba(99,102,241,0.9)]" />
        </h1>
      </div>

      <div className="grid grid-cols-1 max-w-container lg:grid-cols-4 gap-8">
        {/* SIDEBAR USER CARD */}
        <aside className="lg:col-span-1">
          <div className="neo-card p-6 text-center">
            <div className="mx-auto w-24 h-24 rounded-full bg-indigo-600/20 border border-indigo-500/60 flex items-center justify-center text-indigo-300 shadow-[0_0_30px_rgba(99,102,241,0.5)] mb-4">
              <span className="text-3xl font-bold tracking-[0.12em]">
                {user.name?.substring(0, 2).toUpperCase() || 'US'}
              </span>
            </div>

            <h2 className="text-lg font-semibold text-slate-50">{user.name}</h2>
            <p className="text-sm text-slate-400">{user.email}</p>
            <p className="text-xs text-slate-500 mt-1">
              {user.address || 'No location set'}
            </p>
            <p className="text-xs text-slate-500">
              Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </p>

            {/* 🔻 Yaha buttons ko sidebar wale hex style me change kiya hai */}
            <nav className="mt-6 space-y-2">
              {[
                { id: 'profile', label: 'Profile Information', icon: '👤' },
                { id: 'courses', label: 'My Courses', icon: '📚' },
              ].map(item => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`neo-btn w-full flex items-center justify-start gap-2 text-[11px] md:text-xs tracking-[0.16em] uppercase font-semibold
                      ${isActive ? 'neo-btn-active' : 'neo-btn-idle'}
                    `}
                  >
                    <span className="text-lg">
                      {item.icon}
                    </span>
                    <span className="truncate">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* MAIN CONTENT AREA (same as before, just using neo-input/neo-textarea/buttons) */}
        <section className="lg:col-span-3 space-y-8">
          {activeTab === 'profile' && (
            <div className="neo-card p-6 space-y-6">
              <h3 className="neo-section-title">Profile Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="neo-field-label">Full Name</label>
                  <input
                    type="text"
                    value={user.name}
                    onChange={(e) => setUser({...user, name: e.target.value})}
                    className="neo-input w-full"
                  />
                </div>

                <div>
                  <label className="neo-field-label">Email</label>
                  <input
                    type="email"
                    value={user.email}
                    onChange={(e) => setUser({...user, email: e.target.value})}
                    className="neo-input w-full"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="neo-field-label">Bio</label>
                  <textarea
                    rows={4}
                    value={user.bio}
                    onChange={(e) => setUser({...user, bio: e.target.value})}
                    className="neo-textarea w-full"
                  />
                </div>

                <div>
                  <label className="neo-field-label">Location</label>
                  <input
                    type="text"
                    value={user.address || ''}
                    onChange={(e) => setUser({...user, address: e.target.value})}
                    className="neo-input w-full"
                  />
                </div>

                <div>
                  <label className="neo-field-label">Phone</label>
                  <input
                    type="text"
                    value={user.phone || ''}
                    onChange={(e) => setUser({...user, phone: e.target.value})}
                    className="neo-input w-full"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleUpdateProfile}
                  className="neo-btn neo-btn-active px-6 py-2 text-sm"
                >
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'courses' && (
            <div className="neo-card p-6">
              <h3 className="neo-section-title mb-6">My Courses</h3>

              {loading ? (
                <div className="text-slate-400">Loading courses...</div>
              ) : enrolledCourses.length === 0 ? (
                <p className="text-slate-500">You haven’t enrolled in any courses yet.</p>
              ) : (
                <div className="space-y-4">
                  {enrolledCourses.map(enroll => (
                    <div
                      key={enroll._id}
                      className="neo-mini-row flex items-center justify-between cursor-pointer hover:bg-slate-800 transition-colors"
                      onClick={() => onCourseSelect && onCourseSelect(enroll.course)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-3xl">{enroll.course?.image || '📚'}</div>
                        <div>
                          <p className="text-slate-50 font-semibold">
                            {enroll.course?.title || 'Course'}
                          </p>
                          <p className="text-xs text-slate-400">
                            {enroll.course?.category || 'N/A'}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-slate-200 font-semibold">
                          {enroll.progress || 0}%
                        </p>
                        <div className="w-32 h-2 bg-slate-800 rounded-full mt-1 overflow-hidden">
                          <div
                            className="h-2 bg-sky-400 rounded-full transition-all duration-500"
                            style={{ width: `${enroll.progress || 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <div className="neo-stat-card neo-card-blue">
                  <div className="neo-stat-value-main">{enrolledCourses.length}</div>
                  <div className="neo-stat-label">Enrolled</div>
                </div>
                <div className="neo-stat-card neo-card-green">
                  <div className="neo-stat-value-main">{completedCourses.length}</div>
                  <div className="neo-stat-label">Completed</div>
                </div>
                <div className="neo-stat-card neo-card-purple">
                  <div className="neo-stat-value-main">
                    {enrolledCourses.length
                      ? Math.round(
                          enrolledCourses.reduce((acc, e) => acc + (e.progress || 0), 0) /
                            enrolledCourses.length
                        )
                      : 0}
                    %
                  </div>
                  <div className="neo-stat-label">Avg Progress</div>
                </div>
              </div>
            </div>
          )}

        </section>
      </div>
    </div>
  );
};

export default Profile;
