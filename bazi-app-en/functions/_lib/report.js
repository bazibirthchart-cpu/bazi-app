function naturalJoin(list = []) {
  const items = list.filter(Boolean);
  if (!items.length) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

function byState(state) {
  return state === 'strong'
    ? 'a stronger Day Master that benefits from directing energy into output, structure, and measurable results'
    : state === 'weak'
      ? 'a weaker Day Master that benefits from support, pacing, and stronger roots before carrying extra pressure'
      : 'a relatively balanced Day Master where rhythm, sequencing, and choice quality matter most';
}

export function buildReport(calculation, language = 'en') {
  const { input, analysis, chart } = calculation;
  const top = [...analysis.elementScores].sort((a, b) => b.percent - a.percent)[0];
  const low = [...analysis.elementScores].sort((a, b) => a.percent - b.percent)[0];
  const useful = naturalJoin(analysis.usefulElements);
  const avoid = naturalJoin(analysis.avoidElements);
  const pillars = `${chart.pillars.year} ${chart.pillars.month} ${chart.pillars.day} ${chart.pillars.time}`;
  if (language === 'zh') {
    return {
      lead: `${input.name} 的命盘核心先看日主、节气和四柱组合。当前四柱为 ${pillars}，整体更偏${analysis.strengthState === 'strong' ? '身旺' : analysis.strengthState === 'weak' ? '身弱' : '中和'}，适合按“顺强项、补短板、稳节奏”的思路来理解。`,
      sections: {
        basic: `基础信息部分已经由后端整理完成，真太阳时为 ${input.adjustedBirthTime}，地点参考为 ${input.locationLabel}。这类信息在后端统一处理后，后面可以更稳定地给小程序、INS 内嵌页和 Messenger 版复用。`,
        overview: `命盘总览里，当前最强的五行是 ${top.name}，相对偏弱的是 ${low.name}。这意味着你做事时最自然的推进方式，会优先动用强项，而不是平均发力。整体判断更偏${analysis.strengthState === 'strong' ? '把能量导出去' : analysis.strengthState === 'weak' ? '先补根气再扩张' : '保持节奏和取舍'}。`,
        career: `事业财富部分，最适合的方向是把强势五行先变成实际价值，再用喜用五行调整长期稳定性。当前更适合围绕 ${top.name} 的特质建立工作方法，同时避免 ${avoid} 相关失衡习惯反复放大。`,
        relationship: `感情关系部分，重点不是套话式建议，而是看你如何在关系里表达需求、设边界、维持节奏。当前盘面更适合先看自己在压力中最容易重复的反应模式，再决定怎样让关系进入更稳定的结构。`,
        yearly: `年度趋势部分，第一版后端先给出结构化总结，后面可以继续接大运流年与缓存系统。现在的重点是让机会判断、风险提醒、合作关系和身心节奏都能在服务端统一输出。`,
        action: `行动指南部分，会围绕未来三个月、补五行策略、决策方式和个人关键词生成。第一版目标不是把所有文案做得极长，而是先确保不同命盘能得到不同结构、不同重点、不同导出结果。`
      }
    };
  }
  return {
    lead: `${input.name}'s backend-generated reading starts from the real chart structure, not only the front-end view. The four pillars are ${pillars}, and the chart reads as ${byState(analysis.strengthState)}.`,
    sections: {
      basic: `The backend now returns normalized birth data, adjusted true solar time (${input.adjustedBirthTime}), and location context (${input.locationLabel}) in one place. This gives later mobile clients, embedded browsers, and export flows a more stable source of truth.`,
      overview: `The strongest element in this chart is ${top.name} at ${top.percent}%, while the softest zone is ${low.name} at ${low.percent}%. That does not mean one side is good and the other is bad. It means the chart naturally leans on one style of action first. The useful elements currently read as ${useful}, while the less helpful tendencies lean more toward ${avoid}.`,
      career: `For career and wealth, the first backend version interprets the chart by turning the strongest structure into visible value instead of flattening everything into generic advice. A ${analysis.strengthState} chart usually works best when role design, workload, and output style match the chart's real energy pattern.`,
      relationship: `For relationship reading, the backend version focuses on repeating patterns under pressure, the need for pacing, and how the Day Master carries closeness. This makes later platform integration easier because the relationship layer can be generated consistently from structured chart data instead of hand-built front-end text only.`,
      yearly: `For yearly outlook, this first backend version establishes the section shape and prepares the system for fuller annual-cycle calculation later. The goal is a stable server-side result that can scale across embedded browser contexts without depending on the local device for heavy logic.`,
      action: `For the action guide, the backend now supports section-level report generation so future work can expand into three-month guidance, useful-element support, decision style, and keyword outputs. The immediate value is consistency: different charts can now start moving toward different report payloads instead of sharing one front-end-only path.`
    }
  };
}
