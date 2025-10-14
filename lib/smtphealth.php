<?php
error_reporting(0);

/*
  PHP bridge to backend /smtp/health endpoint.

  Accepts:
    - api: base url of backend (e.g., http://127.0.0.1:9090)
  Returns:
    - JSON payload { ok, domain, hasMX, hasSPF, hasDMARC, message? }
*/

$api = isset($_GET['api']) ? $_GET['api'] : '';

header('Content-Type: application/json');

if (empty($api)) {
  echo json_encode(array(
    "ok" => false,
    "message" => "API empty"
  ));
  exit;
}

$endpoint = rtrim($api, "/") . "/smtp/health";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $endpoint);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, '{}');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
$result = curl_exec($ch);
curl_close($ch);

if (!$result) {
  echo json_encode(array(
    "ok" => false,
    "message" => "No response from backend"
  ));
  exit;
}

echo $result;
?>
