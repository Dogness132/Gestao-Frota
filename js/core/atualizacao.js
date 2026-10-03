/* =========================================================
   GESTÃO DE FROTA
   ATUALIZAÇÃO GERAL DA INTERFACE
   ========================================================= */


/*
   Este módulo funciona como o ponto central de atualização
   da interface.

   Cada módulo continua responsável pela sua própria lógica,
   mas esta função coordena a atualização geral.
*/


function atualizarTudo() {

    /* =====================================================
       FROTA
       ===================================================== */

    normalizarFrota();


    /* =====================================================
       FILTROS DO DASHBOARD
       ===================================================== */

    preencherFiltroDashboardAreas();

    preencherFiltroDashboardOperacoes();

    preencherFiltroDashboardSuboperacoes();


    /* =====================================================
       DASHBOARD
       ===================================================== */

    atualizarDashboard();


    /* =====================================================
       PÁGINA DE FROTA
       ===================================================== */

    renderizarFrotaPagina();


    /* =====================================================
       MOTORISTAS
       ===================================================== */

    atualizarIndicadoresMotoristas();

    renderizarMotoristas();


    /* =====================================================
       MANUTENÇÃO
       ===================================================== */

    atualizarIndicadoresManutencao();

    renderizarManutencoes();


    /* =====================================================
       DOCUMENTAÇÃO
       ===================================================== */

    renderizarDocumentacao();


    /* =====================================================
       SELEÇÃO DE MOTORISTAS
       ===================================================== */

    preencherMotoristasSelects();

}
