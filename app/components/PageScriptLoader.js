'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { getPageScripts } from '../lib/api';

/**
 * Return the markup to inject for a script record.
 *
 * A record saved with script_type "javascript" often holds bare JS with no
 * surrounding tags — that is what the admin field invites you to paste. Parsed
 * as-is it would become a text node that never executes, so wrap it the same
 * way core/context_processors.py does.
 */
function scriptMarkup(script) {
  const content = (script.script_content || '').trim();
  if (!content) return '';

  if (script.script_type === 'javascript' && !content.toLowerCase().startsWith('<script')) {
    return `<script>\n${content}\n</script>`;
  }
  return content;
}

export default function PageScriptLoader({ initialPathname, initialScriptIds } = {}) {
  const pathname = usePathname();

  useEffect(() => {
    // Guards against injecting after this effect has been cleaned up. The fetch
    // is async, so a fast navigation can resolve it once cleanup has already
    // run — anything appended at that point would never be removed.
    let cancelled = false;
    const injectedElements = [];

    const injectScript = (script) => {
      // One marker per record, so a record whose markup expands to several
      // nodes is still recognised as already present.
      if (document.querySelector(`[data-page-script-id="${script.id}"]`)) return;

      const markup = scriptMarkup(script);
      if (!markup) return;

      // <template> parses head-level tags such as <meta> and <link> correctly,
      // and leaves any <script> inside inert until it is recreated below.
      const template = document.createElement('template');
      template.innerHTML = markup;

      Array.from(template.content.childNodes).forEach((node, index) => {
        // Text and comment nodes have nothing to execute and cannot carry the
        // attributes below — calling setAttribute on one throws.
        if (node.nodeType !== Node.ELEMENT_NODE) return;

        let el = node;
        if (node.nodeName === 'SCRIPT') {
          // A <script> parsed from markup never runs; only a freshly created
          // element does.
          el = document.createElement('script');
          el.text = node.textContent;
          Array.from(node.attributes).forEach((attr) => {
            el.setAttribute(attr.name, attr.value);
          });
        }

        el.setAttribute('id', `page-script-${script.id}-${index}`);
        el.setAttribute('data-page-script-id', String(script.id));
        el.setAttribute('data-injected-script', 'true');

        if (script.placement === 'head') {
          document.head.appendChild(el);
        } else if (script.placement === 'body_start') {
          document.body.insertBefore(el, document.body.firstChild);
        } else {
          document.body.appendChild(el);
        }
        injectedElements.push(el);
      });
    };

    const fetchAndInject = async () => {
      let scripts;
      try {
        // The hostname distinguishes a business subdomain from the homepage —
        // both have a path of "/".
        scripts = await getPageScripts(pathname, window.location.hostname);
      } catch (err) {
        console.error('Failed to load page scripts:', err);
        return;
      }

      if (cancelled || !Array.isArray(scripts)) return;

      // The scripts matching initialPathname were already server-rendered
      // (see app/layout.js) so they show up in View Page Source. Re-running
      // this same fetch on mount would otherwise inject — and re-execute —
      // duplicates of them on every hard/first load.
      const alreadyRendered =
        pathname === initialPathname && Array.isArray(initialScriptIds)
          ? new Set(initialScriptIds)
          : null;

      scripts.forEach((script) => {
        if (alreadyRendered?.has(script.id)) return;
        // One bad record must not stop the rest from loading.
        try {
          injectScript(script);
        } catch (err) {
          console.error(`Failed to inject page script ${script?.id}:`, err);
        }
      });
    };

    fetchAndInject();

    return () => {
      cancelled = true;
      // Cleanup previous page's scripts
      injectedElements.forEach((el) => {
        if (el && el.parentNode) {
          el.parentNode.removeChild(el);
        }
      });
    };
  }, [pathname]);

  return null;
}
