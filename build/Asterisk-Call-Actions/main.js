"use strict";

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


function showLinks(callData, url) {
  // Creates relevant HTML for each entry in the returned JSON object
   
  var linkDiv = document.getElementById('linkdiv');
  linkDiv.innerHTML = 'No calls found';
  
  var innerHTML = '';
  
  if (callData.calls_curr.length > 0) {
    innerHTML += '<h1>Current call(s)</h1>' + getLinks(callData.calls_curr, url);
  }
  
  if (callData.calls_hist.length > 0) {
    innerHTML += '<h1>Call history</h1>' + getLinks(callData.calls_hist, url);
  }
 
 linkDiv.innerHTML = innerHTML;
 
   // Add a generic click event listener to all new links in the document
  var nodeList = document.querySelectorAll('a');
  var i
  
  for (i = 0; i < nodeList.length; i += 1) {
    nodeList[i].addEventListener('click', clickHandler);
  }
  
}
  
function getLinks (calls, url) {
  
  var innerHTML = '';
  var call;

  var i;
  for (i = 0; i < calls.length; i += 1) {
    call = calls[i];

    // Convert timestamp to human-readable
    call.start = new Date(call.start * 1000);
    call.start = call.start.getHours() + ':' + ('0' + call.start.getMinutes()).slice(-2) + ', ' + call.start.toDateString();

    innerHTML = innerHTML + '<div class="call' + (call.end===''?' active"':'') + '"><p class="cid' + (call.cid.charAt(0)==='('?' unmatched':'') + '">' + call.cid + '</p><p>' + call.number + ' (' + call.start + ')</a></p><a href="' + url + '/action?number=' + call.number + '"><span class="clickable-div-link"></span></a></div>';
  }
  return(innerHTML);
  
}

function fetchLinks (ext, pass, url) {
 
  var xhr = new XMLHttpRequest();
  
  xhr.open('POST', url + '/get_calls', true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      var callData = JSON.parse(xhr.responseText);
      showLinks(callData, url);
    }
  };
  xhr.send('ext='+ext+'&pass='+pass);
}


function init() {
  // Get extension, password, and URL variables from storage, 
  chrome.storage.sync.get(['ext', 'pass', 'url'], function(items) {
    if (typeof(items.url) === 'undefined' || items.url === '' ) {
      chrome.runtime.openOptionsPage()
    }
      
    // fetch/create appropriate links
    fetchLinks(items.ext, items.pass, items.url)
  });

    
  var settingsLink = document.getElementById('settings-link');
  settingsLink.addEventListener('click', function () { chrome.runtime.openOptionsPage(); });
    

}

// Set it all up once the pop-up is loaded.
document.addEventListener('DOMContentLoaded', function () {  init();  });