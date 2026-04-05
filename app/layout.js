import './globals.css';
import { LocationProvider } from './context/LocationContext';

export const metadata = {
  title: 'Nearmee - Find the Best Local Businesses Near You',
  description: 'Discover the best local businesses in your area. From restaurants to services, find everything you need near you.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <LocationProvider>
          {children}
        </LocationProvider>
      </body>
    </html>
  );
}
