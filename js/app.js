/* =========================================================
   GESTÃO DE FROTA
   APLICAÇÃO PRINCIPAL
   ========================================================= */


/*
   Este arquivo é responsável por iniciar
   os módulos do sistema.

   Os módulos ficam separados por responsabilidade.
*/


document.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "Gestão de Frota — arquitetura modular carregada."
        );


        /* =====================================================
           CARREGAMENTO DOS DADOS
           ===================================================== */

        carregarFrota();

        carregarMotoristas();

        carregarManutencoes();

        carregarDocumentos();


        /* =====================================================
           NAVEGAÇÃO
           ===================================================== */

        configurarNavegacao();


        /* =====================================================
           MODAIS
           ===================================================== */

        configurarModais();


        /* =====================================================
           DASHBOARD
           ===================================================== */

        configurarDashboard();


        /* =====================================================
           FORMULÁRIOS
           ===================================================== */

        configurarFormularios();


        /* =====================================================
           MOTORISTAS
           ===================================================== */

        configurarFiltrosMotoristas();


        /* =====================================================
           MANUTENÇÃO
           ===================================================== */

        configurarFiltrosManutencao();

        configurarBuscaVeiculoManutencao();


        /* =====================================================
           DOCUMENTAÇÃO
           ===================================================== */

        configurarRegrasDocumentacao();

        configurarFiltrosDocumentacao();


        /* =====================================================
           ATUALIZAÇÃO GERAL
           ===================================================== */

        atualizarTudo();


        console.log(
            "Gestão de Frota — todos os módulos inicializados."
        );

    }
);
