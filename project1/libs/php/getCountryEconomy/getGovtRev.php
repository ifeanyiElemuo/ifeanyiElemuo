<?php

	ini_set('display_errors', 'On');
	error_reporting(E_ALL);

	
	$executionStartTime = microtime(true);

	$url = 'https://www.imf.org/external/datamapper/api/v1/rev/'  . $_REQUEST['iso_a3'] . '?periods=' . $_REQUEST['period'];
    
    $ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	$result=curl_exec($ch);

	curl_close($ch);

	$decode = json_decode($result, true);

	$iso_a3 = $_GET['iso_a3'];
	$period = $_GET['period'];
	$jsonData = $decode['values']['rev'][$iso_a3][$period];

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
	$output['data'] = $jsonData;
	
	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 

?>