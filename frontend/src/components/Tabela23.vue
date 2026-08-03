<template>
  <div class="card">
    <div class="table-header">
      <div class="header-info">
        <h2 class="table-title">Minha Equipe</h2>
        <p class="table-subtitle">Gerencie os vendedores associados à sua loja</p>
      </div>
      <div class="search-box">
        <i class="pi pi-search"></i>
        <input 
          type="text" 
          v-model="filtro" 
          placeholder="Pesquisar na minha equipe..." 
        />
      </div>
    </div>

    <DataTable
      v-if="!loading && vendedoresFiltrados.length > 0"
      :value="vendedoresFiltrados"
      dataKey="id_vendedor"
      responsiveLayout="scroll"
      stripedRows
      rowHover
      removableSort
      v-model:expandedRows="expandedRows"
    >
      <Column expander style="width: 3rem" />

      <Column header="Vendedor">
        <template #body="{ data }">
          <div class="perfil">
            <template v-if="data.foto_perfil">
              <img
                :src="data.foto_perfil"
                alt=""
                style="
                  width: 50px;
                  height: 50px;
                  border-radius: 50%;
                  object-fit: cover;
                  object-position: center;
                  display: block;
                "
              >
            </template>

            <template v-else>
              <div
                style="
                  width: 50px;
                  height: 50px;
                  border-radius: 50%;
                  background: #d1d5db;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                "
              ></div>
            </template>
            <div>
              <div class="nome">{{ data.nome }}</div>
              <div class="email">{{ data.email }}</div>
            </div>
          </div>
        </template>
      </Column>

      <Column field="nome_usuario" header="Usuário" sortable />

      <Column header="Localização">
        <template #body="{ data }">
          <span class="text-sm">{{ data.cidade }} - {{ data.estado }}</span>
        </template>
      </Column>

      <Column header="Status">
        <template #body="{ data }">
          <Tag
            :value="data.status_conta"
            :severity="data.status_conta === 'ativo' ? 'success' : 'danger'"
          />
        </template>
      </Column>

      <Column header="Ações" bodyStyle="text-align: right">
        <template #body="{ data }">
          <Button 
            label="Remover Vendedor" 
            icon="pi pi-user-minus" 
            class="btn-desassociar"
            outlined
            severity="danger"
            size="small"
            @click="confirmarRemocao(data)"
          />
        </template>
      </Column>

      <template #expansion="{ data }">
        <div class="detalhes">
          <div class="grid">
            <div class="info-stat">
                <span class="label">Produtos</span>
                <span class="stat-val">{{ data.num_produtos }}</span>
            </div>
            <div class="info-stat">
                <span class="label">Vendas</span>
                <span class="stat-val">{{ data.num_vendas }}</span>
            </div>
            <div class="info-stat">
                <span class="label">Cotações</span>
                <span class="stat-val">{{ data.num_cotacoes }}</span>
            </div>
            <div class="info-stat">
                <span class="label">Avaliação Média</span>
                <span class="stat-val">{{ data.avaliacao_media || 0 }} ⭐</span>
            </div>
          </div>
          <div class="detalhe-item mt-4">
            <span class="label">Especialidades</span>
            <span class="value-text">{{ data.especialidades || 'Não informada' }}</span>
          </div>
        </div>
      </template>
    </DataTable>

    <div v-if="loading" class="loading-container">
      <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="4" />
      <span class="muted mt-2">Carregando sua equipe...</span>
    </div>

    <div v-else-if="!loading && vendedoresFiltrados.length === 0" class="empty-container">
      <img src="../assets/img/Programming.gif" alt="Sem dados" class="empty-img" />
      <div class="poppins-regular">Você ainda não possui vendedores associados.</div>
    </div>

    <Dialog 
      v-model:visible="displayConfirmation" 
      header="Confirmar Remoção" 
      :modal="true" 
      :style="{ width: '350px' }"
    >
      <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem; color: #ef4444" />
        <span v-if="vendedorParaRemover">
          Deseja realmente remover <b>{{ vendedorParaRemover.nome }}</b> da sua equipe?
        </span>
      </div>
      <template #footer>
        <Button label="Cancelar" icon="pi pi-times" @click="displayConfirmation = false" class="p-button-text" />
        <Button 
          label="Sim, Remover" 
          icon="pi pi-check" 
          @click="desassociarVendedor" 
          class="p-button-danger" 
          :loading="loadingRemocao" 
          autofocus 
        />
      </template>
    </Dialog>
  </div>
</template>

<script>
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Avatar from 'primevue/avatar'
import Button from 'primevue/button'
import ProgressSpinner from 'primevue/progressspinner'
import Dialog from 'primevue/dialog'
import exibeErro from '@/utils/ExibeErro'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/services/api'

export default {
  name: 'TabelaMinhaEquipe',
  components: { DataTable, Column, Tag, Avatar, ProgressSpinner, Button, Dialog },

  data() {
    return {
      expandedRows: [],
      auth: null,
      vendedores: [], 
      loading: false,
      filtro: '',
      // Estados do Modal
      displayConfirmation: false,
      vendedorParaRemover: null,
      loadingRemocao: false
    }
  },

  computed: {
    vendedoresFiltrados() {
      if (!this.filtro) return this.vendedores;
      const termo = this.filtro.toLowerCase();
      return this.vendedores.filter(v => 
        v.nome?.toLowerCase().includes(termo) || 
        v.nome_usuario?.toLowerCase().includes(termo)
      );
    }
  },

  methods: {
    async getVendedoresDaLoja() {
      try {
        this.loading = true;
        this.auth = useAuthStore();
        const res = await api.get(`/mvpu/usuario/consultarVendedores/${this.auth.id_loja}`);

        console.log(res)

        this.vendedores = res.data.data || [];
      } catch (e) {
        exibeErro(e, this.$toast);
      } finally {
        this.loading = false;
      }
    },

    confirmarRemocao(vendedor) {
      this.vendedorParaRemover = vendedor;
      this.displayConfirmation = true;
    },

    async desassociarVendedor() {
      if (!this.vendedorParaRemover) return;
      
      try {
        this.loadingRemocao = true;
        await api.delete(`/mvpu/usuario/desassociarVendedor/${this.auth.id_loja}`, {
          data: { id_vendedor: this.vendedorParaRemover.id_vendedor }
        });
        
        // Remove da lista local para atualizar a UI sem novo GET
        this.vendedores = this.vendedores.filter(v => v.id_vendedor !== this.vendedorParaRemover.id_vendedor);
        
        this.$toast.success("Vendedor removido da equipe.");
        this.displayConfirmation = false;
      } catch (e) {
        exibeErro(e, this.$toast);
      } finally {
        this.loadingRemocao = false;
        this.vendedorParaRemover = null;
      }
    }
  },

  mounted() {
    this.getVendedoresDaLoja();
  }
}
</script>

<style scoped>
.card {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 15px;
}

.table-title { font-size: 1.25rem; font-weight: 700; color: #1e293b; margin: 0; }
.table-subtitle { font-size: 0.875rem; color: #64748b; margin: 4px 0 0 0; }

.search-box {
  display: flex;
  align-items: center;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 10px 16px;
  gap: 12px;
  width: 100%;
  max-width: 350px;
}

.search-box input {
  border: none;
  outline: none;
  background: transparent;
  width: 100%;
  font-size: 14px;
}

.btn-desassociar { border-radius: 8px !important; font-weight: 600 !important; }

/* PERFIL */
.perfil { display: flex; align-items: center; gap: 12px; }
.avatar { background: #f1f5f9; color: #5A0F83; font-weight: bold; }
.nome { font-weight: 700; font-size: 14px; color: #1e293b; }
.email { font-size: 12px; color: #64748b; }

/* EXPANSÃO */
.detalhes { padding: 20px; background: #fcfcfd; border-radius: 10px; border: 1px solid #f1f5f9; }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 20px; }
.label { display: block; font-size: 10px; text-transform: uppercase; color: #94a3b8; font-weight: 800; margin-bottom: 4px; }
.stat-val { font-size: 16px; font-weight: 700; color: #1e293b; }
.value-text { font-size: 13px; color: #334155; }

/* MODAL */
.confirmation-content { display: flex; align-items: center; padding: 1rem 0; }

.loading-container, .empty-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 60px 0;
}
.empty-img { max-width: 150px; margin-bottom: 16px; }
.mt-4 { margin-top: 1.5rem; }
</style>