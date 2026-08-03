<template>
  <div class="dashboard-root">
    <div class="main-area">

      <!-- ═══════════════════ TOPBAR ═══════════════════ -->
      <div class="topbar">
        <div class="topbar-brand">
          <div class="brand-icon">
            <span class="material-symbols-outlined" style="font-size:17px;color:#fff">qr_code_2</span>
          </div>
          <div>
            <div class="topbar-title">Etiquetas QR Code</div>
            <div class="topbar-sub">Controle de Lote · Rastreabilidade · Impressão em Série</div>
          </div>
        </div>
        <div class="topbar-right">
          <div class="impressora-pill" :class="impressoraOnline ? 'online' : 'offline'">
            <span class="impressora-dot"></span>
            Impressora {{ impressoraOnline ? 'Conectada' : 'Offline' }}
          </div>
          <button class="tbtn primary" @click="openModal">
            <span class="material-symbols-outlined" style="font-size:14px">add</span>
            Nova Etiqueta
          </button>
          <button class="tbtn accent2" @click="imprimirSelecionadas" :disabled="selecionadas.length === 0">
            <span class="material-symbols-outlined" style="font-size:14px">print</span>
            Imprimir ({{ selecionadas.length }})
          </button>
          <div class="user-avatar">QR</div>
        </div>
      </div>

      <div class="content">

        <!-- ═══════════════════ SEARCH / FILTER BAR ═══════════════════ -->
        <div class="filter-bar">
          <div class="filter-left">
            <span class="material-symbols-outlined" style="font-size:18px;color:var(--accent)">search</span>
            <div class="search-box-main">
              <input v-model="globalSearch" placeholder="Buscar por produto, lote, código de barras, operador..." class="search-main-input" />
              <span v-if="globalSearch" class="material-symbols-outlined search-clear" @click="globalSearch=''">close</span>
            </div>
            <div class="filter-sep"></div>
            <span class="material-symbols-outlined" style="font-size:16px;color:var(--muted)">calendar_today</span>
            <div class="period-tabs">
              <button v-for="p in periods" :key="p.key" class="ptab"
                :class="{ active: activePeriod === p.key }" @click="activePeriod = p.key">{{ p.label }}</button>
            </div>
          </div>
          <div class="filter-right">
            <div class="select-wrap">
              <select v-model="filterStatus" class="sel-input">
                <option value="">Todos os status</option>
                <option value="Impresso">Impresso</option>
                <option value="Pendente">Pendente</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>
            <div class="select-wrap">
              <select v-model="filterCategoria" class="sel-input">
                <option value="">Todas as categorias</option>
                <option value="Alimentos">Alimentos</option>
                <option value="Medicamentos">Medicamentos</option>
                <option value="Cosméticos">Cosméticos</option>
                <option value="Eletrônicos">Eletrônicos</option>
              </select>
            </div>
            <span class="filter-sub">{{ filteredEtiquetas.length }} etiquetas encontradas</span>
          </div>
        </div>

        <!-- ═══════════════════ KPIs ═══════════════════ -->
        <div class="kpi-grid">
          <div v-for="kpi in kpis" :key="kpi.label" class="kpi-card" :class="kpi.accent">
            <div class="kpi-label">
              <span class="material-symbols-outlined" style="font-size:15px;margin-right:3px">{{ kpi.icon }}</span>
              {{ kpi.label }}
            </div>
            <div class="kpi-value">{{ kpi.value }}</div>
            <div class="kpi-footer">
              <span :class="['kpi-delta', kpi.trendUp ? 'up' : 'down']" v-if="kpi.trend">
                <span class="material-symbols-outlined" style="font-size:12px">{{ kpi.trendUp ? 'trending_up' : 'trending_down' }}</span>
                {{ kpi.trend }}
              </span>
              <span class="kpi-sub">{{ kpi.sub }}</span>
            </div>
            <span class="material-symbols-outlined kpi-bg-icon">{{ kpi.icon }}</span>
          </div>
        </div>

        <!-- ═══════════════════ LAYOUT PRINCIPAL ═══════════════════ -->
        <div class="grid-2-1">

          <!-- ════ TABELA DE ETIQUETAS ════ -->
          <div class="card">
            <div class="card-head">
              <div class="card-icon c-orange">
                <span class="material-symbols-outlined">inventory_2</span>
              </div>
              <div>
                <div class="card-title">Etiquetas Geradas</div>
                <div class="card-sub">Histórico de impressões · {{ filteredEtiquetas.length }} registros</div>
              </div>
              <div class="card-actions">
                <button class="tbtn" @click="selectAll">
                  <span class="material-symbols-outlined" style="font-size:13px">checklist</span>Sel. todos
                </button>
                <button class="tbtn primary" @click="openModal">
                  <span class="material-symbols-outlined" style="font-size:13px">add</span>Nova Etiqueta
                </button>
              </div>
            </div>

            <!-- BARRA DE AÇÃO EM LOTE -->
            <div class="selection-bar" v-if="selecionadas.length > 0">
              <span class="material-symbols-outlined" style="font-size:15px;color:var(--accent)">check_circle</span>
              <span><strong>{{ selecionadas.length }}</strong> selecionadas</span>
              <div class="sel-actions">
                <button class="tbtn" @click="imprimirSelecionadas">
                  <span class="material-symbols-outlined" style="font-size:13px">print</span>Imprimir
                </button>
                <button class="tbtn" @click="exportarSelecionadas">
                  <span class="material-symbols-outlined" style="font-size:13px">download</span>Exportar PDF
                </button>
                <button class="tbtn danger" @click="selecionadas=[]">
                  <span class="material-symbols-outlined" style="font-size:13px">close</span>Limpar
                </button>
              </div>
            </div>

            <div class="table-wrap">
              <table class="fiscal-table">
                <thead>
                  <tr>
                    <th style="width:36px"><input type="checkbox" class="chk" @change="toggleSelectAll" /></th>
                    <th>PRODUTO</th>
                    <th>CÓD. BARRAS</th>
                    <th>LOTE</th>
                    <th>VALIDADE</th>
                    <th>QTD.</th>
                    <th>STATUS</th>
                    <th>IMPRESSO EM</th>
                    <th style="width:100px">AÇÕES</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="et in paginatedEtiquetas" :key="et.id"
                    :class="{ 'row-selected': selecionadas.includes(et.id) }">
                    <td><input type="checkbox" class="chk" :checked="selecionadas.includes(et.id)" @change="toggleSelecionada(et.id)" /></td>
                    <td>
                      <div class="cell-name">{{ et.produto }}</div>
                      <div class="cell-sub">{{ et.categoria }}</div>
                    </td>
                    <td><span class="mono-bold">{{ et.codigoBarras }}</span></td>
                    <td>
                      <span class="lote-badge">{{ et.lote }}</span>
                    </td>
                    <td>
                      <div style="font-size:11.5px;font-weight:600;" :class="{ 'text-red': isVencido(et.validade), 'text-yellow': isProximoVencer(et.validade) }">
                        {{ et.validade }}
                      </div>
                      <div class="cell-sub">{{ diasRestantes(et.validade) }}</div>
                    </td>
                    <td>
                      <div class="mono-bold">{{ et.quantidade }}</div>
                      <div class="cell-sub">etiquetas</div>
                    </td>
                    <td>
                      <div class="status-cell">
                        <span class="status-dot" :class="'dot-'+statusClass(et.status)"></span>
                        <span class="tag-custom" :class="tagClass(et.status)">{{ et.status }}</span>
                      </div>
                    </td>
                    <td>
                      <div style="font-size:11.5px">{{ et.impressoEm }}</div>
                      <div class="cell-sub">{{ et.operador }}</div>
                    </td>
                    <td>
                      <div class="row-actions">
                        <button class="icon-btn" title="Visualizar QR" @click="abrirPreview(et)">
                          <span class="material-symbols-outlined" style="font-size:14px">qr_code</span>
                        </button>
                        <button class="icon-btn" title="Reimprimir" @click="reimprimir(et)">
                          <span class="material-symbols-outlined" style="font-size:14px">print</span>
                        </button>
                        <div class="dropdown" @mouseenter="et.menu=true" @mouseleave="et.menu=false">
                          <button class="icon-btn">
                            <span class="material-symbols-outlined" style="font-size:14px">more_vert</span>
                          </button>
                          <div class="dropdown-menu" v-if="et.menu">
                            <button class="dm-item" @click="duplicar(et)"><span class="material-symbols-outlined" style="font-size:14px">content_copy</span>Duplicar</button>
                            <button class="dm-item" @click="exportarPDF(et)"><span class="material-symbols-outlined" style="font-size:14px">picture_as_pdf</span>Exportar PDF</button>
                            <button class="dm-item danger" @click="cancelar(et)"><span class="material-symbols-outlined" style="font-size:14px">cancel</span>Cancelar</button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="pagination">
              <span class="pag-info">{{ (page-1)*pageSize+1 }}–{{ Math.min(page*pageSize, filteredEtiquetas.length) }} de {{ filteredEtiquetas.length }}</span>
              <div class="pag-btns">
                <button class="pag-btn" :disabled="page===1" @click="page--"><span class="material-symbols-outlined" style="font-size:15px">chevron_left</span></button>
                <span class="pag-num">{{ page }} / {{ totalPages }}</span>
                <button class="pag-btn" :disabled="page===totalPages" @click="page++"><span class="material-symbols-outlined" style="font-size:15px">chevron_right</span></button>
              </div>
            </div>
          </div>

          <!-- ════ PAINEL DIREITO ════ -->
          <div class="right-panel">

            <!-- NOVA ETIQUETA RÁPIDA -->
            <div class="card">
              <div class="card-head">
                <div class="card-icon c-orange"><span class="material-symbols-outlined">bolt</span></div>
                <div><div class="card-title">Emissão Rápida</div><div class="card-sub">Gerar etiqueta de lote</div></div>
              </div>
              <div class="quick-form">

                <div class="form-field">
                  <div class="field-label">Produto</div>
                  <input v-model="quickForm.produto" placeholder="Nome do produto..." class="form-input" />
                </div>

                <div class="form-row-2">
                  <div class="form-field">
                    <div class="field-label">Código de Barras (EAN)</div>
                    <div class="barcode-input-wrap">
                      <span class="material-symbols-outlined" style="font-size:15px;color:var(--muted)">barcode</span>
                      <input v-model="quickForm.codigoBarras" placeholder="0000000000000" class="form-input barcode-input" @input="formatBarcode" maxlength="14" />
                    </div>
                  </div>
                  <div class="form-field">
                    <div class="field-label">Categoria</div>
                    <select v-model="quickForm.categoria" class="form-input">
                      <option value="">Selecione...</option>
                      <option>Alimentos</option>
                      <option>Medicamentos</option>
                      <option>Cosméticos</option>
                      <option>Eletrônicos</option>
                    </select>
                  </div>
                </div>

                <div class="form-row-2">
                  <div class="form-field">
                    <div class="field-label">Número do Lote</div>
                    <input v-model="quickForm.lote" placeholder="LOT-2026-001" class="form-input" />
                  </div>
                  <div class="form-field">
                    <div class="field-label">Data de Fabricação</div>
                    <input type="date" v-model="quickForm.fabricacao" class="form-input" />
                  </div>
                </div>

                <div class="form-row-2">
                  <div class="form-field">
                    <div class="field-label">Data de Validade</div>
                    <input type="date" v-model="quickForm.validade" class="form-input" />
                  </div>
                  <div class="form-field">
                    <div class="field-label">Quantidade de Etiquetas</div>
                    <input type="number" v-model.number="quickForm.quantidade" min="1" max="9999" class="form-input" />
                  </div>
                </div>

                <div class="form-field">
                  <div class="field-label">Observações (opcional)</div>
                  <input v-model="quickForm.obs" placeholder="Info adicional no QR code..." class="form-input" />
                </div>

                <!-- PREVIEW DO QR CODE -->
                <div class="qr-preview-box" v-if="quickFormValido">
                  <div class="qr-preview-inner">
                    <div class="qr-svg-wrap">
                      <!-- QR Code SVG simulado via padrão de blocos -->
                      <svg :width="80" :height="80" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
                        <rect width="21" height="21" fill="white"/>
                        <g fill="#1e293b">
                          <!-- Canto superior esquerdo -->
                          <rect x="0" y="0" width="7" height="7"/>
                          <rect x="1" y="1" width="5" height="5" fill="white"/>
                          <rect x="2" y="2" width="3" height="3"/>
                          <!-- Canto superior direito -->
                          <rect x="14" y="0" width="7" height="7"/>
                          <rect x="15" y="1" width="5" height="5" fill="white"/>
                          <rect x="16" y="2" width="3" height="3"/>
                          <!-- Canto inferior esquerdo -->
                          <rect x="0" y="14" width="7" height="7"/>
                          <rect x="1" y="15" width="5" height="5" fill="white"/>
                          <rect x="2" y="16" width="3" height="3"/>
                          <!-- Dados simulados -->
                          <rect x="8" y="0" width="1" height="1"/><rect x="10" y="0" width="1" height="1"/><rect x="12" y="0" width="1" height="1"/>
                          <rect x="9" y="1" width="1" height="1"/><rect x="11" y="1" width="2" height="1"/>
                          <rect x="8" y="2" width="2" height="1"/><rect x="12" y="2" width="1" height="1"/>
                          <rect x="9" y="3" width="1" height="1"/><rect x="11" y="3" width="1" height="1"/>
                          <rect x="8" y="4" width="1" height="1"/><rect x="10" y="4" width="2" height="1"/>
                          <rect x="8" y="5" width="1" height="1"/><rect x="12" y="5" width="1" height="1"/>
                          <rect x="9" y="6" width="2" height="1"/><rect x="11" y="6" width="1" height="1"/>
                          <rect x="0" y="7" width="1" height="1"/><rect x="2" y="7" width="1" height="1"/><rect x="4" y="7" width="3" height="1"/>
                          <rect x="8" y="7" width="1" height="1"/><rect x="10" y="7" width="2" height="1"/><rect x="14" y="7" width="1" height="1"/><rect x="16" y="7" width="2" height="1"/>
                          <rect x="1" y="8" width="2" height="1"/><rect x="5" y="8" width="1" height="1"/><rect x="8" y="8" width="1" height="1"/><rect x="11" y="8" width="1" height="1"/><rect x="13" y="8" width="1" height="1"/><rect x="15" y="8" width="1" height="1"/><rect x="17" y="8" width="2" height="1"/>
                          <rect x="0" y="9" width="1" height="1"/><rect x="3" y="9" width="2" height="1"/><rect x="7" y="9" width="1" height="1"/><rect x="9" y="9" width="2" height="1"/><rect x="12" y="9" width="1" height="1"/><rect x="14" y="9" width="2" height="1"/><rect x="18" y="9" width="1" height="1"/>
                          <rect x="1" y="10" width="1" height="1"/><rect x="4" y="10" width="1" height="1"/><rect x="6" y="10" width="1" height="1"/><rect x="8" y="10" width="2" height="1"/><rect x="11" y="10" width="2" height="1"/><rect x="15" y="10" width="1" height="1"/><rect x="17" y="10" width="1" height="1"/><rect x="19" y="10" width="1" height="1"/>
                          <rect x="0" y="11" width="2" height="1"/><rect x="3" y="11" width="1" height="1"/><rect x="5" y="11" width="2" height="1"/><rect x="9" y="11" width="1" height="1"/><rect x="12" y="11" width="1" height="1"/><rect x="14" y="11" width="1" height="1"/><rect x="16" y="11" width="2" height="1"/>
                          <rect x="1" y="12" width="1" height="1"/><rect x="4" y="12" width="2" height="1"/><rect x="8" y="12" width="1" height="1"/><rect x="10" y="12" width="2" height="1"/><rect x="13" y="12" width="2" height="1"/><rect x="17" y="12" width="1" height="1"/><rect x="19" y="12" width="1" height="1"/>
                          <rect x="0" y="13" width="1" height="1"/><rect x="2" y="13" width="2" height="1"/><rect x="6" y="13" width="1" height="1"/><rect x="9" y="13" width="1" height="1"/><rect x="11" y="13" width="1" height="1"/><rect x="14" y="13" width="1" height="1"/><rect x="16" y="13" width="1" height="1"/><rect x="18" y="13" width="2" height="1"/>
                          <rect x="8" y="14" width="1" height="1"/><rect x="10" y="14" width="1" height="1"/><rect x="12" y="14" width="1" height="1"/><rect x="15" y="14" width="1" height="1"/><rect x="18" y="14" width="1" height="1"/>
                          <rect x="9" y="15" width="1" height="1"/><rect x="11" y="15" width="2" height="1"/><rect x="14" y="15" width="1" height="1"/><rect x="16" y="15" width="1" height="1"/><rect x="19" y="15" width="1" height="1"/>
                          <rect x="8" y="16" width="2" height="1"/><rect x="12" y="16" width="1" height="1"/><rect x="15" y="16" width="2" height="1"/><rect x="18" y="16" width="1" height="1"/>
                          <rect x="9" y="17" width="1" height="1"/><rect x="11" y="17" width="1" height="1"/><rect x="13" y="17" width="1" height="1"/><rect x="16" y="17" width="1" height="1"/><rect x="19" y="17" width="1" height="1"/>
                          <rect x="8" y="18" width="1" height="1"/><rect x="10" y="18" width="2" height="1"/><rect x="14" y="18" width="1" height="1"/><rect x="17" y="18" width="2" height="1"/>
                          <rect x="9" y="19" width="2" height="1"/><rect x="12" y="19" width="1" height="1"/><rect x="15" y="19" width="1" height="1"/><rect x="18" y="19" width="1" height="1"/>
                          <rect x="8" y="20" width="1" height="1"/><rect x="11" y="20" width="1" height="1"/><rect x="13" y="20" width="2" height="1"/><rect x="16" y="20" width="2" height="1"/>
                        </g>
                      </svg>
                    </div>
                    <div class="qr-preview-info">
                      <div class="qr-preview-product">{{ quickForm.produto || '—' }}</div>
                      <div class="qr-preview-detail">Lote: <strong>{{ quickForm.lote || '—' }}</strong></div>
                      <div class="qr-preview-detail">Val: <strong>{{ formatarData(quickForm.validade) || '—' }}</strong></div>
                      <div class="qr-preview-detail">EAN: <span class="mono-bold" style="font-size:10px">{{ quickForm.codigoBarras || '—' }}</span></div>
                    </div>
                  </div>
                  <div class="qr-preview-label">Pré-visualização da etiqueta</div>
                </div>

                <div class="quick-form-actions">
                  <button class="tbtn" @click="limparForm" style="flex:1">
                    <span class="material-symbols-outlined" style="font-size:13px">restart_alt</span>Limpar
                  </button>
                  <button class="btn-full emit-btn" style="flex:2" @click="gerarEtiqueta" :disabled="!quickFormValido">
                    <span class="material-symbols-outlined" style="font-size:16px">qr_code_2</span>
                    Gerar &amp; Imprimir ({{ quickForm.quantidade }})
                  </button>
                </div>

              </div>
            </div>

            <!-- ATIVIDADE RECENTE -->
            <div class="card">
              <div class="card-head">
                <div class="card-icon c-blue"><span class="material-symbols-outlined">history</span></div>
                <div><div class="card-title">Atividade Recente</div><div class="card-sub">Últimas impressões do dia</div></div>
              </div>
              <div class="transmission-list">
                <div v-for="a in atividadeRecente" :key="a.id" class="trans-item">
                  <div class="trans-icon" :class="a.ok ? 'c-green' : 'c-red'">
                    <span class="material-symbols-outlined" style="font-size:14px">{{ a.ok ? 'check_circle' : 'error' }}</span>
                  </div>
                  <div class="trans-info">
                    <div class="trans-title">{{ a.produto }} · Lote {{ a.lote }}</div>
                    <div class="trans-sub">{{ a.quantidade }} etiquetas · {{ a.hora }} · {{ a.operador }}</div>
                  </div>
                  <span class="lote-badge" style="font-size:10px">{{ a.quantidade }}</span>
                </div>
              </div>
            </div>

            <!-- LOTES PRÓXIMOS DO VENCIMENTO -->
            <div class="card">
              <div class="card-head">
                <div class="card-icon c-yellow"><span class="material-symbols-outlined">warning</span></div>
                <div><div class="card-title">Alertas de Validade</div><div class="card-sub">Lotes vencendo em 30 dias</div></div>
                <div class="card-actions">
                  <span class="tag-custom tag-yellow">{{ alertasValidade.length }} alertas</span>
                </div>
              </div>
              <div v-if="alertasValidade.length === 0" class="empty-state">
                <span class="material-symbols-outlined" style="font-size:28px;color:var(--green)">check_circle</span>
                <div class="es-title" style="color:var(--green)">Tudo dentro do prazo!</div>
                <div class="es-sub">Nenhum lote próximo do vencimento.</div>
              </div>
              <div v-else class="inut-list">
                <div v-for="a in alertasValidade" :key="a.id" class="inut-item">
                  <span class="material-symbols-outlined" style="font-size:18px" :class="a.critico ? 'text-red' : 'text-yellow'">{{ a.critico ? 'error' : 'warning' }}</span>
                  <div class="inut-info">
                    <div style="font-size:12px;font-weight:600">{{ a.produto }}</div>
                    <div class="cell-sub">Lote {{ a.lote }} · Val: {{ a.validade }}</div>
                  </div>
                  <span class="inut-date" :class="a.critico ? 'text-red' : 'text-yellow'">{{ a.dias }}d</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- ═══════════════════ LINHA INFERIOR: ESTATÍSTICAS ═══════════════════ -->
        <div class="grid-3">

          <!-- IMPRESSÕES POR CATEGORIA -->
          <div class="card">
            <div class="card-head">
              <div class="card-icon c-blue"><span class="material-symbols-outlined">pie_chart</span></div>
              <div><div class="card-title">Por Categoria</div><div class="card-sub">Distribuição de etiquetas</div></div>
            </div>
            <div class="cat-list">
              <div v-for="cat in categoriaStats" :key="cat.nome" class="cat-item">
                <div class="cat-info">
                  <div class="cat-nome">{{ cat.nome }}</div>
                  <div class="cat-qtd">{{ cat.qtd.toLocaleString('pt-BR') }} etiquetas</div>
                </div>
                <div class="cat-bar-wrap">
                  <div class="cat-bar-fill" :style="{ width: cat.pct+'%', background: cat.cor }"></div>
                </div>
                <div class="cat-pct">{{ cat.pct }}%</div>
              </div>
            </div>
          </div>

          <!-- TOP PRODUTOS -->
          <div class="card">
            <div class="card-head">
              <div class="card-icon c-green"><span class="material-symbols-outlined">star</span></div>
              <div><div class="card-title">Top Produtos</div><div class="card-sub">Mais etiquetados este mês</div></div>
            </div>
            <div class="top-list">
              <div v-for="(prod, idx) in topProdutos" :key="prod.nome" class="top-item">
                <div class="top-rank" :class="'rank-'+Math.min(idx+1,3)">{{ idx+1 }}</div>
                <div class="top-info">
                  <div class="top-nome">{{ prod.nome }}</div>
                  <div class="cell-sub">{{ prod.lotes }} lotes · {{ prod.etiquetas.toLocaleString('pt-BR') }} etiquetas</div>
                </div>
                <div class="mono-bold" style="font-size:12px;color:var(--accent)">{{ prod.etiquetas.toLocaleString('pt-BR') }}</div>
              </div>
            </div>
          </div>

          <!-- RESUMO DO DIA -->
          <div class="card">
            <div class="card-head">
              <div class="card-icon c-orange"><span class="material-symbols-outlined">today</span></div>
              <div><div class="card-title">Resumo de Hoje</div><div class="card-sub">{{ new Date().toLocaleDateString('pt-BR') }}</div></div>
            </div>
            <div class="sync-stats">
              <div class="sync-stat">
                <div class="ss-val green">{{ resumoDia.impressas }}</div>
                <div class="ss-lbl">Impressas</div>
              </div>
              <div class="sync-stat">
                <div class="ss-val accent">{{ resumoDia.lotes }}</div>
                <div class="ss-lbl">Lotes</div>
              </div>
              <div class="sync-stat">
                <div class="ss-val" style="color:var(--blue)">{{ resumoDia.produtos }}</div>
                <div class="ss-lbl">Produtos</div>
              </div>
              <div class="sync-stat">
                <div class="ss-val red">{{ resumoDia.erros }}</div>
                <div class="ss-lbl">Erros</div>
              </div>
            </div>
            <div class="sync-bar-wrap">
              <div class="sync-bar-fill" :style="{ width: resumoDia.pct+'%' }"></div>
            </div>
            <div class="sync-info">Meta diária: <strong>{{ resumoDia.meta.toLocaleString('pt-BR') }}</strong> etiquetas · <strong>{{ resumoDia.pct }}%</strong> concluído</div>
            <div class="resumo-extra">
              <div class="re-item">
                <span class="material-symbols-outlined" style="font-size:15px;color:var(--muted)">person</span>
                <span>Turno A: <strong>{{ resumoDia.turnoA }}</strong> etiquetas</span>
              </div>
              <div class="re-item">
                <span class="material-symbols-outlined" style="font-size:15px;color:var(--muted)">schedule</span>
                <span>Últ. impressão: <strong>{{ resumoDia.ultimaImpressao }}</strong></span>
              </div>
            </div>
          </div>

        </div>

      </div>

      <!-- ═══════════════════ FOOTER ═══════════════════ -->
      <div class="dash-footer">
        <span>EtiquetaQR v2.4.1 · Controle de Lotes</span>
        <span>Total histórico: <strong>{{ totalHistorico.toLocaleString('pt-BR') }}</strong> etiquetas impressas</span>
      </div>
    </div>

    <!-- ═══════════════════ MODAL — NOVA ETIQUETA (AVANÇADO) ═══════════════════ -->
    <div class="modal-overlay" v-if="showModal" @click.self="showModal=false">
      <div class="modal-box">
        <div class="modal-header">
          <div class="modal-title-row">
            <div class="card-icon c-orange"><span class="material-symbols-outlined" style="font-size:17px">qr_code_2</span></div>
            <div>
              <div class="modal-title">Nova Etiqueta de Lote</div>
              <div class="modal-sub">Preencha os dados do produto para gerar o QR Code</div>
            </div>
          </div>
          <button class="modal-close" @click="showModal=false">
            <span class="material-symbols-outlined" style="font-size:16px">close</span>
          </button>
        </div>

        <!-- STEPS -->
        <div class="modal-body">
          <div class="form-steps">
            <div v-for="(step, i) in modalSteps" :key="step"
              class="form-step"
              :class="{ active: modalStep===i, done: modalStep>i }">
              <div class="step-circle">{{ modalStep>i ? '✓' : i+1 }}</div>
              <div class="step-label">{{ step }}</div>
            </div>
          </div>

          <!-- STEP 0: PRODUTO -->
          <div class="form-section" v-if="modalStep===0">
            <div class="form-row-2">
              <div class="form-field">
                <div class="field-label">Nome do Produto *</div>
                <input v-model="modalForm.produto" placeholder="Ex: Iogurte Integral 500ml" class="form-input" />
              </div>
              <div class="form-field">
                <div class="field-label">Categoria *</div>
                <select v-model="modalForm.categoria" class="form-input">
                  <option value="">Selecione...</option>
                  <option>Alimentos</option>
                  <option>Medicamentos</option>
                  <option>Cosméticos</option>
                  <option>Eletrônicos</option>
                </select>
              </div>
            </div>
            <div class="form-row-3">
              <div class="form-field">
                <div class="field-label">Código de Barras (EAN-13) *</div>
                <input v-model="modalForm.codigoBarras" placeholder="0000000000000" class="form-input" maxlength="14" />
              </div>
              <div class="form-field">
                <div class="field-label">NCM</div>
                <input v-model="modalForm.ncm" placeholder="0000.00.00" class="form-input" />
              </div>
              <div class="form-field">
                <div class="field-label">Unidade</div>
                <select v-model="modalForm.unidade" class="form-input">
                  <option>UN</option><option>KG</option><option>CX</option><option>PC</option><option>L</option>
                </select>
              </div>
            </div>
            <div class="form-field">
              <div class="field-label">Descrição Complementar</div>
              <input v-model="modalForm.descricao" placeholder="Informações adicionais do produto..." class="form-input" />
            </div>
          </div>

          <!-- STEP 1: LOTE -->
          <div class="form-section" v-if="modalStep===1">
            <div class="form-row-2">
              <div class="form-field">
                <div class="field-label">Número do Lote *</div>
                <input v-model="modalForm.lote" placeholder="LOT-2026-001" class="form-input" />
              </div>
              <div class="form-field">
                <div class="field-label">Nº de Série / Rastreio</div>
                <input v-model="modalForm.serie" placeholder="SN-00001" class="form-input" />
              </div>
            </div>
            <div class="form-row-2">
              <div class="form-field">
                <div class="field-label">Data de Fabricação *</div>
                <input type="date" v-model="modalForm.fabricacao" class="form-input" />
              </div>
              <div class="form-field">
                <div class="field-label">Data de Validade *</div>
                <input type="date" v-model="modalForm.validade" class="form-input" />
              </div>
            </div>
            <div class="form-row-3">
              <div class="form-field">
                <div class="field-label">Linha de Produção</div>
                <input v-model="modalForm.linha" placeholder="L-01" class="form-input" />
              </div>
              <div class="form-field">
                <div class="field-label">Responsável</div>
                <input v-model="modalForm.responsavel" placeholder="Nome do operador" class="form-input" />
              </div>
              <div class="form-field">
                <div class="field-label">Temperatura de Armazenamento</div>
                <input v-model="modalForm.temperatura" placeholder="Ex: 2°C a 8°C" class="form-input" />
              </div>
            </div>
            <div class="form-field">
              <div class="field-label">Observações do Lote</div>
              <textarea v-model="modalForm.obs" rows="2" placeholder="Informações extras que aparecerão no QR Code..." class="form-textarea"></textarea>
            </div>
          </div>

          <!-- STEP 2: IMPRESSÃO -->
          <div class="form-section" v-if="modalStep===2">
            <div class="form-row-2">
              <div class="form-field">
                <div class="field-label">Quantidade de Etiquetas *</div>
                <input type="number" v-model.number="modalForm.quantidade" min="1" max="9999" class="form-input" />
              </div>
              <div class="form-field">
                <div class="field-label">Formato da Etiqueta</div>
                <select v-model="modalForm.formato" class="form-input">
                  <option>50x30mm</option>
                  <option>60x40mm</option>
                  <option>100x50mm</option>
                  <option>A4 - 4 por folha</option>
                </select>
              </div>
            </div>
            <div class="form-row-2">
              <div class="form-field">
                <div class="field-label">Impressora</div>
                <select v-model="modalForm.impressora" class="form-input">
                  <option>Zebra ZD220 (Térmica)</option>
                  <option>Argox OS-214 Plus</option>
                  <option>PDF / Exportar</option>
                </select>
              </div>
              <div class="form-field">
                <div class="field-label">Cópias por Produto</div>
                <input type="number" v-model.number="modalForm.copias" min="1" max="10" class="form-input" />
              </div>
            </div>
            <!-- REVIEW -->
            <div class="tribut-section">
              <div class="trib-label">Resumo da Etiqueta</div>
              <div class="review-grid" style="background:transparent;padding:0">
                <div class="review-item"><div class="review-label">Produto</div><div class="review-val">{{ modalForm.produto || '—' }}</div></div>
                <div class="review-item"><div class="review-label">Lote</div><div class="review-val accent">{{ modalForm.lote || '—' }}</div></div>
                <div class="review-item"><div class="review-label">Código de Barras</div><div class="review-val"><span class="mono-bold">{{ modalForm.codigoBarras || '—' }}</span></div></div>
                <div class="review-item"><div class="review-label">Validade</div><div class="review-val">{{ formatarData(modalForm.validade) || '—' }}</div></div>
                <div class="review-item"><div class="review-label">Quantidade</div><div class="review-val">{{ modalForm.quantidade }} etiquetas</div></div>
                <div class="review-item"><div class="review-label">Formato</div><div class="review-val">{{ modalForm.formato }}</div></div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="tbtn" @click="modalStep>0 ? modalStep-- : showModal=false">
            <span class="material-symbols-outlined" style="font-size:13px">arrow_back</span>
            {{ modalStep>0 ? 'Voltar' : 'Cancelar' }}
          </button>
          <span class="modal-step-info">Passo {{ modalStep+1 }} de {{ modalSteps.length }}</span>
          <div style="margin-left:auto;display:flex;gap:8px">
            <button v-if="modalStep < modalSteps.length-1" class="tbtn primary" @click="modalStep++">
              Próximo <span class="material-symbols-outlined" style="font-size:13px">arrow_forward</span>
            </button>
            <button v-else class="tbtn primary" @click="confirmarModal">
              <span class="material-symbols-outlined" style="font-size:13px">print</span>
              Gerar &amp; Imprimir
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════════ MODAL — PREVIEW QR ═══════════════════ -->
    <div class="modal-overlay" v-if="showPreview" @click.self="showPreview=false">
      <div class="qr-modal">
        <div class="modal-header">
          <div class="modal-title-row">
            <div class="card-icon c-orange"><span class="material-symbols-outlined" style="font-size:17px">qr_code</span></div>
            <div><div class="modal-title">QR Code da Etiqueta</div><div class="modal-sub">{{ previewEtiqueta?.produto }}</div></div>
          </div>
          <button class="modal-close" @click="showPreview=false"><span class="material-symbols-outlined" style="font-size:16px">close</span></button>
        </div>
        <div class="qr-body">
          <div class="qr-etiqueta-box">
            <svg width="140" height="140" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
              <rect width="21" height="21" fill="white"/>
              <g fill="#1e293b">
                <rect x="0" y="0" width="7" height="7"/><rect x="1" y="1" width="5" height="5" fill="white"/><rect x="2" y="2" width="3" height="3"/>
                <rect x="14" y="0" width="7" height="7"/><rect x="15" y="1" width="5" height="5" fill="white"/><rect x="16" y="2" width="3" height="3"/>
                <rect x="0" y="14" width="7" height="7"/><rect x="1" y="15" width="5" height="5" fill="white"/><rect x="2" y="16" width="3" height="3"/>
                <rect x="8" y="0" width="1" height="1"/><rect x="10" y="0" width="1" height="1"/><rect x="12" y="0" width="1" height="1"/>
                <rect x="9" y="1" width="1" height="1"/><rect x="11" y="1" width="2" height="1"/>
                <rect x="8" y="2" width="2" height="1"/><rect x="12" y="2" width="1" height="1"/>
                <rect x="9" y="3" width="1" height="1"/><rect x="11" y="3" width="1" height="1"/>
                <rect x="8" y="4" width="1" height="1"/><rect x="10" y="4" width="2" height="1"/>
                <rect x="0" y="7" width="1" height="1"/><rect x="2" y="7" width="1" height="1"/><rect x="4" y="7" width="3" height="1"/>
                <rect x="8" y="7" width="1" height="1"/><rect x="10" y="7" width="2" height="1"/><rect x="14" y="7" width="1" height="1"/>
                <rect x="1" y="8" width="2" height="1"/><rect x="5" y="8" width="1" height="1"/><rect x="8" y="8" width="1" height="1"/><rect x="11" y="8" width="1" height="1"/><rect x="13" y="8" width="1" height="1"/>
                <rect x="0" y="9" width="1" height="1"/><rect x="3" y="9" width="2" height="1"/><rect x="7" y="9" width="1" height="1"/><rect x="9" y="9" width="2" height="1"/>
                <rect x="1" y="10" width="1" height="1"/><rect x="4" y="10" width="1" height="1"/><rect x="6" y="10" width="1" height="1"/><rect x="8" y="10" width="2" height="1"/>
                <rect x="0" y="11" width="2" height="1"/><rect x="3" y="11" width="1" height="1"/><rect x="5" y="11" width="2" height="1"/><rect x="9" y="11" width="1" height="1"/>
                <rect x="8" y="14" width="1" height="1"/><rect x="10" y="14" width="1" height="1"/><rect x="12" y="14" width="1" height="1"/><rect x="15" y="14" width="1" height="1"/>
                <rect x="9" y="15" width="1" height="1"/><rect x="11" y="15" width="2" height="1"/><rect x="14" y="15" width="1" height="1"/>
                <rect x="8" y="16" width="2" height="1"/><rect x="12" y="16" width="1" height="1"/><rect x="15" y="16" width="2" height="1"/>
                <rect x="9" y="17" width="1" height="1"/><rect x="11" y="17" width="1" height="1"/><rect x="13" y="17" width="1" height="1"/>
                <rect x="8" y="18" width="1" height="1"/><rect x="10" y="18" width="2" height="1"/><rect x="14" y="18" width="1" height="1"/>
                <rect x="9" y="19" width="2" height="1"/><rect x="12" y="19" width="1" height="1"/>
                <rect x="8" y="20" width="1" height="1"/><rect x="11" y="20" width="1" height="1"/><rect x="13" y="20" width="2" height="1"/>
              </g>
            </svg>
          </div>
          <div class="qr-info" v-if="previewEtiqueta">
            <div class="qr-row"><span>Produto</span><strong>{{ previewEtiqueta.produto }}</strong></div>
            <div class="qr-row"><span>Lote</span><strong>{{ previewEtiqueta.lote }}</strong></div>
            <div class="qr-row"><span>Cód. Barras</span><span class="mono-bold">{{ previewEtiqueta.codigoBarras }}</span></div>
            <div class="qr-row"><span>Validade</span><strong>{{ previewEtiqueta.validade }}</strong></div>
            <div class="qr-row"><span>Etiquetas</span><strong>{{ previewEtiqueta.quantidade }}</strong></div>
          </div>
          <div class="qr-actions">
            <button class="tbtn" @click="showPreview=false">Fechar</button>
            <button class="tbtn primary" @click="reimprimir(previewEtiqueta); showPreview=false">
              <span class="material-symbols-outlined" style="font-size:13px">print</span>Reimprimir
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════════ TOAST ═══════════════════ -->
    <div class="toast" :class="{ 'toast-show': toastVisible }">
      <span class="material-symbols-outlined" style="font-size:16px">{{ toastIcon }}</span>
      {{ toastMsg }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'EtiquetaQRCode',
  data() {
    return {
      globalSearch: '',
      activePeriod: '7d',
      filterStatus: '',
      filterCategoria: '',
      page: 1,
      pageSize: 8,
      selecionadas: [],
      showModal: false,
      showPreview: false,
      previewEtiqueta: null,
      modalStep: 0,
      toastVisible: false,
      toastIcon: 'check_circle',
      toastMsg: '',
      impressoraOnline: true,
      totalHistorico: 847_312,

      modalSteps: ['Produto', 'Lote & Rastreio', 'Impressão'],

      quickForm: {
        produto: '',
        codigoBarras: '',
        categoria: '',
        lote: '',
        fabricacao: '',
        validade: '',
        quantidade: 1,
        obs: '',
      },

      modalForm: {
        produto: '', categoria: '', codigoBarras: '', ncm: '', unidade: 'UN', descricao: '',
        lote: '', serie: '', fabricacao: '', validade: '', linha: '', responsavel: '', temperatura: '', obs: '',
        quantidade: 10, formato: '60x40mm', impressora: 'Zebra ZD220 (Térmica)', copias: 1,
      },

      periods: [
        { key: 'hoje', label: 'Hoje' },
        { key: '7d',   label: '7d' },
        { key: '30d',  label: '30d' },
        { key: '90d',  label: '90d' },
      ],

      etiquetas: [
        { id:1,  produto:'Iogurte Integral 500ml',    categoria:'Alimentos',     codigoBarras:'7891234560001', lote:'LOT-2026-041', fabricacao:'01/05/2026', validade:'01/07/2026', quantidade:250, status:'Impresso', impressoEm:'15/05/26 · 08:32', operador:'Ana S.',    menu:false },
        { id:2,  produto:'Dipirona Sódica 500mg',     categoria:'Medicamentos',  codigoBarras:'7890002341002', lote:'FAR-2026-017', fabricacao:'10/04/2026', validade:'10/04/2028', quantidade:500, status:'Impresso', impressoEm:'15/05/26 · 09:15', operador:'Carlos M.', menu:false },
        { id:3,  produto:'Creme Hidratante 200g',     categoria:'Cosméticos',    codigoBarras:'7893210009003', lote:'COS-26-089',   fabricacao:'20/04/2026', validade:'20/04/2027', quantidade:120, status:'Impresso', impressoEm:'14/05/26 · 14:00', operador:'Ana S.',    menu:false },
        { id:4,  produto:'Leite UHT Integral 1L',    categoria:'Alimentos',     codigoBarras:'7891100000004', lote:'LOT-2026-039', fabricacao:'05/05/2026', validade:'05/08/2026', quantidade:800, status:'Impresso', impressoEm:'14/05/26 · 10:45', operador:'Roberto L.', menu:false },
        { id:5,  produto:'Amoxicilina 500mg 21cp',   categoria:'Medicamentos',  codigoBarras:'7890001112005', lote:'FAR-2026-009', fabricacao:'01/03/2026', validade:'01/03/2028', quantidade:300, status:'Pendente', impressoEm:'—',                operador:'—',          menu:false },
        { id:6,  produto:'Protetor Solar FPS60 120ml',categoria:'Cosméticos',   codigoBarras:'7892233440006', lote:'COS-26-102',   fabricacao:'15/04/2026', validade:'15/04/2028', quantidade:180, status:'Impresso', impressoEm:'13/05/26 · 11:22', operador:'Carlos M.', menu:false },
        { id:7,  produto:'Feijão Carioca 1kg',       categoria:'Alimentos',     codigoBarras:'7891234000007', lote:'AGR-26-554',   fabricacao:'10/02/2026', validade:'10/02/2027', quantidade:600, status:'Impresso', impressoEm:'12/05/26 · 07:30', operador:'Joana F.',  menu:false },
        { id:8,  produto:'Vitamina C 1000mg 30cp',   categoria:'Medicamentos',  codigoBarras:'7890553310008', lote:'FAR-2026-021', fabricacao:'20/04/2026', validade:'20/04/2028', quantidade:400, status:'Impresso', impressoEm:'12/05/26 · 09:00', operador:'Ana S.',    menu:false },
        { id:9,  produto:'Shampoo Anticaspa 400ml',  categoria:'Cosméticos',    codigoBarras:'7893344120009', lote:'COS-26-098',   fabricacao:'01/05/2026', validade:'01/05/2028', quantidade:90,  status:'Cancelado',impressoEm:'11/05/26 · 16:10', operador:'Roberto L.', menu:false },
        { id:10, produto:'Macarrão Espaguete 500g',  categoria:'Alimentos',     codigoBarras:'7891100220010', lote:'LOT-2026-043', fabricacao:'02/05/2026', validade:'02/05/2027', quantidade:1000,status:'Impresso', impressoEm:'11/05/26 · 13:45', operador:'Joana F.',  menu:false },
        { id:11, produto:'Ibuprofeno 600mg 20cp',    categoria:'Medicamentos',  codigoBarras:'7890001230011', lote:'FAR-2026-025', fabricacao:'25/04/2026', validade:'25/04/2028', quantidade:250, status:'Impresso', impressoEm:'10/05/26 · 08:00', operador:'Carlos M.', menu:false },
        { id:12, produto:'Arduino Uno R3',           categoria:'Eletrônicos',   codigoBarras:'7891000990012', lote:'ELE-26-001',   fabricacao:'01/01/2026', validade:'01/01/2031', quantidade:50,  status:'Pendente', impressoEm:'—',                operador:'—',          menu:false },
      ],

      atividadeRecente: [
        { id:1, produto:'Iogurte Integral 500ml',  lote:'LOT-2026-041', quantidade:250, hora:'08:32', operador:'Ana S.',    ok:true  },
        { id:2, produto:'Dipirona Sódica 500mg',   lote:'FAR-2026-017', quantidade:500, hora:'09:15', operador:'Carlos M.', ok:true  },
        { id:3, produto:'Leite UHT Integral 1L',   lote:'LOT-2026-039', quantidade:800, hora:'10:45', operador:'Roberto L.',ok:true  },
        { id:4, produto:'Shampoo Anticaspa 400ml', lote:'COS-26-098',   quantidade:90,  hora:'16:10', operador:'Roberto L.',ok:false },
        { id:5, produto:'Feijão Carioca 1kg',      lote:'AGR-26-554',   quantidade:600, hora:'07:30', operador:'Joana F.',  ok:true  },
      ],

      alertasValidade: [
        { id:1, produto:'Iogurte Integral 500ml', lote:'LOT-2026-041', validade:'01/07/2026', dias:46, critico:false },
        { id:2, produto:'Leite UHT Integral 1L',  lote:'LOT-2026-039', validade:'05/08/2026', dias:81, critico:false },
        { id:3, produto:'Feijão Carioca 1kg',     lote:'AGR-26-554',   validade:'22/05/2026', dias:6,  critico:true  },
      ],

      categoriaStats: [
        { nome:'Alimentos',    qtd:32_400, pct:42, cor:'var(--green)'  },
        { nome:'Medicamentos', qtd:24_100, pct:31, cor:'var(--blue)'   },
        { nome:'Cosméticos',   qtd:14_200, pct:18, cor:'var(--accent)' },
        { nome:'Eletrônicos',  qtd:6_900,  pct:9,  cor:'var(--purple)' },
      ],

      topProdutos: [
        { nome:'Leite UHT Integral 1L',   lotes:12, etiquetas:9_600 },
        { nome:'Dipirona Sódica 500mg',   lotes:8,  etiquetas:7_200 },
        { nome:'Feijão Carioca 1kg',      lotes:15, etiquetas:6_800 },
        { nome:'Iogurte Integral 500ml',  lotes:10, etiquetas:5_500 },
        { nome:'Macarrão Espaguete 500g', lotes:18, etiquetas:4_900 },
      ],

      resumoDia: {
        impressas: 1_550,
        lotes: 6,
        produtos: 4,
        erros: 1,
        meta: 3_000,
        pct: 52,
        turnoA: 980,
        ultimaImpressao: '10:45',
      },
    };
  },

  computed: {
    kpis() {
      return [
        { label:'QR Codes Impressos Hoje', value:'1.550',    trend:'+18%', trendUp:true,  icon:'qr_code_2',    accent:'k-orange', sub:'vs ontem' },
        { label:'Lotes Cadastrados (Mês)', value:'127',      trend:'+9%',  trendUp:true,  icon:'inventory_2',  accent:'k-blue',   sub:'vs mês ant.' },
        { label:'Produtos Ativos',         value:'48',       trend:'+3%',  trendUp:true,  icon:'category',     accent:'k-green',  sub:'no catálogo' },
        { label:'Alertas de Validade',     value:'3',        trend:'',     trendUp:false, icon:'warning',      accent:'k-yellow', sub:'próx. 30 dias' },
      ];
    },
    filteredEtiquetas() {
      const q = this.globalSearch.toLowerCase();
      return this.etiquetas.filter(e => {
        const matchSearch = !q ||
          e.produto.toLowerCase().includes(q) ||
          e.lote.toLowerCase().includes(q) ||
          e.codigoBarras.includes(q) ||
          (e.operador || '').toLowerCase().includes(q);
        const matchStatus = !this.filterStatus || e.status === this.filterStatus;
        const matchCat = !this.filterCategoria || e.categoria === this.filterCategoria;
        return matchSearch && matchStatus && matchCat;
      });
    },
    paginatedEtiquetas() {
      const s = (this.page - 1) * this.pageSize;
      return this.filteredEtiquetas.slice(s, s + this.pageSize);
    },
    totalPages() {
      return Math.max(1, Math.ceil(this.filteredEtiquetas.length / this.pageSize));
    },
    quickFormValido() {
      return this.quickForm.produto && this.quickForm.codigoBarras && this.quickForm.lote && this.quickForm.validade;
    },
  },

  methods: {
    statusClass(s) {
      return { 'Impresso':'green', 'Pendente':'yellow', 'Cancelado':'red' }[s] || 'muted';
    },
    tagClass(s) {
      return { 'Impresso':'tag-green', 'Pendente':'tag-yellow', 'Cancelado':'tag-red' }[s] || '';
    },
    toggleSelecionada(id) {
      if (this.selecionadas.includes(id)) this.selecionadas = this.selecionadas.filter(x => x !== id);
      else this.selecionadas.push(id);
    },
    toggleSelectAll(e) {
      this.selecionadas = e.target.checked ? this.filteredEtiquetas.map(e => e.id) : [];
    },
    selectAll() {
      this.selecionadas = this.filteredEtiquetas.map(e => e.id);
    },
    imprimirSelecionadas() {
      this.showToast('print', `Enviando ${this.selecionadas.length} etiqueta(s) para a impressora...`);
      this.selecionadas = [];
    },
    exportarSelecionadas() {
      this.showToast('picture_as_pdf', `Exportando ${this.selecionadas.length} etiqueta(s) em PDF...`);
    },
    openModal() {
      this.modalStep = 0;
      this.modalForm = { produto:'', categoria:'', codigoBarras:'', ncm:'', unidade:'UN', descricao:'', lote:'', serie:'', fabricacao:'', validade:'', linha:'', responsavel:'', temperatura:'', obs:'', quantidade:10, formato:'60x40mm', impressora:'Zebra ZD220 (Térmica)', copias:1 };
      this.showModal = true;
    },
    confirmarModal() {
      const nova = {
        id: Date.now(),
        produto: this.modalForm.produto,
        categoria: this.modalForm.categoria,
        codigoBarras: this.modalForm.codigoBarras,
        lote: this.modalForm.lote,
        fabricacao: this.modalForm.fabricacao,
        validade: this.formatarDataBR(this.modalForm.validade),
        quantidade: this.modalForm.quantidade,
        status: 'Impresso',
        impressoEm: new Date().toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', year:'2-digit' }) + ' · ' + new Date().toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' }),
        operador: this.modalForm.responsavel || 'Usuário',
        menu: false,
      };
      this.etiquetas.unshift(nova);
      this.showModal = false;
      this.showToast('print', `${this.modalForm.quantidade} etiqueta(s) de "${this.modalForm.produto}" enviadas para impressão!`);
    },
    gerarEtiqueta() {
      const nova = {
        id: Date.now(),
        produto: this.quickForm.produto,
        categoria: this.quickForm.categoria || 'Geral',
        codigoBarras: this.quickForm.codigoBarras,
        lote: this.quickForm.lote,
        fabricacao: this.quickForm.fabricacao,
        validade: this.formatarDataBR(this.quickForm.validade),
        quantidade: this.quickForm.quantidade,
        status: 'Impresso',
        impressoEm: new Date().toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', year:'2-digit' }) + ' · ' + new Date().toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' }),
        operador: 'Usuário',
        menu: false,
      };
      this.etiquetas.unshift(nova);
      this.resumoDia.impressas += this.quickForm.quantidade;
      this.resumoDia.pct = Math.min(100, Math.round(this.resumoDia.impressas / this.resumoDia.meta * 100));
      this.showToast('print', `${this.quickForm.quantidade} etiqueta(s) geradas e enviadas para impressão!`);
      this.limparForm();
    },
    limparForm() {
      this.quickForm = { produto:'', codigoBarras:'', categoria:'', lote:'', fabricacao:'', validade:'', quantidade:1, obs:'' };
    },
    abrirPreview(et) {
      this.previewEtiqueta = et;
      this.showPreview = true;
    },
    reimprimir(et) {
      this.showToast('print', `Reimprimindo ${et.quantidade} etiqueta(s) de "${et.produto}"...`);
    },
    duplicar(et) {
      const nova = { ...et, id: Date.now(), lote: et.lote + '-COPIA', status: 'Pendente', impressoEm:'—', operador:'—', menu:false };
      this.etiquetas.unshift(nova);
      this.showToast('content_copy', `Etiqueta de "${et.produto}" duplicada com sucesso!`);
    },
    exportarPDF(et) {
      this.showToast('picture_as_pdf', `Exportando etiqueta do lote ${et.lote} em PDF...`);
    },
    cancelar(et) {
      et.status = 'Cancelado';
      this.showToast('cancel', `Etiqueta do lote ${et.lote} cancelada.`);
    },
    isVencido(val) {
      if (!val || val === '—') return false;
      const [d,m,y] = val.split('/');
      return new Date(`20${y}-${m}-${d}`) < new Date();
    },
    isProximoVencer(val) {
      if (!val || val === '—') return false;
      const [d,m,y] = val.split('/');
      const diff = (new Date(`20${y}-${m}-${d}`) - new Date()) / 86400000;
      return diff >= 0 && diff <= 30;
    },
    diasRestantes(val) {
      if (!val || val === '—') return '';
      const [d,m,y] = val.split('/');
      const diff = Math.ceil((new Date(`20${y}-${m}-${d}`) - new Date()) / 86400000);
      if (diff < 0) return 'Vencido';
      if (diff === 0) return 'Vence hoje';
      return `${diff}d restantes`;
    },
    formatarData(iso) {
      if (!iso) return '';
      const [y,m,d] = iso.split('-');
      return `${d}/${m}/${y}`;
    },
    formatarDataBR(iso) {
      if (!iso) return '—';
      const [y,m,d] = iso.split('-');
      return `${d}/${m}/${y}`;
    },
    formatBarcode() {
      this.quickForm.codigoBarras = this.quickForm.codigoBarras.replace(/\D/g, '');
    },
    showToast(icon, msg) {
      this.toastIcon = icon; this.toastMsg = msg;
      this.toastVisible = true;
      setTimeout(() => { this.toastVisible = false; }, 3200);
    },
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');

/* ══ DESIGN TOKENS ══ */
.dashboard-root {
  --accent:  #FF8049; --accent2: #FF804915; --acc-h: #E65D26;
  --green:   #16a34a; --green2:  #dcfce7;
  --blue:    #2563eb; --blue2:   #dbeafe;
  --yellow:  #ca8a04; --yellow2: #fef9c3;
  --red:     #dc2626; --red2:    #fee2e2;
  --purple:  #7c3aed; --purple2: #ede9fe;
  --bg:      #f4f6f9; --bg-card: #ffffff;
  --bg-el:   #f1f3f5; --bg-el2:  #e9ecef;
  --border:  #e2e8f0; --border2: #cbd5e1;
  --text1:   #1e293b; --text2:   #64748b; --muted: #94a3b8;
  --radius:  13px; --radius-s: 8px;
  --shadow:  0 4px 12px -2px rgba(0,0,0,.06),0 2px 6px -1px rgba(0,0,0,.03);
  display: flex; background: var(--bg); color: var(--text1);
  font-family: 'DM Sans','Segoe UI',system-ui,sans-serif;
  font-size: 13.5px; min-height: 100vh;
}

/* ══ LAYOUT ══ */
.main-area { flex:1; min-width:0; display:flex; flex-direction:column; }
.content { padding:22px 24px; flex:1; }

/* ══ TOPBAR ══ */
.topbar {
  position:sticky; top:0; z-index:50;
  background:var(--bg-card); border-bottom:1px solid var(--border);
  padding:12px 24px; display:flex; align-items:center; gap:12px;
  box-shadow:0 1px 8px rgba(0,0,0,.04); flex-wrap:wrap;
}
.topbar-brand { display:flex; align-items:center; gap:10px; }
.brand-icon { width:34px; height:34px; background:linear-gradient(135deg,var(--accent),#e65d26); border-radius:9px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.topbar-title { font-weight:800; font-size:16px; letter-spacing:-.3px; }
.topbar-sub   { font-size:10.5px; color:var(--muted); margin-top:1px; }
.topbar-right { margin-left:auto; display:flex; align-items:center; gap:9px; flex-wrap:wrap; }

.impressora-pill { display:flex; align-items:center; gap:6px; font-size:11.5px; font-weight:700; padding:5px 12px; border-radius:20px; }
.impressora-pill.online  { background:var(--green2); color:var(--green); }
.impressora-pill.offline { background:var(--red2);   color:var(--red);   }
.impressora-dot { width:7px; height:7px; border-radius:50%; background:currentColor; animation:pulse 1.5s infinite; }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }

.tbtn {
  display:flex; align-items:center; gap:5px;
  padding:6px 13px; border-radius:var(--radius-s);
  border:1px solid var(--border2); background:var(--bg-card);
  color:var(--text2); font-size:12px; font-weight:500;
  cursor:pointer; transition:all .15s; font-family:inherit; white-space:nowrap;
}
.tbtn:hover:not(:disabled) { background:var(--bg-el); color:var(--text1); }
.tbtn.primary { background:var(--accent); color:#fff; border-color:var(--accent); }
.tbtn.primary:hover:not(:disabled) { background:var(--acc-h); }
.tbtn.accent2 { background:var(--green); color:#fff; border-color:var(--green); }
.tbtn.accent2:hover:not(:disabled) { background:#15803d; }
.tbtn.danger  { border-color:var(--red); color:var(--red); }
.tbtn:disabled { opacity:.4; cursor:not-allowed; }
.user-avatar { width:31px; height:31px; border-radius:50%; background:linear-gradient(135deg,var(--accent),#ff4d4d); display:flex; align-items:center; justify-content:center; font-weight:700; font-size:11px; color:#fff; flex-shrink:0; }

/* ══ FILTER BAR ══ */
.filter-bar { display:flex; align-items:center; justify-content:space-between; background:var(--bg-card); border:1px solid var(--border); border-radius:var(--radius); padding:12px 18px; margin-bottom:14px; gap:12px; box-shadow:var(--shadow); flex-wrap:wrap; }
.filter-left  { display:flex; align-items:center; gap:10px; flex-wrap:wrap; flex:1; }
.filter-right { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
.filter-sub   { font-size:11.5px; color:var(--muted); white-space:nowrap; }
.filter-sep   { width:1px; height:20px; background:var(--border2); }
.search-box-main { display:flex; align-items:center; gap:6px; background:var(--bg-el); border:1px solid var(--border2); border-radius:var(--radius-s); padding:6px 12px; flex:1; min-width:260px; }
.search-main-input { border:none; background:transparent; outline:none; font-family:inherit; font-size:12.5px; color:var(--text1); flex:1; }
.search-clear { color:var(--muted); cursor:pointer; font-size:16px !important; }
.period-tabs { display:flex; background:var(--bg-el); border:1px solid var(--border); border-radius:var(--radius-s); padding:3px; gap:2px; }
.ptab { padding:4px 10px; border-radius:5px; font-size:11.5px; font-weight:500; cursor:pointer; color:var(--muted); transition:all .15s; background:transparent; border:none; font-family:inherit; white-space:nowrap; }
.ptab.active { background:var(--accent); color:#fff; font-weight:700; }
.ptab:hover:not(.active) { background:var(--bg-el2); color:var(--text1); }
.select-wrap { position:relative; }
.sel-input { border:1px solid var(--border2); border-radius:var(--radius-s); background:var(--bg-card); padding:5px 10px; font-family:inherit; font-size:12px; color:var(--text2); outline:none; cursor:pointer; }

/* ══ KPI GRID ══ */
.kpi-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:13px; margin-bottom:14px; }
.kpi-card { background:var(--bg-card); border:1px solid var(--border); border-radius:var(--radius); padding:16px 18px; position:relative; overflow:hidden; transition:all .2s; box-shadow:var(--shadow); }
.kpi-card:hover { border-color:var(--border2); transform:translateY(-1px); }
.kpi-card::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; }
.k-orange::before { background:linear-gradient(90deg,var(--accent),transparent); }
.k-green::before  { background:linear-gradient(90deg,var(--green),transparent);  }
.k-blue::before   { background:linear-gradient(90deg,var(--blue),transparent);   }
.k-yellow::before { background:linear-gradient(90deg,var(--yellow),transparent); }
.kpi-label  { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.8px; color:var(--muted); display:flex; align-items:center; gap:4px; margin-bottom:8px; }
.kpi-value  { font-size:22px; font-weight:800; letter-spacing:-.8px; color:var(--text1); line-height:1; margin-bottom:8px; }
.kpi-footer { display:flex; align-items:center; gap:6px; font-size:11px; }
.kpi-delta  { font-weight:700; display:flex; align-items:center; gap:2px; }
.kpi-delta.up   { color:var(--green); }
.kpi-delta.down { color:var(--red);   }
.kpi-sub    { color:var(--muted); }
.kpi-bg-icon { position:absolute; bottom:4px; right:10px; font-size:48px; opacity:.05; color:var(--text1); pointer-events:none; line-height:1; }

/* ══ GRID ══ */
.grid-2-1 { display:grid; grid-template-columns:2fr 1fr; gap:14px; margin-bottom:14px; }
.grid-3   { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-bottom:14px; }

/* ══ CARD ══ */
.card { background:var(--bg-card); border:1px solid var(--border); border-radius:var(--radius); overflow:hidden; box-shadow:var(--shadow); }
.card-head { display:flex; align-items:center; gap:10px; padding:13px 18px; border-bottom:1px solid var(--border); flex-wrap:wrap; }
.card-title { font-size:13px; font-weight:700; letter-spacing:-.2px; }
.card-sub   { font-size:10.5px; color:var(--muted); margin-top:1px; }
.card-actions { margin-left:auto; display:flex; gap:6px; align-items:center; }
.card-icon { width:30px; height:30px; border-radius:8px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.card-icon .material-symbols-outlined { font-size:17px !important; }
.c-orange { background:var(--accent2); color:var(--accent); }
.c-green  { background:var(--green2);  color:var(--green);  }
.c-blue   { background:var(--blue2);   color:var(--blue);   }
.c-yellow { background:var(--yellow2); color:var(--yellow); }
.c-red    { background:var(--red2);    color:var(--red);    }

/* ══ TABLE ══ */
.table-wrap { overflow-x:auto; }
.fiscal-table { width:100%; border-collapse:collapse; font-size:12.5px; }
.fiscal-table thead tr { background:var(--bg-el); border-bottom:2px solid var(--border); }
.fiscal-table th { padding:9px 14px; text-align:left; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.5px; color:var(--text2); white-space:nowrap; }
.fiscal-table tbody tr { border-bottom:1px solid var(--border); transition:background .15s; }
.fiscal-table tbody tr:hover { background:var(--bg-el); }
.fiscal-table tbody tr.row-selected { background:var(--accent2); }
.fiscal-table td { padding:9px 14px; }
.chk { width:14px; height:14px; accent-color:var(--accent); cursor:pointer; }
.cell-name { font-size:12.5px; font-weight:600; color:var(--text1); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:180px; }
.cell-sub  { font-size:10.5px; color:var(--muted); margin-top:1px; }
.mono-bold { font-family:'Courier New',monospace; font-weight:700; }
.text-red    { color:var(--red); }
.text-yellow { color:var(--yellow); }

/* ══ STATUS / TAGS ══ */
.status-cell { display:flex; align-items:center; gap:5px; }
.status-dot  { width:6px; height:6px; border-radius:50%; flex-shrink:0; }
.dot-green  { background:var(--green); }
.dot-red    { background:var(--red);   }
.dot-yellow { background:var(--yellow);}
.dot-muted  { background:var(--muted); }
.tag-custom { font-size:10.5px; font-weight:700; padding:2px 8px; border-radius:12px; white-space:nowrap; }
.tag-green  { background:var(--green2);  color:var(--green);  }
.tag-yellow { background:var(--yellow2); color:var(--yellow); }
.tag-red    { background:var(--red2);    color:var(--red);    }
.tag-blue   { background:var(--blue2);   color:var(--blue);   }
.lote-badge { font-family:'Courier New',monospace; font-size:11px; font-weight:700; background:var(--accent2); color:var(--accent); padding:3px 8px; border-radius:5px; white-space:nowrap; }

/* ══ SELECTION BAR ══ */
.selection-bar { display:flex; align-items:center; gap:10px; background:var(--accent2); border-bottom:1px solid var(--accent); padding:9px 18px; font-size:12.5px; flex-wrap:wrap; }
.sel-actions { display:flex; gap:6px; flex-wrap:wrap; }

/* ══ ROW ACTIONS ══ */
.row-actions { display:flex; align-items:center; gap:2px; }
.icon-btn { width:28px; height:28px; border-radius:6px; border:1px solid var(--border); background:var(--bg-card); display:flex; align-items:center; justify-content:center; color:var(--text2); cursor:pointer; transition:all .15s; }
.icon-btn:hover { background:var(--bg-el); color:var(--accent); border-color:var(--accent); }

/* ══ DROPDOWN ══ */
.dropdown { position:relative; }
.dropdown-menu { position:absolute; right:0; top:100%; z-index:200; background:var(--bg-card); border:1px solid var(--border); border-radius:var(--radius-s); box-shadow:0 8px 24px rgba(0,0,0,.1); min-width:170px; padding:4px; }
.dm-item { display:flex; align-items:center; gap:8px; width:100%; padding:7px 10px; border-radius:5px; font-size:12px; font-weight:500; font-family:inherit; background:transparent; border:none; color:var(--text2); cursor:pointer; transition:all .15s; }
.dm-item:hover { background:var(--bg-el); color:var(--text1); }
.dm-item.danger { color:var(--red); }
.dm-item:disabled { opacity:.4; cursor:not-allowed; }

/* ══ PAGINATION ══ */
.pagination { display:flex; align-items:center; justify-content:space-between; padding:12px 18px; border-top:1px solid var(--border); }
.pag-info { font-size:11.5px; color:var(--muted); }
.pag-btns { display:flex; align-items:center; gap:8px; }
.pag-btn { width:28px; height:28px; border-radius:6px; border:1px solid var(--border2); background:var(--bg-card); display:flex; align-items:center; justify-content:center; color:var(--text2); cursor:pointer; transition:all .15s; }
.pag-btn:hover:not(:disabled) { background:var(--accent2); color:var(--accent); border-color:var(--accent); }
.pag-btn:disabled { opacity:.4; cursor:not-allowed; }
.pag-num { font-size:12px; font-weight:600; color:var(--text2); }

/* ══ RIGHT PANEL ══ */
.right-panel { display:flex; flex-direction:column; gap:14px; }

/* ══ QUICK FORM ══ */
.quick-form { padding:14px 16px; display:flex; flex-direction:column; gap:12px; }
.quick-form-actions { display:flex; gap:8px; align-items:center; }
.barcode-input-wrap { display:flex; align-items:center; gap:7px; border:1px solid var(--border2); border-radius:var(--radius-s); padding:7px 10px; background:var(--bg-card); transition:border .15s; }
.barcode-input-wrap:focus-within { border-color:var(--accent); }
.barcode-input { border:none; outline:none; background:transparent; font-family:'Courier New',monospace; font-size:12.5px; font-weight:700; color:var(--text1); flex:1; width:100%; }

/* ══ QR PREVIEW ══ */
.qr-preview-box { background:linear-gradient(135deg,#fff7ed,#ffedd5); border:1px solid #fed7aa; border-radius:var(--radius-s); padding:12px; }
.qr-preview-inner { display:flex; align-items:center; gap:12px; }
.qr-svg-wrap { flex-shrink:0; border:2px solid var(--border2); border-radius:6px; padding:4px; background:#fff; }
.qr-preview-info { flex:1; }
.qr-preview-product { font-size:13px; font-weight:700; color:var(--text1); margin-bottom:4px; }
.qr-preview-detail  { font-size:11px; color:var(--text2); margin-bottom:2px; }
.qr-preview-label   { font-size:10px; color:var(--muted); margin-top:6px; text-align:center; }

/* ══ FORM FIELDS ══ */
.form-section { display:flex; flex-direction:column; gap:14px; }
.form-row-2   { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
.form-row-3   { display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; }
.form-field   { display:flex; flex-direction:column; gap:5px; }
.field-label  { font-size:10.5px; font-weight:700; text-transform:uppercase; letter-spacing:.6px; color:var(--muted); }
.form-input   { border:1px solid var(--border2); border-radius:var(--radius-s); padding:8px 11px; font-family:inherit; font-size:12.5px; color:var(--text1); background:var(--bg-card); outline:none; transition:border .15s; width:100%; box-sizing:border-box; }
.form-input:focus { border-color:var(--accent); }
.form-textarea { border:1px solid var(--border2); border-radius:var(--radius-s); padding:8px 11px; font-family:inherit; font-size:12.5px; color:var(--text1); background:var(--bg-card); outline:none; resize:vertical; width:100%; box-sizing:border-box; }
.form-textarea:focus { border-color:var(--accent); }

/* ══ TRANSMISSION LIST ══ */
.transmission-list { padding:6px 0; }
.trans-item { display:flex; align-items:center; gap:10px; padding:9px 18px; border-bottom:1px solid var(--border); }
.trans-item:last-child { border-bottom:none; }
.trans-icon { width:26px; height:26px; border-radius:7px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.trans-info { flex:1; }
.trans-title { font-size:12px; font-weight:600; }
.trans-sub   { font-size:10.5px; color:var(--muted); margin-top:1px; }

/* ══ ALERTAS / INUT ══ */
.inut-list { padding:6px 0; }
.inut-item { display:flex; align-items:center; gap:10px; padding:9px 18px; border-bottom:1px solid var(--border); }
.inut-item:last-child { border-bottom:none; }
.inut-info { flex:1; }
.inut-date { font-size:11px; font-weight:700; flex-shrink:0; }

/* ══ EMPTY STATE ══ */
.empty-state { padding:28px; text-align:center; display:flex; flex-direction:column; align-items:center; gap:6px; }
.es-title { font-size:13px; font-weight:600; color:var(--text2); }
.es-sub   { font-size:11px; color:var(--muted); }

/* ══ CATEGORIA STATS ══ */
.cat-list { padding:14px 18px; display:flex; flex-direction:column; gap:12px; }
.cat-item { display:flex; align-items:center; gap:10px; }
.cat-info { width:110px; flex-shrink:0; }
.cat-nome { font-size:12px; font-weight:600; color:var(--text1); }
.cat-qtd  { font-size:10px; color:var(--muted); margin-top:1px; }
.cat-bar-wrap { flex:1; height:6px; background:var(--bg-el2); border-radius:3px; overflow:hidden; }
.cat-bar-fill { height:100%; border-radius:3px; transition:width .5s; }
.cat-pct { font-size:11px; font-weight:700; color:var(--text2); width:30px; text-align:right; flex-shrink:0; }

/* ══ TOP PRODUTOS ══ */
.top-list { padding:8px 0; }
.top-item { display:flex; align-items:center; gap:10px; padding:9px 18px; border-bottom:1px solid var(--border); }
.top-item:last-child { border-bottom:none; }
.top-rank { width:22px; height:22px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:800; flex-shrink:0; color:#fff; }
.rank-1 { background:linear-gradient(135deg,#f59e0b,#d97706); }
.rank-2 { background:linear-gradient(135deg,var(--muted),#64748b); }
.rank-3 { background:linear-gradient(135deg,#cd7c30,#a35d20); }
.top-info { flex:1; }
.top-nome { font-size:12px; font-weight:600; color:var(--text1); }

/* ══ SYNC / RESUMO ══ */
.sync-stats { display:flex; justify-content:space-around; padding:14px 18px; border-bottom:1px solid var(--border); }
.sync-stat { text-align:center; }
.ss-val { font-size:20px; font-weight:800; letter-spacing:-.4px; }
.ss-val.green  { color:var(--green);  }
.ss-val.accent { color:var(--accent); }
.ss-val.red    { color:var(--red);    }
.ss-lbl { font-size:10px; color:var(--muted); margin-top:2px; }
.sync-bar-wrap { margin:12px 18px 6px; height:6px; background:var(--bg-el2); border-radius:3px; overflow:hidden; }
.sync-bar-fill { height:100%; background:linear-gradient(90deg,var(--green),var(--accent)); border-radius:3px; transition:width .5s; }
.sync-info { text-align:center; font-size:11.5px; color:var(--muted); padding-bottom:10px; }
.resumo-extra { display:flex; flex-direction:column; gap:4px; padding:0 18px 14px; border-top:1px solid var(--border); padding-top:10px; }
.re-item { display:flex; align-items:center; gap:6px; font-size:11.5px; color:var(--text2); }

/* ══ TRIBUT SECTION ══ */
.tribut-section { background:var(--bg-el); border-radius:var(--radius-s); padding:14px; }
.trib-label { font-size:10.5px; font-weight:700; text-transform:uppercase; letter-spacing:.6px; color:var(--muted); margin-bottom:10px; }
.review-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
.review-item { display:flex; flex-direction:column; gap:3px; }
.review-label { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.5px; color:var(--muted); }
.review-val   { font-size:13px; font-weight:700; color:var(--text1); }
.review-val.accent { color:var(--accent); }

/* ══ BTN FULL ══ */
.btn-full { width:100%; display:flex; align-items:center; justify-content:center; gap:8px; padding:11px; border-radius:var(--radius-s); font-family:inherit; font-size:13px; font-weight:700; cursor:pointer; border:none; transition:all .15s; }
.emit-btn { background:linear-gradient(135deg,var(--accent),#e65d26); color:#fff; box-shadow:0 4px 12px rgba(255,128,73,.3); }
.emit-btn:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 6px 16px rgba(255,128,73,.4); }
.emit-btn:disabled { opacity:.4; cursor:not-allowed; }

/* ══ MODAL ══ */
.modal-overlay { position:fixed; inset:0; z-index:1000; background:rgba(0,0,0,.45); display:flex; align-items:center; justify-content:center; backdrop-filter:blur(3px); }
.modal-box { background:var(--bg-card); border-radius:16px; width:min(92vw,720px); max-height:90vh; display:flex; flex-direction:column; box-shadow:0 24px 60px rgba(0,0,0,.2); overflow:hidden; }
.modal-header { display:flex; align-items:center; justify-content:space-between; padding:16px 22px; border-bottom:1px solid var(--border); }
.modal-title-row { display:flex; align-items:center; gap:10px; }
.modal-title { font-size:15px; font-weight:800; letter-spacing:-.3px; }
.modal-sub   { font-size:11px; color:var(--muted); margin-top:2px; }
.modal-close { display:flex; align-items:center; justify-content:center; width:30px; height:30px; border-radius:7px; border:1px solid var(--border); background:var(--bg-el); color:var(--text2); cursor:pointer; transition:all .15s; }
.modal-close:hover { background:var(--bg-el2); color:var(--red); }
.modal-body   { overflow-y:auto; flex:1; padding:20px 22px; display:flex; flex-direction:column; gap:16px; }
.modal-footer { padding:14px 22px; border-top:1px solid var(--border); display:flex; align-items:center; gap:8px; }
.modal-step-info { font-size:11.5px; color:var(--muted); }

/* ══ FORM STEPS ══ */
.form-steps { display:flex; gap:0; margin-bottom:4px; }
.form-step { display:flex; align-items:center; gap:7px; font-size:11.5px; font-weight:600; color:var(--muted); flex:1; }
.form-step::after { content:''; flex:1; height:1px; background:var(--border2); margin:0 8px; }
.form-step:last-child::after { display:none; }
.form-step.active { color:var(--accent); }
.form-step.done   { color:var(--green);  }
.step-circle { width:22px; height:22px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:800; flex-shrink:0; border:2px solid currentColor; background:transparent; transition:all .2s; }
.form-step.active .step-circle { background:var(--accent); color:#fff; border-color:var(--accent); }
.form-step.done   .step-circle { background:var(--green);  color:#fff; border-color:var(--green);  }
.step-label { white-space:nowrap; }

/* ══ QR MODAL ══ */
.qr-modal { background:var(--bg-card); border-radius:16px; width:min(90vw,380px); box-shadow:0 24px 60px rgba(0,0,0,.2); overflow:hidden; }
.qr-body { padding:20px 22px; display:flex; flex-direction:column; gap:14px; align-items:center; }
.qr-etiqueta-box { border:2px solid var(--border2); border-radius:10px; padding:10px; background:#fff; }
.qr-info { width:100%; background:var(--bg-el); border-radius:var(--radius-s); padding:12px; display:flex; flex-direction:column; gap:6px; }
.qr-row  { display:flex; justify-content:space-between; font-size:12px; }
.qr-row span { color:var(--muted); }
.qr-actions { display:flex; gap:8px; }

/* ══ TOAST ══ */
.toast { position:fixed; bottom:24px; right:24px; z-index:9999; display:flex; align-items:center; gap:8px; background:var(--text1); color:#fff; padding:11px 18px; border-radius:var(--radius); font-size:13px; font-weight:500; box-shadow:0 8px 24px rgba(0,0,0,.15); transform:translateY(20px); opacity:0; transition:all .3s cubic-bezier(.34,1.56,.64,1); pointer-events:none; }
.toast.toast-show { transform:translateY(0); opacity:1; }

/* ══ FOOTER ══ */
.dash-footer { padding:14px 24px; border-top:1px solid var(--border); display:flex; justify-content:space-between; font-size:11px; color:var(--muted); background:var(--bg-card); }

/* ══ RESPONSIVE ══ */
@media (max-width:1280px) {
  .kpi-grid { grid-template-columns:repeat(2,1fr); }
  .grid-2-1 { grid-template-columns:1fr; }
  .grid-3   { grid-template-columns:1fr 1fr; }
}
@media (max-width:900px) {
  .form-row-2 { grid-template-columns:1fr; }
  .form-row-3 { grid-template-columns:1fr 1fr; }
  .topbar     { flex-wrap:wrap; gap:8px; }
}
@media (max-width:640px) {
  .kpi-grid { grid-template-columns:1fr; }
  .content  { padding:14px; }
  .filter-bar { flex-direction:column; align-items:flex-start; }
  .form-row-3 { grid-template-columns:1fr; }
  .grid-3   { grid-template-columns:1fr; }
  .review-grid{ grid-template-columns:1fr; }
}
</style>