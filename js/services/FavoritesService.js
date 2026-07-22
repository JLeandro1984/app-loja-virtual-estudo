/**
 * FavoritesService — gerencia a lista de favoritos.
 */
import { storage } from "../storage/StorageService.js";
import { bus, EVENTOS } from "../core/EventBus.js";

const CHAVE = "favoritos";

class FavoritesService {
    #ids = new Set();

    inicializar() {
        this.#ids = new Set(storage.get(CHAVE, []));
        this.#notificar();
    }

    get ids() { return [...this.#ids]; }
    get quantidade() { return this.#ids.size; }

    tem(id) { return this.#ids.has(String(id)); }

    alternar(id) {
        const chave = String(id);
        if (this.#ids.has(chave)) this.#ids.delete(chave);
        else this.#ids.add(chave);
        this.#persistir();
        this.#notificar();
        return this.tem(chave);
    }

    #persistir() { storage.set(CHAVE, [...this.#ids]); }
    #notificar() {
        bus.emit(EVENTOS.FAVORITOS_ALTERADO, { ids: this.ids, quantidade: this.quantidade });
    }
}

export const favoritesService = new FavoritesService();
