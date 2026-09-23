import Hero from '@/components/home/hero';
import Stats from '@/components/home/stats';
import Features from '@/components/home/features';
import CTA from '@/components/home/Cta';

export default function Home() {
  return (
    <main className="bg-black min-h-screen">
      <Hero />
      <Stats />
      <Features />
      <CTA />
    </main>
  );
}