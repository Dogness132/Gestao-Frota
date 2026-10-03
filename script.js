const URL_FROTA = "data/frota.json";

const CHAVE_ADICIONAIS = "frota_adicional";
const CHAVE_ALTERACOES = "frota_alteracoes";

const CHAVE_MOTORISTAS =
    "motoristas_cadastrados";


let frota = [];

let frotaBase = [];

let frotaAdicional = [];

let frotaAlteracoes = {};

let motoristas = [];


// ======================================================
// HIERARQUIA
// ======================================================

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


// ======================================================
// FUNÇÕES GERAIS
// ======================================================

function normalizar(valor) {

    return String(valor || "")
        .trim()
        .toLowerCase();

}


function valorSeguro(valor) {

    return valor === undefined ||
           valor === null
        ? ""
        : String(valor);

}


function gerarId() {

    return Date.now().toString(36) +
        Math.random()
            .toString(36)
            .substring(2, 8);

}


// ======================================================
// CARREGAR FROTA
// ======================================================

async function carregarFrota() {

    try {

        const resposta = await fetch(
            URL_FROTA + "?v=" + Date.now(),
            {
                cache: "no-store"
            }
        );


        if (!resposta.ok) {

            throw new Error(
                "Não foi possível carregar o arquivo frota.json"
            );

        }


        frotaBase =
            await resposta.json();

    }
    catch (erro) {

        console.error(erro);

        frotaBase = [];

    }


    try {

        frotaAdicional =
            JSON.parse(
                localStorage.getItem(
                    CHAVE_ADICIONAIS
                )
            ) || [];

    }
    catch {

        frotaAdicional = [];

    }


    try {

        frotaAlteracoes =
            JSON.parse(
                localStorage.getItem(
                    CHAVE_ALTERACOES
                )
            ) || {};

    }
    catch {

        frotaAlteracoes = {};

    }


    montarFrota();

}


// ======================================================
// MONTAR FROTA
// ======================================================

function montarFrota() {

    const baseComAlteracoes =
        frotaBase.map(
            veiculo => {

                const alteracao =
                    frotaAlteracoes[
                        veiculo.id
                    ] || {};


                return {

                    ...veiculo,

                    ...alteracao

                };

            }
        );


    frota = [

        ...baseComAlteracoes,

        ...frotaAdicional

    ];


    atualizarSistema();

}


// ======================================================
// STORAGE FROTA
// ======================================================

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


// ======================================================
// ATUALIZAÇÃO GERAL
// ======================================================

function atualizarSistema() {

    atualizarIndicadores();

    atualizarGrafico();

    atualizarDistribuicao();

    atualizarTabelaDashboard();

    atualizarFiltrosFrota();

    atualizarTabelaFrota();

}


// ======================================================
// DASHBOARD
// ======================================================

function atualizarIndicadores() {

    const total =
        frota.length;


    const rodando =
        frota.filter(
            v =>
                normalizar(v.status)
                === "rodando"
        ).length;


    const parado =
        frota.filter(
            v =>
                normalizar(v.status)
                === "parado"
        ).length;


    const reserva =
        frota.filter(
            v =>
                normalizar(v.status)
                === "reserva"
        ).length;


    document.getElementById(
        "frotaTotal"
    ).textContent =
        total;


    document.getElementById(
        "frotaOperando"
    ).textContent =
        rodando;


    document.getElementById(
        "frotaParada"
    ).textContent =
        parado;


    document.getElementById(
        "frotaReserva"
    ).textContent =
        reserva;


    document.getElementById(
        "legendOperando"
    ).textContent =
        rodando;


    document.getElementById(
        "legendParados"
    ).textContent =
        parado;


    document.getElementById(
        "legendReserva"
    ).textContent =
        reserva;


    const percentual =
        total > 0
            ? Math.round(
                (rodando / total) * 100
            )
            : 0;


    document.getElementById(
        "percentualOperacao"
    ).textContent =
        percentual + "%";

}


// ======================================================
// GRÁFICO
// ======================================================

function atualizarGrafico() {

    const total =
        frota.length;


    if (total === 0) {

        document.getElementById(
            "donut"
        ).style.background =
            "conic-gradient(#273241 0deg 360deg)";

        return;

    }


    const rodando =
        frota.filter(
            v =>
                normalizar(v.status)
                === "rodando"
        ).length;


    const parado =
        frota.filter(
            v =>
                normalizar(v.status)
                === "parado"
        ).length;


    const grausRodando =
        (rodando / total) * 360;


    const grausParado =
        (parado / total) * 360;


    const inicioReserva =
        grausRodando +
        grausParado;


    document.getElementById(
        "donut"
    ).style.background =

        `conic-gradient(
            #22c55e 0deg ${grausRodando}deg,
            #ef4444 ${grausRodando}deg ${inicioReserva}deg,
            #f59e0b ${inicioReserva}deg 360deg
        )`;

}


// ======================================================
// DISTRIBUIÇÃO
// ======================================================

function atualizarDistribuicao() {

    const total =
        frota.length;


    const raizen =
        frota.filter(
            v => {

                const op =
                    normalizar(
                        v.operacao
                    );


                return (
                    op === "raízen" ||
                    op === "raizen"
                );

            }
        ).length;


    const nexta =
        frota.filter(
            v =>
                normalizar(
                    v.operacao
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


// ======================================================
// STATUS FROTA
// ======================================================

function obterClasseStatus(status) {

    const normalizado =
        normalizar(status);


    if (normalizado === "rodando") {

        return "status-badge status-rodando";

    }


    if (normalizado === "parado") {

        return "status-badge status-parado";

    }


    if (normalizado === "reserva") {

        return "status-badge status-reserva";

    }


    return "status-badge";

}


// ======================================================
// TABELA DASHBOARD
// ======================================================

function atualizarTabelaDashboard() {

    const tabela =
        document.getElementById(
            "tabelaDashboard"
        );


    tabela.innerHTML = "";


    frota.forEach(
        veiculo => {

            const linha =
                document.createElement(
                    "tr"
                );


            linha.innerHTML = `

                <td>
                    ${valorSeguro(
                        veiculo.cv
                    )}
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

                    <span class="${obterClasseStatus(
                        veiculo.status
                    )}">

                        ${valorSeguro(
                            veiculo.status
                        )}

                    </span>

                </td>

            `;


            tabela.appendChild(
                linha
            );

        }
    );

}


// ======================================================
// FILTRO FROTA
// ======================================================

function obterFrotaFiltrada() {

    const busca =
        normalizar(
            document.getElementById(
                "buscaFrota"
            ).value
        );


    const area =
        document.getElementById(
            "filtroArea"
        ).value;


    const operacao =
        document.getElementById(
            "filtroOperacao"
        ).value;


    const status =
        document.getElementById(
            "filtroStatus"
        ).value;


    return frota.filter(
        veiculo => {

            const textoBusca = [

                veiculo.cv,

                veiculo.sm1,

                veiculo.sm2

            ]
                .map(normalizar)
                .join(" ");


            return (

                (
                    !busca ||
                    textoBusca.includes(
                        busca
                    )
                )

                &&

                (
                    !area ||
                    veiculo.area === area
                )

                &&

                (
                    !operacao ||
                    veiculo.operacao ===
                    operacao
                )

                &&

                (
                    !status ||
                    veiculo.status ===
                    status
                )

            );

        }
    );

}


// ======================================================
// FILTROS FROTA
// ======================================================

function atualizarFiltrosFrota() {

    const filtroArea =
        document.getElementById(
            "filtroArea"
        );


    const filtroOperacao =
        document.getElementById(
            "filtroOperacao"
        );


    const areaAtual =
        filtroArea.value;


    const operacaoAtual =
        filtroOperacao.value;


    const areas = [
        ...new Set(
            frota
                .map(
                    v => v.area
                )
                .filter(Boolean)
        )
    ];


    const operacoes = [
        ...new Set(
            frota
                .map(
                    v => v.operacao
                )
                .filter(Boolean)
        )
    ];


    filtroArea.innerHTML =
        `<option value="">
            Todas
        </option>`;


    areas.forEach(
        area => {

            filtroArea.innerHTML += `

                <option value="${area}">
                    ${area}
                </option>

            `;

        }
    );


    filtroOperacao.innerHTML =
        `<option value="">
            Todas
        </option>`;


    operacoes.forEach(
        operacao => {

            filtroOperacao.innerHTML += `

                <option value="${operacao}">
                    ${operacao}
                </option>

            `;

        }
    );


    if (
        areas.includes(
            areaAtual
        )
    ) {

        filtroArea.value =
            areaAtual;

    }


    if (
        operacoes.includes(
            operacaoAtual
        )
    ) {

        filtroOperacao.value =
            operacaoAtual;

    }

}


// ======================================================
// TABELA FROTA
// ======================================================

function atualizarTabelaFrota() {

    const tabela =
        document.getElementById(
            "tabelaFrota"
        );


    const dados =
        obterFrotaFiltrada();


    tabela.innerHTML = "";


    dados.forEach(
        veiculo => {

            const linha =
                document.createElement(
                    "tr"
                );


            linha.innerHTML = `

                <td>
                    ${valorSeguro(
                        veiculo.cv
                    )}
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

                    <span class="${obterClasseStatus(
                        veiculo.status
                    )}">

                        ${valorSeguro(
                            veiculo.status
                        )}

                    </span>

                </td>

                <td>

                    <div class="table-actions">

                        <button
                            class="action-button edit"
                            onclick="abrirEdicao('${veiculo.id}')"
                        >
                            ✏️ Editar
                        </button>

                    </div>

                </td>

            `;


            tabela.appendChild(
                linha
            );

        }
    );


    document.getElementById(
        "contadorFrota"
    ).textContent =

        `${dados.length} veículo${
            dados.length !== 1
                ? "s"
                : ""
        }`;

}


// ======================================================
// NOVO VEÍCULO
// ======================================================

function abrirNovoVeiculo() {

    document.getElementById(
        "tituloModal"
    ).textContent =
        "Novo veículo";


    document.getElementById(
        "subtituloModal"
    ).textContent =
        "Cadastre um novo veículo na frota.";


    document.getElementById(
        "formVeiculo"
    ).reset();


    document.getElementById(
        "veiculoId"
    ).value = "";


    resetarOperacao();

    resetarSuboperacao();


    document.getElementById(
        "modalVeiculo"
    ).classList.add(
        "show"
    );

}


// ======================================================
// EDITAR VEÍCULO
// ======================================================

function abrirEdicao(id) {

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
        "tituloModal"
    ).textContent =
        "Editar veículo";


    document.getElementById(
        "subtituloModal"
    ).textContent =
        "Altere os dados do veículo.";


    document.getElementById(
        "veiculoId"
    ).value =
        veiculo.id;


    document.getElementById(
        "cv"
    ).value =
        valorSeguro(
            veiculo.cv
        );


    document.getElementById(
        "sm1"
    ).value =
        valorSeguro(
            veiculo.sm1
        );


    document.getElementById(
        "sm2"
    ).value =
        valorSeguro(
            veiculo.sm2
        );


    document.getElementById(
        "area"
    ).value =
        valorSeguro(
            veiculo.area
        );


    carregarOperacoes(
        veiculo.area,
        veiculo.operacao
    );


    carregarSuboperacoes(
        veiculo.area,
        veiculo.operacao,
        veiculo.suboperacao
    );


    document.getElementById(
        "status"
    ).value =
        valorSeguro(
            veiculo.status
        );


    document.getElementById(
        "modalVeiculo"
    ).classList.add(
        "show"
    );

}


// ======================================================
// MODAL VEÍCULO
// ======================================================

function fecharModal() {

    document.getElementById(
        "modalVeiculo"
    ).classList.remove(
        "show"
    );

}


// ======================================================
// OPERAÇÕES
// ======================================================

function carregarOperacoes(
    area,
    operacaoSelecionada = ""
) {

    const campo =
        document.getElementById(
            "operacao"
        );


    campo.innerHTML =
        `<option value="">
            Selecione
        </option>`;


    campo.disabled =
        true;


    if (
        !area ||
        !HIERARQUIA[area]
    ) {

        return;

    }


    const operacoes =
        Object.keys(
            HIERARQUIA[area]
        );


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


            campo.appendChild(
                option
            );

        }
    );


    campo.disabled =
        false;


    if (
        operacaoSelecionada
    ) {

        campo.value =
            operacaoSelecionada;

    }

}


// ======================================================
// SUBOPERAÇÕES
// ======================================================

function carregarSuboperacoes(
    area,
    operacao,
    suboperacaoSelecionada = ""
) {

    const campo =
        document.getElementById(
            "suboperacao"
        );


    campo.innerHTML =
        `<option value="">
            Selecione
        </option>`;


    campo.disabled =
        true;


    if (

        !area ||
        !operacao ||
        !HIERARQUIA[area] ||
        !HIERARQUIA[area][operacao]

    ) {

        return;

    }


    const suboperacoes =
        HIERARQUIA[
            area
        ][
            operacao
        ];


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


            campo.appendChild(
                option
            );

        }
    );


    campo.disabled =
        false;


    if (
        suboperacaoSelecionada
    ) {

        campo.value =
            suboperacaoSelecionada;

    }

}


// ======================================================
// RESETAR OPERAÇÃO
// ======================================================

function resetarOperacao() {

    const campo =
        document.getElementById(
            "operacao"
        );


    campo.innerHTML =
        `<option value="">
            Selecione a área primeiro
        </option>`;


    campo.value =
        "";


    campo.disabled =
        true;

}


// ======================================================
// RESETAR SUBOPERAÇÃO
// ======================================================

function resetarSuboperacao() {

    const campo =
        document.getElementById(
            "suboperacao"
        );


    campo.innerHTML =
        `<option value="">
            Selecione a operação primeiro
        </option>`;


    campo.value =
        "";


    campo.disabled =
        true;

}


// ======================================================
// ÁREA DA FROTA
// ======================================================

document.getElementById(
    "area"
).addEventListener(
    "change",
    function () {

        const area =
            this.value;


        resetarSuboperacao();


        carregarOperacoes(
            area
        );


        if (
            area === "JET"
        ) {

            carregarOperacoes(
                "JET",
                "JET"
            );


            carregarSuboperacoes(
                "JET",
                "JET",
                "JET"
            );

        }

    }
);


// ======================================================
// OPERAÇÃO DA FROTA
// ======================================================

document.getElementById(
    "operacao"
).addEventListener(
    "change",
    function () {

        const area =
            document.getElementById(
                "area"
            ).value;


        const operacao =
            this.value;


        carregarSuboperacoes(
            area,
            operacao
        );


        if (

            area === "JET" &&
            operacao === "JET"

        ) {

            document.getElementById(
                "suboperacao"
            ).value =
                "JET";

        }

    }
);


// ======================================================
// FORMULÁRIO FROTA
// ======================================================

document.getElementById(
    "formVeiculo"
).addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const id =
            document.getElementById(
                "veiculoId"
            ).value;


        const cv =
            document.getElementById(
                "cv"
            ).value.trim();


        const sm1 =
            document.getElementById(
                "sm1"
            ).value.trim();


        const sm2 =
            document.getElementById(
                "sm2"
            ).value.trim();


        const area =
            document.getElementById(
                "area"
            ).value;


        const operacao =
            document.getElementById(
                "operacao"
            ).value;


        const suboperacao =
            document.getElementById(
                "suboperacao"
            ).value;


        const status =
            document.getElementById(
                "status"
            ).value;


        if (!cv) {

            alert(
                "Informe o CV do veículo."
            );

            return;

        }


        if (!area) {

            alert(
                "Selecione a área."
            );

            return;

        }


        if (!operacao) {

            alert(
                "Selecione a operação."
            );

            return;

        }


        if (!suboperacao) {

            alert(
                "Selecione a suboperação."
            );

            return;

        }


        const cvNormalizado =
            normalizar(cv);


        const duplicado =
            frota.some(
                veiculo => {

                    if (
                        id &&
                        String(
                            veiculo.id
                        ) === String(id)
                    ) {

                        return false;

                    }


                    return (
                        normalizar(
                            veiculo.cv
                        ) ===
                        cvNormalizado
                    );

                }
            );


        if (duplicado) {

            alert(
                "Já existe um veículo cadastrado com este CV."
            );

            return;

        }


        const dados = {

            cv,

            sm1,

            sm2,

            area,

            operacao,

            suboperacao,

            status

        };


        if (!id) {

            const novoVeiculo = {

                id:
                    gerarId(),

                ...dados

            };


            frotaAdicional.push(
                novoVeiculo
            );


            salvarAdicionais();

        }
        else {

            const indexAdicional =
                frotaAdicional.findIndex(
                    veiculo =>
                        String(
                            veiculo.id
                        ) === String(id)
                );


            if (
                indexAdicional !== -1
            ) {

                frotaAdicional[
                    indexAdicional
                ] = {

                    ...frotaAdicional[
                        indexAdicional
                    ],

                    ...dados

                };


                salvarAdicionais();

            }
            else {

                frotaAlteracoes[id] = {

                    ...(
                        frotaAlteracoes[id]
                        || {}
                    ),

                    ...dados

                };


                salvarAlteracoes();

            }

        }


        montarFrota();

        fecharModal();

    }
);


// ======================================================
// BOTÕES FROTA
// ======================================================

document.getElementById(
    "btnNovoVeiculo"
).addEventListener(
    "click",
    abrirNovoVeiculo
);


document.getElementById(
    "btnDashboardNovo"
).addEventListener(
    "click",
    abrirNovoVeiculo
);


document.getElementById(
    "btnCancelar"
).addEventListener(
    "click",
    fecharModal
);


document.getElementById(
    "btnFecharModal"
).addEventListener(
    "click",
    fecharModal
);


document.getElementById(
    "modalVeiculo"
).addEventListener(
    "click",
    function (event) {

        if (
            event.target === this
        ) {

            fecharModal();

        }

    }
);


// ======================================================
// FILTROS FROTA
// ======================================================

document.getElementById(
    "buscaFrota"
).addEventListener(
    "input",
    atualizarTabelaFrota
);


document.getElementById(
    "filtroArea"
).addEventListener(
    "change",
    atualizarTabelaFrota
);


document.getElementById(
    "filtroOperacao"
).addEventListener(
    "change",
    atualizarTabelaFrota
);


document.getElementById(
    "filtroStatus"
).addEventListener(
    "change",
    atualizarTabelaFrota
);


// ======================================================
// MOTORISTAS
// ======================================================

function carregarMotoristas() {

    try {

        motoristas =
            JSON.parse(
                localStorage.getItem(
                    CHAVE_MOTORISTAS
                )
            ) || [];

    }
    catch {

        motoristas = [];

    }


    atualizarMotoristas();

}


// ======================================================
// SALVAR MOTORISTAS
// ======================================================

function salvarMotoristas() {

    localStorage.setItem(

        CHAVE_MOTORISTAS,

        JSON.stringify(
            motoristas
        )

    );

}


// ======================================================
// ATUALIZAÇÃO MOTORISTAS
// ======================================================

function atualizarMotoristas() {

    atualizarIndicadoresMotoristas();

    atualizarFiltrosMotoristas();

    atualizarTabelaMotoristas();

}


// ======================================================
// INDICADORES MOTORISTAS
// ======================================================

function atualizarIndicadoresMotoristas() {

    const total =
        motoristas.length;


    const ativos =
        motoristas.filter(
            motorista =>
                motorista.status ===
                "Ativo"
        ).length;


    const fixos =
        motoristas.filter(
            motorista =>
                motorista.tipo ===
                "Fixo"
        ).length;


    const reservas =
        motoristas.filter(
            motorista =>
                motorista.tipo ===
                "Reserva"
        ).length;


    document.getElementById(
        "motoristasTotal"
    ).textContent =
        total;


    document.getElementById(
        "motoristasAtivos"
    ).textContent =
        ativos;


    document.getElementById(
        "motoristasFixos"
    ).textContent =
        fixos;


    document.getElementById(
        "motoristasReservas"
    ).textContent =
        reservas;

}


// ======================================================
// FILTROS MOTORISTAS
// ======================================================

function atualizarFiltrosMotoristas() {

    const filtroArea =
        document.getElementById(
            "filtroMotoristaArea"
        );


    const filtroOperacao =
        document.getElementById(
            "filtroMotoristaOperacao"
        );


    const areaAtual =
        filtroArea.value;


    const operacaoAtual =
        filtroOperacao.value;


    const areas = [
        ...new Set(
            motoristas
                .map(
                    motorista =>
                        motorista.area
                )
                .filter(Boolean)
        )
    ];


    const operacoes = [
        ...new Set(
            motoristas
                .map(
                    motorista =>
                        motorista.operacao
                )
                .filter(Boolean)
        )
    ];


    filtroArea.innerHTML =
        `
            <option value="">
                Todas
            </option>
        `;


    areas.forEach(
        area => {

            filtroArea.innerHTML += `

                <option value="${area}">
                    ${area}
                </option>

            `;

        }
    );


    filtroOperacao.innerHTML =
        `
            <option value="">
                Todas
            </option>
        `;


    operacoes.forEach(
        operacao => {

            filtroOperacao.innerHTML += `

                <option value="${operacao}">
                    ${operacao}
                </option>

            `;

        }
    );


    if (
        areas.includes(
            areaAtual
        )
    ) {

        filtroArea.value =
            areaAtual;

    }


    if (
        operacoes.includes(
            operacaoAtual
        )
    ) {

        filtroOperacao.value =
            operacaoAtual;

    }

}


// ======================================================
// FILTRAR MOTORISTAS
// ======================================================

function obterMotoristasFiltrados() {

    const busca =
        normalizar(
            document.getElementById(
                "buscaMotorista"
            ).value
        );


    const area =
        document.getElementById(
            "filtroMotoristaArea"
        ).value;


    const operacao =
        document.getElementById(
            "filtroMotoristaOperacao"
        ).value;


    const tipo =
        document.getElementById(
            "filtroMotoristaTipo"
        ).value;


    const status =
        document.getElementById(
            "filtroMotoristaStatus"
        ).value;


    const turno =
        document.getElementById(
            "filtroMotoristaTurno"
        ).value;


    return motoristas.filter(
        motorista => {

            const textoBusca = [

                motorista.nome,

                motorista.matricula,

                motorista.cpf

            ]
                .map(normalizar)
                .join(" ");


            return (

                (
                    !busca ||
                    textoBusca.includes(
                        busca
                    )
                )

                &&

                (
                    !area ||
                    motorista.area === area
                )

                &&

                (
                    !operacao ||
                    motorista.operacao ===
                    operacao
                )

                &&

                (
                    !tipo ||
                    motorista.tipo === tipo
                )

                &&

                (
                    !status ||
                    motorista.status === status
                )

                &&

                (
                    !turno ||
                    motorista.turno === turno
                )

            );

        }
    );

}


// ======================================================
// STATUS MOTORISTA
// ======================================================

function obterClasseMotoristaStatus(
    status
) {

    if (
        status === "Ativo"
    ) {

        return (
            "motorista-status " +
            "motorista-ativo"
        );

    }


    if (
        status === "Inativo"
    ) {

        return (
            "motorista-status " +
            "motorista-inativo"
        );

    }


    if (
        status === "Afastado"
    ) {

        return (
            "motorista-status " +
            "motorista-afastado"
        );

    }


    return "motorista-status";

}


// ======================================================
// TABELA MOTORISTAS
// ======================================================

function atualizarTabelaMotoristas() {

    const tabela =
        document.getElementById(
            "tabelaMotoristas"
        );


    const dados =
        obterMotoristasFiltrados();


    tabela.innerHTML = "";


    dados.forEach(
        motorista => {

            const linha =
                document.createElement(
                    "tr"
                );


            linha.innerHTML = `

                <td>
                    <strong>
                        ${valorSeguro(
                            motorista.nome
                        )}
                    </strong>
                </td>

                <td>
                    ${valorSeguro(
                        motorista.matricula
                    )}
                </td>

                <td>
                    ${valorSeguro(
                        motorista.telefone
                    )}
                </td>

                <td>
                    ${valorSeguro(
                        motorista.area
                    )}
                </td>

                <td>
                    ${valorSeguro(
                        motorista.operacao
                    )}
                </td>

                <td>
                    ${valorSeguro(
                        motorista.suboperacao
                    )}
                </td>

                <td>
                    ${valorSeguro(
                        motorista.tipo
                    )}
                </td>

                <td>
                    ${valorSeguro(
                        motorista.turno
                    )}
                </td>

                <td>

                    <span class="${obterClasseMotoristaStatus(
                        motorista.status
                    )}">

                        ${valorSeguro(
                            motorista.status
                        )}

                    </span>

                </td>

                <td>

                    <div class="table-actions">

                        <button
                            class="action-button edit"
                            onclick="abrirEdicaoMotorista('${motorista.id}')"
                        >
                            ✏️ Editar
                        </button>

                    </div>

                </td>

            `;


            tabela.appendChild(
                linha
            );

        }
    );


    document.getElementById(
        "contadorMotoristas"
    ).textContent =

        `${dados.length} motorista${
            dados.length !== 1
                ? "s"
                : ""
        }`;

}


// ======================================================
// NOVO MOTORISTA
// ======================================================

function abrirNovoMotorista() {

    document.getElementById(
        "tituloModalMotorista"
    ).textContent =
        "Novo motorista";


    document.getElementById(
        "subtituloModalMotorista"
    ).textContent =
        "Cadastre um novo motorista.";


    document.getElementById(
        "formMotorista"
    ).reset();


    document.getElementById(
        "motoristaId"
    ).value = "";


    resetarOperacaoMotorista();

    resetarSuboperacaoMotorista();


    document.getElementById(
        "modalMotorista"
    ).classList.add(
        "show"
    );

}


// ======================================================
// EDITAR MOTORISTA
// ======================================================

function abrirEdicaoMotorista(
    id
) {

    const motorista =
        motoristas.find(
            m =>
                String(m.id) ===
                String(id)
        );


    if (!motorista) {

        return;

    }


    document.getElementById(
        "tituloModalMotorista"
    ).textContent =
        "Editar motorista";


    document.getElementById(
        "subtituloModalMotorista"
    ).textContent =
        "Altere os dados do motorista.";


    document.getElementById(
        "motoristaId"
    ).value =
        motorista.id;


    document.getElementById(
        "motoristaNome"
    ).value =
        valorSeguro(
            motorista.nome
        );


    document.getElementById(
        "motoristaCpf"
    ).value =
        valorSeguro(
            motorista.cpf
        );


    document.getElementById(
        "motoristaMatricula"
    ).value =
        valorSeguro(
            motorista.matricula
        );


    document.getElementById(
        "motoristaTelefone"
    ).value =
        valorSeguro(
            motorista.telefone
        );


    document.getElementById(
        "motoristaArea"
    ).value =
        valorSeguro(
            motorista.area
        );


    carregarOperacoesMotorista(
        motorista.area,
        motorista.operacao
    );


    carregarSuboperacoesMotorista(
        motorista.area,
        motorista.operacao,
        motorista.suboperacao
    );


    document.getElementById(
        "motoristaTipo"
    ).value =
        valorSeguro(
            motorista.tipo
        );


    document.getElementById(
        "motoristaTurno"
    ).value =
        valorSeguro(
            motorista.turno
        );


    document.getElementById(
        "motoristaStatus"
    ).value =
        valorSeguro(
            motorista.status
        );


    document.getElementById(
        "motoristaObservacao"
    ).value =
        valorSeguro(
            motorista.observacao
        );


    document.getElementById(
        "modalMotorista"
    ).classList.add(
        "show"
    );

}


// ======================================================
// FECHAR MOTORISTA
// ======================================================

function fecharModalMotorista() {

    document.getElementById(
        "modalMotorista"
    ).classList.remove(
        "show"
    );

}


// ======================================================
// OPERAÇÃO MOTORISTA
// ======================================================

function carregarOperacoesMotorista(
    area,
    operacaoSelecionada = ""
) {

    const campo =
        document.getElementById(
            "motoristaOperacao"
        );


    campo.innerHTML =
        `
            <option value="">
                Selecione
            </option>
        `;


    campo.disabled =
        true;


    if (
        !area ||
        !HIERARQUIA[area]
    ) {

        return;

    }


    const operacoes =
        Object.keys(
            HIERARQUIA[area]
        );


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


            campo.appendChild(
                option
            );

        }
    );


    campo.disabled =
        false;


    if (
        operacaoSelecionada
    ) {

        campo.value =
            operacaoSelecionada;

    }

}


// ======================================================
// SUBOPERAÇÃO MOTORISTA
// ======================================================

function carregarSuboperacoesMotorista(
    area,
    operacao,
    suboperacaoSelecionada = ""
) {

    const campo =
        document.getElementById(
            "motoristaSuboperacao"
        );


    campo.innerHTML =
        `
            <option value="">
                Selecione
            </option>
        `;


    campo.disabled =
        true;


    if (

        !area ||
        !operacao ||
        !HIERARQUIA[area] ||
        !HIERARQUIA[area][operacao]

    ) {

        return;

    }


    const suboperacoes =
        HIERARQUIA[
            area
        ][
            operacao
        ];


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


            campo.appendChild(
                option
            );

        }
    );


    campo.disabled =
        false;


    if (
        suboperacaoSelecionada
    ) {

        campo.value =
            suboperacaoSelecionada;

    }

}


// ======================================================
// RESETAR MOTORISTA
// ======================================================

function resetarOperacaoMotorista() {

    const campo =
        document.getElementById(
            "motoristaOperacao"
        );


    campo.innerHTML =
        `
            <option value="">
                Selecione a área primeiro
            </option>
        `;


    campo.value =
        "";


    campo.disabled =
        true;

}


function resetarSuboperacaoMotorista() {

    const campo =
        document.getElementById(
            "motoristaSuboperacao"
        );


    campo.innerHTML =
        `
            <option value="">
                Selecione a operação primeiro
            </option>
        `;


    campo.value =
        "";


    campo.disabled =
        true;

}


// ======================================================
// ÁREA MOTORISTA
// ======================================================

document.getElementById(
    "motoristaArea"
).addEventListener(
    "change",
    function () {

        const area =
            this.value;


        resetarSuboperacaoMotorista();


        carregarOperacoesMotorista(
            area
        );


        if (
            area === "JET"
        ) {

            carregarOperacoesMotorista(
                "JET",
                "JET"
            );


            carregarSuboperacoesMotorista(
                "JET",
                "JET",
                "JET"
            );

        }

    }
);


// ======================================================
// OPERAÇÃO MOTORISTA
// ======================================================

document.getElementById(
    "motoristaOperacao"
).addEventListener(
    "change",
    function () {

        const area =
            document.getElementById(
                "motoristaArea"
            ).value;


        const operacao =
            this.value;


        carregarSuboperacoesMotorista(
            area,
            operacao
        );


        if (

            area === "JET" &&
            operacao === "JET"

        ) {

            document.getElementById(
                "motoristaSuboperacao"
            ).value =
                "JET";

        }

    }
);


// ======================================================
// FORMULÁRIO MOTORISTA
// ======================================================

document.getElementById(
    "formMotorista"
).addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const id =
            document.getElementById(
                "motoristaId"
            ).value;


        const nome =
            document.getElementById(
                "motoristaNome"
            ).value.trim();


        const cpf =
            document.getElementById(
                "motoristaCpf"
            ).value.trim();


        const matricula =
            document.getElementById(
                "motoristaMatricula"
            ).value.trim();


        const telefone =
            document.getElementById(
                "motoristaTelefone"
            ).value.trim();


        const area =
            document.getElementById(
                "motoristaArea"
            ).value;


        const operacao =
            document.getElementById(
                "motoristaOperacao"
            ).value;


        const suboperacao =
            document.getElementById(
                "motoristaSuboperacao"
            ).value;


        const tipo =
            document.getElementById(
                "motoristaTipo"
            ).value;


        const turno =
            document.getElementById(
                "motoristaTurno"
            ).value;


        const status =
            document.getElementById(
                "motoristaStatus"
            ).value;


        const observacao =
            document.getElementById(
                "motoristaObservacao"
            ).value.trim();


        if (!nome) {

            alert(
                "Informe o nome do motorista."
            );

            return;

        }


        if (!matricula) {

            alert(
                "Informe a matrícula."
            );

            return;

        }


        if (!area) {

            alert(
                "Selecione a área."
            );

            return;

        }


        if (!operacao) {

            alert(
                "Selecione a operação."
            );

            return;

        }


        if (!suboperacao) {

            alert(
                "Selecione a suboperação."
            );

            return;

        }


        if (!turno) {

            alert(
                "Selecione o turno/crontipo."
            );

            return;

        }


        // ----------------------------------------------
        // MATRÍCULA DUPLICADA
        // ----------------------------------------------

        const matriculaNormalizada =
            normalizar(
                matricula
            );


        const duplicado =
            motoristas.some(
                motorista => {

                    if (

                        id &&
                        String(
                            motorista.id
                        ) === String(id)

                    ) {

                        return false;

                    }


                    return (

                        normalizar(
                            motorista.matricula
                        ) ===
                        matriculaNormalizada

                    );

                }
            );


        if (duplicado) {

            alert(
                "Já existe um motorista cadastrado com esta matrícula."
            );

            return;

        }


        const dados = {

            nome,

            cpf,

            matricula,

            telefone,

            area,

            operacao,

            suboperacao,

            tipo,

            turno,

            status,

            observacao

        };


        // ----------------------------------------------
        // NOVO
        // ----------------------------------------------

        if (!id) {

            motoristas.push({

                id:
                    gerarId(),

                ...dados

            });

        }
        else {

            const index =
                motoristas.findIndex(
                    motorista =>
                        String(
                            motorista.id
                        ) === String(id)
                );


            if (
                index !== -1
            ) {

                motoristas[index] = {

                    ...motoristas[index],

                    ...dados

                };

            }

        }


        salvarMotoristas();

        atualizarMotoristas();

        fecharModalMotorista();

    }
);


// ======================================================
// BOTÕES MOTORISTA
// ======================================================

document.getElementById(
    "btnNovoMotorista"
).addEventListener(
    "click",
    abrirNovoMotorista
);


document.getElementById(
    "btnCancelarMotorista"
).addEventListener(
    "click",
    fecharModalMotorista
);


document.getElementById(
    "btnFecharModalMotorista"
).addEventListener(
    "click",
    fecharModalMotorista
);


document.getElementById(
    "modalMotorista"
).addEventListener(
    "click",
    function (event) {

        if (
            event.target === this
        ) {

            fecharModalMotorista();

        }

    }
);


// ======================================================
// FILTROS MOTORISTAS
// ======================================================

document.getElementById(
    "buscaMotorista"
).addEventListener(
    "input",
    atualizarTabelaMotoristas
);


document.getElementById(
    "filtroMotoristaArea"
).addEventListener(
    "change",
    atualizarTabelaMotoristas
);


document.getElementById(
    "filtroMotoristaOperacao"
).addEventListener(
    "change",
    atualizarTabelaMotoristas
);


document.getElementById(
    "filtroMotoristaTipo"
).addEventListener(
    "change",
    atualizarTabelaMotoristas
);


document.getElementById(
    "filtroMotoristaStatus"
).addEventListener(
    "change",
    atualizarTabelaMotoristas
);


document.getElementById(
    "filtroMotoristaTurno"
).addEventListener(
    "change",
    atualizarTabelaMotoristas
);


// ======================================================
// NAVEGAÇÃO
// ======================================================

const paginas = {

    dashboard: {

        elemento:
            "paginaDashboard",

        titulo:
            "Dashboard",

        subtitulo:
            "Visão geral da operação da frota"

    },


    frota: {

        elemento:
            "paginaFrota",

        titulo:
            "Frota",

        subtitulo:
            "Cadastro e controle dos veículos"

    },


    motoristas: {

        elemento:
            "paginaMotoristas",

        titulo:
            "Motoristas",

        subtitulo:
            "Cadastro e controle dos motoristas"

    },


    escala: {

        elemento:
            "paginaEscala",

        titulo:
            "Escala",

        subtitulo:
            "Gestão das escalas dos motoristas"

    },


    manutencao: {

        elemento:
            "paginaManutencao",

        titulo:
            "Manutenção",

        subtitulo:
            "Controle de manutenção da frota"

    },


    ocorrencias: {

        elemento:
            "paginaOcorrencias",

        titulo:
            "Ocorrências",

        subtitulo:
            "Registro e acompanhamento de ocorrências"

    },


    configuracoes: {

        elemento:
            "paginaConfiguracoes",

        titulo:
            "Configurações",

        subtitulo:
            "Configurações do sistema"

    }

};


function abrirPagina(
    nome
) {

    Object.values(
        paginas
    ).forEach(
        pagina => {

            document
                .getElementById(
                    pagina.elemento
                )
                .classList.add(
                    "hidden"
                );

        }
    );


    const pagina =
        paginas[nome];


    if (!pagina) {

        return;

    }


    document
        .getElementById(
            pagina.elemento
        )
        .classList.remove(
            "hidden"
        );


    document.getElementById(
        "tituloPagina"
    ).textContent =
        pagina.titulo;


    document.getElementById(
        "subtituloPagina"
    ).textContent =
        pagina.subtitulo;


    document
        .querySelectorAll(
            ".menu-item"
        )
        .forEach(
            item => {

                item.classList.toggle(

                    "active",

                    item.dataset.page ===
                    nome

                );

            }
        );

}


document
    .querySelectorAll(
        ".menu-item"
    )
    .forEach(
        item => {

            item.addEventListener(
                "click",
                () => {

                    abrirPagina(
                        item.dataset.page
                    );

                }
            );

        }
    );


// ======================================================
// INICIALIZAÇÃO
// ======================================================

abrirPagina(
    "dashboard"
);


carregarFrota();


carregarMotoristas();
