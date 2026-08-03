<template>
  <div class="dashboard-root">
    <div class="main-area">

      <!-- ═══════════════════ TOPBAR ═══════════════════ -->
      <div class="topbar">
        <div class="topbar-brand">
          <div class="brand-icon">
            <span class="material-symbols-outlined" style="font-size:17px;color:#fff">verified_user</span>
          </div>
          <div>
            <div class="topbar-title">Certificado Digital</div>
            <div class="topbar-sub">ICP-Brasil · A1 / A3 · Integração SEFAZ</div>
          </div>
        </div>
        <div class="topbar-right">
          <div class="cert-pill" :class="certStatus.cls">
            <span class="sefaz-dot"></span>
            {{ certStatus.label }}
          </div>
          <div class="sefaz-pill" :class="sefazOnline ? 'online' : 'offline'">
            <span class="sefaz-dot"></span>
            SEFAZ {{ sefazOnline ? 'Online' : 'Offline' }}
          </div>
          <button class="tbtn primary" @click="openModal('upload')">
            <span class="material-symbols-outlined" style="font-size:14px">upload_file</span>
            Instalar Certificado
          </button>
          <button class="tbtn" @click="testarConexao" :disabled="testando">
            <span class="material-symbols-outlined" style="font-size:14px">{{ testando ? 'hourglass_empty' : 'wifi_tethering' }}</span>
            {{ testando ? 'Testando...' : 'Testar Conexão' }}
          </button>
          <div class="user-avatar">CF</div>
        </div>
      </div>

      <div class="content">

        <!-- ═══════════════════ ALERTA VENCIMENTO ═══════════════════ -->
        <div class="alert-banner" :class="alertBanner.cls" v-if="alertBanner.visible">
          <span class="material-symbols-outlined" style="font-size:18px">{{ alertBanner.icon }}</span>
          <div class="alert-text">
            <strong>{{ alertBanner.title }}</strong> — {{ alertBanner.msg }}
          </div>
          <button class="tbtn primary" style="font-size:11px;padding:5px 11px" @click="openModal('renovar')">
            <span class="material-symbols-outlined" style="font-size:13px">autorenew</span>
            Renovar agora
          </button>
          <button class="alert-close" @click="alertBanner.visible=false">
            <span class="material-symbols-outlined" style="font-size:16px">close</span>
          </button>
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
          <div v-for="kpi in kpis" :key="kpi.label" class="kpi-card" :class="kpi.accent">
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
              <span class="kpi-sub">{{ kpi.sub }}</span>
            </div>
            <span class="material-symbols-outlined kpi-bg-icon">{{ kpi.icon }}</span>
          </div>
        </div>

        <!-- ═══════════════════ ABA CERTIFICADO A1 ═══════════════════ -->
        <div v-if="activeTab === 'a1'">
          <div class="grid-2-1">

            <!-- CARD PRINCIPAL A1 -->
            <div class="card">
              <div class="card-head">
                <div class="card-icon c-orange">
                  <span class="material-symbols-outlined">shield_lock</span>
                </div>
                <div>
                  <div class="card-title">Certificado A1 — Arquivo Digital</div>
                  <div class="card-sub">Armazenado localmente · Formato .pfx / .p12</div>
                </div>
                <div class="card-actions">
                  <button class="tbtn" @click="openModal('historico')">
                    <span class="material-symbols-outlined" style="font-size:13px">history</span>Histórico
                  </button>
                  <button class="tbtn primary" @click="openModal('upload')">
                    <span class="material-symbols-outlined" style="font-size:13px">upload_file</span>Novo A1
                  </button>
                </div>
              </div>

              <!-- CERTIFICADO ATIVO -->
              <div class="cert-active-panel">
                <div class="cert-visual">
                  <div class="cert-shield" :class="certShieldClass">
                    <span class="material-symbols-outlined">
                      security
                    </span>
                  </div>
                  <div class="cert-meta">
                    <div class="cert-name">{{ certAtivo.razaoSocial }}</div>
                    <div class="cert-cnpj">CNPJ {{ certAtivo.cnpj }}</div>
                    <div class="cert-tags">
                      <span class="tag-custom tag-blue">A1</span>
                      <span class="tag-custom tag-green" v-if="certAtivo.status === 'Válido'">{{ certAtivo.status }}</span>
                      <span class="tag-custom tag-yellow" v-else-if="certAtivo.status === 'Expirando'">{{ certAtivo.status }}</span>
                      <span class="tag-custom tag-red" v-else>{{ certAtivo.status }}</span>
                      <span class="tag-custom tag-orange">ICP-Brasil</span>
                    </div>
                  </div>
                </div>

                <div class="cert-info-grid">
                  <div class="cert-info-item">
                    <div class="ci-label">Emitente (AC)</div>
                    <div class="ci-val">{{ certAtivo.emitente }}</div>
                  </div>
                  <div class="cert-info-item">
                    <div class="ci-label">Número de Série</div>
                    <div class="ci-val mono-bold">{{ certAtivo.serial }}</div>
                  </div>
                  <div class="cert-info-item">
                    <div class="ci-label">Emitido em</div>
                    <div class="ci-val">{{ certAtivo.emitidoEm }}</div>
                  </div>
                  <div class="cert-info-item">
                    <div class="ci-label">Válido até</div>
                    <div class="ci-val" :class="{ 'text-red': certAtivo.diasRestantes <= 30, 'text-yellow': certAtivo.diasRestantes > 30 && certAtivo.diasRestantes <= 60 }">
                      {{ certAtivo.validoAte }}
                      <span class="dias-badge" :class="diasBadgeClass">{{ certAtivo.diasRestantes }}d restantes</span>
                    </div>
                  </div>
                  <div class="cert-info-item">
                    <div class="ci-label">Algoritmo</div>
                    <div class="ci-val mono-bold">{{ certAtivo.algoritmo }}</div>
                  </div>
                  <div class="cert-info-item">
                    <div class="ci-label">Tamanho da Chave</div>
                    <div class="ci-val mono-bold">{{ certAtivo.tamChave }}</div>
                  </div>
                </div>

                <!-- BARRA DE VALIDADE -->
                <div class="validade-bar-wrap">
                  <div class="validade-bar-header">
                    <span class="ci-label">Progresso de Validade</span>
                    <span class="ci-val" style="font-size:11px">{{ validadePct }}% utilizado</span>
                  </div>
                  <div class="validade-bar-track">
                    <div class="validade-bar-fill" :class="validadeBarClass" :style="{ width: validadePct + '%' }"></div>
                  </div>
                  <div class="validade-bar-labels">
                    <span>{{ certAtivo.emitidoEm }}</span>
                    <span>{{ certAtivo.validoAte }}</span>
                  </div>
                </div>

                <div class="cert-actions-row">
                  <button class="icon-action-btn c-blue-btn" @click="openModal('senha')">
                    <span class="material-symbols-outlined" style="font-size:16px">key</span>
                    Alterar Senha
                  </button>
                  <button class="icon-action-btn c-green-btn" @click="testarConexao">
                    <span class="material-symbols-outlined" style="font-size:16px">wifi_tethering</span>
                    Testar SEFAZ
                  </button>
                  <button class="icon-action-btn c-orange-btn" @click="openModal('renovar')">
                    <span class="material-symbols-outlined" style="font-size:16px">autorenew</span>
                    Renovar
                  </button>
                  <button class="icon-action-btn c-red-btn" @click="openModal('revogar')">
                    <span class="material-symbols-outlined" style="font-size:16px">delete_forever</span>
                    Revogar
                  </button>
                </div>
              </div>
            </div>

            <!-- PAINEL DIREITO A1 -->
            <div class="right-panel">

              <!-- STATUS SEFAZ -->
              <div class="card">
                <div class="card-head">
                  <div class="card-icon c-blue"><span class="material-symbols-outlined">cell_tower</span></div>
                  <div><div class="card-title">Conexão SEFAZ</div><div class="card-sub">Último teste: {{ ultimoTeste }}</div></div>
                  <div class="card-actions">
                    <div class="spinner-sm" v-if="testando"></div>
                  </div>
                </div>
                <div class="sefaz-status-list">
                  <div v-for="sv in sefazServicos" :key="sv.nome" class="sefaz-row">
                    <div class="sefaz-row-icon" :class="sv.ok ? 'c-green' : 'c-red'">
                      <span class="material-symbols-outlined" style="font-size:14px">{{ sv.ok ? 'check_circle' : 'error' }}</span>
                    </div>
                    <div class="sefaz-row-info">
                      <div class="sefaz-row-title">{{ sv.nome }}</div>
                      <div class="sefaz-row-sub">{{ sv.url }}</div>
                    </div>
                    <div class="sefaz-row-ms" :class="sv.ok ? 'ms-green' : 'ms-red'">
                      {{ sv.ok ? sv.ms + 'ms' : 'Erro' }}
                    </div>
                  </div>
                </div>
                <div class="card-footer-row">
                  <span class="material-symbols-outlined" style="font-size:13px;color:var(--muted)">schedule</span>
                  <span class="ci-label" style="font-size:11px">Próximo teste automático em <strong>{{ countdown }}s</strong></span>
                  <button class="tbtn" style="font-size:11px;padding:4px 9px;margin-left:auto" @click="testarConexao">
                    <span class="material-symbols-outlined" style="font-size:12px">refresh</span>Forçar
                  </button>
                </div>
              </div>

              <!-- CADEIA ICP-BRASIL -->
              <div class="card">
                <div class="card-head">
                  <div class="card-icon c-purple"><span class="material-symbols-outlined">account_tree</span></div>
                  <div><div class="card-title">Cadeia ICP-Brasil</div><div class="card-sub">Hierarquia de certificação</div></div>
                </div>
                <div class="icp-chain">
                  <div v-for="(node, idx) in icpChain" :key="node.nome" class="icp-node">
                    <div class="icp-connector" v-if="idx > 0"></div>
                    <div class="icp-item" :class="node.tipo === 'end' ? 'icp-end' : ''">
                      <div class="icp-icon" :class="node.iconCls">
                        <span class="material-symbols-outlined" style="font-size:15px">{{ node.icon }}</span>
                      </div>
                      <div class="icp-info">
                        <div class="icp-name">{{ node.nome }}</div>
                        <div class="icp-sub">{{ node.tipo === 'root' ? 'AC Raiz' : node.tipo === 'inter' ? 'AC Intermediária' : 'Certificado Final' }} · {{ node.validade }}</div>
                      </div>
                      <span class="tag-custom tag-green" style="font-size:9.5px;padding:1px 6px">Válida</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- ALERTAS -->
              <div class="card">
                <div class="card-head">
                  <div class="card-icon c-yellow"><span class="material-symbols-outlined">notifications_active</span></div>
                  <div><div class="card-title">Alertas & Notificações</div><div class="card-sub">Configuração de avisos</div></div>
                </div>
                <div class="alertas-config">
                  <div v-for="alerta in alertasConfig" :key="alerta.key" class="alerta-row">
                    <div class="alerta-icon" :class="alerta.iconCls">
                      <span class="material-symbols-outlined" style="font-size:15px">{{ alerta.icon }}</span>
                    </div>
                    <div class="alerta-info">
                      <div class="alerta-title">{{ alerta.title }}</div>
                      <div class="alerta-sub">{{ alerta.sub }}</div>
                    </div>
                    <label class="toggle-wrap">
                      <input type="checkbox" v-model="alerta.ativo" @change="saveAlerta(alerta)" />
                      <span class="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        <!-- ═══════════════════ ABA CERTIFICADO A3 ═══════════════════ -->
        <div v-if="activeTab === 'a3'">
          <div class="grid-2-1">

            <div class="card">
              <div class="card-head">
                <div class="card-icon c-blue">
                  <span class="material-symbols-outlined">sim_card</span>
                </div>
                <div>
                  <div class="card-title">Certificado A3 — Token / Smartcard</div>
                  <div class="card-sub">Armazenado em hardware · USB Token ou Smartcard</div>
                </div>
                <div class="card-actions">
                  <button class="tbtn primary" @click="openModal('a3config')">
                    <span class="material-symbols-outlined" style="font-size:13px">settings</span>Configurar A3
                  </button>
                </div>
              </div>

              <div class="a3-panel">

                <!-- DISPOSITIVOS DETECTADOS -->
                <div class="section-label">
                  <span class="material-symbols-outlined" style="font-size:14px">usb</span>
                  Dispositivos Detectados
                </div>
                <div class="a3-devices">
                  <div v-for="dev in a3Devices" :key="dev.id" class="a3-device" :class="dev.conectado ? 'a3-connected' : 'a3-disconnected'">
                    <div class="a3-dev-icon">
                      <span class="material-symbols-outlined" style="font-size:22px">{{ dev.icon }}</span>
                    </div>
                    <div class="a3-dev-info">
                      <div class="a3-dev-name">{{ dev.nome }}</div>
                      <div class="a3-dev-sub">{{ dev.fabricante }} · {{ dev.slot }}</div>
                      <div class="a3-dev-serial mono-bold" style="font-size:10.5px;color:var(--muted)">S/N {{ dev.serial }}</div>
                    </div>
                    <div class="a3-dev-status">
                      <span class="tag-custom" :class="dev.conectado ? 'tag-green' : 'tag-red'">
                        {{ dev.conectado ? 'Conectado' : 'Desconectado' }}
                      </span>
                      <div v-if="dev.conectado" class="a3-cert-mini">
                        <div class="a3-cert-mini-name">{{ dev.certNome }}</div>
                        <div class="a3-cert-mini-val">Válido até {{ dev.certValidade }}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- DRIVER / MIDDLEWARE -->
                <div class="section-label" style="margin-top:16px">
                  <span class="material-symbols-outlined" style="font-size:14px">settings_input_component</span>
                  Drivers & Middleware
                </div>
                <div class="table-wrap">
                  <table class="fiscal-table">
                    <thead>
                      <tr>
                        <th>FABRICANTE</th>
                        <th>DRIVER / MIDDLEWARE</th>
                        <th>VERSÃO</th>
                        <th>STATUS</th>
                        <th>AÇÕES</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="drv in drivers" :key="drv.fabricante">
                        <td>
                          <div class="cell-name">{{ drv.fabricante }}</div>
                          <div class="cell-sub">{{ drv.modelo }}</div>
                        </td>
                        <td><span class="mono-bold" style="font-size:11.5px">{{ drv.middleware }}</span></td>
                        <td><span class="mono-bold">{{ drv.versao }}</span></td>
                        <td>
                          <div class="status-cell">
                            <span class="status-dot" :class="drv.ok ? 'dot-green' : 'dot-red'"></span>
                            <span class="tag-custom" :class="drv.ok ? 'tag-green' : 'tag-red'">{{ drv.ok ? 'Instalado' : 'Não encontrado' }}</span>
                          </div>
                        </td>
                        <td>
                          <div class="row-actions">
                            <button class="icon-btn" :title="drv.ok ? 'Verificar' : 'Baixar driver'" @click="showToast(drv.ok ? 'check_circle' : 'download', drv.ok ? 'Driver verificado!' : 'Redirecionando para download...')">
                              <span class="material-symbols-outlined" style="font-size:14px">{{ drv.ok ? 'verified' : 'download' }}</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- PAINEL DIREITO A3 -->
            <div class="right-panel">
              <div class="card">
                <div class="card-head">
                  <div class="card-icon c-orange"><span class="material-symbols-outlined">bolt</span></div>
                  <div><div class="card-title">Ações Rápidas A3</div><div class="card-sub">Operações do token</div></div>
                </div>
                <div class="quick-actions">
                  <button v-for="qa in a3QuickActions" :key="qa.label" class="qa-btn" :class="qa.primary ? 'qa-primary' : ''" @click="showToast(qa.icon, qa.msg)">
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

              <div class="card">
                <div class="card-head">
                  <div class="card-icon c-green"><span class="material-symbols-outlined">security</span></div>
                  <div><div class="card-title">Segurança do Token</div><div class="card-sub">Políticas de PIN</div></div>
                </div>
                <div class="security-panel">
                  <div v-for="sp in securityPolicies" :key="sp.label" class="security-row">
                    <div class="security-icon" :class="sp.ok ? 'c-green' : 'c-yellow'">
                      <span class="material-symbols-outlined" style="font-size:15px">{{ sp.icon }}</span>
                    </div>
                    <div class="security-info">
                      <div class="security-label">{{ sp.label }}</div>
                      <div class="security-val">{{ sp.val }}</div>
                    </div>
                    <span class="tag-custom" :class="sp.ok ? 'tag-green' : 'tag-yellow'">{{ sp.ok ? 'OK' : 'Atenção' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ═══════════════════ ABA HISTÓRICO ═══════════════════ -->
        <div v-if="activeTab === 'historico'">
          <div class="card" style="margin-bottom:14px">
            <div class="card-head">
              <div class="card-icon c-orange"><span class="material-symbols-outlined">history</span></div>
              <div>
                <div class="card-title">Histórico de Certificados</div>
                <div class="card-sub">{{ historico.length }} registros encontrados</div>
              </div>
              <div class="card-actions">
                <button class="tbtn">
                  <span class="material-symbols-outlined" style="font-size:13px">download</span>Exportar
                </button>
              </div>
            </div>
            <div class="table-wrap">
              <table class="fiscal-table">
                <thead>
                  <tr>
                    <th>TITULAR</th>
                    <th>TIPO</th>
                    <th>EMISSÃO</th>
                    <th>VALIDADE</th>
                    <th>AC EMISSORA</th>
                    <th>STATUS</th>
                    <th>AÇÕES</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="h in historico" :key="h.id">
                    <td>
                      <div class="cell-name">{{ h.razaoSocial }}</div>
                      <div class="cell-sub">CNPJ {{ h.cnpj }}</div>
                    </td>
                    <td><span class="tag-custom tag-blue">{{ h.tipo }}</span></td>
                    <td>
                      <div style="font-size:11.5px">{{ h.emissao }}</div>
                    </td>
                    <td>
                      <div style="font-size:11.5px">{{ h.validade }}</div>
                    </td>
                    <td>
                      <div class="cell-name">{{ h.ac }}</div>
                    </td>
                    <td>
                      <div class="status-cell">
                        <span class="status-dot" :class="'dot-'+statusClass(h.status)"></span>
                        <span class="tag-custom" :class="tagClass(h.status)">{{ h.status }}</span>
                      </div>
                    </td>
                    <td>
                      <div class="row-actions">
                        <button class="icon-btn" title="Ver detalhes" @click="showToast('info','Carregando detalhes...')">
                          <span class="material-symbols-outlined" style="font-size:14px">visibility</span>
                        </button>
                        <button class="icon-btn" title="Baixar backup" @click="showToast('download','Gerando backup cifrado...')">
                          <span class="material-symbols-outlined" style="font-size:14px">download</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- LOG DE EVENTOS -->
          <div class="card">
            <div class="card-head">
              <div class="card-icon c-blue"><span class="material-symbols-outlined">receipt_long</span></div>
              <div><div class="card-title">Log de Eventos</div><div class="card-sub">Auditoria de uso do certificado</div></div>
            </div>
            <div class="log-list">
              <div v-for="log in eventLogs" :key="log.id" class="log-item">
                <div class="log-icon" :class="log.iconCls">
                  <span class="material-symbols-outlined" style="font-size:14px">{{ log.icon }}</span>
                </div>
                <div class="log-info">
                  <div class="log-title">{{ log.evento }}</div>
                  <div class="log-sub">{{ log.detalhe }}</div>
                </div>
                <div class="log-time">{{ log.data }}</div>
              </div>
            </div>
          </div>
        </div>

      </div><!-- /content -->

      <!-- ═══════════════════ FOOTER ═══════════════════ -->
      <div class="dash-footer">
        <span>Certificado Digital · ICP-Brasil · v3.4.1</span>
        <span>Última verificação: {{ ultimoTeste }} · {{ sefazOnline ? 'SEFAZ Online' : 'SEFAZ Offline' }}</span>
      </div>
    </div>

    <!-- ═══════════════════ MODAL ═══════════════════ -->
    <div class="modal-overlay" v-if="showModal" @click.self="showModal=false">
      <div class="modal-box" :class="modalSmall ? 'modal-small' : ''">
        <div class="modal-header">
          <div class="modal-title-row">
            <div class="card-icon c-orange"><span class="material-symbols-outlined" style="font-size:16px">{{ modalIcon }}</span></div>
            <div>
              <div class="modal-title">{{ modalTitle }}</div>
              <div class="modal-sub">{{ modalSubtitle }}</div>
            </div>
          </div>
          <button class="modal-close" @click="showModal=false">
            <span class="material-symbols-outlined" style="font-size:16px">close</span>
          </button>
        </div>
        <div class="modal-body">

          <!-- MODAL: UPLOAD A1 -->
          <template v-if="modalType === 'upload'">
            <div class="form-section">
              <div class="upload-drop-area" :class="{ 'drag-over': dragOver }"
                @dragover.prevent="dragOver=true" @dragleave="dragOver=false"
                @drop.prevent="onFileDrop" @click="$refs.fileInput.click()">
                <input ref="fileInput" type="file" accept=".pfx,.p12" style="display:none" @change="onFileSelect" />
                <span class="material-symbols-outlined" style="font-size:38px;color:var(--accent)">upload_file</span>
                <div class="upload-title">Arraste o arquivo aqui ou clique para selecionar</div>
                <div class="upload-sub">Formatos aceitos: .pfx, .p12 · Máx. 10MB</div>
                <div class="upload-file-name" v-if="uploadFileName">
                  <span class="material-symbols-outlined" style="font-size:15px;color:var(--green)">check_circle</span>
                  {{ uploadFileName }}
                </div>
              </div>

              <div class="form-row-2">
                <div class="form-field">
                  <label class="field-label">Senha do Certificado *</label>
                  <div class="password-wrap">
                    <input :type="showPass ? 'text' : 'password'" v-model="form.senha" placeholder="••••••••••••" class="form-input" />
                    <button type="button" class="pass-toggle" @click="showPass=!showPass">
                      <span class="material-symbols-outlined" style="font-size:16px">{{ showPass ? 'visibility_off' : 'visibility' }}</span>
                    </button>
                  </div>
                  <div class="pass-strength" v-if="form.senha">
                    <div class="pass-bar">
                      <div class="pass-fill" :class="passStrengthClass" :style="{ width: passStrengthPct + '%' }"></div>
                    </div>
                    <span class="pass-label" :class="passStrengthClass">{{ passStrengthLabel }}</span>
                  </div>
                </div>
                <div class="form-field">
                  <label class="field-label">Confirmar Senha *</label>
                  <div class="password-wrap">
                    <input :type="showPass2 ? 'text' : 'password'" v-model="form.senhaConfirm" placeholder="••••••••••••" class="form-input" />
                    <button type="button" class="pass-toggle" @click="showPass2=!showPass2">
                      <span class="material-symbols-outlined" style="font-size:16px">{{ showPass2 ? 'visibility_off' : 'visibility' }}</span>
                    </button>
                  </div>
                  <div v-if="form.senhaConfirm && form.senha !== form.senhaConfirm" class="field-error">
                    <span class="material-symbols-outlined" style="font-size:13px">error</span> Senhas não coincidem
                  </div>
                </div>
              </div>

              <div class="form-row-2">
                <div class="form-field">
                  <label class="field-label">Ambiente</label>
                  <select v-model="form.ambiente" class="form-input">
                    <option value="producao">Produção</option>
                    <option value="homologacao">Homologação</option>
                  </select>
                </div>
                <div class="form-field">
                  <label class="field-label">UF do Emitente</label>
                  <select v-model="form.uf" class="form-input">
                    <option v-for="uf in ufs" :key="uf" :value="uf">{{ uf }}</option>
                  </select>
                </div>
              </div>

              <div class="info-box">
                <span class="material-symbols-outlined" style="font-size:16px;color:var(--blue)">info</span>
                <div>
                  <div style="font-weight:700;font-size:12px;color:var(--blue)">Segurança do arquivo</div>
                  <div style="font-size:11.5px;color:var(--text2);margin-top:3px">O certificado é criptografado com AES-256 antes de ser armazenado. A senha não é salva em nenhum momento.</div>
                </div>
              </div>
            </div>
          </template>

          <!-- MODAL: ALTERAR SENHA -->
          <template v-else-if="modalType === 'senha'">
            <div class="form-section">
              <div class="form-field">
                <label class="field-label">Senha Atual</label>
                <div class="password-wrap">
                  <input type="password" v-model="form.senhaAtual" placeholder="••••••••••••" class="form-input" />
                </div>
              </div>
              <div class="form-field">
                <label class="field-label">Nova Senha</label>
                <div class="password-wrap">
                  <input :type="showPass ? 'text' : 'password'" v-model="form.senha" placeholder="••••••••••••" class="form-input" />
                  <button type="button" class="pass-toggle" @click="showPass=!showPass">
                    <span class="material-symbols-outlined" style="font-size:16px">{{ showPass ? 'visibility_off' : 'visibility' }}</span>
                  </button>
                </div>
                <div class="pass-strength" v-if="form.senha">
                  <div class="pass-bar">
                    <div class="pass-fill" :class="passStrengthClass" :style="{ width: passStrengthPct + '%' }"></div>
                  </div>
                  <span class="pass-label" :class="passStrengthClass">{{ passStrengthLabel }}</span>
                </div>
              </div>
              <div class="form-field">
                <label class="field-label">Confirmar Nova Senha</label>
                <input type="password" v-model="form.senhaConfirm" placeholder="••••••••••••" class="form-input" />
              </div>
            </div>
          </template>

          <!-- MODAL: REVOGAR -->
          <template v-else-if="modalType === 'revogar'">
            <div class="info-box danger-box">
              <span class="material-symbols-outlined" style="font-size:20px;color:var(--red)">warning</span>
              <div>
                <div style="font-weight:700;font-size:13px;color:var(--red)">Ação irreversível</div>
                <div style="font-size:12px;color:var(--text2);margin-top:4px">A revogação do certificado não pode ser desfeita. Todas as integrações SEFAZ serão interrompidas imediatamente.</div>
              </div>
            </div>
            <div class="form-field">
              <label class="field-label">Motivo da Revogação</label>
              <select v-model="form.motivoRevogacao" class="form-input">
                <option value="">Selecione o motivo</option>
                <option>Chave comprometida</option>
                <option>Certificado substituído</option>
                <option>Encerramento de atividades</option>
                <option>Outro</option>
              </select>
            </div>
            <div class="form-field">
              <label class="field-label">Digite "REVOGAR" para confirmar</label>
              <input type="text" v-model="form.confirmRevoke" placeholder="REVOGAR" class="form-input" />
            </div>
          </template>

          <!-- MODAL: RENOVAR -->
          <template v-else-if="modalType === 'renovar'">
            <div class="renovar-options">
              <div class="renovar-option" :class="{ selected: form.tipoRenovacao === 'online' }" @click="form.tipoRenovacao = 'online'">
                <div class="renovar-opt-icon c-green">
                  <span class="material-symbols-outlined" style="font-size:22px">cloud_sync</span>
                </div>
                <div>
                  <div class="renovar-opt-title">Renovação Online</div>
                  <div class="renovar-opt-sub">Renovação diretamente com a AC emissora. Disponível se o certificado ainda está válido.</div>
                </div>
                <span class="material-symbols-outlined" style="font-size:18px;color:var(--accent)" v-if="form.tipoRenovacao === 'online'">radio_button_checked</span>
              </div>
              <div class="renovar-option" :class="{ selected: form.tipoRenovacao === 'novo' }" @click="form.tipoRenovacao = 'novo'">
                <div class="renovar-opt-icon c-blue">
                  <span class="material-symbols-outlined" style="font-size:22px">upload_file</span>
                </div>
                <div>
                  <div class="renovar-opt-title">Instalar Novo Certificado</div>
                  <div class="renovar-opt-sub">Upload do novo arquivo .pfx gerado junto à autoridade certificadora.</div>
                </div>
                <span class="material-symbols-outlined" style="font-size:18px;color:var(--accent)" v-if="form.tipoRenovacao === 'novo'">radio_button_checked</span>
              </div>
            </div>
            <div class="info-box">
              <span class="material-symbols-outlined" style="font-size:16px;color:var(--yellow)">schedule</span>
              <div style="font-size:12px;color:var(--text2)">
                Recomendamos renovar com pelo menos <strong>30 dias de antecedência</strong> para evitar interrupções na emissão de notas fiscais.
              </div>
            </div>
          </template>

        </div>
        <div class="modal-footer">
          <button class="tbtn" @click="showModal=false">Cancelar</button>
          <span style="flex:1"></span>
          <button class="tbtn primary" @click="confirmarModal" :disabled="!canConfirm">
            <span class="material-symbols-outlined" style="font-size:14px">check</span>
            {{ modalConfirmLabel }}
          </button>
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
  name: 'CertificadoDigital',

  data() {
    return {
      activeTab: 'a1',
      showModal: false,
      modalType: '',
      testando: false,
      sefazOnline: true,
      dragOver: false,
      uploadFileName: '',
      showPass: false,
      showPass2: false,
      toastVisible: false,
      toastIcon: 'check_circle',
      toastMsg: '',
      countdown: 27,

      form: {
        senha: '',
        senhaConfirm: '',
        senhaAtual: '',
        ambiente: 'producao',
        uf: 'SP',
        tipoRenovacao: 'online',
        motivoRevogacao: '',
        confirmRevoke: '',
      },

      alertBanner: {
        visible: true,
        cls: 'alert-warning',
        icon: 'warning',
        title: 'Certificado expirando em 24 dias',
        msg: 'Renove antes de 08/06/2026 para não interromper a emissão de NF-e / NFC-e.',
      },

      certAtivo: {
        razaoSocial: 'Comércio e Distribuição São Paulo Ltda.',
        cnpj: '12.345.678/0001-99',
        emitente: 'AC SERASA RFB v5',
        serial: '0A:1B:2C:3D:4E:5F:6A:7B',
        emitidoEm: '15/05/2024',
        validoAte: '15/05/2026',  // today exactly — triggering warning
        diasRestantes: 0,
        status: 'Expirando',
        algoritmo: 'SHA-256 RSA',
        tamChave: '2048 bits',
        totalDias: 365,
        usadoDias: 365,
      },

      sefazServicos: [
        { nome: 'NF-e Autorização',        url: 'nfe.fazenda.sp.gov.br', ok: true,  ms: 142 },
        { nome: 'NF-e Consulta Protocolo', url: 'nfe.fazenda.sp.gov.br', ok: true,  ms: 98  },
        { nome: 'NFC-e Autorização',       url: 'nfce.fazenda.sp.gov.br',ok: true,  ms: 161 },
        { nome: 'SVRS Contingência',       url: 'nfe.svrs.rs.gov.br',    ok: false, ms: 0   },
      ],

      icpChain: [
        { nome: 'ICP-Brasil AC Raiz',        tipo: 'root',  icon: 'public',         iconCls: 'c-orange',  validade: 'até 2029' },
        { nome: 'AC SERASA Certificadora',   tipo: 'inter', icon: 'account_balance', iconCls: 'c-blue',    validade: 'até 2027' },
        { nome: 'AC SERASA RFB v5',          tipo: 'inter', icon: 'corporate_fare',  iconCls: 'c-blue',    validade: 'até 2026' },
        { nome: certAtivo => certAtivo,      tipo: 'end',   icon: 'shield_lock',     iconCls: 'c-green',   validade: 'até 15/05/2026' },
      ],

      alertasConfig: [
        { key: 'venc30',  icon: 'notifications_active', iconCls: 'c-yellow', title: 'Alerta 30 dias antes do vencimento', sub: 'E-mail + notificação no painel',        ativo: true  },
        { key: 'venc15',  icon: 'warning',              iconCls: 'c-orange', title: 'Alerta 15 dias antes do vencimento', sub: 'E-mail diário + SMS (se configurado)',  ativo: true  },
        { key: 'venc7',   icon: 'error',                iconCls: 'c-red',    title: 'Alerta crítico 7 dias antes',        sub: 'E-mail urgente + bloqueia emissão',     ativo: false },
        { key: 'errocon', icon: 'wifi_off',             iconCls: 'c-red',    title: 'Falha na conexão SEFAZ',             sub: 'Notificação imediata em caso de erro',  ativo: true  },
        { key: 'renov',   icon: 'autorenew',            iconCls: 'c-green',  title: 'Renovação automática (online)',      sub: 'Tenta renovar 30 dias antes se online', ativo: false },
      ],

      a3Devices: [
        { id: 1, nome: 'SafeNet eToken 5110', fabricante: 'Thales',  icon: 'usb',      slot: 'Slot 0', serial: 'TH-8827-1A', conectado: true,  certNome: 'Comércio SP Ltda.', certValidade: '15/05/2026' },
        { id: 2, nome: 'Cartão SmartCard',    fabricante: 'Gemalto', icon: 'credit_card', slot: 'Leitor 1', serial: 'GM-5512-9C', conectado: false, certNome: '', certValidade: '' },
      ],

      drivers: [
        { fabricante: 'SafeNet',  modelo: 'eToken 5110',    middleware: 'SafeNet Authentication Client', versao: '10.8.1050', ok: true  },
        { fabricante: 'Gemalto',  modelo: 'IDPrime',        middleware: 'Gemalto MiniDriver',            versao: '10.7.0',   ok: false },
        { fabricante: 'Certisign',modelo: 'Token USB',      middleware: 'CertiSign PKCS#11',             versao: '3.2.0',    ok: true  },
      ],

      a3QuickActions: [
        { label: 'Testar PIN',         sub: 'Verificar PIN do token',   icon: 'pin',           color: '#2563eb', msg: 'Aguardando entrada do PIN...', primary: false },
        { label: 'Alterar PIN',        sub: 'Trocar PIN do dispositivo', icon: 'key',           color: '#FF8049', msg: 'Abrindo diálogo de alteração de PIN...', primary: true },
        { label: 'Backup do Token',    sub: 'Exportar certificado',      icon: 'backup',        color: '#16a34a', msg: 'Gerando backup criptografado...', primary: false },
        { label: 'Reiniciar Token',    sub: 'Resetar dispositivo',       icon: 'restart_alt',   color: '#ca8a04', msg: 'Reiniciando token...', primary: false },
      ],

      securityPolicies: [
        { icon: 'pin',        label: 'Tamanho mínimo do PIN',   val: '8 caracteres',     ok: true  },
        { icon: 'lock_clock', label: 'Bloqueio após tentativas', val: '5 tentativas',    ok: true  },
        { icon: 'schedule',   label: 'Timeout de sessão',        val: '5 minutos',       ok: true  },
        { icon: 'warning',    label: 'Tentativas restantes',     val: '4 de 5 (1 usada)',ok: false },
      ],

      historico: [
        { id: 1, razaoSocial: 'Comércio SP Ltda.',      cnpj: '12.345.678/0001-99', tipo: 'A1', emissao: '15/05/2024', validade: '15/05/2026', ac: 'AC SERASA RFB v5', status: 'Expirando' },
        { id: 2, razaoSocial: 'Comércio SP Ltda.',      cnpj: '12.345.678/0001-99', tipo: 'A1', emissao: '15/05/2022', validade: '15/05/2024', ac: 'AC SERASA RFB v4', status: 'Expirado'  },
        { id: 3, razaoSocial: 'Comércio SP Ltda.',      cnpj: '12.345.678/0001-99', tipo: 'A3', emissao: '10/01/2021', validade: '10/01/2023', ac: 'AC Certisign G7',   status: 'Revogado' },
        { id: 4, razaoSocial: 'Comércio SP Ltda.',      cnpj: '12.345.678/0001-99', tipo: 'A1', emissao: '15/05/2020', validade: '15/05/2022', ac: 'AC SERASA RFB v3', status: 'Expirado'  },
      ],

      eventLogs: [
        { id: 1, icon: 'check_circle', iconCls: 'c-green',  evento: 'Certificado validado com SEFAZ',          detalhe: 'NF-e Autorização SP · 142ms',              data: 'Hoje 14:32' },
        { id: 2, icon: 'key',          iconCls: 'c-blue',   evento: 'Senha do certificado alterada',            detalhe: 'Usuário: admin@empresa.com.br',            data: 'Hoje 10:11' },
        { id: 3, icon: 'upload_file',  iconCls: 'c-orange', evento: 'Certificado A1 instalado',                 detalhe: 'AC SERASA RFB v5 · válido até 15/05/2026', data: '15/05/2024'  },
        { id: 4, icon: 'warning',      iconCls: 'c-yellow', evento: 'Falha na conexão com SVRS Contingência',   detalhe: 'Timeout 5000ms · Retry automático',         data: '14/05/2026'  },
        { id: 5, icon: 'delete_forever',iconCls:'c-red',    evento: 'Certificado A3 revogado',                  detalhe: 'Motivo: Certificado substituído',           data: '10/01/2023'  },
      ],

      ultimoTeste: '14:32',
      ufs: ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'],
    };
  },

  computed: {
    mainTabs() {
      return [
        { key: 'a1',       label: 'Certificado A1',   icon: 'shield_lock', badge: this.certAtivo.diasRestantes <= 30 ? '!' : null, badgeColor: 'badge-red' },
        //{ key: 'a3',       label: 'Certificado A3',   icon: 'sim_card',    badge: null, badgeColor: '' },
        { key: 'historico',label: 'Histórico & Logs', icon: 'history',     badge: null, badgeColor: '' },
      ];
    },

    kpis() {
      return [
        { label: 'Dias Restantes',  value: this.certAtivo.diasRestantes === 0 ? 'Hoje!' : this.certAtivo.diasRestantes + 'd', trend: '-24d vs 1 mês', trendUp: false, icon: 'event',         accent: 'k-red',    sub: 'até vencimento'  },
        { label: 'Status Conexão',  value: this.sefazOnline ? 'Online' : 'Offline', trend: '+99.8% uptime', trendUp: true, icon: 'cell_tower',     accent: 'k-green',  sub: 'SEFAZ SP'        },
        { label: 'Autoridades CA',  value: '3',   trend: '3 válidas',     trendUp: true,  icon: 'account_tree',  accent: 'k-blue',   sub: 'cadeia ICP-Brasil' },
        { label: 'Emissões Hoje',   value: '284', trend: '+12%',          trendUp: true,  icon: 'description',   accent: 'k-orange', sub: 'notas assinadas'  },
      ];
    },

    certStatus() {
      const d = this.certAtivo.diasRestantes;
      if (d <= 0)  return { cls: 'cert-pill-red',    label: 'Certificado Expirado' };
      if (d <= 30) return { cls: 'cert-pill-yellow', label: `Expira em ${d}d` };
      return              { cls: 'cert-pill-green',  label: 'Certificado Válido' };
    },

    certShieldClass() {
      const d = this.certAtivo.diasRestantes;
      if (d <= 0)  return 'shield-red';
      if (d <= 30) return 'shield-yellow';
      return 'shield-green';
    },

    certShieldIcon() {
      const d = this.certAtivo.diasRestantes;
      if (d <= 0)  return 'shield_x';
      if (d <= 30) return 'shield_with_warning';
      return 'shield_lock';
    },

    validadePct() {
      const total = this.certAtivo.totalDias;
      const used = this.certAtivo.usadoDias;
      return Math.min(100, Math.round((used / total) * 100));
    },

    validadeBarClass() {
      const pct = this.validadePct;
      if (pct >= 95) return 'bar-red';
      if (pct >= 85) return 'bar-yellow';
      return 'bar-green';
    },

    diasBadgeClass() {
      const d = this.certAtivo.diasRestantes;
      if (d <= 0)  return 'badge-red';
      if (d <= 30) return 'badge-yellow';
      return 'badge-green-small';
    },

    icpChain() {
      return [
        { nome: 'ICP-Brasil AC Raiz',       tipo: 'root',  icon: 'public',          iconCls: 'c-orange', validade: 'até 2029' },
        { nome: 'AC SERASA Certificadora',  tipo: 'inter', icon: 'account_balance',  iconCls: 'c-blue',   validade: 'até 2027' },
        { nome: 'AC SERASA RFB v5',         tipo: 'inter', icon: 'corporate_fare',   iconCls: 'c-blue',   validade: 'até 2026' },
        { nome: this.certAtivo.razaoSocial, tipo: 'end',   icon: 'shield_lock',      iconCls: 'c-green',  validade: `até ${this.certAtivo.validoAte}` },
      ];
    },

    modalSmall() { return ['senha','revogar','renovar'].includes(this.modalType); },

    modalTitle() {
      return {
        upload:   'Instalar Certificado A1',
        senha:    'Alterar Senha do Certificado',
        revogar:  'Revogar Certificado',
        renovar:  'Renovar Certificado',
        a3config: 'Configurar Certificado A3',
        historico:'Histórico de Certificados',
      }[this.modalType] || '';
    },

    modalSubtitle() {
      return {
        upload:   'Upload do arquivo .pfx / .p12 com a senha de exportação',
        senha:    'A senha é usada para assinar documentos eletrônicos',
        revogar:  'Esta ação é irreversível e interrompe todas as emissões',
        renovar:  'Escolha o método de renovação',
        a3config: 'Configurar token USB / Smartcard',
      }[this.modalType] || '';
    },

    modalIcon() {
      return { upload:'upload_file', senha:'key', revogar:'delete_forever', renovar:'autorenew', a3config:'sim_card' }[this.modalType] || 'shield_lock';
    },

    modalConfirmLabel() {
      return { upload:'Instalar Certificado', senha:'Salvar Senha', revogar:'Confirmar Revogação', renovar:'Continuar', a3config:'Salvar' }[this.modalType] || 'Confirmar';
    },

    canConfirm() {
      if (this.modalType === 'upload') return !!this.uploadFileName && !!this.form.senha && this.form.senha === this.form.senhaConfirm;
      if (this.modalType === 'senha')  return !!this.form.senhaAtual && !!this.form.senha && this.form.senha === this.form.senhaConfirm;
      if (this.modalType === 'revogar') return this.form.confirmRevoke === 'REVOGAR' && !!this.form.motivoRevogacao;
      return true;
    },

    passStrengthPct() {
      const s = this.form.senha;
      let score = 0;
      if (s.length >= 8)  score += 25;
      if (s.length >= 12) score += 15;
      if (/[A-Z]/.test(s)) score += 20;
      if (/[0-9]/.test(s)) score += 20;
      if (/[^A-Za-z0-9]/.test(s)) score += 20;
      return Math.min(100, score);
    },

    passStrengthClass() {
      const p = this.passStrengthPct;
      if (p < 40) return 'strength-weak';
      if (p < 75) return 'strength-medium';
      return 'strength-strong';
    },

    passStrengthLabel() {
      const p = this.passStrengthPct;
      if (p < 40) return 'Fraca';
      if (p < 75) return 'Média';
      return 'Forte';
    },
  },

  mounted() {
    setInterval(() => {
      if (this.countdown > 0) this.countdown--;
      else {
        this.countdown = 30;
        this.ultimoTeste = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      }
    }, 1000);
  },

  methods: {
    openModal(tipo) {
      this.modalType = tipo;
      this.form = { senha: '', senhaConfirm: '', senhaAtual: '', ambiente: 'producao', uf: 'SP', tipoRenovacao: 'online', motivoRevogacao: '', confirmRevoke: '' };
      this.uploadFileName = '';
      this.showPass = false;
      this.showPass2 = false;
      this.showModal = true;
    },

    confirmarModal() {
      const msgs = {
        upload:  'Certificado A1 instalado com sucesso!',
        senha:   'Senha do certificado alterada!',
        revogar: 'Certificado revogado. Emissões interrompidas.',
        renovar: 'Processo de renovação iniciado...',
        a3config:'Configuração A3 salva!',
      };
      this.showModal = false;
      this.showToast('check_circle', msgs[this.modalType] || 'Operação concluída!');
    },

    testarConexao() {
      this.testando = true;
      this.showToast('wifi_tethering', 'Testando conexão com SEFAZ...');
      setTimeout(() => {
        this.testando = false;
        this.ultimoTeste = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        this.countdown = 30;
        this.showToast('check_circle', '3 de 4 serviços SEFAZ online · SVRS com falha');
      }, 2200);
    },

    onFileDrop(e) {
      this.dragOver = false;
      const file = e.dataTransfer.files[0];
      if (file) this.uploadFileName = file.name;
    },

    onFileSelect(e) {
      const file = e.target.files[0];
      if (file) this.uploadFileName = file.name;
    },

    saveAlerta(alerta) {
      this.showToast(alerta.ativo ? 'notifications_active' : 'notifications_off',
        `Alerta "${alerta.title}" ${alerta.ativo ? 'ativado' : 'desativado'}`);
    },

    statusClass(s) {
      return { 'Válido':'green','Expirando':'yellow','Expirado':'red','Revogado':'red' }[s] || 'muted';
    },

    tagClass(s) {
      return { 'Válido':'tag-green','Expirando':'tag-yellow','Expirado':'tag-red','Revogado':'tag-red' }[s] || '';
    },

    showToast(icon, msg) {
      this.toastIcon = icon;
      this.toastMsg = msg;
      this.toastVisible = true;
      setTimeout(() => { this.toastVisible = false; }, 3200);
    },
  },
};
</script>

<style scoped>
/* ══════════════════════════════════════════════
   DESIGN TOKENS — Padrão unificado (idêntico ao EmissaoFiscal)
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

.cert-pill { display:flex; align-items:center; gap:6px; font-size:11.5px; font-weight:700; padding:5px 12px; border-radius:20px; }
.cert-pill-green  { background:var(--green2);  color:var(--green);  }
.cert-pill-yellow { background:var(--yellow2); color:var(--yellow); }
.cert-pill-red    { background:var(--red2);    color:var(--red);    }

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
.tbtn:disabled { opacity:.4; cursor:not-allowed; }

.user-avatar {
  width:31px; height:31px; border-radius:50%;
  background:linear-gradient(135deg,var(--accent),#ff4d4d);
  display:flex; align-items:center; justify-content:center;
  font-weight:700; font-size:11px; color:#fff; flex-shrink:0;
}

/* ══ CONTENT ══ */
.content { padding:22px 24px; flex:1; }

/* ══ ALERT BANNER ══ */
.alert-banner {
  display:flex; align-items:center; gap:12px;
  border-radius:var(--radius); padding:12px 18px; margin-bottom:14px;
  border:1px solid; font-size:12.5px;
}
.alert-warning { background:var(--yellow2); border-color:var(--yellow); color:var(--yellow); }
.alert-danger  { background:var(--red2);    border-color:var(--red);    color:var(--red);    }
.alert-text { flex:1; }
.alert-text strong { font-weight:700; }
.alert-close { background:transparent; border:none; cursor:pointer; color:currentColor; display:flex; align-items:center; padding:2px; border-radius:5px; }

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
.badge-red    { background:var(--red); }
.badge-yellow { background:var(--yellow); }
.badge-orange { background:var(--accent); }

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
.kpi-footer { display:flex; align-items:center; gap:6px; font-size:11px; }
.kpi-delta  { font-weight:700; display:flex; align-items:center; gap:2px; }
.kpi-delta.up   { color:var(--green); }
.kpi-delta.down { color:var(--red);   }
.kpi-sub { color:var(--muted); }
.kpi-bg-icon { position:absolute; bottom:4px; right:10px; font-size:48px; opacity:.05; color:var(--text1); pointer-events:none; line-height:1; }

/* ══ GRID LAYOUTS ══ */
.grid-2-1 { display:grid; grid-template-columns:2fr 1fr; gap:14px; margin-bottom:14px; }
.grid-2   { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:14px; }
.right-panel { display:flex; flex-direction:column; gap:14px; }

/* ══ CARD ══ */
.card { background:var(--bg-card); border:1px solid var(--border); border-radius:var(--radius); overflow:hidden; box-shadow:var(--shadow); margin-bottom:0; }
.card-head {
  display:flex; align-items:center; gap:10px;
  padding:13px 18px; border-bottom:1px solid var(--border); flex-wrap:wrap;
}
.card-title { font-size:13px; font-weight:700; letter-spacing:-.2px; }
.card-sub   { font-size:10.5px; color:var(--muted); margin-top:1px; }
.card-actions { margin-left:auto; display:flex; gap:6px; align-items:center; flex-wrap:wrap; }
.card-icon { width:30px; height:30px; border-radius:8px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.card-icon .material-symbols-outlined { font-size:17px !important; }
.c-orange  { background:var(--accent2); color:var(--accent); }
.c-green   { background:var(--green2);  color:var(--green);  }
.c-blue    { background:var(--blue2);   color:var(--blue);   }
.c-yellow  { background:var(--yellow2); color:var(--yellow); }
.c-red     { background:var(--red2);    color:var(--red);    }
.c-purple  { background:var(--purple2); color:var(--purple); }
.card-footer-row { display:flex; align-items:center; gap:8px; padding:10px 18px; border-top:1px solid var(--border); background:var(--bg-el); }

/* ══ CERT ACTIVE PANEL ══ */
.cert-active-panel { padding:20px 18px; display:flex; flex-direction:column; gap:18px; }
.cert-visual { display:flex; align-items:center; gap:16px; }
.cert-shield {
  width:68px; height:68px; border-radius:14px;
  display:flex; align-items:center; justify-content:center; flex-shrink:0;
}
.shield-green  { background:var(--green2);  color:var(--green);  }
.shield-yellow { background:var(--yellow2); color:var(--yellow); }
.shield-red    { background:var(--red2);    color:var(--red);    }
.cert-name  { font-size:15px; font-weight:800; letter-spacing:-.3px; color:var(--text1); }
.cert-cnpj  { font-size:11px; color:var(--muted); margin:3px 0 8px; font-family:'Courier New',monospace; }
.cert-tags  { display:flex; gap:5px; flex-wrap:wrap; }

.cert-info-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; background:var(--bg-el); border-radius:var(--radius-s); padding:14px; }
.cert-info-item { display:flex; flex-direction:column; gap:3px; }
.ci-label { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.6px; color:var(--muted); }
.ci-val   { font-size:12.5px; font-weight:600; color:var(--text1); }
.text-red    { color:var(--red) !important; }
.text-yellow { color:var(--yellow) !important; }

.dias-badge { font-size:10px; font-weight:700; padding:1px 7px; border-radius:10px; margin-left:6px; }
.badge-red         { background:var(--red2);    color:var(--red);    }
.badge-yellow      { background:var(--yellow2); color:var(--yellow); }
.badge-green-small { background:var(--green2);  color:var(--green);  }

/* ══ VALIDADE BAR ══ */
.validade-bar-wrap { display:flex; flex-direction:column; gap:6px; }
.validade-bar-header { display:flex; justify-content:space-between; align-items:center; }
.validade-bar-track { height:8px; background:var(--bg-el); border-radius:20px; overflow:hidden; }
.validade-bar-fill  { height:100%; border-radius:20px; transition:width .6s ease; }
.bar-green  { background:linear-gradient(90deg,var(--green),#22c55e); }
.bar-yellow { background:linear-gradient(90deg,var(--yellow),#eab308); }
.bar-red    { background:linear-gradient(90deg,var(--red),#ef4444); }
.validade-bar-labels { display:flex; justify-content:space-between; font-size:10.5px; color:var(--muted); }

/* ══ CERT ACTION BUTTONS ══ */
.cert-actions-row { display:flex; gap:8px; flex-wrap:wrap; }
.icon-action-btn {
  display:flex; align-items:center; gap:7px; padding:8px 14px;
  border-radius:var(--radius-s); font-size:12px; font-weight:600;
  cursor:pointer; transition:all .15s; font-family:inherit; border:1px solid;
}
.c-blue-btn   { background:var(--blue2);   color:var(--blue);   border-color:var(--blue);   }
.c-blue-btn:hover   { background:var(--blue);   color:#fff; }
.c-green-btn  { background:var(--green2);  color:var(--green);  border-color:var(--green);  }
.c-green-btn:hover  { background:var(--green);  color:#fff; }
.c-orange-btn { background:var(--accent2); color:var(--accent); border-color:var(--accent); }
.c-orange-btn:hover { background:var(--accent); color:#fff; }
.c-red-btn    { background:var(--red2);    color:var(--red);    border-color:var(--red);    }
.c-red-btn:hover    { background:var(--red);    color:#fff; }

/* ══ SEFAZ STATUS LIST ══ */
.sefaz-status-list { display:flex; flex-direction:column; padding:0; }
.sefaz-row { display:flex; align-items:center; gap:10px; padding:10px 18px; border-bottom:1px solid var(--border); }
.sefaz-row:last-child { border-bottom:none; }
.sefaz-row-icon { width:26px; height:26px; border-radius:6px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.sefaz-row-info { flex:1; }
.sefaz-row-title { font-size:12.5px; font-weight:600; color:var(--text1); }
.sefaz-row-sub   { font-size:10.5px; color:var(--muted); margin-top:1px; font-family:'Courier New',monospace; }
.sefaz-row-ms { font-size:11.5px; font-weight:700; font-family:'Courier New',monospace; }
.ms-green { color:var(--green); }
.ms-red   { color:var(--red);   }

/* ══ ICP CHAIN ══ */
.icp-chain { padding:16px 18px; display:flex; flex-direction:column; gap:0; }
.icp-node { display:flex; flex-direction:column; }
.icp-connector { width:2px; height:14px; background:var(--border2); margin-left:13px; }
.icp-item {
  display:flex; align-items:center; gap:10px; padding:9px 12px;
  border-radius:var(--radius-s); border:1px solid var(--border); background:var(--bg-el);
}
.icp-end { border-color:var(--accent); background:var(--accent2); }
.icp-icon { width:28px; height:28px; border-radius:7px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.icp-info { flex:1; }
.icp-name { font-size:12px; font-weight:700; color:var(--text1); }
.icp-sub  { font-size:10px; color:var(--muted); margin-top:1px; }

/* ══ ALERTAS CONFIG ══ */
.alertas-config { display:flex; flex-direction:column; }
.alerta-row {
  display:flex; align-items:center; gap:10px; padding:11px 18px;
  border-bottom:1px solid var(--border); transition:background .15s;
}
.alerta-row:last-child { border-bottom:none; }
.alerta-row:hover { background:var(--bg-el); }
.alerta-icon { width:28px; height:28px; border-radius:7px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.alerta-info { flex:1; }
.alerta-title { font-size:12px; font-weight:600; color:var(--text1); }
.alerta-sub   { font-size:10.5px; color:var(--muted); margin-top:1px; }

/* ══ TOGGLE ══ */
.toggle-wrap { position:relative; display:inline-block; width:36px; height:20px; flex-shrink:0; }
.toggle-wrap input { opacity:0; width:0; height:0; }
.toggle-slider {
  position:absolute; cursor:pointer; inset:0; background:var(--border2); border-radius:20px; transition:.3s;
}
.toggle-slider::before {
  content:''; position:absolute; height:14px; width:14px; left:3px; bottom:3px;
  background:#fff; border-radius:50%; transition:.3s; box-shadow:0 1px 3px rgba(0,0,0,.2);
}
.toggle-wrap input:checked + .toggle-slider { background:var(--accent); }
.toggle-wrap input:checked + .toggle-slider::before { transform:translateX(16px); }

/* ══ A3 PANEL ══ */
.a3-panel { padding:18px; display:flex; flex-direction:column; gap:14px; }
.section-label {
  display:flex; align-items:center; gap:6px;
  font-size:10.5px; font-weight:700; text-transform:uppercase; letter-spacing:.6px;
  color:var(--muted); margin-bottom:4px;
}
.a3-devices { display:flex; flex-direction:column; gap:8px; }
.a3-device {
  display:flex; align-items:center; gap:14px; padding:13px 16px;
  border-radius:var(--radius-s); border:1px solid var(--border); transition:all .2s;
}
.a3-connected    { background:var(--green2);  border-color:var(--green);  }
.a3-disconnected { background:var(--bg-el);   border-color:var(--border2); }
.a3-dev-icon { color:var(--text2); }
.a3-connected .a3-dev-icon { color:var(--green); }
.a3-dev-info { flex:1; }
.a3-dev-name { font-size:13px; font-weight:700; color:var(--text1); }
.a3-dev-sub  { font-size:11px; color:var(--muted); margin-top:2px; }
.a3-dev-status { display:flex; flex-direction:column; align-items:flex-end; gap:5px; }
.a3-cert-mini { text-align:right; }
.a3-cert-mini-name { font-size:11px; font-weight:600; color:var(--text1); }
.a3-cert-mini-val  { font-size:10px; color:var(--muted); }

/* ══ QUICK ACTIONS ══ */
.quick-actions { display:flex; flex-direction:column; gap:2px; padding:8px; }
.qa-btn {
  display:flex; align-items:center; gap:12px; padding:10px 12px;
  border-radius:var(--radius-s); cursor:pointer; transition:all .15s;
  background:transparent; border:none; font-family:inherit; text-align:left;
}
.qa-btn:hover { background:var(--bg-el); }
.qa-primary { background:var(--accent2); }
.qa-icon { width:34px; height:34px; border-radius:8px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.qa-label { font-size:12.5px; font-weight:700; color:var(--text1); }
.qa-sub   { font-size:10.5px; color:var(--muted); margin-top:2px; }
.qa-info  { flex:1; }

/* ══ SECURITY PANEL ══ */
.security-panel { display:flex; flex-direction:column; }
.security-row { display:flex; align-items:center; gap:10px; padding:11px 18px; border-bottom:1px solid var(--border); }
.security-row:last-child { border-bottom:none; }
.security-icon { width:28px; height:28px; border-radius:7px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.security-info { flex:1; }
.security-label { font-size:12px; font-weight:600; color:var(--text1); }
.security-val   { font-size:11px; color:var(--muted); margin-top:2px; }

/* ══ TABLE ══ */
.table-wrap { overflow-x:auto; }
.fiscal-table { width:100%; border-collapse:collapse; font-size:12.5px; }
.fiscal-table thead tr { background:var(--bg-el); border-bottom:2px solid var(--border); }
.fiscal-table th { padding:9px 14px; text-align:left; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.5px; color:var(--text2); white-space:nowrap; }
.fiscal-table tbody tr { border-bottom:1px solid var(--border); transition:background .15s; }
.fiscal-table tbody tr:hover { background:var(--bg-el); }
.fiscal-table td { padding:9px 14px; }
.cell-name { font-size:12.5px; font-weight:600; color:var(--text1); }
.cell-sub  { font-size:10.5px; color:var(--muted); margin-top:1px; }
.mono-bold { font-family:'Courier New',monospace; font-weight:700; }

/* ══ STATUS / TAG ══ */
.status-cell { display:flex; align-items:center; gap:5px; }
.status-dot  { width:6px; height:6px; border-radius:50%; flex-shrink:0; }
.dot-green  { background:var(--green); }
.dot-red    { background:var(--red);   }
.dot-yellow { background:var(--yellow);}
.dot-muted  { background:var(--muted); }
.tag-custom { font-size:10.5px; font-weight:700; padding:2px 8px; border-radius:12px; white-space:nowrap; }
.tag-green  { background:var(--green2);  color:var(--green);  }
.tag-orange { background:var(--accent2); color:var(--accent); }
.tag-yellow { background:var(--yellow2); color:var(--yellow); }
.tag-red    { background:var(--red2);    color:var(--red);    }
.tag-blue   { background:var(--blue2);   color:var(--blue);   }

/* ══ ROW ACTIONS ══ */
.row-actions { display:flex; gap:4px; }
.icon-btn {
  width:26px; height:26px; border-radius:6px;
  display:flex; align-items:center; justify-content:center;
  border:1px solid var(--border); background:var(--bg-card);
  color:var(--text2); cursor:pointer; transition:all .15s;
}
.icon-btn:hover:not(:disabled) { background:var(--bg-el2); color:var(--accent); border-color:var(--accent); }

/* ══ LOG LIST ══ */
.log-list { display:flex; flex-direction:column; }
.log-item { display:flex; align-items:flex-start; gap:10px; padding:11px 18px; border-bottom:1px solid var(--border); }
.log-item:last-child { border-bottom:none; }
.log-icon { width:26px; height:26px; border-radius:6px; display:flex; align-items:center; justify-content:center; flex-shrink:0; margin-top:1px; }
.log-info { flex:1; }
.log-title { font-size:12.5px; font-weight:600; color:var(--text1); }
.log-sub   { font-size:10.5px; color:var(--muted); margin-top:2px; }
.log-time  { font-size:10.5px; color:var(--muted); white-space:nowrap; }

/* ══ SPINNER ══ */
.spinner-sm {
  width:16px; height:16px; border-radius:50%;
  border:2px solid var(--border2);
  border-top-color:var(--accent);
  animation:spin .7s linear infinite;
}
@keyframes spin { to { transform:rotate(360deg); } }

/* ══ MODAL ══ */
.modal-overlay {
  position:fixed; inset:0; z-index:1000;
  background:rgba(0,0,0,.45); display:flex; align-items:center; justify-content:center;
  backdrop-filter:blur(3px);
}
.modal-box {
  background:var(--bg-card); border-radius:16px;
  width:min(92vw,640px); max-height:90vh;
  display:flex; flex-direction:column;
  box-shadow:0 24px 60px rgba(0,0,0,.2);
  overflow:hidden;
}
.modal-small { width:min(92vw,480px); }
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

/* ══ FORM ══ */
.form-section { display:flex; flex-direction:column; gap:14px; }
.form-row-2   { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
.form-field   { display:flex; flex-direction:column; gap:5px; }
.field-label  { font-size:10.5px; font-weight:700; text-transform:uppercase; letter-spacing:.6px; color:var(--muted); }
.form-input   { border:1px solid var(--border2); border-radius:var(--radius-s); padding:8px 11px; font-family:inherit; font-size:12.5px; color:var(--text1); background:var(--bg-card); outline:none; transition:border .15s; width:100%; box-sizing:border-box; }
.form-input:focus { border-color:var(--accent); }
.field-error  { display:flex; align-items:center; gap:4px; font-size:11px; color:var(--red); }

/* ══ UPLOAD AREA ══ */
.upload-drop-area {
  border:2px dashed var(--border2); border-radius:var(--radius);
  padding:28px 20px; display:flex; flex-direction:column; align-items:center; gap:8px;
  text-align:center; cursor:pointer; transition:all .2s;
  background:var(--bg-el);
}
.upload-drop-area:hover, .upload-drop-area.drag-over { border-color:var(--accent); background:var(--accent2); }
.upload-title { font-size:13px; font-weight:700; color:var(--text1); }
.upload-sub   { font-size:11.5px; color:var(--muted); }
.upload-file-name { display:flex; align-items:center; gap:5px; font-size:12px; font-weight:600; color:var(--green); margin-top:4px; }

/* ══ PASSWORD ══ */
.password-wrap { position:relative; display:flex; }
.password-wrap .form-input { padding-right:36px; }
.pass-toggle { position:absolute; right:8px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:var(--muted); padding:2px; display:flex; align-items:center; }
.pass-toggle:hover { color:var(--text1); }
.pass-strength { display:flex; align-items:center; gap:8px; margin-top:2px; }
.pass-bar { flex:1; height:4px; background:var(--border2); border-radius:20px; overflow:hidden; }
.pass-fill { height:100%; border-radius:20px; transition:width .3s,background .3s; }
.pass-label { font-size:10.5px; font-weight:700; white-space:nowrap; }
.strength-weak   .pass-fill  { background:var(--red); }
.strength-medium .pass-fill  { background:var(--yellow); }
.strength-strong .pass-fill  { background:var(--green); }
.strength-weak   { color:var(--red); }
.strength-medium { color:var(--yellow); }
.strength-strong { color:var(--green); }

/* ══ INFO BOX ══ */
.info-box {
  display:flex; gap:10px; align-items:flex-start;
  background:var(--blue2); border:1px solid var(--blue); border-radius:var(--radius-s);
  padding:12px 14px;
}
.danger-box { background:var(--red2); border-color:var(--red); }

/* ══ RENOVAR OPTIONS ══ */
.renovar-options { display:flex; flex-direction:column; gap:8px; }
.renovar-option {
  display:flex; align-items:center; gap:14px; padding:14px 16px;
  border-radius:var(--radius-s); border:1px solid var(--border);
  cursor:pointer; transition:all .15s; background:var(--bg-el);
}
.renovar-option:hover { border-color:var(--accent); background:var(--accent2); }
.renovar-option.selected { border-color:var(--accent); background:var(--accent2); }
.renovar-opt-icon { width:40px; height:40px; border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.renovar-opt-title { font-size:13px; font-weight:700; color:var(--text1); }
.renovar-opt-sub   { font-size:11.5px; color:var(--muted); margin-top:3px; }

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
  .kpi-grid  { grid-template-columns:repeat(2,1fr); }
  .grid-2-1  { grid-template-columns:1fr; }
  .cert-info-grid { grid-template-columns:repeat(2,1fr); }
}
@media (max-width:900px) {
  .grid-2    { grid-template-columns:1fr; }
  .form-row-2{ grid-template-columns:1fr; }
  .main-tabs { flex-wrap:wrap; }
  .topbar    { flex-wrap:wrap; gap:8px; }
  .cert-visual { flex-direction:column; text-align:center; }
  .cert-tags { justify-content:center; }
}
@media (max-width:640px) {
  .kpi-grid  { grid-template-columns:1fr; }
  .content   { padding:14px; }
  .cert-info-grid { grid-template-columns:1fr 1fr; }
  .cert-actions-row { flex-direction:column; }
  .icon-action-btn { justify-content:center; }
}
</style>