function simplifyPolynomialFunc(arrX, arrY) {
    let sum = [];
    let up = [];
    let previous = [];
    let polynomial;
    let tmp = [];
    let tmp2 = [];

    for (let i = 0; i < arrX.length; i++) {
        let denominator = 1;
        let ply;
        for (let j = 0; j < arrX.length; j++) {
            ply = true;
            if (i !== j) {
                if (j === 0) {
                    ply = false;
                }
                if (i === 0 && j === 1) {
                    ply = false;
                }
                if (ply) {
                    previous = [...up];
                }

                up = [-arrX[j], 1];

                if (ply) {
                    up = polPly(up, previous);
                }

                denominator *= (arrX[i] - arrX[j]);
                if (denominator === 0) {
                    console.log("Division by zero! Error!");
                }
            }
        }

        polynomial = polynomialPlyNumerator(up, 1 / denominator);
        polynomial = polynomialPlyNumerator(polynomial, arrY[i]);

        tmp2 = [...polynomial];

        if (i === 0) {
            sum = [...tmp2];
        } else {
            tmp = [];

            for (let i1 = 0; i1 < tmp2.length; i1++) {
                tmp.push(tmp2[i1] + sum[i1]);
            }

            sum = [...tmp];
        }
    }
    return sum;
}

function polPly(x, y) {
    let result = [];
    for (let i = 0; i < x.length; i++) {
        for (let n = 0; n < y.length; n++) {
            if (result.length > i + n) {
                result[i + n] += x[i] * y[n];
            } else {
                result[i + n] = x[i] * y[n];
            }
        }
    }
    return result;
}

function polynomialPlyNumerator(x, y) {
    let result = [];
    for (let i = 0; i < x.length; i++) {
        let rez = x[i] * y;
        result.push(rez);
    }
    return result;
}

function polynomialAccurateAtPoints(coefficients, xValues, yValues) {
    if (!coefficients || coefficients.some(value => !Number.isFinite(value))) return false;
    for (let i = 0; i < xValues.length; i++) {
        let evaluated = 0;
        for (let degree = coefficients.length - 1; degree >= 0; degree--) {
            evaluated = evaluated * xValues[i] + coefficients[degree];
        }
        const tolerance = 1e-6 * Math.max(1, Math.abs(yValues[i]));
        if (!Number.isFinite(evaluated) || Math.abs(evaluated - yValues[i]) > tolerance) {
            return false;
        }
    }
    return true;
}

function convertPolynomialToString(polynomial) {
    const terms = [];
    const epsilon = 1e-9;
    for (let degree = polynomial.length - 1; degree >= 0; degree--) {
        const value = polynomial[degree];
        if (Math.abs(value) <= epsilon) continue;
        const absoluteValue = Math.abs(value).toFixed(3);
        const variable = degree === 0 ? '' : degree === 1 ? 'x' : 'x<sup>' + degree + '</sup>';
        terms.push({ negative: value < 0, text: absoluteValue + variable });
    }
    if (!terms.length) return '0';
    return terms.map((term, index) => {
        const prefix = index === 0
            ? (term.negative ? '-' : '')
            : (term.negative ? ' - ' : ' + ');
        return prefix + term.text;
    }).join('');
}


function test() {
    // let x = [1, 3, 5];
    // let x = [1, 2, 4, 9];
    let x = [1, 2];
    // let x=[1, 3, 4];
    // let x=[1, 3, 5,7];
    // let x = [3, 4, 6, 2];

    // let y = [4, 3, 6];
    // let y=[12, 243, 23];
    // let y = [4, 3, 6, 12];
    let y = [1, 4];

    console.log(convertPolynomialToString(simplifyPolynomialFunc(x, y)));
}
