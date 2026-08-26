import Link from 'next/link';
import Header from './components/Header';
import Footer from './components/Footer';

export const metadata = {
  title: 'Page Not Found - DoersMarketing',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <>
      <Header />
      <main>
        <section className="notfound-section">
          <div className="container notfound-inner">
            <p className="notfound-code">404</p>
            <h1>Page Not Found</h1>
            <p className="notfound-message">
              The page you&apos;re looking for doesn&apos;t exist, may have been moved, or the link might be broken.
            </p>

            <Link href="/">
              <button className="btn-cta" id="btn-notfound-home">Go to Homepage</button>
            </Link>

            <div className="notfound-suggestions">
              <p className="notfound-suggestions-title">Here are a few things you can try instead:</p>
              <ul>
                <li>Double-check the URL for typos</li>
                <li><Link href="/search">Search for a business</Link> near you</li>
                <li><Link href="/submit-business">List your own business</Link> for free</li>
                <li><Link href="/">Browse popular categories</Link> from the homepage</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
