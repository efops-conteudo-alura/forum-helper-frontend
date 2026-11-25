import AVATARES_DO_TIME from './avataresDoTime.json';

/*
  Fotos de perfil do time, guardadas no próprio site.

  Por quê: a Alura passou a montar a página de perfil por JavaScript, então a API não
  consegue mais ler a foto dali (devolve só a imagem padrão). Sem este mapa, quem abre o
  site num navegador ou domínio novo (cache vazio) vê iniciais no lugar das fotos.

  Para atualizar: edite avataresDoTime.json (username em minúsculas -> endereço da foto).
  Quem não está no mapa continua vindo da API e do cache do navegador.
*/

const MAPA = new Map(
  Object.entries(AVATARES_DO_TIME).map(([username, url]) => [username.trim().toLowerCase(), url]),
);

/** Foto fixa do usuário, ou null se ele não estiver no mapa. */
export function avatarEstatico(username) {
  if (!username) return null;
  return MAPA.get(username.trim().toLowerCase()) || null;
}

// Imagens que a Alura/API devolvem quando NÃO há foto de verdade.
const PADRAO = /avatar_user|portrait_placeholder|via\.placeholder\.com|ui-avatars\.com|pravatar\.cc/i;

/** True se a URL é uma imagem genérica (não deve ser gravada como foto do usuário). */
export function ehAvatarPadrao(url) {
  return !url || PADRAO.test(url);
}
