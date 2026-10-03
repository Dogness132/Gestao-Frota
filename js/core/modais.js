/* =========================================================
   GESTÃO DE FROTA
   CONTROLE DOS MODAIS
   ========================================================= */


/* =========================================================
   CONFIGURAR MODAIS
   ========================================================= */

function configurarModais() {


    /* =============================================
       BOTÕES DE FECHAR
       ============================================= */

    document
        .querySelectorAll("[data-close-modal]")
        .forEach(botao => {

            botao.addEventListener(
                "click",
                () => {

                    fecharModal(
                        botao.dataset.closeModal
                    );

                }
            );

        });


    /* =============================================
       FECHAR CLICANDO FORA DO MODAL
       ============================================= */

    document
        .querySelectorAll(".modal-overlay")
        .forEach(modal => {

            modal.addEventListener(
                "click",
                evento => {

                    if (
                        evento.target === modal
                    ) {

                        modal.classList.remove(
                            "show"
                        );

                    }

                }
            );

        });


    /* =============================================
       FECHAR COM ESC
       ============================================= */

    document.addEventListener(
        "keydown",
        evento => {

            if (
                evento.key !== "Escape"
            ) {

                return;

            }


            document
                .querySelectorAll(
                    ".modal-overlay.show"
                )
                .forEach(modal => {

                    modal.classList.remove(
                        "show"
                    );

                });

        }
    );

}


/* =========================================================
   ABRIR MODAL
   ========================================================= */

function abrirModal(id) {

    const modal =
        document.getElementById(id);


    if (!modal) {

        return;

    }


    modal.classList.add("show");

}


/* =========================================================
   FECHAR MODAL
   ========================================================= */

function fecharModal(id) {

    const modal =
        document.getElementById(id);


    if (!modal) {

        return;

    }


    modal.classList.remove("show");

}
