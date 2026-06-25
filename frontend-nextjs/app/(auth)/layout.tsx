import Reacts from "react";

import Image from 'next/image';
import logoImg from '@/public/logo.png';
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {


    return (
        <>
            <div className="flex min-h-screen bg-slate-50 font-sans">
                {/* Left size - DISCOVER THE HORIZON (Hero Image Section) */}
                <div className="relative hidden w-1/2 bg-blue-900 lg:block">
                    {/* Background Image  */}
                    <img
                        src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=1200&auto=format&fit=crop"
                        alt="Blue Horizon Jet"
                        className="absolute inset-0 h-full w-full object-cover opacity-85 mix-blend-multiply"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-linear-to-t from-blue-950/80 via-transparent to-blue-900/40" />

                    {/* Text Contents */}
                    <Link href="/">
                        <div className="absolute inset-0 flex flex-col justify-between p-12 text-white">
                            <div className="flex items-center gap-3">
                                {/* Logo Icon */}
                                <div className="relative h-12 w-12 object-contain">
                                    <Image
                                        src={logoImg}
                                        alt="Blue Horizon Logo"
                                        priority
                                        className="h-full w-full object-contain filter brightness-0 invert"
                                    />
                                </div>


                                <div>
                                    <h2 className="text-xl font-bold tracking-wider">BLUE HORIZON</h2>
                                    <p className="text-xs text-blue-200/80">Air ticket analysis system</p>
                                </div>
                            </div>

                            <div className="max-w-md space-y-4">
                                <h1 className="text-4xl font-extrabold tracking-tight leading-tight uppercase">
                                    Discover <br /> The Horizon
                                </h1>
                                <p className="text-blue-100/90 leading-relaxed italic text-sm">
                                    "Explore the world with Blue Horizon. <br />
                                    Fly to your dream destinations with comfort, safety, and unmatched reliability."
                                </p>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* 🔐 Left Size - Form Section */}
                <div className="flex w-full flex-col justify-center bg-white px-8 py-12 lg:w-1/2 sm:px-16 md:px-24">
                    {children}
                </div>
            </div>
        </>
    );
}