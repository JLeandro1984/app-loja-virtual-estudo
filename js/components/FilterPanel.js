/**
 * FilterPanel — painel de filtros dentro do drawer da esquerda.
 * Constrói dinamicamente a partir dos dados do ProductService.
 */
import { $, escaparHtml } from "../utils/dom.js";
import { productService } from "../services/ProductService.js";
import { bus, EVENTOS } from "../core/EventBus.js";
import { formatarPreco } from "../utils/format.js";

const estado = {
    categorias: new Set(),
    marcas: new Set(),
    somentePromocao: false,
    somenteNovos: false,
    somenteMaisVendidos: false,
    somenteDisponiveis: false,
    precoMin: null,
    precoMax: null
};

function emitir() {
    bus.emit(EVENTOS.FILTROS_ALTERADOS, {
        categorias: [...estado.categorias],
        marcas: [...estado.marcas],
        somentePromocao: estado.somentePromocao,
        somenteNovos: estado.somenteNovos,
        somenteMaisVendidos: estado.somenteMaisVendidos,
        somenteDisponiveis: estado.somenteDisponiveis,
        precoMin: estado.precoMin,
        precoMax: estado.precoMax
    });
}

function renderCheckbox(nome, valor, label, tipo) {
    return `
        <label class="filtro-item">
            <input type="checkbox" data-filtro="${tipo}" value="${escaparHtml(valor)}" />
            <span>${escaparHtml(label)}</span>
        </label>
    `;
}

function renderToggle(chave, label) {
    return `
        <label class="filtro-item">
            <input type="checkbox" data-toggle="${chave}" />
            <span>${escaparHtml(label)}</span>
        </label>
    `;
}

export function inicializarFilterPanel() {
    const slot = $('[data-slot="filtros"]');
    if (!slot) return;

    const { min, max } = productService.intervaloPrecos();

    slot.innerHTML = `
        <div class="filtro-grupo">
            <span class="filtro-grupo__titulo">Categorias</span>
            <div class="filtro-lista">
                ${productService.categorias.map((c) => renderCheckbox("categoria", c.id, c.nome, "categoria")).join("")}
            </div>
        </div>
        <div class="filtro-grupo">
            <span class="filtro-grupo__titulo">Marcas</span>
            <div class="filtro-lista">
                ${productService.marcas.map((m) => renderCheckbox("marca", m.id, m.nome, "marca")).join("")}
            </div>
        </div>
        <div class="filtro-grupo">
            <span class="filtro-grupo__titulo">Especiais</span>
            <div class="filtro-lista">
                ${renderToggle("somentePromocao", "Somente promoções")}
                ${renderToggle("somenteNovos", "Novidades")}
                ${renderToggle("somenteMaisVendidos", "Mais vendidos")}
                ${renderToggle("somenteDisponiveis", "Somente disponíveis")}
            </div>
        </div>
        <div class="filtro-grupo">
            <span class="filtro-grupo__titulo">Faixa de preço (${formatarPreco(min)} — ${formatarPreco(max)})</span>
            <div class="filtro-preco">
                <input type="number" min="${min}" max="${max}" placeholder="Mín" data-preco="min" />
                <input type="number" min="${min}" max="${max}" placeholder="Máx" data-preco="max" />
            </div>
        </div>
    `;

    slot.addEventListener("change", (e) => {
        const alvo = e.target;
        if (alvo.dataset.filtro === "categoria") {
            alvo.checked ? estado.categorias.add(alvo.value) : estado.categorias.delete(alvo.value);
        } else if (alvo.dataset.filtro === "marca") {
            alvo.checked ? estado.marcas.add(alvo.value) : estado.marcas.delete(alvo.value);
        } else if (alvo.dataset.toggle) {
            estado[alvo.dataset.toggle] = alvo.checked;
        } else if (alvo.dataset.preco === "min") {
            estado.precoMin = alvo.value ? Number(alvo.value) : null;
        } else if (alvo.dataset.preco === "max") {
            estado.precoMax = alvo.value ? Number(alvo.value) : null;
        }
        emitir();
    });
}

export function limparFiltros() {
    estado.categorias.clear();
    estado.marcas.clear();
    estado.somentePromocao = false;
    estado.somenteNovos = false;
    estado.somenteMaisVendidos = false;
    estado.somenteDisponiveis = false;
    estado.precoMin = null;
    estado.precoMax = null;

    document.querySelectorAll('[data-slot="filtros"] input').forEach((el) => {
        if (el.type === "checkbox") el.checked = false;
        else el.value = "";
    });
    emitir();
}
