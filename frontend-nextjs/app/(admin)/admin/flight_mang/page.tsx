"use client";

import React, { useState, useEffect } from 'react';

interface Airline {
    airline_id: number;
    airline_name: string;
    country: string;
}

export default function AdminAirlinesPage() {
    const [airlines, setAirlines] = useState<Airline[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAirlines = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/airlines');
                if (!response.ok) {
                    throw new Error('Failed to fetch airlines');
                }

                const data = await response.json();

                if (data.success) {
                    setAirlines(data.data || []);
                } else {
                    throw new Error(data.message || 'Failed to fetch airlines');
                }
            } catch (err: any) {
                setError(err.message || 'An unexpected error occurred while fetching airlines.');
            } finally {
                setLoading(false);
            }
        };

        fetchAirlines();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-slate-50">
                <div className="text-lg font-semibold text-slate-600 animate-pulse flex items-center space-x-2">
                    <svg className="w-6 h-6 animate-spin text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    <span>Loading airline data...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-slate-50 p-4">
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-6 rounded shadow-sm max-w-lg w-full">
                    <div className="flex items-center mb-2">
                        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <h3 className="font-bold text-lg">Error Loading Data</h3>
                    </div>
                    <p className="ml-8">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Airlines Management</h1>
                        <p className="text-slate-500 mt-2 text-sm">View-only dashboard for all registered airlines in the system.</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        ID
                                    </th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        Airline Name
                                    </th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        Country
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {airlines.length > 0 ? (
                                    airlines.map((airline) => (
                                        <tr key={airline.airline_id} className="hover:bg-slate-50/80 transition-colors duration-150 ease-in-out">
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                                                    #{airline.airline_id}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-slate-900">
                                                {airline.airline_name}
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-600">
                                                {airline.country}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center text-slate-500">
                                                <svg className="w-12 h-12 mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                                                <p className="text-sm">No airlines found in the system.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
