<template>
  <div class="totalPage">
    <TitileSubtitle
      title="Entrada de Estoque"
      subtitle="Escolha o método para registrar a entrada de novos produtos."
    />

    <div class="cards-wrapper">
      
      <cardOps
        icon="keyboard"
        iconColor="#3F51B5"
        title="Entrada Manual"
        descricao="Preenchimento detalhado de cada item manualmente"
        route="EntradaManual"
      />

      <cardOps
        icon="upload_file"
        iconColor="#009688"
        title="Entrada por XML"
        descricao="Sincronizar estoque através de arquivo NF-e"
        route="EntradaXML"
      />

    </div>
  </div>
</template>

<script>
import TitileSubtitle from '@/components/TitileSubtitle.vue'
import cardOps from '@/components/cardOps.vue'

export default {
  name: 'EntradaEstoqueOpcoesPage',
  components: {
    TitileSubtitle,
    cardOps,
  }
}
</script>

<style scoped>
.totalPage {
  width: 100%;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

/* GRID DOS CARDS - AJUSTADO PARA MAIOR PROXIMIDADE */
.cards-wrapper {
  margin-top: 25px;
  display: grid;
  /* Define um tamanho fixo máximo para os cards não "esticarem" e se afastarem */
  grid-template-columns: repeat(auto-fill, minmax(250px, 300px));
  gap: 0px;
  justify-content: start; /* Alinha os cards ao início, evitando que se espalhem pela tela */
}
</style>