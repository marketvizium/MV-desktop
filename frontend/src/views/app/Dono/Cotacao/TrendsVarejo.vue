<template>
    <div class="mv-root">

      <div class="mv-shell">

        <!-- ══════════════════ TOOLBAR ══════════════════ -->
        <div class="mv-toolbar">
          <div class="mv-search">
            <span class="msr">search</span>
            <input
              type="text"
              v-model="search"
              @input="onSearchInput"
              placeholder="Buscar produtos, marcas e mais..."
            >
            <button v-if="search" class="mv-icon-btn" style="width:30px;height:30px;" @click="clearSearch">
              <span class="msr" style="font-size:17px;">close</span>
            </button>
          </div>

          <button
            class="mv-icon-btn"
            :class="{ active: activeTab === 'favoritos' && !search }"
            title="Favoritos"
            @click="setTab('favoritos')"
          >
            <span class="msr">favorite</span>
            <span v-if="favoritos.length" class="mv-mini-badge">{{ favoritos.length }}</span>
          </button>

          <button class="mv-icon-btn" title="Atualizar" @click="refreshAll">
            <span class="msr" :class="{ 'mv-spin': loading }">refresh</span>
          </button>

          <button class="mv-cta" @click="openDrawer('cotacao')">
            <span class="msr">request_quote</span>
            <span class="label-text">Cesta</span>
          </button>
        </div>

        <!-- ══════════════════ TABS ══════════════════ -->
        <div class="mv-tabs">
          <button
            v-for="t in tabs"
            :key="t.key"
            class="mv-tab"
            :class="{ active: activeTab === t.key && !search }"
            @click="setTab(t.key)"
          >
            <span class="msr">{{ t.icon }}</span>{{ t.label }}
            <span v-if="t.key === 'lancamentos' && lancamentos.paginacao.total_registros" class="mv-tab-count">
              {{ lancamentos.paginacao.total_registros }}
            </span>
          </button>
          <button class="mv-tab" :class="{ active: activeTab === 'favoritos' && !search }" @click="setTab('favoritos')">
            <span class="msr">favorite</span>Favoritos
            <span v-if="favoritos.length" class="mv-tab-count">{{ favoritos.length }}</span>
          </button>
        </div>

        <!-- ══════════════════ HERO BANNERS ══════════════════ -->
        <div class="mv-hero" @mouseenter="pararHero" @mouseleave="iniciarHero">
          <div class="mv-hero-track" :style="{ transform: `translateX(-${heroIndex * 100}%)` }">
            <div v-for="(slide, i) in banners" :key="i" class="mv-slide" :class="slide.colorClass">
              <div class="mv-slide-copy">
                <span class="mv-slide-eyebrow"><span class="msr">{{ slide.icon }}</span>{{ slide.title }}</span>
                <h2>{{ slide.description }}</h2>
                <p>{{ slide.text }}</p>
                <a class="mv-slide-btn" href="#" @click.prevent="slide.action && setTab(slide.action)">
                  <span class="msr">arrow_forward</span>{{ slide.buttonLabel }}
                </a>
              </div>
              <div class="mv-slide-art">{{ slide.art }}</div>
            </div>
          </div>
          <button class="mv-hero-arrow prev" @click="goHero(heroIndex - 1)"><span class="msr">chevron_left</span></button>
          <button class="mv-hero-arrow next" @click="goHero(heroIndex + 1)"><span class="msr">chevron_right</span></button>
          <div class="mv-hero-dots">
            <button v-for="(s, i) in banners" :key="'dot-' + i" :class="{ active: i === heroIndex }" @click="goHero(i)"></button>
          </div>
        </div>

        <!-- ══════════════════ CATEGORIAS ══════════════════ -->
        <div class="mv-categories">
          <div
            v-for="cat in categoriasDisponiveis"
            :key="cat.key"
            class="mv-cat"
            :class="{ active: activeCategoria === cat.key }"
            @click="setCategoria(cat.key)"
          >
            <div class="mv-cat-icon"><span class="msr">{{ cat.icon }}</span></div>
            <span>{{ cat.label }}</span>
          </div>
        </div>

        <!-- ══════════════════ LOADING / ERRO ══════════════════ -->
        <div v-if="loading && !carregouAlgo" class="mv-empty">
          <span class="mv-spinner"></span>
          <p>Carregando vitrine...</p>
        </div>

        <div v-else-if="error" class="mv-empty">
          <span class="msr">cloud_off</span>
          <p>Não foi possível carregar os produtos.</p>
          <a class="mv-slide-btn" style="display:inline-flex;margin-top:10px;color:#fff;background:var(--primary);" @click="refreshAll">
            Tentar novamente
          </a>
        </div>

        <!-- ══════════════════ CONTEÚDO DINÂMICO ══════════════════ -->
        <template v-else>

          <!-- MODO BUSCA -->
          <template v-if="search">
            <div v-if="buscando" class="mv-empty"><span class="mv-spinner mv-spinner-dots"></span></div>
            <template v-else>
              <div class="mv-section">
                <div class="mv-section-head">
                  <div><span class="eyebrow">Busca</span><h3>Resultados para "{{ search }}"</h3></div>
                  <span class="mv-see-all" style="pointer-events:none;">
                    {{ resultadoBusca.paginacao.total_registros || 0 }} produtos
                  </span>
                </div>

                <div v-if="resultadoBuscaFiltrado.length" class="mv-grid">
                  <MarvizProdutoCard
                    v-for="p in resultadoBuscaFiltrado"
                    :key="p.id_produto_vendedor"
                    :produto="p"
                    :favorito="isFavorito(p)"
                    @abrir="abrirProduto"
                    @favoritar="toggleFavorito"
                    @compartilhar="compartilharProduto"
                  />
                </div>
                <div v-else class="mv-empty">
                  <span class="msr">search_off</span>Nenhum produto encontrado para essa busca.
                </div>

                <div class="mv-paginacao" v-if="resultadoBusca.paginacao.total_paginas > 1">
                  <button
                    class="mv-pag-btn"
                    :disabled="resultadoBusca.paginacao.pagina_atual === 1"
                    @click="irParaPaginaBusca(resultadoBusca.paginacao.pagina_atual - 1)"
                  ><span class="msr" style="font-size:16px;">chevron_left</span></button>
                  <span class="mv-pag-info">
                    Página {{ resultadoBusca.paginacao.pagina_atual }} de {{ resultadoBusca.paginacao.total_paginas }}
                  </span>
                  <button
                    class="mv-pag-btn"
                    :disabled="resultadoBusca.paginacao.pagina_atual === resultadoBusca.paginacao.total_paginas"
                    @click="irParaPaginaBusca(resultadoBusca.paginacao.pagina_atual + 1)"
                  ><span class="msr" style="font-size:16px;">chevron_right</span></button>
                </div>
              </div>
            </template>
          </template>

          <!-- ABA: FAVORITOS -->
          <template v-else-if="activeTab === 'favoritos'">
            <div class="mv-section">
              <div class="mv-section-head">
                <div><span class="eyebrow">Sua lista</span><h3>Produtos favoritos</h3></div>
              </div>
              <div v-if="favoritosProdutos.length" class="mv-grid">
                <MarvizProdutoCard
                  v-for="p in favoritosProdutos"
                  :key="p.id_produto_vendedor"
                  :produto="p"
                  :favorito="true"
                  @abrir="abrirProduto"
                  @favoritar="toggleFavorito"
                  @compartilhar="compartilharProduto"
                />
              </div>
              <div v-else class="mv-empty">
                <span class="msr">favorite_border</span>Você ainda não favoritou nenhum produto.
              </div>
            </div>
          </template>

          <!-- ABA: INÍCIO -->
          <template v-else-if="activeTab === 'inicio'">

            <div class="mv-section">
              <div class="mv-section-head">
                <div><span class="eyebrow">Catálogo Marviz</span><h3>Lançamentos da Semana</h3></div>
                <button class="mv-see-all" @click="setTab('lancamentos')">
                  Ver todos <span class="msr">chevron_right</span>
                </button>
              </div>
              <div class="mv-carousel" v-if="lancamentosPreview.length">
                <MarvizProdutoCard
                  v-for="p in lancamentosPreview"
                  :key="p.id_produto_vendedor"
                  :produto="p"
                  :favorito="isFavorito(p)"
                  @abrir="abrirProduto"
                  @favoritar="toggleFavorito"
                  @compartilhar="compartilharProduto"
                />
              </div>
              <div v-else class="mv-empty" style="width:100%;">
                <span class="msr">inventory_2</span>Nenhum produto encontrado.
              </div>
            </div>

            <div class="mv-section" v-if="destaquePreview.length">
              <div class="mv-section-head">
                <div><span class="eyebrow">Selecionado pra você</span><h3>Produtos em Destaque</h3></div>
                <button class="mv-see-all" @click="setTab('destaque')">
                  Ver todos <span class="msr">chevron_right</span>
                </button>
              </div>
              <div class="mv-carousel">
                <MarvizProdutoCard
                  v-for="p in destaquePreview"
                  :key="'d-' + p.id_produto_vendedor"
                  :produto="p"
                  :favorito="isFavorito(p)"
                  @abrir="abrirProduto"
                  @favoritar="toggleFavorito"
                  @compartilhar="compartilharProduto"
                />
              </div>
            </div>

            <div class="mv-section" v-if="descontoPreview.length">
              <div class="mv-section-head">
                <div><span class="eyebrow">Por tempo limitado</span><h3>Ofertas com Desconto</h3></div>
                <button class="mv-see-all" @click="setTab('desconto')">
                  Ver todos <span class="msr">chevron_right</span>
                </button>
              </div>
              <div class="mv-carousel">
                <MarvizProdutoCard
                  v-for="p in descontoPreview"
                  :key="'o-' + p.id_produto_vendedor"
                  :produto="p"
                  :favorito="isFavorito(p)"
                  @abrir="abrirProduto"
                  @favoritar="toggleFavorito"
                  @compartilhar="compartilharProduto"
                />
              </div>
            </div>

            <div
              class="mv-section"
              v-for="cat in categoriasComProdutos"
              :key="cat.categoria"
              :id="'cat-' + cat.categoria"
            >
              <div class="mv-section-head">
                <div><span class="eyebrow">Categoria</span><h3>{{ categoriaLabel[cat.categoria] || cat.categoria }}</h3></div>
                <span class="mv-see-all" style="pointer-events:none;">{{ cat.produtos.length }} produtos</span>
              </div>
              <div class="mv-carousel">
                <MarvizProdutoCard
                  v-for="p in cat.produtos.slice(0, 10)"
                  :key="'c-' + p.id_produto_vendedor"
                  :produto="p"
                  :favorito="isFavorito(p)"
                  @abrir="abrirProduto"
                  @favoritar="toggleFavorito"
                  @compartilhar="compartilharProduto"
                />
              </div>
            </div>

          </template>

          <!-- OUTRAS ABAS: GRID PAGINADO -->
          <template v-else>
            <div class="mv-section">
              <div class="mv-section-head">
                <div>
                  <span class="eyebrow">Catálogo Marviz</span>
                  <h3>
                    <span class="msr" style="font-size:18px;vertical-align:-3px;color:var(--primary);">{{ iconeAbaAtual }}</span>
                    {{ tituloAbaAtual }}
                  </h3>
                </div>
                <span class="mv-see-all" style="pointer-events:none;">
                  {{ dadosAbaAtual.paginacao.total_registros || 0 }} produtos
                </span>
              </div>

              <div v-if="carregandoAba" class="mv-empty"><span class="mv-spinner mv-spinner-dots"></span></div>
              <template v-else>
                <div v-if="dadosAbaAtualFiltrados.length" class="mv-grid">
                  <MarvizProdutoCard
                    v-for="p in dadosAbaAtualFiltrados"
                    :key="p.id_produto_vendedor"
                    :produto="p"
                    :favorito="isFavorito(p)"
                    @abrir="abrirProduto"
                    @favoritar="toggleFavorito"
                    @compartilhar="compartilharProduto"
                  />
                </div>
                <div v-else class="mv-empty">
                  <span class="msr">inventory_2</span>Nenhum produto encontrado nesta seção.
                </div>

                <div class="mv-paginacao" v-if="dadosAbaAtual.paginacao.total_paginas > 1">
                  <button
                    class="mv-pag-btn"
                    :disabled="dadosAbaAtual.paginacao.pagina_atual === 1"
                    @click="irParaPaginaAba(dadosAbaAtual.paginacao.pagina_atual - 1)"
                  ><span class="msr" style="font-size:16px;">chevron_left</span></button>
                  <span class="mv-pag-info">
                    Página {{ dadosAbaAtual.paginacao.pagina_atual }} de {{ dadosAbaAtual.paginacao.total_paginas }}
                  </span>
                  <button
                    class="mv-pag-btn"
                    :disabled="dadosAbaAtual.paginacao.pagina_atual === dadosAbaAtual.paginacao.total_paginas"
                    @click="irParaPaginaAba(dadosAbaAtual.paginacao.pagina_atual + 1)"
                  ><span class="msr" style="font-size:16px;">chevron_right</span></button>
                </div>
              </template>
            </div>
          </template>

        </template>

        <!-- ══════════════════ FORNECEDORES ══════════════════ -->
        <div class="mv-section" v-if="fornecedores.length">
          <div class="mv-section-head">
            <div><span class="eyebrow">Rede de fornecedores</span><h3>Vendedores parceiros na Marviz</h3></div>
          </div>
          <div class="mv-brands">
            <div v-for="(v, i) in fornecedores" :key="v" class="mv-brand-chip">
              <span class="dot" :style="{ background: brandColor(i) }"></span>{{ v }}
            </div>
          </div>
        </div>

      </div>

      <!-- ══════════════════ CESTA FABs ══════════════════ -->
      <div class="mv-quote-fab">
        <button style="background-color: #000; border-radius: 50px; height: 42px;
           padding: 10px; color: #FFF; font-family: 'Poppins'; font-weight: 600;
           display: flex; align-items: center; justify-content: center; font-size: 0.8rem; width: 120px; gap: 5px;" title="Atualizar" @click="abrirTutorial">
            <span class="material-symbols-outlined">
            help
            </span>
            Tutorial
        </button>
        <button style="background-color: #1A032E;" @click="openDrawer('cotacao')">
          <span class="msr">request_quote</span>
          <span class="label">Cesta de cotação</span>
          <span class="count" style="background-color: #01BC9B; color: #FFF;" >{{ cartCounts.cCount }}</span>
        </button>
      </div>

      <!-- ══════════════════ DRAWER (cotação) ══════════════════ -->
      <div class="mv-drawer-scrim"  :class="{ open: drawerOpen }" @click="closeDrawer"></div>
      <div class="mv-quote-drawer" style="background-color: #fff; margin-top: 40px; padding-bottom: 50px;":class="{ open: drawerOpen }">
        <div class="mv-quote-drawer-head">
          <div class="mv-quote-drawer-head-top">
            <div>
              <h3>Cesta de cotação</h3>
              <p>Itens agrupados por cotação e vendedor</p>
            </div>
            <button class="mv-icon-btn" @click="closeDrawer"><span class="msr">close</span></button>
          </div>
        </div>

        <div class="mv-quote-list">
          <div v-if="!gruposCestaAtiva.length" class="mv-quote-empty">
            <span style="color: #EAE0F5;" class="msr">request_quote</span>
            <div style="color: #745C90;" >
              Sua cesta de cotação está vazia.<br>
              Adicione produtos pelo modal do produto.
            </div>
          </div>

          <div
            v-else
            class="mv-quote-target-group"
            v-for="grupo in gruposCestaAtiva"
            :key="grupo.id_cotacao"
          >
            <div class="mv-quote-target-label">
              <span class="msr">request_quote</span>
              {{ grupo.nome_cotacao }}
              <span class="idtag">#{{ grupo.id_cotacao }}</span>
            </div>

            <template v-for="[vendor, itens] in itensPorVendedor(grupo)" :key="vendor">
              <div class="mv-quote-vendor-label"><span class="msr" style="font-size:13px">storefront</span>{{ vendor }}</div>
              <div class="mv-quote-item" v-for="it in itens" :key="it.produto.id_produto_vendedor">
                <img :src="it.produto.foto_capa || placeholderImg" @error="onImgErrorEl">
                <div class="mv-quote-item-info">
                  <div class="name">{{ it.produto.nome }}</div>
                  <div class="price">{{ fmtMoney(precoComDesconto(it.produto)) }} /{{ it.produto.tipo }}</div>
                </div>
                <div class="mv-quote-item-qty">
                  <button @click="alterarQtdCesta(it, -1)">−</button>
                  <span>{{ it.qty }}</span>
                  <button @click="alterarQtdCesta(it, 1)">+</button>
                </div>
                <button class="mv-quote-item-remove" @click="removerItemCesta(grupo, it)">
                  <span class="msr">close</span>
                </button>
              </div>
            </template>
          </div>
        </div>

        <div class="mv-quote-drawer-foot">
          <div class="mv-quote-total-row"><span>Itens selecionados</span><strong>{{ cestaTotais.itens }}</strong></div>
          <div class="mv-quote-total-row"><span>Valor estimado</span><strong>{{ fmtMoney(cestaTotais.valor) }}</strong></div>
          <div class="mv-modal-actions-row">
            <button class="mv-btn ghost" @click="limparCesta"><span class="msr">delete</span>Limpar</button>
            <button class="mv-btn primary" :disabled="enviandoCesta" @click="enviarCesta">
              <span class="msr" :class="{ 'mv-spin': enviandoCesta }">
                {{ enviandoCesta ? 'progress_activity' : 'send' }}
              </span>
              {{ enviandoCesta ? 'Enviando...' : 'Enviar' }}
            </button>
          </div>
        </div>
      </div>

      <!-- ══════════════════ PÁGINA DE PRODUTO (cobre 100% da tela) ══════════════════ -->
      <Transition name="mv-pp-fade">
        <div class="mv-pp" v-if="showModal && produtoSelecionado" role="dialog" aria-modal="true">

          <!-- barra superior fixa -->
          <div class="mv-pp-topbar" style="margin-top: 150px;" >
            <button class="mv-pp-voltar" style="font-size: 1.2rem;" @click="fecharModal">
              <span class="msr" >arrow_back</span><span class="mv-pp-voltar-label">Voltar</span>
            </button>
            <div class="mv-pp-topbar-title" style="font-size: 1.2rem;">{{ produtoSelecionado.nome || 'Produto' }}</div>
            <button   class="mv-pp-x" title="Fechar" @click="fecharModal">
              <span style="font-size: 1.8rem;" class="msr">close</span>
            </button>
          </div>

          <!-- conteúdo rolável -->
          <div class="mv-pp-scroll">
            <div class="mv-pp-content">

              <!-- topo: galeria + informações do produto -->
              <div class="mv-pp-main">
                <div class="mv-modal-gallery">
                  <div class="mv-modal-main-img">
                    <img :src="imagensModal[fotoIndex] || imagensModal[0]" @error="onImgErrorEl">
                    <span v-if="isDesconto(produtoSelecionado)" class="mv-badge discount">
                      <span class="msr" style="font-size:13px">local_offer</span>-{{ produtoSelecionado.promocao_desconto }}%
                    </span>
                    <span  v-if="isLancamento(produtoSelecionado)"  class="mv-badge new" style="right:10px;left:auto;">Novo</span>
                  </div>
                  <div class="mv-modal-thumbs">
                    <button
                      v-for="(src, idx) in imagensModal"
                      :key="idx"
                      :class="{ active: idx === fotoIndex }"
                      @click="selecionarFoto(idx)"
                    ><img :src="src" @error="onImgErrorEl"></button>
                  </div>
                </div>

                <div class="mv-pp-info">
                  <div class="mv-modal-top-tags">
                    <span v-if="produtoSelecionado.categoria">
                      {{ categoriaLabel[produtoSelecionado.categoria] || produtoSelecionado.categoria }}
                    </span>
                    <span v-if="produtoSelecionado.fornecedor" class="fornecedor">{{ produtoSelecionado.fornecedor }}</span>
                    <span v-if="produtoSelecionado.ativo === false" class="inativo">Inativo</span>
                  </div>

                  <h1 class="mv-pp-title" style="font-size: 2.8rem;">{{ produtoSelecionado.nome || 'Produto' }}</h1>

                  <div class="mv-pp-vendedor" style="font-size: 1.0rem;" v-if="produtoSelecionado.nome_vendedor || produtoSelecionado.email_vendedor">
                    <span class="msr">storefront</span>
                    <span>{{ produtoSelecionado.nome_vendedor || 'Vendedor não informado' }}</span>
                    <span v-if="produtoSelecionado.email_vendedor" class="mv-pp-vendedor-email">{{ produtoSelecionado.email_vendedor }}</span>
                  </div>

                  <div class="mv-modal-barcode" v-if="produtoSelecionado.codigo_barra">
                    <span class="msr">barcode_scanner</span><span>{{ produtoSelecionado.codigo_barra }}</span>
                  </div>

                  <!-- resumo de avaliação: leva até a seção de avaliações -->
                  <button type="button" class="mv-pp-rating-summary" style="font-size: 1rem;"  @click="irParaAvaliacoes">
                    <span class="stars lg" style="color: #EED618;">
                      <span
                        v-for="(s, i) in starArray(produtoSelecionado.media)"
                        :key="i"
                        class="msr"
                        :class="{ fill: s !== 'empty' }"
                        style="font-size: 20px;"
                      >{{ s === 'half' ? 'star_half' : 'star' }}</span>
                    </span>
                    <strong>{{ Number(produtoSelecionado.media || 0).toFixed(1) }}</strong>
                    <span class="mv-pp-rating-count">({{ formatCount(produtoSelecionado.avaliacoes) }} avaliações)</span>
                  </button>

                  <div class="mv-social-row">
                    <button
                      class="mv-social-btn mv-like-btn"
                      :class="{ liked: modalCurtido }"
                      :disabled="curtindo"
                      :title="modalCurtido ? 'Remover curtida deste produto' : 'Curtir este produto'"
                      @click="toggleFavorito(produtoSelecionado)"
                    >
                      <span class="msr">{{ modalCurtido ? 'favorite' : 'favorite_border' }}</span>
                      <span class="mv-social-btn-label">{{ modalCurtido ? 'Curtido' : 'Curtir' }}</span>
                      <span class="mv-social-count">{{ formatCount(produtoSelecionado.curtidas) }}</span>
                    </button>

                    <button
                      class="mv-social-btn mv-share-btn"
                      :disabled="exportandoPdf"
                      title="Compartilhar produto (gera um PDF)"
                      @click="compartilharProduto(produtoSelecionado)"
                    >
                      <span class="msr" :class="{ 'mv-spin': exportandoPdf }">{{ exportandoPdf ? 'progress_activity' : 'ios_share' }}</span>
                      <span class="mv-social-btn-label">{{ exportandoPdf ? 'Gerando PDF...' : 'Compartilhar' }}</span>
                      <span class="mv-social-count">{{ formatCount(produtoSelecionado.compartilhamentos) }}</span>
                    </button>

                    <span class="mv-social-metric" title="Visualizações">
                      <span class="msr">visibility</span>{{ formatCount(produtoSelecionado.visualizacoes) }}
                    </span>
                  </div>

                  <div class="mv-modal-price-row">
                    <span class="mv-modal-price" style="font-size: 2.5rem; font-weight: 800;">{{ fmtMoney(precoComDesconto(produtoSelecionado)) }}</span>
                    <span v-if="isDesconto(produtoSelecionado)" class="mv-modal-price-old">
                      {{ fmtMoney(produtoSelecionado.preco) }}
                    </span>
                  </div>
                  <div
                    class="mv-modal-desconto-info"
                    style="font-size: 1rem; font-weight: 700; margin-top: 20px;"
                    v-if="isDesconto(produtoSelecionado) && (produtoSelecionado.desconto_inicio || produtoSelecionado.desconto_fim)"
                  >
                    <span class="msr" style="font-size:14px;color:var(--coral);">local_fire_department</span>
                    <span>Promoção válida até {{ formatDate(produtoSelecionado.desconto_fim) }}</span>
                  </div>

                  <div class="mv-modal-lancamento" v-if="produtoSelecionado.status_lancamento">
                    <div class="mv-li-row" style="font-size: 0.9rem;">
                      <span class="msr" style="font-size:14px;">campaign</span>
                      <span>Lançamento anunciado em {{ formatDate(produtoSelecionado.criado_em) }}</span>
                    </div>
  
                    <div class="mv-li-motivo" v-if="produtoSelecionado.motivo_recusa">
                      Motivo da recusa: {{ produtoSelecionado.motivo_recusa }}
                    </div>
                  </div>

                  <p class="mv-modal-desc" :class="{ empty: !produtoSelecionado.descricao }">
                    {{ produtoSelecionado.descricao || 'Este anúncio ainda não possui uma descrição.' }}
                  </p>

                  <div class="mv-completude">
                    <div class="mv-completude-head">
                      <span>Qualidade do anúncio</span><span>{{ produtoSelecionado.completude_score ?? 0 }}/8</span>
                    </div>
                    <div class="mv-completude-track">
                      <div
                        class="mv-completude-fill"
                        :style="{ width: (((produtoSelecionado.completude_score ?? 0) / 8) * 100) + '%' }"
                      ></div>
                    </div>
                  </div>

                  <!-- adicionar à cotação / pedido direto -->
                  <div class="mv-modal-actions mv-pp-actions-card">
                    <div class="mv-warn" v-if="modoAtivo === 'cotacao'">
                      Se esse produto for adicionado à cotação, não será exclusivo de um vendedor. Qualquer um poderá enviar oferta.
                    </div>

                    <label class="mv-field-label">Adicionar item a...</label>
                    <div class="mv-modo-toggle">
                      <button style="background-color: #ff8049; color: #FFF;" class="mv-modo-btn" :class="{ active: modoAtivo === 'pedido_direto' }" @click="toggleModo('pedido_direto')">
                        <span class="msr">bolt</span>Pedido Direto
                      </button>
                      <button style="background-color: #ff8049; color: #FFF;" class="mv-modo-btn" :class="{ active: modoAtivo === 'cotacao' }" @click="toggleModo('cotacao')">
                        <span class="msr">request_quote</span>Cotação
                      </button>
                    </div>

                    <div v-if="modoAtivo === 'cotacao'">
                      <div class="mv-loading-hint" v-if="carregandoListaAtiva">
                        <span class="msr mv-spin">progress_activity</span>
                        <span>Carregando cotações abertas...</span>
                      </div>

                      <div class="mv-opcoes-lista" v-else>
                        <template v-if="listaAtiva.length">
                          <button
                            type="button"
                            class="mv-opcao-item"
                            v-for="item in itensPaginaModal"
                            :key="item.id_cotacao"
                            :class="{ active: itemSelecionadoEhIgual(item) }"
                            @click="selecionarItemLista(item)"
                          >
                            <span class="msr mv-opcao-icone">request_quote</span>
                            <span class="mv-opcao-texto">
                              {{ item.nome_cotacao }}
                              <span class="mv-opcao-id">#{{ item.id_cotacao }}</span>
                            </span>
                            <span v-if="itemSelecionadoEhIgual(item)" class="msr mv-opcao-check">check_circle</span>
                          </button>
                        </template>
                        <div class="mv-empty-hint" v-else>
                          Nenhuma cotação criada encontrada no momento.
                        </div>
                      </div>

                      <div class="mv-paginacao" v-if="totalPaginasModal > 1 && !carregandoListaAtiva">
                        <button class="mv-pag-btn" :disabled="paginaAtual === 1" @click="paginaModalAnterior">
                          <span class="msr" style="font-size:16px;">chevron_left</span>
                        </button>
                        <span class="mv-pag-info">Página {{ paginaAtual }} de {{ totalPaginasModal }}</span>
                        <button class="mv-pag-btn" :disabled="paginaAtual === totalPaginasModal" @click="paginaModalProxima">
                          <span class="msr" style="font-size:16px;">chevron_right</span>
                        </button>
                      </div>
                    </div>

                    <div v-if="modoAtivo === 'cotacao' && itemSelecionado">
                      <div class="mv-qty-row">
                        <span class="mv-qty-label">Quantidade</span>
                        <div class="mv-qty-stepper">
                          <button @click="ajustarQtdModal(-1)"><span class="msr" style="font-size:15px;">remove</span></button>
                          <input type="number" min="1" v-model.number="modalQty">
                          <button @click="ajustarQtdModal(1)"><span class="msr" style="font-size:15px;">add</span></button>
                        </div>
                      </div>
                      <div class="mv-qty-row">
                        <span class="mv-qty-label">Tipo</span>
                        <span class="mv-tipo-chip">{{ produtoSelecionado.tipo || 'Não especificado' }}</span>
                      </div>
                      <button class="mv-confirm-btn" @click="confirmarAdicionarNaCesta">
                        <span class="msr">add_shopping_cart</span>
                        <span>Adicionar à Cotação</span>
                      </button>
                    </div>

                    <!-- PEDIDO DIRETO: sem listagem/seleção — adiciona automaticamente ao
                         pedido direto em aberto do vendedor (ou cria um novo, se não houver) -->
                    <div v-if="modoAtivo === 'pedido_direto'">
                      <div class="mv-qty-row">
                        <span class="mv-qty-label">Quantidade</span>
                        <div class="mv-qty-stepper">
                          <button @click="ajustarQtdModal(-1)"><span class="msr" style="font-size:15px;">remove</span></button>
                          <input type="number" min="1" v-model.number="modalQty">
                          <button @click="ajustarQtdModal(1)"><span class="msr" style="font-size:15px;">add</span></button>
                        </div>
                      </div>
                      <div class="mv-qty-row">
                        <span class="mv-qty-label">Tipo</span>
                        <span class="mv-tipo-chip">{{ produtoSelecionado.tipo || 'Não especificado' }}</span>
                      </div>
                      <button class="mv-confirm-btn" :disabled="adicionandoPedidoDireto" @click="confirmarAdicionarNaCesta">
                        <span class="msr" :class="{ 'mv-spin': adicionandoPedidoDireto }">
                          {{ adicionandoPedidoDireto ? 'progress_activity' : 'shopping_cart_checkout' }}
                        </span>
                        <span>{{ adicionandoPedidoDireto ? 'Adicionando...' : 'Adicionar ao Pedido Direto' }}</span>
                      </button>
                    </div>

                    <div class="mv-feedback" v-if="feedbackAcao" :class="feedbackAcao.tipo">
                      <span class="msr" style="font-size:15px">{{ feedbackAcao.tipo === 'ok' ? 'check_circle' : 'error' }}</span>
                      {{ feedbackAcao.msg }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- avaliações, curtidas e compartilhamento -->
              <div class="mv-pp-section" ref="avaliacoesSection">
                <div class="mv-pp-section-head">
                  <h3><span class="msr">reviews</span>Avaliações</h3>
                </div>

                <div class="mv-pp-avaliacoes-grid">
                  <div class="mv-pp-avaliacao-resumo">
                    <div class="mv-pp-media-num">{{ Number(produtoSelecionado.media || 0).toFixed(1) }}</div>
                    <span class="stars lg">
                      <span
                        v-for="(s, i) in starArray(produtoSelecionado.media)"
                        :key="i"
                        class="msr"
                        :class="{ fill: s !== 'empty' }"
                      >{{ s === 'half' ? 'star_half' : 'star' }}</span>
                    </span>
                    <p>{{ formatCount(produtoSelecionado.avaliacoes) }} avaliações</p>

                    <div class="mv-pp-resumo-metrics">
                      <div class="mv-pp-resumo-metric">
                        <span class="msr" style="color:var(--coral);">favorite</span>
                        <strong>{{ formatCount(produtoSelecionado.curtidas) }}</strong>
                        <span>curtidas</span>
                      </div>
                      <div class="mv-pp-resumo-metric">
                        <span class="msr" style="color:var(--primary);">ios_share</span>
                        <strong>{{ formatCount(produtoSelecionado.compartilhamentos) }}</strong>
                        <span>compartilhamentos</span>
                      </div>
                    </div>
                  </div>

                  <div class="mv-pp-avaliar-card">
                    <span class="mv-modal-avaliar-label">
                      {{ minhaAvaliacao ? 'Sua avaliação' : 'Avalie este produto' }}
                    </span>

                    <div class="mv-avaliar-stars" @mouseleave="hoverEstrela = 0">
                      <button
                        v-for="n in 5"
                        :key="n"
                        type="button"
                        class="mv-avaliar-star"
                        :class="{ fill: n <= (hoverEstrela || minhaAvaliacao) }"
                        :disabled="enviandoAvaliacao"
                        :title="`Avaliar com ${n} estrela${n > 1 ? 's' : ''}`"
                        @mouseenter="hoverEstrela = n"
                        @focus="hoverEstrela = n"
                        @click="avaliarProduto(produtoSelecionado, n)"
                      >
                        <span class="msr">star</span>
                      </button>
                    </div>

                    <span class="mv-avaliar-hint">
                      <span v-if="enviandoAvaliacao" class="mv-avaliar-enviando">
                        <span class="msr mv-spin" style="font-size:14px;">progress_activity</span>Enviando avaliação...
                      </span>
                      <span v-else-if="hoverEstrela">{{ ratingLabels[hoverEstrela - 1] }}</span>
                      <span v-else-if="minhaAvaliacao" class="mv-modal-avaliar-done">
                        Você avaliou com {{ minhaAvaliacao }} estrela{{ minhaAvaliacao > 1 ? 's' : '' }} · toque para alterar
                      </span>
                      <span v-else>Toque em uma estrela para avaliar</span>
                    </span>
                  </div>
                </div>
              </div>

              <!-- você também pode gostar -->
              <div class="mv-pp-section" v-if="produtosRelacionados.length">
                <div class="mv-pp-section-head">
                  <h3><span class="msr">grid_view</span>Você também pode gostar</h3>
                </div>
                <div class="mv-grid">
                  <MarvizProdutoCard
                    v-for="p in produtosRelacionados"
                    :key="p.id_produto_vendedor"
                    :produto="p"
                    :favorito="isFavorito(p)"
                    @abrir="abrirProduto"
                    @favoritar="toggleFavorito"
                    @compartilhar="compartilharProduto"
                  />
                </div>
              </div>

            </div>
          </div>
        </div>
      </Transition>

      <!-- ══════════════════ TOAST ══════════════════ -->
      <div class="mv-toast" :class="{ show: toast.show }">
        <span class="msr">{{ toast.icon }}</span><span>{{ toast.msg }}</span>
      </div>

      <TutorialVarejista :force-show="tutorialAberto" />

    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { api } from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import MarvizProdutoCard from '@/components/MarvizProdutoCard.vue';
import TutorialVarejista from '@/components/tutorialVarejista.vue';

/* =====================================================================
   MARVIZ TRENDS — versão Vue (componente puro, sem dependências Ionic)

   Mantém a identidade visual do protótipo estático marviz-trends.html
   (toolbar, tabs, hero, categorias, carrosséis/grids, cartão de produto,
   modal de produto e cesta/drawer de cotação + pedido direto), porém
   com o mesmo padrão de integração usado em TrendsVarejo.vue:
     - serviço axios `api` (@/services/api)
     - `useAuthStore` (@/stores/auth) para obter id_loja
     - mesmos endpoints reais do módulo /mvpu/cotacao

   Endpoints utilizados:
     GET  /mvpu/cotacao/consultarVendedoresProd/{id_loja}
          (params: random | lancamentos | all | search, page, limit)
     GET  /mvpu/cotacao/consultarCotacao/{id_loja}           (filtrado para status "aberta")
     GET  /mvpu/cotacao/consultarPedidosDiretos/{id_loja}/{id_vendedor}
     POST /mvpu/cotacao/criarPedidoDireto/{id_loja}           { id_vendedor }
     POST /mvpu/cotacao/criarItemPedDir/{id_loja}/{id_pd}     { id_pedido_direto, nome, id_produto,
                                                                 id_vendedor, tipo_produto, origem,
                                                                 preco_produto, quantidade, qtd_unitaria_composicao }
     POST /mvpu/cotacao/adicionarProdutoInexis/{id_loja}/{id_cotacao}
          { codigo_barra: [[nome, quantidade, tipo_produto, qtd_unitaria_composicao], ...] }

   Cotação: a confirmação no modal do produto NÃO chama a API diretamente —
   agrupa o item na cesta local (cartCotacao), permitindo juntar produtos
   de vários vendedores numa mesma cotação antes do envio final feito pelo
   drawer (enviarCesta).

   Pedido direto: não existe mais seleção/listagem manual de pedidos
   diretos pelo usuário. Ao confirmar, o sistema busca (via
   consultarPedidosDiretos, já filtrado por id_vendedor no path) um
   pedido direto existente para o vendedor daquele produto com status
   diferente de "finalizada". Se encontrar, adiciona o item a ele. Se não
   encontrar, cria um novo pedido direto (POST criarPedidoDireto, apenas
   com id_vendedor), aguarda um pequeno delay e então adiciona o item —
   tudo automaticamente, sem intervenção do usuário.
   ===================================================================== */

interface Produto { [key: string]: any }

interface Paginacao {
  pagina_atual: number;
  itens_por_pagina: number;
  total_registros: number;
  total_paginas: number;
}

const paginacaoVazia = (): Paginacao => ({
  pagina_atual: 1,
  itens_por_pagina: 12,
  total_registros: 0,
  total_paginas: 1
});

const DIA_MS = 86400000;

const categoriaIcon: Record<string, string> = {
  higiene: 'soap', congelados: 'ac_unit', alimentos: 'restaurant', limpeza: 'cleaning_services',
  bebidas: 'local_bar', cosmeticos: 'face_retouching_natural', papelaria: 'edit_note', pet: 'pets'
};
const categoriaLabel: Record<string, string> = {
  higiene: 'Higiene', congelados: 'Congelados', alimentos: 'Alimentos', limpeza: 'Limpeza',
  bebidas: 'Bebidas', cosmeticos: 'Cosméticos', papelaria: 'Papelaria', pet: 'Pet'
};

const placeholderImg = 'https://placehold.co/600x600/F0EEFA/6E6890?text=Marviz';

function fmtMoney(v: any): string { return 'R$ ' + (Number(v) || 0).toFixed(2).replace('.', ','); }
function isLancamento(p: any): boolean { return p?.criado_em ? (Date.now() - Number(p.criado_em)) <= 7 * DIA_MS : false; }
function isDesconto(p: any): boolean {
  if (p?.promocao_desconto === null || p?.promocao_desconto === undefined) return false;
  const inicio = p.desconto_inicio ? Number(p.desconto_inicio) : null;
  const fim = p.desconto_fim ? Number(p.desconto_fim) : null;
  if (inicio && fim) { const now = Date.now(); return now >= inicio && now <= fim; }
  return true;
}
function precoComDesconto(p: any): number { return isDesconto(p) ? p.preco * (1 - Number(p.promocao_desconto) / 100) : p.preco; }
function galeria(p: any): string[] { return [p?.foto_capa, p?.foto_1, p?.foto_2, p?.foto_3].filter(Boolean); }
function formatCount(n: any): string {
  const v = Number(n) || 0;
  return v >= 1000 ? (v / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' mil' : String(v);
}
function formatDate(ts: any): string {
  if (!ts) return '-';
  const d = new Date(Number(ts));
  return isNaN(d.getTime()) ? '-' : d.toLocaleDateString('pt-BR');
}
function statusLancamentoLabel(s: any): string {
  return ({ nao_lido: 'Aguardando análise', aceito: 'Aceito pela loja', recusado: 'Recusado pela loja', lido: 'Visualizado' } as Record<string, string>)[s] || s || '';
}
function starArray(rating: number): string[] {
  const stars: string[] = [];
  const r = Number(rating) || 0;
  for (let i = 1; i <= 5; i++) {
    if (r >= i) stars.push('full');
    else if (r >= i - 0.5) stars.push('half');
    else stars.push('empty');
  }
  return stars;
}

export default defineComponent({
  name: 'MarvizTrends',

  components: {
    MarvizProdutoCard,
    TutorialVarejista,
  },

  data() {
    return {
      auth: null as any,

      loading: false,
      error: false,
      carregouAlgo: false,

      search: '' as string,
      _searchTimeout: null as any,
      buscando: false,
      resultadoBusca: { produtos: [] as Produto[], paginacao: paginacaoVazia() },

      activeTab: 'inicio' as string,
      tabs: [
        { key: 'inicio', label: 'Início', icon: 'home' },
        { key: 'lancamentos', label: 'Lançamentos', icon: 'new_releases' },
        { key: 'destaque', label: 'Destaques', icon: 'star' },
        { key: 'desconto', label: 'Ofertas', icon: 'local_fire_department' },
        { key: 'todos', label: 'Todos', icon: 'grid_view' }
      ],
      carregandoAba: false,
      abasCarregadas: {} as Record<string, boolean>,

      activeCategoria: 'todas' as string,
      categoriaIcon,
      categoriaLabel,

      inicio: {
        destaque: { produtos: [] as Produto[], paginacao: paginacaoVazia() },
        desconto: { produtos: [] as Produto[], paginacao: paginacaoVazia() },
        porCategoria: { categorias: [] as any[], paginacao: paginacaoVazia() }
      },
      lancamentos: { produtos: [] as Produto[], paginacao: paginacaoVazia() },
      destaquePaginado: { produtos: [] as Produto[], paginacao: paginacaoVazia() },
      descontoPaginado: { produtos: [] as Produto[], paginacao: paginacaoVazia() },
      todos: { produtos: [] as Produto[], paginacao: paginacaoVazia() },

      produtosCache: {} as Record<number, Produto>,
      favoritos: [] as number[],

      placeholderImg,
      tutorialAberto: false,

      // hero
      heroIndex: 0,
      heroTimer: null as any,
      banners: [
        {
          title: 'Marviz Trends',
          description: 'Descubra novos fornecedores e as melhores novidades da semana',
          text: 'Vendedores verificados publicam seus lançamentos toda semana. Compare e feche pedido sem sair da loja.',
          icon: 'bolt', buttonLabel: 'Ver lançamentos', colorClass: 's1', art: 'MV', action: 'lancamentos'
        },
        {
          title: 'Pedido direto',
          description: 'Envie o pedido direto ao vendedor sem precisar abrir cotação',
          text: 'Basta adicionar o produto: nós encontramos (ou criamos) o pedido direto daquele vendedor automaticamente.',
          icon: 'shopping_cart_checkout', buttonLabel: 'Explorar produtos', colorClass: 's2', art: 'RFQ', action: 'todos'
        },
        {
          title: 'Até 30% off',
          description: 'Monte sua cotação e compare ofertas de diferentes vendedores',
          text: 'Produtos com preço fechado direto do fornecedor. Adicione a uma cotação aberta em segundos.',
          icon: 'local_fire_department', buttonLabel: 'Ver ofertas', colorClass: 's3', art: '-30%', action: 'desconto'
        }
      ],

      // modal de produto
      showModal: false,
      produtoSelecionado: null as Produto | null,
      fotoIndex: 0,
      modalCurtido: false,
      curtindo: false,
      exportandoPdf: false,
      enviandoAvaliacao: false,
      minhaAvaliacao: 0,
      hoverEstrela: 0,
      ratingLabels: ['Péssimo', 'Ruim', 'Regular', 'Bom', 'Excelente'] as string[],
      avaliacoesLocais: {} as Record<number, number>,
      modoAtivo: null as null | 'pedido_direto' | 'cotacao',
      listaAtiva: [] as any[],
      carregandoListaAtiva: false,
      itemSelecionado: null as any,
      paginaAtual: 1,
      itensPorPagina: 5,
      modalQty: 1,
      adicionandoPedidoDireto: false,
      feedbackAcao: null as { tipo: 'ok' | 'erro'; msg: string } | null,

      // cesta / drawer (apenas cotação — pedido direto agora é enviado direto na hora)
      drawerOpen: false,
      cartCotacao: [] as any[], // [{ id_cotacao, nome_cotacao, itens: [{ produto, qty }] }]
      enviandoCesta: false,

      // toast
      toast: { show: false, icon: 'check_circle', msg: '' },
      _toastTimer: null as any
    };
  },

  computed: {
    categoriasDisponiveis(): any[] {
      const cats = Object.keys(this.categoriaLabel).map((key) => ({
        key, label: this.categoriaLabel[key], icon: this.categoriaIcon[key]
      }));
      return [{ key: 'todas', label: 'Todas', icon: 'apps' }, ...cats];
    },

    dadosAbaAtual(): { produtos: Produto[]; paginacao: Paginacao } {
      switch (this.activeTab) {
        case 'lancamentos': return this.lancamentos;
        case 'destaque': return this.destaquePaginado;
        case 'desconto': return this.descontoPaginado;
        case 'todos': return this.todos;
        default: return { produtos: [], paginacao: paginacaoVazia() };
      }
    },
    dadosAbaAtualFiltrados(): Produto[] { return this.filtrarPorCategoria(this.dadosAbaAtual.produtos); },

    lancamentosPreview(): Produto[] { return this.filtrarPorCategoria(this.lancamentos.produtos).slice(0, 10); },
    destaquePreview(): Produto[] { return this.filtrarPorCategoria(this.inicio.destaque.produtos).slice(0, 10); },
    descontoPreview(): Produto[] { return this.filtrarPorCategoria(this.inicio.desconto.produtos).slice(0, 10); },
    categoriasComProdutos(): any[] { return (this.inicio.porCategoria.categorias || []).filter((c: any) => c.produtos && c.produtos.length); },

    resultadoBuscaFiltrado(): Produto[] { return this.filtrarPorCategoria(this.resultadoBusca.produtos); },

    favoritosProdutos(): Produto[] { return this.favoritos.map((id) => this.produtosCache[id]).filter(Boolean); },
    fornecedores(): string[] {
      return [...new Set(Object.values(this.produtosCache).map((p: any) => p.fornecedor).filter(Boolean))] as string[];
    },

    tituloAbaAtual(): string {
      const map: Record<string, string> = {
        lancamentos: 'Lançamentos da Semana', destaque: 'Produtos em Destaque',
        desconto: 'Ofertas com Desconto', todos: 'Todos os Produtos'
      };
      return map[this.activeTab] || '';
    },
    iconeAbaAtual(): string {
      const map: Record<string, string> = {
        lancamentos: 'new_releases', destaque: 'star', desconto: 'local_fire_department', todos: 'grid_view'
      };
      return map[this.activeTab] || 'grid_view';
    },

    cartCounts(): { cCount: number } {
      let cCount = 0;
      this.cartCotacao.forEach((g: any) => g.itens.forEach(() => cCount++));
      return { cCount };
    },
    gruposCestaAtiva(): any[] { return this.cartCotacao; },
    cestaTotais(): { itens: number; valor: number } {
      let itens = 0, valor = 0;
      this.gruposCestaAtiva.forEach((g: any) => g.itens.forEach((it: any) => {
        itens += it.qty;
        valor += it.qty * precoComDesconto(it.produto);
      }));
      return { itens, valor };
    },

    imagensModal(): string[] {
      if (!this.produtoSelecionado) return [];
      const imgs = galeria(this.produtoSelecionado);
      return imgs.length ? imgs : [placeholderImg];
    },
    totalPaginasModal(): number { return Math.max(Math.ceil(this.listaAtiva.length / this.itensPorPagina), 1); },
    itensPaginaModal(): any[] {
      const inicioIdx = (this.paginaAtual - 1) * this.itensPorPagina;
      return this.listaAtiva.slice(inicioIdx, inicioIdx + this.itensPorPagina);
    },

    // "Você também pode gostar" — prioriza produtos da mesma categoria/fornecedor,
    // completando com outros produtos já carregados no cache.
    produtosRelacionados(): Produto[] {
      const atual = this.produtoSelecionado;
      if (!atual) return [];
      const todosCache = Object.values(this.produtosCache).filter(
        (p: any) => p && p.id_produto_vendedor !== atual.id_produto_vendedor
      ) as Produto[];

      const mesmaCategoria = todosCache.filter((p) => atual.categoria && p.categoria === atual.categoria);
      const mesmoFornecedor = todosCache.filter(
        (p) => !mesmaCategoria.includes(p) && atual.fornecedor && p.fornecedor === atual.fornecedor
      );
      const resto = todosCache.filter((p) => !mesmaCategoria.includes(p) && !mesmoFornecedor.includes(p));

      return [...mesmaCategoria, ...mesmoFornecedor, ...resto].slice(0, 8);
    }
  },

  mounted() {
    const authStore = useAuthStore();
    this.auth = authStore;
    this.carregarFavoritosLocal();
    this.carregarAvaliacoesLocal();
    this.carregarInicio();
    this.iniciarHero();

    console.log("AAA")
    window.addEventListener('keydown', this.onEscKey);
  },

  beforeUnmount() {
    this.pararHero();
    if (this._toastTimer) clearTimeout(this._toastTimer);
    window.removeEventListener('keydown', this.onEscKey);
  },

  methods: {
    fmtMoney,
    isLancamento,
    isDesconto,
    precoComDesconto,
    formatCount,
    formatDate,
    statusLancamentoLabel,
    starArray,

    onImgErrorEl(e: Event) { (e.target as HTMLImageElement).src = placeholderImg; },

    filtrarPorCategoria(list: Produto[]): Produto[] {
      return this.activeCategoria === 'todas' ? (list || []) : (list || []).filter((p) => p.categoria === this.activeCategoria);
    },

    // ── Carregamento inicial — GET /mvpu/cotacao/consultarVendedoresProd/{id_loja} (random=true) ──
    async carregarInicio() {
      const idLoja = this.auth?.id_loja;
      if (!idLoja) return;

      this.loading = true;
      this.error = false;

      console.log("PASSOU")

      try {
        const params: any = { random: true, page: 1, limit: 10 };
        const res = await api.get(`/mvpu/cotacao/consultarVendedoresProd/${idLoja}`, { params });
        const d = res.data?.data;

        console.log(d)

        if (d) {
          this.inicio.destaque = d.destaque || this.inicio.destaque;
          this.inicio.desconto = d.desconto || this.inicio.desconto;
          this.inicio.porCategoria = d.por_categoria || this.inicio.porCategoria;
          this.cachearProdutos([
            ...(d.todos?.produtos || []),
            ...(d.destaque?.produtos || []),
            ...(d.desconto?.produtos || []),
            ...((d.por_categoria?.categorias || []).flatMap((c: any) => c.produtos || []))
          ]);
        }

        await this.carregarLancamentos(1, true);
        this.carregouAlgo = true;
      } catch (e) {
        this.error = true;
      } finally {
        this.loading = false;
      }
    },

    async refreshAll() {
      this.abasCarregadas = {};
      if (this.search) { await this.buscar(1); }
      else if (this.activeTab === 'inicio') { await this.carregarInicio(); }
      else if (this.activeTab !== 'favoritos') { await this.carregarAba(this.activeTab, this.dadosAbaAtual.paginacao.pagina_atual || 1); }
      this.mostrarToast('Vitrine atualizada', 'refresh');
    },

    async setTab(tab: string) {
      this.activeTab = tab;
      this.search = '';
      if (tab === 'inicio' || tab === 'favoritos') return;
      if (!this.abasCarregadas[tab]) await this.carregarAba(tab, 1);
    },

    setCategoria(cat: string) { this.activeCategoria = cat; },

    async carregarAba(tab: string, pagina: number) {
      const idLoja = this.auth?.id_loja;
      if (!idLoja) return;

      this.carregandoAba = true;
      try {
        if (tab === 'lancamentos') await this.carregarLancamentos(pagina);
        else if (tab === 'todos') await this.carregarTodos(pagina);
        else if (tab === 'destaque' || tab === 'desconto') await this.carregarSecaoRandomPaginada(tab, pagina);
        this.abasCarregadas[tab] = true;
      } catch (e) {
        this.error = true;
      } finally {
        this.carregandoAba = false;
      }
    },

    async carregarLancamentos(pagina: number, silencioso = false) {
      const idLoja = this.auth?.id_loja;
      if (!idLoja) return;

      const params: any = { lancamentos: true, page: pagina, limit: 12 };
      const res = await api.get(`/mvpu/cotacao/consultarVendedoresProd/${idLoja}`, { params });
      const d = res.data?.data;
      if (d) {
        this.lancamentos = { produtos: d.lancamentos || [], paginacao: d.paginacao || paginacaoVazia() };
        this.cachearProdutos(this.lancamentos.produtos);
      }
      if (!silencioso) this.abasCarregadas['lancamentos'] = true;
    },

    async carregarTodos(pagina: number) {
      const idLoja = this.auth?.id_loja;
      if (!idLoja) return;

      const params: any = { all: true, page: pagina, limit: 12 };
      const res = await api.get(`/mvpu/cotacao/consultarVendedoresProd/${idLoja}`, { params });
      const d = res.data?.data;
      if (d) {
        this.todos = { produtos: d.produtos || [], paginacao: d.paginacao || paginacaoVazia() };
        this.cachearProdutos(this.todos.produtos);
      }
    },

    // Reaproveita o modo random=true, que já retorna cada bloco paginado individualmente.
    async carregarSecaoRandomPaginada(secao: 'destaque' | 'desconto', pagina: number) {
      const idLoja = this.auth?.id_loja;
      if (!idLoja) return;

      const params: any = { random: true, page: pagina, limit: 12 };
      const res = await api.get(`/mvpu/cotacao/consultarVendedoresProd/${idLoja}`, { params });
      const d = res.data?.data;
      if (!d) return;

      if (secao === 'destaque') {
        this.destaquePaginado = d.destaque || paginacaoVazia();
        this.cachearProdutos(this.destaquePaginado.produtos);
      } else {
        this.descontoPaginado = d.desconto || paginacaoVazia();
        this.cachearProdutos(this.descontoPaginado.produtos);
      }
    },

    irParaPaginaAba(pagina: number) { this.carregarAba(this.activeTab, pagina); },

    // ── Busca ──
    onSearchInput() {
      clearTimeout(this._searchTimeout);
      this._searchTimeout = setTimeout(() => this.buscar(1), 400);
    },
    clearSearch() { this.search = ''; this.resultadoBusca = { produtos: [], paginacao: paginacaoVazia() }; },
    async buscar(pagina: number) {
      const idLoja = this.auth?.id_loja;
      if (!idLoja || !this.search) return;

      this.buscando = true;
      try {
        const params: any = { search: this.search, page: pagina, limit: 12 };
        const res = await api.get(`/mvpu/cotacao/consultarVendedoresProd/${idLoja}`, { params });
        const d = res.data?.data;
        if (d) {
          this.resultadoBusca = { produtos: d.produtos || [], paginacao: d.paginacao || paginacaoVazia() };
          this.cachearProdutos(this.resultadoBusca.produtos);
        }
      } catch (e) {
        this.error = true;
      } finally {
        this.buscando = false;
      }
    },
    irParaPaginaBusca(pagina: number) { this.buscar(pagina); },

    cachearProdutos(lista: Produto[]) {
      (lista || []).forEach((p) => { if (p?.id_produto_vendedor != null) this.produtosCache[p.id_produto_vendedor] = p; });
    },

    // ── Favoritos (armazenamento local, mesmo padrão de TrendsVarejo.vue) ──
    carregarFavoritosLocal() {
      try {
        const raw = localStorage.getItem('marviz_trends_favoritos');
        this.favoritos = raw ? JSON.parse(raw) : [];
      } catch (e) {
        this.favoritos = [];
      }
    },
    salvarFavoritosLocal() {
      try { localStorage.setItem('marviz_trends_favoritos', JSON.stringify(this.favoritos)); } catch (e) { /* ignora */ }
    },
    isFavorito(p: Produto): boolean { return !!p && this.favoritos.includes(p.id_produto_vendedor); },

    // POST /mvpu/cotacao/curtidaProduto/{id_produto_vendedor}
    async toggleFavorito(p: Produto) {
      if (!p || this.curtindo) return;
      this.cachearProdutos([p]);
      const wasLiked = this.isFavorito(p);

      // atualização otimista da UI
      const idx = this.favoritos.indexOf(p.id_produto_vendedor);
      if (idx >= 0) this.favoritos.splice(idx, 1); else this.favoritos.push(p.id_produto_vendedor);
      p.curtidas = wasLiked ? Math.max(0, (p.curtidas || 0) - 1) : (p.curtidas || 0) + 1;
      this.salvarFavoritosLocal();
      if (this.produtoSelecionado && this.produtoSelecionado.id_produto_vendedor === p.id_produto_vendedor) {
        this.modalCurtido = !wasLiked;
      }

      this.curtindo = true;
      try {
        await api.post(`/mvpu/cotacao/curtidaProduto/${p.id_produto_vendedor}`);
        this.mostrarToast(wasLiked ? 'Curtida removida' : 'Você curtiu este produto', wasLiked ? 'heart_broken' : 'favorite');
      } catch (e) {
        // desfaz a atualização otimista em caso de falha na API
        const idx2 = this.favoritos.indexOf(p.id_produto_vendedor);
        if (idx2 >= 0) this.favoritos.splice(idx2, 1); else this.favoritos.push(p.id_produto_vendedor);
        p.curtidas = wasLiked ? (p.curtidas || 0) + 1 : Math.max(0, (p.curtidas || 0) - 1);
        this.salvarFavoritosLocal();
        if (this.produtoSelecionado && this.produtoSelecionado.id_produto_vendedor === p.id_produto_vendedor) {
          this.modalCurtido = wasLiked;
        }
        this.mostrarToast('Não foi possível registrar a curtida', 'error');
      } finally {
        this.curtindo = false;
      }
    },

    // POST /mvpu/cotacao/compartilharProduto/{id_produto_vendedor} + exporta um PDF do produto
    async compartilharProduto(p: Produto) {
      if (!p || this.exportandoPdf) return;
      this.exportandoPdf = true;
      try {
        await api.post(`/mvpu/cotacao/compartilharProduto/${p.id_produto_vendedor}`);
        p.compartilhamentos = (p.compartilhamentos || 0) + 1;
        await this.exportarProdutoPdf(p);
        this.mostrarToast('PDF do produto gerado com sucesso', 'picture_as_pdf');
      } catch (e) {
        this.mostrarToast('Não foi possível compartilhar o produto', 'error');
      } finally {
        this.exportandoPdf = false;
      }
    },

    abrirTutorial(){
      this.tutorialAberto = true
      setTimeout(()=>{
        this.tutorialAberto = false
      }, 1000)
    },

    // Monta um PDF com os principais dados do produto e dispara o download.
    // Depende da lib `jspdf` (npm install jspdf).
    async exportarProdutoPdf(p: Produto) {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();

      doc.setFontSize(16);
      doc.text(p.nome || 'Produto', 14, 20);

      doc.setFontSize(11);
      let y = 32;
      const linhas: [string, string][] = [
        ['Fornecedor', p.fornecedor || '-'],
        ['Vendedor   ', p.nome_vendedor || '-'],
        ['Email      ', p.email_vendedor || '-'],
        ['Categoria', this.categoriaLabel[p.categoria] || p.categoria || '-'],
        ['Código de barras', p.codigo_barra || '-'],
        ['Preço', fmtMoney(precoComDesconto(p))],
        ['Avaliação média', `${Number(p.media || 0).toFixed(1)} / 5 (${p.avaliacoes || 0} avaliações)`],
        ['Curtidas', String(p.curtidas || 0)],
        ['Visualizações', String(p.visualizacoes || 0)]
      ];
      linhas.forEach(([label, valor]) => {
        doc.text(`${label}: ${valor}`, 14, y);
        y += 8;
      });

      if (p.descricao) {
        y += 4;
        doc.setFontSize(12);
        doc.text('Descrição', 14, y);
        y += 7;
        doc.setFontSize(10);
        const descLinhas = doc.splitTextToSize(p.descricao, 180);
        doc.text(descLinhas, 14, y);
      }

      if (p.foto_capa) {
        try {
          const imgData = await this.carregarImagemBase64(p.foto_capa);
          doc.addImage(imgData, 'JPEG', 130, 20, 60, 60);
        } catch (e) {
          // segue sem a imagem se falhar (ex.: bloqueio de CORS)
        }
      }

      doc.save(`produto-${p.id_produto_vendedor}.pdf`);
    },

    carregarImagemBase64(url: string): Promise<string> {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) { reject(new Error('canvas indisponível')); return; }
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/jpeg'));
        };
        img.onerror = reject;
        img.src = url;
      });
    },

    // ── Avaliações (cache local apenas para lembrar o que o usuário já avaliou) ──
    carregarAvaliacoesLocal() {
      try {
        const raw = localStorage.getItem('marviz_trends_avaliacoes');
        this.avaliacoesLocais = raw ? JSON.parse(raw) : {};
      } catch (e) {
        this.avaliacoesLocais = {};
      }
    },
    salvarAvaliacoesLocal() {
      try { localStorage.setItem('marviz_trends_avaliacoes', JSON.stringify(this.avaliacoesLocais)); } catch (e) { /* ignora */ }
    },

    // POST /mvpu/cotacao/avaliacaoProduto/{id_produto_vendedor}  { indice_avaliacao: 1..5 }
    async avaliarProduto(p: Produto, indice: number) {
      if (!p || this.enviandoAvaliacao) return;
      if (indice < 1 || indice > 5) return;

      const anterior = this.minhaAvaliacao;
      this.minhaAvaliacao = indice; // otimista
      this.enviandoAvaliacao = true;

      try {
        await api.post(`/mvpu/cotacao/avaliacaoProduto/${p.id_produto_vendedor}`, { indice_avaliacao: indice });

        // recalcula a média localmente para refletir na tela sem esperar um novo GET
        const totalAnterior = p.avaliacoes || 0;
        const somaAnterior = (p.media || 0) * totalAnterior;
        if (anterior) {
          // usuário já tinha avaliado este produto: substitui o índice anterior pelo novo
          p.media = totalAnterior ? (somaAnterior - anterior + indice) / totalAnterior : indice;
        } else {
          p.avaliacoes = totalAnterior + 1;
          p.media = (somaAnterior + indice) / p.avaliacoes;
        }

        this.avaliacoesLocais[p.id_produto_vendedor] = indice;
        this.salvarAvaliacoesLocal();
        this.mostrarToast('Avaliação enviada com sucesso!', 'star');
      } catch (e) {
        this.minhaAvaliacao = anterior;
        this.mostrarToast('Não foi possível enviar sua avaliação', 'error');
      } finally {
        this.enviandoAvaliacao = false;
      }
    },

    // ── Hero carrossel ──
    iniciarHero() { this.pararHero(); this.heroTimer = setInterval(() => this.goHero(this.heroIndex + 1), 5500); },
    pararHero() { if (this.heroTimer) clearInterval(this.heroTimer); },
    goHero(i: number) { this.heroIndex = (i + this.banners.length) % this.banners.length; },

    // ── Modal de produto ──
    abrirProduto(p: Produto) {
      this.produtoSelecionado = p;
      this.fotoIndex = 0;
      this.modoAtivo = null;
      this.listaAtiva = [];
      this.itemSelecionado = null;
      this.paginaAtual = 1;
      this.modalQty = 1;
      this.adicionandoPedidoDireto = false;
      this.feedbackAcao = null;
      this.modalCurtido = this.isFavorito(p);
      this.minhaAvaliacao = this.avaliacoesLocais[p.id_produto_vendedor] || 0;
      this.hoverEstrela = 0;
      p.visualizacoes = (p.visualizacoes || 0) + 1;
      this.showModal = true;
    },
    fecharModal() { this.showModal = false; this.produtoSelecionado = null; },
    selecionarFoto(i: number) { this.fotoIndex = i; },
    irParaAvaliacoes() {
      const el = this.$refs.avaliacoesSection as HTMLElement | undefined;
      if (el && typeof el.scrollIntoView === 'function') {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
    onEscKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && this.showModal) this.fecharModal();
    },

    async toggleModo(modo: 'pedido_direto' | 'cotacao') {
      this.modoAtivo = this.modoAtivo === modo ? null : modo;
      this.itemSelecionado = null;
      this.paginaAtual = 1;
      this.feedbackAcao = null;
      // pedido direto não tem mais listagem/seleção — é resolvido
      // automaticamente no momento da confirmação (ver adicionarAoPedidoDireto)
      if (this.modoAtivo === 'cotacao') await this.carregarCotacoesAbertas();
    },

    // GET /mvpu/cotacao/consultarCotacao/{id_loja} (mesmo endpoint do TrendsVarejo.vue)
    async carregarCotacoesAbertas() {
      const idLoja = this.auth?.id_loja;
      if (!idLoja) return;

      this.carregandoListaAtiva = true;
      try {
        const res = await api.get(`/mvpu/cotacao/consultarCotacao/${idLoja}`);
        const lista = res.data?.data || [];
        this.listaAtiva = lista.filter((c: any) => c.status_cotacao === 'fechada');
      } catch (e) {
        this.listaAtiva = [];
      } finally {
        this.carregandoListaAtiva = false;
      }
    },

    // GET /mvpu/cotacao/consultarPedidosDiretos/{id_loja}/{id_vendedor}
    // Retorna somente os pedidos diretos do vendedor informado.
    async consultarPedidosDiretosDoVendedor(idVendedor: number | string): Promise<any[]> {
      const idLoja = this.auth?.id_loja;
      if (!idLoja) return [];

      try {
        const res = await api.get(`/mvpu/cotacao/consultarPedidosDiretos/${idLoja}/0`);
        return res.data?.data || [];
      } catch (e) {
        return [];
      }
    },

    // POST /mvpu/cotacao/criarPedidoDireto/{id_loja}  { id_vendedor }
    async criarPedidoDireto(idVendedor: number | string): Promise<any | null> {
      const idLoja = this.auth?.id_loja;
      if (!idLoja) return null;

      try {
        const res = await api.post(`/mvpu/cotacao/criarPedidoDireto/${idLoja}`, { id_vendedor: idVendedor });
        return res.data || null;
      } catch (e) {
        return null;
      }
    },

    _delay(ms: number): Promise<void> {
      return new Promise((resolve) => setTimeout(resolve, ms));
    },

    // Resolve (encontra ou cria) o pedido direto em aberto do vendedor do
    // produto selecionado e adiciona o item automaticamente, sem que o
    // usuário precise escolher/criar nada manualmente.
    async adicionarAoPedidoDireto() {
      const idLoja = this.auth?.id_loja;
      const produto = this.produtoSelecionado;
      const idVendedor = produto?.id_vendedor;

      if (!idLoja || !produto || !idVendedor) {
        this.feedbackAcao = { tipo: 'erro', msg: 'Não foi possível identificar o vendedor deste produto.' };
        return;
      }

      this.adicionandoPedidoDireto = true;
      this.feedbackAcao = null;
      try {
        // 1) varre os pedidos diretos do vendedor em busca de um que ainda não foi finalizado
        let pedidosDoVendedor = await this.consultarPedidosDiretosDoVendedor(idVendedor);
        let pedido = pedidosDoVendedor.find(
          (p: any) => p.id_vendedor === idVendedor && p.status_pedido_direto !== 'finalizada'
        );

        // 2) se não existir, cria um novo pedido direto para esse vendedor
        if (!pedido) {
          await this.criarPedidoDireto(idVendedor);
          // pequeno delay para garantir que o pedido já esteja disponível antes de adicionar o item
          await this._delay(600);
        }

        pedidosDoVendedor = await this.consultarPedidosDiretosDoVendedor(idVendedor);
        pedido = pedidosDoVendedor.find(
          (p: any) => p.id_vendedor === idVendedor && p.status_pedido_direto !== 'finalizada'
        );

        if(!pedido) throw Error('Erro ao receber o pedido do vendedor');

        // 3) adiciona o item ao pedido direto (novo ou já existente)
        await api.post(`/mvpu/cotacao/criarItemPedDir/${idLoja}/${pedido.id_pedido_direto}`, {
          id_pedido_direto: pedido.id_pedido_direto,
          nome: produto.nome,
          id_produto: produto.id_produto,
          id_vendedor: produto.id_vendedor,
          tipo_produto: produto.tipo ?? null,
          origem: 'marviztrend',
          preco_produto: produto.preco,
          promocao_desconto: produto.promocao_desconto,
          desconto_inicio: produto.desconto_inicio,
          desconto_fim: produto.desconto_fim,
          id_produto_vendedor: produto.id_produto_vendedor,
          quantidade: this.modalQty,
          qtd_unitaria_composicao: produto.qtd_unitaria_composicao ?? null
        });

        this.feedbackAcao = { tipo: 'ok', msg: 'Produto adicionado ao pedido direto do vendedor!' };
        this.mostrarToast('Adicionado ao pedido direto', 'bolt');
        this.showModal = false;
      } catch (e) {
        console.log(e)
        this.feedbackAcao = { tipo: 'erro', msg: 'Não foi possível adicionar o produto ao pedido direto.' };
        this.mostrarToast('Não foi possível concluir o pedido direto', 'error');
      } finally {
        this.adicionandoPedidoDireto = false;
      }
    },

    itemSelecionadoEhIgual(item: any): boolean {
      if (!this.itemSelecionado) return false;
      return this.itemSelecionado.id_cotacao === item.id_cotacao;
    },
    selecionarItemLista(item: any) { this.itemSelecionado = item; },
    paginaModalAnterior() { if (this.paginaAtual > 1) this.paginaAtual--; },
    paginaModalProxima() { if (this.paginaAtual < this.totalPaginasModal) this.paginaAtual++; },
    ajustarQtdModal(delta: number) { this.modalQty = Math.max(1, this.modalQty + delta); },

    // Cotação: não chama a API diretamente — agrupa o item na cesta local (drawer),
    //   permitindo enviar depois pelo drawer (enviarCesta).
    // Pedido direto: chama a API imediatamente — encontra (ou cria) o pedido
    //   direto do vendedor e adiciona o item na hora (ver adicionarAoPedidoDireto).
    confirmarAdicionarNaCesta() {
      if (!this.produtoSelecionado) return;

      if (this.modoAtivo === 'pedido_direto') {
        this.adicionarAoPedidoDireto();
        return;
      }

      if (!this.itemSelecionado) return;
      this.adicionarNaCesta(this.cartCotacao, 'id_cotacao', 'nome_cotacao', this.itemSelecionado, this.produtoSelecionado, this.modalQty);
      this.feedbackAcao = { tipo: 'ok', msg: 'Produto adicionado à cotação (na cesta). Envie pela cesta quando terminar.' };
      this.openDrawer('cotacao');
      this.showModal = false;
      this.mostrarToast('Adicionado à cesta', 'shopping_bag');
    },

    adicionarNaCesta(destino: any[], idKey: string, nomeKey: string, alvo: any, produto: Produto, qty: number) {
      let grupo = destino.find((g) => g[idKey] === alvo[idKey]);
      if (!grupo) { grupo = { [idKey]: alvo[idKey], [nomeKey]: alvo[nomeKey], itens: [] }; destino.push(grupo); }
      const item = grupo.itens.find((it: any) => it.produto.id_produto_vendedor === produto.id_produto_vendedor);
      if (item) item.qty += qty; else grupo.itens.push({ produto, qty });
    },

    // ── Cesta / Drawer (apenas cotação — pedido direto não usa mais a cesta) ──
    openDrawer(tab?: 'cotacao') { this.drawerOpen = true; },
    closeDrawer() { this.drawerOpen = false; },

    itensPorVendedor(grupo: any): [string, any[]][] {
      const map: Record<string, any[]> = {};
      grupo.itens.forEach((it: any) => {
        const key = it.produto.fornecedor || '—';
        if (!map[key]) map[key] = [];
        map[key].push(it);
      });
      return Object.entries(map);
    },

    alterarQtdCesta(item: any, delta: number) { item.qty = Math.max(1, item.qty + delta); },
    removerItemCesta(grupo: any, item: any) {
      grupo.itens = grupo.itens.filter((it: any) => it !== item);
      if (!grupo.itens.length) {
        const idx = this.cartCotacao.indexOf(grupo);
        if (idx >= 0) this.cartCotacao.splice(idx, 1);
      }
    },
    limparCesta() { this.cartCotacao = []; },

    // Envio final — apenas cotação (pedido direto não usa mais a cesta —
    // é enviado imediatamente, ver adicionarAoPedidoDireto):
    //   POST /mvpu/cotacao/adicionarProdutoInexis/{id_loja}/{id_cotacao}
    async enviarCesta() {
      const idLoja = this.auth?.id_loja;
      if (!idLoja) return;

      const grupos = this.cartCotacao;
      if (!grupos.length) { this.mostrarToast('Adicione produtos antes de enviar', 'info'); return; }

      this.enviandoCesta = true;
      try {
        for (const grupo of grupos) {
          const codigo_barra = grupo.itens.map((it: any) => ([
            it.produto.nome, it.qty, it.produto.tipo ?? null, it.produto.qtd_unitaria_composicao ?? null
          ]));
          await api.post(`/mvpu/cotacao/adicionarProdutoInexis/${idLoja}/${grupo.id_cotacao}`, { codigo_barra });
        }
        this.cartCotacao = [];
        this.mostrarToast(`Cotação atualizada em ${grupos.length} solicitação(ões)`, 'check_circle');
      } catch (e) {
        this.mostrarToast('Não foi possível concluir o envio', 'error');
      } finally {
        this.enviandoCesta = false;
      }
    },

    // ── Toast ──
    mostrarToast(msg: string, icon = 'check_circle') {
      this.toast = { show: true, icon, msg };
      clearTimeout(this._toastTimer);
      this._toastTimer = setTimeout(() => { this.toast.show = false; }, 2600);
    },

    brandColor(i: number): string {
      const colors = ['#4F3DF5', '#00B79B', '#FF5A46', '#FFA912', '#2F1FB8'];
      return colors[i % colors.length];
    }
  }
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');

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

/* ═══════════════════════ ROOT ═══════════════════════
   Sem o <ion-page>/<ion-content> do Ionic (que já define largura
   explícita via position:absolute; inset:0), este componente precisa
   se autoconter: se o elemento pai (fora deste arquivo) for um
   flex/grid item, o comportamento padrão de "min-width: auto" impede
   que ele encolha abaixo da largura intrínseca do conteúdo. As regras
   abaixo forçam o componente a sempre respeitar a largura disponível. */
.mv-root {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow-x: hidden;
  box-sizing: border-box;
}

/* ═══════════════════════ TOKENS ═══════════════════════ */
.mv-shell {
  --bg: #F5F4FB;
  --surface: #FFFFFF;
  --surface-2: #faf5ee;
  --ink: #312113;
  --muted: #907d68;
  --line: #E7E4F5;
  --primary: #ff8049;
  --primary-dark: #ff8049;
  --primary-deep: #2e2911;
  --teal: #00B79B;
  --teal-deep: #00806D;
  --coral: #FF5A46;
  --amber: #FFA912;
  --blue: #ff8049;
  --blue-soft: #DBEAFE;
  --radius-lg: 22px;
  --radius-md: 16px;
  --radius-sm: 10px;
  --shadow-card: 0 10px 30px -14px rgba(49, 31, 19, 0.18);
  --shadow-pop: 0 24px 60px -20px rgba(49, 31, 19, 0.35);

  width: 100%;
  max-width: 1600px;
  min-width: 0;
  margin: 0 auto;
  padding: 18px 20px 40px;
  box-sizing: border-box;
  font-family: 'Inter', sans-serif;
  color: var(--ink);
}
h1, h2, h3, h4 { font-family: 'Space Grotesk', sans-serif; margin: 0; letter-spacing: -0.01em; }
a { color: inherit; text-decoration: none; }
button { font-family: inherit; border: none; background: none; cursor: pointer; color: inherit; }
input { font-family: inherit; }

/* ---------- TOOLBAR ---------- */
.mv-toolbar {
  display: flex; align-items: center; gap: 12px;
  background: var(--surface); border-radius: 999px; padding: 8px 8px 8px 20px;
  box-shadow: var(--shadow-card); margin-bottom: 18px;
}
.mv-toolbar .msr { color: var(--muted); }
.mv-search { flex: 1; min-width: 0; display: flex; align-items: center; gap: 10px; }
.mv-search input { border: none; outline: none; flex: 1; min-width: 0; font-size: 15px; background: transparent; color: var(--ink); }
.mv-search input::placeholder { color: #A9A4C4; }
.mv-icon-btn {
  width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
  background: var(--surface-2); flex-shrink: 0; transition: background .15s ease, transform .15s ease; position: relative;
}
.mv-icon-btn:hover { background: var(--line); transform: translateY(-1px); }
.mv-icon-btn.active { background: var(--primary); color: #fff; }
.mv-mini-badge {
  position: absolute; top: -3px; right: -3px; background: var(--coral); color: #fff; font-size: 10px; font-weight: 800;
  min-width: 16px; height: 16px; border-radius: 8px; display: flex; align-items: center; justify-content: center; padding: 0 3px;
}
.mv-cta {
  background: var(--primary-deep); color: #fff; border-radius: 999px; padding: 11px 20px;
  font-weight: 600; font-size: 14px; display: flex; align-items: center; gap: 8px; white-space: nowrap;
}
.mv-cta .msr { color: #fff; font-size: 19px; }

/* ---------- TABS ---------- */
.mv-tabs {
  display: flex; gap: 6px; background: var(--surface-2); padding: 6px; border-radius: 999px;
  width: fit-content; margin: 0 auto 22px; max-width: 100%; overflow-x: auto;
}
.mv-tab {
  padding: 10px 20px; border-radius: 999px; font-weight: 600; font-size: 13.5px; color: var(--muted);
  white-space: nowrap; transition: all .18s ease; letter-spacing: .01em; display: flex; align-items: center; gap: 6px;
}
.mv-tab .msr { font-size: 16px; }
.mv-tab-count { background: rgba(255,255,255,.35); font-size: 10.5px; font-weight: 800; padding: 1px 6px; border-radius: 999px; }
.mv-tab.active { background: var(--primary); color: #fff; box-shadow: 0 8px 18px -8px rgba(245, 135, 61, 0.65); }
.mv-tab:not(.active):hover { color: var(--ink); }

/* ---------- HERO ---------- */
.mv-hero { position: relative; border-radius: var(--radius-lg); overflow: hidden; margin-bottom: 26px; box-shadow: var(--shadow-card); }
.mv-hero-track { display: flex; transition: transform .55s cubic-bezier(.65,0,.35,1); }
.mv-slide {
  min-width: 100%; min-height: 230px; display: flex; align-items: center; justify-content: space-between;
  padding: 34px 40px; position: relative; overflow: hidden; 
}
.mv-slide.s1 { background: radial-gradient(120% 160% at 100% 0%, #6F5CFF 0%, #4F3DF5 45%, #211966 100%); }
.mv-slide.s2 { background: radial-gradient(120% 160% at 0% 100%, #05CBAA 0%, #00967D 55%, #003F35 100%); }
.mv-slide.s3 { background: radial-gradient(120% 160% at 100% 100%, #FF7A5C 0%, #FF5A46 45%, #7A1F14 100%); }
.mv-slide-copy { position: relative; z-index: 2; max-width: 480px; min-width: 0; flex-shrink: 1; padding-left: 20px; }
.mv-slide-eyebrow {
  display: inline-flex; align-items: center; gap: 7px; background: rgba(255,255,255,.16); color: #fff;
  font-size: 12px; font-weight: 600; padding: 6px 12px; border-radius: 999px; margin-bottom: 14px; letter-spacing: .03em;
}
.mv-slide-eyebrow .msr { font-size: 15px; }
.mv-slide h2 { color: #fff; font-size: 30px; line-height: 1.15; margin-bottom: 10px; }
.mv-slide p { color: rgba(255,255,255,.82); font-size: 14.5px; margin: 0 0 18px; line-height: 1.5; }
.mv-slide-btn {
  background: #fff; color: var(--ink); font-weight: 700; font-size: 13.5px; padding: 12px 22px;
  border-radius: 999px; display: inline-flex; align-items: center; gap: 6px; cursor: pointer;
}
.mv-slide-art {
  position: relative; z-index: 1; font-family: 'Space Grotesk'; font-weight: 700;
  font-size: clamp(48px, 9vw, 120px);
  color: rgba(255,255,255,.12); letter-spacing: -4px; user-select: none; flex-shrink: 0;
}
.mv-hero-dots { position: absolute; bottom: 16px; left: 50%; transform: translateX(-50%); display: flex; gap: 7px; z-index: 3; }
.mv-hero-dots button { width: 7px; height: 7px; border-radius: 50%; background: rgba(255,255,255,.4); transition: .2s; }
.mv-hero-dots button.active { background: #fff; width: 22px; border-radius: 5px; }
.mv-hero-arrow {
  position: absolute; top: 50%; transform: translateY(-50%); z-index: 3; width: 38px; height: 38px; border-radius: 50%;
  background: rgba(255,255,255,.22); backdrop-filter: blur(6px); color: #fff; display: flex; align-items: center; justify-content: center;
}
.mv-hero-arrow:hover { background: rgba(255,255,255,.36); }
.mv-hero-arrow.prev { left: 14px; }
.mv-hero-arrow.next { right: 14px; }

/* ---------- CATEGORIES ---------- */
.mv-categories { display: flex; gap: 22px; overflow-x: auto; padding: 4px 4px 22px; }
.mv-cat { display: flex; flex-direction: column; align-items: center; gap: 8px; flex-shrink: 0; cursor: pointer; }
.mv-cat-icon {
  width: 60px; height: 60px; border-radius: 20px; background: var(--surface); box-shadow: var(--shadow-card);
  display: flex; align-items: center; justify-content: center; color: var(--primary); transition: all .18s ease;
  border: 2px solid transparent;
}
.mv-cat.active .mv-cat-icon { border-color: var(--primary); background: #EDEBFF; color: var(--primary-dark); }
.mv-cat:hover .mv-cat-icon { transform: translateY(-3px); }
.mv-cat span { font-size: 12px; font-weight: 600; color: var(--muted); white-space: nowrap; }
.mv-cat.active span { color: var(--ink); }

/* ---------- SECTIONS / GRIDS ---------- */
.mv-section { margin-bottom: 34px; }
.mv-section-head { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 16px; gap: 10px; }
.mv-section-head .eyebrow { font-size: 12px; font-weight: 700; color: var(--teal-deep); text-transform: uppercase; letter-spacing: .08em; margin-bottom: 4px; display: block; }
.mv-section-head h3 { font-size: 21px; }
.mv-see-all { font-size: 13px; font-weight: 600; color: var(--primary); display: flex; align-items: center; gap: 3px; }
.mv-carousel { display: flex; gap: 16px; overflow-x: auto; scroll-behavior: smooth; padding: 4px 4px 10px; }
.mv-grid { display: grid; grid-template-columns: repeat(5, 1fr) ; gap: 16px; }

@media (max-width: 1513px){
  .mv-grid { grid-template-columns: repeat(4, 1fr) ; }
}

@media (max-width: 1200px){
  .mv-grid { grid-template-columns: repeat(3, 1fr) ; }
}

@media (max-width: 630px){
  .mv-grid { grid-template-columns: repeat(2, 1fr) ; }
}

@media (max-width: 410px){
  .mv-grid { grid-template-columns: repeat(1, 1fr) ; }
}

.mv-empty { text-align: center; padding: 50px 20px; color: var(--muted); font-size: 14px; }
.mv-empty .msr { font-size: 38px; color: var(--line); display: block; margin-bottom: 8px; }
.mv-empty .mv-spinner { margin-bottom: 8px; }

.mv-spinner {
  display: inline-block; width: 32px; height: 32px; border-radius: 50%;
  border: 3px solid var(--line); border-top-color: var(--primary);
  animation: mv-spin-anim .7s linear infinite;
}
.mv-spinner-dots { width: 26px; height: 26px; border-width: 2.5px; }
@keyframes mv-spin-anim { to { transform: rotate(360deg); } }

/* ---------- PAGINAÇÃO ---------- */
.mv-paginacao { display: flex; align-items: center; justify-content: center; gap: 12px; margin: 16px 0 10px; }
.mv-pag-btn {
  width: 28px; height: 28px; border-radius: 7px; border: 1px solid var(--line); background: var(--surface-2);
  display: flex; align-items: center; justify-content: center;
}
.mv-pag-btn:disabled { opacity: .4; cursor: not-allowed; }
.mv-pag-info { font-size: 11.5px; color: var(--muted); }

/* ---------- BRANDS STRIP ---------- */
.mv-brands { display: flex; align-items: center; gap: 14px; overflow-x: auto; padding: 6px 4px; }
.mv-brand-chip {
  flex-shrink: 0; background: var(--surface); border-radius: 14px; padding: 16px 22px; box-shadow: var(--shadow-card);
  font-family: 'Space Grotesk'; font-weight: 700; font-size: 14px; color: var(--ink); display: flex; align-items: center; gap: 10px;
  border: 1px solid var(--line);
}
.mv-brand-chip .dot { width: 8px; height: 8px; border-radius: 50%; }

/* ==================================================================
   PÁGINA DE PRODUTO (cobre 100% da tela, com scroll)
   ================================================================== */
.mv-pp {
  position: fixed; inset: 0; z-index: 200; background: var(--surface, #fff);
  display: flex; flex-direction: column; background-color: #ffffff;
}
.mv-pp-fade-enter-active, .mv-pp-fade-leave-active { transition: opacity .2s ease; }
.mv-pp-fade-enter-from, .mv-pp-fade-leave-to { opacity: 0; }

.mv-pp-topbar {
  flex-shrink: 0; display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 14px 22px; border-bottom: 1px solid var(--line); background: #fff; position: sticky; top: 0; z-index: 5;
  transform: translateY(-90px);
}
.mv-pp-voltar {
  display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 700; color: var(--ink);
  padding: 8px 12px; border-radius: 10px; transition: background .15s ease;
}
.mv-pp-voltar:hover { background: var(--surface-2); }
.mv-pp-voltar .msr { font-size: 19px; }
.mv-pp-topbar-title {
  flex: 1; text-align: center; font-size: 13.5px; font-weight: 700; color: var(--muted);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding: 0 10px;
}
.mv-pp-x {
  width: 38px; height: 38px; border-radius: 50%; background: var(--surface-2);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: background .15s ease, transform .1s ease;
}
.mv-pp-x:hover { background: #FFE3DE; color: var(--coral); }
.mv-pp-x:active { transform: scale(.92); }

.mv-pp-scroll { flex: 1; overflow-y: auto; -webkit-overflow-scrolling: touch; }
.mv-pp-content { max-width: 1300px; margin: 0 auto; padding: 28px 24px 60px; }

.mv-pp-main { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 44px; }

.mv-modal-gallery { position: relative; display: flex; flex-direction: column; gap: 12px; }
.mv-modal-main-img { position: relative; border-radius: 18px; overflow: hidden; aspect-ratio: 1/1; background: var(--surface-2); }
.mv-modal-main-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
.mv-modal-thumbs { display: flex; gap: 10px; }
.mv-modal-thumbs button { width: 60px; height: 60px; border-radius: 10px; overflow: hidden; border: 2px solid transparent; flex-shrink: 0; padding: 0; }
.mv-modal-thumbs button.active { border-color: var(--primary); }
.mv-modal-thumbs img { width: 100%; height: 100%; object-fit: cover; display: block; }

.mv-pp-info { display: flex; flex-direction: column; }
.mv-modal-top-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
.mv-modal-top-tags span { font-size: 10.5px; font-weight: 700; padding: 4px 10px; border-radius: 20px; background: var(--surface-2); color: var(--muted); }
.mv-modal-top-tags span.fornecedor { color: var(--primary-dark); background: #EDEBFF; }
.mv-modal-top-tags span.inativo { color: var(--coral); background: #FFE3DE; }

.mv-pp-title { font-size: 25px; line-height: 1.28; margin-bottom: 8px; font-weight: 800; }
.mv-pp-vendedor {
  display: flex; align-items: center; gap: 6px; flex-wrap: wrap; font-size: 12.5px; color: var(--muted);
  font-weight: 600; margin-bottom: 10px;
}
.mv-pp-vendedor .msr { font-size: 16px; color: var(--primary); }
.mv-pp-vendedor-email { color: #B3AECC; font-weight: 500; }
.mv-modal-barcode { font-size: 11.5px; color: var(--muted); display: flex; align-items: center; gap: 5px; margin-bottom: 12px; }
.mv-modal-barcode .msr { font-size: 14px; }

.mv-pp-rating-summary {
  display: inline-flex; align-items: center; gap: 8px; font-size: 13px; color: var(--muted);
  margin-bottom: 14px; width: fit-content; padding: 4px 2px; border-radius: 8px; transition: background .15s ease;
}
.mv-pp-rating-summary:hover { background: var(--surface-2); }
.mv-pp-rating-summary .stars { display: flex; gap: 1px; }
.mv-pp-rating-summary .msr { font-size: 15px; color: #D9D5EC; }
.mv-pp-rating-summary .stars .msr.fill { color: var(--amber); }
.mv-pp-rating-summary strong { color: var(--ink); }
.mv-pp-rating-count { color: var(--muted); }

.mv-social-row { display: flex; align-items: center; gap: 10px; margin-bottom: 18px; flex-wrap: wrap; }
.mv-social-btn {
  display: flex; align-items: center; gap: 6px;
  font-size: 12.5px; font-weight: 700; color: var(--muted);
  background: #302c2a; color: #FFF; border: 1px solid transparent;
  padding: 8px 14px; border-radius: 999px; cursor: pointer;
  transition: color .15s ease, background .15s ease, border-color .15s ease, transform .1s ease;
}
.mv-social-btn:hover { color: var(--ink); background: #EDEBFF; }
.mv-social-btn:active { transform: scale(0.96); }
.mv-social-btn:disabled { opacity: .6; cursor: default; transform: none; }
.mv-social-btn .msr { font-size: 18px; }
.mv-social-btn-label { white-space: nowrap; }
.mv-social-count { font-family: 'IBM Plex Mono'; font-weight: 600; opacity: .8; }

.mv-like-btn.liked { color: #fff; background: #302c2a; border-color: var(--coral); }
.mv-like-btn.liked:hover { background: #6e645f; color: #fff; }
.mv-share-btn:hover { color: var(--primary-dark); }

.mv-social-metric { display: flex; align-items: center; gap: 5px; font-size: 12.5px; color: var(--muted); padding: 8px 4px; }
.mv-social-metric .msr { font-size: 18px; }
.mv-spin { animation: mv-spin-anim 1s linear infinite; }
@keyframes mv-spin-anim { to { transform: rotate(360deg); } }

.mv-modal-avaliar-label { font-weight: 700; font-size: 13.5px; color: var(--ink); display: block; margin-bottom: 10px; }
.mv-avaliar-stars { display: flex; gap: 4px; width: fit-content; }
.mv-avaliar-star {
  display: flex; padding: 2px; cursor: pointer; color: #D9D5EC;
  transition: color .12s ease, transform .1s ease;
}
.mv-avaliar-star:hover { transform: scale(1.2); }
.mv-avaliar-star:disabled { cursor: default; opacity: .7; }
.mv-avaliar-star .msr { font-size: 26px; }
.mv-avaliar-star.fill { color: var(--amber); }
.mv-avaliar-hint { display: block; margin-top: 10px; font-size: 12.5px; color: var(--muted); min-height: 17px; }
.mv-modal-avaliar-done { color: var(--primary-dark); font-weight: 600; }
.mv-avaliar-enviando { display: inline-flex; align-items: center; gap: 5px; }

/* seções de página: avaliações, curtidas/compartilhamentos e relacionados */
.mv-pp-section { padding-top: 36px; border-top: 1px solid var(--line); margin-bottom: 8px; }
.mv-pp-section-head { margin-bottom: 18px; }
.mv-pp-section-head h3 { display: flex; align-items: center; gap: 8px; font-size: 17px; font-weight: 800; }
.mv-pp-section-head h3 .msr { font-size: 20px; color: var(--primary); }

.mv-pp-avaliacoes-grid {
  display: grid; grid-template-columns: 260px 1fr; gap: 20px; align-items: stretch;
}
.mv-pp-avaliacao-resumo, .mv-pp-avaliar-card {
  border: 1px solid var(--line); border-radius: 16px; padding: 20px 22px; background: var(--surface-2, #F7F6FB);
}
.mv-pp-avaliacao-resumo { text-align: center; display: flex; flex-direction: column; align-items: center; }
.mv-pp-media-num { font-family: 'IBM Plex Mono'; font-size: 40px; font-weight: 700; line-height: 1; margin-bottom: 6px; }
.mv-pp-avaliacao-resumo .stars.lg { display: flex; gap: 2px; margin-bottom: 6px; }
.mv-pp-avaliacao-resumo .stars.lg .msr { font-size: 18px; color: #D9D5EC; }
.mv-pp-avaliacao-resumo .stars.lg .msr.fill { color: var(--amber); }
.mv-pp-avaliacao-resumo p { font-size: 12.5px; color: var(--muted); margin-bottom: 14px; }
.mv-pp-resumo-metrics { display: flex; gap: 18px; padding-top: 14px; border-top: 1px solid var(--line); width: 100%; justify-content: center; }
.mv-pp-resumo-metric { display: flex; flex-direction: column; align-items: center; gap: 2px; font-size: 11px; color: var(--muted); }
.mv-pp-resumo-metric strong { font-family: 'IBM Plex Mono'; font-size: 15px; color: var(--ink); }
.mv-pp-resumo-metric .msr { font-size: 18px; margin-bottom: 2px; }

.mv-pp-avaliar-card { display: flex; flex-direction: column; justify-content: center; }

.mv-modal-price-row { display: flex; align-items: baseline; gap: 10px; margin-bottom: 6px; }
.mv-modal-price { font-family: 'IBM Plex Mono'; font-weight: 700; font-size: 27px; }
.mv-modal-price-old { font-family: 'IBM Plex Mono'; font-size: 14px; color: #B3AECC; text-decoration: line-through; }
.mv-modal-desconto-info {
  font-size: 11.5px; color: var(--muted); display: flex; align-items: center; gap: 5px;
  background: #FFE9E0; padding: 6px 10px; border-radius: 8px; margin-bottom: 12px; width: fit-content;
}
.mv-modal-lancamento { background: var(--surface-2); border: 1px solid var(--line); border-radius: 10px; padding: 10px 12px; margin-bottom: 12px; font-size: 11.5px; color: var(--muted); }
.mv-li-row { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
.mv-li-status { font-weight: 700; font-size: 11px; display: inline-block; padding: 2px 8px; border-radius: 5px; }
.mv-li-status.st-nao_lido { color: var(--blue); background: var(--blue-soft); }
.mv-li-status.st-aceito { color: var(--teal-deep); background: #DCFCE7; }
.mv-li-status.st-recusado { color: var(--coral); background: #FEE2E2; }
.mv-li-motivo { margin-top: 4px; color: var(--coral); }

.mv-modal-desc { font-size: 13.5px; color: var(--muted); line-height: 1.6; margin-bottom: 16px; }
.mv-modal-desc.empty { font-style: italic; color: #B3AECC; }

.mv-completude { margin-bottom: 6px; }
.mv-completude-head { display: flex; justify-content: space-between; font-size: 11.5px; color: var(--muted); margin-bottom: 5px; }
.mv-completude-track { height: 5px; border-radius: 4px; background: #522716; overflow: hidden; }
.mv-completude-fill { height: 100%; background: #ff8049; border-radius: 4px; }

.mv-modal-actions { margin-top: 20px; }
.mv-pp-actions-card {
  border: 1px solid var(--line); border-radius: 16px; padding: 18px 20px; background: var(--surface-2, #F7F6FB);
}
.mv-warn { color: var(--coral); font-size: 12px; margin-bottom: 10px; background: #FFE9E0; padding: 8px 10px; border-radius: 8px; }
.mv-field-label { font-size: 11.5px; color: var(--muted); display: block; margin-bottom: 7px; font-weight: 600; }

.mv-modo-toggle { display: flex; gap: 8px; margin-bottom: 12px; }
.mv-modo-btn {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
  border: 1px solid var(--line); background: var(--surface); border-radius: 10px; padding: 10px 10px;
  font-size: 12.5px; font-weight: 700; color: var(--ink); transition: all .15s ease;
}
.mv-modo-btn:hover { border-color: var(--primary); }
.mv-modo-btn.active { border-color: var(--primary); background: #EDEBFF; color: var(--primary-dark); }
.mv-modo-btn .msr { font-size: 17px; }

.mv-opcoes-lista { display: flex; flex-direction: column; max-height: 190px; overflow-y: auto; margin-bottom: 4px; }
.mv-opcao-item {
  width: 100%; display: flex; align-items: center; gap: 8px; border: 1px solid var(--line); background: var(--surface);
  border-radius: 10px; padding: 10px 12px; margin-bottom: 6px; font-size: 12.5px; color: var(--ink); text-align: left; transition: all .15s ease;
}
.mv-opcao-item:hover { border-color: var(--primary); }
.mv-opcao-item.active { border-color: var(--primary); background: #EDEBFF; }
.mv-opcao-item.novo { border-style: dashed; color: var(--primary-dark); font-weight: 700; }
.mv-opcao-icone { font-size: 17px; color: var(--muted); flex-shrink: 0; }
.mv-opcao-item.active .mv-opcao-icone { color: var(--primary-dark); }
.mv-opcao-texto { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mv-opcao-id { color: var(--muted); font-size: 11px; }
.mv-opcao-check { font-size: 18px; color: var(--primary); flex-shrink: 0; }

.mv-novo-pedido-form { display: flex; gap: 8px; margin-bottom: 10px; }
.mv-novo-pedido-form input { flex: 1; border: 1px solid var(--line); border-radius: 10px; padding: 9px 12px; font-size: 12.5px; outline: none; }
.mv-novo-pedido-form input:focus { border-color: var(--primary); }
.mv-novo-pedido-form button { background: var(--primary); color: #fff; border-radius: 10px; padding: 0 14px; font-size: 12px; font-weight: 700; white-space: nowrap; }

.mv-empty-hint { font-size: 11.5px; color: var(--muted); margin-bottom: 10px; line-height: 1.4; }
.mv-loading-hint { font-size: 11.5px; color: var(--muted); margin-bottom: 10px; display: flex; align-items: center; gap: 6px; }

.mv-qty-row { display: flex; align-items: center; justify-content: space-between; margin: 10px 0 12px; }
.mv-qty-label { font-size: 12px; color: var(--muted); font-weight: 600; }
.mv-qty-stepper { display: flex; align-items: center; background: #fff; border-radius: 999px; border: 1px solid var(--line); }
.mv-qty-stepper button { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; color: var(--primary); }
.mv-qty-stepper input { width: 40px; text-align: center; border: none; outline: none; font-weight: 700; font-size: 13px; background: transparent; }
.mv-tipo-chip { font-size: 12px; color: var(--muted); background: var(--surface-2); padding: 6px 12px; border-radius: 999px; font-weight: 600; }

.mv-confirm-btn {
  width: 100%; background: #ff8049; color: #fff; border-radius: 12px; padding: 13px 0; font-size: 13.5px; font-weight: 700;
  display: flex; align-items: center; justify-content: center; gap: 8px; transition: background .15s ease;
}
.mv-confirm-btn:hover:not(:disabled) { background: #9b4c2a; }
.mv-confirm-btn:disabled { opacity: .5; cursor: not-allowed; }
.mv-confirm-btn .msr { font-size: 17px; }

.mv-feedback { margin-top: 10px; font-size: 12px; padding: 9px 11px; border-radius: 9px; display: flex; align-items: center; gap: 6px; }
.mv-feedback.ok { background: #DCFCE7; color: var(--teal-deep); }
.mv-feedback.erro { background: #FEE2E2; color: var(--coral); }

/* ==================================================================
   CESTA — cotação + pedido direto
   ================================================================== */
.mv-quote-fab { position: fixed; bottom: 24px; right: 24px; z-index: 150; display: flex; flex-direction: column; gap: 12px; align-items: flex-end; }
.mv-quote-fab button {
  background: var(--primary-deep); color: #fff; border-radius: 999px; padding: 14px 20px 14px 16px;
  display: flex; align-items: center; gap: 10px; box-shadow: 0 18px 34px -12px rgba(21,17,46,.55); transition: transform .2s ease;
}
.mv-quote-fab button.fab-pedido { background: var(--teal-deep); }
.mv-quote-fab button:hover { transform: translateY(-2px); }
.mv-quote-fab .msr { font-size: 22px; }
.mv-quote-fab .count {
  background: var(--teal); color: #fff; font-size: 11px; font-weight: 800; min-width: 20px; height: 20px; border-radius: 999px;
  display: flex; align-items: center; justify-content: center; padding: 0 5px;
}
.mv-quote-fab button.fab-pedido .count { background: var(--amber); }
.mv-quote-fab .label { font-size: 13px; font-weight: 700; }

.mv-quote-drawer {
  position: fixed; top: 0; right: 0; height: 100%; width: 420px; max-width: 92vw; background: var(--surface); z-index: 210;
  transform: translateX(100%); transition: transform .3s cubic-bezier(.65,0,.35,1);
  display: flex; flex-direction: column;
}
.mv-quote-drawer.open { transform: translateX(0); }
.mv-quote-drawer-head { padding: 20px 22px 0; border-bottom: 1px solid var(--line); }
.mv-quote-drawer-head-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.mv-quote-drawer-head h3 { font-size: 18px; }
.mv-quote-drawer-head p { font-size: 12.5px; color: var(--muted); margin-top: 3px; }
.mv-drawer-tabs { display: flex; gap: 4px; }
.mv-drawer-tab {
  flex: 1; padding: 10px 10px; font-size: 12.5px; font-weight: 700; color: var(--muted); text-align: center;
  border-bottom: 2px solid transparent; display: flex; align-items: center; justify-content: center; gap: 6px;
}
.mv-drawer-tab .msr { font-size: 16px; }
.mv-drawer-tab.active { color: var(--primary-dark); border-color: var(--primary); }

.mv-quote-list { flex: 1; overflow-y: auto; padding: 10px 18px; }
.mv-quote-target-group { margin-bottom: 20px; border: 1px solid var(--line); border-radius: 14px; padding: 12px; }
.mv-quote-target-label { display: flex; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 700; color: var(--ink); margin-bottom: 8px; }
.mv-quote-target-label .msr { font-size: 16px; color: var(--primary); }
.mv-quote-target-label .idtag { font-size: 10.5px; color: var(--muted); font-weight: 600; }
.mv-quote-vendor-label { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; color: var(--teal-deep); text-transform: uppercase; letter-spacing: .04em; margin: 10px 2px 6px; }
.mv-quote-item { display: flex; gap: 12px; padding: 8px 2px; align-items: center; }
.mv-quote-item img { width: 48px; height: 48px; border-radius: 10px; object-fit: cover; background: var(--surface-2); }
.mv-quote-item-info { flex: 1; min-width: 0; }
.mv-quote-item-info .name { font-size: 12.5px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mv-quote-item-info .price { font-family: 'IBM Plex Mono'; font-size: 11.5px; color: var(--muted); }
.mv-quote-item-qty { display: flex; align-items: center; gap: 6px; }
.mv-quote-item-qty button { width: 22px; height: 22px; border-radius: 6px; background: var(--surface-2); display: flex; align-items: center; justify-content: center; font-size: 14px; }
.mv-quote-item-remove { color: #C7C2E0; }
.mv-quote-item-remove:hover { color: var(--coral); }
.mv-quote-empty { text-align: center; padding: 60px 20px; color: var(--muted); }
.mv-quote-empty .msr { font-size: 44px; color: var(--line); margin-bottom: 10px; }
.mv-quote-drawer-foot { padding: 16px 22px 22px; border-top: 1px solid var(--line); }
.mv-quote-total-row { display: flex; justify-content: space-between; font-size: 13px; color: var(--muted); margin-bottom: 6px; }
.mv-quote-total-row strong { color: var(--ink); font-family: 'IBM Plex Mono'; }
.mv-drawer-scrim { position: fixed; inset: 0; background: rgba(15,12,35,.45); z-index: 205; opacity: 0; pointer-events: none; transition: opacity .2s ease; }
.mv-drawer-scrim.open { opacity: 1; pointer-events: auto; }

.mv-btn { flex: 1; border-radius: 14px; background-color: #ff8049; padding: 14px 16px; font-weight: 700; font-size: 13.5px; display: flex; align-items: center; justify-content: center; gap: 8px; }
.mv-btn.primary { background: #ff8049; color: #fff; }
.mv-btn.primary:hover { background: #68331c; }
.mv-btn.primary:disabled { opacity: .5; cursor: not-allowed; }
.mv-btn.ghost { background: var(--surface-2); color: var(--ink); }
.mv-btn.ghost:hover { background: var(--line); }
.mv-btn .msr { font-size: 18px; }
.mv-modal-actions-row { display: flex; gap: 10px; margin-top: 14px; }

.mv-toast {
  position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%) translateY(20px); background: var(--primary-deep); color: #fff;
  padding: 12px 22px; border-radius: 999px; font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 8px;
  box-shadow: var(--shadow-pop); z-index: 300; opacity: 0; pointer-events: none; transition: all .25s ease; max-width: 90vw;
  background-color: #1A032E;
}
.mv-toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
.mv-toast .msr { color: #00BD9B; font-size: 18px; flex-shrink: 0; }

/* ---------- RESPONSIVO ---------- */
@media (max-width: 900px) {
  .mv-shell { padding: 14px 14px 40px; }
}
@media (max-width: 900px) {
  .mv-pp-main { grid-template-columns: 1fr; gap: 24px; }
  .mv-pp-avaliacoes-grid { grid-template-columns: 1fr; }
}
@media (max-width: 720px) {
  .mv-pp-content { padding: 20px 16px 48px; }
  .mv-pp-topbar { padding: 12px 14px; }
  .mv-pp-voltar-label { display: none; }
  .mv-pp-title { font-size: 21px; }
  .mv-quote-drawer { width: 100%; max-width: 100%; }
  .mv-quote-fab { bottom: 16px; right: 16px; }
}

@media(max-width: 1828px){
    .mv-shell{
        max-width: 1500px;
    }
}

@media(max-width: 1728px){
    .mv-shell{
        max-width: 1300px;
    }
}

@media(max-width: 1508px){
    .mv-shell{
        max-width: 1100px;
    }
}

@media(max-width: 1308px){
    .mv-shell{
        max-width: 1000px;
    }
}

@media(max-width: 1184px){
    .mv-shell{
        max-width: 900px;
    }
}

@media(max-width: 1090px){
    .mv-shell{
        max-width: 700px;
    }
}
</style>