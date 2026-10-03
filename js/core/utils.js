/* =========================================================
   GESTÃO DE FROTA
   FUNÇÕES AUXILIARES
   ========================================================= */


/* =========================================================
   ALTERAR TEXTO DE UM ELEMENTO
   ========================================================= */

function setText(id, valor) {

    const elemento = document.getElementById(id);

    if (!elemento) {
        return;
    }

    elemento.textContent = valor;

}


/* =========================================================
   ESCAPAR HTML
   ========================================================= */

function escapeHtml(valor) {

    if (valor === null || valor === undefined) {
        return "";
    }

    return String(valor)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   NORMALIZAR TEXTO PARA BUSCAS
   ========================================================= */

function normalizarTexto(valor) {

    return String(valor || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();

}


/* =========================================================
   FORMATAR DATA
   ========================================================= */

function formatarData(data) {

    if (!data) {
        return "-";
    }

    const partes = String(data).split("-");

    if (partes.length !== 3) {
        return data;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;

}


/* =========================================================
   GERAR ID LOCAL
   ========================================================= */

function gerarId(prefixo = "local") {

    return `${prefixo}-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 8)}`;

}
