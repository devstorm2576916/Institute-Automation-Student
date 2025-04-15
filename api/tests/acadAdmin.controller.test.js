import {
  getAllApplications,
  filterApplications,
  getApplicationById,
  updateApplicationStatus,
  addComment,
} from '../controllers/acadAdmin.controller.js';

import { ApplicationDocument, Bonafide, Passport } from '../models/documents.models.js';
import { Student } from '../models/student.model.js';
import httpMocks from 'node-mocks-http';

jest.mock('../models/documents.models.js');
jest.mock('../models/student.model.js');

describe('Application Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllApplications', () => {
    it('should return paginated applications with student details', async () => {
      const req = httpMocks.createRequest({
        method: 'GET',
        query: { page: '1', limit: '2' }
      });
      const res = httpMocks.createResponse();

      const mockApps = [{
        _id: 'app1',
        studentId: {
          _id: 'student1',
          rollNo: '123',
          department: 'CSE',
          program: 'B.Tech',
          userId: { name: 'John Doe' }
        },
        createdAt: new Date()
      }];

      ApplicationDocument.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockApps),
      });

      ApplicationDocument.countDocuments.mockResolvedValue(1);

      await getAllApplications(req, res);

      const data = res._getJSONData();
      expect(res.statusCode).toBe(200);
      expect(data.applications[0].studentId.name).toBe('John Doe');
      expect(data.totalPages).toBe(1);
      expect(data.currentPage).toBe('1');
    });
  });

  describe('filterApplications', () => {
    it('should return filtered applications based on rollNo', async () => {
      const req = httpMocks.createRequest({
        method: 'GET',
        query: { rollNo: '123', type: 'Bonafide', status: 'Approved' }
      });
      const res = httpMocks.createResponse();

      Student.findOne.mockResolvedValue({ _id: 'studentId123' });

      ApplicationDocument.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([{
          _id: 'app1',
          studentId: {
            _id: 'studentId123',
            rollNo: '123',
            department: 'CSE',
            userId: { name: 'Jane Doe' }
          },
          documentType: 'Bonafide'
        }])
      });

      Bonafide.findOne.mockResolvedValue({ reason: 'Scholarship' });

      await filterApplications(req, res);

      const data = res._getJSONData();
      expect(res.statusCode).toBe(200);
      expect(data[0].studentName).toBe('Jane Doe');
    });
  });

  describe('getApplicationById', () => {
    it('should return application details by ID', async () => {
      const req = httpMocks.createRequest({
        method: 'GET',
        params: { id: 'appId1' }
      });
      const res = httpMocks.createResponse();

      ApplicationDocument.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue({
          _id: 'appId1',
          documentType: 'Bonafide',
          studentId: {
            rollNo: '123',
            department: 'CSE',
            userId: {
              name: 'John',
              dateOfBirth: '2000-01-01',
              email: 'john@example.com',
              contactNo: '9999999999'
            },
            program: 'B.Tech',
            semester: 6,
            hostel: 'A',
            roomNo: '101',
            batch: '2022',
            fatherName: 'Mr. Doe',
            motherName: 'Mrs. Doe'
          },
          updatedAt: new Date()
        })
      });

      Bonafide.findOne.mockResolvedValue({ reason: 'Internship' });

      await getApplicationById(req, res);

      const data = res._getJSONData();
      expect(res.statusCode).toBe(200);
      expect(data.studentDetails.name).toBe('John');
      expect(data.details.reason).toBe('Internship');
    });
  });

  describe('updateApplicationStatus', () => {
    it('should update application status and return updated application', async () => {
      const req = httpMocks.createRequest({
        method: 'PATCH',
        params: { id: 'appId1' },
        body: { status: 'Approved', remarks: 'All good' }
      });
      const res = httpMocks.createResponse();

      const saveMock = jest.fn().mockResolvedValue({
        _id: 'appId1',
        status: 'Approved',
        approvalDetails: { remarks: ['All good'], approvalDate: new Date() },
        updatedAt: new Date(),
        studentId: {
          _id: 'student1',
          rollNo: '123',
          department: 'CSE',
          program: 'B.Tech',
          userId: { name: 'John Doe' },
          toObject: function () { return this; }
        },
        toObject: function () { return this; },
        populate: jest.fn().mockResolvedValue(this)
      });

      ApplicationDocument.findById.mockResolvedValue({
        _id: 'appId1',
        approvalDetails: { remarks: [] },
        save: saveMock,
        updatedAt: new Date(),
        populate: jest.fn().mockResolvedValue(this)
      });

      await updateApplicationStatus(req, res);

      const data = res._getJSONData();
      expect(res.statusCode).toBe(200);
      expect(data.status).toBe('Approved');
      expect(data.studentId.name).toBe('John Doe');
    });
  });

  describe('addComment', () => {
    it('should add comment to approvalDetails.remarks', async () => {
      const req = httpMocks.createRequest({
        method: 'POST',
        params: { id: 'appId1' },
        body: { comment: 'Needs correction in document' }
      });
      const res = httpMocks.createResponse();

      ApplicationDocument.findByIdAndUpdate.mockResolvedValue({
        _id: 'appId1',
        approvalDetails: { remarks: ['Needs correction in document'] }
      });

      await addComment(req, res);

      const data = res._getJSONData();
      expect(res.statusCode).toBe(200);
      expect(data.approvalDetails.remarks).toContain('Needs correction in document');
    });
  });
});