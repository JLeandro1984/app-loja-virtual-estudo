/**
 * EventBus — Publish/Subscribe simples.
 *
 * Justificativa arquitetural:
 *  - Desacopla módulos: um componente emite um evento e outros reagem
 *    sem conhecer sua existência.
 *  - Facilita testes (basta emitir eventos).
 *  - Substitui a necessidade de importar serviços entre componentes,
 *    evitando ciclos de dependência.
 */
export class EventBus {
    #ouvintes = new Map();

    on(evento, callback) {
        if (!this.#ouvintes.has(evento)) this.#ouvintes.set(evento, new Set());
        this.#ouvintes.get(evento).add(callback);
        return () => this.off(evento, callback);
    }

    off(evento, callback) {
        this.#ouvintes.get(evento)?.delete(callback);
    }

    emit(evento, payload) {
        this.#ouvintes.get(evento)?.forEach((cb) => {
            try { cb(payload); }
            catch (erro) { console.error(`[EventBus] erro em "${evento}":`, erro); }
        });
    }
}

/** Instância singleton compartilhada por toda a aplicação. */
export const bus = new EventBus();

/** Constantes de eventos — evita magic strings espalhadas. */
export const EVENTOS = Object.freeze({
    CARRINHO_ALTERADO:   "carrinho:alterado",
    FAVORITOS_ALTERADO:  "favoritos:alterado",
    TEMA_ALTERADO:       "tema:alterado",
    BUSCA_ALTERADA:      "busca:alterada",
    FILTROS_ALTERADOS:   "filtros:alterados",
    ORDENACAO_ALTERADA:  "ordenacao:alterada",
    ROTA_ALTERADA:       "rota:alterada",
    PRODUTO_ABRIR:       "produto:abrir",
    TOAST:               "toast:mostrar",
    ABRIR_DRAWER:        "drawer:abrir",
    FECHAR_DRAWER:       "drawer:fechar"
});
