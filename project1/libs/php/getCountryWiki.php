<?php

	require_once __DIR__ . "../../../../vendor/autoload.php";

	ini_set('display_errors', 'On');
	error_reporting(E_ALL);

	$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . "../../../" );
	$dotenv->safeLoad();

	$username = $_ENV["API_USERNAME"];

	$executionStartTime = microtime(true);

	$url='http://api.geonames.org/wikipediaSearchJSON?formatted=true&q=' . $_REQUEST['countryName'] . '&username=' . $username .'&style=full';

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	$result=curl_exec($ch);

	curl_close($ch);

	$jsonData = json_decode($result, true);
    $countryName = $_GET["countryName"];
    $countryWiki = "";

	// foreach loop not working. trying to filter out the jsonData entry for country
	foreach ($jsonData["geonames"] as $i) {
        $feature = $i["feature"];
        if ($feature && $feature === "country") {
            $countryWiki = $jsonData["geonames"][$i];
        }
    }

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
	$output['data'] = $countryWiki;
	
	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 

?>