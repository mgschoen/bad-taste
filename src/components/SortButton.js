import { Component } from 'component-loader-js';

export default class SortButton extends Component {
    constructor() {
        super(...arguments);
        this._state = '';
        this.init();
    }

    init() {
        this.state = 'STATE_INACTIVE';

        this.boundOnClick = this.onClick.bind(this);
        this.el.addEventListener('click', this.boundOnClick);

        this.boundOnSorted = this.onSorted.bind(this);
        this.subscribe('SORTED', this.boundOnSorted);
    }

    onClick(event) {
        event.preventDefault();
        this.publish('SORT_REQUESTED', {
            property: this.data.property,
            order: this.state === 'STATE_SORTED_ASC' ?
                'desc' : 'asc'
        });
    }

    onSorted(data) {
        if (data.property !== this.data.property) {
            this.state = 'STATE_INACTIVE';
            return;
        }
        this.state = data.order === 'asc' ?
            'STATE_SORTED_ASC' :
            'STATE_SORTED_DESC';
    }

    get state() {
        return this._state;
    }

    set state(value) {
        switch (value) {
            case 'STATE_SORTED_ASC':
                this.el.classList.toggle('active', true);
                this.el.textContent = '↓'
                break;
            case 'STATE_SORTED_DESC':
                this.el.classList.toggle('active', true);
                this.el.textContent = '↑'
                break;
            case 'STATE_INACTIVE':
            default:
                this.el.classList.toggle('active', false);
                this.el.textContent = '↓'
        }
        this._state = value;
    }
}