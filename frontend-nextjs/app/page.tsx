import HeroSection from "./main/HeroSection";
import AvailableAirline from "./main/AvailableAirline";
import TouristAttractions from "./main/TouristAttractions";
import Footer from "@/components/Footer";
import FlightSearchForm from "./main/FlightSearchForm";

export default function HomePage() {
  

  return (
    <main className="min-h-screen bg-slate-50 ">

      <HeroSection/>

      <FlightSearchForm/>

      <AvailableAirline/>

     
      <TouristAttractions/>

      <Footer/>

    </main>
  );
}