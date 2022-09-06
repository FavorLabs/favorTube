<template>
  <span class="container">
    <template
        v-for="item in list"
    >
          <ShareNetwork
              :key="item.network"
              :network="item.network"
              :url="url"
              title=""
              style="margin-right: 10px"
          >
          <img width="25" style="vertical-align: middle" :src="item.img"
               :alt="item.network"/>
        </ShareNetwork>
    </template>
  </span>
</template>

<script>

import TGImg from '@/assets/TG.png'
import TWImg from '@/assets/TW.png'

export default {
  name: "share",
  props: {
    text: {
      type: String,
      require: true
    }
  },
  data() {
    return {
      url: `https://share.favorlabs.io/share/${this.text}`,
      list: [
        {
          network: "telegram",
          img: TGImg,
        },
        {
          network: "twitter",
          img: TWImg,
        }
      ]
    }
  },
  computed: {}
}
</script>

<style scoped>

</style>
