<?php
    ini_set('display_errors', 'On');
    error_reporting(E_ALL);
    $executionStartTime = microtime(true);

    $countryData = file_get_contents("../data/countryBorders.geo.json", true);
    $jsonData = json_decode($countryData, true);
    $countryBorders = [];

    foreach ($jsonData["features"] as $feature) {
        $countryCode = $feature["properties"]["iso_a2"];
        $coordinates = $feature["geometry"]["coordinates"];
        $countryBorders[$countryCode] = $coordinates;
    }
    
    $output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
	$output['data'] = $countryBorders;
	
	
	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 
?>