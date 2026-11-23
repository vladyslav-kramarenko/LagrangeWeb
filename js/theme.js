// Shared theme controller for calculator, guide and result pages.
// Never let chart rendering prevent a user from changing appearance.
(() => {
    const root = document.documentElement;
    const selector = document.getElementById('theme-select');
    if (!selector) return;

    const storageKey = 'lagrange-theme';
    const supported = new Set(['system', 'light', 'dark']);
    const systemTheme = window.matchMedia
        ? window.matchMedia('(prefers-color-scheme: dark)')
        : { matches: false };
    const compactTheme = document.getElementById('theme-current');
    const compactIcon = document.getElementById('theme-current-icon');
    const labels = {
        en: { system: 'Auto', light: 'Light', dark: 'Dark' },
        ru: { system: 'Авто', light: 'Свет', dark: 'Тёмн' },
        fr: { system: 'Auto', light: 'Clair', dark: 'Sombre' },
        uk: { system: 'Авто', light: 'Світла', dark: 'Темна' },
        de: { system: 'Auto', light: 'Hell', dark: 'Dunkel' }
    };

    function savedPreference() {
        try {
            const value = localStorage.getItem(storageKey);
            return supported.has(value) ? value : 'system';
        } catch (_) {
            return 'system';
        }
    }

    function updateCompactLabel(preference) {
        const language = document.documentElement.lang || 'en';
        const dictionary = labels[language] || labels.en;
        if (compactTheme) compactTheme.textContent = dictionary[preference];
        if (compactIcon) {
            compactIcon.textContent = { system: '◐', light: '☀', dark: '☾' }[preference];
        }
        selector.setAttribute('aria-label', 'Appearance: ' + dictionary[preference]);
    }

    function applyTheme(preference, updateChart = true) {
        const next = supported.has(preference) ? preference : 'system';
        const dark = next === 'dark' || (next === 'system' && systemTheme.matches);
        const effective = dark ? 'dark' : 'light';
        root.setAttribute('data-theme', effective);
        root.style.colorScheme = effective;
        selector.value = next;
        updateCompactLabel(next);
        const themeColor = document.querySelector('meta[name="theme-color"]');
        if (themeColor) themeColor.setAttribute('content', dark ? '#0b1320' : '#f5f7fb');
        // Chart updates must never break the selector or the page theme.
        if (updateChart && typeof window.updateChartTheme === 'function') {
            try { window.updateChartTheme(); } catch (error) {
                console.warn('Graph appearance could not be updated', error);
            }
        }
    }

    function onSelection() {
        const preference = supported.has(selector.value) ? selector.value : 'system';
        try { localStorage.setItem(storageKey, preference); } catch (_) {}
        applyTheme(preference);
    }

    // Attach handlers before any graph operation or other initialization.
    selector.addEventListener('input', onSelection);
    selector.addEventListener('change', onSelection);
    window.addEventListener('languagechange', () => updateCompactLabel(selector.value));

    const onSystemChange = () => {
        if (selector.value === 'system') applyTheme('system');
    };
    if (typeof systemTheme.addEventListener === 'function') {
        systemTheme.addEventListener('change', onSystemChange);
    } else if (typeof systemTheme.addListener === 'function') {
        systemTheme.addListener(onSystemChange);
    }

    applyTheme(savedPreference(), false);
    // Synchronize an already drawn graph when the browser finishes the first frame.
    if (typeof window.requestAnimationFrame === 'function') {
        window.requestAnimationFrame(() => {
            if (typeof window.updateChartTheme === 'function') {
                try { window.updateChartTheme(); } catch (_) {}
            }
        });
    }
})();
