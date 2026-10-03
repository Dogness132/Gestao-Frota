/* =========================================================
   DOCUMENTAÇÃO
   MÓDULO 7B — INTERFACE / RENDERIZAÇÃO
   ========================================================= */


/* =========================================================
   RENDERIZAÇÃO PRINCIPAL
   ========================================================= */

function renderizarDocumentacao() {

    preencherFiltrosDocumentacao();


    const busca =
        document.getElementById(
            "filtroDocBusca"
        )?.value
            .toLowerCase()
            .trim() || "";


    const area =
        document.getElementById(
            "filtroDocArea"
        )?.value || "";


    const operacao =
        document.getElementById(
            "filtroDocOperacao"
        )?.value || "";


    const statusFiltro =
        document.getElementById(
            "filtroDocStatus"
        )?.value || "";


    const lista =
        frota.filter(
            veiculo => {

                /*
                   BUSCA POR:
                   CV
                   SM1
                   SM2
                */

                if (
                    busca &&
                    !(
                        String(
                            veiculo.cv || ""
                        )
                            .toLowerCase()
                            .includes(busca)

                        ||

                        String(
                            veiculo.sm1 || ""
                        )
                            .toLowerCase()
                            .includes(busca)

                        ||

                        String(
                            veiculo.sm2 || ""
                        )
                            .toLowerCase()
                            .includes(busca)
                    )
                ) {

                    return false;

                }


                /*
                   FILTRO POR ÁREA
                */

                if (
                    area &&
                    veiculo.area !== area
                ) {

                    return false;

                }


                /*
                   FILTRO POR OPERAÇÃO
                */

                if (
                    operacao &&
                    veiculo.operacao !==
                    operacao
                ) {

                    return false;

                }


                /*
                   FILTRO POR STATUS
                */

                if (statusFiltro) {

                    const estados =
                        obterStatusVeiculoDocumentacao(
                            veiculo
                        );


                    if (
                        !estados.includes(
                            statusFiltro
                        )
                    ) {

                        return false;

                    }

                }


                return true;

            }
        );


    const tbody =
        document.getElementById(
            "tabelaDocumentacao"
        );

    if (!tbody) {
        return;
    }


    tbody.innerHTML =
        lista.length

            ? lista
                .map(
                    criarLinhaDocumentacao
                )
                .join("")

            : `
                <tr>
                    <td colspan="8">
                        Nenhum veículo encontrado.
                    </td>
                </tr>
            `;

}


/* =========================================================
   LINHA DA TABELA
   ========================================================= */

function criarLinhaDocumentacao(
    veiculo
) {

    const modal =
        veiculo.modal ||
        descobrirModal(veiculo);


    const equipamentos = [

        {
            nome: "CV",
            placa: veiculo.cv
        }

    ];


    if (veiculo.sm1) {

        equipamentos.push({

            nome: "SM1",
            placa: veiculo.sm1

        });

    }


    if (veiculo.sm2) {

        equipamentos.push({

            nome: "SM2",
            placa: veiculo.sm2

        });

    }


    return equipamentos
        .map(
            equipamento => {

                return `

                    <tr>

                        <td>

                            <strong>
                                ${escapeHtml(
                                    veiculo.cv
                                )}
                            </strong>

                        </td>


                        <td>
                            ${escapeHtml(
                                modal
                            )}
                        </td>


                        <td>

                            <strong>
                                ${escapeHtml(
                                    equipamento.nome
                                )}
                            </strong>

                            <small>
                                ${escapeHtml(
                                    equipamento.placa || "-"
                                )}
                            </small>

                        </td>


                        ${criarCelulaDocumento(
                            veiculo,
                            equipamento.nome,
                            "CIV"
                        )}


                        ${criarCelulaDocumento(
                            veiculo,
                            equipamento.nome,
                            "CIPP"
                        )}


                        ${criarCelulaDocumento(
                            veiculo,
                            equipamento.nome,
                            "CVV"
                        )}


                        ${criarCelulaDocumento(
                            veiculo,
                            equipamento.nome,
                            "Cronotacógrafo"
                        )}


                        ${criarCelulaDocumento(
                            veiculo,
                            equipamento.nome,
                            "Checklist da Base"
                        )}

                    </tr>

                `;

            }
        )
        .join("");

}


/* =========================================================
   CÉLULA DE DOCUMENTO
   ========================================================= */

function criarCelulaDocumento(
    veiculo,
    equipamento,
    tipo
) {

    const aplicavel =
        equipamentoTemDocumento(
            equipamento,
            tipo
        );


    const documento =
        obterDocumento(
            veiculo.id,
            equipamento,
            tipo
        );


    const estado =
        statusDocumento(
            documento,
            aplicavel
        );


    /*
       Documento não aplicável
    */

    if (!aplicavel) {

        return `

            <td>

                <span
                    class="doc-status doc-nao-cadastrado"
                >
                    N/A
                </span>

            </td>

        `;

    }


    const validade =
        documento?.validade
            ? formatarData(
                documento.validade
            )
            : "";


    return `

        <td>

            <button
                type="button"
                class="action-button document-cell"
                onclick="editarDocumento(
                    '${escapeHtml(veiculo.id)}',
                    '${escapeHtml(equipamento)}',
                    '${escapeHtml(tipo)}'
                )"
            >

                <span
                    class="doc-status ${estado.classe}"
                >
                    ${escapeHtml(
                        estado.status
                    )}
                </span>


                ${
                    validade

                        ? `
                            <small>
                                ${escapeHtml(
                                    validade
                                )}
                            </small>
                          `

                        : ""
                }

            </button>

        </td>

    `;

}


/* =========================================================
   EDITAR DOCUMENTO
   ========================================================= */

function editarDocumento(
    veiculoId,
    equipamento,
    tipo
) {

    const documento =
        obterDocumento(
            veiculoId,
            equipamento,
            tipo
        );


    preencherVeiculosDocumentacao();


    const veiculo =
        document.getElementById(
            "docVeiculo"
        );

    if (veiculo) {

        veiculo.value =
            veiculoId;

    }


    const equipamentoSelect =
        document.getElementById(
            "docEquipamento"
        );

    if (equipamentoSelect) {

        equipamentoSelect.value =
            equipamento;

    }


    atualizarDocumentosPermitidos();


    const tipoSelect =
        document.getElementById(
            "docTipo"
        );

    if (tipoSelect) {

        tipoSelect.value =
            tipo;

    }


    const emissao =
        document.getElementById(
            "docEmissao"
        );

    if (emissao) {

        emissao.value =
            documento?.emissao || "";

    }


    const validade =
        document.getElementById(
            "docValidade"
        );

    if (validade) {

        validade.value =
            documento?.validade || "";

    }


    const observacao =
        document.getElementById(
            "docObservacao"
        );

    if (observacao) {

        observacao.value =
            documento?.observacao || "";

    }


    const id =
        document.getElementById(
            "documentacaoId"
        );

    if (id) {

        id.value =
            documento?.id || "";

    }


    atualizarRegraDocumentacao();


    abrirModal(
        "modalDocumentacao"
    );

}


/* =========================================================
   FILTROS DA DOCUMENTAÇÃO
   ========================================================= */

function preencherFiltrosDocumentacao() {

    const area =
        document.getElementById(
            "filtroDocArea"
        );

    if (!area) {
        return;
    }


    const valorAtualArea =
        area.value;


    const areas =
        [
            ...new Set(
                frota
                    .map(
                        v =>
                            v.area
                    )
                    .filter(Boolean)
            )
        ]
            .sort();


    area.innerHTML =
        `
            <option value="">
                Todas
            </option>
        `;


    areas.forEach(
        valor => {

            area.innerHTML +=
                `
                    <option
                        value="${escapeHtml(valor)}"
                    >
                        ${escapeHtml(valor)}
                    </option>
                `;

        }
    );


    if (
        areas.includes(
            valorAtualArea
        )
    ) {

        area.value =
            valorAtualArea;

    }


    /*
       OPERAÇÃO
    */

    const operacao =
        document.getElementById(
            "filtroDocOperacao"
        );

    if (!operacao) {
        return;
    }


    const valorAtualOperacao =
        operacao.value;


    const operacoes =
        frota

            .filter(
                v => {

                    return (
                        !area.value ||
                        v.area ===
                        area.value
                    );

                }
            )

            .map(
                v =>
                    v.operacao
            )

            .filter(Boolean);


    const unicas =
        [
            ...new Set(
                operacoes
            )
        ]
            .sort();


    operacao.innerHTML =
        `
            <option value="">
                Todas
            </option>
        `;


    unicas.forEach(
        valor => {

            operacao.innerHTML +=
                `
                    <option
                        value="${escapeHtml(valor)}"
                    >
                        ${escapeHtml(valor)}
                    </option>
                `;

        }
    );


    if (
        unicas.includes(
            valorAtualOperacao
        )
    ) {

        operacao.value =
            valorAtualOperacao;

    }

}


/* =========================================================
   FILTROS — EVENTOS
   ========================================================= */

function configurarFiltrosDocumentacao() {

    [
        "filtroDocBusca",
        "filtroDocArea",
        "filtroDocOperacao",
        "filtroDocStatus"
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
                    renderizarDocumentacao
                );


                elemento.addEventListener(
                    "change",
                    renderizarDocumentacao
                );

            }
        );

}


/* =========================================================
   RESUMO DE DOCUMENTAÇÃO NO DASHBOARD
   ========================================================= */

function atualizarResumoDocumentacao(
    listaFrota
) {

    const documentosAplicaveis =
        obterDocumentosAplicaveis(
            listaFrota
        );


    const emDia =
        documentosAplicaveis.filter(
            d =>
                d.estado.status ===
                "Em dia"
        ).length;


    const proximo =
        documentosAplicaveis.filter(
            d =>
                d.estado.status ===
                "Próximo do vencimento"
        ).length;


    const vencido =
        documentosAplicaveis.filter(
            d =>
                d.estado.status ===
                "Vencido"
        ).length;


    const naoCadastrado =
        documentosAplicaveis.filter(
            d =>
                d.estado.status ===
                "Não cadastrado"
        ).length;


    setText(
        "docTotalEmDia",
        emDia
    );


    setText(
        "docTotalProximo",
        proximo
    );


    setText(
        "docTotalVencido",
        vencido
    );


    setText(
        "docTotalNaoCadastrado",
        naoCadastrado
    );


    /*
       Painel de próximos vencimentos
    */

    const tabela =
        document.getElementById(
            "tabelaProximosDocumentos"
        );

    if (!tabela) {
        return;
    }


    const proximos =
        documentosAplicaveis

            .filter(
                d =>

                    d.estado.status ===
                    "Vencido"

                    ||

                    d.estado.status ===
                    "Próximo do vencimento"
            )

            .sort(
                compararDocumentos
            )

            .slice(
                0,
                10
            );


    tabela.innerHTML =

        proximos.length

            ? proximos
                .map(
                    d => `

                        <tr>

                            <td>
                                ${escapeHtml(
                                    d.veiculo.cv
                                )}
                            </td>

                            <td>
                                ${escapeHtml(
                                    d.tipo
                                )}
                            </td>

                            <td>
                                ${
                                    d.documento?.validade
                                        ? formatarData(
                                            d.documento.validade
                                        )
                                        : "-"
                                }
                            </td>

                            <td>
                                ${badgeDocumento(
                                    d.estado
                                )}
                            </td>

                        </tr>

                    `
                )
                .join("")

            : `

                <tr>

                    <td colspan="4">
                        Nenhum vencimento próximo.
                    </td>

                </tr>

            `;

}


/* =========================================================
   TOP 10 DOCUMENTOS — DASHBOARD
   ========================================================= */

function renderizarTop10Documentos(
    listaFrota
) {

    const tbody =
        document.getElementById(
            "tabelaTop10Documentos"
        );

    if (!tbody) {
        return;
    }


    const lista =
        obterDocumentosAplicaveis(
            listaFrota
        )

        .filter(
            d =>
                d.documento?.validade
        )

        .sort(
            compararDocumentos
        )

        .slice(
            0,
            10
        );


    tbody.innerHTML =

        lista.length

            ? lista
                .map(
                    d => {

                        const dias =
                            d.estado.dias;


                        return `

                            <tr>

                                <td>

                                    <strong>
                                        ${escapeHtml(
                                            d.veiculo.cv
                                        )}
                                    </strong>

                                </td>


                                <td>
                                    ${escapeHtml(
                                        d.equipamento.nome
                                    )}
                                </td>


                                <td>
                                    ${escapeHtml(
                                        d.tipo
                                    )}
                                </td>


                                <td>
                                    ${formatarData(
                                        d.documento.validade
                                    )}
                                </td>


                                <td>

                                    ${
                                        dias < 0

                                            ? `${Math.abs(dias)} dias atrasado`

                                            : `${dias} dias`

                                    }

                                </td>


                                <td>
                                    ${badgeDocumento(
                                        d.estado
                                    )}
                                </td>

                            </tr>

                        `;

                    }
                )
                .join("")

            : `

                <tr>

                    <td colspan="6">
                        Nenhum documento cadastrado.
                    </td>

                </tr>

            `;

}


/* =========================================================
   BADGE DE DOCUMENTAÇÃO
   ========================================================= */

function badgeDocumento(
    estado
) {

    return `

        <span
            class="doc-status ${estado.classe}"
        >
            ${escapeHtml(
                estado.status
            )}
        </span>

    `;

}
