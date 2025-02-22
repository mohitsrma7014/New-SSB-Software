import React from 'react';
import { SearchBar } from './SearchBar';
import { RevenueChart } from './RevenueChart';
import { StatCard } from './StatCard';
import { CreditCard } from './CreditCard';
import { TransactionList } from './TransactionList';
import { ChevronRight } from 'lucide-react';

export const Dashboard = () => {
  return (
    <div className="min-h-screen bg-[#0f1a20] text-white pl-20 w-full"> {/* Full width applied here */}
      <div className="w-full mx-auto p-8"> {/* Ensure full width */}
        <div className="flex justify-between items-center mb-8">
          <SearchBar />
          <div className="flex items-center gap-4">
            <span>Hi Stefan!</span>
            <div className="w-10 h-10 bg-emerald-600 rounded-full"></div>
          </div>
        </div>

        <h1 className="text-3xl font-semibold mb-6">My Dashboard</h1>

        <div className="flex gap-8 w-full"> {/* Ensure content takes full width */}
          <div className="flex-1 space-y-6 w-full"> {/* Full width for the left section */}
            <RevenueChart />

            <div className="grid grid-cols-2 gap-6">
              <StatCard
                title="Income"
                amount="2,240"
                percentage="+12%"
                type="income"
                description="This week's income"
              />
              <StatCard
                title="Expense"
                amount="1,750"
                percentage="+5%"
                type="expense"
                description="This week's expense"
              />
            </div>
          </div>

          <div className="w-96 space-y-6"> {/* Right section with fixed width */}
            <div className="bg-[#1a2c35] rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">My Card</h3>
                <button className="text-sm text-gray-400 hover:text-white flex items-center gap-1">
                  View All <ChevronRight size={16} />
                </button>
              </div>

              <div className="relative">
                <CreditCard />
                <TransactionList />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
