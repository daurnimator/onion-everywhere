'use strict';

function tor_redirect(details) {
    var onion_location_header = details.responseHeaders.find(function (header) {
        return header['name'].toLowerCase() == 'onion-location';
    });
    if (onion_location_header === void 0) return;

    // TODO: this may throw an error on an invalid URL... should that be caught?
    var onion_location = new URL(onion_location_header.value);

    // The Onion-Location value must be a valid URL with http: or https: protocol and a .onion hostname.
    if (onion_location.protocol !== "http:" && onion_location.protocol !== "https:") {
        console.log("Invalid Onion-Location uri: unexpected scheme:", onion_location.protocol);
        return;
    }
    if (!onion_location.hostname.endsWith("onion")) {
        console.log("Invalid Onion-Location uri: not an onion host:", onion_location.hostname);
        return;
    }

    // The webpage defining the Onion-Location header must be served over HTTPS.
    var old_location = new URL(details.url);
    if (old_location.protocol !== "https:") {
        console.log("Ignoring Onion-Location: not served over HTTPS");
        return;
    }

    // The webpage defining the Onion-Location header must not be an onion site.
    if (old_location.hostname.endsWith("onion")) {
        console.log("Ignoring Onion-Location uri: already an onion host:", old_location.hostname);
        return;
    }

    console.log("Redirecting to Onion-Location: ", onion_location.href);
    return {
        redirectUrl: onion_location.href,
    };
}

(typeof browser !== "undefined" ? browser : chrome).webRequest.onHeadersReceived.addListener(
    tor_redirect,
    { urls: ['<all_urls>'] },
    ['blocking', 'responseHeaders']
);
