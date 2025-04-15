import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import { RoleContext } from "../../../context/Rolecontext";
import { useContext } from "react";



const localizer = momentLocalizer(moment);
function MyCalendar({ selectedStudent }) {  // Proper prop destructuring
    const { role } = useContext(RoleContext);
    const { id: courseId } = useParams();
    const [myEventsList, setMyEventsList] = useState([]);
    const [view, setView] = useState(Views.WEEK);
    const [date, setDate] = useState(new Date());
    
    useEffect(() => {
        const fetchData = async () => {
            let rollNoToFetch;
            
            if (role === 'student') {
                const currentUser = JSON.parse(localStorage.getItem("currentUser"));
                rollNoToFetch = currentUser?.user?.rollNo;
            } else if (selectedStudent) {
                rollNoToFetch = selectedStudent;
            }
            if (rollNoToFetch) {
                await fetchEventData(rollNoToFetch);
            }
        };

        fetchData();
    }, [selectedStudent, role, courseId]);  // Add all dependencies

    const fetchEventData = async (rollNo) => {
        try {
            const response = await fetch(`http://localhost:8000/api/attendancelanding/student/${courseId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "rollno": rollNo,
                },
            });

            const data = await response.json();

            if (response.ok) {
                setMyEventsList(data.eventList || []);  // Ensure we always have an array
                console.log('Updated events:', data.eventList);  // Debug log
            } else {
                console.error("Error fetching attendance data:", data.error);
            }
        } catch (error) {
            console.error("Error fetching attendance data:", error);
        }
    };

    return (
        <div className='calendar-box'>
            <Calendar
                views={[Views.MONTH, Views.WEEK, Views.DAY]}
                defaultView={view}
                view={view}
                date={date}
                onView={setView}
                onNavigate={setDate}
                localizer={localizer}
                events={myEventsList}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 350 }}
            />
        </div>
    );
}
export default MyCalendar;
