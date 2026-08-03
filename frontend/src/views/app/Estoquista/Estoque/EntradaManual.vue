<template>
  <div class="terminal-page">
    <div class="terminal-header">
      <div class="status-indicator">
        <div class="dot" :class="{ 'dot-active': !loading, 'dot-loading': loading }"></div>
        <span class="status-text">{{ loading ? 'PROCESSANDO...' : 'TERMINAL PRONTO' }}</span>
      </div>
      <h1 class="terminal-title">Entrada manual no estoque</h1>
    </div>

    <div class="console-wrapper">
      <div class="console-panel main-input-area">
        <div class="section-tag">DADOS OBRIGATÓRIOS</div>
        
        <div class="input-grid">
          <div class="field-group full">
            <label><i class="pi pi-barcode"></i> Código de Barras (*)</label>
            <inputDesktop
              maxlength="13"
              placeholder="Ex: 7894561230012..."
              v-model="item.codigo_barra"
              class="terminal-input highlight"
            />
          </div>

          <div class="field-group full">
            <label><i class="pi pi-box"></i> Quantidade (*)</label>
            <inputDesktop
              type="number"
              placeholder="0"
              v-model="item.quantidade"
              class="terminal-input"
            />
          </div>

          <div class="field-group " style="grid-column: 1 / -1;">
            <label>
              <i class="pi pi-money-bill"></i>
              Custo Unitário (*)
            </label>

            <InputNumber
              v-model="item.preco_custo"
              mode="currency"
              currency="BRL"
              locale="pt-BR"
              placeholder="R$ 0,00"
              inputClass="terminal-number"
              class="w-full"
            />

          </div>
        </div>

        <div class="section-tag mt-4">DETALHES DE LOGÍSTICA</div>
        
        <div class="input-grid">
          <div class="field-group">
            <label>Lote Identificador</label>
            <inputDesktop
              placeholder="Ex: LT-2024"
              v-model="loteMaiusculo"
              class="terminal-input secondary"
            />
          </div>

          <div class="field-group">
            <label>Data de Validade</label>
            <DatePicker
              v-model="item.data_validade"
              style="font-family: 'Poppins';"
              dateFormat="dd/mm/yy"
              placeholder="00/00/0000"
              :showIcon="true"
              class="terminal-date"
              fluid
            />
          </div>
        </div>

        <div class="section-tag mt-4">ORIGEM (FORNECEDOR)</div>
        
        <div class="input-grid">
          <div class="field-group">
            <label>CNPJ (*) </label>
            <inputDesktop
              data-maska="##.###.###/####-##"
              v-maska
              placeholder="00.000.000/0000-00"
              v-model="item.cnpj"
              class="terminal-input secondary"
            />
          </div>
          <div class="field-group">
            <label>Razão Social</label>
            <inputDesktop
              placeholder="Nome do Fornecedor"
              v-model="item.nome_fornecedor"
              class="terminal-input secondary"
            />
          </div>
        </div>
      </div>

      <div class="console-sidebar">
        <div class="summary-card">

          <div>
            <h3>Resumo da Operação</h3>
            <div class="summary-content">
              <div class="summary-line">
                <span>Itens:</span>
                <span class="bold">{{ item.quantidade || 0 }}</span>
              </div>
              <div class="summary-line" style="display: flex; align-items: center;">
                <span>Valor da entrada:</span>
                <span class="total-value">{{ formatCurrency((item.quantidade || 0) * (item.preco_custo || 0)) }}</span>
              </div>
            </div>
          </div>
          
          <div class="action-buttons">
            <Button
              style="border: solid 1px #CCC;"
              label="LIMPAR CONSOLE"
              icon="pi pi-trash"
              class="p-button-text btn-clear"
              @click="limparFormulario"
            />
            <Button
              label="REGISTRAR ENTRADA"
              icon="pi pi-send"
              class="btn-execute"
              :loading="loading"
              @click="processarEntrada"
            />
          </div>
        </div>

        <div class="instruction-box">
          <p><i class="pi pi-info-circle"></i> Os campos marcados com <b>(*)</b> são validados pelo kernel do sistema antes do envio.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import inputDesktop from '@/components/inputDesktop.vue'
import { Button, DatePicker, InputNumber } from 'primevue' 
import { api } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import exibeErro from '@/utils/ExibeErro'
import { vMaska } from "maska/vue"

export default {
  name: 'EntradaManualEstoque',
  components: { inputDesktop, Button, DatePicker, InputNumber },
  directives: { maska: vMaska },
  
  data() {
    return {
      loading: false,
      auth: null,
      item: {
        codigo_barra: null,
        quantidade: null,
        preco_custo: null,
        lote: "",
        data_validade: null,
        cnpj: null,
        nome_fornecedor: ""
      }
    }
  },

  computed:{
    loteMaiusculo:{
      get(){
        return this.item.lote ? this.item.lote.toUpperCase() : ""
      },
      set(valor){
        this.item.lote = valor.toUpperCase()
      }
    }
  },

  methods: {
    formatCurrency(value) {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    },

    limparFormulario() {
      this.item = {
        codigo_barra: null,
        quantidade: null,
        preco_custo: null,
        lote: "",
        data_validade: null,
        cnpj: null,
        nome_fornecedor: ""
      }
    },

    async processarEntrada() {
      // Validação Lógica Obrigatória
      if (!this.item.codigo_barra || !this.item.quantidade || !this.item.preco_custo || !this.item.cnpj) {
        this.$toast.info('Protocolo Incompleto: Preencha os campos obrigatórios.');
        return;
      }

      this.loading = true;
      try {
        const payload = {
          codigo_barra: this.item.codigo_barra,
          id_loja: this.auth.id_loja,
          lote: this.item.lote || null,
          quantidade: Number(this.item.quantidade),
          preco_custo: Number(this.item.preco_custo),
          data_validade: new Date(this.item.data_validade).getTime() || null,
          responsavel: this.auth.user.email,
          cnpj: this.item.cnpj || null,
          nome_fornecedor: this.item.nome_fornecedor || null
        };

        const status_rede = await window.electronAPI.getStatusRede()
        //Próximo passo, integrar com a função de entrada de produtos manuais e sincronizar N elementos que estão cmo sync 0
        //Alterar para sync 1. 
        //Fazer o mesmo processo com entradas por XML também. (Provavelmente vai precisar adicionar colunas)
        //Depois disso preciso fazer a da saída. 
        //Quando sincronizar vai ser entrada -> saída -> consulta itens estoque
        //Depois disso fazer com produtos cadastrados para não bloquear entradas com produtos não cadastrados
        //produtos cadastrados é onde armazeno e consulto o novo produto e produtos cadastrados só armazeno e sincronizo.
        //const status_rede = false

        if(status_rede){
          const payloadItems = [payload]

          const payloadEntrada = {
            arrayEntrada: payloadItems
          }
          
          await api.post(`/mvpu/estoque/entradaManualProduto`, payloadEntrada);
          this.$toast.success('Entrada Processada com Sucesso!');
          this.limparFormulario();
        }else{
          
          const payloadItems = [payload]
          const resultado = await window.electronAPI.setEntrada(payloadItems)

          if(resultado.erro == "PRODUTOS_NAO_CADASTRADOS"){
            this.$toast.info(`O produto ${resultado.naoCadastrados[0]} não está cadastrado.`);
            return
          }

          this.$toast.success('Entrada Processada com Sucesso!');
          this.limparFormulario();
        }
      } catch (e) {
        exibeErro(e, this.$toast);
      } finally {
        this.loading = false;
      }
    }
  },

  mounted() {
    this.auth = useAuthStore();
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Poppins:wght@300;400;600&display=swap');

.terminal-page {
  padding: 30px;
  background-color: #FFF;
  min-height: 100vh;
  font-family: 'Poppins', sans-serif;
}

/* Header Estilo Console */
.terminal-header {
  margin-bottom: 25px;
  border-left: 4px solid #FF8049;
  padding-left: 20px;
}

.terminal-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.terminal-title .version {
  font-size: 0.8rem;
  background: #e0e0e0;
  padding: 2px 8px;
  border-radius: 4px;
  vertical-align: middle;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: #7f8c8d;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.dot-active { background: #27ae60; box-shadow: 0 0 8px #27ae60; }
.dot-loading { background: #f1c40f; animation: blink 1s infinite; }

@keyframes blink { 50% { opacity: 0; } }

/* Layout Grid Console */
.console-wrapper {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 25px;
}

.console-panel {
  background: #ffffff;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.03);
  border: 1px solid #eaeeef;
}

.section-tag {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: #FF8049;
  font-weight: 700;
  margin-bottom: 20px;
  letter-spacing: 1px;
}

/* Inputs Customizados */
.input-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-group.full { grid-column: 1 / -1; }

.field-group label {
  font-size: 13px;
  font-weight: 600;
  color: #5d6d7e;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Estilização Profunda dos Componentes Prime e Custom */
:deep(.terminal-input input), 
:deep(.terminal-number input),
:deep(.terminal-date input) {
  height: 48px !important;
  border: 1.5px solid #d5dbdb !important;
  border-radius: 8px !important;
  transition: all 0.2s;
  font-family: 'Poppins', sans-serif;
}

:deep(.highlight input) {
  border-color: #FF8049 !important;
  background-color: #fff9f6 !important;
  font-weight: 600;
}

:deep(.terminal-input input:focus) {
  border-color: #FF8049 !important;
  box-shadow: 0 0 0 3px rgba(255, 128, 73, 0.1) !important;
}

/* Sidebar Estilo Dashboard */
.console-sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.summary-card {
  background: #2c3e50;
  height: 500px;
  color: white;
  border-radius: 12px;
  padding: 25px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  top: 20px;
}

.summary-line {
  display: flex;
  justify-content: space-between;
  margin: 15px 0;
  font-size: 14px;
}

.total-value {
  font-size: 1.4rem;
  font-weight: 700;
  color: #FF8049;
  display: block;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 25px;
}

.btn-execute {
  background: #FF8049 !important;
  border: none !important;
  height: 55px;
  font-weight: 600 !important;
  letter-spacing: 1px;
}

.btn-clear {
  color: #bdc3c7 !important;
  font-size: 12px !important;
}

.instruction-box {
  background: #ebf2f7;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #3498db;
  font-size: 12px;
  color: #5d6d7e;
  line-height: 1.6;
}

.mt-4 { margin-top: 2rem; }

.p-inputnumber {
  width: 100% !important;
  display: flex;
}

.p-inputnumber-input {
  width: 100% !important;
  flex: 1;
}
</style>