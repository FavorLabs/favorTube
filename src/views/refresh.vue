<template>
  <div>refresh...</div>
</template>

<script>
export default {
  beforeRouteEnter(to, from, next) {
    next(vm => {
        vm.$router.replace({
          name: from.name,
          params: {
            refresh: true,
          }
        });
    })
  }
}
</script>

<style>

</style>