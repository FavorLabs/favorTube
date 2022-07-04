<template>
  <v-card
      class="content-bg card mx-auto d-flex flex-column justify-space-between"
      :max-width="card.maxWidth"
      flat
      tile
      router
      @click="watchSideBarVideo(index, video._id)"
      style="height: 300px"
  >
    <!-- :to="`/watch/${video._id}`" -->
    <div style="flex: 1;background-color:#ccc;">
      <v-img
          v-if="video.thumbnailUrl !== 'no-photo.jpg'"
          :src="`${getImgUrl}/uploads/thumbnails/${video.thumbnailUrl}`"
          height="200px"
      ></v-img>
    </div>
    <v-row style="flex: 0">
      <v-col cols="2" v-if="card.type != 'noAvatar'">
        <v-list-item class="pl-0 pt-3" router :to="`/channels/${channel._id}`">
          <v-list-item-avatar>
            <v-img
                v-if="channel.photoUrl !== 'no-photo.jpg'"
                class="elevation-6"
                :src="`${getImgUrl}/uploads/avatars/${channel.photoUrl}`"
            ></v-img>
            <v-avatar v-else color="red">
              <span class="white--text headline ">
                {{ channel.channelName.split('')[0].toUpperCase() }}</span
              >
            </v-avatar>
          </v-list-item-avatar>
        </v-list-item>
      </v-col>
      <v-col>
        <v-card-title
            class="pl-2 pt-3 subtitle-1 font-weight-bold video-title-format"
            style="line-height: 1.2rem;"
        >
          {{ video.title }}
        </v-card-title>

        <v-card-subtitle class="pl-2 pb-0">
          {{ channel.name }}
        </v-card-subtitle>
        <v-card-subtitle class="pl-2 pt-0">
          {{ video.views }} views
          <v-icon>mdi-circle-small
          </v-icon
          >
          {{ dateFormatter(video.createdAt) }}
        </v-card-subtitle>
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
import moment from "moment";
import {mapGetters} from "vuex";

export default {
  name: "VideoCard",
  props: {
    video: {
      type: Object,
      required: true,
    },
    channel: {
      type: Object,
      required: true,
    },
    card: Object,
    index: {
      type: Number,
      required: true,
    }
  },
  data() {
    return {
      // url: process.env.VUE_APP_URL,
      pageSize: 12,
    };
  },
  computed: {
    ...mapGetters(['getImgUrl']),
  },
  methods: {
    dateFormatter(date) {
      return moment(date).fromNow();
    },
    watchSideBarVideo(index, vid) {
      let cpage = Math.ceil((index + 1) / this.pageSize);
      let cindex = index < this.pageSize ? index : (index % this.pageSize);
      console.log('index', index, 'cpage', cpage, 'cindex', cindex);
      this.$router.push({
        path: `/watch/${vid}`,
        query: {
          cpage,
          cindex
        }
      })
    },
  },
};
</script>

<style lang="scss" scoped>
.video-title-format {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 20px;
  padding-bottom: 0px;
}
</style>
