<template>
  <div class="dashboard-root">
    <div class="main-area">

      <!-- ═══════════════════ TOPBAR ═══════════════════ -->
      <div class="topbar">
        <div class="topbar-brand">
          <div class="brand-icon">
            <span class="material-symbols-outlined" style="font-size:17px;color:#fff">receipt_long</span>
          </div>
          <div>
            <div class="topbar-title">Emissão Fiscal</div>
            <div class="topbar-sub">NF-e Modelo 55 · NFC-e Modelo 65 · SEFAZ Online</div>
          </div>
        </div>
        <div class="topbar-right">
          <div class="sefaz-pill" :class="sefazOnline ? 'online' : 'offline'">
            <span class="sefaz-dot"></span>
            SEFAZ {{ sefazOnline ? 'Online' : 'Offline' }}
          </div>
          <div class="offline-queue-pill" v-if="offlineQueue > 0">
            <span class="material-symbols-outlined" style="font-size:13px">cloud_off</span>
            {{ offlineQueue }} na fila offline
          </div>
          <button class="tbtn primary" @click="openModal('nfe')">
            <span class="material-symbols-outlined" style="font-size:14px">add</span>
            Nova NF-e
          </button>
          <button class="tbtn accent2" @click="openModal('nfce')">
            <span class="material-symbols-outlined" style="font-size:14px">point_of_sale</span>
            Nova NFC-e
          </button>
          <div class="user-avatar">CF</div>
        </div>
      </div>

      <div class="content">

        <!-- ═══════════════════ SEARCH / FILTER BAR ═══════════════════ -->
        <div class="filter-bar">
          <div class="filter-left">
            <span class="material-symbols-outlined" style="font-size:18px;color:var(--accent)">search</span>
            <div class="search-box-main">
              <input v-model="globalSearch" placeholder="Buscar por destinatário, número, CNPJ, chave de acesso..." class="search-main-input" />
              <span v-if="globalSearch" class="material-symbols-outlined search-clear" @click="globalSearch=''">close</span>
            </div>
            <div class="filter-sep"></div>
            <span class="material-symbols-outlined" style="font-size:16px;color:var(--muted)">calendar_today</span>
            <div class="period-tabs">
              <button v-for="p in periods" :key="p.key" class="ptab"
                :class="{ active: activePeriod === p.key }" @click="activePeriod = p.key">{{ p.label }}</button>
            </div>
            <div class="custom-days" v-if="activePeriod === 'custom'">
              <input type="number" v-model.number="customDays" min="1" max="365" class="days-input" />
              <span class="filter-label">dias</span>
            </div>
          </div>
          <div class="filter-right">
            <div class="select-wrap">
              <select v-model="filterTipo" class="sel-input">
                <option value="">Todos os tipos</option>
                <option value="NF-e">NF-e</option>
                <option value="NFC-e">NFC-e</option>
              </select>
            </div>
            <div class="select-wrap">
              <select v-model="filterStatus" class="sel-input">
                <option value="">Todos os status</option>
                <option value="Autorizada">Autorizada</option>
                <option value="Cancelada">Cancelada</option>
                <option value="Rejeitada">Rejeitada</option>
                <option value="Contingência">Contingência</option>
                <option value="Inutilizada">Inutilizada</option>
                <option value="Pendente">Pendente</option>
              </select>
            </div>
            <span class="filter-sub">{{ filteredNotas.length }} documentos encontrados</span>
          </div>
        </div>

        <!-- ═══════════════════ MAIN TABS ═══════════════════ -->
        <div class="main-tabs">
          <button v-for="tab in mainTabs" :key="tab.key"
            class="main-tab" :class="{ active: activeTab === tab.key }"
            @click="activeTab = tab.key">
            <span class="material-symbols-outlined" style="font-size:15px">{{ tab.icon }}</span>
            {{ tab.label }}
            <span v-if="tab.badge" class="tab-badge" :class="tab.badgeColor">{{ tab.badge }}</span>
          </button>
        </div>

        <!-- ═══════════════════ KPIs ═══════════════════ -->
        <div class="kpi-grid">
          <div v-for="kpi in activeKpis" :key="kpi.label" class="kpi-card" :class="kpi.accent">
            <div class="kpi-label">
              <span class="material-symbols-outlined" style="font-size:15px;margin-right:3px">{{ kpi.icon }}</span>
              {{ kpi.label }}
            </div>
            <div class="kpi-value">
              <span v-if="kpi.prefix" class="kpi-prefix">{{ kpi.prefix }}</span>{{ kpi.value }}
            </div>
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

        <!-- ═══════════════════ ABA NF-e ═══════════════════ -->
        <div v-if="activeTab === 'nfe'">
          <div class="grid-2-1">

            <!-- TABELA PRINCIPAL NF-e -->
            <div class="card">
              <div class="card-head">
                <div class="card-icon c-orange">
                  <span class="material-symbols-outlined">description</span>
                </div>
                <div>
                  <div class="card-title">Notas Fiscais Eletrônicas — NF-e</div>
                  <div class="card-sub">{{ periodLabel }} · {{ filteredNfe.length }} registros</div>
                </div>
                <div class="card-actions">
                  <button class="tbtn" @click="selectAllNfe">
                    <span class="material-symbols-outlined" style="font-size:13px">checklist</span>Sel. todos
                  </button>
                  <button class="tbtn primary" @click="openModal('nfe')">
                    <span class="material-symbols-outlined" style="font-size:13px">add</span>Nova NF-e
                  </button>
                </div>
              </div>

              <!-- BARRA DE AÇÃO EM LOTE -->
              <div class="selection-bar" v-if="selectedNfe.length > 0">
                <span class="material-symbols-outlined" style="font-size:15px;color:var(--accent)">check_circle</span>
                <span><strong>{{ selectedNfe.length }}</strong> selecionadas</span>
                <div class="sel-actions">
                  <button class="tbtn" @click="acaoLote('transmitir')">
                    <span class="material-symbols-outlined" style="font-size:13px">send</span>Transmitir
                  </button>
                  <button class="tbtn" @click="acaoLote('danfe')">
                    <span class="material-symbols-outlined" style="font-size:13px">picture_as_pdf</span>DANFE
                  </button>
                  <button class="tbtn" @click="acaoLote('xml')">
                    <span class="material-symbols-outlined" style="font-size:13px">download</span>XML
                  </button>
                  <button class="tbtn danger" @click="selectedNfe=[]">
                    <span class="material-symbols-outlined" style="font-size:13px">close</span>Limpar
                  </button>
                </div>
              </div>

              <div class="table-wrap">
                <table class="fiscal-table">
                  <thead>
                    <tr>
                      <th style="width:36px"><input type="checkbox" class="chk" @change="toggleSelectAllNfe" /></th>
                      <th>NRO.</th>
                      <th>DESTINATÁRIO</th>
                      <th>NAT. OPERAÇÃO</th>
                      <th>VALOR</th>
                      <th>EMISSÃO</th>
                      <th>STATUS</th>
                      <th style="width:120px">AÇÕES</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="nota in paginatedNfe" :key="nota.id"
                      :class="{ 'row-selected': selectedNfe.includes(nota.id) }">
                      <td><input type="checkbox" class="chk" :checked="selectedNfe.includes(nota.id)" @change="toggleNfe(nota.id)" /></td>
                      <td><span class="mono-bold">{{ nota.numero }}</span><div class="cell-sub">Série {{ nota.serie }}</div></td>
                      <td>
                        <div class="cell-name">{{ nota.destinatario }}</div>
                        <div class="cell-sub">{{ nota.cnpj }}</div>
                      </td>
                      <td><span class="nat-op">{{ nota.natureza }}</span></td>
                      <td>
                        <div class="mono-bold">R$ {{ nota.valor }}</div>
                        <div class="cell-sub">ICMS: {{ nota.icms }}%</div>
                      </td>
                      <td>
                        <div style="font-size:11.5px">{{ nota.emissao }}</div>
                        <div class="cell-sub">{{ nota.hora }}</div>
                      </td>
                      <td>
                        <div class="status-cell">
                          <span class="status-dot" :class="'dot-'+statusClass(nota.status)"></span>
                          <Tag :value="nota.status" class="tag-custom" :class="tagClass(nota.status)" />
                        </div>
                      </td>
                      <td>
                        <div class="row-actions">
                          <button class="icon-btn" title="DANFE PDF" @click="acao(nota, 'danfe')">
                            <span class="material-symbols-outlined" style="font-size:14px">picture_as_pdf</span>
                          </button>
                          <button class="icon-btn" title="Download XML" @click="acao(nota, 'xml')">
                            <span class="material-symbols-outlined" style="font-size:14px">download</span>
                          </button>
                          <div class="dropdown" @mouseenter="nota.menu=true" @mouseleave="nota.menu=false">
                            <button class="icon-btn">
                              <span class="material-symbols-outlined" style="font-size:14px">more_vert</span>
                            </button>
                            <div class="dropdown-menu" v-if="nota.menu">
                              <button class="dm-item" @click="acao(nota,'transmitir')"><span class="material-symbols-outlined" style="font-size:14px">send</span>Transmitir SEFAZ</button>
                              <button class="dm-item" @click="acao(nota,'cancelar')" :disabled="nota.status!=='Autorizada'"><span class="material-symbols-outlined" style="font-size:14px">cancel</span>Cancelar</button>
                              <button class="dm-item" @click="acao(nota,'cce')" :disabled="nota.status!=='Autorizada'"><span class="material-symbols-outlined" style="font-size:14px">edit_document</span>Carta de Correção</button>
                              <button class="dm-item" @click="acao(nota,'duplicar')"><span class="material-symbols-outlined" style="font-size:14px">content_copy</span>Duplicar Nota</button>
                              <button class="dm-item" @click="acao(nota,'reenviar')"><span class="material-symbols-outlined" style="font-size:14px">refresh</span>Reenviar</button>
                              <button class="dm-item" @click="acao(nota,'contingencia')"><span class="material-symbols-outlined" style="font-size:14px">cloud_off</span>Contingência</button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="pagination">
                <span class="pag-info">{{ (nfePage-1)*pageSize+1 }}–{{ Math.min(nfePage*pageSize, filteredNfe.length) }} de {{ filteredNfe.length }}</span>
                <div class="pag-btns">
                  <button class="pag-btn" :disabled="nfePage===1" @click="nfePage--"><span class="material-symbols-outlined" style="font-size:15px">chevron_left</span></button>
                  <span class="pag-num">{{ nfePage }} / {{ nfeTotalPages }}</span>
                  <button class="pag-btn" :disabled="nfePage===nfeTotalPages" @click="nfePage++"><span class="material-symbols-outlined" style="font-size:15px">chevron_right</span></button>
                </div>
              </div>
            </div>

            <!-- PAINEL DIREITO NF-e -->
            <div class="right-panel">

              <!-- AÇÕES RÁPIDAS -->
              <div class="card">
                <div class="card-head">
                  <div class="card-icon c-orange"><span class="material-symbols-outlined">bolt</span></div>
                  <div><div class="card-title">Ações Rápidas</div><div class="card-sub">NF-e modelo 55</div></div>
                </div>
                <div class="quick-actions">
                  <button v-for="qa in nfeQuickActions" :key="qa.label"
                    class="qa-btn" :class="qa.primary ? 'qa-primary' : ''"
                    @click="showToast(qa.icon, qa.msg)">
                    <div class="qa-icon" :style="{ background: qa.color+'18', color: qa.color }">
                      <span class="material-symbols-outlined" style="font-size:18px">{{ qa.icon }}</span>
                    </div>
                    <div class="qa-info">
                      <div class="qa-label">{{ qa.label }}</div>
                      <div class="qa-sub">{{ qa.sub }}</div>
                    </div>
                    <span class="material-symbols-outlined" style="font-size:16px;color:var(--muted)">chevron_right</span>
                  </button>
                </div>
              </div>

              <!-- STATUS TRANSMISSÃO -->
              <div class="card">
                <div class="card-head">
                  <div class="card-icon c-blue"><span class="material-symbols-outlined">cell_tower</span></div>
                  <div><div class="card-title">Status SEFAZ</div><div class="card-sub">Transmissões recentes</div></div>
                </div>
                <div class="transmission-list">
                  <div v-for="t in transmissoes" :key="t.id" class="trans-item">
                    <div class="trans-icon" :class="t.ok ? 'c-green' : 'c-red'">
                      <span class="material-symbols-outlined" style="font-size:14px">{{ t.ok ? 'check_circle' : 'error' }}</span>
                    </div>
                    <div class="trans-info">
                      <div class="trans-title">NF-e {{ t.numero }} · {{ t.destinatario }}</div>
                      <div class="trans-sub">{{ t.ok ? 'Autorizada' : 'Rejeitada' }} · {{ t.hora }} · {{ t.ms }}ms</div>
                    </div>
                    <span v-if="!t.ok" class="trans-cod">{{ t.cod }}</span>
                  </div>
                </div>
              </div>

              <!-- INUTILIZAÇÕES -->
              <div class="card">
                <div class="card-head">
                  <div class="card-icon c-yellow"><span class="material-symbols-outlined">block</span></div>
                  <div><div class="card-title">Inutilizações</div><div class="card-sub">Numeração inutilizada</div></div>
                  <div class="card-actions">
                    <button class="tbtn" @click="showToast('block','Abrindo formulário de inutilização...')">
                      <span class="material-symbols-outlined" style="font-size:13px">add</span>Nova
                    </button>
                  </div>
                </div>
                <div class="inut-list">
                  <div v-for="iu in inutilizacoes" :key="iu.id" class="inut-item">
                    <div class="inut-faixa">{{ iu.inicio }}–{{ iu.fim }}</div>
                    <div class="inut-info">
                      <div style="font-size:11.5px;font-weight:600">Série {{ iu.serie }} · {{ iu.qtd }} nro(s)</div>
                      <div class="cell-sub">{{ iu.motivo }}</div>
                    </div>
                    <div class="inut-date">{{ iu.data }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ═══════════════════ ABA NFC-e ═══════════════════ -->
        <div v-if="activeTab === 'nfce'">
          <div class="grid-2-1">

            <!-- PAINEL PDV -->
            <div style="display:flex;flex-direction:column;gap:14px">

              <!-- TABELA NFC-e -->
              <div class="card">
                <div class="card-head">
                  <div class="card-icon c-green"><span class="material-symbols-outlined">receipt</span></div>
                  <div>
                    <div class="card-title">NFC-e — PDV / Varejo</div>
                    <div class="card-sub">{{ periodLabel }} · {{ filteredNfce.length }} cupons fiscais</div>
                  </div>
                  <div class="card-actions">
                    <button class="tbtn accent2" @click="openModal('nfce')">
                      <span class="material-symbols-outlined" style="font-size:13px">point_of_sale</span>Emitir NFC-e
                    </button>
                  </div>
                </div>
                <div class="table-wrap">
                  <table class="fiscal-table">
                    <thead>
                      <tr>
                        <th>NRO.</th>
                        <th>CONSUMIDOR</th>
                        <th>VALOR</th>
                        <th>PAGAMENTO</th>
                        <th>EMISSÃO</th>
                        <th>STATUS</th>
                        <th style="width:100px">AÇÕES</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="cupom in paginatedNfce" :key="cupom.id">
                        <td><span class="mono-bold">{{ cupom.numero }}</span></td>
                        <td>
                          <div class="cell-name">{{ cupom.consumidor }}</div>
                          <div class="cell-sub">{{ cupom.cpf || 'CPF não informado' }}</div>
                        </td>
                        <td><span class="mono-bold">R$ {{ cupom.valor }}</span></td>
                        <td>
                          <div class="pay-badge" :class="'pay-'+cupom.pagamento.toLowerCase().replace(' ','')">
                            <span class="material-symbols-outlined" style="font-size:12px">{{ payIcon(cupom.pagamento) }}</span>
                            {{ cupom.pagamento }}
                          </div>
                        </td>
                        <td><div style="font-size:11.5px">{{ cupom.emissao }}</div><div class="cell-sub">{{ cupom.hora }}</div></td>
                        <td>
                          <div class="status-cell">
                            <span class="status-dot" :class="'dot-'+statusClass(cupom.status)"></span>
                            <Tag :value="cupom.status" class="tag-custom" :class="tagClass(cupom.status)" />
                          </div>
                        </td>
                        <td>
                          <div class="row-actions">
                            <button class="icon-btn" title="QR Code" @click="showQrModal(cupom)">
                              <span class="material-symbols-outlined" style="font-size:14px">qr_code</span>
                            </button>
                            <button class="icon-btn" title="Imprimir" @click="showToast('print','Enviando para impressão térmica...')">
                              <span class="material-symbols-outlined" style="font-size:14px">print</span>
                            </button>
                            <button class="icon-btn" title="Cancelar" @click="showToast('cancel','NFC-e '+cupom.numero+' cancelada!')" :disabled="cupom.status!=='Autorizada'">
                              <span class="material-symbols-outlined" style="font-size:14px">cancel</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div class="pagination">
                  <span class="pag-info">{{ (nfcePage-1)*pageSize+1 }}–{{ Math.min(nfcePage*pageSize, filteredNfce.length) }} de {{ filteredNfce.length }}</span>
                  <div class="pag-btns">
                    <button class="pag-btn" :disabled="nfcePage===1" @click="nfcePage--"><span class="material-symbols-outlined" style="font-size:15px">chevron_left</span></button>
                    <span class="pag-num">{{ nfcePage }} / {{ nfceTotalPages }}</span>
                    <button class="pag-btn" :disabled="nfcePage===nfceTotalPages" @click="nfcePage++"><span class="material-symbols-outlined" style="font-size:15px">chevron_right</span></button>
                  </div>
                </div>
              </div>

              <!-- FILA OFFLINE -->
              <div class="card">
                <div class="card-head">
                  <div class="card-icon c-yellow"><span class="material-symbols-outlined">cloud_off</span></div>
                  <div>
                    <div class="card-title">Fila Offline</div>
                    <div class="card-sub">NFC-e aguardando sincronização SEFAZ</div>
                  </div>
                  <div class="card-actions">
                    <button class="tbtn primary" @click="syncOffline">
                      <span class="material-symbols-outlined" style="font-size:13px">sync</span>Sincronizar agora
                    </button>
                  </div>
                </div>
                <div v-if="offlineItems.length === 0" class="empty-state">
                  <span class="material-symbols-outlined" style="font-size:28px;color:var(--green)">check_circle</span>
                  <div class="es-title" style="color:var(--green)">Tudo sincronizado!</div>
                  <div class="es-sub">Nenhuma nota na fila offline.</div>
                </div>
                <div v-else class="offline-list">
                  <div v-for="oi in offlineItems" :key="oi.id" class="offline-item">
                    <div class="offline-status">
                      <div v-if="oi.syncing" class="spinner-sm"></div>
                      <span v-else class="material-symbols-outlined" style="font-size:16px;color:var(--yellow)">schedule</span>
                    </div>
                    <div class="offline-info">
                      <div class="offline-title">NFC-e {{ oi.numero }} · R$ {{ oi.valor }}</div>
                      <div class="offline-sub">{{ oi.consumidor }} · {{ oi.tentativas }} tentativa(s) · {{ oi.hora }}</div>
                    </div>
                    <div class="offline-retry">
                      <button class="icon-btn" @click="retryOffline(oi)">
                        <span class="material-symbols-outlined" style="font-size:14px">refresh</span>
                      </button>
                    </div>
                  </div>
                </div>
                <div class="offline-footer" v-if="offlineItems.length > 0">
                  <span class="material-symbols-outlined" style="font-size:14px;color:var(--yellow)">info</span>
                  <span>Retry automático a cada <strong>30s</strong> · Contingência FS-DA ativa</span>
                </div>
              </div>
            </div>

            <!-- PAINEL DIREITO NFC-e -->
            <div class="right-panel">

              <!-- EMISSÃO RÁPIDA PDV -->
               <!--
               <div class="card pdv-card">
                 <div class="card-head">
                   <div class="card-icon c-green"><span class="material-symbols-outlined">point_of_sale</span></div>
                   <div><div class="card-title">Emissão Rápida PDV</div><div class="card-sub">NFC-e · Varejo</div></div>
                 </div>
                 <div class="pdv-panel">
                   <div class="pdv-display">
                     <div class="pdv-total-label">TOTAL A PAGAR</div>
                     <div class="pdv-total">R$ {{ pdvTotal.toFixed(2).replace('.',',') }}</div>
                     <div class="pdv-items-count">{{ pdvItems.length }} iten(s)</div>
                   </div>
                   <div class="pdv-items">
                     <div v-for="(item, i) in pdvItems" :key="i" class="pdv-item">
                       <div class="pdv-item-info">
                         <div class="pdv-item-name">{{ item.nome }}</div>
                         <div class="pdv-item-sub">{{ item.qty }}x R$ {{ item.preco }}</div>
                       </div>
                       <div class="pdv-item-total">R$ {{ (item.qty * parseFloat(item.preco.replace(',','.'))).toFixed(2).replace('.',',') }}</div>
                       <button class="icon-btn" @click="removePdvItem(i)">
                         <span class="material-symbols-outlined" style="font-size:13px">close</span>
                       </button>
                     </div>
                     <div v-if="pdvItems.length === 0" class="pdv-empty">
                       <span class="material-symbols-outlined" style="font-size:24px;color:var(--muted)">shopping_cart</span>
                       <div style="font-size:12px;color:var(--muted)">Nenhum item adicionado</div>
                     </div>
                   </div>
                   <div class="pdv-form">
                     <div class="pdv-input-row">
                       <input v-model="pdvNewItem" placeholder="Produto / EAN..." class="pdv-input" @keyup.enter="addPdvItem" />
                       <input v-model="pdvNewQty" type="number" min="1" class="pdv-qty-input" placeholder="Qty" />
                       <button class="tbtn primary" @click="addPdvItem">
                         <span class="material-symbols-outlined" style="font-size:14px">add</span>
                       </button>
                     </div>
                   </div>
                   <div class="pdv-payment">
                     <div class="pdv-pay-label">Pagamento</div>
                     <div class="pay-options">
                       <button v-for="pay in payOptions" :key="pay.key"
                         class="pay-opt" :class="{ 'pay-active': selectedPay === pay.key }"
                         @click="selectedPay = pay.key">
                         <span class="material-symbols-outlined" style="font-size:16px">{{ pay.icon }}</span>
                         {{ pay.label }}
                       </button>
                     </div>
                   </div>
                   <div class="pdv-cpf-row">
                     <input v-model="pdvCpf" placeholder="CPF do consumidor (opcional)" class="pdv-input" />
                   </div>
                   <button class="btn-full emit-btn" @click="emitirNfce" :disabled="pdvItems.length === 0">
                     <span class="material-symbols-outlined" style="font-size:18px">receipt_long</span>
                     Emitir NFC-e · R$ {{ pdvTotal.toFixed(2).replace('.',',') }}
                   </button>
                   <div class="pdv-footer-btns">
                     <button class="tbtn" @click="pdvItems=[]">
                       <span class="material-symbols-outlined" style="font-size:13px">delete</span>Limpar
                     </button>
                     <button class="tbtn" @click="showToast('cloud_off','Modo contingência ativado!')">
                       <span class="material-symbols-outlined" style="font-size:13px">cloud_off</span>Contingência
                     </button>
                     <button class="tbtn" @click="showToast('print','Abrindo impressora térmica...')">
                       <span class="material-symbols-outlined" style="font-size:13px">print</span>Reimprimir
                     </button>
                   </div>
                 </div>
               </div>
               -->

              <!-- SYNC STATUS -->
              <div class="card">
                <div class="card-head">
                  <div class="card-icon c-blue"><span class="material-symbols-outlined">sync</span></div>
                  <div><div class="card-title">Sincronização</div><div class="card-sub">Status do retry automático</div></div>
                </div>
                <div class="sync-stats">
                  <div class="sync-stat">
                    <div class="ss-val green">{{ syncStats.ok }}</div>
                    <div class="ss-lbl">Sincronizadas</div>
                  </div>
                  <div class="sync-stat">
                    <div class="ss-val accent">{{ syncStats.pending }}</div>
                    <div class="ss-lbl">Pendentes</div>
                  </div>
                  <div class="sync-stat">
                    <div class="ss-val red">{{ syncStats.error }}</div>
                    <div class="ss-lbl">Com erro</div>
                  </div>
                </div>
                <div class="sync-bar-wrap">
                  <div class="sync-bar-fill" :style="{ width: syncPct + '%' }"></div>
                </div>
                <div class="sync-info">Próximo retry em <strong>{{ retryCountdown }}s</strong> · Último: {{ lastSync }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- ═══════════════════ ABA CONTINGÊNCIA ═══════════════════ -->
        <div v-if="activeTab === 'contingencia'">
          <div class="grid-2">
            <div class="card">
              <div class="card-head">
                <div class="card-icon c-yellow"><span class="material-symbols-outlined">cloud_off</span></div>
                <div><div class="card-title">Notas em Contingência</div><div class="card-sub">FS-DA / SCAN · Aguardando regularização</div></div>
                <div class="card-actions">
                  <button class="tbtn primary" @click="regularizarTodas">
                    <span class="material-symbols-outlined" style="font-size:13px">sync</span>Regularizar todas
                  </button>
                </div>
              </div>
              <div class="table-wrap">
                <table class="fiscal-table">
                  <thead>
                    <tr>
                      <th>NRO.</th><th>DESTINATÁRIO</th><th>VALOR</th><th>EMISSÃO</th><th>TIPO CONT.</th><th>AÇÕES</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="cont in contingencias" :key="cont.id">
                      <td><span class="mono-bold">{{ cont.numero }}</span></td>
                      <td><div class="cell-name">{{ cont.destinatario }}</div><div class="cell-sub">{{ cont.cnpj }}</div></td>
                      <td><span class="mono-bold">R$ {{ cont.valor }}</span></td>
                      <td><div style="font-size:11.5px">{{ cont.emissao }}</div></td>
                      <td><Tag :value="cont.tipo" class="tag-custom tag-orange" /></td>
                      <td>
                        <div class="row-actions">
                          <button class="icon-btn" title="Transmitir" @click="showToast('send','Transmitindo '+cont.numero+'...')">
                            <span class="material-symbols-outlined" style="font-size:14px">send</span>
                          </button>
                          <button class="icon-btn" title="DANFE" @click="showToast('picture_as_pdf','Gerando DANFE...')">
                            <span class="material-symbols-outlined" style="font-size:14px">picture_as_pdf</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- PAINEL CONTINGÊNCIA INFO -->
            <div style="display:flex;flex-direction:column;gap:14px">
              <div class="card">
                <div class="card-head">
                  <div class="card-icon c-orange"><span class="material-symbols-outlined">info</span></div>
                  <div><div class="card-title">Sobre Contingência</div><div class="card-sub">Guia de procedimentos</div></div>
                </div>
                <div class="cont-guide">
                  <div v-for="step in contingenciaGuide" :key="step.id" class="guide-step">
                    <div class="guide-num">{{ step.id }}</div>
                    <div class="guide-info">
                      <div class="guide-title">{{ step.title }}</div>
                      <div class="guide-desc">{{ step.desc }}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="alerta-prazo-card">
                <div class="ap-icon"><span class="material-symbols-outlined" style="font-size:24px">warning</span></div>
                <div class="ap-info">
                  <div class="ap-title">Prazo de regularização!</div>
                  <div class="ap-sub">Notas emitidas em contingência devem ser transmitidas ao SEFAZ em até <strong>168 horas</strong> (7 dias). Você tem <strong>{{ contingencias.length }} nota(s)</strong> pendentes de regularização.</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ═══════════════════ ABA CANCELAMENTOS / CCE ═══════════════════ -->
        <div v-if="activeTab === 'cancelamentos'">
          <div class="grid-2">
            <!-- CANCELAMENTOS -->
            <div class="card">
              <div class="card-head">
                <div class="card-icon c-red"><span class="material-symbols-outlined">cancel</span></div>
                <div><div class="card-title">Cancelamentos</div><div class="card-sub">NF-e / NFC-e canceladas · {{ periodLabel }}</div></div>
                <div class="card-actions"><span class="badge-count red">{{ cancelamentos.length }}</span></div>
              </div>
              <div class="table-wrap">
                <table class="fiscal-table">
                  <thead>
                    <tr><th>NRO.</th><th>DESTINATÁRIO</th><th>VALOR</th><th>MOTIVO</th><th>CANCELADO EM</th><th>AÇÕES</th></tr>
                  </thead>
                  <tbody>
                    <tr v-for="c in cancelamentos" :key="c.id">
                      <td><span class="mono-bold">{{ c.numero }}</span></td>
                      <td><div class="cell-name">{{ c.destinatario }}</div><div class="cell-sub">{{ c.cnpj }}</div></td>
                      <td><span class="mono-bold">R$ {{ c.valor }}</span></td>
                      <td><span style="font-size:11.5px;color:var(--text2)">{{ c.motivo }}</span></td>
                      <td><div style="font-size:11px;color:var(--muted)">{{ c.data }} · {{ c.hora }}</div></td>
                      <td>
                        <div class="row-actions">
                          <button class="icon-btn" @click="showToast('download','Baixando XML cancelamento...')">
                            <span class="material-symbols-outlined" style="font-size:14px">download</span>
                          </button>
                          <button class="icon-btn" @click="showToast('picture_as_pdf','Gerando DANFE cancelamento...')">
                            <span class="material-symbols-outlined" style="font-size:14px">picture_as_pdf</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- CARTA DE CORREÇÃO -->
            <div class="card">
              <div class="card-head">
                <div class="card-icon c-blue"><span class="material-symbols-outlined">edit_document</span></div>
                <div><div class="card-title">Cartas de Correção</div><div class="card-sub">CC-e emitidas · {{ periodLabel }}</div></div>
                <div class="card-actions">
                  <button class="tbtn primary" @click="showToast('edit_document','Abrindo formulário CC-e...')">
                    <span class="material-symbols-outlined" style="font-size:13px">add</span>Nova CC-e
                  </button>
                </div>
              </div>
              <div class="cce-list">
                <div v-for="cc in cartaCorrecao" :key="cc.id" class="cce-item">
                  <div class="cce-header">
                    <div class="cce-nfe">NF-e {{ cc.numero }} · CC-e Seq. {{ cc.seq }}</div>
                    <Tag :value="cc.status" class="tag-custom" :class="cc.status==='Autorizada' ? 'tag-green' : 'tag-yellow'" />
                  </div>
                  <div class="cce-campo">
                    <span class="cce-campo-label">Campo corrigido:</span> {{ cc.campo }}
                  </div>
                  <div class="cce-texto">{{ cc.texto }}</div>
                  <div class="cce-footer">
                    <span class="cell-sub">{{ cc.data }} · {{ cc.destinatario }}</span>
                    <div class="row-actions">
                      <button class="icon-btn" @click="showToast('download','Baixando XML CC-e...')">
                        <span class="material-symbols-outlined" style="font-size:14px">download</span>
                      </button>
                      <button class="icon-btn" @click="showToast('picture_as_pdf','Gerando PDF CC-e...')">
                        <span class="material-symbols-outlined" style="font-size:14px">picture_as_pdf</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div><!-- /content -->

      <!-- ═══ MODAL EMISSÃO NF-e / NFC-e ═══ -->
      <div class="modal-overlay" v-if="showModal" @click.self="showModal=false">
        <div class="modal-box" :class="modalType === 'nfce' ? 'modal-nfce' : ''">
          <div class="modal-header">
            <div class="modal-title-row">
              <div class="brand-icon" style="width:28px;height:28px">
                <span class="material-symbols-outlined" style="font-size:14px;color:#fff">{{ modalType==='nfce' ? 'receipt' : 'description' }}</span>
              </div>
              <div>
                <div class="modal-title">{{ modalType === 'nfe' ? 'Emitir NF-e — Modelo 55' : 'Emitir NFC-e — Modelo 65' }}</div>
                <div class="modal-sub">Preencha os dados para emissão fiscal</div>
              </div>
            </div>
            <button class="modal-close" @click="showModal=false">
              <span class="material-symbols-outlined" style="font-size:18px">close</span>
            </button>
          </div>

          <div class="modal-body">
            <!-- STEPS -->
            <div class="form-steps">
              <div v-for="(step, i) in (modalType==='nfe' ? nfeSteps : nfceSteps)" :key="i"
                class="form-step" :class="{ active: modalStep === i, done: modalStep > i }">
                <div class="step-circle">{{ modalStep > i ? '✓' : i+1 }}</div>
                <div class="step-label">{{ step }}</div>
              </div>
            </div>

            <!-- STEP 0: DESTINATÁRIO / CABEÇALHO -->
            <div v-if="modalStep === 0" class="form-section">
              <div class="form-row-2">
                <div class="form-field">
                  <label class="field-label">Natureza da Operação *</label>
                  <input v-model="form.natureza" class="form-input" placeholder="Ex: Venda de mercadoria" />
                </div>
                <div class="form-field">
                  <label class="field-label">CFOP *</label>
                  <div class="select-wrap" style="width:100%">
                    <select v-model="form.cfop" class="form-input">
                      <option value="">Selecione o CFOP</option>
                      <option v-for="c in cfops" :key="c.cod" :value="c.cod">{{ c.cod }} – {{ c.desc }}</option>
                    </select>
                  </div>
                </div>
              </div>
              <div class="form-row-3">
                <div class="form-field">
                  <label class="field-label">CNPJ / CPF do Destinatário *</label>
                  <input v-model="form.cnpjDest" class="form-input" placeholder="00.000.000/0000-00" />
                </div>
                <div class="form-field" style="flex:2">
                  <label class="field-label">Razão Social / Nome *</label>
                  <input v-model="form.nomeDest" class="form-input" placeholder="Nome do destinatário" />
                </div>
              </div>
              <div class="form-row-3">
                <div class="form-field">
                  <label class="field-label">Fone</label>
                  <input v-model="form.fone" class="form-input" placeholder="(00) 00000-0000" />
                </div>
                <div class="form-field">
                  <label class="field-label">Indicador de IE</label>
                  <select v-model="form.indIE" class="form-input">
                    <option value="1">1 – Contribuinte</option>
                    <option value="2">2 – Isento</option>
                    <option value="9">9 – Não contribuinte</option>
                  </select>
                </div>
                <div class="form-field">
                  <label class="field-label">UF</label>
                  <select v-model="form.uf" class="form-input">
                    <option v-for="uf in ufs" :key="uf" :value="uf">{{ uf }}</option>
                  </select>
                </div>
              </div>
              <div class="form-row-2">
                <div class="form-field">
                  <label class="field-label">Logradouro</label>
                  <input v-model="form.logradouro" class="form-input" placeholder="Rua, Av..." />
                </div>
                <div class="form-field">
                  <label class="field-label">Município</label>
                  <input v-model="form.municipio" class="form-input" placeholder="Cidade" />
                </div>
              </div>
            </div>

            <!-- STEP 1: PRODUTOS E TRIBUTAÇÃO -->
            <div v-if="modalStep === 1" class="form-section">
              <div class="prod-table-header">
                <span class="field-label">Produtos / Serviços</span>
                <button class="tbtn primary" @click="addFormItem">
                  <span class="material-symbols-outlined" style="font-size:13px">add</span>Adicionar item
                </button>
              </div>
              <table class="fiscal-table prod-table">
                <thead>
                  <tr><th>PRODUTO</th><th>NCM</th><th>CFOP</th><th>CST</th><th>QTD</th><th>V.UNIT</th><th>V.TOTAL</th><th></th></tr>
                </thead>
                <tbody>
                  <tr v-for="(item, i) in form.itens" :key="i">
                    <td><input v-model="item.nome" class="td-input" placeholder="Produto..." /></td>
                    <td><input v-model="item.ncm" class="td-input" placeholder="0000.00.00" /></td>
                    <td><input v-model="item.cfop" class="td-input" placeholder="5102" /></td>
                    <td><input v-model="item.cst" class="td-input" placeholder="000" /></td>
                    <td><input v-model.number="item.qty" type="number" class="td-input" min="1" /></td>
                    <td><input v-model="item.vUnit" class="td-input" placeholder="0,00" /></td>
                    <td><span class="mono-bold">R$ {{ calcItemTotal(item) }}</span></td>
                    <td><button class="icon-btn" @click="form.itens.splice(i,1)"><span class="material-symbols-outlined" style="font-size:13px">close</span></button></td>
                  </tr>
                  <tr v-if="form.itens.length===0">
                    <td colspan="8" style="text-align:center;padding:20px;color:var(--muted);font-size:12px">Nenhum item adicionado. Clique em "Adicionar item".</td>
                  </tr>
                </tbody>
              </table>
              <div class="tribut-section">
                <div class="trib-label">Tributação Resumida</div>
                <div class="trib-grid">
                  <div v-for="trib in tributacoes" :key="trib.label" class="trib-item">
                    <label class="field-label">{{ trib.label }}</label>
                    <input v-model="form[trib.key]" class="form-input" :placeholder="trib.ph" />
                  </div>
                </div>
              </div>
            </div>

            <!-- STEP 2: TRANSPORTE / FRETE -->
            <div v-if="modalStep === 2 && modalType === 'nfe'" class="form-section">
              <div class="form-row-2">
                <div class="form-field">
                  <label class="field-label">Modalidade do Frete</label>
                  <select v-model="form.frete" class="form-input">
                    <option value="0">0 – Por conta do emitente</option>
                    <option value="1">1 – Por conta do destinatário</option>
                    <option value="2">2 – Por conta de terceiros</option>
                    <option value="9">9 – Sem frete</option>
                  </select>
                </div>
                <div class="form-field">
                  <label class="field-label">Valor do Frete (R$)</label>
                  <input v-model="form.vFrete" class="form-input" placeholder="0,00" />
                </div>
              </div>
              <div class="form-row-2">
                <div class="form-field">
                  <label class="field-label">CNPJ Transportadora</label>
                  <input v-model="form.cnpjTransp" class="form-input" placeholder="00.000.000/0000-00" />
                </div>
                <div class="form-field">
                  <label class="field-label">Nome Transportadora</label>
                  <input v-model="form.nomeTransp" class="form-input" placeholder="Nome da transportadora" />
                </div>
              </div>
              <div class="form-row-3">
                <div class="form-field">
                  <label class="field-label">Placa do Veículo</label>
                  <input v-model="form.placa" class="form-input" placeholder="AAA-0000" />
                </div>
                <div class="form-field">
                  <label class="field-label">UF Veículo</label>
                  <select v-model="form.ufTransp" class="form-input">
                    <option v-for="uf in ufs" :key="uf" :value="uf">{{ uf }}</option>
                  </select>
                </div>
                <div class="form-field">
                  <label class="field-label">Nro. Volumes</label>
                  <input v-model="form.volumes" type="number" class="form-input" placeholder="1" />
                </div>
              </div>
              <div class="form-field">
                <label class="field-label">Informações Adicionais</label>
                <textarea v-model="form.infAdic" class="form-textarea" rows="3" placeholder="Informações complementares..."></textarea>
              </div>
            </div>

            <!-- STEP FINAL: REVISÃO -->
            <div v-if="(modalType==='nfe' && modalStep===3) || (modalType==='nfce' && modalStep===2)" class="form-section">
              <div class="review-panel">
                <div class="review-header">
                  <span class="material-symbols-outlined" style="font-size:28px;color:var(--accent)">fact_check</span>
                  <div>
                    <div class="review-title">Revisão antes de emitir</div>
                    <div class="review-sub">Confirme os dados e escolha a ação de emissão.</div>
                  </div>
                </div>
                <div class="review-grid">
                  <div class="review-item"><div class="review-label">Destinatário</div><div class="review-val">{{ form.nomeDest || '—' }}</div></div>
                  <div class="review-item"><div class="review-label">CFOP</div><div class="review-val">{{ form.cfop || '—' }}</div></div>
                  <div class="review-item"><div class="review-label">Total de Itens</div><div class="review-val">{{ form.itens.length }}</div></div>
                  <div class="review-item"><div class="review-label">Valor Total</div><div class="review-val accent">R$ {{ formTotal }}</div></div>
                  <div class="review-item"><div class="review-label">Natureza Op.</div><div class="review-val">{{ form.natureza || '—' }}</div></div>
                  <div class="review-item"><div class="review-label">Frete</div><div class="review-val">{{ form.frete !== '' ? 'Mod. '+form.frete : 'Não informado' }}</div></div>
                </div>
                <div class="emit-options">
                  <button class="emit-opt-btn primary-btn" @click="emitirNota('transmitir')">
                    <span class="material-symbols-outlined" style="font-size:18px">send</span>
                    Emitir e Transmitir SEFAZ
                  </button>
                  <button class="emit-opt-btn secondary-btn" @click="emitirNota('rascunho')">
                    <span class="material-symbols-outlined" style="font-size:18px">save</span>
                    Salvar Rascunho
                  </button>
                  <button class="emit-opt-btn warning-btn" @click="emitirNota('contingencia')">
                    <span class="material-symbols-outlined" style="font-size:18px">cloud_off</span>
                    Emitir em Contingência
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="tbtn" @click="modalStep > 0 ? modalStep-- : (showModal=false)">
              <span class="material-symbols-outlined" style="font-size:14px">arrow_back</span>
              {{ modalStep > 0 ? 'Voltar' : 'Cancelar' }}
            </button>
            <div style="margin-left:auto;display:flex;gap:8px;align-items:center">
              <span class="modal-step-info">Etapa {{ modalStep+1 }} de {{ (modalType==='nfe' ? nfeSteps : nfceSteps).length }}</span>
              <button v-if="!isLastStep" class="tbtn primary" @click="modalStep++">
                Próximo
                <span class="material-symbols-outlined" style="font-size:14px">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- QR CODE MODAL -->
      <div class="modal-overlay" v-if="showQr" @click.self="showQr=false">
        <div class="qr-modal">
          <div class="modal-header">
            <div class="modal-title">QR Code — NFC-e {{ qrData?.numero }}</div>
            <button class="modal-close" @click="showQr=false"><span class="material-symbols-outlined" style="font-size:18px">close</span></button>
          </div>
          <div class="qr-body">
            <div class="qr-placeholder">
              <span class="material-symbols-outlined" style="font-size:80px;color:var(--border2)">qr_code_2</span>
              <div style="font-size:11px;color:var(--muted);margin-top:8px">QR Code gerado para consulta SEFAZ</div>
            </div>
            <div class="qr-info">
              <div class="qr-row"><span>Valor:</span><strong>R$ {{ qrData?.valor }}</strong></div>
              <div class="qr-row"><span>Consumidor:</span><strong>{{ qrData?.consumidor }}</strong></div>
              <div class="qr-row"><span>Chave:</span><strong class="mono-bold" style="font-size:10px">{{ qrData?.chave }}</strong></div>
            </div>
            <div class="qr-actions">
              <button class="tbtn primary" @click="showToast('print','Imprimindo cupom...');showQr=false">
                <span class="material-symbols-outlined" style="font-size:14px">print</span>Imprimir
              </button>
              <button class="tbtn" @click="showQr=false">Fechar</button>
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
        <span>Emissão Fiscal · NF-e Mod.55 · NFC-e Mod.65 · SEFAZ WebService</span>
        <span>©2026 Sistema Fiscal · v3.2.1</span>
      </footer>
    </div>
  </div>
</template>

<script>
import Tag from 'primevue/tag';

function rnd(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
function fmtVal(v) { return (v / 100).toFixed(2).replace('.', ','); }

const ACCENT = '#FF8049';
const GREEN  = '#16a34a';
const BLUE   = '#2563eb';
const YELLOW = '#ca8a04';
const RED    = '#dc2626';

const nfeData = Array.from({ length: 22 }, (_, i) => ({
  id: i + 1,
  numero: String(1000 - i).padStart(7, '0'),
  serie: '001',
  destinatario: ['Distribuidora Alpha Ltda.','Comércio Beta ME','Tech Imports S.A.','Varejão Central Eireli','Atacado Sul Ltda.','Indústria Gama S.A.'][i % 6],
  cnpj: ['12.345.678/0001-90','98.765.432/0001-11','55.444.333/0001-22','77.666.555/0001-33','11.222.333/0001-44','33.555.777/0001-66'][i % 6],
  natureza: ['Venda de mercadoria','Transferência','Remessa para industrialização','Devolução de compra','Venda de produção','Consignação mercantil'][i % 6],
  valor: fmtVal(rnd(100000, 5000000)),
  icms: [12, 18, 7, 4, 12][i % 5],
  emissao: `${String(rnd(1,14)).padStart(2,'0')}/05/2026`,
  hora: `${String(rnd(8,18)).padStart(2,'0')}:${String(rnd(0,59)).padStart(2,'0')}`,
  status: ['Autorizada','Autorizada','Autorizada','Cancelada','Rejeitada','Contingência','Pendente'][i % 7],
  menu: false,
  chave: `3526${String(rnd(1e9,9e9))}0001550001${String(i+1).padStart(9,'0')}1`,
}));

const nfceData = Array.from({ length: 18 }, (_, i) => ({
  id: 100 + i,
  numero: String(5000 - i).padStart(7, '0'),
  consumidor: ['Consumidor Final','Maria Silva','João Pereira','Ana Souza','Carlos Lima','Fernanda Costa'][i % 6],
  cpf: ['', '123.456.789-00', '', '987.654.321-00', '', '456.789.123-00'][i % 6],
  valor: fmtVal(rnd(1000, 50000)),
  pagamento: ['Dinheiro','Cartão Crédito','Cartão Débito','PIX','Dinheiro','PIX'][i % 6],
  emissao: `${String(rnd(1,14)).padStart(2,'0')}/05/2026`,
  hora: `${String(rnd(8,22)).padStart(2,'0')}:${String(rnd(0,59)).padStart(2,'0')}`,
  status: ['Autorizada','Autorizada','Autorizada','Cancelada'][i % 4],
  chave: `3526${String(rnd(1e9,9e9))}0001650001${String(i+1).padStart(9,'0')}1`,
}));

export default {
  name: 'EmissaoFiscal',
  components: { Tag },

  data() {
    return {
      activeTab: 'nfe',
      activePeriod: '30d',
      customDays: 30,
      globalSearch: '',
      filterTipo: '',
      filterStatus: '',
      sefazOnline: true,
      offlineQueue: 2,
      showModal: false,
      showQr: false,
      qrData: null,
      modalType: 'nfe',
      modalStep: 0,
      selectedNfe: [],
      nfePage: 1,
      nfcePage: 1,
      pageSize: 8,
      toastVisible: false,
      toastMsg: '',
      toastIcon: 'check_circle',
      retryCountdown: 28,
      lastSync: '14:32',
      selectedPay: 'dinheiro',
      pdvItems: [],
      pdvNewItem: '',
      pdvNewQty: 1,
      pdvCpf: '',

      nfeData,
      nfceData,

      form: {
        natureza: '', cfop: '', cnpjDest: '', nomeDest: '', fone: '',
        indIE: '9', uf: 'SP', logradouro: '', municipio: '',
        itens: [], frete: '9', vFrete: '',
        cnpjTransp: '', nomeTransp: '', placa: '', ufTransp: 'SP', volumes: 1,
        infAdic: '',
        icms: '', pis: '', cofins: '', ipi: '',
      },

      periods: [
        { key: 'hoje',   label: 'Hoje'    },
        { key: '7d',     label: '7 dias'  },
        { key: '15d',    label: '15 dias' },
        { key: '30d',    label: '30 dias' },
        { key: '90d',    label: '90 dias' },
        { key: 'custom', label: 'Custom'  },
      ],

      nfeSteps:  ['Destinatário', 'Produtos', 'Transporte', 'Revisão'],
      nfceSteps: ['Consumidor',   'Produtos', 'Revisão'],

      cfops: [
        { cod: '5102', desc: 'Venda de mercadoria adquirida de terceiros' },
        { cod: '5401', desc: 'Venda de produção do estabelecimento' },
        { cod: '5922', desc: 'Lançamento efetuado a título de simples faturamento' },
        { cod: '6102', desc: 'Venda de mercadoria adquirida de terceiros (interestadual)' },
        { cod: '1102', desc: 'Compra para comercialização' },
        { cod: '1202', desc: 'Devolução de venda de produção do estabelecimento' },
        { cod: '5605', desc: 'Transferência de saldo devedor de ICMS' },
      ],

      ufs: ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'],

      tributacoes: [
        { label: 'Base ICMS (R$)', key: 'icms', ph: '0,00' },
        { label: 'Alíq. PIS (%)',  key: 'pis',  ph: '0,65' },
        { label: 'Alíq. COFINS (%)',key:'cofins',ph: '3,00' },
        { label: 'Alíq. IPI (%)',  key: 'ipi',  ph: '0,00' },
      ],

      payOptions: [
        { key: 'dinheiro', label: 'Dinheiro',   icon: 'payments'      },
        { key: 'credito',  label: 'Crédito',    icon: 'credit_card'   },
        { key: 'debito',   label: 'Débito',     icon: 'credit_card'   },
        { key: 'pix',      label: 'PIX',        icon: 'qr_code'       },
      ],

      nfeQuickActions: [
        { label: 'Nova NF-e',          sub: 'Emissão completa mod.55',    icon: 'add_circle',       color: ACCENT, msg: 'Abrindo formulário NF-e...',        primary: true  },
        { label: 'Importar Pedido',    sub: 'Gerar NF-e a partir de venda',icon:'shopping_cart',    color: BLUE,  msg: 'Selecione um pedido para importar...' },
        { label: 'Duplicar Nota',      sub: 'Clonar última NF-e',          icon:'content_copy',     color: GREEN, msg: 'Selecionando nota para duplicar...'   },
        { label: 'Carta de Correção',  sub: 'CC-e em nota autorizada',     icon:'edit_document',    color: BLUE,  msg: 'Abrindo formulário CC-e...'            },
        { label: 'Inutilizar',         sub: 'Inutilizar numeração',        icon:'block',             color: YELLOW,msg: 'Abrindo formulário de inutilização...'},
        { label: 'Modo Contingência',  sub: 'Emitir offline FS-DA',        icon:'cloud_off',        color: YELLOW,msg: 'Ativando modo contingência...'         },
      ],

      transmissoes: [
        { id:1, numero:'0001000', destinatario:'Alpha Ltda.',   ok:true,  hora:'14:42', ms:134, cod:null  },
        { id:2, numero:'0000999', destinatario:'Beta ME',       ok:false, hora:'14:38', ms:203, cod:'539' },
        { id:3, numero:'0000998', destinatario:'Tech Imports',  ok:true,  hora:'14:30', ms:98,  cod:null  },
        { id:4, numero:'0000997', destinatario:'Varejão Central',ok:true, hora:'13:55', ms:142, cod:null  },
        { id:5, numero:'0000996', destinatario:'Atacado Sul',   ok:false, hora:'13:40', ms:310, cod:'204' },
      ],

      inutilizacoes: [
        { id:1, inicio:'0000800', fim:'0000804', serie:'1', qtd:5, motivo:'Erro de emissão',    data:'12/05/26' },
        { id:2, inicio:'0001200', fim:'0001200', serie:'2', qtd:1, motivo:'Teste de integração', data:'10/05/26' },
        { id:3, inicio:'0000790', fim:'0000791', serie:'1', qtd:2, motivo:'Numeração pulada',   data:'08/05/26' },
      ],

      offlineItems: [
        { id:1, numero:'0005000', valor:'128,90', consumidor:'Consumidor Final', tentativas:2, hora:'14:50', syncing:false },
        { id:2, numero:'0004999', valor:'67,40',  consumidor:'Maria Silva',       tentativas:1, hora:'14:48', syncing:false },
      ],

      syncStats: { ok: 312, pending: 2, error: 1 },

      contingencias: [
        { id:1, numero:'0000985', destinatario:'Comércio Beta ME',      cnpj:'98.765.432/0001-11', valor:'4.800,00', emissao:'13/05/26', tipo:'FS-DA' },
        { id:2, numero:'0000982', destinatario:'Atacado Norte Ltda.',   cnpj:'55.666.777/0001-22', valor:'14.300,00', emissao:'13/05/26', tipo:'SCAN' },
        { id:3, numero:'0000978', destinatario:'Fast Delivery ME',      cnpj:'33.444.555/0001-88', valor:'2.890,00',  emissao:'12/05/26', tipo:'FS-DA' },
      ],

      cancelamentos: [
        { id:1, numero:'0000835', destinatario:'Loja Expresso Ltda.',   cnpj:'77.888.999/0001-00', valor:'5.670,00',  motivo:'Erro nos dados', data:'12/05/26', hora:'10:30' },
        { id:2, numero:'0000820', destinatario:'Varejão Central S.A.',  cnpj:'11.444.777/0001-55', valor:'1.340,00',  motivo:'Solicitação cliente', data:'10/05/26', hora:'15:22' },
        { id:3, numero:'0000801', destinatario:'Distribuidora Sul Ltda.',cnpj:'22.333.444/0001-66', valor:'8.900,00', motivo:'Produto incorreto', data:'08/05/26', hora:'09:11' },
      ],

      cartaCorrecao: [
        { id:1, numero:'0000810', seq:'001', campo:'Endereço de entrega', texto:'Corrigido para Rua B, 200 – Bairro Centro, São Paulo/SP', status:'Autorizada', data:'12/05/26 · 09:45', destinatario:'Distribuidora Alpha Ltda.' },
        { id:2, numero:'0000798', seq:'001', campo:'Dados adicionais',    texto:'Pedido de compra nº 4421 referente ao contrato 2026/05', status:'Autorizada', data:'10/05/26 · 14:30', destinatario:'Comércio Beta ME' },
        { id:3, numero:'0000789', seq:'002', campo:'CFOP',                texto:'Corrigido de 5102 para 5101 – Venda de produção do estabelecimento', status:'Pendente', data:'09/05/26 · 11:00', destinatario:'Atacado Sul Ltda.' },
      ],

      contingenciaGuide: [
        { id:1, title:'Ativar contingência', desc:'Quando o SEFAZ está indisponível, ative o modo FS-DA ou SCAN para emitir offline.' },
        { id:2, title:'Emitir em papel',     desc:'Imprima o DANFE em contingência com a marcação "DANFE em Contingência".' },
        { id:3, title:'Regularizar em 168h', desc:'Assim que o SEFAZ normalizar, transmita todas as notas em contingência em até 7 dias.' },
        { id:4, title:'Inutilizar se necessário', desc:'Notas que não puderem ser regularizadas devem ser inutilizadas no SEFAZ.' },
      ],
    };
  },

  computed: {
    mainTabs() {
      return [
        { key: 'nfe',          label: 'NF-e Modelo 55',   icon: 'description',         badge: null, badgeColor: '' },
        { key: 'nfce',         label: 'NFC-e / PDV',      icon: 'point_of_sale',        badge: this.offlineQueue > 0 ? this.offlineQueue : null, badgeColor: 'badge-yellow' },
        { key: 'contingencia', label: 'Contingência',     icon: 'cloud_off',            badge: this.contingencias.length, badgeColor: 'badge-orange' },
        { key: 'cancelamentos',label: 'Cancel. / CC-e',   icon: 'cancel',               badge: this.cancelamentos.length, badgeColor: 'badge-red'    },
      ];
    },
    filteredNotas() {
      const q = this.globalSearch.toLowerCase();
      return [...this.nfeData, ...this.nfceData].filter(n => {
        const matchSearch = !q || (n.destinatario || n.consumidor || '').toLowerCase().includes(q)
          || (n.numero || '').includes(q) || (n.cnpj || n.cpf || '').includes(q);
        const matchStatus = !this.filterStatus || n.status === this.filterStatus;
        return matchSearch && matchStatus;
      });
    },
    filteredNfe() {
      const q = this.globalSearch.toLowerCase();
      return this.nfeData.filter(n => {
        const matchSearch = !q || n.destinatario.toLowerCase().includes(q) || n.numero.includes(q) || n.cnpj.includes(q);
        const matchStatus = !this.filterStatus || n.status === this.filterStatus;
        return matchSearch && matchStatus;
      });
    },
    filteredNfce() {
      const q = this.globalSearch.toLowerCase();
      return this.nfceData.filter(n => {
        const matchSearch = !q || n.consumidor.toLowerCase().includes(q) || n.numero.includes(q);
        const matchStatus = !this.filterStatus || n.status === this.filterStatus;
        return matchSearch && matchStatus;
      });
    },
    paginatedNfe() {
      const s = (this.nfePage - 1) * this.pageSize;
      return this.filteredNfe.slice(s, s + this.pageSize);
    },
    paginatedNfce() {
      const s = (this.nfcePage - 1) * this.pageSize;
      return this.filteredNfce.slice(s, s + this.pageSize);
    },
    nfeTotalPages() { return Math.max(1, Math.ceil(this.filteredNfe.length / this.pageSize)); },
    nfceTotalPages() { return Math.max(1, Math.ceil(this.filteredNfce.length / this.pageSize)); },
    periodLabel() {
      const m = { hoje:'Hoje','7d':'Últimos 7 dias','15d':'Últimos 15 dias','30d':'Últimos 30 dias','90d':'Últimos 90 dias',custom:`Últimos ${this.customDays} dias` };
      return m[this.activePeriod];
    },
    activeKpis() {
      if (this.activeTab === 'nfe') return [
        { label:'NF-e Emitidas',    value:'2.640',         trend:'+12%', trendUp:true,  icon:'description',  accent:'k-orange', prefix:'' },
        { label:'Faturamento NF-e', value:'R$ 1.474.200',  trend:'+10%', trendUp:true,  icon:'attach_money', accent:'k-blue',   prefix:'' },
        { label:'Autorizadas',      value:'2.533',         trend:'+11%', trendUp:true,  icon:'check_circle', accent:'k-green',  prefix:'' },
        { label:'Rejeitadas',       value:'107',           trend:'-3%',  trendUp:false, icon:'error',        accent:'k-red',    prefix:'' },
      ];
      if (this.activeTab === 'nfce') return [
        { label:'NFC-e Emitidas',   value:'9.420',         trend:'+8%',  trendUp:true,  icon:'receipt',      accent:'k-green',  prefix:'' },
        { label:'Faturamento PDV',  value:'R$ 421.800',    trend:'+6%',  trendUp:true,  icon:'attach_money', accent:'k-blue',   prefix:'' },
        { label:'Cancelamentos',    value:'41',            trend:'-2%',  trendUp:false, icon:'cancel',       accent:'k-red',    prefix:'' },
        { label:'Fila Offline',     value: String(this.offlineQueue),trend:'',trendUp:false,icon:'cloud_off',accent:'k-yellow',prefix:'' },
      ];
      return [
        { label:'Em Contingência',  value: String(this.contingencias.length), trend:'', trendUp:false, icon:'cloud_off', accent:'k-yellow', prefix:'' },
        { label:'Canceladas',       value: String(this.cancelamentos.length),  trend:'', trendUp:false, icon:'cancel',    accent:'k-red',    prefix:'' },
        { label:'CC-e Emitidas',    value: String(this.cartaCorrecao.length),  trend:'', trendUp:true,  icon:'edit_document', accent:'k-blue',prefix:'' },
        { label:'Inutilizadas',     value: String(this.inutilizacoes.length),  trend:'', trendUp:false, icon:'block',     accent:'k-orange', prefix:'' },
      ];
    },
    pdvTotal() {
      return this.pdvItems.reduce((s, i) => s + i.qty * parseFloat(i.preco.replace(',', '.')), 0);
    },
    syncPct() {
      const total = this.syncStats.ok + this.syncStats.pending + this.syncStats.error;
      return Math.round((this.syncStats.ok / total) * 100);
    },
    formTotal() {
      return this.form.itens.reduce((s, i) => {
        const v = parseFloat((i.vUnit || '0').replace(',', '.')) * (i.qty || 1);
        return s + v;
      }, 0).toFixed(2).replace('.', ',');
    },
    isLastStep() {
      const steps = this.modalType === 'nfe' ? this.nfeSteps : this.nfceSteps;
      return this.modalStep >= steps.length - 1;
    },
  },

  mounted() {
    setInterval(() => {
      if (this.retryCountdown > 0) this.retryCountdown--;
      else { this.retryCountdown = 30; this.lastSync = new Date().toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' }); }
    }, 1000);
  },

  methods: {
    statusClass(s) {
      return { 'Autorizada':'green','Cancelada':'red','Rejeitada':'red','Contingência':'orange','Pendente':'yellow','Inutilizada':'yellow' }[s] || 'muted';
    },
    tagClass(s) {
      return { 'Autorizada':'tag-green','Cancelada':'tag-red','Rejeitada':'tag-red','Contingência':'tag-orange','Pendente':'tag-yellow','Inutilizada':'tag-yellow' }[s] || '';
    },
    payIcon(p) {
      return { 'Dinheiro':'payments','Cartão Crédito':'credit_card','Cartão Débito':'credit_card','PIX':'qr_code' }[p] || 'payments';
    },
    toggleNfe(id) {
      if (this.selectedNfe.includes(id)) this.selectedNfe = this.selectedNfe.filter(x => x !== id);
      else this.selectedNfe.push(id);
    },
    toggleSelectAllNfe(e) {
      this.selectedNfe = e.target.checked ? this.filteredNfe.map(n => n.id) : [];
    },
    selectAllNfe() { this.selectedNfe = this.filteredNfe.map(n => n.id); },
    acaoLote(tipo) {
      const msg = { transmitir:`Transmitindo ${this.selectedNfe.length} notas...`, danfe:`Gerando ${this.selectedNfe.length} DANFEs...`, xml:`Baixando ${this.selectedNfe.length} XMLs...` };
      this.showToast({ transmitir:'send', danfe:'picture_as_pdf', xml:'download' }[tipo], msg[tipo]);
    },
    acao(nota, tipo) {
      const map = { danfe:'picture_as_pdf', xml:'download', transmitir:'send', cancelar:'cancel', cce:'edit_document', duplicar:'content_copy', reenviar:'refresh', contingencia:'cloud_off' };
      const msg = { danfe:'Gerando DANFE...', xml:'Baixando XML...', transmitir:'Transmitindo para SEFAZ...', cancelar:'Abrindo cancelamento...', cce:'Abrindo CC-e...', duplicar:'Duplicando nota...', reenviar:'Reenviando nota...', contingencia:'Ativando contingência...' };
      this.showToast(map[tipo], `${nota.numero}: ${msg[tipo]}`);
    },
    openModal(tipo) {
      this.modalType = tipo;
      this.modalStep = 0;
      this.form = { natureza:'', cfop:'', cnpjDest:'', nomeDest:'', fone:'', indIE:'9', uf:'SP', logradouro:'', municipio:'', itens:[], frete:'9', vFrete:'', cnpjTransp:'', nomeTransp:'', placa:'', ufTransp:'SP', volumes:1, infAdic:'', icms:'', pis:'', cofins:'', ipi:'' };
      this.showModal = true;
    },
    addFormItem() {
      this.form.itens.push({ nome:'', ncm:'', cfop:'5102', cst:'000', qty:1, vUnit:'0,00' });
    },
    calcItemTotal(item) {
      return (item.qty * parseFloat((item.vUnit || '0').replace(',', '.'))).toFixed(2).replace('.', ',');
    },
    emitirNota(modo) {
      const msgs = { transmitir:'NF-e transmitida e autorizada pelo SEFAZ!', rascunho:'Rascunho salvo com sucesso!', contingencia:'NF-e emitida em modo contingência!' };
      this.showModal = false;
      this.showToast(modo === 'transmitir' ? 'check_circle' : modo === 'rascunho' ? 'save' : 'cloud_off', msgs[modo]);
    },
    addPdvItem() {
      if (!this.pdvNewItem) return;
      this.pdvItems.push({ nome: this.pdvNewItem, qty: this.pdvNewQty || 1, preco: (rnd(500, 10000) / 100).toFixed(2).replace('.', ',') });
      this.pdvNewItem = ''; this.pdvNewQty = 1;
    },
    removePdvItem(i) { this.pdvItems.splice(i, 1); },
    emitirNfce() {
      this.showToast('check_circle', `NFC-e emitida! Valor: R$ ${this.pdvTotal.toFixed(2).replace('.',',')} · Imprimindo...`);
      this.pdvItems = []; this.pdvCpf = '';
    },
    syncOffline() {
      this.offlineItems.forEach(oi => { oi.syncing = true; setTimeout(() => { oi.syncing = false; }, 1500); });
      setTimeout(() => { this.offlineItems = []; this.offlineQueue = 0; this.syncStats.ok += 2; this.showToast('sync','Sincronização concluída! 2 NFC-e transmitidas.'); }, 2000);
    },
    retryOffline(oi) { oi.tentativas++; oi.syncing = true; setTimeout(() => { oi.syncing = false; }, 1500); },
    regularizarTodas() { this.showToast('send','Transmitindo todas as notas em contingência...'); },
    showQrModal(cupom) { this.qrData = cupom; this.showQr = true; },
    showToast(icon, msg) {
      this.toastIcon = icon; this.toastMsg = msg;
      this.toastVisible = true;
      setTimeout(() => { this.toastVisible = false; }, 3200);
    },
  },
};
</script>

<style scoped>
/* ══════════════════════════════════════════════
   DESIGN TOKENS — Padrão unificado
══════════════════════════════════════════════ */
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

/* ══ TOPBAR ══ */
.main-area { flex:1; min-width:0; display:flex; flex-direction:column; }
.topbar {
  position:sticky; top:0; z-index:50;
  background:var(--bg-card); border-bottom:1px solid var(--border);
  padding:12px 24px; display:flex; align-items:center; gap:12px;
  box-shadow:0 1px 8px rgba(0,0,0,.04); flex-wrap:wrap;
}
.topbar-brand { display:flex; align-items:center; gap:10px; }
.brand-icon {
  width:34px; height:34px;
  background:linear-gradient(135deg,var(--accent),#e65d26);
  border-radius:9px; display:flex; align-items:center; justify-content:center; flex-shrink:0;
}
.topbar-title { font-weight:800; font-size:16px; letter-spacing:-.3px; }
.topbar-sub   { font-size:10.5px; color:var(--muted); margin-top:1px; }
.topbar-right { margin-left:auto; display:flex; align-items:center; gap:9px; flex-wrap:wrap; }

.sefaz-pill {
  display:flex; align-items:center; gap:6px;
  font-size:11.5px; font-weight:700; padding:5px 12px; border-radius:20px;
}
.sefaz-pill.online  { background:var(--green2); color:var(--green); }
.sefaz-pill.offline { background:var(--red2);   color:var(--red);   }
.sefaz-dot { width:7px; height:7px; border-radius:50%; background:currentColor; animation:pulse 1.5s infinite; }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
.offline-queue-pill {
  display:flex; align-items:center; gap:5px;
  font-size:11px; font-weight:700; padding:4px 10px; border-radius:20px;
  background:var(--yellow2); color:var(--yellow);
}

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

.user-avatar {
  width:31px; height:31px; border-radius:50%;
  background:linear-gradient(135deg,var(--accent),#ff4d4d);
  display:flex; align-items:center; justify-content:center;
  font-weight:700; font-size:11px; color:#fff; flex-shrink:0;
}

/* ══ CONTENT ══ */
.content { padding:22px 24px; flex:1; }

/* ══ FILTER BAR ══ */
.filter-bar {
  display:flex; align-items:center; justify-content:space-between;
  background:var(--bg-card); border:1px solid var(--border);
  border-radius:var(--radius); padding:12px 18px;
  margin-bottom:14px; gap:12px; box-shadow:var(--shadow); flex-wrap:wrap;
}
.filter-left  { display:flex; align-items:center; gap:10px; flex-wrap:wrap; flex:1; }
.filter-right { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
.filter-label { font-size:12px; color:var(--text2); font-weight:500; white-space:nowrap; }
.filter-sub   { font-size:11.5px; color:var(--muted); white-space:nowrap; }
.filter-sep { width:1px; height:20px; background:var(--border2); }

.search-box-main {
  display:flex; align-items:center; gap:6px;
  background:var(--bg-el); border:1px solid var(--border2);
  border-radius:var(--radius-s); padding:6px 12px; flex:1; min-width:280px;
  position:relative;
}
.search-main-input {
  border:none; background:transparent; outline:none;
  font-family:inherit; font-size:12.5px; color:var(--text1); flex:1;
}
.search-clear { color:var(--muted); cursor:pointer; font-size:16px !important; }
.search-clear:hover { color:var(--text1); }

.period-tabs {
  display:flex; background:var(--bg-el);
  border:1px solid var(--border); border-radius:var(--radius-s); padding:3px; gap:2px;
}
.ptab {
  padding:4px 10px; border-radius:5px; font-size:11.5px; font-weight:500;
  cursor:pointer; color:var(--muted); transition:all .15s;
  background:transparent; border:none; font-family:inherit; white-space:nowrap;
}
.ptab.active { background:var(--accent); color:#fff; font-weight:700; }
.ptab:hover:not(.active) { background:var(--bg-el2); color:var(--text1); }
.custom-days { display:flex; align-items:center; gap:7px; background:var(--bg-el); border:1px solid var(--border2); border-radius:var(--radius-s); padding:5px 10px; }
.days-input { width:50px; border:none; background:transparent; font-family:inherit; font-size:13px; font-weight:700; color:var(--accent); text-align:center; outline:none; }
.select-wrap { position:relative; }
.sel-input {
  border:1px solid var(--border2); border-radius:var(--radius-s);
  background:var(--bg-card); padding:5px 10px;
  font-family:inherit; font-size:12px; color:var(--text2); outline:none; cursor:pointer;
}

/* ══ MAIN TABS ══ */
.main-tabs {
  display:flex; gap:4px; margin-bottom:16px;
  background:var(--bg-card); border:1px solid var(--border);
  border-radius:var(--radius); padding:5px; box-shadow:var(--shadow); flex-wrap:wrap;
}
.main-tab {
  display:flex; align-items:center; gap:7px;
  padding:8px 16px; border-radius:var(--radius-s);
  font-size:12.5px; font-weight:500; cursor:pointer;
  color:var(--muted); transition:all .15s;
  background:transparent; border:none; font-family:inherit; white-space:nowrap;
}
.main-tab:hover:not(.active) { background:var(--bg-el); color:var(--text1); }
.main-tab.active { background:var(--accent); color:#fff; font-weight:700; }
.tab-badge { font-size:9px; font-weight:800; padding:2px 6px; border-radius:10px; color:#fff; }
.badge-yellow { background:var(--yellow); }
.badge-orange { background:var(--accent); }
.badge-red    { background:var(--red);    }

/* ══ KPI GRID ══ */
.kpi-grid {
  display:grid; grid-template-columns:repeat(4,1fr);
  gap:13px; margin-bottom:14px;
}
.kpi-card {
  background:var(--bg-card); border:1px solid var(--border);
  border-radius:var(--radius); padding:16px 18px;
  position:relative; overflow:hidden; transition:all .2s; box-shadow:var(--shadow);
}
.kpi-card:hover { border-color:var(--border2); transform:translateY(-1px); }
.kpi-card::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; }
.k-orange::before { background:linear-gradient(90deg,var(--accent),transparent); }
.k-green::before  { background:linear-gradient(90deg,var(--green),transparent);  }
.k-blue::before   { background:linear-gradient(90deg,var(--blue),transparent);   }
.k-red::before    { background:linear-gradient(90deg,var(--red),transparent);    }
.k-yellow::before { background:linear-gradient(90deg,var(--yellow),transparent); }
.kpi-label  { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.8px; color:var(--muted); display:flex; align-items:center; gap:4px; margin-bottom:8px; }
.kpi-value  { font-size:22px; font-weight:800; letter-spacing:-.8px; color:var(--text1); line-height:1; margin-bottom:8px; }
.kpi-prefix { font-size:12px; font-weight:600; }
.kpi-footer { display:flex; align-items:center; gap:6px; font-size:11px; }
.kpi-delta  { font-weight:700; display:flex; align-items:center; gap:2px; }
.kpi-delta.up   { color:var(--green); }
.kpi-delta.down { color:var(--red);   }
.kpi-sub { color:var(--muted); }
.kpi-bg-icon { position:absolute; bottom:4px; right:10px; font-size:48px; opacity:.05; color:var(--text1); pointer-events:none; line-height:1; }

/* ══ GRID ══ */
.grid-2-1 { display:grid; grid-template-columns:2fr 1fr; gap:14px; margin-bottom:14px; }
.grid-2   { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:14px; }

/* ══ CARD ══ */
.card { background:var(--bg-card); border:1px solid var(--border); border-radius:var(--radius); overflow:hidden; box-shadow:var(--shadow); }
.card-head {
  display:flex; align-items:center; gap:10px;
  padding:13px 18px; border-bottom:1px solid var(--border); flex-wrap:wrap;
}
.card-title { font-size:13px; font-weight:700; letter-spacing:-.2px; }
.card-sub   { font-size:10.5px; color:var(--muted); margin-top:1px; }
.card-actions { margin-left:auto; display:flex; gap:6px; align-items:center; flex-wrap:wrap; }
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
.cell-name { font-size:12.5px; font-weight:600; color:var(--text1); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:170px; }
.cell-sub  { font-size:10.5px; color:var(--muted); margin-top:1px; }
.mono-bold { font-family:'Courier New',monospace; font-weight:700; }
.nat-op    { font-size:11px; color:var(--text2); }

/* ══ STATUS ══ */
.status-cell { display:flex; align-items:center; gap:5px; }
.status-dot  { width:6px; height:6px; border-radius:50%; flex-shrink:0; }
.dot-green  { background:var(--green); }
.dot-red    { background:var(--red);   }
.dot-orange { background:var(--accent);}
.dot-yellow { background:var(--yellow);}
.dot-muted  { background:var(--muted); }

/* ══ TAG ══ */
.tag-custom { font-size:10.5px; font-weight:700; padding:2px 8px; border-radius:12px; white-space:nowrap; }
.tag-green  { background:var(--green2);  color:var(--green);  }
.tag-orange { background:var(--accent2); color:var(--accent); }
.tag-yellow { background:var(--yellow2); color:var(--yellow); }
.tag-red    { background:var(--red2);    color:var(--red);    }
.tag-blue   { background:var(--blue2);   color:var(--blue);   }

/* ══ BADGE COUNT ══ */
.badge-count { font-size:11px; font-weight:800; padding:2px 8px; border-radius:20px; color:#fff; }
.badge-count.red { background:var(--red); }

/* ══ SELECTION BAR ══ */
.selection-bar {
  display:flex; align-items:center; gap:10px;
  background:var(--accent2); border-bottom:1px solid var(--accent);
  padding:9px 18px; font-size:12.5px; flex-wrap:wrap;
}
.sel-actions { display:flex; gap:6px; flex-wrap:wrap; }

/* ══ ROW ACTIONS ══ */
.row-actions { display:flex; gap:4px; }
.icon-btn {
  width:26px; height:26px; border-radius:6px;
  display:flex; align-items:center; justify-content:center;
  border:1px solid var(--border); background:var(--bg-card);
  color:var(--text2); cursor:pointer; transition:all .15s;
}
.icon-btn:hover:not(:disabled) { background:var(--bg-el2); color:var(--accent); border-color:var(--accent); }
.icon-btn:disabled { opacity:.35; cursor:not-allowed; }

/* ══ DROPDOWN ══ */
.dropdown { position:relative; }
.dropdown-menu {
  position:absolute; right:0; top:100%; z-index:200; margin-top:4px;
  background:var(--bg-card); border:1px solid var(--border2);
  border-radius:var(--radius-s); box-shadow:0 8px 24px rgba(0,0,0,.12);
  min-width:190px; overflow:hidden;
}
.dm-item {
  display:flex; align-items:center; gap:8px;
  width:100%; padding:9px 14px; font-size:12px; font-weight:500;
  font-family:inherit; border:none; background:transparent;
  color:var(--text1); cursor:pointer; transition:background .1s; text-align:left;
}
.dm-item:hover:not(:disabled) { background:var(--bg-el); color:var(--accent); }
.dm-item:disabled { opacity:.4; cursor:not-allowed; }

/* ══ PAGINATION ══ */
.pagination { display:flex; align-items:center; justify-content:space-between; padding:10px 18px; border-top:1px solid var(--border); }
.pag-info { font-size:11.5px; color:var(--muted); }
.pag-btns { display:flex; align-items:center; gap:8px; }
.pag-btn { width:28px; height:28px; border-radius:6px; border:1px solid var(--border2); background:var(--bg-card); display:flex; align-items:center; justify-content:center; color:var(--text2); cursor:pointer; transition:all .15s; }
.pag-btn:hover:not(:disabled) { background:var(--accent2); color:var(--accent); border-color:var(--accent); }
.pag-btn:disabled { opacity:.4; cursor:not-allowed; }
.pag-num { font-size:12px; font-weight:600; color:var(--text2); }

/* ══ RIGHT PANEL ══ */
.right-panel { display:flex; flex-direction:column; gap:14px; }

/* ══ QUICK ACTIONS ══ */
.quick-actions { padding:10px 12px; display:flex; flex-direction:column; gap:4px; }
.qa-btn {
  display:flex; align-items:center; gap:10px;
  padding:9px 12px; border-radius:var(--radius-s);
  border:1px solid var(--border); background:var(--bg-card);
  cursor:pointer; transition:all .15s; font-family:inherit; text-align:left;
}
.qa-btn:hover { background:var(--bg-el); border-color:var(--border2); }
.qa-btn.qa-primary { border-color:var(--accent); background:var(--accent2); }
.qa-icon { width:32px; height:32px; border-radius:8px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.qa-label { font-size:12.5px; font-weight:600; color:var(--text1); }
.qa-sub   { font-size:10.5px; color:var(--muted); margin-top:1px; }

/* ══ TRANSMISSÕES ══ */
.transmission-list { padding:6px 0; }
.trans-item { display:flex; align-items:center; gap:10px; padding:9px 18px; border-bottom:1px solid var(--border); }
.trans-item:last-child { border-bottom:none; }
.trans-icon { width:26px; height:26px; border-radius:7px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.trans-info { flex:1; }
.trans-title { font-size:12px; font-weight:600; }
.trans-sub   { font-size:10.5px; color:var(--muted); margin-top:1px; }
.trans-cod   { font-size:11px; font-weight:700; font-family:'Courier New',monospace; background:var(--red2); color:var(--red); padding:2px 7px; border-radius:5px; }

/* ══ INUTILIZAÇÕES ══ */
.inut-list { padding:6px 0; }
.inut-item { display:flex; align-items:center; gap:10px; padding:9px 18px; border-bottom:1px solid var(--border); }
.inut-item:last-child { border-bottom:none; }
.inut-faixa { font-family:'Courier New',monospace; font-size:11px; font-weight:700; background:var(--yellow2); color:var(--yellow); padding:3px 8px; border-radius:5px; flex-shrink:0; }
.inut-info { flex:1; }
.inut-date { font-size:10.5px; color:var(--muted); flex-shrink:0; }

/* ══ PAY BADGE ══ */
.pay-badge { display:flex; align-items:center; gap:4px; font-size:11px; font-weight:600; padding:3px 8px; border-radius:6px; background:var(--bg-el); width:fit-content; }

/* ══ OFFLINE / SYNC ══ */
.offline-list { padding:6px 0; }
.offline-item { display:flex; align-items:center; gap:10px; padding:9px 18px; border-bottom:1px solid var(--border); }
.offline-item:last-child { border-bottom:none; }
.offline-status { flex-shrink:0; }
.offline-info { flex:1; }
.offline-title { font-size:12.5px; font-weight:600; }
.offline-sub   { font-size:10.5px; color:var(--muted); margin-top:1px; }
.offline-footer { display:flex; align-items:center; gap:6px; padding:10px 18px; border-top:1px solid var(--border); font-size:11px; color:var(--text2); }
.spinner-sm { width:18px; height:18px; border:2px solid var(--border2); border-top-color:var(--accent); border-radius:50%; animation:spin .7s linear infinite; }
@keyframes spin { to { transform:rotate(360deg); } }

.sync-stats { display:flex; justify-content:space-around; padding:14px 18px; border-bottom:1px solid var(--border); }
.sync-stat { text-align:center; }
.ss-val { font-size:20px; font-weight:800; letter-spacing:-.4px; }
.ss-val.green  { color:var(--green);  }
.ss-val.accent { color:var(--accent); }
.ss-val.red    { color:var(--red);    }
.ss-lbl { font-size:10px; color:var(--muted); margin-top:2px; }
.sync-bar-wrap { margin:12px 18px 6px; height:6px; background:var(--bg-el2); border-radius:3px; overflow:hidden; }
.sync-bar-fill { height:100%; background:linear-gradient(90deg,var(--green),var(--accent)); border-radius:3px; transition:width .5s; }
.sync-info { text-align:center; font-size:11.5px; color:var(--muted); padding-bottom:14px; }

/* ══ PDV ══ */
.pdv-card { }
.pdv-panel { padding:14px 18px; display:flex; flex-direction:column; gap:12px; }
.pdv-display { text-align:center; background:linear-gradient(135deg,var(--accent),#e65d26); border-radius:var(--radius-s); padding:16px; color:#fff; }
.pdv-total-label { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.8px; opacity:.8; }
.pdv-total { font-size:28px; font-weight:800; letter-spacing:-1px; }
.pdv-items-count { font-size:11px; opacity:.7; margin-top:2px; }
.pdv-items { background:var(--bg-el); border-radius:var(--radius-s); min-height:60px; max-height:150px; overflow-y:auto; }
.pdv-item { display:flex; align-items:center; gap:8px; padding:8px 10px; border-bottom:1px solid var(--border); }
.pdv-item:last-child { border-bottom:none; }
.pdv-item-info { flex:1; }
.pdv-item-name { font-size:12px; font-weight:600; }
.pdv-item-sub  { font-size:10px; color:var(--muted); }
.pdv-item-total { font-family:'Courier New',monospace; font-weight:700; font-size:12px; }
.pdv-empty { padding:16px; text-align:center; }
.pdv-form { }
.pdv-input-row { display:flex; gap:6px; align-items:center; }
.pdv-input { border:1px solid var(--border2); border-radius:var(--radius-s); padding:7px 10px; font-family:inherit; font-size:12px; background:var(--bg-card); outline:none; flex:1; }
.pdv-qty-input { border:1px solid var(--border2); border-radius:var(--radius-s); padding:7px 8px; font-family:inherit; font-size:12px; background:var(--bg-card); outline:none; width:52px; text-align:center; }
.pdv-payment { }
.pdv-pay-label { font-size:10.5px; font-weight:700; text-transform:uppercase; letter-spacing:.6px; color:var(--muted); margin-bottom:7px; }
.pay-options { display:flex; gap:5px; flex-wrap:wrap; }
.pay-opt {
  display:flex; align-items:center; gap:5px;
  padding:6px 10px; border-radius:var(--radius-s);
  border:1px solid var(--border); background:var(--bg-el);
  cursor:pointer; font-size:11px; font-weight:500; font-family:inherit;
  transition:all .15s; color:var(--text2);
}
.pay-opt:hover { border-color:var(--border2); }
.pay-opt.pay-active { border-color:var(--accent); background:var(--accent2); color:var(--accent); font-weight:700; }
.pdv-cpf-row { }
.pdv-footer-btns { display:flex; gap:6px; }

.btn-full { width:100%; display:flex; align-items:center; justify-content:center; gap:8px; padding:11px; border-radius:var(--radius-s); font-family:inherit; font-size:13px; font-weight:700; cursor:pointer; border:none; transition:all .15s; }
.emit-btn { background:linear-gradient(135deg,var(--accent),#e65d26); color:#fff; box-shadow:0 4px 12px rgba(255,128,73,.3); }
.emit-btn:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 6px 16px rgba(255,128,73,.4); }
.emit-btn:disabled { opacity:.4; cursor:not-allowed; }

/* ══ CONTINGÊNCIA GUIDE ══ */
.cont-guide { padding:14px 18px; display:flex; flex-direction:column; gap:12px; }
.guide-step { display:flex; align-items:flex-start; gap:12px; }
.guide-num { width:24px; height:24px; border-radius:50%; background:var(--accent); color:#fff; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:800; flex-shrink:0; }
.guide-title { font-size:12.5px; font-weight:700; color:var(--text1); }
.guide-desc  { font-size:11px; color:var(--text2); margin-top:2px; }

.alerta-prazo-card { display:flex; align-items:flex-start; gap:12px; background:linear-gradient(135deg,#fff7ed,#ffedd5); border:1px solid #fed7aa; border-radius:var(--radius); padding:14px 16px; }
.ap-icon { color:var(--accent); flex-shrink:0; margin-top:2px; }
.ap-title { font-size:13px; font-weight:700; color:var(--acc-h); margin-bottom:4px; }
.ap-sub   { font-size:12px; color:var(--text2); line-height:1.5; }
.ap-sub strong { color:var(--acc-h); }

/* ══ CC-e LIST ══ */
.cce-list { padding:8px 14px; display:flex; flex-direction:column; gap:10px; }
.cce-item { border:1px solid var(--border); border-radius:var(--radius-s); padding:12px 14px; }
.cce-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:6px; }
.cce-nfe    { font-size:12.5px; font-weight:700; }
.cce-campo  { font-size:11px; color:var(--text2); margin-bottom:5px; }
.cce-campo-label { color:var(--muted); font-weight:600; }
.cce-texto  { font-size:12px; color:var(--text1); background:var(--bg-el); border-radius:5px; padding:6px 10px; line-height:1.5; margin-bottom:8px; }
.cce-footer { display:flex; align-items:center; justify-content:space-between; }

/* ══ MODAL ══ */
.modal-overlay {
  position:fixed; inset:0; z-index:1000;
  background:rgba(0,0,0,.45); display:flex; align-items:center; justify-content:center;
  backdrop-filter:blur(3px);
}
.modal-box {
  background:var(--bg-card); border-radius:16px;
  width:min(92vw,820px); max-height:90vh;
  display:flex; flex-direction:column;
  box-shadow:0 24px 60px rgba(0,0,0,.2);
  overflow:hidden;
}
.modal-nfce { width:min(92vw,580px); }
.modal-header {
  display:flex; align-items:center; justify-content:space-between;
  padding:16px 22px; border-bottom:1px solid var(--border);
}
.modal-title-row { display:flex; align-items:center; gap:10px; }
.modal-title { font-size:15px; font-weight:800; letter-spacing:-.3px; }
.modal-sub   { font-size:11px; color:var(--muted); margin-top:2px; }
.modal-close { display:flex; align-items:center; justify-content:center; width:30px; height:30px; border-radius:7px; border:1px solid var(--border); background:var(--bg-el); color:var(--text2); cursor:pointer; transition:all .15s; }
.modal-close:hover { background:var(--bg-el2); color:var(--red); }
.modal-body { overflow-y:auto; flex:1; padding:20px 22px; display:flex; flex-direction:column; gap:16px; }
.modal-footer { padding:14px 22px; border-top:1px solid var(--border); display:flex; align-items:center; gap:8px; }
.modal-step-info { font-size:11.5px; color:var(--muted); }

/* ══ FORM STEPS ══ */
.form-steps { display:flex; gap:0; margin-bottom:4px; }
.form-step {
  display:flex; align-items:center; gap:7px;
  font-size:11.5px; font-weight:600; color:var(--muted);
  flex:1;
}
.form-step::after { content:''; flex:1; height:1px; background:var(--border2); margin:0 8px; }
.form-step:last-child::after { display:none; }
.form-step.active { color:var(--accent); }
.form-step.done   { color:var(--green);  }
.step-circle {
  width:22px; height:22px; border-radius:50%;
  display:flex; align-items:center; justify-content:center;
  font-size:10px; font-weight:800; flex-shrink:0;
  border:2px solid currentColor; background:transparent; transition:all .2s;
}
.form-step.active .step-circle { background:var(--accent); color:#fff; border-color:var(--accent); }
.form-step.done   .step-circle { background:var(--green);  color:#fff; border-color:var(--green);  }
.step-label { white-space:nowrap; }

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

/* ══ PROD TABLE ══ */
.prod-table-header { display:flex; align-items:center; justify-content:space-between; }
.prod-table { font-size:11.5px; }
.td-input { border:1px solid var(--border2); border-radius:5px; padding:4px 7px; font-family:inherit; font-size:11.5px; width:100%; background:var(--bg-card); outline:none; box-sizing:border-box; }
.td-input:focus { border-color:var(--accent); }

/* ══ TRIBUTAÇÃO ══ */
.tribut-section { background:var(--bg-el); border-radius:var(--radius-s); padding:14px; }
.trib-label { font-size:10.5px; font-weight:700; text-transform:uppercase; letter-spacing:.6px; color:var(--muted); margin-bottom:10px; }
.trib-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; }
.trib-item { display:flex; flex-direction:column; gap:4px; }

/* ══ REVIEW ══ */
.review-panel { display:flex; flex-direction:column; gap:16px; }
.review-header { display:flex; align-items:center; gap:12px; }
.review-title  { font-size:15px; font-weight:800; }
.review-sub    { font-size:12px; color:var(--muted); margin-top:2px; }
.review-grid   { display:grid; grid-template-columns:1fr 1fr; gap:10px; background:var(--bg-el); border-radius:var(--radius-s); padding:14px; }
.review-item   { display:flex; flex-direction:column; gap:3px; }
.review-label  { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.5px; color:var(--muted); }
.review-val    { font-size:13px; font-weight:700; color:var(--text1); }
.review-val.accent { color:var(--accent); }
.emit-options  { display:flex; flex-direction:column; gap:8px; }
.emit-opt-btn  { display:flex; align-items:center; gap:10px; padding:12px 16px; border-radius:var(--radius-s); font-family:inherit; font-size:13px; font-weight:700; cursor:pointer; transition:all .15s; border:1px solid var(--border); }
.primary-btn   { background:linear-gradient(135deg,var(--accent),#e65d26); color:#fff; border-color:transparent; }
.primary-btn:hover { transform:translateY(-1px); box-shadow:0 4px 12px rgba(255,128,73,.3); }
.secondary-btn { background:var(--blue2); color:var(--blue); border-color:var(--blue); }
.secondary-btn:hover { background:var(--blue); color:#fff; }
.warning-btn   { background:var(--yellow2); color:var(--yellow); border-color:var(--yellow); }
.warning-btn:hover { background:var(--yellow); color:#fff; }

/* ══ QR MODAL ══ */
.qr-modal { background:var(--bg-card); border-radius:16px; width:min(90vw,380px); box-shadow:0 24px 60px rgba(0,0,0,.2); overflow:hidden; }
.qr-body { padding:20px 22px; display:flex; flex-direction:column; gap:14px; align-items:center; }
.qr-placeholder { width:160px; height:160px; border:2px dashed var(--border2); border-radius:var(--radius-s); display:flex; flex-direction:column; align-items:center; justify-content:center; }
.qr-info { width:100%; background:var(--bg-el); border-radius:var(--radius-s); padding:12px; display:flex; flex-direction:column; gap:6px; }
.qr-row  { display:flex; justify-content:space-between; font-size:12px; }
.qr-row span { color:var(--muted); }
.qr-actions { display:flex; gap:8px; }

/* ══ EMPTY STATE ══ */
.empty-state { padding:28px; text-align:center; display:flex; flex-direction:column; align-items:center; gap:6px; }
.es-title { font-size:13px; font-weight:600; color:var(--text2); }
.es-sub   { font-size:11px; color:var(--muted); }

/* ══ TOAST ══ */
.toast {
  position:fixed; bottom:24px; right:24px; z-index:9999;
  display:flex; align-items:center; gap:8px;
  background:var(--text1); color:#fff;
  padding:11px 18px; border-radius:var(--radius);
  font-size:13px; font-weight:500;
  box-shadow:0 8px 24px rgba(0,0,0,.15);
  transform:translateY(20px); opacity:0;
  transition:all .3s cubic-bezier(.34,1.56,.64,1);
  pointer-events:none;
}
.toast.toast-show { transform:translateY(0); opacity:1; }

/* ══ FOOTER ══ */
.dash-footer {
  padding:14px 24px; border-top:1px solid var(--border);
  display:flex; justify-content:space-between;
  font-size:11px; color:var(--muted); background:var(--bg-card);
}

/* ══ RESPONSIVE ══ */
@media (max-width:1280px) {
  .kpi-grid   { grid-template-columns:repeat(2,1fr); }
  .grid-2-1   { grid-template-columns:1fr; }
  .trib-grid  { grid-template-columns:repeat(2,1fr); }
}
@media (max-width:900px) {
  .grid-2     { grid-template-columns:1fr; }
  .form-row-2 { grid-template-columns:1fr; }
  .form-row-3 { grid-template-columns:1fr 1fr; }
  .main-tabs  { flex-wrap:wrap; }
  .topbar     { flex-wrap:wrap; gap:8px; }
}
@media (max-width:640px) {
  .kpi-grid   { grid-template-columns:1fr; }
  .content    { padding:14px; }
  .filter-bar { flex-direction:column; align-items:flex-start; }
  .form-row-3 { grid-template-columns:1fr; }
  .trib-grid  { grid-template-columns:1fr 1fr; }
  .review-grid{ grid-template-columns:1fr; }
}
</style>