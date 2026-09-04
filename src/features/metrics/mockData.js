// Dados do painel /metrics. Primeira leva real veio do ClickUp via N8N
// (testado manualmente em 2026-08-20/21) — ainda não é um pipeline agendado,
// são números tirados na mão enquanto o webhook de ingestão não existe.
// Sem quebra por pessoa em lugar nenhum aqui — decisão consciente, não é
// só "ainda não fizemos": ver memória feedback_no_competitive_framing.

// Cada métrica carrega o próprio período — os cards não fingem estar todos
// na mesma janela de tempo até termos o filtro de data validado em todas.
export const REAL_METRICS = {
  artigosRevisados: {
    total: 100,
    periodo: 'desde o início do processo',
  },
  reclamacoes: {
    total: 96,
    periodo: 'este trimestre',
    porTipo: [
      { label: 'Didática', total: 29 },
      { label: 'Conteúdo Desatualizado', total: 18 },
      { label: 'Passos de Setup', total: 10 },
      { label: 'Erro de Revisão', total: 9 },
      { label: 'Profundidade Técnica', total: 9 },
      { label: 'Falha Audiovisual', total: 8 },
      { label: 'Material de Apoio', total: 7 },
      { label: 'Estrutura/Ferramenta', total: 3 },
      { label: 'Formato de Aula', total: 2 },
      { label: 'Acessibilidade', total: 1 },
      { label: 'Plataforma', total: 1 },
      { label: 'Promessa Desalinhada', total: 1 },
    ],
  },
};

// Fontes ainda sem dado nenhum (nem antigo) — Discord depende de chave do
// Statbot (pedida ao time de Comunidade), Artigos Feitos e as demais ainda
// não tiveram o node do N8N rodado até o fim.
export const COMING_SOON_CARDS = [
  { key: 'artigosFeitos', iconClass: 'fas fa-book-open', label: 'Artigos Feitos', color: '#00C86F' },
  { key: 'imersao', iconClass: 'fas fa-graduation-cap', label: 'Imersão', color: '#FFBA05' },
  { key: '7days', iconClass: 'fas fa-laptop-code', label: '7 Days of Code', color: '#7B71FF' },
  { key: 'discord', iconClass: 'fa-brands fa-discord', label: 'Discord', color: '#5865F2' },
];

// Variedade proposital: nem toda "novidade" é uma vitória — a ideia da
// esteira é também sinalizar quedas/atenção, não só marcos batidos.
// De propósito, sem nome de pessoa nem comparação entre indivíduos — isso
// não é um mural competitivo, os eventos são sempre em nível de time/categoria.
export const NOVIDADES_MOCK = [
  { icon: 'fa-solid fa-flag-checkered', color: '#FFBA05', text: 'Time ultrapassou 200 tópicos resolvidos este mês', when: 'há 2h' },
  { icon: 'fa-solid fa-chart-line', color: '#FF8C2A', text: 'Discord: alta de 18% nas interações em relação à semana passada', when: 'há 5h' },
  { icon: 'fa-solid fa-fire', color: '#DC6EBE', text: 'Equipe manteve atividade diária no 7 Days of Code por 5 dias seguidos', when: 'ontem' },
  { icon: 'fa-solid fa-triangle-exclamation', color: '#F16165', text: 'Imersão: participação caiu essa semana — vale um lembrete pro time', when: 'ontem' },
  { icon: 'fa-solid fa-bullseye', color: '#00C86F', text: 'Equipe atingiu 80% da meta mensal de artigos revisados', when: 'há 2 dias' },
  { icon: 'fa-solid fa-star', color: '#7B71FF', text: 'Primeiro artigo do trimestre já foi revisado', when: 'há 3 dias' },
];
