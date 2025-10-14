<?php

// Enable error logging to file instead of displaying
ini_set('display_errors', '0');
ini_set('log_errors', '1');
ini_set('error_log', __DIR__ . '/../logs/php_errors.log');
error_reporting(E_ALL);

// Input validation and sanitization
$api = isset($_GET['api']) ? filter_var($_GET['api'], FILTER_SANITIZE_URL) : '';
$protocol = isset($_GET['protocol']) ? filter_var($_GET['protocol'], FILTER_SANITIZE_STRING) : '';
$proxies = isset($_GET['proxies']) ? $_GET['proxies'] : array();

$fields = array(
 'protocol' => $protocol,
);
$fields['proxies'] = $proxies;
if(isset($api) && isset($proxies)){
    $api .= '/proxy';
    $fields_string = json_encode($fields);
	$ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $api);
	curl_setopt($ch, CURLOPT_POST, TRUE);
	curl_setopt($ch, CURLOPT_POSTFIELDS, $fields_string);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
    $result = curl_exec($ch);
	curl_close($ch);
    if (trim($result) === 'true') {
      echo "SUCCESS";
    } else {
      echo "FAILED";
    }
}else{
   echo '<span style="width: 100%;margin: 5px 0;color: #9c2a43;font-size: 15px;font-weight: bold;">Invalid Data</span>';
}







?>
