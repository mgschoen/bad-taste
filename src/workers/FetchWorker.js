import 'regenerator-runtime/runtime.js';
import Constants from '../constants/constants';

const {
    usersApiBaseUrl,
    quotesApiBaseUrl,
    fetchMax,
    fetchMin,
    fetchInterval
} = Constants;

let users = [];
let quotes = [];
let model = [];

fetchData();

async function fetchData() {
    self.postMessage({ action: 'fetchStart' });
    const num = Math.floor(Math.random() * (fetchMax - fetchMin + 1)) + fetchMin;
    await fetchUsers(num);
    await fetchQuotes(num);
    mergeData();
    self.postMessage({
        action: 'fetchSuccess',
        payload: model
    });
    setTimeout(fetchData, fetchInterval);
}

async function fetchUsers(num) {
    const apiResponse = await fetch(`${usersApiBaseUrl}?results=${num}&inc=name,location`);
    const apiData = await apiResponse.json();
    users = apiData.results;
    return;
}

async function fetchQuotes(num) {
    const apiResponse = await fetch(`${quotesApiBaseUrl}${num}`);
    const apiData = await apiResponse.json();
    quotes = apiData;
    return;
}

function mergeData() {
    model = [];
    users.forEach((user, index) => {
        let userCopy = {
            name: `${user.name.first} ${user.name.last}`,
            from: `${user.location.city}, ${user.location.country}`,
            quote: `"${quotes[index]}"`
        };
        model.unshift(userCopy);
    });
}