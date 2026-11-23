(() => {
    const root = document.documentElement;
    const selector = document.getElementById('theme-select');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
    const storageKey = 'lagrange-theme';
    const compactTheme = document.getElementById('theme-current');
    const compactIcon = document.getElementById('theme-current-icon');
    const compactLabels = {
        en: { system: 'Auto', light: 'Light', dark: 'Dark' },
        ru: { system: 'Авто', light: 'Свет', dark: 'Тёмн' },
        fr: { system: 'Auto', light: 'Clair', dark: 'Sombre' },
        uk: { system: 'Авто', light: 'Світла', dark: 'Темна' },
        de: { system: 'Auto', light: 'Hell', dark: 'Dunkel' }
    };
    function updateCompactLabel(preference) {
        const language = document.documentElement.lang || 'en';
        const translations = compactLabels[language] || compactLabels.en;
        if (compactTheme) compactTheme.textContent = translations[preference] || translations.system;
        if (compactIcon) compactIcon.textContent = {system: '◐', light: '☀', dark: '☾'}[preference] || '◐';
    }

    function savedPreference() {
        try {
            const stored = localStorage.getItem(storageKey);
            return ['system', 'light', 'dark'].includes(stored) ? stored : 'system';
        } catch (_) {
            return 'system';
        }
    }

    function applyTheme(preference) {
        const dark = preference === 'dark' || (preference === 'system' && systemTheme.matches);
        root.dataset.theme = dark ? 'dark' : 'light';
        updateCompactLabel(preference);
        document.querySelector('meta[name="theme-color"]').setAttribute('content', dark ? '#0b1320' : '#f5f7fb');
        if (typeof window.updateChartTheme === 'function') {
            window.updateChartTheme();
        }
    }

    window.addEventListener('languagechange', () => updateCompactLabel(selector.value));
    selector.value = savedPreference();
    applyTheme(selector.value);
    selector.addEventListener('change', () => {
        const next = selector.value;
        try { localStorage.setItem(storageKey, next); } catch (_) {}
        applyTheme(next);
    });

    const onSystemChange = () => {
        if (selector.value === 'system') applyTheme('system');
    };
    if (typeof systemTheme.addEventListener === 'function') {
        systemTheme.addEventListener('change', onSystemChange);
    } else if (typeof systemTheme.addListener === 'function') {
        systemTheme.addListener(onSystemChange);
    }
})();
