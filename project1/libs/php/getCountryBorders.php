<?php
    ini_set('display_errors', 'On');
    error_reporting(E_ALL);
    $executionStartTime = microtime(true);

    $countryData = file_get_contents("../data/countryBorders.geo.json", true);
    $jsonData = json_decode($countryData, true);
    $countryCode = $_GET["selectCountryVal"];
    $countryBorders = "";

    foreach ($jsonData["features"] as $feature) {
        $country_Code = $feature["properties"]["iso_a2"];
        $geometry = $feature["geometry"];
        if ($country_Code === $countryCode) {
            $countryBorders = $geometry;
        }
    }
    
    $output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
	$output['data'] = $countryBorders;
	
	
	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 
?>