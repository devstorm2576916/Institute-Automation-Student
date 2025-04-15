import request from "supertest";
import app from "../app"; // Assuming your Express app is exported from app.js
import { Complaint, SupportStaff } from "../models/complaint.model.js";
import { HostelAdmin } from "../models/hostelAdmin.model.js";
import mongoose from "mongoose";

describe("ComplaintsController", () => {
    let token; // Mock token for authentication
    let adminToken; // Mock token for admin authentication
    let userId; // Mock user ID
    let adminEmail; // Mock admin email
    let complaintId; // Mock complaint ID
    let supportStaffId; // Mock support staff ID

    beforeAll(async () => {
        // Connect to the test database
        await mongoose.connect(process.env.TEST_DB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        // Mock user and admin tokens
        token = "mock-user-token-1";
        adminToken = "mock-admin-token-2";
        userId = "220101039"; // Use rollNo from userData
        adminEmail = "testHab@iitg.ac.in"; // Use email from nonAcadAdminData

        // Create a mock admin
        await HostelAdmin.create({
            name: "Himanshu Sharma",
            email: adminEmail,
            password: "1234",
            refreshToken: "sample-refresh-token-2",
            contactNo: "8329521234",
            isVerified: true,
        });
    });

    afterAll(async () => {
        // Clean up the database and close the connection
        if (complaintId) {
            await Complaint.deleteOne({ _id: complaintId });
        }
        if (supportStaffId) {
            await SupportStaff.deleteOne({ _id: supportStaffId });
        }
        if (adminEmail) {
            await HostelAdmin.deleteOne({ email: adminEmail });
        }
        await mongoose.connection.close();
    });

    describe("createComplaint", () => {
        it("should create a new complaint", async () => {
            const response = await request(app)
                .post("/api/complaints")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    userId,
                    title: "Test Complaint",
                    date: new Date(),
                    description: "This is a test complaint",
                    category: "General",
                    subCategory: "Maintenance",
                    imageUrl: "http://example.com/image.jpg"
                });

            expect(response.status).toBe(201);
            expect(response.body.message).toBe("Successfully created the complaint");
            complaintId = response.body.complaint._id; // Save the complaint ID for later tests
        });
    });

    describe("getUserComplaints", () => {
        it("should fetch complaints for the logged-in user", async () => {
            const response = await request(app)
                .get("/api/complaints/user")
                .set("Authorization", `Bearer ${token}`)
                .send();

            expect(response.status).toBe(200);
            expect(response.body.data).toBeDefined();
        });
    });

    describe("getAllComplaints", () => {
        it("should fetch all complaints for admin", async () => {
            const response = await request(app)
                .get("/api/complaints")
                .set("Authorization", `Bearer ${adminToken}`)
                .send();

            expect(response.status).toBe(200);
            expect(response.body.data).toBeDefined();
        });
    });

    describe("deleteComplaint", () => {
        it("should delete a complaint", async () => {
            const response = await request(app)
                .delete("/api/complaints")
                .set("Authorization", `Bearer ${token}`)
                .send({ _id: complaintId });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe("Complaint deleted successfully!");
        });
    });

    describe("updateStatus", () => {
        it("should update the status of a complaint", async () => {
            const response = await request(app)
                .patch("/api/complaints/status")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({
                    complaintId,
                    updatedStatus: "Resolved",
                });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe("Complaint updated successfully!");
        });
    });

    describe("assignComplaint", () => {
        it("should assign a complaint to support staff", async () => {
            const response = await request(app)
                .patch("/api/complaints/assign")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({
                    complaintId,
                    assignedName: "John Doe",
                    assignedContact: "1234567890",
                });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe("Complaint assigned successfully!");
        });
    });

    describe("createSupportStaff", () => {
        it("should create a new support staff", async () => {
            const response = await request(app)
                .post("/api/support-staff")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({
                    name: "Jane Doe",
                    phone: "9876543210",
                });

            expect(response.status).toBe(201);
            expect(response.body.message).toBe("Successfully created the support staff");
            supportStaffId = response.body.supportStaff._id; // Save the support staff ID for later tests
        });
    });

    describe("deleteSupportStaff", () => {
        it("should delete a support staff", async () => {
            const response = await request(app)
                .delete("/api/support-staff")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ supportStaffId });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe("Support staff deleted successfully!");
        });
    });

    describe("getAllSupportStaff", () => {
        it("should fetch all support staff", async () => {
            const response = await request(app)
                .get("/api/support-staff")
                .set("Authorization", `Bearer ${adminToken}`)
                .send();

            expect(response.status).toBe(200);
            expect(response.body.message).toBe("Support staff fetched successfully!");
        });
    });
});