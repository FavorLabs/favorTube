<template>
  <div class="main">
    <div class="share">
      <v-card class="card">
        <div class="share_info">
          <div class="info_box">
            <div class="key">TOTAL</div>
            <div class="value">{{ currentUser.invitations }}</div>
          </div>
        </div>
        <div class="code_info">
          <div class="code">
            <qrcode-vue
                size="150"
                :value="url"
                foreground="#4A56BB"
            >
            </qrcode-vue>
          </div>
          <div style="font-size: 12px;text-align: center;margin-top: 3px">
            <span style="color: #707070">Invitation code:</span><span
              style="color: #404040;font-weight: 500">{{ currentUser.code }}</span>
          </div>
        </div>
        <div class="d-flex justify-space-between">
          <v-btn
              depressed
              class="btn"
              style="margin-right: 20px"
          >
            <ShareNetwork
                network="telegram"
                :url="url"
                title=""
                style=" color: #5D718B;text-decoration: none"
            >
              Share
            </ShareNetwork>
          </v-btn>
          <v-btn
              depressed
              class="btn"
              v-clipboard:copy="currentUser.code"
          >
            Copy
          </v-btn>
        </div>
      </v-card>
    </div>
  </div>
</template>

<script>
import {mapGetters} from "vuex";
import QrcodeVue from 'qrcode.vue'

export default {
  name: "ShareInfo",
  data: function () {
    return {}
  },
  computed: {
    ...mapGetters(["currentUser"]),
    url() {
      return `https://share.favorlabs.io/share/signin?invitation=${this.currentUser.code}`
    }
  },
  components: {
    QrcodeVue
  }
}
</script>

<style scoped lang="scss">

.share {
  min-width: 300px;
  padding: 5px;
  background: url('../assets/share_bg.png');
}

.card {
  overflow: hidden;
  padding: 20px;
}

.key {
  font-size: 14px;
  font-family: Roboto-Medium, Roboto, serif;
  font-weight: 500;
  color: #ADADAD;
  /*line-height: 0;*/
}

.value {
  font-size: 16px;
  font-family: DIN-Medium, DIN, serif;
  font-weight: 500;
  color: #1F1F1F;
  text-align: center;
}

.main {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.share_info {
  border-radius: 0 !important;
  padding: 16px 0;
  border: 1px solid #707070;
  display: flex;
  justify-content: center;
}

.info_box {
  padding: 0 16px;
}

.code_info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 50px 0;
  margin: 15px 0;
  background: url('../assets/share_bg_m.png') 100%/cover no-repeat;
  >div {
    transform: translateY(20px);
  }
}

.btn {
  flex: 1;
  height: 32px !important;
  background-image: url('../assets/btn_bg.png');
  background-size: 100% 100%;
  color: #5D718B;
  letter-spacing: 0;
  overflow: hidden;
}
</style>
