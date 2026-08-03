<template>
    <b-modal ref="myModal" hide-footer :hide-header-close="true" title="Você quer sair do sistema?">
        <div>
            <img src="@/assets/Login.gif" style="width: 100%;" alt="">
        </div>
        <div class="poppins-regular" style="width: 100%; text-align: center; color: #555; font-size: 15px;">
            Caso você deseje realmente sair, clique em "Sair". Caso contrário, clique em "Cancelar"
        </div>
        <div style="margin-top: 10px; display: flex; justify-content: center;">
            <button @click="hideModal"  style="background-color: #42B883; transition: 0.5s; border: none; font-size: 16px;  color: #FFF; border-radius: 5px; height: 40px; width: 120px; margin-right: 20px; box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.15);" class="poppins-regular button-hover" >Cancelar</button>
            <button @click="confirmLogout" style="background-color: #DD0000; transition: 0.5s; border: none; font-size: 16px;  color: #FFF; border-radius: 5px; height: 40px; width: 120px; box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.15);"  class="poppins-regular button-hover">Sair</button>
        </div>
    </b-modal>
</template>

<script>
export default {
  name: "ModalLogout",
  methods: {
    showModal() {
      this.$refs.myModal.show(); // ✅ chama o b-modal corretamente
    },
    hideModal() {
      this.$refs.myModal.hide();
    },
    confirmLogout() {
      // Coloque aqui sua lógica de logout
      alert("Logout efetuado!");
      this.hideModal();
    }
  }
};
</script>

<style scoped>

.button-hover:hover{
    transition: 0.5s;
    transform: translateY(-4px);
}

</style>
