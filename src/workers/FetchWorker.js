self.addEventListener('message', event => {
    console.log(event);
    self.postMessage(event.data);
});