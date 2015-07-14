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


function showLinks(calls, url) {
  // Creates relevant HTML for each entry in the returned JSON object
   
  var linkDiv = document.getElementById('linkdiv');
  linkDiv.innerHTML = 'No calls found';
  
  var innerHTML = '';
  
  if (calls.calls_curr.length > 0) {
    innerHTML += '<h1>Current call' + (calls.calls_curr.length > 1?'s':'') + '</h1>' + getLinks(calls.calls_curr, url);
    notify(calls.calls_curr[0].cid, calls.calls_curr[0].number, url);
    alert('notifying '+calls.calls_curr[0].cid);
  }
  
  if (calls.calls_hist.length > 0) {
    innerHTML += '<h1>Call history</h1>' + getLinks(calls.calls_hist, url);
  }
 
 linkDiv.innerHTML = innerHTML;
 
   // Add a generic click event listener to all new links in the document
  var nodeList = linkDiv.querySelectorAll('a');
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

    innerHTML = innerHTML + '<div class="call' + (call.end===''?' active"':'') + '"><p class="cid' + (call.cid.charAt(0)==='('?' unmatched':'') + '">' + call.cid + '</p><p><strong>' + formatNumber(call.number) + '</strong> (' + call.start + ')</a></p><a href="' + url + '/action?number=' + call.number + '&uniq=' + Math.random() + '"><span class="clickable-div-link"></span></a></div>';
  }
  return(innerHTML);
  
}

function formatNumber (number) {
  // @number to be passed as a string due to likelihood of leading zeros, +XX country codes, etc.
  // Maybe in future use Google's libphonenumber library, not necessary now

  switch (number.charAt(0)) {
    case '0': // "Normal" number
	      switch (number.charAt(1)) {
		  case '7': // Handle mobile numbers 5-3-3
			    return(number.replace(/(\d{5})(\d{3})(\d{3})/, '$1 $2 $3'));
		  default : // Otherwise assume UK national format 4-3-4
			    return(number.replace(/(\d{4})(\d{3})(\d{4})/, '$1 $2 $3'));
	      }

    case '+': // International call, currently return as-is due to variance of country code length
	      return(number);

    default : // No match, return as given  
	      return(number);
  }
}

function fetchLinks (ext, pass, url) {
 
  var xhr = new XMLHttpRequest();
  
  xhr.open('POST', url + '/get_calls', true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      var calls = JSON.parse(xhr.responseText);
      showLinks(calls, url);
    }
  };
  xhr.send('ext='+ext+'&pass='+pass);
}

function notify(cid, number, url) {

    var nid = url + '%' + number;
    chrome.notifications.clear(nid);
    chrome.notifications.create(nid,
    {
      type : 'basic',
      title : 'Incoming Call',
      isClickable: true,
      iconUrl : 'icons/icon_128.png', 
      message : cid,
      contextMessage : '(' + formatNumber(number) + ')'
    },
    function () {} );

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
  

  
  // Set up settings icon link
  var settingsLink = document.getElementById('settings-link');
  settingsLink.addEventListener('click', function () { chrome.runtime.openOptionsPage(); });
    
  chrome.notifications.onClicked.addListener ( function(nid) {
      alert(nid);
      var json = JSON.parse('{"url": "' + nid + '/action?number=' + nid + '", "active": true}');
      chrome.tabs.create(json);
      alert('xxx');
      notification.close();
    });

}

// Set it all up once the pop-up is loaded.
document.addEventListener('DOMContentLoaded', function () {  init();  });