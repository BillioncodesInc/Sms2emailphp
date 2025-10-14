<?php

// Enable error logging to file instead of displaying
ini_set('display_errors', '0');
ini_set('log_errors', '1');
ini_set('error_log', __DIR__ . '/../logs/php_errors.log');
error_reporting(E_ALL);

if (!empty($_GET['api'])) {
	// Input validation and sanitization
	$sender = isset($_GET['sender']) ? filter_var($_GET['sender'], FILTER_SANITIZE_STRING) : '';
	$api = filter_var($_GET['api'], FILTER_SANITIZE_URL);
	$mail = isset($_GET['to']) ? filter_var($_GET['to'], FILTER_SANITIZE_EMAIL) : '';
	$api .= '/test';
	
	$fields = array(
    'message' => 'I sent this message for free',
	'mail' => $mail,
	'sender' => $sender
);
	$fields_string = http_build_query($fields);
	$ch = curl_init();
	// check if smtp is live by sending test email
	curl_setopt($ch, CURLOPT_URL, $api);
	curl_setopt($ch, CURLOPT_POST, TRUE);
	curl_setopt($ch, CURLOPT_POSTFIELDS, $fields_string); // POST method for smtp
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);

	$result = curl_exec($ch);
	curl_close($ch);
	if (trim($result) === 'true') { 
		echo "LIVE";
	} else {
		echo "DEAD";
	}

}
else{
	echo "Server Empty!";
}







?>
