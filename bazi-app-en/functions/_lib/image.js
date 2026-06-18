export function buildChartSvg(calculation) {
  const { input, chart, analysis } = calculation;
  const pillars = [chart.pillars.year, chart.pillars.month, chart.pillars.day, chart.pillars.time];
  return `<?xml version="1.0" encoding="UTF-8"?>
  <svg width="1080" height="1350" viewBox="0 0 1080 1350" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="1080" height="1350" rx="36" fill="#1A1730"/>
    <text x="60" y="90" fill="#FFFFFF" font-size="42" font-family="Arial" font-weight="700">The Elements Palette</text>
    <text x="60" y="140" fill="#D6D3F0" font-size="24" font-family="Arial">${input.name} | ${input.locationLabel}</text>
    <rect x="40" y="190" width="1000" height="420" rx="24" fill="#FFF8EC"/>
    <text x="70" y="245" fill="#50402A" font-size="24" font-family="Arial" font-weight="700">Four Pillars / 四柱</text>
    ${pillars.map((pillar, index) => `<text x="${120 + (index * 240)}" y="370" fill="#2D2A24" font-size="78" font-family="Arial" font-weight="700">${pillar}</text>`).join('')}
    <text x="70" y="485" fill="#6A5B42" font-size="24" font-family="Arial">True Solar Time: ${input.adjustedBirthTime}</text>
    <text x="70" y="530" fill="#6A5B42" font-size="24" font-family="Arial">Day Master: ${analysis.dayMaster}</text>
    <text x="70" y="575" fill="#6A5B42" font-size="24" font-family="Arial">Useful Elements: ${analysis.usefulElements.join(', ')}</text>
    <rect x="40" y="650" width="1000" height="620" rx="24" fill="#353250"/>
    <text x="70" y="710" fill="#FFFFFF" font-size="30" font-family="Arial" font-weight="700">Chart Snapshot</text>
    ${analysis.elementScores.map((item, index) => `
      <text x="80" y="${790 + (index * 88)}" fill="#EDE9FE" font-size="24" font-family="Arial">${item.name}</text>
      <rect x="240" y="${760 + (index * 88)}" width="720" height="30" rx="15" fill="#211D37"/>
      <rect x="240" y="${760 + (index * 88)}" width="${item.percent * 7.2}" height="30" rx="15" fill="#8B5CF6"/>
      <text x="980" y="${783 + (index * 88)}" fill="#EDE9FE" font-size="20" font-family="Arial" text-anchor="end">${item.percent}%</text>
    `).join('')}
  </svg>`;
}
