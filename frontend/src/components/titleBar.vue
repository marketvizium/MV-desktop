<template>
  <div
    class="title-bar"
    @mousedown="startDrag"
    @dblclick="toggleMaximize"
  >
    <!-- Logo -->
    <div class="title-bar__logo" style="font-weight: 800; color: #222; font-size: 19px;">
      M<span style="color: #ff8049;">V</span>
    </div>

    <!-- App Name (centralizado) -->
    <div class="title-bar__center">
      <span class="title-bar__app-name">{{ appName }}</span>
    </div>

    <!-- Window Controls -->
    <div class="title-bar__controls" @mousedown.stop>
      <button
        class="title-bar__btn title-bar__btn--minimize"
        @click="minimize"
        title="Minimizar"
        aria-label="Minimizar janela"
      >
        <span class="material-symbols-outlined">remove</span>
      </button>

      <button
        class="title-bar__btn title-bar__btn--maximize"
        @click="toggleMaximize"
        :title="isMaximized ? 'Restaurar' : 'Maximizar'"
        :aria-label="isMaximized ? 'Restaurar janela' : 'Maximizar janela'"
      >
        <span class="material-symbols-outlined">
          {{ isMaximized ? 'filter_none' : 'crop_square' }}
        </span>
      </button>

      <button
        class="title-bar__btn title-bar__btn--close"
        @click="close"
        title="Fechar"
        aria-label="Fechar janela"
      >
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TitleBar',

  props: {
    appName: {
      type: String,
      default: 'Marviz'
    }
  },

  emits: ['minimize', 'maximize', 'restore', 'close'],

  data() {
    return {
      isMaximized: false,
      isDragging: false,
      dragOffsetX: 0,
      dragOffsetY: 0
    }
  },

  methods: {
    minimize() {
      // Integração Electron (descomente se necessário):
      if (window.electronAPI) window.electronAPI.minimize()
    },

    toggleMaximize() {
      this.isMaximized = !this.isMaximized
      if (this.isMaximized) {
        if (window.electronAPI) window.electronAPI.maximize()
      } else {
        if (window.electronAPI) window.electronAPI.maximize()
      }
    },

    close() {
      if (window.electronAPI) window.electronAPI.close()
    },

    startDrag(event) {
      // Apenas botão primário do mouse
      if (event.button !== 0) return

      this.isDragging = true
      this.dragOffsetX = event.clientX - window.screenX
      this.dragOffsetY = event.clientY - window.screenY

      document.addEventListener('mousemove', this.onDrag)
      document.addEventListener('mouseup', this.stopDrag)

      // Cursor de arrasto
      document.body.style.cursor = 'grabbing'
      document.body.style.userSelect = 'none'
    },

    onDrag(event) {
      if (!this.isDragging) return

      const newX = event.screenX - this.dragOffsetX
      const newY = event.screenY - this.dragOffsetY

      // Electron: mover janela nativa
      // if (window.electronAPI) {
      //   window.electronAPI.setWindowPosition(newX, newY)
      // }

      // Web fallback: mover elemento pai se for flutuante
      const parent = this.$el.closest('.window, .floating-window')
      if (parent && parent.style.position === 'fixed') {
        parent.style.left = newX + 'px'
        parent.style.top  = newY + 'px'
      }

      this.$emit('drag', { x: newX, y: newY })
    },

    stopDrag() {
      this.isDragging = false
      document.removeEventListener('mousemove', this.onDrag)
      document.removeEventListener('mouseup', this.stopDrag)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  },

  beforeUnmount() {
    document.removeEventListener('mousemove', this.onDrag)
    document.removeEventListener('mouseup', this.stopDrag)
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20,400,0,0');

/* ─── Variáveis ─────────────────────────────────────────────── */
.title-bar {
  --tb-height: 40px;
  --tb-bg: #FFF;
  --tb-border: rgba(255, 255, 255, 0.06);
  --tb-text: #1a1a2e;
  --tb-text-muted: rgba(232, 232, 240, 0.5);
  --tb-accent: #6c63ff;

  --btn-size: 28px;
  --btn-icon: 16px;
  --btn-radius: 6px;

  --btn-minimize-hover-bg: rgba(110, 110, 110, 0.15);
  --btn-minimize-hover-color: #ffbd2e;
  --btn-maximize-hover-bg: rgba(110, 110, 110, 0.15);
  --btn-maximize-hover-color: #27c93f;
  --btn-close-hover-bg: rgba(228, 8, 8, 0.15);
  --btn-close-hover-color: #ff1003;
  z-index: 999;
}

/* ─── Barra ─────────────────────────────────────────────────── */
.title-bar {
  position: relative;
  display: flex;
  align-items: center;
  height: var(--tb-height);
  background: var(--tb-bg);
  border-bottom: 1px solid var(--tb-border);
  padding: 0 8px 0 12px;
  cursor: grab;
  user-select: none;
  -webkit-app-region: drag; /* Electron drag nativo */
  box-shadow: 0 1px 0 rgba(255,255,255,0.04);
  border-color: #EEE;
}

.title-bar:active {
  cursor: grabbing;
}

/* ─── Logo ──────────────────────────────────────────────────── */
.title-bar__logo {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  z-index: 1;
}

.title-bar__logo-img {
  height: 35px;
  width: auto;
  object-fit: contain;
  opacity: 0.92;
  pointer-events: none;
}

/* ─── Nome centralizado (absolute para centralização perfeita) ── */
.title-bar__center {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  pointer-events: none;
}

.title-bar__app-name {
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: var(--tb-text);
  letter-spacing: 0.02em;
  white-space: nowrap;
}

/* ─── Controles (lado direito) ──────────────────────────────── */
.title-bar__controls {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-left: auto;
  flex-shrink: 0;
  -webkit-app-region: no-drag; /* Electron: botões clicáveis */
  z-index: 1;
}

/* ─── Botões base ───────────────────────────────────────────── */
.title-bar__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--btn-size);
  height: var(--btn-size);
  border: none;
  background: transparent;
  border-radius: var(--btn-radius);
  cursor: pointer;
  color: var(--tb-text-muted);
  transition:
    background 0.15s ease,
    color 0.15s ease,
    transform 0.1s ease;
  outline: none;
  padding: 0;
}

.title-bar__btn .material-symbols-outlined {
  font-size: var(--btn-icon);
  font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20;
  line-height: 1;
  pointer-events: none;
  color: #1e1e1e;
}

.title-bar__btn:focus-visible {
  box-shadow: 0 0 0 2px var(--tb-accent);
}

/* ─── Hover individual ──────────────────────────────────────── */
.title-bar__btn--minimize:hover {
  background: var(--btn-minimize-hover-bg);
  color: var(--btn-minimize-hover-color);
  transform: scale(1.08);
}

.title-bar__btn--maximize:hover {
  background: var(--btn-maximize-hover-bg);
  color: var(--btn-maximize-hover-color);
  transform: scale(1.08);
}

.title-bar__btn--close:hover {
  background: var(--btn-close-hover-bg);
  color: var(--btn-close-hover-color);
  transform: scale(1.08);
}

.title-bar__btn:active {
  transform: scale(0.93) !important;
  opacity: 0.8;
}

/* ─── Estado maximizado ─────────────────────────────────────── */
.title-bar__btn--maximize .material-symbols-outlined {
  transition: transform 0.2s ease;
}
</style>