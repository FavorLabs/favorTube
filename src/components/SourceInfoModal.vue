<template>
  <div class="text-center">
    <v-dialog
      v-model="openModal"
      :persistent="true"
      width="70vw"
    >
      <v-card :loading="loading">
        <v-card-title class="text-h5 grey lighten-2">
          Chunk Source Info
        </v-card-title>

        <v-card-text>
          <div style="overflow-y: scroll;max-height: 500px;padding-top: 10px">
            <div class="chunkInfo-item" v-for="(item, index) in chunkArr" :key="'chunkArr' + index">
              <span class="chunk-color" :style="`background-color: ${getRandomHex()}`"></span>
              <span class="chunk-overlay">{{item.overlay}}</span>
              <span class="chunk-percent">{{((item.downloadLen / item.chunkBit.len) * 100).toFixed(2)}}%</span>
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
import { stringToBinary, getDownloadNumber, query, randomHex } from '@/utils/util'

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
      chunkArr: []
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
        page: {"pageNum":1,"pageSize":1},
        filter: [{
          "key":"rootCid",
          "value": this.videoHash,
          "term":"cn"
        }]
      }
      const re = await FavorService.getPyramidSize(query(queryData));
      if (re.status !== 200 || re.data.list.length === 0) return;
      const len = re.data.list[0].size;
      const res = await FavorService.getChunkSource(this.videoHash);
      if (res.status !== 200) return;
      const data = res.data;
      let arr = [];
      let pyramidSource = false;
      data.chunkSource?.forEach(item => {
        const binary = stringToBinary(item.chunkBit.b, item.chunkBit.len);
        let downloadLen = getDownloadNumber(binary);
        if (item.overlay === data.pyramidSource) {
          downloadLen += len;
          pyramidSource = true;
        }
        item.chunkBit.len += len;
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
      if (!pyramidSource) {
        let n = arr[0].chunkBit.len;
        arr.push({
          overlay: data.pyramidSource,
          chunkBit: {
            len: n,
            b: '0'.repeat(n),
          },
          downloadLen: len,
        });
      }
      arr.sort((a, b) => {
        return b.downloadLen - a.downloadLen;
      });
      this.loading = false;
      this.chunkArr = arr;
      // return arr;
    },
    getRandomHex() {
      return randomHex();
    }
  }
}
</script>

<style scoped>
.chunkInfo-item {
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
}
.chunk-overlay {
  margin-bottom: 0!important;
  word-wrap:  break-word;
  word-break:  normal;
  width: 100%;
}
.chunk-percent {
  margin-left: 20px;
  font-size: 1.2rem;
}
</style>
