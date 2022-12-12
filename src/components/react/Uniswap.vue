<template>
  <div v-uniswap></div>
</template>

<script>
import {mount, unmount} from "@/components/react/uniswap.jsx";

const mounts = (el, binding, vnode) => {
  mount(el, {vue: vnode.context})
}

export default {
  name: "Uniswap",
  props: ["provider", "uniConfig"],
  directives: {
    uniswap: {
      inserted: (el, binding, vnode) => {
        mounts(el, binding, vnode);
      },
      update: (el, binding, vnode) => {
        mounts(el, binding, vnode);
      },
      unbind: (el, binding, vnode) => {
        unmount(el, binding, vnode);
        console.log('unbind');
      }
    }
  }
}
</script>

<style scoped>

</style>
