/**
 * ProductCard — renderização de um card de produto.
 * Componente puro: recebe produto + serviços e retorna HTMLElement.
 * Toda interação é delegada via data-attributes (handler global no app.js).
 */
import { criarElemento, escaparHtml } from "../utils/dom.js";
import { formatarPreco, calcularDesconto } from "../utils/format.js";
import { favoritesService } from "../services/FavoritesService.js";

const iconePlaceholder = "bi-image";

function renderBadges(produto) {
    const badges = [];
    if (produto.novo)         badges.push(`<span class="badge badge--novo">Novo</span>`);
    if (produto.promocao)     badges.push(`<span class="badge badge--promocao">Promoção</span>`);
    if (produto.maisVendido)  badges.push(`<span class="badge badge--mais">Mais vendido</span>`);
    if (!produto.estoque)     badges.push(`<span class="badge badge--esgotado">Esgotado</span>`);
    return badges.join("");
}

function renderPreco(produto) {
    const desconto = calcularDesconto(produto.preco, produto.promocao);
    const promocao = produto.promocao != null;

    return `
        <div class="card__precos">
            ${promocao ? `<span class="card__preco-antigo">${formatarPreco(produto.preco)}</span>` : ""}
            <div class="card__preco-linha">
                <span class="card__preco">${formatarPreco(promocao ? produto.promocao : produto.preco)}</span>
                ${desconto > 0 ? `<span class="card__desconto">-${desconto}%</span>` : ""}
            </div>
            ${produto.parcelamento ? `<span class="card__parcelamento">em ${escaparHtml(produto.parcelamento)}</span>` : ""}
        </div>
    `;
}

function renderMidia(produto) {
    const primeiraImagem = produto.imagens?.[0];
    if (!primeiraImagem) {
        return `<div class="card__img-fallback"><i class="bi ${iconePlaceholder}" aria-hidden="true"></i></div>`;
    }
    return `
        <img
            class="card__img"
            src="${escaparHtml(primeiraImagem)}"
            alt="${escaparHtml(produto.nome)}"
            loading="lazy"
            decoding="async"
            onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'card__img-fallback',innerHTML:'<i class=&quot;bi ${iconePlaceholder}&quot;></i>'}))"
        />
    `;
}

export function criarCard(produto) {
    const favorito = favoritesService.tem(produto.id);
    const semEstoque = !produto.estoque;

    const el = criarElemento(`
        <article class="card" data-produto-id="${produto.id}" data-action="abrir-produto" tabindex="0" aria-label="${escaparHtml(produto.nome)}">
            <div class="card__midia">
                <div class="card__badges">${renderBadges(produto)}</div>
                <button
                    type="button"
                    class="card__favoritar ${favorito ? "card__favoritar--ativo" : ""}"
                    data-action="favoritar"
                    data-produto-id="${produto.id}"
                    aria-label="${favorito ? "Remover dos favoritos" : "Adicionar aos favoritos"}"
                    onclick="event.stopPropagation()"
                >
                    <i class="bi ${favorito ? "bi-heart-fill" : "bi-heart"}" aria-hidden="true"></i>
                </button>
                ${renderMidia(produto)}
            </div>
            <div class="card__corpo">
                <span class="card__categoria">${escaparHtml(produto.categoria ?? "")}</span>
                <h3 class="card__nome">${escaparHtml(produto.nome)}</h3>
                <p class="card__descricao">${escaparHtml(produto.descricaoCurta ?? produto.descricao ?? "")}</p>
                ${renderPreco(produto)}
            </div>
            <div class="card__acoes">
                <button
                    type="button"
                    class="card__acao-primaria"
                    data-action="adicionar-carrinho"
                    data-produto-id="${produto.id}"
                    onclick="event.stopPropagation()"
                    ${semEstoque ? "disabled" : ""}
                    aria-label="Adicionar ${escaparHtml(produto.nome)} ao carrinho"
                >
                    <i class="bi bi-bag-plus" aria-hidden="true"></i>
                    ${semEstoque ? "Indisponível" : "Adicionar"}
                </button>
                <button
                    type="button"
                    class="card__acao-secundaria"
                    data-action="abrir-produto"
                    data-produto-id="${produto.id}"
                    onclick="event.stopPropagation()"
                    aria-label="Ver detalhes de ${escaparHtml(produto.nome)}"
                    title="Ver detalhes"
                >
                    <i class="bi bi-eye" aria-hidden="true"></i>
                </button>
            </div>
        </article>
    `);

    return el;
}

/** Cria um skeleton para o mesmo footprint do card. */
export function criarSkeletonCard() {
    return criarElemento(`
        <div class="skeleton-card" aria-hidden="true">
            <div class="skeleton skeleton-card__midia"></div>
            <div class="skeleton skeleton-card__linha"></div>
            <div class="skeleton skeleton-card__linha"></div>
            <div class="skeleton skeleton-card__linha"></div>
            <div class="skeleton skeleton-card__linha"></div>
        </div>
    `);
}
