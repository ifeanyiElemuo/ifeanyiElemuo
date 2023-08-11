<?php

    require_once __DIR__ . "../../../../vendor/autoload.php";

    ini_set('display_errors', 'On');
    error_reporting(E_ALL);

    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . "../../../" );
    $dotenv->safeLoad();

    $access_key = $_ENV["access_key"];

    $executionStartTime = microtime(true);

    $url = 'https://v6.exchangerate-api.com/v6/' . $access_key . '/pair/' . $_REQUEST['fromVal'] . '/' . $_REQUEST['toVal'] . '/' . $_REQUEST['amtVal'];
    
    $ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	$result=curl_exec($ch);

	curl_close($ch);

	$decode = json_decode($result, true);

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
	$output['data'] = $decode;
	
	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 

?>