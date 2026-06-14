'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { getPageScripts } from '../lib/api';

export default function PageScriptLoader() {
  const pathname = usePathname();

  useEffect(() => {
    let injectedElements = [];

    const fetchAndInject = async () => {
      try {
        const scripts = await getPageScripts(pathname);

        scripts.forEach((script) => {
          const elementId = `page-script-${script.id}`;
          if (document.getElementById(elementId)) return;

          // Create temporary container to parse nodes
          const container = document.createElement('div');
          container.innerHTML = script.script_content;

          Array.from(container.childNodes).forEach((node) => {
            if (node.nodeType === Node.TEXT_NODE && !node.textContent.trim()) return;

            let el = node;
            // Executing scripts requires re-creating them
            if (node.nodeName === 'SCRIPT') {
              const scriptEl = document.createElement('script');
              scriptEl.text = node.textContent;
              Array.from(node.attributes).forEach((attr) => {
                scriptEl.setAttribute(attr.name, attr.value);
              });
              el = scriptEl;
            }

            el.setAttribute('id', elementId);
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
        });
      } catch (err) {
        console.error('Failed to load page scripts:', err);
      }
    };

    fetchAndInject();

    return () => {
      // Cleanup previous page's scripts
      injectedElements.forEach((el) => {
        if (el.parentNode) {
          el.parentNode.removeChild(el);
        }
      });
    };
  }, [pathname]);

  return null;
}
