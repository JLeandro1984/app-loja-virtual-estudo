/**
 * ProductService — orquestra dados de produtos, categorias e marcas
 * e expõe operações de busca/filtro/ordenação.
 *
 * SRP: aqui não há DOM. Apenas dados.
 */
import { DataLoader } from "./DataLoader.js";
import { normalizar, precoFinal, calcularDesconto } from "../utils/format.js";

class ProductService {
    #produtos = [];
    #categorias = [];
    #marcas = [];

    async carregar() {
        const [produtos, categorias, marcas] = await Promise.all([
            DataLoader.produtos(),
            DataLoader.categorias(),
            DataLoader.marcas()
        ]);
        this.#produtos = produtos;
        this.#categorias = categorias;
        this.#marcas = marcas;
    }

    get todos()      { return [...this.#produtos]; }
    get categorias() { return [...this.#categorias]; }
    get marcas()     { return [...this.#marcas]; }

    obterPorId(id) {
        return this.#produtos.find((p) => String(p.id) === String(id)) ?? null;
    }

    // ---------------- Filtragem / Busca / Ordenação ----------------
    aplicar({ busca = "", filtros = {}, ordenacao = "destaque" } = {}) {
        let lista = [...this.#produtos];

        if (busca) {
            const termo = normalizar(busca);
            lista = lista.filter((p) =>
                normalizar(p.nome).includes(termo) ||
                normalizar(p.descricao ?? "").includes(termo) ||
                normalizar(p.categoria).includes(termo) ||
                normalizar(p.marca ?? "").includes(termo) ||
                (p.tags ?? []).some((t) => normalizar(t).includes(termo))
            );
        }

        if (filtros.categorias?.length) {
            lista = lista.filter((p) => filtros.categorias.includes(p.categoria));
        }
        if (filtros.marcas?.length) {
            lista = lista.filter((p) => filtros.marcas.includes(p.marca));
        }
        if (filtros.somentePromocao) {
            lista = lista.filter((p) => p.promocao != null);
        }
        if (filtros.somenteNovos) {
            lista = lista.filter((p) => p.novo);
        }
        if (filtros.somenteMaisVendidos) {
            lista = lista.filter((p) => p.maisVendido);
        }
        if (filtros.somenteDisponiveis) {
            lista = lista.filter((p) => p.estoque);
        }
        if (typeof filtros.precoMin === "number") {
            lista = lista.filter((p) => precoFinal(p) >= filtros.precoMin);
        }
        if (typeof filtros.precoMax === "number") {
            lista = lista.filter((p) => precoFinal(p) <= filtros.precoMax);
        }

        // Ordenação
        const comparadores = {
            "destaque":       (a, b) => (b.destaque === true) - (a.destaque === true),
            "menor-preco":    (a, b) => precoFinal(a) - precoFinal(b),
            "maior-preco":    (a, b) => precoFinal(b) - precoFinal(a),
            "maior-desconto": (a, b) => calcularDesconto(b.preco, b.promocao) - calcularDesconto(a.preco, a.promocao),
            "nome-asc":       (a, b) => a.nome.localeCompare(b.nome, "pt-BR"),
            "mais-recentes":  (a, b) => (b.novo === true) - (a.novo === true),
            "mais-vendidos":  (a, b) => (b.maisVendido === true) - (a.maisVendido === true)
        };
        lista.sort(comparadores[ordenacao] ?? comparadores["destaque"]);
        return lista;
    }

    destaques(limite = 8) {
        return this.#produtos.filter((p) => p.destaque).slice(0, limite);
    }

    promocoes(limite = 8) {
        return this.#produtos
            .filter((p) => p.promocao != null)
            .sort((a, b) => calcularDesconto(b.preco, b.promocao) - calcularDesconto(a.preco, a.promocao))
            .slice(0, limite);
    }

    intervaloPrecos() {
        if (!this.#produtos.length) return { min: 0, max: 0 };
        const valores = this.#produtos.map(precoFinal);
        return { min: Math.floor(Math.min(...valores)), max: Math.ceil(Math.max(...valores)) };
    }
}

export const productService = new ProductService();
