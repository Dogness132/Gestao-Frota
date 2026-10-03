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


/* =========================================================
   FILTROS DO DASHBOARD
   ========================================================= */


function preencherFiltroDashboardAreas() {

    const select =
        document.getElementById(
            "dashboardArea"
        );

    if (!select) return;

    const atual =
        select.value;


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

        select.value =
            atual;

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


    if (
        !area ||
        !operacao ||
        !select
    ) {

        return;

    }


    const valorAtual =
        select.value;


    const suboperacoes =
        frota
            .filter(v => {

                if (
                    area.value &&
                    v.area !==
                    area.value
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
            veiculo.area !==
            area
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


/* =========================================================
   ATUALIZAÇÃO DO DASHBOARD
   ========================================================= */


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
                rodando /
                total *
                100
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


/* =========================================================
   GRÁFICO DONUT
   ========================================================= */


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
        rodando /
        total *
        360;


    const grausParados =
        parados /
        total *
        360;


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


/* =========================================================
   DISTRIBUIÇÃO POR OPERAÇÃO
   ========================================================= */


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
            .sort(
                (a, b) =>
                    b[1] - a[1]
            )
            .map(
                ([operacao, quantidade]) => {

                    const percentual =
                        quantidade /
                        total *
                        100;


                    return `

                        <div class="distribution-row">

                            <div>

                                <strong>
                                    ${escapeHtml(
                                        operacao
                                    )}
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

                }
            )
            .join("");

}


/* =========================================================
   TABELA DA FROTA NO DASHBOARD
   ========================================================= */


function renderizarFrotaDashboard(lista) {

    const tbody =
        document.getElementById(
            "tabelaFrota"
        );


    if (!tbody) return;


    tbody.innerHTML =
        lista
            .map(
                criarLinhaFrotaDashboard
            )
            .join("");

}


function criarLinhaFrotaDashboard(
    veiculo
) {

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

        </tr>

    `;

}
