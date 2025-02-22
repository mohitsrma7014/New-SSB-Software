import React from 'react';

interface StatCardProps {
  title: string;
  amount: string;
  percentage: string;
  type: 'income' | 'expense';
  description: string;
}

export const StatCard = ({ title, amount, percentage, type, description }: StatCardProps) => (
  <div className="bg-[#1a2c35] rounded-2xl p-6">
    <div className="flex justify-between items-center mb-4">
      <h3 className="font-semibold">{title}</h3>
      <span className={`${
        type === 'income' ? 'bg-emerald-600/20 text-emerald-400' : 'bg-violet-600/20 text-violet-400'
      } px-2 py-1 rounded-lg text-sm`}>
        {percentage}
      </span>
    </div>
    <div className="text-2xl font-bold">${amount}</div>
    <div className="text-sm text-gray-400">{description}</div>
  </div>
);