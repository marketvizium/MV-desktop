<template>
  <TitleBar />
  <div class="application">
    <router-view ></router-view>
  </div>
</template>

<script>
import TitleBar from '@/components/titleBar.vue';

export default {
  name: 'SiteView',

  data(){
    return{
      
    }
  },

  components: {
    TitleBar
  },
}
</script>

<style scoped>

.application{
  width: 100%;
  height: 100vh;
}

</style>
