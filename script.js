// ========================================
// GESTÃO DE FROTA
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
                "Não foi possível carregar a frota."
            );

        }

        const frotaBase =
            await resposta.json();


        // Verifica se existem veículos
        // cadastrados anteriormente neste navegador

        const frotaSalva =
            JSON.parse(
                localStorage.getItem("frota")
            );


        if (Array.isArray(frotaSalva)) {

            frota = frotaSalva;

        } else {

            frota = frotaBase;

            salvarFrota();

        }


        atualizarSistema();

    }

    catch (erro) {

        console.error(
            "Erro ao carregar frota:",
            erro
        );

    }

}


// ========================================
// SALVAR FROTA
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

    const total = frota.length;


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
    ).textContent = total;


    document.getElementById(
        "frotaOperando"
    ).textContent = rodando;


    document.getElementById(
        "frotaParada"
    ).textContent = parado;


    document.getElementById(
        "frotaReserva"
    ).textContent = reserva;


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


    if (total === 0) {
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


    const grafico =
        document.querySelector(
            ".donut"
        );


    grafico.style.background = `
        conic-gradient(
            #22c55e 0% ${porcentagemRodando}%,
            #ef4444 ${inicioParado}% ${fimParado}%,
            #eab308 ${fimParado}% 100%
        )
    `;

}


// ========================================
// TABELA
// ========================================

function atualizarTabela() {

    const tabela =
        document.querySelector("tbody");


    tabela.innerHTML = "";


    frota.forEach(veiculo => {

        const linha =
            document.createElement("tr");


        let classeStatus = "";


        if (
            veiculo.status ===
            "Rodando"
        ) {

            classeStatus =
                "active-status";

        }


        if (
            veiculo.status ===
            "Parado"
        ) {

            classeStatus =
                "stopped-status";

        }


        if (
            veiculo.status ===
            "Reserva"
        ) {

            classeStatus =
                "reserve-status";

        }


        linha.innerHTML = `

            <td>${veiculo.cv}</td>

            <td>${veiculo.sm1}</td>

            <td>${veiculo.sm2}</td>

            <td>${veiculo.area}</td>

            <td>${veiculo.operacao}</td>

            <td>${veiculo.suboperacao}</td>

            <td>

                <span
                    class="status ${classeStatus}"
                >

                    ● ${veiculo.status}

                </span>

            </td>

        `;


        tabela.appendChild(linha);

    });

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


    const percentualRaizen =
        total > 0
            ? (raizen / total) * 100
            : 0;


    const percentualNexta =
        total > 0
            ? (nexta / total) * 100
            : 0;


    const barras =
        document.querySelectorAll(
            ".bar-fill"
        );


    if (barras.length >= 2) {

        barras[0].style.width =
            `${percentualRaizen}%`;

        barras[1].style.width =
            `${percentualNexta}%`;

    }


    const valores =
        document.querySelectorAll(
            ".distribution-row > strong"
        );


    if (valores.length >= 2) {

        valores[0].textContent =
            raizen;

        valores[1].textContent =
            nexta;

    }

}


// ========================================
// MODAL
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


// Abrir

btnNovoVeiculo.addEventListener(
    "click",
    () => {

        modal.classList.add(
            "show"
        );

    }
);


// Fechar

function fecharModal() {

    modal.classList.remove(
        "show"
    );

    formVeiculo.reset();

    resetarSelecoes();

}


btnFecharModal.addEventListener(
    "click",
    fecharModal
);


btnCancelar.addEventListener(
    "click",
    fecharModal
);


// ========================================
// CAMPOS DEPENDENTES
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


// Quando mudar a Área

campoArea.addEventListener(
    "change",
    atualizarOperacoes
);


function atualizarOperacoes() {

    const area =
        campoArea.value;


    campoOperacao.innerHTML = "";

    campoSuboperacao.innerHTML = "";


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


    campoSuboperacao.innerHTML = `
        <option value="">
            Selecione a operação primeiro
        </option>
    `;

}


// ========================================
// QUANDO MUDAR OPERAÇÃO
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


    campoSuboperacao.disabled =
        false;


    // Entrega + Raízen

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


    // Todas as outras combinações
    // atualmente usam Geral

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
// SALVAR NOVO VEÍCULO
// ========================================

formVeiculo.addEventListener(
    "submit",
    function (evento) {

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


        // Verificar CV duplicado

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


        // Adicionar

        frota.push(
            novoVeiculo
        );


        // Salvar no navegador

        salvarFrota();


        // Atualizar tudo

        atualizarSistema();


        // Fechar

        fecharModal();


        alert(
            "Veículo cadastrado com sucesso!"
        );

    }
);


// ========================================
// INICIAR
// ========================================

carregarFrota();
