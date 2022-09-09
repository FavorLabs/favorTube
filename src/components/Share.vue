<template>
  <span class="container" v-if="isShow">
    <template
        v-for="item in list"
    >
          <ShareNetwork
              :key="item.network"
              :network="item.network"
              :url="url"
              title=""
              class="share-item"
          >
          <img width="22" style="vertical-align: middle" :src="item.img"
               :alt="item.network"/>
        </ShareNetwork>
    </template>
  </span>
</template>

<script>

import TGImg from '@/assets/TG.png'
import TWImg from '@/assets/TW.png'
import {mapGetters} from "vuex";

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
      isShow: false,
      // url: `https://share.favorlabs.io/share/${this.text}`,
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
  computed: {
    ...mapGetters(["currentUser"]),
    url() {
      return `https://share.favorlabs.io/share/${this.text}` + (this.currentUser.id ? `?uid=${this.currentUser.id}` : '');
    }
  },
  mounted() {
    if (sessionStorage.getItem('network_id') === '18') {
      this.isShow = true;
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  margin-left: 10px;

  .share-item:nth-child(1) {
    margin-right: 36px;
  }
}
</style>
