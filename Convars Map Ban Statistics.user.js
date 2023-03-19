// ==UserScript==
// @name         Convars Map Statistics
// @namespace    http://a32.fi/
// @version      0.9
// @description  Counts number of bans per map.
// @author       sruusk
// @match        https://convars.com/csgostats/*
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand
// @grant        GM_setClipboard
// ==/UserScript==

(function() {
    'use strict';

    GM_registerMenuCommand("Get ban stats", getBanStats);
    GM_registerMenuCommand("Get map winrates", getWinrates);

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


    function getBanStats(){
        console.clear();
        document.querySelector("#but_tabPers6").click();
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
        const games = getGames();
        let text = `Chance of someone getting banned in ${Object.values(games).reduce((acc, val) => acc + val)} matches | ${document.querySelector('.prof1').textContent}`;
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
        window.alert("Ban stats copied to clipboard.\n\n" + text);
    }

    function getWinrates(){
        console.clear();
        let maps = {};
        document.querySelector("#but_tabPers5").click();
        const tabs = document.querySelectorAll(".tabmatch");
        tabs.forEach(tab => {
            document.querySelector("#selectMatches").value = tab.id.replace("tabmatch", "");
            changeMatches('selectMatches'); // Convars internal function
            const matches = tab.querySelectorAll(".cv_cardmap");
            matches.forEach(match => {
                const isWin = match.classList.contains("win") || match.classList.contains("tie"); // Include ties in wins
                const map = match.querySelector(".cv_cardmap_map").textContent;
                if(Object.keys(maps).includes(map)) maps[map].total++; // Increment total
                else maps[map] = { "wins": 0, "total": 1 }; // Initialise new map object
                if(isWin) maps[map].wins++; // Increment wins
            });
        });
        console.log(maps);
        console.log(JSON.stringify(maps));

        // Build output
        let text = `Map winrates (including ties) in ${Object.values(maps).reduce((acc, val) => acc + val.total, 0)} matches | ${document.querySelector('.prof1').textContent}`;
        const values = {};
        Object.keys(maps).forEach(key => {
            values[key] = Math.round((maps[key].wins / maps[key].total) * 100);
        });
        const mapLen = longest(Object.keys(values));
        const persLen = longest(Object.values(values)) + 1;
        const countLen = longest(Object.values(maps).map(map => map.total));
        Object.values(values).sort(function(a, b){return a-b}).forEach(val => {
            Object.keys(values).forEach(key => {
                if(values[key] == val && !text.includes(key)) text += `\n${formatToLen(mapLen, key)} - ${formatToLen(persLen, values[key] + '%')} of ${formatToLen(countLen, maps[key].total)} matches`;
            });
        });
        console.log(text);
        GM_setClipboard(text, 'text');
        window.alert("Map stats copied to clipboard.\n\n" + text);
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


})();
