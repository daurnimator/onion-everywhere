function checkForOnionMeta() {
    const meta = document.querySelector('meta[http-equiv="Onion-Location"]');
    if (meta && meta.content) {
        return meta.content;
    }
    return null;
}

const onionLocation = checkForOnionMeta();
if (onionLocation) {
    // Send a message to the background script with the onion location.
    browser.runtime.sendMessage({ type: 'ONION_LOCATION_FOUND', onionLocation });
}
