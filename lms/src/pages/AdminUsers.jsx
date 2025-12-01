// import React, { useState, useEffect } from 'react';
// import { adminAPI } from '../services/api';

// const AdminUsers = () => {
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [filters, setFilters] = useState({
//     role: '',
//     search: '',
//     page: 1
//   });

//   useEffect(() => {
//     fetchUsers();
//   }, [filters]);

//   const fetchUsers = async () => {
//     try {
//       setLoading(true);
//       const response = await adminAPI.getUsers(filters);
//       setUsers(response.users);
//     } catch (error) {
//       console.error('Error fetching users:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleToggleActive = async (userId, currentStatus) => {
//     try {
//       await adminAPI.updateUser(userId, { isActive: !currentStatus });
//       fetchUsers();
//     } catch (error) {
//       console.error('Error updating user:', error);
//       alert('Failed to update user status');
//     }
//   };

//   const handleChangeRole = async (userId, newRole) => {
//     try {
//       await adminAPI.updateUser(userId, { role: newRole });
//       fetchUsers();
//     } catch (error) {
//       console.error('Error updating user role:', error);
//       alert('Failed to update user role');
//     }
//   };

//   const handleDeleteUser = async (userId) => {
//     if (!confirm('Are you sure you want to delete this user?')) return;

//     try {
//       await adminAPI.deleteUser(userId);
//       fetchUsers();
//     } catch (error) {
//       console.error('Error deleting user:', error);
//       alert(error.message || 'Failed to delete user');
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
//       </div>

//       {/* Filters */}
//       <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
//         <div className="flex flex-wrap gap-4">
//           <input
//             type="text"
//             placeholder="Search by name or email..."
//             className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
//             value={filters.search}
//             onChange={(e) => setFilters({ ...filters, search: e.target.value })}
//           />
//           <select
//             className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
//             value={filters.role}
//             onChange={(e) => setFilters({ ...filters, role: e.target.value })}
//           >
//             <option value="">All Roles</option>
//             <option value="student">Students</option>
//             <option value="admin">Admins</option>
//           </select>
//         </div>
//       </div>

//       {/* Users Table */}
//       <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-50 border-b border-gray-200">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   User
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Role
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Status
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Joined
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {loading ? (
//                 <tr>
//                   <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
//                     Loading...
//                   </td>
//                 </tr>
//               ) : users.length === 0 ? (
//                 <tr>
//                   <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
//                     No users found
//                   </td>
//                 </tr>
//               ) : (
//                 users.map((user) => (
//                   <tr key={user._id}>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="flex items-center">
//                         <div className="h-10 w-10 flex-shrink-0">
//                           <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
//                             {user.name.charAt(0).toUpperCase()}
//                           </div>
//                         </div>
//                         <div className="ml-4">
//                           <div className="text-sm font-medium text-gray-900">{user.name}</div>
//                           <div className="text-sm text-gray-500">{user.email}</div>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <select
//                         value={user.role}
//                         onChange={(e) => handleChangeRole(user._id, e.target.value)}
//                         className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500"
//                       >
//                         <option value="student">Student</option>
//                         <option value="admin">Admin</option>
//                       </select>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span
//                         className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                           user.isActive
//                             ? 'bg-green-100 text-green-800'
//                             : 'bg-red-100 text-red-800'
//                         }`}
//                       >
//                         {user.isActive ? 'Active' : 'Inactive'}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                       {new Date(user.createdAt).toLocaleDateString()}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
//                       <button
//                         onClick={() => handleToggleActive(user._id, user.isActive)}
//                         className={`${
//                           user.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
//                         }`}
//                       >
//                         {user.isActive ? 'Deactivate' : 'Activate'}
//                       </button>
//                       <button
//                         onClick={() => handleDeleteUser(user._id)}
//                         className="text-red-600 hover:text-red-900"
//                       >
//                         Delete
//                       </button>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminUsers;


import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    role: '',
    search: '',
    page: 1
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
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (userId, current) => {
    try {
      await adminAPI.updateUser(userId, { isActive: !current });
      fetchUsers();
    } catch (e) {
      alert('⚠ Failed to update user status');
    }
  };

  const handleChangeRole = async (userId, role) => {
    try {
      await adminAPI.updateUser(userId, { role });
      fetchUsers();
    } catch {
      alert('⚠ Failed to update role');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('⚡ Are you sure you want to delete this user?')) return;
    try {
      await adminAPI.deleteUser(userId);
      fetchUsers();
    } catch {
      alert('⚠ Failed to delete user');
    }
  };

  return (
    <div className="space-y-8">

      {/* Page title */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-extrabold text-slate-50 tracking-[0.16em] uppercase flex items-center gap-3">
          User Management
          <span className="inline-flex h-[2px] flex-1 bg-gradient-to-r from-sky-400 via-indigo-500 to-transparent shadow-[0_0_16px_rgba(56,189,248,0.7)]" />
        </h1>
      </div>

      {/* Filters */}
      <div className="neo-card p-5">
        <div className="flex flex-wrap gap-4">
          {/* search */}
          <input
            type="text"
            placeholder="Search name/email..."
            className="neo-input flex-1 min-w-[200px]"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />

          {/* role filter */}
          <select
            className="neo-select"
            value={filters.role}
            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
          >
            <option value="">All Roles</option>
            <option value="student">Students</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="neo-card p-0 overflow-hidden">

        <div className="overflow-x-auto">
          <table className="neo-table w-full">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="neo-table-loading">Loading Users…</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="neo-table-empty">No users found</td>
                </tr>
              ) : users.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="neo-avatar">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="neo-name">{user.name}</p>
                        <p className="neo-email">{user.email}</p>
                      </div>
                    </div>
                  </td>

                  <td>
                    <select
                      className="neo-select-small"
                      value={user.role}
                      onChange={(e) => handleChangeRole(user._id, e.target.value)}
                    >
                      <option value="student">Student</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>

                  <td>
                    <span className={`neo-badge ${user.isActive ? 'neo-badge-green' : 'neo-badge-red'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>

                  <td className="neo-date">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>

                  <td className="neo-actions">
                    <button
                      onClick={() => handleToggleActive(user._id, user.isActive)}
                      className={`neo-btn px-3 py-1 text-xs ${user.isActive ? 'neo-btn-idle hover:bg-red-900/30' : 'neo-btn-idle hover:bg-emerald-900/30'}`}
                    >
                      {user.isActive ? '🔴 Deactivate' : '🟢 Activate'}
                    </button>

                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      className="neo-btn neo-btn-idle px-3 py-1 text-xs hover:bg-red-900/30"
                    >
                      🗑️ Delete
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default AdminUsers;
