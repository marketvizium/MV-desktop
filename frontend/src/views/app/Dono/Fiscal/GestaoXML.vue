<template>
  <div class="dashboard-root">
    <div class="main-area">

      <!-- TOPBAR -->
      <div class="topbar">
        <div class="topbar-brand">
          <div class="brand-icon">
            <span class="material-symbols-outlined" style="font-size:17px;color:#fff">folder_zip</span>
          </div>
          <div>
            <div class="topbar-title">Gestão de XML</div>
            <div class="topbar-sub">Exportação · Importação · Manifestação do Destinatário</div>
          </div>
        </div>
        <div class="topbar-right">
          <div class="sefaz-status online">
            <span class="sefaz-dot"></span>
            SEFAZ Online
          </div>
          <button class="tbtn primary" @click="activeTab = 'exportacao'">
            <span class="material-symbols-outlined" style="font-size:14px">download</span>
            Exportar ZIP
          </button>
          <button class="tbtn" @click="triggerImport">
            <span class="material-symbols-outlined" style="font-size:14px">upload</span>
            Importar XML
          </button>
          <input ref="fileInput" type="file" accept=".xml" multiple style="display:none" @change="handleFileImport" />
          <div class="user-avatar">CF</div>
        </div>
      </div>

      <div class="content">

        <!-- FILTER BAR -->
        <div class="filter-bar">
          <div class="filter-left">
            <span class="material-symbols-outlined" style="font-size:18px;color:var(--accent)">calendar_today</span>
            <span class="filter-label">Período:</span>
            <div class="period-tabs">
              <button v-for="p in periods" :key="p.key" class="ptab"
                :class="{ active: activePeriod === p.key }"
                @click="activePeriod = p.key">{{ p.label }}</button>
            </div>
            <div class="custom-days" v-if="activePeriod === 'custom'">
              <span class="filter-label">Últimos</span>
              <input type="number" v-model.number="customDays" min="1" max="365" class="days-input" />
              <span class="filter-label">dias</span>
            </div>
            <div class="filter-sep"></div>
            <span class="filter-label">Tipo:</span>
            <div class="type-chips">
              <span v-for="t in tiposDoc" :key="t.key"
                class="chip" :class="{ active: activeTypes.includes(t.key) }"
                @click="toggleType(t.key)">{{ t.label }}</span>
            </div>
          </div>
          <div class="filter-right">
            <span class="filter-sub">Exibindo: <strong>{{ periodLabel }}</strong> · {{ totalDocs }} documentos</span>
          </div>
        </div>

        <!-- TABS PRINCIPAIS -->
        <div class="main-tabs">
          <button v-for="tab in mainTabs" :key="tab.key"
            class="main-tab" :class="{ active: activeTab === tab.key }"
            @click="activeTab = tab.key">
            <span class="material-symbols-outlined" style="font-size:16px">{{ tab.icon }}</span>
            {{ tab.label }}
            <span v-if="tab.badge" class="tab-badge" :class="tab.badgeColor">{{ tab.badge }}</span>
          </button>
        </div>

        <!-- ════════════════════════════════════════
             ABA: EXPORTAÇÃO
        ════════════════════════════════════════ -->
        <div v-if="activeTab === 'exportacao'">

          <!-- KPIs de Exportação -->
          <div class="kpi-grid">
            <div v-for="kpi in exportKpis" :key="kpi.label" class="kpi-card" :class="kpi.accent">
              <div class="kpi-label">
                <span class="material-symbols-outlined" style="font-size:15px;margin-right:3px">{{ kpi.icon }}</span>
                {{ kpi.label }}
              </div>
              <div class="kpi-value">{{ kpi.value }}</div>
              <div class="kpi-footer">
                <span :class="['kpi-delta', kpi.trendUp ? 'up' : 'down']">
                  <span class="material-symbols-outlined" style="font-size:12px">{{ kpi.trendUp ? 'trending_up' : 'trending_down' }}</span>
                  {{ kpi.trend }}
                </span>
                <span class="kpi-sub">vs período ant.</span>
              </div>
              <span class="material-symbols-outlined kpi-bg-icon">{{ kpi.icon }}</span>
            </div>
          </div>

          <!-- PAINEL DE EXPORTAÇÃO -->
          <div class="grid-2-1">

            <!-- TABELA DE XMLs -->
            <div class="card">
              <div class="card-head">
                <div class="card-icon c-orange">
                  <span class="material-symbols-outlined">description</span>
                </div>
                <div>
                  <div class="card-title">Documentos Fiscais</div>
                  <div class="card-sub">{{ periodLabel }} · {{ filteredXmls.length }} registros</div>
                </div>
                <div class="card-actions">
                  <div class="search-box">
                    <span class="material-symbols-outlined" style="font-size:14px;color:var(--muted)">search</span>
                    <input v-model="searchQuery" placeholder="Buscar..." class="search-input" />
                  </div>
                  <div class="select-wrap">
                    <select v-model="filterSituacao" class="sel-input">
                      <option value="">Situação</option>
                      <option value="Autorizada">Autorizada</option>
                      <option value="Cancelada">Cancelada</option>
                      <option value="Inutilizada">Inutilizada</option>
                      <option value="Contingência">Contingência</option>
                    </select>
                  </div>
                  <button class="tbtn" @click="selectAll">
                    <span class="material-symbols-outlined" style="font-size:13px">checklist</span>
                    Sel. todos
                  </button>
                  <button class="tbtn primary" :disabled="selectedXmls.length === 0" @click="exportarLote">
                    <span class="material-symbols-outlined" style="font-size:13px">folder_zip</span>
                    ZIP ({{ selectedXmls.length }})
                  </button>
                </div>
              </div>

              <!-- SELEÇÃO ATIVA -->
              <div class="selection-bar" v-if="selectedXmls.length > 0">
                <span class="material-symbols-outlined" style="font-size:16px;color:var(--accent)">check_circle</span>
                <span><strong>{{ selectedXmls.length }}</strong> documentos selecionados</span>
                <div style="margin-left:auto;display:flex;gap:8px">
                  <button class="tbtn" @click="exportarIndividual('xml')">
                    <span class="material-symbols-outlined" style="font-size:13px">download</span> XML
                  </button>
                  <button class="tbtn" @click="exportarLote">
                    <span class="material-symbols-outlined" style="font-size:13px">folder_zip</span> ZIP
                  </button>
                  <button class="tbtn danger" @click="selectedXmls = []">
                    <span class="material-symbols-outlined" style="font-size:13px">close</span> Limpar
                  </button>
                </div>
              </div>

              <div class="table-wrap">
                <table class="xml-table">
                  <thead>
                    <tr>
                      <th style="width:36px">
                        <input type="checkbox" class="chk" @change="toggleSelectAll" :checked="selectedXmls.length === filteredXmls.length && filteredXmls.length > 0" />
                      </th>
                      <th>TIPO</th>
                      <th>NRO.</th>
                      <th>DESTINATÁRIO / EMITENTE</th>
                      <th>VALOR</th>
                      <th>EMISSÃO</th>
                      <th>SITUAÇÃO</th>
                      <th style="width:100px">AÇÕES</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="doc in paginatedXmls" :key="doc.id"
                      :class="{ 'row-selected': selectedXmls.includes(doc.id) }">
                      <td>
                        <input type="checkbox" class="chk"
                          :checked="selectedXmls.includes(doc.id)"
                          @change="toggleSelect(doc.id)" />
                      </td>
                      <td><Tag :value="doc.tipo" class="tag-custom" :class="'tag-tipo-'+doc.tipo.toLowerCase().replace('-','').replace('ç','c')" /></td>
                      <td><span class="mono-bold">{{ doc.numero }}</span></td>
                      <td>
                        <div class="cell-name">{{ doc.destinatario }}</div>
                        <div class="cell-sub">{{ doc.cnpj }}</div>
                      </td>
                      <td><span class="mono-bold">R$ {{ doc.valor }}</span></td>
                      <td><span style="font-size:11.5px;color:var(--text2)">{{ doc.emissao }}</span></td>
                      <td>
                        <Tag :value="doc.situacao" class="tag-custom"
                          :class="doc.situacao === 'Autorizada' ? 'tag-green' : doc.situacao === 'Cancelada' ? 'tag-red' : doc.situacao === 'Contingência' ? 'tag-orange' : 'tag-yellow'" />
                      </td>
                      <td>
                        <div class="row-actions">
                          <button class="icon-btn" title="Baixar XML" @click="downloadXml(doc)">
                            <span class="material-symbols-outlined" style="font-size:15px">download</span>
                          </button>
                          <button class="icon-btn" title="Visualizar" @click="viewDoc(doc)">
                            <span class="material-symbols-outlined" style="font-size:15px">visibility</span>
                          </button>
                          <button class="icon-btn" title="Chave de acesso" @click="copyChave(doc)">
                            <span class="material-symbols-outlined" style="font-size:15px">content_copy</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="pagination">
                <span class="pag-info">{{ (currentPage-1)*pageSize + 1 }}–{{ Math.min(currentPage*pageSize, filteredXmls.length) }} de {{ filteredXmls.length }}</span>
                <div class="pag-btns">
                  <button class="pag-btn" :disabled="currentPage === 1" @click="currentPage--">
                    <span class="material-symbols-outlined" style="font-size:15px">chevron_left</span>
                  </button>
                  <span class="pag-num">{{ currentPage }} / {{ totalPages }}</span>
                  <button class="pag-btn" :disabled="currentPage === totalPages" @click="currentPage++">
                    <span class="material-symbols-outlined" style="font-size:15px">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- PAINEL DIREITO: Exportação e Estrutura ZIP -->
            <div style="display:flex;flex-direction:column;gap:14px">

              <!-- EXPORTAÇÃO RÁPIDA -->
              <div class="card">
                <div class="card-head">
                  <div class="card-icon c-orange">
                    <span class="material-symbols-outlined">folder_zip</span>
                  </div>
                  <div>
                    <div class="card-title">Exportação em Lote</div>
                    <div class="card-sub">Gerar pacote ZIP automático</div>
                  </div>
                </div>
                <div class="export-panel">
                  <div class="export-field">
                    <label class="field-label">Organização do ZIP</label>
                    <div class="radio-group">
                      <label v-for="org in zipOrgs" :key="org.key" class="radio-item"
                        :class="{ active: zipOrg === org.key }">
                        <input type="radio" :value="org.key" v-model="zipOrg" />
                        <span class="material-symbols-outlined" style="font-size:14px">{{ org.icon }}</span>
                        {{ org.label }}
                      </label>
                    </div>
                  </div>
                  <div class="export-field">
                    <label class="field-label">Incluir documentos</label>
                    <div class="check-group">
                      <label v-for="inc in zipIncludes" :key="inc.key" class="check-item"
                        :class="{ active: zipIncludeList.includes(inc.key) }">
                        <input type="checkbox" :value="inc.key" v-model="zipIncludeList" />
                        <span class="material-symbols-outlined" style="font-size:14px">{{ inc.icon }}</span>
                        {{ inc.label }}
                      </label>
                    </div>
                  </div>
                  <div class="export-preview">
                    <div class="preview-label">
                      <span class="material-symbols-outlined" style="font-size:14px">folder_open</span>
                      Estrutura gerada:
                    </div>
                    <div class="tree-view">
                      <div class="tree-node root">📁 2026/</div>
                      <div class="tree-node l1">└── 📁 05/</div>
                      <div class="tree-node l2" v-if="zipIncludeList.includes('nfe')">├── 📁 nfe/ <span class="tree-count">{{ currentKpis.nfe }} arq.</span></div>
                      <div class="tree-node l2" v-if="zipIncludeList.includes('nfce')">├── 📁 nfce/ <span class="tree-count">{{ currentKpis.nfce }} arq.</span></div>
                      <div class="tree-node l2" v-if="zipIncludeList.includes('cte')">├── 📁 cte/ <span class="tree-count">{{ currentKpis.cte }} arq.</span></div>
                      <div class="tree-node l2" v-if="zipIncludeList.includes('canceladas')">└── 📁 canceladas/ <span class="tree-count">{{ currentKpis.canceladas }} arq.</span></div>
                    </div>
                  </div>
                  <button class="btn-full primary-btn" @click="gerarZip">
                    <span class="material-symbols-outlined" style="font-size:16px">download</span>
                    Gerar e Baixar ZIP
                  </button>
                </div>
              </div>

              <!-- STATUS DE DOWNLOAD -->
              <div class="card">
                <div class="card-head">
                  <div class="card-icon c-green">
                    <span class="material-symbols-outlined">history</span>
                  </div>
                  <div>
                    <div class="card-title">Histórico de Exports</div>
                    <div class="card-sub">Últimos pacotes gerados</div>
                  </div>
                </div>
                <div class="hist-list">
                  <div v-for="h in exportHistory" :key="h.id" class="hist-item">
                    <div class="hist-icon" :class="h.status === 'Concluído' ? 'c-green' : 'c-yellow'">
                      <span class="material-symbols-outlined" style="font-size:14px">{{ h.status === 'Concluído' ? 'check_circle' : 'sync' }}</span>
                    </div>
                    <div class="hist-info">
                      <div class="hist-name">{{ h.nome }}</div>
                      <div class="hist-sub">{{ h.qtd }} docs · {{ h.tamanho }} · {{ h.data }}</div>
                    </div>
                    <button class="icon-btn" title="Baixar novamente">
                      <span class="material-symbols-outlined" style="font-size:14px">download</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ════════════════════════════════════════
             ABA: IMPORTAÇÃO
        ════════════════════════════════════════ -->
        <div v-if="activeTab === 'importacao'">

          <div class="grid-2-1">

            <!-- ÁREA DE UPLOAD -->
            <div style="display:flex;flex-direction:column;gap:14px">

              <!-- DROPZONE -->
              <div class="card">
                <div class="card-head">
                  <div class="card-icon c-blue">
                    <span class="material-symbols-outlined">upload_file</span>
                  </div>
                  <div>
                    <div class="card-title">Importar Documentos XML</div>
                    <div class="card-sub">Fornecedor · Entrada · Devolução · CT-e · MDF-e</div>
                  </div>
                </div>
                <div class="dropzone" @dragover.prevent @drop.prevent="handleDrop"
                  :class="{ 'dropzone-active': isDragging }"
                  @dragenter="isDragging=true" @dragleave="isDragging=false">
                  <div class="dz-icon">
                    <span class="material-symbols-outlined" style="font-size:48px;color:var(--accent)">cloud_upload</span>
                  </div>
                  <div class="dz-title">Arraste XMLs aqui ou clique para selecionar</div>
                  <div class="dz-sub">Suporte: NF-e, NFC-e, CT-e, MDF-e · Múltiplos arquivos</div>
                  <button class="tbtn primary" style="margin-top:12px" @click="triggerImport">
                    <span class="material-symbols-outlined" style="font-size:14px">folder_open</span>
                    Selecionar arquivos
                  </button>
                </div>

                <!-- TIPOS DE IMPORTAÇÃO -->
                <div class="import-types">
                  <div v-for="tipo in importTipos" :key="tipo.key"
                    class="import-type" :class="{ active: importTipo === tipo.key }"
                    @click="importTipo = tipo.key">
                    <div class="it-icon" :style="{ background: tipo.color + '18', color: tipo.color }">
                      <span class="material-symbols-outlined" style="font-size:18px">{{ tipo.icon }}</span>
                    </div>
                    <div class="it-info">
                      <div class="it-name">{{ tipo.name }}</div>
                      <div class="it-sub">{{ tipo.sub }}</div>
                    </div>
                    <span v-if="importTipo === tipo.key" class="material-symbols-outlined" style="font-size:16px;color:var(--accent);margin-left:auto">check_circle</span>
                  </div>
                </div>
              </div>

              <!-- OPÇÕES DE IMPORTAÇÃO -->
              <div class="card">
                <div class="card-head">
                  <div class="card-icon c-orange">
                    <span class="material-symbols-outlined">settings</span>
                  </div>
                  <div>
                    <div class="card-title">Ações ao Importar</div>
                    <div class="card-sub">Configurações automáticas</div>
                  </div>
                </div>
                <div class="options-grid">
                  <label v-for="opt in importOptions" :key="opt.key"
                    class="opt-item" :class="{ active: importOpts.includes(opt.key) }">
                    <input type="checkbox" :value="opt.key" v-model="importOpts" />
                    <div class="opt-icon" :style="{ background: opt.color + '18', color: opt.color }">
                      <span class="material-symbols-outlined" style="font-size:15px">{{ opt.icon }}</span>
                    </div>
                    <div class="opt-info">
                      <div class="opt-name">{{ opt.name }}</div>
                      <div class="opt-sub">{{ opt.sub }}</div>
                    </div>
                    <div class="opt-toggle" :class="{ 'tog-on': importOpts.includes(opt.key) }"></div>
                  </label>
                </div>
              </div>
            </div>

            <!-- PAINEL DIREITO: Fila e Validações -->
            <div style="display:flex;flex-direction:column;gap:14px">

              <!-- FILA DE IMPORTAÇÃO -->
              <div class="card">
                <div class="card-head">
                  <div class="card-icon c-yellow">
                    <span class="material-symbols-outlined">queue</span>
                  </div>
                  <div>
                    <div class="card-title">Fila de Importação</div>
                    <div class="card-sub">{{ importQueue.length }} arquivo(s) aguardando</div>
                  </div>
                  <div class="card-actions">
                    <button class="tbtn primary" :disabled="importQueue.length === 0" @click="processQueue">
                      <span class="material-symbols-outlined" style="font-size:13px">play_arrow</span>
                      Processar
                    </button>
                  </div>
                </div>
                <div class="queue-list">
                  <div v-if="importQueue.length === 0" class="empty-state">
                    <span class="material-symbols-outlined" style="font-size:32px;color:var(--muted)">inbox</span>
                    <div class="es-title">Nenhum arquivo na fila</div>
                    <div class="es-sub">Arraste XMLs ou clique em selecionar</div>
                  </div>
                  <div v-for="item in importQueue" :key="item.id" class="queue-item">
                    <div class="qi-icon" :class="'c-'+item.color">
                      <span class="material-symbols-outlined" style="font-size:14px">{{ item.icon }}</span>
                    </div>
                    <div class="qi-info">
                      <div class="qi-name">{{ item.nome }}</div>
                      <div class="qi-sub">{{ item.tipo }} · {{ item.tamanho }}</div>
                    </div>
                    <div class="qi-status">
                      <div v-if="item.status === 'processando'" class="progress-ring">
                        <div class="spinner"></div>
                      </div>
                      <Tag v-else :value="item.status" class="tag-custom"
                        :class="item.status === 'Concluído' ? 'tag-green' : item.status === 'Erro' ? 'tag-red' : 'tag-yellow'" />
                    </div>
                  </div>
                </div>
              </div>

              <!-- VALIDAÇÕES -->
              <div class="card">
                <div class="card-head">
                  <div class="card-icon c-green">
                    <span class="material-symbols-outlined">fact_check</span>
                  </div>
                  <div>
                    <div class="card-title">Validações Automáticas</div>
                    <div class="card-sub">Checklist por documento importado</div>
                  </div>
                </div>
                <div class="validation-list">
                  <div v-for="v in validacoes" :key="v.id" class="val-item">
                    <span class="material-symbols-outlined val-icon"
                      :style="{ color: v.status === 'ok' ? 'var(--green)' : v.status === 'warn' ? 'var(--yellow)' : 'var(--red)' }">
                      {{ v.status === 'ok' ? 'check_circle' : v.status === 'warn' ? 'warning' : 'cancel' }}
                    </span>
                    <div class="val-info">
                      <div class="val-name">{{ v.nome }}</div>
                      <div class="val-sub">{{ v.descricao }}</div>
                    </div>
                    <Tag :value="v.tag" class="tag-custom"
                      :class="v.status === 'ok' ? 'tag-green' : v.status === 'warn' ? 'tag-yellow' : 'tag-red'" />
                  </div>
                </div>
              </div>

              <!-- HISTÓRICO DE IMPORTAÇÕES -->
              <div class="card">
                <div class="card-head">
                  <div class="card-icon c-orange">
                    <span class="material-symbols-outlined">history</span>
                  </div>
                  <div>
                    <div class="card-title">Importações Recentes</div>
                    <div class="card-sub">Últimos processamentos</div>
                  </div>
                </div>
                <div class="hist-list">
                  <div v-for="h in importHistory" :key="h.id" class="hist-item">
                    <div class="hist-icon" :class="h.erros > 0 ? 'c-yellow' : 'c-green'">
                      <span class="material-symbols-outlined" style="font-size:14px">{{ h.erros > 0 ? 'warning' : 'check_circle' }}</span>
                    </div>
                    <div class="hist-info">
                      <div class="hist-name">{{ h.nome }}</div>
                      <div class="hist-sub">{{ h.tipo }} · {{ h.qtd }} itens · {{ h.data }}</div>
                    </div>
                    <div style="text-align:right;flex-shrink:0">
                      <div style="font-size:11px;color:var(--green);font-weight:700">{{ h.qtd - h.erros }} OK</div>
                      <div v-if="h.erros" style="font-size:10px;color:var(--red)">{{ h.erros }} erros</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ════════════════════════════════════════
             ABA: MANIFESTAÇÃO DO DESTINATÁRIO
        ════════════════════════════════════════ -->
        <div v-if="activeTab === 'manifestacao'">

          <!-- KPIs de Manifestação -->
          <div class="kpi-grid" style="grid-template-columns:repeat(4,1fr)">
            <div v-for="kpi in manifestKpis" :key="kpi.label" class="kpi-card" :class="kpi.accent">
              <div class="kpi-label">
                <span class="material-symbols-outlined" style="font-size:15px;margin-right:3px">{{ kpi.icon }}</span>
                {{ kpi.label }}
              </div>
              <div class="kpi-value">{{ kpi.value }}</div>
              <div class="kpi-footer">
                <span class="kpi-sub">{{ kpi.sub }}</span>
              </div>
              <span class="material-symbols-outlined kpi-bg-icon">{{ kpi.icon }}</span>
            </div>
          </div>

          <div class="grid-2-1">

            <!-- TABELA DE MANIFESTAÇÃO -->
            <div class="card">
              <div class="card-head">
                <div class="card-icon c-orange">
                  <span class="material-symbols-outlined">assignment_turned_in</span>
                </div>
                <div>
                  <div class="card-title">Notas Aguardando Manifestação</div>
                  <div class="card-sub">{{ manifestacoes.length }} documentos pendentes de evento</div>
                </div>
                <div class="card-actions">
                  <div class="search-box">
                    <span class="material-symbols-outlined" style="font-size:14px;color:var(--muted)">search</span>
                    <input v-model="manifestSearch" placeholder="Buscar emitente..." class="search-input" />
                  </div>
                  <div class="select-wrap">
                    <select v-model="manifestFilter" class="sel-input">
                      <option value="">Todos</option>
                      <option value="Desconhecida">Desconhecida</option>
                      <option value="Ciência">Ciência</option>
                      <option value="Confirmada">Confirmada</option>
                      <option value="Não Realizada">Não Realizada</option>
                    </select>
                  </div>
                  <button class="tbtn primary" @click="manifestarTodos">
                    <span class="material-symbols-outlined" style="font-size:13px">done_all</span>
                    Manifestar selecionados
                  </button>
                </div>
              </div>

              <div class="table-wrap">
                <table class="xml-table">
                  <thead>
                    <tr>
                      <th style="width:36px">
                        <input type="checkbox" class="chk" @change="toggleManifestAll" />
                      </th>
                      <th>EMITENTE</th>
                      <th>CHAVE NF-e</th>
                      <th>VALOR</th>
                      <th>EMISSÃO</th>
                      <th>SITUAÇÃO</th>
                      <th style="width:220px">MANIFESTAR</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="m in filteredManifestacoes" :key="m.id"
                      :class="{ 'row-selected': selectedManifest.includes(m.id) }">
                      <td>
                        <input type="checkbox" class="chk"
                          :checked="selectedManifest.includes(m.id)"
                          @change="toggleManifest(m.id)" />
                      </td>
                      <td>
                        <div class="cell-name">{{ m.emitente }}</div>
                        <div class="cell-sub">{{ m.cnpj }}</div>
                      </td>
                      <td>
                        <div class="chave-box">
                          <span class="chave-text">{{ m.chave }}</span>
                          <button class="icon-btn-xs" @click="copyChaveText(m.chave)">
                            <span class="material-symbols-outlined" style="font-size:12px">content_copy</span>
                          </button>
                        </div>
                      </td>
                      <td><span class="mono-bold">R$ {{ m.valor }}</span></td>
                      <td><span style="font-size:11.5px;color:var(--text2)">{{ m.emissao }}</span></td>
                      <td>
                        <Tag :value="m.situacao" class="tag-custom"
                          :class="m.situacao === 'Confirmada' ? 'tag-green' : m.situacao === 'Desconhecida' ? 'tag-yellow' : m.situacao === 'Ciência' ? 'tag-blue' : 'tag-red'" />
                      </td>
                      <td>
                        <div class="manifest-btns">
                          <button class="mf-btn ciencia" @click="manifestar(m, 'Ciência')"
                            :class="{ active: m.situacao === 'Ciência' }" title="Ciência da Operação">
                            <span class="material-symbols-outlined" style="font-size:12px">visibility</span>
                            Ciência
                          </button>
                          <button class="mf-btn confirmar" @click="manifestar(m, 'Confirmada')"
                            :class="{ active: m.situacao === 'Confirmada' }" title="Confirmação da Operação">
                            <span class="material-symbols-outlined" style="font-size:12px">check</span>
                            Confirmar
                          </button>
                          <button class="mf-btn desconhece" @click="manifestar(m, 'Desconhecida')"
                            title="Desconhecimento da Operação">
                            <span class="material-symbols-outlined" style="font-size:12px">help</span>
                          </button>
                          <button class="mf-btn naorealizada" @click="manifestar(m, 'Não Realizada')"
                            title="Operação Não Realizada">
                            <span class="material-symbols-outlined" style="font-size:12px">block</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- PAINEL DIREITO: Resumo e Eventos -->
            <div style="display:flex;flex-direction:column;gap:14px">

              <!-- RESUMO GRÁFICO -->
              <div class="card">
                <div class="card-head">
                  <div class="card-icon c-orange">
                    <span class="material-symbols-outlined">pie_chart</span>
                  </div>
                  <div>
                    <div class="card-title">Distribuição dos Eventos</div>
                    <div class="card-sub">Status por tipo de manifestação</div>
                  </div>
                </div>
                <div class="donut-wrap">
                  <Doughnut :data="manifestDonutData" :options="donutOptions" />
                </div>
                <div class="manifest-legend">
                  <div v-for="leg in manifestLegend" :key="leg.label" class="leg-item">
                    <span class="leg-dot" :style="{ background: leg.color }"></span>
                    <span class="leg-label">{{ leg.label }}</span>
                    <span class="leg-count">{{ leg.count }}</span>
                    <div class="leg-bar-wrap">
                      <div class="leg-bar" :style="{ width: leg.pct + '%', background: leg.color }"></div>
                    </div>
                    <span class="leg-pct">{{ leg.pct }}%</span>
                  </div>
                </div>
              </div>

              <!-- EVENTOS RECENTES -->
              <div class="card">
                <div class="card-head">
                  <div class="card-icon c-blue">
                    <span class="material-symbols-outlined">event_note</span>
                  </div>
                  <div>
                    <div class="card-title">Eventos Recentes</div>
                    <div class="card-sub">Últimas manifestações enviadas</div>
                  </div>
                </div>
                <div class="eventos-list">
                  <div v-for="ev in eventosRecentes" :key="ev.id" class="ev-item">
                    <div class="ev-icon" :style="{ background: ev.color + '18', color: ev.color }">
                      <span class="material-symbols-outlined" style="font-size:15px">{{ ev.icon }}</span>
                    </div>
                    <div class="ev-info">
                      <div class="ev-title">{{ ev.evento }}</div>
                      <div class="ev-sub">{{ ev.emitente }} · {{ ev.chave }}</div>
                    </div>
                    <div class="ev-right">
                      <div class="ev-time">{{ ev.hora }}</div>
                      <Tag :value="ev.status" class="tag-custom"
                        :class="ev.status === 'Enviado' ? 'tag-green' : 'tag-yellow'" />
                    </div>
                  </div>
                </div>
              </div>

              <!-- ALERTA PRAZO -->
              <div class="alerta-prazo-card">
                <div class="ap-icon">
                  <span class="material-symbols-outlined" style="font-size:24px">schedule</span>
                </div>
                <div class="ap-info">
                  <div class="ap-title">Atenção ao prazo!</div>
                  <div class="ap-sub">A ciência da operação deve ser feita em até <strong>90 dias</strong> após a emissão da NF-e. Você possui <strong>3 notas</strong> próximas do vencimento.</div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- TOAST -->
      <div class="toast" :class="{ 'toast-show': toastVisible }">
        <span class="material-symbols-outlined" style="font-size:16px">{{ toastIcon }}</span>
        {{ toastMsg }}
      </div>

      <footer class="dash-footer">
        <span>Gestão de XML · ERP Fiscal · Dados via SEFAZ WebService</span>
        <span>©2026 Todos os dados reservados · {{ new Date().toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' }) }}</span>
      </footer>
    </div>
  </div>
</template>

<script>
import { Doughnut } from 'vue-chartjs';
import {
  Chart as ChartJS, Title, Tooltip, Legend, ArcElement
} from 'chart.js';
import Tag from 'primevue/tag';

ChartJS.register(Title, Tooltip, Legend, ArcElement);

const ACCENT = '#FF8049';
const GREEN  = '#16a34a';
const BLUE   = '#2563eb';
const YELLOW = '#ca8a04';
const RED    = '#dc2626';
const PURPLE = '#7c3aed';
const TOOLTIP_BG = '#1e293b';
const TEXT = '#64748b';

const baseTooltip = {
  backgroundColor: TOOLTIP_BG,
  borderColor: 'rgba(255,255,255,0.1)',
  borderWidth: 1,
  titleColor: '#f1f5f9',
  bodyColor: '#94a3b8',
  padding: 10,
};

function rnd(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

const xmlData = [
  ...Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    tipo: 'NF-e',
    numero: String(1000 - i).padStart(6, '0'),
    destinatario: ['Distribuidora Alpha Ltda.','Comércio Beta ME','Tech Imports S.A.','Varejão Central Eireli','Atacado Sul Ltda.'][i % 5],
    cnpj: ['12.345.678/0001-90','98.765.432/0001-11','55.444.333/0001-22','77.666.555/0001-33','11.222.333/0001-44'][i % 5],
    valor: (rnd(1000, 50000) / 100).toFixed(2).replace('.', ','),
    emissao: `${String(rnd(1,14)).padStart(2,'0')}/05/2026`,
    situacao: ['Autorizada','Autorizada','Autorizada','Cancelada','Contingência'][i % 5],
    chave: `3526${String(rnd(100000000,999999999))}0001550001${String(i+1).padStart(9,'0')}1`,
  })),
  ...Array.from({ length: 6 }, (_, i) => ({
    id: 20 + i,
    tipo: 'NFC-e',
    numero: String(500 - i).padStart(6, '0'),
    destinatario: ['Consumidor Final','Cliente Varejo ME','Pessoa Física'][i % 3],
    cnpj: ['000.000.000-00','44.555.666/0001-77','CPF omitido'][i % 3],
    valor: (rnd(50, 5000) / 100).toFixed(2).replace('.', ','),
    emissao: `${String(rnd(1,14)).padStart(2,'0')}/05/2026`,
    situacao: ['Autorizada','Autorizada','Cancelada'][i % 3],
    chave: `3526${String(rnd(100000000,999999999))}0001650001${String(i+1).padStart(9,'0')}1`,
  })),
  ...Array.from({ length: 4 }, (_, i) => ({
    id: 30 + i,
    tipo: 'CT-e',
    numero: String(200 - i).padStart(6, '0'),
    destinatario: ['Transportadora Veloz Ltda.','Log Express S.A.'][i % 2],
    cnpj: ['22.333.444/0001-55','66.777.888/0001-99'][i % 2],
    valor: (rnd(500, 20000) / 100).toFixed(2).replace('.', ','),
    emissao: `${String(rnd(1,14)).padStart(2,'0')}/05/2026`,
    situacao: ['Autorizada','Autorizada'][i % 2],
    chave: `3526${String(rnd(100000000,999999999))}0005700001${String(i+1).padStart(9,'0')}1`,
  })),
];

const manifestData = [
  { id: 1,  emitente: 'Fornecedor Alpha Ltda.',   cnpj: '12.345.678/0001-90', chave: '3524...8001', valor: '18.420,00', emissao: '01/05/2026', situacao: 'Desconhecida' },
  { id: 2,  emitente: 'Indústria Beta S.A.',       cnpj: '98.765.432/0001-11', chave: '3524...8002', valor: '9.840,00',  emissao: '02/05/2026', situacao: 'Ciência'      },
  { id: 3,  emitente: 'Comercial Gama ME',         cnpj: '55.444.333/0001-22', chave: '3524...8003', valor: '4.320,00',  emissao: '03/05/2026', situacao: 'Desconhecida' },
  { id: 4,  emitente: 'Distribuidora Delta Ltda.', cnpj: '77.666.555/0001-33', chave: '3524...8004', valor: '31.100,00', emissao: '04/05/2026', situacao: 'Confirmada'   },
  { id: 5,  emitente: 'Grupo Épsilon S.A.',        cnpj: '11.222.333/0001-44', chave: '3524...8005', valor: '7.680,00',  emissao: '05/05/2026', situacao: 'Desconhecida' },
  { id: 6,  emitente: 'Fábrica Zeta Eireli',       cnpj: '33.444.555/0001-88', chave: '3524...8006', valor: '2.200,00',  emissao: '06/05/2026', situacao: 'Não Realizada'},
  { id: 7,  emitente: 'Importados Eta Ltda.',      cnpj: '44.555.666/0001-77', chave: '3524...8007', valor: '55.000,00', emissao: '07/05/2026', situacao: 'Ciência'      },
  { id: 8,  emitente: 'Nacional Theta S.A.',       cnpj: '66.777.888/0001-99', chave: '3524...8008', valor: '14.300,00', emissao: '08/05/2026', situacao: 'Confirmada'   },
];

export default {
  name: 'GestaoXML',
  components: { Doughnut, Tag },

  data() {
    return {
      activeTab: 'exportacao',
      activePeriod: '30d',
      customDays: 30,
      searchQuery: '',
      filterSituacao: '',
      selectedXmls: [],
      currentPage: 1,
      pageSize: 8,
      zipOrg: 'mes',
      zipIncludeList: ['nfe', 'nfce', 'canceladas'],
      isDragging: false,
      importTipo: 'fornecedor',
      importOpts: ['produto', 'estoque', 'custo', 'ncm', 'cfop', 'fornecedor'],
      manifestSearch: '',
      manifestFilter: '',
      selectedManifest: [],
      xmlData,
      manifestacoes: manifestData,
      activeTypes: ['NF-e', 'NFC-e', 'CT-e', 'MDF-e'],
      toastVisible: false,
      toastMsg: '',
      toastIcon: 'check_circle',

      importQueue: [
        { id: 1, nome: 'nfe_compra_fornecedor_alpha.xml', tipo: 'NF-e Entrada', tamanho: '42 KB', status: 'Aguardando', icon: 'description', color: 'orange' },
        { id: 2, nome: 'cte_transportadora_veloz.xml',    tipo: 'CT-e',         tamanho: '18 KB', status: 'Concluído',  icon: 'local_shipping', color: 'blue' },
        { id: 3, nome: 'nfe_devolucao_cliente.xml',       tipo: 'Devolução',    tamanho: '38 KB', status: 'Erro',       icon: 'undo', color: 'red' },
      ],

      exportHistory: [
        { id: 1, nome: 'Exportação Maio/2026 — NF-e', qtd: 84,  tamanho: '3,2 MB', data: 'Hoje 09:14', status: 'Concluído' },
        { id: 2, nome: 'Exportação Abril/2026 — Lote', qtd: 312, tamanho: '11,8 MB', data: '13/05 18:30', status: 'Concluído' },
        { id: 3, nome: 'Canceladas 2026',               qtd: 41,  tamanho: '1,4 MB', data: '10/05 11:00', status: 'Concluído' },
      ],

      validacoes: [
        { id: 1, nome: 'NCM validado',          descricao: 'Tabela NCM 2026 atualizada · OK',       status: 'ok',   tag: 'Válido'    },
        { id: 2, nome: 'CFOP conferido',         descricao: '5102 – Venda de produto nacional',      status: 'ok',   tag: 'Válido'    },
        { id: 3, nome: 'Fornecedor cadastrado',  descricao: 'CNPJ encontrado na base local',         status: 'ok',   tag: 'Válido'    },
        { id: 4, nome: 'Produto identificado',   descricao: 'EAN 7891234567890 localizado',          status: 'ok',   tag: 'Válido'    },
        { id: 5, nome: 'Estoque atualizado',     descricao: '+48 un. adicionadas ao estoque',        status: 'ok',   tag: 'OK'        },
        { id: 6, nome: 'Custo atualizado',       descricao: 'Custo médio recalculado: R$ 24,80',     status: 'ok',   tag: 'OK'        },
        { id: 7, nome: 'Alíquota ICMS',          descricao: 'ST divergente · verificar manualmente', status: 'warn', tag: 'Atenção'   },
        { id: 8, nome: 'Chave NF-e única',       descricao: 'Documento já importado em 03/04/2026',  status: 'error',tag: 'Duplicado' },
      ],

      importHistory: [
        { id: 1, nome: 'Fornecedor Alpha — NF-e 000.840',     tipo: 'Entrada',  qtd: 1,  erros: 0, data: 'Hoje 09:45'   },
        { id: 2, nome: 'Lote CT-e Transportadora Veloz',       tipo: 'CT-e',     qtd: 4,  erros: 0, data: 'Hoje 08:30'   },
        { id: 3, nome: 'Devolução Cliente NF-e 000.795',       tipo: 'Devolução',qtd: 1,  erros: 1, data: '13/05 17:10'  },
        { id: 4, nome: 'Importação em lote — Indústria Beta',  tipo: 'Entrada',  qtd: 12, erros: 2, data: '12/05 14:22'  },
        { id: 5, nome: 'MDF-e carga interestadual',            tipo: 'MDF-e',    qtd: 3,  erros: 0, data: '11/05 10:05'  },
      ],

      eventosRecentes: [
        { id: 1, evento: 'Ciência da Operação',       emitente: 'Fornecedor Alpha',   chave: '3524...8002', hora: '14:32', status: 'Enviado', icon: 'visibility',   color: BLUE   },
        { id: 2, evento: 'Confirmação da Operação',   emitente: 'Nacional Theta S.A.',chave: '3524...8008', hora: '13:15', status: 'Enviado', icon: 'check_circle', color: GREEN  },
        { id: 3, evento: 'Operação Não Realizada',    emitente: 'Fábrica Zeta',       chave: '3524...8006', hora: '11:48', status: 'Enviado', icon: 'block',        color: RED    },
        { id: 4, evento: 'Ciência da Operação',       emitente: 'Importados Eta',     chave: '3524...8007', hora: '10:30', status: 'Enviado', icon: 'visibility',   color: BLUE   },
        { id: 5, evento: 'Desconhecimento',           emitente: 'Comercial Gama',     chave: '3524...8003', hora: '09:12', status: 'Pendente',icon: 'help',         color: YELLOW },
      ],

      periods: [
        { key: 'hoje',   label: 'Hoje' },
        { key: '7d',     label: '7 dias' },
        { key: '15d',    label: '15 dias' },
        { key: '30d',    label: '30 dias' },
        { key: '90d',    label: '90 dias' },
        { key: 'custom', label: 'Personalizado' },
      ],

      tiposDoc: [
        { key: 'NF-e',  label: 'NF-e'  },
        { key: 'NFC-e', label: 'NFC-e' },
        { key: 'CT-e',  label: 'CT-e'  },
        { key: 'MDF-e', label: 'MDF-e' },
      ],

      zipOrgs: [
        { key: 'mes',  label: 'Ano/Mês/Tipo', icon: 'calendar_month' },
        { key: 'cnpj', label: 'Ano/Mês/CNPJ', icon: 'business'       },
        { key: 'tipo', label: 'Tipo/Período',  icon: 'category'       },
      ],

      zipIncludes: [
        { key: 'nfe',       label: 'NF-e',       icon: 'description'     },
        { key: 'nfce',      label: 'NFC-e',       icon: 'receipt'         },
        { key: 'cte',       label: 'CT-e',        icon: 'local_shipping'  },
        { key: 'canceladas',label: 'Canceladas',  icon: 'cancel'          },
      ],

      importTipos: [
        { key: 'fornecedor', name: 'XML Fornecedor',   sub: 'Entradas de mercadoria',  icon: 'local_shipping', color: BLUE   },
        { key: 'entrada',    name: 'XML Entrada',      sub: 'NF-e de entrada geral',   icon: 'input',          color: GREEN  },
        { key: 'devolucao',  name: 'Devolução',        sub: 'Notas de devolução',       icon: 'undo',           color: ACCENT },
        { key: 'cte',        name: 'CT-e',             sub: 'Conhecimento de transporte',icon:'local_shipping', color: YELLOW },
        { key: 'mdfe',       name: 'MDF-e',            sub: 'Manifesto de carga',       icon: 'inventory_2',    color: PURPLE },
      ],

      importOptions: [
        { key: 'produto',    name: 'Cadastrar produto',    sub: 'Cria produto se não existir', icon: 'add_box',         color: GREEN  },
        { key: 'estoque',    name: 'Atualizar estoque',    sub: 'Entrada automática no saldo',  icon: 'inventory',      color: BLUE   },
        { key: 'custo',      name: 'Atualizar custo',      sub: 'Recalcula custo médio',        icon: 'price_change',   color: ACCENT },
        { key: 'ncm',        name: 'Validar NCM',          sub: 'Confere tabela TIPI/NCM',      icon: 'fact_check',     color: YELLOW },
        { key: 'cfop',       name: 'Validar CFOP',         sub: 'Verifica operação fiscal',     icon: 'rule',           color: PURPLE },
        { key: 'fornecedor', name: 'Validar fornecedor',   sub: 'CNPJ e dados cadastrais',      icon: 'business',       color: RED    },
      ],
    };
  },

  computed: {
    mainTabs() {
      return [
        { key: 'exportacao',  label: 'Exportação XML',              icon: 'download',             badge: null,                  badgeColor: '' },
        { key: 'importacao',  label: 'Importação XML',              icon: 'upload',               badge: this.importQueue.filter(q=>q.status==='Aguardando').length || null, badgeColor: 'badge-yellow' },
        { key: 'manifestacao',label: 'Manifestação do Destinatário',icon: 'assignment_turned_in', badge: this.manifestacoes.filter(m=>m.situacao==='Desconhecida').length, badgeColor: 'badge-orange' },
      ];
    },
    currentKpis() {
      return { nfe: 84, nfce: 312, cte: 28, canceladas: 7 };
    },
    exportKpis() {
      return [
        { label: 'NF-e no Período',   value: '2.640',  trend: '+12%', trendUp: true,  icon: 'description',    accent: 'k-orange' },
        { label: 'NFC-e no Período',  value: '9.420',  trend: '+8%',  trendUp: true,  icon: 'receipt',        accent: 'k-green'  },
        { label: 'Autorizadas',       value: '11.953', trend: '+10%', trendUp: true,  icon: 'check_circle',   accent: 'k-blue'   },
        { label: 'Canceladas/Inu.',   value: '107',    trend: '-3%',  trendUp: false, icon: 'cancel',         accent: 'k-red'    },
      ];
    },
    manifestKpis() {
      const m = this.manifestacoes;
      return [
        { label: 'Desconhecidas',  value: m.filter(x=>x.situacao==='Desconhecida').length,  sub: 'aguardando evento',  icon: 'help',              accent: 'k-yellow' },
        { label: 'Ciência Emitida',value: m.filter(x=>x.situacao==='Ciência').length,       sub: 'evento registrado',  icon: 'visibility',        accent: 'k-blue'   },
        { label: 'Confirmadas',    value: m.filter(x=>x.situacao==='Confirmada').length,    sub: 'operação validada',  icon: 'check_circle',      accent: 'k-green'  },
        { label: 'Não Realizadas', value: m.filter(x=>x.situacao==='Não Realizada').length, sub: 'recusa emitida',     icon: 'block',             accent: 'k-red'    },
      ];
    },
    periodLabel() {
      const map = { hoje:'Hoje', '7d':'Últimos 7 dias', '15d':'Últimos 15 dias', '30d':'Últimos 30 dias', '90d':'Últimos 90 dias', custom:`Últimos ${this.customDays} dias` };
      return map[this.activePeriod];
    },
    totalDocs() {
      return this.filteredXmls.length;
    },
    filteredXmls() {
      return this.xmlData.filter(d => {
        const q = this.searchQuery.toLowerCase();
        const matchSearch = !q || d.destinatario.toLowerCase().includes(q) || d.numero.includes(q) || d.cnpj.includes(q);
        const matchSituacao = !this.filterSituacao || d.situacao === this.filterSituacao;
        const matchType = this.activeTypes.includes(d.tipo);
        return matchSearch && matchSituacao && matchType;
      });
    },
    paginatedXmls() {
      const start = (this.currentPage - 1) * this.pageSize;
      return this.filteredXmls.slice(start, start + this.pageSize);
    },
    totalPages() {
      return Math.max(1, Math.ceil(this.filteredXmls.length / this.pageSize));
    },
    filteredManifestacoes() {
      return this.manifestacoes.filter(m => {
        const q = this.manifestSearch.toLowerCase();
        const matchSearch = !q || m.emitente.toLowerCase().includes(q);
        const matchFilter = !this.manifestFilter || m.situacao === this.manifestFilter;
        return matchSearch && matchFilter;
      });
    },
    manifestLegend() {
      const m = this.manifestacoes;
      const total = m.length;
      return [
        { label: 'Desconhecida',  count: m.filter(x=>x.situacao==='Desconhecida').length,  color: YELLOW, pct: Math.round(m.filter(x=>x.situacao==='Desconhecida').length/total*100)  },
        { label: 'Ciência',       count: m.filter(x=>x.situacao==='Ciência').length,       color: BLUE,   pct: Math.round(m.filter(x=>x.situacao==='Ciência').length/total*100)       },
        { label: 'Confirmada',    count: m.filter(x=>x.situacao==='Confirmada').length,    color: GREEN,  pct: Math.round(m.filter(x=>x.situacao==='Confirmada').length/total*100)    },
        { label: 'Não Realizada', count: m.filter(x=>x.situacao==='Não Realizada').length, color: RED,    pct: Math.round(m.filter(x=>x.situacao==='Não Realizada').length/total*100) },
      ];
    },
    manifestDonutData() {
      return {
        labels: ['Desconhecida','Ciência','Confirmada','Não Realizada'],
        datasets: [{
          data: this.manifestLegend.map(l => l.count),
          backgroundColor: this.manifestLegend.map(l => l.color),
          borderWidth: 0, hoverOffset: 4,
        }],
      };
    },
    donutOptions() {
      return {
        responsive: true, maintainAspectRatio: false,
        cutout: '68%',
        plugins: { legend: { display: false }, tooltip: { ...baseTooltip } },
      };
    },
  },

  methods: {
    toggleType(key) {
      if (this.activeTypes.includes(key)) {
        if (this.activeTypes.length > 1) this.activeTypes = this.activeTypes.filter(t => t !== key);
      } else {
        this.activeTypes.push(key);
      }
      this.currentPage = 1;
    },
    toggleSelect(id) {
      if (this.selectedXmls.includes(id)) this.selectedXmls = this.selectedXmls.filter(x => x !== id);
      else this.selectedXmls.push(id);
    },
    toggleSelectAll(e) {
      this.selectedXmls = e.target.checked ? this.filteredXmls.map(d => d.id) : [];
    },
    selectAll() {
      this.selectedXmls = this.filteredXmls.map(d => d.id);
    },
    toggleManifest(id) {
      if (this.selectedManifest.includes(id)) this.selectedManifest = this.selectedManifest.filter(x => x !== id);
      else this.selectedManifest.push(id);
    },
    toggleManifestAll(e) {
      this.selectedManifest = e.target.checked ? this.manifestacoes.map(m => m.id) : [];
    },
    exportarLote() {
      this.showToast('check_circle', `Gerando ZIP com ${this.selectedXmls.length} documentos...`);
    },
    exportarIndividual() {
      this.showToast('download', 'Download iniciado!');
    },
    gerarZip() {
      this.showToast('folder_zip', 'Pacote ZIP sendo gerado...');
    },
    downloadXml(doc) {
      this.showToast('download', `Baixando XML da ${doc.tipo} ${doc.numero}`);
    },
    viewDoc(doc) {
      this.showToast('visibility', `Visualizando ${doc.tipo} ${doc.numero}`);
    },
    copyChave(doc) {
      this.showToast('content_copy', 'Chave de acesso copiada!');
    },
    copyChaveText() {
      this.showToast('content_copy', 'Chave copiada para a área de transferência!');
    },
    triggerImport() {
      this.$refs.fileInput.click();
    },
    handleFileImport(e) {
      const files = Array.from(e.target.files);
      files.forEach((f, i) => {
        this.importQueue.push({
          id: Date.now() + i,
          nome: f.name,
          tipo: 'NF-e Entrada',
          tamanho: (f.size / 1024).toFixed(0) + ' KB',
          status: 'Aguardando',
          icon: 'description',
          color: 'orange',
        });
      });
      this.activeTab = 'importacao';
      this.showToast('upload', `${files.length} arquivo(s) adicionado(s) à fila`);
    },
    handleDrop(e) {
      this.isDragging = false;
      const files = Array.from(e.dataTransfer.files).filter(f => f.name.endsWith('.xml'));
      files.forEach((f, i) => {
        this.importQueue.push({
          id: Date.now() + i,
          nome: f.name,
          tipo: 'NF-e Entrada',
          tamanho: (f.size / 1024).toFixed(0) + ' KB',
          status: 'Aguardando',
          icon: 'description',
          color: 'orange',
        });
      });
      if (files.length) this.showToast('upload', `${files.length} XML(s) adicionado(s)`);
    },
    processQueue() {
      this.importQueue.forEach(item => {
        if (item.status === 'Aguardando') {
          item.status = 'processando';
          setTimeout(() => { item.status = 'Concluído'; }, 1500 + Math.random() * 1000);
        }
      });
      this.showToast('play_arrow', 'Processando fila de importação...');
    },
    manifestar(m, evento) {
      m.situacao = evento;
      this.eventosRecentes.unshift({
        id: Date.now(),
        evento: evento === 'Ciência' ? 'Ciência da Operação' : evento === 'Confirmada' ? 'Confirmação da Operação' : evento === 'Desconhecida' ? 'Desconhecimento' : 'Operação Não Realizada',
        emitente: m.emitente,
        chave: m.chave,
        hora: new Date().toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' }),
        status: 'Enviado',
        icon: evento === 'Ciência' ? 'visibility' : evento === 'Confirmada' ? 'check_circle' : evento === 'Desconhecida' ? 'help' : 'block',
        color: evento === 'Ciência' ? BLUE : evento === 'Confirmada' ? GREEN : evento === 'Desconhecida' ? YELLOW : RED,
      });
      this.showToast('assignment_turned_in', `${evento} enviada para ${m.emitente}`);
    },
    manifestarTodos() {
      this.selectedManifest.forEach(id => {
        const m = this.manifestacoes.find(x => x.id === id);
        if (m && m.situacao === 'Desconhecida') this.manifestar(m, 'Ciência');
      });
      this.selectedManifest = [];
    },
    showToast(icon, msg) {
      this.toastIcon = icon;
      this.toastMsg = msg;
      this.toastVisible = true;
      setTimeout(() => { this.toastVisible = false; }, 3000);
    },
  },
};
</script>

<style scoped>
/* ══════════════════════════════════════════════
   DESIGN TOKENS — Mesmo padrão do DashFiscal
══════════════════════════════════════════════ */
.dashboard-root {
  --accent:   #FF8049;
  --accent2:  #FF804915;
  --acc-h:    #E65D26;
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
  --bg-el:    #f1f3f5;
  --bg-el2:   #e9ecef;
  --border:   #e2e8f0;
  --border2:  #cbd5e1;
  --text1:    #1e293b;
  --text2:    #64748b;
  --muted:    #94a3b8;
  --radius:   13px;
  --radius-s: 8px;
  --shadow:   0 4px 12px -2px rgba(0,0,0,0.06), 0 2px 6px -1px rgba(0,0,0,0.03);
  display: flex;
  background: var(--bg);
  color: var(--text1);
  font-family: 'DM Sans', 'Segoe UI', system-ui, sans-serif;
  font-size: 13.5px;
  min-height: 100vh;
}

/* ══ TOPBAR ══ */
.main-area { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.topbar {
  position: sticky; top: 0; z-index: 50;
  background: var(--bg-card); border-bottom: 1px solid var(--border);
  padding: 12px 24px; display: flex; align-items: center; gap: 14px;
  box-shadow: 0 1px 8px rgba(0,0,0,0.04);
}
.topbar-brand { display: flex; align-items: center; gap: 10px; }
.brand-icon {
  width: 34px; height: 34px;
  background: linear-gradient(135deg, var(--accent), #e65d26);
  border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.topbar-title { font-weight: 800; font-size: 16px; letter-spacing: -0.3px; }
.topbar-sub   { font-size: 10.5px; color: var(--muted); margin-top: 1px; }
.topbar-right { margin-left: auto; display: flex; align-items: center; gap: 9px; }
.sefaz-status {
  display: flex; align-items: center; gap: 6px;
  font-size: 11.5px; font-weight: 700; padding: 5px 12px; border-radius: 20px;
}
.sefaz-status.online { background: var(--green2); color: var(--green); }
.sefaz-dot { width: 7px; height: 7px; border-radius: 50%; background: currentColor; animation: pulse 1.5s infinite; }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
.tbtn {
  display: flex; align-items: center; gap: 5px;
  padding: 6px 13px; border-radius: var(--radius-s);
  border: 1px solid var(--border2); background: var(--bg-card);
  color: var(--text2); font-size: 12px; font-weight: 500;
  cursor: pointer; transition: all 0.15s; font-family: inherit;
}
.tbtn:hover:not(:disabled) { background: var(--bg-el); color: var(--text1); }
.tbtn.primary { background: var(--accent); color: #fff; border-color: var(--accent); }
.tbtn.primary:hover:not(:disabled) { background: var(--acc-h); }
.tbtn.danger  { border-color: var(--red); color: var(--red); }
.tbtn:disabled { opacity: 0.45; cursor: not-allowed; }
.user-avatar {
  width: 31px; height: 31px; border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), #ff4d4d);
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 11px; color: #fff; flex-shrink: 0;
}

/* ══ CONTENT ══ */
.content { padding: 22px 24px; flex: 1; }

/* ══ FILTER BAR ══ */
.filter-bar {
  display: flex; align-items: center; justify-content: space-between;
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 12px 18px;
  margin-bottom: 14px; gap: 12px; box-shadow: var(--shadow); flex-wrap: wrap;
}
.filter-left  { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.filter-right { display: flex; align-items: center; }
.filter-label { font-size: 12px; color: var(--text2); font-weight: 500; white-space: nowrap; }
.filter-sub   { font-size: 11.5px; color: var(--muted); }
.filter-sub strong { color: var(--accent); }
.filter-sep { width: 1px; height: 20px; background: var(--border2); margin: 0 4px; }
.period-tabs {
  display: flex; background: var(--bg-el);
  border: 1px solid var(--border); border-radius: var(--radius-s); padding: 3px; gap: 2px;
}
.ptab {
  padding: 4px 10px; border-radius: 5px; font-size: 11.5px; font-weight: 500;
  cursor: pointer; color: var(--muted); transition: all 0.15s;
  background: transparent; border: none; font-family: inherit; white-space: nowrap;
}
.ptab.active { background: var(--accent); color: #fff; font-weight: 700; }
.ptab:hover:not(.active) { background: var(--bg-el2); color: var(--text1); }
.custom-days {
  display: flex; align-items: center; gap: 7px;
  background: var(--bg-el); border: 1px solid var(--border2);
  border-radius: var(--radius-s); padding: 5px 10px;
}
.days-input {
  width: 50px; border: none; background: transparent;
  font-family: inherit; font-size: 13px; font-weight: 700;
  color: var(--accent); text-align: center; outline: none;
}
.type-chips { display: flex; gap: 5px; }

/* ══ MAIN TABS ══ */
.main-tabs {
  display: flex; gap: 4px; margin-bottom: 16px;
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 5px; box-shadow: var(--shadow);
}
.main-tab {
  display: flex; align-items: center; gap: 7px;
  padding: 8px 16px; border-radius: var(--radius-s);
  font-size: 12.5px; font-weight: 500; cursor: pointer;
  color: var(--muted); transition: all 0.15s;
  background: transparent; border: none; font-family: inherit; white-space: nowrap;
}
.main-tab:hover:not(.active) { background: var(--bg-el); color: var(--text1); }
.main-tab.active { background: var(--accent); color: #fff; font-weight: 700; }
.tab-badge {
  font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 10px; color: #fff;
}
.badge-yellow { background: var(--yellow); }
.badge-orange { background: var(--accent); }
.badge-red    { background: var(--red);    }

/* ══ KPI GRID ══ */
.kpi-grid {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 13px; margin-bottom: 14px;
}
.kpi-card {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 16px 18px;
  position: relative; overflow: hidden; transition: all 0.2s;
  box-shadow: var(--shadow);
}
.kpi-card:hover { border-color: var(--border2); transform: translateY(-1px); }
.kpi-card::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; }
.kpi-card.k-orange::before { background: linear-gradient(90deg, var(--accent), transparent); }
.kpi-card.k-green::before  { background: linear-gradient(90deg, var(--green),  transparent); }
.kpi-card.k-blue::before   { background: linear-gradient(90deg, var(--blue),   transparent); }
.kpi-card.k-red::before    { background: linear-gradient(90deg, var(--red),    transparent); }
.kpi-card.k-yellow::before { background: linear-gradient(90deg, var(--yellow), transparent); }
.kpi-label { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.8px; color:var(--muted); display:flex; align-items:center; gap:4px; margin-bottom:8px; }
.kpi-value { font-size:22px; font-weight:800; letter-spacing:-.8px; color:var(--text1); line-height:1; margin-bottom:8px; }
.kpi-footer { display:flex; align-items:center; gap:6px; font-size:11px; }
.kpi-delta { font-weight:700; display:flex; align-items:center; gap:2px; }
.kpi-delta.up   { color: var(--green); }
.kpi-delta.down { color: var(--red);   }
.kpi-sub { color: var(--muted); }
.kpi-bg-icon { position:absolute; bottom:4px; right:10px; font-size:48px; opacity:.05; color:var(--text1); pointer-events:none; line-height:1; }

/* ══ GRID ══ */
.grid-2-1 { display: grid; grid-template-columns: 2fr 1fr; gap: 14px; margin-bottom: 14px; }
.grid-2   { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }

/* ══ CARD ══ */
.card {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow);
}
.card-head {
  display: flex; align-items: center; gap: 10px;
  padding: 13px 18px; border-bottom: 1px solid var(--border);
  flex-wrap: wrap; gap: 8px;
}
.card-title { font-size: 13px; font-weight: 700; letter-spacing: -.2px; }
.card-sub   { font-size: 10.5px; color: var(--muted); margin-top: 1px; }
.card-actions { margin-left: auto; display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
.card-icon { width:30px; height:30px; border-radius:8px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.card-icon .material-symbols-outlined { font-size:17px !important; }
.c-orange { background: var(--accent2); color: var(--accent); }
.c-green  { background: var(--green2);  color: var(--green);  }
.c-blue   { background: var(--blue2);   color: var(--blue);   }
.c-yellow { background: var(--yellow2); color: var(--yellow); }
.c-red    { background: var(--red2);    color: var(--red);    }

/* ══ SEARCH / SELECT ══ */
.search-box {
  display: flex; align-items: center; gap: 6px;
  background: var(--bg-el); border: 1px solid var(--border2);
  border-radius: var(--radius-s); padding: 5px 10px;
}
.search-input {
  border: none; background: transparent; outline: none;
  font-family: inherit; font-size: 12px; color: var(--text1); width: 140px;
}
.select-wrap { position: relative; }
.sel-input {
  border: 1px solid var(--border2); border-radius: var(--radius-s);
  background: var(--bg-card); padding: 5px 10px;
  font-family: inherit; font-size: 12px; color: var(--text2); outline: none; cursor: pointer;
}

/* ══ CHIPS ══ */
.chip {
  padding: 4px 10px; border-radius: 5px; font-size: 11px; font-weight: 500;
  cursor: pointer; color: var(--muted); transition: all 0.15s;
  background: var(--bg-el); border: 1px solid var(--border);
}
.chip.active { background: var(--accent2); color: var(--accent); border-color: var(--accent); }

/* ══ SELECTION BAR ══ */
.selection-bar {
  display: flex; align-items: center; gap: 10px;
  background: var(--accent2); border-bottom: 1px solid var(--accent);
  padding: 9px 18px; font-size: 12.5px;
}

/* ══ TABLE ══ */
.table-wrap { overflow-x: auto; }
.xml-table {
  width: 100%; border-collapse: collapse;
  font-size: 12.5px;
}
.xml-table thead tr { background: var(--bg-el); border-bottom: 2px solid var(--border); }
.xml-table th {
  padding: 9px 14px; text-align: left;
  font-size: 10px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.5px; color: var(--text2); white-space: nowrap;
}
.xml-table tbody tr { border-bottom: 1px solid var(--border); transition: background .15s; }
.xml-table tbody tr:hover { background: var(--bg-el); }
.xml-table tbody tr.row-selected { background: var(--accent2); }
.xml-table td { padding: 9px 14px; color: var(--text1); }
.chk { width: 14px; height: 14px; accent-color: var(--accent); cursor: pointer; }

/* ══ ROW ACTIONS ══ */
.row-actions { display: flex; gap: 4px; }
.icon-btn {
  width: 26px; height: 26px; border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  border: 1px solid var(--border); background: var(--bg-card);
  color: var(--text2); cursor: pointer; transition: all .15s;
}
.icon-btn:hover { background: var(--bg-el2); color: var(--accent); border-color: var(--accent); }
.icon-btn-xs {
  width: 18px; height: 18px; border-radius: 4px;
  display: flex; align-items: center; justify-content: center;
  border: 1px solid var(--border); background: var(--bg-el);
  color: var(--muted); cursor: pointer; transition: all .15s;
}
.icon-btn-xs:hover { color: var(--accent); border-color: var(--accent); }

/* ══ PAGINATION ══ */
.pagination {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 18px; border-top: 1px solid var(--border);
}
.pag-info { font-size: 11.5px; color: var(--muted); }
.pag-btns { display: flex; align-items: center; gap: 8px; }
.pag-btn {
  width: 28px; height: 28px; border-radius: 6px;
  border: 1px solid var(--border2); background: var(--bg-card);
  display: flex; align-items: center; justify-content: center;
  color: var(--text2); cursor: pointer; transition: all .15s;
}
.pag-btn:hover:not(:disabled) { background: var(--accent2); color: var(--accent); border-color: var(--accent); }
.pag-btn:disabled { opacity: .4; cursor: not-allowed; }
.pag-num { font-size: 12px; font-weight: 600; color: var(--text2); }

/* ══ TAG ══ */
.tag-custom { font-size: 10.5px; font-weight: 700; padding: 2px 8px; border-radius: 12px; white-space: nowrap; }
.tag-green  { background: var(--green2);  color: var(--green);  }
.tag-orange { background: var(--accent2); color: var(--accent); }
.tag-yellow { background: var(--yellow2); color: var(--yellow); }
.tag-red    { background: var(--red2);    color: var(--red);    }
.tag-blue   { background: var(--blue2);   color: var(--blue);   }
.tag-tipo-nfe   { background: #fff7ed; color: var(--accent); }
.tag-tipo-nfce  { background: var(--green2); color: var(--green); }
.tag-tipo-cte   { background: var(--blue2);  color: var(--blue);  }
.tag-tipo-mdfe  { background: var(--purple2);color: var(--purple);}

/* ══ CELL ══ */
.cell-name { font-size: 12.5px; font-weight: 600; color: var(--text1); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px; }
.cell-sub  { font-size: 10.5px; color: var(--muted); margin-top: 1px; }
.mono-bold { font-family: 'Courier New', monospace; font-weight: 700; }

/* ══ EXPORT PANEL ══ */
.export-panel { padding: 14px 18px; display: flex; flex-direction: column; gap: 16px; }
.export-field { display: flex; flex-direction: column; gap: 7px; }
.field-label  { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .6px; color: var(--muted); }
.radio-group  { display: flex; flex-direction: column; gap: 6px; }
.radio-item {
  display: flex; align-items: center; gap: 8px;
  padding: 7px 10px; border-radius: var(--radius-s);
  border: 1px solid var(--border); cursor: pointer; font-size: 12px;
  transition: all .15s;
}
.radio-item input { display: none; }
.radio-item.active { border-color: var(--accent); background: var(--accent2); color: var(--accent); font-weight: 600; }
.radio-item:hover:not(.active) { background: var(--bg-el); }
.check-group { display: flex; flex-direction: column; gap: 5px; }
.check-item {
  display: flex; align-items: center; gap: 8px;
  padding: 6px 10px; border-radius: var(--radius-s);
  border: 1px solid var(--border); cursor: pointer; font-size: 12px; transition: all .15s;
}
.check-item input { display: none; }
.check-item.active { border-color: var(--accent); background: var(--accent2); color: var(--accent); font-weight: 600; }

/* ══ TREE VIEW ══ */
.export-preview { background: var(--bg-el); border-radius: var(--radius-s); padding: 12px 14px; }
.preview-label  { display: flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 700; color: var(--muted); margin-bottom: 8px; text-transform: uppercase; letter-spacing: .6px; }
.tree-view { font-family: 'Courier New', monospace; font-size: 11.5px; line-height: 1.8; }
.tree-node { color: var(--text2); }
.tree-node.root { color: var(--text1); font-weight: 700; }
.tree-node.l1   { padding-left: 8px; }
.tree-node.l2   { padding-left: 20px; color: var(--text2); }
.tree-count     { color: var(--muted); font-size: 10px; margin-left: 6px; }

.btn-full {
  width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 10px; border-radius: var(--radius-s); font-family: inherit;
  font-size: 13px; font-weight: 700; cursor: pointer; border: none; transition: all .15s;
}
.primary-btn { background: var(--accent); color: #fff; }
.primary-btn:hover { background: var(--acc-h); }

/* ══ HISTORY ══ */
.hist-list { padding: 6px 0; }
.hist-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 18px; border-bottom: 1px solid var(--border); transition: background .15s;
}
.hist-item:hover { background: var(--bg-el); }
.hist-item:last-child { border-bottom: none; }
.hist-icon { width:28px; height:28px; border-radius:7px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.hist-info { flex: 1; min-width: 0; }
.hist-name { font-size:12.5px; font-weight:600; color:var(--text1); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.hist-sub  { font-size:10.5px; color:var(--muted); margin-top:1px; }

/* ══ DROPZONE ══ */
.dropzone {
  margin: 14px 18px;
  border: 2px dashed var(--border2); border-radius: var(--radius);
  padding: 32px; text-align: center; transition: all .2s; cursor: pointer;
}
.dropzone:hover, .dropzone-active {
  border-color: var(--accent); background: var(--accent2);
}
.dz-icon { margin-bottom: 10px; }
.dz-title { font-size: 14px; font-weight: 700; color: var(--text1); margin-bottom: 5px; }
.dz-sub   { font-size: 12px; color: var(--muted); }

/* ══ IMPORT TYPES ══ */
.import-types { padding: 14px 18px; display: flex; flex-direction: column; gap: 6px; border-top: 1px solid var(--border); }
.import-type {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 12px; border-radius: var(--radius-s);
  border: 1px solid var(--border); cursor: pointer; transition: all .15s;
}
.import-type:hover { background: var(--bg-el); }
.import-type.active { border-color: var(--accent); background: var(--accent2); }
.it-icon { width:34px; height:34px; border-radius:8px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.it-name { font-size:12.5px; font-weight:600; color:var(--text1); }
.it-sub  { font-size:10.5px; color:var(--muted); margin-top:1px; }

/* ══ OPTIONS GRID ══ */
.options-grid { padding: 12px 18px; display: flex; flex-direction: column; gap: 6px; }
.opt-item {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 12px; border-radius: var(--radius-s);
  border: 1px solid var(--border); cursor: pointer; transition: all .15s; user-select: none;
}
.opt-item input { display: none; }
.opt-item:hover { background: var(--bg-el); }
.opt-item.active { border-color: var(--accent); background: var(--accent2); }
.opt-icon { width:30px; height:30px; border-radius:7px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.opt-info { flex: 1; }
.opt-name { font-size:12px; font-weight:600; color:var(--text1); }
.opt-sub  { font-size:10.5px; color:var(--muted); margin-top:1px; }
.opt-toggle {
  width: 34px; height: 18px; border-radius: 9px; background: var(--border2);
  transition: background .2s; flex-shrink: 0; position: relative;
}
.opt-toggle::after {
  content: ''; position: absolute; top: 2px; left: 2px;
  width: 14px; height: 14px; border-radius: 50%; background: #fff;
  transition: transform .2s; box-shadow: 0 1px 3px rgba(0,0,0,.2);
}
.opt-toggle.tog-on { background: var(--accent); }
.opt-toggle.tog-on::after { transform: translateX(16px); }

/* ══ QUEUE ══ */
.queue-list { padding: 6px 0; min-height: 80px; }
.empty-state { padding: 28px; text-align: center; }
.es-title { font-size: 13px; font-weight: 600; color: var(--text2); margin-top: 8px; }
.es-sub   { font-size: 11px; color: var(--muted); margin-top: 3px; }
.queue-item {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 18px; border-bottom: 1px solid var(--border);
}
.queue-item:last-child { border-bottom: none; }
.qi-icon  { width:28px; height:28px; border-radius:7px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.qi-info  { flex: 1; min-width: 0; }
.qi-name  { font-size:12px; font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.qi-sub   { font-size:10.5px; color:var(--muted); margin-top:1px; }
.qi-status { flex-shrink: 0; }
.spinner {
  width: 18px; height: 18px; border: 2px solid var(--border2);
  border-top-color: var(--accent); border-radius: 50%;
  animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ══ VALIDAÇÕES ══ */
.validation-list { padding: 6px 0; }
.val-item {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 18px; border-bottom: 1px solid var(--border);
}
.val-item:last-child { border-bottom: none; }
.val-icon { font-size: 18px !important; flex-shrink: 0; }
.val-info { flex: 1; }
.val-name { font-size: 12.5px; font-weight: 600; }
.val-sub  { font-size: 10.5px; color: var(--muted); margin-top: 1px; }

/* ══ MANIFESTAÇÃO ══ */
.manifest-btns { display: flex; gap: 4px; flex-wrap: wrap; }
.mf-btn {
  display: flex; align-items: center; gap: 3px;
  padding: 4px 8px; border-radius: 5px; font-size: 10.5px; font-weight: 600;
  border: 1px solid var(--border); background: var(--bg-el);
  cursor: pointer; transition: all .15s; font-family: inherit;
  color: var(--text2); white-space: nowrap;
}
.mf-btn:hover { border-color: var(--border2); }
.mf-btn.ciencia:hover, .mf-btn.ciencia.active    { border-color: var(--blue); background: var(--blue2); color: var(--blue); }
.mf-btn.confirmar:hover, .mf-btn.confirmar.active { border-color: var(--green); background: var(--green2); color: var(--green); }
.mf-btn.desconhece:hover  { border-color: var(--yellow); background: var(--yellow2); color: var(--yellow); }
.mf-btn.naorealizada:hover{ border-color: var(--red); background: var(--red2); color: var(--red); }

.chave-box { display: flex; align-items: center; gap: 4px; }
.chave-text { font-family: 'Courier New', monospace; font-size: 11px; color: var(--text2); }

/* ══ DONUT ══ */
.donut-wrap { height: 150px; padding: 14px 18px 8px; }
.manifest-legend { padding: 4px 18px 14px; display: flex; flex-direction: column; gap: 8px; }
.leg-item { display: flex; align-items: center; gap: 8px; font-size: 12px; }
.leg-dot  { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.leg-label { flex: 1; color: var(--text2); }
.leg-count { font-weight: 700; width: 22px; text-align: right; }
.leg-bar-wrap { flex: 1; height: 5px; background: var(--bg-el2); border-radius: 3px; overflow: hidden; }
.leg-bar  { height: 100%; border-radius: 3px; transition: width .4s; }
.leg-pct  { font-size: 10.5px; color: var(--muted); width: 30px; text-align: right; }

/* ══ EVENTOS ══ */
.eventos-list { padding: 6px 0; }
.ev-item {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 18px; border-bottom: 1px solid var(--border); transition: background .15s;
}
.ev-item:hover { background: var(--bg-el); }
.ev-item:last-child { border-bottom: none; }
.ev-icon  { width:30px; height:30px; border-radius:8px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.ev-info  { flex: 1; min-width: 0; }
.ev-title { font-size:12.5px; font-weight:600; color:var(--text1); }
.ev-sub   { font-size:10.5px; color:var(--muted); margin-top:1px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.ev-right { display:flex; flex-direction:column; align-items:flex-end; gap:4px; flex-shrink:0; }
.ev-time  { font-size:10px; color:var(--muted); }

/* ══ ALERTA PRAZO ══ */
.alerta-prazo-card {
  display: flex; align-items: flex-start; gap: 12px;
  background: linear-gradient(135deg, #fff7ed, #ffedd5);
  border: 1px solid #fed7aa; border-radius: var(--radius); padding: 14px 16px;
}
.ap-icon { color: var(--accent); flex-shrink: 0; margin-top: 2px; }
.ap-title { font-size: 13px; font-weight: 700; color: var(--acc-h); margin-bottom: 4px; }
.ap-sub   { font-size: 12px; color: var(--text2); line-height: 1.5; }
.ap-sub strong { color: var(--acc-h); }

/* ══ PROGRESS BAR ══ */
.pb-custom :deep(.p-progressbar) { height: 5px; border-radius: 4px; }
.pb-custom :deep(.p-progressbar-value) { border-radius: 4px; }

/* ══ TOAST ══ */
.toast {
  position: fixed; bottom: 24px; right: 24px; z-index: 9999;
  display: flex; align-items: center; gap: 8px;
  background: var(--text1); color: #fff;
  padding: 11px 18px; border-radius: var(--radius);
  font-size: 13px; font-weight: 500;
  box-shadow: 0 8px 24px rgba(0,0,0,.15);
  transform: translateY(20px); opacity: 0;
  transition: all .3s cubic-bezier(.34,1.56,.64,1);
  pointer-events: none;
}
.toast.toast-show { transform: translateY(0); opacity: 1; }

/* ══ FOOTER ══ */
.dash-footer {
  padding: 14px 24px; border-top: 1px solid var(--border);
  display: flex; justify-content: space-between;
  font-size: 11px; color: var(--muted); background: var(--bg-card);
}

/* ══ RESPONSIVE ══ */
@media (max-width: 1280px) {
  .kpi-grid  { grid-template-columns: repeat(2, 1fr); }
  .grid-2-1  { grid-template-columns: 1fr; }
}
@media (max-width: 900px) {
  .grid-2    { grid-template-columns: 1fr; }
  .main-tabs { flex-wrap: wrap; }
  .topbar    { flex-wrap: wrap; }
  .topbar-right { flex-wrap: wrap; }
}
@media (max-width: 640px) {
  .kpi-grid  { grid-template-columns: 1fr; }
  .content   { padding: 14px; }
  .filter-bar{ flex-direction: column; align-items: flex-start; }
  .card-head { flex-wrap: wrap; }
  .card-actions { margin-left: 0; width: 100%; }
}
</style>