// Constantes e funções puras usadas pela TopicsView.
// Sem React, sem DOM — fáceis de testar isoladamente.

export const CATEGORY_BUTTONS = [
  { category: 'Todas', label: 'Todas', cssClass: '', file: '' },
  { category: 'Front-end', label: 'Front-end', cssClass: 'frontend', file: 'front-end' },
  { category: 'Programação', label: 'Back-End', cssClass: 'backend', file: 'back-end' },
  { category: 'Data Science', label: 'Dados', cssClass: 'data', file: 'dados' },
  { category: 'DevOps', label: 'DevOps', cssClass: 'devops', file: 'devops' },
  { category: 'UX & Design', label: 'UX Design', cssClass: 'design', file: 'design-ux' },
  { category: 'Mobile', label: 'Mobile', cssClass: 'mobile', file: 'mobile' },
  { category: 'Inovação & Gestão', label: 'Gestão & Negócios', cssClass: 'inova', file: 'inovacao-gestao' },
  { category: 'Inteligência Artificial', label: 'I.A.', cssClass: 'ia', file: 'inteligencia-artificial' },
  { category: 'Cloud', label: 'Cloud', cssClass: 'cloud', file: 'cloud' },
  { category: 'Cibersegurança', label: 'Cibersegurança', cssClass: 'ciberseguranca', file: 'ciberseguranca' },
];

export const PRIORITY_FILTERS = [
  { value: 'Todos', label: 'Todos', cssClass: '' },
  { value: 'SLA', label: 'SLA', cssClass: 'sla' },
  { value: 'Complexo', label: 'Complexo', cssClass: 'danger' },
  { value: 'Fácil', label: 'Fácil', cssClass: 'success' },
  { value: 'Feedback', label: 'Feedback', cssClass: 'feedback' },
];

// Status do tópico, vindo da API (`status`):
// - SEM_RESPOSTA: lista "sem resposta" do fórum, ninguém respondeu.
// - SEM_RESPOSTA_OFICIAL: consulta do BI, alunos responderam mas ninguém da Alura.
//   Fica fora de toda contagem de SLA (filtro, cores do card, radar, foco, saúde da fila).
export const STATUS_SEM_RESPOSTA = 'SEM_RESPOSTA';
export const STATUS_SEM_RESPOSTA_OFICIAL = 'SEM_RESPOSTA_OFICIAL';

export const STATUS_INFO = {
  [STATUS_SEM_RESPOSTA]: {
    label: 'Sem resposta',
    cssClass: 'sem-resposta',
    icon: 'fa-comment-slash',
    hint: 'Ninguém respondeu ainda',
  },
  [STATUS_SEM_RESPOSTA_OFICIAL]: {
    label: 'Sem resposta oficial',
    cssClass: 'sem-resposta-oficial',
    icon: 'fa-user-graduate',
    hint: 'Alunos responderam, ninguém da Alura',
  },
};

export const STATUS_FILTERS = [
  { value: 'Todos', label: 'Todos', cssClass: '' },
  { value: STATUS_SEM_RESPOSTA, label: STATUS_INFO[STATUS_SEM_RESPOSTA].label, cssClass: 'sem-resposta' },
  { value: STATUS_SEM_RESPOSTA_OFICIAL, label: STATUS_INFO[STATUS_SEM_RESPOSTA_OFICIAL].label, cssClass: 'sem-resposta-oficial' },
];

/** O tópico entra nas contagens de SLA? Os "sem resposta oficial" não entram. */
export function entraNoSla(topic) {
  return topic?.status !== STATUS_SEM_RESPOSTA_OFICIAL;
}

export const categoryClassMap = {
  'Front-end': 'frontend',
  'Programação': 'programacao',
  'Data Science': 'data-science',
  DevOps: 'devops',
  'UX & Design': 'ux-design',
  Mobile: 'mobile',
  'Inovação & Gestão': 'inovacao-gestao',
  'Inteligência Artificial': 'ia',
  Cloud: 'cloud',
  'Cibersegurança': 'ciberseguranca',
};

// Rótulo exibido pro usuário — separado da chave interna (usada em CSS/cor)
// porque o fórum renomeou algumas categorias.
export const categoryLabelMap = {
  'Programação': 'Back-End',
  'Data Science': 'Dados',
  'Inovação & Gestão': 'Gestão & Negócios',
};

export const priorityClassMap = {
  'Fácil': 'easy',
  'Médio': 'medium',
  'Complexo': 'complex',
  'Feedback': 'feedback',
  ALTA: 'complex',
  MEDIA: 'medium',
  BAIXA: 'easy',
};

const DEFAULT_PRIORITY = ['Fácil', 'Médio', 'Complexo', 'Feedback'];

export function getRandomPriority() {
  return DEFAULT_PRIORITY[Math.floor(Math.random() * DEFAULT_PRIORITY.length)];
}

export function normalizeCategory(category) {
  if (!category) return 'Outros';
  const normalized = category
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (normalized.includes('front')) return 'Front-end';
  if (normalized.includes('data science') || normalized.includes('data') || normalized.includes('dados')) return 'Data Science';
  if (normalized.includes('devops') || normalized.includes('infra')) return 'DevOps';
  if (normalized.includes('ux') || normalized.includes('design')) return 'UX & Design';
  if (normalized.includes('mobile')) return 'Mobile';
  if (
    normalized.includes('inovacao') ||
    normalized.includes('gestao') ||
    normalized.includes('innovacion') ||
    normalized.includes('gestion')
  ) {
    return 'Inovação & Gestão';
  }
  if (normalized.includes('inteligencia') || normalized.includes('artificial')) return 'Inteligência Artificial';
  if (
    normalized.includes('program') ||
    normalized.includes('codigo') ||
    normalized.includes('programacao') ||
    normalized.includes('programacion') ||
    normalized.includes('back end') ||
    normalized.includes('backend')
  ) {
    return 'Programação';
  }
  if (normalized.includes('ciberseguranca') || normalized.includes('seguranca') || normalized.includes('cyber')) {
    return 'Cibersegurança';
  }
  if (normalized.includes('cloud') || normalized.includes('nuvem')) return 'Cloud';
  return 'Outros';
}

export function parseAgeToDays(ageText = '') {
  const text = ageText.toString().toLowerCase().normalize('NFD').replace(/[^0-9a-z]/g, '');
  const value = parseInt(text.match(/\d+/)?.[0] || '0', 10) || 0;
  if (text.includes('min')) return value / 1440;
  if (text.includes('hor')) return value / 24;
  if (text.includes('dia')) return value;
  if (text.includes('sem')) return value * 7;
  if (text.includes('mes')) return value * 30;
  if (text.includes('ano')) return value * 365;
  return 0;
}

export function normalizeTopic(raw) {
  const title = raw.title || raw.subject || raw.name || raw.topic_title || '';
  const link = raw.link || raw.topic_link || raw.url || '#';
  const category = normalizeCategory(raw.category || raw.school || raw.escola_nome || raw.type);
  const daysText = raw.daysText || raw.ageText || raw.age || raw.days || '';
  const ageInDays = parseAgeToDays(daysText);
  const priority = raw.priority || raw.ia_analysis?.prioridade || getRandomPriority();
  const claimedBy = raw.claimedBy || raw.claimed_by || null;
  const isClaimed = raw.isClaimed || Boolean(claimedBy);
  const status = raw.status === STATUS_SEM_RESPOSTA_OFICIAL ? STATUS_SEM_RESPOSTA_OFICIAL : STATUS_SEM_RESPOSTA;
  const replyCount = Number.isFinite(raw.replyCount) ? raw.replyCount : null;

  return {
    ...raw,
    status,
    replyCount,
    title,
    link,
    category,
    daysText,
    ageInDays,
    priority,
    claimedBy,
    isClaimed,
    authorImage: raw.authorImage || raw.author_avatar || raw.user_avatar || raw.avatar || '',
  };
}

export function getClaimedName(claimedBy) {
  if (!claimedBy) return null;
  return claimedBy.name || claimedBy.username || claimedBy.user || null;
}

/*
  Formata idade do tópico de forma humana, sempre escalando pra unidade maior.
  Antes mostrávamos `daysText` cru da API — que vinha como "4500h" pra tópicos
  antigos. Agora calculamos a partir de `ageInDays` (sempre confiável).

  - < 1h    → "Xmin"
  - < 1d    → "Xh" ou "Xh Ymin"
  - < 7d    → "Xd" ou "Xd Yh"
  - < 30d   → "Xd"  (sem horas, ruído)
  - < 365d  → "Xmes" ou "Xmes Yd"
  - >=365d  → "Xa Ymes"
*/
export function formatTopicAge(ageInDays) {
  if (!ageInDays || ageInDays <= 0) return 'agora';

  const totalMinutes = Math.round(ageInDays * 24 * 60);
  if (totalMinutes < 60) return `${totalMinutes}min`;

  if (totalMinutes < 1440) {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return m > 0 ? `${h}h ${m}min` : `${h}h`;
  }

  const totalDays = Math.floor(totalMinutes / 1440);
  if (totalDays < 7) {
    const restHours = Math.floor((totalMinutes % 1440) / 60);
    return restHours > 0 ? `${totalDays}d ${restHours}h` : `${totalDays}d`;
  }

  if (totalDays < 30) return `${totalDays}d`;

  const totalMonths = Math.floor(totalDays / 30);
  if (totalMonths < 12) {
    const restDays = totalDays % 30;
    return restDays > 0 ? `${totalMonths}mes ${restDays}d` : `${totalMonths}mes`;
  }

  const years = Math.floor(totalMonths / 12);
  const restMonths = totalMonths % 12;
  return restMonths > 0 ? `${years}a ${restMonths}mes` : `${years}a`;
}
