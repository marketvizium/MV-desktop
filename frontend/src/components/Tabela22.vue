<template>
  <div class="card">
    <div class="table-header">
      <div class="search-box">
        <i class="pi pi-search"></i>
        <input 
          type="text" 
          v-model="filtro" 
          placeholder="Buscar por nome ou usuário no sistema..." 
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
            <Avatar icon="pi pi-user" shape="circle" class="avatar" />
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

      <Column header="Avaliação">
        <template #body="{ data }">
          <span class="font-bold">{{ data.avaliacao_media || 0 }} ⭐</span>
          <span class="muted ml-1">({{ data.num_avaliacoes }})</span>
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

      <Column header="Ações" headerStyle="text-align: center" bodyStyle="text-align: center">
        <template #body="{ data }">
          <Button 
            v-if="!isAssociado(data.id_vendedor)"
            label="Associar" 
            icon="pi pi-plus" 
            class="btn-associar"
            size="small"
            @click="associarVendedor(data.id_vendedor)"
            :loading="loadingAcao === data.id_vendedor"
          />
          <Button 
            v-else
            label="Desassociar" 
            icon="pi pi-user-minus" 
            class="btn-desassociar"
            outlined
            severity="danger"
            size="small"
            @click="desassociarVendedor(data.id_vendedor)"
            :loading="loadingAcao === data.id_vendedor"
          />
        </template>
      </Column>

      <template #expansion="{ data }">
        <div class="detalhes">
          <div class="detalhe-item">
            <span class="label">Especialidades</span>
            <span class="value-text">{{ data.especialidades || 'Não informada' }}</span>
          </div>
          <div class="detalhe-item">
            <span class="label">Descrição</span>
            <span class="value-text">{{ data.desc_perfil || 'Sem descrição.' }}</span>
          </div>
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
                <span class="label">Taxa Resposta</span>
                <span class="stat-val">{{ data.taxa_resposta }}%</span>
            </div>
          </div>
        </div>
      </template>
    </DataTable>

    <div v-if="loading" class="loading-container">
      <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="4" />
      <span class="muted mt-2">Carregando vendedores...</span>
    </div>

    <div v-else-if="!loading && vendedoresFiltrados.length === 0" class="empty-container">
      <img src="../assets/img/Programming.gif" alt="Sem dados" class="empty-img" />
      <div class="poppins-regular">Nenhum vendedor encontrado...</div>
    </div>
  </div>
</template>

<script>
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Avatar from 'primevue/avatar'
import Button from 'primevue/button'
import ProgressSpinner from 'primevue/progressspinner'
import exibeErro from '@/utils/ExibeErro'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/services/api'

export default {
  name: 'TabelaVendedores',
  components: { DataTable, Column, Tag, Avatar, ProgressSpinner, Button },

  data() {
    return {
      expandedRows: [],
      auth: null,
      vendedores: [], // Todos os vendedores do sistema
      vendedoresDaLojaIds: new Set(), // IDs dos que já estão associados
      loading: false,
      loadingAcao: null, // Controla o loading individual do botão
      filtro: ''
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
    isAssociado(id) {
      return this.vendedoresDaLojaIds.has(id);
    },

    async carregarDadosIniciais() {
      try {
        this.loading = true;
        this.auth = useAuthStore();
        
        // Chamadas paralelas para performance
        await Promise.all([
          this.getTodosVendedores(),
          this.getVendedoresDaLoja()
        ]);
      } catch (e) {
        exibeErro(e, this.$toast);
      } finally {
        this.loading = false;
      }
    },

    async getTodosVendedores() {
      const res = await api.post(`/mvpu/usuario/buscarVendedor/`, {});
      this.vendedores = res.data.data || [];
    },

    async getVendedoresDaLoja() {
      const res = await api.get(`/mvpu/usuario/consultarVendedores/${this.auth.id_loja}`);
      const associados = res.data.data || [];
      // Armazenamos apenas os IDs para comparação rápida
      this.vendedoresDaLojaIds = new Set(associados.map(v => v.id_vendedor));
    },

    async associarVendedor(idVendedor) {
      try {
        this.loadingAcao = idVendedor;
        await api.post(`/mvpu/usuario/associarVendedor/${this.auth.id_loja}`, {
          id_vendedor: idVendedor
        });
        
        this.vendedoresDaLojaIds.add(idVendedor);
        this.$toast.success("Vendedor associado à sua loja com sucesso!")
      } catch (e) {
        exibeErro(e, this.$toast);
      } finally {
        this.loadingAcao = null;
      }
    },

    async desassociarVendedor(idVendedor) {
      try {
        this.loadingAcao = idVendedor;
        // DELETE costuma enviar payload no config.data no Axios ou como params, conforme sua API
        await api.delete(`/mvpu/usuario/desassociarVendedor/${this.auth.id_loja}`, {
          data: { id_vendedor: idVendedor }
        });
        
        this.vendedoresDaLojaIds.delete(idVendedor);
        this.$toast.success("Vendedor desassociado da sua loja.")
      } catch (e) {
        exibeErro(e, this.$toast);
      } finally {
        this.loadingAcao = null;
      }
    }
  },

  mounted() {
    this.carregarDadosIniciais();
  }
}
</script>

<style scoped>
.card {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  min-height: 400px;
}

/* HEADER & SEARCH */
.table-header {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 24px;
}

.search-box {
  display: flex;
  align-items: center;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 10px 16px;
  gap: 12px;
  width: 100%;
  max-width: 450px;
}

.search-box input {
  border: none;
  outline: none;
  background: transparent;
  width: 100%;
  font-size: 14px;
  color: #1e293b;
}

.search-box i { color: #94a3b8; }

/* BOTÕES DE AÇÃO */
.btn-associar {
  background: #5A0F83 !important;
  border-color: #5A0F83 !important;
  border-radius: 8px !important;
  font-weight: 600 !important;
}

.btn-desassociar {
  border-radius: 8px !important;
  font-weight: 600 !important;
}

/* PERFIL */
.perfil {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  background: #f1f5f9;
  color: #5A0F83;
  font-weight: bold;
}

.nome { font-weight: 700; font-size: 14px; color: #1e293b; }
.email { font-size: 12px; color: #64748b; }

/* DETALHES EXPANSÃO */
.detalhes {
  padding: 20px;
  background: #fcfcfd;
  border-radius: 10px;
  border: 1px solid #f1f5f9;
}

.detalhe-item { margin-bottom: 16px; }

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 20px;
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #f1f5f9;
}

.label {
  display: block;
  font-size: 10px;
  text-transform: uppercase;
  color: #94a3b8;
  font-weight: 800;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.value-text {
  font-size: 13px;
  color: #334155;
  line-height: 1.5;
}

.stat-val {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
}

.muted { color: #94a3b8; }
.ml-1 { margin-left: 4px; }
.text-sm { font-size: 13px; }

/* LOADING & EMPTY */
.loading-container, .empty-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 60px 0;
}
.empty-img { max-width: 180px; margin-bottom: 16px; opacity: 0.8; }
</style>