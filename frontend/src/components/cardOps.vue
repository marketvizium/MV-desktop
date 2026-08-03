<template>
  <div class="root-card" @click="irParaRota">
    
    <!-- ÍCONE -->
    <div
      class="icon-wrapper"
      :style="{
        backgroundColor: iconBgColor,
        color: iconColor
      }"
    >
      <span class="material-symbols-outlined">
        {{ icon }}
      </span>
    </div>

    <!-- TÍTULO -->
    <div class="card-title poppins-bold">
      <span>{{ tituloLinha1 }}</span>
      <span>{{ tituloLinha2 }}</span>
    </div>

    <!-- DESCRIÇÃO -->
    <div class="card-desc poppins-regular">
      {{ descricao }}
    </div>

    <!-- SETA -->
    <div class="card-arrow">
      <span class="material-symbols-outlined">
        arrow_forward
      </span>
    </div>

  </div>
</template>

<script>
import router from '@/router';

export default {
  name: 'CardOps',

  props: {
    icon: {
      type: String,
      default: 'box'
    },
    iconColor: {
      type: String,
      default: '#5A0F83'
    },
    title: {
      type: String,
      required: true
    },
    descricao: {
      type: String,
      required: true
    },
    route: {
      type: String,
      required: true
    }
  },

  computed: {
    iconBgColor() {
      // Aplica 20% de opacidade
      return this.hexToRgba(this.iconColor, 0.2)
    },

    tituloLinha1() {
      return this.title.split(' ')[0]
    },

    tituloLinha2() {
      return this.title.split(' ').slice(1).join(' ')
    }
  },

  methods: {
    irParaRota() {
        console.log('ai')

      router.push({name: this.route})
    },

    hexToRgba(hex, alpha) {
      const r = parseInt(hex.slice(1, 3), 16)
      const g = parseInt(hex.slice(3, 5), 16)
      const b = parseInt(hex.slice(5, 7), 16)
      return `rgba(${r}, ${g}, ${b}, ${alpha})`
    }
  }
}
</script>

<style scoped>
.root-card {
  height: 245px;
  width: 233px;
  border-radius: 10px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  background: #fff;

  box-shadow: 
    0px 4px 12px rgba(0, 0, 0, 0.08);

  transition: all 0.3s ease;
}

.root-card:hover {
  transform: translateY(-5px);
  box-shadow: 
    0px 10px 25px rgba(0, 0, 0, 0.12);
}

/* ÍCONE */
.icon-wrapper {
  height: 40px;
  width: 40px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

/* TÍTULO */
.card-title {
  margin-top: 22px;
  font-size: 20px;
  color: #051433;
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

/* DESCRIÇÃO */
.card-desc {
  margin-top: 22px;
  font-size: 15px;
  color: #7A8293;
}

/* SETA */
.card-arrow {
  margin-top: auto;
  display: flex;
  justify-content: flex-end;
  color: #7A8293;
}
</style>
