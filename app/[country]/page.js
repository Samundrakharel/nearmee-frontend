import { cache } from 'react';
import { notFound } from 'next/navigation';
import {
  getCategoryBySlug,
  getBusinessesByCategorySlug,
  getStateByCode,
  getStateBySlug,
  getCityBySlug,
  getPageContent,
} from '@/app/lib/api';
import CategoryPageClient from '@/app/category/[slug]/CategoryPageClient';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import ContentPage from '@/app/components/ContentPage';

/**
 * Every one-segment top-level URL that is not its own route, in two flavours.
 *
 * 1. Flat category + location landing pages: /{category}-in-{state|city}/
 *
 *      /asian-restaurants-in-fl/      → Asian Restaurants across Florida
 *      /asian-restaurants-in-miami/   → Asian Restaurants in Miami
 *
 *    These are the URLs listed in /us-sitemap.xml and
 *    /state-category1-sitemap.xml, and they are the canonical form for this
 *    content — the deeper /[country]/[state]/[city]/[category] route still
 *    works for existing links but points its canonical here.
 *
 * 2. Admin-managed content pages: /{slug} for any published
 *    core.models.Page — /privacy-policy, /terms-of-service and anything added
 *    later. Creating the page in Django admin → Core → Content Pages is the
 *    whole job; no route needs to be added here for it to go live. (/about and
 *    /contact predate this and keep their own routes, since each adds
 *    page-specific furniture.)
 *
 * Category lookup is tried first so an existing landing page can never be
 * shadowed by a content page someone names after it.
 *
 * The folder is named [country] out of necessity, not meaning: Next.js forbids
 * two differently-named dynamic segments at the same level, and
 * [country]/[state]/[city]/[category] already claims this one. The segment
 * value here is a "{category}-in-{location}" string or a page slug, never a
 * country. Two-letter segments never reach this page — next.config.mjs
 * redirects /:country([a-z]{2}) to the homepage, so a two-letter page slug
 * would be unreachable.
 */

// Splits on the LAST "-in-" so category slugs containing "in" survive intact
// (e.g. "indian-restaurants-in-fl" → "indian-restaurants" + "fl").
const CATEGORY_IN_LOCATION_RE = /^(.+)-in-([a-z0-9][a-z0-9-]*)$/;

function titleCase(str) {
  return (str || '').split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

/**
 * Work out what the segment refers to, as `{ kind: 'category' | 'page', … }`.
 *
 * A category-in-location URL is resolved first. State slugs are the two-letter
 * codes ("fl"), so a state lookup is tried before falling back to a city slug.
 * Failing that, the segment is looked up as a published content page slug.
 *
 * Returns null when it is neither, so unrelated one-segment paths keep 404ing
 * instead of rendering an empty listing.
 */
const resolveSegment = cache(async function resolveSegment(segment) {
  if (!segment) return null;

  const match = CATEGORY_IN_LOCATION_RE.exec(segment);
  if (match) {
    const [, categorySlug, locationSlug] = match;
    const category = await getCategoryBySlug(categorySlug).catch(() => null);

    if (category) {
      // Try `code` first, then `slug`: State.code is blank for most rows and
      // the two-letter abbreviation lives in the slug instead.
      const state =
        (await getStateByCode(locationSlug).catch(() => null)) ||
        (await getStateBySlug(locationSlug).catch(() => null));
      if (state) {
        return { kind: 'category', categorySlug, category, scope: 'state', state, locationName: state.name };
      }

      const city = await getCityBySlug(locationSlug).catch(() => null);
      if (city) {
        return { kind: 'category', categorySlug, category, scope: 'city', city, locationName: city.name };
      }
    }
  }

  // Not a category landing page — an admin-managed content page, or nothing.
  // The API 404s for a missing or unpublished page, which lands here as null.
  const page = await getPageContent(segment).catch(() => null);
  if (page) return { kind: 'page', page };

  return null;
});

export async function generateMetadata(props) {
  const params = await props.params;
  const segment = params.country;
  const resolved = await resolveSegment(segment);

  // Bail out here rather than in the component below. By the time the page body
  // runs, the response status has already been committed as 200, so a
  // notFound() there yields a soft 404 — 404 content served under a 200, which
  // search engines will happily index.
  if (!resolved) notFound();

  if (resolved.kind === 'page') {
    const { page } = resolved;
    return {
      title: page.meta_title || `${page.hero_heading || page.title} | DoersMarketing`,
      description: page.meta_description,
      alternates: {
        canonical: `https://www.nearmee.net/${page.slug}`,
      },
      robots: { index: true, follow: true },
    };
  }

  const categoryName = resolved.category?.name || titleCase(resolved.categorySlug);
  const where =
    resolved.scope === 'city' && resolved.city?.state?.code
      ? `${resolved.locationName}, ${resolved.city.state.code}`
      : resolved.locationName;

  return {
    title: `${categoryName} in ${where} | DoersMarketing`,
    description: `Find the best ${categoryName.toLowerCase()} in ${where} on DoersMarketing. Read reviews, view menus, opening hours and more.`,
    alternates: {
      canonical: `https://www.nearmee.net/${segment}/`,
    },
    robots: { index: true, follow: true },
  };
}

export default async function TopLevelSegmentPage(props) {
  const params = await props.params;
  const segment = params.country;

  const resolved = await resolveSegment(segment);
  if (!resolved) notFound();

  if (resolved.kind === 'page') {
    return (
      <>
        <Header />
        <ContentPage page={resolved.page} />
        <Footer />
      </>
    );
  }

  const { categorySlug, category, scope } = resolved;

  // state_slug/city_slug accept either a slug or a short code — see
  // CategoryViewSet.businesses on the backend.
  const locationFilter =
    scope === 'state'
      ? { state_slug: resolved.state.code || resolved.state.slug }
      : { city_slug: resolved.city.slug };

  const bizData = await getBusinessesByCategorySlug(categorySlug, {
    page: 1,
    ...locationFilter,
  }).catch(() => ({ results: [], count: 0, total_pages: 1 }));

  return (
    <>
      <CategoryPageClient
        slug={categorySlug}
        state={scope === 'state' ? resolved.state.slug : resolved.city?.state?.slug}
        city={scope === 'city' ? resolved.city.slug : undefined}
        initialCategoryInfo={category}
        initialBusinesses={bizData.results || []}
        initialTotalPages={bizData.total_pages || 1}
      />
      <Footer />
    </>
  );
}
