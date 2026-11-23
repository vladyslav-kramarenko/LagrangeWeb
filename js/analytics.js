// GA4 is enabled only on the public production hostname.
// Preview and development workers deliberately send no analytics hits.
(() => {
    if (window.location.hostname !== 'lagrange.kramarenko.info') return;

    const measurementId = 'G-R991NWN37F';
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    // Never transmit URL query parameters: share links can contain input coordinates.
    window.gtag('config', measurementId, {
        page_location: window.location.origin + window.location.pathname,
        page_path: window.location.pathname
    });

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(measurementId);
    document.head.appendChild(script);
})();
