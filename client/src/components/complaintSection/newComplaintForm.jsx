import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

const NewComplaintForm = ({ category, subCategory }) => {
    const [title, setTitle] = useState("");
    const [complaint, setComplaint] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [timeAvailability, setTimeAvailability] = useState("");
    const [locality, setLocality] = useState("");
    const [detailedAddress, setDetailedAddress] = useState("");
    const [file, setFile] = useState(null);

    const queryClient = useQueryClient();

    const submitComplaint = async (formData) => {
        const authToken = localStorage.getItem("authToken");
        const res = await fetch("http://localhost:8000/api/complaints/create",{
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // authorization: `Bearer ${token}`,
                authorization: `${authToken}`,
            },
            body: JSON.stringify(formData),
        });

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data?.message || "Failed to submit complaint");
        }

        return data;
    };

    const mutation = useMutation({
        mutationFn: submitComplaint,
        onSuccess: () => {
            toast.success("Complaint submitted successfully!");
            handleClear();
            // Optionally refetch complaints list
            queryClient.invalidateQueries(["complaints"]);
        },
        onError: (err) => {
            toast.error(`Error: ${err.message}`);
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title || !complaint || !phoneNumber || !locality || !detailedAddress) {
            toast.error("All fields are required!");
            return;
        }

        const formData = {
            title,
            date: new Date(),
            description: complaint,
            phoneNumber,
            address: detailedAddress,
            locality,
            category,
            subCategory,
        };

        mutation.mutate(formData);
    };

    const handleClear = () => {
        setComplaint("");
        setPhoneNumber("");
        setTimeAvailability("");
        setLocality("");
        setDetailedAddress("");
        setFile(null);
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-xl font-bold mb-4">Register a new Complaint:</h2>

            <form onSubmit={handleSubmit}>
                <label className="block font-semibold mb-2">Title</label>
                <input
                    type="text"
                    className="w-full p-2 border rounded-md mb-4"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />

                <label className="block font-semibold mb-2">Complaint (Within 400 Characters ONLY)</label>
                <textarea
                    className="w-full p-2 border rounded-md mb-4"
                    rows="4"
                    maxLength={400}
                    value={complaint}
                    onChange={(e) => setComplaint(e.target.value)}
                />

                <label className="block font-semibold mb-2">Phone Number</label>
                <input
                    type="text"
                    className="w-full p-2 border rounded-md mb-4"
                    placeholder="Phone Number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                />

                <label className="block font-semibold mb-2">Time of availability:</label>
                <input
                    type="text"
                    className="w-full p-2 border rounded-md mb-4"
                    value={timeAvailability}
                    onChange={(e) => setTimeAvailability(e.target.value)}
                />

                <label className="block font-semibold mb-2">Locality:</label>
                <select
                    className="w-full p-2 border rounded-md mb-4"
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                >
                    <option value="">Please Select</option>
                    <option value="Locality1">Locality1</option>
                    <option value="Locality2">Locality2</option>
                </select>

                <label className="block font-semibold mb-2">Detail Address:</label>
                <textarea
                    className="w-full p-2 border rounded-md mb-4"
                    rows="2"
                    value={detailedAddress}
                    onChange={(e) => setDetailedAddress(e.target.value)}
                />

                <label className="block font-semibold mb-2">Upload Image: only .jpg, .jpeg, .JPG format, size2MB </label>
                <input
                    type="file"
                    className="w-full p-2 border rounded-md mb-4"
                    accept=".jpg,.jpeg,.JPG"
                    onChange={(e) => setFile(e.target.files[0])}
                />
                <button
                    type="button"
                    className="text-blue-500 mb-4"
                >
                    Add More Files
                </button>

                <div className="flex space-x-4">
                    <button
                        type="submit"
                        className="bg-green-500 text-white px-4 py-2 rounded-md"
                    >
                        Submit
                    </button>
                    <button
                        type="button"
                        onClick={handleClear}
                        className="bg-orange-500 text-white px-4 py-2 rounded-md"
                    >
                        Clear
                    </button>
                </div>
            </form>
        </div>
    );
};

export default NewComplaintForm;
