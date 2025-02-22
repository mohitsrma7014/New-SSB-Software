import React from 'react';

export const RevenueChart = () => (
  <div className="bg-[#1a2c35] rounded-2xl p-6">
    <div className="flex gap-4 mb-6">
      {['All', 'Forging', 'Heat-Treatment', 'Shot-Blast'].map((tab, index) => (
        <button
          key={index}
          className={`px-4 py-2 rounded-lg ${
            index === 0 ? 'bg-emerald-600' : 'hover:bg-emerald-600/10'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
    
    <div className="h-64 flex items-end gap-4 mb-4">
      {Array(6).fill(0).map((_, i) => (
        <div
          key={i}
          className={`flex-1 ${
            i === 4 ? 'bg-violet-500' : 'bg-emerald-600/20'
          } rounded-t-lg`}
          style={{ height: `${Math.random() * 100}%` }}
        ></div>
      ))}
    </div>
  </div>
);