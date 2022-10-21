import Api from '@/services/Api'

export default {
  getInfo() {
    return Api().get('activation/info')
  },
  getList(params) {
    return Api().get('activation/list', {
      params,
    })
  },
  getRank(round) {
    return Api().get('activation/rank', {
      params: {
        round,
      }
    })
  }
}