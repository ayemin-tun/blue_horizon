"use client";

import React, { useState, useMemo, useRef } from 'react';

import {
  useAirlinesQuery,
  Airline,
  PaginatedAirlineResponse,
} from '@/services/airlineService';

export default function AvailableAirline() {

  const [search, setSearch] = useState('');

  const [page, setPage] = useState(1);
  const LIMIT = 10;

  const { data: apiResponse, isLoading: loading, error } = useAirlinesQuery(page, LIMIT, search);

  // Reference for the carousel container
  const carouselRef = useRef<HTMLDivElement>(null);

  //  (Type Casting)
  const res = apiResponse as unknown as PaginatedAirlineResponse;

  const airlines: Airline[] = res?.data || [];
  // const paginationInfo = res?.pagination;

  // CHANGED: Added this variable to read the item count easily
  const displayedAirlines = airlines.slice(0, 10);

  // Carousel scroll handler
  // CAROUSAL BEHAVIOUR 1
  /*
  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const { scrollLeft, clientWidth } = carouselRef.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth 
        : scrollLeft + clientWidth;
      
      carouselRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };
  */

  // CAROUSAL BEHAVIOUR 2
  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const container = carouselRef.current;
      const firstCard = container.firstElementChild as HTMLElement;
      
      if (firstCard) {
        // Measures 1 card's exact width and adds 16px to account for the 'gap-4' spacing
        const cardWidth = firstCard.clientWidth + 16; 
        
        const scrollTo = direction === 'left' 
          ? container.scrollLeft - cardWidth 
          : container.scrollLeft + cardWidth;
        
        container.scrollTo({ left: scrollTo, behavior: 'smooth' });
      }
    }
  };

  // Handle loading and error states so the UI doesn't break before data arrives
  if (loading) return <div className="text-center mt-16 text-slate-500">Loading airlines...</div>;
  if (error) return <div className="text-center mt-16 text-red-500">Failed to load airlines.</div>;

  return (
    <section className="max-w-4xl mx-auto px-4 mt-16">
      <h3 className="text-xs font-bold text-blue-950 mb-4 uppercase tracking-wider font-serif">Available Airlines</h3>
      <div className="h-[1px] bg-slate-200 mb-6 w-full" />
      
      {/* Relative wrapper for left/right arrow placement */}
      <div className="relative w-full flex items-center px-4">
        
        {/* Left Arrow */}
        <button 
          onClick={() => scroll('left')}
          className="absolute left-0 z-10 w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-md hover:bg-slate-50 transition active:scale-95 text-lg font-semibold"
          aria-label="Scroll Left"
        >
          ‹
        </button>

        {/* Carousel Scroll Container */}
        <div 
          ref={carouselRef}
          className={`flex gap-4 overflow-x-auto snap-x snap-mandatory w-full pb-2 ${
            displayedAirlines.length < 4 ? 'md:justify-center' : ''
          } ${
            displayedAirlines.length === 1 ? 'justify-center' : ''
          }`}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* CHANGED: Replaced airlines.slice(0, 4) with the new displayedAirlines variable */}
          {displayedAirlines.map((airline) => ( 
            <div
              key={airline.airline_id}
              className="border border-slate-200 bg-white rounded-xl p-5 flex flex-col items-center justify-center gap-2 shadow-sm hover:shadow-md transition text-center cursor-pointer h-24 snap-center shrink-0 w-[calc(50%-8px)] md:w-[calc(25%-12px)]"
            >
              <div className="w-6 h-6 flex items-center justify-center"> 
                <img 
        src="/logo.png" // Pointing to your public folder
        alt={`${airline.airline_name} Logo`}
        className="w-full h-full object-contain" // Prevents the image from stretching or distorting
                />
              </div>
              <span className="text-[11px] font-semibold text-slate-700 tracking-wide truncate w-full px-1">
                {airline.airline_name}
              </span>
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        <button 
          onClick={() => scroll('right')}
          className="absolute right-0 z-10 w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-md hover:bg-slate-50 transition active:scale-95 text-lg font-semibold"
          aria-label="Scroll Right"
        >
          ›
        </button>

      </div>
    </section>
  )
}