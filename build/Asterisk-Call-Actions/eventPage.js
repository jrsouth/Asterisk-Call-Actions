// Set up user variables
var EXT = '', PASS = '', URL = '';


// Get extension, password, and URL variables from storage (EXT, PASS, URL)
chrome.storage.sync.get(['ext', 'pass', 'url'], function(items) {

  // Open options if no url is defined
  // Needs better checking, i.e. for valid HTTP/JSON response
  if (typeof(items.url) === 'undefined' || items.url === '' ) {
      chrome.runtime.openOptionsPage();
  }

  EXT = items.ext;
  PASS = items.pass;
  URL = items.url;

  // Set up click handler for notifications
  chrome.notifications.onClicked.addListener ( function(nid) {
    var number = (nid.split('%'))[1];
    var json = JSON.parse('{"url": "' + URL + '/action?number=' + number + '", "active": true}');
    chrome.tabs.create(json);
  } );

} );




// Generate system notification
function notify (cid, number) {

    var nid = Math.random() + '%' + number;
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

function testNotify() {
 notify('Jim South', '02075042267'); 
}

// Turn a phone number (as string) into nicely grouped number for display
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