import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Statistics from "@/components/Statistics";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <Features />
        <Statistics />
        <a
          href="/termo24"
          className="text-blue-500 hover:underline justify-center flex"
        >
          Termo24
        </a>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
