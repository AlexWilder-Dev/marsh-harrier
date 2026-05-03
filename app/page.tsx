import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import CTACards from "@/components/CTACards";
import HorizontalFlow from "@/components/HorizontalFlow";
import PullQuote from "@/components/PullQuote";
import FoodGrid from "@/components/FoodGrid";
import AlesCellar from "@/components/AlesCellar";
import OpeningHours from "@/components/OpeningHours";
import FindUs from "@/components/FindUs";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main id="main-content">
        <Hero />
        <CTACards />
        <HorizontalFlow />
        <PullQuote />
        <FoodGrid />
        <AlesCellar />
        <OpeningHours />
        <FindUs />
      </main>
      <Footer />
    </>
  );
}
