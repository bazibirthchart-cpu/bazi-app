import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const pdfGlossary = new Map([
  ['偏印', 'Indirect Resource'],
  ['正印', 'Direct Resource'],
  ['比肩', 'Companion'],
  ['劫财', 'Peer Rival'],
  ['食神', 'Output Star'],
  ['伤官', 'Hurting Officer'],
  ['偏财', 'Indirect Wealth'],
  ['正财', 'Direct Wealth'],
  ['七杀', 'Seven Killings'],
  ['正官', 'Direct Officer'],
  ['元女', 'Day Master (Female)'],
  ['元男', 'Day Master (Male)'],
  ['甲', 'Jia '],
  ['乙', 'Yi '],
  ['丙', 'Bing '],
  ['丁', 'Ding '],
  ['戊', 'Wu '],
  ['己', 'Ji '],
  ['庚', 'Geng '],
  ['辛', 'Xin '],
  ['壬', 'Ren '],
  ['癸', 'Gui '],
  ['子', 'Zi '],
  ['丑', 'Chou '],
  ['寅', 'Yin '],
  ['卯', 'Mao '],
  ['辰', 'Chen '],
  ['巳', 'Si '],
  ['午', 'Wu '],
  ['未', 'Wei '],
  ['申', 'Shen '],
  ['酉', 'You '],
  ['戌', 'Xu '],
  ['亥', 'Hai '],
  ['鼠', 'Rat'],
  ['牛', 'Ox'],
  ['虎', 'Tiger'],
  ['兔', 'Rabbit'],
  ['龙', 'Dragon'],
  ['蛇', 'Snake'],
  ['马', 'Horse'],
  ['羊', 'Goat'],
  ['猴', 'Monkey'],
  ['鸡', 'Rooster'],
  ['狗', 'Dog'],
  ['猪', 'Pig']
]);

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

function sanitizeEnglishPdfText(text) {
  if (!text) return '';
  let output = String(text);
  const glossaryEntries = [...pdfGlossary.entries()].sort((a, b) => b[0].length - a[0].length);
  glossaryEntries.forEach(([source, target]) => {
    output = output.split(source).join(target);
  });
  output = output
    .replace(/[\u3400-\u9fff\uf900-\ufaff]/g, ' ')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return output;
}

function preparePdfText(text, language) {
  if (language === 'en') return sanitizeEnglishPdfText(text);
  return String(text || '');
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
    page.drawText(preparePdfText(report.lead, language), {
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
    page.drawText(preparePdfText(`Pillars: ${calculation.chart.pillars.year} ${calculation.chart.pillars.month} ${calculation.chart.pillars.day} ${calculation.chart.pillars.time}`, language), {
      x: 40, y: 644, size: 10, font: bodyFont, color: rgb(1, 1, 1)
    });

    const lines = wrapText(preparePdfText(body, language), language === 'zh' ? 28 : 68);
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
