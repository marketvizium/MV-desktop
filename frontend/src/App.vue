<template>
  <div id="app">
    <router-view></router-view>
    <Toast style="transform: translateY(120px);" />

    <!-- Overlay de atualização: cobre a tela inteira e bloqueia qualquer
         interação assim que uma nova versão é encontrada, até o app
         reiniciar sozinho com a atualização já instalada. -->
    <Transition name="update-fade">
      <div v-if="updateBlocking" class="update-overlay" @click.stop @contextmenu.prevent>
        <div class="update-overlay__content">
          <div class="update-overlay__spinner"></div>

          <h2 class="update-overlay__title">{{ updateTitle }}</h2>
          <p class="update-overlay__subtitle">{{ updateSubtitle }}</p>

          <div v-if="updateStage === 'downloading'" class="update-overlay__progress">
            <div class="update-overlay__progress-track">
              <div
                class="update-overlay__progress-fill"
                :style="{ width: updateProgress + '%' }"
              ></div>
            </div>
            <span class="update-overlay__progress-label">{{ updateProgress }}%</span>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import { setToast } from './services/toast'

const toast = useToast()

// Estágios possíveis: null (sem update em andamento) | 'found' | 'downloading' | 'downloaded'
const updateStage = ref(null)
const updateVersion = ref('')
const updateProgress = ref(0)

// Overlay fica visível em qualquer estágio ativo de atualização,
// bloqueando o app até o reinício automático.
const updateBlocking = computed(() => updateStage.value !== null)

const updateTitle = computed(() => {
  if (updateStage.value === 'downloaded') return 'Atualização pronta'
  return 'Identificamos uma nova atualização disponível'
})

const updateSubtitle = computed(() => {
  if (updateStage.value === 'downloaded') {
    return 'Reiniciando o aplicativo para aplicar a atualização...'
  }
  return 'Aguarde enquanto estamos preparando sua atualização. Isso pode levar alguns instantes.'
})

// Guarda as funções de "unsubscribe" retornadas pelo preload, para limpar
// os listeners quando o componente for desmontado.
let unsubscribers = []

//Não disparar o vídeo enquanto n finalizar o loading
//Colocar focus no input do console log para o coletor

onMounted(() => {
  setToast(toast)

  const bloquearBotoesExtras = (event) => {
    // 0 = esquerdo
    // 1 = meio (scroll)
    // 2 = direito
    // 3 = voltar
    // 4 = avançar

    if (event.button !== 0 && event.button !== 2) {
      event.preventDefault()
      event.stopPropagation()
      return false
    }
  }

  window.addEventListener('mousedown', bloquearBotoesExtras, true)
  window.addEventListener('mouseup', bloquearBotoesExtras, true)

  // Impede navegação pelos botões laterais
  window.addEventListener('auxclick', (event) => {
    event.preventDefault()
    event.stopPropagation()
  }, true)

  // --- Listeners do sistema de atualização (expostos em preload.js) ---
  if (window.update) {
    unsubscribers.push(
      window.update.onAvailable(({ version }) => {
        updateVersion.value = version
        updateProgress.value = 0
        updateStage.value = 'found'
      })
    )

    unsubscribers.push(
      window.update.onProgress(({ percent }) => {
        updateProgress.value = Math.round(percent)
        updateStage.value = 'downloading'
      })
    )

    unsubscribers.push(
      window.update.onDownloaded(({ version }) => {
        updateVersion.value = version
        updateStage.value = 'downloaded'

        // Dá um instante para o usuário ler a mensagem antes de reiniciar
        // automaticamente e aplicar a atualização.
        setTimeout(() => {
          window.update?.restartNow()
        }, 1800)
      })
    )

    unsubscribers.push(
      window.update.onError(({ message }) => {
        // Em caso de erro, libera o app novamente em vez de deixar o
        // usuário travado indefinidamente na tela de atualização.
        updateStage.value = null

        toast.add({
          severity: 'warn',
          summary: 'Falha ao atualizar',
          detail: message,
          life: 5000
        })
      })
    )
  } else {
    console.warn('[UPDATE] window.update não está disponível — verifique o preload.js')
  }
})

onUnmounted(() => {
  unsubscribers.forEach((off) => off && off())
  unsubscribers = []
})
</script>

<style>
html,
body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}

#app {
  width: 100%;
  height: 100%;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  font-family: 'Poppins', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow: hidden;
}

.gloock-regular{
  font-family: 'Gloock', serif;
}

button,
input,
textarea,
select {
  font-family: inherit;
}


.material-icons,
.material-symbols-outlined {
  font-family: 'Material Icons', 'Material Symbols Outlined' !important;
  font-weight: normal;
  font-style: normal;
  font-size: 24px;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  -webkit-font-smoothing: antialiased;
}

/* ------------------------------------------------------------ */
/*  Overlay de atualização — cobre tudo e bloqueia interação     */
/* ------------------------------------------------------------ */
.update-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(20, 20, 24, 0.72);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  /* Bloqueia qualquer clique/scroll no restante do app */
  pointer-events: all;
  cursor: default;
  user-select: none;
}

.update-overlay__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 22rem;
  padding: 2.5rem 2rem;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
}

.update-overlay__spinner {
  width: 44px;
  height: 44px;
  margin-bottom: 1.25rem;
  border-radius: 50%;
  border: 4px solid #e4e4e7;
  border-top-color: #6366f1;
  animation: update-spin 0.9s linear infinite;
}

.update-overlay__title {
  margin: 0 0 0.5rem;
  font-size: 1.15rem;
  font-weight: 600;
  color: #18181b;
}

.update-overlay__subtitle {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.4;
  color: #52525b;
}

.update-overlay__progress {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  width: 100%;
  margin-top: 1.5rem;
}

.update-overlay__progress-track {
  flex: 1;
  height: 6px;
  border-radius: 999px;
  background: #e4e4e7;
  overflow: hidden;
}

.update-overlay__progress-fill {
  height: 100%;
  border-radius: 999px;
  background: #6366f1;
  transition: width 0.25s ease;
}

.update-overlay__progress-label {
  min-width: 2.6rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: #52525b;
}

@keyframes update-spin {
  to {
    transform: rotate(360deg);
  }
}

.update-fade-enter-active,
.update-fade-leave-active {
  transition: opacity 0.25s ease;
}

.update-fade-enter-from,
.update-fade-leave-to {
  opacity: 0;
}
</style>