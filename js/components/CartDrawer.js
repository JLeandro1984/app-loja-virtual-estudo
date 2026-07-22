/**
 * CartDrawer — painel lateral do carrinho.
 * Ouve o EventBus e re-renderiza quando o carrinho muda.
 */
import { $, escaparHtml } from "../utils/dom.js";
import { formatarPreco, precoFinal } from "../utils/format.js";
import { cartService } from "../services/CartService.js";
import { bus, EVENTOS } from "../core/EventBus.js";

let slotItens;
let slotTotal;
let btnEnviar;

function renderItem({ produto, quantidade }) {
    const imagem = produto.imagens?.[0];
    return `
        <div class="card-item" data-produto-id="${produto.id}">
            ${imagem
                ? `<img class="card-item__img" src="${escaparHtml(imagem)}" alt="${escaparHtml(produto.nome)}" loading="lazy" />`
                : `<div class="card-item__img"></div>`}
            <div>
                <p class="card-item__nome">${escaparHtml(produto.nome)}</p>
                <span class="card-item__preco">${formatarPreco(precoFinal(produto) * quantidade)}</span>
                <div class="card-item__quantidade">
                    <button type="button" class="card-item__qtd-btn" data-cart-action="menos" data-id="${produto.id}" aria-label="Diminuir">
                        <i class="bi bi-dash" aria-hidden="true"></i>
                    </button>
                    <span class="card-item__qtd-valor">${quantidade}</span>
                    <button type="button" class="card-item__qtd-btn" data-cart-action="mais" data-id="${produto.id}" aria-label="Aumentar">
                        <i class="bi bi-plus" aria-hidden="true"></i>
                    </button>
                </div>
            </div>
            <button type="button" class="card-item__remover" data-cart-action="remover" data-id="${produto.id}" aria-label="Remover item">
                <i class="bi bi-trash" aria-hidden="true"></i>
            </button>
        </div>
    `;
}

function renderVazio() {
    return `
        <div class="drawer-vazio">
            <i class="bi bi-bag" aria-hidden="true"></i>
            <h3>Seu carrinho está vazio</h3>
            <p>Adicione produtos para gerar seu orçamento.</p>
        </div>
    `;
}

function atualizar(estado) {
    if (!slotItens) return;
    slotItens.innerHTML = estado.itens.length
        ? estado.itens.map(renderItem).join("")
        : renderVazio();

    if (slotTotal) slotTotal.textContent = formatarPreco(estado.valorTotal);
    if (btnEnviar) btnEnviar.disabled = estado.itens.length === 0;
}

export function inicializarCartDrawer() {
    slotItens = $('[data-slot="carrinho-itens"]');
    slotTotal = $('[data-slot="carrinho-total"]');
    btnEnviar = $('[data-action="enviar-whatsapp"]');

    // Delegação de eventos dentro do drawer
    slotItens.addEventListener("click", (e) => {
        const alvo = e.target.closest("[data-cart-action]");
        if (!alvo) return;
        const id = alvo.dataset.id;
        const item = cartService.obter(id);
        if (!item) return;

        switch (alvo.dataset.cartAction) {
            case "mais":    cartService.definirQuantidade(id, item.quantidade + 1); break;
            case "menos":   cartService.definirQuantidade(id, item.quantidade - 1); break;
            case "remover": cartService.remover(id); break;
        }
    });

    bus.on(EVENTOS.CARRINHO_ALTERADO, atualizar);
    atualizar({ itens: cartService.itens, valorTotal: cartService.valorTotal });
}
