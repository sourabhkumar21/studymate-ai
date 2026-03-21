import Hero from "../sections/Hero";
import Features from "../sections/Features";
import Trusted from "../sections/Trusted";
import HowItWorks from "../sections/HowItWorks";
import CTA from "../sections/CTA";
import Footer from "../sections/Footer";

export default function Home() {
  return (
    <>
      <Hero />
        <Trusted />
      <Features />
       <HowItWorks />
        <CTA />
        <Footer />

    </>
  );
}