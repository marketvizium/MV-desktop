<template>
  <transition name="mv-fade">
    <div v-if="visible" class="mv-import-overlay" @click.self="tentarFechar">
      <div class="mv-import-modal">
        <!-- header -->
        <div class="mv-import-header">
          <div class="mv-import-header-title">
            <span class="msr" style="font-size:22px;color:var(--primary)">upload_file</span>
            <div>
              <h2>Importar produtos via TXT</h2>
              <p>{{ headerSubtitulo }}</p>
            </div>
          </div>
          <button class="mv-import-close" title="Fechar" @click="tentarFechar">
            <span class="msr">close</span>
          </button>
        </div>

        <!-- stepper -->
        <div class="mv-import-stepper" v-if="step > 0 && step < 4">
          <div
            v-for="(rotulo, i) in etapas"
            :key="rotulo"
            class="mv-step"
            :class="{ active: stepAtualIndex === i, done: stepAtualIndex > i }"
          >
            <span class="mv-step-dot">
              <span v-if="stepAtualIndex > i" class="msr" style="font-size:14px">check</span>
              <span v-else>{{ i + 1 }}</span>
            </span>
            <span class="mv-step-label">{{ rotulo }}</span>
          </div>
        </div>

        <div class="mv-import-body">
          <!-- ETAPA 0: upload -->
          <div
            v-if="step === 0"
            class="mv-import-drop"
            :class="{ dragover: dragOver }"
            @dragover.prevent="dragOver = true"
            @dragleave.prevent="dragOver = false"
            @drop.prevent="onDrop"
            @click="$refs.fileInput.click()"
          >
            <input
              ref="fileInput"
              type="file"
              accept=".txt,.csv"
              style="display:none"
              @change="onFileInputChange"
            >
            <span class="msr" style="font-size:44px;color:var(--primary)">upload_file</span>
            <p class="mv-import-drop-title"><strong>Arraste o arquivo .txt aqui</strong><br>ou clique para selecionar</p>
            <button class="mv-btn-primary" @click.stop="$refs.fileInput.click()">Escolher arquivo</button>
            <p v-if="erroArquivo" class="mv-import-error">
              <span class="msr" style="font-size:16px">error</span>{{ erroArquivo }}
            </p>
            <p class="mv-import-drop-hint">
              Detectamos automaticamente o encoding, o delimitador e o cabeçalho do arquivo.
              Você poderá ajustar tudo isso no próximo passo.
            </p>
          </div>

          <!-- ETAPA 1: leitura do arquivo -->
          <div v-else-if="step === 1" class="mv-import-config">
            <div class="mv-import-config-grid">
              <div class="mv-import-field">
                <span>Encoding</span>
                <select v-model="encodingSelecionado">
                  <option v-for="e in encodingsDisponiveis" :key="e.value" :value="e.value">{{ e.label }}</option>
                </select>
                <small>Detectado automaticamente: {{ labelEncoding(encodingDetectado) }}</small>
              </div>

              <div class="mv-import-field">
                <span>Delimitador</span>
                <select v-model="delimiterSelecionado" :disabled="modoLarguraFixa">
                  <option v-for="d in delimitadoresDisponiveis" :key="d.value" :value="d.value">{{ d.label }}</option>
                </select>
                <input
                  v-if="delimiterSelecionado === 'custom'"
                  v-model="delimiterCustom"
                  class="mv-import-input-inline"
                  placeholder="Digite o delimitador, ex: ##"
                >
                <small v-if="!modoLarguraFixa">Detectado automaticamente: {{ labelDelimitador(delimiterDetectado) }}</small>
              </div>

              <div class="mv-import-field">
                <span>Qualificador de texto (aspas)</span>
                <select v-model="qualificadorTexto">
                  <option value="&quot;">Aspas duplas ( " )</option>
                  <option value="'">Aspas simples ( ' )</option>
                  <option value="">Nenhum</option>
                </select>
              </div>

              <div class="mv-import-field">
                <span>Separador decimal (quantidade)</span>
                <select v-model="separadorDecimal">
                  <option value=",">Vírgula — 10,50</option>
                  <option value=".">Ponto — 10.50</option>
                </select>
              </div>
            </div>

            <label class="mv-import-toggle">
              <input type="checkbox" v-model="modoLarguraFixa">
              Arquivo de largura fixa (colunas sem delimitador, alinhadas por posição)
            </label>
            <div v-if="modoLarguraFixa" class="mv-import-field mv-import-largura-fixa">
              <span>Posições iniciais de cada coluna (separadas por vírgula)</span>
              <input v-model="larguraFixaPosicoes" class="mv-import-input-inline" placeholder="Ex: 0,14,20,60,90">
              <small>Comum em sistemas antigos de farmácia. Use o índice do primeiro caractere de cada coluna.</small>
            </div>

            <label class="mv-import-toggle">
              <input type="checkbox" v-model="primeiraLinhaCabecalho">
              A primeira linha é um cabeçalho (não é um produto)
            </label>

            <p v-if="erroConfiguracao" class="mv-import-error">
              <span class="msr" style="font-size:16px">error</span>{{ erroConfiguracao }}
            </p>

            <div class="mv-import-table-wrap">
              <table class="mv-import-table">
                <thead>
                  <tr>
                    <th v-for="n in numeroColunasExibicao" :key="n">Coluna {{ n }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(r, ri) in previewLinhas" :key="ri" :class="{ header: primeiraLinhaCabecalho && ri === 0 }">
                    <td v-for="n in numeroColunasExibicao" :key="n">{{ r[n - 1] }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <small class="mv-import-preview-hint">
              Pré-visualização de {{ previewLinhas.length }} linha(s) de {{ linhasTexto.length }} encontradas no arquivo.
            </small>
          </div>

          <!-- ETAPA 2: mapeamento de colunas -->
          <div v-else-if="step === 2" class="mv-import-mapeamento">
            <div class="mv-import-pergunta" :style="{ borderColor: perguntaAtualObj.cor }">
              <span class="msr" style="font-size:28px" :style="{ color: perguntaAtualObj.cor }">{{ perguntaAtualObj.icone }}</span>
              <div>
                <strong>{{ perguntaAtualObj.texto }}</strong>
                <span class="mv-import-pergunta-sub">Clique em uma das colunas da tabela abaixo para selecioná-la</span>
              </div>
            </div>

            <div class="mv-import-mapeamento-progresso">
              <button
                v-for="(p, i) in perguntas"
                :key="p.key"
                type="button"
                class="mv-mapchip"
                :class="{ done: mapeamento[p.key] !== null, current: i === perguntaAtual }"
                :style="mapeamento[p.key] !== null ? { background: p.cor, borderColor: p.cor } : {}"
                @click="perguntaAtual = i"
              >
                {{ p.label }}<template v-if="mapeamento[p.key] !== null"> · Coluna {{ mapeamento[p.key] + 1 }}</template>
              </button>
            </div>

            <div class="mv-import-table-wrap">
              <table class="mv-import-table clicavel">
                <thead>
                  <tr>
                    <th
                      v-for="n in numeroColunasExibicao"
                      :key="n"
                      :style="colunaEstilo(n - 1)"
                      @click="selecionarColuna(n - 1)"
                    >
                      Coluna {{ n }}
                      <span v-if="colunaJaMapeadaLabel(n - 1)" class="mv-import-col-badge">{{ colunaJaMapeadaLabel(n - 1) }}</span>
                      <span v-else class="mv-import-col-select">selecionar ↑</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(r, ri) in amostraMapeamento" :key="ri">
                    <td v-for="n in numeroColunasExibicao" :key="n" @click="selecionarColuna(n - 1)">{{ r[n - 1] }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- ETAPA 3: resumo -->
          <div v-else class="mv-import-resumo">
            <div class="mv-import-resumo-stats">
              <span class="mv-import-resumo-ok">
                <span class="msr" style="font-size:18px">task_alt</span>
                {{ resumoStats.validos }} produto{{ resumoStats.validos === 1 ? '' : 's' }} pronto{{ resumoStats.validos === 1 ? '' : 's' }} para importar
              </span>
              <span v-if="resumoStats.invalidos" class="mv-import-resumo-warn">
                <span class="msr" style="font-size:18px">warning</span>
                {{ resumoStats.invalidos }} linha{{ resumoStats.invalidos === 1 ? '' : 's' }} ignorada{{ resumoStats.invalidos === 1 ? '' : 's' }} (sem nome, código ou quantidade)
              </span>
            </div>

            <div class="mv-import-resumo-toolbar">
              <div class="mv-import-search">
                <span class="msr">search</span>
                <input v-model="buscaResumo" placeholder="Buscar por nome ou código...">
              </div>
              <button type="button" class="mv-btn-ghost small" @click="reiniciar">
                <span class="msr" style="font-size:16px">restart_alt</span> Recomeçar importação
              </button>
            </div>

            <div class="mv-import-table-wrap resumo">
              <table class="mv-import-table resumo">
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Código de barras</th>
                    <th style="width:120px">Quantidade</th>
                    <th style="width:44px"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="p in produtosFiltrados" :key="p.id" :class="{ invalido: !p.valido }">
                    <td>{{ p.nome || '—' }}</td>
                    <td class="mono">{{ p.codigo_barra || '—' }}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        v-model.number="p.quantidade"
                        class="mv-import-qty-input"
                        @change="revalidarProduto(p)"
                      >
                    </td>
                    <td>
                      <button class="mv-import-remove" title="Remover produto" @click="removerProduto(p.id)">
                        <span class="msr">delete</span>
                      </button>
                    </td>
                  </tr>
                  <tr v-if="!produtosFiltrados.length">
                    <td colspan="4" class="mv-import-empty">Nenhum produto encontrado.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- footer -->
        <div class="mv-import-footer" v-if="step > 0">
          <button v-if="step > 1" type="button" class="mv-btn-ghost" @click="voltarEtapa">
            <span class="msr" style="font-size:18px">arrow_back</span>Voltar
          </button>
          <button v-else type="button" class="mv-btn-ghost" @click="tentarFechar">Cancelar</button>

          <div class="mv-import-footer-right">
            <button
              v-if="step === 1"
              type="button"
              class="mv-btn-primary"
              :disabled="!!erroConfiguracao"
              @click="iniciarMapeamento"
            >
              Continuar<span class="msr" style="font-size:18px">arrow_forward</span>
            </button>

            <button
              v-if="step === 3"
              type="button"
              class="mv-btn-primary"
              :disabled="!resumoStats.validos || enviando"
              @click="enviarProdutos"
            >
              <span class="msr" style="font-size:18px">cloud_upload</span>
              {{ enviando ? 'Importando...' : `Importar ${resumoStats.validos} produto${resumoStats.validos === 1 ? '' : 's'}` }}
            </button>
          </div>
        </div>

        <!-- overlay de envio -->
        <div v-if="enviando" class="mv-import-sending-overlay">
          <div class="mv-import-spinner"></div>
          <p><strong>Importando seus produtos...</strong></p>
          <p class="mv-import-sending-sub">
            Isso pode levar alguns minutos, pois cada item é conferido no catálogo antes de ser adicionado.
          </p>
        </div>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
// Ajuste os imports abaixo para o caminho real usado no restante do seu projeto
// (mesmo padrão usado no exemplo de adicionarProduto que você enviou).

import { api } from '@/services/api';
import exibeErro from '@/utils/ExibeErro';

interface Pergunta {
  key: 'nome' | 'codigo_barra' | 'quantidade';
  label: string;
  texto: string;
  icone: string;
  cor: string;
}

interface ProdutoResumo {
  id: string;
  nome: string;
  codigo_barra: string;
  quantidade: number;
  tipo: string;
  qtd_unitaria_composicao: number;
  selecionado: boolean;
  valido: boolean;
}

const ENCODINGS = [
  { value: 'utf-8', label: 'UTF-8' },
  { value: 'utf-8-bom', label: 'UTF-8 com BOM' },
  { value: 'windows-1252', label: 'Windows-1252 (ANSI)' },
  { value: 'iso-8859-1', label: 'ISO-8859-1 (Latin-1)' },
  { value: 'utf-16le', label: 'UTF-16 LE' },
  { value: 'utf-16be', label: 'UTF-16 BE' },
];

const DELIMITADORES = [
  { value: ';', label: 'Ponto e vírgula ( ; )' },
  { value: ',', label: 'Vírgula ( , )' },
  { value: '\t', label: 'Tabulação' },
  { value: '|', label: 'Pipe ( | )' },
  { value: ':', label: 'Dois pontos ( : )' },
  { value: '^', label: 'Circunflexo ( ^ )' },
  { value: '~', label: 'Til ( ~ )' },
  { value: '#', label: 'Cerquilha ( # )' },
  { value: 'espacos', label: 'Espaços múltiplos' },
  { value: 'custom', label: 'Outro...' },
];

const PERGUNTAS: Pergunta[] = [
  { key: 'nome', label: 'Nome', texto: 'Selecione a coluna do nome do produto', icone: 'inventory_2', cor: '#5B4B8A' },
  { key: 'codigo_barra', label: 'Código de barras', texto: 'Selecione a coluna do código de barras do produto', icone: 'qr_code_2', cor: '#2F8F6E' },
  { key: 'quantidade', label: 'Quantidade', texto: 'Selecione a coluna da quantidade do produto', icone: 'numbers', cor: '#FF8049' },
];

export default defineComponent({
  name: 'MarvizImportarProdutosTxt',

  props: {
    visible: { type: Boolean, default: false },
    idCotacaoLocal: { type: [String, Number] as PropType<string | number>, required: true },
    auth: { type: Object as PropType<{ id_loja: string | number }>, required: true },
  },

  emits: ['close', 'importado'],

  data() {
    return {
      step: 0,
      etapas: ['Leitura do arquivo', 'Mapear colunas', 'Resumo'],

      dragOver: false,
      erroArquivo: '',
      arquivoNome: '',
      bufferOriginal: null as ArrayBuffer | null,
      rawText: '',

      encodingsDisponiveis: ENCODINGS,
      delimitadoresDisponiveis: DELIMITADORES,
      encodingDetectado: '',
      encodingSelecionado: 'utf-8',
      delimiterDetectado: '',
      delimiterSelecionado: ';',
      delimiterCustom: '',
      modoLarguraFixa: false,
      larguraFixaPosicoes: '',
      qualificadorTexto: '"',
      primeiraLinhaCabecalho: false,
      separadorDecimal: ',',

      perguntas: PERGUNTAS,
      perguntaAtual: 0,
      mapeamento: { nome: null, codigo_barra: null, quantidade: null } as Record<string, number | null>,

      produtos: [] as ProdutoResumo[],
      buscaResumo: '',

      enviando: false,
    };
  },

  watch: {
    visible(novo: boolean) {
      if (novo) this.reiniciar();
    },
    encodingSelecionado(novo: string) {
      if (this.bufferOriginal) this.rawText = this.decodeComEncoding(this.bufferOriginal, novo);
    },
  },

  computed: {
    stepAtualIndex(): number {
      return this.step - 1;
    },
    headerSubtitulo(): string {
      const mapa: Record<number, string> = {
        0: 'Envie um arquivo .txt para começar a importação em lote.',
        1: 'Passo 1 de 3 · Confira como o arquivo está sendo lido.',
        2: `Passo 2 de 3 · Pergunta ${this.perguntaAtual + 1} de ${this.perguntas.length}.`,
        3: 'Passo 3 de 3 · Revise, ajuste e importe.',
      };
      return mapa[this.step] || '';
    },

    linhasTexto(): string[] {
      return this.rawText ? this.rawText.split(/\r\n|\r|\n/).filter((l) => l.length > 0) : [];
    },
    delimitadorEfetivo(): string {
      return this.delimiterSelecionado === 'custom' ? this.delimiterCustom : this.delimiterSelecionado;
    },
    posicoesFixas(): number[] {
      return this.larguraFixaPosicoes
        .split(',')
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n))
        .sort((a, b) => a - b);
    },
    todasLinhasParseadas(): string[][] {
      if (!this.linhasTexto.length) return [];
      if (this.modoLarguraFixa) {
        return this.linhasTexto.map((l) => this.parseLarguraFixa(l, this.posicoesFixas));
      }
      const qualificador = this.qualificadorTexto;
      return this.linhasTexto.map((l) => this.parseLinha(l, this.delimitadorEfetivo, qualificador));
    },
    numeroColunas(): number {
      return this.todasLinhasParseadas.slice(0, 30).reduce((max, r) => Math.max(max, r.length), 0);
    },
    numeroColunasExibicao(): number {
      return Math.max(1, this.numeroColunas);
    },
    previewLinhas(): string[][] {
      return this.todasLinhasParseadas.slice(0, 12);
    },
    linhasDados(): string[][] {
      return this.primeiraLinhaCabecalho ? this.todasLinhasParseadas.slice(1) : this.todasLinhasParseadas;
    },
    linhasParaMapeamento(): string[][] {
      return this.linhasDados;
    },
    amostraMapeamento(): string[][] {
      return this.linhasParaMapeamento.slice(0, 8);
    },

    erroConfiguracao(): string {
      if (this.modoLarguraFixa) {
        if (this.posicoesFixas.length < 2) return 'Informe pelo menos duas posições de coluna, separadas por vírgula.';
        return '';
      }
      if (this.delimiterSelecionado === 'custom' && !this.delimiterCustom) return 'Informe o delimitador personalizado.';
      if (this.numeroColunas < 2) return 'Não conseguimos identificar colunas separadas. Ajuste o delimitador ou ative largura fixa.';
      return '';
    },

    perguntaAtualObj(): Pergunta {
      return this.perguntas[this.perguntaAtual];
    },

    resumoStats(): { validos: number; invalidos: number } {
      const validos = this.produtos.filter((p) => p.valido && p.selecionado).length;
      const invalidos = this.produtos.filter((p) => !p.valido).length;
      return { validos, invalidos };
    },
    produtosFiltrados(): ProdutoResumo[] {
      const termo = this.buscaResumo.trim().toLowerCase();
      if (!termo) return this.produtos;
      return this.produtos.filter(
        (p) => p.nome.toLowerCase().includes(termo) || p.codigo_barra.toLowerCase().includes(termo)
      );
    },
  },

  methods: {
    // ---------- upload ----------
    onFileInputChange(e: Event) {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) this.processarArquivo(file);
      (e.target as HTMLInputElement).value = '';
    },
    onDrop(e: DragEvent) {
      this.dragOver = false;
      const file = e.dataTransfer?.files?.[0];
      if (file) this.processarArquivo(file);
    },
    async processarArquivo(file: File) {
      this.erroArquivo = '';
      const nomeLower = file.name.toLowerCase();
      if (!nomeLower.endsWith('.txt') && !nomeLower.endsWith('.csv')) {
        this.erroArquivo = 'Envie um arquivo .txt ou .csv';
        return;
      }
      if (file.size > 15 * 1024 * 1024) {
        this.erroArquivo = 'Arquivo muito grande (máximo 15MB).';
        return;
      }

      this.arquivoNome = file.name;
      const buffer = await file.arrayBuffer();
      this.bufferOriginal = buffer;

      const enc = this.detectarEncoding(buffer);
      this.encodingDetectado = enc;
      this.encodingSelecionado = enc;
      this.rawText = this.decodeComEncoding(buffer, enc);

      const linhasBrutas = this.rawText.split(/\r\n|\r|\n/).filter((l) => l.length > 0);
      if (!linhasBrutas.length) {
        this.erroArquivo = 'Não encontramos linhas com conteúdo nesse arquivo.';
        return;
      }

      const delim = this.detectarDelimitador(linhasBrutas);
      this.delimiterDetectado = delim;
      if (delim === 'espacos' && this.pareceLarguraFixa(linhasBrutas)) {
        this.modoLarguraFixa = true;
        this.delimiterSelecionado = ';';
      } else {
        this.modoLarguraFixa = false;
        this.delimiterSelecionado = delim;
      }

      //Corrigir o erro ao adicionar $toast, e adicionar aos "nao cadastrado" aqueles que não estão cadastrados no sistema ao invés de ignorar

      await this.$nextTick();
      const linhasParseadas = this.todasLinhasParseadas;
      this.primeiraLinhaCabecalho = this.detectarCabecalho(linhasParseadas);

      this.step = 1;
    },

    // ---------- detecção ----------
    detectarEncoding(buffer: ArrayBuffer): string {
      const bytes = new Uint8Array(buffer.slice(0, 4));
      if (bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF) return 'utf-8-bom';
      if (bytes[0] === 0xFF && bytes[1] === 0xFE) return 'utf-16le';
      if (bytes[0] === 0xFE && bytes[1] === 0xFF) return 'utf-16be';
      try {
        new TextDecoder('utf-8', { fatal: true }).decode(buffer);
        return 'utf-8';
      } catch {
        return 'windows-1252';
      }
    },
    decodeComEncoding(buffer: ArrayBuffer, encoding: string): string {
      const enc = encoding === 'utf-8-bom' ? 'utf-8' : encoding;
      let texto = '';
      try {
        texto = new TextDecoder(enc).decode(buffer);
      } catch {
        texto = new TextDecoder('utf-8').decode(buffer);
      }
      return texto.replace(/^\uFEFF/, '');
    },
    labelEncoding(v: string): string {
      return this.encodingsDisponiveis.find((e) => e.value === v)?.label || v;
    },
    labelDelimitador(v: string): string {
      return this.delimitadoresDisponiveis.find((d) => d.value === v)?.label || v;
    },

    detectarDelimitador(linhas: string[]): string {
      const candidatos = [';', ',', '\t', '|', ':', '^', '~', '#'];
      const amostra = linhas.slice(0, 20);
      let melhor = 'espacos';
      let melhorScore = 0;
      for (const d of candidatos) {
        const contagens = amostra.map((l) => l.split(d).length - 1);
        const maxOcorr = Math.max(...contagens);
        if (maxOcorr === 0) continue;
        const contagemMax = contagens.filter((c) => c === maxOcorr).length;
        const score = maxOcorr * 1000 + (contagemMax / amostra.length) * 100;
        if (score > melhorScore) { melhorScore = score; melhor = d; }
      }
      return melhorScore > 0 ? melhor : 'espacos';
    },
    pareceLarguraFixa(linhas: string[]): boolean {
      const amostra = linhas.slice(0, 20);
      if (amostra.length < 3) return false;
      const tamanhos = amostra.map((l) => l.length);
      const media = tamanhos.reduce((a, b) => a + b, 0) / tamanhos.length;
      return tamanhos.every((t) => Math.abs(t - media) <= media * 0.1);
    },
    detectarCabecalho(linhas: string[][]): boolean {
      if (linhas.length < 2) return false;
      const [primeira, segunda] = linhas;
      if (primeira.length !== segunda.length) return false;
      const naoNumerico = (c: string) => !!c && !/^[\d.,\s]+$/.test(c);
      const pontosPrimeira = primeira.filter(naoNumerico).length;
      const pontosSegunda = segunda.filter(naoNumerico).length;
      return pontosPrimeira > pontosSegunda;
    },
    // ---------- parsing ----------
    parseLinha(linha: string, delimiter: string, qualificador: string): string[] {
      if (delimiter === 'espacos' || !delimiter) {
        return linha.trim().split(/\s{2,}|\t/).map((c) => c.trim());
      }
      const campos: string[] = [];
      let atual = '';
      let dentroAspas = false;
      for (let i = 0; i < linha.length; i++) {
        const c = linha[i];
        if (qualificador && c === qualificador) {
          if (dentroAspas && linha[i + 1] === qualificador) { atual += qualificador; i++; }
          else dentroAspas = !dentroAspas;
          continue;
        }
        if (c === delimiter && !dentroAspas) { campos.push(atual.trim()); atual = ''; continue; }
        atual += c;
      }
      campos.push(atual.trim());
      return campos;
    },
    parseLarguraFixa(linha: string, posicoes: number[]): string[] {
      if (!posicoes.length) return [linha.trim()];
      return posicoes.map((ini, i) => {
        const fim = i + 1 < posicoes.length ? posicoes[i + 1] : linha.length;
        return linha.substring(ini, fim).trim();
      });
    },
    parseQuantidade(valor: string | undefined): number {
      if (!valor) return 0;
      let v = String(valor).trim();
      if (!v) return 0;
      v = this.separadorDecimal === ',' ? v.replace(/\./g, '').replace(',', '.') : v.replace(/,/g, '');
      const n = parseFloat(v);
      return isNaN(n) ? 0 : n;
    },

    // ---------- mapeamento ----------
    iniciarMapeamento() {
      this.step = 2;
      this.perguntaAtual = 0;
      this.mapeamento = { nome: null, codigo_barra: null, quantidade: null };
    },

    selecionarColuna(idx: number) {
      const chave = this.perguntas[this.perguntaAtual].key;
      this.mapeamento[chave] = idx;
      if (this.perguntaAtual < this.perguntas.length - 1) {
        this.perguntaAtual++;
      } else {
        this.gerarResumo();
      }
    },
    colunaEstilo(idx: number): Record<string, string> {
      const p = this.perguntas.find((p) => this.mapeamento[p.key] === idx);
      return p ? { background: p.cor, color: '#fff' } : {};
    },
    colunaJaMapeadaLabel(idx: number): string {
      const p = this.perguntas.find((p) => this.mapeamento[p.key] === idx);
      return p ? p.label : '';
    },

    // ---------- resumo ----------
    gerarResumo() {
      const linhas = this.linhasParaMapeamento;
      const { nome: colNome, codigo_barra: colCodigo, quantidade: colQtd } = this.mapeamento;
      this.produtos = linhas.map((r, idx) => {
        const nome = (colNome !== null ? r[colNome] : '') || '';
        const codigo_barra = (colCodigo !== null ? r[colCodigo] : '') || '';
        const quantidade = this.parseQuantidade(colQtd !== null ? r[colQtd] : '');
        const nomeLimpo = nome.trim();
        const codigoLimpo = codigo_barra.trim();
        return {
          id: `imp_${idx}`,
          nome: nomeLimpo,
          codigo_barra: codigoLimpo,
          quantidade,
          tipo: 'unidade',
          qtd_unitaria_composicao: 1,
          selecionado: true,
          valido: !!nomeLimpo && !!codigoLimpo && quantidade > 0,
        };
      });
      this.step = 3;
    },
    revalidarProduto(p: ProdutoResumo) {
      p.valido = !!p.nome && !!p.codigo_barra && Number(p.quantidade) > 0;
    },
    removerProduto(id: string) {
      this.produtos = this.produtos.filter((p) => p.id !== id);
    },

    // ---------- navegação ----------
    voltarEtapa() {
      if (this.step === 2) {
        if (this.perguntaAtual > 0) this.perguntaAtual--;
        else this.step = 1;
        return;
      }
      if (this.step === 3) {
        this.step = 2;
        this.perguntaAtual = this.perguntas.length - 1;
      }
    },
    reiniciar() {
      this.step = 0;
      this.dragOver = false;
      this.erroArquivo = '';
      this.arquivoNome = '';
      this.bufferOriginal = null;
      this.rawText = '';
      this.encodingDetectado = '';
      this.encodingSelecionado = 'utf-8';
      this.delimiterDetectado = '';
      this.delimiterSelecionado = ';';
      this.delimiterCustom = '';
      this.modoLarguraFixa = false;
      this.larguraFixaPosicoes = '';
      this.qualificadorTexto = '"';
      this.primeiraLinhaCabecalho = false;
      this.separadorDecimal = ',';
      this.perguntaAtual = 0;
      this.mapeamento = { nome: null, codigo_barra: null, quantidade: null };
      this.produtos = [];
      this.buscaResumo = '';
      this.enviando = false;
    },
    tentarFechar() {
      if (this.enviando) return;
      if (this.step > 0) {
        const confirmar = window.confirm('Deseja cancelar a importação? Os dados informados não serão salvos.');
        if (!confirmar) return;
      }
      this.reiniciar();
      this.$emit('close');
    },

    // ---------- envio ----------
    async enviarProdutos() {
      const itens = this.produtos.filter((p) => p.selecionado && p.valido);
      if (!itens.length) return;
      this.enviando = true;
      try {
        const payload_item = itens.map((p) => [p.codigo_barra, p.quantidade, p.tipo, p.qtd_unitaria_composicao, p.nome]);
        const payloadRequisicao = {
          codigo_barra: payload_item,
          id_cotacao: `${this.idCotacaoLocal}`,
        };
        // timeout alto: a importação em lote pode demorar, pois cada item
        // pode precisar ser conferido/cadastrado no catálogo do lado do backend.
        await api.post(`/mvpu/cotacao/adicionarItem/${this.auth.id_loja}`, payloadRequisicao, {
          timeout: 120000,
        });
        this.$toast.success(`${itens.length} produto${itens.length === 1 ? '' : 's'} importado${itens.length === 1 ? '' : 's'} com sucesso!`);
        this.$emit('importado');
        this.reiniciar();
        this.$emit('close');
      } catch (e) {
        exibeErro(e, this.$toast);
      } finally {
        this.enviando = false;
      }
    },
  },
});
</script>

<style scoped>
.msr {
  font-family: 'Material Symbols Rounded';
  font-weight: normal;
  font-style: normal;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  font-variation-settings: 'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24;
  vertical-align: middle;
  font-size: 20px;
}

.mv-fade-enter-active, .mv-fade-leave-active { transition: opacity .18s ease; }
.mv-fade-enter-from, .mv-fade-leave-to { opacity: 0; }

.mv-import-overlay {
  position: fixed; inset: 0; background: rgba(23,19,49,.55);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 20px;
}

.mv-import-modal {
  background: var(--surface, #fff);
  border-radius: var(--radius-md, 16px);
  width: 100%; max-width: 780px; max-height: 92vh;
  display: flex; flex-direction: column;
  box-shadow: var(--shadow-card, 0 30px 60px -20px rgba(23,19,49,.4));
  position: relative;
  overflow: hidden;
}

.mv-import-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  padding: 20px 22px 14px; border-bottom: 1px solid var(--line, #ECE9F5);
  gap: 12px;
}
.mv-import-header-title { display: flex; align-items: flex-start; gap: 10px; }
.mv-import-header-title h2 { font-size: 19px; font-weight: 700; margin: 0; color: var(--ink, #171331); }
.mv-import-header-title p { font-size: 13.5px; color: var(--muted, #8B879E); margin: 3px 0 0; }
.mv-import-close {
  border: none; background: var(--surface-2, #F5F3FB); width: 32px; height: 32px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--muted, #8B879E);
  flex-shrink: 0;
}
.mv-import-close:hover { background: #ECE9F5; color: var(--ink, #171331); }

.mv-import-stepper {
  display: flex; align-items: center; padding: 14px 22px; gap: 6px;
  border-bottom: 1px solid var(--line, #ECE9F5); overflow-x: auto;
}
.mv-step { display: flex; align-items: center; gap: 7px; flex: 1; min-width: 0; }
.mv-step-dot {
  width: 22px; height: 22px; border-radius: 50%; background: var(--surface-2, #F5F3FB);
  color: var(--muted, #8B879E); font-size: 12px; font-weight: 700;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.mv-step.active .mv-step-dot { background: var(--primary, #6E6890); color: #fff; }
.mv-step.done .mv-step-dot { background: var(--primary-deep, #3E3560); color: #fff; }
.mv-step-label { font-size: 13px; font-weight: 600; color: var(--muted, #8B879E); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mv-step.active .mv-step-label { color: var(--ink, #171331); }
.mv-step:not(:last-child)::after { content: ''; flex: 1; height: 1px; background: var(--line, #ECE9F5); margin: 0 4px; }

.mv-import-body { padding: 20px 22px; overflow-y: auto; flex: 1; }

/* upload */
.mv-import-drop {
  border: 2px dashed var(--line, #ECE9F5); border-radius: 14px; padding: 46px 20px;
  display: flex; flex-direction: column; align-items: center; text-align: center; gap: 10px;
  cursor: pointer; transition: all .15s ease; background: var(--surface-2, #F5F3FB);
}
.mv-import-drop.dragover { border-color: var(--primary, #6E6890); background: #EFEBFA; }
.mv-import-drop-title { font-size: 16px; color: var(--ink, #171331); margin: 4px 0; line-height: 1.5; }
.mv-import-drop-hint { font-size: 16px; color: var(--muted, #8B879E); max-width: 420px; margin-top: 6px; }
.mv-import-error {
  display: flex; align-items: center; gap: 6px; font-size: 13.5px; color: var(--coral, #E0533D);
  font-weight: 600; margin: 4px 0;
}

/* config */
.mv-import-config-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px 18px; margin-bottom: 14px; }
.mv-import-field { display: flex; flex-direction: column; gap: 5px; }
.mv-import-field span { font-size: 13.5px; font-weight: 700; color: var(--ink, #171331); }
.mv-import-field select, .mv-import-input-inline {
  border: 1px solid var(--line, #ECE9F5); border-radius: 9px; padding: 9px 11px; font-size: 14px;
  font-family: inherit; background: #fff; color: var(--ink, #171331);
}
.mv-import-field small { font-size: 12px; color: var(--muted, #8B879E); }
.mv-import-largura-fixa { margin: 4px 0 14px; }

.mv-import-toggle {
  display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600;
  color: var(--ink, #171331); margin: 10px 0; cursor: pointer;
}
.mv-import-toggle input { width: 16px; height: 16px; accent-color: var(--primary, #6E6890); cursor: pointer; }

/* mapeamento */
.mv-import-pergunta {
  display: flex; align-items: center; gap: 12px; padding: 14px 16px; border: 1.5px solid;
  border-radius: 12px; margin-bottom: 14px; background: var(--surface-2, #F5F3FB);
}
.mv-import-pergunta strong { font-size: 16.5px; color: var(--ink, #171331); display: block; }
.mv-import-pergunta-sub { font-size: 13px; color: var(--muted, #8B879E); }

.mv-import-mapeamento-progresso { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 14px; }
.mv-mapchip {
  border: 1.5px solid var(--line, #ECE9F5); background: #fff; border-radius: 999px;
  padding: 7px 13px; font-size: 13px; font-weight: 700; cursor: pointer; color: var(--muted, #8B879E);
}
.mv-mapchip.current { border-color: var(--primary, #6E6890); color: var(--primary, #6E6890); }
.mv-mapchip.done { color: #fff; }

/* tabelas */
.mv-import-table-wrap { border: 1px solid var(--line, #ECE9F5); border-radius: 12px; overflow: auto; max-height: 300px; }
.mv-import-table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
.mv-import-table th {
  position: sticky; top: 0; background: var(--surface-2, #F5F3FB); text-align: left; padding: 9px 12px;
  font-weight: 700; color: var(--ink, #171331); white-space: nowrap; border-bottom: 1px solid var(--line, #ECE9F5);
}
.mv-import-table td {
  padding: 8px 12px; border-bottom: 1px solid #F2F0FA; white-space: nowrap; color: #444; font-family: 'IBM Plex Mono', monospace;
}
.mv-import-table tr.header td { background: #FFF6E8; font-weight: 700; color: #8A6A00; }
.mv-import-table.clicavel th, .mv-import-table.clicavel td { cursor: pointer; }
.mv-import-table.clicavel tbody tr:hover td { background: #F5F3FB; }
.mv-import-col-select { display: block; font-size: 11px; font-weight: 500; color: var(--muted, #8B879E); text-transform: none; }
.mv-import-col-badge { display: block; font-size: 11px; font-weight: 600; opacity: .9; }
.mv-import-preview-hint { display: block; font-size: 12.5px; color: var(--muted, #8B879E); margin-top: 8px; }

/* resumo */
.mv-import-resumo-stats { display: flex; flex-wrap: wrap; gap: 10px 18px; margin-bottom: 14px; }
.mv-import-resumo-ok, .mv-import-resumo-warn {
  display: flex; align-items: center; gap: 6px; font-size: 13.5px; font-weight: 700; padding: 6px 10px; border-radius: 8px;
}
.mv-import-resumo-ok { color: #1D7A4E; background: #E7F7EE; }
.mv-import-resumo-warn { color: #8A6A00; background: #FFF6E8; }

.mv-import-resumo-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 12px; flex-wrap: wrap; }
.mv-import-search {
  display: flex; align-items: center; gap: 6px; border: 1px solid var(--line, #ECE9F5); border-radius: 9px;
  padding: 7px 10px; flex: 1; min-width: 200px; background: #fff;
}
.mv-import-search .msr { font-size: 17px; color: var(--muted, #8B879E); }
.mv-import-search input { border: none; outline: none; font-size: 14px; width: 100%; font-family: inherit; }

.mv-import-table.resumo td { white-space: normal; font-family: 'Poppins', inherit; }
.mv-import-table.resumo tr.invalido td { color: #B3AECC; text-decoration: line-through; }
.mv-import-qty-input {
  width: 90px; border: 1px solid var(--line, #ECE9F5); border-radius: 8px; padding: 5px 8px;
  font-size: 13.5px; font-family: 'IBM Plex Mono', monospace;
}
.mv-import-remove {
  border: none; background: var(--surface-2, #F5F3FB); width: 30px; height: 30px; border-radius: 8px;
  color: var(--coral, #E0533D); display: flex; align-items: center; justify-content: center; cursor: pointer;
}
.mv-import-remove:hover { background: #FBEAE6; }
.mv-import-remove .msr { font-size: 17px; }
.mv-import-empty { text-align: center; padding: 24px !important; color: var(--muted, #8B879E); }

/* footer */
.mv-import-footer {
  display: flex; align-items: center; justify-content: space-between; padding: 14px 22px;
  border-top: 1px solid var(--line, #ECE9F5); gap: 12px;
}
.mv-import-footer-right { display: flex; gap: 10px; }
.mv-btn-primary, .mv-btn-ghost {
  display: inline-flex; align-items: center; gap: 6px; border-radius: 10px; padding: 10px 16px;
  font-size: 14px; font-weight: 700; cursor: pointer; border: none; font-family: inherit;
}
.mv-btn-primary { background: var(--primary, #6E6890); color: #fff; }
.mv-btn-primary:hover { background: var(--primary-deep, #3E3560); }
.mv-btn-primary:disabled { opacity: .5; cursor: not-allowed; }
.mv-btn-ghost { background: transparent; color: var(--muted, #8B879E); }
.mv-btn-ghost:hover { color: var(--ink, #171331); }
.mv-btn-ghost.small { padding: 7px 12px; font-size: 13px; }

/* envio */
.mv-import-sending-overlay {
  position: absolute; inset: 0; background: rgba(255,255,255,.96);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  text-align: center; padding: 30px; gap: 8px;
}
.mv-import-sending-overlay p { font-size: 15px; color: var(--ink, #171331); max-width: 340px; }
.mv-import-sending-sub { color: var(--muted, #8B879E) !important; font-size: 13px !important; }
.mv-import-spinner {
  width: 42px; height: 42px; border-radius: 50%; border: 3px solid var(--line, #ECE9F5);
  border-top-color: var(--primary, #6E6890); animation: mv-spin .8s linear infinite; margin-bottom: 8px;
}
@keyframes mv-spin { to { transform: rotate(360deg); } }

@media (max-width: 640px) {
  .mv-import-config-grid { grid-template-columns: 1fr; }
  .mv-import-modal { max-height: 96vh; }
}
</style>