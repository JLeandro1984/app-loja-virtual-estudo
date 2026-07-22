/**
 * Toast — sistema de notificações não intrusivas.
 * Escuta EVENTOS.TOAST e exibe.
 */
import { $, criarElemento, escaparHtml } from "../utils/dom.js";
import { bus, EVENTOS } from "../core/EventBus.js";

const ICONES = {
    sucesso: "bi-check-circle-fill",
    erro:    "bi-exclamation-triangle-fill",
    info:    "bi-info-circle-fill",
    alerta:  "bi-exclamation-circle-fill"
};

const DURACAO_PADRAO = 3000;

let container;

function mostrar({ tipo = "info", mensagem = "", duracao = DURACAO_PADRAO }) {
    if (!container) container = $('[data-slot="toasts"]');
    if (!container) return;

    const toast = criarElemento(`
        <div class="toast toast--${tipo}" role="status">
            <i class="bi ${ICONES[tipo] ?? ICONES.info}" aria-hidden="true"></i>
            <span>${escaparHtml(mensagem)}</span>
        </div>
    `);
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("toast--saindo");
        toast.addEventListener("animationend", () => toast.remove(), { once: true });
    }, duracao);
}

export function inicializarToast() {
    container = $('[data-slot="toasts"]');
    bus.on(EVENTOS.TOAST, mostrar);
}
