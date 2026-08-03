<template>
  <div class="card">
    <div class="table-header">
      <div class="search-box">
        <i class="pi pi-search"></i>
        <input
          type="text"
          placeholder="Pesquisar composição ou código de barras..."
          v-model="search"
        />
      </div>

      <div class="actions-right">
        </div>
    </div>

    <DataTable
      v-if="!loading && composicoesFiltradas.length > 0"
      :value="composicoesPaginadas"
      dataKey="codigo_barra_comp"
      responsiveLayout="scroll"
      stripedRows
      rowHover
    >
      <Column header="Cód. Barras Produto">
        <template #body="{ data }">
          <span  style="color: #222;" class="barcode-text">{{ data.codigo_barra_prod }}</span>
        </template>
      </Column>

      <Column header="Cód. Barras Composição">
        <template #body="{ data }">
          <span class="barcode-text text-secondary">{{ data.codigo_barra_comp }}</span>
        </template>
      </Column>

      <Column header="Nome da Composição">
        <template #body="{ data }">
          <span class="font-bold text-dark">{{ data.nome_composicao }}</span>
        </template>
      </Column>

      <Column header="Quantidade">
        <template #body="{ data }">
          <span class="qty-badge">{{ data.quantidade }}</span>
        </template>
      </Column>

      <Column header="Ações" style="width:140px">
        <template #body="{ data }">
          <div style="display:flex; gap:8px; justify-content:flex-start; padding-right: 20px;">
            <Button
              rounded
              text
              style="color: #555;"
              @click="editarComposicao(data)"
            >
              <span class="material-symbols-outlined">edit</span>
            </Button>

            <Button
              rounded
              text
              style="color: #555;"
              @click="confirmarDelete(data)"
            >
              <span class="material-symbols-outlined">delete</span>
            </Button>
          </div>
        </template>
      </Column>
    </DataTable>

    <div v-if="totalPaginas > 1 && !loading" class="pagination-container">
      <div class="pagination-content">
        <Button 
          icon="pi pi-chevron-left" 
          @click="paginaAtual--" 
          :disabled="paginaAtual === 1" 
          class="nav-btn"
        />
        <div class="page-info">
          Página <span class="current-page">{{ paginaAtual }}</span> de <b>{{ totalPaginas }}</b>
        </div>
        <Button 
          icon="pi pi-chevron-right" 
          @click="paginaAtual++" 
          :disabled="paginaAtual === totalPaginas" 
          class="nav-btn"
        />
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="4" />
      <span class="muted mt-2">Buscando composições...</span>
    </div>

    <div v-else-if="!loading && (composicoes.length === 0 || composicoesFiltradas.length === 0)" class="empty-container">
      <img src="../assets/img/Programming.gif" alt="Sem dados" class="empty-img" />
      <div class="poppins-regular">Não foram encontrados resultados para a sua busca...</div>
    </div>

    <Dialog
      v-model:visible="showConfirmDelete"
      modal
      style="font-family: 'Poppins';"
      header="Excluir Composição"
      :style="{ width: '420px' }"
      :closable="false"
      class="poppins-bold"
    >
      <div class="content">
        <div style="display: flex; justify-content: space-between; font-size: 13px; gap: 15px;">
          <div style="color: #333; width: 100%;">
            <div style="margin-bottom: 5px;"> Cód. Composição:</div>
            <div> Nome:</div>
          </div>
          <div style="font-weight: 550; color: #333; width: 100%; text-align: end;">
            <div style="margin-bottom: 5px;"> {{ itemSelecionado?.codigo_barra_comp }} </div>
            <div> {{ itemSelecionado?.nome_composicao }}</div>
          </div>
        </div>
        <div style="display: flex; justify-content: center; margin: 0;">
          <img src="../assets/Thinking face-rafiki.png" width="280px" alt="Confirmação">
        </div>
        <p class="poppins-regular" style="text-align: center; margin-bottom: 20px;">
          Tem certeza que deseja excluir esta composição?
        </p>
      </div>
      <template #footer>
        <Button label="Cancelar" style="background-color: #555; border: none" @click="showConfirmDelete = false" />
        <Button label="Excluir" severity="danger" :loading="loadingDelete" @click="excluirComposicao" />
      </template>
    </Dialog>

    <Dialog
      v-model:visible="showEditar"
      style="font-family: 'Poppins';"
      modal
      class="saas-dialog"
      header="Editar Composição"
      :style="{ width: '500px' }"
    >
      <div style="display: flex; flex-direction: column; gap: 15px; margin-top: 10px;">
        <div style="display: flex; flex-direction: column;">
          <label style="font-size: 14px; font-weight: 500;">Nome da Composição (*)</label>
          <input 
            v-model="itemSelecionado.nome_composicao"
            style="width: 100%; height: 40px; padding: 8px; margin-top: 8px; border: solid 1px #CCC; border-radius: 5px;"
            type="text"
          >
        </div>
        <div style="display: flex; flex-direction: column;">
          <label style="font-size: 14px; font-weight: 500;">Quantidade (*)</label>
          <input 
            v-model="itemSelecionado.quantidade"
            style="width: 100%; height: 40px; padding: 8px; margin-top: 8px; border: solid 1px #CCC; border-radius: 5px;"
            type="number"
          >
        </div>
      </div>
      <template #footer>
        <div style="display: flex; justify-content: end; margin-top: 10px;">
          <button 
            @click="salvarEdicao"
            style="background-color: #ff8049; padding: 10px 20px; color: #FFF; border: none; border-radius: 10px; cursor: pointer; font-weight: 600;">
            Salvar Alterações
          </button>
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script>
import { api } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import exibeErro from '@/utils/ExibeErro'
import ProgressSpinner from 'primevue/progressspinner'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'

export default {
  name: 'TabelaComposicoes',
  components: { ProgressSpinner, DataTable, Column, Button, Dialog },

  data() {
    return {
      search: '',
      loading: false,
      loadingDelete: false,
      showConfirmDelete: false,
      showEditar: false,
      itemSelecionado: {
        nome_composicao: '',
        quantidade: 0
      },
      composicoes: [],
      auth: null,
      paginaAtual: 1,
      itensPorPagina: 15 
    }
  },

  computed: {
    composicoesFiltradas() {
      const searchLower = this.search.toLowerCase()
      return this.composicoes.filter(item =>
        item.nome_composicao.toLowerCase().includes(searchLower) ||
        item.codigo_barra_prod.includes(searchLower) ||
        item.codigo_barra_comp.includes(searchLower)
      )
    },
    composicoesPaginadas() {
      const inicio = (this.paginaAtual - 1) * this.itensPorPagina
      return this.composicoesFiltradas.slice(inicio, inicio + this.itensPorPagina)
    },
    totalPaginas() {
      return Math.ceil(this.composicoesFiltradas.length / this.itensPorPagina) || 1
    }
  },

  methods: {
    editarComposicao(item) {
      this.itemSelecionado = { ...item };
      this.showEditar = true;
    },
    confirmarDelete(item) {
      this.itemSelecionado = item;
      this.showConfirmDelete = true;
    },

    async excluirComposicao() {
      try {
        this.loadingDelete = true;
        this.auth = useAuthStore();

        await api.delete(`/mvpu/produto/deletarAssociado/${this.auth.id_loja}`, {
          data: this.itemSelecionado
        });

        this.$toast.success('Composição excluída com sucesso');
        this.showConfirmDelete = false;
        await this.receberTodos();
      } catch (e) {
        exibeErro(e, this.$toast);
      } finally {
        this.loadingDelete = false;
      }
    },

    async salvarEdicao() {
      if (!this.itemSelecionado.nome_composicao || !this.itemSelecionado.quantidade) {
        this.$toast.warn('Preencha os campos obrigatórios');
        return;
      }
      try {
        this.auth = useAuthStore();

        await api.put(`/mvpu/produto/editarAssociado/${this.auth.id_loja}`, this.itemSelecionado);

        this.$toast.success('Produto associado atualizado com sucesso!');
        this.showEditar = false;
        await this.receberTodos();
      } catch (e) {
        exibeErro(e, this.$toast);
      }
    },

    async receberTodos() {
      try {
        this.loading = true;
        this.auth = useAuthStore();
        //const { data } = await api.get(`/mvpu/produto/consultarComposicao/${this.auth.id_loja}`);
        console.log('a')
        const { data } = await api.get(`/mvpu/produto/consultarComposicao/${this.auth.id_loja}`);
        this.composicoes = data.data || [];
        console.log('b')

      } catch (e) {
        this.composicoes = [];
        exibeErro(e, this.$toast);
      } finally {
        console.log('c')
        this.loading = false;
      }
    }
  },

  mounted() {
    this.receberTodos();
  }
}
</script>

<style scoped>
.card { background: #ffffff; border-radius: 12px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); min-height: 400px; }
.table-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.search-box { display: flex; align-items: center; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 16px; gap: 12px; width: 100%; max-width: 450px; }
.search-box input { border: none; outline: none; background: transparent; width: 100%; font-size: 14px; color: #1e293b; }
.search-box i { color: #94a3b8; }

.barcode-text { font-family: monospace; font-weight: 600; color: #4f46e5; }
.text-secondary { color: #94a3b8; }
.text-dark { color: #1e293b; }
.qty-badge { background: #f1f5f9; padding: 4px 10px; border-radius: 6px; font-weight: 700; color: #475569; font-size: 13px; }

.pagination-container { display: flex; justify-content: center; margin-top: 32px; padding-bottom: 10px; }
.pagination-content { display: flex; align-items: center; gap: 16px; background: #f8fafc; padding: 6px 12px; border-radius: 50px; border: 1px solid #e2e8f0; }

.nav-btn {
  width: 36px !important; height: 36px !important;
  background: #f97316 !important; border: none !important; border-radius: 50% !important;
  color: #ffffff !important; display: flex !important; align-items: center !important; justify-content: center !important;
}
.nav-btn:disabled { background: #fed7aa !important; opacity: 0.7; }

.loading-container, .empty-container { display: flex; flex-direction: column; align-items: center; padding: 60px 0; }
.empty-img { max-width: 180px; margin-bottom: 16px; }

:deep(.p-datatable-tbody > tr > td) { padding: 12px 10px !important; }

/* Base da bolinha */
.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
  /* Define a animação: nome | duração | timing | repetição */
  animation: pulse-subtle 2s infinite ease-in-out;
}

/* Cor Verde (Sync) */
.dot-green {
  background-color: #22c55e;
  box-shadow: 0 0 5px rgba(34, 197, 94, 0.5);
}

/* Cor Vermelha (Not Sync) */
.dot-red {
  background-color: #ef4444;
  box-shadow: 0 0 5px rgba(239, 68, 68, 0.5);
}


.text-muted { color: #64748b; font-size: 13px; }

/* Animação de aumentar e diminuir sutilmente */
@keyframes pulse-subtle {
  0% {
    transform: scale(0.9);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.15); /* Aumenta sutilmente */
    opacity: 1;
  }
  100% {
    transform: scale(0.9);
    opacity: 0.7;
  }
}

</style>