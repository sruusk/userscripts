// ==UserScript==
// @name         Pesis tilastot
// @namespace    https://a32.fi
// @version      0.3
// @description  Retrieves all games for a referee during the current year
// @author       sruusk
// @updateURL    https://github.com/sruusk/userscripts/raw/main/Pesis%20tilastot.user.js
// @downloadURL  https://github.com/sruusk/userscripts/raw/main/Pesis%20tilastot.user.js
// @match        https://www.pesistulokset.fi/*
// @icon         https://icons.duckduckgo.com/ip2/superpesis.fi.ico
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand
// @connect      pesistulokset.fi
// ==/UserScript==

(async function() {
    'use strict';
    const REFEREE = "REFEREE NAME";
    const DELAY = 5000;

    const date = new Date();
    const year = date.getFullYear();
    let counter = 0;
    let games = [];

    let test = GM_registerMenuCommand("Tuomaroidut pelit", async () => {
        makeUI();
        while(date.getFullYear() === year){
            getMatches(`https://www.pesistulokset.fi/api/v1/matches-per-date?date=${getDate()}`);
            date.setDate(date.getDate() - 1);
            await wait(DELAY);
        }
        document.querySelector("#referee-info").textContent = `Finished! Found ${counter} matches.`;
    });

    const getMatch = async (url) => {
        return await GM_xmlhttpRequest({
            method: "GET",
            url: url,
            headers: {
                "Accept": "text/html" // If not specified, browser defaults will be used.
            },
            onload: function(response) {
                const res = new DOMParser().parseFromString(response.response, "text/html");
                const referees = res.querySelectorAll(".referee-name");
                referees.forEach( ref => {
                    if(ref.innerText === REFEREE){
                        counter++;
                        games.push(url.replace("#info", ""));
                        console.log(counter, url.replace("#info", ""));
                        addLink(url.replace("#info", ""));
                    }
                });
                document.querySelector("#referee-info").textContent = `Loading...\n${ daysSinceStartOfYear(date) * DELAY / 1000 } seconds remaining.\nFound ${counter} matches.`;
            }
        });
    };

    const getMatches = async (url) => {
        return await GM_xmlhttpRequest({
            method: "GET",
            url: url,
            headers: {
                "Accept": "json" // If not specified, browser defaults will be used.
            },
            onload: async function(response) {
                try{
                    const content = JSON.parse(response.response);
                    content.data.forEach(match => {
                        getMatch(`${match.url}#info`);
                    });
                }
                catch(e){
                    //window.alert("Error occured!\nTry raising the delay.");
                    await getMatches(url);
                }
            }
        });
    };

    const getDate = () => {
        return date.toISOString().split("T")[0]
    };

    function daysSinceStartOfYear(date) {
        const startOfYear = new Date(date.getFullYear(), 0, 1);
        const timeDiff = date - startOfYear;
        return Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    }

    const wait = async (ms) => {
        return new Promise(resolve => {
            window.setTimeout(resolve, ms);
        });
    };

    const makeUI = () => {
        // Create main UI parent element
        const background = document.createElement("div");
        background.style.display = "flex";
        background.style.flexDirection = "column";
        background.style.width = "40%";
        background.style.left = "30%";
        background.style.top = "10%";
        background.style.textAlign = "center";
        background.style.color = "white";
        background.style.zIndex = "100";
        background.style.position = "absolute";
        background.style.backgroundColor = "black";
        background.id = "info-container";

        // Create status text div
        const infoText = document.createElement("pre");
        infoText.id = "referee-info";
        infoText.innerText = "Loading...";
        infoText.style.color = "white";
        infoText.style.fontSize = "18px";
        background.appendChild(infoText);
        document.body.appendChild(background);

        // Add color for visited link
        try {
            let sheet = window.document.styleSheets[0];
            sheet.insertRule('a:visited { color: #5d523f !important; }', sheet.cssRules.length);
        } catch(e){
            console.log(e);
        }
    };

    const addLink = (url) => {
        const link = document.createElement("a");
        link.href = url;
        link.target = "_blank";
        link.style.margin = "10px 10px"
        link.style.color = "wheat";
        link.innerText = url;
        document.querySelector("#info-container").appendChild(link);
    };

})();
