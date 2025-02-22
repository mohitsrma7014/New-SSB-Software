import React from 'react';
import { Search } from 'lucide-react';

export const SearchBar = () => (
  <div className="relative w-96">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
    <input
      type="text"
      placeholder="Search payment"
      className="w-full bg-[#1a2c35] rounded-lg pl-10 pr-4 py-2 text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
    />
  </div>
);