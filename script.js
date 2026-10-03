// ================================
// GESTÃO DE FROTA
// ================================


// Dados temporários da frota.
// Depois vamos substituir isso pelo banco de dados.

const frota = [

    {
        cv: "ABC-1234",
        sm1: "XYZ-1111",
        sm2: "XYZ-2222",
        area: "Entrega",
        operacao: "Raízen",
        suboperacao: "City",
        status: "Rodando"
    },

    {
        cv: "DEF-5678",
        sm1: "XYZ-3333",
        sm2: "XYZ-4444",
        area: "Entrega",
        operacao: "Raízen",
        suboperacao: "Dedicado",
        status: "Rodando"
    },

    {
        cv: "GHI-9012",
        sm1: "XYZ-5555",
        sm2: "XYZ-6666",
        area: "Coleta",
        operacao: "Nexta",
        suboperacao: "Geral",
        status: "Parado"
    },

    {
        cv: "JKL-3456",
        sm1: "XYZ-7777",
        sm2: "XYZ-8888",
        area: "Entrega",
        operacao: "Raízen",
        suboperacao: "City",
        status: "Rodando"
    },

    {
        cv: "MNO-7890",
        sm1: "XYZ-9999",
        sm2: "XYZ-1010",
        area: "Entrega",
        operacao: "Raízen",
        suboperacao: "Dedicado",
        status: "Rodando"
    },

    {
        cv: "PQR-1234",
        sm1: "XYZ-1112",
        sm2: "XYZ-1314",
        area: "Coleta",
        operacao: "Nexta",
        suboperacao: "Geral",
        status: "Rodando"
    },

    {
        cv: "STU-5678",
        sm1: "XYZ-1516",
        sm2: "XYZ-1718",
        area: "Entrega",
        operacao: "Raízen",
        suboperacao: "City",
        status: "Rodando"
    },

    {
        cv: "VWX-9012",
        sm1: "XYZ-1920",
        sm2: "XYZ-2122",
        area: "Coleta",
        operacao: "Nexta",
        suboperacao: "Geral",
        status: "Reserva"
    }

];


// ================================
// CALCULANDO OS INDICADORES
// ================================

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


// ================================
// ATUALIZANDO O DASHBOARD
// ================================

document.getElementById("frotaTotal").textContent = total;

document.getElementById("frotaOperando").textContent = rodando;

document.getElementById("frotaParada").textContent = parado;

document.getElementById("frotaReserva").textContent = reserva;


// Percentual da frota operando

const percentual = total > 0
    ? Math.round((rodando / total) * 100)
    : 0;

document.getElementById(
    "percentualOperacao"
).textContent = `${percentual}%`;


// ================================
// LOG
// ================================

console.log("Sistema de Gestão de Frota iniciado.");

console.log("Frota total:", total);

console.log("Veículos rodando:", rodando);

console.log("Veículos parados:", parado);

console.log("Veículos reserva:", reserva);
