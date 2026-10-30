# Forum Helper (frontend)

Painel interno do Suporte Educacional da Alura. Mostra os tópicos sem resposta do fórum, quem pegou cada um, a produtividade do time e ferramentas de apoio (mural, catálogo, alocação). A API fica em outro repositório (`forum-helper-backend`).

## Stack

React 19, Vite 8, React Router 7, axios, Chart.js, Firebase (só Firestore), marked e dnd-kit. O código é JavaScript (`.jsx`) com um único arquivo TypeScript (`src/main.tsx`). O `tsc` roda no build, mas com `checkJs: false`, então não verifica os `.jsx`.

## Estrutura

```
src/App.jsx                 rotas e configurações do usuário (localStorage)
src/api/apiService.js       todas as chamadas: backend, planilha Google, ClickUp
src/features/
  topics/                   lista de tópicos BR/LATAM, claim, fila de resgate (IA), foco
  dashboard/                gráficos de produtividade (helpers.js tem o roster do time)
  mural/                    mural de avisos no Firestore (coleção mural_cards)
  catalog/                  busca no catálogo da Alura, com Gemini opcional
  allocation/               painel de alocação (CRUD de atividades no backend)
  pdi/                      PDI pessoal, salvo só no localStorage
  events/, status/, notifications-preview/
src/shared/                 Header, Sidebar, SettingsModal, notificações, avatares
src/shared/auth/            AuthGate (portão do SSO) e sessaoLocal (rota pretendida, marca de saída)
public/data/catalogo.json   dump do catálogo (cerca de 12 mil itens, 5 MB)
BACKEND_BI_INTEGRATION.md   contrato do endpoint /api/bi-topics
```

Rotas: `/topics`, `/dashboard`, `/mural`, `/catalog`, `/status`, `/allocation`, `/notifications-preview`, `/pdi`.

## Como rodar

```bash
npm install
npm run dev       # Vite em http://localhost:5173
npm run build     # tsc && vite build
```

Para usar a API Java local com SSO, criar `.env.local` com `VITE_SSO_ENABLED=true`: o Vite faz proxy de `/forum-api` (vira `/api` na API) e de `/auth` para `localhost:8080`. Sem SSO, `VITE_API_BASE_URL=http://localhost:8080/api`. Sem nenhuma variável o app chama o backend Node antigo em produção, inclusive em desenvolvimento.

Produção: site estático na Vercel com `VITE_SSO_ENABLED=true`. O `vercel.json` repassa `/auth/*` e `/forum-api/*` para a API Java na DigitalOcean (mesmo domínio, para o cookie de sessão ser first-party) e manda o resto para `index.html`. Não há testes, ESLint nem CI.

## Variáveis de ambiente

| Variável | Uso |
|---|---|
| `VITE_SSO_ENABLED` | `true` liga o login Microsoft e o uso da API Java pelo proxy (`/forum-api`) |
| `VITE_API_BASE_URL` | base da API. Opcional, o padrão está fixo em `src/api/apiService.js` |
| `VITE_FIREBASE_API_KEY` | chave web do Firebase do mural (`src/features/mural/firebase.js`) |

Tudo que começa com `VITE_` vai embutido no JavaScript entregue ao navegador. Não serve para guardar segredo.

## Integrações

- **Backend Forum Helper (API Java, SSO Microsoft):** tópicos, claims, estatísticas, fila de resgate e atividades. Desde o PR 1 (merge em 15/10/2026) o app usa o cookie de sessão `FORUM_SESSION` pelo proxy do mesmo domínio; o `AuthGate` só monta o app depois de `GET /forum-api/auth/me` responder 200, e o interceptor do `apiService.js` manda ao login em qualquer 401.
- **Firestore (projeto forum-helper-mural):** coleção `mural_cards`.
- **Planilha Google:** foco diário, avisos e alocação, lida pelo endpoint público `gviz` (o ID está em `apiService.js`, `Sidebar.jsx` e `StatusPanel.jsx`).
- **ClickUp:** cada pessoa cola o próprio token pessoal nas Configurações. O navegador chama a API do ClickUp direto.
- **Google Gemini:** busca do catálogo (`features/catalog/ai.js`), com a chave pessoal de cada usuário, direto do navegador.
- **BI de progresso do PDI:** `/api/bi-progress` depende de um servidor em `localhost:3001` que não está neste repositório. Em produção a seção se esconde.
