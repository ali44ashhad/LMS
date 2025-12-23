// // src/pages/Courses.jsx
// import React, { useState, useEffect } from 'react';
// import { courseAPI, enrollmentAPI } from '../services/api';
// import CourseCard from '../componets/courses/CourseCard';
// import CourseGrid from '../componets/courses/CourseGrid';

// const Courses = ({ onCourseSelect }) => {
//   const [filter, setFilter] = useState('all');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [courses, setCourses] = useState([]);
//   const [enrollments, setEnrollments] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const fetchData = async () => {
//     try {
//       setLoading(true);
//       const [coursesRes, enrollmentsRes] = await Promise.all([
//         courseAPI.getAll(),
//         enrollmentAPI.getMy()
//       ]);
      
//       setCourses(coursesRes.courses || []);
//       setEnrollments(enrollmentsRes.enrollments || []);
//     } catch (error) {
//       console.error('Error fetching data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const categories = ['All', 'Development', 'Data Science', 'Design', 'Marketing', 'Business', 'Other'];
  
//   // Merge courses with enrollment data
//   const coursesWithProgress = courses.map(course => {
//     const enrollment = enrollments.find(e => e.course._id === course._id);
//     return {
//       ...course,
//       enrolled: !!enrollment,
//       progress: enrollment?.progress || 0,
//       lastAccessed: enrollment?.lastAccessed || null
//     };
//   });

//   const filteredCourses = coursesWithProgress.filter(course => {
//     const matchesCategory = filter === 'all' || course.category === filter;
//     const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          course.instructorName.toLowerCase().includes(searchTerm.toLowerCase());
//     return matchesCategory && matchesSearch;
//   });

//   const enrolledCourses = filteredCourses.filter(course => course.enrolled);
//   const availableCourses = filteredCourses.filter(course => !course.enrolled);

//   const handleEnroll = async (courseId) => {
//     try {
//       await enrollmentAPI.enroll(courseId);
//       alert('Successfully enrolled in course!');
//       fetchData();
//     } catch (error) {
//       console.error('Error enrolling:', error);
//       alert('Failed to enroll in course');
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <p className="text-gray-500">Loading courses...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-4 md:space-y-6">
//       <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-3 md:space-y-0">
//         <h1 className="text-2xl md:text-3xl font-bold text-gray-900">All Courses</h1>
//         <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
//           <input
//             type="text"
//             placeholder="Search courses..."
//             className="px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full sm:w-auto"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//           <select 
//             className="px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full sm:w-auto"
//             value={filter}
//             onChange={(e) => setFilter(e.target.value)}
//           >
//             {categories.map(category => (
//               <option key={category} value={category === 'All' ? 'all' : category}>
//                 {category}
//               </option>
//             ))}
//           </select>
//         </div>
//       </div>

//       {/* Enrolled Courses with Progress */}
//       {enrolledCourses.length > 0 && (
//         <section>
//           <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-3 md:mb-4">My Learning ({enrolledCourses.length})</h2>
//           <div className="space-y-3 md:space-y-4">
//             {enrolledCourses.map(course => (
//               <CourseCard key={course._id} course={course} onSelect={onCourseSelect} />
//             ))}
//           </div>
//         </section>
//       )}

//       {/* Available Courses */}
//       {availableCourses.length > 0 && (
//         <section>
//           <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-3 md:mb-4">
//             All Courses ({availableCourses.length})
//           </h2>
//           <CourseGrid 
//             courses={availableCourses} 
//             onCourseSelect={onCourseSelect}
//             onEnroll={handleEnroll}
//           />
//         </section>
//       )}

//       {filteredCourses.length === 0 && (
//         <div className="text-center py-12">
//           <div className="text-6xl mb-4">🔍</div>
//           <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses found</h3>
//           <p className="text-gray-600">Try adjusting your search or filter criteria</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Courses;
// src/pages/Courses.jsx
import React, { useState, useEffect } from 'react';
import { courseAPI, enrollmentAPI } from '../services/api';
import CourseCard from '../componets/courses/CourseCard';
import CourseGrid from '../componets/courses/CourseGrid';

const Courses = ({ onCourseSelect }) => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    'All',
    'Development',
    'Data Science',
    'Design',
    'Marketing',
    'Business',
    'Other',
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [coursesRes, enrollmentsRes] = await Promise.all([
        courseAPI.getAll(),
        enrollmentAPI.getMy(),
      ]);

      setCourses(coursesRes.courses || []);
      setEnrollments(enrollmentsRes.enrollments || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const coursesWithProgress = courses.map((course) => {
    const enrollment = enrollments.find((e) => e.course._id === course._id);
    return {
      ...course,
      enrolled: !!enrollment,
      progress: enrollment?.progress || 0,
      lastAccessed: enrollment?.lastAccessed || null,
    };
  });

  const filteredCourses = coursesWithProgress.filter((course) => {
    const matchesCategory = filter === 'all' || course.category === filter;
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructorName?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const enrolledCourses = filteredCourses.filter((c) => c.enrolled);
  const availableCourses = filteredCourses.filter((c) => !c.enrolled);

  const handleEnroll = async (courseId) => {
    try {
      await enrollmentAPI.enroll(courseId);
      alert('Successfully enrolled in course!');
      fetchData();
    } catch (error) {
      console.error('Error enrolling:', error);
      alert('Failed to enroll in course');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-300">
        Loading interactive modules...
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* TITLE */}
      <div>
        <p className="text-[11px] uppercase tracking-[0.32em] text-cyan-300/70 mb-1">
          Explore Courses
        </p>
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#545454] tracking-[0.14em] uppercase flex items-center gap-3">
          Courses
          <span className="inline-flex h-[2px] flex-1 bg-gradient-to-r from-cyan-400 to-transparent shadow-[0_0_18px_rgba(0,195,221,0.8)]" />
        </h1>
      </div>

      {/* SEARCH + FILTER */}
      <div className="flex flex-col md:flex-row md:items-center gap-6">
        {/* SEARCH FIELD (25% on md+) */}
        <div className="w-full md:w-1/4">
          <input
            type="text"
            placeholder="🔍 Search by title or instructor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="neo-input w-full"
          />
        </div>

        {/* CATEGORY FILTER BUTTON GROUP (75% on md+) */}
        <div className="flex flex-wrap gap-2 w-full md:w-3/4">
          {categories.map((cat) => {
            const value = cat === 'All' ? 'all' : cat;
            const isActive = filter === value;

            return (
              <button
                key={cat}
                onClick={() => setFilter(value)}
                className={`neo-btn px-4 py-2 ${
                  isActive ? 'neo-btn-active' : 'neo-btn-idle'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* USER ENROLLED COURSES */}
      {enrolledCourses.length > 0 && (
        <section>
          <h2 className="neo-section-title mb-4">
            My Learning ({enrolledCourses.length})
          </h2>

          <div className="space-y-4">
            {enrolledCourses.map((course) => (
              <CourseCard
                key={course._id}
                course={course}
                onSelect={onCourseSelect}
              />
            ))}
          </div>
        </section>
      )}

      {/* AVAILABLE COURSES */}
      {availableCourses.length > 0 && (
        <section>
          <h2 className="neo-section-title mb-4">
            Available Courses ({availableCourses.length})
          </h2>
          <CourseGrid
            courses={availableCourses}
            onCourseSelect={onCourseSelect}
            onEnroll={handleEnroll}
          />
        </section>
      )}

      {/* EMPTY STATE */}
      {filteredCourses.length === 0 && (
        <div className="text-center py-16 text-slate-400 space-y-3">
          <div className="text-6xl">❌</div>
          <h3 className="text-xl font-semibold text-slate-200">
            No courses found
          </h3>
          <p className="text-slate-400">
            Try adjusting your keywords or filters
          </p>
        </div>
      )}
    </div>
  );
};

export default Courses;






