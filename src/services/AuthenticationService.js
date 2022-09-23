import Api from '@/services/Api'

export default {
    signIn(credentials) {
        return Api().post('auth/login', credentials)
    },
    signUp(data) {
        return Api().post('auth/register', data)
    },
    updateUserDetails(data) {
        return Api().put('auth/updatedetails', data)
    },
    updateUserSecret(data) {
        return Api().put('auth/updatesecret', data)
    },
    uploadUserAvatar(data) {
        return Api().put('auth/avatar', data)
    },
    updatePassword(data) {
        return Api().put('auth/updatepassword', data)
    },
    me(token) {
        return Api().post('auth/me', {
            headers: {Authorization: `Bearer ${token}`}
        })
    },
    getInfo(address) {
        return Api().get('auth/info', {
            params: {
                address
            }
        })
    }
}
