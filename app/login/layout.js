export const metadata = {
  title: 'Sign In | Nearmee',
  description: 'Sign in to your Nearmee account to manage your listings and reviews.',
  alternates: {
    canonical: 'https://www.nearmee.com/login',
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function LoginLayout({ children }) {
  return children;
}
