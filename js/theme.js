(() => {
    const root = document.documentElement;
    const selector = document.getElementById('theme-select');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
    const storageKey = 'lagrange-theme';

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
        document.querySelector('meta[name="theme-color"]').setAttribute('content', dark ? '#0b1320' : '#f5f7fb');
        if (typeof window.updateChartTheme === 'function') {
            window.updateChartTheme();
        }
    }

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
