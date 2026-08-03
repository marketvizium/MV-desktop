<template>
  <Dialog
    v-model:visible="visible"
    modal
    class="poppins-bold"
    header="Confirmação"
    :style="{ width: '420px' }"
    :closable="false"
  >
    <div class="content">
      <span class="material-symbols-outlined warning-icon">
        warning
      </span>

      <p class="message poppins-regular">
        Tem certeza que deseja excluir os itens selecionados?
      </p>
    </div>

    <template #footer>
      <Button
        label="Cancelar"
        class="p-button-text"
        @click="cancelar"
      />

      <Button
        label="Excluir"
        severity="danger"
        :loading="loading"
        @click="confirmar"
      />
    </template>
  </Dialog>
</template>

<script>
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'

export default {
  name: 'ModalConfirmExcluir',

  components: {
    Dialog,
    Button
  },

  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    }
  },

  emits: ['update:modelValue', 'confirm'],

  computed: {
    visible: {
      get () {
        return this.modelValue
      },
      set (value) {
        this.$emit('update:modelValue', value)
      }
    }
  },

  methods: {
    cancelar () {
      this.visible = false
    },

    confirmar () {
      this.$emit('confirm')
    }
  }
}
</script>

<style scoped>
.content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.warning-icon {
  font-size: 36px;
  color: #e74c3c;
}

.message {
  font-size: 15px;
  margin: 0;
}
</style>
