<?php
error_reporting(0);

/*
  PHP bridge to backend /smtp/verify endpoint.

  Accepts:
    - api: base url of backend (e.g., http://127.0.0.1:9090)
  Returns:
    - "LIVE" if backend returns 'true'
    - "DEAD" otherwise
*/

$api = isset($_GET['api']) ? $_GET['api'] : '';

if (empty($api)) {
  echo "DEAD";
  exit;
}

$endpoint = rtrim($api, "/") . "/smtp/verify";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $endpoint);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, '{}');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
$result = curl_exec($ch);
curl_close($ch);

echo (trim($result) === 'true') ? "LIVE" : "DEAD";
?>
