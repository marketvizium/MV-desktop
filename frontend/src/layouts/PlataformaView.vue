<template>
  <div class="application">
    <TitleBar />

    <!-- LOADING OVERLAY -->
    <div class="all-plataform">

      <div
        class="loading-wrapper"
        :class="{ 'showSpinner': !appReady, 'hideSpinner': appReady }"
      >
        <ProgressSpinner
          style="width: 60px; height: 60px"
          strokeWidth="4"
          animationDuration=".8s"
        />
      </div>
      
      <!-- SIDEBAR -->
      <aside
        :class="{ 'hide-component': !appReady, 'show-component': appReady }"
      >
        <sideBar :stts_expandindo="status_expandido" />
      </aside>
  
      <!-- CONTEÚDO -->
      <div
        class="conteudo-header"
        :class="{ 'hide-component': !appReady, 'show-component': appReady }"
      >
        <header id="headerHeight">
          <headerTop
            @expandir-diminuir-menu="ExpandirDiminuirMenu"
          />
        </header>
  
        <main
          :style="`height: calc(100vh - ${alturaHeader}px);`"
        >
          <transition name="fade" mode="out-in">
            <router-view />
          </transition>
        </main>
      </div>
  
    </div>
    </div>
</template>

<script>
import { nextTick } from 'vue'

import sideBar from '@/components/sideBar.vue'
import headerTop from '@/components/headerTop.vue'
import ProgressSpinner from 'primevue/progressspinner'
import TitleBar from '@/components/titleBar.vue'

export default {
  name: 'PlataformaView',

  components: {
    sideBar,
    headerTop,
    ProgressSpinner,
    TitleBar
  },

  data() {
    return {
      alturaHeader: 0,
      status_expandido: null,
      appReady: false
    }
  },

  async mounted() {
    await nextTick()

    const header = document.getElementById('headerHeight')
    if (header) {
      this.alturaHeader = header.clientHeight
    }

    /**
     * Aqui você pode aguardar:
     * - router.isReady()
     * - APIs iniciais
     * - configs globais
     */

    setTimeout(()=>{
      this.appReady = true
    }, 800)
  },

  methods: {
    ExpandirDiminuirMenu(status) {
      this.status_expandido = status
    }
  }
}
</script>

<style scoped>
/* LAYOUT BASE */

.all-plataform{
  display: flex;
  width: 100%;
  height: calc(100vh - 50px);
}


.application {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
}

/* SIDEBAR + CONTEÚDO */
.conteudo-header {
  width: 100%;
  display: flex;
  flex-direction: column;
  transition: opacity 0.25s ease;
}

/* MAIN */
.application main {
  background-color: #fff;
  overflow-y: scroll;
}

.all-plataform main {
  background-color: #fff;
  overflow-y: scroll;
}

/* OVERLAY LOADING */
.loading-wrapper {
  position: fixed;
  inset: 0;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  transition: opacity 0.25s ease;
}

/* ESTADOS DO SPINNER */
.showSpinner {
  opacity: 1;
  pointer-events: all;
}

.hideSpinner {
  opacity: 0;
  pointer-events: none;
}

/* ESTADOS DO CONTEÚDO */
.hide-component {
  opacity: 0;
  pointer-events: none;
}

.show-component {
  opacity: 1;
  pointer-events: all;
}

/* FADE ENTRE ROTAS */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}

/* SCROLLBAR WEBKIT */
.all-plataform main::-webkit-scrollbar {
  width: 6px;
}

.all-plataform main::-webkit-scrollbar-track {
  background: transparent;
}

.all-plataform main::-webkit-scrollbar-thumb {
  background-color: #cfcfcf;
  border-radius: 10px;
}

.all-plataform main::-webkit-scrollbar-thumb:hover {
  background-color: #b5b5b5;
}

/* FIREFOX */
.all-plataform main {
  scrollbar-width: thin;
  scrollbar-color: #cfcfcf transparent;
}
</style>
