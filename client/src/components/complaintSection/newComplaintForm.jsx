import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

const NewComplaintForm = ({ category, subCategory, onBack }) => {
    const [title, setTitle] = useState("");
    const [complaint, setComplaint] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [timeAvailability, setTimeAvailability] = useState("");
    const [locality, setLocality] = useState("");
    const [detailedAddress, setDetailedAddress] = useState("");
    const [files, setFiles] = useState([]);

    const queryClient = useQueryClient();
    const submitComplaint = async (formData) => {
        const accessToken = localStorage.getItem("accessToken");
        console.log(files);
        const res = await fetch("http://localhost:8000/api/complaints/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // authorization: `Bearer ${token}`,
                authorization: `${accessToken}`,
            },
            body: JSON.stringify(formData),
            credentials: "include",
        });

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data?.message || "Failed to submit complaint");
        }
        onBack(); // Call the onBack function to navigate back to the previous page
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

        // Basic validation for required fields
        if (!title || !complaint || !phoneNumber || !timeAvailability || !locality || !detailedAddress) {
            toast.error("All fields are required!");
            return;
        }

        // Phone number validation
        const phoneRegex = /^\+?\d{1,4}[\s-]?\d{10}$/;
        if (!phoneRegex.test(phoneNumber)) {
            toast.error("Please enter a valid phone number (e.g., +91 9876543210)");
            return;
        }

        // Since timeAvailability is now a dropdown, simple non-empty check is enough
        if (!timeAvailability) {
            toast.error("Please select a time slot for availability.");
            return;
        }

        const formData = {
            title,
            date: new Date(),
            description: complaint,
            phoneNumber,
            timeAvailability,
            address: detailedAddress,
            locality,
            category,
            subCategory,
            images: files,
            imagesNames: files.map((file) => file.name),
        };

        mutation.mutate(formData);
    };

    const handleClear = () => {
        setComplaint("");
        setPhoneNumber("");
        setTimeAvailability("");
        setLocality("");
        setDetailedAddress("");
        setFiles([]);
    };

    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files);

        // Filter valid formats and size (<2MB)
        const validFiles = newFiles.filter((file) => /\.(jpe?g)$/i.test(file.name) && file.size <= 2 * 1024 * 1024);

        setFiles((prevFiles) => [...prevFiles, ...validFiles]);
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
                <select
                    className="w-full p-2 border rounded-md mb-4"
                    value={timeAvailability}
                    onChange={(e) => setTimeAvailability(e.target.value)}
                >
                    <option value="">Select Time Slot</option>
                    <option value="08:00 - 10:00 AM">08:00 - 10:00 AM</option>
                    <option value="10:00 - 12:00 PM">10:00 - 12:00 PM</option>
                    <option value="12:00 - 02:00 PM">12:00 - 02:00 PM</option>
                    <option value="02:00 - 04:00 PM">02:00 - 04:00 PM</option>
                    <option value="04:00 - 06:00 PM">04:00 - 06:00 PM</option>
                    <option value="06:00 - 08:00 PM">06:00 - 08:00 PM</option>
                </select>

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

                <label className="block font-semibold mb-2">Upload Images: only .jpg, .jpeg, .JPG format, size2MB </label>
                <input
                    type="file"
                    className="w-full p-2 border rounded-md mb-1"
                    accept=".jpg,.jpeg,.JPG"
                    multiple
                    onChange={handleFileChange}
                />
                {/* File List */}
                {files.length > 0 && (
                    <div className="mb-4">
                        <h3 className="font-semibold mb-2">Selected Files:</h3>
                        <ul className="list-disc ml-6 text-sm">
                            {files.map((file, index) => (
                                <li key={index}>
                                    {file.name} ({(file.size / 1024).toFixed(1)} KB)
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

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
