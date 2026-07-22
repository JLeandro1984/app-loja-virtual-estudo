/**
 * Formatadores de dados — regras de apresentação isoladas.
 * Nenhum outro módulo deve formatar preços/datas manualmente.
 */

const formatadorBRL = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2
});

const formatadorData = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
});

export const formatarPreco = (valor) => {
    if (valor == null || Number.isNaN(Number(valor))) return "";
    return formatadorBRL.format(Number(valor));
};

export const formatarDataHora = (data = new Date()) => formatadorData.format(data);

/**
 * Percentual de desconto entre preço original e promocional.
 * @returns {number} inteiro (ex.: 25). Retorna 0 se não houver desconto válido.
 */
export const calcularDesconto = (preco, promocao) => {
    if (!promocao || !preco || promocao >= preco) return 0;
    return Math.round(((preco - promocao) / preco) * 100);
};

/**
 * Retorna o preço final (promocional se existir, senão o normal).
 */
export const precoFinal = (produto) => {
    if (!produto) return 0;
    return produto.promocao ?? produto.preco ?? 0;
};

/**
 * Normaliza texto para busca (remove acentos, lowercase).
 */
export const normalizar = (texto = "") =>
    texto.toString()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
