import React from 'react';
import { ChevronRight } from 'lucide-react';

interface Transaction {
  name: string;
  amount: string;
  type: string;
}

export const TransactionList = () => {
  const transactions: Transaction[] = [
    { name: 'Figma', amount: '15.00', type: 'expense' },
    { name: 'Grammarly', amount: '10.00', type: 'expense' },
    { name: 'Blender', amount: '15.00', type: 'expense' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Transactions</h3>
        <button className="text-sm text-gray-400 hover:text-white flex items-center gap-1">
          View All <ChevronRight size={16} />
        </button>
      </div>

      {transactions.map((tx, index) => (
        <div key={index} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600/20 rounded-lg flex items-center justify-center">
              {tx.name[0]}
            </div>
            <span>{tx.name}</span>
          </div>
          <span className="text-red-400">-${tx.amount}</span>
        </div>
      ))}
    </div>
  );
};