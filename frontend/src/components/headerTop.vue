<template>
  <div class="root-header">
    <!-- LEFT -->
    <div class="main-left-section">
      <button class="btn-menu" @click="expandir">
        <i class="material-symbols-outlined">menu</i>
      </button>

      <div class="page-header">
        <span class="page-title">
          {{ $route.meta.title }}
        </span>
        <span class="page-subtitle">
          {{ $route.meta.subtitle }}
        </span>
      </div>
    </div>

    <!-- RIGHT -->
    <div class="right-section">

      <div class="icons-section">

        <!--
        <button @click="openModal" class="btn-headers" style="margin-top: 7px;">
          <span class="material-symbols-outlined">notifications</span>
        </button>
        -->
        <button @click="updatePage" class="btn-headers" style="margin-top: 7px;">
          <span class="material-symbols-outlined">
          update
          </span>
        </button>
        <!-- 
        <button class="btn-headers">
          <span class="material-symbols-outlined">settings</span>
        </button>
        -->
      </div>

      <!-- USER -->
      <div class="user-wrapper" ref="userWrapper">
        <div class="header-user" @click="toggleDropdown">
          <div class="logo-rect">
              <img v-if="foto_perfil" :src="foto_perfil" alt="Profile" @click="goTo('minhaConta')" style="border-radius: 10px; margin-top: 5px;" width="40" height="40"/>
              <img v-else src="../assets/img/personagem.png" alt="Profile" @click="goTo('minhaConta')" style="border-radius: 10px; margin-top: 5px;" width="40" height="40"/>
          </div>

          <div class="user-info">
            <span class="nome-user-negrito poppins-extrabold">
              <b>{{ nome }}</b>
            </span>
            <span class="nome-user">{{ email }}</span>
          </div>

          <div class="arrow" :class="{'arrow': !dropdownAberto, 'arrow-top': dropdownAberto}">
            <span class="material-symbols-outlined">
              arrow_drop_down
            </span>
          </div>
        </div>

        <!-- DROPDOWN -->
        <div v-if="dropdownAberto" class="dropdown-user">
          <button @click="irMinhaConta">
            <span class="material-symbols-outlined">person</span>
            Minha Conta
          </button>

          <button class="logout" @click="logout">
            <span class="material-symbols-outlined">logout</span>
            Logout
          </button>
        </div>
      </div>
    </div>


    <modalNotificacoes v-model="visibleModal"/>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth'
import modalNotificacoes from './modalNotificacoes.vue';

export default {
  name: 'HeaderTop',
  components:{
    modalNotificacoes,
  },

  data() {
    return {
      expandido: true,
      auth: null,
      usuario: null,
      nome: null,
      email: null,
      nivel: null,
      dropdownAberto: false,
      visibleModal : false,
      foto_perfil: null
    }
  },

  methods: {
    expandir() {
      this.expandido = !this.expandido
      this.$emit('expandir-diminuir-menu', this.expandido)
    },

    toggleDropdown() {
      this.dropdownAberto = !this.dropdownAberto
    },

    fecharDropdown(e) {
      if (!this.$refs.userWrapper.contains(e.target)) {
        this.dropdownAberto = false
      }
    },

    irMinhaConta() {
      this.dropdownAberto = false
      this.$router.push('/minha-conta')
    },

    logout() {
      this.dropdownAberto = false
      this.auth.logout()
      this.$router.push('/')
    },

    goTo(routeName){
      this.$router.push({name: routeName})
    },

    openModal(){
      this.visibleModal = true
    },
    updatePage(){
      window.location.reload()
    }
  },

  mounted() {
    this.auth = useAuthStore()
    this.usuario = this.auth.usuario

    this.nome = this.usuario.nome
    this.email = this.usuario.email
    this.nivel = this.usuario.nivel
    this.foto_perfil = this.usuario.foto

    this.visibleModal = false

    document.addEventListener('click', this.fecharDropdown)
  },

  beforeUnmount() {
    document.removeEventListener('click', this.fecharDropdown)
  },
}
</script>

<style scoped>
.root-header {
  height: 80px;
  padding-left: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: solid 1px #f0f0f0;
}

/* LEFT */
.main-left-section {
  display: flex;
  align-items: center;
}

.page-header {
  display: flex;
  flex-direction: column;
  padding-left: 15px;
}

.page-title {
  font-size: 20px;
  color: #222;
}

.page-subtitle {
  font-size: 15px;
  color: #555;
}

/* RIGHT */
.right-section {
  display: flex;
  align-items: center;
  gap: 15px;
}

.icons-section {
  display: flex;
}

/* BUTTONS */
.btn-menu,
.btn-headers {
  background: transparent;
  border: none;
  cursor: pointer;
  transition: 0.3s;
}

.btn-menu:hover,
.btn-headers:hover {
  transform: translateY(-4px);
}

/* USER */
.user-wrapper {
  position: relative;
  margin-right: 20px;
}

.header-user {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.user-info {
  padding-left: 10px;
  display: flex;
  flex-direction: column;
}

.nome-user {
  font-size: 14px;
  max-width: 120px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nome-user-negrito{
    margin: 0;
    font-size: 16px;
    width: 120px;
    scrollbar-width: 0;
    white-space: nowrap;      /* não quebra linha */
    overflow: hidden;         /* esconde o excesso */
    text-overflow: ellipsis;  /* adiciona ... */
}

.arrow {
  padding-left: 10px;
  transition: transform 0.3s ease;
}

.arrow-top {
  transform: rotate(180deg);
}

/* DROPDOWN */
.dropdown-user {
  position: absolute;
  right: 0;
  top: 70px;
  width: 180px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 999;
}

.dropdown-user button {
  padding: 12px 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 14px;
}

.dropdown-user button:hover {
  background: #f5f5f5;
}

.dropdown-user .logout {
  color: #c0392b;
}
</style>
