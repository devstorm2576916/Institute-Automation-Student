import './App.css';
import ComplaintSection from './components/complaintSection';
import HostelLeave from './components/HostelLeave/HostelLeave';
import HostelTransfer from './components/HostelTransfer/HostelTransfer.jsx';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import CourseRegistration from './components/CourseRegistration';
import AttendanceLandingPage from './components/Attendance/AttendanceLandingPage';
import AttendanceCoursePage from './components/Attendance/AttendanceCoursePage';
import CourseFeedbackSelectionPage from './components/courseFeedback/courseFeedbackSelectionPage';
import CourseFeedbackFormPage from './components/courseFeedback/courseFeedbackFormPage';

import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import {
    QueryClient,
    QueryClientProvider,
} from '@tanstack/react-query';

// Import pages
import Documents from './pages/Documents/index.jsx';
import TranscriptPage from './pages/Documents/Transcript.jsx';
import IDCardPage from './pages/Documents/IDCard.jsx';
import PassportPage from './pages/Documents/Passport.jsx';
import BonafidePage from './pages/Documents/Bonafide.jsx';
import FeeReceiptPage from './pages/Documents/FeeReceipt.jsx';


const queryClient = new QueryClient()
function App() {
    const Layout = () => {
        return (
            <div className="app">
            <QueryClientProvider client={queryClient}>
                <Navbar />
                <div style={{ display: 'flex' }}>
                <Sidebar />
                <div style={{ flexGrow: 1 }}>
                    <Outlet />
                </div>
                </div>
            </QueryClientProvider>
            </div>
        );
    };

    const router = createBrowserRouter([
        {
            path: "/",
            element: <Layout />,
            children: [
                {
                    path: "/complaint",
                    element: <ComplaintSection />,
                },
                {
                    path: "/hostel/leave",
                    element: <HostelLeave />,
                },
                {
                    path: "/hostel/transfer",
                    element: <HostelTransfer />,
                },
                { 
                    path: "/registration", 
                    element: <CourseRegistration /> 
                },
                {
                    path:"/attendancelanding",
                    element: <AttendanceLandingPage/>
                },
                {
                    path:"/course/:id",
                    element: <AttendanceCoursePage/>
                },
                  {
                    path: "/documents",
                    element: <Documents />,
                    children: [
                        {
                            path: "",
                            element: <Documents />,
                        },
                        {
                            path: "transcript",
                            element: <TranscriptPage />,
                        },
                        {
                            path: "idcard",
                            element: <IDCardPage />,
                        },
                        {
                            path: "passport",
                            element: <PassportPage />,
                        },
                        {
                            path: "bonafide",
                            element: <BonafidePage />,
                        },
                        {
                            path: "feereceipt",
                            element: <FeeReceiptPage />,
                        }
                    ]
                },
                 {
                    path: "/courseFeedback",
                    element: <CourseFeedbackSelectionPage/>
                },
                {
                    path: "/courseFeedback/selectedCourse",
                    element: <CourseFeedbackFormPage/>
                },
            ],
        },
    ]);

    return <RouterProvider router={router} />;
}

export default App;
