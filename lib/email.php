<?php
error_reporting(0);

/*
  PHP bridge to backend /email endpoint.

  Accepts:
    - api: base url of backend (e.g., http://127.0.0.1:9090)
    - recipients[] (array) OR emails (newline/comma/space separated string)
    - subject (optional)
    - message (required)
    - from (optional) OR sender + senderAd (to construct From: "sender" <senderAd>)
*/

$api = isset($_GET['api']) ? $_GET['api'] : '';
$subject = isset($_GET['subject']) ? $_GET['subject'] : '';
$message = isset($_GET['message']) ? $_GET['message'] : '';
$from = isset($_GET['from']) ? $_GET['from'] : '';
$sender = isset($_GET['sender']) ? $_GET['sender'] : '';
$senderAd = isset($_GET['senderAd']) ? $_GET['senderAd'] : '';

$recips = array();

// recipients[] array
if (isset($_GET['recipients']) && is_array($_GET['recipients'])) {
  $recips = $_GET['recipients'];
}

// emails string (newline/comma/space separated)
if (isset($_GET['emails']) && !empty($_GET['emails'])) {
  $raw = $_GET['emails'];
  $parts = preg_split('/[\s,;]+/', $raw);
  foreach ($parts as $p) {
    $p = trim($p);
    if (!empty($p)) $recips[] = $p;
  }
}

$recips = array_values(array_unique($recips));

// Basic guards
if (empty($api) || empty($message) || count($recips) === 0) {
  echo json_encode(array(
    "success" => false,
    "message" => "Missing required fields (api, message, recipients)"
  ));
  exit;
}

$endpoint = rtrim($api, "/") . "/email";

$payload = array(
  "recipients" => $recips,
  "subject" => $subject,
  "message" => $message
);

if (!empty($from)) {
  $payload["from"] = $from;
} elseif (!empty($sender)) {
  $payload["sender"] = $sender;
  if (!empty($senderAd)) {
    $payload["senderAd"] = $senderAd;
  }
}

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $endpoint);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
$result = curl_exec($ch);
curl_close($ch);

$trimmed = trim($result);
if ($trimmed === 'true') {
  echo "SUCCESS";
} else {
  // pass-through backend error if json, else generic
  $decoded = json_decode($trimmed, true);
  if (json_last_error() === JSON_ERROR_NONE) {
    header('Content-Type: application/json');
    echo json_encode($decoded);
  } else {
    echo "FAILED";
  }
}
?>
