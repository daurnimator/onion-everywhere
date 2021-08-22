'use strict';

var browser = typeof browser !== "undefined" ? browser : chrome;

var onion_checksum_prefix = Array.from(".onion checksum").map(letter => letter.charCodeAt(0));

function validate_onion_host(hostname) {
    if (!hostname.endsWith("onion")) {
        throw new URIError("not an onion host:" + hostname);
    }

    hostname = hostname.substring(0, hostname.length - ".onion".length);

    var i = hostname.lastIndexOf(".");
    if (i != -1) {
        hostname = hostname.substring(i + 1);
    }

    if (hostname.length == 56) {
        // Work on assumption it is a v3 address
        try {
            hostname = base32.decode.asBytes(hostname.toUpperCase());
        } catch (e) {
            throw new URIError("invalid onion address:" + e.message);
        }
        var pubkey = hostname.slice(0, 32);
        var checksum = hostname.slice(32, 34);
        var version = hostname[34];
        if (version != 3) {
            throw new URIError("unknown onion v3 address version: " + version);
        }
        var calculated_checksum = sha3_256.digest(
            onion_checksum_prefix.concat(pubkey, version)
        ).slice(0,2);
        if (checksum[0] != calculated_checksum[0] && checksum[1] != calculated_checksum[1]) {
            throw new URIError("onion v3 address checksum mismatch");
        }
    } else if (hostname.length == 16) {
        // Work on assumption it is a v2 address
    } else {
        throw new URIError("unknown onion address type");
    }
}

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

    try {
        validate_onion_host(onion_location.hostname);
    } catch (e) {
        console.log("Invalid Onion-Location uri:" + e.message);
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

browser.webRequest.onHeadersReceived.addListener(
    tor_redirect,
    { urls: ['<all_urls>'] },
    ['blocking', 'responseHeaders']
);
