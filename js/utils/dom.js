/**
 * Helpers de manipulação de DOM.
 * Objetivo: centralizar padrões repetitivos com API limpa.
 */

/** querySelector com escopo opcional. */
export const $ = (seletor, escopo = document) => escopo.querySelector(seletor);

/** querySelectorAll retornando array. */
export const $$ = (seletor, escopo = document) => Array.from(escopo.querySelectorAll(seletor));

/**
 * Cria elemento DOM a partir de string HTML segura (interpolação já resolvida).
 * Aceita uma única raiz.
 */
export const criarElemento = (htmlString) => {
    const template = document.createElement("template");
    template.innerHTML = htmlString.trim();
    return template.content.firstElementChild;
};

/** Escapa HTML — proteção contra XSS ao renderizar dados. */
export const escaparHtml = (str = "") =>
    String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

/** Delegação de eventos: um listener no pai reage a filhos que casam com o seletor. */
export const delegar = (raiz, evento, seletor, handler) => {
    raiz.addEventListener(evento, (e) => {
        const alvo = e.target.closest(seletor);
        if (alvo && raiz.contains(alvo)) handler(e, alvo);
    });
};
