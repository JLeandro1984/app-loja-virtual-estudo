/**
 * ConfigService — configurações centralizadas da loja.
 * Fonte única para dados institucionais e comportamento.
 */
import { DataLoader } from "./DataLoader.js";

class ConfigService {
    #config = null;

    async carregar() {
        this.#config = await DataLoader.config();
        return this.#config;
    }

    get todo() { return this.#config; }

    /** Acesso por path (ex.: "loja.nome"). */
    obter(path, fallback = "") {
        if (!this.#config) return fallback;
        return path.split(".").reduce(
            (obj, chave) => (obj != null ? obj[chave] : undefined),
            this.#config
        ) ?? fallback;
    }
}

export const configService = new ConfigService();
