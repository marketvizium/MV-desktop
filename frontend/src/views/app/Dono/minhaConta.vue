<template>
  <div class="mc-root">
    <div class="mc-content">

      <!-- ══ LOADING STATE ══ -->
      <div v-if="loadingPerfil" class="mc-loading-state">
        <div class="mc-loading-spinner"></div>
        <p>Carregando perfil...</p>
      </div>

      <template v-else>

        <!-- ══ PROFILE HEADER ══ -->
        <div class="mc-section-title">Minha conta</div>

        <!-- FOTO + NOME + EMAIL -->
        <div class="mc-profile-block">

          <!-- Foto -->
          <div class="mc-row mc-row-photo">
            <div class="mc-row-left">
              <div class="mc-avatar-wrap">
                <div class="mc-avatar-circle">
                  <img :src="form.foto || defaultAvatar" alt="Foto de perfil" />
                </div>
                <button
                  class="mc-avatar-cam"
                  @click="triggerFileSelect"
                  :disabled="uploadingFoto"
                  title="Alterar foto"
                >
                  <span v-if="uploadingFoto" class="mc-spinner-inline"></span>
                  <span v-else class="material-symbols-outlined">photo_camera</span>
                </button>
              </div>
              <div class="mc-avatar-info">
                <div class="mc-avatar-label">Foto de perfil</div>
                <div class="mc-avatar-hint">Ajuda seus colegas a te reconhecerem.</div>
              </div>
            </div>
            <button class="mc-btn-outline" @click="triggerFileSelect" :disabled="uploadingFoto">
              <span v-if="uploadingFoto" class="mc-spinner-inline dark"></span>
              <span v-else>Enviar foto</span>
            </button>
            <input
              type="file"
              ref="fileInput"
              style="display:none"
              accept="image/jpeg,image/png,image/webp"
              @change="onFileSelected"
            />
          </div>

          <div class="mc-divider"></div>

          <!-- Nome -->
          <div class="mc-row">
            <div class="mc-row-left mc-row-info">
              <div class="mc-field-label">Nome</div>
              <template v-if="!editMode">
                <div class="mc-field-value">{{ form.nome || 'Não informado' }}</div>
              </template>
              <template v-else>
                <div class="mc-field-wrap-inline">
                  <input class="mc-input" v-model="form.nome" placeholder="Nome completo" />
                </div>
              </template>
            </div>
            <button v-if="!editMode" class="mc-btn-outline" @click="startEdit('nome')">Editar</button>
            <div v-else class="mc-edit-actions">
              <button class="mc-btn-outline danger" @click="cancelEdit">Cancelar</button>
              <button class="mc-btn-primary" @click="salvarPerfil" :disabled="saving">
                <span v-if="saving" class="mc-spinner-inline"></span>
                <span v-else>Salvar</span>
              </button>
            </div>
          </div>

          <div class="mc-divider"></div>

          <!-- E-mail (bloqueado) -->
          <div class="mc-row">
            <div class="mc-row-left mc-row-info">
              <div class="mc-field-label">E-mail</div>
              <div class="mc-field-value">{{ form.email || 'Não informado' }}</div>
            </div>
            <span class="mc-locked-badge">
              <span class="material-symbols-outlined" style="font-size:12px">lock</span>
              bloqueado
            </span>
          </div>

          <div class="mc-divider"></div>

          <!-- Celular -->
          <div class="mc-row">
            <div class="mc-row-left mc-row-info">
              <div class="mc-field-label">Celular</div>
              <template v-if="!editCelular">
                <div class="mc-field-value">{{ form.celular || 'Não informado' }}</div>
              </template>
              <template v-else>
                <div class="mc-field-wrap-inline">
                  <input class="mc-input" v-model="form.celular" placeholder="(11) 99999-9999" />
                </div>
              </template>
            </div>
            <button v-if="!editCelular" class="mc-btn-outline" @click="startEdit('celular')">Editar</button>
            <div v-else class="mc-edit-actions">
              <button class="mc-btn-outline danger" @click="cancelEdit">Cancelar</button>
              <button class="mc-btn-primary" @click="salvarPerfil" :disabled="saving">
                <span v-if="saving" class="mc-spinner-inline"></span>
                <span v-else>Salvar</span>
              </button>
            </div>
          </div>

          <div class="mc-divider"></div>

          <!-- CPF (bloqueado) -->
          <div class="mc-row">
            <div class="mc-row-left mc-row-info">
              <div class="mc-field-label">CPF</div>
              <div class="mc-field-value">{{ form.cpf || 'Não informado' }}</div>
            </div>
            <span class="mc-locked-badge">
              <span class="material-symbols-outlined" style="font-size:12px">lock</span>
              bloqueado
            </span>
          </div>

          <div class="mc-divider"></div>

          <!-- Data de Pagamento -->
          <div class="mc-row">
            <div class="mc-row-left mc-row-info">
              <div class="mc-field-label">Data de Pagamento</div>
              <div class="mc-field-value">{{ formatPaymentDate(form.data_pagamento) }}</div>
            </div>
          </div>

          <div class="mc-divider"></div>

          <!-- Endereço — Rua -->
          <div class="mc-row">
            <div class="mc-row-left mc-row-info">
              <div class="mc-field-label">Rua</div>
              <template v-if="!editEndereco">
                <div class="mc-field-value">{{ form.rua || 'Não informado' }}</div>
              </template>
              <template v-else>
                <div class="mc-field-wrap-inline">
                  <input class="mc-input" v-model="form.rua" placeholder="Rua, número, complemento" />
                </div>
              </template>
            </div>
            <button v-if="!editEndereco" class="mc-btn-outline" @click="startEdit('endereco')">Editar</button>
            <div v-else class="mc-edit-actions">
              <button class="mc-btn-outline danger" @click="cancelEdit">Cancelar</button>
              <button class="mc-btn-primary" @click="salvarPerfil" :disabled="saving">
                <span v-if="saving" class="mc-spinner-inline"></span>
                <span v-else>Salvar</span>
              </button>
            </div>
          </div>

          <!-- Cidade / Estado (dentro do bloco endereço, sem divider extra acima) -->
          <template v-if="editEndereco">
            <div class="mc-divider"></div>
            <div class="mc-row">
              <div class="mc-row-left mc-row-info">
                <div class="mc-field-label">Cidade</div>
                <input class="mc-input" v-model="form.cidade" placeholder="Cidade" />
              </div>
            </div>
            <div class="mc-divider"></div>
            <div class="mc-row">
              <div class="mc-row-left mc-row-info">
                <div class="mc-field-label">Estado</div>
                <input class="mc-input short" v-model="form.estado" placeholder="SP" maxlength="2" style="text-transform:uppercase" />
              </div>
            </div>
            <div class="mc-divider"></div>
            <div class="mc-row">
              <div class="mc-row-left mc-row-info">
                <div class="mc-field-label">CEP</div>
                <input class="mc-input" v-model="form.cep" placeholder="00000-000" />
              </div>
            </div>
          </template>
          <template v-else>
            <div class="mc-divider"></div>
            <div class="mc-row">
              <div class="mc-row-left mc-row-info">
                <div class="mc-field-label">Cidade / Estado</div>
                <div class="mc-field-value">
                  {{ form.cidade || 'Não informado' }}
                  <template v-if="form.estado"> — {{ form.estado }}</template>
                </div>
              </div>
            </div>
            <div class="mc-divider"></div>
            <div class="mc-row">
              <div class="mc-row-left mc-row-info">
                <div class="mc-field-label">CEP</div>
                <div class="mc-field-value">{{ form.cep || 'Não informado' }}</div>
              </div>
            </div>
          </template>

          <div class="mc-divider"></div>

          <!-- Senha -->
          <div class="mc-row">
            <div class="mc-row-left mc-row-info">
              <div class="mc-field-label">Senha</div>
              <div class="mc-field-value">••••••••</div>
            </div>
            <button class="mc-btn-outline" @click="showPasswordModal = true">Editar</button>
          </div>

          <div class="mc-divider"></div>

          <!-- Loja ativa -->
          <div class="mc-row">
            <div class="mc-row-left mc-row-info">
              <div class="mc-field-label">Loja ativa</div>
              <div class="mc-field-value mc-loja-value">
                <span class="mc-loja-dot"></span>
                {{ lojaAtualNome || 'Nenhuma loja selecionada' }}
              </div>
            </div>
            <button class="mc-btn-outline" @click="abrirModalLojas">Trocar</button>
          </div>

        </div>
        <!-- /mc-profile-block -->

        <!-- SAIR DA CONTA -->
        <div class="mc-logout-wrap">
          <button class="mc-btn-logout" @click="handleLogout">
            <span class="material-symbols-outlined">logout</span>
            Sair da conta
          </button>
          <p class="mc-version">Versão 1.0.0 • Market Vizium</p>
        </div>

      </template>

    </div>
    <!-- /mc-content -->

    <!-- ══ MODAL — ALTERAR SENHA ══ -->
    <transition name="mc-modal">
      <div class="mc-modal-overlay" v-if="showPasswordModal" @click.self="closePasswordModal">
        <div class="mc-modal-card">
          <div class="mc-modal-header">
            <div class="mc-modal-header-icon">
              <span class="material-symbols-outlined">lock_reset</span>
            </div>
            <div>
              <div class="mc-modal-title">Alterar Senha</div>
              <div class="mc-modal-sub">Crie uma nova senha segura</div>
            </div>
            <button class="mc-modal-close" @click="closePasswordModal">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          <div class="mc-modal-body">
            <div class="mc-field-col">
              <label class="mc-field-label">Senha atual</label>
              <div class="mc-field-wrap active">
                <span class="material-symbols-outlined mc-field-ico">key</span>
                <input
                  class="mc-field-input"
                  :type="showSenhaAtual ? 'text' : 'password'"
                  v-model="passwordForm.senhaAtual"
                  placeholder="••••••••"
                />
                <button class="mc-pass-toggle" @click="showSenhaAtual = !showSenhaAtual">
                  <span class="material-symbols-outlined">{{ showSenhaAtual ? 'visibility_off' : 'visibility' }}</span>
                </button>
              </div>
            </div>
            <div class="mc-field-col">
              <label class="mc-field-label">Nova senha</label>
              <div class="mc-field-wrap active">
                <span class="material-symbols-outlined mc-field-ico">lock</span>
                <input
                  class="mc-field-input"
                  :type="showNovaSenha ? 'text' : 'password'"
                  v-model="passwordForm.novaSenha"
                  placeholder="••••••••"
                />
                <button class="mc-pass-toggle" @click="showNovaSenha = !showNovaSenha">
                  <span class="material-symbols-outlined">{{ showNovaSenha ? 'visibility_off' : 'visibility' }}</span>
                </button>
              </div>
            </div>
            <div class="mc-field-col">
              <label class="mc-field-label">Confirmar nova senha</label>
              <div class="mc-field-wrap active" :class="{ 'field-error': passwordForm.confirmarSenha && passwordForm.novaSenha !== passwordForm.confirmarSenha }">
                <span class="material-symbols-outlined mc-field-ico">lock_open</span>
                <input
                  class="mc-field-input"
                  :type="showConfirmarSenha ? 'text' : 'password'"
                  v-model="passwordForm.confirmarSenha"
                  placeholder="••••••••"
                />
                <button class="mc-pass-toggle" @click="showConfirmarSenha = !showConfirmarSenha">
                  <span class="material-symbols-outlined">{{ showConfirmarSenha ? 'visibility_off' : 'visibility' }}</span>
                </button>
              </div>
              <span v-if="passwordForm.confirmarSenha && passwordForm.novaSenha !== passwordForm.confirmarSenha" class="mc-field-error-msg">
                As senhas não coincidem
              </span>
            </div>
          </div>
          <div class="mc-modal-footer">
            <button class="mc-btn-outline" @click="closePasswordModal">Cancelar</button>
            <button
              class="mc-btn-primary"
              @click="salvarSenha"
              :disabled="savingPassword || !passwordValido"
            >
              <span v-if="savingPassword" class="mc-spinner-inline"></span>
              <span v-else>Salvar Senha</span>
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- ══ MODAL — SELECIONAR LOJA ══ -->
    <transition name="mc-modal">
      <div class="mc-modal-overlay" v-if="showLojaModal" @click.self="fecharModalLojas">
        <div class="mc-modal-card mc-loja-modal-card">

          <!-- Header -->
          <div class="mc-modal-header">
            <div class="mc-modal-header-icon">
              <span class="material-symbols-outlined">store</span>
            </div>
            <div>
              <div class="mc-modal-title">Selecionar Loja</div>
              <div class="mc-modal-sub">Clique em uma loja para ativá-la</div>
            </div>
            <button class="mc-modal-close" @click="fecharModalLojas">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <!-- Body scrollável -->
          <div class="mc-loja-modal-body">

            <!-- Loading -->
            <div v-if="loadingLojas" class="mc-loja-loading">
              <div class="mc-loading-spinner"></div>
              <span>Carregando lojas...</span>
            </div>

            <!-- Vazio -->
            <div v-else-if="lojas.length === 0" class="mc-loja-empty">
              <span class="material-symbols-outlined">store_mall_directory</span>
              <span>Nenhuma loja encontrada.</span>
            </div>

            <!-- Lista paginada -->
            <template v-else>
              <div
                v-for="loja in lojasPaginadas"
                :key="loja.id_loja"
                :class="['mc-loja-item', { 'mc-loja-item--active': isLojaAtiva(loja.id_loja) }]"
                @click="selecionarLoja(loja)"
              >
                <div :class="['mc-loja-avatar', { 'mc-loja-avatar--active': isLojaAtiva(loja.id_loja) }]">
                  <span class="material-symbols-outlined">storefront</span>
                </div>
                <div class="mc-loja-item-info">
                  <span class="mc-loja-item-name">{{ loja.nome_fantasia }}</span>
                  <span class="mc-loja-item-razao">{{ loja.razao_social }}</span>
                </div>
                <div class="mc-loja-item-right">
                  <span v-if="isLojaAtiva(loja.id_loja)" class="material-symbols-outlined mc-loja-check">check_circle</span>
                  <div v-else class="mc-loja-circle"></div>
                </div>
              </div>
            </template>
          </div>

          <!-- Paginação (só quando houver mais de uma página) -->
          <div class="mc-loja-pagination" v-if="lojasTotalPaginas > 1">
            <button
              class="mc-pag-btn"
              :disabled="lojaPagina <= 1"
              @click="lojaPagina--"
            >
              <span class="material-symbols-outlined">chevron_left</span>
            </button>
            <span class="mc-pag-info">{{ lojaPagina }} / {{ lojasTotalPaginas }}</span>
            <button
              class="mc-pag-btn"
              :disabled="lojaPagina >= lojasTotalPaginas"
              @click="lojaPagina++"
            >
              <span class="material-symbols-outlined">chevron_right</span>
            </button>
          </div>

          <!-- Overlay de carregamento ao trocar de loja -->
          <div class="mc-loja-switching" v-if="loadingSetLoja">
            <div class="mc-loading-spinner"></div>
            <span>Ativando loja...</span>
          </div>

        </div>
      </div>
    </transition>

  </div>
</template>

<script>
import { api } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import exibeErro from '@/utils/ExibeErro'

const DEFAULT_AVATAR = new URL('@/assets/img/personagem.png', import.meta.url).href

export default {
  name: 'MinhaConta',

  data() {
    return {
      loadingPerfil: false,
      editMode: false,      // edita nome
      editCelular: false,
      editEndereco: false,
      saving: false,
      uploadingFoto: false,

      form: {
        id_usuario: null,
        nome: '',
        cpf: '',
        email: '',
        celular: '',
        nivel: null,
        rua: '',
        cidade: '',
        estado: '',
        cep: '',
        foto: '',
        data_pagamento: null,
        data_criacao: null,
        plano: '',
        id_dono: null,
        id_loja: null
      },
      formOriginal: null,
      defaultAvatar: DEFAULT_AVATAR,

      showPasswordModal: false,
      savingPassword: false,
      showSenhaAtual: false,
      showNovaSenha: false,
      showConfirmarSenha: false,
      passwordForm: {
        senhaAtual: '',
        novaSenha: '',
        confirmarSenha: ''
      },

      // ── Modal de lojas ──
      showLojaModal: false,
      lojas: [],
      loadingLojas: false,
      loadingSetLoja: false,
      lojaPagina: 1,
      LOJAS_POR_PAGINA: 10,
      lojaAtualNome: null
    }
  },

  computed: {
    passwordValido() {
      return (
        this.passwordForm.senhaAtual.length >= 1 &&
        this.passwordForm.novaSenha.length >= 6 &&
        this.passwordForm.novaSenha === this.passwordForm.confirmarSenha
      )
    },

    // ── Lojas paginadas ──
    lojasTotal() {
      return this.lojas.length
    },
    lojasTotalPaginas() {
      return Math.max(1, Math.ceil(this.lojasTotal / this.LOJAS_POR_PAGINA))
    },
    lojasPaginadas() {
      const ini = (this.lojaPagina - 1) * this.LOJAS_POR_PAGINA
      return this.lojas.slice(ini, ini + this.LOJAS_POR_PAGINA)
    },
  },

  methods: {
    async consultarUsuario() {
      this.loadingPerfil = true
      try {
        const store = useAuthStore()
        const { data } = await api.get('/mvpu/usuario/consultarPerfil')
        const u = data?.data?.[0]
        if (!u) return

        this.form.id_usuario     = u.id_usuario
        this.form.nome           = u.nome          ?? ''
        this.form.cpf            = u.cpf           ?? ''
        this.form.email          = u.email         ?? ''
        this.form.celular        = u.celular        ?? ''
        this.form.nivel          = u.nivel
        this.form.rua            = u.rua           ?? ''
        this.form.cidade         = u.cidade        ?? ''
        this.form.estado         = u.estado        ?? ''
        this.form.cep            = u.cep           ?? ''
        this.form.data_pagamento = u.data_pagamento
        this.form.data_criacao   = u.data_criacao
        this.form.plano          = u.plano         ?? ''
        this.form.id_dono        = u.id_dono
        this.form.id_loja        = store.id_loja
        if (u.foto) this.form.foto = u.foto

        this.formOriginal = JSON.parse(JSON.stringify(this.form))
      } catch (e) {
        exibeErro(e, this.$toast)
      } finally {
        this.loadingPerfil = false
      }
    },

    startEdit(field) {
      this.formOriginal = JSON.parse(JSON.stringify(this.form))
      if (field === 'nome')      this.editMode = true
      if (field === 'celular')   this.editCelular = true
      if (field === 'endereco')  this.editEndereco = true
    },

    cancelEdit() {
      if (this.formOriginal) this.form = JSON.parse(JSON.stringify(this.formOriginal))
      this.editMode = false
      this.editCelular = false
      this.editEndereco = false
    },

    async salvarPerfil() {
      this.saving = true
      try {
        await api.put('/mvpu/usuario/editarPerfilUsuario', this.form)
        this.formOriginal = JSON.parse(JSON.stringify(this.form))
        this.editMode = false
        this.editCelular = false
        this.editEndereco = false
        this.$toast.success('Informações salvas com sucesso.')
      } catch (e) {
        exibeErro(e, this.$toast)
      } finally {
        this.saving = false
      }
    },

    triggerFileSelect() {
      this.$refs.fileInput.click()
    },

    async onFileSelected(event) {
      const file = event.target.files[0]
      event.target.value = ''
      if (!file) return

      if (file.size > 2 * 1024 * 1024) {
        this.$toast.info('A foto deve ter no máximo 2MB.')
        return
      }
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        this.$toast.info('Formato inválido! Use JPEG, PNG ou WebP.')
        return
      }

      this.uploadingFoto = true
      try {
        const formData = new FormData()
        formData.append('foto', file)
        const response = await api.post('/mvpu/usuario/enviarFotoPerfil', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        if (response.data?.data?.foto_url) {
          this.form.foto = response.data.data.foto_url
        }
        this.$toast.add({ severity: 'success', summary: 'Foto atualizada', detail: 'Foto de perfil atualizada.', life: 3000 })
      } catch (e) {
        exibeErro(e, this.$toast)
      } finally {
        this.uploadingFoto = false
      }
    },

    closePasswordModal() {
      this.showPasswordModal = false
      this.passwordForm = { senhaAtual: '', novaSenha: '', confirmarSenha: '' }
      this.showSenhaAtual = false
      this.showNovaSenha = false
      this.showConfirmarSenha = false
    },

    async salvarSenha() {
      if (!this.passwordValido) return
      this.savingPassword = true
      try {
        await api.put('/mvpu/usuario/alterarSenha', {
          senha_atual: this.passwordForm.senhaAtual,
          nova_senha:  this.passwordForm.novaSenha
        })
        this.$toast.success('Senha atualizada com sucesso.')
        this.closePasswordModal()
      } catch (e) {
        exibeErro(e, this.$toast)
      } finally {
        this.savingPassword = false
      }
    },

    handleLogout() {
      const store = useAuthStore()
      store.logout()
      this.$router.push('/')
    },

    // ── Lojas ──
    async abrirModalLojas() {
      this.showLojaModal = true
      this.lojaPagina = 1
      if (this.lojas.length === 0) {
        await this.consultarLojas()
      }
    },

    fecharModalLojas() {
      this.showLojaModal = false
    },

    async consultarLojas() {
      this.loadingLojas = true
      try {
        const { data } = await api.get('/mvpu/usuario/consultarLojas')
        this.lojas = data?.data || []

        const store = useAuthStore()
        const id = store.iDloja


        const found = this.lojas.find(l => l.id_loja === id)

        this.lojaAtualNome = found?.nome_fantasia || null

      } catch (e) {
        exibeErro(e, this.$toast)
      } finally {
        this.loadingLojas = false
      }
    },

    async selecionarLoja(loja) {
      const store = useAuthStore()
      if (store.iDloja === loja.id_loja) return
      this.loadingSetLoja = true
      try {
        await store.setLoja(loja)
        await new Promise(r => setTimeout(r, 400))
        window.location.reload()
      } catch (e) {
        exibeErro(e, this.$toast)
        this.loadingSetLoja = false
      }
    },

    isLojaAtiva(id) {
      const store = useAuthStore()
      return store.iDloja === id
    },

    formatPaymentDate(ts) {
      if (!ts) return 'Não informado'
      try {
        const n = Number(ts)
        const d = n > 1e12 ? new Date(n) : new Date(n * 1000)
        if (isNaN(d.getTime())) return ts
        return d.toLocaleDateString('pt-BR')
      } catch { return 'Não informado' }
    }
  },

  mounted() {
    this.consultarUsuario()

    setTimeout(async ()=>{
      const { data } = await api.get('/mvpu/usuario/consultarLojas')
      this.lojas = data?.data || []
  
      const store = useAuthStore()
      const id = store.iDloja
  
      console.log(this.lojas, "AA")
  
      const found = this.lojas.find(l => l.id_loja === id)
      console.log(found)
  
      this.lojaAtualNome = found?.nome_fantasia || null
    }, 500)

  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');

*, *::before, *::after { box-sizing: border-box; }

/* ══ ROOT ══ */
.mc-root {
  background: #fafafa;
  min-height: 100vh;
  font-family: 'Poppins', sans-serif;
  color: #111;
  font-size: 14px;
}

.mc-content {
  max-width: 680px;
  margin: 0 auto;
  padding: 32px 24px 60px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ══ PAGE TITLE ══ */
.mc-section-title {
  font-size: 22px;
  font-weight: 700;
  color: #111;
  letter-spacing: -0.3px;
}

/* ══ PROFILE BLOCK ══ */
.mc-profile-block {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 14px;
  overflow: hidden;
}

.mc-divider {
  height: 1px;
  background: #f0f0f0;
  margin: 0;
}

/* ══ ROW ══ */
.mc-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 22px;
  gap: 16px;
  min-height: 72px;
}

.mc-row-left {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;
  min-width: 0;
}

.mc-row-info {
  flex-direction: column;
  align-items: flex-start;
  gap: 3px;
}

/* ══ AVATAR ROW ══ */
.mc-row-photo {
  min-height: 80px;
}

.mc-avatar-wrap {
  position: relative;
  flex-shrink: 0;
}

.mc-avatar-circle {
  width: 58px;
  height: 58px;
  border-radius: 50%;
  overflow: hidden;
  border: 2.5px solid #ff8049;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mc-avatar-circle img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mc-avatar-cam {
  position: absolute;
  bottom: 0;
  right: -2px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #ff8049;
  border: 2px solid #fff;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background .15s;
}
.mc-avatar-cam:hover:not(:disabled) { background: #e86c35; }
.mc-avatar-cam:disabled { opacity: .6; cursor: not-allowed; }
.mc-avatar-cam .material-symbols-outlined { font-size: 12px; }

.mc-avatar-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.mc-avatar-label {
  font-size: 14px;
  font-weight: 600;
  color: #111;
}

.mc-avatar-hint {
  font-size: 12px;
  color: #888;
}

/* ══ FIELD LABEL / VALUE ══ */
.mc-field-label {
  font-size: 12px;
  font-weight: 600;
  color: #111;
}

.mc-field-value {
  font-size: 14px;
  color: #444;
  font-weight: 400;
}

.mc-field-wrap-inline {
  margin-top: 2px;
}

.mc-input {
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  padding: 7px 12px;
  font-size: 13px;
  font-family: 'Poppins', sans-serif;
  color: #111;
  outline: none;
  background: #fafafa;
  width: 260px;
  max-width: 100%;
  transition: border-color .15s;
}
.mc-input:focus {
  border-color: #ff8049;
  box-shadow: 0 0 0 3px rgba(255,128,73,.1);
  background: #fff;
}
.mc-input.short { width: 90px; }

/* ══ LOCKED BADGE ══ */
.mc-locked-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  color: #aaa;
  background: #f4f4f4;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  padding: 4px 9px;
  flex-shrink: 0;
  white-space: nowrap;
}

/* ══ BUTTONS ══ */
.mc-btn-outline {
  border: 1.5px solid #d8d8d8;
  background: #fff;
  color: #333;
  border-radius: 8px;
  padding: 7px 18px;
  font-size: 13px;
  font-weight: 600;
  font-family: 'Poppins', sans-serif;
  cursor: pointer;
  transition: all .15s;
  white-space: nowrap;
  flex-shrink: 0;
}
.mc-btn-outline:hover:not(:disabled) {
  border-color: #ff8049;
  color: #ff8049;
  background: #fff7f4;
}
.mc-btn-outline:disabled { opacity: .6; cursor: not-allowed; }
.mc-btn-outline.danger:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: #fff5f5;
}

.mc-btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #ff8049;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 7px 18px;
  font-size: 13px;
  font-weight: 600;
  font-family: 'Poppins', sans-serif;
  cursor: pointer;
  transition: all .15s;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(255,128,73,.25);
}
.mc-btn-primary:hover:not(:disabled) { background: #e86c35; transform: translateY(-1px); }
.mc-btn-primary:disabled { opacity: .6; cursor: not-allowed; transform: none; }

.mc-edit-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

/* ══ LOGOUT ══ */
.mc-logout-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding-top: 8px;
}

.mc-btn-logout {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  color: #ef4444;
  border: 1.5px solid #ef4444;
  border-radius: 10px;
  padding: 10px 28px;
  font-size: 14px;
  font-weight: 600;
  font-family: 'Poppins', sans-serif;
  cursor: pointer;
  transition: all .15s;
  width: 100%;
  justify-content: center;
}
.mc-btn-logout:hover { background: #fff5f5; }
.mc-btn-logout .material-symbols-outlined { font-size: 18px; }

.mc-version {
  font-size: 11px;
  color: #bbb;
  margin: 0;
  text-align: center;
}

/* ══ LOADING ══ */
.mc-loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  gap: 14px;
  color: #aaa;
  font-size: 13px;
}
.mc-loading-spinner {
  width: 34px;
  height: 34px;
  border: 3px solid #f0f0f0;
  border-top-color: #ff8049;
  border-radius: 50%;
  animation: mc-spin .7s linear infinite;
}
@keyframes mc-spin { to { transform: rotate(360deg); } }

.mc-spinner-inline {
  display: inline-block;
  width: 13px;
  height: 13px;
  border: 2px solid rgba(255,255,255,.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: mc-spin .6s linear infinite;
}
.mc-spinner-inline.dark {
  border-color: rgba(0,0,0,.15);
  border-top-color: #ff8049;
}

/* ══ MODAL ══ */
.mc-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.25);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 16px;
}
.mc-modal-card {
  background: #fff;
  border-radius: 14px;
  border: 1px solid #e8e8e8;
  box-shadow: 0 12px 40px rgba(0,0,0,.12);
  width: 420px;
  max-width: 100%;
}
.mc-modal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 20px 14px;
  border-bottom: 1px solid #f0f0f0;
}
.mc-modal-header-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #fff0ea;
  color: #ff8049;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.mc-modal-header-icon .material-symbols-outlined { font-size: 18px; }
.mc-modal-title { font-size: 14px; font-weight: 700; flex: 1; }
.mc-modal-sub   { font-size: 11px; color: #aaa; margin-top: 1px; }
.mc-modal-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  color: #aaa;
  border-radius: 6px;
  display: flex;
  align-items: center;
  transition: all .15s;
}
.mc-modal-close:hover { background: #f5f5f5; color: #333; }
.mc-modal-close .material-symbols-outlined { font-size: 18px; }
.mc-modal-body {
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.mc-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 20px 18px;
  border-top: 1px solid #f0f0f0;
}

/* Modal fields */
.mc-field-col {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.mc-field-wrap {
  display: flex;
  align-items: center;
  background: #f8f8f8;
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  transition: all .15s;
}
.mc-field-wrap.active { border-color: rgba(255,128,73,.3); background: #fffaf8; }
.mc-field-wrap.active:focus-within {
  border-color: #ff8049;
  box-shadow: 0 0 0 3px rgba(255,128,73,.08);
}
.mc-field-wrap.field-error { border-color: #ef4444 !important; }
.mc-field-ico {
  font-size: 14px;
  color: #aaa;
  padding: 0 10px;
  pointer-events: none;
  flex-shrink: 0;
}
.mc-field-input {
  flex: 1;
  padding: 9px 10px 9px 0;
  background: transparent;
  border: none;
  outline: none;
  font-size: 13px;
  color: #111;
  font-family: 'Poppins', sans-serif;
  min-width: 0;
}
.mc-field-error-msg {
  font-size: 11px;
  color: #ef4444;
  font-weight: 500;
}
.mc-pass-toggle {
  background: none;
  border: none;
  cursor: pointer;
  color: #aaa;
  padding: 0 10px;
  display: flex;
  align-items: center;
  transition: color .15s;
}
.mc-pass-toggle:hover { color: #555; }
.mc-pass-toggle .material-symbols-outlined { font-size: 16px; }

/* ══ MODAL TRANSITION ══ */
.mc-modal-enter-active { transition: all .2s ease; }
.mc-modal-leave-active { transition: all .15s ease; }
.mc-modal-enter-from  { opacity: 0; }
.mc-modal-enter-from .mc-modal-card { transform: translateY(10px) scale(.97); }
.mc-modal-leave-to    { opacity: 0; }
.mc-modal-leave-to .mc-modal-card   { transform: translateY(5px); }

/* ══ RESPONSIVE ══ */
@media (max-width: 600px) {
  .mc-content { padding: 20px 14px 60px; }
  .mc-row { padding: 16px 16px; flex-wrap: wrap; min-height: unset; }
  .mc-input { width: 100%; }
  .mc-edit-actions { width: 100%; justify-content: flex-end; }
  .mc-btn-outline, .mc-btn-primary { padding: 7px 14px; }
}

/* ══ LOJA ROW ══ */
.mc-loja-value {
  display: flex;
  align-items: center;
  gap: 7px;
}
.mc-loja-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  flex-shrink: 0;
}

/* ══ MODAL DE LOJAS ══ */
.mc-loja-modal-card {
  width: 480px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  position: relative;
}

.mc-loja-modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
  max-height: 400px;
}

/* Loading / empty dentro do modal */
.mc-loja-loading,
.mc-loja-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 40px 20px;
  color: #aaa;
  font-size: 13px;
}
.mc-loja-empty .material-symbols-outlined {
  font-size: 36px;
  color: #ddd;
}

/* Item de loja */
.mc-loja-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  cursor: pointer;
  transition: background .15s;
  border-bottom: 1px solid #f5f5f5;
}
.mc-loja-item:last-child { border-bottom: none; }
.mc-loja-item:hover { background: #fafafa; }
.mc-loja-item--active {
  background: #fff7f4;
}
.mc-loja-item--active:hover { background: #fff0ea; }

.mc-loja-avatar {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: rgba(100,116,139,.08);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.mc-loja-avatar .material-symbols-outlined { font-size: 20px; color: #94a3b8; }
.mc-loja-avatar--active { background: rgba(255,128,73,.12); }
.mc-loja-avatar--active .material-symbols-outlined { color: #ff8049; }

.mc-loja-item-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.mc-loja-item-name {
  font-size: 13px;
  font-weight: 600;
  color: #111;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.mc-loja-item-razao {
  font-size: 11px;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mc-loja-item-right { flex-shrink: 0; }
.mc-loja-check { font-size: 22px; color: #ff8049; }
.mc-loja-circle {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid #e2e8f0;
}

/* Paginação */
.mc-loja-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 10px 0 14px;
  border-top: 1px solid #f0f0f0;
}
.mc-pag-btn {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: #f1f5f9;
  border: none;
  color: #475569;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all .15s;
}
.mc-pag-btn:disabled { opacity: .35; cursor: not-allowed; }
.mc-pag-btn .material-symbols-outlined { font-size: 18px; }
.mc-pag-info { font-size: 12px; color: #64748b; font-weight: 500; }

/* Overlay de troca */
.mc-loja-switching {
  position: absolute;
  inset: 0;
  background: rgba(255,255,255,.85);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border-radius: 14px;
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}
</style>