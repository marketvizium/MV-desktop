<template>
  <div class="totalPage">
    <!-- Google Fonts Icons -->
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" />

    <TitileSubtitle title="Cadastro de Produtos" subtitle="Adicione um ou mais produtos manualmente ou importe via XML" />

    <!-- ─────────────────────────────────────────────────────────────
         BOTÕES FINAIS — fixos no topo para evitar scroll
    ───────────────────────────────────────────────────────────────── -->
    <div class="top-actions">
      <button @click="limparTudo" class="btn-limpar">
        Limpar tudo
      </button>
      <Button
        type="button"
        :label="`Cadastrar ${listaProdutos.length > 1 ? listaProdutos.length + ' produtos' : 'produto'}`"
        class="poppins-regular btn-sbmt"
        :loading="loading"
        :disabled="listaProdutos.length === 0"
        @click="CadastrarProd"
      />
    </div>

    <!-- ─────────────────────────────────────────────────────────────
         SEÇÃO GLOBAL: Fornecedor (obrigatório — único por envio)
    ───────────────────────────────────────────────────────────────── -->
    <div class="section-card">
      <p class="section-title">Fornecedor</p>
      <div style="width: 100%; display: flex; gap: 10px;">
        <div style="width: 100%;">
          <inputDesktop
            placeholder="Nome do fornecedor"
            v-model="fornecedor_selecionado.nome_fornecedor"
            dropdown
          >
            <template #dropdown>
              <button
                type="button"
                class="dropdown-item"
                @click="SelecionarFornecedor(f)"
                v-for="f in fornecedores"
                :key="f.cnpj"
              >
                {{ f.nome_fornecedor }}
              </button>
            </template>
          </inputDesktop>
        </div>
        <div style="width: 100%;">
          <inputDesktop placeholder="CNPJ - Opcional (Preenchimento recomendado)" v-model="fornecedor_selecionado.cnpj" />
        </div>
      </div>
    </div>

    <!-- ─────────────────────────────────────────────────────────────
         SEÇÃO: Upload de XML (importação em massa)
    ───────────────────────────────────────────────────────────────── -->
    <div class="section-card">
      <p class="section-title">
        <span class="material-symbols-outlined" style="font-size:18px; vertical-align:middle; margin-right:6px;">upload_file</span>
        Importar via XML (NF-e)
      </p>
      <p class="fields-label" style="margin-bottom: 12px;">
        Arraste um arquivo .xml ou clique para selecionar — os produtos serão pré-preenchidos automaticamente
      </p>

      <div
        class="xml-dropzone"
        :class="{ 'dropzone-over': isDragging, 'dropzone-loaded': xmlFileName }"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="onDrop"
        @click="$refs.xmlInput.click()"
      >
        <input ref="xmlInput" type="file" accept=".xml" hidden @change="onFileChange" />
        <span class="material-symbols-outlined dropzone-icon">{{ xmlFileName ? 'task_alt' : 'upload_file' }}</span>
        <p class="dropzone-label" v-if="!xmlFileName">Solte o XML aqui ou clique para escolher</p>
        <p class="dropzone-label" v-else>
          <strong>{{ xmlFileName }}</strong> — {{ listaProdutos.length }} produto(s) importado(s)
        </p>
        <p class="dropzone-hint" v-if="!xmlFileName">Somente arquivos .xml de NF-e são aceitos</p>
      </div>

      <div v-if="xmlFileName" class="xml-status-bar">
        <span class="xml-badge-ok">
          <span class="material-symbols-outlined" style="font-size:14px; vertical-align:middle;">check_circle</span>
          {{ listaProdutos.length }} produto(s) importado(s) do XML
        </span>
        <button class="btn-limpar-xml" @click.stop="limparXML">
          <span class="material-symbols-outlined" style="font-size:14px; vertical-align:middle; margin-right:4px;">close</span>
          Remover XML
        </button>
      </div>
    </div>

    <!-- ─────────────────────────────────────────────────────────────
         FORMULÁRIO: Produto sendo editado/adicionado manualmente
    ───────────────────────────────────────────────────────────────── -->
    <div class="section-card">
      <p class="section-title">
        {{ modoEdicao !== null ? `Editando produto ${modoEdicao + 1}` : 'Adicionar produto manualmente' }}
      </p>

      <!-- Campos obrigatórios -->
      <p class="fields-label">
        Campos obrigatórios <span class="required-badge">*</span>
      </p>

      <div style="display: flex; gap: 10px; margin-bottom: 12px;">
        <div style="width: 100%;">
          <inputDesktop
            placeholder="Nome do produto *"
            v-model="formProduto.nome"
            :class="{ 'input-erro': tentouAdicionar && !formProduto.nome }"
          />
        </div>
        <div style="width: 100%;">
          <inputDesktop
            placeholder="Código de barras *"
            maxlength="13"
            v-model="formProduto.codigo_barra"
            :class="{ 'input-erro': tentouAdicionar && !formProduto.codigo_barra }"
          />
        </div>
        <div style="width: 100%;">
          <inputDesktop
            placeholder="Preço de custo (R$) *"
            v-model="formProduto.preco_custo"
            :class="{ 'input-erro': tentouAdicionar && !formProduto.preco_custo }"
          />
        </div>
      </div>

      <!-- Campos opcionais -->
      <p class="fields-label">
        Campos Opcionais
      </p>

      <div style="display: flex; gap: 10px; margin-bottom: 12px;">
        <div style="width: 100%;">
          <inputDesktop placeholder="Margem (%) — opcional" maxlength="3" v-model="formProduto.margem" />
        </div>
        <div style="width: 100%;">
          <inputDesktop placeholder="Preço de venda (calculado)" :disabled="true" v-model="precoVendaForm" />
        </div>
      </div>

      <div style="display: flex; gap: 10px; margin-bottom: 12px;">
        <div style="width: 100%;">
          <inputDesktop placeholder="Categoria — opcional" v-model="formProduto.categoria" />
        </div>
        <div style="width: 100%;">
          <inputDesktop placeholder="Busca rápida — opcional" v-model="formProduto.busca_rapida" />
        </div>
      </div>

      <div style="display: flex; gap: 10px; margin-bottom: 12px;">
        <div style="width: 100%;">
          <inputDesktop placeholder="Código NCM — opcional" v-model="formProduto.ncm" />
        </div>
        <div style="width: 100%;">
          <inputDesktop placeholder="Código CEST — opcional" v-model="formProduto.cest" />
        </div>
        <div style="width: 100%;">
          <inputDesktop placeholder="Origem — opcional" v-model="formProduto.origem" />
        </div>
      </div>

      <div style="display: flex; gap: 10px; margin-bottom: 12px;">
        <div style="width: 100%;">
          <inputDesktop placeholder="Gôndola na loja — opcional" v-model="formProduto.gondula_loja" />
        </div>
        <div style="width: 100%;">
          <inputDesktop placeholder="Gôndola no estoque — opcional" maxlength="16" v-model="formProduto.gondula_estoque" />
        </div>
      </div>

      <!--
      <div class="checkbox-group" style="margin-bottom: 12px;">
        <label class="checkbox-container">
          <input type="checkbox" v-model="formProduto.controle_lote" />
          <span class="checkmark"></span>
          <span class="checkbox-text">Controlar por lote</span>
        </label>
        <label class="checkbox-container">
          <input type="checkbox" v-model="formProduto.ajuste_automatico" />
          <span class="checkmark"></span>
          <span class="checkbox-text">Atualizar preço automaticamente com entrada de produtos</span>
        </label>
      </div>
      -->

      <!-- Botão adicionar / confirmar edição -->
      <div style="display: flex; gap: 10px;">
        <button @click="adicionarProduto" class="btn-adicionar">
          {{ modoEdicao !== null ? '✔ Confirmar edição' : '＋ Adicionar produto à lista' }}
        </button>
        <button v-if="modoEdicao !== null" @click="cancelarEdicao" class="btn-cancelar-edicao">
          Cancelar edição
        </button>
      </div>
    </div>

    <!-- ─────────────────────────────────────────────────────────────
         LISTA de produtos adicionados
    ───────────────────────────────────────────────────────────────── -->
    <div v-if="listaProdutos.length > 0" class="section-card">
      <p class="section-title">
        Produtos na fila
        <span class="badge-contador">{{ listaProdutos.length }}</span>
        <span v-if="xmlFileName" class="badge-xml">via XML</span>
      </p>

      <div class="produto-item" v-for="(p, i) in listaProdutos" :key="i">
        <div class="produto-info">
          <span class="produto-nome">{{ p.nome }}</span>
          <span class="produto-meta">
            EAN: {{ p.codigo_barra }} &nbsp;|&nbsp;
            Custo: R$ {{ Number(p.preco_custo).toFixed(2) }}
            <template v-if="p.margem"> &nbsp;|&nbsp; Margem: {{ p.margem }}% &nbsp;|&nbsp; Venda: R$ {{ calcularVenda(p).toFixed(2) }}</template>
          </span>
        </div>
        <div class="produto-acoes">
          <button @click="editarProduto(i)" class="btn-acao editar">Editar</button>
          <button @click="removerProduto(i)" class="btn-acao remover">Remover</button>
        </div>
      </div>
    </div>

    <!-- ─────────────────────────────────────────────────────────────
         MODAL: Sem conexão / servidor fora do ar
    ───────────────────────────────────────────────────────────────── -->
    <Teleport to="body">
      <transition name="modal-fade">
        <div v-if="modalSemConexao" class="offline-overlay" @click.self="modalSemConexao = false">
          <div class="offline-modal">

            <!-- Ícone animado -->
            <div class="offline-icon-wrap">
              <span class="material-symbols-outlined offline-icon-main">wifi_off</span>
              <span class="offline-icon-pulse"></span>
            </div>

            <!-- Texto -->
            <h2 class="offline-title">Ops… sem conexão!</h2>
            <p class="offline-subtitle">
              Parece que você está <strong>sem internet</strong> ou nosso servidor está
              temporariamente fora do ar.<br />
              Não se preocupe — seus dados estão seguros.
            </p>

            <!-- Resumo do que será salvo -->
            <div class="offline-summary">
              <div class="offline-summary-row">
                <span class="material-symbols-outlined" style="font-size:16px; color:#FF8049;">inventory_2</span>
                <span>{{ listaProdutos.length }} produto(s) preenchido(s)</span>
              </div>
              <div class="offline-summary-row">
                <span class="material-symbols-outlined" style="font-size:16px; color:#FF8049;">store</span>
                <span>Fornecedor: <strong>{{ fornecedor_selecionado.nome_fornecedor || '—' }}</strong></span>
              </div>
              <div class="offline-summary-row">
                <span class="material-symbols-outlined" style="font-size:16px; color:#FF8049;">badge</span>
                <span>CNPJ: <strong>{{ fornecedor_selecionado.cnpj || '—' }}</strong></span>
              </div>
            </div>

            <!-- Instrução de uso -->
            <div class="offline-tip">
              <span class="material-symbols-outlined" style="font-size:16px; vertical-align:middle; margin-right:6px; color:#1a56db;">info</span>
              Baixe o arquivo XML de backup. Quando a conexão voltar, importe-o nesta mesma tela
              usando a área <strong>"Importar via XML"</strong> para cadastrar tudo rapidamente.
            </div>

            <!-- Botões -->
            <div class="offline-actions">
              <button class="btn-download-xml" @click="baixarXMLBackup">
                <span class="material-symbols-outlined" style="font-size:18px; vertical-align:middle; margin-right:8px;">download</span>
                Baixar backup em XML
              </button>
              <button class="btn-fechar-modal" @click="modalSemConexao = false">
                Fechar
              </button>
            </div>

          </div>
        </div>
      </transition>
    </Teleport>

  </div>
</template>

<script>
import TitileSubtitle from '@/components/TitileSubtitle.vue';
import inputDesktop from '@/components/inputDesktop.vue';
import { api } from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import exibeErro from '@/utils/ExibeErro';
import { mapState } from 'pinia';
import { Button } from 'primevue';
import { XMLParser } from 'fast-xml-parser';

///////////////////////////////////////////////////////////////
// Produto em branco — padrão para resetar o formulário
const produtoEmBranco = () => ({
  nome            : null,
  codigo_barra    : null,
  preco_custo     : null,
  margem          : null,
  categoria       : null,
  busca_rapida    : null,
  ncm             : null,
  cest            : null,
  origem          : null,
  gondula_loja    : null,
  gondula_estoque : null,
  ajuste_automatico: false,
  controle_lote   : false,
})

export default {
  name: 'CadastroProdutos',
  components: { TitileSubtitle, inputDesktop, Button },

  data() {
    return {
      loading          : false,
      auth             : null,
      tentouAdicionar  : false,
      modoEdicao       : null,        // null = novo | número = índice em edição

      // XML upload
      isDragging       : false,
      xmlFileName      : null,

      // Modal sem conexão
      modalSemConexao  : false,

      fornecedores: [],
      fornecedor_selecionado: {
        nome_fornecedor: null,
        cnpj           : null,
      },

      formProduto  : produtoEmBranco(),   // formulário ativo
      listaProdutos: [],                  // fila de produtos para envio
    }
  },

  computed: {
    ///////////////////////////////////////////////////////////////
    // Calcula preço de venda do formulário em tempo real
    precoVendaForm() {
      const custo  = parseFloat(this.formProduto.preco_custo)
      const margem = parseFloat(this.formProduto.margem)
      if (!custo || !margem) return null
      return (custo * ((margem / 100) + 1)).toFixed(2)
    },
    ...mapState(useAuthStore, ['id_loja'])
  },

  methods: {

    ///////////////////////////////////////////////////////////////
    // Calcula preço de venda de um produto já na lista
    calcularVenda(p) {
      return p.preco_custo * ((p.margem / 100) + 1)
    },

    ///////////////////////////////////////////////////////////////
    // Seleciona fornecedor pelo dropdown
    SelecionarFornecedor(f) {
      this.fornecedor_selecionado.nome_fornecedor = f.nome_fornecedor
      this.fornecedor_selecionado.cnpj            = f.cnpj
    },

    ///////////////////////////////////////////////////////////////
    // Adiciona produto à lista ou confirma edição
    adicionarProduto() {
      this.tentouAdicionar = true

      if (
        !this.formProduto.nome         ||
        !this.formProduto.codigo_barra ||
        !this.formProduto.preco_custo
      ) {
        this.$toast.info('Preencha os campos obrigatórios: Nome, Código de barras e Preço de custo.')
        return
      }

      const produto = { ...this.formProduto }

      // Remove campos opcionais vazios para não poluir o payload
      Object.keys(produto).forEach(k => {
        if (produto[k] === null || produto[k] === '') delete produto[k]
      })

      if (this.modoEdicao !== null) {
        this.listaProdutos.splice(this.modoEdicao, 1, produto)
        this.modoEdicao = null
      } else {
        this.listaProdutos.push(produto)
      }

      this.formProduto     = produtoEmBranco()
      this.tentouAdicionar = false
    },

    ///////////////////////////////////////////////////////////////
    // Carrega produto da lista de volta no formulário para edição
    editarProduto(i) {
      this.formProduto     = { ...produtoEmBranco(), ...this.listaProdutos[i] }
      this.modoEdicao      = i
      this.tentouAdicionar = false
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },

    cancelarEdicao() {
      this.modoEdicao      = null
      this.formProduto     = produtoEmBranco()
      this.tentouAdicionar = false
    },

    ///////////////////////////////////////////////////////////////
    // Remove produto da lista
    removerProduto(i) {
      this.listaProdutos.splice(i, 1)
      if (this.modoEdicao === i) this.cancelarEdicao()
    },

    ///////////////////////////////////////////////////////////////
    // Envia todos os produtos em um único request
    async CadastrarProd() {
      if (this.listaProdutos.length === 0) {
        this.$toast.info('Adicione ao menos um produto antes de cadastrar.')
        return
      }

      this.loading = true
      try {
        const payload = {
          id_loja    : this.auth.id_loja,
          id_usuario : this.auth.user?.id || this.auth.id_usuario,
          cnpj       : this.fornecedor_selecionado.cnpj,
          produtos   : this.listaProdutos,
        }

        const status_rede = await window.electronAPI.getStatusRede()

        if (status_rede) {
          // ── Online: envia normalmente ────────────────────────
          await api.post('/mvpu/produto/cadastroProduto', payload)
          this.$toast.success('Produto(s) cadastrado(s) com sucesso!')
          this.limparTudo()
        } else {
          // ── Offline: abre modal com opção de baixar backup XML
          this.modalSemConexao = true
        }

      } catch (e) {
        exibeErro(e, this.$toast)
      } finally {
        this.loading = false
      }
    },

    ///////////////////////////////////////////////////////////////
    // Gera e faz download de um XML de backup compatível com o
    // leitor da tela (lerXML), estruturado como NF-e simplificada
    baixarXMLBackup() {
      const fornecedor = this.fornecedor_selecionado
      const agora      = new Date()
      const timestamp  = agora.toISOString().replace(/[:.]/g, '-').slice(0, 19)

      // Constrói as linhas <det> de cada produto
      const itens = this.listaProdutos.map((p, idx) => {
        const nItem = idx + 1
        return `
    <det nItem="${nItem}">
      <prod>
        <cEAN>${p.codigo_barra || ''}</cEAN>
        <xProd>${this.escapeXml(p.nome || '')}</xProd>
        <NCM>${p.ncm || ''}</NCM>
        <CEST>${p.cest || ''}</CEST>
        <orig>${p.origem || '0'}</orig>
        <uCom>UN</uCom>
        <qCom>1.0000</qCom>
        <vUnCom>${Number(p.preco_custo || 0).toFixed(4)}</vUnCom>
        <qTrib>1.0000</qTrib>
        <uTrib>UN</uTrib>
        <vUnTrib>${Number(p.preco_custo || 0).toFixed(4)}</vUnTrib>${p.margem ? `
        <xPed_margem>${p.margem}</xPed_margem>` : ''}${p.categoria ? `
        <xPed_categoria>${this.escapeXml(p.categoria)}</xPed_categoria>` : ''}${p.busca_rapida ? `
        <xPed_busca_rapida>${this.escapeXml(p.busca_rapida)}</xPed_busca_rapida>` : ''}${p.gondula_loja ? `
        <xPed_gondula_loja>${this.escapeXml(p.gondula_loja)}</xPed_gondula_loja>` : ''}${p.gondula_estoque ? `
        <xPed_gondula_estoque>${this.escapeXml(p.gondula_estoque)}</xPed_gondula_estoque>` : ''}
      </prod>
    </det>`
      }).join('')

      // Monta o XML completo no padrão que lerXML() sabe consumir (nfeProc > NFe > infNFe)
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Backup de cadastro gerado em ${agora.toLocaleString('pt-BR')} -->
<!-- Importe este arquivo na tela "Cadastro de Produtos > Importar via XML" -->
<nfeProc>
  <NFe>
    <infNFe>
      <emit>
        <CNPJ>${fornecedor.cnpj || ''}</CNPJ>
        <xNome>${this.escapeXml(fornecedor.nome_fornecedor || '')}</xNome>
      </emit>${itens}
    </infNFe>
  </NFe>
</nfeProc>`

      // Dispara o download no navegador
      const blob = new Blob([xml], { type: 'application/xml;charset=utf-8;' })
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `backup_cadastro_${timestamp}.xml`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      this.$toast.success('Backup XML baixado com sucesso!')
    },

    ///////////////////////////////////////////////////////////////
    // Escapa caracteres especiais para XML válido
    escapeXml(str) {
      return String(str)
        .replace(/&/g,  '&amp;')
        .replace(/</g,  '&lt;')
        .replace(/>/g,  '&gt;')
        .replace(/"/g,  '&quot;')
        .replace(/'/g,  '&apos;')
    },

    ///////////////////////////////////////////////////////////////
    // Reseta tudo
    limparTudo() {
      this.listaProdutos          = []
      this.formProduto            = produtoEmBranco()
      this.fornecedor_selecionado = { nome_fornecedor: null, cnpj: null }
      this.modoEdicao             = null
      this.tentouAdicionar        = false
      this.xmlFileName            = null
      this.modalSemConexao        = false
      if (this.$refs.xmlInput) this.$refs.xmlInput.value = ''
    },

    ///////////////////////////////////////////////////////////////
    // Remove apenas o XML (mantém produtos adicionados manualmente)
    limparXML() {
      this.xmlFileName  = null
      this.listaProdutos = []
      if (this.$refs.xmlInput) this.$refs.xmlInput.value = ''
    },

    ///////////////////////////////////////////////////////////////
    // Busca fornecedores disponíveis para a loja
    async getFornecedores() {
      try {
        const res = await api.get(`/mvpu/produto/consultarFornecedores/${this.auth.id_loja}`)
        this.fornecedores = res.data.data
      } catch (e) {
        exibeErro(e, this.$toast)
      }
    },

    ///////////////////////////////////////////////////////////////
    // Handlers de drag & drop / input de arquivo XML
    onDrop(event) {
      this.isDragging = false
      const file = event.dataTransfer.files[0]
      if (file) this.processarArquivoXML(file)
    },

    onFileChange(event) {
      const file = event.target.files[0]
      if (file) this.processarArquivoXML(file)
    },

    processarArquivoXML(file) {
      if (!file.name.endsWith('.xml')) {
        this.$toast.error('Somente arquivos .xml são aceitos.')
        return
      }
      const reader = new FileReader()
      reader.onload = (e) => this.lerXML(e.target.result, file.name)
      reader.readAsText(file)
    },

    ///////////////////////////////////////////////////////////////
    // Faz o parse do XML de NF-e e preenche listaProdutos
    lerXML(xmlString, fileName) {
      const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '' })
      try {
        const json    = parser.parse(xmlString)
        const infoNFe = json?.nfeProc?.NFe?.infNFe || json?.NFe?.infNFe

        if (!infoNFe?.det) {
          this.$toast.error('XML inválido ou sem produtos.')
          return
        }

        // Preenche fornecedor automaticamente com dados do emitente
        const nomeFornecedor = infoNFe?.emit?.xNome || null
        const cnpjFornecedor = infoNFe?.emit?.CNPJ  || infoNFe?.emit?.CPF || null

        if (nomeFornecedor || cnpjFornecedor) {
          this.fornecedor_selecionado.nome_fornecedor = nomeFornecedor
          this.fornecedor_selecionado.cnpj            = cnpjFornecedor
        }

        const itens = Array.isArray(infoNFe.det) ? infoNFe.det : [infoNFe.det]

        this.listaProdutos = itens.map((element) => {
          const prod       = element.prod || {}
          const qCom       = parseFloat(prod.qCom || 1)
          const qTrib      = parseFloat(prod.qTrib || 1)
          const fator      = qTrib > qCom ? Math.round(qTrib / qCom) : 1
          const precoCusto = parseFloat(prod.vUnCom || 0)

          const ncm  = prod.NCM  ? String(prod.NCM)  : null
          const cest = prod.CEST ? String(prod.CEST) : null

          const produto = {
            nome            : prod.xProd       || null,
            codigo_barra    : String(prod.cEAN || ''),
            preco_custo     : precoCusto,
            margem          : prod.xPed_margem          || null,
            categoria       : prod.xPed_categoria       || null,
            busca_rapida    : prod.xPed_busca_rapida    || null,
            ncm,
            cest,
            origem          : prod.orig ? String(prod.orig) : null,
            gondula_loja    : prod.xPed_gondula_loja    || null,
            gondula_estoque : prod.xPed_gondula_estoque || null,
            ajuste_automatico: false,
            controle_lote   : false,
            _quantidade_unit: fator,
          }

          // Remove campos nulos para não poluir o payload
          Object.keys(produto).forEach(k => {
            if (produto[k] === null || produto[k] === '') delete produto[k]
          })

          return produto
        })

        this.xmlFileName = fileName
        this.$toast.success(`${this.listaProdutos.length} produto(s) importado(s) do XML!`)

      } catch (error) {
        console.error(error)
        this.$toast.error('Erro ao processar o arquivo XML.')
      }
    },
  },

  mounted() {
    this.auth = useAuthStore()
    this.getFornecedores()
  }
}
</script>

<style scoped>
.totalPage {
  width: 100%;
  min-height: 100vh;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* ── Ações do topo ───────────────────────────────────────────── */
.top-actions {
  display: flex;
  gap: 10px;
  margin-top: 12px;
  margin-bottom: 4px;
}

/* ── Cards de seção ─────────────────────────────────────────── */
.section-card {
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 18px 20px;
  margin-top: 16px;
}

.section-title {
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  font-size: 14px;
  color: #222;
  margin: 0 0 14px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.fields-label {
  font-family: 'Poppins', sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.optional-label {
  color: #888;
  margin-top: 14px;
}

/* ── Badges ─────────────────────────────────────────────────── */
.required-badge {
  background-color: #FF8049;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 20px;
  font-family: 'Poppins', sans-serif;
  letter-spacing: 0.02em;
}

.badge-contador {
  background-color: #444;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 20px;
  font-family: 'Poppins', sans-serif;
}

.badge-xml {
  background-color: #e8f0fe;
  color: #1a56db;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 20px;
  font-family: 'Poppins', sans-serif;
}

/* ── XML Dropzone ───────────────────────────────────────────── */
.xml-dropzone {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 28px 20px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
  background: #fafafa;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  user-select: none;
}

.xml-dropzone:hover,
.dropzone-over {
  border-color: #FF8049;
  background: #fff5f0;
}

.dropzone-loaded {
  border-color: #22c55e;
  background: #f0fdf4;
}

.dropzone-icon {
  font-size: 36px;
  color: #aaa;
}

.dropzone-loaded .dropzone-icon {
  color: #22c55e;
}

.dropzone-over .dropzone-icon {
  color: #FF8049;
}

.dropzone-label {
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #444;
  margin: 0;
}

.dropzone-hint {
  font-family: 'Poppins', sans-serif;
  font-size: 12px;
  color: #999;
  margin: 0;
}

/* ── Status bar do XML ──────────────────────────────────────── */
.xml-status-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 6px;
  padding: 8px 14px;
}

.xml-badge-ok {
  font-family: 'Poppins', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: #15803d;
  display: flex;
  align-items: center;
  gap: 4px;
}

.btn-limpar-xml {
  font-family: 'Poppins', sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: #c81e1e;
  background: #fde8e8;
  border: none;
  border-radius: 5px;
  padding: 5px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: background 0.2s;
}

.btn-limpar-xml:hover {
  background: #fbc5c5;
}

/* ── Lista de produtos ──────────────────────────────────────── */
.produto-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 10px 14px;
  margin-bottom: 8px;
}

.produto-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.produto-nome {
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #222;
}

.produto-meta {
  font-family: 'Poppins', sans-serif;
  font-size: 12px;
  color: #666;
}

.produto-acoes {
  display: flex;
  gap: 6px;
}

.btn-acao {
  font-family: 'Poppins', sans-serif;
  font-size: 12px;
  font-weight: 600;
  padding: 5px 14px;
  border-radius: 5px;
  border: none;
  cursor: pointer;
}

.btn-acao.editar {
  background-color: #e8f0fe;
  color: #1a56db;
}

.btn-acao.editar:hover {
  background-color: #c7d7fc;
}

.btn-acao.remover {
  background-color: #fde8e8;
  color: #c81e1e;
}

.btn-acao.remover:hover {
  background-color: #fbc5c5;
}

/* ── Botão adicionar ────────────────────────────────────────── */
.btn-adicionar {
  width: 100%;
  height: 44px;
  background-color: #222;
  color: #fff;
  border: none;
  border-radius: 5px;
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-adicionar:hover {
  background-color: #444;
}

.btn-cancelar-edicao {
  width: 180px;
  height: 44px;
  background-color: #f0f0f0;
  color: #555;
  border: none;
  border-radius: 5px;
  font-family: 'Poppins', sans-serif;
  font-size: 13px;
  cursor: pointer;
}

/* ── Botões do topo ─────────────────────────────────────────── */
.btn-limpar {
  width: 100%;
  background-color: #888;
  color: #fff;
  border-radius: 5px;
  border: none;
  height: 50px;
  cursor: pointer;
  font-family: 'Poppins', sans-serif;
}

/* ── Input com erro ─────────────────────────────────────────── */
:deep(.input-erro input) {
  border-color: #e53e3e !important;
}

/* ── PrimeVue Button ────────────────────────────────────────── */
:deep(.btn-sbmt.p-button) {
  background-color: #FF8049 !important;
  color: #fff !important;
  border: none !important;
  width: 100%;
  height: 50px;
}

:deep(.btn-sbmt.p-button:hover) {
  background-color: #ce673b !important;
}

:deep(.btn-sbmt.p-button:disabled) {
  opacity: 0.5 !important;
  cursor: not-allowed !important;
}

/* ── Dropdown de fornecedor ─────────────────────────────────── */
.dropdown-item {
  height: 40px;
  width: 100%;
  text-align: start;
  padding-left: 15px;
  border: solid 1px #ccc;
  background-color: #f7f7f7;
  cursor: pointer;
  font-family: 'Poppins', sans-serif;
}

.dropdown-item:hover {
  background-color: #eee;
}

/* ── Checkboxes ─────────────────────────────────────────────── */
.checkbox-group {
  display: flex;
  flex-direction: row;
  gap: 30px;
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
  flex-shrink: 0;
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

/* ─────────────────────────────────────────────────────────────
   MODAL SEM CONEXÃO
───────────────────────────────────────────────────────────────── */
.offline-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.offline-modal {
  background: #fff;
  border-radius: 16px;
  padding: 36px 32px 28px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 24px 60px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  font-family: 'Poppins', sans-serif;
}

/* ── Ícone animado ──────────────────────────────────────────── */
.offline-icon-wrap {
  position: relative;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.offline-icon-main {
  font-size: 48px;
  color: #FF8049;
  position: relative;
  z-index: 1;
}

.offline-icon-pulse {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: rgba(255, 128, 73, 0.15);
  animation: pulse-ring 2s ease-out infinite;
}

@keyframes pulse-ring {
  0%   { transform: scale(0.8); opacity: 0.8; }
  70%  { transform: scale(1.3); opacity: 0; }
  100% { transform: scale(1.3); opacity: 0; }
}

/* ── Textos ─────────────────────────────────────────────────── */
.offline-title {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  text-align: center;
}

.offline-subtitle {
  font-size: 14px;
  color: #555;
  text-align: center;
  line-height: 1.6;
  margin: 0;
}

/* ── Resumo ─────────────────────────────────────────────────── */
.offline-summary {
  width: 100%;
  background: #f9f9f9;
  border: 1px solid #e5e5e5;
  border-radius: 10px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.offline-summary-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #333;
}

/* ── Dica de uso ────────────────────────────────────────────── */
.offline-tip {
  width: 100%;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  padding: 12px 14px;
  font-size: 13px;
  color: #1e40af;
  line-height: 1.5;
}

/* ── Botões do modal ────────────────────────────────────────── */
.offline-actions {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 4px;
}

.btn-download-xml {
  width: 100%;
  height: 48px;
  background-color: #FF8049;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.btn-download-xml:hover {
  background-color: #ce673b;
}

.btn-fechar-modal {
  width: 100%;
  height: 40px;
  background: transparent;
  color: #888;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-family: 'Poppins', sans-serif;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.btn-fechar-modal:hover {
  background: #f5f5f5;
  color: #444;
}

/* ── Animação de entrada/saída do modal ─────────────────────── */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}

.modal-fade-enter-active .offline-modal,
.modal-fade-leave-active .offline-modal {
  transition: transform 0.25s ease, opacity 0.25s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .offline-modal {
  transform: translateY(20px);
  opacity: 0;
}

.modal-fade-leave-to .offline-modal {
  transform: translateY(20px);
  opacity: 0;
}
</style>