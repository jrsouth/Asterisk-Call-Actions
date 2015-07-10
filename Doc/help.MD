# Asterisk Call Actions

## General Notes

It's up to the user to implement the required server-side scripts "get_calls" and "action", including how user and password variables are utilised.

The settings option "URL" doesn't require a trailing slash (it will be removed on save if present).

`mod_rewrite` or similar can be used to point /get_calls and /action to the relevant scripts, allowing for freedom of scripting language.

An example (for PHP files):

~~~
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME}.php -f
RewriteRule ^(.+)$ $1.php [L,QSA]
~~~

## Script: `get_calls`

The server needs to provide a well-formed JSON response from "/get_calls", with the option values of "Extension" and "Password" sent as POST parameters "ext" and "pass" respectively.

The response should contain two arrays, "calls_curr" and "calls_hist", each containing zero or more call objects.

Call objects should contain four strings:

* cid -- the caller's ID if available/recognised, or any code in brackets (cids starting "(" are displayed in a lighter colour for visual differentiation)
* number -- external phone number, or an empty string if unavailable
* start -- timestamp of the start of the call
* end -- timestamp of the end of the call, or an empty string if the call is ongoing<

[Sample JSON response](https://raw.githubusercontent.com/jrsouth/Asterisk-Call-Actions/master/Webserver/sample.json)

## Script: action

On clicking any listed call, a new tab is opened with the url "\action?number=XXXXXXXX" (with XXXXX being the external number of the clicked call).

The simplest use-case would be a redirect to a CRM using the supplied "number" as a query-string variable.
