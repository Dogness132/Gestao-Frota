/* =========================================================
   FROTA — INTERFACE
   ========================================================= */


/* =========================================================
   RENDERIZAÇÃO DA PÁGINA FROTA
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
