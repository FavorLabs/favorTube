import Api from '@/services/Api'

export default {
  getSub(id) {
    return Api().get('sublist/getSub', {
      params: {
        channelId: id
      }
    });
  },
  getSubById(id) {
    return Api().get(`sublist/${id}`);
  },
  addSublist(data) {
    return Api().post('sublist', data);
  }
}