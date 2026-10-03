/* =========================================================
   MANUTENÇÃO
   ========================================================= */


/* =========================================================
   CARREGAMENTO E PERSISTÊNCIA
   ========================================================= */

function carregarManutencoes() {

    manutencoes =
        lerStorage(
            CHAVE_MANUTENCOES,
            []
        );

}


function salvarManutencoes() {

    salvarStorage(
        CHAVE_MANUTENCOES,
        manutencoes
    );

}


/* =========================================================
   ABRIR FORMULÁRIO
   ========================================================= */

function abrirFormularioManutencao() {

    limparFormulario(
        "formManutencao"
    );


    const id =
        document.getElementById(
            "manutencaoId"
        );

    if (id) {

        id.value = "";

    }


    const entrada =
        document.getElementById(
            "manutencaoEntrada"
        );

    if (entrada) {

        entrada.value =
            dataHoje();

    }


    prepararVeiculoManutencao();


    const titulo =
        document.getElementById(
            "tituloModalManutencao"
        );

    if (titulo) {

        titulo.textContent =
            "Nova manutenção";

    }


    abrirModal(
        "modalManutencao"
    );

}


/* =========================================================
   PREPARAÇÃO DO VEÍCULO
   ========================================================= */

function prepararVeiculoManutencao() {

    /*
       Se o campo inteligente existir,
       a busca inteligente será utilizada.

       Caso ainda exista o select antigo,
       usamos o select normalmente.

       Isso permite fazer a migração
       do HTML depois sem quebrar o módulo.
    */

    if (
        typeof prepararBuscaVeiculoManutencao ===
        "function"
    ) {

        prepararBuscaVeiculoManutencao();

        return;

    }


    preencherVeiculosManutencao();

}


function preencherVeiculosManutencao() {

    const select =
        document.getElementById(
            "manutencaoVeiculo"
        );


    if (!select) return;


    select.innerHTML =
        `<option value="">
            Selecione
        </option>`;


    frota.forEach(
        veiculo => {

            select.innerHTML +=
                `<option value="${escapeHtml(veiculo.id)}">
                    ${escapeHtml(veiculo.cv)}
                </option>`;

        }
    );

}


/* =========================================================
   SALVAR MANUTENÇÃO
   ========================================================= */

function salvarManutencao(evento) {

    evento.preventDefault();


    const id =
        document.getElementById(
            "manutencaoId"
        ).value;


    let veiculoId = "";


    /*
       Primeiro tenta pegar o veículo
       pela busca inteligente.
    */

    const campoBusca =
        document.getElementById(
            "manutencaoVeiculoBusca"
        );


    const campoSelecionado =
        document.getElementById(
            "manutencaoVeiculoSelecionado"
        );


    const campoHidden =
        document.getElementById(
            "manutencaoVeiculo"
        );


    if (
        campoHidden &&
        campoHidden.value
    ) {

        veiculoId =
            campoHidden.value;

    }


    if (
        !veiculoId &&
        campoSelecionado &&
        campoSelecionado.dataset.veiculoId
    ) {

        veiculoId =
            campoSelecionado.dataset.veiculoId;

    }


    /*
       Compatibilidade com o select antigo.
    */

    if (
        !veiculoId &&
        campoHidden &&
        campoHidden.tagName ===
        "SELECT"
    ) {

        veiculoId =
            campoHidden.value;

    }


    if (!veiculoId) {

        alert(
            "Selecione um veículo antes de salvar a manutenção."
        );

        return;

    }


    const veiculo =
        frota.find(
            item =>
                String(item.id) ===
                String(veiculoId)
        );


    if (!veiculo) {

        alert(
            "O veículo selecionado não foi encontrado na frota."
        );

        return;

    }


    const manutencao = {

        id:
            id ||
            `manutencao-${Date.now()}`,

        veiculoId:
            veiculo.id,

        tipo:
            document.getElementById(
                "manutencaoTipo"
            ).value,

        motivo:
            document.getElementById(
                "manutencaoMotivo"
            ).value.trim(),

        entrada:
            document.getElementById(
                "manutencaoEntrada"
            ).value,

        previsao:
            document.getElementById(
                "manutencaoPrevisao"
            ).value,

        saida:
            document.getElementById(
                "manutencaoSaida"
            ).value,

        status:
            document.getElementById(
                "manutencaoStatus"
            ).value,

        observacao:
            document.getElementById(
                "manutencaoObservacao"
            ).value.trim()

    };


    if (id) {

        const indice =
            manutencoes.findIndex(
                item =>
                    String(item.id) ===
                    String(id)
            );


        if (indice >= 0) {

            manutencoes[indice] =
                manutencao;

        }

    } else {

        manutencoes.push(
            manutencao
        );

    }


    salvarManutencoes();


    aplicarStatusManutencao(
        manutencao
    );


    fecharModal(
        "modalManutencao"
    );


    atualizarTudo();

}


/* =========================================================
   APLICAR STATUS DA MANUTENÇÃO
   ========================================================= */

function aplicarStatusManutencao(
    manutencao
) {

    const veiculo =
        frota.find(
            item =>
                String(item.id) ===
                String(
                    manutencao.veiculoId
                )
        );


    if (!veiculo) return;


    /*
       Quando o veículo entra efetivamente
       em manutenção, ele passa para Parado.

       Não alteramos automaticamente
       o status quando a manutenção termina,
       para não sobrescrever uma decisão
       operacional feita pelo usuário.
    */

    if (
        manutencao.status ===
        "Em manutenção"
    ) {

        veiculo.status =
            "Parado";


        if (
            typeof persistirAlteracaoFrota ===
            "function"
        ) {

            persistirAlteracaoFrota(
                veiculo
            );

        }

    }

}


/* =========================================================
   EDITAR MANUTENÇÃO
   ========================================================= */

function editarManutencao(id) {

    const manutencao =
        manutencoes.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!manutencao) return;


    prepararVeiculoManutencao();


    /*
       Campo inteligente
    */

    if (
        typeof selecionarVeiculoManutencao ===
        "function"
    ) {

        selecionarVeiculoManutencao(
            manutencao.veiculoId
        );

    }


    /*
       Select antigo
    */

    const select =
        document.getElementById(
            "manutencaoVeiculo"
        );


    if (
        select &&
        select.tagName ===
        "SELECT"
    ) {

        select.value =
            manutencao.veiculoId;

    }


    const idCampo =
        document.getElementById(
            "manutencaoId"
        );

    if (idCampo) {

        idCampo.value =
            manutencao.id;

    }


    const tipo =
        document.getElementById(
            "manutencaoTipo"
        );

    if (tipo) {

        tipo.value =
            manutencao.tipo;

    }


    const motivo =
        document.getElementById(
            "manutencaoMotivo"
        );

    if (motivo) {

        motivo.value =
            manutencao.motivo;

    }


    const entrada =
        document.getElementById(
            "manutencaoEntrada"
        );

    if (entrada) {

        entrada.value =
            manutencao.entrada || "";

    }


    const previsao =
        document.getElementById(
            "manutencaoPrevisao"
        );

    if (previsao) {

        previsao.value =
            manutencao.previsao || "";

    }


    const saida =
        document.getElementById(
            "manutencaoSaida"
        );

    if (saida) {

        saida.value =
            manutencao.saida || "";

    }


    const status =
        document.getElementById(
            "manutencaoStatus"
        );

    if (status) {

        status.value =
            manutencao.status;

    }


    const observacao =
        document.getElementById(
            "manutencaoObservacao"
        );

    if (observacao) {

        observacao.value =
            manutencao.observacao || "";

    }


    const titulo =
        document.getElementById(
            "tituloModalManutencao"
        );

    if (titulo) {

        titulo.textContent =
            "Editar manutenção";

    }


    abrirModal(
        "modalManutencao"
    );

}


/* =========================================================
   EXCLUIR MANUTENÇÃO
   ========================================================= */

function excluirManutencao(id) {

    if (
        !confirm(
            "Deseja excluir este registro?"
        )
    ) {

        return;

    }


    manutencoes =
        manutencoes.filter(
            item =>
                String(item.id) !==
                String(id)
        );


    salvarManutencoes();


    atualizarTudo();

}


/* =========================================================
   FILTROS
   ========================================================= */

function configurarFiltrosManutencao() {

    [
        "filtroManutencaoBusca",
        "filtroManutencaoStatus",
        "filtroManutencaoTipo"
    ]
        .forEach(
            id => {

                const elemento =
                    document.getElementById(
                        id
                    );


                if (!elemento) {
                    return;
                }


                elemento.addEventListener(
                    "input",
                    renderizarManutencoes
                );


                elemento.addEventListener(
                    "change",
                    renderizarManutencoes
                );

            }
        );

}


/* =========================================================
   RENDERIZAÇÃO
   ========================================================= */

function renderizarManutencoes() {

    const busca =
        document.getElementById(
            "filtroManutencaoBusca"
        )?.value
            .toLowerCase() || "";


    const status =
        document.getElementById(
            "filtroManutencaoStatus"
        )?.value || "";


    const tipo =
        document.getElementById(
            "filtroManutencaoTipo"
        )?.value || "";


    const lista =
        manutencoes.filter(
            manutencao => {

                const veiculo =
                    frota.find(
                        item =>
                            String(
                                item.id
                            ) ===
                            String(
                                manutencao.veiculoId
                            )
                    );


                const cv =
                    String(
                        veiculo?.cv || ""
                    )
                        .toLowerCase();


                const motivo =
                    String(
                        manutencao.motivo ||
                        ""
                    )
                        .toLowerCase();


                if (
                    busca &&
                    !(
                        cv.includes(busca) ||
                        motivo.includes(busca)
                    )
                ) {

                    return false;

                }


                if (
                    status &&
                    manutencao.status !==
                    status
                ) {

                    return false;

                }


                if (
                    tipo &&
                    manutencao.tipo !==
                    tipo
                ) {

                    return false;

                }


                return true;

            }
        );


    const tbody =
        document.getElementById(
            "tabelaManutencoes"
        );


    if (!tbody) return;


    tbody.innerHTML =
        lista
            .map(
                manutencao => {

                    const veiculo =
                        frota.find(
                            item =>
                                String(
                                    item.id
                                ) ===
                                String(
                                    manutencao.veiculoId
                                )
                        );


                    return `

                        <tr>

                            <td>

                                ${escapeHtml(
                                    veiculo?.cv ||
                                    "-"
                                )}

                            </td>


                            <td>

                                ${escapeHtml(
                                    manutencao.tipo
                                )}

                            </td>


                            <td>

                                ${escapeHtml(
                                    manutencao.motivo
                                )}

                            </td>


                            <td>

                                ${formatarData(
                                    manutencao.entrada
                                )}

                            </td>


                            <td>

                                ${formatarData(
                                    manutencao.previsao
                                )}

                            </td>


                            <td>

                                ${formatarData(
                                    manutencao.saida
                                )}

                            </td>


                            <td>

                                ${badgeStatusManutencao(
                                    manutencao.status
                                )}

                            </td>


                            <td>

                                <div class="actions">

                                    <button
                                        class="action-button"
                                        onclick="editarManutencao('${escapeHtml(manutencao.id)}')">
                                        Editar
                                    </button>


                                    <button
                                        class="action-button"
                                        onclick="excluirManutencao('${escapeHtml(manutencao.id)}')">
                                        Excluir
                                    </button>

                                </div>

                            </td>

                        </tr>

                    `;

                }
            )
            .join("");


    atualizarIndicadoresManutencao();

}


/* =========================================================
   INDICADORES
   ========================================================= */

function atualizarIndicadoresManutencao() {

    setText(
        "manutencoesTotal",
        manutencoes.length
    );


    setText(
        "manutencoesEmManutencao",
        manutencoes.filter(
            manutencao =>
                manutencao.status ===
                "Em manutenção"
        ).length
    );


    setText(
        "manutencoesAgendadas",
        manutencoes.filter(
            manutencao =>
                manutencao.status ===
                "Agendada"
        ).length
    );


    setText(
        "manutencoesConcluidas",
        manutencoes.filter(
            manutencao =>
                manutencao.status ===
                "Concluída"
        ).length
    );

}


/* =========================================================
   BADGE
   ========================================================= */

function badgeStatusManutencao(
    status
) {

    let classe =
        "doc-nao-cadastrado";


    if (
        status ===
        "Em manutenção"
    ) {

        classe =
            "doc-vencido";

    }


    if (
        status ===
        "Agendada"
    ) {

        classe =
            "doc-proximo";

    }


    if (
        status ===
        "Concluída"
    ) {

        classe =
            "doc-em-dia";

    }


    return `
        <span class="doc-status ${classe}">
            ${escapeHtml(status)}
        </span>
    `;

}
