// ========================================
// GESTÃO DE FROTA
// ========================================

let frota = [];


// ========================================
// CARREGAR DADOS
// ========================================

async function carregarFrota() {

    try {

        const resposta = await fetch("data/frota.json");

        if (!resposta.ok) {
            throw new Error("Não foi possível carregar a frota.");
        }

        frota = await resposta.json();

        atualizarSistema();

    } catch (erro) {

        console.error("Erro ao carregar frota:", erro);

    }

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

    const total = frota.length;

    const rodando = frota.filter(
        veiculo => veiculo.status === "Rodando"
    ).length;

    const parado = frota.filter(
        veiculo => veiculo.status === "Parado"
    ).length;

    const reserva = frota.filter(
        veiculo => veiculo.status === "Reserva"
    ).length;


    document.getElementById("frotaTotal").textContent = total;

    document.getElementById("frotaOperando").textContent = rodando;

    document.getElementById("frotaParada").textContent = parado;

    document.getElementById("frotaReserva").textContent = reserva;


    const percentual = total > 0
        ? Math.round((rodando / total) * 100)
        : 0;


    document.getElementById(
        "percentualOperacao"
    ).textContent = `${percentual}%`;


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

    const total = rodando + parado + reserva;

    if (total === 0) {
        return;
    }


    const porcentagemRodando =
        (rodando / total) * 100;

    const porcentagemParado =
        (parado / total) * 100;

    const porcentagemReserva =
        (reserva / total) * 100;


    const inicioParado =
        porcentagemRodando;

    const fimParado =
        porcentagemRodando + porcentagemParado;


    const grafico = document.querySelector(".donut");


    grafico.style.background = `
        conic-gradient(
            #22c55e 0% ${porcentagemRodando}%,
            #ef4444 ${inicioParado}% ${fimParado}%,
            #eab308 ${fimParado}% 100%
        )
    `;

}


// ========================================
// TABELA DA FROTA
// ========================================

function atualizarTabela() {

    const tabela = document.querySelector("tbody");

    tabela.innerHTML = "";


    frota.forEach(veiculo => {

        const linha = document.createElement("tr");


        let classeStatus = "";

        if (veiculo.status === "Rodando") {
            classeStatus = "active-status";
        }

        if (veiculo.status === "Parado") {
            classeStatus = "stopped-status";
        }

        if (veiculo.status === "Reserva") {
            classeStatus = "reserve-status";
        }


        linha.innerHTML = `

            <td>${veiculo.cv}</td>

            <td>${veiculo.sm1}</td>

            <td>${veiculo.sm2}</td>

            <td>${veiculo.area}</td>

            <td>${veiculo.operacao}</td>

            <td>${veiculo.suboperacao}</td>

            <td>
                <span class="status ${classeStatus}">
                    ● ${veiculo.status}
                </span>
            </td>

        `;


        tabela.appendChild(linha);

    });

}


// ========================================
// DISTRIBUIÇÃO POR OPERAÇÃO
// ========================================

function atualizarDistribuicao() {

    const raizen = frota.filter(
        veiculo => veiculo.operacao === "Raízen"
    ).length;


    const nexta = frota.filter(
        veiculo => veiculo.operacao === "Nexta"
    ).length;


    const total = frota.length;


    const percentualRaizen =
        total > 0
            ? (raizen / total) * 100
            : 0;


    const percentualNexta =
        total > 0
            ? (nexta / total) * 100
            : 0;


    const barras =
        document.querySelectorAll(".bar-fill");


    if (barras.length >= 2) {

        barras[0].style.width =
            `${percentualRaizen}%`;

        barras[1].style.width =
            `${percentualNexta}%`;

    }


    const valores =
        document.querySelectorAll(".distribution-row > strong");


    if (valores.length >= 2) {

        valores[0].textContent = raizen;

        valores[1].textContent = nexta;

    }

}


// ========================================
// INICIAR SISTEMA
// ========================================

carregarFrota();
