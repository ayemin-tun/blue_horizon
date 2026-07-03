'use client'

export default function TouristAttractions() {
    return (
        <section className="max-w-4xl mx-auto px-4 mt-16">
            <h3 className="text-xs font-bold text-blue-950 mb-4 uppercase tracking-wider font-serif">Top Tourist Attractions</h3>
            <div className="h-px bg-slate-200 mb-6 w-full" />

            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                
                {/* 1. Bagan */}
                <a
                    href="https://en.wikipedia.org/wiki/Bagan"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="md:col-span-3 block relative h-48 rounded-xl overflow-hidden shadow-sm bg-cover bg-center group cursor-pointer"
                    style={{ backgroundImage: `url('tourist_attractions/bagan.jpg')` }}
                >
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent transition-all group-hover:from-black/70" />
                    <div className="absolute bottom-4 left-4 text-white font-bold tracking-wider text-[11px] uppercase font-serif transition-transform group-hover:translate-x-1">
                        Naung Oo (Bagan)
                    </div>
                </a>

                {/* 2. Mandalay */}
                <a
                    href="https://en.wikipedia.org/wiki/Mandalay"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="md:col-span-3 block relative h-48 rounded-xl overflow-hidden shadow-sm bg-cover bg-center group cursor-pointer"
                    style={{ backgroundImage: `url('tourist_attractions/mandalay.jpg')` }} 
                >
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent transition-all group-hover:from-black/70" />
                    <div className="absolute bottom-4 left-4 text-white font-bold tracking-wider text-[11px] uppercase font-serif transition-transform group-hover:translate-x-1">
                        Mandalay
                    </div>
                </a>

                {/* 3. NayPyiDaw */}
                <a
                    href="https://en.wikipedia.org/wiki/Naypyidaw"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="md:col-span-2 block relative h-40 rounded-xl overflow-hidden shadow-sm bg-cover bg-center group cursor-pointer"
                    style={{ backgroundImage: `url('tourist_attractions/naypyidaw.jpg')` }}
                >
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent transition-all group-hover:from-black/70" />
                    <div className="absolute bottom-4 left-4 text-white font-bold tracking-wider text-[11px] uppercase font-serif transition-transform group-hover:translate-x-1">
                        NayPyiDaw
                    </div>
                </a>

                {/* 4. TaungGyi */}
                <a
                    href="https://en.wikipedia.org/wiki/Taunggyi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="md:col-span-2 block relative h-40 rounded-xl overflow-hidden shadow-sm bg-cover bg-center group cursor-pointer"
                    style={{ backgroundImage: `url('tourist_attractions/taunggyi.jpg')` }}
                >
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent transition-all group-hover:from-black/70" />
                    <div className="absolute bottom-4 left-4 text-white font-bold tracking-wider text-[11px] uppercase font-serif transition-transform group-hover:translate-x-1">
                        TaungGyi
                    </div>
                </a>

                {/* 5. Yangon */}
                <a
                    href="https://en.wikipedia.org/wiki/Yangon"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="md:col-span-2 block relative h-40 rounded-xl overflow-hidden shadow-sm bg-cover bg-center group cursor-pointer"
                    style={{ backgroundImage: `url('tourist_attractions/yangon.jpg')` }}
                >
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent transition-all group-hover:from-black/70" />
                    <div className="absolute bottom-4 left-4 text-white font-bold tracking-wider text-[11px] uppercase font-serif transition-transform group-hover:translate-x-1">
                        Yangon
                    </div>
                </a>
                
            </div>
        </section>
    )
}