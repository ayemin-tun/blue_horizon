'use client';
import React from 'react';
import Modal from './Modal';

interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onClear: () => void;
    hasActiveFilters: boolean;
    children: React.ReactNode;
}

export const FilterModal = ({ isOpen, onClose, onClear, hasActiveFilters, children }: FilterModalProps) => {
    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title="Filter Options" 
            maxWidth="md"
        >
            <div className="space-y-4">
                {hasActiveFilters && (
                    <div className="flex justify-end">
                        <button 
                            onClick={onClear} 
                            className="text-[11px] font-bold text-blue-600 hover:underline"
                        >
                            Clear All
                        </button>
                    </div>
                )}

                {children}

                <button
                    onClick={onClose}
                    className="w-full py-3 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition"
                >
                    Apply Filters
                </button>
            </div>
        </Modal>
    );
};