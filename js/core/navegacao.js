/* =========================================================
   GESTÃO DE FROTA
   NAVEGAÇÃO DO SISTEMA
   ========================================================= */


/* =========================================================
   CONFIGURAR NAVEGAÇÃO
   ========================================================= */

function configurarNavegacao() {

    /* =============================================
       MENU LATERAL
       ============================================= */

    document
        .querySelectorAll(".menu-item")
        .forEach(item => {

            item.addEventListener(
                "click",
                evento => {

                    evento.preventDefault();

                    const pagina =
                        item.dataset.page;

                    abrirPagina(pagina);

                }
            );

        });


    /* =============================================
       BOTÕES QUE ABREM OUTRAS PÁGINAS
       ============================================= */

    document
        .querySelectorAll("[data-page-target]")
        .forEach(botao => {

            botao.addEventListener(
                "click",
                () => {

                    abrirPagina(
                        botao.dataset.pageTarget
                    );

                }
            );

        });

}


/* =========================================================
   ABRIR PÁGINA
   ========================================================= */

function abrirPagina(pagina) {

    /* =============================================
       ESCONDER TODAS AS PÁGINAS
       ============================================= */

    document
        .querySelectorAll(".page")
        .forEach(page => {

            page.classList.remove(
                "active-page"
            );

        });


    /* =============================================
       MOSTRAR PÁGINA ESCOLHIDA
       ============================================= */

    const destino =
        document.getElementById(
            `page-${pagina}`
        );


    if (destino) {

        destino.classList.add(
            "active-page"
        );

    }


    /* =============================================
       ATUALIZAR MENU LATERAL
       ============================================= */

    document
        .querySelectorAll(".menu-item")
        .forEach(item => {

            item.classList.toggle(
                "active",
                item.dataset.page === pagina
            );

        });


    /* =============================================
       ATUALIZAR CONTEÚDO DA PÁGINA
       ============================================= */

    if (pagina === "documentacao") {

        renderizarDocumentacao();

    }


    if (pagina === "frota") {

        renderizarFrotaPagina();

    }


    if (pagina === "motoristas") {

        renderizarMotoristas();

    }


    if (pagina === "manutencao") {

        renderizarManutencoes();

    }

}
