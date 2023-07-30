<?php
	ini_set('display_errors', 'On');
	error_reporting(E_ALL);
	$executionStartTime = microtime(true);

    $data = file_get_contents("../data/countryBorders.geo.json", true);
    $jsonData = json_decode($data, true);
    $countriesData = [];
    
    foreach($jsonData['features'] as $feature) {
        $countryName = $feature["properties"]["name"];
		$countryCode = $feature["properties"]["iso_a2"];
        $countriesData[$countryName] = $countryCode;
    }

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
	$output['data'] = $countriesData;
	
	
	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 

?>