# Catálogo Premium

> Catálogo digital premium construído em **HTML5 + CSS3 + JavaScript ES6+** puro, sem frameworks. Arquitetura desacoplada em camadas, preparada para evoluir para API REST + backend + painel administrativo **sem reescrever o frontend**.

**Versão atual:** MVP 1.0 (Fases 0 → 3 concluídas)
**Status:** Funcional em produção estática (HTML/CSS/JS servido de qualquer origem)

---

## Sumário

- [Como executar](#como-executar)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Arquitetura](#arquitetura)
- [Design System](#design-system)
- [Recursos implementados](#recursos-implementados)
- [Rotas](#rotas)
- [Personalização](#personalizacao)
- [Adicionando produtos](#adicionando-produtos)
- [Migração para API REST](#migracao-para-api-rest)
- [Padrões e qualidade](#padroes-e-qualidade)
- [Acessibilidade](#acessibilidade)
- [Performance](#performance)
- [Compatibilidade](#compatibilidade)
- [Roadmap](#roadmap)

---

## Como executar

O projeto usa **ES Modules** (`<script type="module">`) e `fetch` de JSONs locais, portanto **não funciona ao abrir `index.html` direto pelo navegador (`file://`)**. É necessário um servidor HTTP local.

### Opção 1 — VS Code Live Server (recomendado)
1. Instale a extensão **Live Server** (Ritwick Dey).
2. Clique com o botão direito em [index.html](index.html) e selecione **Open with Live Server**.

### Opção 2 — Python
```powershell
python -m http.server 8080
```
Abra `http://localhost:8080`.

### Opção 3 — Node.js
```powershell
npx serve .
```

---

## Estrutura do projeto

```
app-loja-virtual/
├── index.html                       Single page (SPA leve com hash routing)
├── manifest.json                    PWA manifest (preparado, SW ainda não ativo)
├── robots.txt                       SEO permissivo com sitemap
├── sitemap.xml                      Sitemap base
├── README.md
│
├── assets/
│   ├── icons/favicon.svg            Favicon vetorial
│   ├── logos/logo.svg               Logo principal (SVG gradiente)
│   ├── banners/                     Banners promocionais
│   └── produtos/placeholder.svg     Placeholder quando imagem não existe
│
├── data/                            Fonte única de dados (substituída por API no futuro)
│   ├── config.json                  Configurações centralizadas da loja
│   ├── produtos.json                Catálogo de produtos (12 exemplos)
│   ├── categorias.json              Categorias com ícones
│   ├── marcas.json                  Marcas disponíveis
│   └── banners.json                 Banners rotativos
│
├── css/
│   ├── style.css                    Ponto único de entrada (@import cascata)
│   ├── base/
│   │   ├── variables.css            Design tokens (cores, spacing, radius, sombras, transições)
│   │   ├── reset.css                Reset moderno + scrollbar customizada + focus-visible
│   │   └── typography.css           Hierarquia tipográfica com clamp()
│   ├── themes/
│   │   └── themes.css               Light / Dark / Auto (via [data-theme])
│   ├── layout/
│   │   ├── container.css            Container responsivo
│   │   ├── header.css               Header sticky com glassmorphism + skip-link
│   │   ├── hero.css                 Hero com gradiente animado
│   │   ├── secao.css                Grid de produtos + toolbar + paginação + estado vazio
│   │   └── rodape.css               Footer com colunas responsivas
│   ├── components/
│   │   ├── buttons.css              Sistema completo (primary, acento, outline, ghost, whatsapp, claro)
│   │   ├── search.css               Input de busca premium
│   │   ├── badges.css               Novo, Promoção, Mais vendido, Esgotado, Desconto
│   │   ├── cards.css                Card de produto + card do carrinho
│   │   ├── skeleton.css             Loading skeletons animados
│   │   ├── drawer.css               Painel lateral (carrinho + filtros)
│   │   ├── modal.css                Modal <dialog> nativo para detalhes
│   │   ├── filtros.css              Painel de filtros
│   │   ├── toast.css                Notificações não intrusivas
│   │   ├── fab.css                  FAB Instagram + voltar-ao-topo
│   │   └── banner.css               Banners secundários (CTA)
│   ├── animations/animations.css    Keyframes globais (subir, fade, pop, fluxo, shimmer)
│   └── utilities/utilities.css      Helpers (visually-hidden, stack, gap, hidden)
│
└── js/
    ├── app.js                       Orquestrador principal (bootstrap + delegação de eventos)
    ├── core/
    │   ├── EventBus.js              Pub/Sub para desacoplar módulos
    │   └── Router.js                Hash routing
    ├── services/                    Regra de negócio (sem DOM)
    │   ├── DataLoader.js            Única porta de entrada de dados (JSON hoje, API amanhã)
    │   ├── ConfigService.js         Acesso a config.json por path
    │   ├── ProductService.js        Busca, filtragem, ordenação, destaques, promoções
    │   ├── CartService.js           Carrinho persistente (LocalStorage) + emissão de eventos
    │   ├── FavoritesService.js      Favoritos persistentes
    │   ├── ThemeService.js          Light/Dark/Auto com ciclo
    │   ├── WhatsAppService.js       Geração da mensagem de orçamento
    │   └── ShareService.js          WhatsApp/Facebook/Copy/Web Share API
    ├── storage/
    │   └── StorageService.js        Abstração de LocalStorage
    ├── components/                  UI (sem regra de negócio)
    │   ├── ProductCard.js           Card + skeleton
    │   ├── ProductModal.js          Modal de detalhes com galeria
    │   ├── CartDrawer.js            Drawer do carrinho
    │   ├── FilterPanel.js           Painel de filtros dinâmico
    │   └── Toast.js                 Sistema de notificações
    └── utils/
        ├── format.js                Intl (BRL, data), desconto, precoFinal, normalizar
        ├── dom.js                   $, $$, criarElemento, escaparHtml, delegar
        └── debounce.js              debounce + throttle
```

---

## Arquitetura

### Camadas

```
┌────────────────────────────────────────────────┐
│              app.js (orquestrador)             │
│  Bootstrap · Delegação global · Hidratação     │
├────────────────────────────────────────────────┤
│  Componentes  (UI, sem regra de negócio)       │
│  ProductCard · ProductModal · CartDrawer       │
│  FilterPanel · Toast                           │
├────────────────────────────────────────────────┤
│  Services     (regra de negócio, sem DOM)      │
│  ConfigService · ProductService · CartService  │
│  FavoritesService · ThemeService · WhatsApp    │
│  ShareService                                  │
├────────────────────────────────────────────────┤
│  Core         (infraestrutura)                 │
│  EventBus (pub/sub) · Router (hash)            │
├────────────────────────────────────────────────┤
│  Data                                          │
│  DataLoader   → JSON hoje · REST amanhã        │
│  StorageService → LocalStorage · API amanhã    │
└────────────────────────────────────────────────┘
```

### Comunicação via EventBus

Componentes **não se conhecem**. Eles publicam e assinam eventos no `EventBus`:

```javascript
import { bus, EVENTOS } from "./core/EventBus.js";

bus.emit(EVENTOS.TOAST, { tipo: "sucesso", mensagem: "Ok!" });
bus.on(EVENTOS.CARRINHO_ALTERADO, (estado) => { /* reage */ });
```

**Eventos disponíveis** ([js/core/EventBus.js](js/core/EventBus.js)):
`CARRINHO_ALTERADO` · `FAVORITOS_ALTERADO` · `TEMA_ALTERADO` · `BUSCA_ALTERADA` · `FILTROS_ALTERADOS` · `ORDENACAO_ALTERADA` · `ROTA_ALTERADA` · `PRODUTO_ABRIR` · `TOAST` · `ABRIR_DRAWER` · `FECHAR_DRAWER`

### Princípios seguidos

- **SOLID** (adaptado): SRP em cada arquivo, DI leve via `import`
- **Clean Code**: nomes semânticos, funções pequenas, sem comentários redundantes
- **DRY**: formatadores, helpers DOM e tokens centralizados
- **KISS / YAGNI**: nada de abstração especulativa
- **Separação de responsabilidades**: services (dados) ≠ componentes (DOM) ≠ orquestrador
- **Baixo acoplamento**: EventBus + interfaces claras
- **Segurança**: `escaparHtml()` em todo dado renderizado (proteção XSS)

---

## Design System

Todos os tokens ficam em [css/base/variables.css](css/base/variables.css). Alterar aqui reflete em todo o produto.

### Paleta

| Token | Light | Dark |
|-------|-------|------|
| `--cor-fundo` | `#FAFAFA` | `#0A0A0A` |
| `--cor-superficie` | `#FFFFFF` | `#141414` |
| `--cor-primaria` | `#0A0A0A` | `#FAFAFA` |
| `--cor-secundaria` | `#F5A623` | (herda) |
| `--cor-acento` | `#635BFF` | (herda) |
| `--cor-whatsapp` | `#25D366` | (herda) |

### Escalas
- **Spacing** — `--sp-0` a `--sp-9` (base 4px: 0, 4, 8, 12, 16, 24, 32, 48, 64, 96)
- **Radius** — `--raio-xs/sm/md/lg/xl/full` (4, 8, 12, 16, 24, 9999)
- **Tipografia** — `--fs-xs` a `--fs-4xl` (com `clamp()` no maior)
- **Sombras** — 5 níveis de elevação + `--sombra-foco`
- **Transições** — rápida (150ms), base (250ms), lenta (400ms)
- **Z-index** — escala nomeada (`--z-header`, `--z-drawer`, `--z-modal`, `--z-toast`)

### Temas

Aplicados via `data-theme` no `<html>`:
- `light` — modo claro fixo
- `dark` — modo escuro fixo
- `auto` — segue `prefers-color-scheme` do sistema

Alternado via botão do header, ciclando `auto → light → dark → auto`.

---

## Recursos implementados

### Catálogo
- Listagem em grid responsivo (`auto-fill` + `minmax()`)
- Busca instantânea com **debounce** (200ms) por nome, descrição, categoria, marca e tags
- **7 ordenações**: Destaques · Menor preço · Maior preço · Maior desconto · Nome (A-Z) · Mais recentes · Mais vendidos
- **8 filtros**: Categorias · Marcas · Promoções · Novidades · Mais vendidos · Disponibilidade · Faixa de preço (mín/máx)
- Paginação com botão "Carregar mais"
- Estado vazio com CTA "Limpar filtros"
- Skeleton loading nos slots

### Produto
- Modal com `<dialog>` nativo (fechamento via ESC, backdrop)
- Galeria com miniaturas clicáveis
- Zoom implícito via `object-fit: cover`
- Seletor de quantidade
- Botão adicionar ao carrinho
- Favoritar (persistente)
- **Compartilhamento**: Web Share API (mobile) · WhatsApp · Facebook · Copiar link

### Carrinho
- Persistência em **LocalStorage** (`catalogo-premium:carrinho`)
- Drawer lateral direito com overlay + blur
- Alteração de quantidade, remoção individual, esvaziar tudo
- Total calculado em tempo real (usa promoção quando existir)
- Botão "Enviar orçamento pelo WhatsApp" gera mensagem formatada:

```
Olá! Tenho interesse nos seguintes produtos:

• Perfume Aurora Noir 100ml
Quantidade: 2
Valor unitário: R$ 449,90
Subtotal: R$ 899,80
--------------------------------

Total estimado: R$ 899,80

Enviado em: 21/07/2026 10:30

Gostaria de mais informações. Obrigado!
```

### Favoritos
- Persistente em LocalStorage
- Badge dinâmico no header
- Rota dedicada `#/favoritos`

### Tema
- Ciclo Light / Dark / Auto
- Respeita `prefers-color-scheme` no modo Auto
- Salvo em LocalStorage
- Ícone do botão alterna conforme o modo

### Roteamento (SPA leve)
- Hash routing (não requer servidor especial)
- **Rotas**:
  - `#/` — home
  - `#/produto/:id` — abre modal do produto (deep-linkable)
  - `#/categoria/:id` — filtra por categoria
  - `#/promocoes` — apenas produtos em promoção
  - `#/favoritos` — apenas favoritos

### UX
- Toast notifications (sucesso, erro, info, alerta) com animação
- Botão flutuante voltar-ao-topo (aparece após 400px)
- Botão flutuante do Instagram (configurável)
- Skeleton loading durante carregamento inicial
- Header com elevação dinâmica no scroll
- Glassmorphism no header e badges
- Animações discretas de entrada e hover
- Microinterações (pop nos badges, scale nos cards)

### SEO
- Meta tags completas (description, keywords, author, canonical)
- **Open Graph** (Facebook, LinkedIn, previews em mensageiros)
- **Twitter Cards** (summary_large_image)
- **JSON-LD** estruturado (Schema.org/Store)
- `robots.txt` e `sitemap.xml`
- Título dinâmico via config

### PWA-ready
- `manifest.json` configurado (nome, ícones, cores, display standalone)
- Meta `theme-color` para light/dark
- Estrutura preparada para Service Worker (Fase 13)

---

## Rotas

Todas as rotas usam hash routing e são acessíveis diretamente pela URL:

| Rota | Ação |
|------|------|
| `#/` ou raiz | Catálogo completo |
| `#/produto/:id` | Abre o modal de detalhes do produto |
| `#/categoria/:id` | Filtra o catálogo por categoria |
| `#/promocoes` | Exibe somente produtos em promoção |
| `#/favoritos` | Exibe somente os favoritos do usuário |

---

## Personalização

**Toda configuração da loja está em [data/config.json](data/config.json)**. Não há dados fixos no código.

### Principais campos

```json
{
    "loja": {
        "nome": "Catálogo Premium",
        "slogan": "Curadoria exclusiva para você",
        "email": "contato@exemplo.com",
        "telefone": "+55 (11) 9 0000-0000",
        "endereco": "São Paulo, SP",
        "horarioAtendimento": "Seg. a Sáb. — 09h às 19h"
    },
    "redes": {
        "whatsapp": "5511900000000",
        "instagram": "https://instagram.com/seu-perfil",
        "facebook": "https://facebook.com/seu-perfil",
        "tiktok": ""
    },
    "tema": { "padrao": "auto" },
    "catalogo": { "produtosPorPagina": 12 },
    "whatsappMensagem": {
        "saudacao": "Olá! Tenho interesse nos seguintes produtos:",
        "assinatura": "Gostaria de mais informações. Obrigado!",
        "incluirDataHora": true
    },
    "seo": { "titulo": "...", "descricao": "...", "keywords": "..." },
    "rodape": {
        "textoCopyright": "© 2026 ...",
        "politicas": [ { "titulo": "...", "url": "#/..." } ]
    }
}
```

### Hidratação automática no HTML

Basta usar `data-config` no HTML:

```html
<span data-config="loja.nome">Catálogo Premium</span>
<span data-config="loja.horarioAtendimento"></span>
```

Ou `data-config-attr` para atributos:

```html
<a data-config-attr='{"href":"mailto:{loja.email}","text":"loja.email"}'></a>
```

---

## Adicionando produtos

Edite [data/produtos.json](data/produtos.json). Estrutura:

```json
{
    "id": 13,
    "sku": "PRF-013",
    "nome": "Nome do produto",
    "slug": "nome-do-produto",
    "descricaoCurta": "Frase curta exibida no card.",
    "descricao": "Descrição completa exibida no modal.",
    "caracteristicas": ["Item 1", "Item 2", "Item 3"],
    "categoria": "perfumes",
    "marca": "aurora",
    "preco": 299.90,
    "promocao": 199.90,
    "parcelamento": "6x sem juros",
    "estoque": true,
    "destaque": true,
    "novo": false,
    "maisVendido": false,
    "tags": ["premium", "unissex"],
    "imagens": [
        "assets/produtos/13-1.jpg",
        "assets/produtos/13-2.jpg"
    ]
}
```

As imagens vão em `assets/produtos/`. Se o arquivo não existir, um fallback com ícone é exibido automaticamente.

Para adicionar **categorias** ou **marcas**, edite [data/categorias.json](data/categorias.json) e [data/marcas.json](data/marcas.json) (ambos com estrutura simples de `id` + `nome`).

---

## Migração para API REST

**Apenas um arquivo muda:** [js/services/DataLoader.js](js/services/DataLoader.js).

Basta trocar `BASE_URL = "data/"` pela URL da API, remover a extensão `.json` e (se necessário) adicionar headers de autenticação no `fetch`. **Nenhum outro módulo é afetado** — todos os services consomem `DataLoader.produtos()`, `DataLoader.config()`, etc.

O mesmo vale para `StorageService`: quando houver autenticação de cliente, basta trocar a implementação para chamar a API sem alterar `CartService` ou `FavoritesService`.

---

## Padrões e qualidade

### Convenções de código
- **ES Modules** puros (`import` / `export`)
- **Classes privadas** com `#prefixo` (encapsulamento real)
- **Singletons** exportados: `configService`, `cartService`, etc.
- **Nomes em português** para domínio, **inglês** para infra técnica
- **Constantes centralizadas** (`EVENTOS`, `TEMAS`, `BASE_URL`)
- **Sem comentários redundantes** — código autodocumentado, JSDoc em pontos críticos

### CSS
- **Metodologia**: BEM leve (`.card__midia`, `.card--variante`)
- **Camadas via @import**: base → themes → layout → components → animations → utilities
- **CSS Variables** em toda parte (zero valores mágicos em componentes)
- **Grid + Flexbox + `clamp()`** para responsividade fluida

### Segurança
- `escaparHtml()` em **todo** dado renderizado (proteção XSS)
- `rel="noopener"` em links externos com `target="_blank"`
- `onerror` inline apenas com strings estáticas (não interpola dados)
- `<noscript>` fallback para JS desabilitado

---

## Acessibilidade

- **Skip link** ("Pular para o conteúdo") — visível apenas no foco
- **HTML semântico** (`<header>`, `<main>`, `<nav>`, `<article>`, `<section>`, `<aside>`, `<footer>`, `<dialog>`)
- **ARIA labels** em botões de ícone, badges dinâmicos com `aria-live="polite"`
- **Focus-visible** com `box-shadow` (nunca `outline: none` sem substituto)
- **Contraste** conforme WCAG AA em ambos os temas
- **Navegação por teclado** completa (Tab, Enter, ESC no modal)
- **`prefers-reduced-motion`** desativa animações
- **`role="dialog"` + `aria-modal`** nos drawers e modal
- **Alt text** em imagens (vazio quando decorativo)

---

## Performance

- **Lazy loading** nativo em todas as imagens (`loading="lazy"`)
- **`decoding="async"`** em imagens
- **Cache em memória** no `DataLoader` (evita re-fetch de JSONs)
- **Debounce** (200ms) na busca
- **Throttle** (100ms) no scroll listener
- **`DocumentFragment`** para inserção em batch de cards
- **Delegação de eventos** (1 listener em `document` em vez de N em cards)
- **`<dialog>` nativo** (sem lib de modal)
- **Fontes system-ui** (zero download)

---

## Compatibilidade

Testado e otimizado para navegadores modernos que suportam:
- ES Modules (`<script type="module">`)
- `<dialog>` nativo
- CSS Grid + Flexbox
- CSS Custom Properties
- `Intl.NumberFormat` e `Intl.DateTimeFormat`
- `backdrop-filter`

| Navegador | Versão mínima |
|-----------|---------------|
| Chrome / Edge | 90+ |
| Firefox | 90+ |
| Safari | 15+ |
| Chrome Android | 90+ |
| Safari iOS | 15+ |

---

## Roadmap

| Fase | Versão | Escopo | Status |
|------|--------|--------|--------|
| 0    | —      | Arquitetura e planejamento                      | Concluída |
| 1    | 1.0    | Fundação (estrutura + design tokens)            | Concluída |
| 2    | 1.0    | Modelo de dados (JSON)                          | Concluída |
| 3    | 1.0    | Layout premium (componentes)                    | Concluída |
| 4    | 1.0    | Catálogo (listagem, busca, filtros, ordenação)  | Concluída |
| 5    | 1.0    | Produto (modal com galeria, quantidade, share)  | Concluída |
| 6    | 1.0    | Carrinho (LocalStorage + drawer)                | Concluída |
| 7    | 1.0    | WhatsApp + Instagram + Share                    | Concluída |
| 8    | 1.0    | Configurações centralizadas                     | Concluída |
| 9    | 1.0    | Recursos premium (favoritos, badges)            | Concluída |
| 10   | 1.0    | SEO (meta, OG, JSON-LD, sitemap)                | Concluída |
| 11   | 1.0    | Performance (lazy, debounce, cache)             | Concluída |
| 12   | 1.0    | Acessibilidade (WCAG, skip-link, ARIA)          | Concluída |
| 13   | 1.1    | PWA completo (Service Worker + offline)         | Prevista |
| 14   | 1.1    | Painel administrativo local (`/admin`)          | Prevista |
| 15   | 2.0    | Backend REST + banco de dados                   | Prevista |
| —    | 2.x    | Login, pedidos, clientes, dashboard             | Prevista |
| —    | 3.0    | E-commerce completo com pagamento               | Prevista |

Consulte [Planejamento/Planejamento.txt](Planejamento/Planejamento.txt) e [Planejamento/prompts.txt](Planejamento/prompts.txt) para o planejamento estratégico completo.

---

## Licença

Projeto proprietário. Todos os direitos reservados.
