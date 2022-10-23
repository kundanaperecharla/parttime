var customer = document.getElementById('customer-card');
var helper = document.getElementById('helper-card');

customer.style.cursor = 'pointer';
helper.style.cursor = 'pointer';

customer.onclick = function() {
    location.assign('/signup?user=customer');
};

helper.onclick = function() {
    location.assign('/signup?user=helper');
};
