const socket = io();

const baseURL = window.location.origin;

const executeMe = () => {
    // todo: update this from static to dynamic
    const type = '001';
    location.assign('/new-request?type=' + type);
};

/** 
     * Approach 1:
            get data about request 
            what are needed
            from to
            list of orders
            others


            if (showLocationPage) {
                a variable for the order of pages to show based on above data
                ['from-to', 'uber', 'price']
                for loop and show the pages
            }
    */

/**
 * Approach 2:
 * request click - client js gets what forms to show and hide
 * or sends the request to server.js to get what to show/hide
 * store the list of pages to show in an array
 * have a single for multple inputs - like mobile+otp+name form
 * on click of submit (decide one or multiple submits) emit next
 * when there is next page to render - render
 * if there's no next - send a request to server to create record for the request
 */

/**
 * todo: have data of showing/hiding what pages for what request
                    * have all the generic possibilities defined first
 * then a differnt Data structure to point what request has what template
 * groceries - template 1
 * uber - 4
 */
