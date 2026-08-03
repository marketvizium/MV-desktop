let toast = null

export const setToast = (instance) => {
  toast = instance
}

export const toastService = {
  success(msg) {
    toast?.add({
      severity: 'success',
      summary: 'Sucesso',
      detail: msg,
      life: 3000
    })
  },

  error(msg, cod, err) {
    toast?.add({
      severity: 'error',
      summary: 'Erro',
      detail: `${msg} COD:${cod}, MSG: ${err}`,
      life: 3000
    })
  },

  info(msg) {
    toast?.add({
      severity: 'info',
      summary: 'Info',
      detail: msg,
      life: 3000
    })
  }
}
