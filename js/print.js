(() => {
    const button = document.getElementById('print-report-btn');
    const report = document.getElementById('print-report');
    if (!button || !report) return;

    function reportText(key, fallback) {
        return window.lagrangeI18n ? window.lagrangeI18n.t(key) : fallback;
    }

    function lightChartImage() {
        if (typeof chart === 'undefined' || !chart || !chart.data.datasets.length) return '';
        const saved = {
            curves: chart.data.datasets.map(dataset => dataset.borderColor),
            legend: chart.options.plugins.legend.labels.color,
            axes: ['x', 'y'].map(axis => ({
                ticks: chart.options.scales[axis].ticks.color,
                grid: chart.options.scales[axis].grid.color,
                border: chart.options.scales[axis].border.color
            }))
        };
        let image = '';
        try {
            chart.data.datasets[0].borderColor = '#4f46e5';
            chart.data.datasets[1].borderColor = '#ea580c';
            chart.options.plugins.legend.labels.color = '#334155';
            for (const axis of ['x', 'y']) {
                chart.options.scales[axis].ticks.color = '#334155';
                chart.options.scales[axis].grid.color = 'rgba(100,116,139,.24)';
                chart.options.scales[axis].border.color = '#cbd5e1';
            }
            chart.update('none');
            image = chart.toBase64Image('image/png', 1);
        } finally {
            chart.data.datasets.forEach((dataset, i) => { dataset.borderColor = saved.curves[i]; });
            chart.options.plugins.legend.labels.color = saved.legend;
            ['x','y'].forEach((axis, i) => {
                chart.options.scales[axis].ticks.color = saved.axes[i].ticks;
                chart.options.scales[axis].grid.color = saved.axes[i].grid;
                chart.options.scales[axis].border.color = saved.axes[i].border;
            });
            chart.update('none');
        }
        return image;
    }

    function populateReport() {
        const result = window.lagrangeLastResult;
        if (!result) return false;

        const tbody = document.getElementById('print-points');
        tbody.replaceChildren();
        result.points.forEach((point, i) => {
            const row = document.createElement('tr');
            for (const value of [i + 1, point.x, point.y]) {
                const cell = document.createElement('td');
                cell.textContent = String(value);
                row.appendChild(cell);
            }
            tbody.appendChild(row);
        });
        document.getElementById('print-formula').innerHTML = 'f(x) = ' + result.polynomialHtml;
        const locale = document.documentElement.lang || 'en';
        document.getElementById('print-date').textContent = new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date());
        document.getElementById('print-explanation').textContent = reportText('reportExplanationBody',
            'Lagrange interpolation constructs the polynomial of degree at most n - 1 through n input points with distinct X coordinates. The curve passes through each listed point.');
        const img = document.getElementById('print-chart');
        img.src = lightChartImage();
        return true;
    }

    async function printReport() {
        if (!populateReport()) return;
        const img = document.getElementById('print-chart');
        if (img.src && typeof img.decode === 'function') {
            try { await img.decode(); } catch (_) {}
        }
        window.print();
    }

    button.addEventListener('click', printReport);
    window.addEventListener('beforeprint', populateReport);
})();
