const CHAVE_FROTA_ADICIONAL = "frota_adicional";
const CHAVE_FROTA_ALTERACOES = "frota_alteracoes";
const CHAVE_MOTORISTAS = "motoristas_cadastrados";
const CHAVE_MANUTENCOES = "manutencoes_cadastradas";

const HIERARQUIA = {
    Coleta: {
        Raízen: ["Geral"],
        Nexta: ["Geral"]
    },

    Entrega: {
        Raízen: ["City", "Dedicado"],
        Nexta: ["Geral"]
    },

    JET: {
        JET: ["JET"]
    }
};

let frota = [];
let motoristas = [];
let manutencoes = [];

let editandoVeiculoId = null;
let editandoMotoristaId = null;
let editandoManutencaoId = null;


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

    configurarNavegacao();

    configurarFechamentoModais();

    configurarHierarquiaFrota();

    configurarHierarquiaMotorista();

    configurarDashboard();

    configurarBotoes();

    configurarFormularios();

    carregarMotoristas();

    carregarManutencoes();

    await carregarFrota();

    renderizarTudo();

});


/* =========================================================
   NAVEGAÇÃO
========================================================= */

function configurarNavegacao() {

    document
        .querySelectorAll(".menu-item[data-pagina]")
        .forEach(elemento => {

            elemento.addEventListener("click", evento => {

                evento.preventDefault();

                abrirPagina(
                    elemento.dataset.pagina
                );

            });

        });

}


function abrirPagina(pagina) {

    document
        .querySelectorAll(".page")
        .forEach(page => {

            page.classList.remove("active-page");

        });


    const paginaSelecionada =
        document.getElementById(
            `pagina-${pagina}`
        );


    if (paginaSelecionada) {

        paginaSelecionada.classList.add(
            "active-page"
        );

    }


    document
        .querySelectorAll(".menu-item")
        .forEach(menu => {

            menu.classList.toggle(
                "active",
                menu.dataset.pagina === pagina
            );

        });


    const titulos = {

        dashboard: [
            "Dashboard",
            "Visão geral da operação"
        ],

        frota: [
            "Frota",
            "Veículos cadastrados"
        ],

        motoristas: [
            "Motoristas",
            "Cadastro operacional"
        ],

        escala: [
            "Escala",
            "Planejamento da operação"
        ],

        manutencao: [
            "Manutenção",
            "Controle de manutenção"
        ],

        ocorrencias: [
            "Ocorrências",
            "Registro de ocorrências"
        ],

        configuracoes: [
            "Configurações",
            "Parâmetros do sistema"
        ]

    };


    setText(
        "tituloPagina",
        titulos[pagina]?.[0] || "Gestão de Frota"
    );


    setText(
        "subtituloPagina",
        titulos[pagina]?.[1] || ""
    );

}


/* =========================================================
   FROTA
========================================================= */

async function carregarFrota() {

    try {

        const resposta = await fetch(
            `data/frota.json?v=${Date.now()}`,
            {
                cache: "no-store"
            }
        );


        if (!resposta.ok) {

            throw new Error(
                "Não foi possível carregar data/frota.json"
            );

        }


        const frotaBase =
            await resposta.json();


        const alteracoes =
            JSON.parse(
                localStorage.getItem(
                    CHAVE_FROTA_ALTERACOES
                ) || "{}"
            );


        const adicionais =
            JSON.parse(
                localStorage.getItem(
                    CHAVE_FROTA_ADICIONAL
                ) || "[]"
            );


        frota =
            frotaBase
                .map(veiculo => ({
                    ...veiculo,
                    ...(alteracoes[veiculo.id] || {})
                }))
                .concat(adicionais);


    } catch (erro) {

        console.error(
            "Erro ao carregar frota:",
            erro
        );

        frota = [];

    }

}


/* =========================================================
   PERSISTÊNCIA DA FROTA
========================================================= */

function salvarAlteracaoFrota(veiculo) {

    const alteracoes =
        JSON.parse(
            localStorage.getItem(
                CHAVE_FROTA_ALTERACOES
            ) || "{}"
        );


    alteracoes[veiculo.id] =
        veiculo;


    localStorage.setItem(
        CHAVE_FROTA_ALTERACOES,
        JSON.stringify(alteracoes)
    );

}


function salvarFrotaAdicional(veiculo) {

    const adicionais =
        JSON.parse(
            localStorage.getItem(
                CHAVE_FROTA_ADICIONAL
            ) || "[]"
        );


    adicionais.push(veiculo);


    localStorage.setItem(
        CHAVE_FROTA_ADICIONAL,
        JSON.stringify(adicionais)
    );

}


/* =========================================================
   RENDERIZAÇÃO GERAL
========================================================= */

function renderizarTudo() {

    renderizarFrota();

    renderizarFrotaPagina();

    renderizarMotoristas();

    renderizarManutencoes();

    atualizarDashboard();

}


/* =========================================================
   DASHBOARD
========================================================= */

function configurarDashboard() {

    const area =
        document.getElementById(
            "dashboardArea"
        );


    const operacao =
        document.getElementById(
            "dashboardOperacao"
        );


    const suboperacao =
        document.getElementById(
            "dashboardSuboperacao"
        );


    if (!area) {
        return;
    }


    area.addEventListener(
        "change",
        () => {

            preencherFiltroDashboardOperacoes();

            preencherFiltroDashboardSuboperacoes();

            atualizarDashboard();

        }
    );


    if (operacao) {

        operacao.addEventListener(
            "change",
            () => {

                preencherFiltroDashboardSuboperacoes();

                atualizarDashboard();

            }
        );

    }


    if (suboperacao) {

        suboperacao.addEventListener(
            "change",
            () => {

                atualizarDashboard();

            }
        );

    }


    const limpar =
        document.getElementById(
            "btnLimparFiltrosDashboard"
        );


    if (limpar) {

        limpar.addEventListener(
            "click",
            limparFiltrosDashboard
        );

    }

}


function preencherFiltroDashboardAreas() {

    const select =
        document.getElementById(
            "dashboardArea"
        );


    if (!select) {
        return;
    }


    const valorAtual =
        select.value;


    const areas =
        [
            ...new Set(
                frota
                    .map(
                        veiculo =>
                            veiculo.area
                    )
                    .filter(Boolean)
            )
        ];


    select.innerHTML = `
        <option value="">
            Todas
        </option>
    `;


    areas.forEach(area => {

        select.insertAdjacentHTML(
            "beforeend",
            `
                <option value="${escAttr(area)}">
                    ${esc(area)}
                </option>
            `
        );

    });


    if (
        areas.includes(valorAtual)
    ) {

        select.value =
            valorAtual;

    }

}


function preencherFiltroDashboardOperacoes() {

    const area =
        getVal(
            "dashboardArea"
        );


    const select =
        document.getElementById(
            "dashboardOperacao"
        );


    if (!select) {
        return;
    }


    const valorAtual =
        select.value;


    let lista;


    if (area) {

        lista =
            [
                ...new Set(
                    frota
                        .filter(
                            veiculo =>
                                veiculo.area ===
                                area
                        )
                        .map(
                            veiculo =>
                                veiculo.operacao
                        )
                        .filter(Boolean)
                )
            ];

    } else {

        lista =
            [
                ...new Set(
                    frota
                        .map(
                            veiculo =>
                                veiculo.operacao
                        )
                        .filter(Boolean)
                )
            ];

    }


    select.innerHTML = `
        <option value="">
            Todas
        </option>
    `;


    lista.forEach(operacao => {

        select.insertAdjacentHTML(
            "beforeend",
            `
                <option value="${escAttr(operacao)}">
                    ${esc(operacao)}
                </option>
            `
        );

    });


    select.disabled =
        lista.length === 0;


    if (
        lista.includes(valorAtual)
    ) {

        select.value =
            valorAtual;

    } else {

        select.value = "";

    }

}


function preencherFiltroDashboardSuboperacoes() {

    const area =
        getVal(
            "dashboardArea"
        );


    const operacao =
        getVal(
            "dashboardOperacao"
        );


    const select =
        document.getElementById(
            "dashboardSuboperacao"
        );


    if (!select) {
        return;
    }


    const valorAtual =
        select.value;


    let lista;


    if (
        area &&
        operacao
    ) {

        lista =
            HIERARQUIA[
                area
            ]?.[
                operacao
            ] || [];


    } else {

        lista =
            [
                ...new Set(
                    frota
                        .filter(veiculo => {

                            if (
                                area &&
                                veiculo.area !== area
                            ) {

                                return false;

                            }


                            if (
                                operacao &&
                                veiculo.operacao !== operacao
                            ) {

                                return false;

                            }


                            return true;

                        })
                        .map(
                            veiculo =>
                                veiculo.suboperacao
                        )
                        .filter(Boolean)
                )
            ];

    }


    select.innerHTML = `
        <option value="">
            Todas
        </option>
    `;


    lista.forEach(suboperacao => {

        select.insertAdjacentHTML(
            "beforeend",
            `
                <option value="${escAttr(suboperacao)}">
                    ${esc(suboperacao)}
                </option>
            `
        );

    });


    select.disabled =
        lista.length === 0;


    if (
        lista.includes(valorAtual)
    ) {

        select.value =
            valorAtual;

    } else {

        select.value = "";

    }

}


function limparFiltrosDashboard() {

    setVal(
        "dashboardArea",
        ""
    );


    setVal(
        "dashboardOperacao",
        ""
    );


    setVal(
        "dashboardSuboperacao",
        ""
    );


    preencherFiltroDashboardOperacoes();

    preencherFiltroDashboardSuboperacoes();

    atualizarDashboard();

}


function obterFrotaFiltradaDashboard() {

    const area =
        getVal(
            "dashboardArea"
        );


    const operacao =
        getVal(
            "dashboardOperacao"
        );


    const suboperacao =
        getVal(
            "dashboardSuboperacao"
        );


    return frota.filter(veiculo => {

        if (
            area &&
            veiculo.area !== area
        ) {

            return false;

        }


        if (
            operacao &&
            veiculo.operacao !== operacao
        ) {

            return false;

        }


        if (
            suboperacao &&
            veiculo.suboperacao !== suboperacao
        ) {

            return false;

        }


        return true;

    });

}


function atualizarDashboard() {

    preencherFiltroDashboardAreas();

    preencherFiltroDashboardOperacoes();

    preencherFiltroDashboardSuboperacoes();


    const frotaDashboard =
        obterFrotaFiltradaDashboard();


    const total =
        frotaDashboard.length;


    const rodando =
        frotaDashboard.filter(
            veiculo =>
                veiculo.status ===
                "Rodando"
        ).length;


    const parado =
        frotaDashboard.filter(
            veiculo =>
                veiculo.status ===
                "Parado"
        ).length;


    const reserva =
        frotaDashboard.filter(
            veiculo =>
                veiculo.status ===
                "Reserva"
        ).length;


    setText(
        "frotaTotal",
        total
    );


    setText(
        "frotaOperando",
        rodando
    );


    setText(
        "frotaParada",
        parado
    );


    setText(
        "frotaReserva",
        reserva
    );


    setText(
        "legendOperando",
        rodando
    );


    setText(
        "legendParados",
        parado
    );


    setText(
        "legendReserva",
        reserva
    );


    setText(
        "donutTotal",
        total
    );


    const percentual =
        total > 0
            ? Math.round(
                (rodando / total) * 100
            )
            : 0;


    setText(
        "percentualOperacao",
        `${percentual}%`
    );


    const donut =
        document.getElementById(
            "donutFrota"
        );


    if (donut) {

        const porcentagemRodando =
            total > 0
                ? (rodando / total) * 100
                : 0;


        const porcentagemParado =
            total > 0
                ? (
                    (rodando + parado) /
                    total
                ) * 100
                : 0;


        donut.style.background = `
            conic-gradient(
                #62d69a 0 ${porcentagemRodando}%,
                #ff6b6b ${porcentagemRodando}% ${porcentagemParado}%,
                #e8c85c ${porcentagemParado}% 100%
            )
        `;

    }


    atualizarDistribuicaoDashboard(
        frotaDashboard
    );


    atualizarManutencaoDashboard(
        frotaDashboard
    );


    renderizarFrotaDashboard(
        frotaDashboard
    );

}


function atualizarDistribuicaoDashboard(
    frotaDashboard
) {

    const distribuicao =
        document.getElementById(
            "distribuicaoOperacoes"
        );


    if (!distribuicao) {
        return;
    }


    const grupos = {};


    frotaDashboard.forEach(
        veiculo => {

            const operacao =
                veiculo.operacao ||
                "Sem operação";


            grupos[operacao] =
                (
                    grupos[operacao] ||
                    0
                ) + 1;

        }
    );


    const total =
        frotaDashboard.length;


    if (!total) {

        distribuicao.innerHTML = `
            <div class="empty-state">
                Nenhum veículo encontrado
                para os filtros selecionados.
            </div>
        `;

        return;

    }


    distribuicao.innerHTML =
        Object.entries(grupos)
            .map(
                ([nome, quantidade]) => {

                    const percentual =
                        Math.round(
                            (
                                quantidade /
                                total
                            ) * 100
                        );


                    return `

                        <div class="distribution-row">

                            <div>

                                <strong>
                                    ${esc(nome)}
                                </strong>

                                <span>
                                    ${percentual}% da frota filtrada
                                </span>

                            </div>

                            <strong>
                                ${quantidade}
                            </strong>

                        </div>


                        <div class="bar">

                            <div
                                class="bar-fill"
                                style="width:${percentual}%"
                            ></div>

                        </div>

                    `;

                }
            )
            .join("");

}


function atualizarManutencaoDashboard(
    frotaDashboard
) {

    const ids =
        new Set(
            frotaDashboard.map(
                veiculo =>
                    String(veiculo.id)
            )
        );


    const manutencoesFiltradas =
        manutencoes.filter(
            manutencao =>
                ids.has(
                    String(
                        manutencao.veiculoId
                    )
                )
        );


    const emManutencao =
        manutencoesFiltradas.filter(
            manutencao =>
                manutencao.status ===
                "Em manutenção"
        ).length;


    const agendadas =
        manutencoesFiltradas.filter(
            manutencao =>
                manutencao.status ===
                "Agendada"
        ).length;


    const concluidas =
        manutencoesFiltradas.filter(
            manutencao =>
                manutencao.status ===
                "Concluída"
        ).length;


    setText(
        "dashManutencao",
        emManutencao
    );


    setText(
        "dashAgendadas",
        agendadas
    );


    setText(
        "dashConcluidas",
        concluidas
    );

}


function renderizarFrotaDashboard(
    frotaDashboard
) {

    const tabela =
        document.getElementById(
            "tabelaFrota"
        );


    if (!tabela) {
        return;
    }


    tabela.innerHTML =
        frotaDashboard
            .map(
                veiculo => {

                    return `

                        <tr>

                            <td>
                                <strong>
                                    ${esc(veiculo.cv)}
                                </strong>
                            </td>

                            <td>
                                ${esc(veiculo.sm1)}
                            </td>

                            <td>
                                ${esc(veiculo.sm2)}
                            </td>

                            <td>
                                ${esc(veiculo.area)}
                            </td>

                            <td>
                                ${esc(veiculo.operacao)}
                            </td>

                            <td>
                                ${esc(veiculo.suboperacao)}
                            </td>

                            <td>
                                ${esc(
                                    nomeMotorista(
                                        veiculo.motoristaDia
                                    )
                                )}
                            </td>

                            <td>
                                ${esc(
                                    nomeMotorista(
                                        veiculo.motoristaNoite
                                    )
                                )}
                            </td>

                            <td>

                                <span
                                    class="status-badge status-${classe(
                                        veiculo.status
                                    )}"
                                >
                                    ${esc(
                                        veiculo.status
                                    )}
                                </span>

                            </td>

                            <td>

                                <button
                                    class="action-button"
                                    onclick="editarVeiculo('${escAttr(veiculo.id)}')"
                                >
                                    Editar
                                </button>

                            </td>

                        </tr>

                    `;

                }
            )
            .join("");


    if (!frotaDashboard.length) {

        tabela.innerHTML = `

            <tr>

                <td colspan="10">
                    Nenhum veículo encontrado
                    para os filtros selecionados.
                </td>

            </tr>

        `;

    }

}


/* =========================================================
   FROTA - PÁGINA
========================================================= */

function renderizarFrota() {

    renderizarFrotaDashboard(
        frota
    );

}


function renderizarFrotaPagina() {

    const tabela =
        document.getElementById(
            "tabelaFrotaPagina"
        );


    if (!tabela) {
        return;
    }


    tabela.innerHTML =
        frota
            .map(
                veiculo => {

                    return `

                        <tr>

                            <td>
                                <strong>
                                    ${esc(veiculo.cv)}
                                </strong>
                            </td>

                            <td>
                                ${esc(veiculo.sm1)}
                            </td>

                            <td>
                                ${esc(veiculo.sm2)}
                            </td>

                            <td>
                                ${esc(veiculo.area)}
                            </td>

                            <td>
                                ${esc(veiculo.operacao)}
                            </td>

                            <td>
                                ${esc(veiculo.suboperacao)}
                            </td>

                            <td>
                                ${esc(
                                    nomeMotorista(
                                        veiculo.motoristaDia
                                    )
                                )}
                            </td>

                            <td>
                                ${esc(
                                    nomeMotorista(
                                        veiculo.motoristaNoite
                                    )
                                )}
                            </td>

                            <td>

                                <span
                                    class="status-badge status-${classe(
                                        veiculo.status
                                    )}"
                                >
                                    ${esc(
                                        veiculo.status
                                    )}
                                </span>

                            </td>

                            <td>

                                <button
                                    class="action-button"
                                    onclick="editarVeiculo('${escAttr(veiculo.id)}')"
                                >
                                    Editar
                                </button>

                            </td>

                        </tr>

                    `;

                }
            )
            .join("");


    if (!frota.length) {

        tabela.innerHTML = `

            <tr>

                <td colspan="10">
                    Nenhum veículo cadastrado.
                </td>

            </tr>

        `;

    }

}


/* =========================================================
   MOTORISTA POR ID
========================================================= */

function nomeMotorista(id) {

    if (!id) {

        return "—";

    }


    const motorista =
        motoristas.find(
            motorista =>
                String(motorista.id) ===
                String(id)
        );


    return motorista
        ? motorista.nome
        : "Motorista não encontrado";

}


/* =========================================================
   EDITAR VEÍCULO
========================================================= */

function editarVeiculo(id) {

    const veiculo =
        frota.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!veiculo) {
        return;
    }


    editandoVeiculoId =
        veiculo.id;


    setText(
        "tituloModalVeiculo",
        "Editar veículo"
    );


    setVal(
        "veiculoId",
        veiculo.id
    );


    setVal(
        "cv",
        veiculo.cv
    );


    setVal(
        "sm1",
        veiculo.sm1
    );


    setVal(
        "sm2",
        veiculo.sm2
    );


    setVal(
        "status",
        veiculo.status
    );


    setVal(
        "area",
        veiculo.area
    );


    preencherOperacoes(
        "area",
        "operacao",
        veiculo.area,
        veiculo.operacao
    );


    preencherSuboperacoes(
        "area",
        "operacao",
        "suboperacao",
        veiculo.area,
        veiculo.operacao,
        veiculo.suboperacao
    );


    preencherMotoristasVeiculo(
        veiculo.motoristaDia,
        veiculo.motoristaNoite
    );


    abrirModal(
        "modalVeiculo"
    );

}


window.editarVeiculo =
    editarVeiculo;


/* =========================================================
   SALVAR VEÍCULO
========================================================= */

function salvarVeiculo(evento) {

    evento.preventDefault();


    const dados = {

        id:
            editandoVeiculoId ||
            `veiculo-${Date.now()}`,

        cv:
            getVal("cv").trim(),

        sm1:
            getVal("sm1").trim(),

        sm2:
            getVal("sm2").trim(),

        status:
            getVal("status"),

        area:
            getVal("area"),

        operacao:
            getVal("operacao"),

        suboperacao:
            getVal("suboperacao"),

        motoristaDia:
            getVal("motoristaDia") ||
            null,

        motoristaNoite:
            getVal("motoristaNoite") ||
            null

    };


    if (editandoVeiculoId) {

        const indice =
            frota.findIndex(
                veiculo =>
                    String(veiculo.id) ===
                    String(
                        editandoVeiculoId
                    )
            );


        if (indice >= 0) {

            frota[indice] = {
                ...frota[indice],
                ...dados
            };


            salvarAlteracaoFrota(
                frota[indice]
            );

        }

    } else {

        frota.push(
            dados
        );


        salvarFrotaAdicional(
            dados
        );

    }


    fecharModal(
        "modalVeiculo"
    );


    evento.target.reset();


    editandoVeiculoId =
        null;


    renderizarTudo();

}


/* =========================================================
   HIERARQUIA FROTA
========================================================= */

function configurarHierarquiaFrota() {

    const area =
        document.getElementById(
            "area"
        );


    const operacao =
        document.getElementById(
            "operacao"
        );


    const suboperacao =
        document.getElementById(
            "suboperacao"
        );


    if (area) {

        area.addEventListener(
            "change",
            () => {

                preencherOperacoes(
                    "area",
                    "operacao",
                    getVal("area")
                );


                preencherSuboperacoes(
                    "area",
                    "operacao",
                    "suboperacao",
                    "",
                    "",
                    ""
                );


                preencherMotoristasVeiculo();

            }
        );

    }


    if (operacao) {

        operacao.addEventListener(
            "change",
            () => {

                preencherSuboperacoes(
                    "area",
                    "operacao",
                    "suboperacao",
                    getVal("area"),
                    getVal("operacao")
                );


                preencherMotoristasVeiculo();

            }
        );

    }


    if (suboperacao) {

        suboperacao.addEventListener(
            "change",
            () => {

                preencherMotoristasVeiculo();

            }
        );

    }

}


function preencherOperacoes(
    idArea,
    idOperacao,
    area,
    selecionada = ""
) {

    const select =
        document.getElementById(
            idOperacao
        );


    if (!select) {
        return;
    }


    select.innerHTML = `
        <option value="">
            Selecione
        </option>
    `;


    if (
        !area ||
        !HIERARQUIA[area]
    ) {

        select.disabled =
            true;

        return;

    }


    Object.keys(
        HIERARQUIA[area]
    )
        .forEach(
            operacao => {

                select.insertAdjacentHTML(
                    "beforeend",
                    `
                        <option value="${escAttr(operacao)}">
                            ${esc(operacao)}
                        </option>
                    `
                );

            }
        );


    select.disabled =
        false;


    if (selecionada) {

        select.value =
            selecionada;

    }

}


function preencherSuboperacoes(
    idArea,
    idOperacao,
    idSuboperacao,
    area,
    operacao,
    suboperacao = ""
) {

    const select =
        document.getElementById(
            idSuboperacao
        );


    if (!select) {
        return;
    }


    select.innerHTML = `
        <option value="">
            Selecione
        </option>
    `;


    const lista =
        HIERARQUIA[
            area
        ]?.[
            operacao
        ] || [];


    lista.forEach(
        sub => {

            select.insertAdjacentHTML(
                "beforeend",
                `
                    <option value="${escAttr(sub)}">
                        ${esc(sub)}
                    </option>
                `
            );

        }
    );


    select.disabled =
        lista.length === 0;


    if (suboperacao) {

        select.value =
            suboperacao;

    }

}


/* =========================================================
   MOTORISTAS DA FROTA
========================================================= */

function preencherMotoristasVeiculo(
    motoristaDia = "",
    motoristaNoite = ""
) {

    const area =
        getVal("area");


    const operacao =
        getVal("operacao");


    const suboperacao =
        getVal("suboperacao");


    const motoristasCompativeis =
        motoristas.filter(
            motorista =>

                motorista.status ===
                "Ativo" &&

                motorista.area ===
                area &&

                motorista.operacao ===
                operacao &&

                motorista.suboperacao ===
                suboperacao
        );


    const motoristasDia =
        motoristasCompativeis.filter(
            motorista =>
                motorista.turno ===
                "Dia"
        );


    const motoristasNoite =
        motoristasCompativeis.filter(
            motorista =>
                motorista.turno ===
                "Noite"
        );


    montarSelectMotoristas(
        "motoristaDia",
        motoristasDia,
        motoristaDia,
        "Selecione o motorista Dia"
    );


    montarSelectMotoristas(
        "motoristaNoite",
        motoristasNoite,
        motoristaNoite,
        "Selecione o motorista Noite"
    );

}


function montarSelectMotoristas(
    id,
    lista,
    valor,
    placeholder
) {

    const select =
        document.getElementById(
            id
        );


    if (!select) {
        return;
    }


    select.innerHTML = `
        <option value="">
            ${placeholder}
        </option>
    `;


    lista.forEach(
        motorista => {

            select.insertAdjacentHTML(
                "beforeend",
                `
                    <option value="${escAttr(motorista.id)}">
                        ${esc(motorista.nome)}
                    </option>
                `
            );

        }
    );


    if (valor) {

        select.value =
            valor;

    }

}


/* =========================================================
   MOTORISTAS
========================================================= */

function carregarMotoristas() {

    motoristas =
        JSON.parse(
            localStorage.getItem(
                CHAVE_MOTORISTAS
            ) || "[]"
        );

}


function salvarMotoristas() {

    localStorage.setItem(
        CHAVE_MOTORISTAS,
        JSON.stringify(
            motoristas
        )
    );

}


function renderizarMotoristas() {

    const busca =
        getVal(
            "filtroMotoristaBusca"
        ).toLowerCase();


    const area =
        getVal(
            "filtroMotoristaArea"
        );


    const operacao =
        getVal(
            "filtroMotoristaOperacao"
        );


    const tipo =
        getVal(
            "filtroMotoristaTipo"
        );


    const turno =
        getVal(
            "filtroMotoristaTurno"
        );


    const status =
        getVal(
            "filtroMotoristaStatus"
        );


    const lista =
        motoristas.filter(
            motorista => {

                const correspondeBusca =
                    !busca ||
                    motorista.nome
                        .toLowerCase()
                        .includes(
                            busca
                        );


                const correspondeArea =
                    !area ||
                    motorista.area ===
                    area;


                const correspondeOperacao =
                    !operacao ||
                    motorista.operacao ===
                    operacao;


                const correspondeTipo =
                    !tipo ||
                    motorista.tipo ===
                    tipo;


                const correspondeTurno =
                    !turno ||
                    motorista.turno ===
                    turno;


                const correspondeStatus =
                    !status ||
                    motorista.status ===
                    status;


                return (
                    correspondeBusca &&
                    correspondeArea &&
                    correspondeOperacao &&
                    correspondeTipo &&
                    correspondeTurno &&
                    correspondeStatus
                );

            }
        );


    const tabela =
        document.getElementById(
            "tabelaMotoristas"
        );


    if (!tabela) {
        return;
    }


    tabela.innerHTML =
        lista
            .map(
                motorista => {

                    return `

                        <tr>

                            <td>
                                <strong>
                                    ${esc(
                                        motorista.nome
                                    )}
                                </strong>
                            </td>

                            <td>
                                ${esc(
                                    motorista.area
                                )}
                            </td>

                            <td>
                                ${esc(
                                    motorista.operacao
                                )}
                            </td>

                            <td>
                                ${esc(
                                    motorista.suboperacao
                                )}
                            </td>

                            <td>
                                ${esc(
                                    motorista.tipo
                                )}
                            </td>

                            <td>
                                ${esc(
                                    motorista.turno
                                )}
                            </td>

                            <td>

                                <span
                                    class="status-badge status-${classe(
                                        motorista.status
                                    )}"
                                >
                                    ${esc(
                                        motorista.status
                                    )}
                                </span>

                            </td>

                            <td>

                                <button
                                    class="action-button"
                                    onclick="editarMotorista('${escAttr(motorista.id)}')"
                                >
                                    Editar
                                </button>

                            </td>

                        </tr>

                    `;

                }
            )
            .join("");


    if (!lista.length) {

        tabela.innerHTML = `

            <tr>

                <td colspan="8">
                    Nenhum motorista encontrado.
                </td>

            </tr>

        `;

    }


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


    atualizarFiltroAreasMotoristas();

}


function atualizarFiltroAreasMotoristas() {

    const selectArea =
        document.getElementById(
            "filtroMotoristaArea"
        );


    const selectOperacao =
        document.getElementById(
            "filtroMotoristaOperacao"
        );


    if (
        !selectArea ||
        !selectOperacao
    ) {

        return;

    }


    const areaAtual =
        selectArea.value;


    const operacaoAtual =
        selectOperacao.value;


    const areas =
        [
            ...new Set(
                motoristas
                    .map(
                        motorista =>
                            motorista.area
                    )
                    .filter(Boolean)
            )
        ];


    const operacoes =
        [
            ...new Set(
                motoristas
                    .map(
                        motorista =>
                            motorista.operacao
                    )
                    .filter(Boolean)
            )
        ];


    selectArea.innerHTML = `
        <option value="">
            Todas as áreas
        </option>
    `;


    areas.forEach(
        area => {

            selectArea.insertAdjacentHTML(
                "beforeend",
                `
                    <option value="${escAttr(area)}">
                        ${esc(area)}
                    </option>
                `
            );

        }
    );


    selectArea.value =
        areaAtual;


    selectOperacao.innerHTML = `
        <option value="">
            Todas as operações
        </option>
    `;


    operacoes.forEach(
        operacao => {

            selectOperacao.insertAdjacentHTML(
                "beforeend",
                `
                    <option value="${escAttr(operacao)}">
                        ${esc(operacao)}
                    </option>
                `
            );

        }
    );


    selectOperacao.value =
        operacaoAtual;

}


/* =========================================================
   EDITAR MOTORISTA
========================================================= */

function editarMotorista(id) {

    const motorista =
        motoristas.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!motorista) {
        return;
    }


    editandoMotoristaId =
        motorista.id;


    setText(
        "tituloModalMotorista",
        "Editar motorista"
    );


    setVal(
        "motoristaId",
        motorista.id
    );


    setVal(
        "nomeMotorista",
        motorista.nome
    );


    setVal(
        "motoristaArea",
        motorista.area
    );


    preencherOperacoes(
        "motoristaArea",
        "motoristaOperacao",
        motorista.area,
        motorista.operacao
    );


    preencherSuboperacoes(
        "motoristaArea",
        "motoristaOperacao",
        "motoristaSuboperacao",
        motorista.area,
        motorista.operacao,
        motorista.suboperacao
    );


    setVal(
        "motoristaTipo",
        motorista.tipo
    );


    setVal(
        "motoristaTurno",
        motorista.turno
    );


    setVal(
        "motoristaStatus",
        motorista.status
    );


    setVal(
        "motoristaObservacao",
        motorista.observacao || ""
    );


    abrirModal(
        "modalMotorista"
    );

}


window.editarMotorista =
    editarMotorista;


/* =========================================================
   SALVAR MOTORISTA
========================================================= */

function salvarMotorista(evento) {

    evento.preventDefault();


    const dados = {

        id:
            editandoMotoristaId ||
            `motorista-${Date.now()}`,

        nome:
            getVal(
                "nomeMotorista"
            ).trim(),

        area:
            getVal(
                "motoristaArea"
            ),

        operacao:
            getVal(
                "motoristaOperacao"
            ),

        suboperacao:
            getVal(
                "motoristaSuboperacao"
            ),

        tipo:
            getVal(
                "motoristaTipo"
            ),

        turno:
            getVal(
                "motoristaTurno"
            ),

        status:
            getVal(
                "motoristaStatus"
            ),

        observacao:
            getVal(
                "motoristaObservacao"
            ).trim()

    };


    if (editandoMotoristaId) {

        const indice =
            motoristas.findIndex(
                motorista =>
                    String(
                        motorista.id
                    ) ===
                    String(
                        editandoMotoristaId
                    )
            );


        if (indice >= 0) {

            motoristas[indice] =
                dados;

        }

    } else {

        motoristas.push(
            dados
        );

    }


    salvarMotoristas();

    carregarMotoristas();


    fecharModal(
        "modalMotorista"
    );


    evento.target.reset();


    editandoMotoristaId =
        null;


    renderizarTudo();

}


/* =========================================================
   HIERARQUIA MOTORISTAS
========================================================= */

function configurarHierarquiaMotorista() {

    const area =
        document.getElementById(
            "motoristaArea"
        );


    const operacao =
        document.getElementById(
            "motoristaOperacao"
        );


    if (area) {

        area.addEventListener(
            "change",
            () => {

                preencherOperacoes(
                    "motoristaArea",
                    "motoristaOperacao",
                    getVal(
                        "motoristaArea"
                    )
                );


                preencherSuboperacoes(
                    "motoristaArea",
                    "motoristaOperacao",
                    "motoristaSuboperacao",
                    "",
                    "",
                    ""
                );

            }
        );

    }


    if (operacao) {

        operacao.addEventListener(
            "change",
            () => {

                preencherSuboperacoes(
                    "motoristaArea",
                    "motoristaOperacao",
                    "motoristaSuboperacao",
                    getVal(
                        "motoristaArea"
                    ),
                    getVal(
                        "motoristaOperacao"
                    )
                );

            }
        );

    }

}


/* =========================================================
   MANUTENÇÃO
========================================================= */

function carregarManutencoes() {

    manutencoes =
        JSON.parse(
            localStorage.getItem(
                CHAVE_MANUTENCOES
            ) || "[]"
        );

}


function salvarManutencoes() {

    localStorage.setItem(
        CHAVE_MANUTENCOES,
        JSON.stringify(
            manutencoes
        )
    );

}


function renderizarManutencoes() {

    const busca =
        getVal(
            "filtroManutBusca"
        ).toLowerCase();


    const status =
        getVal(
            "filtroManutStatus"
        );


    const tipo =
        getVal(
            "filtroManutTipo"
        );


    const lista =
        manutencoes.filter(
            manutencao => {

                const texto =
                    `
                        ${manutencao.cv || ""}
                        ${manutencao.motivo || ""}
                    `.toLowerCase();


                const correspondeBusca =
                    !busca ||
                    texto.includes(
                        busca
                    );


                const correspondeStatus =
                    !status ||
                    manutencao.status ===
                    status;


                const correspondeTipo =
                    !tipo ||
                    manutencao.tipo ===
                    tipo;


                return (
                    correspondeBusca &&
                    correspondeStatus &&
                    correspondeTipo
                );

            }
        );


    const tabela =
        document.getElementById(
            "tabelaManutencao"
        );


    if (!tabela) {
        return;
    }


    tabela.innerHTML =
        lista
            .map(
                manutencao => {

                    return `

                        <tr>

                            <td>
                                <strong>
                                    ${esc(
                                        manutencao.cv
                                    )}
                                </strong>
                            </td>

                            <td>
                                ${esc(
                                    manutencao.tipo
                                )}
                            </td>

                            <td>
                                ${esc(
                                    manutencao.motivo
                                )}
                            </td>

                            <td>
                                ${dataBR(
                                    manutencao.entrada
                                )}
                            </td>

                            <td>
                                ${dataBR(
                                    manutencao.previsao
                                )}
                            </td>

                            <td>
                                ${dataBR(
                                    manutencao.saida
                                )}
                            </td>

                            <td>

                                <span
                                    class="status-badge status-${classe(
                                        manutencao.status
                                    )}"
                                >
                                    ${esc(
                                        manutencao.status
                                    )}
                                </span>

                            </td>

                            <td>

                                <button
                                    class="action-button"
                                    onclick="editarManutencao('${escAttr(manutencao.id)}')"
                                >
                                    Editar
                                </button>

                            </td>

                        </tr>

                    `;

                }
            )
            .join("");


    if (!lista.length) {

        tabela.innerHTML = `

            <tr>

                <td colspan="8">
                    Nenhuma manutenção encontrada.
                </td>

            </tr>

        `;

    }


    setText(
        "manutTotal",
        manutencoes.length
    );


    setText(
        "manutEmAndamento",
        manutencoes.filter(
            manutencao =>
                manutencao.status ===
                "Em manutenção"
        ).length
    );


    setText(
        "manutAgendadas",
        manutencoes.filter(
            manutencao =>
                manutencao.status ===
                "Agendada"
        ).length
    );


    setText(
        "manutConcluidas",
        manutencoes.filter(
            manutencao =>
                manutencao.status ===
                "Concluída"
        ).length
    );

}


/* =========================================================
   VEÍCULOS DA MANUTENÇÃO
========================================================= */

function preencherVeiculosManutencao(
    valor = ""
) {

    const select =
        document.getElementById(
            "manutVeiculo"
        );


    if (!select) {
        return;
    }


    select.innerHTML = `
        <option value="">
            Selecione
        </option>
    `;


    frota.forEach(
        veiculo => {

            select.insertAdjacentHTML(
                "beforeend",
                `
                    <option value="${escAttr(veiculo.id)}">
                        ${esc(veiculo.cv)}
                        —
                        ${esc(veiculo.area || "")}
                    </option>
                `
            );

        }
    );


    if (valor) {

        select.value =
            valor;

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


    if (!manutencao) {
        return;
    }


    editandoManutencaoId =
        manutencao.id;


    setText(
        "tituloModalManutencao",
        "Editar manutenção"
    );


    preencherVeiculosManutencao(
        manutencao.veiculoId
    );


    setVal(
        "manutencaoId",
        manutencao.id
    );


    setVal(
        "manutTipo",
        manutencao.tipo
    );


    setVal(
        "manutMotivo",
        manutencao.motivo
    );


    setVal(
        "manutEntrada",
        manutencao.entrada
    );


    setVal(
        "manutPrevisao",
        manutencao.previsao || ""
    );


    setVal(
        "manutSaida",
        manutencao.saida || ""
    );


    setVal(
        "manutStatus",
        manutencao.status
    );


    setVal(
        "manutObservacao",
        manutencao.observacao || ""
    );


    abrirModal(
        "modalManutencao"
    );

}


window.editarManutencao =
    editarManutencao;


/* =========================================================
   SALVAR MANUTENÇÃO
========================================================= */

function salvarManutencao(evento) {

    evento.preventDefault();


    const veiculo =
        frota.find(
            item =>
                String(item.id) ===
                String(
                    getVal(
                        "manutVeiculo"
                    )
                )
        );


    const dados = {

        id:
            editandoManutencaoId ||
            `manut-${Date.now()}`,

        veiculoId:
            getVal(
                "manutVeiculo"
            ),

        cv:
            veiculo?.cv || "",

        tipo:
            getVal(
                "manutTipo"
            ),

        motivo:
            getVal(
                "manutMotivo"
            ).trim(),

        entrada:
            getVal(
                "manutEntrada"
            ),

        previsao:
            getVal(
                "manutPrevisao"
            ),

        saida:
            getVal(
                "manutSaida"
            ),

        status:
            getVal(
                "manutStatus"
            ),

        observacao:
            getVal(
                "manutObservacao"
            ).trim()

    };


    if (editandoManutencaoId) {

        const indice =
            manutencoes.findIndex(
                manutencao =>
                    String(
                        manutencao.id
                    ) ===
                    String(
                        editandoManutencaoId
                    )
            );


        if (indice >= 0) {

            manutencoes[indice] =
                dados;

        }

    } else {

        manutencoes.push(
            dados
        );

    }


    salvarManutencoes();


    atualizarStatusVeiculoPorManutencao(
        dados
    );


    fecharModal(
        "modalManutencao"
    );


    evento.target.reset();


    editandoManutencaoId =
        null;


    renderizarTudo();

}


/* =========================================================
   MANUTENÇÃO → FROTA
========================================================= */

function atualizarStatusVeiculoPorManutencao(
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


    if (!veiculo) {
        return;
    }


    if (
        manutencao.status ===
        "Em manutenção"
    ) {

        veiculo.status =
            "Parado";


        salvarAlteracaoFrota(
            veiculo
        );

    }

}


/* =========================================================
   BOTÕES
========================================================= */

function configurarBotoes() {

    const btnNovoVeiculo =
        document.getElementById(
            "btnNovoVeiculo"
        );


    if (btnNovoVeiculo) {

        btnNovoVeiculo.addEventListener(
            "click",
            () => {

                editandoVeiculoId =
                    null;


                const form =
                    document.getElementById(
                        "formVeiculo"
                    );


                if (form) {
                    form.reset();
                }


                setText(
                    "tituloModalVeiculo",
                    "Novo veículo"
                );


                preencherOperacoes(
                    "area",
                    "operacao",
                    ""
                );


                preencherSuboperacoes(
                    "area",
                    "operacao",
                    "suboperacao",
                    "",
                    "",
                    ""
                );


                preencherMotoristasVeiculo();


                abrirModal(
                    "modalVeiculo"
                );

            }
        );

    }


    const btnNovoMotorista =
        document.getElementById(
            "btnNovoMotorista"
        );


    if (btnNovoMotorista) {

        btnNovoMotorista.addEventListener(
            "click",
            () => {

                editandoMotoristaId =
                    null;


                const form =
                    document.getElementById(
                        "formMotorista"
                    );


                if (form) {
                    form.reset();
                }


                setText(
                    "tituloModalMotorista",
                    "Novo motorista"
                );


                preencherOperacoes(
                    "motoristaArea",
                    "motoristaOperacao",
                    ""
                );


                preencherSuboperacoes(
                    "motoristaArea",
                    "motoristaOperacao",
                    "motoristaSuboperacao",
                    "",
                    "",
                    ""
                );


                abrirModal(
                    "modalMotorista"
                );

            }
        );

    }


    const btnNovaManutencao =
        document.getElementById(
            "btnNovaManutencao"
        );


    if (btnNovaManutencao) {

        btnNovaManutencao.addEventListener(
            "click",
            () => {

                editandoManutencaoId =
                    null;


                const form =
                    document.getElementById(
                        "formManutencao"
                    );


                if (form) {
                    form.reset();
                }


                setText(
                    "tituloModalManutencao",
                    "Nova manutenção"
                );


                preencherVeiculosManutencao();


                setVal(
                    "manutEntrada",
                    new Date()
                        .toISOString()
                        .slice(
                            0,
                            10
                        )
                );


                abrirModal(
                    "modalManutencao"
                );

            }
        );

    }


    document
        .querySelectorAll(
            "[data-fechar]"
        )
        .forEach(
            botao => {

                botao.addEventListener(
                    "click",
                    () => {

                        fecharModal(
                            botao.dataset.fechar
                        );

                    }
                );

            }
        );


    document
        .querySelectorAll(
            `
                #filtroMotoristaBusca,
                #filtroMotoristaArea,
                #filtroMotoristaOperacao,
                #filtroMotoristaTipo,
                #filtroMotoristaTurno,
                #filtroMotoristaStatus
            `
        )
        .forEach(
            campo => {

                campo.addEventListener(
                    "input",
                    renderizarMotoristas
                );

            }
        );


    document
        .querySelectorAll(
            `
                #filtroManutBusca,
                #filtroManutStatus,
                #filtroManutTipo
            `
        )
        .forEach(
            campo => {

                campo.addEventListener(
                    "input",
                    renderizarManutencoes
                );

            }
        );

}


/* =========================================================
   FORMULÁRIOS
========================================================= */

function configurarFormularios() {

    const formVeiculo =
        document.getElementById(
            "formVeiculo"
        );


    const formMotorista =
        document.getElementById(
            "formMotorista"
        );


    const formManutencao =
        document.getElementById(
            "formManutencao"
        );


    if (formVeiculo) {

        formVeiculo.addEventListener(
            "submit",
            salvarVeiculo
        );

    }


    if (formMotorista) {

        formMotorista.addEventListener(
            "submit",
            salvarMotorista
        );

    }


    if (formManutencao) {

        formManutencao.addEventListener(
            "submit",
            salvarManutencao
        );

    }

}


/* =========================================================
   MODAIS
========================================================= */

function configurarFechamentoModais() {

    document
        .querySelectorAll(
            ".modal-overlay"
        )
        .forEach(
            modal => {

                modal.addEventListener(
                    "click",
                    evento => {

                        if (
                            evento.target ===
                            modal
                        ) {

                            fecharModal(
                                modal.id
                            );

                        }

                    }
                );

            }
        );

}


function abrirModal(id) {

    const modal =
        document.getElementById(
            id
        );


    if (modal) {

        modal.classList.add(
            "show"
        );

    }

}


function fecharModal(id) {

    const modal =
        document.getElementById(
            id
        );


    if (modal) {

        modal.classList.remove(
            "show"
        );

    }

}


/* =========================================================
   UTILITÁRIOS
========================================================= */

function setText(
    id,
    valor
) {

    const elemento =
        document.getElementById(
            id
        );


    if (elemento) {

        elemento.textContent =
            valor;

    }

}


function setVal(
    id,
    valor
) {

    const elemento =
        document.getElementById(
            id
        );


    if (elemento) {

        elemento.value =
            valor ?? "";

    }

}


function getVal(id) {

    const elemento =
        document.getElementById(
            id
        );


    return elemento
        ? elemento.value || ""
        : "";

}


function dataBR(valor) {

    if (!valor) {

        return "—";

    }


    const partes =
        String(valor).split("-");


    if (
        partes.length === 3
    ) {

        return (
            partes[2] +
            "/" +
            partes[1] +
            "/" +
            partes[0]
        );

    }


    return valor;

}


function classe(valor) {

    return String(
        valor || ""
    )
        .replace(
            /\s+/g,
            "-"
        )
        .replace(
            /[^\wÀ-ÿ-]/g,
            ""
        );

}


function esc(valor) {

    return String(
        valor ?? ""
    )
        .replace(
            /[&<>"']/g,
            caractere => {

                const mapa = {

                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#039;"

                };


                return mapa[
                    caractere
                ];

            }
        );

}


function escAttr(valor) {

    return esc(
        valor
    );

}
