import { Component } from 'component-loader-js';
import Constants from '../constants/constants';

export default class QuotesList extends Component {
    constructor() {
        super(...arguments);

        this.usersApiBaseUrl = Constants.usersApiBaseUrl;
        this.quotesApiBaseUrl = Constants.quotesApiBaseUrl;
        this.users = [];
        this.quotes = [];
        this.model = [];
        this.sorted = false;
        this.sortInfo = {};
        this.max = Constants.quotesMax;
        this.fetchMin = Constants.fetchMin;
        this.fetchMax = Constants.fetchMax;
        this.fetchInterval = Constants.fetchInterval;

        this.useWorkers = false;
        this.fetchWorker = null;
        this.sortWorker = null;

        this.fetchTimerId = null;
        this.sortTimerId = null;

        this.init();
    }

    init() {
        this.tableBody = this.el.querySelector('[data-quotes-list-el="table-body"]');
        this.counter = this.el.querySelector('[data-quotes-list-el="counter"]');

        this.tableRowPrototype = this.el
            .querySelector('[data-quotes-list-el="table-row-prototype"]')
            .outerHTML;

        this.sortFunctions = Constants.sortFunctions;

        this.subscribe('SORT_REQUESTED', this.onSortRequested);

        this.useWorkers = this.data.useWorkers === 'true';
        if (this.useWorkers) {
            this.fetchWorker = new Worker('../workers/FetchWorker.js');
            this.sortWorker = new Worker('../workers/SortWorker.js');
            this.boundOnFetchWorkerMessage = this.onFetchWorkerMessage.bind(this);
            this.boundOnSortWorkerMessage = this.onSortWorkerMessage.bind(this);
            this.fetchWorker.addEventListener('message', this.boundOnFetchWorkerMessage);
            this.sortWorker.addEventListener('message', this.boundOnSortWorkerMessage);
        } else {
            this.boundFetchData = this.fetchData.bind(this);
            this.fetchData();
        }
    }

    onSortRequested(data) {
        this.startSortTimer(this.useWorkers ? 'sort-worker' : 'sort');
        this.sortInfo = data;
        if (this.useWorkers) {
            this.sortWorker.postMessage({
                action: 'sort',
                sortInfo: data,
                payload: this.model
            });
        } else {
            this.sortByProperty(data.property, data.order);
            this.onSortFinished(data);
        }
    }

    onSortFinished(sortInfo) {
        if (sortInfo.property !== this.sortInfo.property ||
            sortInfo.order !== this.sortInfo.order) {
            return;
        }
        this.sorted = true;
        this.updateView();
        this.publish('SORTED', this.sortInfo);
        this.stopSortTimer();
    }

    onFetchWorkerMessage(event) {
        if (event.data.action === 'fetchStart') {
            this.startFetchTimer('fetch-worker');
            this.publish('LOADING', true);
            return;
        }
        if (event.data.action === 'fetchSuccess') {
            this.model.unshift(...event.data.payload);
            if (this.model.length > this.max) {
                this.model = this.model.slice(0, this.max);
            }
            if (this.sorted) {
                this.onSortRequested(this.sortInfo);
            } else {
                this.updateView();
            }
            this.publish('LOADING', false);
            this.stopFetchTimer();
        }
    }

    onSortWorkerMessage(event) {
        if (event.data.action !== 'sortSuccess') {
            return;
        }
        this.model = event.data.payload;
        this.onSortFinished(event.data.sortInfo);
    }

    async fetchData() {
        this.startFetchTimer('fetch');
        this.publish('LOADING', true);
        const num = Math.floor(Math.random() * (this.fetchMax - this.fetchMin + 1)) + this.fetchMin;
        await this.fetchUsers(num);
        await this.fetchQuotes(num);
        this.mergeData();
        if (this.sorted) {
            this.sortByProperty(this.sortInfo.property, this.sortInfo.order);
        }
        this.updateView();
        this.publish('LOADING', false);
        this.stopFetchTimer();
        window.setTimeout(this.boundFetchData, this.fetchInterval);
    }

    async fetchUsers(num) {
        const apiResponse = await fetch(`${this.usersApiBaseUrl}?results=${num}&inc=name,location`);
        const apiData = await apiResponse.json();
        this.users = apiData.results;
        return;
    }

    async fetchQuotes(num) {
        const apiResponse = await fetch(`${this.quotesApiBaseUrl}${num}`);
        const apiData = await apiResponse.json();
        this.quotes = apiData;
        return;
    }

    mergeData() {
        this.users.forEach((user, index) => {
            let userCopy = {
                name: `${user.name.first} ${user.name.last}`,
                from: `${user.location.city}, ${user.location.country}`,
                quote: `"${this.quotes[index]}"`
            };
            this.model.unshift(userCopy);
        });
        if (this.model.length > this.max) {
            this.model = this.model.slice(0, this.max);
        }
    }

    sortByProperty(property, order) {
        this.model.sort((a, b) => {
            const propertyA = a[property];
            const propertyB = b[property];
            let result = null;
            // synthetically adding complexity to simulate expensive calculations
            for (let i = 0; i < this.model.length; i++) {
                result = this.sortFunctions[order](propertyA, propertyB);
            }
            return result;
        });
    }

    updateView() {
        this.tableBody.innerHTML = '';
        for (let entry of this.model) {
            let hydratedTemplate = this.tableRowPrototype
                .replace('__proto_name__', entry.name)
                .replace('__proto_from__', entry.from)
                .replace('__proto_quote__', entry.quote);
            this.tableBody.insertAdjacentHTML('beforeend', hydratedTemplate);
        }
        this.counter.textContent = this.model.length >= this.max ? 'max' : this.model.length;
    }

    startFetchTimer(prefix) {
        this.fetchTimerId = `${prefix}-${new Date().getTime()}`;
        console.time(this.fetchTimerId);
    }

    stopFetchTimer() {
        console.timeEnd(this.fetchTimerId);
        this.fetchTimerId = null;
    }

    startSortTimer(prefix) {
        this.sortTimerId = `${prefix}-${new Date().getTime()}`;
        console.time(this.sortTimerId);
    }

    stopSortTimer() {
        console.timeEnd(this.sortTimerId);
        this.sortTimerId = null;
    }
}