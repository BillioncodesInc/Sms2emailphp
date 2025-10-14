<?php

// Enable error logging to file instead of displaying
ini_set('display_errors', '0');
ini_set('log_errors', '1');
ini_set('error_log', __DIR__ . '/../logs/php_errors.log');
error_reporting(E_ALL);

// Input validation and sanitization
$bulk = isset($_GET['bulk']) ? filter_var($_GET['bulk'], FILTER_SANITIZE_STRING) : '';
$service = isset($_GET['service']) ? filter_var($_GET['service'], FILTER_SANITIZE_STRING) : '';
$api = isset($_GET['smtp']) ? filter_var($_GET['smtp'], FILTER_SANITIZE_URL) : '';
$ssl = isset($_GET['ssl']) ? filter_var($_GET['ssl'], FILTER_SANITIZE_STRING) : '';

$fields = array(
 'service' => $service,
 'secureConnection' => $ssl,
 'bulk' => $bulk
);

if(isset($api) && isset($service)){
    $api .= '/config';
    if($bulk == "false") {
        $user = isset($_GET['user']) ? filter_var($_GET['user'], FILTER_SANITIZE_STRING) : '';
        $pass = isset($_GET['password']) ? $_GET['password'] : '';
        
        //remove sender( to implement later..)  set: carrier, msg, num, text 
        if (isset($user) && isset($pass)) {
           $fields['user'] = $user;
           $fields['pass'] = $pass;
        } 
    } if($bulk == 'true'){
        $list = $_GET['smtplist'];

        if(isset($list)) {
            //$List is an array 
            $fields['smtplist'] = $list;
            //error_log(print_r($list, true), 0);
        }

    }
    //$fields_string = http_build_query($fields);
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
