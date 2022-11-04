<template>
  <div :class="checkBg() ? 'main' : 'main main-m'">
    <div class="share-card-wrap">
      <div class="share-card">
        <v-list-item-avatar size="80" class="avatar">
          <v-img
              v-if="currentUser.photoUrl !== 'no-photo.jpg'"
              :src="`${imgUrl}/uploads/avatars/${currentUser.photoUrl}`"
          ></v-img>
          <v-avatar v-else color="red" size="80">
            <span class="white--text headline" style="font-size: 2rem!important;">
              {{
                currentUser.channelName.trim().split('')[0].toUpperCase()
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
              <div class="num">{{ total }}</div>
            </div>
            <div class="item">
              <div class="label">Valid</div>
              <div class="num">{{ valid }}</div>
            </div>
            <div class="item">
              <div class="label">Activity</div>
              <div class="num">{{ score }}</div>
            </div>
        </div>
        <div class="d-flex justify-space-between btns">
            <v-btn
                class="btn"
                style="margin-right: 20px"
            >
              <Share :text="''">
                <template slot="invite-slot" slot-scope="scope">
                  <span
                      v-if="scope.isNativeShare || scope.isAndroid"
                      color="#000"
                      @click="() => scope.share()">
                      Share
                  </span>
                  <ShareNetwork
                      v-else
                      network="telegram"
                      :url="url"
                      title=""
                      style=" color: #000;text-decoration: none"
                  >
                    Share
                  </ShareNetwork>
                </template>
              </Share>
            </v-btn>
            <v-btn
                :plain="true"
                class="btn"
                v-clipboard:copy="currentUser.code"
                v-clipboard:success="clipboardSuccess"
            >
              Copy
            </v-btn>
        </div>
      </div>
    </div>
    <div :class="currentRank !== 0 ? 'share-table-1-wrap' : 'share-table-1-wrap only-show-table-1'">
      <div class="share-table-1">
        <div style="font-size: 2rem;color: #000;">Invitees</div>
        <v-data-table
          :fixed-header="true"
          :headers="invitedHeader"
          :items="invitedData"
          :options.sync="invitedOptions"
          :server-items-length="invitedDataTotal"
          :loading="invitedLoading"
          loading-text="Loading... Please wait"
          :footer-props="invitedFotter"
          :class="invitedData.length ? 'invited-table' : 'invited-table no-data'"
          mobile-breakpoint="0"
        >
          <template v-slot:item.id="{ item }">
            <span>{{ ((invitedOptions.page - 1) * invitedOptions.itemsPerPage) + invitedData.indexOf(item) + 1 }}</span>
          </template>
          <!-- <template v-slot:item.photoUrl="{ item }">
            <v-list-item-avatar size="30" class="avatar" style="margin: 0;">
              <v-img
                  v-if="item.photoUrl !== 'no-photo.jpg'"
                  :src="`${imgUrl}/uploads/avatars/${item.photoUrl}`"
              ></v-img>
              <v-avatar v-else color="red" size="30">
                <span class="white--text headline" style="font-size: 18px!important">
                  {{
                    item.channelName.trim().split('')[0].toUpperCase()
                  }}</span
                >
              </v-avatar>
            </v-list-item-avatar>
          </template> -->
          <template v-slot:item.channelName="{ item }">
            <div class="avatar-channel-name">
              <v-list-item-avatar size="30" class="avatar" style="margin: 0;">
                <v-img
                    v-if="item.photoUrl !== 'no-photo.jpg'"
                    :src="`${imgUrl}/uploads/avatars/${item.photoUrl}`"
                ></v-img>
                <v-avatar v-else color="red" size="30">
                  <span class="white--text headline" style="font-size: 18px!important">
                    {{
                      item.channelName.trim().split('')[0].toUpperCase()
                    }}</span
                  >
                </v-avatar>
              </v-list-item-avatar>
              <div class="channel-name-text">{{ item.channelName }}</div>
            </div>
          </template>
          <template v-slot:item.activation="{ item }">
            <div class="activation-text">{{ item.activation }}</div>
          </template>
        </v-data-table>
      </div>
    </div>
    <div class="share-table-2-wrap" v-if="currentRank !== 0">
      <div class="share-table-2">
        <div
          class="d-flex"
          style="justify-content: space-between;margin-bottom: -10px;"
        >
          <p style="font-size: 2rem;color: #000;white-space: nowrap;">Ranking</p>
          <v-select
            :items="rankItems"
            @change="changeRank"
            :value="currentRank"
            style="padding-top: 0;width: 120px;"
            class="table-selete"
          ></v-select>
        </div>
        <v-simple-table fixed-header class="rank-table">
          <template v-slot:default>
            <thead>
              <tr>
                <th class="th">Index</th>
                <th class="th">ChannelName</th>
                <th class="th">Activity</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!rankData.length" class="no-data">
                <td colspan="3">No data available</td>
              </tr>
              <tr
                v-for="(item) in rankData"
                :key="item.name"
              >
                <td class="index">{{ rankData.indexOf(item) + 1 }}</td>
                <td class="channel-name-text">{{ item.channelName }}</td>
                <td class="score activation-text">{{ item.activation }}</td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </div>
    </div>
  </div>
</template>

<script>
import {mapGetters} from "vuex";
import QrcodeVue from 'qrcode.vue';
import Share from "@/components/Share";
import ActivationService from '@/services/ActivationService';
import { isPC } from '@/utils/util'

export default {
  name: "ShareInfo",
  data: function () {
    return {
      total: 0,
      valid: 0,
      score: 0,
      invitedHeader: [{
        text: 'Index', align: 'left', width: isPC() ? '80px' : '50px', sortable: false, value: 'id',
      // },{
      //   text: 'Avatar', align: 'center', width: '20px', sortable: false, value: 'photoUrl',
      // },{
      },{
        text: 'ChannelName', align: 'left', width: isPC() ? '80px' : '130px', sortable: false, value: 'channelName',
      },{
        text: 'Activity', align: 'center', width: '80px', sortable: false, value: 'activation',
      }],
      invitedData: [],
      invitedDataTotal: 0,
      invitedOptions: {
        page: 1,
        itemsPerPage: 10,
      },
      invitedFotter: {
        itemsPerPageOptions: [10,20,50]
      },
      invitedLoading: false,
      rankData: [],
      currentRank: 1,
      rankItems: [],
    }
  },
  computed: {
    ...mapGetters(["currentUser", "getImgUrl"]),
    url() {
      return `https://share.favorlabs.io/share/signin?invitation=${this.currentUser.code}`
    },
    imgUrl() {
      return this.getImgUrl;
    }
  },
  components: {
    QrcodeVue,
    Share,
  },
  created() {
    this.getInfo();
    this.getInvitedList();
    this.getRank();
  },
  methods: {
    async getInfo() {
      try {
        const { data } = await ActivationService.getInfo();
        this.total = data.data.invitations || 0;
        this.valid = data.data.valid || 0;
        this.score = data.data.activation || 0;
      } catch (err) {
        this.showTips(err);
      }
    },
    async getInvitedList() {
      try {
        this.invitedLoading = true;
        const { data } = await ActivationService.getList({
          page: this.invitedOptions.page,
          limit: this.invitedOptions.itemsPerPage
        });
        this.invitedData = data.data;
        this.invitedDataTotal = data.count;
        this.invitedLoading = false;
      } catch (err) {
        this.showTips(err);
      }
    },
    async getRank() {
      try {
        const { data } = await ActivationService.getRank();
        this.rankData = data.data;
        this.currentRank = data.round;
        for (let i = 1; i <= data.round; i++) {
          this.rankItems.push({
            text: "Round" + i,
            value: i,
          })
        }
      } catch (err) {
        this.showTips(err);
      }
    },
    async changeRank(value) {
      try {
        this.currentRank = value;
        const { data } = await ActivationService.getRank(value);
        this.rankData = data.data;
      } catch (err) {
        this.showTips(err);
      }
    },
    showTips(err) {
      this.$store.dispatch('showTips', {
        type: "error",
        text: err.response.data.error || err
      });
    },
    clipboardSuccess() {
      this.$store.dispatch('showTips', {
        type: "success",
        text: 'Copyed Successfully!'
      });
    },
    checkBg() {
      return isPC();
    }
  },
  watch: {
    invitedOptions: {
      handler () {
        this.getInvitedList()
      },
      deep: true,
    },
  },
}
</script>

<style scoped lang="scss">
.main {
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 100%;
  background: url('../assets/share-bg-m.jpg') center/cover repeat-x;
  .share-card-wrap,
  .share-table-1-wrap,
  .share-table-2-wrap {
    display: flex;
    justify-content: center;
    align-items: center;
    // width: 33.33%;
    padding: 0 25px;
  }
  .share-card-wrap {
    width: 24%;
  }
  .share-table-1-wrap,
  .share-table-2-wrap {
    width: 38%;
  }
  .only-show-table-1 {
    width: 70%;
    .share-table-1 {
      width: 100%;
    }
  }
  .share-card,
  .share-table-1,
  .share-table-2 {
    border-radius: 10px;
    box-shadow: 0 0 10px 0px rgb(0,0,0,.3);
  }
  .share-card {
    position: relative;
    min-width: 300px;
    // height: 500px;
    background-color: #fff;
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
      align-items: flex-start;
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
        .num {
          word-break: break-all;
        }
      }
    }
    .share-data .item:last-child {
      margin-right: 0;
    }
    .btns {
      position: absolute;
      left: 50%;
      bottom: -60px;
      transform: translateX(-50%);
      .btn {
        box-shadow: 0 0 10px 0px rgb(0,0,0,.3);
      }
      .btn:hover::before,
      .btn:focus::before {
        opacity: 0;
      }
    }
  }
  .share-table-1,
  .share-table-2 {
    display: flex;
    flex-direction: column;
    padding: 25px;
    width: 90%;
    background-color: #fff;
    // overflow-y: scroll;
    box-sizing: border-box;
  }
  ::-webkit-scrollbar {
    width: 3px;
    height: 3px;
  }
  ::-webkit-scrollbar-track {
    border-radius: 5px;
  }
  ::-webkit-scrollbar-thumb {
    border-radius: 10px;
  }
  .share-table-1:hover,
  .share-table-2:hover {
    ::-webkit-scrollbar-track {
      box-shadow: inset 0 0 5px rgba(0,0,0,0.2);
    }
    ::-webkit-scrollbar-track {
      box-shadow: inset 0 0 5px rgba(0,0,0,0.2);
      background: #ededed;
    }
    ::-webkit-scrollbar-thumb {
      background-color: rgba(0,0,0,0.3);
    }
  }
  .share-table-1 {
    .invited-table {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      height: calc(100vh - 295px);
      .avatar-channel-name {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        // margin-left: 20px;
      }
      .channel-name-text {
        margin-left: 10px;
      }
      .channel-name-text,
      .activation-text {
        word-break: break-all;
      }
    }
    .invited-table::v-deep {
      .v-data-table__wrapper {
        flex-grow: 1;
      }
    }
    .no-data::v-deep {
      .v-data-footer {
        display: none;
      }
    }
  }
  .share-table-2 {
    .table-selete {
      flex: 0;
    }
    .table-selete::v-deep {
      .v-input__control {
        width: 150px;
        flex-grow: unset;
      }
    }
    .rank-table {
      height: calc(100vh - 295px);
      overflow-y: scroll;
      th,td {
        text-align: center!important;
      }
      .channel-name-text,
      .activation-text {
        width: 300px;
        word-break: break-all;
      }
      .index {
        width: 90px;
      }
      .score {
        width: 100px;
      }
      .no-data {
        color: rgba(0, 0, 0, 0.38);
        text-align: center;
      }
    }
  }
}
.main-m {
  background: url('../assets/share-bg-m.jpg') center/cover no-repeat;
}
@media screen and (max-width: 1500px) {
  .main {
    flex-direction: column;
    .share-card-wrap,
    .share-table-1-wrap,
    .share-table-2-wrap {
      width: 95%;
      margin-bottom: 80px;
    }
    .share-card-wrap {
      margin-top: 80px;
      margin-bottom: 140px;
    }
    .share-table-2 {
      .rank-table {
        .channel-name-text {
          width: 340px;
        }
        .index {
          width: 130px;
        }
        .score {
          width: 140px;
        }
      }
    }
  }
}

@media screen and (max-width: 600px) {
  .main {
    .share-table-1,
    .share-table-2 {
      width: 100%;
    }
    .share-table-1 {
      .invited-table {
        height: auto;
        max-height: 500px;
      }
      .invited-table::v-deep {
        .v-data-table__mobile-table-row {
          // display: table-row!important;
        }
        .v-data-table__mobile-row__cell {
          margin-left: 15px;
          max-width: 160px;
          height: auto;
          display:-webkit-box;
          overflow: hidden;
          text-overflow: ellipsis;
          -webkit-box-orient:vertical;
          -webkit-line-clamp:2;
        }
      }
    }
    .share-table-2 {
      .rank-table {
        height: auto;
        max-height: 500px;
      }
    }
  }
}
</style>
