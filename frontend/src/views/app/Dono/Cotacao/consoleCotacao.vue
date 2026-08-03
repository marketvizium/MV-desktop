<template>
  <div class="console-root">


    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="modalStatusVisivel" class="modal-overlay" @click.self="fecharModalTutorial">
          <div class="modal-card" style="font-family: 'Poppins';">

            <!-- Cabeçalho -->
            <div class="modal-header">
              <div class="modal-header-icon">
                <span class="material-symbols-outlined">help</span>
              </div>
              <div>
                <h2 class="modal-title">Tutorial - Como usar o console</h2>
                <p class="modal-subtitle">Entenda como o console funciona para operar corretamente</p>
              </div>
              <button class="modal-close-btn" @click="fecharModalTutorial">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>

            <!-- Conteúdo: Cards de Status -->
            <div class="modal-body">

              <div class="video-container">
                <video
                    ref="video"
                    controls
                    controlsList="nodownload"
                    disablePictureInPicture
                    style="width: 100%;"
                >
                    <source src="../../../../assets/tutorial_console.mp4" type="video/mp4">
                </video>
            </div>

            </div>

            <!-- Rodapé -->
            <div class="modal-footer">
              <button class="btn-nunca-mais" @click="fecharModalDefinitivamente">
                <span class="material-symbols-outlined">visibility_off</span>
                Não quero ver novamente
              </button>
              <button class="btn-entendi" @click="fecharModalTutorial">
                Entendi!
                <span class="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>

          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- TOP NAV BAR -->
    <div class="topbar">
      <div class="topbar-left">
        <button class="back-btn" @click="$router.back()">
          <span class="material-symbols-outlined">
            list_alt_check
          </span>
        </button>
        <div class="cotacao-identity">
          <span class="cotacao-label">COTAÇÃO</span>
          <span class="cotacao-name">{{ cabecalho?.nome_cotacao || nomeCotacao || '—' }}</span>
        </div>
        <div class="cotacao-meta" v-if="cabecalho">
          <span class="meta-id">#{{ cabecalho.id_cotacao }}</span>
          <div :class="['status-pill', 'status-' + status_atual]">
            <span class="status-dot"></span>
            {{ statusLabel(status_atual) }}
          </div>
        </div>
      </div>

      <div class="topbar-right">

        <button  class="action-btn btn-export" v-if="cabecalho && auth.user.nivel != 7" @click="modalStatusVisivel = true" title="Exportar Excel">
          <i class="pi pi-download"></i> Ver Tutorial
        </button>

        <div class="periodo-display" v-if="cabecalho ">
          <i class="pi pi-calendar"></i>
          <span>{{ formatarData(cabecalho.inicio_cotacao) }} → {{ formatarData(cabecalho.final_cotacao) }}</span>
        </div>

        <!-- Botão Exportar -->
        <button class="action-btn btn-export" @click="showExportModal = true" title="Exportar Excel">
          <i class="pi pi-download"></i> Exportar
        </button>

        <!-- ACTIONS baseadas no status -->
        <template v-if="cabecalho && auth.user.nivel != 7">
          <button class="action-btn btn-outline" @click="abrirModalPeriodo" :disabled="estaConcluido">
            <i class="pi pi-clock"></i> Período
          </button>

          <button class="action-btn btn-primary" v-if="cabecalho.status_cotacao === 'fechada'" :disabled="loadingAcao" @click="abrirCotacao">
            <i class="pi pi-lock-open"></i> Abrir Cotação
          </button>
          <button class="action-btn btn-info" v-if="cabecalho.status_cotacao === 'aberta'" :disabled="loadingAcao" @click="finalizarCotacao">
            <i class="pi pi-check-circle"></i> Fechar Cotação
          </button>
          <button class="action-btn btn-success" v-if="cabecalho.status_cotacao === 'finalizada' && existePendente" :loading="loadingButtonConcluir" :disabled="loadingButtonConcluir" @click="concluirCotacao">
            <i class="pi pi-flag"></i> Finalizar Cotação
          </button>
        </template>
      </div>
    </div>

    <!-- TABS -->
    <div class="tabs-bar">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="['tab-btn', { active: activeTab === tab.key, 'tab-disable': tab.key == 'sugestao' }]"
        :disabled="tab.key == 'sugestao'"
        @click="activeTab = tab.key"
      >
        <i :class="tab.icon"></i>
        <span>{{ tab.label }}</span>
        <span class="tab-badge" v-if="tab.badge">{{ tab.badge }}</span>
      </button>
    </div>

    <!-- CONTEÚDO DAS TABS -->
    <div class="tab-content">

      <!-- ===== TAB: PRODUTOS ===== -->
      <div v-if="activeTab === 'produtos'" class="tab-pane">
        <div class="pane-header">
          <div class="search-wrap">
            <i class="pi pi-search"></i>
            <input type="text" v-model="searchProdutos" placeholder="Buscar produto, código de barras..." />
          </div>
          <div class="pane-actions" style="display: flex; gap: 10px; flex-wrap: wrap; align-items: center;">
            <!-- Botões seleção automática: aparecem quando cotação NÃO está fechada (finalizada, aberta, etc.) -->
            <template v-if="cabecalho && cabecalho.status_cotacao !== 'fechada' && cabecalho.status_cotacao !== 'aberta' && !estaConcluido">
              <button
                class="action-btn btn-auto-select"
                @click.stop="selecaoAutomaticaProdutos"
                :disabled="loadingAutoSelect"
                title="Seleciona automaticamente a oferta mais barata para cada produto"
              >
                <i class="pi pi-bolt"></i> Selecionar automaticamente
              </button>
              <button
                class="action-btn btn-remove-select"
                @click.stop="removerTodasSelecoesProdutos"
                :disabled="loadingAutoSelect"
                title="Remove todas as seleções automáticas"
              >
                <i class="pi pi-times-circle"></i> Retirar todas as seleções
              </button>
            </template>

            <button
              class="action-btn btn-outline"
              v-if="cabecalho && (cabecalho.status_cotacao === 'fechada')"
              @click="showAddProdutoModal = true"
            >
              <i class="pi pi-plus"></i> Adicionar produto
            </button>

            <button
              class="action-btn btn-outline"
              v-if="cabecalho && (cabecalho.status_cotacao === 'fechada')"
              @click="showAddProdutoModalInexistente = true"
            >
              <i class="pi pi-plus"></i> Adicionar produto não cadastrado
            </button>
          </div>
        </div>

        <div v-if="loadingProdutos" class="loading-state">
          <ProgressSpinner style="width:40px;height:40px" />
          <span>Carregando produtos...</span>
        </div>

        <div v-else-if="produtosFiltrados.length === 0" class="empty-state">
          <i class="pi pi-box" style="font-size:2.5rem;opacity:.3"></i>
          <span>Nenhum produto adicionado à cotação.</span>
        </div>

        <div v-else class="produtos-table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Produto</th>
                <th>Cód. Barras</th>
                <th>Qtd</th>
                <th>Tipo </th>
                <th>Custo</th>
                <th>Últ. Preço</th>
                <th>Últ. Qtd.</th>
                <th v-if="cabecalho && cabecalho.status_cotacao !== 'fechada'">Ofertas</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in produtosFiltrados" :class="{'botaoAtivado-produto': (cabecalho && cabecalho.status_cotacao !== 'fechada'), 'produto-selecionado-auto': temOfertaSelecionada(p) && !estaConcluido && cabecalho}" @click="cabecalho && cabecalho.status_cotacao !== 'fechada' && !showHistoricoModal && !showEditarProdutoVerificar? abrirOfertasProduto(p) : null" :key="p.id_solicitado">
                <td>
                  <div class="prod-cell">
                    <span class="prod-name">{{ p.nome }}</span>
                    <span class="prod-cat" v-if="p.categoria">{{ p.categoria }}</span>
                  </div>
                </td>
                <td><span class="mono">{{ p.codigo_barra || "Não cadastrado"}}</span></td>
                <td><b>{{ p.quantidade|| "--" }}</b></td>
                <td>
                  <span class="type-tag" v-if="p.tipo">{{ p.tipo || "--" }}</span>
                  <span v-if="p.qtd_unitaria_composicao" class="comp-info"> · {{ p.qtd_unitaria_composicao || "--" }}un</span>
                  <span class="muted" v-if="!p.tipo && !p.qtd_unitaria_composicao">—</span>
                </td>
                <td>R$ {{ formatVal(p.preco_custo) || "--" }}</td>
                <td>R$ {{ formatVal(p.ultimo_preco) || "--" }}</td>
                <td>{{ p.ultima_quantidade || "--" }}</td>

                <!-- Coluna de ofertas: visível quando cotação não é fechada -->
                <td v-if="cabecalho && cabecalho.status_cotacao !== 'fechada'">
                  <button
                    class="ofertas-count-btn"
                    
                    :title="'Ver ofertas de ' + p.nome"
                  >
                    <i class="pi pi-tag"></i>
                    <span class="ofertas-count-num"  >{{ ofertasCountPorProduto(p) }}</span>
                    <span class="ofertas-count-label"  ><b> OFERTA{{ ofertasCountPorProduto(p) !== 1 ? 'S' : '' }} </b> </span>
                    <i class="pi pi-chevron-right" style="font-size:10px; opacity:.5"></i>
                  </button>
                </td>

                <td>
                  <div class="row-actions">
                    <button
                      class="icon-btn edit"
                      v-if="podeEditarProduto"
                      @click="abrirEditarProduto(p, $event)"
                      title="Editar"
                    >
                      <span class="material-symbols-outlined">edit</span>
                    </button>
                    <button
                      class="icon-btn del"
                      v-if="podeEditarProduto"
                      @click="confirmarDeleteProduto(p, $event)"
                      title="Remover"
                    >
                      <span class="material-symbols-outlined">delete</span>
                    </button>
                    <button class="historico-btn" v-if="cabecalho && auth.usuario.nivel != 7" @click="abrirHistoricoProduto(p)">Histórico</button>
                    <span class="locked-hint" v-if="!podeEditarProduto && cabecalho?.status_cotacao === 'aberta'"><i class="pi pi-lock"></i></span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Barra de info pendentes para cotação finalizada -->
        <div class="conclude-bar" v-if="cabecalho && cabecalho.status_cotacao === 'finalizada' && existePendente">
          <span class="conclude-hint">
            <i class="pi pi-info-circle"></i>
            {{ itens.filter(i => i.status_fechamento === 'pendente').length }} produto(s) pendente(s) de seleção. Use os botões acima para selecionar automaticamente.
          </span>
        </div>
      </div>

      <!-- ===== TAB: VERIFICAR PEDIDO ===== -->
      <div v-if="activeTab === 'verificar'" class="tab-pane">
        <div class="pane-header">
          <div>
            <span style="font-size:15px; font-weight:700; color:#1a1a1a;">Resumo do Pedido por Vendedor</span>
            <span style="font-size:12px; color:#64748b; margin-left:10px;">Cotação finalizada — organize e ajuste antes de concluir</span>
          </div>
          <div class="pane-actions" style="display:flex; gap:8px;">
            <button
              v-if="cabecalho && !estaConcluido"
              class="action-btn btn-outline"
              @click="removerTodasSelecoesProdutos"
              :disabled="!existePendente"
            >
              <i class="pi pi-bolt"></i> Retirar todas as seleções
            </button>
          </div>
        </div>

        <div v-if="loadingOfertas" class="loading-state">
          <ProgressSpinner style="width:40px;height:40px" />
          <span>Carregando dados...</span>
        </div>

        <div v-else-if="itensPorVendedor.length === 0" class="empty-state">
          <i class="pi pi-clipboard" style="font-size:2.5rem;opacity:.3"></i>
          <span>Nenhum produto selecionado ainda. Selecione ofertas na aba Produtos.</span>
        </div>

        <div v-else class="verificar-pedido-wrap">
          <!-- Card de cada vendedor -->
          <div
            v-for="vend in itensPorVendedor"
            :key="vend.email"
            class="vp-vendedor-card"
          >
            <!-- Cabeçalho do vendedor -->
            <div class="vp-vendedor-header" @click="toggleVendedorExpanded(vend.email)">
              <div class="vp-vend-left">
                <div class="vp-avatar">
                  <img v-if="vend.foto_perfil" :src="vend.foto_perfil" :alt="vend.nome" />
                  <span v-else class="vp-avatar-initials">{{ initials(vend.nome) }}</span>
                </div>
                <div class="vp-vend-info">
                  <span class="vp-vend-nome">{{ vend.nome }}</span>
                  <span class="vp-vend-nome">{{ vend.nome_empresa }}</span>
                  <span class="vp-vend-nome">Pedido Mínimo: <span style="color: #ff8049">R${{ vend.pedido_minimo || "--" }}</span> </span>
                  <span class="vp-vend-email">{{ vend.email }}</span>
                </div>
              </div>
              <div class="vp-vend-stats">
                <div class="vp-stat-item">
                  <span class="vp-stat-label">Produtos ganhos</span>
                  <span class="vp-stat-value accent">{{ vend.produtos.length }}</span>
                </div>
                <div class="vp-stat-divider"></div>
                <div class="vp-stat-item">
                  <span class="vp-stat-label">Total do pedido</span>
                  <span class="vp-stat-value green">R$ {{ formatVal(vend.totalValor) }}</span>
                </div>
                <div class="vp-expand-icon">
                  <i :class="['pi', isVendedorExpanded(vend.email) ? 'pi-chevron-up' : 'pi-chevron-down']"></i>
                </div>
              </div>
            </div>

            <!-- Produtos do vendedor (expandido) -->
            <div v-if="isVendedorExpanded(vend.email)" class="vp-produtos-lista">
              <div :class="['vp-produtos-header-row', cabecalho && cabecalho.status_cotacao === 'concluida' ? 'vp-header-sem-acoes' : '']">
                <span class="vph-col-prod">Produto</span>
                <span class="vph-col-qtd">Qtd Ofertada</span>
                <span class="vph-col-preco">Preço Unit.</span>
                <span class="vph-col-subtotal">Subtotal</span>
                <span class="vph-col-acoes" v-if="cabecalho && !estaConcluido">Ações</span>
              </div>

              <div
                v-for="(prod, pIdx) in vend.produtos"
                :key="prod.id_solicitado"
                :class="['vp-produto-row', pIdx % 2 === 0 ? 'even' : 'odd', cabecalho && cabecalho.status_cotacao === 'concluida' ? 'vp-row-sem-acoes' : '']"
              >
                <div class="vpp-col-prod">
                  <span class="vpp-nome" v-if="prod.codigo_barra_eq">{{ prod.nome_equivalente }}</span>
                  <span class="vpp-nome" v-else>{{ prod.nome }}</span>

                  <span class="vpp-code mono" v-if="prod.codigo_barra_eq">{{ prod.codigo_barra_eq }}</span>
                  <span class="vpp-code mono" v-else-if="prod.codigo_barra">{{ prod.codigo_barra }}</span>
                </div>
                <div class="vpp-col-qtd">
                  <span class="vpp-qtd-badge">{{ prod.qtd_ofertada }} {{ prod.tipo + 's' || 'un' }}</span>
                </div>
                <div class="vpp-col-preco">
                  <span class="vpp-preco" v-if="prod.preco">R$ {{ formatVal(prod.preco) }}</span>
                  <span class="vpp-preco" v-else-if="prod.codigo_barra_eq">R$ {{ formatVal(prod.segundo_preco) }}</span>
                  <span class="vpp-preco" v-else>FATURAMENTO</span>
                </div>
                <div class="vpp-col-subtotal">
                  <span class="vpp-subtotal" v-if="prod.codigo_barra_eq">R$ {{ formatVal(prod.segundo_preco * prod.qtd_ofertada) }}</span>
                  <span class="vpp-subtotal" v-else>R$ {{ formatVal(prod.preco * prod.qtd_ofertada) }}</span>
                </div>
                <div class="vpp-col-acoes">
                  <template v-if="cabecalho && !estaConcluido">
                    <button
                      class="vpp-action-btn vpp-btn-mover"
                      @click="abrirMoverProduto(prod, vend.email)"
                      title="Mover para outro vendedor"
                    >
                      <i class="pi pi-arrow-right-arrow-left"></i> Mover para outro
                    </button>
                    <button
                      class="vpp-action-btn vpp-btn-qtd"
                      @click="adicionarQtdProduto(prod, vend.email)"
                      title="Alterar quantidade"
                    >
                      <i class="pi pi-pencil"></i> Editar Produto
                    </button>
                  </template>
                </div>
              </div>

              <!-- Rodapé do vendedor com total + adicionar produto faturamento -->
              <div class="vp-rodape-vend">
                <button
                  v-if="cabecalho && !estaConcluido"
                  class="action-btn btn-outline vp-fat-btn"
                  @click="abrirFatExtraVerificar(vend.email)"
                >
                  <i class="pi pi-plus"></i> Adicionar produto de faturamento
                </button>
                <div class="vp-total-vend">
                  <span class="vp-total-label">Total do vendedor:</span>
                  <span class="vp-total-val">R$ {{ formatVal(vend.totalValor) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Total geral -->
          <div class="vp-total-geral">
            <span class="vp-tg-label">Total Geral do Pedido:</span>
            <span class="vp-tg-val">R$ {{ formatVal(itensPorVendedor.reduce((s, v) => s + v.totalValor, 0)) }}</span>
          </div>
        </div>

        <!-- Concluir cotação -->
        <div class="conclude-bar" v-if="cabecalho && cabecalho.status_cotacao === 'finalizada' && existePendente">
          <span class="conclude-hint">
            <i class="pi pi-info-circle"></i>
            {{ itens.filter(i => i.status_fechamento === 'pendente').length }} produto(s) pendente(s) de conclusão.
          </span>
          <button class="action-btn btn-success" :disabled="loadingButtonConcluir" @click="concluirCotacao">
            <i class="pi pi-flag"></i> Finalizar Cotação
          </button>
        </div>
      </div>

      <!-- ===== TAB: VENDEDORES ===== -->
      <div v-if="activeTab === 'vendedores' && auth.user.nivel != 7" class="tab-pane">
        <div v-if="loadingVendedores" class="loading-state">
          <ProgressSpinner style="width:40px;height:40px" />
        </div>
        <div v-else-if="vendedores.length === 0" class="empty-state">
          <i class="pi pi-users" style="font-size:2.5rem;opacity:.3"></i>
          <span>Nenhum vendedor encontrado.</span>
        </div>
        <div v-else class="vendedores-grid">
          <div v-for="v in vendedores" :key="v.id_vendedor" class="vendedor-card">
            <div class="vc-avatar">
              <img v-if="v.foto_perfil" :src="v.foto_perfil" :alt="v.nome" />
              <span v-else class="vc-initials">{{ initials(v.nome) }}</span>
              <span :class="['vc-status', v.status_conta]"></span>
            </div>
            <div class="vc-info">
              <span class="vc-name">{{ v.nome }}</span>
              <span class="vc-name">{{ v.nome_empresa }}</span>
              <span class="vc-user muted">CNPJ: {{ v.cnpj }}</span>
              <span class="vc-user muted">@{{ v.nome_usuario }}</span>
              <span class="vc-email muted">{{ v.email }}</span>
            </div>
            <div class="vc-stats">
              <div class="vc-stat"><b>{{ v.num_cotacoes }}</b><span>Cotações</span></div>
              <div class="vc-stat"><b>{{ v.taxa_resposta }}</b><span>Resp. Média</span></div>
              <div class="vc-stat"><b>{{ v.num_vendas }}</b><span>Vendas</span></div>
            </div>
            <button
              style="height: 40px; border: solid 1px #ff8049; background-color: #fff; color: #ff8049; font-family: 'Poppins'; border-radius: 10px; cursor: pointer;"
              @click="abrirHistoricoVendedor(v)"
            >
              Ver histórico
            </button>
          </div>
        </div>
      </div>

      <!-- ===== TAB: SUGESTÃO DE PEDIDO ===== -->
      <div v-if="activeTab === 'sugestao'" class="tab-pane">
        <div class="pane-header">
          <div class="sugestao-hint">
            <i class="pi pi-lightbulb" style="color:#FF8049"></i>
            <span>Produtos com estoque abaixo do mínimo. Adicione diretamente à cotação.</span>
          </div>
          <button class="action-btn btn-primary" v-if="sugestoesSelecionadas.length > 0" @click="adicionarSugestoes">
            <i class="pi pi-plus"></i> Adicionar {{ sugestoesSelecionadas.length }} Selecionado(s)
          </button>
        </div>

        <div v-if="loadingSugestoes" class="loading-state">
          <ProgressSpinner style="width:40px;height:40px" />
        </div>
        <div v-else-if="sugestoes.length === 0" class="empty-state">
          <i class="pi pi-check-circle" style="font-size:2.5rem;opacity:.3;color:#10b981"></i>
          <span>Estoque normalizado. Nenhuma sugestão no momento.</span>
        </div>
        <div v-else class="produtos-table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th style="width:40px">
                  <input type="checkbox" @change="toggleAllSugestoes" :checked="sugestoesSelecionadas.length === sugestoes.length" />
                </th>
                <th>Produto</th>
                <th>Estoque Atual</th>
                <th>Estoque Mínimo</th>
                <th>Sugestão Qtd</th>
                <th>Custo</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in sugestoes" :key="s.id_produto" :class="{ selected: sugestoesSelecionadas.includes(s.id_produto) }">
                <td>
                  <input type="checkbox" :value="s.id_produto" v-model="sugestoesSelecionadas" />
                </td>
                <td>
                  <div class="prod-cell">
                    <span class="prod-name">{{ s.nome }}</span>
                    <span class="mono prod-cat">{{ s.codigo_barra }}</span>
                  </div>
                </td>
                <td><span class="estoque-low">{{ s.estoque_atual }}</span></td>
                <td>{{ s.estoque_minimo }}</td>
                <td>
                  <input type="number" class="qty-input" v-model.number="s.qtd_sugerida" min="1" />
                </td>
                <td>R$ {{ formatVal(s.preco_custo) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>

    <!-- ===== MODAL: OFERTAS POR PRODUTO ===== -->
    <div class="modal-overlay" v-if="showOfertasProdutoModal && ofertasProdutoSelecionado" @click.self="showOfertasProdutoModal = false">
      <div class="modal-box ofertas-prod-modal-box">
        <div class="modal-header ofertas-prod-modal-header">
          <div class="opm-header-left">
            <div class="opm-icon"><i class="pi pi-tag"></i></div>
            <div>
              <div class="opm-title">Ofertas recebidas</div>
              <div class="opm-subtitle">{{ ofertasProdutoSelecionado.nome }}</div>
              <div class="opm-subtitle">Adicionado por (nome): {{ ofertasProdutoSelecionado.nome_usuario || "--" }}</div>
              <div class="opm-subtitle">Adicionado por (email): {{ ofertasProdutoSelecionado.email || "--" }}</div>
            </div>
          </div>
          <button class="modal-close" @click="showOfertasProdutoModal = false"><i class="pi pi-times"></i></button>
        </div>

        <div class="modal-body" style="padding:0">
          <!-- Info do produto -->
          <div class="opm-prod-info">
            <span class="opm-pi-item"><i class="pi pi-barcode"></i> {{ ofertasProdutoSelecionado.codigo_barra || 'Sem código' }}</span>
            <span class="opm-pi-item"><i class="pi pi-shopping-cart"></i> Qtd solicitada: <b>{{ ofertasProdutoSelecionado.quantidade }}</b></span>
            <span class="opm-pi-item"><i class="pi pi-dollar"></i> Último preço: <b>R$ {{ ofertasProdutoSelecionado.ultimo_preco || '—' }}</b></span>
            <span class="opm-pi-item" v-if="ofertasProdutoSelecionado.ofertas?.length > 0">
              <i class="pi pi-users"></i> <b>{{ ofertasProdutoSelecionado.ofertas.length }}</b> oferta(s)
            </span>
          </div>

          <!-- Vendedor vencendo (cotação aberta) -->
          <div
            v-if="cabecalho?.status_cotacao === 'aberta' && ofertasProdutoSelecionado.ofertas?.length > 0"
            class="opm-vencendo-banner"
          >
            <div class="opm-venc-label"><i class="pi pi-trophy"></i> Vencendo no momento</div>
            <div class="opm-venc-info" v-if="vendedorVencendo(ofertasProdutoSelecionado.ofertas)">
              <span class="opm-venc-nome">{{ vendedorVencendo(ofertasProdutoSelecionado.ofertas).nome }}</span>
              <span class="opm-venc-preco">R$ {{ formatVal(vendedorVencendo(ofertasProdutoSelecionado.ofertas).primeiro_preco) }}</span>
            </div>
          </div>

          <!-- Tabela de ofertas ordenadas -->
          <div v-if="ofertasProdutoSelecionado.ofertas?.length === 0" class="empty-state" style="padding:40px 0">
            <i class="pi pi-inbox" style="font-size:2rem;opacity:.3"></i>
            <span>Nenhuma oferta recebida ainda.</span>
          </div>

          <div v-else class="opm-table-wrap">
            <table class="data-table opm-table">
              <thead>
                <tr>
                  <th style="width:30px">#</th>
                  <th>Vendedor</th>
                  <th>Opção</th>
                  <th>Qtd</th>
                  <th>Preço Unit.</th>
                  <th>Tipo</th>
                  <th>Un/Emb.</th>
                  <th v-if="cabecalho?.status_cotacao === 'finalizada'">Ação</th>
                  <th>Cód. Barra - Prod. Equivalente</th>
                  <th>Descrição - Prod. Equivalente</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="(oferta, idx) in ofertasOrdenadas(ofertasProdutoSelecionado.ofertas)" :key="oferta.id_oferta">

                  <!-- ══════════════════════════════════════════
                      LINHA 1: Oferta principal do vendedor
                  ══════════════════════════════════════════ -->
                  <tr
                    v-if="oferta.primeiro_quantidade != null"
                    :class="['opm-row', idx === 0 ? 'opm-row-winner' : '', oferta.opcao_1 || oferta.opcao_2 ? 'opm-row-selected' : '']"
                  >
                    <!-- # -->
                    <td>
                      <span v-if="idx === 0 && cabecalho?.status_cotacao === 'aberta'" class="opm-trophy">
                        <span class="material-symbols-outlined">
                          crown
                        </span>
                      </span>
                      <span v-else class="opm-rank">{{ idx + 1 }}º</span>
                    </td>

                    <!-- Vendedor -->
                    <td>
                      <div class="opm-vendor-cell">
                        <span class="opm-vendor-avatar">{{ initials(oferta.nome) }}</span>
                        <div>
                          <span class="opm-vendor-nome">{{ oferta.nome }}</span>
                          <span class="opm-vendor-nome">{{ oferta.email_empresa }}</span>
                          <span class="opm-vendor-email">{{ oferta.email }}</span>
                        </div>
                        <span v-if="oferta.opcao_1" class="opm-chosen-tag">
                          <i class="pi pi-check"></i> Selecionado
                        </span>
                      </div>
                    </td>

                    <!-- Opção -->
                    <td>
                      <span v-if="oferta.codigo_barra" class="opm-opcao-tag">Prod. Equival.</span>
                      <span v-else>—</span>
                    </td>


                    <!-- Qtd -->
                    <td v-if="!oferta.codigo_barra">
                      <b>{{ oferta.primeiro_quantidade ?? '—' }}</b>
                    </td>
                    <td v-else>
                      <b>{{ oferta.primeiro_quantidade ?? '—' }}</b>
                    </td>

                    <!-- Preço Unit. -->
                    <td>
                      <span v-if="oferta.primeiro_preco" :class="['opm-preco', idx === 0 ? 'opm-preco-winner' : '']">
                        R$ {{ formatVal(oferta.primeiro_preco) }}
                      </span>
                      <span v-else-if="oferta.segundo_preco">
                        R$ {{ formatVal(oferta.segundo_preco) }}
                      </span>
                      <span v-else>PROD. DE FATURAMENTO</span>
                    </td>

                    <!-- Tipo -->
                    <td>{{ oferta.primeiro_tipo || '—' }}</td>

                    <!-- Un/Emb. -->
                    <td>{{ oferta.primeiro_unid_composicao ? oferta.primeiro_unid_composicao + ' un/cx' : '—' }}</td>

                    <!-- Ação -->
                    <td v-if="cabecalho?.status_cotacao === 'finalizada' && ofertasProdutoSelecionado.status_fechamento !== 'concluido' && !oferta.nome_equivalente">
                      <button v-if="!oferta.opcao_1" class="sel-btn" @click="selecionarOfertaModal(ofertasProdutoSelecionado, oferta, 1)">
                        <i class="pi pi-check"></i> Selecionar
                      </button>
                      <button v-else class="desel-btn" @click="removerOfertaModal(ofertasProdutoSelecionado, oferta, 1)">
                        <i class="pi pi-times"></i> Remover
                      </button>
                    </td>
                    <td v-if="cabecalho?.status_cotacao === 'finalizada' && ofertasProdutoSelecionado.status_fechamento !== 'concluido' && oferta.nome_equivalente">
                      <button v-if="!oferta.opcao_2" class="sel-btn" @click="selecionarOfertaModal(ofertasProdutoSelecionado, oferta, 2)">
                        <i class="pi pi-check"></i> Selecionar
                      </button>
                      <button v-else class="desel-btn" @click="removerOfertaModal(ofertasProdutoSelecionado, oferta, 2)">
                        <i class="pi pi-times"></i> Remover
                      </button>
                    </td>

                    <!-- Cód. Barra - Prod. Equivalente -->
                    <td>
                      <b v-if="oferta.codigo_barra">{{ oferta.codigo_barra }}</b>
                      <b v-else>—</b>
                    </td>

                    <td>
                      <b v-if="oferta.codigo_barra">{{ oferta.nome_equivalente }}</b>
                      <b v-else>—</b>
                    </td>

                  </tr>
                  

                </template>
              </tbody>
            </table>
          </div>
        </div>

        <div class="modal-footer" style="justify-content:flex-end;">
          <button class="action-btn btn-outline" @click="showOfertasProdutoModal = false">Fechar</button>
        </div>
      </div>
    </div>

    <!-- ===== MODAL: MOVER PRODUTO PARA OUTRO VENDEDOR ===== -->
    <div class="modal-overlay" v-if="showMoverProdutoModal && moverProdutoItem" @click.self="showMoverProdutoModal = false">
      <div class="modal-box" style="max-width:480px">
        <div class="modal-header">
          <div style="display:flex; align-items:center; gap:10px;">
            <span class="material-symbols-outlined" style="color:#FF8049; font-size:20px">swap_horiz</span>
            <span>Mover produto para outro vendedor</span>
          </div>
          <button class="modal-close" @click="showMoverProdutoModal = false"><i class="pi pi-times"></i></button>
        </div>
        <div class="modal-body">
          <!-- Info produto -->
          <div class="mover-prod-info">
            <div class="mover-prod-nome"><i class="pi pi-box" style="color:#FF8049"></i> {{ moverProdutoItem.produto.nome }}</div>
            <div class="mover-prod-detalhe">
              Atualmente com:
              <span class="mover-vend-atual">
                {{ itensPorVendedor.find(v => v.email === moverProdutoItem.vendedorEmail)?.nome || moverProdutoItem.vendedorEmail }}
              </span>
            </div>
          </div>

          <p class="modal-hint" style="margin:12px 0 8px;">Selecione o vendedor de destino:</p>

          <!-- Lista de vendedores destino (excluindo o atual) -->
          <div class="mover-vendedores-lista">
            <div
              v-for="vend in itensPorVendedor.filter(v => v.email !== moverProdutoItem.vendedorEmail)"
              :key="vend.email"
              :class="['mover-vend-item', { active: moverProdutoDestino === vend.email }]"
              @click="moverProdutoDestino = vend.email"
            >
              <div class="mv-avatar">
                <img v-if="vend.foto_perfil" :src="vend.foto_perfil" :alt="vend.nome" style="width:32px;height:32px;border-radius:8px;" />
                <span v-else class="mv-initials">{{ initials(vend.nome) }}</span>
              </div>
              <div class="mv-info">
                <span class="mv-nome">{{ vend.nome }}</span>
                <span class="mv-nome">{{ vend.nome_empresa }}</span>
                <span class="mv-nome">{{ vend.pedido_minimo }}</span>
                <span class="mv-email">{{ vend.email }}</span>
              </div>
              <div class="mv-stats">
                <span>{{ vend.produtos.length }} produtos · R$ {{ formatVal(vend.totalValor) }}</span>
              </div>
              <i v-if="moverProdutoDestino === vend.email" class="pi pi-check-circle" style="color:#FF8049; font-size:16px; flex-shrink:0"></i>
            </div>
            <div v-if="itensPorVendedor.filter(v => v.email !== moverProdutoItem.vendedorEmail).length === 0" class="muted" style="padding:16px;text-align:center;font-size:13px;">
              Nenhum outro vendedor com seleções.
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="action-btn btn-outline" @click="showMoverProdutoModal = false">Cancelar</button>
          <button class="action-btn btn-primary" :disabled="!moverProdutoDestino" @click="confirmarMoverProduto">
            <i class="pi pi-check"></i> Confirmar movimentação
          </button>
        </div>
      </div>
    </div>

    <!-- ===== MODAL: FATURAMENTO EXTRA (VERIFICAR PEDIDO) ===== -->
    <div class="modal-overlay" v-if="showFatExtraVerificar" @click.self="showFatExtraVerificar = false">
      <div class="modal-box">
        <div class="modal-header">
          <span>Adicionar Produto</span>
          <button class="modal-close" @click="fecharModalAddProduto"><i class="pi pi-times"></i></button>
        </div>
        <div class="modal-body">
          <p class="modal-hint">Busque por nome, código de barras ou descrição do produto.</p>

          <!-- Busca -->
          <div  style="margin-bottom:12px; width: 100%;">
            <span style="color: #222; position: absolute; transform: translate(10px, 8px);" class="material-symbols-outlined">
                search
            </span>
            <input
              type="text"
              v-model="searchCatalogo"
              placeholder="Nome, cód. barras, descrição..."
              @input="buscarCatalogo"
              style="width: 100%; height: 40px; border-radius: 5px; border: 1px solid #DDD; padding-left: 40px;"
            />
            <button v-if="searchCatalogo" class="sb-clear-inline" @click="searchCatalogo = ''; catalogoFiltrado = []">
              
            </button>
          </div>

          <!-- ETAPA 1: Lista de resultados -->
          <template v-if="!addProduto.id_produto">
            <!-- Loading -->
            <div v-if="loadingCatalogo" class="catalogo-loading-inline">
              <span class="loading-spinner-sm"></span>
              <span>Buscando produtos...</span>
            </div>

            <!-- Resultados paginados -->
            <div class="catalogo-list" style="overflow-y: auto;" v-else-if="catalogoFiltrado.length > 0">
              <div
                v-for="p in catalogoFiltrado"
                :key="p.id_produto"
                class="catalogo-item"
                @click="selecionarProdutoCatalogo(p)"
              >
                <div class="catalogo-item-info">
                  <span class="prod-name">{{ p.nome }}</span>
                  <span class="mono muted catalogo-barcode">{{ p.codigo_barra || 'Sem cód.' }}</span>
                </div>
                <div class="catalogo-item-right">
                  <span class="prod-price">R$ {{ formatVal(p.preco_custo) }}</span>
                  <i class="pi pi-chevron-right catalogo-arrow"></i>
                </div>
              </div>
            </div>

            <!-- Paginação -->
            <div class="catalogo-pagination" v-if="catalogoFiltrado.length > 0 && catalogoPages > 1">
              <button
                class="pag-btn"
                :disabled="catalogoPage <= 1"
                @click="mudarPaginaCatalogo(catalogoPage - 1)"
              >
                <span style="color: #222;" class="material-symbols-outlined">
                  arrow_back_ios
                </span>
              </button>
              <span class="pag-info">{{ catalogoPage }} / {{ catalogoPages }}</span>
              <button
                class="pag-btn"
                :disabled="catalogoPage >= catalogoPages"
                @click="mudarPaginaCatalogo(catalogoPage + 1)"
              >
                <span style="color: #222;" class="material-symbols-outlined">
                  arrow_forward_ios
                </span>
              </button>
            </div>

            <!-- Sem resultados -->
            <div
              v-else-if="!loadingCatalogo && searchCatalogo.length >= 2"
              class="muted"
              style="padding:16px 0;text-align:center;font-size:13px"
            >
              Nenhum produto encontrado.
            </div>
          </template>

          <!-- ETAPA 2: Produto selecionado — card de detalhe + campos -->
          <div v-if="addProduto.id_produto">

            <!-- Card do produto selecionado -->
            <div class="selected-prod-detail">
              <div class="selected-prod-detail-top">
                <span class="material-symbols-outlined spd-icon">inventory_2</span>
                <div class="spd-info">
                  <span class="spd-name">{{ addProduto.nome }}</span>
                  <span class="spd-barcode mono muted">{{ addProduto.codigo_barra || 'Sem código' }}</span>
                </div>
              </div>
              <div class="spd-prices" v-if="addProduto.preco_custo != null || addProduto.preco_venda != null">
                <div class="spd-price-item" v-if="addProduto.preco_custo != null">
                  <span class="spd-price-label">Custo</span>
                  <span class="spd-price-val">R$ {{ formatVal(addProduto.preco_custo) }}</span>
                </div>
                <div class="spd-price-item" v-if="addProduto.margem != null">
                  <span class="spd-price-label">Margem</span>
                  <span :class="['spd-price-val', addProduto.margem > 0 ? 'pos' : 'neg']">{{ addProduto.margem }}%</span>
                </div>
                <div class="spd-price-item" v-if="addProduto.preco_venda != null">
                  <span class="spd-price-label">Venda</span>
                  <span class="spd-price-val">R$ {{ formatVal(addProduto.preco_venda) }}</span>
                </div>
              </div>
              <button class="trocar-prod-btn" @click="voltarParaListaCatalogo">
                <i class="pi pi-arrow-left"></i> Trocar produto
              </button>
            </div>

            <!-- Campos de quantidade / tipo / composição -->
            <div class="form-row" style="margin-top:4px">
              <div class="form-group">
                <label>Quantidade *</label>
                <input type="number" v-model.number="addProduto.quantidade" min="1" class="form-input" />
              </div>
              <div class="form-group">
                <label>Tipo</label>
                <select v-model="addProduto.tipo" class="form-input">
                  
                  <option value="unidade">Unidade</option>
                  <option value="caixa">Caixa</option>
                  <option value="fardo">Fardo</option>
                </select>
              </div>
              <div class="form-group">
                <label>Qtd por embalagem</label>
                <input type="number" v-model.number="addProduto.qtd_unitaria_composicao" min="1" class="form-input" />
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="action-btn btn-outline" @click="fecharModalAddProduto">Cancelar</button>
          <button
            class="action-btn btn-primary"
            :disabled="!addProduto.id_produto || !addProduto.quantidade || loadingAdd"
            @click="confirmarFatExtraVerificar()"
          >
            <i class="pi pi-plus"></i> Adicionar
          </button>
        </div>
      </div>
    </div>

    <!-- ===== MODAL: EDITAR PRODUTO ===== -->
    <div class="modal-overlay" v-if="showEditModal" @click.self="showEditModal = false">
      <div class="modal-box">
        <div class="modal-header">
          <span>Editar Produto</span>
          <button class="modal-close" @click="showEditModal = false"><i class="pi pi-times"></i></button>
        </div>
        <div class="modal-body" v-if="editTarget">
          <p class="modal-prod-name">{{ editTarget.nome }}</p>
          <div class="form-row">
            <div class="form-group">
              <label>Quantidade</label>
              <input type="number" v-model.number="editTarget.quantidade" min="1" class="form-input" />
            </div>
            <div class="form-group">
              <label>Tipo</label>
              <select v-model="editTarget.tipo" class="form-input">
                
                <option value="unidade">Unidade</option>
                <option value="caixa">Caixa</option>
                <option value="fardo">Fardo</option>
              </select>
            </div>
            <div class="form-group">
              <label>Qtd por embalagem</label>
              <input type="number" v-model.number="editTarget.qtd_unitaria_composicao" min="1" class="form-input" placeholder="Ex: 12" />
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="action-btn btn-outline" @click="showEditModal = false">Cancelar</button>
          <button class="action-btn btn-primary" :disabled="loadingEdit" @click="salvarEdicao">
            <i class="pi pi-save"></i> Salvar
          </button>
        </div>
      </div>
    </div>

    <!-- ===== MODAL: ADD PRODUTO ===== -->
    <div class="modal-overlay" v-if="showAddProdutoModal" @click.self="fecharModalAddProduto">
      <div class="modal-box">
        <div class="modal-header">
          <span>Adicionar Produto</span>
          <button class="modal-close" @click="fecharModalAddProduto"><i class="pi pi-times"></i></button>
        </div>
        <div class="modal-body">
          <p class="modal-hint">Busque por nome, código de barras ou descrição do produto.</p>

          <!-- Busca -->
          <div  style="margin-bottom:12px; width: 100%;">
            <span style="color: #222; position: absolute; transform: translate(10px, 8px);" class="material-symbols-outlined">
                search
            </span>
            <input
              type="text"
              v-model="searchCatalogo"
              placeholder="Nome, cód. barras, descrição..."
              @input="buscarCatalogo"
              style="width: 100%; height: 40px; border-radius: 5px; border: 1px solid #DDD; padding-left: 40px;"
            />
            <button v-if="searchCatalogo" class="sb-clear-inline" @click="searchCatalogo = ''; catalogoFiltrado = []">
              
            </button>
          </div>

          <!-- ETAPA 1: Lista de resultados -->
          <template v-if="!addProduto.id_produto">
            <!-- Loading -->
            <div v-if="loadingCatalogo" class="catalogo-loading-inline">
              <span class="loading-spinner-sm"></span>
              <span>Buscando produtos...</span>
            </div>

            <!-- Resultados paginados -->
            <div class="catalogo-list" style="overflow-y: auto;" v-else-if="catalogoFiltrado.length > 0">
              <div
                v-for="p in catalogoFiltrado"
                :key="p.id_produto"
                class="catalogo-item"
                @click="selecionarProdutoCatalogo(p)"
              >
                <div class="catalogo-item-info">
                  <span class="prod-name">{{ p.nome }}</span>
                  <span class="mono muted catalogo-barcode">{{ p.codigo_barra || 'Sem cód.' }}</span>
                </div>
                <div class="catalogo-item-right">
                  <span class="prod-price">R$ {{ formatVal(p.preco_custo) }}</span>
                  <i class="pi pi-chevron-right catalogo-arrow"></i>
                </div>
              </div>
            </div>

            <!-- Paginação -->
            <div class="catalogo-pagination" v-if="catalogoFiltrado.length > 0 && catalogoPages > 1">
              <button
                class="pag-btn"
                :disabled="catalogoPage <= 1"
                @click="mudarPaginaCatalogo(catalogoPage - 1)"
              >
                <span style="color: #222;" class="material-symbols-outlined">
                  arrow_back_ios
                </span>
              </button>
              <span class="pag-info">{{ catalogoPage }} / {{ catalogoPages }}</span>
              <button
                class="pag-btn"
                :disabled="catalogoPage >= catalogoPages"
                @click="mudarPaginaCatalogo(catalogoPage + 1)"
              >
                <span style="color: #222;" class="material-symbols-outlined">
                  arrow_forward_ios
                </span>
              </button>
            </div>

            <!-- Sem resultados -->
            <div
              v-else-if="!loadingCatalogo && searchCatalogo.length >= 2"
              class="muted"
              style="padding:16px 0;text-align:center;font-size:13px"
            >
              Nenhum produto encontrado.
            </div>
          </template>

          <!-- ETAPA 2: Produto selecionado — card de detalhe + campos -->
          <div v-if="addProduto.id_produto">

            <!-- Card do produto selecionado -->
            <div class="selected-prod-detail">
              <div class="selected-prod-detail-top">
                <span class="material-symbols-outlined spd-icon">inventory_2</span>
                <div class="spd-info">
                  <span class="spd-name">{{ addProduto.nome }}</span>
                  <span class="spd-barcode mono muted">{{ addProduto.codigo_barra || 'Sem código' }}</span>
                </div>
              </div>
              <div class="spd-prices" v-if="addProduto.preco_custo != null || addProduto.preco_venda != null">
                <div class="spd-price-item" v-if="addProduto.preco_custo != null">
                  <span class="spd-price-label">Custo</span>
                  <span class="spd-price-val">R$ {{ formatVal(addProduto.preco_custo) }}</span>
                </div>
                <div class="spd-price-item" v-if="addProduto.margem != null">
                  <span class="spd-price-label">Margem</span>
                  <span :class="['spd-price-val', addProduto.margem > 0 ? 'pos' : 'neg']">{{ addProduto.margem }}%</span>
                </div>
                <div class="spd-price-item" v-if="addProduto.preco_venda != null">
                  <span class="spd-price-label">Venda</span>
                  <span class="spd-price-val">R$ {{ formatVal(addProduto.preco_venda) }}</span>
                </div>
              </div>
              <button class="trocar-prod-btn" @click="voltarParaListaCatalogo">
                <i class="pi pi-arrow-left"></i> Trocar produto
              </button>
            </div>

            <!-- Campos de quantidade / tipo / composição -->
            <div class="form-row" style="margin-top:4px">
              <div class="form-group">
                <label>Quantidade *</label>
                <input type="number" v-model.number="addProduto.quantidade" min="1" class="form-input" />
              </div>
              <div class="form-group">
                <label>Tipo</label>
                <select v-model="addProduto.tipo" class="form-input">
                  
                  <option value="unidade">Unidade</option>
                  <option value="caixa">Caixa</option>
                  <option value="fardo">Fardo</option>
                </select>
              </div>
              <div class="form-group">
                <label>Qtd por embalagem</label>
                <input type="number" v-model.number="addProduto.qtd_unitaria_composicao" min="1" class="form-input" />
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="action-btn btn-outline" @click="fecharModalAddProduto">Cancelar</button>
          <button
            class="action-btn btn-primary"
            :disabled="!addProduto.id_produto || !addProduto.quantidade || loadingAdd"
            @click="adicionarProduto()"
          >
            <i class="pi pi-plus"></i> Adicionar
          </button>
        </div>
      </div>
    </div>

    <!-- ===== MODAL: ADD PRODUTO INEXISTENTE ===== -->
    <div class="modal-overlay" v-if="showAddProdutoModalInexistente" @click.self="showAddProdutoModalInexistente = false">
      <div class="modal-box">
        <div class="modal-header">
          <span>Adicionar Produto - Novos produtos não cadastrados</span>
          <button class="modal-close" @click="showAddProdutoModalInexistente = false"><i class="pi pi-times"></i></button>
        </div>
        <div class="modal-body">
          <p class="modal-hint">Utilize esta seção para adicionar produtos à cotação que ainda não estão cadastrados no sistema, como lançamentos, novos itens no mercado ou produtos ainda não identificados na base de dados.</p>

          <div class="form-row" style="margin-top:16px">
            <div class="form-group">
              <label>Nome *</label>
              <input type="text" v-model.number="addProdutoInexistente.nome" min="1" class="form-input" />
            </div>
            <div class="form-group">
              <label>Quantidade *</label>
              <input type="number" v-model.number="addProdutoInexistente.quantidade" min="1" class="form-input" />
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="action-btn btn-outline" @click="showAddProdutoModalInexistente = false">Cancelar</button>
          <button class="action-btn btn-primary" :disabled="!addProdutoInexistente.nome || !addProdutoInexistente.quantidade || loadingAdd" @click="adicionarProdutoInexistente()">
            <i class="pi pi-plus"></i> Adicionar
          </button>
        </div>
      </div>
    </div>

    <!-- ===== MODAL: PERÍODO ===== -->
    <div class="modal-overlay" v-if="showPeriodoModal" @click.self="showPeriodoModal = false">
      <div class="modal-box" style="max-width:460px">
        <div class="modal-header">
          <span>Ajustar Período</span>
          <button class="modal-close" @click="showPeriodoModal = false"><i class="pi pi-times"></i></button>
        </div>
        <div class="modal-body">
          <p class="modal-hint" style="margin-bottom:14px">
            <i class="pi pi-info-circle" style="color:#FF8049"></i>
            Defina a data e hora de início e término da cotação.
          </p>
          <div class="form-row">
            <div class="form-group">
              <label>Data e Hora de Início</label>
              <BrDateTimePicker
                v-model="periodoEdit.inicio"
                placeholder="Início da cotação"
              />
            </div>
            <div class="form-group">
              <label>Data e Hora de Término</label>
              <BrDateTimePicker
                v-model="periodoEdit.final"
                placeholder="Início da cotação"
              />
            </div>
          </div>
          <!-- Preview formatado -->
          <div v-if="periodoEdit.inicio && periodoEdit.final" style="margin-top:12px;padding:10px 14px;background:rgba(255,128,73,0.06);border:1.5px solid rgba(255,128,73,0.2);border-radius:10px;font-size:12px;color:#555;display:flex;align-items:center;gap:8px;">
            <i class="pi pi-calendar" style="color:#FF8049"></i>
            <span>
              <b>{{ formatarDataHora(periodoEdit.inicio) }}</b>
              <span style="margin:0 6px;opacity:.5">→</span>
              <b>{{ formatarDataHora(periodoEdit.final) }}</b>
            </span>
          </div>
        </div>
        <div class="modal-footer">
          <button class="action-btn btn-outline" @click="showPeriodoModal = false">Cancelar</button>
          <button class="action-btn btn-primary" @click="salvarPeriodo">
            <i class="pi pi-save"></i> Salvar
          </button>
        </div>
      </div>
    </div>

    <!-- ===== MODAL: FATURAMENTO EXTRA ===== -->
    <div class="modal-overlay" v-if="showFatExtra" @click.self="showFatExtra = false">
      <div class="modal-box">
        <div class="modal-header">
          <span>Produto Extra para Faturar</span>
          <button class="modal-close" @click="showFatExtra = false"><i class="pi pi-times"></i></button>
        </div>
        <div class="modal-body">
          <p class="modal-hint">Selecione o vendedor e configure o produto adicional para faturamento.</p>
          <div class="form-group" style="margin-bottom:12px">
            <label>Vendedor</label>
            <select v-model="fatExtra.id_vendedor" class="form-input">
              <option value="" disabled>Selecionar vendedor...</option>
              <option v-for="v in vendedores" :key="v.id_vendedor" :value="v.id_vendedor">{{ v.nome }}</option>
            </select>
          </div>
          <div class="search-wrap" style="margin-bottom:12px">
            <i class="pi pi-search"></i>
            <input type="text" v-model="fatExtra.searchProd" placeholder="Buscar produto..." @input="buscarCatalogoExtra" />
          </div>
          <div class="catalogo-list" style="max-height:150px">
            <div
              v-for="p in catalogoExtra"
              :key="p.id_produto"
              :class="['catalogo-item', { selected: fatExtra.id_produto === p.id_produto }]"
              @click="fatExtra.id_produto = p.id_produto; fatExtra.nome = p.nome"
            >
              <span class="prod-name">{{ p.nome }}</span>
              <span class="mono muted"> · {{ p.codigo_barra }}</span>
            </div>
          </div>
          <div class="form-row" style="margin-top:12px" v-if="fatExtra.id_produto">
            <div class="form-group">
              <label>Quantidade</label>
              <input type="number" v-model.number="fatExtra.quantidade" min="1" class="form-input" />
            </div>
            <!--Adicionar unidade tipo-->
            <div class="form-group">
              <label>Preço Unitário</label>
              <input type="number" v-model.number="fatExtra.preco" step="0.01" min="0" class="form-input" />
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="action-btn btn-outline" @click="showFatExtra = false">Cancelar</button>
          <button class="action-btn btn-primary" :disabled="!fatExtra.id_vendedor || !fatExtra.id_produto" @click="confirmarFatExtra">
            <i class="pi pi-check"></i> Confirmar
          </button>
        </div>
      </div>
    </div>

    <!-- ===== MODAL: EDITAR PRODUTO (VERIFICAR PEDIDO) ===== -->
    <div class="modal-overlay" v-if="showEditarProdutoVerificar" @click.self="showEditarProdutoVerificar = false">
      <div class="modal-box" style="max-width:440px">
        <div class="modal-header">
          <span>Editar Produto</span>
          <button class="modal-close" @click="showEditarProdutoVerificar = false"><i class="pi pi-times"></i></button>
        </div>
        <div class="modal-body" v-if="editarProdutoVerificar">
          <!-- Info do produto -->
          <div class="mover-prod-info" style="margin-bottom:16px">
            <div class="mover-prod-nome">
              <span class="material-symbols-outlined" style="font-size:16px;color:#FF8049">inventory_2</span>
              {{ editarProdutoVerificar.produto.nome }}
            </div>
            <div class="mover-prod-detalhe" v-if="editarProdutoVerificar.produto.codigo_barra">
              Cód. barras: <span class="mono">{{ editarProdutoVerificar.produto.codigo_barra }}</span>
            </div>
            <div class="mover-prod-detalhe" style="margin-top:4px">
              Preço unit.: <b style="color:#10b981">R$ {{ formatVal(editarProdutoVerificar.produto.preco) }}</b>
              &nbsp;·&nbsp; Tipo: <b>{{ editarProdutoVerificar.produto.tipo || 'un' }}</b>
            </div>
          </div>

          <!-- Input quantidade -->
          <div class="form-group">
            <label style="font-size:13px;font-weight:700;color:#1a1a1a;display:block;margin-bottom:6px">
              Quantidade <span style="color:#FF8049">*</span>
            </label>
            <input
              type="number"
              v-model.number="editarProdutoVerificarQtd"
              min="1"
              class="form-input"
              style="font-size:16px;font-weight:700;text-align:center"
              placeholder="Ex: 10"
            />
            <span style="font-size:11px;color:#888;display:block;margin-top:4px">
              Quantidade atual: <b>{{ editarProdutoVerificar.produto.qtd_ofertada }} {{ editarProdutoVerificar.produto.tipo || 'un' }}</b>
            </span>
          </div>

          <!-- Subtotal estimado -->
          <div v-if="editarProdutoVerificarQtd > 0" style="margin-top:12px;padding:10px 14px;background:rgba(16,185,129,0.06);border:1.5px solid rgba(16,185,129,0.2);border-radius:10px;display:flex;align-items:center;justify-content:space-between">
            <span style="font-size:12px;font-weight:600;color:#555">Subtotal estimado:</span>
            <span style="font-size:16px;font-weight:800;color:#10b981">
              R$ {{ formatVal(editarProdutoVerificar.produto.preco * editarProdutoVerificarQtd) }}
            </span>
          </div>
        </div>
        <div class="modal-footer">
          <button class="action-btn btn-outline" @click="showEditarProdutoVerificar = false">Cancelar</button>
          <button
            class="action-btn btn-primary"
            :disabled="!editarProdutoVerificarQtd || editarProdutoVerificarQtd <= 0 || loadingEditarProdutoVerificar"
            @click="confirmarEditarProdutoVerificar(editarProdutoVerificar.produto.tipo)"
          >
            <i class="pi pi-save"></i> Salvar
          </button>
        </div>
      </div>
    </div>

    <!-- ===== MODAL: EXPORTAR ===== -->
    <div class="modal-overlay export-overlay" v-if="showExportModal" @click.self="showExportModal = false">
      <div class="modal-box export-modal-box">
        <div class="export-modal-header">
          <div class="export-header-left">
            <div class="export-brand-dot"></div>
            <div>
              <div class="export-modal-title">Central de Exportação</div>
              <div class="export-modal-sub">Market Vizium · Relatórios Excel</div>
            </div>
          </div>
          <button class="modal-close" style="color: #222" @click="showExportModal = false">
            <span class="material-symbols-outlined">
              close
            </span>
          </button>
        </div>

        <!-- Info da cotação no topo do modal -->
        <div class="export-cotacao-info" v-if="cabecalho">
          <div class="eci-item">
            <span class="eci-label">Cotação</span>
            <span class="eci-value">{{ cabecalho.nome_cotacao || '—' }}</span>
          </div>
          <div class="eci-divider"></div>
          <div class="eci-item">
            <span class="eci-label">ID</span>
            <span class="eci-value mono">#{{ cabecalho.id_cotacao }}</span>
          </div>
          <div class="eci-divider"></div>
          <div class="eci-item">
            <span class="eci-label">Status</span>
            <div :class="['status-pill', 'status-' + cabecalho.status_cotacao]" style="font-size:10px">
              <span class="status-dot"></span>{{ statusLabel(cabecalho.status_cotacao) }}
            </div>
          </div>
          <div class="eci-divider"></div>
          <div class="eci-item">
            <span class="eci-label">Período</span>
            <span class="eci-value">{{ formatarData(cabecalho.inicio_cotacao) }} → {{ formatarData(cabecalho.final_cotacao) }}</span>
          </div>
        </div>

        <div class="export-modal-body">

          <!-- SEÇÃO: PRODUTOS -->
          <div class="export-section">
            <div class="export-section-title">
              <div class="est-icon est-icon-prod"><span class="material-symbols-outlined">
              package_2
              </span></div>
              <div>
                <div class="est-name">Produtos da Cotação</div>
                <div class="est-desc">Lista completa de todos os produtos adicionados</div>
              </div>
              <span class="est-badge">{{ itens.length }} itens</span>
            </div>
            <div class="export-card-actions">
              <button class="export-btn" @click="exportarProdutos" :disabled="itens.length === 0">
                <span class="material-symbols-outlined">
                download_2
                </span>
                <span>Exportar Produtos</span>
                <span class="export-btn-sub">.xlsx</span>
              </button>
            </div>
          </div>

          <!-- SEÇÃO: OFERTAS -->
          <div class="export-section">
            <div class="export-section-title">
              <div class="est-icon est-icon-offer"><span class="material-symbols-outlined">
              inbox_text_person
              </span></div>
              <div>
                <div class="est-name">Ofertas de Vendedores</div>
                <div class="est-desc">Todas as ofertas recebidas com dados do produto e vendedor</div>
              </div>
              <span class="est-badge">{{ totalOfertas }} ofertas</span>
            </div>
            <div class="export-card-actions">
              <button class="export-btn" @click="exportarOfertas" :disabled="totalOfertas === 0">
                <span class="material-symbols-outlined">
                  download_2
                </span>
                <span>Exportar Todas as Ofertas</span>
                <span class="export-btn-sub">.xlsx</span>
              </button>
            </div>
          </div>

          <!-- SEÇÃO: POR VENDEDOR -->
          <div class="export-section">
            <div class="export-section-title">
              <div class="est-icon est-icon-vendor"><span class="material-symbols-outlined">
              group
              </span></div>
              <div>
                <div class="est-name">Exportação Individual por Vendedor</div>
                <div class="est-desc">Selecione um vendedor para exportar somente suas ofertas</div>
              </div>
            </div>
            <div class="export-vendor-select-wrap">
              <div class="export-vendor-grid">
                <div
                  v-for="v in vendedoresComOfertas"
                  :key="v.email"
                  :class="['export-vendor-chip', { active: exportVendedorEmail === v.email }]"
                  @click="exportVendedorEmail = v.email"
                >
                  <span class="evc-initials" v-if="!v.foto_perfil">{{ initials(v.nome) }}</span>
                  <img v-else :src="v.foto_perfil" style="width: 32px; height: 32px; border-radius: 8px;" alt="">
                  <div class="evc-info">
                    <span class="evc-name" >{{ v.nome }}</span>
                    <span class="evc-email">{{ v.email }}</span>
                  </div>
                  <span class="evc-count">{{ v.totalOfertas }}</span>
                </div>
              </div>
              <div v-if="vendedoresComOfertas.length === 0" class="export-empty-hint">
                <i class="pi pi-info-circle"></i> Nenhuma oferta disponível ainda.
              </div>
            </div>
            <div class="export-card-actions" style="margin-top:12px">
              <button class="export-btn export-btn-vendor" @click="exportarPorVendedor" :disabled="!exportVendedorEmail">
                <span class="material-symbols-outlined">
                download_2
                </span>
                <span>Exportar Ofertas do Vendedor Selecionado</span>
                <span class="export-btn-sub">.xlsx</span>
              </button>
            </div>
          </div>

          <!-- SEÇÃO: CONCLUSÃO -->
          <div class="export-section export-section-conclusion" v-if="cabecalho && (cabecalho.status_cotacao === 'concluida' || cabecalho.status_cotacao === 'finalizada')">
            <div class="export-section-title">
              <div class="est-icon est-icon-concl"><span class="material-symbols-outlined">
              article
              </span></div>
              <div>
                <div class="est-name">Relatório de Conclusão</div>
                <div class="est-desc">Resumo completo: total, itens, seleções por vendedor</div>
              </div>
              <span class="est-badge est-badge-gold">Completo</span>
            </div>
            <div class="export-card-actions conclusion-actions">
              <button class="export-btn export-btn-concl" @click="exportarConclusao">
                <span class="material-symbols-outlined">
                download_2
                </span>
                <span>Relatório Geral de Conclusão</span>
                <span class="export-btn-sub">.xlsx</span>
              </button>
              <button class="export-btn export-btn-vendor" @click="exportarConclusaoPorVendedor" :disabled="!exportVendedorEmail">
                <span class="material-symbols-outlined">
                download_2
                </span>
                <span>Conclusão do Vendedor Selecionado</span>
                <span class="export-btn-sub">.xlsx</span>
              </button>
            </div>
            <div v-if="!exportVendedorEmail" class="export-hint-note">
              <i class="pi pi-arrow-up"></i> Selecione um vendedor acima para exportar conclusão individual
            </div>
          </div>

        </div>

        <div class="export-modal-footer">
          <span class="export-footer-brand">Market Vizium · Powered by Excel</span>
          <button class="action-btn btn-outline" @click="showExportModal = false">Fechar</button>
        </div>
      </div>
    </div>

    <!-- TOAST SIMPLES -->
    <div class="toast-container">
      <transition-group name="toast">
        <div v-for="t in toasts" :key="t.id" :class="['toast-item', t.type]">
          <i :class="t.type === 'success' ? 'pi pi-check-circle' : 'pi pi-times-circle'"></i>
          {{ t.msg }}
        </div>
      </transition-group>
    </div>

    <!-- ===== MODAL: HISTÓRICO PRODUTO / VENDEDOR ===== -->
    <div class="modal-overlay" v-if="showHistoricoModal" @click.self="fecharHistoricoModal">
      <div class="modal-box" style="max-width:720px;">
        <div class="modal-header">
          <span>
            <i class="pi pi-history" style="color:#FF8049;margin-right:6px"></i>
            Histórico de {{ historicoTipo === 'produto' ? 'Compras do Produto' : 'Cotações do Vendedor' }}
          </span>
          <button class="modal-close" @click="fecharHistoricoModal"><span class="material-symbols-outlined">
            close
          </span></button>
        </div>

        <div class="modal-body" >
          <!-- Identificação do contexto -->
          <div class="hist-context-card">
            <i :class="['pi', historicoTipo === 'produto' ? 'pi-box' : 'pi-user']" style="color:#FF8049;font-size:18px"></i>
            <span class="hist-context-nome">{{ historicoContexto?.nome }}</span>
          </div>

          <!-- Seletor de período (máx 30 dias) -->
          <div class="form-row" style="margin-top:14px">
            <div class="form-group">
              <label>Data Início</label>
              <BrDateTimePicker
                :modelValue="historicoPeriodo.inicio"
                @update:modelValue="ajustarPeriodoHistoricoInicio"
                placeholder="Início da cotação"
              />
            </div>
            <div class="form-group">
              <label>Data Fim</label>
              <BrDateTimePicker
                :modelValue="historicoPeriodo.final"
                @update:modelValue="ajustarPeriodoHistoricoFinal"
                placeholder="Início da cotação"
              />
            </div>
          </div>

          <p class="modal-hint" style="margin-top:8px">
            <i class="pi pi-info-circle" style="color:#FF8049"></i>
            Intervalo máximo de 30 dias. Ao alterar uma data, a outra é ajustada automaticamente caso exceda o limite.
          </p>

          <div style="display:flex;justify-content:flex-end;margin-top:8px">
            <button class="action-btn btn-primary" :disabled="historicoLoading" @click="consultarHistorico">
              <i class="pi pi-search"></i> Consultar
            </button>
          </div>

          <!-- Loading -->
          <div v-if="historicoLoading" class="loading-state" style="margin-top:20px">
            <ProgressSpinner style="width:36px;height:36px" />
            <span>Consultando histórico...</span>
          </div>

          <!-- Métricas do vendedor -->
          <div v-if="!historicoLoading && historicoTipo === 'vendedor' && historicoMetricas" class="hist-metricas-row">
            <div class="hist-metrica">
              <span class="hist-metrica-label">Cotações no período</span>
              <span class="hist-metrica-valor">{{ historicoMetricas.total_cotacoes }}</span>
            </div>
            <div class="hist-metrica">
              <span class="hist-metrica-label">Itens ganhos</span>
              <span class="hist-metrica-valor">{{ historicoMetricas.total_itens_ganhos }}</span>
            </div>
            <div class="hist-metrica">
              <span class="hist-metrica-label">Valor total recebido</span>
              <span class="hist-metrica-valor green">R$ {{ formatVal(historicoMetricas.valor_total_no_periodo) }}</span>
            </div>
          </div>

          <!-- Vazio -->
          <div v-if="!historicoLoading && historicoCotacoes.length === 0" class="empty-state" style="margin-top:16px">
            <i class="pi pi-inbox" style="font-size:2.2rem;opacity:.3"></i>
            <span>Nenhum resultado encontrado para o período selecionado.</span>
          </div>

          <!-- Lista de cotações -->
          <div v-else-if="!historicoLoading" class="hist-cotacoes-lista">
            <div v-for="cot in historicoCotacoes" :key="cot.id_cotacao" class="hist-cotacao-card">
              <div class="hist-cotacao-header" @click="toggleDetalheHistorico(cot)">
                <div class="hist-cotacao-left">
                  <span class="hist-cotacao-nome">{{ cot.nome_cotacao }}</span>
                  <span :class="['status-pill', 'status-' + cot.status_cotacao]" style="margin-left:8px">
                    <span class="status-dot"></span>{{ statusLabel(cot.status_cotacao) }}
                  </span>
                </div>
                <div class="hist-cotacao-right">
                  <span class="hist-cotacao-data">
                    {{ formatarData(cot.inicio_cotacao) }} → {{ formatarData(cot.final_cotacao) }}
                  </span>
                  <span v-if="historicoTipo === 'produto'" class="hist-cotacao-preco">
                    R$ {{ formatVal(cot.menor_preco_aceito) }}
                  </span>
                  <span v-else class="hist-cotacao-preco green">
                    R$ {{ formatVal(cot.valor_total_recebido) }}
                  </span>
                  <i :class="['pi', historicoDetalheAberto === cot.id_cotacao ? 'pi-chevron-up' : 'pi-chevron-down']"></i>
                </div>
              </div>

              <!-- Sub-info de contexto (produto/vendedor retornado) -->
              <div v-if="historicoTipo === 'produto' && cot.vendedor" class="hist-cotacao-sub">
                <i class="pi pi-truck" style="color:#94a3b8"></i>
                Vendido por <b>{{ cot.vendedor.nome }}</b> · {{ cot.vendedor.cidade }}/{{ cot.vendedor.estado }}
              </div>
              <div v-if="historicoTipo === 'vendedor'" class="hist-cotacao-sub">
                <i class="pi pi-box" style="color:#94a3b8"></i>
                {{ cot.total_itens_ganhos }} item(ns) ganho(s) nesta cotação
              </div>

              <!-- Detalhe expandido (drill-down) -->
              <div v-if="historicoDetalheAberto === cot.id_cotacao" class="hist-detalhe">
                <div v-if="cot._detalheLoading" class="loading-state" style="padding:12px">
                  <ProgressSpinner style="width:26px;height:26px" />
                </div>
                <div v-else-if="!cot._detalhe || cot._detalhe.length === 0" class="empty-state" style="padding:12px">
                  <span style="font-size:12px">Nenhum item encontrado.</span>
                </div>
                <table v-else class="data-table" style="font-size:12px">
                  <thead>
                    <tr>
                      <th v-if="historicoTipo === 'vendedor'">Produto</th>
                      <th v-else>Vendedor</th>
                      <th>Qtd Solicitada</th>
                      <th>Opções Aceitas</th>
                      <th>Menor Preço</th>
                      <th v-if="historicoTipo === 'vendedor'">Total Item</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(it, idx) in cot._detalhe" :key="idx">
                      <td v-if="historicoTipo === 'vendedor'">
                        <div class="prod-cell">
                          <span class="prod-name">{{ it.produto?.nome }}</span>
                          <span class="mono prod-cat">{{ it.produto?.codigo_barra }}</span>
                        </div>
                      </td>
                      <td v-else>
                        <div class="prod-cell">
                          <span class="prod-name">{{ it.vendedor?.nome }}</span>
                          <span class="mono prod-cat">{{ it.vendedor?.cidade }}/{{ it.vendedor?.estado }}</span>
                        </div>
                      </td>
                      <td>{{ it.qtd_solicitada }} {{ it.tipo_solicitado }}</td>
                      <td>
                        <div v-for="(op, oi) in it.opcoes_aceitas" :key="oi" style="white-space:nowrap">
                          {{ op.tipo }} · {{ op.quantidade }}x R$ {{ formatVal(op.preco_unitario) }}
                        </div>
                      </td>
                      <td>R$ {{ formatVal(it.menor_preco_aceito) }}</td>
                      <td v-if="historicoTipo === 'vendedor'">R$ {{ formatVal(it.valor_total_item) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="action-btn btn-outline" @click="fecharHistoricoModal">Fechar</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { api } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import exibeErro from '@/utils/ExibeErro';
import ProgressSpinner from 'primevue/progressspinner'
import * as XLSX from 'xlsx'
import Calendar from 'primevue/calendar'
import BrDateTimePicker from '@/components/brDateTimePicker.vue';


// ─── Helpers de estilo Excel ────────────────────────────────────────────────
const BRAND = 'FF8049'
const BRAND_LIGHT = 'FFE8DF'
const DARK = '1A1A1A'
const GRAY = 'F5F5F5'
const WHITE = 'FFFFFF'
const GREEN = '10B981'
const PURPLE = '6366F1'

function cellStyle(opts = {}) {
  return {
    font: { name: 'Calibri', sz: opts.sz || 11, bold: !!opts.bold, color: { rgb: opts.color || DARK } },
    fill: opts.bg ? { fgColor: { rgb: opts.bg } } : undefined,
    alignment: { horizontal: opts.align || 'left', vertical: 'center', wrapText: !!opts.wrap },
    border: opts.border ? {
      top: { style: 'thin', color: { rgb: 'E0E0E0' } },
      bottom: { style: 'thin', color: { rgb: 'E0E0E0' } },
      left: { style: 'thin', color: { rgb: 'E0E0E0' } },
      right: { style: 'thin', color: { rgb: 'E0E0E0' } },
    } : undefined,
  }
}

function applyStyle(ws, ref, style) {
  if (!ws[ref]) ws[ref] = { v: '', t: 's' }
  ws[ref].s = style
}

function setCellVal(ws, ref, val, style) {
  const t = typeof val === 'number' ? 'n' : 's'
  ws[ref] = { v: val ?? '', t, s: style }
}

function colLetter(n) {
  let s = ''
  while (n > 0) {
    n--
    s = String.fromCharCode(65 + (n % 26)) + s
    n = Math.floor(n / 26)
  }
  return s
}

// Cria bloco cabeçalho da cotação a partir da linha startRow
function injetarCabecalhoCotacao(ws, cabecalho, startRow, totalCols) {
  // Linha de título: Market Vizium
  const titleRef = `A${startRow}`
  setCellVal(ws, titleRef, '⚡ MARKET VIZIUM — RELATÓRIO DE COTAÇÃO', cellStyle({ sz: 14, bold: true, color: WHITE, bg: BRAND, align: 'center' }))
  ws['!merges'] = ws['!merges'] || []
  ws['!merges'].push({ s: { r: startRow - 1, c: 0 }, e: { r: startRow - 1, c: totalCols - 1 } })

  // Linha info cotação
  const infoRow = startRow + 1
  const fields = [
    ['Cotação', cabecalho?.nome_cotacao || '—'],
    ['ID', `#${cabecalho?.id_cotacao || '—'}`],
    ['Status', cabecalho?.status_cotacao || '—'],
    ['Início', cabecalho?.inicio_cotacao ? new Date(Number(cabecalho.inicio_cotacao)).toLocaleDateString('pt-BR') : '—'],
    ['Fim', cabecalho?.final_cotacao ? new Date(Number(cabecalho.final_cotacao)).toLocaleDateString('pt-BR') : '—'],
    ['Gerado em', new Date().toLocaleString('pt-BR')],
  ]

  fields.forEach(([label, val], i) => {
    const col = i * 2
    setCellVal(ws, `${colLetter(col + 1)}${infoRow}`, label, cellStyle({ sz: 9, bold: true, color: BRAND, bg: BRAND_LIGHT, align: 'center', border: true }))
    setCellVal(ws, `${colLetter(col + 2)}${infoRow}`, val, cellStyle({ sz: 9, color: DARK, bg: GRAY, align: 'center', border: true }))
  })

  // Linha em branco separadora
  const sepRow = startRow + 2
  setCellVal(ws, `A${sepRow}`, '', cellStyle({ bg: BRAND, sz: 3 }))
  ws['!merges'].push({ s: { r: sepRow - 1, c: 0 }, e: { r: sepRow - 1, c: totalCols - 1 } })

  return startRow + 3 // próxima linha disponível
}

const LS_KEY_MODAL_STATUS = 'modal-tutorial'

export default {
  name: 'CotacaoConsole',
  components: { ProgressSpinner, Calendar, BrDateTimePicker },
  props: { id_cotacao: Number },

  data() {
    return {
      activeTab: 'produtos',
      auth: null,
      idCotacaoLocal: null,
      nomeCotacao: null,

      // data
      cabecalho: null,
      itens: [],
      ofertas: [],
      vendedores: [],
      sugestoes: [],

      // loading flags
      loadingProdutos: false,
      loadingOfertas: false,
      loadingVendedores: false,
      loadingSugestoes: false,
      loadingAcao: false,
      loadingButtonConcluir: false,
      loadingEdit: false,
      loadingAdd: false,
      loadingAutoSelect: false,

      // search
      searchProdutos: '',
      searchOfertas: '',

      // modals
      showEditModal: false,
      showAddProdutoModal: false,
      showAddProdutoModalInexistente: false,
      showPeriodoModal: false,
      showFatExtra: false,
      showExportModal: false,

      // edit
      editTarget: null,

      // add produto
      searchCatalogo: '',
      catalogoFiltrado: [],
      catalogoPage: 1,
      catalogoPages: 1,
      loadingCatalogo: false,
      addProduto: {
        id_produto: null,
        nome: '',
        codigo_barra: '',
        nome_fornecedor: '',
        preco_custo: null,
        preco_venda: null,
        margem: null,
        quantidade: null,
        tipo: 'unidade',
        qtd_unitaria_composicao: null,
      },
      addProdutoInexistente: { nome: '', quantidade: null },

      // faturamento extra
      fatExtra: { id_vendedor: '', id_produto: null, nome: '', quantidade: null, tipo: null, preco: null, searchProd: '' },
      catalogoExtra: [],

      // periodo
      periodoEdit: { inicio: null, final: null },

      // sugestoes
      sugestoesSelecionadas: [],

      // toasts
      toasts: [],
      toastId: 0,

      timer: null,
      timerExtra: null,

      existePendenteItem: false,

      // expandedRows ofertas
      expandedOferta: null,

      // export
      exportVendedorEmail: null,

      // modal ofertas por produto (cotação aberta)
      showOfertasProdutoModal: false,
      ofertasProdutoSelecionado: null,

      // verificar pedido - expanded vendedores
      expandedVendedores: [],

      // mover produto para outro vendedor
      showMoverProdutoModal: false,
      moverProdutoItem: null,       // { produto, vendedorOrigem }
      moverProdutoDestino: null,    // email do vendedor destino

      // faturamento extra inline (verificar pedido)
      showFatExtraVerificar: false,
      fatExtraVerificar: { id_vendedor: '', id_produto: null, nome: '', quantidade: null, preco: null, searchProd: '' },
      catalogoExtraVerificar: [],

      // modal editar produto no verificar pedido
      showEditarProdutoVerificar: false,
      editarProdutoVerificar: null,
      editarProdutoVerificarQtd: null,
      loadingEditarProdutoVerificar: false,

      // ===== HISTÓRICO PRODUTO/VENDEDOR =====
      showHistoricoModal: false,
      historicoTipo: null,        // 'produto' | 'vendedor'
      historicoLoading: false,
      historicoContexto: null,    // { id_produto, nome } ou { id_vendedor, nome }
      historicoPeriodo: {
        inicio: null,
        final: null
      },

      status_atual: 'Indisponível',

      periodoEdicaoInicial: null,
      periodoEdicaoFinal: null,

      historicoCotacoes: [],       // resultado consultarCotacoesProdutos / consultarCotacoesVendedores
      historicoVendedorInfo: null,
      historicoMetricas: null,
      historicoDetalheAberto: null, // id_cotacao expandida (drill-down)

      modalStatusVisivel: false, //Modal tutorial
      playDisable : false //play modal
    }
  },

  computed: {
    tabs() {
      let list = []

      if(this.cabecalho && this.auth.user.nivel != 7){
        list = [
          { key: 'produtos', label: 'Produtos', icon: 'pi pi-box', badge: this.itens.length || null },
          { key: 'vendedores', label: 'Vendedores', icon: 'pi pi-users', badge: null },
        ]
      }else{
        list = [
          { key: 'produtos', label: 'Produtos', icon: 'pi pi-box', badge: this.itens.length || null },
        ]
      }
      // Aba "Verificar pedido" aparece somente quando cotação está finalizada e há pelo menos 1 produto selecionado
      if (this.cabecalho && this.cabecalho.status_cotacao === 'finalizada' && this.temProdutoSelecionado) {
        list.splice(1, 0, { key: 'verificar', label: 'Verificar Pedido', icon: 'pi pi-clipboard', badge: null })
      }
      return list
    },
    // True se há pelo menos uma oferta selecionada (opcao_1 ou opcao_2)
    temProdutoSelecionado() {
      return this.ofertas.some(item => item.ofertas?.some(o => o.opcao_1 || o.opcao_2))
    },
    // Agrupa itens selecionados por vendedor para a aba "Verificar Pedido"
    itensPorVendedor() {
      const map = {}
      for (const item of this.ofertas) {
        for (const oferta of (item.ofertas || [])) {
          if (!oferta.opcao_1 && !oferta.opcao_2) continue
          const key = oferta.email
          if (!map[key]) {
            // busca foto no array vendedores

            console.log(oferta.email)
            console.log(oferta)
            const vInfo = this.vendedores.find(v => v.email === oferta.email)

            console.log(oferta)

            console.log(vInfo, "JOM")

            map[key] = {
              email: oferta.email,
              id_vendedor: oferta.id_vendedor,
              nome: oferta.nome,
              nome_empresa: vInfo.nome_empresa,
              pedido_minimo: vInfo.pedido_minimo,
              cnpj: vInfo.cnpj,
              foto_perfil: vInfo?.foto_perfil || null,
              produtos: [],
              totalValor: 0,
            }
          }

          console.log(this.ofertas, "OFERTAS")

          const isOp1 = !!oferta.opcao_1
          const preco = isOp1 ? Number(oferta.primeiro_preco || 0) : Number(oferta.segundo_preco || 0)
          const qtd   = isOp1 ? oferta.primeiro_quantidade : oferta.segundo_quantidade
          const tipo  = isOp1 ? item.tipo : oferta.segundo_tipo
          map[key].produtos.push({
            id_solicitado: item.id_solicitado,
            id_oferta: oferta.id_oferta,
            id_resultado: oferta.id_resultado,
            nome: item.nome,
            codigo_barra: item.codigo_barra,
            codigo_barra_eq: oferta.codigo_barra,
            segundo_preco: oferta.segundo_preco,
            segundo_quantidade: oferta.segundo_quantidade,
            segundo_tipo: oferta.segundo_tipo,
            nome_equivalente: oferta.nome_equivalente,
            qtd_solicitada: item.quantidade,
            qtd_ofertada: qtd,
            preco,
            tipo,
            opcao: isOp1 ? 1 : 2,
            status_fechamento: item.status_fechamento,
          })

          if(!oferta.codigo_barra) map[key].totalValor += preco * (qtd || 1)
          else map[key].totalValor += oferta.segundo_preco * (qtd || 1)
        }
      }
      return Object.values(map)
    },
    produtosFiltrados() {
      const t = this.searchProdutos.toLowerCase()
      if (!t) return this.itens
      return this.itens.filter(i =>
        (i.nome?.toLowerCase().includes(t)) || (i.codigo_barra?.toLowerCase().includes(t))
      )
    },

    

    itensFiltradosOfertas() {
      const t = this.searchOfertas.toLowerCase()
      return this.ofertas.filter(i => {
        if (!t) return true
        return (i.nome?.toLowerCase().includes(t)) ||
          i.ofertas?.some(o => o.nome?.toLowerCase().includes(t))
      })
    },
    existePendente() {
      return this.itens.some(i => i.status_fechamento === 'pendente')
    },
    estaConcluido() {
      return this.itens.some(i => i.status_fechamento === 'concluido')
    },
    podeEditarProduto() {
      return this.cabecalho && !this.estaConcluido
    },
    totalOfertas() {
      return this.ofertas.reduce((acc, item) => acc + (item.ofertas?.length || 0), 0)
    },
    vendedoresComOfertas() {
      const map = {}
      let foto

      for (const item of this.ofertas) {
        for (const oferta of (item.ofertas || [])) {
          if (!oferta.email) continue
          if (!map[oferta.email]) {

            foto = null

            for(let vendedor of this.vendedores){
              if(vendedor.email == oferta.email) foto = vendedor.foto_perfil 
            }

            map[oferta.email] = { nome: oferta.nome, email: oferta.email, totalOfertas: 0, foto_perfil: foto}
          }
          map[oferta.email].totalOfertas++
        }
      }
      return Object.values(map)
    },
  },

  watch: {
    activeTab(v) {
      if (v === 'verificar' && this.ofertas.length === 0) this.carregarOfertas()
      if (v === 'vendedores' && this.vendedores.length === 0) this.carregarVendedores()
      if (v === 'sugestao' && this.sugestoes.length === 0) this.carregarSugestoes()
    },

    onInicioChange(value) {
      this.periodoEdicaoInicial = value; // value já vem em ms
      console.log('início:', this.periodoEdicaoInicial);
    },
    onFinalChange(value) {
      this.periodoEdicaoFinal = value;
      console.log('final:', this.periodoEdicaoFinal);
    }
  },

  methods: {
    // ── UTILS ──
    formatarData(v) {
      if (!v) return '—'
      return new Date(Number(v)).toLocaleDateString('pt-BR')
    },
    formatVal(v) {
      if (v == null) return '—'
      return Number(v).toFixed(2)
    },
    capitalize(s) {
      if (!s) return ''
      return s.charAt(0).toUpperCase() + s.slice(1)
    },
    initials(nome) {
      return (nome || '').split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
    },
    statusLabel(s) {
      const map = { aberta: 'Aberta', fechada: 'Fechada', finalizada: 'Finalizada', indisponivel: 'Indisponível' }
      return map[s] || s
    },
    toast(msg, type = 'success') {
      const id = ++this.toastId
      this.toasts.push({ id, msg, type })
      setTimeout(() => { this.toasts = this.toasts.filter(t => t.id !== id) }, 3500)
    },

    fecharModalTutorial() {
      this.modalStatusVisivel = false;
    },

    fecharModalDefinitivamente() {
      localStorage.setItem(LS_KEY_MODAL_STATUS, 'true');
      this.modalStatusVisivel = false;
    },

    verificarExibirModal() {
      const oculto = localStorage.getItem(LS_KEY_MODAL_STATUS);
      if (!oculto) {
        this.modalStatusVisivel = true;
      }
    },


    toggleFullscreen() {
        this.$refs.video.requestFullscreen();
    },
    playVideo() {
        this.playDisable = true
        this.$refs.video.play();
        this.$refs.video.requestFullscreen();
    },


    // ── CARREGAMENTO ──
    async carregarProdutos() {
      try {
        this.loadingProdutos = true
        const res = await api.get(`/mvpu/cotacao/historicoCotacao/${this.auth.id_loja}/${this.idCotacaoLocal}`)
        const d = res.data.data
        if (d) {
          if (Array.isArray(d)) {
            this.itens = d
          } else {
            this.cabecalho = d.cabecalho_cotacao || this.cabecalho

            if(this.cabecalho){
              if(this.cabecalho.status_cotacao == 'fechada') this.status_atual = 'indisponível'
              if(this.cabecalho.status_cotacao == 'aberta') this.status_atual = 'aberta'
              if(this.cabecalho.status_cotacao == 'finalizada') this.status_atual = 'fechada'
              if(this.estaConcluido) this.status_atual = 'finalizada'
            }

            this.itens = d.conteudo_cotacao || d
            this.loadingAcao = false
          }
        }
      } catch (e) { exibeErro(e, this.$toast) }
      finally { this.loadingProdutos = false }
    },

    async carregarOfertas() {
      try {
        this.loadingOfertas = true
        const res = await api.get(`/mvpu/cotacao/historicoCotacao/${this.auth.id_loja}/${this.idCotacaoLocal}`)
        const d = res.data.data
        if (d) {
          this.cabecalho = d.cabecalho_cotacao || this.cabecalho
          this.ofertas = d.conteudo_cotacao || []
        }
      } catch (e) { exibeErro(e, this.$toast) }
      finally { this.loadingOfertas = false }
    },

    async carregarVendedores() {
      try {

        if(!this.cabecalho) return
        this.loadingVendedores = true
        const res = await api.get(`/mvpu/usuario/consultarVendedores/${this.auth.id_loja}`, {headers: {somenteparticipantes: true, idcotacao: this.cabecalho.id_cotacao}})

        this.vendedores = res.data.data || []
        console.log(this.vendedores)


      } catch (e) { exibeErro(e, this.$toast) }
      finally { this.loadingVendedores = false }
    },

    async carregarSugestoes() {
      try {
        this.loadingSugestoes = true
        await new Promise(r => setTimeout(r, 600))
        this.sugestoes = []
      } catch (e) { exibeErro(e, this.$toast) }
      finally { this.loadingSugestoes = false }
    },

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

    async mudarPaginaCatalogo(page) {
      await this._fetchCatalogo(this.searchCatalogo, page)
    },

    async _fetchCatalogo(search, page) {
      try {
        this.loadingCatalogo = true
        const res = await api.get(
          `/mvpu/produto/consultarProdutos/${this.auth.id_loja}`,
          { params: { page, limit: 10, search, id_usuario: this.auth.user?.id_usuario } }
        )
        this.catalogoFiltrado = res.data.data || []
        this.catalogoPage     = res.data.page  || 1
        this.catalogoPages    = res.data.pages || 1
      } catch (e) {
        this.catalogoFiltrado = []
      } finally {
        this.loadingCatalogo = false
      }
    },

    async buscarCatalogoExtra() {
      if (!this.fatExtra.searchProd || this.fatExtra.searchProd.length < 2) { this.catalogoExtra = []; return }
      try {
        clearTimeout(this.timerExtra)
        this.timerExtra = setTimeout(async () => {
          const payload = { id_loja: this.auth.id_loja, codigo_barra: this.fatExtra.searchProd }
          const res = await api.post(`/mvpu/estoque/localizaProd/`, payload)
          this.catalogoExtra = [res.data.data] || []
        }, 500)
      } catch (e) { this.catalogoExtra = [] }
    },

    // ── AÇÕES COTAÇÃO ──
    async abrirCotacao() {
      try {
        this.loadingAcao = true
        const payload = { update_tipo: 'aberta', inicio_cotacao: 'n/a', final_cotacao: 'n/a' }
        await api.put(`/mvpu/cotacao/alterarEstadoCotacao/${this.auth.id_loja}/${this.idCotacaoLocal}`, payload)
        this.toast('Cotação aberta! Vendedores já podem ofertar.')
        await this.carregarProdutos()
      } catch (e) { exibeErro(e, this.$toast) }
    },

    async fecharCotacao() {
      try {
        this.loadingAcao = true
        await api.put(`/mvpu/cotacao/fecharCotacao/${this.auth.id_loja}/${this.idCotacaoLocal}`)
        this.toast('Cotação fechada.')
        await this.carregarProdutos()
      } catch (e) { exibeErro(e, this.$toast) }
    },

    async finalizarCotacao() {
      try {
        this.loadingAcao = true
        const payload = { update_tipo: 'finalizada', inicio_cotacao: 'n/a', final_cotacao: 'n/a' }
        await api.put(`/mvpu/cotacao/alterarEstadoCotacao/${this.auth.id_loja}/${this.idCotacaoLocal}`, payload)
        this.toast('Cotação finalizada. Selecione as melhores ofertas.')
        await this.carregarProdutos()
        await this.carregarOfertas()
        this.activeTab = 'produtos'
      } catch (e) { exibeErro(e, this.$toast) }
    },

    async concluirCotacao() {
      try {
        this.loadingButtonConcluir = true
        await api.put(`/mvpu/cotacao/confirmarCotacao/${this.auth.id_loja}/${this.idCotacaoLocal}`)
        this.toast('Cotação concluída com sucesso!')
        await this.carregarProdutos()
        await this.carregarOfertas()
      } catch (e) { exibeErro(e, this.$toast) }
    },

    // ── PRODUTOS ──
    selecionarProdutoCatalogo(p) {
      this.addProduto.id_produto             = p.id_produto
      this.addProduto.nome                   = p.nome
      this.addProduto.codigo_barra           = p.codigo_barra || ''
      this.addProduto.nome_fornecedor        = p.nome_fornecedor || ''
      this.addProduto.preco_custo            = p.preco_custo
      this.addProduto.preco_venda            = p.preco_venda
      this.addProduto.margem                 = p.margem
    },

    voltarParaListaCatalogo() {
      this.addProduto.id_produto              = null
      this.addProduto.nome                    = ''
      this.addProduto.codigo_barra            = ''
      this.addProduto.nome_fornecedor         = ''
      this.addProduto.preco_custo             = null
      this.addProduto.preco_venda             = null
      this.addProduto.margem                  = null
      this.addProduto.quantidade              = null
      this.addProduto.tipo                    = ''
      this.addProduto.qtd_unitaria_composicao = null
    },

    fecharModalAddProduto() {
      this.showAddProdutoModal = false
      this.addProduto = {
        id_produto: null, nome: '', codigo_barra: '', nome_fornecedor: '',
        preco_custo: null, preco_venda: null, margem: null,
        quantidade: null, tipo: '', qtd_unitaria_composicao: null,
      }
      this.searchCatalogo    = ''
      this.catalogoFiltrado  = []
      this.catalogoPage      = 1
      this.catalogoPages     = 1
    },

    async adicionarProduto() {
      try {
        this.loadingAdd = true
        const payload_item = [
          this.addProduto.codigo_barra,
          this.addProduto.quantidade,
          this.addProduto.tipo,
          this.addProduto.qtd_unitaria_composicao,
        ]
        const payloadRequisicao = {
          codigo_barra: [payload_item],
          id_cotacao: `${this.idCotacaoLocal}`,
        }
        await api.post(`/mvpu/cotacao/adicionarItem/${this.auth.id_loja}`, payloadRequisicao)
        this.toast('Produto adicionado!')
        this.fecharModalAddProduto()
        await this.carregarProdutos()
      } catch (e) { exibeErro(e, this.$toast) }
      finally { this.loadingAdd = false }
    },

    async adicionarProdutoInexistente() {
      try {
        this.loadingAdd = true
        const payload = [this.addProdutoInexistente.nome, this.addProdutoInexistente.quantidade]
        const payloadRequisicao = { codigo_barra: [payload] }
        await api.post(`/mvpu/cotacao/adicionarProdutoInexis/${this.auth.id_loja}/${this.idCotacaoLocal}`, payloadRequisicao)
        this.toast('Produto adicionado!')
        this.showAddProdutoModalInexistente = false
        this.addProdutoInexistente = { nome: '', quantidade: '' }
        await this.carregarProdutos()
      } catch (e) { exibeErro(e, this.$toast) }
      finally { this.loadingAdd = false }
    },

    abrirEditarProduto(p, event) {
      event.stopPropagation()
      this.editTarget = { ...p }
      this.showEditModal = true
    },

    async salvarEdicao() {
      try {
        this.loadingEdit = true
        await api.put(`/mvpu/cotacao/atualizarItem/${this.auth.id_loja}`, {
          id_solicitado: this.editTarget.id_solicitado,
          id_cotacao: this.idCotacaoLocal,
          quantidade: this.editTarget.quantidade,
          tipo: this.editTarget.tipo || null,
          qtd_unitaria_composicao: this.editTarget.qtd_unitaria_composicao || null
        })
        this.toast('Produto atualizado!')
        this.showEditModal = false
        await this.carregarProdutos()
      } catch (e) { exibeErro(e, this.$toast) }
      finally { this.loadingEdit = false }
    },

    confirmarDeleteProduto(p) {
      event.stopPropagation()
      if (!confirm(`Remover "${p.nome}" da cotação?`)) return
      this.deletarProduto(p)
    },

    async deletarProduto(p) {
      try {
        await api.delete(`/mvpu/cotacao/deletarItem/${this.auth.id_loja}`, {
          data: { id_solicitado: [p.id_solicitado], id_cotacao: this.idCotacaoLocal }
        })
        this.toast('Produto removido.')
        await this.carregarProdutos()
      } catch (e) { exibeErro(e, this.$toast) }
    },

    // ── OFERTAS / SELEÇÃO ──
    async selecionarOferta(item, oferta, opcao) {
      try {
        await api.post(`/mvpu/cotacao/confirmarPendente/${this.auth.id_loja}/${this.idCotacaoLocal}`, {
          pendentes: [{ id_solicitado: oferta.id_solicitado, id_oferta: oferta.id_oferta, opcao_1: opcao === 1, opcao_2: opcao === 2 }]
        })
        this.toast('Oferta selecionada!')
        await this.carregarOfertas()
        await this.carregarProdutos()
      } catch (e) { exibeErro(e, this.$toast) }
    },

    async removerOferta(item, oferta, opcao) {
      try {
        const payload = { pendentes: [[oferta.id_resultado, opcao]] }
        await api.delete(`/mvpu/cotacao/deletarPendente/${this.auth.id_loja}/${this.idCotacaoLocal}`, { data: payload })
        this.toast('Seleção removida.')
        await this.carregarOfertas()
        await this.carregarProdutos()
      } catch (e) { exibeErro(e, this.$toast) }
    },

    selecaoAutomatica() {
      this.loadingAutoSelect = true
      try {
        const pendentes = []
        for (const item of this.ofertas) {
          if (item.status_fechamento === 'concluido') continue
          if (!item.ofertas?.length) continue
          let melhor = null, melhorPreco = Infinity, melhorOpcao = null
          for (const oferta of item.ofertas) {
            if (oferta.primeiro_quantidade != null && oferta.primeiro_preco != null) {
              const preco = Number(oferta.primeiro_preco)
              if (preco < melhorPreco) { melhorPreco = preco; melhor = oferta; melhorOpcao = 1 }
            }
          }
          if (!melhor) {
            for (const oferta of item.ofertas) {
              if (oferta.codigo_barra != null && oferta.segundo_preco != null) {
                const preco = Number(oferta.segundo_preco)
                if (preco < melhorPreco) { melhorPreco = preco; melhor = oferta; melhorOpcao = 2 }
              }
            }
          }
          if (melhor && melhorOpcao) {
            pendentes.push({ id_solicitado: melhor.id_solicitado, id_oferta: melhor.id_oferta, opcao_1: melhorOpcao === 1, opcao_2: melhorOpcao === 2 })
          }
        }
        if (pendentes.length === 0) { this.toast('Nenhuma oferta válida para seleção automática.', 'error'); return }
        api.post(`/mvpu/cotacao/confirmarPendente/${this.auth.id_loja}/${this.idCotacaoLocal}`, { pendentes })
          .then(() => { this.toast(`${pendentes.length} oferta(s) selecionadas automaticamente!`); this.carregarOfertas(); this.carregarProdutos() })
          .catch(e => exibeErro(e, this.$toast))
      } finally { this.loadingAutoSelect = false }
    },

    async removerTodasSelecoes() {
      this.loadingAutoSelect = true
      const pendentes = []
      try {
        for (let item of this.ofertas) {
          if (!item.ofertas?.length) continue
          for (let oferta of item.ofertas) {
            if (!oferta.id_resultado) continue
            if (oferta.opcao_1) pendentes.push([oferta.id_resultado, oferta.opcao_1])
            if (oferta.opcao_2) pendentes.push([oferta.id_resultado, oferta.opcao_2])
          }
        }
        await api.delete(`/mvpu/cotacao/deletarPendente/${this.auth.id_loja}/${this.idCotacaoLocal}`, { data: { pendentes } })
        this.toast('Seleção removida.')
        await this.carregarOfertas()
        await this.carregarProdutos()
      } catch (e) { exibeErro(e, this.$toast) }
      finally { this.loadingAutoSelect = false }
    },

    // ── FATURAMENTO EXTRA ──
    abrirFaturamentoExtra(item) {
      this.fatExtra = { id_vendedor: '', id_produto: null, nome: '', quantidade: null, preco: null, searchProd: '' }
      this.catalogoExtra = []
      this.showFatExtra = true
    },

    async confirmarFatExtra() {
      try {
        this.loadingAdd = true
        const payload_item = [
          this.addProduto.codigo_barra,
          this.addProduto.quantidade,
          this.addProduto.tipo,
          this.addProduto.qtd_unitaria_composicao,
        ]
        const payloadRequisicao = {
          codigo_barra: [payload_item],
          id_cotacao: `${this.idCotacaoLocal}`,
        }
        await api.post(`/mvpu/cotacao/adicionarFaturamento/${this.auth.id_loja}`, payloadRequisicao)
        this.toast('Produto adicionado!')
        this.fecharModalAddProduto()
        await this.carregarProdutos()
      } catch (e) { exibeErro(e, this.$toast) }
      finally { this.loadingAdd = false }

      this.showFatExtra = false
    },

    // ── PERÍODO ──
    abrirModalPeriodo() {
      // Pré-preenche com valores atuais no formato datetime-local
      const toDatetimeLocal = (ts) => {
        if (!ts) return ''
        const d = new Date(Number(ts))
        if (isNaN(d.getTime())) return ''
        const pad = n => String(n).padStart(2, '0')
        return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
      }
      this.periodoEdit.inicio = toDatetimeLocal(this.cabecalho?.inicio_cotacao) || ''
      this.periodoEdit.final  = toDatetimeLocal(this.cabecalho?.final_cotacao)  || ''
      this.showPeriodoModal   = true
    },

    async salvarPeriodo() {


      if (typeof this.periodoEdit.inicio === 'string') {
        this.periodoEdit.inicio = new Date(this.periodoEdit.inicio).getTime()
      }

      if (typeof this.periodoEdit.final === 'string') {
        this.periodoEdit.final = new Date(this.periodoEdit.final).getTime()
      }

      console.log(this.periodoEdit.inicio)
      console.log(this.periodoEdit.final)
      try {
        if (!this.periodoEdit.inicio || !this.periodoEdit.final) {
          this.$toast && this.$toast.warn ? this.$toast.warn('Preencha data e hora de início e término.') : this.toast('Preencha data e hora de início e término.', 'error')
          return
        }
        const payload = {
          update_tipo: 'periodo',
          inicio_cotacao: this.periodoEdit.inicio,
          final_cotacao: this.periodoEdit.final,
        }

        console.log(payload, "AA")
        if (isNaN(payload.inicio_cotacao) || isNaN(payload.final_cotacao)) {
          this.toast('Data inválida. Verifique os campos.', 'error'); return
        }
        if (payload.inicio_cotacao > payload.final_cotacao) {
          this.$toast && this.$toast.info ? this.$toast.info('A data final deve ser maior que a data inicial') : this.toast('A data final deve ser maior que a data inicial', 'error')
          return
        }


        let temPendente = false

        for (const item of this.ofertas) {
          if (item.status_fechamento === 'pendente') temPendente

        }

        if(temPendente) await this.removerTodasSelecoes()

        await api.put(`/mvpu/cotacao/alterarEstadoCotacao/${this.auth.id_loja}/${this.idCotacaoLocal}`, payload)
        this.toast('Período atualizado!')
        this.showPeriodoModal = false
        await this.carregarProdutos()
      } catch (e) { exibeErro(e, this.$toast) }
    },

    // Helper para formatar datetime-local no preview
    formatarDataHora(v) {
      if (!v) return '—'
      // Suporta tanto timestamp numérico quanto string datetime-local
      const d = isNaN(Number(v)) ? new Date(v) : new Date(Number(v))
      if (isNaN(d.getTime())) return '—'
      return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    },

    // ── SUGESTÕES ──
    toggleAllSugestoes(e) {
      this.sugestoesSelecionadas = e.target.checked ? this.sugestoes.map(s => s.id_produto) : []
    },

    async adicionarSugestoes() {
      const selecionados = this.sugestoes.filter(s => this.sugestoesSelecionadas.includes(s.id_produto))
      for (const s of selecionados) {
        try {
          await api.post(`/mvpu/cotacao/adicionarItem/${this.auth.id_loja}`, {
            id_cotacao: this.idCotacaoLocal, id_produto: s.id_produto, quantidade: s.qtd_sugerida || 1
          })
        } catch (e) { exibeErro(e, this.$toast) }
      }
      this.toast(`${selecionados.length} produto(s) adicionado(s) à cotação!`)
      this.sugestoesSelecionadas = []
      await this.carregarProdutos()
      this.activeTab = 'produtos'
    },

    // ══════════════════════════════════════════════════════
    // ──  EXPORTAÇÕES EXCEL  ──────────────────────────────
    // ══════════════════════════════════════════════════════

    _criarWorkbook() {
      return XLSX.utils.book_new()
    },

    _baixarWorkbook(wb, nomeArquivo) {
      XLSX.writeFile(wb, nomeArquivo, { bookType: 'xlsx', type: 'binary', cellStyles: true })
    },

    // Colunas automáticas
    _autoColWidths(ws, data) {
      if (!data.length) return []
      const keys = Object.keys(data[0])
      return keys.map(k => ({
        wch: Math.max(k.length, ...data.map(r => String(r[k] ?? '').length)) + 2
      }))
    },

    // ─── 1. Exportar Produtos ───────────────────────────
    exportarProdutos() {
      if (!this.itens.length) { this.toast('Nenhum produto para exportar.', 'error'); return }
      const wb = this._criarWorkbook()
      const ws = {}

      const COLS = 7
      let row = injetarCabecalhoCotacao(ws, this.cabecalho, 1, COLS)

      // Cabeçalho da tabela
      const headers = ['Produto', 'Cód. Barras', 'Quantidade', 'Tipo', 'Composição (un/cx)', 'Preço Custo (R$)', 'Preço Venda (R$)']
      headers.forEach((h, i) => {
        setCellVal(ws, `${colLetter(i + 1)}${row}`, h, cellStyle({ bold: true, color: WHITE, bg: BRAND, align: 'center', border: true, sz: 11 }))
      })
      row++

      // Dados
      this.itens.forEach((p, idx) => {
        const bg = idx % 2 === 0 ? WHITE : GRAY
        const vals = [
          p.nome || '—',
          p.codigo_barra || 'Não cadastrado',
          p.quantidade ?? '—',
          p.tipo || '—',
          p.qtd_unitaria_composicao ? `${p.qtd_unitaria_composicao} un` : '—',
          p.preco_custo != null ? Number(p.preco_custo) : '—',
          p.preco_venda != null ? Number(p.preco_venda) : '—',
        ]
        vals.forEach((v, i) => {
          setCellVal(ws, `${colLetter(i + 1)}${row}`, v, cellStyle({ bg, border: true, align: i >= 2 ? 'center' : 'left' }))
        })
        row++
      })

      // Linha de total
      row++
      setCellVal(ws, `A${row}`, `Total de produtos: ${this.itens.length}`, cellStyle({ bold: true, color: WHITE, bg: BRAND_LIGHT, sz: 11 }))
      ws['!merges'] = ws['!merges'] || []
      ws['!merges'].push({ s: { r: row - 1, c: 0 }, e: { r: row - 1, c: COLS - 1 } })

      ws['!ref'] = `A1:${colLetter(COLS)}${row}`
      ws['!cols'] = [{ wch: 30 }, { wch: 18 }, { wch: 12 }, { wch: 12 }, { wch: 18 }, { wch: 16 }, { wch: 16 }]
      ws['!rows'] = [{ hpt: 26 }, { hpt: 22 }, { hpt: 6 }]

      XLSX.utils.book_append_sheet(wb, ws, 'Produtos')
      const nome = this.cabecalho?.nome_cotacao?.replace(/[^a-zA-Z0-9]/g, '_') || 'cotacao'
      this._baixarWorkbook(wb, `MV_Produtos_${nome}.xlsx`)
      this.toast('Planilha de produtos exportada!')
    },

    // ─── 2. Exportar Todas as Ofertas ──────────────────
    exportarOfertas() {
      if (!this.totalOfertas) { this.toast('Nenhuma oferta para exportar.', 'error'); return }
      const wb = this._criarWorkbook()
      const ws = {}

      const COLS = 12
      let row = injetarCabecalhoCotacao(ws, this.cabecalho, 1, COLS)

      // Cabeçalho
      const headers = [
        'Produto Solicitado', 'Cód. Barras Produto', 'Qtd Solicitada', 'Status',
        'Vendedor', 'E-mail Vendedor',
        'Opção', 'Qtd Ofertada', 'Preço Unit. (R$)', 'Tipo', 'Un/Embalagem', 'Observação'
      ]
      headers.forEach((h, i) => {
        setCellVal(ws, `${colLetter(i + 1)}${row}`, h, cellStyle({ bold: true, color: WHITE, bg: BRAND, align: 'center', border: true, sz: 11 }))
      })
      row++

      ws['!merges'] = ws['!merges'] || []

      let idx = 0
      for (const item of this.ofertas) {
        for (const oferta of (item.ofertas || [])) {
          const opcoes = []
          if (oferta.primeiro_quantidade != null) {
            opcoes.push({
              opcao: '1ª Opção (Original)',
              qtd: oferta.primeiro_quantidade,
              preco: oferta.primeiro_preco != null ? Number(oferta.primeiro_preco) : '—',
              tipo: oferta.primeiro_tipo || '—',
              unid: oferta.primeiro_unid_composicao ? `${oferta.primeiro_unid_composicao} un` : '—',
              selecionada: oferta.opcao_1,
            })
          }
          if (oferta.codigo_barra != null) {
            opcoes.push({
              opcao: '2ª Opção (Equivalente)',
              qtd: oferta.codigo_barra,
              preco: oferta.segundo_preco != null ? Number(oferta.segundo_preco) : '—',
              tipo: oferta.segundo_tipo || '—',
              unid: oferta.segundo_unid_composicao ? `${oferta.segundo_unid_composicao} un` : '—',
              selecionada: oferta.opcao_2,
            })
          }
          if (!opcoes.length) opcoes.push({ opcao: 'Sem oferta', qtd: '—', preco: '—', tipo: '—', unid: '—', selecionada: false })

          const startRow = row
          opcoes.forEach((op, oi) => {
            const bg = op.selecionada ? 'D1FAE5' : (idx % 2 === 0 ? WHITE : GRAY)
            const vals = [
              item.nome || '—',
              item.codigo_barra || '—',
              item.quantidade ?? '—',
              item.status_fechamento ? this.capitalize(item.status_fechamento) : 'Não Selecionado',
              oferta.nome || '—',
              oferta.email || '—',
              op.opcao, op.qtd, op.preco, op.tipo, op.unid,
              oferta.mensagem || '—',
            ]
            vals.forEach((v, ci) => {
              setCellVal(ws, `${colLetter(ci + 1)}${row}`, v, cellStyle({ bg, border: true, align: ci >= 6 ? 'center' : 'left' }))
            })
            row++
          })

          // Mesclar colunas produto/vendedor se múltiplas opções
          if (opcoes.length > 1) {
            for (let c = 0; c < 6; c++) {
              ws['!merges'].push({ s: { r: startRow - 1, c }, e: { r: row - 2, c } })
            }
          }
          idx++
        }
      }

      ws['!ref'] = `A1:${colLetter(COLS)}${row}`
      ws['!cols'] = [{ wch: 28 }, { wch: 16 }, { wch: 12 }, { wch: 16 }, { wch: 24 }, { wch: 28 }, { wch: 22 }, { wch: 12 }, { wch: 14 }, { wch: 10 }, { wch: 14 }, { wch: 30 }]

      XLSX.utils.book_append_sheet(wb, ws, 'Ofertas')
      const nome = this.cabecalho?.nome_cotacao?.replace(/[^a-zA-Z0-9]/g, '_') || 'cotacao'
      this._baixarWorkbook(wb, `MV_Ofertas_${nome}.xlsx`)
      this.toast('Planilha de ofertas exportada!')
    },

    // ─── 3. Exportar por Vendedor ───────────────────────
    exportarPorVendedor() {
      const email = this.exportVendedorEmail
      if (!email) { this.toast('Selecione um vendedor.', 'error'); return }

      const vendInfo = this.vendedoresComOfertas.find(v => v.email === email)
      const wb = this._criarWorkbook()
      const ws = {}

      const COLS = 9
      let row = injetarCabecalhoCotacao(ws, this.cabecalho, 1, COLS)

      // Identidade do vendedor
      setCellVal(ws, `A${row}`, `VENDEDOR: ${vendInfo?.nome || email}`, cellStyle({ bold: true, sz: 13, color: WHITE, bg: DARK, align: 'center' }))
      ws['!merges'] = ws['!merges'] || []
      ws['!merges'].push({ s: { r: row - 1, c: 0 }, e: { r: row - 1, c: COLS - 1 } })
      row++
      setCellVal(ws, `A${row}`, `E-mail: ${email}`, cellStyle({ sz: 10, color: DARK, bg: GRAY, align: 'center' }))
      ws['!merges'].push({ s: { r: row - 1, c: 0 }, e: { r: row - 1, c: COLS - 1 } })
      row += 2

      // Cabeçalho tabela
      const headers = ['Produto Solicitado', 'Cód. Barras', 'Qtd Solicitada', 'Opção', 'Qtd Ofertada', 'Preço Unit. (R$)', 'Tipo', 'Un/Embalagem', 'Selecionado?']
      headers.forEach((h, i) => {
        setCellVal(ws, `${colLetter(i + 1)}${row}`, h, cellStyle({ bold: true, color: WHITE, bg: BRAND, align: 'center', border: true }))
      })
      row++

      let idx = 0
      for (const item of this.ofertas) {
        const oferta = (item.ofertas || []).find(o => o.email === email)
        if (!oferta) continue

        const opcoes = []
        if (oferta.primeiro_quantidade != null) opcoes.push({ opcao: '1ª Opção', qtd: oferta.primeiro_quantidade, preco: Number(oferta.primeiro_preco), tipo: oferta.primeiro_tipo || '—', unid: oferta.primeiro_unid_composicao ? `${oferta.primeiro_unid_composicao} un` : '—', sel: oferta.opcao_1 })
        if (oferta.codigo_barra != null) opcoes.push({ opcao: '2ª Opção', qtd: oferta.codigo_barra, preco: Number(oferta.segundo_preco), tipo: oferta.segundo_tipo || '—', unid: oferta.segundo_unid_composicao ? `${oferta.segundo_unid_composicao} un` : '—', sel: oferta.opcao_2 })

        const startRow = row
        opcoes.forEach(op => {
          const bg = op.sel ? 'D1FAE5' : (idx % 2 === 0 ? WHITE : GRAY)
          const selTxt = op.sel ? '✓ Selecionado' : '—'
          const vals = [item.nome || '—', item.codigo_barra || '—', item.quantidade ?? '—', op.opcao, op.qtd, op.preco, op.tipo, op.unid, selTxt]
          vals.forEach((v, ci) => {
            setCellVal(ws, `${colLetter(ci + 1)}${row}`, v, cellStyle({ bg, border: true, align: ci >= 2 ? 'center' : 'left', color: op.sel && ci === 8 ? GREEN : DARK, bold: op.sel && ci === 8 }))
          })
          row++
        })

        if (opcoes.length > 1) {
          for (let c = 0; c < 3; c++) ws['!merges'].push({ s: { r: startRow - 1, c }, e: { r: row - 2, c } })
        }
        idx++
      }

      if (idx === 0) { this.toast('Este vendedor não possui ofertas.', 'error'); return }

      ws['!ref'] = `A1:${colLetter(COLS)}${row}`
      ws['!cols'] = [{ wch: 30 }, { wch: 16 }, { wch: 14 }, { wch: 16 }, { wch: 14 }, { wch: 16 }, { wch: 12 }, { wch: 14 }, { wch: 16 }]

      XLSX.utils.book_append_sheet(wb, ws, 'Ofertas do Vendedor')
      const nomeVend = (vendInfo?.nome || email).replace(/[^a-zA-Z0-9]/g, '_')
      const nomeCot = this.cabecalho?.nome_cotacao?.replace(/[^a-zA-Z0-9]/g, '_') || 'cotacao'
      this._baixarWorkbook(wb, `MV_Vendedor_${nomeVend}_${nomeCot}.xlsx`)
      this.toast(`Planilha do vendedor ${vendInfo?.nome || email} exportada!`)
    },

    // ── MODAL OFERTAS POR PRODUTO (cotação aberta) ──
    abrirOfertasProduto(item) {
      // Encontra o item correspondente nas ofertas carregadas
      const ofertaItem = this.ofertas.find(o => o.id_solicitado === item.id_solicitado)
      this.ofertasProdutoSelecionado = ofertaItem || { ...item, ofertas: [] }
      this.showOfertasProdutoModal = true
    },

    ofertasOrdenadas(ofertas) {
      if (!ofertas || !ofertas.length) return []
      return [...ofertas].sort((a, b) => {
        const pa = a.primeiro_preco != null ? Number(a.primeiro_preco) : Infinity
        const pb = b.primeiro_preco != null ? Number(b.primeiro_preco) : Infinity
        return pa - pb
      })
    },

    vendedorVencendo(ofertas) {
      if (!ofertas || !ofertas.length) return null
      let melhor = null, melhorPreco = Infinity
      for (const o of ofertas) {
        if (o.primeiro_preco != null && Number(o.primeiro_preco) < melhorPreco) {
          melhorPreco = Number(o.primeiro_preco)
          melhor = o
        }
      }
      return melhor
    },

    ofertasCountPorProduto(item) {
      const ofertaItem = this.ofertas.find(o => o.id_solicitado === item.id_solicitado)
      return ofertaItem?.ofertas?.length || 0
    },

    temOfertaSelecionada(item) {
      const ofertaItem = this.ofertas.find(o => o.id_solicitado === item.id_solicitado)
      if (!ofertaItem?.ofertas?.length) return false
      return ofertaItem.ofertas.some(o => o.opcao_1 || o.opcao_2)
    },

    // ── VERIFICAR PEDIDO ──
    toggleVendedorExpanded(email) {
      const idx = this.expandedVendedores.indexOf(email)
      if (idx >= 0) this.expandedVendedores.splice(idx, 1)
      else this.expandedVendedores.push(email)
    },

    isVendedorExpanded(email) {
      return this.expandedVendedores.includes(email)
    },

    // Abrir modal mover produto para outro vendedor
    abrirMoverProduto(produto, vendedorEmail) {
      this.moverProdutoItem = { produto, vendedorEmail }
      this.moverProdutoDestino = null
      this.showMoverProdutoModal = true
    },

    async confirmarMoverProduto() {
      if (!this.moverProdutoDestino || !this.moverProdutoItem) return
      try {
        // Remove do vendedor atual e adiciona ao destino
        const { produto, vendedorEmail } = this.moverProdutoItem
        // Primeiro remove a seleção atual
        
        // Busca a oferta do vendedor destino para o mesmo produto
        const itemOfertas = this.ofertas.find(o => o.id_solicitado === produto.id_solicitado)
        const ofertaDestino = itemOfertas?.ofertas?.find(o => o.email === this.moverProdutoDestino)
        if (ofertaDestino) {
          await api.delete(`/mvpu/cotacao/deletarPendente/${this.auth.id_loja}/${this.idCotacaoLocal}`, {
            data: { pendentes: [[produto.id_resultado, produto.opcao]] }
          })
          // Seleciona a oferta do vendedor destino (prefere opcao 1)
          const opcao = ofertaDestino.primeiro_quantidade != null ? 1 : 2
          await api.post(`/mvpu/cotacao/confirmarPendente/${this.auth.id_loja}/${this.idCotacaoLocal}`, {
            pendentes: [{ id_solicitado: produto.id_solicitado, id_oferta: ofertaDestino.id_oferta, opcao_1: opcao === 1, opcao_2: opcao === 2 }]
          })
          this.toast(`Produto movido para ${ofertaDestino.nome}!`)
        } else {
          this.toast('Vendedor de destino não possui oferta para este produto.', 'error')
        }
        this.showMoverProdutoModal = false
        await this.carregarOfertas()
        await this.carregarProdutos()
      } catch (e) { exibeErro(e, this.$toast) }
    },

    // Adicionar quantidade a produto no verificar pedido
    adicionarQtdProduto(produto, vendedorEmail) {
      this.editarProdutoVerificar = { produto, vendedorEmail }
      this.editarProdutoVerificarQtd = produto.qtd_ofertada
      this.showEditarProdutoVerificar = true
      this.showOfertasProdutoModal = false
    },

    async confirmarEditarProdutoVerificar(tipo) {
      if (!this.editarProdutoVerificar) return
      const { produto, vendedorEmail } = this.editarProdutoVerificar
      const novaQtd = Number(this.editarProdutoVerificarQtd)
      if (!novaQtd || isNaN(novaQtd) || novaQtd <= 0) {
        this.toast('Quantidade inválida.', 'error')
        return
      }
      try {
        this.loadingEditarProdutoVerificar = true
        await api.put(`/mvpu/cotacao/atualizarItem/${this.auth.id_loja}`, {
          id_solicitado: produto.id_solicitado,
          id_cotacao: this.idCotacaoLocal,
          quantidade: novaQtd,
          tipo: tipo
        })
        this.toast('Quantidade atualizada!')
        this.showEditarProdutoVerificar = false
        await this.carregarOfertas()
        await this.carregarProdutos()
      } catch (e) { exibeErro(e, this.$toast) }
      finally { this.loadingEditarProdutoVerificar = false }
    },

    // Faturamento extra no contexto verificar pedido
    abrirFatExtraVerificar(vendedorEmail) {

      console.log(vendedorEmail, "AAAAA")

      const vend = this.itensPorVendedor.find(v => v.email === vendedorEmail)

      console.log(vend.id_vendedor, "OEOEOEOEOE")

      this.fatExtraVerificar = {
        id_vendedor: vend.id_vendedor,
        nome_vendedor: vend?.nome || '',
        id_produto: null, nome: '', quantidade: null, preco: null, searchProd: '',
      }
      this.catalogoExtraVerificar = []
      this.showFatExtraVerificar = true
    },

    async buscarCatalogoExtraVerificar() {
      if (!this.fatExtraVerificar.searchProd || this.fatExtraVerificar.searchProd.length < 2) {
        this.catalogoExtraVerificar = []; return
      }
      try {
        clearTimeout(this.timerExtra)
        this.timerExtra = setTimeout(async () => {
          const payload = { id_loja: this.auth.id_loja, codigo_barra: this.fatExtraVerificar.searchProd }
          const res = await api.post(`/mvpu/estoque/localizaProd/`, payload)
          this.catalogoExtraVerificar = [res.data.data] || []
        }, 500)
      } catch (e) { this.catalogoExtraVerificar = [] }
    },

    async confirmarFatExtraVerificar() {
      try {
        this.loadingAdd = true
        const payload_item = [
          this.addProduto.codigo_barra,
          this.addProduto.quantidade,
          this.addProduto.tipo,
          this.addProduto.qtd_unitaria_composicao,
        ]
        const payloadRequisicao = {
          codigo_barra: [payload_item],
          id_cotacao: `${this.idCotacaoLocal}`,
          id_vendedor: this.fatExtraVerificar.id_vendedor,
        }


        console.log(payloadRequisicao, "OLHA O PRODUTO AEEE")

        await api.post(`/mvpu/cotacao/adicionarFaturamento/${this.auth.id_loja}`, payloadRequisicao)
        this.toast('Produto adicionado!')
        this.fecharModalAddProduto()
        await this.carregarProdutos()
        await this.carregarOfertas()
      } catch (e) { exibeErro(e, this.$toast) }
      finally { this.loadingAdd = false }

      this.showFatExtra = false

      this.showFatExtraVerificar = false
    },

    // Seleção automática acessível da aba produtos (finalizada)
    selecaoAutomaticaProdutos() {
      // Reusa a mesma lógica existente
      this.selecaoAutomatica()
    },

    async removerTodasSelecoesProdutos() {
      this.removerTodasSelecoes()
    },

    // ── SELEÇÃO DE OFERTA A PARTIR DO MODAL DE PRODUTO ──
    async selecionarOfertaModal(item, oferta, opcao) {

      
      oferta['segundo_quantidade'] = oferta['primeiro_quantidade']

      try {
        await api.post(`/mvpu/cotacao/confirmarPendente/${this.auth.id_loja}/${this.idCotacaoLocal}`, {
          pendentes: [{ id_solicitado: item.id_solicitado, id_oferta: oferta.id_oferta, opcao_1: opcao === 1, opcao_2: opcao === 2 }]
        })
        this.toast('Oferta selecionada!')
        await this.carregarOfertas()
        await this.carregarProdutos()
        // Atualiza o item no modal
        const atualizado = this.ofertas.find(o => o.id_solicitado === item.id_solicitado)
        if (atualizado) this.ofertasProdutoSelecionado = atualizado
      } catch (e) { exibeErro(e, this.$toast) }
    },

    async removerOfertaModal(item, oferta, opcao) {
      try {
        const payload = { pendentes: [[oferta.id_resultado, opcao]] }
        await api.delete(`/mvpu/cotacao/deletarPendente/${this.auth.id_loja}/${this.idCotacaoLocal}`, { data: payload })
        this.toast('Seleção removida.')
        await this.carregarOfertas()
        await this.carregarProdutos()
        const atualizado = this.ofertas.find(o => o.id_solicitado === item.id_solicitado)
        if (atualizado) this.ofertasProdutoSelecionado = atualizado
      } catch (e) { exibeErro(e, this.$toast) }
    },

    // ─── 4. Relatório de Conclusão ──────────────────────
    exportarConclusao() {
      const wb = this._criarWorkbook()

      // ── Aba 1: Resumo Geral ──
      const wsResumo = {}
      const COLS_R = 6
      let row = injetarCabecalhoCotacao(wsResumo, this.cabecalho, 1, COLS_R)

      wsResumo['!merges'] = wsResumo['!merges'] || []

      // Título resumo
      setCellVal(wsResumo, `A${row}`, 'RESUMO DA COTAÇÃO', cellStyle({ bold: true, sz: 14, color: WHITE, bg: DARK, align: 'center' }))
      wsResumo['!merges'].push({ s: { r: row - 1, c: 0 }, e: { r: row - 1, c: COLS_R - 1 } })
      row += 2

      // Estatísticas gerais
      const totalItens = this.itens.length
      const itensConcluidos = this.itens.filter(i => i.status_fechamento === 'concluido').length
      const itensPendentes = this.itens.filter(i => i.status_fechamento === 'pendente').length

      // Calcular total da cotação (selecionados)
      let totalCotacao = 0
      for (const item of this.ofertas) {
        for (const oferta of (item.ofertas || [])) {
          if (oferta.opcao_1 && oferta.primeiro_preco) totalCotacao += Number(oferta.primeiro_preco) * (oferta.primeiro_quantidade || 1)
          if (oferta.opcao_2 && oferta.segundo_preco) totalCotacao += Number(oferta.segundo_preco) * (oferta.codigo_barra || 1)
        }
      }

      const statsData = [
        ['Total de Produtos', totalItens, 'Itens Concluídos', itensConcluidos, 'Itens Pendentes', itensPendentes],
        ['Total da Cotação', `R$ ${totalCotacao.toFixed(2)}`, 'Vendedores', this.vendedoresComOfertas.length, 'Ofertas Recebidas', this.totalOfertas],
      ]

      statsData.forEach((rowData) => {
        for (let i = 0; i < 3; i++) {
          setCellVal(wsResumo, `${colLetter(i * 2 + 1)}${row}`, rowData[i * 2], cellStyle({ bold: true, sz: 10, color: BRAND, bg: BRAND_LIGHT, align: 'center', border: true }))
          setCellVal(wsResumo, `${colLetter(i * 2 + 2)}${row}`, rowData[i * 2 + 1], cellStyle({ bold: true, sz: 13, color: DARK, bg: GRAY, align: 'center', border: true }))
        }
        row++
      })

      row += 2

      // Tabela de itens
      setCellVal(wsResumo, `A${row}`, 'DETALHAMENTO DOS ITENS', cellStyle({ bold: true, sz: 12, color: WHITE, bg: BRAND, align: 'center' }))
      wsResumo['!merges'].push({ s: { r: row - 1, c: 0 }, e: { r: row - 1, c: COLS_R - 1 } })
      row++

      const hdrs = ['Produto', 'Cód. Barras', 'Qtd Solicitada', 'Status', 'Preço Selecionado (R$)', 'Vendedor Selecionado']
      hdrs.forEach((h, i) => setCellVal(wsResumo, `${colLetter(i + 1)}${row}`, h, cellStyle({ bold: true, color: WHITE, bg: BRAND, border: true, align: 'center' })))
      row++

      for (const item of (this.ofertas.length ? this.ofertas : this.itens)) {
        let precoSel = '—', vendSel = '—'
        if (item.ofertas) {
          for (const of_ of item.ofertas) {
            if (of_.opcao_1) { precoSel = `R$ ${Number(of_.primeiro_preco || 0).toFixed(2)}`; vendSel = of_.nome || '—' }
            if (of_.opcao_2) { precoSel = `R$ ${Number(of_.segundo_preco || 0).toFixed(2)}`; vendSel = of_.nome || '—' }
          }
        }
        const statusStr = item.status_fechamento ? this.capitalize(item.status_fechamento) : 'Pendente'
        const bg = item.status_fechamento === 'concluido' ? 'D1FAE5' : WHITE
        const vals = [item.nome || '—', item.codigo_barra || '—', item.quantidade ?? '—', statusStr, precoSel, vendSel]
        vals.forEach((v, i) => setCellVal(wsResumo, `${colLetter(i + 1)}${row}`, v, cellStyle({ bg, border: true, align: i >= 2 ? 'center' : 'left' })))
        row++
      }

      // Linha total
      row++
      setCellVal(wsResumo, `A${row}`, `TOTAL GERAL DA COTAÇÃO: R$ ${totalCotacao.toFixed(2)}`, cellStyle({ bold: true, sz: 13, color: WHITE, bg: BRAND, align: 'center' }))
      wsResumo['!merges'].push({ s: { r: row - 1, c: 0 }, e: { r: row - 1, c: COLS_R - 1 } })

      wsResumo['!ref'] = `A1:${colLetter(COLS_R)}${row}`
      wsResumo['!cols'] = [{ wch: 30 }, { wch: 16 }, { wch: 14 }, { wch: 16 }, { wch: 20 }, { wch: 24 }]
      XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo Geral')

      // ── Aba 2: Detalhamento por Vendedor ──
      const wsVendedores = {}
      const COLS_V = 8
      let rowV = injetarCabecalhoCotacao(wsVendedores, this.cabecalho, 1, COLS_V)
      wsVendedores['!merges'] = wsVendedores['!merges'] || []

      setCellVal(wsVendedores, `A${rowV}`, 'ITENS SELECIONADOS POR VENDEDOR', cellStyle({ bold: true, sz: 13, color: WHITE, bg: DARK, align: 'center' }))
      wsVendedores['!merges'].push({ s: { r: rowV - 1, c: 0 }, e: { r: rowV - 1, c: COLS_V - 1 } })
      rowV += 2

      const hdrsV = ['Vendedor', 'E-mail', 'Produto', 'Cód. Barras', 'Qtd', 'Tipo', 'Preço Unit. (R$)', 'Opção']
      hdrsV.forEach((h, i) => setCellVal(wsVendedores, `${colLetter(i + 1)}${rowV}`, h, cellStyle({ bold: true, color: WHITE, bg: BRAND, border: true, align: 'center' })))
      rowV++

      let vIdx = 0
      for (const item of this.ofertas) {
        for (const oferta of (item.ofertas || [])) {
          if (oferta.opcao_1 || oferta.opcao_2) {
            const isOp1 = oferta.opcao_1
            const bg = vIdx % 2 === 0 ? WHITE : GRAY
            const vals = [
              oferta.nome || '—', oferta.email || '—',
              item.nome || '—', item.codigo_barra || '—',
              isOp1 ? oferta.primeiro_quantidade : oferta.codigo_barra,
              isOp1 ? (oferta.primeiro_tipo || '—') : (oferta.segundo_tipo || '—'),
              isOp1 ? Number(oferta.primeiro_preco || 0).toFixed(2) : Number(oferta.segundo_preco || 0).toFixed(2),
              isOp1 ? '1ª Opção' : '2ª Opção'
            ]
            vals.forEach((v, i) => setCellVal(wsVendedores, `${colLetter(i + 1)}${rowV}`, v, cellStyle({ bg, border: true, align: i >= 4 ? 'center' : 'left' })))
            rowV++
            vIdx++
          }
        }
      }

      wsVendedores['!ref'] = `A1:${colLetter(COLS_V)}${rowV}`
      wsVendedores['!cols'] = [{ wch: 24 }, { wch: 28 }, { wch: 30 }, { wch: 16 }, { wch: 10 }, { wch: 12 }, { wch: 16 }, { wch: 14 }]
      XLSX.utils.book_append_sheet(wb, wsVendedores, 'Itens por Vendedor')

      const nome = this.cabecalho?.nome_cotacao?.replace(/[^a-zA-Z0-9]/g, '_') || 'cotacao'
      this._baixarWorkbook(wb, `MV_Conclusao_${nome}.xlsx`)
      this.toast('Relatório de conclusão exportado!')
    },

    // ─── 5. Conclusão por Vendedor ──────────────────────
    exportarConclusaoPorVendedor() {
      const email = this.exportVendedorEmail
      if (!email) { this.toast('Selecione um vendedor.', 'error'); return }

      const vendInfo = this.vendedoresComOfertas.find(v => v.email === email)
      const wb = this._criarWorkbook()
      const ws = {}
      const COLS = 8
      let row = injetarCabecalhoCotacao(ws, this.cabecalho, 1, COLS)
      ws['!merges'] = ws['!merges'] || []

      setCellVal(ws, `A${row}`, `CONCLUSÃO DO VENDEDOR: ${vendInfo?.nome || email}`, cellStyle({ bold: true, sz: 13, color: WHITE, bg: DARK, align: 'center' }))
      ws['!merges'].push({ s: { r: row - 1, c: 0 }, e: { r: row - 1, c: COLS - 1 } })
      row++
      setCellVal(ws, `A${row}`, `E-mail: ${email}`, cellStyle({ sz: 10, color: DARK, bg: GRAY, align: 'center' }))
      ws['!merges'].push({ s: { r: row - 1, c: 0 }, e: { r: row - 1, c: COLS - 1 } })
      row += 2

      // Calcular total do vendedor
      let totalVend = 0
      const itensSelecionados = []
      for (const item of this.ofertas) {
        const oferta = (item.ofertas || []).find(o => o.email === email)
        if (!oferta) continue
        if (oferta.opcao_1 && oferta.primeiro_preco) {
          totalVend += Number(oferta.primeiro_preco) * (oferta.primeiro_quantidade || 1)
          itensSelecionados.push({ item, oferta, opcao: 1 })
        } else if (oferta.opcao_2 && oferta.segundo_preco) {
          totalVend += Number(oferta.segundo_preco) * (oferta.codigo_barra || 1)
          itensSelecionados.push({ item, oferta, opcao: 2 })
        }
      }

      // KPIs do vendedor
      setCellVal(ws, `A${row}`, 'Total Selecionados', cellStyle({ bold: true, sz: 10, color: BRAND, bg: BRAND_LIGHT, align: 'center', border: true }))
      setCellVal(ws, `B${row}`, itensSelecionados.length, cellStyle({ bold: true, sz: 13, color: DARK, bg: GRAY, align: 'center', border: true }))
      setCellVal(ws, `C${row}`, 'Total de Itens', cellStyle({ bold: true, sz: 10, color: BRAND, bg: BRAND_LIGHT, align: 'center', border: true }))
      setCellVal(ws, `D${row}`, this.totalOfertas, cellStyle({ bold: true, sz: 13, color: DARK, bg: GRAY, align: 'center', border: true }))
      setCellVal(ws, `E${row}`, 'Valor Total (R$)', cellStyle({ bold: true, sz: 10, color: BRAND, bg: BRAND_LIGHT, align: 'center', border: true }))
      ws['!merges'].push({ s: { r: row - 1, c: 4 }, e: { r: row - 1, c: 5 } })
      setCellVal(ws, `F${row}`, `R$ ${totalVend.toFixed(2)}`, cellStyle({ bold: true, sz: 13, color: GREEN, bg: 'D1FAE5', align: 'center', border: true }))
      ws['!merges'].push({ s: { r: row - 1, c: 5 }, e: { r: row - 1, c: COLS - 1 } })
      row += 2

      // Tabela de itens selecionados
      setCellVal(ws, `A${row}`, 'ITENS SELECIONADOS', cellStyle({ bold: true, sz: 12, color: WHITE, bg: BRAND, align: 'center' }))
      ws['!merges'].push({ s: { r: row - 1, c: 0 }, e: { r: row - 1, c: COLS - 1 } })
      row++

      const hdrs = ['Produto', 'Cód. Barras', 'Qtd Solicitada', 'Qtd Ofertada', 'Tipo', 'Un/Embalagem', 'Preço Unit. (R$)', 'Subtotal (R$)']
      hdrs.forEach((h, i) => setCellVal(ws, `${colLetter(i + 1)}${row}`, h, cellStyle({ bold: true, color: WHITE, bg: BRAND, border: true, align: 'center' })))
      row++

      itensSelecionados.forEach(({ item, oferta, opcao }, i) => {
        const isOp1 = opcao === 1
        const qtd = isOp1 ? oferta.primeiro_quantidade : oferta.codigo_barra
        const preco = isOp1 ? Number(oferta.primeiro_preco || 0) : Number(oferta.segundo_preco || 0)
        const subtotal = preco * (qtd || 1)
        const bg = i % 2 === 0 ? WHITE : GRAY
        const vals = [
          item.nome || '—', item.codigo_barra || '—',
          item.quantidade ?? '—', qtd ?? '—',
          isOp1 ? (oferta.primeiro_tipo || '—') : (oferta.segundo_tipo || '—'),
          isOp1 ? (oferta.primeiro_unid_composicao ? `${oferta.primeiro_unid_composicao} un` : '—') : (oferta.segundo_unid_composicao ? `${oferta.segundo_unid_composicao} un` : '—'),
          preco.toFixed(2), subtotal.toFixed(2)
        ]
        vals.forEach((v, ci) => setCellVal(ws, `${colLetter(ci + 1)}${row}`, v, cellStyle({ bg, border: true, align: ci >= 2 ? 'center' : 'left' })))
        row++
      })

      // Total final
      row++
      setCellVal(ws, `A${row}`, `TOTAL DO VENDEDOR: R$ ${totalVend.toFixed(2)}`, cellStyle({ bold: true, sz: 13, color: WHITE, bg: BRAND, align: 'center' }))
      ws['!merges'].push({ s: { r: row - 1, c: 0 }, e: { r: row - 1, c: COLS - 1 } })

      ws['!ref'] = `A1:${colLetter(COLS)}${row}`
      ws['!cols'] = [{ wch: 30 }, { wch: 16 }, { wch: 14 }, { wch: 14 }, { wch: 12 }, { wch: 14 }, { wch: 16 }, { wch: 16 }]
      XLSX.utils.book_append_sheet(wb, ws, 'Conclusão Vendedor')

      const nomeVend = (vendInfo?.nome || email).replace(/[^a-zA-Z0-9]/g, '_')
      const nomeCot = this.cabecalho?.nome_cotacao?.replace(/[^a-zA-Z0-9]/g, '_') || 'cotacao'
      this._baixarWorkbook(wb, `MV_Conclusao_Vendedor_${nomeVend}_${nomeCot}.xlsx`)
      this.toast(`Conclusão do vendedor ${vendInfo?.nome || email} exportada!`)
    },
    // ── HISTÓRICO: ABERTURA ──
    abrirHistoricoProduto(produto) {
      this.historicoTipo = 'produto'
      this.historicoContexto = { id_produto: produto.id_produto, nome: produto.nome }
      this.prepararPeriodoHistorico()
      this.showHistoricoModal = true
      this.consultarHistorico()
    },

    abrirHistoricoVendedor(vendedor) {
      this.historicoTipo = 'vendedor'
      this.historicoContexto = { id_vendedor: vendedor.id_vendedor, nome: vendedor.nome }
      this.prepararPeriodoHistorico()
      this.showHistoricoModal = true
      this.showOfertasProdutoModal = false
      this.consultarHistorico()
    },

    prepararPeriodoHistorico() {
      const fim = new Date()
      const inicio = new Date()
      inicio.setDate(inicio.getDate() - 30)
      this.historicoPeriodo.inicio = inicio
      this.historicoPeriodo.final = fim
      this.historicoCotacoes = []
      this.historicoVendedorInfo = null
      this.historicoMetricas = null
      this.historicoDetalheAberto = null
    },

    // ── HISTÓRICO: AJUSTE DE PERÍODO (máx. 30 dias) ──
    ajustarPeriodoHistoricoInicio(novaData) {
      this.historicoPeriodo.inicio = novaData
      const limite = new Date(novaData)
      limite.setDate(limite.getDate() + 30)
      if (this.historicoPeriodo.final > limite) {
        this.historicoPeriodo.final = limite
      }
      if (this.historicoPeriodo.final < novaData) {
        this.historicoPeriodo.final = novaData
      }
    },

    ajustarPeriodoHistoricoFinal(novaData) {
      this.historicoPeriodo.final = novaData
      const limite = new Date(novaData)
      limite.setDate(limite.getDate() - 30)
      if (this.historicoPeriodo.inicio < limite) {
        this.historicoPeriodo.inicio = limite
      }
      if (this.historicoPeriodo.inicio > novaData) {
        this.historicoPeriodo.inicio = novaData
      }
    },

    // ── HISTÓRICO: CONSULTA ──
    async consultarHistorico() {
      if (!this.historicoPeriodo.inicio || !this.historicoPeriodo.final) {
        this.toast('Selecione o período de consulta', 'error')
        return
      }

      const inicioMs = new Date(this.historicoPeriodo.inicio).setHours(0, 0, 0, 0)
      const finalMs  = new Date(this.historicoPeriodo.final).setHours(23, 59, 59, 999)

      const payload = {
        operacao: this.historicoTipo === 'produto' ? 'consultarCotacoesProdutos' : 'consultarCotacoesVendedores',
        id_loja: this.auth.id_loja,
        id_usuario: this.auth.user?.id_usuario,
        id_produto: 'n/a',
        id_cotacao: 'n/a',
        id_vendedor: 'n/a',
        timestamp_inicio: inicioMs,
        timestamp_fim: finalMs
      }

      if (this.historicoTipo === 'produto') {
        payload.id_produto = this.historicoContexto.id_produto
      } else {
        payload.id_vendedor = this.historicoContexto.id_vendedor
      }

      try {
        this.historicoLoading = true
        this.historicoCotacoes = []
        this.historicoVendedorInfo = null
        this.historicoMetricas = null

        const res = await api.post(`/mvpu/cotacao/historico/${this.auth.id_loja}/`, payload)
        const data = res.data?.data

        if (this.historicoTipo === 'produto') {
          this.historicoCotacoes = Array.isArray(data) ? data : []
        } else {
          this.historicoVendedorInfo = data?.vendedor || null
          this.historicoCotacoes = data?.cotacoes || []
          this.historicoMetricas = data?.metricas || null
        }

        if (this.historicoCotacoes.length === 0) {
          this.toast(res.data?.body?.MSG || 'Nenhum resultado encontrado no período', 'info')
        }

        for (const cot of this.historicoCotacoes){
          if(this.cabecalho){
              if(this.cabecalho.status_cotacao == 'fechada') cot.status_cotacao = 'indisponível'
              else if(this.cabecalho.status_cotacao == 'aberta') cot.status_cotacao = 'aberta'
              else if(this.cabecalho.status_cotacao == 'finalizada') cot.status_cotacao = 'finalizada'
            }
        }

      } catch (e) {
        console.error(e)
        this.toast('Erro ao consultar histórico', 'error')
      } finally {
        this.historicoLoading = false
      }
    },

    // ── HISTÓRICO: DRILL-DOWN (detalhes de uma cotação específica) ──
    toggleDetalheHistorico(cotacao) {
      if (this.historicoDetalheAberto === cotacao.id_cotacao) {
        this.historicoDetalheAberto = null
        return
      }
      this.historicoDetalheAberto = cotacao.id_cotacao
      if (!cotacao._detalhe) {
        this.carregarDetalheHistorico(cotacao)
      }
    },

    async carregarDetalheHistorico(cotacao) {
      const inicioMs = new Date(this.historicoPeriodo.inicio).setHours(0, 0, 0, 0)
      const finalMs  = new Date(this.historicoPeriodo.final).setHours(23, 59, 59, 999)

      const payload = {
        operacao: this.historicoTipo === 'produto' ? 'consultarProdutosNaCotacao' : 'consultarOfertasNaCotacao',
        id_loja: this.auth.id_loja,
        id_usuario: this.auth.user?.id_usuario,
        id_cotacao: cotacao.id_cotacao,
        id_vendedor: 'n/a',
        id_produto: 'n/a',
        timestamp_inicio: inicioMs,
        timestamp_fim: finalMs
      }

      if (this.historicoTipo === 'produto') {
        payload.id_produto = this.historicoContexto.id_produto
      } else {
        payload.id_vendedor = this.historicoContexto.id_vendedor
      }

      try {
        cotacao._detalheLoading = true
        const res = await api.post(`/mvpu/cotacao/historico/${this.auth.id_loja}/`, payload)
        const data = res.data?.data

        if (this.historicoTipo === 'produto') {
          cotacao._detalhe = data?.produtos || []
        } else {
          cotacao._detalhe = data?.ofertas || []
        }
      } catch (e) {
        console.error(e)
        this.toast('Erro ao carregar detalhes da cotação', 'error')
        cotacao._detalhe = []
      } finally {
        cotacao._detalheLoading = false
      }
    },

    // ── HISTÓRICO: UTILS ──
    formatarDataHoraCompleta(v) {
      if (!v) return '—'
      return new Date(Number(v)).toLocaleString('pt-BR')
    },

    fecharHistoricoModal() {
      this.showHistoricoModal = false
      this.historicoTipo = null
      this.historicoContexto = null
      this.historicoCotacoes = []
      this.historicoVendedorInfo = null
      this.historicoMetricas = null
      this.historicoDetalheAberto = null
    },
  },

  mounted() {
    this.auth = useAuthStore()
    const query = this.$route?.query || {}
    this.idCotacaoLocal = this.id_cotacao || Number(query.id_cotacao)
    this.nomeCotacao = query.nome_cotacao
    this.verificarExibirModal()

    if (query.status_cotacao) {
      this.cabecalho = {
        id_cotacao: this.idCotacaoLocal,
        nome_cotacao: query.nome_cotacao,
        status_cotacao: query.status_cotacao,
        inicio_cotacao: query.inicio_cotacao,
        final_cotacao: query.final_cotacao
      }
      if (this.periodoEdit) {
        const ini = new Date(Number(query.inicio_cotacao))
        const fin = new Date(Number(query.final_cotacao))
        this.periodoEdit.inicio = ini.toISOString().split('T')[0]
        this.periodoEdit.final = fin.toISOString().split('T')[0]
      }
    }

    setTimeout(() => {
      this.carregarProdutos()
      this.carregarOfertas()
    }, 300)

    setTimeout(()=>{
      this.carregarVendedores()
    }, 2200)
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

* { box-sizing: border-box; }



.console-root {
  font-family: 'DM Sans', sans-serif;
  min-height: 100vh;
  background: #FFFFFF;
  display: flex;
  flex-direction: column;
  color: #000;
}

/* ===== TOPBAR ===== */
.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 24px;
  background: #fff;
  border-bottom: 1px solid rgba(0,0,0,0.1);
  flex-shrink: 0;
  gap: 16px;
}



.topbar-left { display: flex; align-items: center; gap: 16px; }
.back-btn {
  background: rgba(255, 128, 73, 0.1);
  border: none;
  color: #FF8049;
  width: 34px; height: 34px;
  border-radius: 8px;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background .2s;
}
.back-btn:hover { background: rgba(255, 128, 73, 0.2); }
.cotacao-identity { display: flex; flex-direction: column; }
.cotacao-label { font-size: 10px; font-weight: 700; letter-spacing: .12em; color: #FF8049; text-transform: uppercase; }
.cotacao-name { font-size: 15px; font-weight: 700; color: #000; line-height: 1.2; }
.cotacao-meta { display: flex; align-items: center; gap: 8px; }
.meta-id { font-size: 12px; color: rgba(0,0,0,0.4); font-family: 'DM Mono', monospace; }

/* status pills */
.status-pill {
  display: flex; align-items: center; gap: 5px;
  padding: 3px 9px; border-radius: 20px;
  font-size: 11px; font-weight: 600; letter-spacing: .04em;
}
.status-dot { width: 6px; height: 6px; border-radius: 50%; }
.status-rascunho { background: rgba(0,0,0,0.08); color: rgba(0,0,0,0.6); }
.status-rascunho .status-dot { background: rgba(0,0,0,0.4); }
.status-aberta { background: rgba(16,185,129,0.15); color: #059669; }
.status-aberta .status-dot { background: #10b981; }
.status-indisponivel { background: rgba(0,0,0,0.08); color: rgba(0,0,0,0.5); }
.status-indisponivel .status-dot { background: rgba(0,0,0,0.3); }
.status-fechada { background: rgba(99,102,241,0.15); color: #4f46e5; }
.status-fechada .status-dot { background: #818cf8; }
.status-finalizada { background: rgba(16,185,129,0.15); color: #059669; }
.status-finalizada .status-dot { background: #10b981; }
.status-pendente { background: rgba(245,158,11,0.15); color: #d97706; }
.status-pendente .status-dot { background: #f59e0b; }
.status-concluido { background: rgba(16,185,129,0.15); color: #059669; }
.status-concluido .status-dot { background: #10b981; }
.status-none { background: rgba(0,0,0,0.05); color: rgba(0,0,0,0.4); }
.status-none .status-dot { background: rgba(0,0,0,0.2); }

.topbar-right { display: flex; align-items: center; gap: 10px; }
.periodo-display {
  display: flex; align-items: center; gap: 7px;
  font-size: 12px; color: #000;
  background: rgba(0,0,0,0.05);
  padding: 5px 12px; border-radius: 7px;
}

/* ===== ACTION BUTTONS ===== */
.action-btn {
  display: flex; align-items: center; gap: 7px;
  padding: 8px 16px; border-radius: 8px;
  font-size: 13px; font-weight: 600;
  cursor: pointer; border: none;
  transition: all .2s; font-family: 'DM Sans', sans-serif;
  white-space: nowrap;
}
.action-btn:disabled { opacity: .5; cursor: not-allowed; }
.btn-primary { background: #FF8049; color: #fff; }
.btn-primary:not(:disabled):hover { background: #e67341; }
.btn-outline { background: #fff; color: #FF8049; border: 1px solid #FF8049; }
.btn-outline:not(:disabled):hover { background: rgba(255, 128, 73, 0.05); }
.btn-warning { background: #f59e0b; color: #fff; }
.btn-warning:not(:disabled):hover { background: #d97706; }
.btn-info { background: #6366f1; color: #fff; }
.btn-info:not(:disabled):hover { background: #4f46e5; }
.btn-success { background: #10b981; color: #fff; }
.btn-success:not(:disabled):hover { background: #059669; }
.btn-danger { background: #ef4444; color: #fff; }
.btn-danger:not(:disabled):hover { background: #dc2626; }
.btn-export {
  background: linear-gradient(135deg, #FF8049 0%, #FF5722 100%);
  color: #fff;
  box-shadow: 0 2px 8px rgba(255, 128, 73, 0.35);
  border: none;
}
.btn-export:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(255, 128, 73, 0.45); }

/* ===== TABS ===== */
.tabs-bar {
  display: flex; gap: 4px;
  padding: 10px 24px 0;
  background: #fff;
  border-bottom: 1px solid rgba(0,0,0,0.08);
  flex-shrink: 0;
}
.tab-btn {
  display: flex; align-items: center; gap: 7px;
  padding: 8px 16px;
  border: none; background: none;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px; font-weight: 600;
  color: rgba(0,0,0,0.5);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: all .2s;
  border-radius: 6px 6px 0 0;
}
.tab-btn:hover:not(:disabled) { color: #FF8049; background: rgba(255, 128, 73, 0.04); }
.tab-btn.active { color: #FF8049; border-bottom-color: #FF8049; background: rgba(255, 128, 73, 0.04); }
.tab-badge {
  background: #FF8049; color: #fff;
  font-size: 10px; font-weight: 700;
  padding: 1px 6px; border-radius: 10px;
}

/* ===== CONTENT ===== */
.tab-content { flex: 1; overflow: auto; }
.tab-pane { padding: 20px 24px; }
.pane-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 16px; gap: 12px; flex-wrap: wrap;
}
.search-wrap {
  display: flex; align-items: center; gap: 9px;
  background: #fff;
  border: 1px solid rgba(0,0,0,0.12);
  border-radius: 8px; padding: 8px 14px;
  flex: 1; min-width: 200px; max-width: 380px;
  transition: border-color .2s;
}
.search-wrap:focus-within { border-color: #FF8049; }
.search-wrap input { border: none; outline: none; font-size: 13px; font-family: 'DM Sans', sans-serif; width: 100%; background: transparent; }
.search-wrap i { color: rgba(0,0,0,0.3); font-size: 13px; flex-shrink: 0; }

/* ===== TABLE ===== */
.produtos-table-wrap { overflow-x: auto; border-radius: 10px; border: 1px solid rgba(0,0,0,0.07); }
.data-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.data-table thead tr { background: #fafafa; }
.data-table th {
  padding: 10px ;
  text-align: left;
  font-size: 11px; font-weight: 700; letter-spacing: .07em; text-transform: uppercase;
  color: rgba(0,0,0,0.5);
  border-bottom: 1px solid rgba(0,0,0,0.07);
  white-space: nowrap;
}
.data-table td { padding: 10px ; border-bottom: 1px solid rgba(0,0,0,0.04); vertical-align: middle; }
.data-table tbody tr:last-child td { border-bottom: none; }
.data-table tbody tr:hover { background: rgba(255, 128, 73, 0.02); }
.data-table tbody tr.selected { background: rgba(255, 128, 73, 0.06); }
.prod-cell { display: flex; flex-direction: column; gap: 2px; }
.prod-name { font-weight: 600; color: #000; }
.prod-cat { font-size: 11px; color: rgba(0,0,0,0.4); }
.mono { font-family: 'DM Mono', monospace; font-size: 12px; }
.muted { color: rgba(0,0,0,0.4); }
.type-tag { background: rgba(255, 128, 73, 0.1); color: #FF8049; padding: 2px 7px; border-radius: 4px; font-size: 11px; font-weight: 600; }
.comp-info { font-size: 12px; color: rgba(0,0,0,0.5); }
.margem-badge { padding: 3px 8px; border-radius: 5px; font-size: 11px; font-weight: 700; }
.margem-badge.pos { background: rgba(16,185,129,0.1); color: #059669; }
.margem-badge.neg { background: rgba(239,68,68,0.1); color: #ef4444; }
.row-actions { display: flex; gap: 6px; align-items: center; }
.icon-btn {
  background: none; border: none; cursor: pointer;
  width: 30px; height: 30px;
  border-radius: 6px; display: flex; align-items: center; justify-content: center;
  font-size: 16px; transition: all .2s;
}
.icon-btn.edit { color: rgba(0,0,0,0.4); }
.icon-btn.edit:hover { background: rgba(255, 128, 73, 0.1); color: #FF8049; }
.icon-btn.del { color: rgba(0,0,0,0.3); }
.icon-btn.del:hover { background: rgba(239,68,68,0.1); color: #ef4444; }
.locked-hint { color: rgba(0,0,0,0.2); font-size: 13px; }
.qty-input { width: 80px; padding: 4px 8px; border: 1px solid rgba(0,0,0,0.12); border-radius: 5px; font-family: 'DM Sans', sans-serif; font-size: 12px; }
.estoque-low { color: #ef4444; font-weight: 700; }

/* ===== OFERTAS ===== */
.ofertas-grid { display: flex; flex-direction: column; gap: 14px; }
.oferta-item-card {
  background: #fff;
  border: 1px solid rgba(0,0,0,0.08);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
}
.oferta-item-card.concluido { border-color: rgba(16,185,129,0.3); }
.oferta-item-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 16px;
  background: #fafafa;
  border-bottom: 1px solid rgba(0,0,0,0.06);
}
.oih-left { display: flex; flex-direction: column; gap: 2px; }
.oih-name { font-size: 14px; font-weight: 700; color: #000; }
.oih-code { font-size: 11px; color: rgba(0,0,0,0.4); }
.oih-right { display: flex; align-items: center; gap: 10px; }
.oih-qty { font-size: 13px; font-weight: 700; color: #FF8049; }
.ofertas-vendedores-list { display: flex; flex-direction: column; gap: 0; }
.vendedor-oferta {
  display: flex; justify-content: space-between; align-items: flex-start;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(0,0,0,0.04);
  gap: 12px;
}
.vendedor-oferta:last-child { border-bottom: none; }
.vendedor-oferta.selected { background: rgba(16,185,129,0.03); }
.vo-info { flex: 1; display: flex; flex-direction: column; gap: 8px; }
.vo-vendor { display: flex; align-items: center; gap: 7px; font-size: 13px; }
.vo-vendor b { font-weight: 700; color: #000; }
.vo-opcoes { display: flex; gap: 8px; flex-wrap: wrap; }
.indicador-oferta {
  font-size: 11px; color: rgba(0,0,0,0.5);
  padding-left: 4px; margin-top: 4px;
  font-style: italic;
}
.opcao-mini {
  display: flex; justify-content: center; gap: 6px;
  background: #fafafa;
  border: 1px solid rgba(0,0,0,0.06);
  border-radius: 7px; padding: 5px 10px;
  font-size: 14px; color: #000;
  transition: all .2s;
  flex-direction: column;
}
.opcao-mini.chosen { background: rgba(16,185,129,0.1); border-color: #10b981; }
.opcao-mini.eq { border-style: dashed; }
.opcao-label {
  font-size: 12px; font-weight: 800; letter-spacing: .05em;
  background: rgba(255, 128, 73, 0.15); color: #FF8049;
  padding: 1px 5px; border-radius: 4px;
  width: 80px;
}
.opcao-label.eq { background: rgba(99,102,241,0.15); color: #6366f1; }
.chosen-badge { color: #059669; }
.code-mini { font-size: 10px; color: rgba(0,0,0,0.4); }
.vo-obs { font-size: 13px; color: rgba(0,0,0,0.7); font-style: italic; margin-top: 4px; padding-left: 10px; }
.vo-actions { display: flex; gap: 6px; flex-direction: column; align-items: flex-end; }
.sel-btn, .desel-btn {
  display: flex; align-items: center; gap: 5px;
  padding: 5px 11px; border-radius: 6px; font-size: 11px; font-weight: 700;
  cursor: pointer; border: none; transition: all .2s; font-family: 'DM Sans', sans-serif;
  white-space: nowrap;
}
.sel-btn { background: rgba(16,185,129,0.1); color: #059669; border: 1px solid rgba(16,185,129,0.3); }
.sel-btn:hover { background: #10b981; color: #fff; }
.sel-btn.eq { background: rgba(99,102,241,0.1); color: #4f46e5; border-color: rgba(99,102,241,0.3); }
.sel-btn.eq:hover { background: #6366f1; color: #fff; }
.desel-btn { background: rgba(239,68,68,0.1); color: #ef4444; border: 1px solid rgba(239,68,68,0.25); }
.desel-btn:hover { background: #ef4444; color: #fff; }
.extra-faturamento { padding: 8px 16px 12px; }
.link-btn {
  background: none; border: none; color: #FF8049;
  cursor: pointer; font-size: 12px; display: flex; align-items: center; gap: 6px;
  font-family: 'DM Sans', sans-serif; transition: color .2s; padding: 0;
}
.link-btn:hover { color: #000; }

.conclude-bar {
  display: flex; justify-content: space-between; align-items: center;
  background: #fafafa; border: 1px solid rgba(0,0,0,0.08);
  border-radius: 10px; padding: 14px 18px; margin-top: 16px;
}
.conclude-hint { font-size: 13px; color: rgba(0,0,0,0.6); display: flex; align-items: center; gap: 8px; }

/* ===== VENDEDORES ===== */
.vendedores-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; }
.vendedor-card {
  background: #fff;
  border: 1px solid rgba(0,0,0,0.08);
  border-radius: 12px; padding: 16px;
  display: flex; flex-direction: column; gap: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
}
.vc-avatar { position: relative; align-self: flex-start; }
.vc-avatar img { width: 46px; height: 46px; border-radius: 50%; object-fit: cover; }
.vc-initials {
  width: 46px; height: 46px; border-radius: 50%;
  background: rgba(255, 128, 73, 0.1); color: #FF8049;
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; font-weight: 700;
}
.vc-status {
  position: absolute; bottom: 2px; right: 2px;
  width: 11px; height: 11px; border-radius: 50%;
  border: 2px solid #fff;
}
.vc-status.ativo { background: #10b981; }
.vc-status.inativo { background: #9ca3af; }
.vc-info { display: flex; flex-direction: column; gap: 2px; }
.vc-name { font-size: 14px; font-weight: 700; color: #000; }
.vc-user, .vc-email { font-size: 11px; color: rgba(0,0,0,0.5); }
.vc-stats { display: flex; gap: 16px; }
.vc-stat { display: flex; flex-direction: column; gap: 1px; }
.vc-stat b { font-size: 15px; font-weight: 700; color: #FF8049; }
.vc-stat span { font-size: 10px; color: rgba(0,0,0,0.4); text-transform: uppercase; letter-spacing: .05em; }

/* ===== SUGESTÃO ===== */
.sugestao-hint {
  display: flex; align-items: center; gap: 8px;
  font-size: 13px; color: rgba(0,0,0,0.6);
}

/* ===== MODAIS ===== */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: center;
  z-index: 100;
  padding: 20px;
}
.modal-box {
  background: #fff;
  border: 1px solid rgba(0,0,0,0.1);
  border-radius: 14px;
  width: 100%; max-width: 560px;
  max-height: 90vh; overflow-y: auto;
  animation: slideUp .25s ease;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
}
@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: none; opacity: 1; } }
.modal-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(0,0,0,0.05);
  font-size: 14px; font-weight: 700; color: #000;
}
.modal-close {
  background: none; border: none; color: rgba(0,0,0,0.4);
  cursor: pointer; font-size: 14px; padding: 4px;
  transition: color .2s;
}
.modal-close:hover { color: #FF8049; }
.modal-body { padding: 20px; }
.modal-prod-name { font-size: 15px; font-weight: 700; color: #FF8049; margin-bottom: 16px; }
.modal-hint { font-size: 14px; color: rgba(0,0,0,0.7); margin-bottom: 18px; }
.modal-footer {
  display: flex; justify-content: flex-end; gap: 10px;
  padding: 14px 20px;
  border-top: 1px solid rgba(0,0,0,0.05);
}

/* form */
.form-row { display: flex; gap: 12px; flex-wrap: wrap; }
.form-group { display: flex; flex-direction: column; gap: 5px; flex: 1; min-width: 120px; }
.form-group label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .07em; color: #FF8049; }
.form-input {
  background: #fff;
  border: 1px solid rgba(0,0,0,0.15);
  color: #000; border-radius: 7px; padding: 8px 11px;
  font-size: 13px; font-family: 'DM Sans', sans-serif;
  outline: none; width: 100%;
  transition: border-color .2s;
}
.form-input:focus { border-color: #FF8049; }
.form-input option { background: #fff; color: #000; }

/* catalogo */
.catalogo-list {
  max-height: 200px; overflow-y: auto;
  border: 1px solid rgba(0,0,0,0.1);
  border-radius: 8px; overflow: hidden;
}
.catalogo-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 9px 12px;
  cursor: pointer; font-size: 13px; color: #000;
  border-bottom: 1px solid rgba(0,0,0,0.05);
  transition: background .15s;
}
.catalogo-item:last-child { border-bottom: none; }
.catalogo-item:hover { background: rgba(255, 128, 73, 0.05); }
.catalogo-item.selected { background: rgba(255, 128, 73, 0.15); color: #FF8049; }
.catalogo-item-info { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
.catalogo-barcode { font-size: 11px; }
.catalogo-item-right { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
.catalogo-arrow { font-size: 12px; color: #cbd5e1; }
.prod-price { font-size: 12px; color: rgba(0,0,0,0.4); }

/* Paginação do catálogo */
.catalogo-pagination {
  display: flex; align-items: center; justify-content: center; gap: 12px;
  padding: 8px 0 4px;
}
.pag-btn {
  width: 30px; height: 30px; border-radius: 8px;
  background: #f1f5f9; border: none; color: #475569;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all .15s; font-size: 12px;
}
.pag-btn:disabled { opacity: .35; cursor: not-allowed; }
.pag-info { font-size: 12px; color: #64748b; }

/* Loading inline no catálogo */
.catalogo-loading-inline {
  display: flex; align-items: center; gap: 8px;
  font-size: 13px; color: #94a3b8; padding: 12px 0;
}
.loading-spinner-sm {
  width: 16px; height: 16px; border-radius: 50%;
  border: 2px solid #e2e8f0; border-top-color: #FF8049;
  animation: spin-sm .7s linear infinite; flex-shrink: 0;
}
@keyframes spin-sm { to { transform: rotate(360deg); } }

/* Botão limpar busca inline */
.sb-clear-inline {
  background: none; border: none; color: rgba(0,0,0,0.3);
  cursor: pointer; font-size: 12px; padding: 2px;
  display: flex; align-items: center;
  transition: color .15s;
}
.sb-clear-inline:hover { color: #FF8049; }

/* Card do produto selecionado */
.selected-prod-detail {
  background: #fff8f5;
  border: 1px solid rgba(255,128,73,.25);
  border-radius: 12px; padding: 12px 14px;
  margin-bottom: 14px;
}
.selected-prod-detail-top { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 10px; }
.spd-icon { font-size: 22px; color: #FF8049; flex-shrink: 0; margin-top: 2px; }
.spd-info { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
.spd-name { font-size: 13px; font-weight: 700; color: #1e293b; line-height: 1.3; }
.spd-barcode { font-size: 11px; color: #64748b; }
.spd-prices {
  display: flex; flex-wrap: wrap; gap: 10px;
  padding: 8px 0; border-top: 1px solid rgba(255,128,73,.15);
  margin-bottom: 10px;
}
.spd-price-item { display: flex; flex-direction: column; gap: 1px; min-width: 55px; }
.spd-price-label { font-size: 9px; text-transform: uppercase; letter-spacing: .4px; color: #94a3b8; font-weight: 700; }
.spd-price-val { font-size: 13px; font-weight: 600; color: #1e293b; }
.spd-price-val.pos { color: #059669; }
.spd-price-val.neg { color: #dc2626; }
.trocar-prod-btn {
  display: flex; align-items: center; gap: 5px;
  background: none; border: 1px solid #e2e8f0;
  border-radius: 8px; padding: 5px 12px;
  font-size: 12px; color: #64748b; cursor: pointer;
  transition: all .15s; font-family: 'DM Sans', sans-serif;
}
.trocar-prod-btn:hover { background: #f1f5f9; border-color: #cbd5e1; }

/* ===== EXPORT MODAL ===== */
.export-overlay { align-items: center; }

.export-modal-box {
  max-width: 680px;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 30px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(255,128,73,0.12);
  border: none;
  overflow: hidden;
}

.export-modal-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 20px 24px 16px;
  background: linear-gradient(135deg, #FFF 0%, #EEE 100%);
  border-bottom: 2px solid #FF8049;
}
.export-header-left { display: flex; align-items: center; gap: 14px; }
.export-brand-dot {
  width: 36px; height: 36px; border-radius: 10px;
  background: linear-gradient(135deg, #FF8049 0%, #FF5722 100%);
  box-shadow: 0 4px 12px rgba(255,128,73,0.4);
  flex-shrink: 0;
}
.export-modal-title { font-size: 16px; font-weight: 800; color: #222; letter-spacing: -.01em; }
.export-modal-sub { font-size: 11px; color: #444; margin-top: 1px; letter-spacing: .05em; text-transform: uppercase; }

.export-cotacao-info {
  display: flex; align-items: center; gap: 0; flex-wrap: wrap;
  background: #FAFAFA;
  border-bottom: 1px solid rgba(0,0,0,0.07);
  padding: 12px 24px;
}
.eci-item { display: flex; flex-direction: column; gap: 2px; padding: 4px 16px; }
.eci-item:first-child { padding-left: 0; }
.eci-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: rgba(0,0,0,0.4); }
.eci-value { font-size: 13px; font-weight: 700; color: #000; }
.eci-divider { width: 1px; height: 28px; background: rgba(0,0,0,0.1); margin: 0 4px; }

.export-modal-body { padding: 20px 24px; display: flex; flex-direction: column; gap: 14px; }

.export-section {
  border: 1px solid rgba(0,0,0,0.08);
  border-radius: 12px;
  padding: 16px;
  background: #FAFAFA;
  transition: border-color .2s, box-shadow .2s;
}
.export-section:hover {
  border-color: rgba(255,128,73,0.25);
  box-shadow: 0 4px 16px rgba(255,128,73,0.06);
}
.export-section-conclusion {
  border-color: rgba(255,128,73,0.2);
  background: linear-gradient(135deg, rgba(255,128,73,0.03) 0%, rgba(255,87,34,0.03) 100%);
}

.export-section-title {
  display: flex; align-items: center; gap: 12px;
  margin-bottom: 14px;
}
.est-icon {
  width: 36px; height: 36px; border-radius: 9px;
  display: flex; align-items: center; justify-content: center;
  font-size: 15px; flex-shrink: 0;
}
.est-icon-prod { background: rgba(255,128,73,0.12); color: #FF8049; }
.est-icon-offer { background: rgba(99,102,241,0.12); color: #6366f1; }
.est-icon-vendor { background: rgba(16,185,129,0.12); color: #10b981; }
.est-icon-concl { background: rgba(255,128,73,0.15); color: #FF8049; }
.est-name { font-size: 14px; font-weight: 700; color: #000; }
.est-desc { font-size: 12px; color: rgba(0,0,0,0.5); margin-top: 1px; }
.est-badge {
  margin-left: auto; flex-shrink: 0;
  background: rgba(255,128,73,0.12); color: #FF8049;
  font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 20px;
  border: 1px solid rgba(255,128,73,0.2);
}
.est-badge-gold { background: linear-gradient(135deg, rgba(255,128,73,0.15) 0%, rgba(255,193,7,0.15) 100%); color: #d97706; border-color: rgba(255,193,7,0.3); }

.export-card-actions { display: flex; gap: 10px; flex-wrap: wrap; }

.export-btn {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 18px; border-radius: 9px;
  font-size: 13px; font-weight: 700;
  cursor: pointer; border: none;
  font-family: 'DM Sans', sans-serif;
  background: linear-gradient(135deg, #FF8049 0%, #FF5722 100%);
  color: #fff;
  box-shadow: 0 3px 10px rgba(255,128,73,0.3);
  transition: all .2s; white-space: nowrap;
}
.export-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(255,128,73,0.4); }
.export-btn:disabled { opacity: .45; cursor: not-allowed; transform: none; box-shadow: none; }
.export-btn-sub { font-size: 10px; font-weight: 600; opacity: .7; letter-spacing: .05em; }
.export-btn-vendor {
  background: linear-gradient(135deg, #1A1A1A 0%, #333 100%);
  box-shadow: 0 3px 10px rgba(0,0,0,0.15);
}
.export-btn-vendor:hover:not(:disabled) { box-shadow: 0 6px 18px rgba(0,0,0,0.25); }
.export-btn-concl {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  box-shadow: 0 3px 10px rgba(16,185,129,0.3);
}
.export-btn-concl:hover:not(:disabled) { box-shadow: 0 6px 18px rgba(16,185,129,0.4); }
.conclusion-actions { flex-direction: column; gap: 8px; }

.export-vendor-select-wrap { margin-bottom: 4px; }
.export-vendor-grid { display: flex; flex-wrap: wrap; gap: 8px; }
.export-vendor-chip {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 12px; border-radius: 10px;
  border: 1.5px solid rgba(0,0,0,0.08);
  background: #fff; cursor: pointer;
  transition: all .2s; min-width: 200px;
}
.export-vendor-chip:hover { border-color: rgba(255,128,73,0.4); background: rgba(255,128,73,0.03); }
.export-vendor-chip.active { border-color: #FF8049; background: rgba(255,128,73,0.06); box-shadow: 0 0 0 3px rgba(255,128,73,0.12); }
.evc-initials {
  width: 32px; height: 32px; border-radius: 8px; flex-shrink: 0;
  background: rgba(255,128,73,0.12); color: #FF8049;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 800;
}
.export-vendor-chip.active .evc-initials { background: #FF8049; color: #fff; }
.evc-info { display: flex; flex-direction: column; gap: 1px; flex: 1; min-width: 0; }
.evc-name { font-size: 13px; font-weight: 700; color: #000; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.evc-email { font-size: 10px; color: rgba(0,0,0,0.45); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.evc-count {
  font-size: 11px; font-weight: 700; color: #FF8049;
  background: rgba(255,128,73,0.1); padding: 2px 8px; border-radius: 10px; flex-shrink: 0;
}
.export-empty-hint { font-size: 13px; color: rgba(0,0,0,0.4); display: flex; align-items: center; gap: 6px; padding: 8px 0; }
.export-hint-note { font-size: 11px; color: rgba(0,0,0,0.4); display: flex; align-items: center; gap: 6px; margin-top: 10px; font-style: italic; }

.export-modal-footer {
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px 24px;
  border-top: 1px solid rgba(0,0,0,0.06);
  background: #FAFAFA;
}
.export-footer-brand { font-size: 11px; color: rgba(0,0,0,0.35); letter-spacing: .04em; }

/* ===== LOADING / EMPTY ===== */
.loading-state, .empty-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 12px; padding: 60px 0; color: rgba(0,0,0,0.4); font-size: 14px;
}

/* ===== TOAST ===== */
.toast-container {
  position: fixed; bottom: 20px; right: 20px;
  z-index: 200; display: flex; flex-direction: column; gap: 8px;
}
.toast-item {
  display: flex; align-items: center; gap: 9px;
  padding: 11px 16px; border-radius: 9px;
  font-size: 13px; font-weight: 600;
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  min-width: 220px;
}
.toast-item.success { background: rgba(16,185,129,0.95); color: #fff; }
.toast-item.error { background: rgba(239,68,68,0.95); color: #fff; }
.toast-enter-active, .toast-leave-active { transition: all .3s ease; }
.toast-enter-from { opacity: 0; transform: translateX(30px); }
.toast-leave-to { opacity: 0; transform: translateX(30px); }

/* ===== SCROLLBAR ===== */
::-webkit-scrollbar { width: 5px; height: 5px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #FF8049; }

.tab-disable { cursor: not-allowed; color: rgba(0,0,0,0.3); }
.tab-disable:hover { color: rgba(0,0,0,0.3); }

/* ===== BADGE OFERTAS NA TABELA PRODUTOS ===== */
.ofertas-count-btn {
  display: inline-flex; align-items: center; gap: 5px;
  background: rgba(255,128,73,0.08); border: 1.5px solid rgba(255,128,73,0.25);
  border-radius: 20px; padding: 4px 10px;
  font-size: 12px; font-weight: 600; cursor: pointer;
  color: #c95a1f; transition: all .18s;
  font-family: 'DM Sans', sans-serif; white-space: nowrap;
}
.ofertas-count-btn:hover { background: rgba(255,128,73,0.18); border-color: #FF8049; color: #FF8049; transform: translateY(-1px); }
.ofertas-count-num { font-size: 14px; font-weight: 800; color: #FF8049; }
.ofertas-count-label { font-size: 11px; color: #c95a1f; }

/* ===== MODAL OFERTAS POR PRODUTO ===== */
.ofertas-prod-modal-box { max-width: 820px; }
.ofertas-prod-modal-header {
  background: linear-gradient(135deg, #fff 0%, #fff8f5 100%);
  border-bottom: 2px solid #FF8049;
  display: flex; justify-content: space-between; align-items: center;
  padding: 18px 22px;
}
.opm-header-left { display: flex; align-items: center; gap: 14px; }
.opm-icon {
  width: 40px; height: 40px; border-radius: 10px;
  background: linear-gradient(135deg, #FF8049 0%, #FF5722 100%);
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 17px; box-shadow: 0 4px 12px rgba(255,128,73,0.3);
  flex-shrink: 0;
}
.opm-title { font-size: 15px; font-weight: 800; color: #111; }
.opm-subtitle { font-size: 12px; color: #555; margin-top: 1px; }

.opm-prod-info {
  display: flex; flex-wrap: wrap; gap: 4px;
  background: #f8f9fa; border-bottom: 1px solid rgba(0,0,0,0.07);
  padding: 10px 20px;
}
.opm-pi-item {
  display: flex; align-items: center; gap: 5px;
  font-size: 12px; color: #333;
  background: #fff; border: 1px solid rgba(0,0,0,0.1);
  border-radius: 20px; padding: 3px 10px;
}
.opm-pi-item b { color: #1a1a1a; }

.opm-vencendo-banner {
  display: flex; align-items: center; justify-content: space-between;
  background: linear-gradient(135deg, rgba(255,128,73,0.1) 0%, rgba(255,87,34,0.05) 100%);
  border-bottom: 1px solid rgba(255,128,73,0.2);
  padding: 10px 20px; gap: 12px;
}
.opm-venc-label { font-size: 12px; font-weight: 700; color: #FF8049; display: flex; align-items: center; gap: 6px; }
.opm-venc-info { display: flex; align-items: center; gap: 12px; }
.opm-venc-nome { font-size: 13px; font-weight: 700; color: #1a1a1a; }
.opm-venc-preco { font-size: 15px; font-weight: 800; color: #10b981; background: rgba(16,185,129,0.1); padding: 2px 10px; border-radius: 20px; }

.opm-table-wrap { overflow-x: auto; padding: 0 0 4px; }
.opm-table { margin: 0; }
.opm-row-winner td { background: rgba(255,128,73,0.06) !important; }
.opm-row-selected td { background: rgba(16,185,129,0.08) !important; }
.opm-row-eq td { background: rgba(99,102,241,0.03); }

.opm-trophy { color: #FF8049; font-size: 15px; display: flex; align-items: center; justify-content: center; }
.opm-rank { font-size: 11px; font-weight: 700; color: rgba(0,0,0,0.4); }
.opm-rank.eq { color: #6366f1; }

.opm-vendor-cell { display: flex; align-items: center; gap: 8px; }
.opm-vendor-avatar {
  width: 28px; height: 28px; border-radius: 8px;
  background: rgba(255,128,73,0.12); color: #FF8049;
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 800; flex-shrink: 0;
}
.opm-vendor-avatar.eq { background: rgba(99,102,241,0.12); color: #6366f1; }
.opm-vendor-nome { display: block; font-size: 12px; font-weight: 700; color: #1a1a1a; }
.opm-vendor-email { display: block; font-size: 10px; color: #888; }
.opm-chosen-tag {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 10px; font-weight: 700; color: #059669;
  background: rgba(16,185,129,0.12); padding: 2px 7px; border-radius: 10px;
  flex-shrink: 0;
}
.opm-opcao-tag {
  display: inline-block; font-size: 10px; font-weight: 700;
  background: rgba(255,128,73,0.1); color: #FF8049;
  padding: 2px 7px; border-radius: 10px; white-space: nowrap;
}
.opm-opcao-tag.eq { background: rgba(99,102,241,0.1); color: #6366f1; }
.opm-preco { font-size: 13px; font-weight: 700; color: #1a1a1a; }
.opm-preco-winner { color: #FF8049; font-size: 14px; }

/* ===== TAB VERIFICAR PEDIDO ===== */
.verificar-pedido-wrap { padding: 20px 24px; display: flex; flex-direction: column; gap: 14px; }

.vp-vendedor-card {
  background: #fff; border: 1.5px solid rgba(0,0,0,0.08);
  border-radius: 14px; overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.04);
  transition: box-shadow .2s, border-color .2s;
}
.vp-vendedor-card:hover { border-color: rgba(255,128,73,0.25); box-shadow: 0 4px 20px rgba(255,128,73,0.08); }

.vp-vendedor-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 16px 20px; cursor: pointer;
  background: linear-gradient(135deg, #fafafa 0%, #fff 100%);
  transition: background .15s;
}
.vp-vendedor-header:hover { background: rgba(255,128,73,0.03); }

.vp-vend-left { display: flex; align-items: center; gap: 14px; }
.vp-avatar {
  width: 44px; height: 44px; border-radius: 12px; overflow: hidden; flex-shrink: 0;
  background: rgba(255,128,73,0.1); display: flex; align-items: center; justify-content: center;
}
.vp-avatar img { width: 100%; height: 100%; object-fit: cover; }
.vp-avatar-initials { font-size: 15px; font-weight: 800; color: #FF8049; }
.vp-vend-info { display: flex; flex-direction: column; gap: 2px; }
.vp-vend-nome { font-size: 14px; font-weight: 800; color: #111; }
.vp-vend-email { font-size: 11px; color: #888; }

.vp-vend-stats { display: flex; align-items: center; gap: 16px; }
.vp-stat-item { display: flex; flex-direction: column; align-items: flex-end; gap: 1px; }
.vp-stat-label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; color: #999; }
.vp-stat-value { font-size: 15px; font-weight: 800; }
.vp-stat-value.accent { color: #FF8049; }
.vp-stat-value.green { color: #10b981; }
.vp-stat-divider { width: 1px; height: 32px; background: rgba(0,0,0,0.1); }
.vp-expand-icon { color: #999; font-size: 13px; margin-left: 8px; }

/* Produtos expandidos */
.vp-produtos-lista {
  border-top: 1.5px solid rgba(255,128,73,0.15);
  background: #fdfcfb;
}

.vp-produtos-header-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1.4fr;
  padding: 8px 20px;
  background: linear-gradient(135deg, rgba(255,128,73,0.08) 0%, rgba(255,87,34,0.04) 100%);
  border-bottom: 1px solid rgba(255,128,73,0.15);
  gap: 8px;
}
.vp-produtos-header-row span {
  font-size: 10px; font-weight: 700; text-transform: uppercase;
  letter-spacing: .07em; color: #FF8049;
}

.vp-produto-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1.4fr;
  padding: 10px 20px; gap: 8px; align-items: center;
  border-bottom: 1px solid rgba(0,0,0,0.04);
  transition: background .12s;
}
.vp-produto-row.even { background: #fff; }
.vp-produto-row.odd { background: rgba(0,0,0,0.015); }
.vp-produto-row:hover { background: rgba(255,128,73,0.03); }

.vpp-col-prod { display: flex; flex-direction: column; gap: 2px; }
.vpp-nome { font-size: 13px; font-weight: 700; color: #1a1a1a; }
.vpp-code { font-size: 10px; color: #888; }
.vpp-qtd-badge {
  display: inline-flex; align-items: center; gap: 3px;
  font-size: 13px; font-weight: 700; color: #1a1a1a;
  background: rgba(0,0,0,0.05); padding: 3px 8px; border-radius: 8px;
}
.vpp-qtd-badge small { font-size: 10px; color: #666; font-weight: 500; }
.vpp-preco { font-size: 13px; font-weight: 700; color: #1a1a1a; }
.vpp-subtotal { font-size: 13px; font-weight: 800; color: #10b981; }

.vpp-col-acoes { display: flex; gap: 5px; flex-wrap: wrap; }
.vpp-action-btn {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 11px; font-weight: 700; padding: 4px 10px;
  border-radius: 8px; cursor: pointer; border: 1.5px solid;
  font-family: 'DM Sans', sans-serif; transition: all .15s; white-space: nowrap;
}
.vpp-btn-mover {
  color: #FF8049; border-color: rgba(255,128,73,0.35);
  background: rgba(255,128,73,0.06);
}
.vpp-btn-mover:hover { background: rgba(255,128,73,0.14); border-color: #FF8049; }
.vpp-btn-qtd {
  color: #334155; border-color: rgba(0,0,0,0.18);
  background: #fff;
}
.vpp-btn-qtd:hover { background: #f1f5f9; border-color: rgba(0,0,0,0.3); }

.vp-rodape-vend {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 20px;
  background: linear-gradient(135deg, rgba(255,128,73,0.04) 0%, #fff 100%);
  border-top: 1px solid rgba(255,128,73,0.1);
  flex-wrap: wrap; gap: 10px;
}
.vp-fat-btn { font-size: 12px; padding: 6px 14px; }
.vp-total-vend { display: flex; align-items: center; gap: 8px; }
.vp-total-label { font-size: 12px; font-weight: 600; color: #555; }
.vp-total-val { font-size: 16px; font-weight: 800; color: #10b981; }

.vp-total-geral {
  display: flex; align-items: center; justify-content: flex-end; gap: 12px;
  background: linear-gradient(135deg, #1a1a1a 0%, #333 100%);
  border-radius: 14px; padding: 16px 24px;
  margin-top: 4px;
}
.vp-tg-label { font-size: 13px; font-weight: 700; color: rgba(255,255,255,0.7); text-transform: uppercase; letter-spacing: .06em; }
.vp-tg-val { font-size: 22px; font-weight: 800; color: #fff; }

/* ===== MODAL MOVER PRODUTO ===== */
.mover-prod-info {
  background: rgba(255,128,73,0.06); border: 1.5px solid rgba(255,128,73,0.2);
  border-radius: 10px; padding: 12px 16px; margin-bottom: 4px;
}
.mover-prod-nome { font-size: 14px; font-weight: 700; color: #1a1a1a; display: flex; align-items: center; gap: 7px; margin-bottom: 4px; }
.mover-prod-detalhe { font-size: 12px; color: #555; }
.mover-vend-atual { font-weight: 700; color: #FF8049; margin-left: 4px; }

.mover-vendedores-lista { display: flex; flex-direction: column; gap: 8px; max-height: 280px; overflow-y: auto; }
.mover-vend-item {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 14px; border-radius: 10px;
  border: 1.5px solid rgba(0,0,0,0.08);
  background: #fff; cursor: pointer; transition: all .18s;
}
.mover-vend-item:hover { border-color: rgba(255,128,73,0.35); background: rgba(255,128,73,0.03); }
.mover-vend-item.active { border-color: #FF8049; background: rgba(255,128,73,0.07); box-shadow: 0 0 0 3px rgba(255,128,73,0.1); }
.mv-avatar { flex-shrink: 0; }
.mv-initials {
  width: 32px; height: 32px; border-radius: 8px;
  background: rgba(255,128,73,0.12); color: #FF8049;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 800;
}
.mv-info { flex: 1; min-width: 0; }
.mv-nome { display: block; font-size: 13px; font-weight: 700; color: #1a1a1a; }
.mv-email { display: block; font-size: 10px; color: #888; }
.mv-stats { font-size: 11px; color: #64748b; white-space: nowrap; flex-shrink: 0; }

.botaoAtivado-produto{
  cursor: pointer !important;
}

/* Verificar pedido sem coluna de ações (status concluída) */
.vp-header-sem-acoes,
.vp-row-sem-acoes {
  grid-template-columns: 2fr 1fr 1fr 1fr !important;
}

/* Produto com oferta selecionada — borda verde indicativa */
.produto-selecionado-auto {
  outline: 2px solid rgba(16, 185, 129, 0.55) !important;
  outline-offset: -2px;
  background: rgba(16, 185, 129, 0.05) !important;
  position: relative;
}
.produto-selecionado-auto td:first-child {
  border-left: 4px solid #10b981 !important;
}

/* Botões seleção automática na aba Produtos */
.btn-auto-select {
  background: rgba(99, 102, 241, 0.08);
  color: #4f46e5;
  border: 1.5px solid rgba(99, 102, 241, 0.3);
  font-size: 12px;
  padding: 6px 14px;
  border-radius: 8px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-weight: 700;
  font-family: 'DM Sans', sans-serif;
  transition: all .15s;
  white-space: nowrap;
}
.btn-auto-select:hover {
  background: rgba(99, 102, 241, 0.16);
  border-color: #4f46e5;
}
.btn-auto-select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.btn-remove-select {
  background: rgba(239, 68, 68, 0.07);
  color: #dc2626;
  border: 1.5px solid rgba(239, 68, 68, 0.25);
  font-size: 12px;
  padding: 6px 14px;
  border-radius: 8px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-weight: 700;
  font-family: 'DM Sans', sans-serif;
  transition: all .15s;
  white-space: nowrap;
}
.btn-remove-select:hover {
  background: rgba(239, 68, 68, 0.14);
  border-color: #dc2626;
}
.btn-remove-select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* === CALENDAR === */
:deep(.calendar-custom .p-inputtext) {
  background: transparent;
  border: 1px solid #ccc;
  border-radius: 5px;
  height: 50px;
  width: 100%;
  font-family: 'Poppins', sans-serif;
}

:deep(.calendar-custom .p-button) {
  background: transparent;
  border: none;
}

:deep(.calendar-custom),
:deep(.calendar-custom .p-inputtext),
:deep(.calendar-custom .p-datepicker-trigger) {
  width: 100% !important;
}

:deep(.calendar-custom .p-inputtext) {
  display: block;
}


.historico-btn{
  border: 1px solid #ff8049;
  color: #c5460f;
  font-family: 'Poppins';
  background-color: #fff;
  font-weight: 500;
}


.historico-btn:hover{
  border: 1px solid #ff8049;
  color: #c5460f;
  font-family: 'Poppins';
  background-color: #e7e7e7;
  font-weight: 500;
  cursor: pointer;
  transition: 0.5s;
}

.hist-context-card {
  display: flex; align-items: center; gap: 10px;
  background: rgba(255,128,73,0.06); border: 1.5px solid rgba(255,128,73,0.2);
  border-radius: 10px; padding: 12px 16px;
}
.hist-context-nome { font-size: 14px; font-weight: 700; color: #1a1a1a; }

.hist-metricas-row {
  display: flex; gap: 12px; margin-top: 16px; flex-wrap: wrap;
}
.hist-metrica {
  flex: 1; min-width: 140px;
  background: #fff; border: 1.5px solid rgba(0,0,0,0.06);
  border-radius: 10px; padding: 10px 14px;
  display: flex; flex-direction: column; gap: 4px;
}
.hist-metrica-label { font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: .04em; }
.hist-metrica-valor { font-size: 18px; font-weight: 800; color: #1a1a1a; }
.hist-metrica-valor.green { color: #10b981; }

.hist-cotacoes-lista {
   margin-top: 20px;
   margin-top: 20px;
   min-height: 400px;
   overflow-y: scroll; padding-right: 4px;
}
.hist-cotacao-card {
  border: 1.5px solid rgba(0,0,0,0.08); border-radius: 12px; overflow: hidden;
  background: #fff;
}
.hist-cotacao-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px; cursor: pointer; transition: background .15s;
}
.hist-cotacao-header:hover { background: rgba(255,128,73,0.04); }
.hist-cotacao-left { display: flex; align-items: center; }
.hist-cotacao-nome { font-size: 13px; font-weight: 700; color: #1a1a1a; }
.hist-cotacao-right { display: flex; align-items: center; gap: 12px; }
.hist-cotacao-data { font-size: 12px; color: #64748b; }
.hist-cotacao-preco { font-size: 14px; font-weight: 800; color: #1a1a1a; }
.hist-cotacao-preco.green { color: #10b981; }

.hist-cotacao-sub {
  padding: 0 16px 10px 16px; font-size: 12px; color: #555;
  display: flex; align-items: center; gap: 6px;
}

.hist-detalhe {
  border-top: 1px solid rgba(0,0,0,0.06);
  min-height: 160px;
  overflow-y: auto;
  background: rgba(0,0,0,0.015);
  padding: 12px 16px;
}

/* ════════════════════════════════════════════
   MODAL
════════════════════════════════════════════ */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
}

.modal-card {
  background: #ffffff;
  border-radius: 16px;
  width: 100%;
  max-width: 620px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.18);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Header do Modal */
.modal-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.4rem 1.6rem;
  border-bottom: 1px solid #f1f5f9;
}

.modal-header-icon {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #ff8049, #ff6020);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.modal-header-icon .material-symbols-outlined {
  color: #ffffff;
  font-size: 22px;
}

.modal-title {
  font-size: 1.05rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.modal-subtitle {
  font-size: 0.82rem;
  color: #64748b;
  margin: 2px 0 0 0;
}

.modal-close-btn {
  margin-left: auto;
  background: none;
  border: none;
  cursor: pointer;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  padding: 4px;
  transition: background 0.15s, color 0.15s;
}

.modal-close-btn:hover {
  background: #f1f5f9;
  color: #475569;
}

/* Body do Modal */
.modal-body {
  padding: 1.4rem 1.6rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  max-height: 65vh;
  overflow-y: auto;
}

/* Cards de Status */
.status-card {
  border-radius: 10px;
  padding: 1rem 1.2rem;
  border-left: 4px solid transparent;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.status-card--indisponivel {
  background: #f8fafc;
  border-left-color: #94a3b8;
}

.status-card--aberta {
  background: #f0fdf4;
  border-left-color: #22c55e;
}

.status-card--fechada {
  background: #fff7f3;
  border-left-color: #ff8049;
}

.status-card--finalizada {
  background: #eff6ff;
  border-left-color: #3b82f6;
}

.status-card-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.status-card-badge .material-symbols-outlined {
  font-size: 18px;
}

.status-card--indisponivel .status-card-badge { color: #64748b; }
.status-card--aberta      .status-card-badge { color: #16a34a; }
.status-card--fechada     .status-card-badge { color: #ff8049; }
.status-card--finalizada  .status-card-badge { color: #2563eb; }

.status-card-desc {
  font-size: 0.875rem;
  color: #475569;
  line-height: 1.6;
  margin: 0;
}

/* Footer do Modal */
.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.2rem 1.6rem;
  border-top: 1px solid #f1f5f9;
  gap: 0.75rem;
}

.btn-nunca-mais {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: #94a3b8;
  font-family: 'Poppins', sans-serif;
  font-size: 0.82rem;
  cursor: pointer;
  padding: 6px 8px;
  border-radius: 6px;
  transition: color 0.15s, background 0.15s;
}

.btn-nunca-mais:hover {
  color: #64748b;
  background: #f8fafc;
}

.btn-nunca-mais .material-symbols-outlined {
  font-size: 17px;
}

.btn-entendi {
  display: flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #ff8049, #ff6020);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1.4rem;
  font-family: 'Poppins', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.15s;
}

.btn-entendi:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn-entendi .material-symbols-outlined {
  font-size: 18px;
}

/* Animação de entrada/saída do modal */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}

.modal-fade-enter-active .modal-card,
.modal-fade-leave-active .modal-card {
  transition: transform 0.25s ease, opacity 0.25s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .modal-card,
.modal-fade-leave-to .modal-card {
  transform: translateY(20px);
  opacity: 0;
}


.video-container {
    position: relative;
    width: 100%;
    max-width: 800px;
    margin: auto;
    background: #000;
}

video {
    width: 100%;
    display: block;
}

.play-button {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    
    width: 80px;
    height: 80px;
    border: none;
    border-radius: 50%;

    background: #ff8049;
    color: white;
    font-size: 32px;
    cursor: pointer;

    display: flex;
    align-items: center;
    justify-content: center;

    transition: 0.2s;
}

.play-button:hover {
    transform: translate(-50%, -50%) scale(1.05);
}

.fullscreen-button {
    position: absolute;
    right: 15px;
    bottom: 15px;

    width: 42px;
    height: 42px;

    border: none;
    border-radius: 8px;

    background: rgba(0,0,0,.7);
    color: white;
    cursor: pointer;
    font-size: 20px;
}


:deep(.p-datepicker) {
  z-index: 10000 !important;
}

:deep(.p-component-overlay) {
  z-index: 9999 !important;
}

</style>