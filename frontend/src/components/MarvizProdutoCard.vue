<template>
  <div class="mv-card" @click="$emit('abrir', produto)">
    <div class="mv-card-media">
      <img
        :src="produto.foto_capa || placeholderImg"
        :alt="produto.nome"
        loading="lazy"
        @error="onImgError"
      >

      <span v-if="produto.ativo === false" class="mv-badge inactive">
        <span class="msr" style="font-size:13px">visibility_off</span>Inativo
      </span>
      <span v-else-if="lancamento" class="mv-badge new">
        <span class="msr" style="font-size:13px">bolt</span>Novo
      </span>
      <span v-else-if="desconto" class="mv-badge discount">
        <span class="msr" style="font-size:13px">local_offer</span>-{{ produto.promocao_desconto }}%
      </span>
      <span v-else-if="produto.destaque" class="mv-badge top">
        <span class="msr" style="font-size:13px">military_tech</span>Destaque
      </span>

      <button class="mv-fav" :class="{ liked: favorito }" @click.stop="$emit('favoritar', produto)">
        <span class="msr" :class="{ fill: favorito }">favorite</span>
      </button>
    </div>

    <div class="mv-card-body">
      <span class="mv-card-fornecedor">
        <span class="msr" style="font-size:13px;">storefront</span>{{ produto.fornecedor }}
      </span>
      <span style="font-size: 1.0rem;" class="mv-card-title" @click.stop="$emit('abrir', produto)">{{ produto.nome }}</span>
      
      <div
        style="display: flex; align-items: center; width: 100%; overflow: hidden; font-weight: 700; font-family: 'Poppins'; margin-bottom;"
        >
        <span
            class="material-symbols-outlined"
            style="font-size: 20px; margin-right: 6px; flex-shrink: 0;"
        >
            store
        </span>

        <span
            style="
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            display: block;
            width: 100%;
            font-size: 15px;
            "
        >
            {{ produto.nome_vendedor }}
        </span>
        </div>

      <div class="mv-rating">
        <span class="stars">
          <span
            style="color: #ffc000; font-size: 18px;"
            v-for="(s, i) in stars"
            :key="i"
            class="msr"
            :class="{ fill: s !== 'empty' }"
          >{{ s === 'half' ? 'star_half' : 'star' }}</span>
        </span>
        <span style="font-size: 15px;">{{ Number(produto.media || 0).toFixed(1) }} ({{ formatCount(produto.avaliacoes) }})</span>
      </div>

      <div class="mv-price-row" style="margin-bottom: 15px;">
        <span class="mv-price" style="font-size: 1.5rem;">{{ fmtMoney(precoFinal) }}</span>
        <span v-if="desconto" class="mv-price-old">{{ fmtMoney(produto.preco) }}</span>
        <span class="mv-unit" style="font-size: 15px;">/{{ produto.tipo }}</span>
      </div>

      <div class="mv-card-metrics" style="font-size: 14px; color: #222; font-weight: 500; gap: 10px;">
        <span title="Curtidas"><span class="msr" style="font-size: 18px;">favorite</span>{{ formatCount(produto.curtidas) }}</span>
        <span title="Compartilhamentos"><span class="msr" style="font-size: 18px;">share</span>{{ formatCount(produto.compartilhamentos) }}</span>
        <span title="Visualizações"><span class="msr" style="font-size: 18px;">visibility</span>{{ formatCount(produto.visualizacoes) }}</span>
      </div>

      <div class="mv-card-meta">
        <div class="mv-meta-actions">
          <button @click.stop="$emit('favoritar', produto)">
            <span class="msr" :class="{ fill: favorito }">favorite</span>{{ formatCount(produto.curtidas) }}
          </button>
          <button @click.stop="$emit('compartilhar', produto)">
            <span class="msr">ios_share</span>{{ formatCount(produto.compartilhamentos) }}
          </button>
        </div>
        <button class="mv-add-quote" title="Adicionar à cesta" @click.stop="$emit('abrir', produto)">
          <span class="msr" style="color: #ff8049">add_shopping_cart</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';

const placeholderImg = 'https://placehold.co/600x600/F0EEFA/6E6890?text=Marviz';

function fmtMoney(v: any): string {
  return 'R$ ' + (Number(v) || 0).toFixed(2).replace('.', ',');
}

function formatCount(n: any): string {
  const v = Number(n) || 0;
  return v >= 1000 ? (v / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' mil' : String(v);
}

const DIA_MS = 86400000;

export default defineComponent({
  name: 'MarvizProdutoCard',

  props: {
    produto: { type: Object as PropType<any>, required: true },
    favorito: { type: Boolean, default: false }
  },

  emits: ['abrir', 'favoritar', 'compartilhar'],

  data() {
    return { placeholderImg };
  },

  computed: {
    lancamento(): boolean {
      const p = this.produto;
      return p?.criado_em ? (Date.now() - Number(p.criado_em)) <= 7 * DIA_MS : false;
    },
    desconto(): boolean {
      const p = this.produto;
      if (p?.promocao_desconto === null || p?.promocao_desconto === undefined) return false;
      const inicio = p.desconto_inicio ? Number(p.desconto_inicio) : null;
      const fim = p.desconto_fim ? Number(p.desconto_fim) : null;
      if (inicio && fim) {
        const now = Date.now();
        return now >= inicio && now <= fim;
      }
      return true;
    },
    precoFinal(): number {
      const p = this.produto;
      return this.desconto ? p.preco * (1 - Number(p.promocao_desconto) / 100) : p.preco;
    },
    stars(): string[] {
      const rating = Number(this.produto?.media || 0);
      const out: string[] = [];
      for (let i = 1; i <= 5; i++) {
        if (rating >= i) out.push('full');
        else if (rating >= i - 0.5) out.push('half');
        else out.push('empty');
      }
      return out;
    }
  },

  methods: {
    fmtMoney,
    formatCount,
    onImgError(e: Event) {
      (e.target as HTMLImageElement).src = placeholderImg;
    }
  }
});
</script>

<style scoped>
.msr {
  font-family: 'Material Symbols Rounded';
  font-weight: normal;
  font-style: normal;
  font-size: 22px;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  font-variation-settings: 'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24;
  vertical-align: middle;
}
.msr.fill { font-variation-settings: 'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24; }

.mv-card {
  background: var(--surface);
  border-radius: var(--radius-md);
  flex: 0 0 236px;
  overflow: hidden;
  box-shadow: var(--shadow-card);
  cursor: pointer;
  transition: transform .2s ease, box-shadow .2s ease;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--line);
}
.mv-grid .mv-card { flex-basis: auto; width: 100%; }
.mv-card:hover { transform: translateY(-4px); box-shadow: 0 20px 40px -18px rgba(23,19,49,.28); }

.mv-card-media { position: relative; height: 150px; background: var(--surface-2); overflow: hidden; }
.mv-card-media img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .4s ease; }
.mv-card:hover .mv-card-media img { transform: scale(1.06); }

.mv-badge {
  position: absolute; top: 10px; left: 10px; font-size: 11px; font-weight: 700;
  padding: 5px 9px; border-radius: 8px; color: #fff;
  display: flex; align-items: center; gap: 4px; letter-spacing: .01em;
}
.mv-badge.new { background: #FF8049; }
.mv-badge.discount { background: var(--coral); }
.mv-badge.top { background: var(--primary-deep); }
.mv-badge.inactive { background: #8B879E; }

.mv-fav {
  position: absolute; top: 10px; right: 10px; width: 30px; height: 30px; border-radius: 50%;
  background: rgba(255,255,255,.9); display: flex; align-items: center; justify-content: center;
  color: var(--muted); box-shadow: 0 4px 10px rgba(0,0,0,.12); border: none; cursor: pointer;
}
.mv-fav.liked { color: var(--coral); }
.mv-fav .msr { font-size: 17px; }

.mv-card-body { padding: 12px 14px 14px; display: flex; flex-direction: column; gap: 6px; flex: 1; }
.mv-card-fornecedor {
  font-size: 11px; color: var(--muted); font-weight: 600; text-transform: uppercase;
  letter-spacing: .03em; display: flex; align-items: center; gap: 4px;
}
.mv-card-title { font-size: 14px; font-weight: 600; line-height: 1.3; min-height: 36px; }

.mv-rating { display: flex; align-items: center; gap: 5px; font-size: 11.5px; color: var(--muted); }
.mv-rating .stars { display: flex; gap: 1px; }
.mv-rating .msr { font-size: 14px; color: var(--amber); }

.mv-price-row { display: flex; align-items: baseline; gap: 7px; margin-top: 2px; flex-wrap: wrap; }
.mv-price { font-family: 'IBM Plex Mono', monospace; font-weight: 600; font-size: 16.5px; color: var(--ink); }
.mv-price-old { font-family: 'IBM Plex Mono', monospace; font-size: 12px; color: #B3AECC; text-decoration: line-through; }
.mv-unit { font-size: 11px; color: #555; font-weight: 500; }

.mv-card-metrics { display: flex; align-items: center; gap: 10px; font-size: 11px; color: var(--muted); margin-top: 2px; }
.mv-card-metrics span { display: flex; align-items: center; gap: 3px; }
.mv-card-metrics .msr { font-size: 14px; }

.mv-card-meta {
  display: flex; align-items: center; justify-content: space-between;
  margin-top: 6px; padding-top: 10px; border-top: 1px solid var(--line);
}
.mv-meta-actions { display: flex; gap: 12px; }
.mv-meta-actions button {
  display: flex; align-items: center; gap: 4px; font-size: 11.5px; color: var(--muted);
  font-weight: 600; border: none; background: none; cursor: pointer; padding: 0;
}
.mv-meta-actions button:hover { color: var(--ink); }
.mv-meta-actions .msr { font-size: 16px; }

.mv-add-quote {
  width: 32px; height: 32px; border-radius: 10px; background: var(--surface-2); color: var(--primary);
  display: flex; align-items: center; justify-content: center; transition: all .15s ease;
  border: none; cursor: pointer;
}
.mv-add-quote:hover { background: var(--primary); color: #fff; }
.mv-add-quote .msr { font-size: 18px; }
</style>