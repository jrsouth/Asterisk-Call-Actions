"use strict";

// Set up user variables
var EXT = '', PASS = '', URL = '', BGPAGE;

/* ---- Begin new tab/window functions ---- */

function newTab(newurl) {
  var json = JSON.parse('{"url": "' + newurl + '", "active": true}');
  chrome.tabs.create(json);
}

/* ---- End new tab/window functions ---- */




function clickHandler(e) {
  // Action for clicking on links (as determined by the element's className)
  // Maybe add CTRL+click handling for tab control?
  console.log(e);
  newTab(this);
}


function showLinks(calls) {
  // Creates relevant HTML for each entry in the returned JSON object
   
  var linkDiv = document.getElementById('linkdiv');
  linkDiv.innerHTML = 'No calls found';
  
  var innerHTML = '';
  
  if (calls.calls_curr.length > 0) {
    innerHTML += '<h1>Current call' + (calls.calls_curr.length > 1?'s':'') + '</h1>' + getLinks(calls.calls_curr, URL);
    BGPAGE.notify(calls.calls_curr[0].cid, calls.calls_curr[0].number, URL);
  }
  
  if (calls.calls_hist.length > 0) {
    innerHTML += '<h1>Call history</h1>' + getLinks(calls.calls_hist, URL);
  }
 
 linkDiv.innerHTML = innerHTML;
 
   // Add a generic click event listener to all new links in the document
  var nodeList = linkDiv.querySelectorAll('a');
  var i
  
  for (i = 0; i < nodeList.length; i += 1) {
    nodeList[i].addEventListener('click', clickHandler);
  }
  
}
  
function getLinks (calls) {
  
  var innerHTML = '';
  var call;

  var i;
  for (i = 0; i < calls.length; i += 1) {
    call = calls[i];

    // Convert timestamp to human-readable
    call.start = new Date(call.start * 1000);
    call.start = call.start.getHours() + ':' + ('0' + call.start.getMinutes()).slice(-2) + ', ' + call.start.toDateString();

    innerHTML = innerHTML + '<div class="call' + (call.end===''?' active"':'') + '"><p class="cid' + (call.cid.charAt(0)==='('?' unmatched':'') + '">' + call.cid + '</p><p><strong>' + BGPAGE.formatNumber(call.number) + '</strong> (' + call.start + ')</a></p><a href="' + URL + '/action?number=' + call.number + '&uniq=' + Math.random() + '"><span class="clickable-div-link"></span></a></div>';
  }
  return(innerHTML);
  
}



function fetchCalls () {
 
  var xhr = new XMLHttpRequest();
  
  xhr.open('POST', URL + '/get_calls', true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      var calls = JSON.parse(xhr.responseText);
      showLinks(calls);
    }
  };
  xhr.send('ext='+EXT+'&pass='+PASS);
}




function init() {
  // Get background page (and settings)
    chrome.runtime.getBackgroundPage( function (bgPage) {

    EXT = bgPage.EXT;
    PASS = bgPage.PASS;
    URL = bgPage.URL;
    BGPAGE = bgPage;
          
    fetchCalls ();
    });
  

  
  // Set up settings icon link
  var settingsLink = document.getElementById('settings-link');
  settingsLink.addEventListener('click', function () { chrome.runtime.openOptionsPage(); });
  
}

// Fire it all up once the full pop-up is loaded.
document.addEventListener('DOMContentLoaded', function () {  init();  });