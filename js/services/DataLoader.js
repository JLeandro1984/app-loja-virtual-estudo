/**
 * DataLoader — única porta de entrada de dados na aplicação.
 *
 * Hoje: JSON estático em /data.
 * Amanhã: apenas altere BASE_URL para uma API REST e
 * (opcionalmente) o método `carregar` para adicionar headers/auth.
 * Nenhum outro módulo precisa mudar.
 */

const BASE_URL = "data/";
const EXTENSAO = ".json";

/** Cache em memória para evitar re-fetch dentro da mesma sessão. */
const cache = new Map();

async function carregar(recurso) {
    if (cache.has(recurso)) return cache.get(recurso);

    const url = `${BASE_URL}${recurso}${EXTENSAO}`;
    const resposta = await fetch(url, { headers: { Accept: "application/json" } });

    if (!resposta.ok) {
        throw new Error(`Falha ao carregar "${recurso}" — HTTP ${resposta.status}`);
    }

    const dados = await resposta.json();
    cache.set(recurso, dados);
    return dados;
}

export const DataLoader = {
    config:     () => carregar("config"),
    produtos:   () => carregar("produtos"),
    categorias: () => carregar("categorias"),
    marcas:     () => carregar("marcas"),
    banners:    () => carregar("banners"),
    /** Limpa cache — útil para hot-reload manual ou logout futuro. */
    invalidar: (recurso) => (recurso ? cache.delete(recurso) : cache.clear())
};
