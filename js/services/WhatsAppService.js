/**
 * WhatsAppService — monta a mensagem do orçamento e abre wa.me.
 */
import { configService } from "./ConfigService.js";
import { formatarPreco, formatarDataHora, precoFinal } from "../utils/format.js";

class WhatsAppService {
    gerarMensagem(itens) {
        const saudacao   = configService.obter("whatsappMensagem.saudacao", "Olá!");
        const assinatura = configService.obter("whatsappMensagem.assinatura", "");
        const incluirDataHora = configService.obter("whatsappMensagem.incluirDataHora", true);

        const linhas = [saudacao, ""];

        itens.forEach(({ produto, quantidade }) => {
            const unit = precoFinal(produto);
            linhas.push(
                `• ${produto.nome}`,
                `Quantidade: ${quantidade}`,
                `Valor unitário: ${formatarPreco(unit)}`,
                `Subtotal: ${formatarPreco(unit * quantidade)}`,
                "--------------------------------"
            );
        });

        const total = itens.reduce(
            (acc, it) => acc + precoFinal(it.produto) * it.quantidade,
            0
        );

        linhas.push("", `Total estimado: ${formatarPreco(total)}`);
        if (incluirDataHora) linhas.push("", `Enviado em: ${formatarDataHora()}`);
        if (assinatura)      linhas.push("", assinatura);

        return linhas.join("\n");
    }

    abrirComItens(itens) {
        if (!itens?.length) return;
        const numero  = configService.obter("redes.whatsapp");
        if (!numero) {
            console.warn("[WhatsApp] número não configurado em config.json");
            return;
        }
        const mensagem = encodeURIComponent(this.gerarMensagem(itens));
        const url = `https://wa.me/${numero}?text=${mensagem}`;
        window.open(url, "_blank", "noopener");
    }
}

export const whatsappService = new WhatsAppService();
