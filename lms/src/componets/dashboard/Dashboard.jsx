// src/components/dashboard/Dashboard.jsx
import React from 'react';
import ProgressChart from './ProgressChart';
import StatsCards from './StatsCards';

const Dashboard = ({ courses, announcements, stats, onCourseSelect }) => {
  const enrolledCourses = courses.filter(course => course.enrolled);
  const recentCourses = enrolledCourses.slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <span className="text-gray-500">Welcome back, John!</span>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Courses */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Continue Learning</h2>
              <button className="text-cyan-600 hover:text-[#99DBFF] font-medium">
                View All
              </button>
            </div>
            <div className="space-y-4">
              {recentCourses.map(course => (
                <div 
                  key={course.id} 
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => onCourseSelect(course)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="text-3xl">{course.image}</div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
                        <p className="text-gray-600 mt-1">{course.instructor}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span>{course.duration}</span>
                          <span>•</span>
                          <span>{Array.isArray(course.lessons) ? course.lessons.length : course.lessons || 0} lessons</span>
                          <span>•</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            course.level === 'Beginner' ? 'bg-green-100 text-green-800' :
                            course.level === 'Intermediate' ? 'bg-cyan-100 text-cyan-800' :
                            'bg-[#C0EAFF] text-purple-800'
                          }`}>
                            {course.level}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <span className="text-sm font-medium text-gray-900">{course.progress}%</span>
                      <div className="w-24 h-2 bg-gray-200 rounded-full mt-1">
                        <div 
                          className={`h-2 rounded-full ${
                            course.progress >= 75 ? 'bg-green-500' :
                            course.progress >= 50 ? 'bg-blue-500' :
                            course.progress >= 25 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {course.lastAccessed && (
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm text-gray-500">Last accessed {course.lastAccessed}</span>
                      <button className="px-4 py-2 bg-[#6ED6EE] text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
                        Continue
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Progress Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Learning Progress</h3>
            <ProgressChart courses={enrolledCourses} />
          </div>

          {/* Announcements */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Announcements</h3>
            <div className="space-y-4">
              {announcements.map(announcement => (
                <div key={announcement.id} className="border-l-4 border-[#99DBFF] pl-4 py-1">
                  <h4 className="font-medium text-gray-900">{announcement.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{announcement.content}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">{announcement.date}</span>
                    <span className="text-xs text-cyan-600">{announcement.author}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Upcoming Deadlines</h3>
            <div className="space-y-3">
              {[
                { title: 'HTML Assignment', course: 'Web Development', due: 'Tomorrow', type: 'assignment' },
                { title: 'Data Analysis Quiz', course: 'Data Science', due: 'In 2 days', type: 'quiz' },
                { title: 'Design Project', course: 'UI/UX Design', due: 'In 3 days', type: 'project' }
              ].map((deadline, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{deadline.title}</p>
                    <p className="text-gray-600 text-xs">{deadline.course}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-gray-900">{deadline.due}</span>
                    <span className="block text-xs text-gray-500 capitalize">{deadline.type}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;





