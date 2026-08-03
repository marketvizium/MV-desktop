<template>
  <div class="terminal-container">
    <header class="terminal-header">
      <div class="header-info">
        <TitileSubtitle
          title="Terminal de Saída"
          subtitle="Processamento de retirada de itens do inventário ativo."
        />
      </div>
      
      <div class="header-stats">
        <div class="stat-box">
          <span class="stat-label">ITENS NA FILA</span>
          <span class="stat-value">{{ itens.length }}</span>
        </div>
        <div class="stat-box highlight">
          <span class="stat-label">TOTAL QTD</span>
          <span class="stat-value">{{ totalQuantidade }}</span>
        </div>
      </div>
    </header>

    <main class="console-layout">
      <section class="items-terminal">
        <div class="table-header-labels">
          <span style="flex: 2">Código de Barras (*)</span>
          <span style="flex: 0.80">Qtd (*)</span>
          <span style="flex: 1.05">Lote (Opcional)</span>
          <span style="width: 45px"></span>
        </div>

        <transition-group name="list" tag="div" class="scroll-area">
          <div v-for="(item, index) in itens" :key="index" class="terminal-row">
            <div class="col" style="flex: 2">
              <inputDesktop
                maxlength="13"
                placeholder="Digite o código de barras aqui..."
                v-model="item.codigo_barra"
                class="input-focus-orange"
              />
            </div>

            <div class="col" style="flex: 0.8">
              <inputDesktop
                type="number"
                placeholder="0"
                v-model="item.quantidade"
              />
            </div>

            <div class="col" style="flex: 1.2">
              <inputDesktop
                placeholder="Lote"
                v-model="item.lote"
                class="secondary-input"
              />
            </div>

            <div class="row-actions">
              <button 
                v-if="itens.length > 1" 
                class="btn-icon remove" 
                @click="removerLinha(index)"
                title="Remover linha"
              >
                <span class="material-symbols-outlined">
                  delete
                </span>
              </button>
            </div>
          </div>
        </transition-group>

        <button class="add-line-btn" @click="adicionarLinha">
          <i class="pi pi-plus"></i> ADICIONAR NOVA LINHA
        </button>
      </section>

      <aside class="control-panel">
        <div class="panel-card">
          <h3 class="panel-title">Ações de Protocolo</h3>
          
          <div class="action-list">
            <Button
              style="width: 100%;"
              label="CONSULTAR ESTOQUE"
              class="p-button-outlined"
              @click="$router.push({ name: 'ConsultarProdutosEstoque' })"
            >
              CONSULTAR ESTOQUE
              <span class="material-symbols-outlined">
                search
              </span>
            </Button>
            
            <div class="divider"></div>

            <Button
              style=" width: 100%;"
              label="EFETIVAR SAÍDA"
              icon="pi pi-check-circle"
              class="btn-confirm w-full"
              :loading="loading"
              @click="enviarSaida"
            />
          </div>

          <div class="validation-info" style="color: #CCC;">
            <i class="pi pi-info-circle"></i>
            <span>Campos com <b>(*)</b> são obrigatórios para envio dos formulários.</span>
          </div>
        </div>
      </aside>
    </main>
  </div>
</template>

<script>
import TitileSubtitle from '@/components/TitileSubtitle.vue'
import inputDesktop from '@/components/inputDesktop.vue'
import { Button, DatePicker } from 'primevue'
import { api } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import exibeErro from '@/utils/ExibeErro'

export default {
  name: 'SaidaEstoque',
  components: { TitileSubtitle, inputDesktop, Button, DatePicker },

  data() {
    return {
      loading: false,
      auth: null,
      itens: [
        { codigo_barra: null, quantidade: null, lote: null, data_validade: null }
      ]
    }
  },

  computed: {
    totalQuantidade() {
      return this.itens.reduce((acc, curr) => acc + (Number(curr.quantidade) || 0), 0)
    }
  },

  methods: {
    adicionarLinha() {
      this.itens.push({ codigo_barra: null, quantidade: null, lote: null, data_validade: null })
    },

    removerLinha(index) {
      this.itens.splice(index, 1)
    },

    async enviarSaida() {
      // Validação lógica: Filtra apenas quem tem os campos mínimos
      const itensValidos = this.itens.filter(i => i.codigo_barra && i.quantidade)

      if (itensValidos.length === 0) {
        this.$toast.warn('Protocolo Rejeitado: Informe ao menos um produto válido.')
        return
      }

      this.loading = true

      const status_rede = await window.electronAPI.getStatusRede()
      //const status_rede = false


      try {
        const Arraysaidas = itensValidos.map(i => {
          const obj = {
            codigo_barra: i.codigo_barra,
            quantidade: Number(i.quantidade),
            responsavel: this.auth.user.email
          }
          if (i.lote) obj.lote = i.lote
          if (i.data_validade) obj.data_validade = new Date(i.data_validade).getTime()
          return obj
        })

        if(status_rede){
          await api.post(`/mvpu/estoque/saidaEstoque/${this.auth.id_loja}`, { Arraysaidas })
  
          this.$toast.success('Saída efetuada com sucesso!')
          this.itens = [{ codigo_barra: null, quantidade: null, lote: null, data_validade: null }]

        }else{

          const retornoSaida = await window.electronAPI.setSaida(Arraysaidas)

          console.log(retornoSaida)

          if (retornoSaida.erro === 'ESTOQUE_INSUFICIENTE') {

              // Mapeia os itens que falharam para criar uma mensagem legível    
              retornoSaida.detalhes.forEach((item)=>{
                this.$toast.info(`Produto ${item.codigo_barra}: solicitado ${item.solicitado}, disponível apenas ${item.disponivel}`)
              })

              return;
          }

          this.$toast.success('Saída efetuada com sucesso!')
          this.itens = [{ codigo_barra: null, quantidade: null, lote: null, data_validade: null }]
        }
      } catch (e) {
        exibeErro(e, this.$toast)
      } finally {
        this.loading = false
      }
    }
  },

  mounted() {
    this.auth = useAuthStore()
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500&family=Poppins:wght@400;500;600&display=swap');

.terminal-container {
  padding: 30px;
  background-color: #fff;
  min-height: 100vh;
  font-family: 'Poppins', sans-serif;
}

/* Header Estilo Console */
.terminal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
}

.header-stats {
  display: flex;
  gap: 15px;
}

.stat-box {
  background: #fff;
  padding: 10px 20px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  min-width: 120px;
}

.stat-box.highlight {
  border-color: #FF8049;
  background: #fffcfb;
}

.stat-label {
  font-size: 10px;
  font-weight: 700;
  color: #94a3b8;
  letter-spacing: 1px;
}

.stat-value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 1.4rem;
  color: #1e293b;
  font-weight: 500;
}

/* Layout */
.console-layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 25px;
}

/* Listagem de Itens */
.items-terminal {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
  border: 1px solid #e2e8f0;
}

.table-header-labels {
  display: flex;
  padding: 0 10px 15px;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
}

.terminal-row {
  display: flex;
  gap: 12px;
  padding: 10px;
  border-bottom: 1px solid #f1f5f9;
  align-items: center;
}

.terminal-row:hover {
  background-color: #f8fafc;
}

/* Customização de Inputs */
:deep(.input-focus-orange input:focus) {
  border-color: #FF8049 !important;
  box-shadow: 0 0 0 2px rgba(255, 128, 73, 0.1) !important;
}

:deep(.secondary-input input) {
  background-color: #fcfcfc;
}

:deep(.terminal-datepicker .p-inputtext) {
  height: 50px !important;
  font-size: 14px;
}

/* Botões de Ação de Linha */
.btn-icon {
  width: 35px;
  height: 35px;
  border-radius: 6px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon.remove {
  background: #f1f5f9;
  color: #94a3b8;
}

.btn-icon.remove:hover {
  background: #fee2e2;
  color: #ef4444;
}

.add-line-btn {
  width: 100%;
  margin-top: 15px;
  padding: 12px;
  border: 2px dashed #e2e8f0;
  background: transparent;
  color: #64748b;
  font-weight: 600;
  font-size: 13px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.add-line-btn:hover {
  border-color: #FF8049;
  color: #FF8049;
  background: #fffcfb;
}

/* Painel Lateral */
.panel-card {
  background: #1e293b;
  border-radius: 12px;
  padding: 25px;
  color: #fff;
  position: sticky;
  top: 20px;
}

.panel-title {
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.divider {
  height: 1px;
  background: rgba(255,255,255,0.1);
  margin: 20px 0;
}

.btn-confirm {
  background-color: #FF8049 !important;
  border: none !important;
  height: 50px;
  font-weight: 600 !important;
}

.validation-info {
  margin-top: 25px;
  font-size: 11px;
  color: #94a3b8;
  display: flex;
  gap: 8px;
  line-height: 1.5;
}

/* Animações de Lista */
.list-enter-active, .list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from, .list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.p-button-outlined{
  color: #FFF !important;
  border: solid 1px #ccc !important;
}

p-button-outlined:hover{
  background-color: #5f5f5f !important;
  color: #555 !important;
}

@media (max-width: 1024px) {
  .console-layout { grid-template-columns: 1fr; }
  .control-panel { order: -1; }
}
</style>