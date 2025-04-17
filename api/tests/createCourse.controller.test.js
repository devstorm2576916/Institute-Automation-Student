import request from 'supertest';
import express from 'express';
import { createCourse } from '../controllers/createCourse.controller.js';

import { Course, FacultyCourse, ProgramCourseMapping } from '../models/course.model.js';

jest.mock('../models/course.model.js');

// Setup Express app and route
const app = express();
app.use(express.json());
app.post('/courses', createCourse);

describe('createCourse Controller', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create a new course and related mappings', async () => {
        const mockReqBody = {
            courseCode: 'CSE101',
            courseName: 'Intro to CS',
            maxIntake: 60,
            faculty: 'fac123',
            slot: 'A1',
            courseDepartment: 'CSE',
            credits: 3,
            year: 2025,
            session: 'Spring Semester',
            configurations: [
                {
                    program: 'B.Tech',
                    department: 'CSE',
                    semesters: [['6']],
                    type: 'Core'
                }
            ]
        };

        Course.findOne.mockResolvedValue(null);
        Course.prototype.save = jest.fn().mockResolvedValue({});
        FacultyCourse.prototype.save = jest.fn().mockResolvedValue({});
        ProgramCourseMapping.prototype.save = jest.fn().mockResolvedValue({});

        const res = await request(app).post('/courses').send(mockReqBody);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Course, faculty, and mappings saved successfully');

        expect(Course.findOne).toHaveBeenCalledWith({ courseCode: 'CSE101' });
        expect(Course.prototype.save).toHaveBeenCalled();
        expect(FacultyCourse.prototype.save).toHaveBeenCalled();
        expect(ProgramCourseMapping.prototype.save).toHaveBeenCalled();
    });

    it('should handle errors and return 500', async () => {
        Course.findOne.mockRejectedValue(new Error('DB Error'));

        const res = await request(app).post('/courses').send({
            courseCode: 'ERR101',
            courseName: 'Error Course',
            configurations: []
        });

        expect(res.statusCode).toBe(500);
        expect(res.body.message).toBe('Server error during course registration');
    });
});