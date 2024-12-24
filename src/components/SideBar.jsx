import { NavLink } from "react-router-dom";
import { FaBars, FaHome, FaLock, FaMoneyBill,  FaPlug , FaAppStore , FaFileContract, FaExclamationTriangle, FaCog} from "react-icons/fa";
import { MdMessage } from "react-icons/md";
import { BiAnalyse, BiSearch, BiCog } from "react-icons/bi";
import { AiFillHeart, AiTwotoneFileExclamation } from "react-icons/ai";
import { BsCartCheck } from "react-icons/bs";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SidebarMenu from "./SidebarMenu";
import './SideBar.css';
const routes = [
  {
    path: "/",
    name: "Dashboard",
    icon: <FaHome />,
  },
  {
    path: "/endpoints",
    name: "Endpoints",
    icon: <FaPlug />,
  },
  {
    path: "/applications",
    name: "Applications",
    icon: <FaAppStore /> ,
  
  },
  {
    path: "/policies",
    name: "Policies",
    icon: <FaFileContract />,
  },
  
  
  {
    path: "/settings",
    name: "Settings",
    icon: <BiCog />,
   
  },
 
];



const SideBar = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);

  const inputAnimation = {
    hidden: { width: 0, padding: 0, transition: { duration: 0.2 } },
    show: { width: "140px", padding: "5px 15px", transition: { duration: 0.2 } },
  };

  const showAnimation = {
    hidden: { width: 0, opacity: 0, transition: { duration: 0.5 } },
    show: { opacity: 1, width: "auto", transition: { duration: 0.5 } },
  };

  return (
    <>
      <div className="main-container">
        <motion.div
          animate={{ width: isOpen ? "200px" : "45px", transition: { duration: 0.5, type: "spring", damping: 10 } }}
          className="sidebar"
        >
          <div className="top_section">
            <AnimatePresence>
              {isOpen && (
                <motion.h1 variants={showAnimation} initial="hidden" animate="show" exit="hidden" className="logo">
                  {/* Logo Text */}
                </motion.h1>
              )}
            </AnimatePresence>
            <div className="bars">
              <FaBars onClick={toggle} />
            </div>
          </div>
          <div className="search">
  
  <AnimatePresence>
  <div className="search_icon">
  <BiSearch />
  </div>
    {isOpen && (
      <motion.input
        initial="hidden"
        animate="show"
        exit="hidden"
        variants={inputAnimation}
        type="text"
        placeholder="Search"
        className="search_input"
        style={{ 
          marginLeft: isOpen ? "25px" : "0", // Adjust margin to avoid overlap
          backgroundColor: "white", // Set your desired background color here
          color: "black", // Set your desired text color here
          display: "flex",
          alignItems: "center",
          margin: "20px 10px",
          width: "200px", // Initial width
          height: "45px", // Slightly increased height for better visibility
          padding: "0 20px",
          borderRadius: "25px",
          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.2))",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)", // Enhanced shadow for depth
          transition: "background 0.3s ease, box-shadow 0.3s ease" // Smooth transition
        }}
      />
    )}
  </AnimatePresence>
</div>
          <section className="routes">
            {routes.map((route, index) => {
              if (route.subRoutes) {
                return (
                  <SidebarMenu
                    key={index}
                    setIsOpen={setIsOpen}
                    route={route}
                    showAnimation={showAnimation}
                    isOpen={isOpen}
                  />
                );
              }
              return (
                <NavLink to={route.path} key={index} className="link" activeClassname="active">
                  <div className="icon">{route.icon}</div>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div variants={showAnimation} initial="hidden" animate="show" exit="hidden" className="link_text">
                        {route.name}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </NavLink>
              );
            })}
          </section>
        </motion.div>
        <main>{children}</main>
      </div>
    </>
  );
};

export default SideBar;
