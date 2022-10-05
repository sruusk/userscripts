// ==UserScript==
// @name         GitHub Fork commits
// @namespace    https://a32.fi
// @version      0.2
// @description  checks if fork is ahead
// @author       Apina-32
// @updateURL    https://github.com/Apina-32/userscripts/raw/main/GitHub%20Fork%20commits.user.js
// @downloadURL  https://github.com/Apina-32/userscripts/raw/main/GitHub%20Fork%20commits.user.js
// @match        https://github.com/*
// @icon         https://icons.duckduckgo.com/ip2/github.com.ico
// @grant        GM_registerMenuCommand
// ==/UserScript==

(function() {
    'use strict';

    GM_registerMenuCommand("Check fork ahead", () => {
        javascript:(async () => {
            /* while on the forks page, collect all the hrefs and pop off the first one (original repo) */
            const aTags = [...document.querySelectorAll('div.repo a:last-of-type')].slice(1);

            for (const aTag of aTags) {
                /* fetch the forked repo as html, search for the "This branch is [n commits ahead,] [m commits behind]", print it directly onto the web page */
                await fetch(aTag.href)
                    .then(x => x.text())
                    .then(html => aTag.outerHTML += `${html.match(/This branch is.*/).pop().replace('This branch is', '').replace(/([0-9]+ commits? ahead)/, '<font color="#0c0">$1</font>').replace(/([0-9]+ commits? behind)/, '<font color="red">$1</font>')}`)
                    .catch(console.error);
            }
        })();
    });
})();
