import { Component } from 'component-loader-js';

export default class LoadingSpinner extends Component {
    constructor() {
        super(...arguments);
        this._state = '';
        this.init();
    }

    init() {
        this.busyElement = this.el.querySelector('[data-loading-spinner-el="busy"]');
        this.idleElement = this.el.querySelector('[data-loading-spinner-el="idle"]');

        this.state = 'STATE_ACTIVE';

        this.subscribe('LOADING', this.onLoadingChanged);
    }

    onLoadingChanged(value) {
        this.state = value ? 'STATE_ACTIVE' : 'STATE_INACTIVE';
    }

    get state() {
        return this._state;
    }

    set state(value) {
        switch (value) {
            case 'STATE_ACTIVE':
                this.busyElement.classList.toggle('d-none', false);
                this.idleElement.classList.toggle('d-none', true);
                break;
            case 'STATE_INACTIVE':
            default:
                this.busyElement.classList.toggle('d-none', true);
                this.idleElement.classList.toggle('d-none', false);
        }
        this._state = value;
    }
}