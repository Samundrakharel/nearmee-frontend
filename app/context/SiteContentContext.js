'use client';

import { createContext, useContext } from 'react';

/**
 * Carries admin-managed site chrome (currently the footer) from the root
 * layout down to wherever it is rendered.
 *
 * The footer is rendered inside client components on several pages
 * (BusinessPageClient, /account, /submit-business), so it cannot be an async
 * server component that fetches its own content. Fetching once in the server
 * layout and handing the result down through context keeps the content in the
 * server-rendered HTML — which matters, because footer links are internal
 * links crawlers follow — while still working under a client parent.
 */
const SiteContentContext = createContext({ footer: null });

export function SiteContentProvider({ footer, children }) {
  return (
    <SiteContentContext.Provider value={{ footer }}>
      {children}
    </SiteContentContext.Provider>
  );
}

export function useSiteContent() {
  return useContext(SiteContentContext);
}
