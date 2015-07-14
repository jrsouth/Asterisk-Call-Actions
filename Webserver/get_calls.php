<?php

/*
// MySQL code to get ten most recent numbers from the cdr table

SET @ext = 2267;

SELECT 
	"(Unknown)" `cid`,
    UNIX_TIMESTAMP(MAX(`calldate`)) `time`,
    UNIX_TIMESTAMP(MAX(`calldate`)) + `duration` `end`,
    LEAST(`src`, `dst`) `number`
FROM
    cdr
WHERE
    (`src` = @ext OR `dst` = @ext)
        AND
    (`src` LIKE '0%' OR `dst` LIKE '0%' OR `src` LIKE '+%' OR `dst` LIKE '+%')
GROUP BY `number`
ORDER BY `time` DESC
LIMIT 10
;



*/




echo('

{

"calls_curr" : [

{
   "cid": "Jim South",
"number": "02075042267",
 "start": "1436456013",
   "end": ""
}

],


"calls_hist" : [

{
   "cid": "Owen Bowden",
"number": "02075042281",
 "start": "1436455513",
   "end": "1436455613"
},

{
   "cid": "(Unmatched)",
"number": "02075042351",
 "start": "1436446013",
   "end": "1436446313"
},

{
   "cid": "(Anonymous)",
"number": "",
 "start": "1436445913",
   "end": "1436446013"
},

{
   "cid": "Jim South",
"number": "02075042267",
 "start": "1436445013",
   "end": "1436445313"
},

{
   "cid": "(Multiple Matches)",
"number": "02075042200",
 "start": "1436436013",
   "end": "1436436313"
}

] }


');

