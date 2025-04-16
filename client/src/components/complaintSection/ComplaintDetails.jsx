import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import AssignForm from "./AssignForm";

const token = localStorage.getItem("token");

const ComplaintDetails = ({ complaint, onBack, role }) => {
    const [showAssignModal, setShowAssignModal] = useState(false);
    const queryClient = useQueryClient();

    console.log(complaint);

    // DELETE
    const deleteMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch("http://localhost:8000/api/complaints/delete", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ _id: complaint._id }),
                credentials: "include",
            });

            if (!res.ok) throw new Error("Failed to delete complaint");
        },
        onSuccess: () => {
            toast.success("Complaint deleted");
            onBack(true);
            queryClient.invalidateQueries(["complaints"]);
        },
        onError: (err) => {
            toast.error(err.message);
        },
    });

    // MARK AS DONE
    const markAsDoneMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch("http://localhost:8000/api/complaints/admin/updateStatus", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ complaintId: complaint._id, updatedStatus: "Resolved" }),
                credentials: "include",
            });
            console.log(res.data);
            if (!res.ok) throw new Error("Failed to mark as done");
        },
        onSuccess: () => {
            toast.success("Marked as resolved");
            onBack(true);
            queryClient.invalidateQueries(["complaints"]);
        },
        onError: (err) => {
            toast.error(err.message);
        },
    });

    // ASSIGN
    const assignMutation = useMutation({
        mutationFn: async ({ assignedPerson }) => {
            const body = {
                complaintId: complaint._id,
                assignedName: assignedPerson.name,
                assignedContact: assignedPerson.phoneNo,
            };
            console.log(body);
            const res = await fetch("http://localhost:8000/api/complaints/admin/assign", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    complaintId: complaint._id,
                    assignedName: assignedPerson.name,
                    assignedContact: assignedPerson.phoneNo,
                }),
                credentials: "include",
            });

            if (!res.ok) {
                console.log(res);
                throw new Error(`Failed to assign complaint ${res}`);
            }
        },
        onSuccess: () => {
            toast.success("Complaint assigned");
            onBack(true);
            queryClient.invalidateQueries(["complaints"]);
        },
        onError: (err) => {
            console.log(err.error);
            toast.error(err.message);
        },
    });

    // Event Handlers
    const handleDelete = (e) => {
        e.preventDefault();
        deleteMutation.mutate();
    };

    const handleMarkAsDone = (e) => {
        e.preventDefault();
        markAsDoneMutation.mutate();
    };

    const handleAssign = (assignedPerson) => {
        assignMutation.mutate({ assignedPerson });
        setShowAssignModal(false);
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg relative">
            <div className="flex justify-between items-center mb-4">
                <button
                    className="bg-gray-600 text-white px-2 py-1 rounded-md hover:bg-gray-700"
                    onClick={onBack}
                >
                    Back
                </button>
                {role === "student" && (
                    <button
                        className="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-gray-700"
                        onClick={handleDelete}
                    >
                        Delete
                    </button>
                )}
                {role === "nonAcadAdmin" && complaint.status === "Pending" && (
                    <button
                        className="bg-green-500 text-white px-2 py-1 rounded-md hover:bg-green-700"
                        onClick={() => setShowAssignModal(true)}
                    >
                        Assign
                    </button>
                )}
                {role === "nonAcadAdmin" && complaint.status === "In Progress" && (
                    <button
                        className="bg-green-500 text-white px-2 py-1 rounded-md hover:bg-green-700"
                        onClick={handleMarkAsDone}
                    >
                        Mark as Done
                    </button>
                )}
            </div>
            <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{complaint.title}</h2>
                <p className="text-sm text-gray-600 mb-1">Date: {complaint.date}</p>
                <p className="text-sm text-gray-600 mb-1">Status: {complaint.status}</p>
                <p className="text-sm text-gray-600 mb-1">
                    <span className="font-semibold">Phone Number:</span> {complaint.phoneNumber}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                    <span className="font-semibold">Address:</span> Room {complaint.address} Hostel
                </p>
                <p className="text-sm text-gray-600 mb-4">
                    <span className="font-semibold">Description:</span> {complaint.description || "No additional details provided."}
                </p>
                {role === "student" && complaint.status === "In Progress" && (
                    <p className="text-sm text-gray-600 mb-4">
                        <div>
                            {" "}
                            <span className="font-semibold">Assigned Pesron : </span>
                            {complaint.assignedPerson.name}
                        </div>
                        <div>
                            {" "}
                            <span className="font-semibold">Phone Number : </span>
                            {complaint.assignedPerson.phoneNo}
                        </div>
                    </p>
                )}
            </div>
            {showAssignModal && (
                <AssignForm
                    onClose={() => setShowAssignModal(false)}
                    onAssign={handleAssign}
                    complaint={complaint}
                />
            )}
        </div>
    );
};

export default ComplaintDetails;
