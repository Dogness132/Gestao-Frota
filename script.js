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


const CHAVE_ALTERACOES =
    "frota_alteracoes";


/* ========================================= */
/* VARIÁVEIS */
/* ========================================= */

let frota = [];

let frotaBase = [];

let frotaAdicional = [];

let frotaAlteracoes = {};


/* ========================================= */
/* ELEMENTOS */
/* ========================================= */

const modal =
    document.getElementById("modalVeiculo");


const formVeiculo =
    document.getElementById("formVeiculo");


const btnNovoVeiculo =
    document.getElementById("btnNovoVeiculo");


const btnDashboardNovo =
    document.getElementById("btnDashboardNovo");


const btnFecharModal =
    document.getElementById("btnFecharModal");


const btnCancelar =
    document.getElementById("btnCancelar");


const tabelaFrota =
    document.getElementById("tabelaFrota");


const tabelaDashboard =
    document.getElementById("tabelaDashboard");


const buscaFrota =
    document.getElementById("buscaFrota");


const filtroArea =
    document.getElementById("filtroArea");


const filtroOperacao =
    document.getElementById("filtroOperacao");


const filtroStatus =
    document.getElementById("filtroStatus");


const selectArea =
    document.getElementById("area");


const selectOperacao =
    document.getElementById("operacao");


const selectSuboperacao =
    document.getElementById("suboperacao");


const tituloModal =
    document.getElementById("tituloModal");


const subtituloModal =
    document.getElementById("subtituloModal");


const veiculoId =
    document.getElementById("veiculoId");


/* ========================================= */
/* UTILIDADES */
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


function gerarId() {

    return (
        Date.now().toString() +
        Math.random()
            .toString(36)
            .substring(2, 8)
    );

}


/* ========================================= */
/* CARREGAR FROTA */
/* ========================================= */

async function carregarFrota() {

    try {

        console.log(
            "Carregando frota..."
        );


        const resposta =
            await fetch(
                URL_FROTA +
                "?v=" +
                Date.now(),
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


        /* =============================== */
        /* VEÍCULOS ADICIONAIS */
        /* =============================== */

        const adicionaisSalvos =
            localStorage.getItem(
                CHAVE_ADICIONAIS
            );


        if (adicionaisSalvos) {

            try {

                frotaAdicional =
                    JSON.parse(
                        adicionaisSalvos
                    );

                if (
                    !Array.isArray(
                        frotaAdicional
                    )
                ) {

                    frotaAdicional = [];

                }

            } catch {

                frotaAdicional = [];

            }

        } else {

            frotaAdicional = [];

        }


        /* =============================== */
        /* ALTERAÇÕES */
        /* =============================== */

        const alteracoesSalvas =
            localStorage.getItem(
                CHAVE_ALTERACOES
            );


        if (alteracoesSalvas) {

            try {

                frotaAlteracoes =
                    JSON.parse(
                        alteracoesSalvas
                    );

            } catch {

                frotaAlteracoes = {};

            }

        } else {

            frotaAlteracoes = {};

        }


        /* =============================== */
        /* MONTAR FROTA */
        /* =============================== */

        const baseComAlteracoes =
            frotaBase.map(
                veiculo => {

                    const alteracao =
                        frotaAlteracoes[
                            veiculo.id
                        ];


                    if (alteracao) {

                        return {
                            ...veiculo,
                            ...alteracao
                        };

                    }


                    return veiculo;

                }
            );


        frota = [
            ...baseComAlteracoes,
            ...frotaAdicional
        ];


        atualizarSistema();


        console.log(
            "Frota carregada:",
            frota
        );


    } catch (erro) {

        console.error(
            "Erro ao carregar frota:",
            erro
        );


        if (tabelaFrota) {

            tabelaFrota.innerHTML = `
                <tr>
                    <td colspan="8">
                        Erro ao carregar a frota.
                    </td>
                </tr>
            `;

        }

    }

}


/* ========================================= */
/* SALVAR DADOS */
/* ========================================= */

function salvarAdicionais() {

    localStorage.setItem(
        CHAVE_ADICIONAIS,
        JSON.stringify(
            frotaAdicional
        )
    );

}


function salvarAlteracoes() {

    localStorage.setItem(
        CHAVE_ALTERACOES,
        JSON.stringify(
            frotaAlteracoes
        )
    );

}


/* ========================================= */
/* ATUALIZAR SISTEMA */
/* ========================================= */

function atualizarSistema() {

    atualizarIndicadores();

    atualizarGrafico();

    atualizarDistribuicao();

    atualizarTabelaDashboard();

    atualizarTabelaFrota();

}


/* ========================================= */
/* DASHBOARD — INDICADORES */
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
/* DASHBOARD — DONUT */
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


    const donut =
        document.getElementById(
            "donut"
        );


    if (total === 0) {

        donut.style.background =
            "#303846";

        return;

    }


    const grausOperando =
        (operando / total) * 360;


    const grausParado =
        (parados / total) * 360;


    const fimParado =
        grausOperando +
        grausParado;


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
/* DASHBOARD — DISTRIBUIÇÃO */
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
    ).textContent =
        raizen;


    document.getElementById(
        "quantidadeNexta"
    ).textContent =
        nexta;


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
/* STATUS */
/* ========================================= */

function obterClasseStatus(status) {

    if (
        status === "Rodando"
    ) {

        return "status-rodando";

    }


    if (
        status === "Parado"
    ) {

        return "status-parado";

    }


    if (
        status === "Reserva"
    ) {

        return "status-reserva";

    }


    return "";

}


/* ========================================= */
/* TABELA DASHBOARD */
/* ========================================= */

function atualizarTabelaDashboard() {

    if (!tabelaDashboard) {
        return;
    }


    tabelaDashboard.innerHTML = "";


    const lista =
        frota.slice(0, 10);


    lista.forEach(
        veiculo => {

            const linha =
                document.createElement(
                    "tr"
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
                        class="status-badge
                        ${obterClasseStatus(
                            veiculo.status
                        )}"
                    >
                        ${valorSeguro(
                            veiculo.status
                        )}
                    </span>

                </td>

            `;


            tabelaDashboard.appendChild(
                linha
            );

        }
    );

}


/* ========================================= */
/* FILTROS DA FROTA */
/* ========================================= */

function obterFrotaFiltrada() {

    const busca =
        normalizar(
            buscaFrota.value
        );


    const area =
        normalizar(
            filtroArea.value
        );


    const operacao =
        normalizar(
            filtroOperacao.value
        );


    const status =
        normalizar(
            filtroStatus.value
        );


    return frota.filter(
        veiculo => {

            const textoBusca = [

                veiculo.cv,
                veiculo.sm1,
                veiculo.sm2

            ]
                .map(normalizar)
                .join(" ");


            const passouBusca =
                !busca ||
                textoBusca.includes(
                    busca
                );


            const passouArea =
                !area ||
                normalizar(
                    veiculo.area
                ) === area;


            const passouOperacao =
                !operacao ||
                normalizar(
                    veiculo.operacao
                ) === operacao;


            const passouStatus =
                !status ||
                normalizar(
                    veiculo.status
                ) === status;


            return (
                passouBusca &&
                passouArea &&
                passouOperacao &&
                passouStatus
            );

        }
    );

}


/* ========================================= */
/* TABELA COMPLETA DA FROTA */
/* ========================================= */

function atualizarTabelaFrota() {

    if (!tabelaFrota) {
        return;
    }


    tabelaFrota.innerHTML = "";


    const lista =
        obterFrotaFiltrada();


    document.getElementById(
        "contadorFrota"
    ).textContent =
        lista.length +
        (
            lista.length === 1
                ? " veículo"
                : " veículos"
        );


    if (
        lista.length === 0
    ) {

        tabelaFrota.innerHTML = `
            <tr>
                <td colspan="8">
                    Nenhum veículo encontrado.
                </td>
            </tr>
        `;

        return;

    }


    lista.forEach(
        veiculo => {

            const linha =
                document.createElement(
                    "tr"
                );


            linha.innerHTML = `

                <td>
                    <strong>
                        ${valorSeguro(
                            veiculo.cv
                        )}
                    </strong>
                </td>

                <td>
                    ${valorSeguro(
                        veiculo.sm1
                    )}
                </td>

                <td>
                    ${valorSeguro(
                        veiculo.sm2
                    )}
                </td>

                <td>
                    ${valorSeguro(
                        veiculo.area
                    )}
                </td>

                <td>
                    ${valorSeguro(
                        veiculo.operacao
                    )}
                </td>

                <td>
                    ${valorSeguro(
                        veiculo.suboperacao
                    )}
                </td>

                <td>

                    <span
                        class="status-badge
                        ${obterClasseStatus(
                            veiculo.status
                        )}"
                    >
                        ${valorSeguro(
                            veiculo.status
                        )}
                    </span>

                </td>

                <td>

                    <div class="table-actions">

                        <button
                            class="action-button edit"
                            type="button"
                            data-editar="${veiculo.id}"
                        >
                            ✏️ Editar
                        </button>

                    </div>

                </td>

            `;


            tabelaFrota.appendChild(
                linha
            );

        }
    );


    /* ================================= */
    /* EVENTOS DOS BOTÕES EDITAR */
    /* ================================= */

    tabelaFrota
        .querySelectorAll(
            "[data-editar]"
        )
        .forEach(
            botao => {

                botao.addEventListener(
                    "click",
                    function () {

                        abrirEdicao(
                            this.dataset.editar
                        );

                    }
                );

            }
        );

}


/* ========================================= */
/* ABRIR MODAL NOVO */
/* ========================================= */

function abrirNovoVeiculo() {

    formVeiculo.reset();


    veiculoId.value = "";


    tituloModal.textContent =
        "Novo veículo";


    subtituloModal.textContent =
        "Cadastre um veículo na frota";


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


    modal.classList.add(
        "show"
    );

}


/* ========================================= */
/* ABRIR EDIÇÃO */
/* ========================================= */

function abrirEdicao(id) {

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


    tituloModal.textContent =
        "Editar veículo";


    subtituloModal.textContent =
        "Altere os dados do conjunto";


    veiculoId.value =
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
        veiculo.status || "Rodando";


    /* =============================== */
    /* ÁREA */
    /* =============================== */

    selectArea.value =
        veiculo.area || "";


    carregarOperacoes(
        veiculo.area
    );


    selectOperacao.value =
        veiculo.operacao || "";


    carregarSuboperacoes(
        veiculo.area,
        veiculo.operacao
    );


    selectSuboperacao.value =
        veiculo.suboperacao || "";


    modal.classList.add(
        "show"
    );

}


/* ========================================= */
/* FECHAR MODAL */
/* ========================================= */

function fecharModal() {

    modal.classList.remove(
        "show"
    );

}


/* ========================================= */
/* OPERAÇÕES POR ÁREA */
/* ========================================= */

function carregarOperacoes(
    area
) {

    selectOperacao.innerHTML =
        "";


    selectSuboperacao.innerHTML =
        "";


    if (!area) {

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

        return;

    }


    selectOperacao.disabled =
        false;


    let operacoes = [];


    if (
        area === "Entrega"
    ) {

        operacoes = [
            "Raízen"
        ];

    }


    else if (
        area === "Coleta"
    ) {

        operacoes = [
            "Nexta"
        ];

    }


    else if (
        area === "JET"
    ) {

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


/* ========================================= */
/* SUBOPERAÇÕES */
/* ========================================= */

function carregarSuboperacoes(
    area,
    operacao
) {

    selectSuboperacao.innerHTML =
        "";


    if (
        !area ||
        !operacao
    ) {

        selectSuboperacao.disabled =
            true;

        selectSuboperacao.innerHTML = `
            <option value="">
                Selecione a operação primeiro
            </option>
        `;

        return;

    }


    selectSuboperacao.disabled =
        false;


    let suboperacoes = [];


    if (
        area === "Entrega" &&
        normalizar(
            operacao
        ) === "raizen"
    ) {

        suboperacoes = [
            "City",
            "Dedicado"
        ];

    }


    else {

        suboperacoes = [
            "Geral"
        ];

    }


    selectSuboperacao.innerHTML = `
        <option value="">
            Selecione
        </option>
    `;


    suboperacoes.forEach(
        suboperacao => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                suboperacao;


            option.textContent =
                suboperacao;


            selectSuboperacao.appendChild(
                option
            );

        }
    );

}


/* ========================================= */
/* EVENTO ÁREA */
/* ========================================= */

selectArea.addEventListener(
    "change",
    function () {

        carregarOperacoes(
            this.value
        );

    }
);


/* ========================================= */
/* EVENTO OPERAÇÃO */
/* ========================================= */

selectOperacao.addEventListener(
    "change",
    function () {

        carregarSuboperacoes(
            selectArea.value,
            this.value
        );

    }
);


/* ========================================= */
/* SALVAR VEÍCULO */
/* ========================================= */

formVeiculo.addEventListener(
    "submit",
    function (evento) {

        evento.preventDefault();


        const id =
            veiculoId.value;


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
                selectArea.value,

            operacao:
                selectOperacao.value,

            suboperacao:
                selectSuboperacao.value,

            status:
                document.getElementById(
                    "status"
                ).value

        };


        /* ================================= */
        /* VALIDAÇÃO */
        /* ================================= */

        if (
            !dados.cv ||
            !dados.sm1 ||
            !dados.sm2 ||
            !dados.area ||
            !dados.operacao ||
            !dados.suboperacao ||
            !dados.status
        ) {

            alert(
                "Preencha todos os campos."
            );

            return;

        }


        /* ================================= */
        /* CV DUPLICADO */
        /* ================================= */

        const cvDuplicado =
            frota.some(
                veiculo => {

                    if (
                        String(
                            veiculo.id
                        ) ===
                        String(id)
                    ) {

                        return false;

                    }


                    return (
                        normalizar(
                            veiculo.cv
                        ) ===
                        normalizar(
                            dados.cv
                        )
                    );

                }
            );


        if (cvDuplicado) {

            alert(
                "Já existe outro veículo com este CV."
            );

            return;

        }


        /* ================================= */
        /* NOVO VEÍCULO */
        /* ================================= */

        if (!id) {

            const novoVeiculo = {

                id: gerarId(),

                ...dados

            };


            frotaAdicional.push(
                novoVeiculo
            );


            salvarAdicionais();


            frota.push(
                novoVeiculo
            );

        }


        /* ================================= */
        /* EDITAR VEÍCULO */
        /* ================================= */

        else {

            const indice =
                frota.findIndex(
                    veiculo =>
                        String(
                            veiculo.id
                        ) ===
                        String(id)
                );


            if (
                indice === -1
            ) {

                alert(
                    "Veículo não encontrado."
                );

                return;

            }


            const ehAdicional =
                frotaAdicional.some(
                    veiculo =>
                        String(
                            veiculo.id
                        ) ===
                        String(id)
                );


            if (ehAdicional) {

                const indiceAdicional =
                    frotaAdicional.findIndex(
                        veiculo =>
                            String(
                                veiculo.id
                            ) ===
                            String(id)
                    );


                frotaAdicional[
                    indiceAdicional
                ] = {

                    ...frotaAdicional[
                        indiceAdicional
                    ],

                    ...dados

                };


                salvarAdicionais();

            }


            else {

                /*
                 * Veículo veio do frota.json.
                 *
                 * Não alteramos o JSON.
                 *
                 * Criamos um override local.
                 */

                frotaAlteracoes[id] =
                    dados;


                salvarAlteracoes();

            }


            frota[indice] = {

                ...frota[indice],

                ...dados

            };

        }


        /* ================================= */
        /* ATUALIZA TUDO */
        /* ================================= */

        atualizarSistema();


        fecharModal();


        alert(
            id
                ? "Veículo atualizado com sucesso!"
                : "Veículo cadastrado com sucesso!"
        );

    }
);


/* ========================================= */
/* BOTÕES MODAL */
/* ========================================= */

btnNovoVeiculo.onclick =
    abrirNovoVeiculo;


btnDashboardNovo.onclick =
    abrirNovoVeiculo;


btnFecharModal.onclick =
    fecharModal;


btnCancelar.onclick =
    fecharModal;


modal.addEventListener(
    "click",
    function (evento) {

        if (
            evento.target === modal
        ) {

            fecharModal();

        }

    }
);


document.addEventListener(
    "keydown",
    function (evento) {

        if (
            evento.key === "Escape"
        ) {

            fecharModal();

        }

    }
);


/* ========================================= */
/* FILTROS */
/* ========================================= */

buscaFrota.addEventListener(
    "input",
    atualizarTabelaFrota
);


filtroArea.addEventListener(
    "change",
    atualizarTabelaFrota
);


filtroOperacao.addEventListener(
    "change",
    atualizarTabelaFrota
);


filtroStatus.addEventListener(
    "change",
    atualizarTabelaFrota
);


/* ========================================= */
/* NAVEGAÇÃO */
/* ========================================= */

const paginas = {

    dashboard:
        document.getElementById(
            "paginaDashboard"
        ),

    frota:
        document.getElementById(
            "paginaFrota"
        ),

    motoristas:
        document.getElementById(
            "paginaMotoristas"
        ),

    escala:
        document.getElementById(
            "paginaEscala"
        ),

    manutencao:
        document.getElementById(
            "paginaManutencao"
        ),

    ocorrencias:
        document.getElementById(
            "paginaOcorrencias"
        ),

    configuracoes:
        document.getElementById(
            "paginaConfiguracoes"
        )

};


const titulos = {

    dashboard: [
        "Dashboard",
        "Visão geral da operação"
    ],

    frota: [
        "Frota",
        "Gestão dos veículos e conjuntos"
    ],

    motoristas: [
        "Motoristas",
        "Cadastro e gestão dos motoristas"
    ],

    escala: [
        "Escala",
        "Controle das jornadas e escalas"
    ],

    manutencao: [
        "Manutenção",
        "Controle de manutenção da frota"
    ],

    ocorrencias: [
        "Ocorrências",
        "Registro e acompanhamento operacional"
    ],

    configuracoes: [
        "Configurações",
        "Configurações do sistema"
    ]

};


document
    .querySelectorAll(
        ".menu-item[data-page]"
    )
    .forEach(
        item => {

            item.addEventListener(
                "click",
                function (evento) {

                    evento.preventDefault();


                    const pagina =
                        this.dataset.page;


                    abrirPagina(
                        pagina
                    );

                }
            );

        }
    );


function abrirPagina(
    pagina
) {

    Object.values(
        paginas
    ).forEach(
        elemento => {

            elemento.classList.add(
                "hidden"
            );

        }
    );


    if (
        paginas[pagina]
    ) {

        paginas[pagina]
            .classList.remove(
                "hidden"
            );

    }


    document
        .querySelectorAll(
            ".menu-item[data-page]"
        )
        .forEach(
            item => {

                item.classList.toggle(
                    "active",
                    item.dataset.page ===
                    pagina
                );

            }
        );


    const titulo =
        titulos[pagina];


    if (titulo) {

        document.getElementById(
            "tituloPagina"
        ).textContent =
            titulo[0];


        document.getElementById(
            "subtituloPagina"
        ).textContent =
            titulo[1];

    }

}


/* ========================================= */
/* INICIALIZAÇÃO */
/* ========================================= */

abrirPagina(
    "dashboard"
);


carregarFrota();
