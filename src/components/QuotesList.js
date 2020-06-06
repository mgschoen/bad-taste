import { Component } from 'component-loader-js';

export default class QuotesList extends Component {
    constructor() {
        super(...arguments);

        this.usersApiBaseUrl = 'https://randomuser.me/api/';
        this.quotesApiBaseUrl = 'https://binaryjazz.us/wp-json/genrenator/v1/story/'
        this.users = [];
        this.quotes = [];
        this.model = [];
        this.sorted = false;
        this.sortData = {};
        this.max = 1500;
        this.fetchMin = 40;
        this.fetchMax = 80;
        this.fetchInterval = 2000;

        this.init();
    }

    init() {
        this.tableBody = this.el.querySelector('[data-quotes-list-el="table-body"]');
        this.counter = this.el.querySelector('[data-quotes-list-el="counter"]');

        this.tableRowPrototype = this.el
            .querySelector('[data-quotes-list-el="table-row-prototype"]')
            .outerHTML;

        this.sortFunctions = {
            asc: (a, b) => a < b ? -1 : b < a ? 1 : 0,
            desc: (a, b) => a < b ? 1 : b < a ? -1 : 0
        };

        this.subscribe('SORT_REQUESTED', this.onSortRequested);

        this.boundFetchData = this.fetchData.bind(this);
        this.fetchData();
    }

    onSortRequested(data) {
        this.sortByProperty(data.property, data.order);
        this.sorted = true;
        this.sortData = data;
        this.updateView();
        this.publish('SORTED', data);
    }

    async fetchData() {
        this.publish('LOADING', true);
        const num = Math.floor(Math.random() * (this.fetchMax - this.fetchMin + 1)) + this.fetchMin;
        await this.fetchUsers(num);
        await this.fetchQuotes(num);
        this.mergeData();
        if (this.sorted) {
            this.sortByProperty(this.sortData.property, this.sortData.order);
        }
        this.updateView();
        this.publish('LOADING', false);
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
            return this.sortFunctions[order](propertyA, propertyB);
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
}