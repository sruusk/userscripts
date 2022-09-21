// ==UserScript==
// @name         Convars SteamID
// @namespace    https://github.com/Apina-32/
// @version      0.1
// @description  Copy all Steam IDs from match history
// @author       Apina-32
// @updateURL    https://github.com/Apina-32/userscripts/raw/main/Convars%20SteamID.user.js
// @match        https://convars.com/csgostats/en/*
// @icon         https://icons.duckduckgo.com/ip2/convars.com.ico
// @grant        GM_registerMenuCommand
// @grant        GM_notification
// @grant        GM_setClipboard
// ==/UserScript==

(function() {
    'use strict';

    let steamids = GM_registerMenuCommand("Get Steam IDs", getSteamIDS);

    async function getSteamIDS() {
        let ids = [];
        document.querySelector("#but_tabPers5").click();
        const tabs = document.querySelectorAll(".tabmatch");
        tabs.forEach(tab => {
            document.querySelector("#selectMatches").value = tab.id.replace("tabmatch", "");
            changeMatches('selectMatches');
            const users = tab.querySelectorAll(".cv_cardmap_player");
            users.forEach(user => {
                ids.push(user.href.replace("https://convars.com/csgostats/en/", ""));
            });
            //ids = new Set(ids);
            GM_setClipboard(ids.join(' '), 'text');
        });
    }
})();