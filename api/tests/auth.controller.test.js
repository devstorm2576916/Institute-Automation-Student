import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { login, refresh, logout } from '../controllers/auth.controller';
import { User, Student, Admin, Faculty } from '../models/user.model';

// Mock dependencies
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../models/user.model');

describe('Authentication Controller', () => {
    // Common setup before each test
    let mockReq, mockRes, mockNext;
    beforeEach(() => {
        mockReq = {
            body: {},
            user: {},
            foundUser: {}
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            header: jest.fn().mockReturnThis(),
            cookie: jest.fn().mockReturnThis(),
            clearCookie: jest.fn().mockReturnThis(),
            send: jest.fn()
        };
        mockNext = jest.fn();

        // Reset mocks
        jest.clearAllMocks();
    });

    // Login Tests
    describe('Login', () => {
        test('should return 400 if email, password, or role is missing', async () => {
            mockReq.body = { email: 'test@example.com' };
            await login(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Email, password, and role are required'
            });
        });

        test('should return 401 if user not found', async () => {
            mockReq.body = {
                email: 'test@example.com',
                password: 'password',
                role: 'student'
            };

            User.findOne = jest.fn().mockResolvedValue(null);

            await login(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Invalid credentials'
            });
        });

        test('should return 401 if password is incorrect', async () => {
            const mockUser = {
                email: 'test@example.com',
                password: 'hashedpassword'
            };

            User.findOne = jest.fn().mockResolvedValue(mockUser);
            bcrypt.compare = jest.fn().mockResolvedValue(false);

            mockReq.body = {
                email: 'test@example.com',
                password: 'wrongpassword',
                role: 'student'
            };

            await login(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Invalid credentials'
            });
        });

        test('should return 401 if specific user role not found', async () => {
            const mockUser = {
                email: 'test@example.com',
                password: 'hashedpassword'
            };

            User.findOne = jest.fn().mockResolvedValue(mockUser);
            bcrypt.compare = jest.fn().mockResolvedValue(true);
            Student.findOne = jest.fn().mockResolvedValue(null);

            mockReq.body = {
                email: 'test@example.com',
                password: 'password',
                role: 'student'
            };

            await login(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Invalid role'
            });
        });

        test('should successfully login and return tokens', async () => {
            const mockUser = {
                email: 'test@example.com',
                password: 'hashedpassword',
                save: jest.fn().mockResolvedValue(true)
            };
            const mockStudent = { email: 'test@example.com' };

            User.findOne = jest.fn().mockResolvedValue(mockUser);
            Student.findOne = jest.fn().mockResolvedValue(mockStudent);
            bcrypt.compare = jest.fn().mockResolvedValue(true);
            jwt.sign = jest.fn()
                .mockReturnValueOnce('mockAccessToken')
                .mockReturnValueOnce('mockRefreshToken');

            mockReq.body = {
                email: 'test@example.com',
                password: 'password',
                role: 'student'
            };

            await login(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.cookie).toHaveBeenCalledWith(
                'refreshToken',
                'mockRefreshToken',
                { httpOnly: true, sameSite: 'strict' }
            );
            expect(mockRes.header).toHaveBeenCalledWith('Authorization', 'mockAccessToken');
            expect(mockRes.json).toHaveBeenCalledWith({
                user: {
                    email: 'test@example.com',
                    role: 'student'
                }
            });
        });
    });

    // Error Handling Tests
    describe('Error Handling', () => {
        test('login should handle unexpected errors', async () => {
            mockReq.body = {
                email: 'test@example.com',
                password: 'password',
                role: 'student'
            };

            User.findOne = jest.fn().mockRejectedValue(new Error('Database error'));

            await login(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.send).toHaveBeenCalledWith("Something went wrong!");
        });

    });
});