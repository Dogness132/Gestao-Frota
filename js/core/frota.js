/* =========================================================
   GESTÃO DE FROTA
   NÚCLEO DA FROTA
   ========================================================= */


/* =========================================================
   DADOS DA FROTA
   ========================================================= */

let frota = [];


/* =========================================================
   CARREGAR FROTA
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

        const alteracoes = lerStorage(
            CHAVE_FROTA_ALTERACOES,
            {}
        );

        const adicionais = lerStorage(
            CHAVE_FROTA_ADICIONAL,
            []
        );


        /* =============================================
           APLICA ALTERAÇÕES NOS VEÍCULOS DA BASE
           ============================================= */

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


        /* =============================================
           ADICIONA VEÍCULOS CADASTRADOS LOCALMENTE
           ============================================= */

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

        normalizarFrota();

    }

}


/* =========================================================
   NORMALIZAR DADOS DA FROTA
   ========================================================= */

function normalizarFrota() {

    frota = frota.map(
        (veiculo, index) => {

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

        }
    );

}


/* =========================================================
   DESCOBRIR MODAL PELO CONJUNTO
   ========================================================= */

function descobrirModal(veiculo) {

    const sm1 =
        String(veiculo.sm1 || "").trim();

    const sm2 =
        String(veiculo.sm2 || "").trim();


    if (!sm1 && !sm2) {

        return "Truck";

    }


    if (sm1 && sm2) {

        return "Bitrem";

    }


    return "Carreta";

}


/* =========================================================
   LOCALIZAR VEÍCULO PELO ID
   ========================================================= */

function encontrarVeiculo(id) {

    return frota.find(
        veiculo =>
            String(veiculo.id) ===
            String(id)
    );

}


/* =========================================================
   LOCALIZAR VEÍCULO PELO CV
   ========================================================= */

function encontrarVeiculoPorCV(cv) {

    const busca =
        normalizarTexto(cv);

    return frota.find(
        veiculo =>
            normalizarTexto(
                veiculo.cv
            ) === busca
    );

}


/* =========================================================
   BUSCAR VEÍCULOS
   ========================================================= */

function buscarVeiculos(texto) {

    const busca =
        normalizarTexto(texto);

    if (!busca) {

        return [];

    }


    return frota.filter(
        veiculo => {

            const dados = [

                veiculo.cv,
                veiculo.sm1,
                veiculo.sm2,
                veiculo.modal,
                veiculo.area,
                veiculo.operacao,
                veiculo.suboperacao

            ];

            return dados.some(
                valor =>
                    normalizarTexto(valor)
                        .includes(busca)
            );

        }
    );

}


/* =========================================================
   FORMATAR CAPACIDADE
   ========================================================= */

function formatarLitros(valor) {

    if (
        valor === null ||
        valor === undefined ||
        valor === ""
    ) {

        return "-";

    }


    const numero =
        Number(
            String(valor)
                .replace(/\./g, "")
                .replace(",", ".")
        );


    if (Number.isNaN(numero)) {

        return escapeHtml(valor);

    }


    return `${numero.toLocaleString("pt-BR")} L`;

}


/* =========================================================
   STATUS DA FROTA
   ========================================================= */

function badgeStatusFrota(status) {

    const classe =
        `status-${String(status || "")
            .replace(/\s+/g, "-")}`;

    return `

        <span class="status-badge ${classe}">
            ${escapeHtml(status || "-")}
        </span>

    `;

}
