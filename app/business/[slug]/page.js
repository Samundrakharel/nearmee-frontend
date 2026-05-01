import { getBusinessBySlug } from '../../lib/api';
import BusinessPageClient from './BusinessPageClient';

export async function generateMetadata(props) {
  const params = await props.params;

  try {
    const apiBase = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
    const res = await fetch(`${apiBase}/businesses/${params.slug}/`, {
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': '69420',
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) throw new Error(`API ${res.status}`);

    const biz = await res.json();
    const seoTitle = biz?.seo?.title || `${biz?.name} | Nearmee`;
    const description = biz?.description || `View reviews, menus, and photos for ${biz?.name} on Nearmee.`;

    return {
      title: seoTitle,
      description,
      alternates: {
        canonical: `https://www.nearmee.net/business/${params.slug}`,
      },
      robots: { index: true, follow: true },
    };
  } catch (e) {
    console.error('generateMetadata failed:', e.message);
    return {
      title: 'Business | Nearmee',
      description: 'Find local businesses on Nearmee.',
      robots: { index: false, follow: false },
    };
  }
}

export default async function BusinessPage(props) {
  const params = await props.params;
  const { slug } = params;
  const business = await getBusinessBySlug(slug).catch(() => null);

  return <BusinessPageClient slug={slug} initialBusiness={business} />;
}
