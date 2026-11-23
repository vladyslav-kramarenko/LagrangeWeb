# Simplify Polynomial Interpolation

This is a JavaScript web application for performing polynomial interpolation using the Lagrange method. Given a set of initial data points, this application calculates and displays the simplified polynomial interpolation function, along with an interactive chart to visualize the interpolation.

**Visit the project:** [Lagrange Polynomial Interpolation](https://lagrange.kramarenko.info/)


This is a JavaScript web application for performing polynomial interpolation using the Lagrange method. 
Given a set of initial data points, this application calculates and displays the simplified polynomial interpolation function, along with an interactive chart to visualize the interpolation.

## Getting Started
To use this application, simply open the index.html file in your web browser. You can also host it on a web server for online access.

### Prerequisites
No special prerequisites are required to run this application. It should work in most modern web browsers.

## Usage
Open the index.html file in your web browser.
Enter your initial data points in the table provided. Each row should contain an X and Y value.
Click the "+" button to add more data points or the "-" button to remove a data point.
Once you have entered your data, click the "Calculate" button to perform the polynomial interpolation.
The simplified polynomial interpolation function will be displayed below the chart.
## Features
Polynomial interpolation using the Lagrange method.
Dynamic addition and removal of data points.
Visualization of the interpolation function using an interactive chart.
Detection of duplicate X-values in the input data.
## Files
index.html: The main HTML file containing the user interface and form for entering data.
css/style.css: CSS file for styling the application.
css/bootstrap.min.css: CSS file for Bootstrap framework (used for styling).
lagrange.js: JavaScript file containing the Lagrange polynomial interpolation logic.
main.js: JavaScript file for handling user interactions and displaying results.
chart.js: JavaScript file for creating and updating the interactive chart.
js/chart.js: External library (Chart.js) for chart visualization.
## Contributing
This is an open-source project, and contributions are welcome. If you'd like to contribute or report issues, please visit the GitHub repository.

## License
This project is licensed under the MIT License - see the LICENSE.md file for details.

## Acknowledgments
This project uses the Chart.js library for chart visualization.
Special thanks to anyone who contributed to this project.

## Cloudflare development deployment

The `dev` branch deploys to the `lagrangeweb-dev` Cloudflare Worker after a Git push.
Development URL: https://lagrangeweb-dev.kramarenko-vladyslav-92.workers.dev/

This is a static HTML/CSS/JavaScript application; there is no build step.
The Worker configuration for development is in `wrangler.jsonc` on this branch.
The `master` branch and the existing production domain are not changed by this dev setup.

## Pages and SEO

- `/`: interpolation calculator, chart, and concise explanation.
- `/guide/`: worked example, formula, usage steps, and FAQ.
- Each page declares its own canonical URL on `lagrange.kramarenko.info`.
- `sitemap.xml` lists both production URLs; `robots.txt` links to it.
- `_headers` sends `X-Robots-Tag: noindex` for preview hosts, not the canonical production host.
- `js/analytics.js` sends GA4 page views only from `lagrange.kramarenko.info`; calculator events contain only the number of points, never their values.

Do not switch the public domain until the deployed production HTML and response headers have been verified. The dev branch uses its own Worker and must not replace the production domain directly.

## Localization and sharing (DEV)

The site supports English, Russian, French, Ukrainian, and German on the calculator, guide, and shareable result page. The first supported entry in `navigator.languages` is selected for new visitors, otherwise English. A manually chosen language is stored locally and takes precedence on later visits.

After calculating up to 24 distinct points, the calculator offers `Open graph & formula`. This opens `/result/?p=...`, where anyone with the link can reconstruct the numeric points and polynomial. This client-side result page has `noindex` and is not in the sitemap. The result page includes high-resolution PNG export, link copying, and native sharing.

The printable PDF workflow remains available on the calculator. Point coordinates stay in the local browser except when a visitor chooses to share the result URL. The GA4 implementation strips URL query parameters to avoid recording shared coordinates.

On narrow screens, the guide and result page put navigation on its own row above language and theme selectors.
