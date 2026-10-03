/* =========================================================
   MOTORISTAS
   ========================================================= */


/* =========================================================
   CARREGAMENTO E PERSISTÊNCIA
   ========================================================= */

function carregarMotoristas() {

    motoristas =
        lerStorage(
            CHAVE_MOTORISTAS,
            []
        );

}


function salvarMotoristas() {

    salvarStorage(
        CHAVE_MOTORISTAS,
        motoristas
    );

}


/* =========================================================
   MOTORISTAS — SELECTS DA FROTA
   ========================================================= */

function configurarSelecaoMotoristas() {

    const dia =
        document.getElementById(
            "motoristaDia"
        );

    const noite =
        document.getElementById(
            "motoristaNoite"
        );


    if (dia) {

        dia.addEventListener(
            "focus",
            preencherMotoristasSelects
        );

    }


    if (noite) {

        noite.addEventListener(
            "focus",
            preencherMotoristasSelects
        );

    }

}


function preencherMotoristasSelects() {

    const area =
        document.getElementById(
            "area"
        )?.value || "";


    const operacao =
        document.getElementById(
            "operacao"
        )?.value || "";


    const suboperacao =
        document.getElementById(
            "suboperacao"
        )?.value || "";


    const dia =
        document.getElementById(
            "motoristaDia"
        );


    const noite =
        document.getElementById(
            "motoristaNoite"
        );


    function filtrar(turno) {

        return motoristas.filter(
            motorista => {

                if (
                    motorista.status !==
                    "Ativo"
                ) {
                    return false;
                }


                if (
                    motorista.turno !==
                    turno
                ) {
                    return false;
                }


                if (
                    area &&
                    motorista.area !== area
                ) {
                    return false;
                }


                if (
                    operacao &&
                    motorista.operacao !==
                    operacao
                ) {
                    return false;
                }


                if (
                    suboperacao &&
                    motorista.suboperacao !==
                    suboperacao
                ) {
                    return false;
                }


                return true;

            }
        );

    }


    if (dia) {

        const atual =
            dia.value;


        dia.innerHTML =
            `<option value="">
                Sem motorista
            </option>`;


        filtrar("Dia")
            .forEach(
                motorista => {

                    dia.innerHTML +=
                        `<option value="${escapeHtml(motorista.id)}">
                            ${escapeHtml(motorista.nome)}
                        </option>`;

                }
            );


        if (
            [...dia.options]
                .some(
                    option =>
                        option.value ===
                        atual
                )
        ) {

            dia.value =
                atual;

        }

    }


    if (noite) {

        const atual =
            noite.value;


        noite.innerHTML =
            `<option value="">
                Sem motorista
            </option>`;


        filtrar("Noite")
            .forEach(
                motorista => {

                    noite.innerHTML +=
                        `<option value="${escapeHtml(motorista.id)}">
                            ${escapeHtml(motorista.nome)}
                        </option>`;

                }
            );


        if (
            [...noite.options]
                .some(
                    option =>
                        option.value ===
                        atual
                )
        ) {

            noite.value =
                atual;

        }

    }

}


/* =========================================================
   MOTORISTAS — FORMULÁRIO
   ========================================================= */

function abrirFormularioMotorista() {

    limparFormulario(
        "formMotorista"
    );


    document.getElementById(
        "motoristaId"
    ).value = "";


    document.getElementById(
        "tituloModalMotorista"
    ).textContent =
        "Novo motorista";


    preencherOperacaoSelect(
        "",
        document.getElementById(
            "motoristaOperacao"
        )
    );


    preencherSuboperacaoSelect(
        "",
        "",
        document.getElementById(
            "motoristaSuboperacao"
        )
    );


    abrirModal(
        "modalMotorista"
    );

}


function salvarMotorista(evento) {

    evento.preventDefault();


    const id =
        document.getElementById(
            "motoristaId"
        ).value;


    const motorista = {

        id:
            id ||
            `motorista-${Date.now()}`,

        nome:
            document.getElementById(
                "motoristaNome"
            ).value.trim(),

        area:
            document.getElementById(
                "motoristaArea"
            ).value,

        operacao:
            document.getElementById(
                "motoristaOperacao"
            ).value,

        suboperacao:
            document.getElementById(
                "motoristaSuboperacao"
            ).value,

        tipo:
            document.getElementById(
                "motoristaTipo"
            ).value,

        turno:
            document.getElementById(
                "motoristaTurno"
            ).value,

        status:
            document.getElementById(
                "motoristaStatus"
            ).value,

        observacao:
            document.getElementById(
                "motoristaObservacao"
            ).value.trim()

    };


    if (id) {

        const indice =
            motoristas.findIndex(
                motoristaAtual =>
                    String(
                        motoristaAtual.id
                    ) ===
                    String(id)
            );


        if (indice >= 0) {

            motoristas[indice] =
                motorista;

        }

    } else {

        motoristas.push(
            motorista
        );

    }


    salvarMotoristas();


    fecharModal(
        "modalMotorista"
    );


    preencherMotoristasSelects();


    atualizarTudo();

}


/* =========================================================
   MOTORISTAS — EDIÇÃO
   ========================================================= */

function editarMotorista(id) {

    const motorista =
        motoristas.find(
            motoristaAtual =>
                String(
                    motoristaAtual.id
                ) ===
                String(id)
        );


    if (!motorista) return;


    document.getElementById(
        "motoristaId"
    ).value =
        motorista.id;


    document.getElementById(
        "motoristaNome"
    ).value =
        motorista.nome;


    document.getElementById(
        "motoristaArea"
    ).value =
        motorista.area;


    preencherOperacaoSelect(
        motorista.area,
        document.getElementById(
            "motoristaOperacao"
        )
    );


    document.getElementById(
        "motoristaOperacao"
    ).value =
        motorista.operacao;


    preencherSuboperacaoSelect(
        motorista.area,
        motorista.operacao,
        document.getElementById(
            "motoristaSuboperacao"
        )
    );


    document.getElementById(
        "motoristaSuboperacao"
    ).value =
        motorista.suboperacao;


    document.getElementById(
        "motoristaTipo"
    ).value =
        motorista.tipo;


    document.getElementById(
        "motoristaTurno"
    ).value =
        motorista.turno;


    document.getElementById(
        "motoristaStatus"
    ).value =
        motorista.status;


    document.getElementById(
        "motoristaObservacao"
    ).value =
        motorista.observacao || "";


    document.getElementById(
        "tituloModalMotorista"
    ).textContent =
        "Editar motorista";


    abrirModal(
        "modalMotorista"
    );

}


/* =========================================================
   MOTORISTAS — EXCLUSÃO
   ========================================================= */

function excluirMotorista(id) {

    if (
        !confirm(
            "Deseja realmente excluir este motorista?"
        )
    ) {

        return;

    }


    motoristas =
        motoristas.filter(
            motorista =>
                String(
                    motorista.id
                ) !==
                String(id)
        );


    salvarMotoristas();


    atualizarTudo();

}


/* =========================================================
   MOTORISTAS — FILTROS
   ========================================================= */

function configurarFiltrosMotoristas() {

    [
        "filtroMotoristaBusca",
        "filtroMotoristaArea",
        "filtroMotoristaOperacao",
        "filtroMotoristaTipo",
        "filtroMotoristaTurno",
        "filtroMotoristaStatus"
    ]
        .forEach(
            id => {

                const elemento =
                    document.getElementById(
                        id
                    );


                if (elemento) {

                    elemento.addEventListener(
                        "input",
                        renderizarMotoristas
                    );


                    elemento.addEventListener(
                        "change",
                        renderizarMotoristas
                    );

                }

            }
        );


    const area =
        document.getElementById(
            "filtroMotoristaArea"
        );


    if (area) {

        area.innerHTML =
            `<option value="">
                Todas
            </option>`;


        [
            ...new Set(
                motoristas
                    .map(
                        motorista =>
                            motorista.area
                    )
                    .filter(Boolean)
            )
        ]
            .sort()
            .forEach(
                valor => {

                    area.innerHTML +=
                        `<option value="${escapeHtml(valor)}">
                            ${escapeHtml(valor)}
                        </option>`;

                }
            );

    }


    const operacao =
        document.getElementById(
            "filtroMotoristaOperacao"
        );


    if (operacao) {

        operacao.addEventListener(
            "change",
            () => {

                renderizarMotoristas();

            }
        );

    }

}


/* =========================================================
   MOTORISTAS — RENDERIZAÇÃO
   ========================================================= */

function renderizarMotoristas() {

    const busca =
        document.getElementById(
            "filtroMotoristaBusca"
        )?.value
            .toLowerCase() || "";


    const area =
        document.getElementById(
            "filtroMotoristaArea"
        )?.value || "";


    const operacao =
        document.getElementById(
            "filtroMotoristaOperacao"
        )?.value || "";


    const tipo =
        document.getElementById(
            "filtroMotoristaTipo"
        )?.value || "";


    const turno =
        document.getElementById(
            "filtroMotoristaTurno"
        )?.value || "";


    const status =
        document.getElementById(
            "filtroMotoristaStatus"
        )?.value || "";


    const lista =
        motoristas.filter(
            motorista => {

                if (
                    busca &&
                    !String(
                        motorista.nome || ""
                    )
                        .toLowerCase()
                        .includes(busca)
                ) {

                    return false;

                }


                if (
                    area &&
                    motorista.area !==
                    area
                ) {

                    return false;

                }


                if (
                    operacao &&
                    motorista.operacao !==
                    operacao
                ) {

                    return false;

                }


                if (
                    tipo &&
                    motorista.tipo !==
                    tipo
                ) {

                    return false;

                }


                if (
                    turno &&
                    motorista.turno !==
                    turno
                ) {

                    return false;

                }


                if (
                    status &&
                    motorista.status !==
                    status
                ) {

                    return false;

                }


                return true;

            }
        );


    const tbody =
        document.getElementById(
            "tabelaMotoristas"
        );


    if (!tbody) return;


    tbody.innerHTML =
        lista
            .map(
                motorista => {

                    return `

                        <tr>

                            <td>

                                <strong>
                                    ${escapeHtml(
                                        motorista.nome
                                    )}
                                </strong>

                            </td>


                            <td>

                                ${escapeHtml(
                                    motorista.area
                                )}

                            </td>


                            <td>

                                ${escapeHtml(
                                    motorista.operacao
                                )}

                            </td>


                            <td>

                                ${escapeHtml(
                                    motorista.suboperacao
                                )}

                            </td>


                            <td>

                                ${escapeHtml(
                                    motorista.tipo
                                )}

                            </td>


                            <td>

                                ${escapeHtml(
                                    motorista.turno
                                )}

                            </td>


                            <td>

                                ${badgeStatusMotorista(
                                    motorista.status
                                )}

                            </td>


                            <td>

                                <div class="actions">

                                    <button
                                        class="action-button"
                                        onclick="editarMotorista('${escapeHtml(motorista.id)}')">
                                        Editar
                                    </button>


                                    <button
                                        class="action-button"
                                        onclick="excluirMotorista('${escapeHtml(motorista.id)}')">
                                        Excluir
                                    </button>

                                </div>

                            </td>

                        </tr>

                    `;

                }
            )
            .join("");


    atualizarIndicadoresMotoristas();

}


/* =========================================================
   MOTORISTAS — INDICADORES
   ========================================================= */

function atualizarIndicadoresMotoristas() {

    setText(
        "motoristasTotal",
        motoristas.length
    );


    setText(
        "motoristasAtivos",
        motoristas.filter(
            motorista =>
                motorista.status ===
                "Ativo"
        ).length
    );


    setText(
        "motoristasFixos",
        motoristas.filter(
            motorista =>
                motorista.tipo ===
                "Fixo"
        ).length
    );


    setText(
        "motoristasReservas",
        motoristas.filter(
            motorista =>
                motorista.tipo ===
                "Reserva"
        ).length
    );

}


/* =========================================================
   MOTORISTAS — BADGE
   ========================================================= */

function badgeStatusMotorista(
    status
) {

    let classe =
        "doc-nao-cadastrado";


    if (
        status === "Ativo"
    ) {

        classe =
            "doc-em-dia";

    }


    if (
        status === "Afastado"
    ) {

        classe =
            "doc-proximo";

    }


    if (
        status === "Inativo"
    ) {

        classe =
            "doc-vencido";

    }


    return `
        <span class="doc-status ${classe}">
            ${escapeHtml(status)}
        </span>
    `;

}
