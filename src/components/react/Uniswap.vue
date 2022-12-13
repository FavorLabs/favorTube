<template>
  <div v-uniswap="update"></div>
</template>

<script>
import {mount, update, unmount} from "@/components/react/uniswap.jsx";


export default {
  name: "Uniswap",
  props: ["provider", "uniConfig"],
  computed: {
    update() {
      return this.$props.uniConfig;
    }
  },
  directives: {
    uniswap: {
      inserted: (el, binding, vnode) => {
        mount(el, {vue: vnode.context})
      },
      update: (el, binding, vnode) => {
        update(el, {vue: vnode.context})
      },
      unbind: (el) => {
        unmount(el);
      }
    }
  }
}
</script>

<style scoped>

</style>
