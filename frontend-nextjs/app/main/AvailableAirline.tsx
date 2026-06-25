"use client";


export default function AvailableAirline() {
  return (

    <section className="max-w-4xl mx-auto px-4 mt-16">
      <h3 className="text-xs font-bold text-blue-950 mb-4 uppercase tracking-wider font-serif">Available Airlines</h3>
      <div className="h-[1px] bg-slate-200 mb-6 w-full" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { name: "Blue Horizon", logo: "✈️" },
          { name: "MAI", logo: "🇲🇲" },
          { name: "Air Asia", logo: "🔴" },
          { name: "Air Thanlwin", logo: "🦅" }
        ].map((airline, idx) => (
          <div
            key={idx}
            className="border border-slate-200 bg-white rounded-xl p-5 flex flex-col items-center justify-center gap-2 shadow-sm hover:shadow-md transition text-center cursor-pointer h-24"
          >
            <div className="text-xl">{airline.logo}</div>
            <span className="text-[11px] font-semibold text-slate-700 tracking-wide">{airline.name}</span>
          </div>
        ))}
      </div>
    </section>
  )
}