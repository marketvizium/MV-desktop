<template>
  <div
    class="input-wrapper"
    ref="wrapperRef"
  >
    <input
      class="base-input poppins-regular"
      v-bind="$attrs"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :maxlength="maxlength"
      :name="name"
      :id="id"
      :autocomplete="autocomplete"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      @focus="openDropdown"
      @click="openDropdown"
    />

    <div
      v-if="dropdown && showDropdown"
      class="dropdown"
    >
      <slot name="dropdown" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'BaseInput',
  
  // Impede que atributos como 'data-maska' sejam aplicados na <div> raiz
  inheritAttrs: false,

  props: {
    modelValue: {
      type: [String, Number],
      default: '',
    },

    placeholder: {
      type: String,
      default: '',
    },

    type: {
      type: String,
      default: 'text',
    },

    disabled: {
      type: Boolean,
      default: false,
    },

    readonly: {
      type: Boolean,
      default: false,
    },

    maxlength: {
      type: [String, Number],
      default: null,
    },

    name: {
      type: String,
      default: null,
    },

    id: {
      type: String,
      default: null,
    },

    autocomplete: {
      type: String,
      default: 'off',
    },

    dropdown: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      showDropdown: false,
    }
  },

  methods: {
    openDropdown() {
      if (this.dropdown && !this.disabled) {
        this.showDropdown = true
      }
    },

    closeDropdown() {
      this.showDropdown = false
    },

    handleClickOutside(event) {
      if (
        this.$refs.wrapperRef &&
        !this.$refs.wrapperRef.contains(event.target)
      ) {
        this.closeDropdown()
      }
    },
  },

  mounted() {
    document.addEventListener('click', this.handleClickOutside)
  },

  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside)
  },
}
</script>

<style scoped>
.input-wrapper {
  position: relative;
  width: 100%;
}

.base-input {
  width: 100%;
  height: 50px;

  background-color: transparent;
  border: 1px solid #BBB;
  border-radius: 5px;

  padding-left: 10px;
  padding-right: 10px;

  font-size: 16px;
  color: #333;

  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.base-input::placeholder {
  color: #777;
}

.base-input:focus {
  border-color: #999;
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.05);
}

.base-input:disabled {
  background-color: rgba(0, 0, 0, 0.03);
  cursor: not-allowed;
  color: #888;
}

.dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  display: flex;
  flex-direction: column;
  align-items: start;
  width: 100%;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  z-index: 20;
  overflow: hidden;
}
</style>