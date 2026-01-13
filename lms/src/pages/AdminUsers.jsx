// src/components/admin/AdminUsers.jsx
import React, { useState, useEffect } from "react";
import { adminAPI } from "../services/api";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    role: "",
    search: "",
    page: 1,
  });

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getUsers(filters);
      setUsers(response.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (userId, current) => {
    try {
      await adminAPI.updateUser(userId, { isActive: !current });
      fetchUsers();
    } catch {
      alert("⚠ Failed to update user status");
    }
  };

  const handleChangeRole = async (userId, role) => {
    try {
      await adminAPI.updateUser(userId, { role });
      fetchUsers();
    } catch {
      alert("⚠ Failed to update role");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm("⚡ Are you sure you want to delete this user?")) return;
    try {
      await adminAPI.deleteUser(userId);
      fetchUsers();
    } catch {
      alert("⚠ Failed to delete user");
    }
  };

  return (
    <div className="space-y-8">

      {/* Page title */}
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-extrabold text-slate-700 uppercase tracking-[0.16em]">
          User Management
        </h1>
        <span className="flex-1 h-[2px] bg-gradient-to-r from-[#4DBDFF] via-[#99DBFF] to-transparent" />
      </div>

      {/* Filters */}
      <div className="bg-white border border-[#8AD5FF] rounded-xl p-5 shadow-sm">
        <div className="flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Search name/email..."
            value={filters.search}
            onChange={(e) =>
              setFilters({ ...filters, search: e.target.value })
            }
            className="
              flex-1 min-w-[200px]
              px-4 py-2 rounded-lg
              border border-[#1EAAFF]
              focus:ring-2 focus:ring-[#99DBFF]
              focus:outline-none
            "
          />

          <select
            value={filters.role}
            onChange={(e) =>
              setFilters({ ...filters, role: e.target.value })
            }
            className="
              px-4 py-2 rounded-lg
              border border-[#1EAAFF]
              focus:ring-2 focus:ring-[#99DBFF]
              focus:outline-none
            "
          >
            <option value="">All Roles</option>
            <option value="student">Students</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-[#8AD5FF] rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-[#8AD5FF]">
              <tr className="text-left uppercase tracking-wider text-xs text-slate-500">
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Joined</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-6 text-center text-slate-500">
                    Loading Users…
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-6 text-center text-slate-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-[#C0EAFF] text-cyan-600 font-bold flex items-center justify-center">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">
                            {user.name}
                          </p>
                          <p className="text-slate-400 text-xs">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <select
                        value={user.role}
                        onChange={(e) =>
                          handleChangeRole(user._id, e.target.value)
                        }
                        className="
                          px-2 py-1 rounded-md
                          border border-[#1EAAFF]
                          text-xs
                          focus:ring-2 focus:ring-[#99DBFF]
                          focus:outline-none
                        "
                      >
                        <option value="student">Student</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                          user.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-slate-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4 flex gap-2">
                      <button
                        onClick={() =>
                          handleToggleActive(user._id, user.isActive)
                        }
                        className={`
                          px-3 py-1 rounded-md text-xs font-medium
                          transition-colors
                          ${
                            user.isActive
                              ? "text-red-700 hover:bg-red-100"
                              : "text-green-700 hover:bg-green-100"
                          }
                        `}
                      >
                        {user.isActive ? "🔴 Deactivate" : "🟢 Activate"}
                      </button>

                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="
                          px-3 py-1 rounded-md text-xs font-medium
                          text-red-700 hover:bg-red-100
                          transition-colors
                        "
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
