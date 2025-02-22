import React, { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Notification = ({ complaints }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("target");
  const [targetNotifications, setTargetNotifications] = useState([]);
  const [capaNotifications, setCapaNotifications] = useState([]);
  const [dueNotifications, setDueNotifications] = useState([]);

  useEffect(() => {
    const today = new Date();
    const target = [];
    const capa = [];
    const dues = [];

    complaints.forEach((complaint) => {
      if (complaint.completion_status !== "open") return;

      const actionDate = new Date(complaint.target_submission_date);
      const capaDate = new Date(complaint.capa_submission_date);
      const isActionDue = (actionDate - today) / (1000 * 60 * 60 * 24) <= 2;
      const isCapaDue = (capaDate - today) / (1000 * 60 * 60 * 24) <= 7;
      const isOverdue = actionDate < today || capaDate < today;

      if (isActionDue) {
        target.push({
          id: complaint.id,
          part: complaint.part_number,
          customer: complaint.customer_name,
          date: complaint.target_submission_date,
        });
      }
      if (isCapaDue) {
        capa.push({
          id: complaint.id,
          part: complaint.part_number,
          customer: complaint.customer_name,
          date: complaint.capa_submission_date,
        });
      }
      if (isOverdue) {
        dues.push({
          id: complaint.id,
          component: complaint.part_number,
          reason: actionDate < today ? "Target Submission Overdue" : "CAPA Submission Overdue",
          date: actionDate < today ? complaint.target_submission_date : complaint.capa_submission_date,
        });
      }
    });

    setTargetNotifications(target);
    setCapaNotifications(capa);
    setDueNotifications(dues);
  }, [complaints]);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative  rounded-full bg-gray-100 hover:bg-gray-200 transition"
      >
        <Bell className="w-6 h-6 text-gray-600" />
        {(targetNotifications.length + capaNotifications.length + dueNotifications.length) > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
            {targetNotifications.length + capaNotifications.length + dueNotifications.length}
          </span>
        )}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-12 right-0 w-96 bg-white shadow-lg rounded-lg p-2  z-50 overflow-hidden border border-gray-200"
          >
            <div className="flex justify-around border-b pb-1 mb-1 bg-gray-100 p-1 rounded-md">
              {["target", "capa", "dues"].map((key) => (
                <button
                  key={key}
                  className={`px-2 py-2 rounded-md font-semibold transition-all text-sm ${
                    activeTab === key ? "bg-blue-500 text-white shadow-md" : "bg-gray-200 hover:bg-gray-300"
                  }`}
                  onClick={() => setActiveTab(key)}
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                  <span className="ml-4 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {key === "target" ? targetNotifications.length : key === "capa" ? capaNotifications.length : dueNotifications.length}
                  </span>
                </button>
              ))}
            </div>
            <div className="overflow-y-auto max-h-80 space-y-2">
              {activeTab === "target" && targetNotifications.map((note) => (
                <div key={note.id} className="p-2 bg-gray-100 rounded-lg shadow-sm border-l-4 border-blue-500">
                  <p className="text-sm font-semibold">ID: {note.id} | Part: {note.part}</p>
                  <p className="text-xs text-gray-600">Customer: {note.customer}</p>
                  <p className="text-xs text-red-500">Target Date: {note.date}</p>
                </div>
              ))}
              {activeTab === "capa" && capaNotifications.map((note) => (
                <div key={note.id} className="p-2 bg-gray-100 rounded-lg shadow-sm border-l-4 border-yellow-500">
                  <p className="text-sm font-semibold">ID: {note.id} | Part: {note.part}</p>
                  <p className="text-xs text-gray-600">Customer: {note.customer}</p>
                  <p className="text-xs text-red-500">CAPA Date: {note.date}</p>
                </div>
              ))}
              {activeTab === "dues" && dueNotifications.map((note) => (
                <div key={note.id} className="p-2 bg-gray-100 rounded-lg shadow-sm border-l-4 border-red-500">
                  <p className="text-sm font-semibold">ID: {note.id} | Component: {note.component}</p>
                  <p className="text-xs text-red-500">{note.reason}</p>
                  <p className="text-xs text-red-500">Due Date: {note.date}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Notification;
