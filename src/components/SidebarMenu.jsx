import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";
import { FaAngleDown } from "react-icons/fa";
import { NavLink } from "react-router-dom";

const menuAnimation = {
  hidden: {
    opacity: 0,
    height: 0,
    padding: 0,
    transition: { duration: 0.3, when: "afterChildren" },
  },
  show: {
    opacity: 1,
    height: "auto",
    transition: {
      duration: 0.3,
      when: "beforeChildren",
    },
  },
};

const menuItemAnimation = {
  hidden: (i) => ({
    padding: 0,
    opacity: 0,
    transition: { duration: 0.3, delay: i * 0.1 },
  }),
  show: (i) => ({
    padding: "5px 15px",
    opacity: 1,
    transition: { duration: 0.3, delay: i * 0.1 },
  }),
};

const SidebarMenu = ({ route, showAnimation, isOpen }) => {
  const [isOpenMenu, setIsOpenMenu] = useState(false);
  const toggleMenu = () => setIsOpenMenu(!isOpenMenu);

  return (
    <>
      <div className="menu" onClick={toggleMenu}>
        <div className="menu_icon">{route.icon}</div>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              variants={showAnimation}
              initial="hidden"
              animate="show"
              exit="hidden"
              className="menu_text"
            >
              {route.name}
            </motion.div>
          )}
        </AnimatePresence>
        <FaAngleDown className={`menu_arrow ${isOpenMenu ? "open" : ""}`} />
      </div>
      <AnimatePresence>
        {isOpenMenu && (
          <motion.div
            variants={menuAnimation}
            initial="hidden"
            animate="show"
            exit="hidden"
            className="menu_items"
          >
            
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SidebarMenu;