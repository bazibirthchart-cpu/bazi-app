import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

function wrapText(text, maxChars) {
  const words = String(text || '').split(/\s+/);
  const lines = [];
  let line = '';
  words.forEach(word => {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > maxChars) {
      if (line) lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  });
  if (line) lines.push(line);
  return lines;
}

export async function buildPdfBuffer(calculation, report, language = 'en') {
  const pdf = await PDFDocument.create();
  const titleFont = await pdf.embedFont(StandardFonts.HelveticaBold);
  const bodyFont = await pdf.embedFont(StandardFonts.Helvetica);
  const pages = [
    ['Basic Info', report.sections.basic],
    ['Chart Overview', report.sections.overview],
    ['Career & Wealth', report.sections.career],
    ['Love & Relationships', report.sections.relationship],
    ['Yearly Outlook', report.sections.yearly],
    ['Action Guide', report.sections.action]
  ];

  pages.forEach(([title, body], index) => {
    const page = pdf.addPage([595.28, 841.89]);
    page.drawRectangle({ x: 0, y: 0, width: 595.28, height: 841.89, color: rgb(0.13, 0.12, 0.24) });
    page.drawText(language === 'zh' ? '五行宇宙专业报告' : 'The Elements Palette Report', {
      x: 40,
      y: 792,
      size: 20,
      font: titleFont,
      color: rgb(1, 1, 1)
    });
    page.drawText(`${index + 1}. ${title}`, {
      x: 40,
      y: 754,
      size: 16,
      font: titleFont,
      color: rgb(0.96, 0.86, 0.56)
    });
    page.drawText(report.lead, {
      x: 40,
      y: 724,
      size: 10,
      font: bodyFont,
      maxWidth: 515,
      lineHeight: 14,
      color: rgb(0.87, 0.89, 0.93)
    });
    page.drawText(`Name: ${calculation.input.name}`, { x: 40, y: 680, size: 10, font: bodyFont, color: rgb(1, 1, 1) });
    page.drawText(`Birth: ${calculation.input.rawBirthTime}`, { x: 220, y: 680, size: 10, font: bodyFont, color: rgb(1, 1, 1) });
    page.drawText(`True Solar Time: ${calculation.input.adjustedBirthTime}`, { x: 40, y: 662, size: 10, font: bodyFont, color: rgb(1, 1, 1) });
    page.drawText(`Pillars: ${calculation.chart.pillars.year} ${calculation.chart.pillars.month} ${calculation.chart.pillars.day} ${calculation.chart.pillars.time}`, {
      x: 40, y: 644, size: 10, font: bodyFont, color: rgb(1, 1, 1)
    });

    const lines = wrapText(body, language === 'zh' ? 28 : 68);
    let cursorY = 608;
    lines.forEach(line => {
      if (cursorY < 54) return;
      page.drawText(line, {
        x: 40,
        y: cursorY,
        size: 11,
        font: bodyFont,
        color: rgb(0.16, 0.14, 0.1),
        maxWidth: 515,
        lineHeight: 18
      });
      cursorY -= 18;
    });
    page.drawRectangle({ x: 30, y: 36, width: 535, height: 4, color: rgb(0.79, 0.6, 0.23) });
  });

  return Buffer.from(await pdf.save());
}
