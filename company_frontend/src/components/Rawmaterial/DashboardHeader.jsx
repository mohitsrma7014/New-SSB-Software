import { useState, useEffect } from "react";
import { Clock, Bell, MessageSquare } from "lucide-react";

const DashboardHeader = () => {
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setDateTime(new Date());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="fixed top-0 left-[254px] px-6 flex justify-between bg-white w-[calc(100%-254px)] z-50 border border-gray-300 border-b-gray-100" style={{ paddingTop: "10px", paddingBottom: "17px" }}>
      <h2 className="text-xl font-semibold">Dashboard</h2>
      <div className="hidden items-center gap-2 rounded-full   text-sm md:flex">
      <div className="hidden items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-sm md:flex">
        <Clock className="h-4 w-4 text-gray-500" />
        <span className="text-sm text-gray-600">
          {dateTime.toLocaleString("en-US", {
            weekday: "short",
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
          })}
        </span>
        </div>
        <div className="hidden items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-sm md:flex">
        <Bell className="h-4 w-4" />
        </div>
        <div className="hidden items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-sm md:flex">
        <MessageSquare className="h-4 w-4" />
      </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
