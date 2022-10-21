import Api from '@/services/Api'

export default {
  getAll(data, params) {
    return Api().get(`videos/${data}`, {
      params
    })
  },
  getById(id) {
    return Api().get(`videos/${id}`)
  },
  uploadVideo(data) {
    return Api().post('videos', data)
  },
  updateVideo(id, data) {
    return Api().put(`videos/${id}`, data)
  },
  updateViews(id) {
    return Api().put(`videos/${id}/views`)
  },
  uploadThumbnail(id, data) {
    return Api().put(`videos/${id}/thumbnails`, data)
  },
  deleteById(id) {
    return Api().delete(`videos/${id}`)
  },
  getUndone(){
    return Api().get('videos/undone')
  },
  uploadable() {
    return Api().get('videos/uploadable')
  }
}
