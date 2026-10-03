/* =========================================================
   DOCUMENTAÇÃO
   MÓDULO 7A — DADOS E REGRAS
   ========================================================= */


/* =========================================================
   CONSTANTES
   ========================================================= */

const DOCUMENTOS = [
    "CIV",
    "CIPP",
    "CVV",
    "Cronotacógrafo",
    "Checklist da Base"
];


/* =========================================================
   CARREGAMENTO / PERSISTÊNCIA
   ========================================================= */

function carregarDocumentos() {

    documentos =
        lerStorage(
            CHAVE_DOCUMENTOS,
            []
        );

}


function salvarDocumentos() {

    salvarStorage(
        CHAVE_DOCUMENTOS,
        documentos
    );

}


/* =========================================================
   REGRAS DE APLICABILIDADE
   ========================================================= */

function equipamentoTemDocumento(
    equipamento,
    documento
) {

    /*
       REGRA DO SISTEMA:

       CV = Cavalo

       CIPP e CVV NÃO são cobrados
       do cavalo.

       Portanto:

       CV + CIV                  = válido
       CV + CIPP                 = não aplicável
       CV + CVV                  = não aplicável
       CV + Cronotacógrafo       = válido
       CV + Checklist da Base    = válido

       SM1 / SM2:

       Todos os documentos podem
       ser cadastrados.
    */


    if (
        equipamento === "CV" &&
        (
            documento === "CIPP" ||
            documento === "CVV"
        )
    ) {

        return false;

    }


    return true;

}


/* =========================================================
   CONFIGURAÇÃO DAS REGRAS DO FORMULÁRIO
   ========================================================= */

function configurarRegrasDocumentacao() {

    const equipamento =
        document.getElementById(
            "docEquipamento"
        );

    const documento =
        document.getElementById(
            "docTipo"
        );

    const veiculo =
        document.getElementById(
            "docVeiculo"
        );


    if (veiculo) {

        veiculo.addEventListener(
            "change",
            atualizarRegraDocumentacao
        );

    }


    if (equipamento) {

        equipamento.addEventListener(
            "change",
            () => {

                atualizarDocumentosPermitidos();
                atualizarRegraDocumentacao();

            }
        );

    }


    if (documento) {

        documento.addEventListener(
            "change",
            atualizarRegraDocumentacao
        );

    }

}


/* =========================================================
   DOCUMENTOS PERMITIDOS
   ========================================================= */

function atualizarDocumentosPermitidos() {

    const equipamento =
        document.getElementById(
            "docEquipamento"
        )?.value;


    const documento =
        document.getElementById(
            "docTipo"
        );

    if (!documento) {
        return;
    }


    [
        ...documento.options
    ]
        .forEach(option => {

            const permitido =
                equipamentoTemDocumento(
                    equipamento,
                    option.value
                );

            option.disabled =
                !permitido;

        });


    /*
       Se o documento atualmente selecionado
       deixou de ser aplicável, volta para CIV.
    */

    if (
        !equipamentoTemDocumento(
            equipamento,
            documento.value
        )
    ) {

        documento.value = "CIV";

    }

}


/* =========================================================
   TEXTO DA REGRA NO FORMULÁRIO
   ========================================================= */

function atualizarRegraDocumentacao() {

    const equipamento =
        document.getElementById(
            "docEquipamento"
        )?.value || "";


    const documento =
        document.getElementById(
            "docTipo"
        )?.value || "";


    const regra =
        document.getElementById(
            "docRegra"
        );

    if (!regra) {
        return;
    }


    /*
       CIPP / CVV no CV
    */

    if (
        equipamento === "CV" &&
        (
            documento === "CIPP" ||
            documento === "CVV"
        )
    ) {

        regra.textContent =
            "Este documento não se aplica ao cavalo (CV).";

        return;

    }


    /*
       Checklist da Base
    */

    if (
        documento ===
        "Checklist da Base"
    ) {

        regra.textContent =
            "O Checklist da Base possui validade de 1 ano.";

        return;

    }


    regra.textContent =
        "Documento aplicável ao equipamento selecionado.";

}


/* =========================================================
   ABRIR FORMULÁRIO — NOVO DOCUMENTO
   ========================================================= */

function abrirFormularioDocumentacao() {

    limparFormulario(
        "formDocumentacao"
    );


    const id =
        document.getElementById(
            "documentacaoId"
        );

    if (id) {
        id.value = "";
    }


    preencherVeiculosDocumentacao();


    const equipamento =
        document.getElementById(
            "docEquipamento"
        );

    if (equipamento) {
        equipamento.value = "CV";
    }


    const tipo =
        document.getElementById(
            "docTipo"
        );

    if (tipo) {
        tipo.value = "CIV";
    }


    atualizarDocumentosPermitidos();
    atualizarRegraDocumentacao();


    abrirModal(
        "modalDocumentacao"
    );

}


/* =========================================================
   ABRIR DOCUMENTAÇÃO DE UM VEÍCULO
   ========================================================= */

function abrirDocumentacaoVeiculo(id) {

    abrirPagina(
        "documentacao"
    );


    const veiculo =
        frota.find(
            v =>
                String(v.id) ===
                String(id)
        );

    if (!veiculo) {
        return;
    }


    const busca =
        document.getElementById(
            "filtroDocBusca"
        );

    if (busca) {

        busca.value =
            veiculo.cv;

    }


    renderizarDocumentacao();

}


/* =========================================================
   PREENCHER VEÍCULOS DO FORMULÁRIO
   ========================================================= */

function preencherVeiculosDocumentacao() {

    const select =
        document.getElementById(
            "docVeiculo"
        );

    if (!select) {
        return;
    }


    select.innerHTML =
        `
            <option value="">
                Selecione
            </option>
        `;


    frota.forEach(
        veiculo => {

            select.innerHTML +=
                `
                    <option
                        value="${escapeHtml(veiculo.id)}"
                    >
                        ${escapeHtml(
                            veiculo.cv
                        )}
                        —
                        ${escapeHtml(
                            veiculo.modal ||
                            descobrirModal(veiculo)
                        )}
                    </option>
                `;

        }
    );

}


/* =========================================================
   SALVAR DOCUMENTO
   ========================================================= */

function salvarDocumento(evento) {

    evento.preventDefault();


    const equipamento =
        document.getElementById(
            "docEquipamento"
        ).value;


    const tipo =
        document.getElementById(
            "docTipo"
        ).value;


    /*
       Validação da aplicabilidade
    */

    if (
        !equipamentoTemDocumento(
            equipamento,
            tipo
        )
    ) {

        alert(
            "Este documento não se aplica ao equipamento selecionado."
        );

        return;

    }


    const veiculoId =
        document.getElementById(
            "docVeiculo"
        ).value;


    if (!veiculoId) {

        alert(
            "Selecione o veículo."
        );

        return;

    }


    const validade =
        document.getElementById(
            "docValidade"
        ).value;


    if (!validade) {

        alert(
            "Informe a data de validade."
        );

        return;

    }


    const id =
        document.getElementById(
            "documentacaoId"
        ).value;


    const documento = {

        id:
            id ||
            `doc-${Date.now()}`,

        veiculoId,

        equipamento,

        tipo,

        emissao:
            document.getElementById(
                "docEmissao"
            ).value,

        validade,

        observacao:
            document.getElementById(
                "docObservacao"
            ).value.trim()

    };


    /*
       Não permite duplicidade:

       mesmo veículo
       +
       mesmo equipamento
       +
       mesmo documento

       Nesse caso atualiza o registro existente.
    */

    const existente =
        documentos.findIndex(
            d =>

                String(
                    d.veiculoId
                ) ===
                String(
                    documento.veiculoId
                )

                &&

                d.equipamento ===
                documento.equipamento

                &&

                d.tipo ===
                documento.tipo
        );


    if (existente >= 0) {

        documentos[existente] = {

            ...documentos[existente],

            ...documento

        };

    } else {

        documentos.push(
            documento
        );

    }


    salvarDocumentos();


    fecharModal(
        "modalDocumentacao"
    );


    atualizarTudo();

}


/* =========================================================
   LOCALIZAR DOCUMENTO
   ========================================================= */

function obterDocumento(
    veiculoId,
    equipamento,
    tipo
) {

    return documentos.find(
        documento =>

            String(
                documento.veiculoId
            ) ===
            String(
                veiculoId
            )

            &&

            documento.equipamento ===
            equipamento

            &&

            documento.tipo ===
            tipo
    );

}


/* =========================================================
   CALCULAR STATUS DO DOCUMENTO
   ========================================================= */

function statusDocumento(
    documento,
    aplicavel = true
) {

    /*
       Documento não aplicável
    */

    if (!aplicavel) {

        return {

            status: "N/A",

            classe:
                "doc-nao-cadastrado",

            dias: null

        };

    }


    /*
       Documento ainda não cadastrado
    */

    if (
        !documento ||
        !documento.validade
    ) {

        return {

            status:
                "Não cadastrado",

            classe:
                "doc-nao-cadastrado",

            dias: null

        };

    }


    const validade =
        dataLocal(
            documento.validade
        );


    const hoje =
        dataLocal(
            dataHoje()
        );


    const diferenca =
        Math.ceil(
            (
                validade -
                hoje
            ) /
            86400000
        );


    /*
       Vencido
    */

    if (
        diferenca < 0
    ) {

        return {

            status:
                "Vencido",

            classe:
                "doc-vencido",

            dias:
                diferenca

        };

    }


    /*
       Próximo do vencimento
       até 30 dias
    */

    if (
        diferenca <= 30
    ) {

        return {

            status:
                "Próximo do vencimento",

            classe:
                "doc-proximo",

            dias:
                diferenca

        };

    }


    /*
       Em dia
    */

    return {

        status:
            "Em dia",

        classe:
            "doc-em-dia",

        dias:
            diferenca

    };

}


/* =========================================================
   DOCUMENTOS APLICÁVEIS DA FROTA
   ========================================================= */

function obterDocumentosAplicaveis(
    listaFrota
) {

    const resultado = [];


    listaFrota.forEach(
        veiculo => {

            const equipamentos = [

                {
                    nome: "CV",

                    placa:
                        veiculo.cv
                }

            ];


            if (veiculo.sm1) {

                equipamentos.push({

                    nome: "SM1",

                    placa:
                        veiculo.sm1

                });

            }


            if (veiculo.sm2) {

                equipamentos.push({

                    nome: "SM2",

                    placa:
                        veiculo.sm2

                });

            }


            equipamentos.forEach(
                equipamento => {

                    DOCUMENTOS.forEach(
                        tipo => {

                            /*
                               Verifica se o documento
                               realmente se aplica ao
                               equipamento.
                            */

                            if (
                                !equipamentoTemDocumento(
                                    equipamento.nome,
                                    tipo
                                )
                            ) {

                                return;

                            }


                            const documento =
                                obterDocumento(
                                    veiculo.id,
                                    equipamento.nome,
                                    tipo
                                );


                            const estado =
                                statusDocumento(
                                    documento,
                                    true
                                );


                            resultado.push({

                                veiculo,

                                equipamento,

                                tipo,

                                documento,

                                estado

                            });

                        }
                    );

                }
            );

        }
    );


    return resultado;

}


/* =========================================================
   ORDENAR DOCUMENTOS POR VALIDADE
   ========================================================= */

function compararDocumentos(
    a,
    b
) {

    return (

        dataLocal(
            a.documento.validade
        )

        -

        dataLocal(
            b.documento.validade
        )

    );

}


/* =========================================================
   STATUS GERAL DA DOCUMENTAÇÃO DO VEÍCULO
   ========================================================= */

function obterStatusVeiculoDocumentacao(
    veiculo
) {

    return obterDocumentosAplicaveis(
        [veiculo]
    )
        .map(
            d =>
                d.estado.status
        );

}
