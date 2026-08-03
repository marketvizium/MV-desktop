<template>
  <div class="totalPage">
    <!-- WRAPPER DOS CARDS -->
    <div class="cards-wrapper">

      <cardOps
        icon="today"
        iconColor="#1976D2"
        title="Turnos de hoje"
        descricao="Consulte todos os turnos do dia atual"
        route="ConsultarTurnosHoje"
      />

      <cardOps
        icon="play_circle"
        iconColor="#2E7D32"
        title="Turnos abertos"
        descricao="Consulte todos os turnos atualmente abertos"
        route="ConsultarTurnosAbertos"
      />

      <cardOps
        icon="check_circle"
        iconColor="#424242"
        title="Turnos fechados"
        descricao="Consulte todos os turnos já encerrados"
        route="ConsultarTurnosFechados"
      />

      <cardOps
        icon="report_problem"
        iconColor="#F9A825"
        title="Turnos em revisão"
        descricao="Consulte turnos que estão em análise ou revisão"
        route="ConsultarTurnosRevisao"
      />

      <cardOps
        icon="list_alt"
        iconColor="#5A0F83"
        title="Todos os turnos"
        descricao="Visualize todos os turnos registrados no sistema"
        route="ConsultarTodosTurnos"
      />

    </div>
  </div>
</template>

<script>
import TitileSubtitle from '@/components/TitileSubtitle.vue'
import cardOps from '@/components/cardOps.vue'

export default {
  name: 'ConsultarTurnos',
  components: {
    TitileSubtitle,
    cardOps,
  },
}
</script>

<style scoped>
.totalPage {
  width: 100%;
  height: 100vh;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

/* GRID DOS CARDS */
.cards-wrapper {
  margin-top: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 20px;
}
</style>
