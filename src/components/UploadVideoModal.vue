<template>
  <div>

    <v-overlay :value="uploading" z-index="9999" class="text-center"
               style="display:flex;justify-content: center;align-items: center;">
      <v-progress-linear
          :value="value"
          v-if="value"
          color="amber"
          rounded
          height="15"
          style="border-radius: 20px;width: 50vw;margin: 0 auto"
      >
      </v-progress-linear>
      <v-progress-circular
          v-else
          indeterminate
          size="64"
      ></v-progress-circular>

      <div style="margin-top: 20px;font-size: 20px;padding: 0 20px ">{{ statusTip }}</div>
    </v-overlay>
    <v-dialog
        v-model="dialog"
        persistent
        transition="fab-transition"
        max-width="1000"
    >
      <v-card>
        <div class="d-flex justify-space-between mb-5" id="modal-header" style="position: relative">
          <v-card-title class="py-3">Upload Video</v-card-title>
          <div class="mt-3 mr-8 modal-header-text">
            <v-btn text>
              Upload With Classic
            </v-btn>
          </div>
          <v-btn icon text @click="closeModal" style="position: absolute; top: 12px; right: 12px;">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>

        <v-card-text
            v-if="!uploaded"
            class="d-flex flex-column align-center my-md-12 py-md-12 my-sm-8 py-sm-8 my-xs-0 py-xs-0 my-12 py-12"
        >
          <div class="text-center" @click="tips">
            <div>
              <v-btn
                  icon
                  class="grey lighten-2 mb-4"
                  style="height: 104px;width: 104px;"
                  @click="selectFile"
                  :disabled="!allowUpload"
              >
                <v-icon x-large class="grey--text text--darken-1"
                >mdi-upload
                </v-icon
                >
              </v-btn
              >
            </div>
            <ValidationProvider
                :rules="`required|size:${videoLimitSize}`"
                v-slot="{ errors }"
                name="file"
                ref="provider"
            >
              <v-file-input
                  @change="uploadVideo"
                  v-model="selectedFile"
                  accept="video/mp4"
                  placeholder="Pick an video"
                  prepend-icon="mdi-video"
                  :error-messages="errors"
                  ref="fileInput"
                  :disabled="!allowUpload"
              ></v-file-input>
            </ValidationProvider>
            <v-btn
                type="submit"
                depressed
                @click="$refs.fileInput.$refs.input.click()"
                :disabled="!allowUpload"
                class="blue darken-3 flat white--text mt-4"
            >Select File
            </v-btn
            >
          </div>
        </v-card-text>
        <v-card-text v-else>
          <h2 class="mb-6">Details</h2>
          <v-row>
            <v-col
                order="last"
                order-sm="last"
                order-md="first"
                order-lg="first"
                order-xl="first"
                cols="12"
                sm="12"
                md="8"
                lg="8"
            >
              <ValidationObserver ref="form">
                <form
                    @submit.prevent="submit"
                    @reset.prevent>
                  <ValidationProvider
                      v-slot="{ errors }"
                      name="Title"
                      rules="required|min:3"
                  >
                    <v-text-field
                        v-model="formData.title"
                        :error-messages="errors"
                        label="Title (required)"
                        class="mb-3"
                        filled
                        dense
                        counter="100"
                        max-length="100"
                    ></v-text-field>
                  </ValidationProvider>
                  <ValidationProvider
                      v-slot="{ errors }"
                      name="Description"
                      rules="required|min:3"
                  >
                    <v-textarea
                        filled
                        auto-grow
                        :error-messages="errors"
                        label="Description"
                        placeholder="Tell viewers about your video"
                        rows="5"
                        counter="5000"
                        max-length="5000"
                        v-model="formData.description"
                        row-height="20"
                    ></v-textarea>
                  </ValidationProvider>
                  <ValidationProvider
                      v-slot="{ errors }"
                      name="Visibilty"
                      rules="required|min:3"
                  >
                    <v-select
                        :items="visibilty"
                        :error-messages="errors"
                        filled
                        label="Visibilty"
                        v-model="formData.visibilty"
                    ></v-select>
                  </ValidationProvider>
                  <ValidationProvider
                      v-slot="{ errors }"
                      name="Cateogry"
                      rules="required|min:3"
                  >
                    <v-select
                        :items="categoriesTitles"
                        :error-messages="errors"
                        filled
                        label="Categories"
                        v-model="formData.category"
                        :loading="categoryLoading"
                    ></v-select>
                  </ValidationProvider>
                  <div class="mt-6 d-flex">
                    <v-btn
                        :loading="submitLoading"
                        type="submit"
                        class="primary"
                        depressed
                    >Submit
                    </v-btn
                    >
                    <v-btn
                        color="warning"
                        class="primary"
                        depressed
                        style="margin-left: 20px"
                        @click="deleteVideo"
                    >delete
                    </v-btn
                    >
                  </div>
                </form>
              </ValidationObserver>
            </v-col>
            <v-col
                order-sm="1"
                cols="12"
                sm="12"
                md="4"
                lg="4"
                class="text-center"
            >
              <v-btn text @click="toggleShow">Upload Thumbnails</v-btn>
              <my-upload
                  field="thumbnail"
                  @crop-success="cropSuccess"
                  method="PUT"
                  v-model="show"
                  :width="960"
                  :height="480"
                  :headers="headers"
                  img-format="jpg"
                  langType="en"
                  :maxSize="1024 * 5"
              ></my-upload>
              <v-responsive width="330" class="mx-auto" @click="toggleShow">
                <div v-if="!imgDataUrl" class="px-12" id="image-placeholder">
                  <v-icon>mdi-image-plus</v-icon>
                </div>
                <v-img
                    v-else
                    max-width="330"
                    height="350"
                    :src="imgDataUrl"
                ></v-img>
              </v-responsive>
              <p v-if="imgDataUrl == ''" class="red--text">
                Please upload thumbnail
              </p>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions v-if="!uploaded">
          <p class="text-center grey--text caption px-12 px-xs-0">
            By submitting your videos to FavorTube, you acknowledge that you agree
            to FavorTube's Terms of Service and Community Guidelines. Please be sure
            not to violate others' copyright or privacy rights. Learn more
          </p>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import myUpload from "vue-image-crop-upload";
import VideoService from "@/services/VideoService";
import CategoryService from "@/services/CategoryService";
import data2blob from "vue-image-crop-upload/utils/data2blob";
import {mapGetters} from "vuex";
import FavorService from "@/services/FavorService";
import {stringToBinary, getProgress, getVideoLimitSize} from "@/utils/util";
import {config} from '@/config/config'

export default {
  name: "UploadModal",
  props: {
    openDialog: {
      type: Boolean,
      default: false
    }
  },
  data: function () {
    return {
      statusTip: "",
      valid: false,
      uploaded: false,
      uploading: false,
      submitLoading: false,
      categoryLoading: false,
      // interval: {},
      value: 0,
      show: false,
      videoLimitSize: getVideoLimitSize(),
      categoriesTitles: [],
      categories: [],
      visibilty: ["Public", "Member", "Private"],
      selectedFile: null,
      formData: {
        id: "",
        title: "",
        description: "",
        category: "",
        visibilty: "",
        url: "",
      },
      imgDataUrl: "",
      // url: "",
      headers: {Authorization: `Bearer ${this.$store.getters.getToken}`},
      allowUpload: true,
      tipText: '',
    };
  },
  computed: {
    ...mapGetters(["getApi"]),
    dialog() {
      return this.openDialog;
    },
  },
  methods: {
    async uploadToStorageNode(hash, len) {
      let ws = this.$store.state.auth.ws;
      let connected = [];
      let bad = {};
      let overlay;
      let storageResult;
      let downloadResult;

      let storageTimer = null;
      let downloadTimer = null;

      return new Promise((resolve, reject) => {
        const downloadFailed = () => {
          bad[overlay] = bad[overlay] ? ++bad[overlay] : 1;
          ws.emit("choiceOverlay");
        }
        const groupSubscribe = () => {
          ws.send(
              {
                "id": 1,
                "jsonrpc": "2.0",
                "method": "group_subscribe",
                "params": ["peers", config.storeGroup]
              },
              (err, res) => {
                if (err || res.error) {
                  reject(err || res.error.message)
                  return;
                }
                storageResult = res.result;
                console.log("storageResult", storageResult)
                storageTimer = setTimeout(() => {
                  reject("Failed to connect to the P2P network");
                }, 1000 * 20);
                ws.on(storageResult, async (res) => {
                  console.log("storageArr", res)
                  connected = res.connected ? res.connected : [];
                  if (connected.length && storageTimer) {
                    clearTimeout(storageTimer);
                    storageTimer = null;
                    ws.emit("choiceOverlay");
                  }
                });
              })
        }
        const choiceOverlay = async () => {
          if (bad[overlay] === 1) {
            try {
              await FavorService.connect(overlay);
            } catch (e) {
              downloadFailed()
              return;
            }
          }
          overlay = connected.filter(item => bad[item] < 2 || !bad[item])[0];
          console.log("overlay", overlay)
          if (!overlay) {
            reject("Failed to connect to the P2P network");
            return;
          }
          if (downloadResult) this.statusTip = "Switching nodes for upload";
          let res = null;
          try {
            res = await FavorService.sendMessage(this.getApi, overlay, hash);
          } catch (e) {
            downloadFailed();
            return;
          }
          let data = JSON.parse(window.atob(res.data.data))
          console.log("message", data);
          this.value = getProgress(stringToBinary(data.vector.b, data.vector.len), len);
          console.log("progress", this.value)
          if (this.value === 100) {
            resolve({
              text: "Upload successful",
              overlay,
            });
            return;
          }
          if (!downloadResult) {
            ws.emit("chunkInfoSubscribe");
          }
        }
        const chunkInfoSubscribe = () => {
          ws.send({
            "id": 3,
            "jsonrpc": "2.0",
            "method": "chunkInfo_subscribe",
            "params": ["retrievalProgress", hash]
          }, (err, res) => {
            console.log("downloadResult", res);
            if (err || res.error) {
              reject(err || res.error.message)
              return;
            }
            downloadResult = res.result;
            ws.emit("download");
          })
        }
        const download = () => {
          console.log("start download")
          downloadTimer = setTimeout(() => {
            downloadFailed()
          }, 1000 * 20)
          ws.on(downloadResult, async (res) => {
            console.log("download", res)
            let downloadData = res.find(item => item.Overlay === overlay);
            if (!downloadData) return;
            this.statusTip = "Uploading the file to the P2P storage node";
            clearTimeout(downloadTimer);
            downloadTimer = setTimeout(() => {
              downloadFailed()
            }, 1000 * 10)
            this.value = getProgress(stringToBinary(downloadData.Bitvector.b, downloadData.Bitvector.len), len)
            console.log("progress", this.value)
            if (this.value === 100) {
              resolve({
                text: "Upload successful",
                overlay,
              });
            }
          })
        }
        ws.on("groupSubscribe", groupSubscribe)
        ws.on("choiceOverlay", choiceOverlay)
        ws.on("chunkInfoSubscribe", chunkInfoSubscribe)
        ws.on("download", download)
        this.statusTip = "Uploading the file to the P2P storage node";
        ws.emit("groupSubscribe");
      }).finally(() => {
        if (storageResult) {
          ws.send({
            "id": 1,
            "jsonrpc": "2.0",
            "method": "group_unsubscribe",
            "params": [storageResult]
          });
        }
        if (downloadResult) {
          ws.send({
            "id": 4,
            "jsonrpc": "2.0",
            "method": "chunkInfo_unsubscribe",
            "params": [downloadResult]
          });
        }
        ws.removeAllListeners("groupSubscribe");
        ws.removeAllListeners("choiceOverlay");
        ws.removeAllListeners("chunkInfoSubscribe");
        ws.removeAllListeners("download");
      })
    },

    async uploadVideo(e) {
      const {valid} = await this.$refs.provider.validate(e);
      if (!valid) return;
      try {
        this.uploading = true;
        this.statusTip = "Uploading the file to local node";
        await FavorService.observeStorage(this.getApi);
        let data = await FavorService.uploadFile(this.getApi, this.selectedFile);
        let hash = data.data.reference;
        console.log("hash", hash);
        let uploadedList = JSON.parse(sessionStorage.getItem("uploaded_list") || '{}');
        let uploadOverlay = uploadedList[hash];
        if (!uploadOverlay) {
          let fileInfo = await FavorService.getFileInfo(hash);
          let len = fileInfo.data.list[0].bitVector.len;
          const {text, overlay} = await this.uploadToStorageNode(hash, len)
          await this.$store.dispatch("showTips", {
            type: "success",
            text
          })
          uploadOverlay = overlay;
          uploadedList[hash] = overlay;
          sessionStorage.setItem("uploaded_list", JSON.stringify(uploadedList));
        }
        let video = await VideoService.uploadVideo({
          url: hash,
          overlay: uploadOverlay
        });
        this.formData.url = hash;
        video = video.data.data
        this.formData.id = video._id;
        this.uploaded = true;
      } catch (e) {
        await this.$store.dispatch("showTips", {
          type: "error",
          text: e.message || e
        })
      } finally {
        this.uploading = false;
      }
    },
    async submit(e) {
      const valid = await this.$refs.form.validate(e);
      if (!valid) return;
      if (this.imgDataUrl === "") return;
      this.submitLoading = true;
      this.formData.category = this.categories.find(
          (category) => category.title === this.formData.category
      )._id;

      const video = await VideoService.updateVideo(this.formData.id, {
        title: this.formData.title,
        description: this.formData.description,
        categoryId: this.formData.category,
        status: this.formData.visibilty.toLowerCase(),
      })
          .catch((err) => {
            console.log(err);
          })
          .finally(() => {
            this.submitLoading = false;
            this.uploaded = false;
          });
      if (!video) return;
      await this.updateImg(video.data.data.id).catch((err) => {
        console.log(err);
      });
      // this.$nextTick(() => {
      //   this.$refs.form.reset()
      // })
      this.formData.visibilty = "";
      this.imgDataUrl = "";
      this.selectedFile = [];
      this.closeModal();

      await this.$router.push(`/studio/videos?${new Date()}`);
    },
    async getCategories() {
      this.categoryLoading = true;
      const categories = await CategoryService.getAll()
          .catch((err) => {
            console.log(err);
          })
          .finally(() => (this.categoryLoading = false));

      this.categoriesTitles = categories.data.data.map((category) => {
        return category.title;
      });
      this.categories = categories.data.data;
    },
    async deleteVideo() {
      await VideoService.deleteById(this.formData.id).catch((err) => {
        this.$store.dispatch("showTips", {
          type: "error",
          text: err.message
        })
      }).finally(() => {
        this.closeModal()
      });
      await this.$router.push(`/studio/videos?${new Date()}`);
    },
    closeModal() {
      this.$emit("closeDialog");
    },
    selectFile() {
      this.$refs.fileInput.$refs.input.click();
    },
    toggleShow() {
      this.show = !this.show;
    },
    cropSuccess(imgDataUrl, field) {
      console.log(field);
      this.imgDataUrl = imgDataUrl;
    },
    async updateImg(id) {
      if (this.imgDataUrl === "") return;
      let fmData = new FormData();
      fmData.append("thumbnail", data2blob(this.imgDataUrl, ["image/jpeg"]), "thumbnail.jpg");
      let img = await VideoService.uploadThumbnail(id, fmData);
      console.log(img);
    },
    tips() {
      if (!this.allowUpload) {
        this.$store.dispatch('showTips', {
          type: "error",
          text: this.tipText
        });
      }
    },
    async checkUploadLimit() {
      try {
        await VideoService.uploadable();
      } catch (err) {
        this.allowUpload = false;
        // console.log('err', err.response);
        this.tipText = err.response.data.error;
      }
    }
  },
  components: {
    myUpload,
  },
  async mounted() {
    this.checkUploadLimit();
    VideoService.getUndone().then((data) => {
      console.log(data)
      if (data.data.data) {
        this.uploaded = true;
        this.formData.id = data.data.data._id;
      }
    });
    this.getCategories();
  },
};
</script>

<style lang="scss">
#modal-header {
  border-bottom: 1px solid rgb(238, 232, 232);
}

#image-placeholder {
  padding-top: 8em;
  padding-bottom: 8em;
  border: 2px dashed rgb(209, 209, 209);
}

@media screen and (max-width: 450px) {
  #modal-header {
    display: block !important;

    .modal-header-text {
      margin: 0 !important;
    }
  }
}
</style>
