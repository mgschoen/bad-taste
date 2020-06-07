import Constants from '../constants/constants';

const { sortFunctions } = Constants;

self.addEventListener('message', event => {
    const { sortInfo, payload } = event.data;
    const sortedPayload = sortByProperty(payload, sortInfo.property, sortInfo.order);
    self.postMessage({
        action: 'sortSuccess',
        payload: sortedPayload,
        sortInfo
    });
});

function sortByProperty(payload, property, order) {
    return payload.sort((a, b) => {
        const propertyA = a[property];
        const propertyB = b[property];
        let result = null;
        // synthetically adding complexity to simulate expensive calculations
        for (let i = 0; i < payload.length; i++) {
            result = sortFunctions[order](propertyA, propertyB);
        }
        return result;
    });
}