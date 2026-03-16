import Header from './components/Header';
import Hero from './components/Hero';
import Categories from './components/Categories';
import Businesses from './components/Businesses';
import CTA from './components/CTA';
import Footer from './components/Footer';

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Categories />
        <Businesses />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
