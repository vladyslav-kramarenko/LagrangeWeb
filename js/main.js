const canvas = document.getElementById('chart');
var ctx = canvas.getContext('2d');
var chart = new Chart(ctx, {
    type: 'scatter',
    data: {0: 0}
});

function initTableButtons() {
    document.getElementById('add-row-btn').addEventListener('click', function () {
        const tbody = document.querySelector('table tbody');
        const tr = document.createElement('tr');
        tr.innerHTML = `<td><input type="text" name="x[]" class="form-control"></td><td><input type="text" name="y[]" class="form-control"></td>`;
        tbody.appendChild(tr);
    });

    document.getElementById('remove-row-btn').addEventListener('click', function () {
        const tbody = document.querySelector('table tbody');
        if (tbody.children.length > 2) {
            tbody.removeChild(tbody.lastChild);
        }
    });
}

initTableButtons();

function simplifyPolynomial() {
    const table = document.getElementById("inputTable");

    const xValues = [];
    const yValues = [];
    let duplicateFound = false;
    for (let i = 1; i < table.rows.length; i++) {
        const row = table.rows[i];

        const xVal = row.cells[0].getElementsByTagName("input")[0].value;
        console.log("x[" + i + "]" + "=" + xVal);
        const yVal = row.cells[1].getElementsByTagName("input")[0].value;
        console.log("y[" + i + "]" + "=" + yVal);

        console.log(xValues);
        console.log("index of " + xVal + " is " + xValues.indexOf(xVal));
        if (xVal && yVal) {
        }
        if (xValues.includes(parseFloat(xVal))) {
            duplicateFound = true;
            row.classList.add("duplicate");
            alert("Error: Duplicate x-value in the table");
            return;
        } else {
            xValues.push(parseFloat(xVal));
            yValues.push(parseFloat(yVal));
            row.classList.remove("duplicate");
        }
    }

// Call the simplifyPolynomial function
    const coefficients = simplifyPolynomialFunc(xValues, yValues);

    const simlifiedPolynomial = convertPolynomialToString(coefficients);
// Display the result in the output element
    const output = document.getElementById("output");
    output.innerHTML = simlifiedPolynomial;

    let minX = Math.min(...xValues);
    let maxX = Math.max(...xValues);
    drawChart(coefficients, minX, maxX, xValues, yValues);
}



