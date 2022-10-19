<template>
  <div class="main">
    <div class="share">
      <div class="share-card">
        <v-list-item-avatar size="80" class="avatar">
          <v-img
              v-if="currentUser.photoUrl !== 'no-photo.jpg'"
              :src="`${url}/uploads/avatars/${currentUser.photoUrl}`"
          ></v-img>
          <!-- :src="'http://192.168.100.54:1633/group/http/favortube/favortube.com/uploads/avatars/avatar-62be605e27e954ecaff238cd.jpg'" -->

          <v-avatar v-else color="red" size="80">
            <span class="white--text headline" style="font-size: 18px">
              {{
                currentUser.channelName.split('')[0].toUpperCase()
              }}</span
            >
          </v-avatar>
        </v-list-item-avatar>
        <qrcode-vue
          size="220"
          :value="url"
          foreground="#000"
          class="qrcode"
        >
        </qrcode-vue>
        <div style="font-size: 18px;text-align: center;margin-top: 3px;color: #bbb">
          <span style="margin-right: 10px">invate code:</span><span>{{ currentUser.code }}</span>
        </div>
        <div class="dividing-line"></div>
        <div class="share-data">
          <div class="item">
            <div class="label">Total</div>
            <div class="num">68</div>
          </div>
          <div class="item">
            <div class="label">Valid</div>
            <div class="num">68</div>
          </div>
        </div>
        <div class="d-flex justify-space-between btns">
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
      </div>
      <div class="share-table">
        table
      </div>
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
.main {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background: url('../assets/share-bg.png') 0px 0px/cover repeat-x;
  .share {
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-width: 1400px;
    .share-card,
    .share-table {
      border-radius: 10px;
      box-shadow: 0 0 10px 0px rgb(0,0,0,.3);
    }
    .share-card {
      position: relative;
      min-width: 300px;
      // height: 500px;
      background-color: #fff;
      margin-right: 50px;
      .avatar {
        position: absolute;
        top: -40px;
        left: 50%;
        margin: 0;
        transform: translateX(-50%);
      }
      .qrcode {
        text-align: center;
        margin-top: 60px;
      }
      .dividing-line {
        position: relative;
        height: 2px;
        margin: 24px;
        background: linear-gradient(90deg, rgb(160,56,239), rgb(24,192,220));
      }
      .dividing-line::before {
        left: 0;
        transform: translate(-100%, -40%);
        background: rgb(160,56,239);
      }
      .dividing-line::after {
        right: 0;
        transform: translate(100%, -40%);
        background: rgb(24,192,220);
      }
      .dividing-line::before,
      .dividing-line::after {
        position: absolute;
        top: 0;
        display: block;
        content: '';
        width: 8px;
        height: 8px;
        border-radius: 50%;
      }
      .share-data {
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 0 20px;
        margin-bottom: 20px;
        .item {
          text-align: center;
          margin-right: 25px;
          // font-family: "Roboto", sans-serif !important;
          .label {
            font-size: 18px;
            font-weight: 500;
          }
        }
      }
      .share-data:last-child {
        margin-right: 0;
      }
      .btns {
        position: absolute;
        left: 50%;
        bottom: -60px;
        transform: translateX(-50%);
      }
    }
    .share-table {
      height: 650px;
      background-color: #fff;
      flex-grow: 1;
    }
  }
}
@media screen and (max-width: 1500px) {
  .main {
    .share {
      min-width: unset;
      .share-card {
        margin-right: 0;
      }
      .share-table {
        display: none;
      }
    }
  }
}
</style>