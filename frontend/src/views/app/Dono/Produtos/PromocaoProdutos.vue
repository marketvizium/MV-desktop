<template>
  <div class="totalPage">
    <TitileSubtitle
      title="Adicionar Promoção"
      subtitle="Adicione uma promoção a um produto cadastrado. Através do código de barras será adicionada a promoção ao produto."
    />

    <!-- LINHA 1 -->
    <div style="width: 100%; display: flex; margin-top: 20px;">
      <div style="width: 100%; padding-right: 5px;">
        <inputDesktop
          placeholder="Código de barras"
          maxlength="13"
          v-model="promocao.codigo_barra"
        />
      </div>

      <div style="width: 100%; padding-left: 5px;">
        <inputDesktop
          placeholder="Porcentagem da promoção (%)"
          maxlength="3"
          v-model="promocao.porcentagem_promo"
        />
      </div>
    </div>

    <!-- LINHA 2 -->
    <div style="width: 100%; display: flex; margin-top: 20px;">
      <div style="width: 50%; padding-right: 5px;">
        <Calendar
          v-model="inicioPromoDate"
          showIcon
          showTime
          hourFormat="24"
          dateFormat="dd/mm/yy"
          placeholder="Início da promoção"
          class="calendar-custom w-full"
        />
      </div>

      <div style="width: 50%; padding-left: 5px;">
        <Calendar
          v-model="fimPromoDate"
          showIcon
          showTime
          hourFormat="24"
          dateFormat="dd/mm/yy"
          placeholder="Fim da promoção"
          class="calendar-custom w-full"
        />
      </div>
    </div>

    <!-- AÇÕES -->
    <div style="display: flex; margin-top: 20px;">
      <button
        @click="limparTudo"
        style="width: 100%; margin-right: 8px; background-color: #888; color: #FFF; border-radius: 5px; border: none; height: 50px; cursor: pointer;"
      >
        Limpar tudo
      </button>

      <Button
        type="button"
        label="Cadastrar promoção"
        class="poppins-regular btn-sbmt"
        :loading="loading"
        @click="cadastrarPromocao"
      />
    </div>
  </div>
</template>

<script>
import TitileSubtitle from '@/components/TitileSubtitle.vue'
import inputDesktop from '@/components/inputDesktop.vue'
import { api } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import exibeErro from '@/utils/ExibeErro'
import { mapState } from 'pinia'
import { Button } from 'primevue'
import Calendar from 'primevue/calendar'

export default {
  name: 'CadastroPromocao',

  components: {
    TitileSubtitle,
    inputDesktop,
    Button,
    Calendar
  },

  data () {
    return {
      loading: false,
      auth: null,

      promocao: {
        codigo_barra: null,
        porcentagem_promo: null
      },

      inicioPromoDate: null,
      fimPromoDate: null
    }
  },

  computed: {
    ...mapState(useAuthStore, ['id_loja'])
  },

  methods: {
    limparTudo () {
      this.promocao.codigo_barra = null
      this.promocao.porcentagem_promo = null
      this.inicioPromoDate = null
      this.fimPromoDate = null
    },

    async cadastrarPromocao () {
      this.loading = true

      try {
        if (
          !this.promocao.codigo_barra ||
          !this.promocao.porcentagem_promo ||
          !this.inicioPromoDate ||
          !this.fimPromoDate
        ) {
          this.$toast.info('Dados obrigatórios não preenchidos')
          return
        }

        const agora = new Date()

        if (this.inicioPromoDate < agora) {
          this.$toast.info('A data e hora inicial precisam ser iguais ou superiores ao momento atual.')
          this.inicioPromoDate = null
          this.fimPromoDate = null
          return
        }

        if (this.inicioPromoDate > this.fimPromoDate) {
          this.$toast.info('A data final precisa ser maior que a data inicial.')
          this.fimPromoDate = null
          return
        }

        const payload = {
          id_loja: this.auth.id_loja,
          codigo_barra: this.promocao.codigo_barra,
          porcentagem_promo: Number(this.promocao.porcentagem_promo),
          inicio_promo: new Date(this.inicioPromoDate).getTime(),
          fim_promo: new Date(this.fimPromoDate).getTime()
        }

        console.log(payload)

         await api.post('/mvpu/produto/adicionarPromo', payload)

        this.$toast.success('Promoção cadastrada com sucesso!')
        this.limparTudo()

      } catch (e) {
        exibeErro(e, this.$toast)
      } finally {
        this.loading = false
      }
    }
  },

  mounted () {
    this.auth = useAuthStore()
  }
}
</script>

<style scoped>
.totalPage{
  width: 100%;
  height: 100vh;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

/* === TODO O CSS ORIGINAL MANTIDO === */

.checkbox-line {
  margin-top: 20px;
  width: 100%;
}

.checkbox-container {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  color: #333;
}

.checkbox-container input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.checkmark {
  width: 18px;
  height: 18px;
  border: 2px solid #000;
  border-radius: 4px;
  background: transparent;
  margin-right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.checkbox-container input:checked ~ .checkmark {
  background-color: #444;
  border-color: #444;
}

.checkmark::after {
  content: '';
  width: 5px;
  height: 9px;
  border: solid #fff;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
  display: none;
}

.checkbox-container input:checked ~ .checkmark::after {
  display: block;
}

:deep(.btn-sbmt.p-button),
:deep(.btn-sbmt.p-button:hover),
:deep(.btn-sbmt.p-button:focus),
:deep(.btn-sbmt.p-button:active) {
  background-color: #FF8049 !important;
  color: #FFF !important;
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
  cursor: pointer;
  width: 100%;
  margin-left: 8px;
}

:deep(.btn-sbmt.p-button:hover) {
  background-color: #ce673b;
  transition: 0.5s;
}

/* === ADIÇÃO SEGURA PARA O CALENDAR === */
:deep(.calendar-custom .p-inputtext) {
  background: transparent;
  border: 1px solid #ccc;
  border-radius: 5px;
  height: 50px;
  width: 100%;
  font-family: 'Poppins', sans-serif;
}

:deep(.calendar-custom .p-button) {
  background: transparent;
  border: none;
}

:deep(.calendar-custom),
:deep(.calendar-custom .p-inputtext),
:deep(.calendar-custom .p-datepicker-trigger) {
  width: 100% !important;
}

:deep(.calendar-custom .p-inputtext) {
  display: block;
}
</style>
