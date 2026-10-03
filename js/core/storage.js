/* =========================================================
   GESTÃO DE FROTA
   STORAGE / LOCALSTORAGE
   ========================================================= */


/* =========================================================
   LER DADOS
   ========================================================= */

function lerStorage(chave, fallback = []) {

    try {

        const valor = localStorage.getItem(chave);

        if (!valor) {
            return fallback;
        }

        return JSON.parse(valor);

    } catch (erro) {

        console.error(
            `Erro ao ler ${chave}:`,
            erro
        );

        return fallback;
    }
}


/* =========================================================
   SALVAR DADOS
   ========================================================= */

function salvarStorage(chave, dados) {

    localStorage.setItem(
        chave,
        JSON.stringify(dados)
    );

}
