// src/pages/Grades.jsx
import React, { useState, useEffect } from 'react';
import { gradeAPI, enrollmentAPI } from '../services/api';
import { getGradeColor } from '../utils/helpers';

const Grades = () => {
  const [grades, setGrades] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      setLoading(true);
      const [gradesRes, enrollmentsRes] = await Promise.all([
        gradeAPI.getMy(),
        enrollmentAPI.getMy()
      ]);
      
      setGrades(gradesRes.grades || []);
      setEnrollments(enrollmentsRes.enrollments || []);
    } catch (error) {
      console.error('Error fetching grades:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateGPA = () => {
    const gradePoints = {
      'A': 4.0,
      'B': 3.0,
      'C': 2.0,
      'D': 1.0,
      'F': 0.0
    };

    if (grades.length === 0) return '0.00';
    
    const total = grades.reduce((sum, grade) => {
      const letter = grade.letterGrade || 'F';
      return sum + (gradePoints[letter] || 0);
    }, 0);
    
    return (total / grades.length).toFixed(2);
  };

  const averageScore = grades.length > 0
    ? Math.round(grades.reduce((acc, grade) => acc + (grade.score || 0), 0) / grades.length)
    : 0;

  const highGrades = grades.filter(g => g.letterGrade === 'A' || g.letterGrade === 'B').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading grades...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Grades</h1>
        <div className="text-right">
          <div className="text-2xl font-bold text-purple-600">GPA: {calculateGPA()}</div>
          <p className="text-sm text-gray-600">Current Grade Point Average</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-2xl font-bold text-gray-900">{grades.length}</div>
          <p className="text-gray-600">Graded Items</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-2xl font-bold text-green-600">{highGrades}</div>
          <p className="text-gray-600">A & B Grades</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-2xl font-bold text-gray-900">{enrollments.length}</div>
          <p className="text-gray-600">Active Courses</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-2xl font-bold text-purple-600">{averageScore}%</div>
          <p className="text-gray-600">Average Score</p>
        </div>
      </div>

      {/* Grades Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Grades</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {grades.map((grade) => (
                <tr key={grade._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {grade.assignment?.title || grade.quiz?.title || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {grade.course?.title || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-cyan-100 text-cyan-800">
                      {grade.type || 'Assignment'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getGradeColor(grade.letterGrade)}`}>
                      {grade.letterGrade} ({grade.score}%)
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(grade.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {grades.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No grades yet</h3>
            <p className="text-gray-600">Your grades will appear here once assignments are graded.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Grades;





