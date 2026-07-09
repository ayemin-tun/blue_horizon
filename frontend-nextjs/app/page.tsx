import HeroSection from "./main/HeroSection";
import AvailableAirline from "./main/AvailableAirline";
import TouristAttractions from "./main/TouristAttractions";
import Footer from "@/components/Footer";
import FlightSearchForm from "./main/FlightSearchForm";

export default function HomePage() {


  return (
    <main className="min-h-screen bg-white ">

      <HeroSection />

      <div className="max-w-2xl mx-auto px-4 -mt-36 relative z-30">
        <FlightSearchForm />
      </div>

      <AvailableAirline />


      <TouristAttractions />

      <Footer />

    </main>
  );
}