// ==UserScript==
// @name         Convars Map Ban Statistics
// @namespace    https://a32.fi/
// @version      0.7
// @description  Counts number of bans per map.
// @author       Apina-32
// @updateURL    https://github.com/Apina-32/userscripts/raw/main/Convars%20Map%20Ban%20Statistics.user.js
// @downloadURL  https://github.com/Apina-32/userscripts/raw/main/Convars%20Map%20Ban%20Statistics.user.js
// @match        https://convars.com/csgostats/*
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand
// @grant        GM_setClipboard
// ==/UserScript==

(function() {
    'use strict';

    var timer;
    console.clear();

    GM_registerMenuCommand("Get ban stats", run);

    function getGames() {
        let maps = [];
        document.querySelector("#but_tabPers5").click();
        const tabs = document.querySelectorAll(".tabmatch");
        tabs.forEach(tab => {
            document.querySelector("#selectMatches").value = tab.id.replace("tabmatch", "");
            changeMatches('selectMatches'); // Convars internal function
            const users = tab.querySelectorAll(".cv_cardmap_map");
            users.forEach(user => {
                const map = user.textContent;
                if(Object.keys(maps).includes(map)) maps[map]++;
                else maps[map] = 1;
            });
        });
        console.log(maps);
        return maps;
    }


    function run(){
        document.querySelector("#but_tabPers6").click();
        clearInterval(timer);
        let elements = document.getElementsByClassName("cv_tablecell cell flextable_bans_cell");
        let maps = {}; // Save ban counts for maps
        let nicks = []; // Save nicks to avoid duplicates
        console.clear();
        for(let i = 0; i < elements.length; i++){
            let map = elements[i].querySelector(".flextable_bans_2").innerText;
            let nick = elements[i].querySelector(".nick").innerText;
            if(nicks.indexOf(nick) == -1) {
                if(Object.keys(maps).includes(map)) maps[map]++;
                else maps[map] = 1;
                nicks.push(nick);
            }
        };
        let text = `\nChance of someone getting banned | ${document.querySelector('.prof1').textContent}`;
        const games = getGames();
        const values = {};
        Object.keys(maps).forEach(key => {
            values[key] = Math.round((maps[key] / games[key]) * 100);
        });
        const mapLen = longest(Object.keys(values));
        const persLen = longest(Object.values(values)) + 1;
        const countLen = longest(Object.values(games));
        Object.values(values).sort(function(a, b){return a-b}).forEach(val => {
            Object.keys(values).forEach(key => {
                if(values[key] == val && !text.includes(key)) text += `\n${formatToLen(mapLen, key)} - ${formatToLen(persLen, values[key] + '%')} out of ${formatToLen(countLen, games[key])} matches`;
            });
        });
        console.log(text);
        GM_setClipboard(text, 'text');
        window.alert("Ban stats copied to clipboard.");
    }

    function formatToLen(length, text){
        return text + ' '.repeat(length - text.toString().length);
    }

    function longest(text){
        let len = 0;
        text.forEach(str => {
            str = str.toString();
            if(str.length > len) len = str.length;
        });
        return len;
    }

    function activate(){ // Not used
        flextable_sort(this,"flextable_bans",2); // Convars internal function
        clearInterval(timer);
        timer = setInterval(run, 2000);
        run();
    }


})();
