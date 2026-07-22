/**
 * ThemeService — Light / Dark / Auto.
 * - Persiste preferência em LocalStorage.
 * - Ao carregar, usa preferência salva; senão, "auto" (segue o sistema).
 */
import { storage } from "../storage/StorageService.js";
import { bus, EVENTOS } from "../core/EventBus.js";

const CHAVE = "tema";
const TEMAS = ["light", "dark", "auto"];

class ThemeService {
    #tema = "auto";

    inicializar() {
        this.#tema = storage.get(CHAVE, "auto");
        this.#aplicar();
    }

    get tema() { return this.#tema; }

    alternar() {
        // Ciclo simples: auto → light → dark → auto
        const proximo = TEMAS[(TEMAS.indexOf(this.#tema) + 1) % TEMAS.length];
        this.definir(proximo);
    }

    definir(tema) {
        if (!TEMAS.includes(tema)) return;
        this.#tema = tema;
        storage.set(CHAVE, tema);
        this.#aplicar();
    }

    #aplicar() {
        document.documentElement.dataset.theme = this.#tema;
        bus.emit(EVENTOS.TEMA_ALTERADO, { tema: this.#tema });
    }
}

export const themeService = new ThemeService();
