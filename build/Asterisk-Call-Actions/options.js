

function save_options() {
  var ext = document.getElementById('ext').value;
  var pass = document.getElementById('pass').value;
  var url = document.getElementById('url').value.replace(/\/+$/, ''); // Replace trailing slash

  chrome.storage.sync.set({
    ext: ext,
    pass: pass,
    url: url
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}



function restore_options() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get({
    ext: "",
    pass: "",
    url: ""
  }, function(items) {
    document.getElementById('ext').value = items.ext;
    document.getElementById('pass').value = items.pass;
    document.getElementById('url').value = items.url;
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options); 
