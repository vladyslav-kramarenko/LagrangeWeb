(() => {
    const canvas = document.getElementById('chart');
    const error = document.getElementById('result-error');
    const content = document.getElementById('result-content');
    const status = document.getElementById('share-status');
    const raw = new URLSearchParams(window.location.search).get('p');

    function t(key) {
        return window.lagrangeI18n ? window.lagrangeI18n.t(key) : key;
    }
    function parsePoints(encoded) {
        if (!encoded || encoded.length > 4500) return null;
        try {
            const values = JSON.parse(encoded);
            if (!Array.isArray(values) || values.length < 2 || values.length > 24) return null;
            const points = values.map(pair => {
                if (!Array.isArray(pair) || pair.length !== 2 || !pair.every(v => typeof v === 'number' && Number.isFinite(v) && Math.abs(v) <= 1e9)) {
                    throw new Error('Invalid coordinates');
                }
                return {x: pair[0], y: pair[1]};
            });
            if (new Set(points.map(point => point.x)).size !== points.length) return null;
            return points;
        } catch (_) {
            return null;
        }
    }

    const points = parsePoints(raw);
    if (!points) {
        error.textContent = t('resultInvalid');
        error.hidden = false;
        window.addEventListener('languagechange', () => { error.textContent = t('resultInvalid'); });
        return;
    }

    const coefficients = simplifyPolynomialFunc(points.map(p => p.x), points.map(p => p.y));
    if (!coefficients || !coefficients.every(Number.isFinite)) {
        error.textContent = t('calculationError');
        error.hidden = false;
        return;
    }

    if (!polynomialAccurateAtPoints(coefficients, points.map(p => p.x), points.map(p => p.y))) {
        error.textContent = t('numericalInstability');
        error.hidden = false;
        window.addEventListener('languagechange', () => { error.textContent = t('numericalInstability'); });
        return;
    }
    const polynomialHtml = convertPolynomialToString(coefficients);
    document.getElementById('result-formula').innerHTML = polynomialHtml;
    document.getElementById('point-summary').textContent = t('resultPoints') + ': ' + points.length;
    content.hidden = false;

    var ctx = canvas.getContext('2d');
    var chart = null;
    // drawChart uses the shared global canvas, ctx and chart variables.
    window.ctx = ctx;
    window.chart = chart;
    drawChart(coefficients, Math.min(...points.map(p => p.x)), Math.max(...points.map(p => p.x)), points.map(p => p.x), points.map(p => p.y));
    window.addEventListener('languagechange', () => {
        document.getElementById('point-summary').textContent = t('resultPoints') + ': ' + points.length;
    });

    function plainFormula() {
        const superscripts = {'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹'};
        return polynomialHtml.replace(/<sup>(\d+)<\/sup>/g, (_, exp) => [...exp].map(d => superscripts[d]).join('')).replace(/<[^>]+>/g,'');
    }

    function wrapText(context, value, maxWidth) {
        const lines = [];
        let line = '';
        for (const word of value.split(/\s+/)) {
            const candidate = line ? line + ' ' + word : word;
            if (line && context.measureText(candidate).width > maxWidth) {
                lines.push(line);
                line = word;
            } else line = candidate;
        }
        if (line) lines.push(line);
        return lines;
    }

    function exportCanvas() {
        const graphCanvas = document.createElement('canvas');
        graphCanvas.width = 1440;
        graphCanvas.height = 660;
        const source = window.chart;
        const renderChart = new Chart(graphCanvas.getContext('2d'), {
            type: 'scatter',
            data: { datasets: source.data.datasets.map((dataset, i) => ({
                label: i === 0 ? t('chartPolynomial') : t('chartPoints'),
                data: dataset.data,
                borderColor: i === 0 ? '#4f46e5' : '#e86c1a',
                backgroundColor: 'transparent',
                showLine: i === 0,
                borderWidth: i === 0 ? 4 : 2,
                pointRadius: i === 0 ? 0 : 9,
                fill: false
            })) },
            options: {
                responsive: false,
                maintainAspectRatio: false,
                animation: false,
                plugins: { legend: { labels: { color: '#334155', font: {size: 24}, padding: 24 } } },
                scales: {
                    x: { type: 'linear', min: source.options.scales.x.min, max: source.options.scales.x.max,
                        ticks: {color:'#475569',font:{size:22}}, grid:{color:'#e2e8f0'}, border:{color:'#cbd5e1'} },
                    y: { ticks: {color:'#475569',font:{size:22}}, grid:{color:'#e2e8f0'}, border:{color:'#cbd5e1'} }
                }
            }
        });
        renderChart.update('none');

        const picture = document.createElement('canvas');
        picture.width = 1600;
        const probe = picture.getContext('2d');
        probe.font = 'bold 37px "Segoe UI", Arial, sans-serif';
        const lines = wrapText(probe, 'f(x) = ' + plainFormula(), 1430);
        const formulaHeight = Math.max(70, lines.length * 52);
        picture.height = 320 + formulaHeight + 760;
        const context = picture.getContext('2d');
        context.fillStyle = '#ffffff';
        context.fillRect(0,0,picture.width,picture.height);
        context.fillStyle = '#111b2d';
        context.font = 'bold 51px "Segoe UI", Arial, sans-serif';
        context.fillText(t('resultHeading'), 80, 106);
        context.fillStyle = '#5b6281';
        context.font = 'bold 23px "Segoe UI", Arial, sans-serif';
        context.fillText(t('polynomial'), 80, 176);
        context.fillStyle = '#28345b';
        context.font = 'bold 37px "Segoe UI", Arial, sans-serif';
        lines.forEach((line, i) => context.fillText(line, 80, 228 + i * 52));
        const plotY = 252 + formulaHeight;
        context.fillStyle = '#f8faff';
        context.fillRect(64, plotY - 8, 1472, 686);
        context.drawImage(graphCanvas, 80, plotY, 1440, 660);
        context.fillStyle = '#64748b';
        context.font = '24px "Segoe UI", Arial, sans-serif';
        context.fillText('lagrange.kramarenko.info', 80, picture.height - 58);
        renderChart.destroy();
        return picture;
    }

    document.getElementById('download-png').addEventListener('click', () => {
        const image = exportCanvas();
        image.toBlob(blob => {
            if (!blob) { status.textContent = 'PNG export failed'; return; }
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'lagrange-interpolation.png';
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 2000);
        }, 'image/png');
    });

    async function copyLink() {
        try {
            if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error('Clipboard unavailable');
            await navigator.clipboard.writeText(window.location.href);
            status.textContent = t('linkCopied');
        } catch (_) {
            window.prompt(t('copyLink'), window.location.href);
        }
    }

    document.getElementById('copy-link').addEventListener('click', copyLink);
    document.getElementById('share-link').addEventListener('click', async () => {
        if (!navigator.share) { await copyLink(); return; }
        try {
            await navigator.share({ title: t('resultHeading'), url: window.location.href });
        } catch (err) {
            if (err && err.name !== 'AbortError') await copyLink();
        }
    });
})();
