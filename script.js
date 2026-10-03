/* =========================================================
   GESTÃO DE FROTA
   VERSÃO 13
   ========================================================= */

const CHAVE_FROTA_ADICIONAL = "frota_adicional";
const CHAVE_FROTA_ALTERACOES = "frota_alteracoes";
const CHAVE_MOTORISTAS = "motoristas_cadastrados";
const CHAVE_MANUTENCOES = "manutencoes_cadastradas";
const CHAVE_DOCUMENTOS = "documentacao_cadastrada";


let frota = [];
let motoristas = [];
let manutencoes = [];
let documentos = [];


/* =========================================================
   HIERARQUIA
   ========================================================= */

const HIERARQUIA = {

    Coleta: {
        Nexta: ["Geral"],
        Raízen: ["Geral"]
    },

    Entrega: {
        Nexta: ["Geral"],
        Raízen: ["City", "Dedicado"]
    },

    JET: {
        JET: ["JET"]
    }

};


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

    await carregarFrota();

    carregarMotoristas();
    carregarManutencoes();
    carregarDocumentos();

    configurarNavegacao();
    configurarModais();
    configurarDashboard();
    configurarFormularios();
    configurarFiltrosMotoristas();
    configurarFiltrosManutencao();
    configurarFiltrosDocumentacao();

    atualizarTudo();

});


/* =========================================================
   STORAGE
   ========================================================= */

function lerStorage(chave, fallback = []) {

    try {

        const valor = localStorage.getItem(chave);

        if (!valor) {
            return fallback;
        }

        return JSON.parse(valor);

    } catch (erro) {

        console.error(
            `Erro ao ler ${chave}:`,
            erro
        );

        return fallback;

    }

}


function salvarStorage(chave, dados) {

    localStorage.setItem(
        chave,
        JSON.stringify(dados)
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
                `Erro HTTP ${resposta.status}`
            );
        }

        const base = await resposta.json();

        const alteracoes =
            lerStorage(
                CHAVE_FROTA_ALTERACOES,
                {}
            );

        const adicionais =
            lerStorage(
                CHAVE_FROTA_ADICIONAL,
                []
            );

        frota = base.map(veiculo => {

            const alteracao =
                alteracoes[veiculo.id];

            return alteracao
                ? {
                    ...veiculo,
                    ...alteracao
                }
                : veiculo;

        });

        frota = [
            ...frota,
            ...adicionais
        ];

        normalizarFrota();

    } catch (erro) {

        console.error(
            "Erro ao carregar frota:",
            erro
        );

        frota = [
            ...lerStorage(
                CHAVE_FROTA_ADICIONAL,
                []
            )
        ];

    }

}


function normalizarFrota() {

    frota = frota.map((veiculo, index) => {

        return {

            id:
                veiculo.id ??
                `local-${Date.now()}-${index}`,

            cv:
                veiculo.cv ?? "",

            sm1:
                veiculo.sm1 ?? "",

            sm2:
                veiculo.sm2 ?? "",

            modal:
                veiculo.modal ??
                descobrirModal(veiculo),

            capacidade:
                veiculo.capacidade ??
                veiculo.capacidadeLitros ??
                "",

            possuiBomba:
                veiculo.possuiBomba ??
                veiculo.bomba ??
                "Não",

            area:
                veiculo.area ?? "",

            operacao:
                veiculo.operacao ?? "",

            suboperacao:
                veiculo.suboperacao ?? "",

            status:
                veiculo.status ?? "Reserva",

            motoristaDia:
                veiculo.motoristaDia ?? "",

            motoristaNoite:
                veiculo.motoristaNoite ?? ""

        };

    });

}


function descobrirModal(veiculo) {

    const sm1 = String(
        veiculo.sm1 || ""
    ).trim();

    const sm2 = String(
        veiculo.sm2 || ""
    ).trim();

    if (!sm1 && !sm2) {
        return "Truck";
    }

    if (sm1 && sm2) {
        return "Bitrem";
    }

    return "Carreta";

}


/* =========================================================
   MOTORISTAS
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
   MANUTENÇÃO
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
   DOCUMENTAÇÃO
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
   NAVEGAÇÃO
   ========================================================= */

function configurarNavegacao() {

    document
        .querySelectorAll(".menu-item")
        .forEach(item => {

            item.addEventListener(
                "click",
                evento => {

                    evento.preventDefault();

                    const pagina =
                        item.dataset.page;

                    abrirPagina(pagina);

                }
            );

        });


    document
        .querySelectorAll("[data-page-target]")
        .forEach(botao => {

            botao.addEventListener(
                "click",
                () => {

                    abrirPagina(
                        botao.dataset.pageTarget
                    );

                }
            );

        });

}


function abrirPagina(pagina) {

    document
        .querySelectorAll(".page")
        .forEach(page => {

            page.classList.remove(
                "active-page"
            );

        });


    const destino =
        document.getElementById(
            `page-${pagina}`
        );

    if (destino) {

        destino.classList.add(
            "active-page"
        );

    }


    document
        .querySelectorAll(".menu-item")
        .forEach(item => {

            item.classList.toggle(
                "active",
                item.dataset.page === pagina
            );

        });


    if (pagina === "documentacao") {
        renderizarDocumentacao();
    }

    if (pagina === "frota") {
        renderizarFrotaPagina();
    }

    if (pagina === "motoristas") {
        renderizarMotoristas();
    }

    if (pagina === "manutencao") {
        renderizarManutencoes();
    }

}


/* =========================================================
   MODAIS
   ========================================================= */

function configurarModais() {

    document
        .querySelectorAll("[data-close-modal]")
        .forEach(botao => {

            botao.addEventListener(
                "click",
                () => {

                    fecharModal(
                        botao.dataset.closeModal
                    );

                }
            );

        });


    document
        .querySelectorAll(".modal-overlay")
        .forEach(modal => {

            modal.addEventListener(
                "click",
                evento => {

                    if (
                        evento.target === modal
                    ) {

                        modal.classList.remove(
                            "show"
                        );

                    }

                }
            );

        });


    document.addEventListener(
        "keydown",
        evento => {

            if (evento.key !== "Escape") {
                return;
            }

            document
                .querySelectorAll(
                    ".modal-overlay.show"
                )
                .forEach(modal => {

                    modal.classList.remove(
                        "show"
                    );

                });

        }
    );

}


function abrirModal(id) {

    const modal =
        document.getElementById(id);

    if (modal) {

        modal.classList.add("show");

    }

}


function fecharModal(id) {

    const modal =
        document.getElementById(id);

    if (modal) {

        modal.classList.remove("show");

    }

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

    if (area) {

        area.addEventListener(
            "change",
            () => {

                preencherFiltroDashboardOperacoes();

                atualizarDashboard();

            }
        );

    }


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
            atualizarDashboard
        );

    }


    const limpar =
        document.getElementById(
            "btnLimparFiltrosDashboard"
        );

    if (limpar) {

        limpar.addEventListener(
            "click",
            () => {

                area.value = "";
                operacao.value = "";
                suboperacao.value = "";

                preencherFiltroDashboardOperacoes();
                preencherFiltroDashboardSuboperacoes();

                atualizarDashboard();

            }
        );

    }

}


function preencherFiltroDashboardAreas() {

    const select =
        document.getElementById(
            "dashboardArea"
        );

    if (!select) return;

    const atual = select.value;

    const valores = [
        ...new Set(
            frota
                .map(v => v.area)
                .filter(Boolean)
        )
    ].sort();

    select.innerHTML =
        `<option value="">Todas</option>`;

    valores.forEach(valor => {

        select.innerHTML +=
            `<option value="${escapeHtml(valor)}">
                ${escapeHtml(valor)}
            </option>`;

    });

    if (valores.includes(atual)) {
        select.value = atual;
    }

}


function preencherFiltroDashboardOperacoes() {

    const area =
        document.getElementById(
            "dashboardArea"
        );

    const select =
        document.getElementById(
            "dashboardOperacao"
        );

    if (!area || !select) return;

    const valorAtual =
        select.value;

    const operacoes =
        frota
            .filter(v => {

                if (
                    !area.value
                ) {
                    return true;
                }

                return (
                    v.area ===
                    area.value
                );

            })
            .map(v => v.operacao)
            .filter(Boolean);

    const unicos =
        [...new Set(operacoes)].sort();

    select.innerHTML =
        `<option value="">Todas</option>`;

    unicos.forEach(valor => {

        select.innerHTML +=
            `<option value="${escapeHtml(valor)}">
                ${escapeHtml(valor)}
            </option>`;

    });

    if (
        unicos.includes(valorAtual)
    ) {
        select.value =
            valorAtual;
    }

}


function preencherFiltroDashboardSuboperacoes() {

    const area =
        document.getElementById(
            "dashboardArea"
        );

    const operacao =
        document.getElementById(
            "dashboardOperacao"
        );

    const select =
        document.getElementById(
            "dashboardSuboperacao"
        );

    if (!area || !operacao || !select) {
        return;
    }

    const valorAtual =
        select.value;

    const suboperacoes =
        frota
            .filter(v => {

                if (
                    area.value &&
                    v.area !== area.value
                ) {
                    return false;
                }

                if (
                    operacao.value &&
                    v.operacao !==
                    operacao.value
                ) {
                    return false;
                }

                return true;

            })
            .map(v => v.suboperacao)
            .filter(Boolean);

    const unicos =
        [...new Set(suboperacoes)].sort();

    select.innerHTML =
        `<option value="">Todas</option>`;

    unicos.forEach(valor => {

        select.innerHTML +=
            `<option value="${escapeHtml(valor)}">
                ${escapeHtml(valor)}
            </option>`;

    });

    if (
        unicos.includes(valorAtual)
    ) {
        select.value =
            valorAtual;
    }

}


function obterFrotaDashboard() {

    const area =
        document.getElementById(
            "dashboardArea"
        )?.value || "";

    const operacao =
        document.getElementById(
            "dashboardOperacao"
        )?.value || "";

    const suboperacao =
        document.getElementById(
            "dashboardSuboperacao"
        )?.value || "";


    return frota.filter(veiculo => {

        if (
            area &&
            veiculo.area !== area
        ) {
            return false;
        }

        if (
            operacao &&
            veiculo.operacao !==
            operacao
        ) {
            return false;
        }

        if (
            suboperacao &&
            veiculo.suboperacao !==
            suboperacao
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


    const frotaFiltrada =
        obterFrotaDashboard();


    const total =
        frotaFiltrada.length;

    const rodando =
        frotaFiltrada.filter(
            v => v.status === "Rodando"
        ).length;

    const parados =
        frotaFiltrada.filter(
            v => v.status === "Parado"
        ).length;

    const reservas =
        frotaFiltrada.filter(
            v => v.status === "Reserva"
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
        parados
    );

    setText(
        "frotaReserva",
        reservas
    );


    setText(
        "legendRodando",
        rodando
    );

    setText(
        "legendParados",
        parados
    );

    setText(
        "legendReserva",
        reservas
    );


    const percentual =
        total > 0
            ? Math.round(
                rodando / total * 100
            )
            : 0;


    setText(
        "percentualOperacao",
        `${percentual}%`
    );


    atualizarDonut(
        total,
        rodando,
        parados,
        reservas
    );


    renderizarDistribuicao(
        frotaFiltrada
    );

    renderizarFrotaDashboard(
        frotaFiltrada
    );

    atualizarResumoDocumentacao(
        frotaFiltrada
    );

    renderizarTop10Documentos(
        frotaFiltrada
    );

}


function atualizarDonut(
    total,
    rodando,
    parados,
    reservas
) {

    const donut =
        document.getElementById(
            "donutStatus"
        );

    if (!donut) return;

    if (total === 0) {

        donut.style.background =
            "conic-gradient(#26313d 0deg 360deg)";

        return;

    }


    const grausRodando =
        rodando / total * 360;

    const grausParados =
        parados / total * 360;

    const inicioParados =
        grausRodando;

    const inicioReserva =
        grausRodando +
        grausParados;


    donut.style.background =
        `conic-gradient(
            var(--green) 0deg ${grausRodando}deg,
            var(--red) ${inicioParados}deg ${inicioReserva}deg,
            var(--yellow) ${inicioReserva}deg 360deg
        )`;

}


function renderizarDistribuicao(lista) {

    const container =
        document.getElementById(
            "distribuicaoOperacoes"
        );

    if (!container) return;

    if (!lista.length) {

        container.innerHTML =
            `<div class="empty-inline">
                Nenhum veículo encontrado.
            </div>`;

        return;

    }


    const grupos = {};

    lista.forEach(veiculo => {

        const chave =
            veiculo.operacao ||
            "Sem operação";

        grupos[chave] =
            (grupos[chave] || 0) + 1;

    });


    const total =
        lista.length;


    container.innerHTML =
        Object.entries(grupos)
            .sort((a, b) => b[1] - a[1])
            .map(([operacao, quantidade]) => {

                const percentual =
                    quantidade /
                    total *
                    100;

                return `

                    <div class="distribution-row">

                        <div>
                            <strong>
                                ${escapeHtml(operacao)}
                            </strong>

                            <span>
                                ${percentual.toFixed(0)}%
                            </span>
                        </div>

                        <strong>
                            ${quantidade}
                        </strong>

                    </div>

                    <div class="bar">

                        <div
                            class="bar-fill"
                            style="width:${percentual}%">
                        </div>

                    </div>

                `;

            })
            .join("");

}


function renderizarFrotaDashboard(lista) {

    const tbody =
        document.getElementById(
            "tabelaFrota"
        );

    if (!tbody) return;

    tbody.innerHTML =
        lista.map(
            criarLinhaFrotaDashboard
        ).join("");

}


function criarLinhaFrotaDashboard(
    veiculo
) {

    return `

        <tr>

            <td>
                <strong>
                    ${escapeHtml(veiculo.cv)}
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
                    veiculo.modal || "-"
                )}
            </td>

            <td>
                ${formatarLitros(
                    veiculo.capacidade
                )}
            </td>

            <td>
                ${escapeHtml(
                    veiculo.possuiBomba || "Não"
                )}
            </td>

            <td>
                ${escapeHtml(
                    veiculo.area
                )}
            </td>

            <td>
                ${escapeHtml(
                    veiculo.operacao
                )}
            </td>

            <td>
                ${escapeHtml(
                    veiculo.suboperacao
                )}
            </td>

            <td>
                ${badgeStatusFrota(
                    veiculo.status
                )}
            </td>

        </tr>

    `;

}


/* =========================================================
   FROTA — PÁGINA
   ========================================================= */

function renderizarFrotaPagina() {

    const tbody =
        document.getElementById(
            "tabelaFrotaPagina"
        );

    if (!tbody) return;


    tbody.innerHTML =
        frota.map(veiculo => {

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
                            veiculo.modal || "-"
                        )}
                    </td>

                    <td>
                        ${formatarLitros(
                            veiculo.capacidade
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            veiculo.possuiBomba || "Não"
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            veiculo.area
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            veiculo.operacao
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            veiculo.suboperacao
                        )}
                    </td>

                    <td>
                        ${badgeStatusFrota(
                            veiculo.status
                        )}
                    </td>

                    <td>

                        <div class="actions">

                            <button
                                class="action-button"
                                onclick="editarVeiculo('${veiculo.id}')">
                                Editar
                            </button>

                            <button
                                class="action-button"
                                onclick="abrirDocumentacaoVeiculo('${veiculo.id}')">
                                Docs
                            </button>

                        </div>

                    </td>

                </tr>

            `;

        }).join("");

}


/* =========================================================
   FORMULÁRIO DE VEÍCULO
   ========================================================= */

function configurarFormularios() {

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


    configurarHierarquiaFormulario(
        "area",
        "operacao",
        "suboperacao"
    );


    configurarHierarquiaFormulario(
        "motoristaArea",
        "motoristaOperacao",
        "motoristaSuboperacao"
    );


    configurarSelecaoMotoristas();


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


    configurarRegrasDocumentacao();

}


function configurarHierarquiaFormulario(
    areaId,
    operacaoId,
    suboperacaoId
) {

    const area =
        document.getElementById(areaId);

    const operacao =
        document.getElementById(operacaoId);

    const suboperacao =
        document.getElementById(
            suboperacaoId
        );

    if (!area || !operacao || !suboperacao) {
        return;
    }


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

        }
    );


    operacao.addEventListener(
        "change",
        () => {

            preencherSuboperacaoSelect(
                area.value,
                operacao.value,
                suboperacao
            );

        }
    );

}


function preencherOperacaoSelect(
    area,
    select
) {

    select.innerHTML =
        `<option value="">
            Selecione
        </option>`;

    select.disabled =
        !area;


    if (!area) return;


    const operacoes =
        Object.keys(
            HIERARQUIA[area] || {}
        );


    operacoes.forEach(
        operacao => {

            select.innerHTML +=
                `<option value="${escapeHtml(operacao)}">
                    ${escapeHtml(operacao)}
                </option>`;

        }
    );

}


function preencherSuboperacaoSelect(
    area,
    operacao,
    select
) {

    select.innerHTML =
        `<option value="">
            Selecione
        </option>`;

    select.disabled =
        !area || !operacao;


    if (
        !area ||
        !operacao
    ) {
        return;
    }


    const suboperacoes =
        HIERARQUIA
            [area]
            ?.[operacao] || [];


    suboperacoes.forEach(
        sub => {

            select.innerHTML +=
                `<option value="${escapeHtml(sub)}">
                    ${escapeHtml(sub)}
                </option>`;

        }
    );

}


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


function editarVeiculo(id) {

    const veiculo =
        frota.find(
            v => String(v.id) === String(id)
        );

    if (!veiculo) return;


    document.getElementById(
        "veiculoId"
    ).value = veiculo.id;

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


    if (!id) {

        const adicionais =
            lerStorage(
                CHAVE_FROTA_ADICIONAL,
                []
            );

        adicionais.push(dados);

        salvarStorage(
            CHAVE_FROTA_ADICIONAL,
            adicionais
        );

        frota.push(dados);

    } else {

        const base =
            localizarVeiculoBase(id);

        if (base) {

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

        } else {

            const adicionais =
                lerStorage(
                    CHAVE_FROTA_ADICIONAL,
                    []
                );

            const indice =
                adicionais.findIndex(
                    v =>
                        String(v.id) ===
                        String(id)
                );

            if (indice >= 0) {

                adicionais[indice] =
                    dados;

                salvarStorage(
                    CHAVE_FROTA_ADICIONAL,
                    adicionais
                );

            }

        }


        const indiceFrota =
            frota.findIndex(
                v =>
                    String(v.id) ===
                    String(id)
            );

        if (indiceFrota >= 0) {

            frota[indiceFrota] =
                dados;

        }

    }


    fecharModal(
        "modalVeiculo"
    );


    atualizarTudo();

}


function localizarVeiculoBase(id) {

    return null;

}


/* =========================================================
   MOTORISTAS — SELECTS
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
            .forEach(motorista => {

                dia.innerHTML +=
                    `<option value="${escapeHtml(motorista.id)}">
                        ${escapeHtml(motorista.nome)}
                    </option>`;

            });

        if (
            [...dia.options]
                .some(
                    option =>
                        option.value === atual
                )
        ) {
            dia.value = atual;
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
            .forEach(motorista => {

                noite.innerHTML +=
                    `<option value="${escapeHtml(motorista.id)}">
                        ${escapeHtml(motorista.nome)}
                    </option>`;

            });

        if (
            [...noite.options]
                .some(
                    option =>
                        option.value === atual
                )
        ) {
            noite.value = atual;
        }

    }

}


/* =========================================================
   MOTORISTAS — CRUD
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
                m =>
                    String(m.id) ===
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


function editarMotorista(id) {

    const motorista =
        motoristas.find(
            m =>
                String(m.id) ===
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
            m =>
                String(m.id) !==
                String(id)
        );


    salvarMotoristas();

    atualizarTudo();

}


function configurarFiltrosMotoristas() {

    [
        "filtroMotoristaBusca",
        "filtroMotoristaArea",
        "filtroMotoristaOperacao",
        "filtroMotoristaTipo",
        "filtroMotoristaTurno",
        "filtroMotoristaStatus"
    ]
        .forEach(id => {

            const elemento =
                document.getElementById(id);

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

        });


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
                    .map(m => m.area)
                    .filter(Boolean)
            )
        ]
            .sort()
            .forEach(valor => {

                area.innerHTML +=
                    `<option value="${escapeHtml(valor)}">
                        ${escapeHtml(valor)}
                    </option>`;

            });

    }

}


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
                    !motorista.nome
                        .toLowerCase()
                        .includes(busca)
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
                    tipo &&
                    motorista.tipo !== tipo
                ) {
                    return false;
                }

                if (
                    turno &&
                    motorista.turno !== turno
                ) {
                    return false;
                }

                if (
                    status &&
                    motorista.status !== status
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
        lista.map(
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
                                    onclick="editarMotorista('${motorista.id}')">
                                    Editar
                                </button>

                                <button
                                    class="action-button"
                                    onclick="excluirMotorista('${motorista.id}')">
                                    Excluir
                                </button>

                            </div>

                        </td>

                    </tr>

                `;

            }
        ).join("");


    atualizarIndicadoresMotoristas();

}


function atualizarIndicadoresMotoristas() {

    setText(
        "motoristasTotal",
        motoristas.length
    );

    setText(
        "motoristasAtivos",
        motoristas.filter(
            m => m.status === "Ativo"
        ).length
    );

    setText(
        "motoristasFixos",
        motoristas.filter(
            m => m.tipo === "Fixo"
        ).length
    );

    setText(
        "motoristasReservas",
        motoristas.filter(
            m => m.tipo === "Reserva"
        ).length
    );

}


/* =========================================================
   MANUTENÇÃO — CRUD
   ========================================================= */

function abrirFormularioManutencao() {

    limparFormulario(
        "formManutencao"
    );

    document.getElementById(
        "manutencaoId"
    ).value = "";

    document.getElementById(
        "manutencaoEntrada"
    ).value =
        dataHoje();

    preencherVeiculosManutencao();

    document.getElementById(
        "tituloModalManutencao"
    ).textContent =
        "Nova manutenção";


    abrirModal(
        "modalManutencao"
    );

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


function salvarManutencao(evento) {

    evento.preventDefault();


    const id =
        document.getElementById(
            "manutencaoId"
        ).value;


    const manutencao = {

        id:
            id ||
            `manutencao-${Date.now()}`,

        veiculoId:
            document.getElementById(
                "manutencaoVeiculo"
            ).value,

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
                m =>
                    String(m.id) ===
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


function aplicarStatusManutencao(
    manutencao
) {

    const veiculo =
        frota.find(
            v =>
                String(v.id) ===
                String(manutencao.veiculoId)
        );

    if (!veiculo) return;


    if (
        manutencao.status ===
        "Em manutenção"
    ) {

        veiculo.status =
            "Parado";

        persistirAlteracaoFrota(
            veiculo
        );

    }

}


function editarManutencao(id) {

    const manutencao =
        manutencoes.find(
            m =>
                String(m.id) ===
                String(id)
        );

    if (!manutencao) return;


    preencherVeiculosManutencao();


    document.getElementById(
        "manutencaoId"
    ).value =
        manutencao.id;

    document.getElementById(
        "manutencaoVeiculo"
    ).value =
        manutencao.veiculoId;

    document.getElementById(
        "manutencaoTipo"
    ).value =
        manutencao.tipo;

    document.getElementById(
        "manutencaoMotivo"
    ).value =
        manutencao.motivo;

    document.getElementById(
        "manutencaoEntrada"
    ).value =
        manutencao.entrada || "";

    document.getElementById(
        "manutencaoPrevisao"
    ).value =
        manutencao.previsao || "";

    document.getElementById(
        "manutencaoSaida"
    ).value =
        manutencao.saida || "";

    document.getElementById(
        "manutencaoStatus"
    ).value =
        manutencao.status;

    document.getElementById(
        "manutencaoObservacao"
    ).value =
        manutencao.observacao || "";


    document.getElementById(
        "tituloModalManutencao"
    ).textContent =
        "Editar manutenção";


    abrirModal(
        "modalManutencao"
    );

}


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
            m =>
                String(m.id) !==
                String(id)
        );


    salvarManutencoes();

    atualizarTudo();

}


function configurarFiltrosManutencao() {

    [
        "filtroManutencaoBusca",
        "filtroManutencaoStatus",
        "filtroManutencaoTipo"
    ]
        .forEach(id => {

            const elemento =
                document.getElementById(id);

            if (elemento) {

                elemento.addEventListener(
                    "input",
                    renderizarManutencoes
                );

                elemento.addEventListener(
                    "change",
                    renderizarManutencoes
                );

            }

        });

}


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
                        v =>
                            String(v.id) ===
                            String(
                                manutencao.veiculoId
                            )
                    );


                const cv =
                    veiculo?.cv ||
                    "";


                if (
                    busca &&
                    !(
                        cv
                            .toLowerCase()
                            .includes(busca) ||
                        manutencao.motivo
                            .toLowerCase()
                            .includes(busca)
                    )
                ) {
                    return false;
                }


                if (
                    status &&
                    manutencao.status !== status
                ) {
                    return false;
                }


                if (
                    tipo &&
                    manutencao.tipo !== tipo
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
        lista.map(
            manutencao => {

                const veiculo =
                    frota.find(
                        v =>
                            String(v.id) ===
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
                                    onclick="editarManutencao('${manutencao.id}')">
                                    Editar
                                </button>

                                <button
                                    class="action-button"
                                    onclick="excluirManutencao('${manutencao.id}')">
                                    Excluir
                                </button>

                            </div>

                        </td>

                    </tr>

                `;

            }
        ).join("");


    atualizarIndicadoresManutencao();

}


function atualizarIndicadoresManutencao() {

    setText(
        "manutencoesTotal",
        manutencoes.length
    );

    setText(
        "manutencoesEmManutencao",
        manutencoes.filter(
            m =>
                m.status ===
                "Em manutenção"
        ).length
    );

    setText(
        "manutencoesAgendadas",
        manutencoes.filter(
            m =>
                m.status ===
                "Agendada"
        ).length
    );

    setText(
        "manutencoesConcluidas",
        manutencoes.filter(
            m =>
                m.status ===
                "Concluída"
        ).length
    );

}


/* =========================================================
   DOCUMENTAÇÃO
   ========================================================= */

const DOCUMENTOS = [
    "CIV",
    "CIPP",
    "CVV",
    "Cronotacógrafo",
    "Checklist da Base"
];


function equipamentoTemDocumento(
    equipamento,
    documento
) {

    /*
       REGRA:

       CIPP e CVV não se aplicam ao CV.

       Para Truck:
       todos os documentos são válidos.

       Para SM1 / SM2:
       todos os documentos podem ser cadastrados.

       O sistema controla o documento pelo equipamento,
       evitando cobrar CIPP/CVV do cavalo.
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


function atualizarDocumentosPermitidos() {

    const equipamento =
        document.getElementById(
            "docEquipamento"
        )?.value;


    const documento =
        document.getElementById(
            "docTipo"
        );

    if (!documento) return;


    [...documento.options]
        .forEach(option => {

            const permitido =
                equipamentoTemDocumento(
                    equipamento,
                    option.value
                );

            option.disabled =
                !permitido;

        });


    if (
        !equipamentoTemDocumento(
            equipamento,
            documento.value
        )
    ) {

        documento.value = "CIV";

    }

}


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

    if (!regra) return;


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


function abrirFormularioDocumentacao() {

    limparFormulario(
        "formDocumentacao"
    );

    document.getElementById(
        "documentacaoId"
    ).value = "";


    preencherVeiculosDocumentacao();


    document.getElementById(
        "docEquipamento"
    ).value =
        "CV";


    document.getElementById(
        "docTipo"
    ).value =
        "CIV";


    atualizarDocumentosPermitidos();
    atualizarRegraDocumentacao();


    abrirModal(
        "modalDocumentacao"
    );

}


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


    if (!veiculo) return;


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


function preencherVeiculosDocumentacao() {

    const select =
        document.getElementById(
            "docVeiculo"
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
                    ${escapeHtml(
                        veiculo.cv
                    )} — ${escapeHtml(
                        veiculo.modal ||
                        descobrirModal(veiculo)
                    )}
                </option>`;

        }
    );

}


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


    const id =
        document.getElementById(
            "documentacaoId"
        ).value;


    const documento = {

        id:
            id ||
            `doc-${Date.now()}`,

        veiculoId:
            document.getElementById(
                "docVeiculo"
            ).value,

        equipamento,

        tipo,

        emissao:
            document.getElementById(
                "docEmissao"
            ).value,

        validade:
            document.getElementById(
                "docValidade"
            ).value,

        observacao:
            document.getElementById(
                "docObservacao"
            ).value.trim()

    };


    const existente =
        documentos.findIndex(
            d =>

                String(d.veiculoId) ===
                String(documento.veiculoId)

                &&

                d.equipamento ===
                documento.equipamento

                &&

                d.tipo ===
                documento.tipo
        );


    if (existente >= 0) {

        documentos[existente] =
            {
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
            String(veiculoId)

            &&

            documento.equipamento ===
            equipamento

            &&

            documento.tipo ===
            tipo
    );

}


function statusDocumento(
    documento,
    aplicavel = true
) {

    if (!aplicavel) {

        return {
            status: "N/A",
            classe: "doc-nao-cadastrado",
            dias: null
        };

    }


    if (
        !documento ||
        !documento.validade
    ) {

        return {
            status: "Não cadastrado",
            classe: "doc-nao-cadastrado",
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


    if (diferenca < 0) {

        return {
            status: "Vencido",
            classe: "doc-vencido",
            dias: diferenca
        };

    }


    if (diferenca <= 30) {

        return {
            status:
                "Próximo do vencimento",
            classe: "doc-proximo",
            dias: diferenca
        };

    }


    return {
        status: "Em dia",
        classe: "doc-em-dia",
        dias: diferenca
    };

}


function renderizarDocumentacao() {

    preencherFiltrosDocumentacao();

    const busca =
        document.getElementById(
            "filtroDocBusca"
        )?.value
            .toLowerCase() || "";


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

                if (
                    busca &&
                    !(
                        String(
                            veiculo.cv
                        )
                            .toLowerCase()
                            .includes(busca)

                        ||

                        String(
                            veiculo.sm1
                        )
                            .toLowerCase()
                            .includes(busca)

                        ||

                        String(
                            veiculo.sm2
                        )
                            .toLowerCase()
                            .includes(busca)
                    )
                ) {
                    return false;
                }


                if (
                    area &&
                    veiculo.area !== area
                ) {
                    return false;
                }


                if (
                    operacao &&
                    veiculo.operacao !==
                    operacao
                ) {
                    return false;
                }


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

    if (!tbody) return;


    tbody.innerHTML =
        lista.map(
            criarLinhaDocumentacao
        ).join("");

}


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


    return equipamentos.map(
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
                                equipamento.placa
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
    ).join("");

}


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


    if (!aplicavel) {

        return `

            <td>

                <span class="doc-status doc-nao-cadastrado">
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
                class="action-button document-cell"
                onclick="editarDocumento(
                    '${veiculo.id}',
                    '${equipamento}',
                    '${tipo}'
                )">

                <span
                    class="doc-status ${estado.classe}">
                    ${estado.status}
                </span>

                ${
                    validade
                        ? `<small>
                            ${validade}
                           </small>`
                        : ""
                }

            </button>

        </td>

    `;

}


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


    document.getElementById(
        "docVeiculo"
    ).value =
        veiculoId;


    document.getElementById(
        "docEquipamento"
    ).value =
        equipamento;


    atualizarDocumentosPermitidos();


    document.getElementById(
        "docTipo"
    ).value =
        tipo;


    document.getElementById(
        "docEmissao"
    ).value =
        documento?.emissao || "";


    document.getElementById(
        "docValidade"
    ).value =
        documento?.validade || "";


    document.getElementById(
        "docObservacao"
    ).value =
        documento?.observacao || "";


    document.getElementById(
        "documentacaoId"
    ).value =
        documento?.id || "";


    atualizarRegraDocumentacao();


    abrirModal(
        "modalDocumentacao"
    );

}


function preencherFiltrosDocumentacao() {

    const area =
        document.getElementById(
            "filtroDocArea"
        );

    if (!area) return;


    const atual =
        area.value;


    const areas =
        [
            ...new Set(
                frota
                    .map(v => v.area)
                    .filter(Boolean)
            )
        ].sort();


    area.innerHTML =
        `<option value="">
            Todas
        </option>`;


    areas.forEach(
        valor => {

            area.innerHTML +=
                `<option value="${escapeHtml(valor)}">
                    ${escapeHtml(valor)}
                </option>`;

        }
    );


    if (
        areas.includes(atual)
    ) {
        area.value = atual;
    }


    const operacao =
        document.getElementById(
            "filtroDocOperacao"
        );


    if (!operacao) return;


    const atualOperacao =
        operacao.value;


    const operacoes =
        frota
            .filter(v => {

                return (
                    !area.value ||
                    v.area === area.value
                );

            })
            .map(v => v.operacao)
            .filter(Boolean);


    const unicas =
        [
            ...new Set(operacoes)
        ].sort();


    operacao.innerHTML =
        `<option value="">
            Todas
        </option>`;


    unicas.forEach(
        valor => {

            operacao.innerHTML +=
                `<option value="${escapeHtml(valor)}">
                    ${escapeHtml(valor)}
                </option>`;

        }
    );


    if (
        unicas.includes(
            atualOperacao
        )
    ) {

        operacao.value =
            atualOperacao;

    }

}


function configurarFiltrosDocumentacao() {

    [
        "filtroDocBusca",
        "filtroDocArea",
        "filtroDocOperacao",
        "filtroDocStatus"
    ]
        .forEach(id => {

            const elemento =
                document.getElementById(id);

            if (elemento) {

                elemento.addEventListener(
                    "input",
                    renderizarDocumentacao
                );

                elemento.addEventListener(
                    "change",
                    renderizarDocumentacao
                );

            }

        });

}


/* =========================================================
   DASHBOARD — DOCUMENTAÇÃO
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


            equipamentos.forEach(
                equipamento => {

                    DOCUMENTOS.forEach(
                        tipo => {

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


    const tabela =
        document.getElementById(
            "tabelaProximosDocumentos"
        );


    if (!tabela) return;


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
            .slice(0, 10)
            ;


    tabela.innerHTML =
        proximos.length
            ? proximos.map(
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
            ).join("")
            : `
                <tr>
                    <td colspan="4">
                        Nenhum vencimento próximo.
                    </td>
                </tr>
            `;

}


function renderizarTop10Documentos(
    listaFrota
) {

    const tbody =
        document.getElementById(
            "tabelaTop10Documentos"
        );

    if (!tbody) return;


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
        .slice(0, 10);


    tbody.innerHTML =
        lista.length
            ? lista.map(
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
            ).join("")
            : `
                <tr>
                    <td colspan="6">
                        Nenhum documento cadastrado.
                    </td>
                </tr>
            `;

}


function compararDocumentos(a, b) {

    return (
        dataLocal(
            a.documento.validade
        ) -

        dataLocal(
            b.documento.validade
        )
    );

}


function obterStatusVeiculoDocumentacao(
    veiculo
) {

    return obterDocumentosAplicaveis(
        [veiculo]
    ).map(
        d =>
            d.estado.status
    );

}


/* =========================================================
   PERSISTÊNCIA DE ALTERAÇÃO DE FROTA
   ========================================================= */

function persistirAlteracaoFrota(
    veiculo
) {

    const alteracoes =
        lerStorage(
            CHAVE_FROTA_ALTERACOES,
            {}
        );


    alteracoes[veiculo.id] = {
        ...veiculo
    };


    salvarStorage(
        CHAVE_FROTA_ALTERACOES,
        alteracoes
    );

}


/* =========================================================
   ATUALIZAÇÃO GERAL
   ========================================================= */

function atualizarTudo() {

    normalizarFrota();

    preencherFiltroDashboardAreas();
    preencherFiltroDashboardOperacoes();
    preencherFiltroDashboardSuboperacoes();

    atualizarDashboard();

    renderizarFrotaPagina();

    atualizarIndicadoresMotoristas();

    renderizarMotoristas();

    atualizarIndicadoresManutencao();

    renderizarManutencoes();

    renderizarDocumentacao();

    preencherMotoristasSelects();

}


/* =========================================================
   BADGES
   ========================================================= */

function badgeStatusFrota(
    status
) {

    return `
        <span class="status-badge status-${escapeHtml(status)}">
            ${escapeHtml(status)}
        </span>
    `;

}


function badgeStatusMotorista(
    status
) {

    let classe = "doc-nao-cadastrado";

    if (status === "Ativo") {
        classe = "doc-em-dia";
    }

    if (status === "Afastado") {
        classe = "doc-proximo";
    }

    if (status === "Inativo") {
        classe = "doc-vencido";
    }


    return `
        <span class="doc-status ${classe}">
            ${escapeHtml(status)}
        </span>
    `;

}


function badgeStatusManutencao(
    status
) {

    let classe =
        "doc-nao-cadastrado";


    if (
        status === "Em manutenção"
    ) {

        classe =
            "doc-vencido";

    } else if (
        status === "Agendada"
    ) {

        classe =
            "doc-proximo";

    } else if (
        status === "Concluída"
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


function badgeDocumento(
    estado
) {

    return `
        <span class="doc-status ${estado.classe}">
            ${escapeHtml(estado.status)}
        </span>
    `;

}


/* =========================================================
   UTILITÁRIOS
   ========================================================= */

function setText(
    id,
    valor
) {

    const elemento =
        document.getElementById(id);

    if (elemento) {

        elemento.textContent =
            valor;

    }

}


function limparFormulario(
    id
) {

    const form =
        document.getElementById(id);

    if (form) {

        form.reset();

    }

}


function dataHoje() {

    const agora =
        new Date();

    const ano =
        agora.getFullYear();

    const mes =
        String(
            agora.getMonth() + 1
        ).padStart(2, "0");

    const dia =
        String(
            agora.getDate()
        ).padStart(2, "0");


    return `${ano}-${mes}-${dia}`;

}


function dataLocal(
    valor
) {

    if (!valor) {
        return new Date(NaN);
    }


    const partes =
        String(valor)
            .split("-")
            .map(Number);


    if (
        partes.length !== 3
    ) {

        return new Date(valor);

    }


    return new Date(
        partes[0],
        partes[1] - 1,
        partes[2]
    );

}


function formatarData(
    valor
) {

    if (!valor) {
        return "-";
    }


    const data =
        dataLocal(valor);


    if (
        Number.isNaN(
            data.getTime()
        )
    ) {

        return "-";

    }


    return data.toLocaleDateString(
        "pt-BR"
    );

}


function formatarLitros(
    valor
) {

    if (
        valor === "" ||
        valor === null ||
        valor === undefined
    ) {

        return "-";

    }


    const numero =
        Number(valor);


    if (
        Number.isNaN(numero)
    ) {

        return "-";

    }


    return `${numero.toLocaleString(
        "pt-BR"
    )} L`;

}


function escapeHtml(
    valor
) {

    return String(
        valor ?? ""
    )
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}
