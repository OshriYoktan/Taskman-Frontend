import { httpService } from "./http.service"

const KEY = 'user/'
const AUTH = 'auth/'

// CRUDL
async function query() {
    try {
        return await httpService.get(KEY)
    } catch (err) {
        console.log('err:', err)
    }
}

async function getUserById(id) {
    try {
        return await httpService.get(KEY + id)
    } catch (err) {
        console.log('err:', err)
    }
}

async function deleteUser(id) {
    try {
        return await httpService.delete(KEY + id)
    } catch (err) {
        console.log('Error from userService - ', err);
    }
}

async function saveUser(user) {
    try {
        if (user._id) return await httpService.put(KEY + user._id, user)
        return await httpService.post(KEY, user)
    } catch (err) {
        console.log('err:', err)
    }
}

async function login(user) {
    try {
        return await httpService.post(AUTH + 'login', user)
    } catch (err) {
        console.log('err:', err)
    }
}

async function logout() {
    try {
        return await httpService.post(AUTH + 'logout')
    } catch (err) {
        console.log('err:', err)
    }
}

// storage
const storage = {
    saveUserToStorage(user) {
        sessionStorage.setItem('loggedinUser', JSON.stringify(user))
    },
    loadUserFromStorage() {
        return JSON.parse(sessionStorage.getItem('loggedinUser'))
    }
}

// get functions
function getEmptyUser() {
    return {
        name: '',
        username: '',
        password: ''
    }
}

// eslint-disable-next-line
export default {
    query,
    getUserById,
    deleteUser,
    saveUser,
    getEmptyUser,
    storage,
    login,
    logout
}