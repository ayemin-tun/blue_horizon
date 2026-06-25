'use client'

export default function TouristAttractions() {
    return (
        <section className="max-w-4xl mx-auto px-4 mt-16">
            <h3 className="text-xs font-bold text-blue-950 mb-4 uppercase tracking-wider font-serif">Top Tourist Attractions</h3>
            <div className="h-px bg-slate-200 mb-6 w-full" />

            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                {/* Bagan */}
                <div
                    className="md:col-span-3 relative h-48 rounded-xl overflow-hidden shadow-sm bg-cover bg-center group cursor-pointer"
                    style={{ backgroundImage: `url('https://images.unsplash.com/photo-1541018939-2a91ca53ee81?q=80&w=800')` }}
                >
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white font-bold tracking-wider text-[11px] uppercase font-serif">
                        Naung Oo (Bagan)
                    </div>
                </div>

                {/* Mandalay */}
                <div
                    className="md:col-span-3 relative h-48 rounded-xl overflow-hidden shadow-sm bg-cover bg-center group cursor-pointer"
                    style={{ backgroundImage: `url('https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?q=80&w=800')` }}
                >
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white font-bold tracking-wider text-[11px] uppercase font-serif">
                        Mandalay
                    </div>
                </div>

                {/* Inle */}
                <div
                    className="md:col-span-2 relative h-40 rounded-xl overflow-hidden shadow-sm bg-cover bg-center group cursor-pointer"
                    style={{ backgroundImage: `url('https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=600')` }}
                >
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white font-bold tracking-wider text-[11px] uppercase font-serif">
                        Heho (Inle)
                    </div>
                </div>

                {/* Myitkyina */}
                <div
                    className="md:col-span-2 relative h-40 rounded-xl overflow-hidden shadow-sm bg-cover bg-center group cursor-pointer"
                    style={{ backgroundImage: `url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600')` }}
                >
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white font-bold tracking-wider text-[11px] uppercase font-serif">
                        Myitkyina
                    </div>
                </div>

                {/* Yangon */}
                <div
                    className="md:col-span-2 relative h-40 rounded-xl overflow-hidden shadow-sm bg-cover bg-center group cursor-pointer"
                    style={{ backgroundImage: `url('https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=600')` }}
                >
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white font-bold tracking-wider text-[11px] uppercase font-serif">
                        Yangon
                    </div>
                </div>
            </div>
        </section>
    )
}