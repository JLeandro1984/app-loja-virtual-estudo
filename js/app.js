/**
 * app.js — Orquestrador da aplicação.
 *
 * Responsabilidades:
 *  1. Bootstrap: carrega dados, inicializa services e componentes.
 *  2. Hidrata a UI com config, categorias, banners.
 *  3. Renderiza seções (destaques, promoções, catálogo).
 *  4. Aplica delegação global de eventos (clique/busca).
 *  5. Reage a mudanças (carrinho, favoritos, filtros, rota).
 *
 * Regras:
 *  - Nunca chama LocalStorage ou fetch diretamente.
 *  - Nunca conhece detalhes de outros componentes:
 *    tudo passa por Services e pelo EventBus.
 */

import { $, $$, delegar, escaparHtml } from "./utils/dom.js";
import { debounce, throttle } from "./utils/debounce.js";

import { bus, EVENTOS } from "./core/EventBus.js";
import { router } from "./core/Router.js";

import { configService }     from "./services/ConfigService.js";
import { productService }    from "./services/ProductService.js";
import { cartService }       from "./services/CartService.js";
import { favoritesService }  from "./services/FavoritesService.js";
import { themeService }      from "./services/ThemeService.js";
import { whatsappService }   from "./services/WhatsAppService.js";

import { criarCard, criarSkeletonCard } from "./components/ProductCard.js";
import { productModal }                 from "./components/ProductModal.js";
import { inicializarCartDrawer }        from "./components/CartDrawer.js";
import { inicializarFilterPanel, limparFiltros } from "./components/FilterPanel.js";
import { inicializarToast }             from "./components/Toast.js";

// ============================================================
// Estado global da UI (mínimo, restrito a esta camada)
// ============================================================
const ui = {
    busca: "",
    filtros: {},
    ordenacao: "destaque",
    pagina: 1,
    porPagina: 12
};

// ============================================================
// Bootstrap
// ============================================================
async function bootstrap() {
    try {
        await configService.carregar();
        aplicarConfig();

        await productService.carregar();

        ui.porPagina = configService.obter("catalogo.produtosPorPagina", 12);
        ui.ordenacao = configService.obter("catalogo.ordenacaoPadrao", "destaque");

        themeService.inicializar();
        cartService.inicializar();
        favoritesService.inicializar();
        router.inicializar();

        inicializarToast();
        inicializarCartDrawer();
        inicializarFilterPanel();

        renderizarCategoriasNav();
        renderizarHero();
        renderizarBannerSecundario();
        renderizarDestaques();
        renderizarPromocoes();
        renderizarCatalogo();

        registrarEventosGlobais();
        registrarEventosBus();
        registrarScroll();
    } catch (erro) {
        console.error("[bootstrap] falha ao iniciar aplicação:", erro);
        bus.emit(EVENTOS.TOAST, { tipo: "erro", mensagem: "Erro ao carregar o catálogo." });
    }
}

// ============================================================
// Hidratação a partir do config.json
// ============================================================
function aplicarConfig() {
    // Textos simples: data-config="loja.nome"
    $$("[data-config]").forEach((el) => {
        el.textContent = configService.obter(el.dataset.config, "");
    });

    // Atributos + texto: data-config-attr='{"href":"mailto:{loja.email}","text":"loja.email"}'
    $$("[data-config-attr]").forEach((el) => {
        try {
            const cfg = JSON.parse(el.dataset.configAttr);
            for (const [attr, valorOuPath] of Object.entries(cfg)) {
                if (attr === "text") {
                    el.textContent = configService.obter(valorOuPath, "");
                } else {
                    const substituido = valorOuPath.replace(
                        /\{([\w.]+)\}/g,
                        (_, path) => configService.obter(path, "")
                    );
                    el.setAttribute(attr, substituido);
                }
            }
        } catch (erro) { console.warn("data-config-attr inválido", erro); }
    });

    // Título dinâmico
    document.title = configService.obter("seo.titulo", document.title);
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.content = configService.obter("seo.descricao", metaDesc.content);

    // Instagram FAB
    const instagram = configService.obter("redes.instagram");
    const fab = $('[data-fab="instagram"]');
    if (fab) fab.href = instagram || "#";

    // Redes sociais no rodapé
    const slotRedes = $('[data-slot="redes-sociais"]');
    if (slotRedes) {
        const redes = [
            { chave: "instagram", icone: "bi-instagram", label: "Instagram" },
            { chave: "facebook",  icone: "bi-facebook",  label: "Facebook" },
            { chave: "tiktok",    icone: "bi-tiktok",    label: "TikTok" }
        ];
        slotRedes.innerHTML = redes
            .map(({ chave, icone, label }) => {
                const url = configService.obter(`redes.${chave}`, "");
                if (!url) return "";
                return `<a href="${escaparHtml(url)}" class="rodape__social" target="_blank" rel="noopener" aria-label="${label}"><i class="bi ${icone}" aria-hidden="true"></i></a>`;
            })
            .join("");

        // WhatsApp
        const wpp = configService.obter("redes.whatsapp", "");
        if (wpp) {
            slotRedes.insertAdjacentHTML(
                "afterbegin",
                `<a href="https://wa.me/${escaparHtml(wpp)}" class="rodape__social" target="_blank" rel="noopener" aria-label="WhatsApp"><i class="bi bi-whatsapp" aria-hidden="true"></i></a>`
            );
        }
    }

    // Políticas do rodapé
    const slotPoliticas = $('[data-slot="politicas"]');
    if (slotPoliticas) {
        const politicas = configService.obter("rodape.politicas", []);
        slotPoliticas.innerHTML = politicas
            .map((p) => `<li><a href="${escaparHtml(p.url)}">${escaparHtml(p.titulo)}</a></li>`)
            .join("");
    }
}

// ============================================================
// Renderizações de seção
// ============================================================
function renderizarCategoriasNav() {
    const slot = $('[data-slot="categorias-nav"]');
    if (!slot) return;
    const categorias = productService.categorias;
    slot.innerHTML = `
        <button type="button" class="categorias-nav__item categorias-nav__item--ativo" data-categoria="">
            <i class="bi bi-grid" aria-hidden="true"></i> Todos
        </button>
        ${categorias.map((c) => `
            <button type="button" class="categorias-nav__item" data-categoria="${escaparHtml(c.id)}">
                <i class="bi ${escaparHtml(c.icone ?? "bi-tag")}" aria-hidden="true"></i>
                ${escaparHtml(c.nome)}
            </button>
        `).join("")}
    `;
}

function renderizarHero() {
    const slot = $('[data-slot="hero"]');
    if (!slot) return;
    slot.innerHTML = `
        <div class="hero__conteudo">
            <span class="hero__eyebrow">
                <i class="bi bi-stars" aria-hidden="true"></i>
                Novidades de 2026
            </span>
            <h1 class="hero__titulo">${escaparHtml(configService.obter("loja.nome", "Catálogo Premium"))}</h1>
            <p class="hero__subtitulo">${escaparHtml(configService.obter("seo.descricao", ""))}</p>
            <div class="hero__acoes">
                <a href="#catalogo" class="btn btn--claro btn--lg">
                    <i class="bi bi-bag-check" aria-hidden="true"></i>
                    Explorar catálogo
                </a>
                <a href="#/promocoes" class="btn btn--ghost btn--lg" style="color:#fff;border:1px solid rgba(255,255,255,.3);">
                    <i class="bi bi-tag" aria-hidden="true"></i>
                    Ver promoções
                </a>
            </div>
        </div>
    `;
}

function renderizarBannerSecundario() {
    const slot = $('[data-slot="banner-secundario"]');
    if (!slot) return;
    slot.innerHTML = `
        <a class="banner-card banner-card--marca" href="#/promocoes">
            <div class="banner-card__conteudo">
                <h3 class="banner-card__titulo">Ofertas da semana</h3>
                <p class="banner-card__subtitulo">Até 40% OFF em itens selecionados</p>
                <span class="banner-card__cta">Aproveitar <i class="bi bi-arrow-right"></i></span>
            </div>
        </a>
        <a class="banner-card banner-card--acento" href="#/favoritos">
            <div class="banner-card__conteudo">
                <h3 class="banner-card__titulo">Sua curadoria</h3>
                <p class="banner-card__subtitulo">Revise seus produtos favoritos</p>
                <span class="banner-card__cta">Ver favoritos <i class="bi bi-arrow-right"></i></span>
            </div>
        </a>
    `;
}

function renderizarLista(slot, produtos) {
    if (!slot) return;
    slot.innerHTML = "";
    if (!produtos.length) {
        slot.innerHTML = `<p style="grid-column:1/-1;color:var(--cor-texto-fraco);text-align:center;padding:var(--sp-6);">Nenhum produto para exibir.</p>`;
        return;
    }
    const frag = document.createDocumentFragment();
    produtos.forEach((p) => frag.appendChild(criarCard(p)));
    slot.appendChild(frag);
}

function renderizarSkeletons(slot, qtd = 4) {
    if (!slot) return;
    slot.innerHTML = "";
    const frag = document.createDocumentFragment();
    for (let i = 0; i < qtd; i++) frag.appendChild(criarSkeletonCard());
    slot.appendChild(frag);
}

function renderizarDestaques() {
    renderizarLista($('[data-slot="destaques"]'), productService.destaques(8));
}

function renderizarPromocoes() {
    renderizarLista($('[data-slot="promocoes"]'), productService.promocoes(8));
}

function renderizarCatalogo() {
    const slot = $('[data-slot="catalogo"]');
    const contador = $('[data-slot="contador-resultado"]');
    const paginacao = $('[data-slot="paginacao"]');
    const estadoVazio = $('[data-slot="estado-vazio"]');

    const lista = productService.aplicar({
        busca: ui.busca,
        filtros: ui.filtros,
        ordenacao: ui.ordenacao
    });

    const totalPaginas = Math.max(1, Math.ceil(lista.length / ui.porPagina));
    if (ui.pagina > totalPaginas) ui.pagina = 1;
    const visiveis = lista.slice(0, ui.pagina * ui.porPagina);

    if (contador) {
        contador.textContent = lista.length
            ? `Exibindo ${visiveis.length} de ${lista.length} produto(s)`
            : "Nenhum resultado encontrado";
    }

    if (!lista.length) {
        slot.innerHTML = "";
        paginacao.hidden = true;
        estadoVazio.hidden = false;
        return;
    }

    estadoVazio.hidden = true;
    renderizarLista(slot, visiveis);
    paginacao.hidden = visiveis.length >= lista.length;
}

// ============================================================
// Eventos globais (delegação)
// ============================================================
function registrarEventosGlobais() {
    // Cliques delegados
    document.addEventListener("click", (e) => {
        const alvoAction = e.target.closest("[data-action]");
        if (alvoAction) tratarAcao(alvoAction);

        const cat = e.target.closest("[data-categoria]");
        if (cat) tratarCategoriaClique(cat);
    });

    // Busca com debounce
    const inputBusca = $("#input-busca");
    const btnClear = $(".search__clear");
    if (inputBusca) {
        const aoDigitar = debounce((termo) => {
            ui.busca = termo;
            ui.pagina = 1;
            btnClear.hidden = !termo;
            renderizarCatalogo();
            scrollParaCatalogo();
        }, 200);

        inputBusca.addEventListener("input", (e) => aoDigitar(e.target.value.trim()));
        btnClear.addEventListener("click", () => {
            inputBusca.value = "";
            aoDigitar("");
            inputBusca.focus();
        });
    }

    // Ordenação
    const selectOrd = document.querySelector('[data-component="ordenacao"]');
    if (selectOrd) {
        selectOrd.value = ui.ordenacao;
        selectOrd.addEventListener("change", (e) => {
            ui.ordenacao = e.target.value;
            renderizarCatalogo();
        });
    }
}

function scrollParaCatalogo() {
    document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function tratarCategoriaClique(el) {
    document.querySelectorAll("[data-categoria]").forEach((n) => n.classList.remove("categorias-nav__item--ativo"));
    el.classList.add("categorias-nav__item--ativo");
    const cat = el.dataset.categoria;
    ui.filtros = { ...ui.filtros, categorias: cat ? [cat] : [] };
    ui.pagina = 1;
    renderizarCatalogo();
    scrollParaCatalogo();
}

function tratarAcao(el) {
    const acao = el.dataset.action;
    const id = el.dataset.produtoId;
    const produto = id ? productService.obterPorId(id) : null;

    switch (acao) {
        case "toggle-theme":       themeService.alternar(); break;

        case "abrir-produto":      if (produto) productModal.abrir(produto); break;

        case "adicionar-carrinho": if (produto) cartService.adicionar(produto, 1); break;

        case "favoritar":
            if (id) {
                const agora = favoritesService.alternar(id);
                el.classList.toggle("card__favoritar--ativo", agora);
                const icone = el.querySelector("i");
                if (icone) icone.className = agora ? "bi bi-heart-fill" : "bi bi-heart";
                bus.emit(EVENTOS.TOAST, {
                    tipo: "sucesso",
                    mensagem: agora ? "Adicionado aos favoritos" : "Removido dos favoritos"
                });
            }
            break;

        case "open-cart":          abrirDrawer("carrinho"); break;
        case "open-filtros":       abrirDrawer("filtros"); break;
        case "open-favorites":     ui.filtros = { ...ui.filtros, categorias: [] };
                                    router.navegar("#/favoritos");
                                    break;
        case "close-drawer":       fecharDrawers(); break;

        case "enviar-whatsapp":
            whatsappService.abrirComItens(cartService.itens);
            break;

        case "limpar-carrinho":
            cartService.limpar();
            bus.emit(EVENTOS.TOAST, { tipo: "info", mensagem: "Carrinho esvaziado." });
            break;

        case "limpar-filtros":
            limparFiltros();
            document.querySelectorAll("[data-categoria]").forEach((n) => n.classList.remove("categorias-nav__item--ativo"));
            document.querySelector('[data-categoria=""]')?.classList.add("categorias-nav__item--ativo");
            break;

        case "carregar-mais":      ui.pagina++; renderizarCatalogo(); break;

        case "voltar-topo":        window.scrollTo({ top: 0, behavior: "smooth" }); break;
    }
}

function abrirDrawer(nome) {
    fecharDrawers();
    const el = document.querySelector(`[data-drawer="${nome}"]`);
    if (!el) return;
    el.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
}

function fecharDrawers() {
    document.querySelectorAll(".drawer").forEach((d) => d.setAttribute("aria-hidden", "true"));
    document.body.style.overflow = "";
}

// ============================================================
// Reação a eventos do EventBus
// ============================================================
function registrarEventosBus() {
    bus.on(EVENTOS.CARRINHO_ALTERADO, ({ quantidadeTotal }) => {
        atualizarBadge('[data-badge="carrinho"]', quantidadeTotal);
    });

    bus.on(EVENTOS.FAVORITOS_ALTERADO, ({ quantidade }) => {
        atualizarBadge('[data-badge="favoritos"]', quantidade);
        // Re-renderiza cards para refletir estado
        if (location.hash.startsWith("#/favoritos")) renderizarCatalogo();
    });

    bus.on(EVENTOS.FILTROS_ALTERADOS, (filtros) => {
        ui.filtros = { ...ui.filtros, ...filtros };
        ui.pagina = 1;
        renderizarCatalogo();
    });

    bus.on(EVENTOS.ROTA_ALTERADA, tratarRota);
}

function tratarRota({ nome, params }) {
    switch (nome) {
        case "produto": {
            const p = productService.obterPorId(params.id);
            if (p) productModal.abrir(p);
            break;
        }
        case "categoria":
            ui.filtros = { ...ui.filtros, categorias: [params.id] };
            renderizarCatalogo();
            scrollParaCatalogo();
            break;
        case "promocoes":
            ui.filtros = { ...ui.filtros, somentePromocao: true };
            renderizarCatalogo();
            scrollParaCatalogo();
            break;
        case "favoritos": {
            const ids = favoritesService.ids;
            const slot = $('[data-slot="catalogo"]');
            const contador = $('[data-slot="contador-resultado"]');
            const favoritos = productService.todos.filter((p) => ids.includes(String(p.id)));
            if (contador) contador.textContent = `Seus favoritos (${favoritos.length})`;
            renderizarLista(slot, favoritos);
            $('[data-slot="paginacao"]').hidden = true;
            $('[data-slot="estado-vazio"]').hidden = favoritos.length > 0;
            scrollParaCatalogo();
            break;
        }
    }
}

function atualizarBadge(seletor, valor) {
    const el = document.querySelector(seletor);
    if (!el) return;
    el.textContent = valor;
    el.hidden = valor === 0;
}

// ============================================================
// Scroll: header elevado + voltar ao topo
// ============================================================
function registrarScroll() {
    const header = document.querySelector(".header");
    const btnTopo = document.querySelector('[data-action="voltar-topo"]');
    const onScroll = throttle(() => {
        const y = window.scrollY;
        header?.classList.toggle("header--elevado", y > 8);
        if (btnTopo) btnTopo.hidden = y < 400;
    }, 100);
    window.addEventListener("scroll", onScroll, { passive: true });
}

// ============================================================
// Boot
// ============================================================
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootstrap);
} else {
    bootstrap();
}
