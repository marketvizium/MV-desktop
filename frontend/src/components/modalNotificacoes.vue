<template>
  <Teleport to="body">
    <Transition name="backdrop">
      <div v-if="modelValue" class="modal-backdrop" @click.self="close">
        <Transition name="modal-slide">
          <div v-if="modelValue" class="modal-shell">

            <!-- HEADER -->
            <div class="modal-head">
              <div class="head-left">
                <div class="head-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  </svg>
                </div>
                <div>
                  <h2 class="head-title">Central de Notificações</h2>
                  <p class="head-sub">{{ unreadCount }} não lidas · {{ filteredNotifications.length }} total</p>
                </div>
              </div>
              <div class="head-actions">
                <button class="icon-btn" title="Marcar todas como lidas" @click="markAllRead">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </button>
                <button class="icon-btn danger" title="Limpar todas" @click="confirmClear">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14H6L5 6"/>
                    <path d="M10 11v6M14 11v6"/>
                  </svg>
                </button>
                <button class="icon-btn close-btn" @click="close">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- TOOLBAR -->
            <div class="modal-toolbar">
              <div class="search-wrap">
                <svg class="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  v-model="search"
                  class="search-input"
                  placeholder="Buscar notificações..."
                  @input="currentPage = 1"
                />
                <button v-if="search" class="clear-search" @click="search = ''; currentPage = 1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
              <div class="filter-row">
                <button
                  v-for="f in filters"
                  :key="f.key"
                  :class="['filter-pill', { active: activeFilter === f.key }]"
                  @click="setFilter(f.key)"
                >
                  <span class="pill-dot" :style="{ background: f.color }"></span>
                  {{ f.label }}
                  <span class="pill-count">{{ getCount(f.key) }}</span>
                </button>
              </div>
            </div>

            <!-- SORT BAR -->
            <div class="sort-bar">
              <span class="sort-label">Ordenar por</span>
              <button :class="['sort-btn', { active: sortBy === 'date' }]" @click="sortBy = 'date'">Mais recente</button>
              <button :class="['sort-btn', { active: sortBy === 'type' }]" @click="sortBy = 'type'">Tipo</button>
              <button :class="['sort-btn', { active: sortBy === 'unread' }]" @click="sortBy = 'unread'">Não lidas</button>
              <span class="sort-spacer"></span>
              <label class="toggle-label">
                <input type="checkbox" v-model="showOnlyUnread" @change="currentPage = 1" />
                <span class="toggle-track"><span class="toggle-thumb"></span></span>
                Não lidas
              </label>
            </div>

            <!-- LIST -->
            <div class="modal-body" ref="bodyRef">
              <TransitionGroup name="notif" tag="div" class="notif-list">
                <div
                  v-for="n in paginatedNotifications"
                  :key="n.id"
                  :class="['notif-item', { unread: !n.read, expanded: expandedId === n.id }]"
                  @click="toggleExpand(n)"
                >
                  <div class="notif-row">
                    <div class="notif-icon-wrap" :style="{ background: typeMap[n.type].bg }">
                      <span v-html="typeMap[n.type].icon" :style="{ color: typeMap[n.type].color }"></span>
                    </div>
                    <div class="notif-body">
                      <div class="notif-top">
                        <span class="notif-title">{{ n.title }}</span>
                        <div class="notif-meta">
                          <span class="notif-time">{{ formatTime(n.date) }}</span>
                          <span v-if="!n.read" class="unread-dot"></span>
                        </div>
                      </div>
                      <p class="notif-desc">{{ n.description }}</p>
                      <div class="notif-tags">
                        <span class="tag" :style="{ background: typeMap[n.type].bg, color: typeMap[n.type].color }">{{ typeMap[n.type].label }}</span>
                        <span v-if="n.amount" class="tag amount" :class="n.amount > 0 ? 'pos' : 'neg'">
                          {{ n.amount > 0 ? '+' : '' }}{{ formatCurrency(n.amount) }}
                        </span>
                        <span v-if="n.priority === 'alta'" class="tag priority">⚡ Alta</span>
                      </div>
                    </div>
                    <div class="notif-actions" @click.stop>
                      <button class="notif-btn" @click="markRead(n)" title="Marcar como lida">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </button>
                      <button class="notif-btn danger" @click="removeNotif(n.id)" title="Remover">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                  </div>

                  <!-- EXPANDED DETAIL -->
                  <Transition name="expand">
                    <div v-if="expandedId === n.id" class="notif-detail">
                      <div class="detail-grid">
                        <div class="detail-cell" v-for="d in n.details" :key="d.label">
                          <span class="detail-label">{{ d.label }}</span>
                          <span class="detail-val">{{ d.value }}</span>
                        </div>
                      </div>
                      <div v-if="n.actions?.length" class="detail-actions">
                        <button v-for="a in n.actions" :key="a.label" :class="['detail-action-btn', a.style]">{{ a.label }}</button>
                      </div>
                    </div>
                  </Transition>
                </div>
              </TransitionGroup>

              <!-- EMPTY -->
              <div v-if="filteredNotifications.length === 0" class="empty-state">
                <div class="empty-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                </div>
                <p>Nenhuma notificação encontrada</p>
                <span>Tente ajustar os filtros ou a busca</span>
              </div>
            </div>

            <!-- FOOTER / PAGINATION -->
            <div class="modal-foot">
              <div class="pagination">
                <button class="page-btn" :disabled="currentPage === 1" @click="currentPage--">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                <button
                  v-for="p in totalPages"
                  :key="p"
                  :class="['page-btn', 'num', { active: p === currentPage }]"
                  @click="currentPage = p"
                >{{ p }}</button>
                <button class="page-btn" :disabled="currentPage === totalPages" @click="currentPage++">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>
              <span class="foot-info">{{ (currentPage - 1) * perPage + 1 }}–{{ Math.min(currentPage * perPage, filteredNotifications.length) }} de {{ filteredNotifications.length }}</span>
            </div>

            <!-- CONFIRM CLEAR OVERLAY -->
            <Transition name="confirm">
              <div v-if="showConfirm" class="confirm-overlay" @click.self="showConfirm = false">
                <div class="confirm-box">
                  <div class="confirm-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff4d4f" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6l-1 14H6L5 6"/>
                    </svg>
                  </div>
                  <h3>Limpar todas as notificações?</h3>
                  <p>Esta ação não pode ser desfeita.</p>
                  <div class="confirm-btns">
                    <button class="confirm-cancel" @click="showConfirm = false">Cancelar</button>
                    <button class="confirm-ok" @click="clearAll">Confirmar</button>
                  </div>
                </div>
              </div>
            </Transition>

          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false }
})
const emit = defineEmits(['update:modelValue'])

const close = () => emit('update:modelValue', false)

// ── STATE ──────────────────────────────────────────────────────────────
const search = ref('')
const activeFilter = ref('all')
const sortBy = ref('date')
const showOnlyUnread = ref(false)
const currentPage = ref(1)
const perPage = 6
const expandedId = ref(null)
const showConfirm = ref(false)
const bodyRef = ref(null)

// ── TYPE MAP ──────────────────────────────────────────────────────────
const typeMap = {
  financeiro:  { label: 'Financeiro',  color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   icon: svgIcon('M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6') },
  estoque:     { label: 'Estoque',     color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',  icon: svgIcon('M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4') },
  vendas:      { label: 'Vendas',      color: '#ff8049', bg: 'rgba(255,128,73,0.1)',  icon: svgIcon('M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 7M17 13l1.5 7M9 20a1 1 0 1 0 0 2 1 1 0 0 0 0-2zM20 20a1 1 0 1 0 0 2 1 1 0 0 0 0-2z') },
  sistema:     { label: 'Sistema',     color: '#a855f7', bg: 'rgba(168,85,247,0.1)',  icon: svgIcon('M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 0 0 2.572-1.065z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z') },
  alerta:      { label: 'Alerta',      color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  icon: svgIcon('M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01') },
  pagamento:   { label: 'Pagamento',   color: '#06b6d4', bg: 'rgba(6,182,212,0.1)',   icon: svgIcon('M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3z') },
  cliente:     { label: 'Cliente',     color: '#ec4899', bg: 'rgba(236,72,153,0.1)',  icon: svgIcon('M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z') },
  integracao:  { label: 'Integração',  color: '#14b8a6', bg: 'rgba(20,184,166,0.1)', icon: svgIcon('M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71 M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71') },
}

function svgIcon(d) {
  return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>`
}

// ── MOCK DATA ─────────────────────────────────────────────────────────
const notifications = ref([
  {
    id: 1, type: 'financeiro', read: false, priority: 'alta',
    title: 'Receita diária superada', date: new Date(Date.now() - 3 * 60000),
    description: 'Meta de R$ 10.000 atingida às 14:32. Receita atual: R$ 12.847,00.',
    amount: 12847,
    details: [
      { label: 'Período', value: 'Hoje, 00:00–14:32' },
      { label: 'Meta', value: 'R$ 10.000,00' },
      { label: 'Atingido', value: 'R$ 12.847,00' },
      { label: 'Margem', value: '+28,47%' },
    ],
    actions: [{ label: 'Ver Relatório', style: 'primary' }, { label: 'Exportar', style: 'ghost' }]
  },
  {
    id: 2, type: 'estoque', read: false, priority: 'alta',
    title: 'Estoque crítico — SKU #4821', date: new Date(Date.now() - 18 * 60000),
    description: 'Produto "Tênis Runner Pro 42" com apenas 2 unidades. Ponto de reposição: 10.',
    details: [
      { label: 'SKU', value: '#4821' },
      { label: 'Produto', value: 'Tênis Runner Pro 42' },
      { label: 'Em estoque', value: '2 un.' },
      { label: 'Ponto reposição', value: '10 un.' },
    ],
    actions: [{ label: 'Emitir Pedido', style: 'primary' }, { label: 'Ignorar', style: 'ghost' }]
  },
  {
    id: 3, type: 'vendas', read: false, priority: 'normal',
    title: 'Nova venda — Pedido #10482', date: new Date(Date.now() - 35 * 60000),
    description: 'Venda de R$ 689,90 aprovada. Cliente: Mariana Souza. Forma: Pix.',
    amount: 689.90,
    details: [
      { label: 'Pedido', value: '#10482' },
      { label: 'Cliente', value: 'Mariana Souza' },
      { label: 'Valor', value: 'R$ 689,90' },
      { label: 'Pagamento', value: 'Pix (aprovado)' },
      { label: 'Itens', value: '3 produtos' },
    ],
    actions: [{ label: 'Ver Pedido', style: 'primary' }]
  },
  {
    id: 4, type: 'pagamento', read: true, priority: 'normal',
    title: 'Pagamento de fornecedor liquidado', date: new Date(Date.now() - 2 * 3600000),
    description: 'Boleto Fornecedor Alfa Ltda. de R$ 3.200,00 quitado com sucesso.',
    amount: -3200,
    details: [
      { label: 'Fornecedor', value: 'Alfa Ltda.' },
      { label: 'Valor', value: 'R$ 3.200,00' },
      { label: 'Vencimento', value: '20/04/2026' },
      { label: 'Status', value: 'Pago' },
    ],
    actions: [{ label: 'Ver Comprovante', style: 'primary' }]
  },
  {
    id: 5, type: 'sistema', read: true, priority: 'normal',
    title: 'Backup automático concluído', date: new Date(Date.now() - 5 * 3600000),
    description: 'Backup diário do banco de dados realizado com sucesso. 1.2 GB armazenados.',
    details: [
      { label: 'Tamanho', value: '1.2 GB' },
      { label: 'Duração', value: '4 min 12 s' },
      { label: 'Destino', value: 'AWS S3' },
      { label: 'Status', value: 'Sucesso' },
    ]
  },
  {
    id: 6, type: 'alerta', read: false, priority: 'alta',
    title: 'Tentativa de acesso suspeita', date: new Date(Date.now() - 7 * 3600000),
    description: '5 tentativas de login falhadas detectadas para o usuário admin@loja.com.',
    details: [
      { label: 'Usuário', value: 'admin@loja.com' },
      { label: 'Tentativas', value: '5' },
      { label: 'IP', value: '187.32.44.12' },
      { label: 'Localização', value: 'São Paulo, BR' },
    ],
    actions: [{ label: 'Bloquear IP', style: 'danger' }, { label: 'Ver Log', style: 'ghost' }]
  },
  {
    id: 7, type: 'cliente', read: true, priority: 'normal',
    title: 'Novo cadastro de cliente', date: new Date(Date.now() - 9 * 3600000),
    description: 'Carlos Menezes cadastrou-se e verificou e-mail. Segmento: Pessoa Física.',
    details: [
      { label: 'Nome', value: 'Carlos Menezes' },
      { label: 'E-mail', value: 'carlos@email.com' },
      { label: 'Segmento', value: 'Pessoa Física' },
      { label: 'Canal', value: 'App Mobile' },
    ],
    actions: [{ label: 'Ver Perfil', style: 'primary' }]
  },
  {
    id: 8, type: 'integracao', read: false, priority: 'alta',
    title: 'Erro na integração Mercado Livre', date: new Date(Date.now() - 11 * 3600000),
    description: 'Token de acesso expirado. Sincronização de produtos pausada.',
    details: [
      { label: 'Integração', value: 'Mercado Livre' },
      { label: 'Erro', value: 'Token expirado (401)' },
      { label: 'Afetados', value: '47 produtos' },
      { label: 'Última sync', value: 'Há 3 horas' },
    ],
    actions: [{ label: 'Reconectar', style: 'primary' }, { label: 'Ver Detalhes', style: 'ghost' }]
  },
  {
    id: 9, type: 'estoque', read: true, priority: 'normal',
    title: 'Lote recebido — NF #8821', date: new Date(Date.now() - 1440 * 60000),
    description: '120 unidades de "Camiseta Básica P/M/G" adicionadas ao estoque.',
    details: [
      { label: 'NF', value: '#8821' },
      { label: 'Fornecedor', value: 'Confecções Beta' },
      { label: 'Qtd recebida', value: '120 un.' },
      { label: 'Conferente', value: 'João Alves' },
    ]
  },
  {
    id: 10, type: 'financeiro', read: false, priority: 'normal',
    title: 'Chargeback solicitado', date: new Date(Date.now() - 1500 * 60000),
    description: 'Pedido #9871 — R$ 349,00 contestado pelo portador do cartão.',
    amount: -349,
    details: [
      { label: 'Pedido', value: '#9871' },
      { label: 'Valor', value: 'R$ 349,00' },
      { label: 'Prazo resposta', value: '22/04/2026' },
      { label: 'Status', value: 'Em análise' },
    ],
    actions: [{ label: 'Responder Contestação', style: 'danger' }, { label: 'Ver Pedido', style: 'ghost' }]
  },
  {
    id: 11, type: 'vendas', read: true, priority: 'normal',
    title: 'Meta semanal atingida', date: new Date(Date.now() - 1600 * 60000),
    description: 'Semana 16: R$ 48.320,00 em vendas. Meta era R$ 45.000,00.',
    amount: 48320,
    details: [
      { label: 'Semana', value: '14–20 Abr 2026' },
      { label: 'Vendas', value: 'R$ 48.320,00' },
      { label: 'Meta', value: 'R$ 45.000,00' },
      { label: 'Acima da meta', value: '+7,4%' },
    ]
  },
  {
    id: 12, type: 'sistema', read: true, priority: 'normal',
    title: 'Atualização de sistema disponível', date: new Date(Date.now() - 2000 * 60000),
    description: 'Versão 4.2.1 disponível. Correções de segurança e melhorias de desempenho.',
    details: [
      { label: 'Versão atual', value: '4.1.8' },
      { label: 'Nova versão', value: '4.2.1' },
      { label: 'Tipo', value: 'Segurança + Performance' },
      { label: 'Janela', value: '02:00–03:00' },
    ],
    actions: [{ label: 'Agendar Atualização', style: 'primary' }, { label: 'Ver Changelog', style: 'ghost' }]
  },
])

// ── FILTERS ───────────────────────────────────────────────────────────
const filters = [
  { key: 'all',       label: 'Todos',      color: '#64748b' },
  { key: 'financeiro',label: 'Financeiro', color: '#22c55e' },
  { key: 'estoque',   label: 'Estoque',    color: '#3b82f6' },
  { key: 'vendas',    label: 'Vendas',     color: '#ff8049' },
  { key: 'pagamento', label: 'Pagamento',  color: '#06b6d4' },
  { key: 'alerta',    label: 'Alertas',    color: '#f59e0b' },
  { key: 'sistema',   label: 'Sistema',    color: '#a855f7' },
  { key: 'cliente',   label: 'Clientes',   color: '#ec4899' },
  { key: 'integracao',label: 'Integração', color: '#14b8a6' },
]

const getCount = (key) => key === 'all'
  ? notifications.value.length
  : notifications.value.filter(n => n.type === key).length

const setFilter = (key) => { activeFilter.value = key; currentPage.value = 1 }

// ── COMPUTED ──────────────────────────────────────────────────────────
const filteredNotifications = computed(() => {
  let list = notifications.value
  if (activeFilter.value !== 'all') list = list.filter(n => n.type === activeFilter.value)
  if (showOnlyUnread.value) list = list.filter(n => !n.read)
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    list = list.filter(n => n.title.toLowerCase().includes(q) || n.description.toLowerCase().includes(q))
  }
  if (sortBy.value === 'date')   list = [...list].sort((a, b) => b.date - a.date)
  if (sortBy.value === 'type')   list = [...list].sort((a, b) => a.type.localeCompare(b.type))
  if (sortBy.value === 'unread') list = [...list].sort((a, b) => Number(!a.read) - Number(!b.read))
  return list
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredNotifications.value.length / perPage)))
const paginatedNotifications = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return filteredNotifications.value.slice(start, start + perPage)
})
const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

// ── ACTIONS ───────────────────────────────────────────────────────────
const markRead = (n) => { n.read = true }
const markAllRead = () => notifications.value.forEach(n => n.read = true)
const removeNotif = (id) => {
  notifications.value = notifications.value.filter(n => n.id !== id)
  if (expandedId.value === id) expandedId.value = null
}
const confirmClear = () => { showConfirm.value = true }
const clearAll = () => {
  if (activeFilter.value === 'all') {
    notifications.value = []
  } else {
    notifications.value = notifications.value.filter(n => n.type !== activeFilter.value)
  }
  showConfirm.value = false
  currentPage.value = 1
}
const toggleExpand = (n) => {
  markRead(n)
  expandedId.value = expandedId.value === n.id ? null : n.id
}

// ── UTILS ─────────────────────────────────────────────────────────────
const formatTime = (date) => {
  const diff = Date.now() - date.getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'agora mesmo'
  if (m < 60) return `${m}min atrás`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h atrás`
  return `${Math.floor(h / 24)}d atrás`
}
const formatCurrency = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(v))

// Reset page on filter change
watch([search, activeFilter, showOnlyUnread, sortBy], () => {
  if (currentPage.value > totalPages.value) currentPage.value = 1
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=JetBrains+Mono:wght@400;500&display=swap');

/* ── VARIABLES ──────────────────────────────────────── */
:root {
  --accent: #ff8049;
  --accent2: rgba(255,128,73,0.1);
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

/* ── BACKDROP ───────────────────────────────────────── */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(100,116,139,0.35);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  font-family: 'DM Sans', sans-serif;
}

/* ── SHELL ──────────────────────────────────────────── */
.modal-shell {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  width: 680px;
  max-width: calc(100vw - 32px);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow:
    0 0 0 1px rgba(0,0,0,0.03),
    0 32px 80px rgba(15,23,42,0.14),
    0 8px 24px rgba(15,23,42,0.08);
  position: relative;
}

/* ── HEADER ─────────────────────────────────────────── */
.modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 16px;
  border-bottom: 1px solid #f1f5f9;
  background: linear-gradient(135deg, rgba(255,128,73,0.04) 0%, transparent 60%);
}
.head-left { display: flex; align-items: center; gap: 12px; }
.head-icon {
  width: 40px; height: 40px; border-radius: 12px;
  background: rgba(255,128,73,0.1);
  border: 1px solid rgba(255,128,73,0.22);
  display: flex; align-items: center; justify-content: center;
  color: #ff8049;
}
.head-title { font-size: 1rem; font-weight: 600; color: #0f172a; letter-spacing: -0.01em; }
.head-sub { font-size: 0.72rem; color: #94a3b8; margin-top: 1px; }
.head-actions { display: flex; gap: 6px; }

.icon-btn {
  width: 32px; height: 32px; border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #94a3b8;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.icon-btn:hover { background: #f1f5f9; color: #475569; border-color: #cbd5e1; }
.icon-btn.danger:hover { background: rgba(255,77,79,0.08); color: #ef4444; border-color: rgba(239,68,68,0.3); }
.icon-btn.close-btn:hover { background: #f1f5f9; color: #334155; }

/* ── TOOLBAR ────────────────────────────────────────── */
.modal-toolbar {
  padding: 14px 20px 12px;
  border-bottom: 1px solid #f1f5f9;
  display: flex; flex-direction: column; gap: 10px;
}
.search-wrap {
  position: relative; display: flex; align-items: center;
}
.search-icon {
  position: absolute; left: 11px; color: #94a3b8; pointer-events: none;
}
.search-input {
  width: 100%;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 8px 34px 8px 32px;
  color: #0f172a;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.85rem;
  outline: none;
  transition: border-color 0.2s, background 0.2s;
}
.search-input::placeholder { color: #94a3b8; }
.search-input:focus { border-color: rgba(255,128,73,0.5); background: #fff; box-shadow: 0 0 0 3px rgba(255,128,73,0.08); }
.clear-search {
  position: absolute; right: 10px; background: none; border: none;
  color: #94a3b8; cursor: pointer; display: flex; align-items: center;
  transition: color 0.15s;
}
.clear-search:hover { color: #475569; }

.filter-row { display: flex; gap: 6px; flex-wrap: wrap; }
.filter-pill {
  display: flex; align-items: center; gap: 5px;
  padding: 4px 10px;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #64748b;
  font-size: 0.72rem; font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  font-family: 'DM Sans', sans-serif;
}
.filter-pill:hover { border-color: #cbd5e1; color: #334155; background: #f1f5f9; }
.filter-pill.active { background: rgba(255,128,73,0.08); border-color: rgba(255,128,73,0.35); color: #ff8049; }
.pill-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.pill-count {
  background: #e2e8f0; border-radius: 10px;
  padding: 0 5px; font-size: 0.65rem; color: #64748b;
}
.filter-pill.active .pill-count { background: rgba(255,128,73,0.15); color: #ff8049; }

/* ── SORT BAR ───────────────────────────────────────── */
.sort-bar {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 20px;
  border-bottom: 1px solid #f1f5f9;
  background: #fafafa;
}
.sort-label { font-size: 0.7rem; color: #94a3b8; margin-right: 4px; white-space: nowrap; }
.sort-btn {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.72rem; font-weight: 500;
  padding: 3px 9px; border-radius: 6px;
  border: 1px solid transparent;
  background: none; color: #64748b; cursor: pointer;
  transition: all 0.15s;
}
.sort-btn:hover { color: #334155; background: #f1f5f9; }
.sort-btn.active { background: rgba(255,128,73,0.08); color: #ff8049; border-color: rgba(255,128,73,0.25); }
.sort-spacer { flex: 1; }

.toggle-label {
  display: flex; align-items: center; gap: 7px;
  font-size: 0.72rem; color: #64748b; cursor: pointer;
  user-select: none;
}
.toggle-label input { display: none; }
.toggle-track {
  width: 28px; height: 16px; border-radius: 8px;
  background: #cbd5e1;
  position: relative; transition: background 0.2s;
}
.toggle-label input:checked + .toggle-track { background: #ff8049; }
.toggle-thumb {
  position: absolute; top: 2px; left: 2px;
  width: 12px; height: 12px; border-radius: 50%;
  background: #fff; transition: transform 0.2s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.15);
}
.toggle-label input:checked + .toggle-track .toggle-thumb { transform: translateX(12px); }

/* ── BODY ───────────────────────────────────────────── */
.modal-body {
  flex: 1; overflow-y: auto; padding: 8px 12px;
  scrollbar-width: thin; scrollbar-color: #e2e8f0 transparent;
}
.modal-body::-webkit-scrollbar { width: 4px; }
.modal-body::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 2px; }
.notif-list { display: flex; flex-direction: column; gap: 4px; }

/* ── NOTIF ITEM ─────────────────────────────────────── */
.notif-item {
  border-radius: 12px;
  border: 1px solid #f1f5f9;
  background: #fafafa;
  cursor: pointer;
  transition: all 0.18s;
  overflow: hidden;
}
.notif-item:hover { background: #f8fafc; border-color: #e2e8f0; box-shadow: 0 2px 8px rgba(15,23,42,0.06); }
.notif-item.unread { border-left: 2px solid #ff8049; background: rgba(255,128,73,0.02); }
.notif-item.expanded { border-color: rgba(255,128,73,0.3); background: rgba(255,128,73,0.02); box-shadow: 0 2px 12px rgba(255,128,73,0.08); }

.notif-row { display: flex; align-items: flex-start; gap: 12px; padding: 12px 12px 10px; }

.notif-icon-wrap {
  width: 36px; height: 36px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; margin-top: 1px;
}

.notif-body { flex: 1; min-width: 0; }
.notif-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 3px; }
.notif-title { font-size: 0.85rem; font-weight: 600; color: #0f172a; line-height: 1.3; }
.notif-meta { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
.notif-time { font-size: 0.68rem; color: #94a3b8; white-space: nowrap; }
.unread-dot { width: 7px; height: 7px; border-radius: 50%; background: #ff8049; flex-shrink: 0; }
.notif-desc { font-size: 0.78rem; color: #64748b; line-height: 1.5; margin-bottom: 7px; }

.notif-tags { display: flex; gap: 5px; flex-wrap: wrap; }
.tag {
  font-size: 0.65rem; font-weight: 600;
  padding: 2px 7px; border-radius: 10px;
  text-transform: uppercase; letter-spacing: 0.4px;
}
.tag.amount { font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; text-transform: none; letter-spacing: 0; }
.tag.amount.pos { background: rgba(34,197,94,0.1); color: #16a34a; }
.tag.amount.neg { background: rgba(239,68,68,0.1); color: #dc2626; }
.tag.priority { background: rgba(245,158,11,0.1); color: #d97706; }

.notif-actions {
  display: flex; flex-direction: column; gap: 4px;
  opacity: 0; transition: opacity 0.15s;
}
.notif-item:hover .notif-actions { opacity: 1; }
.notif-btn {
  width: 24px; height: 24px; border-radius: 6px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #94a3b8; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.notif-btn:hover { background: #f1f5f9; color: #475569; border-color: #cbd5e1; }
.notif-btn.danger:hover { background: rgba(239,68,68,0.08); color: #ef4444; border-color: rgba(239,68,68,0.3); }

/* ── EXPANDED DETAIL ────────────────────────────────── */
.notif-detail {
  border-top: 1px solid #f1f5f9;
  padding: 12px 12px 14px 60px;
  background: #f8fafc;
}
.detail-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 10px; margin-bottom: 12px;
}
.detail-cell { display: flex; flex-direction: column; gap: 2px; }
.detail-label { font-size: 0.62rem; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
.detail-val { font-size: 0.78rem; color: #334155; font-family: 'JetBrains Mono', monospace; }
.detail-actions { display: flex; gap: 7px; flex-wrap: wrap; }
.detail-action-btn {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.75rem; font-weight: 600;
  padding: 5px 14px; border-radius: 8px;
  border: none; cursor: pointer; transition: all 0.15s;
}
.detail-action-btn.primary { background: #ff8049; color: #fff; }
.detail-action-btn.primary:hover { filter: brightness(1.08); }
.detail-action-btn.ghost { background: #fff; color: #64748b; border: 1px solid #e2e8f0; }
.detail-action-btn.ghost:hover { background: #f1f5f9; color: #334155; border-color: #cbd5e1; }
.detail-action-btn.danger { background: rgba(239,68,68,0.08); color: #ef4444; border: 1px solid rgba(239,68,68,0.2); }
.detail-action-btn.danger:hover { background: rgba(239,68,68,0.15); }

/* ── EMPTY STATE ────────────────────────────────────── */
.empty-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 48px 24px; gap: 8px;
}
.empty-icon { color: #cbd5e1; margin-bottom: 4px; }
.empty-state p { font-size: 0.9rem; color: #64748b; font-weight: 500; }
.empty-state span { font-size: 0.78rem; color: #94a3b8; }

/* ── FOOTER ─────────────────────────────────────────── */
.modal-foot {
  padding: 12px 20px;
  border-top: 1px solid #f1f5f9;
  background: #fafafa;
  display: flex; align-items: center; justify-content: center; gap: 12px;
}
.pagination { display: flex; gap: 4px; align-items: center; }
.page-btn {
  min-width: 30px; height: 30px; border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #64748b; font-size: 0.78rem; font-weight: 500;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  font-family: 'DM Sans', sans-serif;
  transition: all 0.15s;
}
.page-btn:hover:not(:disabled) { background: #f1f5f9; color: #334155; border-color: #cbd5e1; }
.page-btn.active { background: rgba(255,128,73,0.1); color: #ff8049; border-color: rgba(255,128,73,0.35); }
.page-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.foot-info { font-size: 0.72rem; color: #94a3b8; }

/* ── CONFIRM OVERLAY ────────────────────────────────── */
.confirm-overlay {
  position: absolute; inset: 0; background: rgba(248,250,252,0.82);
  backdrop-filter: blur(4px); border-radius: 20px;
  display: flex; align-items: center; justify-content: center; z-index: 10;
}
.confirm-box {
  background: #ffffff; border: 1px solid #e2e8f0;
  border-radius: 16px; padding: 28px 32px;
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  box-shadow: 0 16px 48px rgba(15,23,42,0.12);
}
.confirm-icon {
  width: 52px; height: 52px; border-radius: 50%;
  background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2);
  display: flex; align-items: center; justify-content: center;
}
.confirm-box h3 { font-size: 0.95rem; font-weight: 600; color: #0f172a; }
.confirm-box p { font-size: 0.8rem; color: #64748b; }
.confirm-btns { display: flex; gap: 8px; margin-top: 6px; }
.confirm-cancel {
  font-family: 'DM Sans', sans-serif; font-size: 0.82rem; font-weight: 500;
  padding: 7px 18px; border-radius: 9px;
  border: 1px solid #e2e8f0;
  background: #f8fafc; color: #64748b; cursor: pointer;
  transition: all 0.15s;
}
.confirm-cancel:hover { background: #f1f5f9; color: #334155; border-color: #cbd5e1; }
.confirm-ok {
  font-family: 'DM Sans', sans-serif; font-size: 0.82rem; font-weight: 600;
  padding: 7px 18px; border-radius: 9px;
  border: none; background: #ef4444; color: #fff; cursor: pointer;
  transition: all 0.15s;
}
.confirm-ok:hover { filter: brightness(1.08); }

/* ── TRANSITIONS ─────────────────────────────────────── */
.backdrop-enter-active, .backdrop-leave-active { transition: opacity 0.25s ease; }
.backdrop-enter-from, .backdrop-leave-to { opacity: 0; }

.modal-slide-enter-active { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.modal-slide-leave-active { transition: all 0.2s ease; }
.modal-slide-enter-from { opacity: 0; transform: scale(0.94) translateY(16px); }
.modal-slide-leave-to { opacity: 0; transform: scale(0.97) translateY(8px); }

.expand-enter-active, .expand-leave-active { transition: all 0.2s ease; overflow: hidden; }
.expand-enter-from, .expand-leave-to { opacity: 0; max-height: 0; }
.expand-enter-to, .expand-leave-from { opacity: 1; max-height: 300px; }

.confirm-enter-active, .confirm-leave-active { transition: all 0.2s ease; }
.confirm-enter-from, .confirm-leave-to { opacity: 0; }

.notif-enter-active { transition: all 0.25s ease; }
.notif-leave-active { transition: all 0.2s ease; position: absolute; width: 100%; }
.notif-enter-from { opacity: 0; transform: translateX(-12px); }
.notif-leave-to { opacity: 0; transform: translateX(12px); }
.notif-move { transition: transform 0.2s ease; }
</style>