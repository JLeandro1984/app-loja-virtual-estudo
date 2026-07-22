/**
 * ProductModal — detalhes do produto em <dialog> nativo.
 * Renderiza HTML no slot; galeria, quantidade e compartilhar são internos.
 */
import { $, escaparHtml } from "../utils/dom.js";
import { formatarPreco, calcularDesconto, precoFinal } from "../utils/format.js";
import { cartService } from "../services/CartService.js";
import { shareService } from "../services/ShareService.js";
import { favoritesService } from "../services/FavoritesService.js";

let modalEl;
let slotEl;
let produtoAtual;
let quantidade = 1;
let indiceGaleria = 0;

function inicializar() {
    if (modalEl) return;
    modalEl = $('[data-modal="produto"]');
    slotEl  = $('[data-slot="modal-produto"]');
    modalEl.addEventListener("click", aoClicar);
    modalEl.addEventListener("close", limpar);
}

function limpar() { indiceGaleria = 0; quantidade = 1; produtoAtual = null; }

function aoClicar(e) {
    const alvo = e.target.closest("[data-modal-action]");
    if (!alvo) return;
    const acao = alvo.dataset.modalAction;

    switch (acao) {
        case "fechar":    modalEl.close(); break;
        case "qtd-mais":  quantidade++; atualizarQtd(); break;
        case "qtd-menos": quantidade = Math.max(1, quantidade - 1); atualizarQtd(); break;
        case "trocar-imagem":
            indiceGaleria = Number(alvo.dataset.index);
            atualizarGaleria();
            break;
        case "adicionar":
            if (produtoAtual) {
                cartService.adicionar(produtoAtual, quantidade);
                modalEl.close();
            }
            break;
        case "favoritar":
            if (produtoAtual) favoritesService.alternar(produtoAtual.id);
            renderizar(produtoAtual);
            break;
        case "compartilhar-web":  shareService.webShare(produtoAtual); break;
        case "compartilhar-wpp":  shareService.whatsapp(produtoAtual); break;
        case "compartilhar-fb":   shareService.facebook(produtoAtual); break;
        case "compartilhar-link": shareService.copiarLink(produtoAtual); break;
    }
}

function atualizarQtd() {
    const el = $(".modal__qtd-valor", modalEl);
    if (el) el.textContent = quantidade;
}

function atualizarGaleria() {
    const imgPrincipal = $(".modal__imagem-principal", modalEl);
    if (imgPrincipal && produtoAtual?.imagens) {
        imgPrincipal.src = produtoAtual.imagens[indiceGaleria] ?? "";
    }
    modalEl.querySelectorAll(".modal__miniatura").forEach((el, i) => {
        el.classList.toggle("modal__miniatura--ativa", i === indiceGaleria);
    });
}

function renderizar(produto) {
    produtoAtual = produto;
    const desconto = calcularDesconto(produto.preco, produto.promocao);
    const promocao = produto.promocao != null;
    const favorito = favoritesService.tem(produto.id);
    const semEstoque = !produto.estoque;

    const galeria = produto.imagens?.length
        ? `
            <img class="modal__imagem-principal" src="${escaparHtml(produto.imagens[indiceGaleria] ?? produto.imagens[0])}" alt="${escaparHtml(produto.nome)}" />
            ${produto.imagens.length > 1 ? `
                <div class="modal__miniaturas">
                    ${produto.imagens.map((src, i) => `
                        <img
                            class="modal__miniatura ${i === indiceGaleria ? "modal__miniatura--ativa" : ""}"
                            src="${escaparHtml(src)}"
                            alt=""
                            data-modal-action="trocar-imagem"
                            data-index="${i}"
                        />
                    `).join("")}
                </div>
            ` : ""}
        `
        : `<div class="card__img-fallback"><i class="bi bi-image" aria-hidden="true"></i></div>`;

    slotEl.innerHTML = `
        <button type="button" class="modal__fechar" data-modal-action="fechar" aria-label="Fechar">
            <i class="bi bi-x-lg" aria-hidden="true"></i>
        </button>
        <div class="modal__galeria">${galeria}</div>
        <div class="modal__info">
            <div>
                <span class="modal__categoria">${escaparHtml(produto.categoria ?? "")}</span>
                <h2 class="modal__nome" id="modal-produto-titulo">${escaparHtml(produto.nome)}</h2>
            </div>
            <p class="modal__descricao">${escaparHtml(produto.descricao ?? produto.descricaoCurta ?? "")}</p>

            ${produto.caracteristicas?.length ? `
                <ul class="modal__caracteristicas">
                    ${produto.caracteristicas.map((c) => `<li>${escaparHtml(c)}</li>`).join("")}
                </ul>
            ` : ""}

            <div class="modal__precos">
                ${promocao ? `<span class="modal__preco-antigo">De ${formatarPreco(produto.preco)}</span>` : ""}
                <span class="modal__preco">${formatarPreco(precoFinal(produto))}
                    ${desconto > 0 ? `<span class="card__desconto" style="font-size:.9rem;vertical-align:middle;margin-left:.5rem;">-${desconto}%</span>` : ""}
                </span>
                ${produto.parcelamento ? `<span class="modal__parcelamento">em ${escaparHtml(produto.parcelamento)}</span>` : ""}
            </div>

            <div class="modal__quantidade" ${semEstoque ? "hidden" : ""}>
                <button type="button" class="modal__qtd-btn" data-modal-action="qtd-menos" aria-label="Diminuir quantidade">
                    <i class="bi bi-dash" aria-hidden="true"></i>
                </button>
                <span class="modal__qtd-valor">${quantidade}</span>
                <button type="button" class="modal__qtd-btn" data-modal-action="qtd-mais" aria-label="Aumentar quantidade">
                    <i class="bi bi-plus" aria-hidden="true"></i>
                </button>
            </div>

            <div class="modal__acoes">
                <button type="button" class="btn btn--primary" data-modal-action="adicionar" ${semEstoque ? "disabled" : ""}>
                    <i class="bi bi-bag-plus" aria-hidden="true"></i>
                    ${semEstoque ? "Indisponível" : "Adicionar ao carrinho"}
                </button>
                <button type="button" class="btn btn--outline" data-modal-action="favoritar" aria-label="${favorito ? "Remover dos favoritos" : "Favoritar"}">
                    <i class="bi ${favorito ? "bi-heart-fill" : "bi-heart"}" aria-hidden="true"></i>
                    ${favorito ? "Favorito" : "Favoritar"}
                </button>
            </div>

            <div class="modal__compartilhar">
                <span>Compartilhar</span>
                ${"share" in navigator ? `<button class="modal__share-btn" data-modal-action="compartilhar-web" title="Compartilhar" aria-label="Compartilhar"><i class="bi bi-share" aria-hidden="true"></i></button>` : ""}
                <button class="modal__share-btn" data-modal-action="compartilhar-wpp" title="WhatsApp" aria-label="WhatsApp"><i class="bi bi-whatsapp"></i></button>
                <button class="modal__share-btn" data-modal-action="compartilhar-fb" title="Facebook" aria-label="Facebook"><i class="bi bi-facebook"></i></button>
                <button class="modal__share-btn" data-modal-action="compartilhar-link" title="Copiar link" aria-label="Copiar link"><i class="bi bi-link-45deg"></i></button>
            </div>
        </div>
    `;
}

export const productModal = {
    abrir(produto) {
        inicializar();
        quantidade = 1;
        indiceGaleria = 0;
        renderizar(produto);
        if (!modalEl.open) modalEl.showModal();
    },
    fechar() {
        modalEl?.close();
    }
};
