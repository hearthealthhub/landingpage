// assets/js/tracking.js — lightweight GTM/GA4 event helpers and attribution capture

(function () {
  const ATTR_KEY = 'hh_attribution';

  function getParams() {
    const url = new URL(window.location.href);
    const params = url.searchParams;
    return {
      utm_source: params.get('utm_source') || '',
      utm_medium: params.get('utm_medium') || '',
      utm_campaign: params.get('utm_campaign') || '',
      utm_content: params.get('utm_content') || '',
      utm_term: params.get('utm_term') || '',
      gclid: params.get('gclid') || '',
      landing_page: window.location.pathname,
      referrer: document.referrer || ''
    };
  }

  function loadAttribution() {
    try {
      return JSON.parse(localStorage.getItem(ATTR_KEY) || '{}');
    } catch {
      return {};
    }
  }

  function saveAttribution(data) {
    try {
      localStorage.setItem(ATTR_KEY, JSON.stringify(data));
    } catch {}
  }

  function mergeAttribution() {
    const current = loadAttribution();
    const latest = getParams();
    const merged = { ...current };

    Object.entries(latest).forEach(([key, value]) => {
      if (value && !merged[key]) merged[key] = value;
    });

    if (!merged.landing_page) merged.landing_page = window.location.pathname;
    if (!merged.referrer) merged.referrer = document.referrer || '';

    saveAttribution(merged);
    return merged;
  }

  function pushEvent(eventName, params) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: eventName,
      ...params
    });
  }

  window.HHTracking = {
    getAttribution: loadAttribution,
    initAttribution: mergeAttribution,
    pushEvent
  };

  document.addEventListener('DOMContentLoaded', function () {
    const attribution = mergeAttribution();

    const resultPage = document.body.dataset.resultType;
    if (resultPage) {
      pushEvent('view_result', {
        result_type: resultPage,
        ...attribution
      });
      return;
    }

    if (window.location.pathname === '/' || window.location.pathname.endsWith('/index.html')) {
      pushEvent('view_landing_page', attribution);
    }
  });
})();
