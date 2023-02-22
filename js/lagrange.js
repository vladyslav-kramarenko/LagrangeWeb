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

function convertPolynomialToString(polynomial) {
    let out = "";
    let e = 0.000000001;
    for (let i = 0; i < polynomial.length; i++) {
        if (Math.abs(polynomial[i]) > e) {
            if (i === 0) {
                out = "" + Math.abs(polynomial[i]).toFixed(3);
            } else if (i === 1) {
                out = Math.abs(polynomial[i]).toFixed(3) + "x" + out;
            } else {
                out = Math.abs(polynomial[i]).toFixed(3) + "x<sup>" + i + "</sup>" + out;
            }

            if (polynomial[i] >= 0) {
                if (i !== polynomial.length - 1) {
                    out = " + " + out;
                }
            } else {
                out = " - " + out;
            }
        }
    }
    return out;
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

test();