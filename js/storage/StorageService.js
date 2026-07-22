/**
 * StorageService — abstração sobre LocalStorage.
 *
 * Justificativa: quando migrarmos para backend, basta trocar
 * a implementação para chamar uma API sem tocar em quem usa.
 */

const PREFIXO = "catalogo-premium:";

export class StorageService {
    #storage;

    constructor(storage = window.localStorage) {
        this.#storage = storage;
    }

    get(chave, valorPadrao = null) {
        try {
            const raw = this.#storage.getItem(PREFIXO + chave);
            return raw == null ? valorPadrao : JSON.parse(raw);
        } catch (erro) {
            console.warn(`[Storage] falha ao ler "${chave}":`, erro);
            return valorPadrao;
        }
    }

    set(chave, valor) {
        try {
            this.#storage.setItem(PREFIXO + chave, JSON.stringify(valor));
            return true;
        } catch (erro) {
            console.warn(`[Storage] falha ao gravar "${chave}":`, erro);
            return false;
        }
    }

    remove(chave) {
        this.#storage.removeItem(PREFIXO + chave);
    }
}

export const storage = new StorageService();
