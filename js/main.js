const canvas = document.getElementById('chart');
var ctx = canvas.getContext('2d');
var chart = new Chart(ctx, { type: 'scatter', data: { datasets: [] } });
window.lagrangeLastResult = null;

function message(key, fallback) {
    return window.lagrangeI18n ? window.lagrangeI18n.t(key) : fallback;
}

function markResultsStale() {
    window.lagrangeLastResult = null;
    document.body.classList.remove('has-results');
    const output = document.getElementById('output');
    if (output) output.textContent = '—';
    const printButton = document.getElementById('print-report-btn');
    if (printButton) printButton.hidden = true;
}

function createSignControls(row) {
    [...row.querySelectorAll('input[name="x[]"], input[name="y[]"]')].forEach((input) => {
        if (input.parentElement.classList.contains('number-field')) return;
        const wrapper = document.createElement('div');
        wrapper.className = 'number-field';
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);
        const toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'sign-toggle';
        toggle.textContent = '±';
        toggle.setAttribute('data-i18n-aria', 'toggleSign');
        toggle.setAttribute('aria-label', message('toggleSign', 'Toggle positive / negative'));
        toggle.addEventListener('click', () => {
            const value = input.value.trim();
            input.value = value.startsWith('-') ? value.slice(1) : '-' + (value.startsWith('+') ? value.slice(1) : value);
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.focus();
        });
        wrapper.appendChild(toggle);
        input.addEventListener('input', () => {
            input.closest('tr').classList.remove('duplicate');
            const error = document.getElementById('input-error');
            if (error) error.textContent = '';
            markResultsStale();
        });
    });
}

function initTableButtons() {
    const tbody = document.querySelector('#inputTable tbody');
    [...tbody.rows].forEach(createSignControls);
    document.getElementById('add-row-btn').addEventListener('click', () => {
        const row = document.createElement('tr');
        const number = tbody.rows.length + 1;
        row.innerHTML = `<td><input type="text" inputmode="decimal" name="x[]" class="form-control" aria-label="X value for point ${number}" required></td><td><input type="text" inputmode="decimal" name="y[]" class="form-control" aria-label="Y value for point ${number}" required></td>`;
        tbody.appendChild(row);
        createSignControls(row);
        markResultsStale();
    });
    document.getElementById('remove-row-btn').addEventListener('click', () => {
        if (tbody.rows.length > 2) {
            tbody.deleteRow(-1);
            markResultsStale();
        }
    });
}

function showInputError(key, fallback, row) {
    const error = document.getElementById('input-error');
    if (error) error.textContent = message(key, fallback);
    if (row) {
        row.classList.add('duplicate');
        row.querySelector('input').focus();
    }
}

function readPoints() {
    const rows = [...document.querySelectorAll('#inputTable tbody tr')];
    const points = [];
    for (const row of rows) {
        row.classList.remove('duplicate');
        const inputs = [...row.querySelectorAll('input')];
        const values = inputs.map(input => {
            const raw = input.value.trim().replace(',', '.');
            return /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(raw) ? Number(raw) : NaN;
        });
        if (!values.every(Number.isFinite)) {
            showInputError('invalidNumber', 'Enter valid X and Y numbers for every point.', row);
            return null;
        }
        if (points.some(point => point.x === values[0])) {
            showInputError('duplicateX', 'Each point must have a different X value.', row);
            return null;
        }
        points.push({ x: values[0], y: values[1] });
    }
    return points;
}

function simplifyPolynomial() {
    const error = document.getElementById('input-error');
    if (error) error.textContent = '';
    const points = readPoints();
    if (!points) return;
    const xValues = points.map(point => point.x);
    const yValues = points.map(point => point.y);
    const coefficients = simplifyPolynomialFunc(xValues, yValues);
    if (!coefficients || !coefficients.every(Number.isFinite)) {
        showInputError('calculationError', 'Could not calculate this polynomial. Check your input points.');
        return;
    }
    const polynomialHtml = convertPolynomialToString(coefficients);
    document.getElementById('output').innerHTML = polynomialHtml;
    drawChart(coefficients, Math.min(...xValues), Math.max(...xValues), xValues, yValues);
    window.lagrangeLastResult = { points, coefficients: [...coefficients], polynomialHtml };
    document.body.classList.add('has-results');
    const printButton = document.getElementById('print-report-btn');
    if (printButton) printButton.hidden = false;
    if (typeof window.gtag === 'function') {
        window.gtag('event', 'lagrange_calculated', { point_count: points.length });
    }
}

initTableButtons();
