/**
 * ShareService — compartilhamento (WhatsApp, Facebook, Copy Link, Web Share API).
 */
import { bus, EVENTOS } from "../core/EventBus.js";

class ShareService {
    #urlProduto(produto) {
        return `${location.origin}${location.pathname}#/produto/${produto.id}`;
    }

    async webShare(produto) {
        const url = this.#urlProduto(produto);
        if (!navigator.share) return this.copiarLink(produto);
        try {
            await navigator.share({
                title: produto.nome,
                text: produto.descricaoCurta ?? produto.nome,
                url
            });
        } catch { /* usuário cancelou */ }
    }

    whatsapp(produto) {
        const texto = encodeURIComponent(`Olha esse produto: ${produto.nome} — ${this.#urlProduto(produto)}`);
        window.open(`https://wa.me/?text=${texto}`, "_blank", "noopener");
    }

    facebook(produto) {
        const url = encodeURIComponent(this.#urlProduto(produto));
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank", "noopener");
    }

    async copiarLink(produto) {
        const url = this.#urlProduto(produto);
        try {
            await navigator.clipboard.writeText(url);
            bus.emit(EVENTOS.TOAST, { tipo: "sucesso", mensagem: "Link copiado!" });
        } catch {
            bus.emit(EVENTOS.TOAST, { tipo: "erro", mensagem: "Não foi possível copiar." });
        }
    }
}

export const shareService = new ShareService();
