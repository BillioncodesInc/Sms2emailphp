<?php

// Enable error logging to file instead of displaying
ini_set('display_errors', '0');
ini_set('log_errors', '1');
ini_set('error_log', __DIR__ . '/../logs/php_errors.log');
error_reporting(E_ALL);

// Input validation and sanitization
$number = isset($_GET['number']) ? preg_replace('/[^0-9]/', '', $_GET['number']) : '';
$sender = isset($_GET['sender']) ? filter_var($_GET['sender'], FILTER_SANITIZE_STRING) : '';
$api = isset($_GET['api']) ? filter_var($_GET['api'], FILTER_SANITIZE_URL) : '';
$carrier = isset($_GET['carrier']) ? filter_var($_GET['carrier'], FILTER_SANITIZE_STRING) : '';
$message = isset($_GET['message']) ? $_GET['message'] : '';
$address = isset($_GET['address']) ? filter_var($_GET['address'], FILTER_SANITIZE_EMAIL) : '';

//remove sender( to implement later..)  set: carrier, msg, num, text 
if (ctype_digit($number) && isset($sender) && isset($number) && isset($api) && isset($message) && isset($carrier)) {
   
   //$sid = $api[0];
   //$token = $api[1];
   $api .= '/text';
   $fields = array(
    'number' => $number,
    'message' => $message,
	'from' => $sender,
    'carrier' => $carrier);
    if($address){
$fields['senderAd'] = $address;
}
    $fields_string = http_build_query($fields);
	$ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $api);
	curl_setopt($ch, CURLOPT_POST, TRUE);
	curl_setopt($ch, CURLOPT_POSTFIELDS, $fields_string);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
    $result = curl_exec($ch);
	curl_close($ch);
    if (trim($result) === 'true') {
      echo 'Message Sent => +1'.$number;
    } else {
      echo '<span style="width: 100%;margin: 5px 0;color: #ff0000;font-size: 15px;">Message Failed => +1'.$number.'</span>';
    }
}else{
   echo '<span style="width: 100%;margin: 5px 0;color: #9c2a43;font-size: 15px;">Invalid Data</span>';
}


?>
