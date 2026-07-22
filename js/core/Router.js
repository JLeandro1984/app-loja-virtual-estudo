/**
 * Router — roteamento por hash.
 * Suporta rotas: #/, #/produto/:id, #/categoria/:id, #/promocoes, #/favoritos
 * Preparado para migrar para history API depois (basta alterar `hash` → `path`).
 */
import { bus, EVENTOS } from "../core/EventBus.js";

const ROTAS = [
    { padrao: /^\/?$/,                          nome: "home" },
    { padrao: /^\/produto\/(?<id>[\w-]+)\/?$/,  nome: "produto" },
    { padrao: /^\/categoria\/(?<id>[\w-]+)\/?$/, nome: "categoria" },
    { padrao: /^\/promocoes\/?$/,               nome: "promocoes" },
    { padrao: /^\/favoritos\/?$/,               nome: "favoritos" }
];

function resolver() {
    const hash = location.hash.replace(/^#/, "") || "/";
    for (const rota of ROTAS) {
        const match = hash.match(rota.padrao);
        if (match) return { nome: rota.nome, params: match.groups ?? {} };
    }
    return { nome: "home", params: {} };
}

export const router = {
    inicializar() {
        window.addEventListener("hashchange", () => bus.emit(EVENTOS.ROTA_ALTERADA, resolver()));
    },
    atual: resolver,
    navegar(hash) { location.hash = hash; }
};
