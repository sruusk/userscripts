// ==UserScript==
// @name         Spotify redirect
// @version      1.1
// @namespace    https://github.com/Apina-32/
// @updateURL    https://github.com/Apina-32/userscripts/raw/main/Spotify%20redirect.user.js
// @match        http://open.spotify.com/*
// @match        https://open.spotify.com/*
// @grant        window.close
// @grant        GM_setValue
// @grant        GM_getValue
// @description  Open open.spotify.com links in desktop app
// @author       Apina-32
// ==/UserScript==

(function() {
    'use strict';
    var data=document.URL.match(/[\/\&](track|playlist|album|artist)\/([^\&\#\/\?]+)/i);
    console.log("This is a "+data[1]+" with id:"+data[2]+"\nAttempting to redirect");
    if(GM_getValue("launched",0)){
        window.location.replace('spotify:'+data[1]+':'+data[2]);
        window.close();
    }
    else{
        alert("IMPORTANT: set the spotify as the default link handler now");
        window.location.replace('spotify:'+data[1]+':'+data[2]);
        GM_setValue("launched",1);
    }
})();
