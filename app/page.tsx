import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import HorizontalFlow from "@/components/HorizontalFlow";
import PullQuote from "@/components/PullQuote";
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
        <HorizontalFlow />
        <PullQuote />
        <AlesCellar />
        <OpeningHours />
        <FindUs />
      </main>
      <Footer />
    </>
  );
}
