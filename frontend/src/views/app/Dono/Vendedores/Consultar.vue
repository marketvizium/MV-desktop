<template>
  <div class="vnd-root">

    <!-- ════════════════════════════════
         HERO HEADER
    ════════════════════════════════ -->
    <div class="vnd-hero">
      <div class="hero-pattern"></div>
      <div class="hero-inner">
        <div class="hero-left">
          <div class="hero-badge">
            <span class="material-symbols-outlined" style="font-size:14px">groups</span>
            Rede de Vendedores · MarketVizium
          </div>
          <p class="hero-title">Descubra <span class="accent-text">Vendedores</span></p>
          <p class="hero-sub">Conecte sua loja aos melhores vendedores da plataforma. Veja métricas, avaliações e histórico antes de associar.</p>
          <div class="hero-stats">
            <div class="hs-item">
              <span class="hs-val">{{ vendedores.length }}</span>
              <span class="hs-lbl">Vendedores</span>
            </div>
            <div class="hs-div"></div>
            <div class="hs-item">
              <span class="hs-val accent-text">{{ associados.size }}</span>
              <span class="hs-lbl">Associados</span>
            </div>
            <div class="hs-div"></div>
            <div class="hs-item">
              <span class="hs-val">{{ vendedoresAtivos }}</span>
              <span class="hs-lbl">Ativos</span>
            </div>
          </div>
        </div>
        <div class="hero-right">
          <div class="search-hero">
            <span class="material-symbols-outlined sh-icon">search</span>
            <input
              v-model="busca"
              placeholder="Buscar por nome, usuário ou e-mail..."
              class="sh-input"
              @focus="searchFocused = true"
              @blur="searchFocused = false"
            />
            <button v-if="busca" class="sh-clear" @click="busca = ''">
              <span class="material-symbols-outlined" style="font-size:16px">close</span>
            </button>
          </div>
          <div class="filter-row">
            <button
              v-for="f in filtros"
              :key="f.key"
              class="fchip"
              :class="{ active: filtroAtivo === f.key }"
              @click="filtroAtivo = f.key"
            >
              <span class="material-symbols-outlined" style="font-size:13px">{{ f.icon }}</span>
              {{ f.label }}
              <span class="fchip-n">{{ f.count }}</span>
            </button>
          </div>
          <div class="sort-row">
            <span class="sort-lbl">Ordenar por:</span>
            <button v-for="s in sorts" :key="s.key" class="schip" :class="{ active: sortAtivo === s.key }" @click="sortAtivo = s.key">{{ s.label }}</button>
            <button class="btn-view" :class="{ active: viewMode === 'grid' }" @click="viewMode = 'grid'">
              <span class="material-symbols-outlined" style="font-size:16px">grid_view</span>
            </button>
            <button class="btn-view" :class="{ active: viewMode === 'list' }" @click="viewMode = 'list'">
              <span class="material-symbols-outlined" style="font-size:16px">view_list</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ════════════════════════════════
         CONTEÚDO PRINCIPAL
    ════════════════════════════════ -->
    <div class="vnd-content">

      <!-- LOADING -->
      <div v-if="loading" class="loading-screen">
        <div class="loading-orb"></div>
        <div class="loading-txt">Buscando vendedores na rede...</div>
      </div>

      <!-- EMPTY -->
      <div v-else-if="!vendedoresFiltrados.length" class="empty-screen">
        <div class="empty-icon">
          <span class="material-symbols-outlined">search_off</span>
        </div>
        <div class="empty-title">Nenhum vendedor encontrado</div>
        <div class="empty-sub">Tente ajustar os filtros ou a busca</div>
        <button class="btn-reset" @click="resetFiltros">Limpar filtros</button>
      </div>

      <!-- GRID DE CARDS -->
      <div v-else :class="['vendors-grid', viewMode]">
        <div
          v-for="(v, i) in vendedoresFiltrados"
          :key="v.id_vendedor"
          class="vnd-card"
          :class="{ associated: isAssociado(v.id_vendedor), 'list-mode': viewMode === 'list' }"
          :style="{ animationDelay: (i * 0.05) + 's' }"
          @click="abrirPerfil(v)"
        >
          <!-- Ribbon associado -->
          <div v-if="isAssociado(v.id_vendedor)" class="card-ribbon">
            <span class="material-symbols-outlined" style="font-size:11px">check</span>
            Associado
          </div>

          <!-- Cover + Avatar -->
          <div class="card-cover" :style="{ background: getCoverGradient(v.id_vendedor) }">
            <div class="card-cover-pattern"></div>
          </div>
          <div class="card-avatar-wrap">
            <div class="card-avatar" :style="getFotoStyle(v.foto_perfil, v.id_vendedor)">
              <span v-if="!v.foto_perfil" class="av-initials">{{ getInitials(v.nome) }}</span>
            </div>
            <div class="card-status-dot" :class="v.status_conta === 'ativo' ? 'live' : 'off'"></div>
          </div>

          <!-- Info -->
          <div class="card-body" style="display: flex; flex-direction: column; justify-content: space-between; height: 320px;">
            <div style="display: flex; flex-direction: column;">
              <div class="card-name">{{ v.nome }}</div>
              <div class="card-user">@{{ v.nome_usuario }}</div>
              <div class="card-city">
                <span class="material-symbols-outlined" style="font-size:13px">location_on</span>
                {{ v.cidade }}, {{ v.estado }}
              </div>
  
              <!-- Bio snippet -->
              <div class="card-bio" v-if="v.desc_perfil && viewMode === 'grid'">{{ truncate(v.desc_perfil, 72) }}</div>
  
              <!-- Tags de especialidades -->
              <div class="card-tags" v-if="v.especialidades">
                <span v-for="tag in getEspecialidades(v.especialidades).slice(0, 3)" :key="tag" class="skill-tag">{{ tag }}</span>
              </div>
            </div>

            <div style="display: flex; flex-direction: column;">
              <!-- Métricas rápidas -->
              <div class="card-metrics">
                <div class="cm-item">
                  <span class="material-symbols-outlined cm-icon orange">star</span>
                  <div>
                    <div class="cm-val">{{ v.avaliacao_media || '–' }}</div>
                    <div class="cm-lbl">Avaliação</div>
                  </div>
                </div>
                <div class="cm-sep"></div>
                <div class="cm-item">
                  <span class="material-symbols-outlined cm-icon green">shopping_bag</span>
                  <div>
                    <div class="cm-val">{{ v.num_vendas }}</div>
                    <div class="cm-lbl">Vendas</div>
                  </div>
                </div>
                <div class="cm-sep"></div>
                <div class="cm-item">
                  <span class="material-symbols-outlined cm-icon blue">timer</span>
                  <div>
                    <div class="cm-val">{{ formatResposta(v.taxa_resposta) }}</div>
                    <div class="cm-lbl">Resposta</div>
                  </div>
                </div>
              </div>
  
              <!-- Ação -->
              <div class="card-action" @click.stop>
                <button
                  v-if="!isAssociado(v.id_vendedor)"
                  class="btn-assoc"
                  :class="{ loading: loadingId === v.id_vendedor }"
                  @click="associar(v.id_vendedor)"
                  :disabled="loadingId === v.id_vendedor"
                >
                  <span class="material-symbols-outlined" style="font-size:15px">{{ loadingId === v.id_vendedor ? 'hourglass_empty' : 'person_add' }}</span>
                  {{ loadingId === v.id_vendedor ? 'Associando...' : 'Associar à loja' }}
                </button>
                <button
                  v-else
                  class="btn-desassoc"
                  :class="{ loading: loadingId === v.id_vendedor }"
                  @click="desassociar(v.id_vendedor)"
                  :disabled="loadingId === v.id_vendedor"
                >
                  <span class="material-symbols-outlined" style="font-size:15px">{{ loadingId === v.id_vendedor ? 'hourglass_empty' : 'how_to_reg' }}</span>
                  {{ loadingId === v.id_vendedor ? 'Removendo...' : 'Associado' }}
                </button>
                <button class="btn-perfil" @click="abrirPerfil(v)">
                  <span class="material-symbols-outlined" style="font-size:15px">open_in_new</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div><!-- /vnd-content -->

    <!-- ════════════════════════════════
         MODAL DE PERFIL
    ════════════════════════════════ -->
    <transition name="modal">
      <div v-if="perfilAberto" class="modal-backdrop" @click.self="fecharPerfil">
        <div class="modal-box" @click.stop>

          <!-- Fechar -->
          <button class="modal-close" @click="fecharPerfil">
            <span class="material-symbols-outlined">close</span>
          </button>

          <!-- Cover do modal -->
          <div class="modal-cover"  :style="{ background: getCoverGradient(perfilAberto.id_vendedor) }">
            <div class="modal-cover-pattern"></div>
            <div class="modal-cover-overlay"></div>
            <!-- Avatar grande -->
            <div class="modal-avatar-wrap" >
              <div class="modal-avatar" :style="getFotoStyle(perfilAberto.foto_perfil, perfilAberto.id_vendedor)">
                <span v-if="!perfilAberto.foto_perfil" class="mav-initials">{{ getInitials(perfilAberto.nome) }}</span>
              </div>
              <div class="modal-status-dot" :class="perfilAberto.status_conta === 'ativo' ? 'live' : 'off'"></div>
            </div>
          </div>

          <!-- Corpo do modal -->
          <div class="modal-body">

            <!-- Identidade -->
            <div class="mb-identity">
              <div class="mb-name">{{ perfilAberto.nome }}</div>
              <div class="mb-user">@{{ perfilAberto.nome_usuario }}</div>
              <div class="mb-badges">
                <span class="mbadge" :class="perfilAberto.status_conta === 'ativo' ? 'green' : 'red'">
                  <span class="material-symbols-outlined" style="font-size:11px">{{ perfilAberto.status_conta === 'ativo' ? 'fiber_manual_record' : 'cancel' }}</span>
                  {{ perfilAberto.status_conta === 'ativo' ? 'Ativo' : 'Inativo' }}
                </span>
                <span class="mbadge blue" v-if="perfilAberto.num_vendas > 0">
                  <span class="material-symbols-outlined" style="font-size:11px">verified</span>
                  Vendedor experiente
                </span>
                <span class="mbadge orange" v-if="isAssociado(perfilAberto.id_vendedor)">
                  <span class="material-symbols-outlined" style="font-size:11px">storefront</span>
                  Na sua loja
                </span>
              </div>
            </div>

            <!-- Grid principal -->
            <div class="mb-grid">

              <!-- Coluna esquerda -->
              <div class="mb-col-left">

                <!-- Bio -->
                <div class="mb-section">
                  <div class="mb-sec-title">
                    <span class="material-symbols-outlined" style="font-size:16px">person</span>
                    Sobre
                  </div>
                  <p class="mb-bio">{{ perfilAberto.desc_perfil || 'Sem descrição de perfil.' }}</p>
                </div>

                <!-- Especialidades -->
                <div class="mb-section" v-if="perfilAberto.especialidades">
                  <div class="mb-sec-title">
                    <span class="material-symbols-outlined" style="font-size:16px">workspace_premium</span>
                    Especialidades
                  </div>
                  <div class="mb-tags">
                    <span v-for="tag in getEspecialidades(perfilAberto.especialidades)" :key="tag" class="skill-tag lg">{{ tag }}</span>
                  </div>
                </div>

                <!-- Contato -->
                <div class="mb-section">
                  <div class="mb-sec-title">
                    <span class="material-symbols-outlined" style="font-size:16px">contact_page</span>
                    Contato
                  </div>
                  <div class="mb-contact-list">
                    <div class="mc-row">
                      <span class="material-symbols-outlined mc-icon">mail</span>
                      <span>{{ perfilAberto.email }}</span>
                    </div>
                    <div class="mc-row">
                      <span class="material-symbols-outlined mc-icon">smartphone</span>
                      <span>{{ perfilAberto.celular || 'Não informado' }}</span>
                    </div>
                    <div class="mc-row">
                      <span class="material-symbols-outlined mc-icon">location_on</span>
                      <span>{{ perfilAberto.cidade }}, {{ perfilAberto.estado }} · CEP {{ perfilAberto.cep }}</span>
                    </div>
                    <div class="mc-row">
                      <span class="material-symbols-outlined mc-icon">calendar_today</span>
                      <span>Membro desde {{ formatDate(perfilAberto.criado_em) }}</span>
                    </div>
                  </div>
                </div>

              </div>

              <!-- Coluna direita: KPIs + Charts -->
              <div class="mb-col-right">

                <!-- KPI Cards -->
                <div class="mb-kpis">
                  <div class="kpi-m">
                    <div class="kpim-icon orange">
                      <span class="material-symbols-outlined">star</span>
                    </div>
                    <div class="kpim-body">
                      <div class="kpim-val">{{ perfilAberto.avaliacao_media || '0' }}</div>
                      <div class="kpim-lbl">Avaliação média</div>
                      <div class="kpim-sub">{{ perfilAberto.num_avaliacoes }} avaliações</div>
                    </div>
                  </div>
                  <div class="kpi-m">
                    <div class="kpim-icon green">
                      <span class="material-symbols-outlined">shopping_bag</span>
                    </div>
                    <div class="kpim-body">
                      <div class="kpim-val">{{ perfilAberto.num_vendas }}</div>
                      <div class="kpim-lbl">Vendas realizadas</div>
                      <div class="kpim-sub">histórico total</div>
                    </div>
                  </div>
                  <div class="kpi-m">
                    <div class="kpim-icon blue">
                      <span class="material-symbols-outlined">request_quote</span>
                    </div>
                    <div class="kpim-body">
                      <div class="kpim-val">{{ perfilAberto.num_cotacoes }}</div>
                      <div class="kpim-lbl">Cotações</div>
                      <div class="kpim-sub">total de propostas</div>
                    </div>
                  </div>
                  <div class="kpi-m">
                    <div class="kpim-icon purple">
                      <span class="material-symbols-outlined">inventory_2</span>
                    </div>
                    <div class="kpim-body">
                      <div class="kpim-val">{{ perfilAberto.num_produtos }}</div>
                      <div class="kpim-lbl">Produtos</div>
                      <div class="kpim-sub">catálogo ativo</div>
                    </div>
                  </div>
                </div>

                <!-- Performance bars -->
                <div class="mb-section mt0">
                  <div class="mb-sec-title">
                    <span class="material-symbols-outlined" style="font-size:16px">analytics</span>
                    Performance
                  </div>
                  <div class="perf-bars">
                    <div class="pb-item">
                      <div class="pb-head">
                        <span class="pb-label">Tempo de resposta</span>
                        <span class="pb-val" :class="getRespostaClass(perfilAberto.taxa_resposta)">{{ formatResposta(perfilAberto.taxa_resposta) }}</span>
                      </div>
                      <div class="pb-track">
                        <div class="pb-fill" :style="{ width: getRespostaPct(perfilAberto.taxa_resposta)+'%', background: getRespostaCor(perfilAberto.taxa_resposta) }"></div>
                      </div>
                    </div>
                    <div class="pb-item">
                      <div class="pb-head">
                        <span class="pb-label">Taxa de conversão (vendas/cotações)</span>
                        <span class="pb-val">{{ getConversao(perfilAberto) }}%</span>
                      </div>
                      <div class="pb-track">
                        <div class="pb-fill green" :style="{ width: getConversao(perfilAberto)+'%' }"></div>
                      </div>
                    </div>
                    <div class="pb-item">
                      <div class="pb-head">
                        <span class="pb-label">Avaliação geral</span>
                        <span class="pb-val orange">{{ ((perfilAberto.avaliacao_media || 0) / 5 * 100).toFixed(0) }}%</span>
                      </div>
                      <div class="pb-track">
                        <div class="pb-fill orange" :style="{ width: ((perfilAberto.avaliacao_media || 0) / 5 * 100)+'%' }"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Stars display -->
                <div class="mb-section">
                  <div class="mb-sec-title">
                    <span class="material-symbols-outlined" style="font-size:16px">reviews</span>
                    Avaliações
                  </div>
                  <div class="stars-display">
                    <div class="sd-big">
                      <span class="sd-num">{{ perfilAberto.avaliacao_media || '0' }}</span>
                      <div class="sd-stars">
                        <span v-for="i in 5" :key="i" class="material-symbols-outlined sd-star"
                          :class="i <= Math.round(perfilAberto.avaliacao_media) ? 'filled' : ''">star</span>
                      </div>
                      <span class="sd-count">{{ perfilAberto.num_avaliacoes }} avaliações</span>
                    </div>
                    <div class="sd-bars">
                      <div v-for="n in [5,4,3,2,1]" :key="n" class="sdb-row">
                        <span class="sdb-num">{{ n }}</span>
                        <span class="material-symbols-outlined sdb-star">star</span>
                        <div class="sdb-track">
                          <div class="sdb-fill" :style="{ width: perfilAberto.num_avaliacoes > 0 ? '30%' : '0%' }"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <!-- Ação final -->
            <div class="modal-action">
              <div class="ma-info">
                <span class="material-symbols-outlined" style="font-size:16px;color:var(--muted)">info</span>
                <span>Ao associar, este vendedor poderá operar em nome da sua loja.</span>
              </div>
              <div class="ma-btns">
                <button class="btn-modal-cancel" @click="fecharPerfil">Fechar</button>
                <button
                  v-if="!isAssociado(perfilAberto.id_vendedor)"
                  class="btn-modal-assoc"
                  :class="{ loading: loadingId === perfilAberto.id_vendedor }"
                  @click="associar(perfilAberto.id_vendedor)"
                  :disabled="loadingId === perfilAberto.id_vendedor"
                >
                  <span class="material-symbols-outlined" style="font-size:16px">person_add</span>
                  {{ loadingId === perfilAberto.id_vendedor ? 'Associando...' : 'Associar à minha loja' }}
                </button>
                <button
                  v-else
                  class="btn-modal-desassoc"
                  :class="{ loading: loadingId === perfilAberto.id_vendedor }"
                  @click="desassociar(perfilAberto.id_vendedor)"
                  :disabled="loadingId === perfilAberto.id_vendedor"
                >
                  <span class="material-symbols-outlined" style="font-size:16px">person_remove</span>
                  {{ loadingId === perfilAberto.id_vendedor ? 'Removendo...' : 'Remover da loja' }}
                </button>
              </div>
            </div>

          </div><!-- /modal-body -->
        </div><!-- /modal-box -->
      </div>
    </transition>

    <!-- ════════════════════════════════
         TOAST NOTIFICATIONS
    ════════════════════════════════ -->
    <transition-group name="toast" tag="div" class="toast-container">
      <div v-for="t in toasts" :key="t.id" class="toast" :class="t.type">
        <span class="material-symbols-outlined toast-icon">{{ t.icon }}</span>
        <span class="toast-msg">{{ t.msg }}</span>
      </div>
    </transition-group>

  </div>
</template>

<script>
import { api } from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import { defineComponent } from 'vue';
// import { api } from '@/services/api';
// import { useAuthStore } from '@/stores/auth';

const COVER_GRADIENTS = [
  'linear-gradient(135deg, #FF8049 0%, #ff4444 100%)',
  'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
  'linear-gradient(135deg, #16a34a 0%, #0891b2 100%)',
  'linear-gradient(135deg, #ca8a04 0%, #ea580c 100%)',
  'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)',
  'linear-gradient(135deg, #0891b2 0%, #16a34a 100%)',
];

//const MOCK_VENDEDORES = [
//  { id_vendedor:15, num_cotacoes:0, num_produtos:0, num_vendas:0, taxa_resposta:'0', avaliacao_media:0, num_avaliacoes:0, desc_perfil:'Alguma coisa sobre mim', especialidades:'Habilidade 0, Habilidade 1', foto_perfil:'https://res.cloudinary.com/dwi99ia6d/image/upload/v1771357868/perfil/perfil-1771357867730.png', criado_em:'1771357870097', status_conta:'ativo', email:'jonas@gmail.com', celular:'(11) 95363-2300', cep:'08320-210', nome:'Jonas Silva', cpf_cnpj:'434.036.448-99', cidade:'São Paulo', estado:'SE', nome_usuario:'jonas_silva' },
//  { id_vendedor:8, num_cotacoes:3, num_produtos:0, num_vendas:2, taxa_resposta:'56.0 min.', avaliacao_media:4.2, num_avaliacoes:12, desc_perfil:'Sou vendedor há 20 anos e tenho muito orgulho do que faço. Especializado em distribuição e logística.', especialidades:'Produtos Com Alta Qualidade, Logística, Distribuição', foto_perfil:null, criado_em:'1765214823435', status_conta:'ativo', email:'excluidson2@exclui.com', celular:'11953632306', cep:'08320210', nome:'Excluidson Vendedor Distribuidora 2', cpf_cnpj:'049.342.920-47', cidade:'São Paulo', estado:'São Paulo', nome_usuario:'excluid_vendedor_dist2' },
//  { id_vendedor:1, num_cotacoes:8, num_produtos:5, num_vendas:3, taxa_resposta:'6.0 min.', avaliacao_media:4.8, num_avaliacoes:34, desc_perfil:'Essa é uma bio de um desenvolvedor feliz que está com uma interface relativamente estável. A market vizium, se Deus quiser, irá escalar e se tornar uma tech referência em sistemas de varejo. JOM.', especialidades:'Vendas ágeis, Entrega rápida, sou zamozo da zamoza', foto_perfil:'https://res.cloudinary.com/dwi99ia6d/image/upload/v1772335809/perfil/perfil-1772335808600.jpg', criado_em:'1762988876842', status_conta:'ativo', email:'excluidson1@exclui.com', celular:'11953632123', cep:'08320210', nome:'Excluidson Vendedor Editado', cpf_cnpj:'984.848.210-56', cidade:'São Paulo', estado:'SP', nome_usuario:'excluid_vendedor' },
//  { id_vendedor:11, num_cotacoes:0, num_produtos:2, num_vendas:0, taxa_resposta:'0.0 min.', avaliacao_media:3.5, num_avaliacoes:6, desc_perfil:'Sou o everton e tenho muitas habilidades. Sempre buscando entregar o melhor resultado para meus clientes.', especialidades:'Habilidoso 0, Atendimento Premium, Pós-venda', foto_perfil:'https://res.cloudinary.com/dwi99ia6d/image/upload/v1772335938/perfil/perfil-1772335937106.jpg', criado_em:'1771355599055', status_conta:'ativo', email:'evertonmarussi@gmail.com', celular:'(11) 95363-2306', cep:'08320-210', nome:'Everton Marussi', cpf_cnpj:'434.036.448-71', cidade:'São Paulo', estado:'SP', nome_usuario:'marussi_vendedor' },
//  { id_vendedor:22, num_cotacoes:5, num_produtos:8, num_vendas:12, taxa_resposta:'12.0 min.', avaliacao_media:4.5, num_avaliacoes:28, desc_perfil:'Especialista em produtos de beleza e cosméticos. Atendo salões e distribuidoras há mais de 10 anos.', especialidades:'Cosméticos, Beleza, B2B, Atacado', foto_perfil:null, criado_em:'1760000000000', status_conta:'ativo', email:'maria@vendas.com', celular:'(11) 91234-5678', cep:'01310-100', nome:'Maria Fernanda Rocha', cpf_cnpj:'123.456.789-00', cidade:'São Paulo', estado:'SP', nome_usuario:'maria_rocha_vnd' },
//  { id_vendedor:33, num_cotacoes:2, num_produtos:3, num_vendas:1, taxa_resposta:'90.0 min.', avaliacao_media:2.8, num_avaliacoes:4, desc_perfil:'Novo na plataforma mas com muita energia para crescer!', especialidades:'Vendas online, Redes sociais', foto_perfil:null, criado_em:'1775000000000', status_conta:'ativo', email:'pedro.novo@email.com', celular:'(21) 99876-5432', cep:'22040-020', nome:'Pedro Novato', cpf_cnpj:'987.654.321-00', cidade:'Rio de Janeiro', estado:'RJ', nome_usuario:'pedro_novato' },  
//];

export default defineComponent({
  name: 'VendedoresPage',

  data() {
    return {
      vendedores: [],
      associados: new Set([1, 11]), // mock: IDs já associados
      loading: false,
      loadingId: null,
      busca: '',
      filtroAtivo: 'todos',
      sortAtivo: 'nome',
      viewMode: 'grid',
      perfilAberto: null,
      searchFocused: false,
      toasts: [],
      _toastId: 0,
    };
  },

  computed: {
    vendedoresAtivos() {
      return this.vendedores.filter(v => v.status_conta === 'ativo').length;
    },

    filtros() {
      return [
        { key: 'todos',      label: 'Todos',      icon: 'groups',     count: this.vendedores.length },
        { key: 'associados', label: 'Associados',  icon: 'storefront', count: this.associados.size },
        { key: 'disponiveis',label: 'Disponíveis', icon: 'person_add', count: this.vendedores.filter(v => !this.associados.has(v.id_vendedor)).length },
        { key: 'top',        label: 'Destaque',    icon: 'workspace_premium', count: this.vendedores.filter(v => v.num_vendas >= 2).length },
      ];
    },

    sorts() {
      return [
        { key: 'nome',      label: 'Nome' },
        { key: 'vendas',    label: 'Vendas' },
        { key: 'avaliacao', label: 'Avaliação' },
        { key: 'recente',   label: 'Recente' },
      ];
    },

    vendedoresFiltrados() {
      let list = [...this.vendedores];

      // Filtro por tab
      if (this.filtroAtivo === 'associados')  list = list.filter(v => this.associados.has(v.id_vendedor));
      if (this.filtroAtivo === 'disponiveis') list = list.filter(v => !this.associados.has(v.id_vendedor));
      if (this.filtroAtivo === 'top')         list = list.filter(v => v.num_vendas >= 2);

      // Busca
      if (this.busca.trim()) {
        const q = this.busca.toLowerCase();
        list = list.filter(v =>
          v.nome?.toLowerCase().includes(q) ||
          v.nome_usuario?.toLowerCase().includes(q) ||
          v.email?.toLowerCase().includes(q)
        );
      }

      // Ordenação
      list.sort((a, b) => {
        if (this.sortAtivo === 'nome')      return a.nome.localeCompare(b.nome);
        if (this.sortAtivo === 'vendas')    return b.num_vendas - a.num_vendas;
        if (this.sortAtivo === 'avaliacao') return b.avaliacao_media - a.avaliacao_media;
        if (this.sortAtivo === 'recente')   return Number(b.criado_em) - Number(a.criado_em);
        return 0;
      });

      // Associados sempre primeiro no modo "todos"
      if (this.filtroAtivo === 'todos') {
        list.sort((a, b) => {
          const aA = this.associados.has(a.id_vendedor) ? 0 : 1;
          const bA = this.associados.has(b.id_vendedor) ? 0 : 1;
          return aA - bA;
        });
      }

      return list;
    },
  },

  methods: {
    async carregarDados() {
      this.loading = true;
      try {
        // Integração real:
         const auth = useAuthStore();
         const [todosRes, lojaRes] = await Promise.all([
           api.post('/mvpu/usuario/buscarVendedor/', {}),
           api.get(`/mvpu/usuario/consultarVendedores/${auth.id_loja}`)
         ]);
        
         console.log(todosRes, lojaRes, 'aa')

         this.vendedores = todosRes.data.data || [];
         const assoc = lojaRes.data.data || [];
         this.associados = new Set(assoc.map(v => v.id_vendedor));

        // Mock:
        await new Promise(r => setTimeout(r, 700));
        //this.vendedores = MOCK_VENDEDORES;
      } catch (e) {
        console.log(e)
        this.toast('Erro ao carregar vendedores', 'error', 'error');
      } finally {
        this.loading = false;
      }
    },

    async associar(id) {
      this.loadingId = id;
      try {
        const auth = useAuthStore();
        await api.post(`/mvpu/usuario/associarVendedor/${auth.id_loja}`, { id_vendedor: id });
        await new Promise(r => setTimeout(r, 800));
        this.associados = new Set([...this.associados, id]);
        this.toast('Vendedor associado com sucesso!', 'success', 'check_circle');
        if (this.perfilAberto?.id_vendedor === id) {
          // força reatividade
          this.perfilAberto = { ...this.perfilAberto };
        }
      } catch (e) {
        this.toast('Erro ao associar vendedor', 'error', 'error');
      } finally {
        this.loadingId = null;
      }
    },

    async desassociar(id) {
      this.loadingId = id;
      try {
        const auth = useAuthStore();
        await api.delete(`/mvpu/usuario/desassociarVendedor/${auth.id_loja}`, { data: { id_vendedor: id } });
        await new Promise(r => setTimeout(r, 800));
        const next = new Set(this.associados);
        next.delete(id);
        this.associados = next;
        this.toast('Vendedor removido da loja.', 'info', 'person_remove');
        if (this.perfilAberto?.id_vendedor === id) {
          this.perfilAberto = { ...this.perfilAberto };
        }
      } catch (e) {
        this.toast('Erro ao desassociar vendedor', 'error', 'error');
      } finally {
        this.loadingId = null;
      }
    },

    abrirPerfil(v) { this.perfilAberto = v; document.body.style.overflow = 'hidden'; },
    fecharPerfil()  { this.perfilAberto = null; document.body.style.overflow = ''; },

    isAssociado(id) { return this.associados.has(id); },

    getInitials(nome) {
      return (nome || '?').split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
    },

    getFotoStyle(url, id) {
      if (url) return { backgroundImage: `url(${url})`, backgroundSize: 'cover', backgroundPosition: 'center' };
      const g = COVER_GRADIENTS[id % COVER_GRADIENTS.length];
      return { background: g };
    },

    getCoverGradient(id) { return COVER_GRADIENTS[id % COVER_GRADIENTS.length]; },

    getEspecialidades(str) {
      return (str || '').split(',').map(s => s.trim()).filter(Boolean);
    },

    truncate(str, n) { return str && str.length > n ? str.slice(0, n) + '…' : str; },

    formatResposta(val) {
      if (!val || val === '0' || val === '0.0 min.') return 'Imediato';
      return val.includes('min') ? val : val + ' min.';
    },

    formatDate(ts) {
      if (!ts) return '-';
      return new Date(Number(ts)).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' });
    },

    getConversao(v) {
      if (!v.num_cotacoes) return 0;
      return Math.min(100, Math.round((v.num_vendas / v.num_cotacoes) * 100));
    },

    getRespostaPct(val) {
      const n = parseFloat(val) || 0;
      if (n === 0) return 100;
      if (n <= 10) return 90;
      if (n <= 30) return 70;
      if (n <= 60) return 45;
      return 20;
    },

    getRespostaCor(val) {
      const n = parseFloat(val) || 0;
      if (n === 0 || n <= 10) return 'var(--green)';
      if (n <= 30) return 'var(--accent)';
      return 'var(--red)';
    },

    getRespostaClass(val) {
      const n = parseFloat(val) || 0;
      if (n === 0 || n <= 10) return 'green';
      if (n <= 30) return 'orange';
      return 'red';
    },

    resetFiltros() { this.busca = ''; this.filtroAtivo = 'todos'; },

    toast(msg, type = 'success', icon = 'check_circle') {
      const id = ++this._toastId;
      this.toasts.push({ id, msg, type, icon });
      setTimeout(() => { this.toasts = this.toasts.filter(t => t.id !== id); }, 3200);
    },
  },

  mounted() { this.carregarDados(); },
  beforeUnmount() { document.body.style.overflow = ''; },
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');

/* ═══════════════════════════════
   TOKENS
═══════════════════════════════ */
.vnd-root {
  --accent:   #FF8049;
  --accent2:  #FF804914;
  --acc-h:    #E8622A;
  --green:    #16a34a;
  --green2:   #dcfce7;
  --blue:     #2563eb;
  --blue2:    #dbeafe;
  --yellow:   #ca8a04;
  --yellow2:  #fef9c3;
  --red:      #dc2626;
  --red2:     #fee2e2;
  --purple:   #7c3aed;
  --purple2:  #ede9fe;
  --bg:       #f4f6f9;
  --bg-card:  #ffffff;
  --bg-el:    #f1f3f6;
  --bg-el2:   #e8eaed;
  --border:   #e2e8f0;
  --text1:    #0f172a;
  --text2:    #475569;
  --muted:    #94a3b8;
  --radius:   16px;
  --radius-s: 10px;
  --shadow:   0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.04);
  --shadow-md:0 8px 24px rgba(0,0,0,0.08);
  --shadow-lg:0 20px 50px rgba(0,0,0,0.14);

  font-family: 'DM Sans', system-ui, sans-serif;
  background: var(--bg);
  min-height: 100vh;
  color: var(--text1);
  position: relative;
}

/* ═══════════════════════════════
   HERO
═══════════════════════════════ */
.vnd-hero {
  background: var(--bg-card);
  border-bottom: 1px solid var(--border);
  padding: 32px 36px 24px;
  position: relative;
  overflow: hidden;
}

.hero-pattern {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle at 80% 50%, rgba(255,128,73,0.06) 0%, transparent 60%),
                    radial-gradient(circle at 20% 80%, rgba(37,99,235,0.04) 0%, transparent 50%);
  pointer-events: none;
}

.hero-inner {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  align-items: center;
  position: relative;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--accent2);
  color: var(--accent);
  border: 1px solid rgba(255,128,73,0.25);
  border-radius: 20px;
  padding: 5px 14px;
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.2px;
  margin-bottom: 12px;
}

.hero-title {
  font-family: 'Sora', sans-serif;
  font-size: 32px;
  font-weight: 600;
  color: var(--text1);
  letter-spacing: -0.8px;
  margin: 0 0 8px;
  line-height: 1.1;
}

.accent-text { color: var(--accent); }

.hero-sub {
  font-size: 14px;
  color: var(--text2);
  line-height: 1.6;
  margin: 0 0 20px;
  max-width: 400px;
}

.hero-stats { display: flex; align-items: center; gap: 0; }
.hs-item    { text-align: center; padding: 0 20px; }
.hs-item:first-child { padding-left: 0; }
.hs-val  { font-family: 'Sora', sans-serif; font-size: 26px; font-weight: 800; color: var(--text1); display: block; letter-spacing: -0.5px; }
.hs-lbl  { font-size: 11px; color: var(--muted); font-weight: 500; margin-top: 2px; display: block; }
.hs-div  { width: 1px; height: 36px; background: var(--border); flex-shrink: 0; }

/* ─── Search ─── */
.search-hero {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--bg-el);
  border: 1.5px solid var(--border);
  border-radius: 12px;
  padding: 12px 16px;
  transition: border-color 0.2s, box-shadow 0.2s;
  margin-bottom: 12px;
}
.search-hero:focus-within {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(255,128,73,0.12);
  background: var(--bg-card);
}
.sh-icon { font-size: 20px !important; color: var(--muted); flex-shrink: 0; }
.sh-input {
  flex: 1; border: none; background: transparent;
  font-size: 14px; font-family: inherit; color: var(--text1); outline: none;
}
.sh-input::placeholder { color: var(--muted); }
.sh-clear {
  width: 24px; height: 24px; border-radius: 50%;
  background: var(--bg-el2); border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: var(--muted); flex-shrink: 0;
}

.filter-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
.fchip {
  display: flex; align-items: center; gap: 5px;
  padding: 6px 14px; border-radius: 20px;
  background: var(--bg-el); border: 1px solid var(--border);
  font-size: 12px; font-weight: 500; color: var(--text2);
  cursor: pointer; font-family: inherit; transition: all 0.15s;
}
.fchip.active { background: var(--accent2); border-color: var(--accent); color: var(--accent); font-weight: 700; }
.fchip:hover:not(.active) { background: var(--bg-el2); }
.fchip-n {
  background: rgba(0,0,0,0.07); border-radius: 10px;
  padding: 1px 6px; font-size: 10.5px; font-weight: 700;
}
.fchip.active .fchip-n { background: rgba(255,128,73,0.15); }

.sort-row { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.sort-lbl { font-size: 11.5px; color: var(--muted); font-weight: 600; }
.schip {
  padding: 4px 11px; border-radius: 14px;
  background: var(--bg-el); border: 1px solid var(--border);
  font-size: 11.5px; font-weight: 500; color: var(--text2);
  cursor: pointer; font-family: inherit; transition: all 0.15s;
}
.schip.active { background: var(--text1); color: #fff; border-color: var(--text1); }
.btn-view {
  width: 30px; height: 30px; border-radius: var(--radius-s);
  background: var(--bg-el); border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--muted); transition: all 0.15s;
}
.btn-view.active { background: var(--text1); color: white; border-color: var(--text1); }

/* ═══════════════════════════════
   CONTENT
═══════════════════════════════ */
.vnd-content { padding: 28px 36px; }

/* ─── Loading ─── */
.loading-screen {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 16px; padding: 80px;
}
.loading-orb {
  width: 48px; height: 48px; border-radius: 50%;
  border: 3px solid var(--border);
  border-top-color: var(--accent);
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.loading-txt { font-size: 14px; color: var(--muted); font-weight: 500; }

/* ─── Empty ─── */
.empty-screen {
  display: flex; flex-direction: column; align-items: center;
  gap: 10px; padding: 80px;
}
.empty-icon {
  width: 64px; height: 64px; border-radius: 50%;
  background: var(--bg-el); display: flex; align-items: center; justify-content: center;
}
.empty-icon .material-symbols-outlined { font-size: 32px; color: var(--muted); }
.empty-title { font-size: 16px; font-weight: 700; color: var(--text1); }
.empty-sub   { font-size: 13px; color: var(--muted); }
.btn-reset {
  margin-top: 8px; padding: 8px 20px; border-radius: var(--radius-s);
  background: var(--accent); color: white; border: none; cursor: pointer;
  font-size: 13px; font-weight: 600; font-family: inherit;
}

/* ═══════════════════════════════
   VENDOR GRID
═══════════════════════════════ */
.vendors-grid.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}
.vendors-grid.list {
  display: flex; flex-direction: column; gap: 12px;
}

/* ─── Card ─── */
.vnd-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: var(--shadow);
  cursor: pointer;
  position: relative;
  transition: box-shadow 0.2s, transform 0.2s, border-color 0.2s;
  animation: cardIn 0.4s both;
}
@keyframes cardIn {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
.vnd-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-3px);
  border-color: var(--accent);
}
.vnd-card.associated { border-color: rgba(22,163,74,0.4); }
.vnd-card.associated:hover { border-color: var(--green); }

/* List mode */
.vnd-card.list-mode {
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto;
}
.vnd-card.list-mode .card-cover { display: none; }
.vnd-card.list-mode .card-avatar-wrap { margin: 16px 0 16px 16px; position: static; }
.vnd-card.list-mode .card-body { padding: 16px; }
.vnd-card.list-mode .card-bio { display: none; }

/* Ribbon */
.card-ribbon {
  position: absolute; top: 12px; right: 12px; z-index: 10;
  display: flex; align-items: center; gap: 4px;
  background: var(--green); color: white;
  border-radius: 20px; padding: 3px 10px;
  font-size: 10.5px; font-weight: 700;
  box-shadow: 0 2px 8px rgba(22,163,74,0.4);
}

/* Cover */
.card-cover {
  height: 72px;
  position: relative;
  overflow: hidden;
}
.card-cover-pattern {
  position: absolute; inset: 0;
  background-image: radial-gradient(circle at 30% 70%, rgba(255,255,255,0.15) 0%, transparent 50%);
}

/* Avatar */
.card-avatar-wrap {
  position: relative;
  width: 60px; height: 60px;
  margin: -30px 0 0 16px;
  z-index: 5;
}
.card-avatar {
  width: 60px; height: 60px; border-radius: 50%;
  border: 3px solid var(--bg-card);
  display: flex; align-items: center; justify-content: center;
  background: var(--bg-el);
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
  overflow: hidden;
}
.av-initials {
  font-family: 'Sora', sans-serif;
  font-size: 18px; font-weight: 800; color: white;
  text-shadow: 0 1px 2px rgba(0,0,0,0.2);
}
.card-status-dot {
  position: absolute; bottom: 2px; right: 2px;
  width: 13px; height: 13px; border-radius: 50%;
  border: 2px solid var(--bg-card);
}
.card-status-dot.live { background: var(--green); }
.card-status-dot.off  { background: var(--muted); }

/* Card body */
.card-body { padding: 10px 16px 16px; }
.card-name { font-family: 'Sora', sans-serif; font-size: 15px; font-weight: 700; color: var(--text1); margin-bottom: 2px; }
.card-user { font-size: 12px; color: var(--accent); font-weight: 600; margin-bottom: 4px; }
.card-city {
  display: flex; align-items: center; gap: 3px;
  font-size: 11.5px; color: var(--muted); margin-bottom: 10px;
}
.card-bio  { font-size: 12px; color: var(--text2); line-height: 1.5; margin-bottom: 10px; }

/* Tags */
.card-tags { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 12px; }
.skill-tag {
  padding: 3px 9px; border-radius: 14px;
  background: var(--bg-el); border: 1px solid var(--border);
  font-size: 10.5px; font-weight: 600; color: var(--text2);
}
.skill-tag.lg { padding: 4px 12px; font-size: 11.5px; }

/* Métricas */
.card-metrics {
  display: flex; align-items: center; gap: 0;
  background: var(--bg-el); border-radius: var(--radius-s);
  padding: 10px 12px; margin-bottom: 12px;
}
.cm-item  { display: flex; align-items: center; gap: 7px; flex: 1; }
.cm-sep   { width: 1px; height: 28px; background: var(--border); flex-shrink: 0; }
.cm-icon  { font-size: 18px !important; }
.cm-icon.orange { color: var(--yellow); }
.cm-icon.green  { color: var(--green);  }
.cm-icon.blue   { color: var(--blue);   }
.cm-val { font-size: 14px; font-weight: 800; color: var(--text1); line-height: 1; }
.cm-lbl { font-size: 9.5px; color: var(--muted); font-weight: 500; }

/* Action */
.card-action { display: flex; gap: 7px; }
.btn-assoc, .btn-desassoc, .btn-perfil {
  display: flex; align-items: center; gap: 5px;
  padding: 8px 12px; border-radius: var(--radius-s);
  font-size: 12px; font-weight: 700; cursor: pointer;
  border: none; font-family: inherit; transition: all 0.15s;
}
.btn-assoc {
  flex: 1;
  background: var(--accent); color: white;
  box-shadow: 0 2px 8px rgba(255,128,73,0.3);
}
.btn-assoc:hover { background: var(--acc-h); }
.btn-assoc.loading { opacity: 0.7; cursor: default; }

.btn-desassoc {
  flex: 1;
  background: var(--green2); color: var(--green);
  border: 1px solid rgba(22,163,74,0.3);
}
.btn-desassoc:hover { background: #bbf7d0; }
.btn-desassoc.loading { opacity: 0.7; cursor: default; }

.btn-perfil {
  background: var(--bg-el); color: var(--text2);
  border: 1px solid var(--border);
  padding: 8px 10px;
}
.btn-perfil:hover { background: var(--bg-el2); }

/* ═══════════════════════════════
   MODAL
═══════════════════════════════ */
.modal-backdrop {
  position: fixed; inset: 0;
  background: rgba(15,23,42,0.55);
  backdrop-filter: blur(4px);
  z-index: 999;
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
}

.modal-box {
  background: var(--bg-card);
  border-radius: 20px;
  width: 820px; max-width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
  position: relative;
  overflow: visible;
}

.modal-close {
  position: absolute; top: 16px; right: 16px; z-index: 10;
  width: 36px; height: 36px; border-radius: 50%;
  background: rgba(255,255,255,0.9); border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--text2);
  box-shadow: var(--shadow);
  transition: all 0.15s;
}
.modal-close:hover { background: var(--red2); color: var(--red); border-color: var(--red); }
.modal-close .material-symbols-outlined { font-size: 20px; }

/* Modal cover */
.modal-cover {
  height: 130px; position: relative; overflow: hidden;
  border-radius: 20px 20px 0 0;
}
.modal-cover-pattern {
  position: absolute; inset: 0;
  background-image: radial-gradient(circle at 25% 50%, rgba(255,255,255,0.2) 0%, transparent 50%),
                    radial-gradient(circle at 75% 30%, rgba(255,255,255,0.1) 0%, transparent 40%);
}
.modal-cover-overlay {
  position: absolute; bottom: 0; left: 0; right: 0; height: 40px;
  background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.1));
}

/* Modal avatar */
.modal-avatar-wrap {
  position: absolute; bottom: -40px; left: 32px;
  width: 90px; height: 90px;
}
.modal-avatar {
  width: 90px; height: 90px; border-radius: 50%;
  border: 4px solid var(--bg-card);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  overflow: visible;
  z-index: 5;
}
.mav-initials { font-family: 'Sora', sans-serif; font-size: 28px; font-weight: 800; color: white; }
.modal-status-dot {
  position: absolute; bottom: 4px; right: 4px;
  width: 18px; height: 18px; border-radius: 50%;
  border: 3px solid var(--bg-card);
}
.modal-status-dot.live { background: var(--green); }
.modal-status-dot.off  { background: var(--muted); }

/* Modal body */
.modal-body { padding: 56px 32px 28px; }

.mb-identity { margin-bottom: 20px; }
.mb-name { font-family: 'Sora', sans-serif; font-size: 22px; font-weight: 800; color: var(--text1); letter-spacing: -0.4px; }
.mb-user { font-size: 14px; color: var(--accent); font-weight: 600; margin-bottom: 8px; }
.mb-badges { display: flex; gap: 6px; flex-wrap: wrap; }
.mbadge {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 3px 10px; border-radius: 14px;
  font-size: 11px; font-weight: 700;
}
.mbadge.green  { background: var(--green2); color: var(--green); }
.mbadge.red    { background: var(--red2);   color: var(--red);   }
.mbadge.blue   { background: var(--blue2);  color: var(--blue);  }
.mbadge.orange { background: var(--accent2);color: var(--accent); }

/* Grid 2 cols */
.mb-grid { display: grid; grid-template-columns: 1fr 1.3fr; gap: 24px; margin-bottom: 24px; }
.mb-col-left  { display: flex; flex-direction: column; gap: 20px; }
.mb-col-right { display: flex; flex-direction: column; gap: 20px; }

.mb-section { }
.mb-section.mt0 { margin-top: 0; }
.mb-sec-title {
  display: flex; align-items: center; gap: 7px;
  font-size: 12px; font-weight: 700; color: var(--muted);
  text-transform: uppercase; letter-spacing: 0.5px;
  margin-bottom: 10px;
}
.mb-bio { font-size: 13.5px; color: var(--text2); line-height: 1.65; margin: 0; }
.mb-tags { display: flex; flex-wrap: wrap; gap: 6px; }

/* Contato */
.mb-contact-list { display: flex; flex-direction: column; gap: 8px; }
.mc-row { display: flex; align-items: center; gap: 10px; font-size: 13px; color: var(--text2); }
.mc-icon { font-size: 17px !important; color: var(--muted); flex-shrink: 0; }

/* KPIs modal */
.mb-kpis { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.kpi-m {
  display: flex; align-items: center; gap: 12px;
  background: var(--bg-el); border-radius: var(--radius-s); padding: 14px;
  border: 1px solid var(--border);
}
.kpim-icon {
  width: 38px; height: 38px; border-radius: var(--radius-s); flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.kpim-icon .material-symbols-outlined { font-size: 20px; }
.kpim-icon.orange { background: var(--yellow2); color: var(--yellow); }
.kpim-icon.green  { background: var(--green2);  color: var(--green);  }
.kpim-icon.blue   { background: var(--blue2);   color: var(--blue);   }
.kpim-icon.purple { background: var(--purple2); color: var(--purple); }
.kpim-val { font-family: 'Sora', sans-serif; font-size: 20px; font-weight: 800; color: var(--text1); line-height: 1; }
.kpim-lbl { font-size: 11.5px; font-weight: 600; color: var(--text2); margin-top: 2px; }
.kpim-sub { font-size: 10.5px; color: var(--muted); }

/* Performance bars */
.perf-bars { display: flex; flex-direction: column; gap: 12px; }
.pb-item   { }
.pb-head   { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; }
.pb-label  { font-size: 12px; color: var(--text2); font-weight: 500; }
.pb-val    { font-size: 12px; font-weight: 700; }
.pb-val.green  { color: var(--green);  }
.pb-val.orange { color: var(--accent); }
.pb-val.red    { color: var(--red);    }
.pb-track  { height: 6px; background: var(--bg-el2); border-radius: 3px; overflow: hidden; }
.pb-fill   { height: 100%; border-radius: 3px; background: var(--accent); transition: width 0.6s ease; }
.pb-fill.green  { background: var(--green); }
.pb-fill.orange { background: var(--accent); }

/* Stars */
.stars-display { display: flex; gap: 16px; align-items: flex-start; }
.sd-big { display: flex; flex-direction: column; align-items: center; gap: 4px; flex-shrink: 0; }
.sd-num { font-family: 'Sora', sans-serif; font-size: 36px; font-weight: 800; color: var(--text1); line-height: 1; }
.sd-stars { display: flex; gap: 2px; }
.sd-star { font-size: 16px !important; color: var(--border); }
.sd-star.filled { color: var(--yellow); font-variation-settings: 'FILL' 1; }
.sd-count { font-size: 10.5px; color: var(--muted); }
.sd-bars  { flex: 1; display: flex; flex-direction: column; gap: 5px; }
.sdb-row  { display: flex; align-items: center; gap: 6px; }
.sdb-num  { font-size: 11px; color: var(--muted); width: 8px; text-align: right; }
.sdb-star { font-size: 12px !important; color: var(--yellow); font-variation-settings: 'FILL' 1; }
.sdb-track { flex: 1; height: 5px; background: var(--bg-el2); border-radius: 3px; overflow: hidden; }
.sdb-fill  { height: 100%; background: var(--yellow); border-radius: 3px; }

/* Modal action bar */
.modal-action {
  display: flex; align-items: center; gap: 16px;
  padding: 18px 0 0;
  border-top: 1px solid var(--border);
  flex-wrap: wrap;
}
.ma-info {
  display: flex; align-items: center; gap: 6px;
  font-size: 12px; color: var(--muted); flex: 1;
}
.ma-btns { display: flex; gap: 10px; }
.btn-modal-cancel {
  padding: 10px 20px; border-radius: var(--radius-s);
  background: var(--bg-el); border: 1px solid var(--border);
  color: var(--text2); font-size: 13px; font-weight: 600;
  cursor: pointer; font-family: inherit; transition: all 0.15s;
}
.btn-modal-cancel:hover { background: var(--bg-el2); }
.btn-modal-assoc {
  display: flex; align-items: center; gap: 7px;
  padding: 10px 22px; border-radius: var(--radius-s);
  background: var(--accent); color: white; border: none;
  font-size: 13px; font-weight: 700; cursor: pointer;
  font-family: inherit; transition: all 0.15s;
  box-shadow: 0 4px 14px rgba(255,128,73,0.35);
}
.btn-modal-assoc:hover { background: var(--acc-h); }
.btn-modal-assoc.loading { opacity: 0.7; }
.btn-modal-desassoc {
  display: flex; align-items: center; gap: 7px;
  padding: 10px 22px; border-radius: var(--radius-s);
  background: var(--red2); color: var(--red);
  border: 1px solid rgba(220,38,38,0.3);
  font-size: 13px; font-weight: 700; cursor: pointer;
  font-family: inherit; transition: all 0.15s;
}
.btn-modal-desassoc:hover { background: #fca5a5; }

/* ═══════════════════════════════
   MODAL TRANSITION
═══════════════════════════════ */
.modal-enter-active { animation: modalIn 0.25s cubic-bezier(0.34,1.56,0.64,1); }
.modal-leave-active { animation: modalOut 0.18s ease-in; }
@keyframes modalIn  { from { opacity:0; transform: scale(0.94); } to { opacity:1; transform: scale(1); } }
@keyframes modalOut { from { opacity:1; } to { opacity:0; transform: scale(0.96); } }

/* ═══════════════════════════════
   TOAST
═══════════════════════════════ */
.toast-container {
  position: fixed; bottom: 24px; right: 24px;
  z-index: 9999; display: flex; flex-direction: column; gap: 8px;
}
.toast {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 18px; border-radius: 12px;
  background: var(--text1); color: white;
  font-size: 13px; font-weight: 600;
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
  min-width: 260px;
}
.toast.success { background: #14532d; border-left: 3px solid var(--green); }
.toast.info    { background: #1e3a8a; border-left: 3px solid var(--blue); }
.toast.error   { background: #7f1d1d; border-left: 3px solid var(--red); }
.toast-icon { font-size: 18px !important; }
.toast-enter-active { animation: toastIn 0.3s cubic-bezier(0.34,1.56,0.64,1); }
.toast-leave-active { animation: toastOut 0.25s ease-in; }
@keyframes toastIn  { from { opacity:0; transform: translateX(20px); } }
@keyframes toastOut { to   { opacity:0; transform: translateX(20px); } }

/* ═══════════════════════════════
   SCROLLBAR
═══════════════════════════════ */
.modal-box::-webkit-scrollbar { width: 5px; }
.modal-box::-webkit-scrollbar-track { background: transparent; }
.modal-box::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

/* ═══════════════════════════════
   RESPONSIVE
═══════════════════════════════ */
@media (max-width: 1100px) {
  .hero-inner     { grid-template-columns: 1fr; gap: 20px; }
  .hero-right     { max-width: 100%; }
  .mb-grid        { grid-template-columns: 1fr; }
  .vnd-content    { padding: 20px; }
  .vnd-hero       { padding: 24px 20px; }
}
@media (max-width: 640px) {
  .vendors-grid.grid { grid-template-columns: 1fr; }
  .hero-title         { font-size: 24px; font-weight: 650;}
  .mb-kpis            { grid-template-columns: 1fr; }
  .modal-body         { padding: 52px 20px 20px; }
  .modal-action       { flex-direction: column; align-items: flex-start; }
  .ma-btns            { width: 100%; flex-direction: column; }
  .btn-modal-assoc, .btn-modal-desassoc, .btn-modal-cancel { width: 100%; justify-content: center; }
}
</style>