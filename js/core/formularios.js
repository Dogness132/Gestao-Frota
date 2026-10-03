/* =========================================================
   GESTÃO DE FROTA
   FORMULÁRIOS E INTERAÇÕES
   ========================================================= */


/* =========================================================
   CONFIGURAÇÃO DOS FORMULÁRIOS
   ========================================================= */

function configurarFormularios() {

    /* -----------------------------------------------------
       NOVO VEÍCULO
       ----------------------------------------------------- */

    const btnNovo =
        document.getElementById(
            "btnNovoVeiculo"
        );

    if (btnNovo) {

        btnNovo.addEventListener(
            "click",
            () => {

                abrirFormularioVeiculo();

            }
        );

    }


    /* -----------------------------------------------------
       HIERARQUIA DO VEÍCULO
       Área → Operação → Suboperação
       ----------------------------------------------------- */

    configurarHierarquiaFormulario(
        "area",
        "operacao",
        "suboperacao"
    );


    /* -----------------------------------------------------
       HIERARQUIA DO MOTORISTA
       Área → Operação → Suboperação
       ----------------------------------------------------- */

    configurarHierarquiaFormulario(
        "motoristaArea",
        "motoristaOperacao",
        "motoristaSuboperacao"
    );


    /* -----------------------------------------------------
       SELEÇÃO DE MOTORISTAS
       ----------------------------------------------------- */

    configurarSelecaoMotoristas();


    /* -----------------------------------------------------
       FORMULÁRIO DE VEÍCULO
       ----------------------------------------------------- */

    const formVeiculo =
        document.getElementById(
            "formVeiculo"
        );

    if (formVeiculo) {

        formVeiculo.addEventListener(
            "submit",
            salvarVeiculo
        );

    }


    /* -----------------------------------------------------
       NOVO MOTORISTA
       ----------------------------------------------------- */

    const btnNovoMotorista =
        document.getElementById(
            "btnNovoMotorista"
        );

    if (btnNovoMotorista) {

        btnNovoMotorista.addEventListener(
            "click",
            abrirFormularioMotorista
        );

    }


    /* -----------------------------------------------------
       FORMULÁRIO DE MOTORISTA
       ----------------------------------------------------- */

    const formMotorista =
        document.getElementById(
            "formMotorista"
        );

    if (formMotorista) {

        formMotorista.addEventListener(
            "submit",
            salvarMotorista
        );

    }


    /* -----------------------------------------------------
       NOVA MANUTENÇÃO
       ----------------------------------------------------- */

    const btnNovaManutencao =
        document.getElementById(
            "btnNovaManutencao"
        );

    if (btnNovaManutencao) {

        btnNovaManutencao.addEventListener(
            "click",
            abrirFormularioManutencao
        );

    }


    /* -----------------------------------------------------
       FORMULÁRIO DE MANUTENÇÃO
       ----------------------------------------------------- */

    const formManutencao =
        document.getElementById(
            "formManutencao"
        );

    if (formManutencao) {

        formManutencao.addEventListener(
            "submit",
            salvarManutencao
        );

    }


    /* -----------------------------------------------------
       NOVA DOCUMENTAÇÃO
       ----------------------------------------------------- */

    const btnNovaDocumentacao =
        document.getElementById(
            "btnNovaDocumentacao"
        );

    if (btnNovaDocumentacao) {

        btnNovaDocumentacao.addEventListener(
            "click",
            abrirFormularioDocumentacao
        );

    }


    /* -----------------------------------------------------
       FORMULÁRIO DE DOCUMENTAÇÃO
       ----------------------------------------------------- */

    const formDocumentacao =
        document.getElementById(
            "formDocumentacao"
        );

    if (formDocumentacao) {

        formDocumentacao.addEventListener(
            "submit",
            salvarDocumento
        );

    }

}


/* =========================================================
   HIERARQUIA DOS FORMULÁRIOS
   ========================================================= */

function configurarHierarquiaFormulario(
    areaId,
    operacaoId,
    suboperacaoId
) {

    const area =
        document.getElementById(
            areaId
        );

    const operacao =
        document.getElementById(
            operacaoId
        );

    const suboperacao =
        document.getElementById(
            suboperacaoId
        );


    if (
        !area ||
        !operacao ||
        !suboperacao
    ) {

        return;

    }


    /* -----------------------------------------------------
       ALTERAÇÃO DA ÁREA
       ----------------------------------------------------- */

    area.addEventListener(
        "change",
        () => {

            preencherOperacaoSelect(
                area.value,
                operacao
            );


            preencherSuboperacaoSelect(
                "",
                "",
                suboperacao
            );


            if (
                areaId === "area"
            ) {

                preencherMotoristasSelects();

            }

        }
    );


    /* -----------------------------------------------------
       ALTERAÇÃO DA OPERAÇÃO
       ----------------------------------------------------- */

    operacao.addEventListener(
        "change",
        () => {

            preencherSuboperacaoSelect(
                area.value,
                operacao.value,
                suboperacao
            );


            if (
                areaId === "area"
            ) {

                preencherMotoristasSelects();

            }

        }
    );


    /* -----------------------------------------------------
       ALTERAÇÃO DA SUBOPERAÇÃO
       ----------------------------------------------------- */

    suboperacao.addEventListener(
        "change",
        () => {

            if (
                areaId === "area"
            ) {

                preencherMotoristasSelects();

            }

        }
    );

}


/* =========================================================
   PREENCHER OPERAÇÕES
   ========================================================= */

function preencherOperacaoSelect(
    area,
    select
) {

    if (!select) {
        return;
    }


    select.innerHTML =
        `
        <option value="">
            Selecione
        </option>
        `;


    select.disabled =
        !area;


    if (!area) {
        return;
    }


    const operacoes =
        Object.keys(
            HIERARQUIA[area] || {}
        );


    operacoes.forEach(
        operacao => {

            select.innerHTML +=
                `
                <option value="${escapeHtml(operacao)}">
                    ${escapeHtml(operacao)}
                </option>
                `;

        }
    );

}


/* =========================================================
   PREENCHER SUBOPERAÇÕES
   ========================================================= */

function preencherSuboperacaoSelect(
    area,
    operacao,
    select
) {

    if (!select) {
        return;
    }


    select.innerHTML =
        `
        <option value="">
            Selecione
        </option>
        `;


    select.disabled =
        !area ||
        !operacao;


    if (
        !area ||
        !operacao
    ) {

        return;

    }


    const suboperacoes =
        HIERARQUIA[area]?.[operacao] || [];


    suboperacoes.forEach(
        sub => {

            select.innerHTML +=
                `
                <option value="${escapeHtml(sub)}">
                    ${escapeHtml(sub)}
                </option>
                `;

        }
    );

}


/* =========================================================
   NOVO VEÍCULO
   ========================================================= */

function abrirFormularioVeiculo() {

    limparFormulario(
        "formVeiculo"
    );


    document.getElementById(
        "veiculoId"
    ).value = "";


    document.getElementById(
        "tituloModalVeiculo"
    ).textContent =
        "Novo veículo";


    preencherOperacaoSelect(
        "",
        document.getElementById(
            "operacao"
        )
    );


    preencherSuboperacaoSelect(
        "",
        "",
        document.getElementById(
            "suboperacao"
        )
    );


    preencherMotoristasSelects();


    abrirModal(
        "modalVeiculo"
    );

}


/* =========================================================
   EDITAR VEÍCULO
   ========================================================= */

function editarVeiculo(id) {

    const veiculo =
        frota.find(
            v =>
                String(v.id) ===
                String(id)
        );


    if (!veiculo) {
        return;
    }


    document.getElementById(
        "veiculoId"
    ).value =
        veiculo.id;


    document.getElementById(
        "cv"
    ).value =
        veiculo.cv || "";


    document.getElementById(
        "sm1"
    ).value =
        veiculo.sm1 || "";


    document.getElementById(
        "sm2"
    ).value =
        veiculo.sm2 || "";


    document.getElementById(
        "modalFrota"
    ).value =
        veiculo.modal || "";


    document.getElementById(
        "capacidade"
    ).value =
        veiculo.capacidade || "";


    document.getElementById(
        "possuiBomba"
    ).value =
        veiculo.possuiBomba || "Não";


    document.getElementById(
        "area"
    ).value =
        veiculo.area || "";


    preencherOperacaoSelect(
        veiculo.area,
        document.getElementById(
            "operacao"
        )
    );


    document.getElementById(
        "operacao"
    ).value =
        veiculo.operacao || "";


    preencherSuboperacaoSelect(
        veiculo.area,
        veiculo.operacao,
        document.getElementById(
            "suboperacao"
        )
    );


    document.getElementById(
        "suboperacao"
    ).value =
        veiculo.suboperacao || "";


    document.getElementById(
        "status"
    ).value =
        veiculo.status || "Reserva";


    preencherMotoristasSelects();


    document.getElementById(
        "motoristaDia"
    ).value =
        veiculo.motoristaDia || "";


    document.getElementById(
        "motoristaNoite"
    ).value =
        veiculo.motoristaNoite || "";


    document.getElementById(
        "tituloModalVeiculo"
    ).textContent =
        "Editar veículo";


    abrirModal(
        "modalVeiculo"
    );

}


/* =========================================================
   SALVAR VEÍCULO
   ========================================================= */

function salvarVeiculo(evento) {

    evento.preventDefault();


    const id =
        document.getElementById(
            "veiculoId"
        ).value;


    const dados = {

        id:
            id ||
            `local-${Date.now()}`,

        cv:
            document.getElementById(
                "cv"
            ).value.trim(),

        sm1:
            document.getElementById(
                "sm1"
            ).value.trim(),

        sm2:
            document.getElementById(
                "sm2"
            ).value.trim(),

        modal:
            document.getElementById(
                "modalFrota"
            ).value,

        capacidade:
            document.getElementById(
                "capacidade"
            ).value,

        possuiBomba:
            document.getElementById(
                "possuiBomba"
            ).value,

        area:
            document.getElementById(
                "area"
            ).value,

        operacao:
            document.getElementById(
                "operacao"
            ).value,

        suboperacao:
            document.getElementById(
                "suboperacao"
            ).value,

        status:
            document.getElementById(
                "status"
            ).value,

        motoristaDia:
            document.getElementById(
                "motoristaDia"
            ).value,

        motoristaNoite:
            document.getElementById(
                "motoristaNoite"
            ).value

    };


    /* -----------------------------------------------------
       NOVO VEÍCULO
       ----------------------------------------------------- */

    if (!id) {

        const adicionais =
            lerStorage(
                CHAVE_FROTA_ADICIONAL,
                []
            );


        adicionais.push(
            dados
        );


        salvarStorage(
            CHAVE_FROTA_ADICIONAL,
            adicionais
        );


        frota.push(
            dados
        );

    }


    /* -----------------------------------------------------
       EDIÇÃO
       ----------------------------------------------------- */

    else {

        const adicionais =
            lerStorage(
                CHAVE_FROTA_ADICIONAL,
                []
            );


        const indiceAdicional =
            adicionais.findIndex(
                v =>
                    String(v.id) ===
                    String(id)
            );


        /* -----------------------------------------------
           VEÍCULO ADICIONADO LOCALMENTE
           ----------------------------------------------- */

        if (
            indiceAdicional >= 0
        ) {

            adicionais[
                indiceAdicional
            ] =
                dados;


            salvarStorage(
                CHAVE_FROTA_ADICIONAL,
                adicionais
            );

        }


        /* -----------------------------------------------
           VEÍCULO DA BASE JSON
           ----------------------------------------------- */

        else {

            const alteracoes =
                lerStorage(
                    CHAVE_FROTA_ALTERACOES,
                    {}
                );


            alteracoes[id] =
                dados;


            salvarStorage(
                CHAVE_FROTA_ALTERACOES,
                alteracoes
            );

        }


        const indiceFrota =
            frota.findIndex(
                v =>
                    String(v.id) ===
                    String(id)
            );


        if (
            indiceFrota >= 0
        ) {

            frota[indiceFrota] =
                dados;

        }

    }


    fecharModal(
        "modalVeiculo"
    );


    atualizarTudo();

}


/* =========================================================
   SELEÇÃO DE MOTORISTAS
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


/* =========================================================
   PREENCHER MOTORISTAS
   ========================================================= */

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


    function filtrar(
        turno
    ) {

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


    /* -----------------------------------------------------
       MOTORISTA DIA
       ----------------------------------------------------- */

    if (dia) {

        const atual =
            dia.value;


        dia.innerHTML =
            `
            <option value="">
                Sem motorista
            </option>
            `;


        filtrar(
            "Dia"
        )
            .forEach(
                motorista => {

                    dia.innerHTML +=
                        `
                        <option value="${escapeHtml(motorista.id)}">
                            ${escapeHtml(motorista.nome)}
                        </option>
                        `;

                }
            );


        if (
            [
                ...dia.options
            ]
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


    /* -----------------------------------------------------
       MOTORISTA NOITE
       ----------------------------------------------------- */

    if (noite) {

        const atual =
            noite.value;


        noite.innerHTML =
            `
            <option value="">
                Sem motorista
            </option>
            `;


        filtrar(
            "Noite"
        )
            .forEach(
                motorista => {

                    noite.innerHTML +=
                        `
                        <option value="${escapeHtml(motorista.id)}">
                            ${escapeHtml(motorista.nome)}
                        </option>
                        `;

                }
            );


        if (
            [
                ...noite.options
            ]
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
