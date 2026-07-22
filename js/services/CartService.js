/**
 * CartService — gerencia o carrinho/orçamento do visitante.
 * Persiste em LocalStorage e emite eventos ao mudar.
 */
import { storage } from "../storage/StorageService.js";
import { bus, EVENTOS } from "../core/EventBus.js";
import { precoFinal } from "../utils/format.js";

const CHAVE = "carrinho";

class CartService {
    #itens = [];

    inicializar() {
        this.#itens = storage.get(CHAVE, []);
        this.#notificar();
    }

    get itens() { return [...this.#itens]; }

    get quantidadeTotal() {
        return this.#itens.reduce((acc, it) => acc + it.quantidade, 0);
    }

    get valorTotal() {
        return this.#itens.reduce(
            (acc, it) => acc + precoFinal(it.produto) * it.quantidade,
            0
        );
    }

    obter(produtoId) {
        return this.#itens.find((it) => String(it.produto.id) === String(produtoId));
    }

    adicionar(produto, quantidade = 1) {
        if (!produto?.estoque) return false;
        const existente = this.obter(produto.id);
        if (existente) {
            existente.quantidade += quantidade;
        } else {
            this.#itens.push({ produto, quantidade });
        }
        this.#persistir();
        this.#notificar();
        bus.emit(EVENTOS.TOAST, { tipo: "sucesso", mensagem: `${produto.nome} adicionado ao carrinho.` });
        return true;
    }

    definirQuantidade(produtoId, quantidade) {
        const item = this.obter(produtoId);
        if (!item) return;
        if (quantidade <= 0) return this.remover(produtoId);
        item.quantidade = quantidade;
        this.#persistir();
        this.#notificar();
    }

    remover(produtoId) {
        this.#itens = this.#itens.filter((it) => String(it.produto.id) !== String(produtoId));
        this.#persistir();
        this.#notificar();
    }

    limpar() {
        this.#itens = [];
        this.#persistir();
        this.#notificar();
    }

    #persistir() { storage.set(CHAVE, this.#itens); }
    #notificar() { bus.emit(EVENTOS.CARRINHO_ALTERADO, this.#estado()); }

    #estado() {
        return {
            itens: this.itens,
            quantidadeTotal: this.quantidadeTotal,
            valorTotal: this.valorTotal
        };
    }
}

export const cartService = new CartService();
