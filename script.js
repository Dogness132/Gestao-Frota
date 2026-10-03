/* ========================================= */
/* GESTÃO DE FROTA */
/* ========================================= */


/* ========================================= */
/* CONFIGURAÇÕES */
/* ========================================= */

const URL_FROTA =
    "data/frota.json";


const CHAVE_ADICIONAIS =
    "frota_adicional";


/* ========================================= */
/* VARIÁVEIS */
/* ========================================= */

let frota = [];

let frotaBase = [];

let frotaAdicional = [];


/* ========================================= */
/* ELEMENTOS DO DOM */
/* ========================================= */

const modal =
    document.getElementById("modalVeiculo");


const btnNovoVeiculo =
    document.getElementById("btnNovoVeiculo");


const btnFecharModal =
    document.getElementById("btnFecharModal");


const btnCancelar =
    document.getElementById("btnCancelar");


const formVeiculo =
    document.getElementById("formVeiculo");


const tabelaFrota =
    document.getElementById("tabelaFrota");


const selectArea =
    document.getElementById("area");


const selectOperacao =
    document.getElementById("operacao");


const selectSuboperacao =
    document.getElementById("suboperacao");


/* ========================================= */
/* FUNÇÃO PARA GERAR ID */
/* ========================================= */

function gerarId() {

    return Date.now().toString()
        + Math.random()
            .toString(36)
            .substring(2, 8);

}


/* ========================================= */
/* CARREGAR DADOS */
/* ========================================= */

async function carregarFrota() {

    try {

        console.log("Carregando frota...");


        /*
         * O timestamp impede o navegador
         * de usar uma versão antiga do JSON.
         */

        const resposta =
            await fetch(
                URL_FROTA + "?v=" + Date.now(),
                {
                    cache: "no-store"
                }
            );


        if (!resposta.ok) {

            throw new Error(
                "Não foi possível carregar frota.json"
            );

        }


        frotaBase =
            await resposta.json();


        if (!Array.isArray(frotaBase)) {

            throw new Error(
                "frota.json não contém uma lista válida."
            );

        }


        /*
         * Carrega somente os veículos
         * adicionados pelo sistema.
         *
         * Não usamos mais a antiga chave
         * "frota", que estava travando
         * as alterações feitas no JSON.
         */

        const dadosAdicionais =
            localStorage.getItem(
                CHAVE_ADICIONAIS
            );


        if (dadosAdicionais) {

            try {

                frotaAdicional =
                    JSON.parse(
                        dadosAdicionais
                    );

                if (!Array.isArray(frotaAdicional)) {

                    frotaAdicional = [];

                }

            } catch (erro) {

                console.warn(
                    "Dados adicionais inválidos. Limpando..."
                );

                frotaAdicional = [];

            }

        } else {

            frotaAdicional = [];

        }


        /*
         * A frota final é:
         *
         * JSON oficial
         * +
         * veículos criados pelo formulário
         */

        frota = [
            ...frotaBase,
            ...frotaAdicional
        ];


        console.log(
            "Frota carregada:",
            frota
        );


        atualizarSistema();


    } catch (erro) {

        console.error(
            "Erro ao carregar frota:",
            erro
        );


        tabelaFrota.innerHTML = `
            <tr>
                <td colspan="7">
                    Erro ao carregar a frota.
                    Verifique o arquivo
                    data/frota.json.
                </td>
            </tr>
        `;

    }

}


/* ========================================= */
/* SALVAR VEÍCULOS ADICIONAIS */
/* ========================================= */

function salvarAdicionais() {

    localStorage.setItem(
        CHAVE_ADICIONAIS,
        JSON.stringify(frotaAdicional)
    );

}


/* ========================================= */
/* ATUALIZAR SISTEMA */
/* ========================================= */

function atualizarSistema() {

    atualizarIndicadores();

    atualizarGrafico();

    atualizarDistribuicao();

    atualizarTabela();

}


/* ========================================= */
/* INDICADORES */
/* ========================================= */

function atualizarIndicadores() {

    const total =
        frota.length;


    const operando =
        frota.filter(
            veiculo =>
                veiculo.status === "Rodando"
        ).length;


    const parados =
        frota.filter(
            veiculo =>
                veiculo.status === "Parado"
        ).length;


    const reserva =
        frota.filter(
            veiculo =>
                veiculo.status === "Reserva"
        ).length;


    document.getElementById(
        "frotaTotal"
    ).textContent = total;


    document.getElementById(
        "frotaOperando"
    ).textContent = operando;


    document.getElementById(
        "frotaParada"
    ).textContent = parados;


    document.getElementById(
        "frotaReserva"
    ).textContent = reserva;


    document.getElementById(
        "legendOperando"
    ).textContent = operando;


    document.getElementById(
        "legendParados"
    ).textContent = parados;


    document.getElementById(
        "legendReserva"
    ).textContent = reserva;

}


/* ========================================= */
/* GRÁFICO DONUT */
/* ========================================= */

function atualizarGrafico() {

    const total =
        frota.length;


    const operando =
        frota.filter(
            veiculo =>
                veiculo.status === "Rodando"
        ).length;


    const parados =
        frota.filter(
            veiculo =>
                veiculo.status === "Parado"
        ).length;


    const reserva =
        frota.filter(
            veiculo =>
                veiculo.status === "Reserva"
        ).length;


    const donut =
        document.getElementById("donut");


    const percentual =
        total > 0
            ? Math.round(
                (operando / total) * 100
            )
            : 0;


    document.getElementById(
        "percentualOperacao"
    ).textContent =
        percentual + "%";


    if (total === 0) {

        donut.style.background =
            "#303846";

        return;

    }


    const grausOperando =
        (operando / total) * 360;


    const grausParado =
        (parados / total) * 360;


    const inicioParado =
        grausOperando;


    const fimParado =
        inicioParado + grausParado;


    donut.style.background = `
        conic-gradient(
            #4ade80 0deg
            ${grausOperando}deg,

            #f87171
            ${grausOperando}deg
            ${fimParado}deg,

            #facc15
            ${fimParado}deg
            360deg
        )
    `;

}


/* ========================================= */
/* DISTRIBUIÇÃO */
/* ========================================= */

function atualizarDistribuicao() {

    const total =
        frota.length;


    const raizen =
        frota.filter(
            veiculo =>
                normalizar(
                    veiculo.operacao
                ) === "raizen"
        ).length;


    const nexta =
        frota.filter(
            veiculo =>
                normalizar(
                    veiculo.operacao
                ) === "nexta"
        ).length;


    document.getElementById(
        "quantidadeRaizen"
    ).textContent = raizen;


    document.getElementById(
        "quantidadeNexta"
    ).textContent = nexta;


    const percentualRaizen =
        total > 0
            ? (raizen / total) * 100
            : 0;


    const percentualNexta =
        total > 0
            ? (nexta / total) * 100
            : 0;


    document.getElementById(
        "barraRaizen"
    ).style.width =
        percentualRaizen + "%";


    document.getElementById(
        "barraNexta"
    ).style.width =
        percentualNexta + "%";

}


/* ========================================= */
/* TABELA */
/* ========================================= */

function atualizarTabela() {

    tabelaFrota.innerHTML = "";


    if (frota.length === 0) {

        tabelaFrota.innerHTML = `
            <tr>
                <td colspan="7">
                    Nenhum veículo cadastrado.
                </td>
            </tr>
        `;

        return;

    }


    frota.forEach(
        veiculo => {

            const linha =
                document.createElement("tr");


            const classeStatus =
                obterClasseStatus(
                    veiculo.status
                );


            linha.innerHTML = `

                <td>
                    ${valorSeguro(veiculo.cv)}
                </td>

                <td>
                    ${valorSeguro(veiculo.sm1)}
                </td>

                <td>
                    ${valorSeguro(veiculo.sm2)}
                </td>

                <td>
                    ${valorSeguro(veiculo.area)}
                </td>

                <td>
                    ${valorSeguro(veiculo.operacao)}
                </td>

                <td>
                    ${valorSeguro(veiculo.suboperacao)}
                </td>

                <td>

                    <span
                        class="status-badge ${classeStatus}"
                    >
                        ${valorSeguro(veiculo.status)}
                    </span>

                </td>

            `;


            tabelaFrota.appendChild(
                linha
            );

        }
    );

}


/* ========================================= */
/* STATUS */
/* ========================================= */

function obterClasseStatus(status) {

    switch (status) {

        case "Rodando":
            return "status-rodando";

        case "Parado":
            return "status-parado";

        case "Reserva":
            return "status-reserva";

        default:
            return "";

    }

}


/* ========================================= */
/* NORMALIZAR TEXTO */
/* ========================================= */

function normalizar(valor) {

    return String(valor || "")
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .toLowerCase()
        .trim();

}


/* ========================================= */
/* VALOR SEGURO */
/* ========================================= */

function valorSeguro(valor) {

    if (
        valor === null ||
        valor === undefined ||
        valor === ""
    ) {

        return "-";

    }

    return String(valor)
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

}


/* ========================================= */
/* ABRIR MODAL */
/* ========================================= */

function abrirModalVeiculo() {

    modal.classList.add("show");

}


/* ========================================= */
/* FECHAR MODAL */
/* ========================================= */

function fecharModalVeiculo() {

    modal.classList.remove("show");

}


/* ========================================= */
/* EVENTO BOTÃO NOVO VEÍCULO */
/* ========================================= */

btnNovoVeiculo.onclick =
    abrirModalVeiculo;


/* ========================================= */
/* FECHAR MODAL */
/* ========================================= */

btnFecharModal.onclick =
    fecharModalVeiculo;


btnCancelar.onclick =
    fecharModalVeiculo;


/* ========================================= */
/* FECHAR CLICANDO FORA */
/* ========================================= */

modal.addEventListener(
    "click",
    function (evento) {

        if (
            evento.target === modal
        ) {

            fecharModalVeiculo();

        }

    }
);


/* ========================================= */
/* ESC FECHA MODAL */
/* ========================================= */

document.addEventListener(
    "keydown",
    function (evento) {

        if (
            evento.key === "Escape"
        ) {

            fecharModalVeiculo();

        }

    }
);


/* ========================================= */
/* ÁREA → OPERAÇÃO */
/* ========================================= */

selectArea.addEventListener(
    "change",
    function () {

        const area =
            selectArea.value;


        selectOperacao.innerHTML = "";

        selectSuboperacao.innerHTML = "";


        selectSuboperacao.disabled =
            true;


        if (!area) {

            selectOperacao.disabled =
                true;

            selectOperacao.innerHTML = `
                <option value="">
                    Selecione a área primeiro
                </option>
            `;

            selectSuboperacao.innerHTML = `
                <option value="">
                    Selecione a operação primeiro
                </option>
            `;

            return;

        }


        selectOperacao.disabled =
            false;


        /*
         * Hierarquia atual:
         *
         * Coleta → Nexta
         * Entrega → Raízen
         * JET → JET
         *
         * Depois podemos transformar
         * isso em uma configuração
         * dinâmica.
         */

        let operacoes = [];


        if (area === "Coleta") {

            operacoes = [
                "Nexta"
            ];

        }


        else if (area === "Entrega") {

            operacoes = [
                "Raízen"
            ];

        }


        else if (area === "JET") {

            operacoes = [
                "JET"
            ];

        }


        selectOperacao.innerHTML = `
            <option value="">
                Selecione
            </option>
        `;


        operacoes.forEach(
            operacao => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    operacao;

                option.textContent =
                    operacao;

                selectOperacao.appendChild(
                    option
                );

            }
        );

    }
);


/* ========================================= */
/* OPERAÇÃO → SUBOPERAÇÃO */
/* ========================================= */

selectOperacao.addEventListener(
    "change",
    function () {

        const area =
            selectArea.value;


        const operacao =
            selectOperacao.value;


        selectSuboperacao.innerHTML =
            "";


        selectSuboperacao.disabled =
            false;


        /*
         * Regra atual:
         *
         * Entrega + Raízen
         * → City
         * → Dedicado
         */

        if (
            area === "Entrega" &&
            normalizar(operacao) === "raizen"
        ) {

            selectSuboperacao.innerHTML = `

                <option value="">
                    Selecione
                </option>

                <option value="City">
                    City
                </option>

                <option value="Dedicado">
                    Dedicado
                </option>

            `;

            return;

        }


        /*
         * Para as demais combinações,
         * usamos Geral por enquanto.
         */

        selectSuboperacao.innerHTML = `

            <option value="">
                Selecione
            </option>

            <option value="Geral">
                Geral
            </option>

        `;

    }
);


/* ========================================= */
/* SALVAR NOVO VEÍCULO */
/* ========================================= */

formVeiculo.addEventListener(
    "submit",
    function (evento) {

        evento.preventDefault();


        const novoVeiculo = {

            id: gerarId(),

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
                ).value

        };


        /* ================================= */
        /* VALIDAÇÃO */
        /* ================================= */

        if (
            !novoVeiculo.cv ||
            !novoVeiculo.sm1 ||
            !novoVeiculo.sm2 ||
            !novoVeiculo.area ||
            !novoVeiculo.operacao ||
            !novoVeiculo.suboperacao ||
            !novoVeiculo.status
        ) {

            alert(
                "Preencha todos os campos."
            );

            return;

        }


        /* ================================= */
        /* VERIFICAR CV DUPLICADO */
        /* ================================= */

        const cvExiste =
            frota.some(
                veiculo =>
                    normalizar(
                        veiculo.cv
                    ) ===
                    normalizar(
                        novoVeiculo.cv
                    )
            );


        if (cvExiste) {

            alert(
                "Já existe um veículo cadastrado com este CV."
            );

            return;

        }


        /* ================================= */
        /* ADICIONAR */
        /* ================================= */

        frotaAdicional.push(
            novoVeiculo
        );


        salvarAdicionais();


        /*
         * Atualiza a frota em memória
         */

        frota.push(
            novoVeiculo
        );


        atualizarSistema();


        /* ================================= */
        /* LIMPAR FORMULÁRIO */
        /* ================================= */

        formVeiculo.reset();


        selectOperacao.disabled =
            true;


        selectSuboperacao.disabled =
            true;


        selectOperacao.innerHTML = `
            <option value="">
                Selecione a área primeiro
            </option>
        `;


        selectSuboperacao.innerHTML = `
            <option value="">
                Selecione a operação primeiro
            </option>
        `;


        /* ================================= */
        /* FECHAR MODAL */
        /* ================================= */

        fecharModalVeiculo();


        alert(
            "Veículo cadastrado com sucesso!"
        );

    }
);


/* ========================================= */
/* INICIALIZAÇÃO */
/* ========================================= */

carregarFrota();
