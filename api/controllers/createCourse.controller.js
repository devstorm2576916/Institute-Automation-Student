//import express from "express";
import { Course, FacultyCourse, ProgramCourseMapping } from "../models/course.model.js";

export const createCourse = async (req, res) => {
  try {
    const {
      courseCode,
      courseName,
      maxIntake,
      faculty,
      slot,
      courseDepartment,
      credits,
      year,
      session,
      configurations,
    } = req.body;

    let course = await Course.findOne({ courseCode });
    
    if (!course) {
      course = new Course({ courseCode, department:courseDepartment, courseName, maxIntake, slot, credits });
      await course.save();
    }
    console.log(course);
    for (const config of configurations) {
      const { program, department, semesters, type } = config;

      const facultyCourse = new FacultyCourse({
        facultyId: faculty,
        courseCode,
        year,
        session,
        // program,
        // semesters:semesters[0],
      });
      await facultyCourse.save();
      console.log(facultyCourse);
      for (const semester of semesters) {
        const programMapping = new ProgramCourseMapping({
          courseCode,
          program,
          department,
          year,
          semester:semester[0],
          type,
        });
        await programMapping.save();
        console.log(programMapping);
      }
    }

    return res.status(200).json({ message: "Course, faculty, and mappings saved successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error during course registration" });
  }
};