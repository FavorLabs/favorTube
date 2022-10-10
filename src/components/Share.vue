<template>
  <div class="container" v-if="isShow">
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
    <v-icon
        v-if="isNativeShare || isAndroid"
        style="margin-left: 20px"
        color="#179bFa"
        @click="()=>share()">
      mdi-share-variant-outline
    </v-icon>
  </div>
</template>

<script>

import TGImg from '@/assets/TG.png'
import TWImg from '@/assets/TW.png'
import {mapGetters} from "vuex";
import {getQueryString} from '@/utils/util';
import NativeShare from 'nativeshare'

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
      isShow: sessionStorage.getItem('network_id') === '18',
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
      ],
      isNativeShare: window.location.protocol === 'https:' && /Chrome|Safari|iphone|Mac OS/i.test(window.navigator.userAgent),
      isAndroid: /Android|Adr/i.test(window.navigator.userAgent) && /Favor/i.test(window.navigator.userAgent)
    }
  },
  computed: {
    ...mapGetters(["currentUser"]),
    url() {
      return `https://share.favorlabs.io/share/${this.text}` + getQueryString({
        invitation: this.currentUser.code,
      });
    }
  },
  methods: {
    share() {
      if (this.isAndroid) {
        this.shareHandle();
      } else if (this.isNativeShare) {
        this.nativeShare();
      }
    },
    nativeShare() {
      const _this = this;
      const nativeShare = new NativeShare();
      nativeShare.setShareData({
        link: _this.url,
        title: 'FavorTube',
        desc: 'FavorTube',
        icon: 'https://favortube.favorlabs.io/favicon.ico',
        syncDescToTag: false,
        syncIconToTag: false,
        syncTitleToTag: false,
      })
      try {
        nativeShare.call()
      } catch (err) {
        this.$store.dispatch('showTips', {
          type: "error",
          text: err.message
        });
      }
    },
    shareHandle() {
      window.flutter_inappwebview?.callHandler?.('share', this.url)
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  flex-wrap: nowrap;
  margin-left: 0;

  .share-item:nth-child(1) {
    margin-right: 20px;
  }
}
</style>
