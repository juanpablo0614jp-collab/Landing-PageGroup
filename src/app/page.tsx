import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Problema from "@/components/Problema";
import Flujo from "@/components/Flujo";
import Opciones from "@/components/Opciones";
import Comparativa from "@/components/Comparativa";
import Seguridad from "@/components/Seguridad";
import Costos from "@/components/Costos";
import FAQ from "@/components/FAQ";
import CTAFinal from "@/components/CTAFinal";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Problema />
      <Flujo />
      <Opciones />
      <Comparativa />
      <Seguridad />
      <Costos />
      <FAQ />
      <CTAFinal />
      <Footer />
      <BackToTop />
    </main>
  );
}
