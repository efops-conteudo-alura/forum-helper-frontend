import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  SSO_ENABLED,
  SSO_LOGIN_PATH,
  fetchCurrentUser,
  iniciarLogin,
  logout as logoutRequest,
} from '../../api/apiService';
import '../../styles/auth.css';

/*
  Portão de login (SSO Microsoft).

  - SSO desligado: não faz nada, só renderiza o app (comportamento anterior).
  - SSO ligado: pergunta à API quem está logado (`GET /auth/me`).
      · sem sessão (401)  → navegação completa para /auth/microsoft (a API leva à Microsoft);
      · com sessão        → renderiza o app;
      · `?sso_erro=...`   → a API recusou o login; mostra o motivo em vez de redirecionar de novo
                            (senão o usuário ficaria preso num loop de login).
  Os filhos só montam depois de autenticado, então nenhuma chamada à API acontece sem sessão.
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

function Tela({ titulo, texto, acao }) {
  return (
    <div className="auth-screen" role="status">
      <div className="auth-screen__card">
        <h1 className="auth-screen__title">{titulo}</h1>
        {texto ? <p className="auth-screen__text">{texto}</p> : null}
        {acao}
      </div>
    </div>
  );
}

export default function AuthGate({ children }) {
  const [estado, setEstado] = useState(() => (lerErroDoSso() ? 'erro-sso' : 'carregando'));
  const [user, setUser] = useState(null);
  const [mensagemErro, setMensagemErro] = useState(() => lerErroDoSso());

  const verificarSessao = useCallback(async () => {
    setEstado('carregando');
    try {
      const atual = await fetchCurrentUser();
      if (atual) {
        setUser(atual);
        setEstado('autenticado');
      } else {
        setEstado('redirecionando');
        iniciarLogin();
      }
    } catch (error) {
      console.error('Erro ao verificar a sessão:', error);
      setMensagemErro('Não foi possível falar com o servidor. Verifique sua conexão e tente novamente.');
      setEstado('erro-rede');
    }
  }, []);

  useEffect(() => {
    if (!SSO_ENABLED) return;
    // Voltou do login com erro: mostra o motivo; só tenta de novo quando o usuário pedir.
    if (estado === 'erro-sso') return;
    verificarSessao();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = useCallback(async () => {
    await logoutRequest();
    window.location.assign('/');
  }, []);

  const valor = useMemo(() => ({ user, logout }), [user, logout]);

  if (!SSO_ENABLED) return children;

  if (estado === 'autenticado') {
    return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
  }

  if (estado === 'erro-sso') {
    return (
      <Tela
        titulo="Não foi possível entrar"
        texto={mensagemErro}
        acao={(
          <a className="auth-screen__button" href={SSO_LOGIN_PATH}>
            Entrar com Microsoft
          </a>
        )}
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

  return (
    <Tela
      titulo={estado === 'redirecionando' ? 'Redirecionando para o login…' : 'Verificando sua sessão…'}
    />
  );
}
