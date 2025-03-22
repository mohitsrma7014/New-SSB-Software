import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import api from "../../api";
import logo from "../../assets/logo.png";
import { BarChart3, Users,PackageSearch , Settings, FileText, Activity, Clipboard,BadgeCheck , LogOut, User, Bell, MessageSquare, Clock, Key, Package, CheckSquare, Database, Truck, Send, List, Calendar, Home, CalendarPlus, Hammer, Wrench, Factory, ClipboardList, Wind, Edit, ShieldCheck, PackageCheck, AlertCircle, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const departmentNavigation = {
  admin: [
    { name: "Add Customer Schedule", href: "/ScheduleForm", icon: CalendarPlus },
    { name: "Forging Planning", href: "/Schedule", icon: Hammer },
    { name: "Schedules Analytics", href: "/Rm_schedule", icon: BarChart3 },
    { name: "Dispatch", href: "/DispatchList", icon: Truck },
    {
      name: "Traceability",
      href: "#",
      icon: PackageSearch ,
      submenu: [
        { name: "Batch Traceability", href: "/TraceabilityCard", icon: Hammer },
        { name: "Component Traceability", href: "/TraceabilityCard2", icon: FileText },
      ]
    },
    {
      name: "Quality",
      href: "#",
      icon: BadgeCheck ,
      submenu: [
        { name: "Forging", href: "/Forgingrejection", icon: Hammer },
        { name: "Rejection Report", href: "/ForgingrDashboard", icon: FileText },
        { name: "Yearly Trend", href: "/FinancialTrends", icon: TrendingUp },
      ]
    },
    {
      name: "Production",
      href: "#",
      icon: Factory,
      submenu: [
        { name: "ProductionPage", href: "/ProductionPage", icon: ClipboardList },
        { name: "Forging", href: "/analytics", icon: Hammer },
        { name: "Heat Treatment", href: "/Htanalytics", icon: Wind },
        { name: "Pre-Machining", href: "/Pre_mc_production", icon: Wrench },
        { name: "CNC", href: "/Cnc_production", icon: Settings },
        { name: "Marking", href: "/Marking_production", icon: Edit },
        { name: "Final Inspection", href: "/Fi_production", icon: ShieldCheck },
        { name: "Visual & Packing", href: "/Visual_production", icon: PackageCheck },
      ]
    },
    {
      name: "Raw Material",
      href: "#",
      icon: Package,
      submenu: [
        { name: "RM Inventory", href: "/BalanceAfterHold", icon: Package },
    { name: "Material Information System (MIS)", href: "/Raw_material_update", icon: FileText },
    { name: "RM Receiving", href: "/Rm_reciving", icon: Truck },
    { name: "Material Issue", href: "/Issu", icon: Send },
    { name: "Material Issuance List", href: "/Issu_list", icon: List },
    { name: "Master List", href: "/Master_list_list", icon: List },
      ]
    },
   
  ],
  rm: [
    { name: "Master Data Management", href: "/Single", icon: Database },
    { name: "RM Inventory", href: "/BalanceAfterHold", icon: Package },
    { name: "Material Information System (MIS)", href: "/Raw_material_update", icon: FileText },
    { name: "RM Receiving", href: "/Rm_reciving", icon: Truck },
    { name: "Material Issue", href: "/Issu", icon: Send },
    { name: "Material Issuance List", href: "/Issu_list", icon: List },
    { name: "RM Order Management", href: "/Orders", icon: Clipboard },
    { name: "Customer Schedules", href: "/Rm_schedule", icon: Calendar },
    { name: "Planning Cheq", href: "/BlockmtForm_dummy", icon: CheckSquare },
    { name: "Running Batches", href: "/Planning_updates", icon: Activity },
    { name: "Batch List", href: "/PlanningUpdates1", icon: List },
    { name: "Master List", href: "/Master_list_list1", icon: FileText },
  ],
};

export function Sidebar({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [department, setDepartment] = useState("admin");
  const [isLoading, setIsLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [submenuPosition, setSubmenuPosition] = useState({ top: 0, left: 0 });
  const submenuTimeout = useRef(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get("http://192.168.1.199:8001/api/user-details/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        setUser(response.data);
        setDepartment(response.data.department.toLowerCase());
      } catch (err) {
        console.error("Failed to fetch user details:", err);
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, [navigate]);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center text-lg font-semibold">Loading...</div>;
  }

  const profilePhotoUrl = user?.profile_photo
    ? user.profile_photo.startsWith("http")
      ? user.profile_photo
      : `http://192.168.1.199:8001${user.profile_photo}`
    : null;
  const navigationItems = departmentNavigation[department] || [];
  const departmentTitle = department.charAt(0).toUpperCase() + department.slice(1);
  const handleHomeClick = () => {
    if (location.pathname !== `/department/${departmentTitle}`) {
      navigate(`/department/${departmentTitle}`);
    }
  };
  const handleMouseEnter = (event, item) => {
    if (submenuTimeout.current) clearTimeout(submenuTimeout.current);
    const rect = event.target.getBoundingClientRect();
    setSubmenuPosition({ top: rect.bottom, left: rect.left });
    setHoveredItem(item.name);
  };

  const handleMouseLeave = () => {
    submenuTimeout.current = setTimeout(() => setHoveredItem(null), 300);
  };

  return (
    <div className="fixed h-screen z-50 w-64 bg-white border-r border-gray-200 flex flex-col justify-between">
      <motion.aside
        initial={{ x: -250, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex-1 flex flex-col"
      >
        <div className="border-b border-gray-200 pt-2 pb-2 flex justify-center items-center">
          <img src={logo} alt="SAP Logo" className="h-12 w-15" />
        </div>

        <div className="pt-2">
          <h2 className="mb-4 text-lg font-bold text-black">{departmentTitle} Department</h2>

          <nav>
            <ul>
              <motion.li
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 rounded-md py-1 text-sm font-medium text-gray-700 hover:bg-blue-50 cursor-pointer"
                onClick={handleHomeClick}
              >
                <Home className="h-5 w-5" />
                <span>Home</span>
              </motion.li>
            </ul>
            <ul>
              {navigationItems.map((item) => (
                <motion.li
                  key={item.name}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-3 rounded-md py-1 text-sm font-medium text-gray-700 hover:bg-blue-50 relative"
                  onMouseEnter={(e) => handleMouseEnter(e, item)}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => !item.submenu && navigate(item.href)}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </motion.li>
              ))}
            </ul>
          </nav>
        </div>
      </motion.aside>

      {/* Render submenu outside the main menu container */}
      {hoveredItem && (
        <ul
          className="absolute z-50 bg-white shadow-lg rounded-md p-2"
          style={{ top: submenuPosition.top, left: submenuPosition.left }}
          onMouseEnter={() => clearTimeout(submenuTimeout.current)}
          onMouseLeave={handleMouseLeave}
        >
          {navigationItems
            .find((navItem) => navItem.name === hoveredItem)
            ?.submenu?.map((subItem) => (
              <motion.li
                key={subItem.name}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 rounded-md py-1 text-sm font-medium text-gray-700 hover:bg-blue-50"
                onClick={() => navigate(subItem.href)}
              >
                <span>{subItem.name}</span>
              </motion.li>
            ))}
        </ul>
      )}

      <div className="border-t border-gray-200 p-2 flex items-center justify-between">
        {user && (
          <div className="flex items-center gap-3">
            {profilePhotoUrl && (
              <img
                src={profilePhotoUrl}
                alt="Profile"
                className="h-12 w-12 rounded-full object-cover"
              />
            )}
            <div className="flex flex-col justify-center h-12">
              <span className="text-base font-semibold text-black">
                {user.name} {user.lastname}
              </span>
              <span className="text-sm text-gray-500">Welcome!</span>
            </div>
          </div>
        )}

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-full hover:bg-gray-200"
          >
            <Settings size={20} className="text-gray-600" />
          </button>

          {showMenu && (
            <div className="absolute right-0 bottom-full mb-2 bg-white shadow-lg rounded-md w-60 flex flex-col gap-2 border border-gray-200 p-2">
              <button
                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 rounded-md"
                onClick={() => navigate("/ChangePassword")}
              >
                <Key size={20} className="text-gray-600" />
                Change Password
              </button>
              <button
                className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-100 rounded-md"
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("user");
                  navigate("/");
                }}
              >
                <LogOut size={20} />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}