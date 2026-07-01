'use client';

import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';

export interface Airline {
  id: number;
  airline_name: string;
  airline_code: string;
  country: string;
  status: string;
}

interface AirlineTableProps {
  airlines: Airline[];
  loading: boolean;
  search: string;
  onEdit: (airline: Airline) => void;
  onDelete: (airline: Airline) => void;
  currentPage: number;
  pageSize: number;
}

export default function AirlineTable({
  airlines,
  loading,
  search,
  onEdit,
  onDelete,
  currentPage,
  pageSize,
}: AirlineTableProps) {
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  if (airlines.length === 0) {
    return (
      <div className="text-center py-10 text-sm text-gray-400">
        {search ? 'No matching airlines found.' : 'No airlines found.'}
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            {/* 💡 CODE ကော်လံ ဖျောက်ထားပြီး Header ၄ ခုပဲ ထားပါတယ် */}
            <th className="py-4 px-4 w-16">#</th>
            <th className="py-4 px-4">Airline Name</th>
            <th className="py-4 px-4">Country</th>
            <th className="py-4 px-4 text-right w-24">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 text-xs text-gray-700">
          {airlines.map((airline, index) => {
            // 💡 Fallback အကာအကွယ်ထည့်ထားလို့ Prop မပါလာရင်တောင် #NaN လုံးဝ မဖြစ်တော့ပါဘူး
            const currPage = currentPage || 1;
            const pSize = pageSize || 5;
            const serialNumber = (currPage - 1) * pSize + index + 1;

            return (
              <tr key={airline.id} className="hover:bg-gray-50/50 transition">
                {/* ၁။ အမှတ်စဉ် (#) */}
                <td className="py-4 px-4 text-gray-400 font-medium">
                  #{serialNumber}
                </td>

                {/* ၂။ Airline Name (Code မပါဘဲ နာမည်သက်သက်နှင့် အစိမ်းစက်လေး) */}
                <td className="py-4 px-4 font-semibold text-gray-900">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    {airline.airline_name}
                  </div>
                </td>

                {/* ၃။ Country */}
                <td className="py-4 px-4 text-gray-500">
                  {airline.country || '-'}
                </td>

                {/* ၄။ Actions (Edit & Delete) */}
                <td className="py-4 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEdit(airline)}
                      className="p-1 text-gray-400 hover:text-blue-900 rounded transition"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(airline)}
                      className="p-1 text-gray-400 hover:text-rose-600 rounded transition"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}