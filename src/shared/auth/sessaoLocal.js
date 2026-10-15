/*
  Memória curta do navegador para o fluxo de login (sessionStorage: some ao fechar a aba).

  - rota pretendida: para onde a pessoa queria ir antes de ser mandada ao login. O backend
    sempre devolve o navegador à raiz do site depois do SSO, então sem isso quem abriu
    `/allocation` sem sessão caía em `/topics`.
  - marca de saída: ligada no logout, para a próxima carga da página mostrar "Você saiu"
    em vez de tentar entrar de novo (a Microsoft reconheceria a sessão dela e devolveria
    a pessoa logada em menos de um segundo).

  Tudo em try/catch: em janela anônima ou com armazenamento bloqueado o storage pode lançar,
  e nesse caso o app apenas perde a conveniência.
*/
const CHAVE_ROTA = 'forumHelper.rotaPretendida';
const CHAVE_SAIU = 'forumHelper.saiu';

function ler(chave) {
  try {
    return sessionStorage.getItem(chave);
  } catch {
    return null;
  }
}

function gravar(chave, valor) {
  try {
    sessionStorage.setItem(chave, valor);
  } catch {
    /* armazenamento indisponível: segue sem lembrar */
  }
}

function apagar(chave) {
  try {
    sessionStorage.removeItem(chave);
  } catch {
    /* idem */
  }
}

/** Guarda a rota atual se ela for diferente da raiz (a raiz é para onde o SSO já devolve). */
export function guardarRotaAtual() {
  const rota = window.location.pathname + window.location.search;
  if (rota && rota !== '/') gravar(CHAVE_ROTA, rota);
}

/** Devolve a rota guardada (e a esquece), ou null. */
export function retirarRotaPretendida() {
  const rota = ler(CHAVE_ROTA);
  apagar(CHAVE_ROTA);
  return rota && rota.startsWith('/') && !rota.startsWith('//') ? rota : null;
}

export function marcarSaida() {
  gravar(CHAVE_SAIU, '1');
}

export function temMarcaDeSaida() {
  return ler(CHAVE_SAIU) === '1';
}

export function apagarMarcaDeSaida() {
  apagar(CHAVE_SAIU);
}
