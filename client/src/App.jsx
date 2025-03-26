import './App.css';
import ComplaintSection from './components/complaintSection';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import {
    QueryClient,
    QueryClientProvider,
} from '@tanstack/react-query';

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
                
            ],
        },
    ]);

    return <RouterProvider router={router} />;
}

export default App;
