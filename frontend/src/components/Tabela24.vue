<template>
  <div class="card">
    <div class="table-header">
      <div class="search-box">
        <span class="material-symbols-outlined">search</span>
        <input 
          type="text" 
          v-model="filtro" 
          placeholder="Buscar por nome, e-mail ou CPF..." 
        />
      </div>
    </div>

    <DataTable
      v-if="!loading && colaboradoresFiltrados.length > 0"
      :value="colaboradoresFiltrados"
      dataKey="id_usuario"
      responsiveLayout="scroll"
      stripedRows
      rowHover
      v-model:expandedRows="expandedRows"
    >
      <Column expander style="width: 3rem" />

      <Column header="Colaborador">
        <template #body="{ data }">
          <div class="perfil">
            <Avatar v-if="!data.foto" :image="data.foto" icon="pi pi-user" shape="circle" class="avatar" />
            <img v-else :src="data.foto" alt="" style="width: 35px; height: 35px; border-radius: 50px;">
            <div>
              <div class="nome">{{ data.nome }}</div>
              <div class="email">{{ data.email }}</div>
            </div>
          </div>
        </template>
      </Column>

      <Column field="cpf" header="CPF" />

      <Column header="Função">
        <template #body="{ data }">
          <Tag
            :value="getLabelNivel(data.nivel)"
            :class="'tag-' + (data.nivel === 4 ? 'estoque' : 'caixa')"
          />
        </template>
      </Column>

      <Column header="Ações" headerStyle="width: 10rem; text-align: center" bodyStyle="text-align: center">
        <template #body="{ data }">
          <div class="acoes-buttons">
            <!--
              <button class="btn-action edit" @click="abrirEdicao(data)" title="Editar">
                <span class="material-symbols-outlined">edit_square</span>
              </button>
            -->
            <button class="btn-action delete" @click="confirmarDeletar(data)" title="Excluir">
              <span class="material-symbols-outlined">delete</span>
            </button>
          </div>
        </template>
      </Column>

      <template #expansion="{ data }">
        <div class="detalhes-container">
          <div class="detalhes-grid">
            <div class="info-group">
              <span class="info-label">Contato Direto</span>
              <span class="info-value"><i class="pi pi-whatsapp"></i> {{ data.celular }}</span>
            </div>
            <div class="info-group">
              <span class="info-label">Localização</span>
              <span class="info-value">{{ data.rua }}</span>
              <span class="info-subvalue">{{ data.cidade }} - {{ data.estado }} ({{ data.cep }})</span>
            </div>
            <div class="info-group">
              <span class="info-label">Data de Cadastro</span>
              <span class="info-value">{{ formatarData(data.data_criacao) }}</span>
            </div>
          </div>
        </div>
      </template>
    </DataTable>

    <div v-if="loading" class="state-container">
      <ProgressSpinner style="width: 40px; height: 40px" strokeWidth="4" />
      <span class="muted">Sincronizando colaboradores...</span>
    </div>

    <div v-else-if="!loading && colaboradoresFiltrados.length === 0" class="state-container">
      <span class="material-symbols-outlined empty-icon">group_off</span>
      <div class="poppins-regular">Nenhum registro encontrado</div>
    </div>

    <Dialog style="font-family: 'Poppins'" v-model:visible="modalEdicao" header="Editar Colaborador" :modal="true" class="modal-custom" :style="{width: '500px'}">
      <div class="form-container">
        <div class="field">
          <label>Nome</label>
          <InputText v-model="selectedColab.nome" />
        </div>
        <div class="field">
          <label>E-mail</label>
          <InputText v-model="selectedColab.email" />
        </div>
        <div class="field-row">
          <div class="field">
            <label>Celular</label>
            <InputText v-model="selectedColab.celular" v-maska="'(##) #####-####'" />
          </div>
          <div class="field">
            <label>Função</label>
            <Dropdown v-model="selectedColab.nivel" :options="niveis" optionLabel="label" optionValue="value" />
          </div>
        </div>
      </div>
      <template #footer>
        <Button label="Cancelar" class="p-button-text" @click="modalEdicao = false" />
        <Button label="Salvar" class="btn-confirm" @click="salvarEdicao" :loading="loadingAcao" />
      </template>
    </Dialog>

    <Dialog style="font-family: 'Poppins'" v-model:visible="modalDelete" header="Atenção" :modal="true" :style="{width: '350px'}">
      <div class="delete-confirm">
        <span class="material-symbols-outlined warning-icon">warning</span>
        <p>Deseja realmente remover <strong>{{ selectedColab.nome }}</strong> do sistema?</p>
      </div>
      <template #footer>
        <Button label="Manter" class="p-button-text" @click="modalDelete = false" />
        <Button label="Sim, Remover" class="p-button-danger p-button-raised" @click="deletarColaborador" :loading="loadingAcao" />
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
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import ProgressSpinner from 'primevue/progressspinner'
import { vMaska } from "maska/vue"
import { api } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import exibeErro from '@/utils/ExibeErro'

export default {
  name: 'TabelaColaboradores',
  directives: { maska: vMaska },
  components: { DataTable, Column, Tag, Avatar, Button, Dialog, InputText, Dropdown, ProgressSpinner },

  data() {
    return {
      colaboradores: [],
      expandedRows: [],
      filtro: '',
      loading: false,
      loadingAcao: false,
      modalEdicao: false,
      modalDelete: false,
      selectedColab: {},
      niveis: [
        { label: 'Estoquista', value: 4 },
        { label: 'Operador de Caixa', value: 3 },
        { label: 'Supervisor', value: 6 },
        { label: 'Operador', value: 7 },
      ]
    }
  },

  computed: {
    colaboradoresFiltrados() {
      if (!this.filtro) return this.colaboradores;
      const t = this.filtro.toLowerCase();
      return this.colaboradores.filter(c => 
        c.nome?.toLowerCase().includes(t) || c.email?.toLowerCase().includes(t) || c.cpf?.includes(t)
      );
    }
  },

  methods: {
    getLabelNivel(n) { return this.niveis.find(i => i.value === n)?.label || 'Usuário'; },
    formatarData(d) { return new Date(d).toLocaleDateString('pt-BR'); },

    async carregarColaboradores() {
      this.loading = true;
      const auth = useAuthStore();
      try {
        const res = await api.get(`/mvpu/usuario/consultarColabs/${auth.id_loja}`);
        this.colaboradores = res.data.data || [];
      } catch (e) { exibeErro(e, this.$toast); }
      finally { this.loading = false; }
    },

    abrirEdicao(c) { this.selectedColab = { ...c }; this.modalEdicao = true; },
    confirmarDeletar(c) { this.selectedColab = c; this.modalDelete = true; },

    async salvarEdicao() {
      this.loadingAcao = true;
      try {
        await api.put(`/mvpu/usuario/atualizarColab/${this.selectedColab.id_usuario}`, this.selectedColab);
        this.$toast.success("Dados atualizados!");
        this.modalEdicao = false;
        this.carregarColaboradores();
      } catch (e) { exibeErro(e, this.$toast); }
      finally { this.loadingAcao = false; }
    },

    async deletarColaborador() {
      this.loadingAcao = true;

      try {

        console.log(this.selectedColab, "AAAAAAAAAAAA")
        const auth = useAuthStore()
        await api.delete(
            `/mvpu/usuario/deletarColab/${this.selectedColab.email}/${auth.id_loja}`,
        );


        this.$toast.success("Colaborador removido!");
        this.modalDelete = false;
        this.carregarColaboradores();
      } catch (e) { exibeErro(e, this.$toast); }
      finally { this.loadingAcao = false; }
    }
  },

  mounted() { this.carregarColaboradores(); }
}
</script>

<style scoped>
.card { background: #fff; border-radius: 12px; padding: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }

/* SEARCH BOX */
.table-header { margin-bottom: 20px; }
.search-box {
  display: flex; align-items: center; background: #f1f5f9;
  border-radius: 12px; padding: 8px 16px; gap: 10px; max-width: 380px;
}
.search-box input { border: none; background: transparent; outline: none; width: 100%; font-size: 14px; }
.search-box span { color: #64748b; }

/* PERFIL */
.perfil { display: flex; align-items: center; gap: 12px; }
.avatar { background: #e2e8f0; color: #ff8049; }
.nome { font-weight: 700; color: #1e293b; font-size: 14px; }
.email { font-size: 12px; color: #94a3b8; }

/* BOTÕES GOOGLE FONTS */
.acoes-buttons { display: flex; justify-content: center; gap: 12px; padding-right: 40px; }
.btn-action {
  border: none; background: transparent; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: transform 0.2s, color 0.2s;
}
.btn-action span { font-size: 22px; }
.edit { color: #3b82f6; }
.edit:hover { color: #1d4ed8; transform: scale(1.1); }
.delete { color: #ef4444; }
.delete:hover { color: #b91c1c; transform: scale(1.1); }

/* EXPANSÃO */
.detalhes-container { padding: 15px 40px; background: #f8fafc; border-radius: 0 0 8px 8px; }
.detalhes-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.info-label { display: block; font-size: 11px; color: #94a3b8; font-weight: 700; text-transform: uppercase; margin-bottom: 4px; }
.info-value { display: block; font-size: 14px; color: #334155; font-weight: 500; }
.info-subvalue { display: block; font-size: 12px; color: #64748b; }

/* TAGS */
.tag-estoque { background: #dcfce7 !important; color: #166534 !important; }
.tag-caixa { background: #fef9c3 !important; color: #854d0e !important; }

/* MODAIS */
.field { margin-bottom: 15px; }
.field label { display: block; font-size: 12px; font-weight: 600; color: #475569; margin-bottom: 5px; }
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.btn-confirm { background: #ff8049 !important; border: none !important; }
.delete-confirm { text-align: center; padding: 10px; }
.warning-icon { font-size: 48px; color: #f59e0b; margin-bottom: 10px; }

/* STATES */
.state-container { display: flex; flex-direction: column; align-items: center; padding: 40px; gap: 10px; }
.empty-icon { font-size: 40px; color: #cbd5e1; }
.muted { color: #94a3b8; font-size: 14px; }
</style>