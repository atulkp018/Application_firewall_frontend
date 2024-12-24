import { Route, Routes, useParams } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import { useState, useEffect} from "react";
import isro from './assets/isro.png';
import EndpointManagement from "./pages/EndpointManagement";
import EndpointDetails from "./pages/EndpointDetails";
import PolicyFormPage from './pages/PolicyFormPage';
import Dashboard from './pages/Dashboard'
import ApplicationDetails from './pages/ApplicationDetails'
import PolicyDetails from "./pages/PolicyDetails";
import ActivityChart from "./components/ActivityChart.jsx";
import PolicyManagement from "./pages/PolicyManagement"
import DPI_page from "./pages/DPI_page";
import Appdatacards from "./components/Appdatacards";
import App_alert from "./components/App_alert.jsx"
import Policy_form_app from "./components/Policy_form_app";



function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [navVisible,setnavVisible]=useState(false);
  console.log(`login vala : ${isLoggedIn}`);
  console.log(`nav vala : ${navVisible}`);

   // Read the initial state from localStorage when the component mounts
   useEffect(() => {
    const storedNavVisible = localStorage.getItem('navVisible');
    if (storedNavVisible !== null) {
      setnavVisible(JSON.parse(storedNavVisible));
    }
  }, []);

  // Store the navVisible state in localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('navVisible', JSON.stringify(navVisible));
  }, [navVisible]);

  console.log(isLoggedIn);
  console.log(navVisible);

  return (
    <div className="App">
      <img src={isro} alt="ISRO Logo" />
      <div className="background-container"></div>

      <div className="w-screen min-h-screen bg-transparent flex flex-col">
        <Navbar navVisible={navVisible} setnavVisible={setnavVisible} isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />

        <Routes>
          <Route path="/" element={<Login setIsLoggedIn={setIsLoggedIn} setnavVisible={setnavVisible}/>} />
          <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} setnavVisible={setnavVisible} />} />
          <Route path="/EndpointManagement" element={<EndpointManagement />} />
          <Route path="/PolicyPage" element={<PolicyManagement />} />
          <Route path="/endpoint-details/:id" element={<EndpointDetails />} />
          <Route path="/policy-form" element={<PolicyFormPage />} />
          <Route path="/policy-form-app" element={<Policy_form_app/>}/>
          <Route path="/PolicyDetails" element={<PolicyDetails />} />
          <Route path="/DPI_page" element={<DPI_page/>} />
          <Route path="/Appdatacards/:endpoint" element={<Appdatacards/>} />
          <Route path="/application/:appName" element={<ApplicationDetails />} />
          <Route path="/Dashboard" element={<Dashboard />} />
          <Route path="/App_alert/:app/:endpoint" element={<App_alert/>} />
          <Route 
              path="/Dashboard/app/:endpoint/:app" 
              element={<ActivityChartWrapper />} 
            />

        </Routes>
        
      </div>
    </div>
  );
}
const ActivityChartWrapper = () => {
  const { endpoint, app } = useParams();
  return <ActivityChart endpoint={endpoint} app={app} />;
};


export default App;
