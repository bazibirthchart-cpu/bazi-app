import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync('C:/Users/beata/Documents/bazi app/bazi-app-en/index.html', 'utf8');

assert.ok(!html.includes('id="savePdfBtn"'), 'English site should not render the Save Full PDF button.');
assert.ok(!html.includes('Save Full PDF'), 'English site should not display Save Full PDF copy.');
assert.ok(!html.includes('window.saveReportAsPdf'), 'English site should not keep the front-end PDF save flow.');
assert.ok(!html.includes('/api/export-pdf'), 'English site should not call the PDF export endpoint from the front end.');

console.log('english site pdf entry removal checks passed');
