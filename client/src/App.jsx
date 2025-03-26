import './App.css';
import ComplaintSection from './components/complaintSection';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

function App() {
  return (
    // <div className="App">
    //   Institute Automation System
    // </div>
    <>
    <Navbar/>
    <div className='flex'>
    <Sidebar/>
    <ComplaintSection/>
    </div>
    
    </>
  );
}

export default App;
