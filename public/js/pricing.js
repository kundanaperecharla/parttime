const socket = io();

const pricingPageLoaded = () => {
    socket.emit('loadPrices');
};

socket.on('onPricesLoaded', (prices) => {
    document.getElementById("price").innerHTML = prices;
});
