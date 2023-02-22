function drawChart(coefficients, minX, maxX, pointsXValues, pointsYValues) {

    const xValues = [];
    const yValues = [];
    let stepSize = 1;
    while ((maxX - minX) / stepSize > 50) {
        stepSize *= 10;
    }

    const lagrangeFunction = {
        label: 'Polynomial Function',
        data: [],
        borderColor: 'blue',
        borderWidth: 1,
        pointRadius: 0.5
    }

    console.log(pointsXValues)
    console.log(pointsYValues)
    const userPointsMap = pointsXValues.reduce((map, x, i) => {
        map[x] = pointsYValues[i];
        return map;
    }, {});

    const userPoints = {
        label: 'Points',
        data: userPointsMap,
        borderColor: 'red',
        borderWidth: 1,
        pointRadius: 5,
        fill: false
    }

    for (let x = -minX; x <= maxX; x += stepSize / 100) {
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
        scales: {
            x: {
                type: 'linear',
                position: 'bottom',
                ticks: {
                    stepSize: stepSize,
                    min: minX,
                    max: maxX,
                }
            }
        }
    };

    chart = new Chart(ctx, {
        type: 'scatter',
        data: data,
        options: options
    });
}