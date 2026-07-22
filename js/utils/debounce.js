/**
 * Debounce: adia a execução até o usuário parar de disparar o evento.
 * Ideal para busca "enquanto digita".
 */
export const debounce = (fn, ms = 250) => {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(null, args), ms);
    };
};

/**
 * Throttle: garante execução no máximo a cada N ms.
 * Ideal para scroll/resize.
 */
export const throttle = (fn, ms = 100) => {
    let ultima = 0;
    let timer;
    return (...args) => {
        const agora = Date.now();
        const restante = ms - (agora - ultima);
        if (restante <= 0) {
            clearTimeout(timer);
            ultima = agora;
            fn.apply(null, args);
        } else {
            clearTimeout(timer);
            timer = setTimeout(() => {
                ultima = Date.now();
                fn.apply(null, args);
            }, restante);
        }
    };
};
