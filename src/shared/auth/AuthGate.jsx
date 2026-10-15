import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  SSO_ENABLED,
  fetchCurrentUser,
  iniciarLogin,
  logout as logoutRequest,
} from '../../api/apiService';
import {
  apagarMarcaDeSaida,
  marcarSaida,
  retirarRotaPretendida,
  temMarcaDeSaida,
} from './sessaoLocal';
import '../../styles/auth.css';

/*
  Portão de login (SSO Microsoft).

  - SSO desligado: não faz nada, só renderiza o app (comportamento anterior).
  - SSO ligado: pergunta à API quem está logado (`GET /auth/me`).
      · com sessão        → renderiza o app (voltando à rota guardada antes do login, se houver);
      · sem sessão (401)  → tela de entrada com o botão "Entrar com Microsoft". Nada de
                            redirecionar sozinho: a pessoa precisa ver que está entrando;
      · acabou de sair    → tela "Você saiu". O botão pede à Microsoft a escolha de conta,
                            senão ela reaproveita a sessão dela e devolve a pessoa logada;
      · `?sso_erro=...`   → a API recusou o login; mostra o motivo em vez de redirecionar de novo
                            (senão o usuário ficaria preso num loop de login).
  Os filhos só montam depois de autenticado, então nenhuma chamada à API acontece sem sessão.
  Sessão que expira no meio do uso: o interceptor do apiService manda direto ao login (sem
  passar por esta tela), guardando a rota para voltar ao mesmo lugar.
*/

const MENSAGENS_DE_ERRO = {
  dominio_nao_permitido: 'Esta conta Microsoft não pertence a um domínio autorizado. Entre com seu e-mail @alura.com.br.',
  tenant_invalido: 'Esta conta não pertence à organização autorizada.',
  identidade_invalida: 'Não foi possível identificar sua conta Microsoft.',
  falha_no_login: 'Não foi possível concluir o login com a Microsoft. Tente novamente.',
};

const AuthContext = createContext({ user: null, logout: () => {} });

export function useAuth() {
  return useContext(AuthContext);
}

function lerErroDoSso() {
  const codigo = new URLSearchParams(window.location.search).get('sso_erro');
  if (!codigo) return null;
  return MENSAGENS_DE_ERRO[codigo] || MENSAGENS_DE_ERRO.falha_no_login;
}

function estadoInicial() {
  if (lerErroDoSso()) return 'erro-sso';
  if (temMarcaDeSaida()) return 'saiu';
  return 'carregando';
}

/* Depois do SSO o backend devolve sempre à raiz; se havia uma rota guardada, volta para ela
   antes de montar o roteador (o BrowserRouter lê a URL ao montar). */
function restaurarRotaPretendida() {
  const rota = retirarRotaPretendida();
  if (!rota) return;
  const atual = window.location.pathname + window.location.search;
  if (rota !== atual) window.history.replaceState(null, '', rota);
}

function Tela({ titulo, texto, acao, ocupado }) {
  return (
    <div className="auth-screen" role={ocupado ? 'status' : undefined}>
      <div className="auth-screen__card">
        <h1 className="auth-screen__title">{titulo}</h1>
        {texto ? <p className="auth-screen__text">{texto}</p> : null}
        {acao}
      </div>
    </div>
  );
}

function BotaoEntrar({ escolherConta = false }) {
  return (
    <button
      type="button"
      className="auth-screen__button"
      onClick={() => iniciarLogin({ escolherConta })}
    >
      Entrar com Microsoft
    </button>
  );
}

export default function AuthGate({ children }) {
  const [estado, setEstado] = useState(estadoInicial);
  const [user, setUser] = useState(null);
  const [mensagemErro, setMensagemErro] = useState(() => lerErroDoSso());

  const verificarSessao = useCallback(async () => {
    setEstado('carregando');
    try {
      const atual = await fetchCurrentUser();
      if (atual) {
        restaurarRotaPretendida();
        setUser(atual);
        setEstado('autenticado');
      } else {
        setEstado('login');
      }
    } catch (error) {
      console.error('Erro ao verificar a sessão:', error);
      setMensagemErro('Não foi possível falar com o servidor. Verifique sua conexão e tente novamente.');
      setEstado('erro-rede');
    }
  }, []);

  useEffect(() => {
    if (!SSO_ENABLED) return;
    // A marca de saída vale para uma carga da página só: a próxima volta a verificar a sessão.
    apagarMarcaDeSaida();
    // Voltou do login com erro, ou acabou de sair: fica na tela; só tenta quando o usuário pedir.
    if (estado === 'erro-sso' || estado === 'saiu') return;
    verificarSessao();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = useCallback(async () => {
    await logoutRequest();
    marcarSaida();
    // Recarga completa: zera todo o estado do app (polling, caches em memória, contexto).
    window.location.replace('/');
  }, []);

  const valor = useMemo(() => ({ user, logout }), [user, logout]);

  if (!SSO_ENABLED) return children;

  if (estado === 'autenticado') {
    return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
  }

  if (estado === 'login') {
    return (
      <Tela
        titulo="Forum Helper"
        texto="Painel do Suporte Educacional da Alura. Entre com a sua conta Microsoft da Alura para continuar."
        acao={<BotaoEntrar />}
      />
    );
  }

  if (estado === 'saiu') {
    return (
      <Tela
        titulo="Você saiu"
        texto="Sua sessão no Forum Helper foi encerrada. Para entrar de novo, escolha a conta Microsoft."
        acao={<BotaoEntrar escolherConta />}
      />
    );
  }

  if (estado === 'erro-sso') {
    return (
      <Tela
        titulo="Não foi possível entrar"
        texto={mensagemErro}
        acao={<BotaoEntrar escolherConta />}
      />
    );
  }

  if (estado === 'erro-rede') {
    return (
      <Tela
        titulo="Servidor indisponível"
        texto={mensagemErro}
        acao={(
          <button type="button" className="auth-screen__button" onClick={verificarSessao}>
            Tentar novamente
          </button>
        )}
      />
    );
  }

  return <Tela titulo="Verificando sua sessão…" ocupado />;
}
