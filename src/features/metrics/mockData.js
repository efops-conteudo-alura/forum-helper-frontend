// Dados de exemplo pro painel de prévia (/metrics). Nada aqui vem de API —
// é só pra mostrar como a tela fica quando as integrações (ClickUp/Discord/
// N8N) estiverem plugadas. Trocar por fetch real quando o webhook existir.

export const CATEGORIES = [
  { key: 'artigosFeitos', label: 'Artigos Feitos', shortLabel: 'ARTIGOS', icon: 'fa-solid fa-book-open', color: '#00C86F' },
  { key: 'artigosRevisados', label: 'Artigos Revisados', shortLabel: 'REVISÕES', icon: 'fa-solid fa-circle-check', color: '#6BD1FF' },
  { key: 'topicos', label: 'Tópicos Resolvidos', shortLabel: 'TÓPICOS', icon: 'fa-solid fa-comment', color: '#7B71FF' },
  { key: 'discord', label: 'Discord', shortLabel: 'DISCORD', icon: 'fa-brands fa-discord', color: '#FF8C2A' },
  { key: 'imersao', label: 'Imersão', shortLabel: 'IMERSÃO', icon: 'fa-solid fa-fire', color: '#DC6EBE' },
  { key: 'sevenDays', label: '7 Days of Code', shortLabel: '7DOC', icon: 'fa-solid fa-code', color: '#FFBA05' },
];

export const BR_TEAM_STATS = [
  { name: 'Daniel Nogueira', artigosFeitos: 8, artigosRevisados: 5, topicos: 62, discord: 145, imersao: 20, sevenDays: 10 },
  { name: 'Mike de Sousa', artigosFeitos: 6, artigosRevisados: 9, topicos: 48, discord: 110, imersao: 15, sevenDays: 8 },
  { name: 'Lorena Garcia', artigosFeitos: 5, artigosRevisados: 7, topicos: 35, discord: 90, imersao: 12, sevenDays: 6 },
  { name: 'Nathalia Queiroz', artigosFeitos: 4, artigosRevisados: 6, topicos: 28, discord: 75, imersao: 10, sevenDays: 7 },
  { name: 'Armano Junior', artigosFeitos: 3, artigosRevisados: 4, topicos: 20, discord: 60, imersao: 8, sevenDays: 5 },
  { name: 'Monalisa Silva', artigosFeitos: 3, artigosRevisados: 5, topicos: 15, discord: 45, imersao: 6, sevenDays: 4 },
  { name: 'Rafaela Petelin', artigosFeitos: 2, artigosRevisados: 3, topicos: 12, discord: 35, imersao: 5, sevenDays: 3 },
  { name: 'Victor Costa', artigosFeitos: 2, artigosRevisados: 2, topicos: 8, discord: 25, imersao: 3, sevenDays: 2 },
  { name: 'Vasco Ginde', artigosFeitos: 1, artigosRevisados: 1, topicos: 5, discord: 15, imersao: 2, sevenDays: 1 },
];

export const LATAM_TEAM_STATS = [
  { name: 'Victor Costa', artigosFeitos: 1, artigosRevisados: 1, topicos: 14, discord: 20, imersao: 4, sevenDays: 2 },
  { name: 'Nathalia Queiroz', artigosFeitos: 1, artigosRevisados: 2, topicos: 9, discord: 16, imersao: 2, sevenDays: 1 },
  { name: 'Monalisa Silva', artigosFeitos: 0, artigosRevisados: 1, topicos: 6, discord: 10, imersao: 1, sevenDays: 1 },
  { name: 'Rafaela Petelin', artigosFeitos: 0, artigosRevisados: 1, topicos: 4, discord: 8, imersao: 1, sevenDays: 0 },
];

export const NOVIDADES_MOCK = [
  { icon: 'fa-solid fa-trophy', color: '#FFBA05', text: 'Daniel Nogueira bateu recorde pessoal: 8 artigos revisados essa semana', when: 'há 2h' },
  { icon: 'fa-brands fa-discord', color: '#FF8C2A', text: 'Pico de atividade no canal #duvidas-frontend do Discord', when: 'há 5h' },
  { icon: 'fa-solid fa-fire', color: '#DC6EBE', text: '3 pessoas concluíram uma trilha da Imersão essa semana', when: 'ontem' },
  { icon: 'fa-solid fa-code', color: '#00C86F', text: 'Equipe completou o desafio do dia 5 do 7 Days of Code', when: 'ontem' },
];

export function initialsOf(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');
}

export function rowTotal(row) {
  return CATEGORIES.reduce((sum, c) => sum + (row[c.key] || 0), 0);
}

export function computeSummary(rows) {
  const totals = { artigosFeitos: 0, artigosRevisados: 0, topicos: 0, discord: 0, imersao: 0, sevenDays: 0 };
  rows.forEach((row) => {
    CATEGORIES.forEach((c) => { totals[c.key] += row[c.key] || 0; });
  });
  const total = CATEGORIES.reduce((sum, c) => sum + totals[c.key], 0);
  return { totals, total, people: rows.length };
}
