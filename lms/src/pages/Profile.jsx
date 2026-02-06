import React, { useState, useEffect } from "react";
import { authAPI, enrollmentAPI } from "../services/api";

const Profile = ({ user: propUser, onUserUpdate, onCourseSelect }) => {
  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState(
    propUser || JSON.parse(localStorage.getItem("user") || "{}")
  );
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const completedCourses = enrolledCourses.filter(
    (e) => e.progress === 100
  );

  useEffect(() => {
    fetchUserData();
    fetchEnrolledCourses();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      if (response && response.user) {
        const updatedUser = { ...user, ...response.user };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        onUserUpdate && onUserUpdate(updatedUser);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      // Fallback to localStorage if API fails
      const localUser = JSON.parse(localStorage.getItem("user") || "{}");
      if (localUser && Object.keys(localUser).length > 0) {
        setUser(localUser);
      }
    }
  };

  const fetchEnrolledCourses = async () => {
    try {
      setLoading(true);
      const response = await enrollmentAPI.getMy();
      setEnrolledCourses(response.enrollments || []);
    } catch (error) {
      console.error("Error fetching enrolled courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (updating) return;
    
    try {
      setUpdating(true);
      const response = await authAPI.updateProfile({
        name: user.name,
        email: user.email,
        bio: user.bio || "",
        address: user.address || "",
        phone: user.phone || "",
        avatar: user.avatar || "",
      });

      if (response && response.user) {
        const updatedUser = { 
          ...user, 
          ...response.user,
          // Ensure all fields are preserved
          name: response.user.name || user.name,
          email: response.user.email || user.email,
          bio: response.user.bio !== undefined ? response.user.bio : (user.bio || ""),
          address: response.user.address !== undefined ? response.user.address : (user.address || ""),
          phone: response.user.phone !== undefined ? response.user.phone : (user.phone || ""),
          avatar: response.user.avatar || user.avatar || "",
          createdAt: response.user.createdAt || user.createdAt,
        };
        // Update localStorage with complete user data
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);

        // Notify parent component
        onUserUpdate && onUserUpdate(updatedUser);

        alert("Profile updated successfully!");
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile: " + (error.message || "Unknown error"));
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      {/* HEADER */}
      <div>
        <p className="text-[11px] uppercase tracking-[0.3em] text-cyan-400/70 mb-1">
          User Dashboard
        </p>
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#545454] tracking-[0.14em] uppercase flex items-center gap-3">
          Profile
          <span className="flex-1 h-[2px] bg-gradient-to-r from-[#4DBDFF] via-cyan-400 to-transparent" />
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* SIDEBAR */}
        <aside className="lg:col-span-1">
          <div className="bg-white border border-[#8AD5FF] rounded-xl p-6 text-center shadow-sm">
            <div className="mx-auto w-24 h-24 rounded-full bg-[#C0EAFF] border-2 border-[#8AD5FF] flex items-center justify-center mb-4 overflow-hidden">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name || "Avatar"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-cyan-600 tracking-[0.12em]">
                  {user.name?.substring(0, 2).toUpperCase() || "US"}
                </span>
              )}
            </div>

            <h2 className="text-lg font-semibold text-[#545454]">
              {user.name}
            </h2>
            <p className="text-sm text-slate-400">{user.email}</p>
            <p className="text-xs text-slate-500 mt-1">
              {user.address || "No location set"}
            </p>
            <p className="text-xs text-slate-500">
              Joined{" "}
              {user.createdAt
                ? new Date(user.createdAt).toLocaleDateString()
                : "N/A"}
            </p>

            <nav className="mt-6 space-y-2">
              {[
                { id: "profile", label: "Profile Information", icon: "👤" },
                { id: "courses", label: "My Courses", icon: "📚" },
              ].map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-2 px-4 py-2 rounded-md text-xs uppercase tracking-[0.16em] font-semibold transition
                      ${
                        isActive
                          ? "bg-[#6ED6EE] text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <section className="lg:col-span-3 space-y-8">
          {/* PROFILE TAB */}
          {activeTab === "profile" && (
            <div className="bg-white border border-[#8AD5FF] rounded-xl p-6 shadow-sm space-y-6">
              <h3 className="text-xl font-semibold text-[#545454]">
                Profile Information
              </h3>

                <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { label: "Full Name", key: "name", type: "text" },
                    { label: "Email", key: "email", type: "email" },
                  ].map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-slate-600 mb-1">
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      value={user[field.key] || ""}
                      onChange={(e) =>
                        setUser({ ...user, [field.key]: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-[#1EAAFF] rounded-lg focus:ring-2 focus:ring-[#99DBFF] outline-none"
                    />
                  </div>
                ))}

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Bio
                  </label>
                  <textarea
                    rows={4}
                    value={user.bio || ""}
                    onChange={(e) =>
                      setUser({ ...user, bio: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-[#1EAAFF] rounded-lg focus:ring-2 focus:ring-[#99DBFF] outline-none"
                  />
                </div>

                {[
                  { label: "Location", key: "address" },
                  { label: "Phone", key: "phone" },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-slate-600 mb-1">
                      {field.label}
                    </label>
                    <input
                      type="text"
                      value={user[field.key] || ""}
                      onChange={(e) =>
                        setUser({ ...user, [field.key]: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-[#1EAAFF] rounded-lg focus:ring-2 focus:ring-[#99DBFF] outline-none"
                    />
                  </div>
                ))}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleUpdateProfile}
                  disabled={updating}
                  className={`px-6 py-2 bg-[#6ED6EE] text-white rounded-lg hover:bg-purple-700 transition ${
                    updating ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {/* COURSES TAB */}
          {activeTab === "courses" && (
            <div className="bg-white border border-[#8AD5FF] rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-[#545454] mb-6">
                My Courses
              </h3>

              {loading ? (
                <p className="text-slate-400">Loading courses...</p>
              ) : enrolledCourses.length === 0 ? (
                <p className="text-slate-500">
                  You haven’t enrolled in any courses yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {enrolledCourses.map((enroll) => (
                    <div
                      key={enroll._id}
                      onClick={() =>
                        onCourseSelect && onCourseSelect(enroll.course)
                      }
                      className="flex items-center justify-between p-4 border border-[#8AD5FF] rounded-lg cursor-pointer hover:bg-slate-50 transition"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-3xl">
                          {enroll.course?.image || "📚"}
                        </div>
                        <div>
                          <p className="font-semibold text-[#545454]">
                            {enroll.course?.title || "Course"}
                          </p>
                          <p className="text-xs text-slate-400">
                            {enroll.course?.category || "N/A"}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-700">
                          {enroll.progress || 0}%
                        </p>
                        <div className="w-32 h-2 bg-slate-200 rounded-full mt-1 overflow-hidden">
                          <div
                            className="h-2 bg-cyan-400 rounded-full"
                            style={{
                              width: `${enroll.progress || 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 text-center">
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-cyan-600">
                    {enrolledCourses.length}
                  </div>
                  <div className="text-sm text-slate-600">
                    Enrolled
                  </div>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {completedCourses.length}
                  </div>
                  <div className="text-sm text-slate-600">
                    Completed
                  </div>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {enrolledCourses.length
                      ? Math.round(
                          enrolledCourses.reduce(
                            (acc, e) => acc + (e.progress || 0),
                            0
                          ) / enrolledCourses.length
                        )
                      : 0}
                    %
                  </div>
                  <div className="text-sm text-slate-600">
                    Avg Progress
                  </div>
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
