export default {
    quotesMax: 2000,
    fetchMin: 100,
    fetchMax: 200,
    fetchInterval: 2000,
    usersApiBaseUrl: 'https://randomuser.me/api/',
    quotesApiBaseUrl: 'https://binaryjazz.us/wp-json/genrenator/v1/story/',
    sortFunctions: {
        asc: (a, b) => a < b ? -1 : b < a ? 1 : 0,
        desc: (a, b) => a < b ? 1 : b < a ? -1 : 0
    }
}