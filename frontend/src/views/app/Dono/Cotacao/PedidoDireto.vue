<template>
  <div class="console-page">
    <div class="console-content">

      <!-- ══ HEADER ══ -->
      <div class="cc-header">
        <div class="cc-header-left">
          <button class="back-btn" @click="$router.back()">
            <span class="material-symbols-outlined">arrow_back_ios_new</span>
          </button>
          <div class="cotacao-identity">
            <span class="cotacao-label">PEDIDO DIRETO</span>
            <span class="cotacao-name">{{ cabecalho?.nome_pedido_direto || nomePedidoDireto || '—' }}</span>
            <span class="cotacao-name">{{ cabecalho?.nome_empresa || nomePedidoDireto || '—' }}</span>
            <span class="cotacao-name" style="font-size: 0.8rem; color: #777;">{{ cabecalho?.cnpj || nomePedidoDireto || '—' }}</span>
          </div>
        </div>
        <div class="cc-header-right" v-if="cabecalho">
          <span class="meta-id">#{{ cabecalho.id_pedido_direto }}</span>
          <div :class="['status-pill', 'status-' + cabecalho.status_pedido_direto]">
            <span class="status-dot"></span>
            {{ statusLabel(cabecalho.status_pedido_direto) }}
          </div>
        </div>
      </div>


      <div class="header-actions" v-if="cabecalho && cabecalho.status_pedido_direto == 'finalizada'">
        <button class="action-btn btn-success poppins-medium full-w" style="cursor: default;">
          <div class="enviado-hint poppins-medium" style="color: #FFF;">
            <span class="material-symbols-outlined">check_circle</span>
            Pedido direto já enviado
          </div>
        </button>
      </div>

      <!-- ══ TABS ══ -->
      <div class="tabs-bar">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          :class="['tab-btn', 'poppins-medium', { active: activeTab === tab.key }]"
          @click="activeTab = tab.key"
        >
          <span class="material-symbols-outlined tab-icon">{{ tab.icon }}</span>
          <span class="tab-label">{{ tab.label }}</span>
          <span class="tab-badge" v-if="tab.badge">{{ tab.badge }}</span>
        </button>
      </div>

      <!-- ══════════════════════════════════
           TAB: PRODUTOS ADICIONADOS
      ══════════════════════════════════ -->
      <div v-if="activeTab === 'produtos'" class="tab-pane">

        <div class="pane-header">
          <div class="search-wrap">
            <span class="material-symbols-outlined sb-icon">search</span>
            <input
              type="text"
              v-model="searchProdutos"
              placeholder="Buscar produto ou vendedor..."
              class="sb-input poppins-regular"
            />
            <button v-if="searchProdutos" class="sb-clear" @click="searchProdutos = ''">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <div class="pane-btn-group" v-if="podeEditar">
            <button class="action-btn btn-outline poppins-medium" @click="abrirAddProdutoModal">
              <span class="material-symbols-outlined">add</span> Produto
            </button>
            <button class="action-btn btn-outline-gray poppins-medium" @click="abrirAddProdutoInexistenteModal">
              <span class="material-symbols-outlined">add_circle</span> Não cadastrado
            </button>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loadingItens" class="loading-state">
          <span class="spinner"></span>
          <p class="poppins-regular">Carregando produtos...</p>
        </div>

        <!-- Vazio -->
        <div v-else-if="produtosFiltrados.length === 0" class="empty-state">
          <div class="empty-icon-wrap">
            <span class="material-symbols-outlined">inventory_2</span>
          </div>
          <h3 class="poppins-semibold">Nenhum produto</h3>
          <p class="poppins-regular">Adicione produtos ao pedido direto usando os botões acima.</p>
        </div>

        <!-- Lista de produtos -->
        <div v-else class="produtos-list">
          <div
            v-for="p in produtosFiltrados"
            :key="p.item_pedido_direto"
            class="produto-card"
          >
            <div class="pc-top">
              <div class="pc-info">
                <span class="pc-name poppins-semibold" style="text-wrap: inherit;">{{ p.nome_exibicao }}</span>
                <span class="pc-barcode mono poppins-regular" v-if="p.codigo_barra">{{ p.codigo_barra }}</span>
                <span class="pc-name poppins-regular muted" v-else-if="!p.id_produto">Produto não cadastrado</span>
              </div>
              <div class="pc-actions" v-if="podeEditar">
                <button class="icon-btn edit" @click="abrirEditarProduto(p)" title="Detalhes / Editar">
                  <span class="material-symbols-outlined">edit</span>
                </button>
                <button class="icon-btn del" @click="confirmarDeleteProduto(p)">
                  <span class="material-symbols-outlined">delete</span>
                </button>
              </div>
              <span class="material-symbols-outlined locked-hint" v-else>lock</span>
            </div>

            <!-- Vendedor responsável -->
            <div class="pc-vendor">
              <span class="vendor-chip-avatar sm">
                <img v-if="p.vendedor_foto" :src="p.vendedor_foto" :alt="p.vendedor_nome" />
                <span v-else class="vendor-chip-initials poppins-semibold">{{ initials(p.vendedor_nome) }}</span>
              </span>
              <span class="pc-vendor-name poppins-medium">{{ p.vendedor_nome || 'Vendedor não encontrado' }}</span>
            </div>

            <!-- Preço, com desconto quando houver -->
            <div class="pc-price-row" v-if="p.preco_produto != null">
              <template v-if="isDescontoAtivo(p)">
                <span class="pc-price-old mono">R$ {{ formatVal(p.preco_produto) }}</span>
                <span class="pc-price-new poppins-semibold">R$ {{ formatVal(precoComDesconto(p)) }}</span>
                <span class="pc-discount-badge poppins-semibold">-{{ p.promocao_desconto }}%</span>
              </template>
              <template v-else>
                <span class="pc-price-new poppins-semibold">R$ {{ formatVal(p.preco_produto) }}</span>
              </template>
            </div>
            <div  style="font-size: 0.8rem; font-weight: 700;" class="pc-discount-valid poppins-regular" v-if="isDescontoAtivo(p) && p.desconto_fim">
              <span class="material-symbols-outlined">local_fire_department</span>
              Promoção válida até {{ formatarData(p.desconto_fim) }}
            </div>

            <div class="pc-details" style="gap: 40px;">
              <div class="pc-detail-item">
                <span class="pc-detail-label poppins-regular">Qtd</span>
                <span class="pc-detail-val poppins-semibold">{{ p.quantidade ?? '—' }}</span>
              </div>
              <div class="pc-detail-item" v-if="p.tipo_produto">
                <span class="pc-detail-label poppins-regular">Tipo</span>
                <span class="type-tag poppins-medium">{{ p.tipo_produto }}</span>
              </div>
              <div class="pc-detail-item" v-if="p.qtd_unitaria_composicao">
                <span class="pc-detail-label poppins-regular">Comp.</span>
                <span class="pc-detail-val poppins-medium">{{ p.qtd_unitaria_composicao }} un</span>
              </div>
            </div>

             <div class="pc-details" style="margin-top: 20px; gap: 40px;">
              <div class="pc-detail-item">
                <span class="pc-detail-label poppins-regular">Últ. Preço</span>
                <span class="pc-detail-val poppins-semibold">R$ {{ p.preco_pago_ultima_compra ?? '--' }}</span>
              </div>
              <div class="pc-detail-item" v-if="p.tipo_produto">
                <span class="pc-detail-label poppins-regular">Últ. QTD</span>
                <span class="pc-detail-val poppins-medium">{{ p.quantidade_ultima_compra ?? '--'}}</span>
              </div>

              

            </div>
            <div class="pc-details" style="margin-top: 20px; gap: 40px;">
              <div class="pc-detail-item">
                <span class="pc-detail-label poppins-regular">Origem</span>
                <span class="pc-detail-val poppins-semibold">{{ p.origem_ultima_compra ?? '—' }}</span>
              </div>
              <div class="pc-detail-item">
                <span class="pc-detail-label poppins-regular">Data Últ. Compra</span>
                <span class="pc-detail-val poppins-medium">
                  {{
                    p.data_ultima_compra
                      ? new Date(Number(p.data_ultima_compra)).toLocaleString('pt-BR')
                      : '-'
                  }}
                </span>
            </div>
              

            </div>
          </div>
        </div>
      </div>

      <!-- ══════════════════════════════════
           TAB: VENDEDORES x PRODUTOS
      ══════════════════════════════════ -->
      <div v-if="activeTab === 'vendedores'" class="tab-pane">

        <!-- Loading -->
        <div v-if="loadingItens || loadingVendedores" class="loading-state">
          <span class="spinner"></span>
          <p class="poppins-regular">Carregando vendedores...</p>
        </div>

        <!-- Vazio -->
        <div v-else-if="vendedoresComProdutos.length === 0" class="empty-state">
          <div class="empty-icon-wrap">
            <span class="material-symbols-outlined">group</span>
          </div>
          <h3 class="poppins-semibold">Nenhum vendedor</h3>
          <p class="poppins-regular">Adicione produtos para ver a relação de vendedores.</p>
        </div>

        <!-- Lista vendedor -> produtos -->
        <div v-else class="vendedores-list-mobile">
          <div
            v-for="v in vendedoresComProdutos"
            :key="v.id_vendedor"
            class="vendedor-card-mobile vendedor-card-produtos"
          >
            <div class="vcp-header" @click="toggleVendedorExpanded(v.id_vendedor)">
              <div class="vc-avatar">
                <img v-if="v.foto_perfil" :src="v.foto_perfil" :alt="v.nome" />
                <span v-else class="vc-initials poppins-semibold">{{ initials(v.nome) }}</span>
              </div>
              <div class="vc-info">
                <span class="vc-name poppins-semibold">{{ v.nome }}</span>
                <span class="vc-empresa poppins-medium" v-if="v.nome_empresa">{{ v.nome_empresa }}</span>
                <span class="vc-cnpj muted poppins-regular" v-if="v.cnpj">CNPJ: {{ v.cnpj }}</span>
                <span class="vc-pedido-min poppins-regular" v-if="v.pedido_minimo != null">
                  Pedido Mínimo: <b>R$ {{ formatVal(v.pedido_minimo) }}</b>
                </span>
              </div>
              <div class="vcp-header-right">
                <span class="vcp-count poppins-semibold">
                  {{ v.produtos.length }} item{{ v.produtos.length !== 1 ? 's' : '' }}
                </span>
                <span class="vcp-total poppins-semibold">R$ {{ formatVal(v.totalValor) }}</span>
                <span class="material-symbols-outlined vcp-expand-icon">
                  {{ isVendedorExpanded(v.id_vendedor) ? 'expand_less' : 'expand_more' }}
                </span>
              </div>
            </div>

            <div class="vcp-produtos" v-if="isVendedorExpanded(v.id_vendedor)">
              <div v-for="prod in v.produtos" :key="prod.item_pedido_direto" class="vcp-produto-chip vcp-produto-chip-full">
                <div class="vcp-produto-info">
                  <span class="vcp-produto-nome poppins-medium">{{ prod.nome_exibicao }}</span>
                  <span class="vcp-produto-qtd poppins-regular">
                    {{ prod.quantidade }}{{ prod.tipo_produto ? ' ' + prod.tipo_produto : '' }}
                  </span>
                </div>
                <div class="vcp-produto-precos" v-if="prod.preco_produto != null">
                  <span class="vcp-produto-preco poppins-medium" v-if="isDescontoAtivo(prod)">
                    <span class="mono" style="text-decoration:line-through;color:#94a3b8;font-size:11px;">R$ {{ formatVal(prod.preco_produto) }}</span>
                    R$ {{ formatVal(precoComDesconto(prod)) }}
                  </span>
                  <span class="vcp-produto-preco poppins-medium" v-else>R$ {{ formatVal(precoComDesconto(prod)) }}</span>
                  <span class="vcp-produto-subtotal poppins-semibold">
                    R$ {{ formatVal(precoComDesconto(prod) * (prod.quantidade || 0)) }}
                  </span>
                </div>
              </div>

              <div class="vp-total-row">
                <span class="poppins-medium">Total do vendedor</span>
                <span class="poppins-semibold">R$ {{ formatVal(v.totalValor) }}</span>
              </div>
            </div>
          </div>

          <div class="vp-total-geral-mobile" v-if="vendedoresComProdutos.length">
            <span class="poppins-medium">Total geral do pedido</span>
            <span class="poppins-semibold">R$ {{ formatVal(totalGeralPedido) }}</span>
          </div>
        </div>
      </div>

    </div>

    <!-- ══════════════════════════════════════════════
         MODAL: ADICIONAR PRODUTO CADASTRADO
    ══════════════════════════════════════════════ -->
    <Transition name="modal-fade">
    <div v-if="showAddProdutoModal" class="modal-overlay" @click.self="fecharModalAddProduto">
      <div class="modal-content">
        <div class="modal-handle"></div>
        <div class="modal-box">
          <div class="modal-header">
            <span class="poppins-semibold">Adicionar Produto</span>
            <button class="modal-close" @click="fecharModalAddProduto">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          <div class="modal-body">
            <p class="modal-hint poppins-regular">Busque por nome, código de barras ou descrição do produto.</p>

            <!-- Busca -->
            <div class="search-camera-row">
              <div class="search-wrap search-wrap-flex">
                <span class="material-symbols-outlined sb-icon">search</span>
                <input
                  type="text"
                  v-model="searchCatalogo"
                  placeholder="Nome, cód. barras, descrição..."
                  class="sb-input poppins-regular"
                  @input="buscarCatalogo"
                />
              </div>
            </div>

            <!-- ETAPA 1: lista de resultados -->
            <template v-if="!addProduto.id_produto">
              <div v-if="loadingCatalogo" class="catalogo-loading poppins-regular">
                <span class="spinner spinner-sm"></span>
                Buscando...
              </div>

              <div class="catalogo-list" v-else-if="catalogoFiltrado.length > 0">
                <div
                  v-for="p in catalogoFiltrado"
                  :key="p.id_produto"
                  class="catalogo-item"
                  @click="selecionarProdutoCatalogo(p)"
                >
                  <div class="catalogo-item-info">
                    <span class="prod-name poppins-semibold">{{ p.nome }}</span>
                    <span class="mono muted poppins-regular catalogo-barcode">{{ p.codigo_barra || 'Sem cód.' }}</span>
                  </div>
                  <div class="catalogo-item-right">
                    <span class="prod-price poppins-medium">R$ {{ formatVal(p.preco_custo) }}</span>
                    <span class="material-symbols-outlined catalogo-arrow">chevron_right</span>
                  </div>
                </div>
              </div>

              <div class="catalogo-pagination" v-if="catalogoFiltrado.length > 0 && catalogoPages > 1">
                <button class="pag-btn" :disabled="catalogoPage <= 1" @click="mudarPaginaCatalogo(catalogoPage - 1)">
                  <span class="material-symbols-outlined">chevron_left</span>
                </button>
                <span class="pag-info poppins-regular">{{ catalogoPage }} / {{ catalogoPages }}</span>
                <button class="pag-btn" :disabled="catalogoPage >= catalogoPages" @click="mudarPaginaCatalogo(catalogoPage + 1)">
                  <span class="material-symbols-outlined">chevron_right</span>
                </button>
              </div>

              <div v-else-if="!loadingCatalogo && searchCatalogo.length >= 2" class="muted poppins-regular text-center" style="padding:16px 0">
                Nenhum produto encontrado.
              </div>
            </template>

            <!-- ETAPA 2: produto selecionado -->
            <div v-if="addProduto.id_produto" class="form-selected-prod">
              <div class="selected-prod-detail">
                <div class="selected-prod-detail-top">
                  <span class="material-symbols-outlined spd-icon">inventory_2</span>
                  <div class="spd-info">
                    <span class="spd-name poppins-semibold">{{ addProduto.nome }}</span>
                    <span class="spd-barcode mono poppins-regular">{{ addProduto.codigo_barra || 'Sem código' }}</span>
                  </div>
                </div>
                <div class="spd-prices" v-if="addProduto.preco_custo != null || addProduto.preco_venda != null">
                  <div class="spd-price-item" v-if="addProduto.preco_custo != null">
                    <span class="spd-price-label poppins-regular">Custo</span>
                    <span class="spd-price-val poppins-semibold">R$ {{ formatVal(addProduto.preco_custo) }}</span>
                  </div>
                  <div class="spd-price-item" v-if="addProduto.preco_venda != null">
                    <span class="spd-price-label poppins-regular">Venda</span>
                    <span class="spd-price-val poppins-semibold">R$ {{ formatVal(addProduto.preco_venda) }}</span>
                  </div>
                </div>
                <button class="trocar-prod-btn poppins-medium" @click="voltarParaListaCatalogo">
                  <span class="material-symbols-outlined">arrow_back</span> Trocar produto
                </button>
              </div>

              <!-- Quantidade / Tipo / Composição -->
              <div class="form-group">
                <label class="form-label poppins-medium">Quantidade *</label>
                <input type="number" v-model.number="addProduto.quantidade" min="1" class="form-input poppins-regular" />
              </div>
              <div class="form-group">
                <label class="form-label poppins-medium">Tipo</label>
                <select v-model="addProduto.tipo_produto" class="form-input poppins-regular">
                  <option value="unidade">Unidade</option>
                  <option value="caixa">Caixa</option>
                  <option value="fardo">Fardo</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label poppins-medium">Qtd por embalagem</label>
                <input type="number" v-model.number="addProduto.qtd_unitaria_composicao" min="1" class="form-input poppins-regular" />
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="action-btn btn-outline poppins-medium full-w" @click="fecharModalAddProduto">Cancelar</button>
            <button
              class="action-btn btn-primary poppins-medium full-w"
              :disabled="!addProduto.id_produto || !addProduto.tipo_produto || !addProduto.quantidade || loadingAdd"
              @click="adicionarProduto"
            >
              <span class="material-symbols-outlined">add</span> Adicionar
            </button>
          </div>
        </div>
      </div>
    </div>
    </Transition>

    <!-- ══════════════════════════════════════════════
         MODAL: ADICIONAR PRODUTO NÃO CADASTRADO
    ══════════════════════════════════════════════ -->
    <Transition name="modal-fade">
    <div v-if="showAddProdutoModalInexistente" class="modal-overlay" @click.self="fecharModalAddProdutoInexistente">
      <div class="modal-content">
        <div class="modal-handle"></div>
        <div class="modal-box">
          <div class="modal-header">
            <span class="poppins-semibold">Produto Não Cadastrado</span>
            <button class="modal-close" @click="fecharModalAddProdutoInexistente">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          <div class="modal-body">
            <p class="modal-hint poppins-regular">
              Use para produtos não cadastrados no sistema, como lançamentos ou novos itens ainda não identificados.
            </p>

            <div class="form-group">
              <label class="form-label poppins-medium">Nome *</label>
              <input type="text" v-model="addProdutoInexistente.nome" class="form-input poppins-regular" placeholder="Nome do produto" />
            </div>
            <div class="form-group">
              <label class="form-label poppins-medium">Quantidade *</label>
              <input type="number" v-model.number="addProdutoInexistente.quantidade" min="1" class="form-input poppins-regular" />
            </div>
            <div class="form-group">
              <label class="form-label poppins-medium">Tipo</label>
              <select v-model="addProdutoInexistente.tipo_produto" class="form-input poppins-regular">
                <option value="unidade">Unidade</option>
                <option value="caixa">Caixa</option>
                <option value="fardo">Fardo</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label poppins-medium">Qtd por embalagem</label>
              <input type="number" v-model.number="addProdutoInexistente.qtd_unitaria_composicao" min="1" class="form-input poppins-regular" />
            </div>
          </div>
          <div class="modal-footer">

            
            <button class="action-btn btn-outline poppins-medium full-w" @click="fecharModalAddProdutoInexistente">Cancelar</button>
            <button
              class="action-btn btn-primary poppins-medium full-w"
              :disabled="!addProdutoInexistente.nome || !addProdutoInexistente.quantidade || !addProdutoInexistente.tipo_produto || loadingAdd"
              @click="adicionarProdutoInexistente"
            >
              <span class="material-symbols-outlined">add</span> Adicionar
            </button>
          </div>
        </div>
      </div>
    </div>
    </Transition>

    <!-- ══════════════════════════════════════════════
         MODAL: EDITAR ITEM
    ══════════════════════════════════════════════ -->
    <Transition name="modal-fade">
    <div v-if="showEditModal" class="modal-overlay" @click.self="showEditModal = false">
      <div class="modal-content">
        <div class="modal-handle"></div>
        <div class="modal-box" v-if="editTarget">
          <div class="modal-header">
            <span class="poppins-semibold">Detalhes do Produto</span>
            <button class="modal-close" @click="showEditModal = false">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          <div class="modal-body">
            <p class="modal-prod-name poppins-semibold">{{ editTarget.nome_exibicao }}</p>

            <!-- Detalhes do produto: preço (com desconto), última compra, origem, etc. -->
            <div class="edit-detail-card" v-if="temDetalhesCompra(editTarget)">
              <div class="edit-detail-row" v-if="editTarget.vendedor_nome">
                <span class="edd-label poppins-medium">Vendedor</span>
                <span class="edd-val poppins-regular">{{ editTarget.vendedor_nome }}</span>
              </div>
              <div class="edit-detail-row" v-if="editTarget.preco_produto != null">
                <span class="edd-label poppins-medium">Preço do produto</span>
                <span class="edd-val poppins-semibold">
                  <template v-if="isDescontoAtivo(editTarget)">
                    <span class="edd-old mono">R$ {{ formatVal(editTarget.preco_produto) }}</span>
                    R$ {{ formatVal(precoComDesconto(editTarget)) }}
                    <span class="edd-badge poppins-semibold">-{{ editTarget.promocao_desconto }}%</span>
                  </template>
                  <template v-else>R$ {{ formatVal(editTarget.preco_produto) }}</template>
                </span>
              </div>
              <div class="edit-detail-row" v-if="isDescontoAtivo(editTarget) && editTarget.desconto_fim">
                <span class="edd-label poppins-medium">Promoção válida até</span>
                <span class="edd-val poppins-regular">{{ formatarData(editTarget.desconto_fim) }}</span>
              </div>
              <div class="edit-detail-row" v-if="editTarget.preco_pago_ultima_compra != null">
                <span class="edd-label poppins-medium">Último preço pago</span>
                <span class="edd-val poppins-regular">R$ {{ formatVal(editTarget.preco_pago_ultima_compra) }}</span>
              </div>
              <div class="edit-detail-row" v-if="editTarget.quantidade_ultima_compra != null">
                <span class="edd-label poppins-medium">Última qtd. comprada</span>
                <span class="edd-val poppins-regular">{{ editTarget.quantidade_ultima_compra }}</span>
              </div>
              <div class="edit-detail-row" v-if="editTarget.origem_ultima_compra">
                <span class="edd-label poppins-medium">Origem da última compra</span>
                <span class="edd-val poppins-regular">{{ editTarget.origem_ultima_compra }}</span>
              </div>
              <div class="edit-detail-row" v-if="editTarget.data_ultima_compra">
                <span class="edd-label poppins-medium">Data da última compra</span>
                <span class="edd-val poppins-regular">{{ formatarDataHora(editTarget.data_ultima_compra) }}</span>
              </div>
              <div class="edit-detail-row" v-if="editTarget.codigo_barra">
                <span class="edd-label poppins-medium">Cód. barras</span>
                <span class="edd-val mono poppins-regular">{{ editTarget.codigo_barra }}</span>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label poppins-medium">Quantidade *</label>
              <input type="number" v-model.number="editTarget.quantidade" min="1" class="form-input poppins-regular" />
            </div>
            <div class="form-group">
              <label class="form-label poppins-medium">Tipo</label>
              <select v-model="editTarget.tipo_produto" class="form-input poppins-regular">
                <option value="unidade">Unidade</option>
                <option value="caixa">Caixa</option>
                <option value="fardo">Fardo</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label poppins-medium">Qtd por embalagem</label>
              <input type="number" v-model.number="editTarget.qtd_unitaria_composicao" min="1" class="form-input poppins-regular" />
            </div>
          </div>
          <div class="modal-footer">
            <button class="action-btn btn-outline poppins-medium full-w" @click="showEditModal = false">Cancelar</button>
            <button
              class="action-btn btn-primary poppins-medium full-w"
              :disabled="!editTarget.quantidade || loadingEdit"
              @click="salvarEdicao"
            >
              <span class="material-symbols-outlined">check</span> Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
    </Transition>

    <!-- ══════════════════════════════════════════════
         MODAL: CONFIRMAÇÃO (remover item / enviar pedido)
         Substitui o antigo alertController do Ionic.
    ══════════════════════════════════════════════ -->
    <Transition name="modal-fade">
      <div v-if="confirmDialog.visivel" class="modal-overlay" @click.self="fecharConfirmDialog">
        <div class="modal-card">
          <div class="modal-header">
            <span class="poppins-semibold">{{ confirmDialog.titulo }}</span>
            <button class="modal-close" @click="fecharConfirmDialog">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          <div class="modal-body">
            <p class="modal-hint poppins-regular">{{ confirmDialog.mensagem }}</p>
          </div>
          <div class="modal-footer">
            <button class="action-btn btn-outline poppins-medium full-w" @click="fecharConfirmDialog">Cancelar</button>
            <button
              :class="['action-btn poppins-medium full-w', confirmDialog.destrutivo ? 'btn-danger' : 'btn-primary']"
              @click="executarConfirmDialog"
            >
              <span class="material-symbols-outlined">{{ confirmDialog.destrutivo ? 'delete' : 'check' }}</span>
              {{ confirmDialog.textoConfirmar }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { api } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import exibeErro from '@/utils/ExibeErro'
import { mapState } from 'pinia'

export default defineComponent({
  name: 'PedidoDiretoConsole',

  props: {
    id_pedido_direto: Number,
  },

  data() {
    return {
      activeTab: 'produtos' as string,
      auth: null as any,
      idPedidoDiretoLocal: null as number | null,
      nomePedidoDireto: null as string | null,

      // Dados principais
      cabecalho: null as any,
      itens: [] as any[],
      vendedores: [] as any[],

      // Cache de produtos cadastrados (id_produto -> dados), pois
      // item_pedido_direto guarda apenas o id_produto, sem nome/preço.
      produtosInfo: {} as Record<number, any>,

      // Loading flags
      loadingItens: false,
      loadingVendedores: false,
      loadingAdd: false,
      loadingEdit: false,
      loadingEnviar: false,

      // Busca
      searchProdutos: '',

      // Modais
      showAddProdutoModal: false,
      showAddProdutoModalInexistente: false,
      showEditModal: false,

      // Edição
      editTarget: null as any,

      // Vendedores expandidos na aba "Vendedores"
      expandedVendedores: [] as number[],

      // Adicionar produto cadastrado
      searchCatalogo: '',
      catalogoFiltrado: [] as any[],
      catalogoPage: 1,
      catalogoPages: 1,
      loadingCatalogo: false,
      addProduto: {
        id_produto: null as number | null,
        nome: '',
        codigo_barra: '',
        preco_custo: null as number | null,
        preco_venda: null as number | null,
        quantidade: null as number | null,
        tipo_produto: 'unidade',
        qtd_unitaria_composicao: null as number | null,
        id_vendedor: null as number | null,
      },

      // Adicionar produto não cadastrado
      addProdutoInexistente: {
        nome: '',
        quantidade: null as number | null,
        tipo_produto: 'unidade',
        qtd_unitaria_composicao: null as number | null,
        id_vendedor: null as number | null,
      },

      // Modal de confirmação genérico (substitui o alertController do Ionic)
      confirmDialog: {
        visivel: false,
        titulo: '',
        mensagem: '',
        textoConfirmar: 'Confirmar',
        destrutivo: false,
        acao: null as (() => void) | null,
      },

      timer: null as any,
    }
  },

  computed: {
    ...mapState(useAuthStore, ['user']),

    tabs(): any[] {
      return [
        { key: 'produtos', label: 'Produtos', icon: 'inventory_2', badge: this.itens.length || null },
        { key: 'vendedores', label: 'Vendedores', icon: 'group', badge: this.vendedoresComProdutos.length || null },
      ]
    },

    podeEditar(): boolean {
      return !this.cabecalho || this.cabecalho.status_pedido_direto !== 'finalizada'
    },

    // Junta cada item com dados do produto cadastrado (se houver) e do vendedor
    itensEnriquecidos(): any[] {
      return this.itens.map((item: any) => {
        const vendedor = this.vendedores.find((v: any) => v.id_vendedor === item.id_vendedor)
        const infoProduto = item.id_produto ? this.produtosInfo[item.id_produto] : null

        console.log(infoProduto, "ABCABC")

        return {
          ...item,
          nome_exibicao: infoProduto?.nome_produto || item.nome_produto || item.nome_nao_cad || 'Produto não cadastrado',
          codigo_barra: infoProduto?.codigo_barra_cad || item.codigo_barra_cad || null,
          preco_custo: infoProduto?.preco_custo ?? null,
          preco_venda: infoProduto?.preco_venda ?? null,
          vendedor_nome: vendedor?.nome || null,
          vendedor_foto: vendedor?.foto_perfil || null,
          vendedor_email: vendedor?.email || null,
        }
      })
    },

    produtosFiltrados(): any[] {
      const t = this.searchProdutos.toLowerCase()
      if (!t) return this.itensEnriquecidos
      return this.itensEnriquecidos.filter((i: any) =>
        i.nome_exibicao?.toLowerCase().includes(t) ||
        i.vendedor_nome?.toLowerCase().includes(t) ||
        i.codigo_barra?.toLowerCase().includes(t)
      )
    },

    // Agrupa os itens por vendedor para a aba "Vendedores"
    vendedoresComProdutos(): any[] {
      const map: Record<number, any> = {}
      for (const item of this.itensEnriquecidos) {
        if (!item.id_vendedor) continue
        if (!map[item.id_vendedor]) {
          const vInfo = this.vendedores.find((v: any) => v.id_vendedor === item.id_vendedor)
          map[item.id_vendedor] = {
            id_vendedor: item.id_vendedor,
            nome: item.vendedor_nome || 'Vendedor não encontrado',
            email: item.vendedor_email,
            foto_perfil: item.vendedor_foto,
            nome_empresa: vInfo?.nome_empresa || null,
            cnpj: vInfo?.cnpj || null,
            pedido_minimo: vInfo?.pedido_minimo ?? null,
            produtos: [],
            totalValor: 0,
          }
        }
        map[item.id_vendedor].produtos.push(item)
        const precoUnit = this.precoComDesconto(item)
        map[item.id_vendedor].totalValor += precoUnit * (Number(item.quantidade) || 0)
      }
      return Object.values(map)
    },

    // Soma o total de todos os vendedores para o rodapé da aba "Vendedores"
    totalGeralPedido(): number {
      return this.vendedoresComProdutos.reduce((s: number, v: any) => s + (v.totalValor || 0), 0)
    },

    vendedorSelecionadoAdd(): any {
      return this.vendedores.find((v: any) => v.id_vendedor === this.addProduto.id_vendedor)
    },

    vendedorSelecionadoAddInexistente(): any {
      return this.vendedores.find((v: any) => v.id_vendedor === this.addProdutoInexistente.id_vendedor)
    },
  },

  methods: {
    // ─── UTILS ───────────────────────────────────────────────────
    formatVal(v: any): string {
      if (v == null) return '—'
      return Number(v).toFixed(2)
    },
    // Formata timestamp (ms, string ou number) como data curta pt-BR
    formatarData(v: any): string {
      if (!v) return '—'
      return new Date(Number(v)).toLocaleString('pt-BR')
    },
    // Formata timestamp (ms, string ou number) como data + hora pt-BR
    formatarDataHora(v: any): string {
      if (!v) return '—'
      return new Date(Number(v)).toLocaleString('pt-BR')
    },
    // Verifica se o item tem uma promoção ativa no momento
    isDescontoAtivo(item: any): boolean {
      if (!item || item.promocao_desconto == null) return false
      const agora = Date.now()
      const inicio = item.desconto_inicio ? Number(item.desconto_inicio) : null
      const fim = item.desconto_fim ? Number(item.desconto_fim) : null
      if (inicio && agora < inicio) return false

      if(Number(this.cabecalho.finalizado_em) == 0 && (fim < Date.now())) return false
      if (fim && (agora > fim) && (Number(this.cabecalho.finalizado_em) > fim )) return false

      return true
    },
    // Preço do item já com o desconto aplicado (se a promoção estiver ativa)
    precoComDesconto(item: any): number {
      const base = Number(item?.preco_produto ?? 0)
      if (!this.isDescontoAtivo(item)) return base
      const desconto = Number(item.promocao_desconto || 0)
      return base - (base * desconto) / 100
    },
    // Indica se há alguma informação de compra/preço a exibir no modal de detalhes
    temDetalhesCompra(item: any): boolean {
      if (!item) return false
      return (
        item.preco_produto != null ||
        item.preco_pago_ultima_compra != null ||
        item.quantidade_ultima_compra != null ||
        !!item.origem_ultima_compra ||
        !!item.data_ultima_compra ||
        !!item.codigo_barra
      )
    },
    // Expande/recolhe a lista de produtos de um vendedor na aba "Vendedores"
    toggleVendedorExpanded(id_vendedor: number) {
      const idx = this.expandedVendedores.indexOf(id_vendedor)
      if (idx >= 0) this.expandedVendedores.splice(idx, 1)
      else this.expandedVendedores.push(id_vendedor)
    },
    isVendedorExpanded(id_vendedor: number): boolean {
      return this.expandedVendedores.includes(id_vendedor)
    },
    initials(nome?: string | null): string {
      return (nome || '').split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase()
    },
    statusLabel(s: string): string {
      const map: Record<string, string> = {
        indisponivel: 'Em andamento',
        finalizada: 'Enviado',
      }
      return map[s] || s
    },

    // ─── CARREGAMENTO ────────────────────────────────────────────
    async carregarItens() {
      try {
        this.loadingItens = true
        const res = await api.get(
          `/mvpu/cotacao/consuItemPedDir/${this.auth.id_loja}/${this.idPedidoDiretoLocal}`,
          { data: { id_pedido_direto: this.idPedidoDiretoLocal } }
        )
        
        this.itens = (res.data.data || []).sort((a, b) => {
            const nomeA = (a.nome_produto || a.nome_nao_cad || '').toLowerCase()
            const nomeB = (b.nome_produto || b.nome_nao_cad || '').toLowerCase()

            return nomeA.localeCompare(nomeB, 'pt-BR')
        })

        await this.garantirInfoProdutos()
      } catch (e) {
        exibeErro(e, this.$toast)
      } finally {
        this.loadingItens = false
      }
    },

    async carregarVendedores() {
      try {
        this.loadingVendedores = true
        const res = await api.get(`/mvpu/usuario/consultarVendedores/${this.auth.id_loja}`)
        this.vendedores = res.data.data || []
      } catch (e) {
        exibeErro(e, this.$toast)
      } finally {
        this.loadingVendedores = false
      }
    },

    // Enriquece o cache local de produtos cadastrados para os itens que
    // referenciam id_produto (a tabela item_pedido_direto não guarda nome/preço).
    async garantirInfoProdutos() {
      const idsFaltando = [...new Set(
        this.itens
          .filter((i: any) => i.id_produto && !this.produtosInfo[i.id_produto])
          .map((i: any) => i.id_produto)
      )]

      for (const id_produto of idsFaltando) {
        try {
          const res = await api.get(
            `/mvpu/produto/consultarProdutos/${this.auth.id_loja}`,
            { params: { page: 1, limit: 1, search: id_produto } }
          )
          const encontrado = (res.data.data || []).find((p: any) => p.id_produto === id_produto)
          if (encontrado) this.produtosInfo = { ...this.produtosInfo, [id_produto]: encontrado }
        } catch (e) {
          // Falha silenciosa: o item continua exibido com nome genérico
        }
      }
    },

    // ─── CATÁLOGO (produto cadastrado) ────────────────────────────
    async buscarCatalogo() {
      if (!this.searchCatalogo || this.searchCatalogo.length < 2) {
        this.catalogoFiltrado = []
        this.catalogoPage = 1
        this.catalogoPages = 1
        return
      }
      clearTimeout(this.timer)
      this.timer = setTimeout(async () => {
        await this._fetchCatalogo(this.searchCatalogo, 1)
      }, 400)
    },

    async mudarPaginaCatalogo(page: number) {
      await this._fetchCatalogo(this.searchCatalogo, page)
    },

    async _fetchCatalogo(search: string, page: number) {
      try {
        this.loadingCatalogo = true
        const res = await api.get(
          `/mvpu/produto/consultarProdutos/${this.auth.id_loja}`,
          { params: { page, limit: 10, search, id_usuario: this.auth.user?.id_usuario } }
        )
        this.catalogoFiltrado = res.data.data || []
        this.catalogoPage = res.data.page || 1
        this.catalogoPages = res.data.pages || 1
      } catch (e) {
        this.catalogoFiltrado = []
      } finally {
        this.loadingCatalogo = false
      }
    },

    selecionarProdutoCatalogo(p: any) {
      this.addProduto.id_produto = p.id_produto
      this.addProduto.nome = p.nome
      this.addProduto.codigo_barra = p.codigo_barra || ''
      this.addProduto.preco_custo = p.preco_custo
      this.addProduto.preco_venda = p.preco_venda
      // Guarda no cache local para exibição imediata na lista, sem esperar reload
      this.produtosInfo = { ...this.produtosInfo, [p.id_produto]: p }
    },

    voltarParaListaCatalogo() {
      this.addProduto.id_produto = null
      this.addProduto.nome = ''
      this.addProduto.codigo_barra = ''
      this.addProduto.preco_custo = null
      this.addProduto.preco_venda = null
    },

    // ─── MODAL: ADICIONAR PRODUTO CADASTRADO ──────────────────────
    abrirAddProdutoModal() {
      this.showAddProdutoModal = true
      if (this.vendedores.length === 0) this.carregarVendedores()
    },

    fecharModalAddProduto() {
      this.showAddProdutoModal = false
      this.addProduto = {
        id_produto: null, nome: '', codigo_barra: '',
        preco_custo: null, preco_venda: null,
        quantidade: null, tipo_produto: 'unidade',
        qtd_unitaria_composicao: null, id_vendedor: null,
      }
      this.searchCatalogo = ''
      this.catalogoFiltrado = []
      this.catalogoPage = 1
      this.catalogoPages = 1
    },

    async adicionarProduto() {
      try {
        this.loadingAdd = true
        const payload = {
          id_pedido_direto: this.idPedidoDiretoLocal,
          id_produto: this.addProduto.id_produto,
          id_vendedor: this.cabecalho.id_vendedor,
          id_colaborador: this.auth.user?.id_usuario,
          tipo_produto: this.addProduto.tipo_produto || null,
          quantidade: this.addProduto.quantidade,
          qtd_unitaria_composicao: this.addProduto.qtd_unitaria_composicao || null,
        }
        await api.post(
          `/mvpu/cotacao/criarItemPedDir/${this.auth.id_loja}/${this.idPedidoDiretoLocal}`,
          payload
        )
        this.$toast.success('Produto adicionado ao pedido direto!')
        this.fecharModalAddProduto()
        await this.carregarItens()
      } catch (e) {
        exibeErro(e, this.$toast)
      } finally {
        this.loadingAdd = false
      }
    },

    // ─── MODAL: ADICIONAR PRODUTO NÃO CADASTRADO ──────────────────
    abrirAddProdutoInexistenteModal() {
      this.showAddProdutoModalInexistente = true
      if (this.vendedores.length === 0) this.carregarVendedores()
    },

    fecharModalAddProdutoInexistente() {
      this.showAddProdutoModalInexistente = false
      this.addProdutoInexistente = {
        nome: '', quantidade: null, tipo_produto: 'unidade',
        qtd_unitaria_composicao: null, id_vendedor: null,
      }
    },

    async adicionarProdutoInexistente() {
      try {
        this.loadingAdd = true
        const payload = {
          id_pedido_direto: this.idPedidoDiretoLocal,
          nome: this.addProdutoInexistente.nome,
          id_vendedor: this.cabecalho.id_vendedor,
          id_colaborador: this.auth.user?.id_usuario,
          tipo_produto: this.addProdutoInexistente.tipo_produto || null,
          quantidade: this.addProdutoInexistente.quantidade,
          qtd_unitaria_composicao: this.addProdutoInexistente.qtd_unitaria_composicao || null,
        }
        await api.post(
          `/mvpu/cotacao/criarItemPedDir/${this.auth.id_loja}/${this.idPedidoDiretoLocal}`,
          payload
        )
        this.$toast.success('Produto adicionado ao pedido direto!')
        this.fecharModalAddProdutoInexistente()
        await this.carregarItens()
      } catch (e) {
        exibeErro(e, this.$toast)
      } finally {
        this.loadingAdd = false
      }
    },

    // ─── EDITAR ITEM ───────────────────────────────────────────────
    abrirEditarProduto(p: any) {
      this.editTarget = { ...p }
      this.showEditModal = true
    },

    async salvarEdicao() {
      try {
        this.loadingEdit = true
        await api.put(
          `/mvpu/cotacao/atualItemPedDir/${this.auth.id_loja}/${this.idPedidoDiretoLocal}`,
          {
            item_pedido_direto: this.editTarget.item_pedido_direto,
            quantidade: this.editTarget.quantidade,
            tipo_produto: this.editTarget.tipo_produto || null,
            qtd_unitaria_composicao: this.editTarget.qtd_unitaria_composicao || null,
          }
        )
        this.$toast.success('Item atualizado!')
        this.showEditModal = false
        await this.carregarItens()
      } catch (e) {
        exibeErro(e, this.$toast)
      } finally {
        this.loadingEdit = false
      }
    },

    // ─── EXCLUIR ITEM ──────────────────────────────────────────────
    confirmarDeleteProduto(p: any) {
      this.abrirConfirmDialog({
        titulo: 'Remover produto',
        mensagem: `Remover "${p.nome_exibicao}" (${p.vendedor_nome || 'vendedor não identificado'}) do pedido direto?`,
        textoConfirmar: 'Remover',
        destrutivo: true,
        acao: () => this.deletarProduto(p),
      })
    },

    async deletarProduto(p: any) {
      try {
        await api.delete(
          `/mvpu/cotacao/deletItemPedDir/${this.auth.id_loja}/${this.idPedidoDiretoLocal}`,
          { data: { id_pedido_direto: this.idPedidoDiretoLocal, item_pedido_direto: p.item_pedido_direto } }
        )
        this.$toast.success('Produto removido do pedido direto.')
        await this.carregarItens()
      } catch (e) {
        exibeErro(e, this.$toast)
      }
    },

    // ─── ENVIAR PEDIDO DIRETO ──────────────────────────────────────
    confirmarEnvio() {
      this.abrirConfirmDialog({
        titulo: 'Enviar Pedido Direto',
        mensagem: `Enviar este pedido direto para os ${this.vendedoresComProdutos.length} vendedor(es) envolvido(s)? Após o envio não será mais possível editar os itens.`,
        textoConfirmar: 'Enviar',
        destrutivo: false,
        acao: () => this.enviarPedidoDireto(),
      })
    },

    // ─── MODAL DE CONFIRMAÇÃO GENÉRICO (substitui o alertController) ──
    abrirConfirmDialog(opts: { titulo: string; mensagem: string; textoConfirmar?: string; destrutivo?: boolean; acao: () => void }) {
      this.confirmDialog = {
        visivel: true,
        titulo: opts.titulo,
        mensagem: opts.mensagem,
        textoConfirmar: opts.textoConfirmar || 'Confirmar',
        destrutivo: !!opts.destrutivo,
        acao: opts.acao,
      }
    },

    fecharConfirmDialog() {
      this.confirmDialog.visivel = false
      this.confirmDialog.acao = null
    },

    executarConfirmDialog() {
      const acao = this.confirmDialog.acao
      this.confirmDialog.visivel = false
      this.confirmDialog.acao = null
      if (acao) acao()
    },

    async enviarPedidoDireto() {
      try {
        this.loadingEnviar = true
        await api.post(
          `/mvpu/cotacao/finalizarPedDir/${this.auth.id_loja}/${this.idPedidoDiretoLocal}`,
          {
            id_pedido_direto: this.idPedidoDiretoLocal,
            id_colaborador: this.auth.user?.id_usuario,
          }
        )
        this.$toast.success('Pedido direto enviado com sucesso!')
        if (this.cabecalho) this.cabecalho.status_pedido_direto = 'finalizada'
      } catch (e) {
        exibeErro(e, this.$toast)
      } finally {
        this.loadingEnviar = false
      }
    },

    formatarCNPJ(cnpj: string) {
      if (!cnpj) return '';

      const numeros = cnpj.replace(/\D/g, '').slice(0, 14);

      return numeros.replace(
        /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2}).*/,
        '$1.$2.$3/$4-$5'
      );
    },


    async solicitarDadosCotacao(){
      try {
        const response = await api.get(`/mvpu/cotacao/consultarPedidosDiretos/${this.auth.id_loja}/${this.idPedidoDiretoLocal}`)

        if(response.data?.data?.length){
           this.cabecalho = {
             id_pedido_direto: this.idPedidoDiretoLocal,
             nome_pedido_direto: response.data?.data[0].nome,
             id_vendedor: response.data?.data[0].id_vendedor,
             nome_empresa: response.data?.data[0].nome_empresa,
             cnpj: this.formatarCNPJ(response.data.data[0].cnpj),
             foto_perfil: response.data?.data[0].foto_perfil,
             pedido_minimo: response.data?.data[0].pedido_minimo,
             status_pedido_direto: response.data?.data[0].status_pedido_direto || 'indisponivel',
             finalizado_em: response.data?.data[0].finalizado_em
           }
        }


        this.carregarItens()
        this.carregarVendedores()

      } catch (e) {
        exibeErro(e, this.$toast)
      }
    },

    // Ponto único de entrada na tela — chamado em mounted() e, quando
    // aplicável, em activated() (ver comentário no hook activated()).
    entrarNaTela() {
      const authStore = useAuthStore()
      if (!authStore.token && !localStorage.getItem('token')) {
        this.$router.replace({ name: 'Login' })
        return
      }
      this.auth = authStore

      const query = this.$route?.query || {}

      this.idPedidoDiretoLocal = this.id_pedido_direto || Number(query.id_pedido_direto)
      this.nomePedidoDireto = query.nome_pedido_direto as string

      // Cabeçalho vem por query (mesmo padrão usado em CotacaoConsole), já que
      // as rotas fornecidas não expõem um endpoint de consulta do cabeçalho.
      if (query.id_pedido_direto) {
        this.solicitarDadosCotacao()
      }
    }
  },

  mounted() {
    this.entrarNaTela()
  },

  // Cobre o caso de a página ser mantida viva por um <keep-alive> no
  // router-view (padrão comum em apps Vue "SPA" para simular o
  // comportamento de "entrar na tela novamente" que o Ionic dava via
  // ionViewDidEnter). Se o app não usar keep-alive, este hook
  // simplesmente nunca é chamado e mounted() já cobre tudo.
  activated() {
    this.entrarNaTela()
  }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

/* ══ FONTS ══ */
.poppins-regular  { font-family: 'Poppins', sans-serif; font-weight: 400; }
.poppins-medium   { font-family: 'Poppins', sans-serif; font-weight: 500; }
.poppins-semibold { font-family: 'Poppins', sans-serif; font-weight: 600; }
.mono { font-family: 'DM Mono', monospace; }
.muted { color: #94a3b8; }
.text-center { text-align: center; }

/* ══ PAGE ══ */
.console-page { background: #fff; min-height: 100vh; }
.console-content { background: #f8fafc; min-height: 100vh; overflow-y: auto; }

/* ══ HEADER ══ */
.cc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px 10px;
  background: #fff;
  border-bottom: 1px solid #f1f5f9;
}
.cc-header-left { display: flex; align-items: center; gap: 10px; }
.back-btn {
  width: 34px; height: 34px;
  background: rgba(255,128,73,.1);
  border: none; border-radius: 9px;
  display: flex; align-items: center; justify-content: center;
  color: #ff8049; flex-shrink: 0;
}
.back-btn span { font-size: 18px; }
.cotacao-identity { display: flex; flex-direction: column; }
.cotacao-label { font-size: 9px; font-weight: 700; letter-spacing: .1em; color: #ff8049; text-transform: uppercase; }
.cotacao-name { font-size: 14px; font-weight: 700; color: #1e293b; line-height: 1.2; max-width: 100%; text-wrap:inherit ;  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cc-header-right { display: flex; align-items: center; gap: 7px; }
.meta-id { font-size: 11px; color: #94a3b8; font-family: 'DM Mono', monospace; }

/* ══ STATUS PILL ══ */
.status-pill {
  display: flex; align-items: center; gap: 4px;
  padding: 3px 8px; border-radius: 20px;
  font-size: 10px;
}
.status-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.status-indisponivel { background: rgba(0,0,0,.08); color: #64748b; }
.status-indisponivel .status-dot { background: #94a3b8; }
.status-finalizada { background: rgba(16,185,129,.15); color: #059669; }
.status-finalizada .status-dot { background: #10b981; }

/* ══ HEADER ACTIONS ══ */
.header-actions {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  background: #fff;
  border-bottom: 1px solid #f1f5f9;
}
.enviado-hint {
  display: flex; align-items: center; gap: 6px;
  width: 100%; justify-content: center;
  padding: 10px; border-radius: 10px;
  background: rgba(16,185,129,.1); color: #059669;
  font-size: 12px;
}
.enviado-hint span { font-size: 16px; }

/* ══ ACTION BUTTONS ══ */
.action-btn {
  display: flex; align-items: center; gap: 5px;
  padding: 8px 14px; border-radius: 10px;
  font-size: 12px; font-weight: 500;
  border: none; cursor: pointer;
  white-space: nowrap; flex-shrink: 0;
  transition: all .2s;
}
.action-btn span { font-size: 16px; }
.action-btn:disabled { opacity: .5; cursor: not-allowed; }
.btn-primary    { background: #ff8049; color: #fff; }
.btn-primary:not(:disabled):active { background: #e67341; }
.btn-outline    { background: #fff; color: #ff8049; border: 1px solid #ff8049; }
.btn-outline:not(:disabled):active { background: #fff7ed; }
.btn-outline-gray { background: #fff; color: #64748b; border: 1px solid #e2e8f0; }
.btn-success    { background: #10b981; color: #fff; }
.btn-success:not(:disabled):active { background: #059669; }
.full-w { flex: 1; justify-content: center; }

/* ══ TABS ══ */
.tabs-bar {
  display: flex;
  background: #fff;
  border-bottom: 1px solid #e2e8f0;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.tabs-bar::-webkit-scrollbar { display: none; }
.tab-btn {
  display: flex; align-items: center; gap: 5px;
  padding: 11px 14px;
  background: transparent; border: none;
  color: #94a3b8; font-size: 12px;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all .2s;
  white-space: nowrap; flex-shrink: 0;
}
.tab-btn.active { color: #ff8049; border-bottom-color: #ff8049; }
.tab-icon { font-size: 16px; }
.tab-badge {
  background: rgba(255,128,73,.15); color: #ff8049;
  font-size: 9px; font-weight: 700;
  padding: 1px 5px; border-radius: 8px;
}

/* ══ TAB PANE ══ */
.tab-pane { padding: 14px 14px 120px; animation: fadeIn .2s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }

/* ══ PANE HEADER ══ */
.pane-header { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; flex-wrap: wrap; }

/* ══ SEARCH ══ */
.search-wrap {
  display: flex; align-items: center; gap: 7px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 9px 12px;
  flex: 1;
}
.search-wrap-flex { flex: 1; }
.sb-icon { font-size: 17px; color: #94a3b8; flex-shrink: 0; }
.sb-input { flex: 1; border: none; background: transparent; font-size: 13px; color: #334155; outline: none; width: 100%; }
.sb-input::placeholder { color: #cbd5e1; }
.sb-clear { background: none; border: none; padding: 0; display: flex; align-items: center; }
.sb-clear span { font-size: 16px; color: #cbd5e1; }
.search-camera-row { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }

.pane-btn-group { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

@media(max-width: 530px){
    .pane-btn-group{
        display: flex;
        flex-direction: column;
        width: 100%;
    }

    .action-btn{
        width: 100% !important;
    }

    .cc-header{
        display: flex;
        flex-direction: column;
        align-items: start;
        gap: 15px;
    }
}

/* ══ LOADING / EMPTY ══ */
.loading-state, .empty-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 50px 20px; text-align: center; gap: 10px;
}
.loading-state p { font-size: 13px; color: #94a3b8; margin: 6px 0 0; }
.empty-icon-wrap {
  width: 64px; height: 64px;
  background: #f8fafc; border: 2px dashed #e2e8f0; border-radius: 20px;
  display: flex; align-items: center; justify-content: center;
}
.empty-icon-wrap span { font-size: 28px; color: #cbd5e1; }
.empty-state h3 { font-size: 15px; color: #334155; margin: 0; }
.empty-state p  { font-size: 13px; color: #94a3b8; margin: 0; max-width: 240px; line-height: 1.5; }

/* ══ PRODUTOS LIST (mobile cards) ══ */
.produtos-list { display: flex; flex-direction: column; gap: 10px; }
.produto-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 13px 14px;
  box-shadow: 0 1px 4px rgba(0,0,0,.04);
}
.pc-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 10px; }
.pc-info { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
.pc-name { font-size: 13px; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pc-barcode { font-size: 11px; }
.pc-actions { display: flex; gap: 6px; flex-shrink: 0; }
.icon-btn {
  width: 30px; height: 30px; border-radius: 9px;
  display: flex; align-items: center; justify-content: center;
  border: none; cursor: pointer; transition: all .2s;
}
.icon-btn span { font-size: 17px; }
.icon-btn.edit { background: #f1f5f9; color: #64748b; }
.icon-btn.edit:active { background: #ff8049; color: #fff; }
.icon-btn.del  { background: rgba(239,68,68,.1); color: #ef4444; }
.icon-btn.del:active  { background: #ef4444; color: #fff; }
.locked-hint { font-size: 16px; color: #cbd5e1; }

.pc-vendor {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 0; margin-bottom: 8px;
  border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9;
}
.pc-vendor-name { font-size: 12px; color: #475569; }

.pc-details { display: flex; flex-wrap: wrap; gap: 8px; }
.pc-detail-item { display: flex; flex-direction: column; gap: 1px; min-width: 60px; }
.pc-detail-label { font-size: 0.8rem; color: #555; font-weight: 600; text-transform: uppercase; letter-spacing: .4px; }
.pc-detail-val { font-size: 0.8rem; color: #475569; }
.type-tag {
  display: inline-block; background: #f1f5f9; color: #475569;
  padding: 1px 7px; border-radius: 6px; font-size: 0.8rem; text-transform: capitalize;
}

/* ══ PREÇO / DESCONTO (card de produto) ══ */
.pc-price-row {
  display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap;
  padding: 8px 0; margin-bottom: 4px;
}
.pc-price-old { font-size: 12px; color: #94a3b8; text-decoration: line-through; }
.pc-price-new { font-size: 16px; color: #10b981; }
.pc-discount-badge {
  font-size: 10px; color: #fff; background: #ef4444;
  padding: 2px 7px; border-radius: 20px;
}
.pc-discount-valid {
  display: flex; align-items: center; gap: 5px;
  font-size: 11px; color: #ff8049; margin-bottom: 8px;
}
.pc-discount-valid span.material-symbols-outlined { font-size: 14px; }


/* ══ VENDOR CHIP / AVATAR (reutilizado no picker e nos cards) ══ */
.vendor-chip-avatar {
  width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
  background: rgba(255,128,73,.1);
}
.vendor-chip-avatar.sm { width: 26px; height: 26px; }
.vendor-chip-avatar img { width: 100%; height: 100%; object-fit: cover; }
.vendor-chip-initials { font-size: 12px; color: #ff8049; }

/* ══ VENDOR PICKER (dentro dos modais de adicionar produto) ══ */
.vendor-picker-list {
  display: flex; flex-wrap: wrap; gap: 8px;
  max-height: 180px; overflow-y: auto;
  padding: 2px;
}
.vendor-chip {
  display: flex; align-items: center; gap: 7px;
  background: #f8fafc; border: 1px solid #e2e8f0;
  border-radius: 30px; padding: 5px 12px 5px 5px;
  cursor: pointer; transition: all .15s;
}
.vendor-chip:active { background: rgba(255,128,73,.08); border-color: #ff8049; }
.vendor-chip-name { font-size: 12px; color: #334155; white-space: nowrap; }

.vendor-selected {
  display: flex; align-items: center; gap: 10px;
  background: #fff8f5; border: 1px solid rgba(255,128,73,.25);
  border-radius: 14px; padding: 10px 12px;
}
.vendor-selected-name { font-size: 13px; color: #1e293b; flex: 1; }

/* ══ VENDEDORES x PRODUTOS (mobile) ══ */
.vendedores-list-mobile { display: flex; flex-direction: column; gap: 10px; }
.vendedor-card-mobile {
  background: #fff; border: 1px solid #e2e8f0;
  border-radius: 16px; padding: 14px;
}
.vendedor-card-produtos { display: flex; flex-direction: column; gap: 10px; }
.vcp-header { display: flex; align-items: flex-start; gap: 12px; cursor: pointer; }
.vc-avatar { position: relative; flex-shrink: 0; }
.vc-avatar img { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; }
.vc-initials {
  width: 44px; height: 44px; border-radius: 50%;
  background: rgba(255,128,73,.1); color: #ff8049;
  display: flex; align-items: center; justify-content: center;
  font-size: 15px;
}
.vc-info { display: flex; flex-direction: column; gap: 1px; flex: 1; min-width: 0; }
.vc-name { font-size: 13px; color: #1e293b; }
.vc-email { font-size: 11px; }
.vc-empresa { font-size: 12px; color: #334155; }
.vc-cnpj { font-size: 11px; }
.vc-pedido-min { font-size: 11px; color: #ff8049; margin-top: 2px; }
.vcp-header-right {
  display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0;
}
.vcp-count {
  font-size: 11px; color: #ff8049; background: rgba(255,128,73,.1);
  padding: 3px 9px; border-radius: 10px; white-space: nowrap;
}
.vcp-total { font-size: 13px; color: #10b981; white-space: nowrap; }
.vcp-expand-icon { font-size: 20px; color: #94a3b8; }
.vcp-produtos {
  display: flex; flex-direction: column; gap: 6px;
  padding-top: 8px; border-top: 1px solid #f1f5f9;
}
.vcp-produto-chip {
  display: flex; align-items: center; justify-content: space-between;
  background: #f8fafc; border-radius: 9px; padding: 7px 10px;
  gap: 8px;
}
.vcp-produto-chip-full { flex-wrap: wrap; }
.vcp-produto-info { display: flex; flex-direction: column; gap: 1px; min-width: 0; flex: 1; }
.vcp-produto-nome { font-size: 12px; color: #334155; }
.vcp-produto-qtd { font-size: 11px; color: #94a3b8; flex-shrink: 0; }
.vcp-produto-precos { display: flex; flex-direction: column; align-items: flex-end; gap: 1px; flex-shrink: 0; }
.vcp-produto-preco { font-size: 11px; color: #64748b; display: flex; align-items: center; gap: 5px; }
.vcp-produto-subtotal { font-size: 13px; color: #10b981; }
.vp-total-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 10px 0; margin-top: 2px; border-top: 1px dashed #e2e8f0;
  font-size: 12px; color: #1e293b;
}
.vp-total-geral-mobile {
  display: flex; align-items: center; justify-content: space-between;
  background: #1e293b; color: #fff;
  border-radius: 14px; padding: 14px 16px;
  font-size: 13px;
}
.vp-total-geral-mobile span:last-child { font-size: 16px; }


/* ══ MODAIS (bottom sheet, sem Ionic) ══ */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  z-index: 9999;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0;
}
.modal-content {
  background: #fff;
  width: 100%;
  max-width: 620px;
  max-height: 88vh;
  overflow-y: auto;
  border-radius: 20px 20px 0 0;
  box-shadow: 0 -4px 24px rgba(0,0,0,.1);
  display: flex;
  flex-direction: column;
}
.modal-handle {
  width: 36px; height: 4px; background: #e2e8f0;
  border-radius: 4px; margin: 10px auto 0;
  flex-shrink: 0;
}
.modal-box { padding: 0; }
.modal-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px 18px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 15px; color: #1e293b;
}
.modal-close { background: none; border: none; color: #94a3b8; cursor: pointer; display: flex; align-items: center; }
.modal-close span { font-size: 20px; }
.modal-body { padding: 16px 18px; }
.modal-footer { display: flex; gap: 10px; padding: 14px 18px; border-top: 1px solid #f1f5f9; }
.modal-prod-name { font-size: 14px; color: #ff8049; margin-bottom: 14px; }
.modal-hint { font-size: 13px; color: #64748b; margin-bottom: 14px; line-height: 1.5; }

/* Card de confirmação (substitui o alertController do Ionic) */
.modal-card {
  background: #fff;
  border-radius: 20px 20px 0 0;
  width: 100%;
  max-width: 420px;
  max-height: 88vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 -4px 24px rgba(0,0,0,.1);
}
.btn-danger { background: #ef4444; color: #fff; }
.btn-danger:not(:disabled):active { background: #dc2626; }

/* Transição de entrada/saída dos modais (fade + slide-up) */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity .25s ease;
}
.modal-fade-enter-active .modal-content,
.modal-fade-leave-active .modal-content,
.modal-fade-enter-active .modal-card,
.modal-fade-leave-active .modal-card {
  transition: transform .25s ease, opacity .25s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
.modal-fade-enter-from .modal-content,
.modal-fade-leave-to .modal-content,
.modal-fade-enter-from .modal-card,
.modal-fade-leave-to .modal-card {
  transform: translateY(30px);
  opacity: 0;
}

/* Responsivo: em telas maiores os modais viram cards centralizados */
@media (min-width: 640px) {
  .modal-overlay { align-items: center; padding: 1rem; }
  .modal-content, .modal-card { border-radius: 16px; }
}

/* ══ SPINNER (substitui ion-spinner) ══ */
.spinner {
  display: inline-block;
  width: 28px; height: 28px;
  border: 3px solid rgba(255,128,73,.2);
  border-top-color: #ff8049;
  border-radius: 50%;
  animation: spin .7s linear infinite;
}
.spinner-sm { width: 16px; height: 16px; border-width: 2px; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ══ DETALHES DO PRODUTO (modal editar/detalhes) ══ */
.edit-detail-card {
  background: #f8fafc; border: 1px solid #e2e8f0;
  border-radius: 14px; padding: 12px 14px;
  margin-bottom: 14px; display: flex; flex-direction: column; gap: 8px;
}
.edit-detail-row {
  display: flex; align-items: center; justify-content: space-between;
  gap: 10px; font-size: 12px;
}
.edd-label { color: #64748b; flex-shrink: 0; }
.edd-val { color: #1e293b; text-align: right; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; justify-content: flex-end; }
.edd-old { color: #94a3b8; text-decoration: line-through; font-size: 11px; }
.edd-badge {
  font-size: 10px; color: #fff; background: #ef4444;
  padding: 1px 6px; border-radius: 20px;
}

.form-group { margin-bottom: 12px; }
.form-label {
  display: block; font-size: 10px; text-transform: uppercase;
  letter-spacing: .5px; color: #ff8049; margin-bottom: 5px;
}
.form-input {
  width: 100%; background: #f8fafc;
  border: 1px solid #e2e8f0; border-radius: 10px;
  padding: 10px 12px; font-size: 13px; color: #1e293b;
  outline: none; font-family: 'Poppins', sans-serif;
  transition: border-color .2s;
  -webkit-appearance: none;
}
.form-input:focus { border-color: #ff8049; background: #fff; }

.prod-name { color: #1e293b; font-size: 13px; }
.prod-price { font-size: 12px; color: #94a3b8; }
.form-selected-prod { margin-top: 4px; }

/* ══ CATÁLOGO — BUSCA ══ */
.catalogo-loading { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #94a3b8; padding: 12px 0; }
.catalogo-list {
  max-height: 220px; overflow-y: auto;
  border: 1px solid #e2e8f0; border-radius: 12px;
  margin-bottom: 10px;
}
.catalogo-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 12px; cursor: pointer;
  border-bottom: 1px solid #f1f5f9; transition: background .15s;
  gap: 8px;
}
.catalogo-item:last-child { border-bottom: none; }
.catalogo-item:active { background: rgba(255,128,73,.08); }
.catalogo-item-info { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
.catalogo-barcode { font-size: 11px; }
.catalogo-item-right { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }
.catalogo-arrow { font-size: 18px; color: #cbd5e1; }
.catalogo-pagination { display: flex; align-items: center; justify-content: center; gap: 12px; padding: 6px 0 10px; }
.pag-btn {
  width: 30px; height: 30px; border-radius: 8px;
  background: #f1f5f9; border: none; color: #475569;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all .15s;
}
.pag-btn:disabled { opacity: .35; cursor: not-allowed; }
.pag-btn span { font-size: 18px; }
.pag-info { font-size: 12px; color: #64748b; }

.selected-prod-detail {
  background: #fff8f5;
  border: 1px solid rgba(255,128,73,.25);
  border-radius: 14px; padding: 12px 14px;
  margin-bottom: 14px;
}
.selected-prod-detail-top { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 10px; }
.spd-icon { font-size: 22px; color: #ff8049; flex-shrink: 0; margin-top: 2px; }
.spd-info { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
.spd-name { font-size: 13px; color: #1e293b; line-height: 1.3; }
.spd-barcode { font-size: 11px; color: #64748b; }
.spd-prices {
  display: flex; flex-wrap: wrap; gap: 10px;
  padding: 8px 0; border-top: 1px solid rgba(255,128,73,.15);
  margin-bottom: 10px;
}
.spd-price-item { display: flex; flex-direction: column; gap: 1px; min-width: 55px; }
.spd-price-label { font-size: 9px; text-transform: uppercase; letter-spacing: .4px; color: #94a3b8; }
.spd-price-val { font-size: 13px; color: #1e293b; }

.trocar-prod-btn {
  display: flex; align-items: center; gap: 5px;
  background: none; border: 1px solid #e2e8f0;
  border-radius: 9px; padding: 6px 12px;
  font-size: 12px; color: #64748b; cursor: pointer;
  transition: all .15s; flex-shrink: 0;
}
.trocar-prod-btn span { font-size: 16px; }
.trocar-prod-btn:active { background: #f1f5f9; border-color: #cbd5e1; }

.item-card-avatar {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
}

.item-card-avatar-img {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  display: block;
  border: 1px solid #eee;
}

.item-card-avatar-placeholder {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background-color: #f1f3f5;
  border: 1px solid #eee;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-card-avatar-placeholder .material-symbols-outlined {
  font-size: 24px;
  color: #9aa1a9 !important;
}

/* Fim dos estilos */
</style>