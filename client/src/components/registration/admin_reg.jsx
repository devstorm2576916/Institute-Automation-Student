import React, { useState } from 'react';
import axios from 'axios';

const CourseForm = () => {
  const [courseData, setCourseData] = useState({
    courseCode: '',
    courseName: '',
    maxIntake: '',
    faculty: '',
    slot: '',
    credits: '',
    year: '',
    session: ''
  });

  const [config, setConfig] = useState({
    program: '',
    department: '',
    semesters: [],
    type: ''
  });

  const [configurations, setConfigurations] = useState([]);

  const handleCourseChange = (e) => {
    setCourseData({ ...courseData, [e.target.name]: e.target.value });
  };

  const handleConfigChange = (e) => {
    const { name, value } = e.target;
    setConfig({ ...config, [name]: value });
  };

  const handleSemesterChange = (e) => {
    const value = e.target.value;
    const isChecked = e.target.checked;

    if (isChecked) {
      setConfig({ ...config, semesters: [...config.semesters, value] });
    } else {
      setConfig({
        ...config,
        semesters: config.semesters.filter((s) => s !== value)
      });
    }
  };

  const addConfiguration = () => {
    if (!config.program || !config.department || !config.semesters.length || !config.type) {
      alert('Please fill all fields in configuration');
      return;
    }

    setConfigurations([...configurations, config]);
    setConfig({ program: '', department: '', semesters: [], type: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...courseData,
      configurations
    };

    try {
        console.log(payload);
      const res = await axios.post('http://localhost:8000/api/course/register-course', payload); // Change URL if needed
      alert('Course registered successfully!');
      setCourseData({
        courseCode: '',
        courseName: '',
        maxIntake: '',
        faculty: '',
        slot: '',
        credits: '',
        year: '',
        session: ''
      });
      setConfigurations([]);
    } catch (err) {
      console.error(err);
      alert('Failed to register course');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Course Registration</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Course Details */}
        {[
          { name: 'courseCode', label: 'Course Code' },
          { name: 'courseName', label: 'Course Name' },
          {name:'courseDepartment', label:'Course Department'},
          { name: 'faculty', label: 'Faculty ID' },
          { name: 'maxIntake', label: 'Max Intake', type: 'number' },
          { name: 'slot', label: 'Slot' },
          { name: 'credits', label: 'Credits', type: 'number' },
          { name: 'year', label: 'Academic Year (e.g., 2024)' },
          { name: 'session', label: 'Session (e.g., Spring)' }
        ].map((field) => (
          <div key={field.name}>
            <label className="block font-semibold">{field.label}</label>
            <input
              type={field.type || 'text'}
              name={field.name}
              value={courseData[field.name]}
              onChange={handleCourseChange}
              className="w-full border rounded p-2"
              required
            />
          </div>
        ))}

        <hr className="my-4" />

        {/* Mapping Section */}
        <h3 className="text-lg font-semibold">Add Program Configuration</h3>

        <div>
          <label className="block font-semibold">Program</label>
          <input
            type="text"
            name="program"
            value={config.program}
            onChange={handleConfigChange}
            className="w-full border rounded p-2"
            required
          />
        </div>

        <div>
          <label className="block font-semibold">Department</label>
          <input
            type="text"
            name="department"
            value={config.department}
            onChange={handleConfigChange}
            className="w-full border rounded p-2"
            required
          />
        </div>

        <div>
          <label className="block font-semibold">Semester(s)</label>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
              <label key={sem} className="flex items-center">
                <input
                  type="checkbox"
                  value={sem}
                  checked={config.semesters.includes(String(sem))}
                  onChange={handleSemesterChange}
                  className="mr-2"
                />
                {sem}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block font-semibold">Course Type</label>
          <select
            name="type"
            value={config.type}
            onChange={handleConfigChange}
            className="w-full border rounded p-2"
            required
          >
            <option value="">Select</option>
            <option value="Core">Core</option>
            <option value="Elective">Elective</option>
          </select>
        </div>

        <button
          type="button"
          onClick={addConfiguration}
          className="bg-blue-600 text-white px-4 py-2 rounded mt-2"
        >
          Add Configuration
        </button>

        {/* Display Configurations */}
        {configurations.length > 0 && (
          <div className="bg-gray-100 p-4 rounded mt-4">
            <h4 className="font-bold mb-2">Added Configurations</h4>
            <ul className="list-disc list-inside">
              {configurations.map((cfg, index) => (
                <li key={index}>
                  Program: {cfg.program}, Dept: {cfg.department}, Semesters: [{cfg.semesters.join(', ')}], Type: {cfg.type}
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Submit Course
        </button>
      </form>
    </div>
  );
};

export default CourseForm;
