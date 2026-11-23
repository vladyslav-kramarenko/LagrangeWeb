function getChartTheme() {
    const style = getComputedStyle(document.documentElement);
    return {
        text: style.getPropertyValue('--chart-text').trim() || '#6a778b',
        grid: style.getPropertyValue('--chart-grid').trim() || 'rgba(105, 119, 140, .22)',
        curve: style.getPropertyValue('--chart-curve').trim() || '#4f46e5',
        points: style.getPropertyValue('--chart-points').trim() || '#f97316'
    };
}

function updateChartTheme() {
    const colors = getChartTheme();
    Chart.defaults.color = colors.text;
    Chart.defaults.borderColor = colors.grid;
    if (typeof chart === 'undefined' || !chart) return;
    if (chart.data.datasets && chart.data.datasets.length >= 2) {
        chart.data.datasets[0].borderColor = colors.curve;
        chart.data.datasets[1].borderColor = colors.points;
    }
    chart.options.plugins = chart.options.plugins || {};
    chart.options.plugins.legend = chart.options.plugins.legend || {};
    chart.options.plugins.legend.labels = chart.options.plugins.legend.labels || {};
    chart.options.plugins.legend.labels.color = colors.text;
    for (const axis of ['x', 'y']) {
        if (!chart.options.scales || !chart.options.scales[axis]) continue;
        chart.options.scales[axis].ticks = chart.options.scales[axis].ticks || {};
        chart.options.scales[axis].ticks.color = colors.text;
        chart.options.scales[axis].grid = chart.options.scales[axis].grid || {};
        chart.options.scales[axis].grid.color = colors.grid;
        chart.options.scales[axis].border = chart.options.scales[axis].border || {};
        chart.options.scales[axis].border.color = colors.grid;
    }
    chart.update('none');
}

window.updateChartTheme = updateChartTheme;

function drawChart(coefficients, minX, maxX, pointsXValues, pointsYValues) {
    const theme = getChartTheme();

    const xValues = [];
    const yValues = [];
    let stepSize = 1;
    while ((maxX - minX) / stepSize > 50) {
        stepSize *= 10;
    }

    const lagrangeFunction = {
        label: window.lagrangeI18n ? window.lagrangeI18n.t('chartPolynomial') : 'Polynomial Function',
        data: [],
        borderColor: theme.curve,
        borderWidth: 2,
        pointRadius: 0.5
    }

    console.log(pointsXValues)
    console.log(pointsYValues)
    const userPointsMap = pointsXValues.reduce((map, x, i) => {
        map[x] = pointsYValues[i];
        return map;
    }, {});

    const userPoints = {
        label: window.lagrangeI18n ? window.lagrangeI18n.t('chartPoints') : 'Points',
        data: pointsXValues.map((x, i) => ({ x, y: pointsYValues[i] })),
        borderColor: theme.points,
        borderWidth: 1,
        pointRadius: 5,
        fill: false
    }

    const span = maxX - minX;
    const margin = Math.max(span * 0.08, 0.2);
    const from = minX - margin;
    const to = maxX + margin;
    const samples = 250;
    for (let index = 0; index <= samples; index++) {
        const x = from + (to - from) * index / samples;
        let y = 0;
        for (let i = 0; i < coefficients.length; i++) {
            y += coefficients[i] * Math.pow(x, i);
        }
        lagrangeFunction.data.push({x: x, y: y});
    }


    // for (let i = 0; i < pointsXValues.length; i++) {
    //     userPoints.data.push({x: pointsXValues[i], y: pointsYValues[i]});
    // }

    if (chart) {
        chart.destroy();
    }

    const data = {
        datasets: [lagrangeFunction, userPoints]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: theme.text } } },
        scales: {
            x: {
                type: 'linear',
                position: 'bottom',
                min: from,
                max: to,
                ticks: {
                    stepSize: stepSize,
                    color: theme.text,
                },
                grid: { color: theme.grid },
                border: { color: theme.grid }
            },
            y: {
                ticks: { color: theme.text },
                grid: { color: theme.grid },
                border: { color: theme.grid }
            }
        }
    };

    chart = new Chart(ctx, {
        type: 'scatter',
        data: data,
        options: options
    });
}