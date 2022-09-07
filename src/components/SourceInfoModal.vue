<template>
  <div class="text-center">
    <v-dialog
        v-model="openModal"
        :persistent="true"
        :width="isPC() ? '40vw' : '85vw'"
    >
      <v-card :loading="loading">
        <v-card-title class="text-h5 grey lighten-2">
          Chunk Source Info
        </v-card-title>

        <v-card-text>
          <div style="overflow-y: scroll;max-height: 500px;padding-top: 10px">
            <div class="chunkInfo-item" v-for="(item, index) in chunkArr" :key="'chunkArr' + index">
              <span class="chunk-color" :style="`background-color: ${getRandomHex()}`"></span>
              <span class="chunk-overlay">{{ item.overlay }}</span>
              <span class="chunk-percent">{{ ((item.downloadLen / len) * 100).toFixed(2) }}%</span>
            </div>
          </div>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
              color="primary"
              text
              @click="closeModal"
          >
            close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import FavorService from '@/services/FavorService'
import {stringToBinary, getDownloadNumber, query, randomHex} from '@/utils/util'

export default {
  props: {
    openModal: {
      type: Boolean,
      required: true,
    },
    videoHash: {
      type: String,
      required: true,
    }
  },
  data() {
    return {
      loading: false,
      chunkArr: [],
      len: 0
    }
  },
  created() {
    this.getChunkSource();
  },
  methods: {
    closeModal() {
      this.$emit('closeSourceInfoModal');
    },
    async getChunkSource() {
      this.loading = true;
      let queryData = {
        page: {"pageNum": 1, "pageSize": 1},
        filter: [{
          "key": "rootCid",
          "value": this.videoHash,
          "term": "cn"
        }]
      }
      const re = await FavorService.getPyramidSize(query(queryData));
      if (re.status !== 200 || re.data.list.length === 0) return;
      const {data} = await FavorService.getChunkSource(this.videoHash);
      if (!data) return;
      let arr = [];
      this.len = data.len;
      data.chunkSource?.forEach(item => {
        const binary = stringToBinary(item.chunkBit.b, item.chunkBit.len);
        let downloadLen = getDownloadNumber(binary);
        // if (item.overlay === data.pyramidSource) {
        //   downloadLen += len;
        //   pyramidSource = true;
        // }
        // item.chunkBit.len += len;
        // let preIndex = index - 1;
        let current = {
          ...item,
          chunkBit: {
            len: item.chunkBit.len,
            b: binary,
          },
          downloadLen,
        };
        arr.push(current);
      });
      arr.sort((a, b) => {
        return b.downloadLen - a.downloadLen;
      });
      this.loading = false;
      this.chunkArr = arr;
    },
    getRandomHex() {
      return randomHex();
    },
    isPC() {
      const screenWidth = document.body.clientWidth;
      if (screenWidth >= 1024) {
        return true;
      } else {
        return false;
      }
    }
  }
}
</script>

<style scoped>
.chunkInfo-item {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 10px;
  background-color: #eee;
  padding: 10px;
}

.chunk-color {
  display: inline-block;
  width: 15px;
  height: 15px;
  margin-right: 10px;
  vertical-align: middle;
  flex-shrink: 0;
}

.chunk-overlay {
  margin-bottom: 0 !important;
  word-wrap: break-word;
  word-break: normal;
  overflow: hidden; 
  text-overflow: ellipsis;
  white-space: nowrap;

}

.chunk-percent {
  margin-left: 20px;
  /* font-size: 1.2rem; */
}

@media screen and (max-width: 1024px) {
  .chunkInfo-item {
    display: flex;
    justify-content: flex-start;
    align-items: center;
  }
  
  .chunk-overlay {
    display: inline-block;
    width: 70%;
    overflow: hidden;
    text-overflow: ellipsis;
    word-wrap: break-word;
    white-space: nowrap;
  }
}
</style>
