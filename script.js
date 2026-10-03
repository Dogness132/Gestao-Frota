// ========================================
// GESTÃO DE FROTA
// ========================================


// ========================================
// VARIÁVEL PRINCIPAL
// ========================================

let frota = [];


// ========================================
// CARREGAR FROTA
// ========================================

async function carregarFrota() {

    try {

        const resposta =
            await fetch("data/frota.json");


        if (!resposta.ok) {

            throw new Error(
                "Não foi possível carregar o arquivo frota.json."
            );

        }


        const frotaBase =
            await resposta.json();


        const frotaSalva =
            localStorage.getItem("frota");


        if (frotaSalva) {

            frota =
                JSON.parse(frotaSalva);

        } else {

            frota =
                frotaBase;

            salvarFrota();

        }


        atualizarSistema();

    }

    catch (erro) {

        console.error(
            "Erro ao carregar a frota:",
            erro
        );

    }

}


// ========================================
// SALVAR NO NAVEGADOR
// ========================================

function salvarFrota() {

    localStorage.setItem(
        "frota",
        JSON.stringify(frota)
    );

}


// ========================================
// ATUALIZAR SISTEMA
// ========================================

function atualizarSistema() {

    atualizarIndicadores();

    atualizarTabela();

    atualizarDistribuicao();

}


// ========================================
// INDICADORES
// ========================================

function atualizarIndicadores() {

    const total =
        frota.length;


    const rodando =
        frota.filter(
            veiculo =>
                veiculo.status === "Rodando"
        ).length;


    const parado =
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
        "legendaRodando"
    ).textContent =
        rodando;


    document.getElementById(
        "legendaParado"
    ).textContent =
        parado;


    document.getElementById(
        "legendaReserva"
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
        `${percentual}%`;


    atualizarGrafico(
        rodando,
        parado,
        reserva
    );

}


// ========================================
// GRÁFICO
// ========================================

function atualizarGrafico(
    rodando,
    parado,
    reserva
) {

    const total =
        rodando +
        parado +
        reserva;


    const grafico =
        document.querySelector(
            ".donut"
        );


    if (!grafico) {

        return;

    }


    if (total === 0) {

        grafico.style.background =
            "#334155";

        return;

    }


    const porcentagemRodando =
        (rodando / total) * 100;


    const porcentagemParado =
        (parado / total) * 100;


    const inicioParado =
        porcentagemRodando;


    const fimParado =
        porcentagemRodando +
        porcentagemParado;


    grafico.style.background = `

        conic-gradient(

            #22c55e
            0%
            ${porcentagemRodando}%,

            #ef4444
            ${inicioParado}%
            ${fimParado}%,

            #eab308
            ${fimParado}%
            100%

        )

    `;

}


// ========================================
// TABELA
// ========================================

function atualizarTabela() {

    const tabela =
        document.getElementById(
            "tabelaFrota"
        );


    if (!tabela) {

        return;

    }


    tabela.innerHTML = "";


    frota.forEach(
        veiculo => {

            const linha =
                document.createElement(
                    "tr"
                );


            let classeStatus =
                "";


            if (
                veiculo.status ===
                "Rodando"
            ) {

                classeStatus =
                    "active-status";

            }


            else if (
                veiculo.status ===
                "Parado"
            ) {

                classeStatus =
                    "stopped-status";

            }


            else if (
                veiculo.status ===
                "Reserva"
            ) {

                classeStatus =
                    "reserve-status";

            }


            linha.innerHTML = `

                <td>
                    ${veiculo.cv}
                </td>

                <td>
                    ${veiculo.sm1}
                </td>

                <td>
                    ${veiculo.sm2}
                </td>

                <td>
                    ${veiculo.area}
                </td>

                <td>
                    ${veiculo.operacao}
                </td>

                <td>
                    ${veiculo.suboperacao}
                </td>

                <td>

                    <span
                        class="status ${classeStatus}"
                    >

                        ●
                        ${veiculo.status}

                    </span>

                </td>

            `;


            tabela.appendChild(
                linha
            );

        }
    );

}


// ========================================
// DISTRIBUIÇÃO
// ========================================

function atualizarDistribuicao() {

    const raizen =
        frota.filter(
            veiculo =>
                veiculo.operacao ===
                "Raízen"
        ).length;


    const nexta =
        frota.filter(
            veiculo =>
                veiculo.operacao ===
                "Nexta"
        ).length;


    const total =
        frota.length;


    document.getElementById(
        "totalRaizen"
    ).textContent =
        raizen;


    document.getElementById(
        "totalNexta"
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
        `${percentualRaizen}%`;


    document.getElementById(
        "barraNexta"
    ).style.width =
        `${percentualNexta}%`;

}


// ========================================
// ELEMENTOS DO MODAL
// ========================================

const modal =
    document.getElementById(
        "modalVeiculo"
    );


const btnNovoVeiculo =
    document.getElementById(
        "btnNovoVeiculo"
    );


const btnFecharModal =
    document.getElementById(
        "btnFecharModal"
    );


const btnCancelar =
    document.getElementById(
        "btnCancelar"
    );


const formVeiculo =
    document.getElementById(
        "formVeiculo"
    );


// ========================================
// ABRIR MODAL
// ========================================

function abrirModalVeiculo() {

    modal.classList.add(
        "show"
    );

}


// ========================================
// FECHAR MODAL
// ========================================

function fecharModal() {

    modal.classList.remove(
        "show"
    );


    formVeiculo.reset();


    resetarSelecoes();

}


// ========================================
// EVENTOS DOS BOTÕES
// ========================================

btnNovoVeiculo.addEventListener(
    "click",
    abrirModalVeiculo
);


btnFecharModal.addEventListener(
    "click",
    fecharModal
);


btnCancelar.addEventListener(
    "click",
    fecharModal
);


// ========================================
// FECHAR CLICANDO FORA
// ========================================

modal.addEventListener(
    "click",
    evento => {

        if (
            evento.target ===
            modal
        ) {

            fecharModal();

        }

    }
);


// ========================================
// CAMPOS
// ========================================

const campoArea =
    document.getElementById(
        "area"
    );


const campoOperacao =
    document.getElementById(
        "operacao"
    );


const campoSuboperacao =
    document.getElementById(
        "suboperacao"
    );


// ========================================
// ÁREA → OPERAÇÃO
// ========================================

campoArea.addEventListener(
    "change",
    atualizarOperacoes
);


function atualizarOperacoes() {

    const area =
        campoArea.value;


    campoOperacao.innerHTML =
        "";


    campoSuboperacao.innerHTML =
        "";


    campoSuboperacao.disabled =
        true;


    if (!area) {

        campoOperacao.disabled =
            true;


        campoOperacao.innerHTML = `

            <option value="">
                Selecione a área primeiro
            </option>

        `;


        campoSuboperacao.innerHTML = `

            <option value="">
                Selecione a operação primeiro
            </option>

        `;


        return;

    }


    campoOperacao.disabled =
        false;


    campoOperacao.innerHTML = `

        <option value="">
            Selecione
        </option>

        <option value="Nexta">
            Nexta
        </option>

        <option value="Raízen">
            Raízen
        </option>

    `;

}


// ========================================
// OPERAÇÃO → SUBOPERAÇÃO
// ========================================

campoOperacao.addEventListener(
    "change",
    atualizarSuboperacoes
);


function atualizarSuboperacoes() {

    const area =
        campoArea.value;


    const operacao =
        campoOperacao.value;


    campoSuboperacao.innerHTML =
        "";


    if (!operacao) {

        campoSuboperacao.disabled =
            true;


        campoSuboperacao.innerHTML = `

            <option value="">
                Selecione a operação primeiro
            </option>

        `;


        return;

    }


    campoSuboperacao.disabled =
        false;


    if (
        area === "Entrega" &&
        operacao === "Raízen"
    ) {

        campoSuboperacao.innerHTML = `

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


    campoSuboperacao.innerHTML = `

        <option value="Geral">
            Geral
        </option>

    `;

}


// ========================================
// RESETAR CAMPOS
// ========================================

function resetarSelecoes() {

    campoOperacao.disabled =
        true;


    campoSuboperacao.disabled =
        true;


    campoOperacao.innerHTML = `

        <option value="">
            Selecione a área primeiro
        </option>

    `;


    campoSuboperacao.innerHTML = `

        <option value="">
            Selecione a operação primeiro
        </option>

    `;

}


// ========================================
// SALVAR VEÍCULO
// ========================================

formVeiculo.addEventListener(
    "submit",
    evento => {

        evento.preventDefault();


        const novoVeiculo = {

            id:
                Date.now(),


            cv:
                document
                    .getElementById("cv")
                    .value
                    .trim()
                    .toUpperCase(),


            sm1:
                document
                    .getElementById("sm1")
                    .value
                    .trim()
                    .toUpperCase(),


            sm2:
                document
                    .getElementById("sm2")
                    .value
                    .trim()
                    .toUpperCase(),


            area:
                campoArea.value,


            operacao:
                campoOperacao.value,


            suboperacao:
                campoSuboperacao.value,


            status:
                document
                    .getElementById("status")
                    .value

        };


        // ====================================
        // VERIFICAR CV DUPLICADO
        // ====================================

        const existe =
            frota.some(
                veiculo =>
                    veiculo.cv ===
                    novoVeiculo.cv
            );


        if (existe) {

            alert(
                "Já existe um veículo com este CV."
            );


            return;

        }


        // ====================================
        // ADICIONAR
        // ====================================

        frota.push(
            novoVeiculo
        );


        // ====================================
        // SALVAR
        // ====================================

        salvarFrota();


        // ====================================
        // ATUALIZAR TUDO
        // ====================================

        atualizarSistema();


        // ====================================
        // FECHAR
        // ====================================

        fecharModal();


        alert(
            "Veículo cadastrado com sucesso!"
        );

    }
);


// ========================================
// INICIAR SISTEMA
// ========================================

carregarFrota();
