<template>
  <div class="totalPage">
    <TitileSubtitle
      title="Cadastrar Colaborador"
      subtitle="Registre um novo colaborador preenchendo as informações abaixo."
    />

    <!-- ══ FOTO ══ -->
    <div class="photo-container">
      <div class="photo-circle" @click="triggerUpload">
        <i v-if="!fotoPreview && !uploadingFoto" class="pi pi-user" style="font-size: 2.5rem; color: #888"></i>
        <span v-if="uploadingFoto" class="pi pi-spin pi-spinner" style="font-size: 1.8rem; color: #FF8049;"></span>
        <img v-if="fotoPreview && !uploadingFoto" :src="fotoPreview" class="photo-img" />
        <div class="photo-badge">
          <i class="pi pi-camera" style="font-size: 0.8rem; color: #fff"></i>
        </div>
      </div>
      <input
        type="file"
        ref="fileInput"
        hidden
        accept="image/jpeg,image/png,image/webp"
        @change="onFileChange"
      />
      <span class="photo-label">
        {{ uploadingFoto ? 'Enviando foto...' : 'Foto do colaborador (opcional)' }}
      </span>
      <!-- Botão limpar foto apenas quando há preview e não está enviando -->
      <button
        v-if="fotoPreview && !uploadingFoto"
        class="photo-remove-btn"
        @click.stop="removerFoto"
        title="Remover foto"
      >
        <i class="pi pi-times"></i> Remover foto
      </button>
    </div>

    <!-- ══ NOME + CPF ══ -->
    <div style="width: 100%; display: flex; margin-top: 20px;">
      <div style="width: 70%; padding-right: 5px;">
        <inputDesktop
          placeholder="Nome Completo (*)"
          v-model="colab.nome"
        />
      </div>
      <div style="width: 30%; padding-left: 5px;">
        <inputDesktop
          placeholder="CPF (*)"
          v-model="colab.cpf"
          data-maska="###.###.###-##"
          v-maska
        />
      </div>
    </div>

    <!-- ══ E-MAIL + CELULAR ══ -->
    <div style="width: 100%; display: flex; margin-top: 20px;">
      <div style="width: 60%; padding-right: 5px;">
        <inputDesktop
          placeholder="E-mail (*)"
          v-model="colab.email"
        />
      </div>
      <div style="width: 40%; padding-left: 5px;">
        <inputDesktop
          placeholder="Celular (Opcional)"
          v-model="colab.celular"
          data-maska="(##) #####-####"
          v-maska
        />
      </div>
    </div>

    <!-- ══ CEP + RUA + UF ══ -->
    <div style="width: 100%; display: flex; margin-top: 20px;">
      <div style="width: 25%; padding-right: 5px;">
        <inputDesktop
          placeholder="CEP (Opcional)"
          v-model="colab.cep"
          data-maska="#####-###"
          v-maska
        />
      </div>
      <div style="width: 60%; padding: 0 5px;">
        <inputDesktop
          placeholder="Rua (Opcional)"
          v-model="colab.rua"
        />
      </div>
      <div style="width: 15%; padding-left: 5px;">
        <inputDesktop
          placeholder="UF"
          maxlength="2"
          v-model="colab.estado"
        />
      </div>
    </div>

    <!-- ══ CIDADE + FUNÇÃO ══ -->
    <div style="width: 100%; display: flex; margin-top: 20px;">
      <div style="width: 100%; padding-right: 5px;">
        <inputDesktop
          placeholder="Cidade (Opcional)"
          v-model="colab.cidade"
        />
      </div>
      <div style="width: 100%; padding-left: 5px;">
        <Dropdown
          v-model="colab.nivel"
          :options="niveisPermissao"
          style="width: 100%; height: 50px; display: flex; align-items: center;"
          optionLabel="label"
          optionValue="value"
          placeholder="Função do Colaborador (*)"
          class="custom-dropdown w-full"
        />
      </div>
    </div>

    <!-- ══ SENHA ══ -->
    <div style="width: 100%; display: flex; margin-top: 20px;">
      <div style="width: 100%;">
        <inputDesktop
          placeholder="Senha de Acesso (*)"
          v-model="colab.passe_usuario"
          type="password"
        />
      </div>
    </div>

    <!-- ══ AÇÕES ══ -->
    <div style="display: flex; margin-top: 30px;">
      <button
        @click="limparTudo"
        style="width: 100%; margin-right: 8px; background-color: #888; color: #FFF; border-radius: 5px; border: none; height: 50px; cursor: pointer; font-family: 'Poppins', sans-serif;"
      >
        Limpar tudo
      </button>

      <Button
        type="button"
        label="Cadastrar colaborador"
        class="poppins-regular btn-sbmt"
        :loading="loading"
        :disabled="uploadingFoto"
        @click="handleCadastro"
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
import Button from 'primevue/button'
import Dropdown from 'primevue/dropdown'
import { vMaska } from 'maska/vue'

export default {
  name: 'CadastroColaborador',
  directives: { maska: vMaska },
  components: {
    TitileSubtitle,
    inputDesktop,
    Button,
    Dropdown
  },

  data() {
    return {
      loading: false,
      uploadingFoto: false,  // spinner enquanto faz upload
      auth: null,
      fotoPreview: null,     // URL local para preview (createObjectURL)
      selectedFile: null,    // File selecionado antes do upload
      colab: {
        nome: '',
        cpf: '',
        celular: '',
        email: '',
        rua: '',
        foto: '',            // URL retornada pela API após upload
        cidade: '',
        estado: '',
        cep: '',
        nivel: null,
        passe_usuario: ''
      },
      // Supervisor = 6 | Operador = 7
      niveisPermissao: [
        { label: 'Supervisor', value: 6 },
        { label: 'Operador',   value: 7 }
      ]
    }
  },

  methods: {
    // ── Abre seletor de arquivo ──────────────────────────
    triggerUpload() {
      this.$refs.fileInput.click()
    },

    // ── Chamado quando o usuário escolhe um arquivo ──────
    async onFileChange(e) {
      const file = e.target.files[0]
      // Limpa o input para permitir re-selecionar o mesmo arquivo
      e.target.value = ''
      if (!file) return

      // Validação de tamanho (máx 2 MB — igual ao EditarPerfil)
      if (file.size > 2 * 1024 * 1024) {
        this.$toast.info('A foto deve ter no máximo 2 MB.')
        return
      }

      // Validação de formato
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        this.$toast.info('Formato inválido! Use JPEG, PNG ou WebP.')
        return
      }

      // Preview local imediato (mesmo padrão do EditarPerfil)
      this.fotoPreview = URL.createObjectURL(file)
      this.selectedFile = file

      // Faz upload e guarda a URL retornada em colab.foto
      await this.uploadFotoColaborador(file)
    },

    // ── Envia a foto à API e armazena a URL no form ──────
    async uploadFotoColaborador(file) {
      this.uploadingFoto = true
      try {
        const formData = new FormData()
        formData.append('foto', file)

        // Mesmo endpoint usado no EditarPerfil para foto de perfil
        const response = await api.post('/mvpu/usuario/enviarFotoPerfil', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })

        const fotoUrl = response?.data?.data?.foto_url
        if (fotoUrl) {
          this.colab.foto = fotoUrl
        } else {
          // Se a API não retornar a URL esperada, avisa mas mantém o preview
          this.$toast.add({
            severity: 'warn',
            summary: 'Aviso',
            detail: 'Foto enviada, mas a URL não foi retornada. Verifique a API.',
            life: 4000
          })
        }
      } catch (e) {
        // Reverte o preview em caso de falha
        this.fotoPreview = null
        this.selectedFile = null
        this.colab.foto = ''
        this.$toast.add({
          severity: 'error',
          summary: 'Erro ao enviar foto',
          detail: 'Não foi possível fazer o upload da imagem.',
          life: 3000
        })
      } finally {
        this.uploadingFoto = false
      }
    },

    // ── Remove foto selecionada ──────────────────────────
    removerFoto() {
      this.fotoPreview = null
      this.selectedFile = null
      this.colab.foto = ''
    },

    // ── Limpa o formulário inteiro ───────────────────────
    limparTudo() {
      this.colab = {
        nome: '', cpf: '', celular: '', email: '',
        rua: '', foto: '', cidade: '', estado: '',
        cep: '', nivel: null, passe_usuario: ''
      }
      this.fotoPreview = null
      this.selectedFile = null
    },

    // ── Submete o cadastro ───────────────────────────────
    async handleCadastro() {
      if (!this.colab.nome || !this.colab.cpf || !this.colab.email || !this.colab.nivel || !this.colab.passe_usuario) {
        this.$toast.info('Preencha todos os campos obrigatórios (*)')
        return
      }

      // Bloqueia envio enquanto o upload de foto ainda não terminou
      if (this.uploadingFoto) {
        this.$toast.info('Aguarde o upload da foto finalizar.')
        return
      }

      this.loading = true
      try {
        const payload = {
          nome:          this.colab.nome,
          cpf:           this.colab.cpf,
          celular:       this.colab.celular.replace(/\D/g, ''),
          email:         this.colab.email,
          rua:           this.colab.rua,
          cidade:        this.colab.cidade,
          estado:        this.colab.estado,
          cep:           this.colab.cep.replace(/\D/g, ''),
          foto:          this.colab.foto,   // URL já resolvida pelo upload
          id_dono:       this.auth.id_usuario,
          id_loja:       this.auth.id_loja,
          nivel:         this.colab.nivel,
          passe_usuario: this.colab.passe_usuario
        }

        console.log('Payload sendo enviado:', payload)

        await api.post('/mvpu/usuario/cadastrarColab', payload)
        this.$toast.success('Colaborador cadastrado com sucesso!')
        this.limparTudo()
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
.totalPage {
  width: 100%;
  height: 100vh;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

/* ── Foto ── */
.photo-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
  gap: 8px;
}

.photo-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 2px dashed #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  background-color: #f0f0f0;
  overflow: hidden;
  transition: 0.3s;
}

.photo-circle:hover {
  border-color: #FF8049;
  background-color: #ececec;
}

.photo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-badge {
  position: absolute;
  bottom: 5px;
  right: 5px;
  background: #FF8049;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #fff;
}

.photo-label {
  font-family: 'Poppins', sans-serif;
  font-size: 12px;
  color: #666;
}

.photo-remove-btn {
  background: none;
  border: none;
  color: #e74c3c;
  font-family: 'Poppins', sans-serif;
  font-size: 11px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 4px;
  transition: background 0.2s;
}

.photo-remove-btn:hover {
  background: #ffeaea;
}

/* ── Botões ── */
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
  height: 50px;
}

:deep(.btn-sbmt.p-button:hover) {
  background-color: #ce673b;
  transition: 0.5s;
}

:deep(.btn-sbmt.p-button.p-disabled) {
  background-color: #ffb899 !important;
  cursor: not-allowed !important;
}

/* ── Dropdown ── */
:deep(.custom-dropdown.p-dropdown) {
  background: transparent;
  border: 1px solid #ccc;
  border-radius: 5px;
  height: 50px;
  font-family: 'Poppins', sans-serif;
  display: flex;
  align-items: center;
  width: 100%;
}

:deep(.p-dropdown-label) {
  padding-left: 10px;
}
</style>