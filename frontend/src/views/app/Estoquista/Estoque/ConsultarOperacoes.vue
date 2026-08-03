<template>
  <div class="totalPage">
    <TitileSubtitle
      title="Gestão de Estoque"
      subtitle="Selecione as ooperações abaixo. Com elas é possível registrar novas entradas no estoque, saídas do esotque e imprimir etiquetas QR code para controle de lote e promoções"
    />

    <div class="cards-wrapper">

      <cardOps
        icon="add_circle"
        iconColor="#2E7D32"
        title="Entrada de Estoque"
        descricao="Registrar novas entradas no estoque"
        route="EntradaEstoque"
      />

      <cardOps
        icon="remove_circle"
        iconColor="#D32F2F"
        title="Saída de Estoque"
        descricao="Registrar as saídas do estoque"
        route="SaidaEstoque"
      />

      <cardOps
        icon="qr_code_2"
        iconColor="#0288D1"
        title="Imprimir Etiqueta"
        descricao="Gerar e imprimir etiquetas de QR Code para lote e promoções"
        route="ImprimirEtiqueta"
      />

    </div>
  </div>
</template>

<script>
import TitileSubtitle from '@/components/TitileSubtitle.vue'
import cardOps from '@/components/cardOps.vue'

export default {
  name: 'ConsultarEstoquePage',
  components: {
    TitileSubtitle,
    cardOps,
  }
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