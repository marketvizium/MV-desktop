<template>
  <div class="title-wrapper">
    <div class="title-page poppins-bold">
      <!-- Slot do título -->
      <slot name="title">
        {{ title }}
      </slot>
    </div>

    <div class="subtitle-page poppins-regular">
      <!-- Slot do subtítulo -->
      <slot name="subtitle">
        {{ subtitle }}
      </slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TitileSubtitle',
  props: {
    title: {
      type: String,
      default: ''
    },
    subtitle: {
      type: String,
      default: ''
    }
  }
}
</script>

<style scoped>
.title-wrapper {
  display: flex;
  flex-direction: column;
}

.title-page {
  font-size: 20px;
}

.subtitle-page {
  font-size: 16px;
  color: #555555;
}
</style>
