// ==UserScript==
// @name         Convars Map Statistics
// @namespace    http://a32.fi/
// @version      0.11
// @description  Counts number of bans per map.
// @author       sruusk
// @match        https://convars.com/csgostats/*
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand
// @grant        GM_setClipboard
// ==/UserScript==

(function() {
    'use strict';

    GM_registerMenuCommand("Get map stats", combinedStats);

    const ignoreThreshold = 10;

    function combinedStats(){
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
                const bans = match.querySelectorAll(".cv_cardmap_players .banned");

                if(!Object.keys(maps).includes(map)) maps[map] = { total: 0, totalBans: 0, bans: 0, wins: 0 };
                maps[map].total++;
                if(isWin) maps[map].wins++;
                maps[map].totalBans += bans.length
                maps[map].bans += bans.length > 0;
            });
        });

        let text =
`Convars map stats from ${Object.values(maps).reduce((acc, val) => acc + val.total, 0)} matches | ${document.querySelector('.prof1').textContent}

BPM = Bans per match
% = Percentage of matches having banned players
WR = Win rate

Sorted by win rate; Ignored maps with <${ignoreThreshold} matches\n`;

        const data = {};

        Object.entries(maps).forEach(([map, stats]) => {
            data[map] = {
                bpm: Math.round(stats.bans / stats.total * 100) / 100,
                pers: Math.round((stats.bans / stats.total) * 100),
                wr: Math.round((stats.wins / stats.total) * 100)
            };
        });

        const mapLen = longest(Object.keys(maps));
        const bpmLen = longest(Object.values(data).map(item => item.bpm));
        const persLen = longest(Object.values(data).map(item => item.pers)) + 1;
        const wrLen = Math.max(longest(Object.values(data).map(item => item.wr)) + 1, 'WR ▼'.length);
        const countLen = 5; //longest(Object.values(maps).map(item => item.total))

        const totalLen = mapLen + bpmLen + persLen + wrLen + countLen;

        text += `\n┌${'─'.repeat(mapLen + 2)}┬${'─'.repeat(bpmLen + 2)}┬${'─'.repeat(persLen + 2)}┬${'─'.repeat(wrLen + 2)}┬${'─'.repeat(countLen + 2)}┐`;
        text += `\n│ ${formatToLen(mapLen, 'Map')} │ ${formatToLen(bpmLen, 'BPM')} │ ${formatToLen(persLen, '%')} │ ${formatToLen(wrLen, 'WR ▼')} │ Total │`

        const sortBy = Object.values(data).map(item => item.wr);

        sortBy.sort(function(a, b){return b-a}).forEach(val => {
            Object.keys(maps).forEach((key) => {
                if(data[key].wr == val && !text.includes(key) && maps[key].total >= ignoreThreshold) {
                    text += `\n├${'─'.repeat(mapLen + 2)}┼${'─'.repeat(bpmLen + 2)}┼${'─'.repeat(persLen + 2)}┼${'─'.repeat(wrLen + 2)}┼${'─'.repeat(countLen + 2)}┤`;
                    text += `\n│ ${formatToLen(mapLen, key)} │ ${formatToLen(bpmLen, data[key].bpm)} │ ${formatToLen(persLen, data[key].pers + '%')} │ ${formatToLen(wrLen, data[key].wr + '%')} │ ${formatToLen(countLen, maps[key].total)} │`;
                }
            });
        });

        text += `\n└${'─'.repeat(mapLen + 2)}┴${'─'.repeat(bpmLen + 2)}┴${'─'.repeat(persLen + 2)}┴${'─'.repeat(wrLen + 2)}┴${'─'.repeat(countLen + 2)}┘`;

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
