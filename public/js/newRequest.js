const socket = io();
const baseURL = window.location.origin;
const mobileForm = document.querySelector('form');

const options = {
    locationsOptions: {
        withoutFrom: {
            locations: {
                isFixedRoute: false,
                from: null,
                to: {}
            }
        }, withFrom: {
            locations: {
                isFixedRoute: true,
                from: {},
                to: {}
            }
        }
    }, orderingItemsVia: {
        all: ['type-items', 'file-upload', 'call'],
        justFileUpload: ['file-upload']
    },
    modeOfTransport: {
        rideModeOfTransportOptions: ['bike', 'auto', 'car'],
        packageModeOfTransportOptions: ['bike-small', 'auto-medium', 'lorry-large'] // papers vs cooler vs house-shifting
    }
};

const possibleRequestFlows = {
    flow1: {
        pagesToBeShown: ['1locationsWithoutFrom'],
    }, flow2: {
        pagesToBeShown: ['1locationsWithoutFrom', '3orderingItemsViaAll']
    }, flow3: {
        pagesToBeShown: ['1locationsWithoutFrom', '4orderingItemsViaJustFileUpload']
    }, flow4: {
        pagesToBeShown: ['2locationsWithFrom']
    }, flow5: {
        pagesToBeShown: ['2locationsWithFrom', '5rideModeOfTransportOptions']
    }, flow6: {
        pagsToBeShown: ['2locationsWithFrom', '6packageModeOfTransportOptions']
    }, flow7: {
        pagesToBeShown: ['2locationsWithFrom', '3orderingItemsViaAll']
    }
};

// todo: store this in db instead?
const requestTypesForCustomer = {
    // todo: merge them both?
    "001": possibleRequestFlows.flow2, // Deliver to: // groceries-medicines---from-anywhere
    "002": possibleRequestFlows.flow7, // groceries-medicines---from-specific

    "003": possibleRequestFlows.flow2, // Where: // mechanic-tutor-electrician-plumber---from-anywhere
    "004": possibleRequestFlows.flow7, //mechanic-tutor-electrician-plumber---from-specific

    "005": possibleRequestFlows.flow5, // ride
    "006": possibleRequestFlows.flow6, // package

    // todo: need to track time spent
    // todo: share gps location of helper to customer
    "007": possibleRequestFlows.flow1, // Where: // dog-walking
    "008": possibleRequestFlows.flow1, // Where: // wait-in-queue

    "009": possibleRequestFlows.flow3, // Deliver to: // xerox---send-files-online
    "010": possibleRequestFlows.flow4, // Deliver to: // xerox---pickup-files-at-from
};

const pagesToBeShown = requestTypesForCustomer[type].pagesToBeShown;
let currentPage = pagesToBeShown[0];
document.getElementById(currentPage).style.display = "block";

const rendersAll = document.getElementById("rendersAll");
const buttons = rendersAll.querySelectorAll('#submit');

for (const button of buttons) {
    button.addEventListener('click', function (event) {
        // showDefault(); // todo is this needed?
        const data = 'SanDiego';
        socket.emit('submit' + currentPage, data, currentPage, pagesToBeShown);
    });
}

// const submitButton = document.getElementById('submit');
// submitButton.addEventListener('click', () => {
// });

socket.on('showNextPage', () => {
    document.getElementById(currentPage).style.display = "none";
    if (pagesToBeShown.length > 1) {
        pagesToBeShown.shift();
        currentPage = pagesToBeShown[0];
        document.getElementById(currentPage).style.display = "block";
    } else {
        location.assign('new-request/pricing');
    }
});
