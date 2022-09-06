<template>
  <div>refresh</div>
</template>

<script>
export default {
  beforeRouteEnter(to, from, next) {
    if (from.name === 'Watch') {
      next(vm => {
          vm.$router.replace({
            path: from.path,
            query: {
              refresh: true,
            }
          });
      })
    } else {
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
}
</script>

<style>

</style>