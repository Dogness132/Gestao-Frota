// ============================================================
// GESTÃO DE FROTA
// Versão 10
// ============================================================

const CHAVE_FROTA_ADICIONAL = "frota_adicional";
const CHAVE_FROTA_ALTERACOES = "frota_alteracoes";
const CHAVE_MOTORISTAS = "motoristas_cadastrados";

let frota = [];
let motoristas = [];


// ============================================================
// HIERARQUIA
// ============================================================

const HIERARQUIA = {

    "Entrega": {

        "Raízen": [
            "City",
            "Dedicado"
        ],

        "Nexta": [
            "Geral"
        ]

    },

    "Coleta": {

        "Raízen": [
            "Geral"
        ],

        "Nexta": [
            "Geral"
        ]

    },

    "JET": {

        "JET": [
            "JET"
        ]

    }

};


// ============================================================
// INICIALIZAÇÃO
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {

    configurarNavegacao();

    configurarHierarquiaVeiculo();

    configurarHierarquiaMotorista();

    configurarFiltrosMotoristas();

    configurarModais();

    await carregarFrota();

    carregarMotoristas();

    atualizarDashboard();

    atualizarMotoristas();

});


// ============================================================
// NAVEGAÇÃO
// ============================================================

function configurarNavegacao() {

    const itens =
        document.querySelectorAll(
            ".menu-item[data-pagina]"
        );


    itens.forEach(item => {

        item.addEventListener(
            "click",
            event => {

                event.preventDefault();

                const pagina =
                    item.dataset.pagina;

                abrirPagina(pagina);

            }
        );

    });

}


function abrirPagina(nome) {

    const paginas =
        document.querySelectorAll(
            ".pagina"
        );


    paginas.forEach(pagina => {

        pagina.classList.add(
            "oculto"
        );

    });


    const paginaSelecionada =
        document.getElementById(
            `pagina${capitalizar(nome)}`
        );


    if (paginaSelecionada) {

        paginaSelecionada.classList.remove(
            "oculto"
        );

    }


    const itens =
        document.querySelectorAll(
            ".menu-item[data-pagina]"
        );


    itens.forEach(item => {

        item.classList.remove(
            "active"
        );


        if (
            item.dataset.pagina === nome
        ) {

            item.classList.add(
                "active"
            );

        }

    });

}


// ============================================================
// CAPITALIZAR
// ============================================================

function capitalizar(texto) {

    return texto.charAt(0).toUpperCase()
        + texto.slice(1);

}


// ============================================================
// FROTA
// ============================================================

async function carregarFrota() {

    try {

        const resposta =
            await fetch(
                `data/frota.json?v=${Date.now()}`,
                {
                    cache: "no-store"
                }
            );


        if (!resposta.ok) {

            throw new Error(
                `Erro HTTP ${resposta.status}`
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
            frotaBase.map(veiculo => {

                const alteracao =
                    alteracoes[
                        veiculo.id
                    ];


                if (alteracao) {

                    return {
                        ...veiculo,
                        ...alteracao
                    };

                }


                return veiculo;

            });


        frota = [
            ...frota,
            ...adicionais
        ];


        renderizarFrota();

        atualizarDashboard();

    } catch (erro) {

        console.error(
            "Erro ao carregar frota:",
            erro
        );


        const tabela =
            document.getElementById(
                "tabelaFrota"
            );


        if (tabela) {

            tabela.innerHTML = `
                <tr>
                    <td colspan="10" class="empty-row">
                        Erro ao carregar a frota.
                    </td>
                </tr>
            `;

        }

    }

}


// ============================================================
// RENDER FROTA
// ============================================================

function renderizarFrota() {

    const tabela =
        document.getElementById(
            "tabelaFrota"
        );


    if (!tabela) return;


    tabela.innerHTML = "";


    if (!frota.length) {

        tabela.innerHTML = `
            <tr>
                <td colspan="10" class="empty-row">
                    Nenhum veículo cadastrado.
                </td>
            </tr>
        `;

        return;

    }


    frota.forEach(veiculo => {

        const linha =
            document.createElement(
                "tr"
            );


        linha.innerHTML = `

            <td>
                <strong>
                    ${escapeHtml(
                        veiculo.cv || "-"
                    )}
                </strong>
            </td>

            <td>
                ${escapeHtml(
                    veiculo.sm1 || "-"
                )}
            </td>

            <td>
                ${escapeHtml(
                    veiculo.sm2 || "-"
                )}
            </td>

            <td>
                ${escapeHtml(
                    veiculo.area || "-"
                )}
            </td>

            <td>
                ${escapeHtml(
                    veiculo.operacao || "-"
                )}
            </td>

            <td>
                ${escapeHtml(
                    veiculo.suboperacao || "-"
                )}
            </td>

            <td>
                ${escapeHtml(
                    nomeMotorista(
                        veiculo.motoristaDia
                    )
                )}
            </td>

            <td>
                ${escapeHtml(
                    nomeMotorista(
                        veiculo.motoristaNoite
                    )
                )}
            </td>

            <td>
                ${badgeStatusVeiculo(
                    veiculo.status
                )}
            </td>

            <td>

                <div class="action-buttons">

                    <button
                        class="action-button"
                        onclick="editarVeiculo('${escapeAttribute(veiculo.id)}')"
                    >
                        Editar
                    </button>

                </div>

            </td>

        `;


        tabela.appendChild(linha);

    });

}


// ============================================================
// MOTORISTA POR ID
// ============================================================

function nomeMotorista(id) {

    if (!id) {

        return "-";

    }


    const motorista =
        motoristas.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!motorista) {

        return "Não encontrado";

    }


    return motorista.nome || "-";

}


// ============================================================
// STATUS VEÍCULO
// ============================================================

function badgeStatusVeiculo(status) {

    const classe = {

        "Rodando":
            "status-rodando",

        "Parado":
            "status-parado",

        "Reserva":
            "status-reserva"

    }[status] || "";


    return `
        <span class="status-badge ${classe}">
            ${escapeHtml(
                status || "-"
            )}
        </span>
    `;

}


// ============================================================
// DASHBOARD
// ============================================================

function atualizarDashboard() {

    const total =
        frota.length;


    const rodando =
        frota.filter(
            v =>
                v.status ===
                "Rodando"
        ).length;


    const parado =
        frota.filter(
            v =>
                v.status ===
                "Parado"
        ).length;


    const reserva =
        frota.filter(
            v =>
                v.status ===
                "Reserva"
        ).length;


    setTexto(
        "frotaTotal",
        total
    );


    setTexto(
        "frotaOperando",
        rodando
    );


    setTexto(
        "frotaParada",
        parado
    );


    setTexto(
        "frotaReserva",
        reserva
    );


    setTexto(
        "legendOperando",
        rodando
    );


    setTexto(
        "legendParados",
        parado
    );


    setTexto(
        "legendReserva",
        reserva
    );


    const percentual =
        total > 0
            ? Math.round(
                (rodando / total) * 100
            )
            : 0;


    setTexto(
        "percentualOperacao",
        `${percentual}%`
    );


    const donut =
        document.querySelector(
            ".donut"
        );


    if (donut) {

        const grausRodando =
            total > 0
                ? (rodando / total) * 360
                : 0;


        const grausParado =
            total > 0
                ? (parado / total) * 360
                : 0;


        const inicioParado =
            grausRodando;


        const fimParado =
            grausRodando +
            grausParado;


        donut.style.background = `
            conic-gradient(
                var(--green)
                0deg
                ${grausRodando}deg,

                var(--red)
                ${inicioParado}deg
                ${fimParado}deg,

                var(--yellow)
                ${fimParado}deg
                360deg
            )
        `;

    }


    const raizen =
        frota.filter(
            v =>
                v.operacao ===
                "Raízen"
        ).length;


    const nexta =
        frota.filter(
            v =>
                v.operacao ===
                "Nexta"
        ).length;


    setTexto(
        "distribuicaoRaizenNumero",
        raizen
    );


    setTexto(
        "distribuicaoNextaNumero",
        nexta
    );


    setTexto(
        "distribuicaoRaizenTexto",
        `${raizen} veículos`
    );


    setTexto(
        "distribuicaoNextaTexto",
        `${nexta} veículos`
    );


    const percentualRaizen =
        total > 0
            ? (raizen / total) * 100
            : 0;


    const percentualNexta =
        total > 0
            ? (nexta / total) * 100
            : 0;


    const barraRaizen =
        document.getElementById(
            "barraRaizen"
        );


    const barraNexta =
        document.getElementById(
            "barraNexta"
        );


    if (barraRaizen) {

        barraRaizen.style.width =
            `${percentualRaizen}%`;

    }


    if (barraNexta) {

        barraNexta.style.width =
            `${percentualNexta}%`;

    }

}


// ============================================================
// MODAIS
// ============================================================

function configurarModais() {

    const btnNovo =
        document.getElementById(
            "btnNovoVeiculo"
        );


    const btnFechar =
        document.getElementById(
            "btnFecharModal"
        );


    const btnCancelar =
        document.getElementById(
            "btnCancelarVeiculo"
        );


    const modal =
        document.getElementById(
            "modalVeiculo"
        );


    if (btnNovo) {

        btnNovo.addEventListener(
            "click",
            abrirNovoVeiculo
        );

    }


    if (btnFechar) {

        btnFechar.addEventListener(
            "click",
            fecharModalVeiculo
        );

    }


    if (btnCancelar) {

        btnCancelar.addEventListener(
            "click",
            fecharModalVeiculo
        );

    }


    if (modal) {

        modal.addEventListener(
            "click",
            event => {

                if (
                    event.target === modal
                ) {

                    fecharModalVeiculo();

                }

            }
        );

    }


    const form =
        document.getElementById(
            "formVeiculo"
        );


    if (form) {

        form.addEventListener(
            "submit",
            salvarVeiculo
        );

    }


    const btnNovoMotorista =
        document.getElementById(
            "btnNovoMotorista"
        );


    const btnFecharMotorista =
        document.getElementById(
            "btnFecharModalMotorista"
        );


    const btnCancelarMotorista =
        document.getElementById(
            "btnCancelarMotorista"
        );


    const modalMotorista =
        document.getElementById(
            "modalMotorista"
        );


    if (btnNovoMotorista) {

        btnNovoMotorista.addEventListener(
            "click",
            abrirNovoMotorista
        );

    }


    if (btnFecharMotorista) {

        btnFecharMotorista.addEventListener(
            "click",
            fecharModalMotorista
        );

    }


    if (btnCancelarMotorista) {

        btnCancelarMotorista.addEventListener(
            "click",
            fecharModalMotorista
        );

    }


    if (modalMotorista) {

        modalMotorista.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    modalMotorista
                ) {

                    fecharModalMotorista();

                }

            }
        );

    }


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

}


// ============================================================
// NOVO VEÍCULO
// ============================================================

function abrirNovoVeiculo() {

    limparFormularioVeiculo();


    document.getElementById(
        "tituloModalVeiculo"
    ).textContent =
        "Novo veículo";


    preencherMotoristasVeiculo();


    document.getElementById(
        "modalVeiculo"
    ).classList.add(
        "show"
    );

}


// ============================================================
// EDITAR VEÍCULO
// ============================================================

function editarVeiculo(id) {

    const veiculo =
        frota.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!veiculo) {

        alert(
            "Veículo não encontrado."
        );

        return;

    }


    document.getElementById(
        "tituloModalVeiculo"
    ).textContent =
        "Editar veículo";


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
        "status"
    ).value =
        veiculo.status ||
        "Rodando";


    document.getElementById(
        "area"
    ).value =
        veiculo.area || "";


    atualizarOperacoesVeiculo(
        veiculo.operacao || ""
    );


    atualizarSuboperacoesVeiculo(
        veiculo.suboperacao || ""
    );


    preencherMotoristasVeiculo(
        veiculo.motoristaDia || "",
        veiculo.motoristaNoite || ""
    );


    document.getElementById(
        "modalVeiculo"
    ).classList.add(
        "show"
    );

}


// ============================================================
// SALVAR VEÍCULO
// ============================================================

function salvarVeiculo(event) {

    event.preventDefault();


    const idAtual =
        document.getElementById(
            "veiculoId"
        ).value;


    const dados = {

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
            ).value,

        motoristaDia:
            document.getElementById(
                "motoristaDia"
            ).value || "",

        motoristaNoite:
            document.getElementById(
                "motoristaNoite"
            ).value || ""

    };


    if (!dados.cv) {

        alert(
            "Informe o CV."
        );

        return;

    }


    if (!idAtual) {

        const adicionais =
            JSON.parse(
                localStorage.getItem(
                    CHAVE_FROTA_ADICIONAL
                ) || "[]"
            );


        const novo = {

            id:
                `local-${Date.now()}`,

            ...dados

        };


        adicionais.push(
            novo
        );


        localStorage.setItem(
            CHAVE_FROTA_ADICIONAL,
            JSON.stringify(
                adicionais
            )
        );

    } else {

        const alteracoes =
            JSON.parse(
                localStorage.getItem(
                    CHAVE_FROTA_ALTERACOES
                ) || "{}"
            );


        alteracoes[idAtual] =
            dados;


        localStorage.setItem(
            CHAVE_FROTA_ALTERACOES,
            JSON.stringify(
                alteracoes
            )
        );

    }


    fecharModalVeiculo();

    carregarFrota();

}


// ============================================================
// LIMPAR FORM VEÍCULO
// ============================================================

function limparFormularioVeiculo() {

    document.getElementById(
        "formVeiculo"
    ).reset();


    document.getElementById(
        "veiculoId"
    ).value =
        "";


    const operacao =
        document.getElementById(
            "operacao"
        );


    const suboperacao =
        document.getElementById(
            "suboperacao"
        );


    operacao.innerHTML = `
        <option value="">
            Selecione
        </option>
    `;


    suboperacao.innerHTML = `
        <option value="">
            Selecione
        </option>
    `;


    preencherMotoristasVeiculo();

}


// ============================================================
// FECHAR MODAL VEÍCULO
// ============================================================

function fecharModalVeiculo() {

    document.getElementById(
        "modalVeiculo"
    ).classList.remove(
        "show"
    );

}


// ============================================================
// HIERARQUIA VEÍCULO
// ============================================================

function configurarHierarquiaVeiculo() {

    const area =
        document.getElementById(
            "area"
        );


    if (!area) return;


    area.addEventListener(
        "change",
        () => {

            atualizarOperacoesVeiculo();

            atualizarSuboperacoesVeiculo();

            preencherMotoristasVeiculo();

        }
    );


    const operacao =
        document.getElementById(
            "operacao"
        );


    if (operacao) {

        operacao.addEventListener(
            "change",
            () => {

                atualizarSuboperacoesVeiculo();

                preencherMotoristasVeiculo();

            }
        );

    }


    const suboperacao =
        document.getElementById(
            "suboperacao"
        );


    if (suboperacao) {

        suboperacao.addEventListener(
            "change",
            () => {

                preencherMotoristasVeiculo();

            }
        );

    }

}


function atualizarOperacoesVeiculo(
    operacaoSelecionada = ""
) {

    const area =
        document.getElementById(
            "area"
        );


    const operacao =
        document.getElementById(
            "operacao"
        );


    if (!area || !operacao) {
        return;
    }


    operacao.innerHTML = `
        <option value="">
            Selecione
        </option>
    `;


    const areaSelecionada =
        area.value;


    if (
        !areaSelecionada ||
        !HIERARQUIA[
            areaSelecionada
        ]
    ) {

        atualizarSuboperacoesVeiculo();

        return;

    }


    Object.keys(
        HIERARQUIA[
            areaSelecionada
        ]
    ).forEach(
        nomeOperacao => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                nomeOperacao;


            option.textContent =
                nomeOperacao;


            if (
                nomeOperacao ===
                operacaoSelecionada
            ) {

                option.selected =
                    true;

            }


            operacao.appendChild(
                option
            );

        }
    );


    atualizarSuboperacoesVeiculo();

}


function atualizarSuboperacoesVeiculo(
    suboperacaoSelecionada = ""
) {

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


    if (
        !area ||
        !operacao ||
        !suboperacao
    ) {
        return;
    }


    suboperacao.innerHTML = `
        <option value="">
            Selecione
        </option>
    `;


    const lista =
        HIERARQUIA[
            area.value
        ]?.[
            operacao.value
        ] || [];


    lista.forEach(
        nome => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                nome;


            option.textContent =
                nome;


            if (
                nome ===
                suboperacaoSelecionada
            ) {

                option.selected =
                    true;

            }


            suboperacao.appendChild(
                option
            );

        }
    );

}


// ============================================================
// MOTORISTAS DISPONÍVEIS PARA VEÍCULO
// ============================================================

function preencherMotoristasVeiculo(
    motoristaDiaSelecionado = "",
    motoristaNoiteSelecionado = ""
) {

    const selectDia =
        document.getElementById(
            "motoristaDia"
        );


    const selectNoite =
        document.getElementById(
            "motoristaNoite"
        );


    if (
        !selectDia ||
        !selectNoite
    ) {
        return;
    }


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


    // --------------------------------------------------------
    // FILTRO BASE
    // Área + Operação + Suboperação + Status
    // --------------------------------------------------------

    const disponiveis =
        motoristas.filter(
            motorista => {

                if (
                    motorista.status !==
                    "Ativo"
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


    // --------------------------------------------------------
    // DIA
    // Somente cronotipo/turno Dia
    // --------------------------------------------------------

    const motoristasDia =
        disponiveis.filter(
            motorista =>
                motorista.turno ===
                "Dia"
        );


    // --------------------------------------------------------
    // NOITE
    // Somente cronotipo/turno Noite
    // --------------------------------------------------------

    const motoristasNoite =
        disponiveis.filter(
            motorista =>
                motorista.turno ===
                "Noite"
        );


    montarSelectMotoristas(
        selectDia,
        motoristasDia,
        motoristaDiaSelecionado
    );


    montarSelectMotoristas(
        selectNoite,
        motoristasNoite,
        motoristaNoiteSelecionado
    );

}


// ============================================================
// MONTAR SELECT DE MOTORISTAS
// ============================================================

function montarSelectMotoristas(
    select,
    lista,
    selecionado
) {

    select.innerHTML = `
        <option value="">
            Sem motorista
        </option>
    `;


    lista
        .sort(
            (a, b) =>
                a.nome.localeCompare(
                    b.nome,
                    "pt-BR"
                )
        )
        .forEach(
            motorista => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    motorista.id;


                option.textContent =
                    `${motorista.nome} — ${motorista.turno}`;


                if (
                    String(
                        motorista.id
                    ) ===
                    String(
                        selecionado
                    )
                ) {

                    option.selected =
                        true;

                }


                select.appendChild(
                    option
                );

            }
        );

}


// ============================================================
// MOTORISTAS
// ============================================================

function carregarMotoristas() {

    try {

        motoristas =
            JSON.parse(
                localStorage.getItem(
                    CHAVE_MOTORISTAS
                ) || "[]"
            );

    } catch (erro) {

        console.error(
            "Erro ao carregar motoristas:",
            erro
        );

        motoristas = [];

    }


    atualizarMotoristas();

    preencherFiltrosMotoristas();

    renderizarFrota();

}


// ============================================================
// SALVAR LISTA MOTORISTAS
// ============================================================

function salvarListaMotoristas() {

    localStorage.setItem(
        CHAVE_MOTORISTAS,
        JSON.stringify(
            motoristas
        )
    );

}


// ============================================================
// ATUALIZAR MOTORISTAS
// ============================================================

function atualizarMotoristas() {

    const total =
        motoristas.length;


    const ativos =
        motoristas.filter(
            m =>
                m.status ===
                "Ativo"
        ).length;


    const fixos =
        motoristas.filter(
            m =>
                m.tipo ===
                "Fixo"
        ).length;


    const reservas =
        motoristas.filter(
            m =>
                m.tipo ===
                "Reserva"
        ).length;


    setTexto(
        "motoristasTotal",
        total
    );


    setTexto(
        "motoristasAtivos",
        ativos
    );


    setTexto(
        "motoristasFixos",
        fixos
    );


    setTexto(
        "motoristasReservas",
        reservas
    );


    renderizarMotoristas();

}


// ============================================================
// RENDER MOTORISTAS
// ============================================================

function renderizarMotoristas() {

    const tabela =
        document.getElementById(
            "tabelaMotoristas"
        );


    if (!tabela) return;


    tabela.innerHTML = "";


    const busca =
        document.getElementById(
            "filtroMotoristaBusca"
        )?.value
        .trim()
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


    const status =
        document.getElementById(
            "filtroMotoristaStatus"
        )?.value || "";


    const turno =
        document.getElementById(
            "filtroMotoristaTurno"
        )?.value || "";


    const filtrados =
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


                const correspondeStatus =
                    !status ||
                    motorista.status ===
                    status;


                const correspondeTurno =
                    !turno ||
                    motorista.turno ===
                    turno;


                return (
                    correspondeBusca &&
                    correspondeArea &&
                    correspondeOperacao &&
                    correspondeTipo &&
                    correspondeStatus &&
                    correspondeTurno
                );

            }
        );


    if (!filtrados.length) {

        tabela.innerHTML = `
            <tr>
                <td colspan="8" class="empty-row">
                    Nenhum motorista encontrado.
                </td>
            </tr>
        `;

        return;

    }


    filtrados.forEach(
        motorista => {

            const linha =
                document.createElement(
                    "tr"
                );


            linha.innerHTML = `

                <td>
                    <strong>
                        ${escapeHtml(
                            motorista.nome
                        )}
                    </strong>
                </td>

                <td>
                    ${escapeHtml(
                        motorista.area ||
                        "-"
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        motorista.operacao ||
                        "-"
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        motorista.suboperacao ||
                        "-"
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        motorista.tipo ||
                        "-"
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        motorista.turno ||
                        "-"
                    )}
                </td>

                <td>
                    ${badgeStatusMotorista(
                        motorista.status
                    )}
                </td>

                <td>

                    <div class="action-buttons">

                        <button
                            class="action-button"
                            onclick="editarMotorista('${escapeAttribute(motorista.id)}')"
                        >
                            Editar
                        </button>

                    </div>

                </td>

            `;


            tabela.appendChild(
                linha
            );

        }
    );

}


// ============================================================
// BADGE MOTORISTA
// ============================================================

function badgeStatusMotorista(
    status
) {

    const classe = {

        "Ativo":
            "motorista-ativo",

        "Inativo":
            "motorista-inativo",

        "Afastado":
            "motorista-afastado"

    }[
        status
    ] || "";


    return `
        <span class="motorista-status ${classe}">
            ${escapeHtml(
                status || "-"
            )}
        </span>
    `;

}


// ============================================================
// NOVO MOTORISTA
// ============================================================

function abrirNovoMotorista() {

    const form =
        document.getElementById(
            "formMotorista"
        );


    form.reset();


    document.getElementById(
        "motoristaId"
    ).value =
        "";


    document.getElementById(
        "tituloModalMotorista"
    ).textContent =
        "Novo motorista";


    limparHierarquiaMotorista();


    document.getElementById(
        "modalMotorista"
    ).classList.add(
        "show"
    );

}


// ============================================================
// EDITAR MOTORISTA
// ============================================================

function editarMotorista(id) {

    const motorista =
        motoristas.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!motorista) {

        alert(
            "Motorista não encontrado."
        );

        return;

    }


    document.getElementById(
        "tituloModalMotorista"
    ).textContent =
        "Editar motorista";


    document.getElementById(
        "motoristaId"
    ).value =
        motorista.id;


    document.getElementById(
        "motoristaNome"
    ).value =
        motorista.nome || "";


    document.getElementById(
        "motoristaArea"
    ).value =
        motorista.area || "";


    atualizarOperacoesMotorista(
        motorista.operacao || ""
    );


    atualizarSuboperacoesMotorista(
        motorista.suboperacao || ""
    );


    document.getElementById(
        "motoristaTipo"
    ).value =
        motorista.tipo ||
        "Fixo";


    document.getElementById(
        "motoristaTurno"
    ).value =
        motorista.turno ||
        "Dia";


    document.getElementById(
        "motoristaStatus"
    ).value =
        motorista.status ||
        "Ativo";


    document.getElementById(
        "motoristaObservacao"
    ).value =
        motorista.observacao ||
        "";


    document.getElementById(
        "modalMotorista"
    ).classList.add(
        "show"
    );

}


// ============================================================
// SALVAR MOTORISTA
// ============================================================

function salvarMotorista(
    event
) {

    event.preventDefault();


    const id =
        document.getElementById(
            "motoristaId"
        ).value;


    const dados = {

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


    if (!dados.nome) {

        alert(
            "Informe o nome do motorista."
        );

        return;

    }


    if (!dados.area) {

        alert(
            "Selecione a área."
        );

        return;

    }


    if (!dados.operacao) {

        alert(
            "Selecione a operação."
        );

        return;

    }


    if (!dados.suboperacao) {

        alert(
            "Selecione a suboperação."
        );

        return;

    }


    if (id) {

        const indice =
            motoristas.findIndex(
                motorista =>
                    String(
                        motorista.id
                    ) ===
                    String(id)
            );


        if (indice !== -1) {

            motoristas[indice] = {

                ...motoristas[indice],

                ...dados

            };

        }

    } else {

        motoristas.push({

            id:
                `mot-${Date.now()}`,

            ...dados

        });

    }


    salvarListaMotoristas();

    atualizarMotoristas();

    preencherFiltrosMotoristas();

    fecharModalMotorista();

    renderizarFrota();

}


// ============================================================
// FECHAR MODAL MOTORISTA
// ============================================================

function fecharModalMotorista() {

    document.getElementById(
        "modalMotorista"
    ).classList.remove(
        "show"
    );

}


// ============================================================
// HIERARQUIA MOTORISTA
// ============================================================

function configurarHierarquiaMotorista() {

    const area =
        document.getElementById(
            "motoristaArea"
        );


    if (!area) return;


    area.addEventListener(
        "change",
        () => {

            atualizarOperacoesMotorista();

            atualizarSuboperacoesMotorista();

        }
    );


    const operacao =
        document.getElementById(
            "motoristaOperacao"
        );


    if (operacao) {

        operacao.addEventListener(
            "change",
            () => {

                atualizarSuboperacoesMotorista();

            }
        );

    }

}


function atualizarOperacoesMotorista(
    operacaoSelecionada = ""
) {

    const area =
        document.getElementById(
            "motoristaArea"
        );


    const operacao =
        document.getElementById(
            "motoristaOperacao"
        );


    if (
        !area ||
        !operacao
    ) {
        return;
    }


    operacao.innerHTML = `
        <option value="">
            Selecione
        </option>
    `;


    const dados =
        HIERARQUIA[
            area.value
        ];


    if (!dados) {

        atualizarSuboperacoesMotorista();

        return;

    }


    Object.keys(
        dados
    ).forEach(
        nome => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                nome;


            option.textContent =
                nome;


            if (
                nome ===
                operacaoSelecionada
            ) {

                option.selected =
                    true;

            }


            operacao.appendChild(
                option
            );

        }
    );


    atualizarSuboperacoesMotorista();

}


function atualizarSuboperacoesMotorista(
    suboperacaoSelecionada = ""
) {

    const area =
        document.getElementById(
            "motoristaArea"
        );


    const operacao =
        document.getElementById(
            "motoristaOperacao"
        );


    const suboperacao =
        document.getElementById(
            "motoristaSuboperacao"
        );


    if (
        !area ||
        !operacao ||
        !suboperacao
    ) {
        return;
    }


    suboperacao.innerHTML = `
        <option value="">
            Selecione
        </option>
    `;


    const lista =
        HIERARQUIA[
            area.value
        ]?.[
            operacao.value
        ] || [];


    lista.forEach(
        nome => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                nome;


            option.textContent =
                nome;


            if (
                nome ===
                suboperacaoSelecionada
            ) {

                option.selected =
                    true;

            }


            suboperacao.appendChild(
                option
            );

        }
    );

}


function limparHierarquiaMotorista() {

    const operacao =
        document.getElementById(
            "motoristaOperacao"
        );


    const suboperacao =
        document.getElementById(
            "motoristaSuboperacao"
        );


    if (operacao) {

        operacao.innerHTML = `
            <option value="">
                Selecione
            </option>
        `;

    }


    if (suboperacao) {

        suboperacao.innerHTML = `
            <option value="">
                Selecione
            </option>
        `;

    }

}


// ============================================================
// FILTROS MOTORISTAS
// ============================================================

function configurarFiltrosMotoristas() {

    const ids = [

        "filtroMotoristaBusca",

        "filtroMotoristaArea",

        "filtroMotoristaOperacao",

        "filtroMotoristaTipo",

        "filtroMotoristaStatus",

        "filtroMotoristaTurno"

    ];


    ids.forEach(
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
                renderizarMotoristas
            );


            elemento.addEventListener(
                "change",
                renderizarMotoristas
            );

        }
    );

}


// ============================================================
// PREENCHER FILTROS
// ============================================================

function preencherFiltrosMotoristas() {

    preencherSelectUnico(
        "filtroMotoristaArea",
        motoristas.map(
            motorista =>
                motorista.area
        )
    );


    preencherSelectUnico(
        "filtroMotoristaOperacao",
        motoristas.map(
            motorista =>
                motorista.operacao
        )
    );

}


function preencherSelectUnico(
    id,
    valores
) {

    const select =
        document.getElementById(
            id
        );


    if (!select) return;


    const valorAtual =
        select.value;


    const primeiraOpcao =
        select.options[0]
            ?.textContent ||
        "Todos";


    const valoresUnicos =
        [
            ...new Set(
                valores.filter(
                    Boolean
                )
            )
        ].sort(
            (a, b) =>
                a.localeCompare(
                    b,
                    "pt-BR"
                )
        );


    select.innerHTML =
        "";


    const primeira =
        document.createElement(
            "option"
        );


    primeira.value =
        "";


    primeira.textContent =
        primeiraOpcao;


    select.appendChild(
        primeira
    );


    valoresUnicos.forEach(
        valor => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                valor;


            option.textContent =
                valor;


            select.appendChild(
                option
            );

        }
    );


    if (
        valoresUnicos.includes(
            valorAtual
        )
    ) {

        select.value =
            valorAtual;

    }

}


// ============================================================
// UTILITÁRIOS
// ============================================================

function setTexto(
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


function escapeHtml(
    valor
) {

    return String(
        valor ?? ""
    )
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}


function escapeAttribute(
    valor
) {

    return String(
        valor ?? ""
    )
        .replaceAll(
            "\\",
            "\\\\"
        )
        .replaceAll(
            "'",
            "\\'"
        );

}


// ============================================================
// EXPOR FUNÇÕES PARA OS BOTÕES
// ============================================================

window.editarVeiculo =
    editarVeiculo;


window.editarMotorista =
    editarMotorista;
