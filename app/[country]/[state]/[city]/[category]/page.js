import { getCategoryBySlug, getBusinessesByCategorySlug, getCountryByCode, getStateByCode } from '@/app/lib/api';
import CategoryPageClient from '@/app/category/[slug]/CategoryPageClient';
import Footer from '@/app/components/Footer';

// Formatting a raw URL segment for display when no full record is found
// (e.g. it's already a full slug like "new-york" rather than a code like "ny").
function formatSegment(str) {
  if (!str) return '';
  return str.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// The [country]/[state] segments may be short codes ("us"/"ny") or full
// slugs ("united-states"/"new-york") depending on when the link was
// generated. Resolve the full names for display, falling back to naive
// formatting of the raw segment when no matching code record exists.
async function resolveLocationNames(country, state) {
  const countryObj = await getCountryByCode(country).catch(() => null);
  const stateObj = await getStateByCode(state, countryObj?.code || country).catch(() => null);
  return {
    countryName: countryObj?.name || formatSegment(country),
    stateName: stateObj?.name || formatSegment(state),
  };
}

export async function generateMetadata(props) {
  const params = await props.params;
  const { country, state, city, category } = params;
  const catData = await getCategoryBySlug(category).catch(() => null);
  const rawTitle = catData?.name || category.split('-').join(' ');
  const formattedTitle = rawTitle.replace(/\b\w/g, c => c.toUpperCase());

  const { stateName } = await resolveLocationNames(country, state);
  const locStr = `${formatSegment(city)}, ${stateName}`;

  return {
    title: `${formattedTitle} in ${locStr} | DoersMarketing`,
    description: `Find the best ${formattedTitle.toLowerCase()} in ${locStr} on DoersMarketing. Read reviews, view menus, and more.`,
    alternates: {
      // The flat /{category}-in-{city}/ form is the canonical URL for this
      // content — it is what the sitemaps list. This deeper route stays live
      // for existing links but must not compete for the same listing.
      canonical: `https://www.nearmee.net/${category}-in-${city}/`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function LocationCategoryPage(props) {
  const params = await props.params;
  const { country, state, city, category } = params;

  // Fetch initial data on the server, passing location filters to the backend.
  // state_slug/country_slug accept either a slug or short code (see
  // CategoryViewSet.businesses on the backend).
  const catData = await getCategoryBySlug(category).catch(() => null);

  const bizData = await getBusinessesByCategorySlug(category, {
    page: 1,
    country_slug: country,
    state_slug: state,
    city_slug: city
  }).catch(() => ({
    results: [],
    count: 0,
    total_pages: 1
  }));

  return (
    <>
      <CategoryPageClient
        slug={category}
        country={country}
        state={state}
        city={city}
        initialCategoryInfo={catData}
        initialBusinesses={bizData.results || []}
        initialTotalPages={bizData.total_pages || 1}
      />
      <Footer />
    </>
  );
}
