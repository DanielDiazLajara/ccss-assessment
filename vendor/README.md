# Third-party components

These files are vendored so the tool works offline and makes no requests to third parties.
They are copies of the official distributions as served by jsDelivr, cdnjs and the SheetJS CDN.

| File | Project | Version | License |
|------|---------|---------|---------|
| `chart.umd.min.js` | [Chart.js](https://www.chartjs.org/) | 4.4.0 | MIT — [licenses/chart.js-LICENSE.md](licenses/chart.js-LICENSE.md) |
| `jspdf.umd.min.js` | [jsPDF](https://github.com/parallax/jsPDF) | 4.2.1 | MIT — [licenses/jspdf-LICENSE](licenses/jspdf-LICENSE) |
| `jspdf.plugin.autotable.min.js` | [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable) | 5.0.9 | MIT — [licenses/jspdf-autotable-LICENSE.txt](licenses/jspdf-autotable-LICENSE.txt) |
| `xlsx.full.min.js` | [SheetJS Community Edition](https://sheetjs.com/) | 0.20.3 | Apache-2.0 — [licenses/xlsx-LICENSE](licenses/xlsx-LICENSE) |
| `fonts/inter-*.woff2` | [Inter](https://rsms.me/inter/) (variable, via `@fontsource-variable/inter`) | 5.0.8 | SIL OFL 1.1 — [licenses/inter-LICENSE.txt](licenses/inter-LICENSE.txt) |

## Updating

Download the new release from the project's official distribution, replace the file, update the
version in this table and in the license file if it changed, and run through the assessment,
report and every export (PDF, Excel, CSV, JSON) before committing.
