import axios from 'axios';
import { guardarRotaAtual } from '../shared/auth/sessaoLocal';

/*
  Login único (SSO Microsoft).

  Ligado com `VITE_SSO_ENABLED=true`. Nesse modo o app fala com a API Java pelo
  MESMO domínio do frontend (proxy do Vercel / do Vite): `/forum-api/*` vira
  `/api/*` na API e `/auth/*` é repassado como está. Assim o cookie de sessão
  (HttpOnly) é first-party e o JavaScript nunca enxerga o token.

  Desligado (padrão), tudo funciona como antes, apontando para o backend atual.
*/
export const SSO_ENABLED = import.meta.env.VITE_SSO_ENABLED === 'true';
export const SSO_LOGIN_PATH = '/auth/microsoft';
// Mesmo início de login, mas pedindo à Microsoft que mostre a escolha de conta. Usado depois
// de sair: sem isso a Microsoft reaproveita a sessão dela e devolve a pessoa logada na hora.
export const SSO_LOGIN_PATH_ESCOLHER_CONTA = '/auth/microsoft?prompt=select_account';

// Base do backend. Em dev, crie `.env.local` na raiz do frontend com:
//   VITE_API_BASE_URL=http://localhost:8080/api      (sem SSO)
//   VITE_SSO_ENABLED=true                            (com SSO; usa o proxy do Vite)
// Sem env vars, cai no backend de produção (DigitalOcean) — o que faz
// o build da Vercel funcionar de fora da caixa.
export const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    (SSO_ENABLED ? '/forum-api' : 'https://forum-helper-zmqxu.ondigitalocean.app/api');

// Chave do backend ATUAL (modo sem SSO). Com SSO a autenticação é o cookie de sessão
// e esta chave não é enviada — pode ser apagada junto com o backend antigo.
const PUBLIC_API_KEY = 'cbi_787afeef9bf9e982_c404854ac2b40394c63da0b9608544a4f057bd666bbdb3df';

const api = axios.create({ baseURL: API_BASE_URL });
api.interceptors.request.use((config) => {
  if (!config.headers) config.headers = {};
  // A chave pessoal do Gemini (`googleApiKey`) NÃO deve ir para o servidor: ela só é usada
  // direto do navegador (catalog/ai.js). Antes ela era enviada aqui em toda requisição.
  if (!SSO_ENABLED && PUBLIC_API_KEY) {
    config.headers['X-Api-Key'] = PUBLIC_API_KEY;
  }
  return config;
});

// Sessão expirada ou ausente (401) em QUALQUER chamada => volta para o login.
// Centralizado aqui porque várias funções abaixo engolem o erro e devolvem valores vazios;
// sem isso um 401 passaria despercebido (contadores zerados, listas vazias).
let redirecionandoParaLogin = false;
export function iniciarLogin({ escolherConta = false } = {}) {
  if (redirecionandoParaLogin) return;
  redirecionandoParaLogin = true;
  // O SSO devolve o navegador à raiz; o AuthGate usa isto para voltar à rota de origem.
  guardarRotaAtual();
  window.location.assign(escolherConta ? SSO_LOGIN_PATH_ESCOLHER_CONTA : SSO_LOGIN_PATH);
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const naoRedirecionar = error?.config?.skipAuthRedirect === true;
    if (SSO_ENABLED && error?.response?.status === 401 && !naoRedirecionar) {
      iniciarLogin();
    }
    return Promise.reject(error);
  },
);

/*
  Usuário da sessão atual. Devolve `{ email, nome }`, ou `null` se não houver sessão (401).
  Outros erros (rede, 5xx) são propagados para a tela decidir o que mostrar.
*/
export async function fetchCurrentUser() {
  try {
    const response = await api.get('/auth/me', { skipAuthRedirect: true });
    return response.data;
  } catch (error) {
    if (error?.response?.status === 401) return null;
    throw error;
  }
}

export async function logout() {
  try {
    await api.post('/auth/logout', null, { skipAuthRedirect: true });
  } catch (error) {
    console.error('Erro no logout:', error);
  }
}

export const LATAM_USER_MAPPING = {
    'victos-costa': 'victor-costa',
    'nathqueiroz': 'nathalia-queiroz',
    'monalisa-silva1': 'monalisa-silva',
    'rafaela-petelin-silverio': 'rafaela-petelin',
};

export function getLatamUsername(brUsername) {
    if (!brUsername) return null;
    const normalizedUsername = brUsername.trim().toLowerCase();
    return LATAM_USER_MAPPING[normalizedUsername] || normalizedUsername;
}

export async function fetchTopics(region = 'BR') {
    try {
        const endpoint = region === 'LATAM' ? '/topics/latam' : '/topics';

        const response = await api.get(endpoint);
        return response.data;
    } catch (error) {
        console.error('Erro no fetchTopics:', error);
        throw error;
    }
}

export async function fetchLatamStats(username) {
    try {
        const latamUsername = getLatamUsername(username);
        if (!latamUsername) {
            return { postsToday: 0, postsMonth: 0, platform: 'LATAM' };
        }
        console.log(`[API] Traduzido: ${username} -> LATAM: ${latamUsername}`);
        const response = await api.get(`/latam-user-stats?username=${latamUsername}`);
        return response.data;
    } catch (error) {
        console.error('Erro no fetchLatamStats:', error);
        return { postsToday: 0, postsMonth: 0, platform: 'LATAM' };
    }
}

export async function claimTopic(topicLink, username, avatarUrl = null) {
    try {
        // Mesmo padrão do /rescue-claim: front manda o avatar pronto (que ele
        // já tem cacheado no localStorage). Backend valida e usa, evitando
        // scrappear na hora — claim fica instantâneo.
        const response = await api.post('/claim', {
            topicLink,
            username,
            avatar: avatarUrl,
        });
        return response.data;
    } catch (error) {
        console.error('Erro no claimTopic:', error);
        throw error;
    }
}

export async function unclaimTopic(topicLink, username) {
    try {
        const response = await api.post('/unclaim', {
            topicLink,
            username
        });
        return response.data;
    } catch (error) {
        console.error('Erro no unclaimTopic:', error);
        throw error;
    }
}

export async function fetchUserStats(username) {
    try {
        const response = await api.get(`/user-stats?username=${username}`);
        return response.data;
    } catch (error) {
        console.error('Erro no fetchUserStats:', error);
        return { postsToday: 0, postsMonth: 0 };
    }
}

export async function fetchTeamStats(usersArray) {
    try {
        const usersParam = usersArray.join(',');
        const response = await api.get(`/team-stats?users=${usersParam}`);
        return response.data;
    } catch (error) {
        console.error('Erro no fetchTeamStats:', error);
        return [];
    }
}

export async function fetchDashboardStats(startDate, endDate, users) {
    try {
        const usersParam = users || '';
        const encodedUsers = encodeURIComponent(usersParam);
        const encodedStart = encodeURIComponent(startDate);
        const encodedEnd = encodeURIComponent(endDate);
        const response = await api.get(
            `/dashboard-stats?users=${encodedUsers}&startDate=${encodedStart}&endDate=${encodedEnd}`
        );
        return response.data;
    } catch (error) {
        console.error('Erro no fetchDashboardStats:', error);
        return { summary: {}, users: [] };
    }
}

export async function fetchAvatarFromBackend(username) {
    if (!username) return { success: false, url: null };

    const normalizedUsername = username.trim().toLowerCase();
    const cacheKey = `alura_avatar_v1_${normalizedUsername}`;
    const CACHE_EXPIRATION_MS = 7 * 24 * 60 * 60 * 1000;
    // "Negative cache": quando o backend FALHA explicitamente (success: false
    // ou erro de rede), evita request repetido por 5 min. Tempo curto porque
    // o backend tem cache próprio que se popula aos poucos — é normal a 1ª
    // chamada falhar e a 2ª (segundos depois) já dar certo.
    //
    // ATENÇÃO: success:true + avatarUrl:null NÃO conta como falha — o backend
    // simplesmente ainda não tem essa URL no cache dele. Próxima request pode
    // já ter (após scraping). Tratamos como "ausência neutra".
    const NEGATIVE_CACHE_MS = 5 * 60 * 1000;

    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
        try {
            const parsedCache = JSON.parse(cachedData);
            const now = Date.now();
            // Cache positivo válido — devolve.
            if (parsedCache.url && now - parsedCache.timestamp < CACHE_EXPIRATION_MS) {
                return { success: true, url: parsedCache.url, cached: true };
            }
            // Cache negativo válido — devolve fail sem fazer request.
            if (parsedCache.negative && now - parsedCache.timestamp < NEGATIVE_CACHE_MS) {
                return { success: false, url: null, cached: true };
            }
        } catch (e) {
            console.warn("Cache do avatar corrompido. Buscando novo...");
        }
    }

    try {
        const response = await api.get(`/user-avatar?username=${normalizedUsername}`);
        const data = response.data;

        // FALHA explícita do backend (success: false) → negative cache.
        if (data.success === false) {
            localStorage.setItem(cacheKey, JSON.stringify({
                negative: true,
                timestamp: Date.now(),
            }));
            return { success: false, url: null };
        }

        // success: true mas avatarUrl null/vazio → ausência neutra. Não cacheia
        // negative pra próxima request poder pegar quando o backend popular.
        if (!data.avatarUrl) {
            return { success: false, url: null };
        }

        localStorage.setItem(cacheKey, JSON.stringify({
            url: data.avatarUrl,
            timestamp: Date.now(),
        }));

        return { success: true, url: data.avatarUrl, cached: false };
    } catch (error) {
        console.error(`Erro de rede ao buscar avatar para ${normalizedUsername}:`, error);

        // Reuso de cache positivo expirado — melhor que nada se o backend caiu.
        if (cachedData) {
            try {
                const parsedCache = JSON.parse(cachedData);
                if (parsedCache.url) {
                    return { success: true, url: parsedCache.url, cached: true };
                }
            } catch (e) {}
        }

        // Negative cache pra próximas tentativas falharem rápido.
        try {
            localStorage.setItem(cacheKey, JSON.stringify({
                negative: true,
                timestamp: Date.now(),
            }));
        } catch (e) { /* localStorage cheio, ok */ }

        return { success: false, url: null };
    }
}

// Busca dados de tópicos por membro do BI (o backend decide o ID conforme a região)
export async function fetchMemberTopicsByRegion(region = 'BR') {
    try {
        const response = await api.get(`/bi-topics?region=${region}`);
        return response.data || [];
    } catch (error) {
        console.error(`Erro ao buscar tópicos por membro (${region}):`, error);
        return [];
    }
}

const BI_ANNUAL_URL = "https://bi.caelumalura.com.br/public/result?id=SEU_ID_DA_QUERY_ANUAL_AQUI&format=json";
const userAnnualCache = {};

export async function fetchUserAnnualData(username) {
    if (userAnnualCache[username]) return userAnnualCache[username];
    try {
        if (BI_ANNUAL_URL.includes("SEU_ID")) return [];
        const response = await axios.get(BI_ANNUAL_URL);
        const data = response.data;
        if (data.result) {
            data.result.forEach(row => {
                const u = row[0]; const d = row[1]; const c = row[2];
                if (!userAnnualCache[u]) userAnnualCache[u] = [];
                userAnnualCache[u].push({ date: d, count: c });
            });
        }
        return userAnnualCache[username] || [];
    } catch (error) {
        console.error("Erro histórico anual:", error);
        return [];
    }
}

export async function fetchRescueQueue() {
    try {
        const response = await api.get('/rescue-queue');
        return response.data;
    } catch (error) {
        console.error('Erro no fetchRescueQueue:', error);
        return { topics: [], waiting_queue: [] };
    }
}

export async function claimRescueTopic(topicId, username, avatarUrl) {
    const response = await api.post('/rescue-claim', {
        topic_id: topicId,
        username: username,
        avatar: avatarUrl
    });
    return response.data;
}

export async function unclaimRescueTopic(topicId) {
    const response = await api.post('/rescue-unclaim', {
        topic_id: topicId
    });
    return response.data;
}

/*
  Marca um tópico do Fora do Radar como resolvido. Backend faz soft-delete
  (status=RESOLVED, deixa de aparecer em /api/rescue-queue). Quem chama é
  responsável por sumir o card otimisticamente — próximo poll já não
  retorna ele.
*/
export async function resolveRescueTopic(topicId, username) {
    const response = await api.post('/rescue-resolve', {
        topic_id: topicId,
        username,
    });
    return response.data;
}

export async function fetchFocusData() {
    const SHEET_ID = '1746BtlDdh97YV0CV0s941WezEgkhEJx8geFNPYf2ulk';
    const GID = '1835095510';
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${GID}&_=${new Date().getTime()}`;
    try {
        const response = await axios.get(url);
        const textData = response.data;
        const jsonData = JSON.parse(textData.substring(47).slice(0, -2));
        return jsonData.table.rows.map(row => ({
            nome: row.c[0]?.v || '',
            foco1: row.c[2]?.v || '',
            foco2: row.c[3]?.v || ''
        }));
    } catch (error) {
        console.error("Erro ao buscar dados de foco:", error);
        return [];
    }
}

/* ============================================
   ALOCAÇÃO — CRUD de atividades do time

   Backend usa Sequelize com armazenamento persistente. `data` é DATEONLY
   (YYYY-MM-DD), `peso` é 1..3, `responsaveis` é array de strings.
   Front sempre filtra por range de datas pra economizar payload — o
   quadro mostra uma semana por vez.
   ============================================ */

export async function fetchAtividades({ dataInicio, dataFim, peso } = {}) {
    try {
        const params = new URLSearchParams();
        if (dataInicio) params.set('dataInicio', dataInicio);
        if (dataFim)    params.set('dataFim', dataFim);
        if (peso)       params.set('peso', String(peso));
        const qs = params.toString();
        const response = await api.get(`/atividades${qs ? `?${qs}` : ''}`);
        return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
        console.error('Erro no fetchAtividades:', error);
        throw error;
    }
}

export async function createAtividade(payload) {
    const response = await api.post('/atividades', payload);
    return response.data;
}

export async function updateAtividade(id, payload) {
    const response = await api.put(`/atividades/${id}`, payload);
    return response.data;
}

export async function deleteAtividade(id) {
    const response = await api.delete(`/atividades/${id}`);
    return response.data;
}

/* ============================================
   CLICKUP — Personal API Token (header `Authorization: pk_...`)
   ClickUp permite CORS pra origins web com personal tokens.
   ============================================ */

const CLICKUP_API = 'https://api.clickup.com/api/v2';

function clickupHeaders(token) {
    return {
        'Authorization': token,
        'Accept': 'application/json',
    };
}

async function clickupFetch(path, token) {
    const response = await fetch(`${CLICKUP_API}${path}`, { headers: clickupHeaders(token) });
    if (!response.ok) {
        let detail = '';
        try {
            const body = await response.json();
            detail = body?.err || body?.ECODE || '';
        } catch {
            // ignore
        }
        const err = new Error(`ClickUp HTTP ${response.status}${detail ? ` · ${detail}` : ''}`);
        err.status = response.status;
        throw err;
    }
    return response.json();
}

export async function fetchClickUpUser(token) {
    const data = await clickupFetch('/user', token);
    return data.user;
}

export async function fetchClickUpTeams(token) {
    const data = await clickupFetch('/team', token);
    return data.teams || [];
}

/*
  Tasks de uma lista específica (independente de assignee).
  Usado pelo Radar de Eventos — todo mundo do time vê as mesmas tarefas
  da lista, não só as suas. Paginação simples (page=0) cobre listas com
  até ~100 itens; eventos são poucos por natureza.
*/
export async function fetchClickUpListTasks(token, listId) {
  const params = new URLSearchParams();
  params.set('include_closed', 'false');
  params.set('subtasks', 'false');
  params.set('page', '0');
  const data = await clickupFetch(`/list/${listId}/task?${params.toString()}`, token);
  return data.tasks || [];
}

/*
  Tasks atribuídas ao usuário em uma equipe (workspace).
  include_closed=false ignora tarefas concluídas.
  subtasks=true inclui subtarefas — útil pra deadline tracking.
*/
export async function fetchClickUpTasksForTeam(token, teamId, userId) {
    const params = new URLSearchParams();
    params.set('assignees[]', String(userId));
    params.set('include_closed', 'false');
    params.set('subtasks', 'true');
    params.set('page', '0');
    const data = await clickupFetch(`/team/${teamId}/task?${params.toString()}`, token);
    return data.tasks || [];
}

/*
  Conveniência: pega user + teams + todas as tarefas de todos os workspaces.
  Usado tanto pelo botão "Testar conexão" quanto pelo watcher de notificações.
*/
export async function fetchAllClickUpData(token) {
    const [user, teams] = await Promise.all([
        fetchClickUpUser(token),
        fetchClickUpTeams(token),
    ]);
    const tasksByTeam = await Promise.all(
        teams.map(async (team) => {
            try {
                const tasks = await fetchClickUpTasksForTeam(token, team.id, user.id);
                return tasks.map((t) => ({ ...t, _teamName: team.name }));
            } catch {
                return [];
            }
        }),
    );
    return { user, teams, tasks: tasksByTeam.flat() };
}