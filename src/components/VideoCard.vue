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
    <div style="flex: 2 1 0%;background-color:#ccc;position: relative">
      <v-img
          v-if="video.thumbnailUrl !== 'no-photo.jpg'"
          :src="`${getImgUrl}/uploads/thumbnails/${video.thumbnailUrl}`"
          height="200px"
      ></v-img>
    </div>
    <v-row style="flex: 1 1 0%">
      <v-col cols="2" v-if="card.type != 'noAvatar'">
        <v-list-item class="pl-0 pt-3" router :to="`/channels/${channel._id}`">
          <v-list-item-avatar :class="{ mode: video.userId.mode == 1}">
            <v-img
                v-if="channel.photoUrl !== 'no-photo.jpg'"
                class="elevation-6"
                :src="`${getImgUrl}/uploads/avatars/${channel.photoUrl}`"
            ></v-img>
            <v-avatar v-else color="red">
              <span class="white--text headline">
                {{ channel.channelName.split('')[0].toUpperCase() }}
              </span
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
        <v-card-subtitle class="pl-2 pt-0"
                         style="display: flex;justify-content: space-between;align-items: center;padding-right: 0px">
            <span>{{ video.views }} views
              <v-icon>mdi-circle-small
              </v-icon
              >
              {{ dateFormatter(video.createdAt) }}
            </span>
          <div v-if="video.status ==='member'"
               style="display: inline-block;padding: 0 5px;font-size: 12px;width: 38px;margin-left: 5px">
            <!-- Members Only -->
            <v-tooltip top>
              <template v-slot:activator="{ on, attrs }">
                <div
                    v-bind="attrs"
                    v-on="on"
                >
                  <svg viewBox="0 0 24 24"
                       preserveAspectRatio="xMidYMid meet"
                       focusable="false" class="style-scope yt-icon"
                       style="pointer-events: none; display: block; width: 100%; height: 100%;color:#107516"
                  >
                    <g class="style-scope yt-icon" fill="#107516">
                      <path
                          d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm4.24 16L12 15.45 7.77 18l1.12-4.81-3.73-3.23 4.92-.42L12 5l1.92 4.53 4.92.42-3.73 3.23L16.23 18z"
                          class="style-scope yt-icon">
                      </path>
                    </g>
                  </svg>
                </div>
              </template>
              <span>Members Only</span>
            </v-tooltip>
          </div>
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
  created() {
  },
  methods: {
    dateFormatter(date) {
      return moment(date).fromNow();
    },
    watchSideBarVideo(index, vid) {
      let cpage = Math.ceil((index + 1) / this.pageSize);
      let cindex = index < this.pageSize ? index : (index % this.pageSize);
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

.mode {
  border: 3px solid #FFD700;
}
</style>
