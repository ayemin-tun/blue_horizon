import React from 'react';

interface FilterItem {
    label: string;
    onRemove: () => void;
}

interface ActiveFiltersProps {
    items: FilterItem[]; 
}

export const ActiveFilters = ({ items }: ActiveFiltersProps) => {
    if (items.length === 0) return null;

    return (
        <div className="flex flex-wrap items-center gap-2 mb-4 animate-in fade-in duration-300">
            <span className="text-xs text-slate-500 mr-1">Filters:</span>
            {items.map((item, index) => (
                <div key={index} className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-[11px] font-medium rounded-full border border-blue-200">
                    {item.label}
                    <button onClick={item.onRemove} className="hover:text-blue-900 ml-0.5">✕</button>
                </div>
            ))}
        </div>
    );
};