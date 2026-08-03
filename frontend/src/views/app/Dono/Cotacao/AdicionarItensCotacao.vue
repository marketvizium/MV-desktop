<template>
  <div class="totalPage">
    <TitileSubtitle
      title="Adicionar Produtos à Cotação"
      :subtitle="`Cotação: ${nomeCotacao}`"
    />

    <div class="top-actions">
      <Button
        label="Consultar itens da cotação"
        icon="pi pi-search"
        class="btn-secondary"
        @click="irParaConsultaItens"
      />

      <Button
        label="Enviar produtos"
        icon="pi pi-send"
        class="poppins-regular btn-sbmt"
        :loading="loading"
        @click="enviarProdutos"
      />
    </div>

    <div
      v-for="(item, index) in itens"
      :key="index"
      class="item-row"
    >
      <div style="flex: 3; padding-right: 5px;">
        <inputDesktop
          maxlength="13"
          placeholder="Código de barras"
          v-model="item.codigo_barra"
        />
      </div>

      <div style="flex: 1; padding-left: 5px; padding-right: 5px;">
        <inputDesktop
          maxlength="6"
          placeholder="Qtd"
          v-model="item.quantidade"
        />
      </div>

      <div style="flex: 2; padding-left: 5px; padding-right: 5px;">
        <Dropdown
          v-model="item.tipo"
          :options="opcoesTipo"
          placeholder="Tipo do produto" 
          style="font-family: 'Poppins';"
          class="custom-dropdown"
        />
      </div>

      <div style="flex: 2; padding-left: 5px; padding-right: 5px;">
        <inputDesktop
          maxlength="6"
          placeholder="Qtd. por Caixa/Fardo"
          v-model="item.qtd_unitaria_composicao"
          :disabled="item.tipo === 'unidade' || item.tipo === ''"
        />
      </div>

      <div class="add-btn">
        <button
          v-if="index === itens.length - 1"
          @click="adicionarLinha"
        >
          +
        </button>

        <button
          v-else
          class="remove"
          @click="removerLinha(index)"
        >
          −
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import TitileSubtitle from '@/components/TitileSubtitle.vue'
import inputDesktop from '@/components/inputDesktop.vue'
import { Button, Dropdown } from 'primevue'
import { api } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import exibeErro from '@/utils/ExibeErro'

export default {
  name: 'AdicionarProdutoCotacao',

  components: {
    TitileSubtitle,
    inputDesktop,
    Button,
    Dropdown
  },

  data () {
    return {
      loading: false,
      auth: null,

      idCotacao: null,
      idUsuario: null,
      nomeCotacao: '',

      opcoesTipo: ['unidade', 'caixa', 'fardo'],

      itens: [
        { 
          codigo_barra: null, 
          quantidade: null, 
          tipo: '', 
          qtd_unitaria_composicao: null 
        }
      ]
    }
  },

  methods: {
    adicionarLinha () {
      this.itens.push({ 
        codigo_barra: null, 
        quantidade: null, 
        tipo: '', 
        qtd_unitaria_composicao: null 
      })
    },

    removerLinha (index) {
      this.itens.splice(index, 1)
    },

    irParaConsultaItens () {
      this.$router.push({
        name: 'ConsultaItensmain',
        query: {
          id_cotacao: this.idCotacao,
          nome_cotacao: this.nomeCotacao
        }
      })
    },

    async enviarProdutos () {
      this.loading = true

      try {
        const produtos = this.itens
          .filter(i => i.codigo_barra && i.quantidade)
          .map(i => ({
            codigo_barra: i.codigo_barra,
            quantidade: Number(i.quantidade),
            tipo: i.tipo,
            qtd_unitaria_composicao: i.tipo === 'unidade' ? null: i.qtd_unitaria_composicao
          }))

        const array_payload=[]
        produtos.forEach(prods=>{
          let array = [prods.codigo_barra, prods.quantidade, prods.tipo, prods.qtd_unitaria_composicao]
          array_payload.push(array)
        })

        if (produtos.length === 0) {
          this.$toast.info('Informe ao menos um produto válido')
          return
        }

        for(let prod=0; prod < produtos.length; prod++){
          if(produtos[prod].quantidade == null || produtos[prod].quantidade == 0){
              this.$toast.info(`O produto ${produtos[prod].codigo_barra} está sem quantidade mínima.`)
              return
          }

          if(produtos[prod].tipo == null || produtos[prod].tipo == 0){
              this.$toast.info(`O produto ${produtos[prod].codigo_barra} não tem o seu tipo informado.`)
              return
          }
        }

        const payload = {
          codigo_barra: array_payload,
          id_cotacao: this.idCotacao
        }

        await api.post(
          `/mvpu/cotacao/adicionarItem/${this.auth.id_loja}`,
          payload
        )

        this.$toast.success('Produtos adicionados com sucesso!')
        this.itens = [{ 
          codigo_barra: null, 
          quantidade: null, 
          tipo: '', 
          qtd_unitaria_composicao: null 
        }]

      } catch (e) {
        exibeErro(e, this.$toast)
      } finally {
        this.loading = false
      }
    }
  },

  mounted () {
    this.auth = useAuthStore()

    const query = this.$route.query
    this.idCotacao = query.id_cotacao
    this.idUsuario = query.id_usuario
    this.nomeCotacao = query.nome_cotacao || ''

    console.log(query)
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
  font-family: 'Poppins', sans-serif;
}

/* TOPO */
.top-actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}

/* LINHA ITEM */
.item-row {
  margin-top: 20px;
  display: flex;
  align-items: center;
  width: 100%;
}

/* BOTÃO + / - */
.add-btn {
  width: 50px;
  display: flex;
  justify-content: center;
  padding-left: 5px;
}

.add-btn button {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: none;
  background-color: #FF8049;
  color: #FFF;
  font-size: 22px;
  cursor: pointer;
}

.add-btn button.remove {
  background-color: #888;
}

.add-btn button:hover {
  opacity: 0.85;
}

/* AJUSTE DROPDOWN */
.custom-dropdown {
  width: 100%;
  height: 50px;
  border-radius: 8px;
  border: 1px solid #ddd;
  display: flex;
  align-items: center;
}

/* BOTÃO SECUNDÁRIO */
:deep(.btn-secondary.p-button) {
  background-color: #EEE !important;
  color: #333 !important;
  border: none !important;
}

/* BOTÃO PRINCIPAL */
:deep(.btn-sbmt.p-button),
:deep(.btn-sbmt.p-button:hover),
:deep(.btn-sbmt.p-button:focus),
:deep(.btn-sbmt.p-button:active) {
  background-color: #FF8049 !important;
  color: #FFF !important;
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
}

:deep(.btn-sbmt.p-button:hover) {
  background-color: #ce673b;
  transition: 0.3s;
}

*{
  font-family: 'Poppins';
}
</style>