<?php

$ext = '"xxx"'; // Dummy value so SQL statement is valid even if $_POST['ext'] is missing.
$pass = '';
$ciddb = null;

if (isset($_POST['ext'])) {
  $ext = $_POST['ext'];
}
if (isset($_POST['pass'])) {
  $pass = $_POST['ext'];
}

// Set up empty lists;
$calls_curr_json = '';
$calls_hist_json = '';

// Generate current calls list
//$calls_curr_json = ' { "cid": "Jim South", "number": "02075042267", "start": "1436456013", "end": "" }';

   
   
   
// Generate historic calls list from call database (cdb)
$cdbhost = '62.8.125.58';
$cdbport = '39401';
$cdbuser = 'bloodwise';
$cdbpass = 'bl00dw1se$';
$cdbschema = 'asterisk';

$cdb = new PDO('mysql:host='.$cdbhost.';port='.$cdbport.';dbname='.$cdbschema.';charset=utf8', $cdbuser, $cdbpass);
$cdb->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$cdb->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);

$sql = '
SELECT 
	"(Unknown)" `cid`,
    UNIX_TIMESTAMP(MAX(`calldate`)) `start`,
    UNIX_TIMESTAMP(MAX(`calldate`)) + `duration` `end`,
    LEAST(`src`, `dst`) `number`
FROM
    cdr
WHERE
    (`src` = ' . $ext . ' OR `dst` = ' . $ext . ')
        AND
    (`src` LIKE "0%" OR `dst` LIKE "0%" OR `src` LIKE "+%" OR `dst` LIKE "+%")
GROUP BY `number`
ORDER BY `start` DESC
LIMIT 5;
';

$results = $cdb->query($sql);
$calls = $results->fetchAll(PDO::FETCH_ASSOC);

// Generate lookup table

$count = 0;
foreach ($calls as $call) {
    $calls_hist_json .= ($count++>0?',':'').'{ "cid": "' .lookupNumber($call['number']). '", "number": "' . $call['number'] . '", "start": "' .$call['start']. '", "end": "' .$call['end']. '" }';
}


function lookupNumber ($number) { // Inefficient! Should probably do a single DB lookup "IN (xxx,xxx,xxx)" then match within PHP.
global $ciddb;

if ($ciddb == null) {
    $ciddbhost = '148.251.46.243';
    $ciddbport = '3306';
    $ciddbuser = 'callactionsuser';
    $ciddbpass = 'Ve5yMo3b07jo';
    $ciddbschema = 'lalrorg_live_civicrm';

    $ciddb = new PDO('mysql:host='.$ciddbhost.';port='.$ciddbport.';dbname='.$ciddbschema.';charset=utf8', $ciddbuser, $ciddbpass);
    $ciddb->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $ciddb->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
}

$sql = 'SELECT civicrm_contact.display_name cid, civicrm_phone.phone number FROM civicrm_phone LEFT JOIN civicrm_contact ON civicrm_phone.contact_id = civicrm_contact.id WHERE civicrm_contact.is_deleted = 0 AND civicrm_phone.phone_numeric = "'.$number.'"';

$results = $ciddb->query($sql);

switch ($results->rowCount()) {
case 0  : return('(Unmatched)');
case 1  : $cids = $results->fetchAll(PDO::FETCH_ASSOC);
          return($cids[0]['cid']);
default : return('(Multiple matches)');
}



}


// Output JSON
echo('{ "calls_curr" : [ ' . $calls_curr_json . ' ], "calls_hist" : [ ' . $calls_hist_json . ' ] }');