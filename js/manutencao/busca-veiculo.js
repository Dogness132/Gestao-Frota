/* =========================================================
   BUSCA INTELIGENTE DE VEÍCULO — MANUTENÇÃO
   ========================================================= */


/* =========================================================
   CONFIGURAÇÃO
   ========================================================= */

const LIMITE_SUGESTOES_VEICULO =
    8;


/* =========================================================
   CONFIGURAR BUSCA
   ========================================================= */

function configurarBuscaVeiculoManutencao() {

    const busca =
        document.getElementById(
            "manutencaoVeiculoBusca"
        );


    const hidden =
        document.getElementById(
            "manutencaoVeiculo"
        );


    const sugestoes =
        document.getElementById(
            "manutencaoVeiculoSugestoes"
        );


    if (
        !busca ||
        !hidden ||
        !sugestoes
    ) {

        return;

    }


    busca.addEventListener(
        "input",
        () => {

            /*
               Se o usuário alterar o texto
               depois de selecionar um veículo,
               removemos a seleção anterior.
            */

            hidden.value = "";


            const selecionado =
                document.getElementById(
                    "manutencaoVeiculoSelecionado"
                );


            if (selecionado) {

                selecionado.innerHTML =
                    "";

                selecionado.dataset.veiculoId =
                    "";

            }


            renderizarSugestoesVeiculoManutencao();

        }
    );


    busca.addEventListener(
        "focus",
        () => {

            renderizarSugestoesVeiculoManutencao();

        }
    );


    document.addEventListener(
        "click",
        evento => {

            const dentroBusca =
                busca.contains(
                    evento.target
                );


            const dentroSugestoes =
                sugestoes.contains(
                    evento.target
                );


            if (
                !dentroBusca &&
                !dentroSugestoes
            ) {

                sugestoes.innerHTML =
                    "";

            }

        }
    );

}


/* =========================================================
   PREPARAR BUSCA
   ========================================================= */

function prepararBuscaVeiculoManutencao() {

    const busca =
        document.getElementById(
            "manutencaoVeiculoBusca"
        );


    const hidden =
        document.getElementById(
            "manutencaoVeiculo"
        );


    const sugestoes =
        document.getElementById(
            "manutencaoVeiculoSugestoes"
        );


    if (
        !busca ||
        !hidden ||
        !sugestoes
    ) {

        /*
           O HTML antigo ainda usa
           o select tradicional.
        */

        if (
            typeof preencherVeiculosManutencao ===
            "function"
        ) {

            preencherVeiculosManutencao();

        }

        return;

    }


    busca.value = "";


    hidden.value = "";


    const selecionado =
        document.getElementById(
            "manutencaoVeiculoSelecionado"
        );


    if (selecionado) {

        selecionado.innerHTML =
            "";

        selecionado.dataset.veiculoId =
            "";

    }


    sugestoes.innerHTML =
        "";

}


/* =========================================================
   NORMALIZAR TEXTO
   ========================================================= */

function normalizarBuscaVeiculo(
    valor
) {

    return String(
        valor || ""
    )
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .toLowerCase()
        .trim();

}


/* =========================================================
   CAMPOS PESQUISÁVEIS
   ========================================================= */

function obterTextoVeiculoBusca(
    veiculo
) {

    return [

        veiculo.cv,

        veiculo.sm1,

        veiculo.sm2,

        veiculo.modal,

        veiculo.area,

        veiculo.operacao,

        veiculo.suboperacao

    ]
        .filter(Boolean)
        .join(" ");

}


/* =========================================================
   BUSCAR VEÍCULOS
   ========================================================= */

function buscarVeiculosManutencao(
    termo
) {

    const busca =
        normalizarBuscaVeiculo(
            termo
        );


    if (!busca) {

        return frota.slice(
            0,
            LIMITE_SUGESTOES_VEICULO
        );

    }


    return frota
        .filter(
            veiculo => {

                const texto =
                    normalizarBuscaVeiculo(
                        obterTextoVeiculoBusca(
                            veiculo
                        )
                    );


                return texto.includes(
                    busca
                );

            }
        )
        .slice(
            0,
            LIMITE_SUGESTOES_VEICULO
        );

}


/* =========================================================
   RENDERIZAR SUGESTÕES
   ========================================================= */

function renderizarSugestoesVeiculoManutencao() {

    const busca =
        document.getElementById(
            "manutencaoVeiculoBusca"
        );


    const sugestoes =
        document.getElementById(
            "manutencaoVeiculoSugestoes"
        );


    if (
        !busca ||
        !sugestoes
    ) {

        return;

    }


    const lista =
        buscarVeiculosManutencao(
            busca.value
        );


    if (!lista.length) {

        sugestoes.innerHTML =
            `
                <div class="search-empty">
                    Nenhum veículo encontrado.
                </div>
            `;

        return;

    }


    sugestoes.innerHTML =
        lista
            .map(
                veiculo => {

                    return `

                        <button
                            type="button"
                            class="vehicle-search-option"
                            data-veiculo-id="${escapeHtml(veiculo.id)}">

                            <div>

                                <strong>
                                    ${escapeHtml(
                                        veiculo.cv ||
                                        "-"
                                    )}
                                </strong>

                                <span>
                                    ${escapeHtml(
                                        veiculo.modal ||
                                        "-"
                                    )}
                                </span>

                            </div>


                            <small>

                                ${escapeHtml(
                                    veiculo.sm1 ||
                                    "-"
                                )}

                                ·

                                ${escapeHtml(
                                    veiculo.sm2 ||
                                    "-"
                                )}

                            </small>

                        </button>

                    `;

                }
            )
            .join("");


    sugestoes
        .querySelectorAll(
            "[data-veiculo-id]"
        )
        .forEach(
            botao => {

                botao.addEventListener(
                    "click",
                    () => {

                        selecionarVeiculoManutencao(
                            botao.dataset.veiculoId
                        );

                    }
                );

            }
        );

}


/* =========================================================
   SELECIONAR VEÍCULO
   ========================================================= */

function selecionarVeiculoManutencao(
    id
) {

    const veiculo =
        frota.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!veiculo) {

        return;

    }


    const busca =
        document.getElementById(
            "manutencaoVeiculoBusca"
        );


    const hidden =
        document.getElementById(
            "manutencaoVeiculo"
        );


    const sugestoes =
        document.getElementById(
            "manutencaoVeiculoSugestoes"
        );


    const selecionado =
        document.getElementById(
            "manutencaoVeiculoSelecionado"
        );


    /*
       Caso exista o select antigo,
       também mantemos seu valor.
    */

    if (
        hidden &&
        hidden.tagName ===
        "SELECT"
    ) {

        hidden.value =
            veiculo.id;

    }


    /*
       Caso seja o hidden do
       novo componente.
    */

    if (
        hidden &&
        hidden.tagName !==
        "SELECT"
    ) {

        hidden.value =
            veiculo.id;

    }


    if (busca) {

        busca.value =
            veiculo.cv || "";

    }


    if (selecionado) {

        selecionado.dataset.veiculoId =
            veiculo.id;


        selecionado.innerHTML = `

            <div class="vehicle-selected-main">

                <strong>
                    ${escapeHtml(
                        veiculo.cv ||
                        "-"
                    )}
                </strong>

                <span>
                    ${escapeHtml(
                        veiculo.modal ||
                        "-"
                    )}
                </span>

            </div>


            <div class="vehicle-selected-details">

                <span>
                    SM1:
                    ${escapeHtml(
                        veiculo.sm1 ||
                        "-"
                    )}
                </span>

                <span>
                    SM2:
                    ${escapeHtml(
                        veiculo.sm2 ||
                        "-"
                    )}
                </span>

                <span>
                    ${escapeHtml(
                        veiculo.area ||
                        ""
                    )}
                </span>

                <span>
                    ${escapeHtml(
                        veiculo.operacao ||
                        ""
                    )}
                </span>

                <span>
                    ${escapeHtml(
                        veiculo.suboperacao ||
                        ""
                    )}
                </span>

            </div>

        `;

    }


    if (sugestoes) {

        sugestoes.innerHTML =
            "";

    }

}


/* =========================================================
   LIMPAR SELEÇÃO
   ========================================================= */

function limparSelecaoVeiculoManutencao() {

    const busca =
        document.getElementById(
            "manutencaoVeiculoBusca"
        );


    const hidden =
        document.getElementById(
            "manutencaoVeiculo"
        );


    const sugestoes =
        document.getElementById(
            "manutencaoVeiculoSugestoes"
        );


    const selecionado =
        document.getElementById(
            "manutencaoVeiculoSelecionado"
        );


    if (busca) {

        busca.value =
            "";

    }


    if (hidden) {

        hidden.value =
            "";

    }


    if (selecionado) {

        selecionado.innerHTML =
            "";

        selecionado.dataset.veiculoId =
            "";

    }


    if (sugestoes) {

        sugestoes.innerHTML =
            "";

    }

}


/* =========================================================
   VALIDAR VEÍCULO SELECIONADO
   ========================================================= */

function validarVeiculoManutencao() {

    const hidden =
        document.getElementById(
            "manutencaoVeiculo"
        );


    if (!hidden) {

        return false;

    }


    const id =
        hidden.value;


    if (!id) {

        return false;

    }


    return Boolean(
        frota.find(
            veiculo =>
                String(veiculo.id) ===
                String(id)
        )
    );

}
