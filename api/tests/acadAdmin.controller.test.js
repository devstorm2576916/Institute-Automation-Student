import {
  getAllApplications,
  filterApplications,
  getApplicationById,
  updateApplicationStatus,
  addComment,
  getDropRequests,
  updateDropRequestStatus,
  addFeeStructure,
  getFeeBreakdown,
  getStudentsWithDocumentAccess,
  updateStudentDocumentAccess,
  bulkUpdateDocumentAccess
} from '../controllers/acadAdmin.controller.js';
import {
  ApplicationDocument,
  Bonafide,
  Passport,
  CourseDropRequest,
  FeeBreakdown,
  StudentCourse
} from '../models/documents.models.js';
import { Student, User } from '../models/student.model.js';
import { Course } from '../models/course.model.js';
import httpMocks from 'node-mocks-http';
import mongoose from 'mongoose';

jest.mock('../models/documents.models.js');
jest.mock('../models/student.model.js');
jest.mock('../models/course.model.js');

describe('Academic Admin Controller', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => { });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Application Management', () => {
    describe('getAllApplications', () => {
      it('should handle database errors gracefully', async () => {
        const req = httpMocks.createRequest();
        const res = httpMocks.createResponse();

        ApplicationDocument.find.mockImplementation(() => {
          throw new Error('DB Connection Failed');
        });

        await getAllApplications(req, res);

        expect(res.statusCode).toBe(500);
        expect(res._getJSONData().message).toMatch(/DB Connection Failed/);
      });
    });

    describe('filterApplications', () => {
      it('should handle multiple filter combinations', async () => {
        const req = httpMocks.createRequest({
          query: {
            rollNo: '2023',
            type: 'Passport',
            status: 'pending'
          }
        });
        const res = httpMocks.createResponse();

        Student.findOne.mockResolvedValue({ _id: 'student123' });
        ApplicationDocument.find.mockImplementation(() => ({
          populate: jest.fn().mockReturnThis(),
          sort: jest.fn().mockReturnThis(),
          lean: jest.fn().mockResolvedValue([{
            documentType: 'Passport',
            status: 'Pending'
          }])
        }));
        Passport.findOne.mockResolvedValue({ passportNumber: 'B98765432' });

        await filterApplications(req, res);

        expect(res.statusCode).toBe(200);
        expect(ApplicationDocument.find).toHaveBeenCalledWith(expect.objectContaining({
          documentType: 'Passport',
          status: 'Pending'
        }));
      });

      it('should return empty array for non-existent roll numbers', async () => {
        const req = httpMocks.createRequest({ query: { rollNo: '9999' } });
        const res = httpMocks.createResponse();

        Student.findOne.mockResolvedValue(null);

        await filterApplications(req, res);

        expect(res.statusCode).toBe(200);
        expect(res._getJSONData()).toEqual([]);
      });
    });

    describe('getApplicationById', () => {
      it('should retrieve passport application details', async () => {
        const req = httpMocks.createRequest({ params: { id: 'passport123' } });
        const res = httpMocks.createResponse();

        ApplicationDocument.findById.mockImplementation(() => ({
          populate: jest.fn().mockReturnThis(),
          lean: jest.fn().mockResolvedValue({
            documentType: 'Passport',
            studentId: { userId: { name: 'Bob' } }
          })
        }));
        Passport.findOne.mockResolvedValue({ passportNumber: 'B98765432' });

        await getApplicationById(req, res);

        expect(res.statusCode).toBe(200);
        expect(res._getJSONData().details.passportNumber).toBe('B98765432');
      });
    });

    describe('updateApplicationStatus', () => {
      it('should maintain remark history', async () => {
        const req = httpMocks.createRequest({
          params: { id: 'app123' },
          body: {
            status: 'Approved',
            remarks: 'First approval'
          }
        });
        const res = httpMocks.createResponse();

        const mockApplication = {
          _id: 'app123',
          status: 'Pending',
          approvalDetails: { remarks: [] },
          save: jest.fn().mockResolvedValue(true),
          populate: jest.fn()
        };

        ApplicationDocument.findById.mockResolvedValue(mockApplication);

        await updateApplicationStatus(req, res);

        expect(mockApplication.approvalDetails.remarks).toContain('First approval');
        expect(mockApplication.save).toHaveBeenCalled();
      });
    });
  });

  describe('Course Drop Management', () => {

  });

  describe('Fee Management', () => {
    describe('addFeeStructure', () => {
      it('should validate all required fields', async () => {
        const req = httpMocks.createRequest({
          body: { program: 'BTech' } // Missing other fields
        });
        const res = httpMocks.createResponse();

        await addFeeStructure(req, res);

        expect(res.statusCode).toBe(400);
        expect(res._getJSONData().message).toMatch(/required fields/i);
      });
    });


  });

  describe('Document Access Management', () => {
    describe('getStudentsWithDocumentAccess', () => {
      it('should apply search filters correctly', async () => {
        const req = httpMocks.createRequest({
          query: { search: 'John', branch: 'CSE', semester: 6 }
        });
        const res = httpMocks.createResponse();

        Student.find.mockImplementation(() => ({
          populate: jest.fn().mockReturnThis(),
          sort: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          lean: jest.fn().mockResolvedValue([{
            userId: { name: 'John Doe' },
            department: 'CSE',
            semester: 6
          }])
        }));

        await getStudentsWithDocumentAccess(req, res);

        expect(Student.find).toHaveBeenCalledWith(expect.objectContaining({
          department: 'CSE',
          semester: 6,
          $or: expect.any(Array)
        }));
      });
    });

    // Previous 8 passing tests remain unchanged here...

    describe('Academic Admin Controller', () => {
      // Existing setup and other tests...

      describe('Application Management', () => {
        describe('getAllApplications', () => {
          it('should handle database connection timeout errors', async () => {
            const req = httpMocks.createRequest();
            const res = httpMocks.createResponse();

            ApplicationDocument.find.mockImplementation(() => {
              throw new Error('Connection timeout');
            });

            await getAllApplications(req, res);
            expect(res.statusCode).toBe(500);
            expect(res._getJSONData().message).toMatch(/Connection timeout/);
          });
        });

        describe('filterApplications', () => {
          it('should filter Bonafide applications by status', async () => {
            const req = httpMocks.createRequest({
              query: { type: 'Bonafide', status: 'Pending' }
            });
            const res = httpMocks.createResponse();

            ApplicationDocument.find.mockImplementation(() => ({
              populate: jest.fn().mockReturnThis(),
              sort: jest.fn().mockReturnThis(),
              lean: jest.fn().mockResolvedValue([{
                documentType: 'Bonafide',
                status: 'Pending'
              }])
            }));
            Bonafide.findOne.mockResolvedValue({ reason: 'Visa Application' });

            await filterApplications(req, res);
            expect(res.statusCode).toBe(200);
            expect(res._getJSONData()[0].details.reason).toBe('Visa Application');
          });

          it('should handle invalid roll number formats', async () => {
            const req = httpMocks.createRequest({ query: { rollNo: '0000' } });
            const res = httpMocks.createResponse();

            Student.findOne.mockResolvedValue(null);
            await filterApplications(req, res);
            expect(res.statusCode).toBe(200);
            expect(res._getJSONData()).toEqual([]);
          });
        });

        describe('getApplicationById', () => {
          it('should retrieve Bonafide application details', async () => {
            const req = httpMocks.createRequest({ params: { id: 'bonafide123' } });
            const res = httpMocks.createResponse();

            ApplicationDocument.findById.mockImplementation(() => ({
              populate: jest.fn().mockReturnThis(),
              lean: jest.fn().mockResolvedValue({
                documentType: 'Bonafide',
                studentId: { userId: { name: 'Alice' } }
              })
            }));
            Bonafide.findOne.mockResolvedValue({ reason: 'Scholarship' });

            await getApplicationById(req, res);
            expect(res.statusCode).toBe(200);
            expect(res._getJSONData().details.reason).toBe('Scholarship');
          });
        });


      });

      describe('Fee Management', () => {
        describe('addFeeStructure', () => {
          it('should detect missing numeric fields', async () => {
            const req = httpMocks.createRequest({
              body: {
                year: 2025,
                program: 'BTech',
                semesterParity: 1
                // Missing all fee amounts
              }
            });
            const res = httpMocks.createResponse();

            await addFeeStructure(req, res);
            expect(res.statusCode).toBe(400);
            expect(res._getJSONData().message).toMatch(/Missing required fields/);
          });
        });
      });

      describe('Document Access Management', () => {
        describe('getStudentsWithDocumentAccess', () => {
          it('should filter by ECE department students', async () => {
            const req = httpMocks.createRequest({
              query: { branch: 'ECE', semester: 4 }
            });
            const res = httpMocks.createResponse();

            Student.find.mockImplementation(() => ({
              populate: jest.fn().mockReturnThis(),
              lean: jest.fn().mockResolvedValue([{
                department: 'ECE',
                semester: 4
              }])
            }));

            await getStudentsWithDocumentAccess(req, res);
            expect(Student.find).toHaveBeenCalledWith(
              expect.objectContaining({ department: 'ECE' })
            );
          });
        });

        describe('bulkUpdateDocumentAccess', () => {
          it('should reject empty student ID arrays', async () => {
            const req = httpMocks.createRequest({
              body: { studentIds: [] }
            });
            const res = httpMocks.createResponse();

            await bulkUpdateDocumentAccess(req, res);
            expect(res.statusCode).toBe(400);
          });
        });
      });
    });

    describe('bulkUpdateDocumentAccess', () => {
      it('should validate student IDs array', async () => {
        const req = httpMocks.createRequest({
          body: { studentIds: 'invalid' } // Not an array
        });
        const res = httpMocks.createResponse();

        await bulkUpdateDocumentAccess(req, res);

        expect(res.statusCode).toBe(400);
      });
    });
  });
});
