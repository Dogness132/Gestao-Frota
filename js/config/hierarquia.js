/* =========================================================
   GESTÃO DE FROTA
   HIERARQUIA OPERACIONAL
   ========================================================= */


/*
   Estrutura:

   Área
      ↓
   Operação
      ↓
   Suboperação
*/


const HIERARQUIA = {

    Coleta: {

        Nexta: [
            "Geral"
        ],

        Raízen: [
            "Geral"
        ]

    },


    Entrega: {

        Nexta: [
            "Geral"
        ],

        Raízen: [
            "City",
            "Dedicado"
        ]

    },


    JET: {

        JET: [
            "JET"
        ]

    }

};
