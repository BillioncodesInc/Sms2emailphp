<?php
error_reporting(0);

/*
  PHP bridge to backend /validateEmails endpoint.

  Accepts:
    - api: base url of backend (e.g., http://127.0.0.1:9090)
    - emails (string: newline/comma/space separated) OR recipients[] (array)
    - excludeMajors (optional: true/false)
    - denylist[] (optional: extra domains to exclude)
*/

$api = isset($_GET['api']) ? $_GET['api'] : '';
$excludeMajors = isset($_GET['excludeMajors']) ? $_GET['excludeMajors'] : '';
$denylist = array();

if (isset($_GET['denylist']) && is_array($_GET['denylist'])) {
  $denylist = $_GET['denylist'];
}
if (isset($_GET['denylist']) && is_string($_GET['denylist'])) {
  $denylist = preg_split('/[\s,;]+/', $_GET['denylist']);
}

$list = array();
if (isset($_GET['recipients']) && is_array($_GET['recipients'])) {
  $list = $_GET['recipients'];
}
if (isset($_GET['emails']) && !empty($_GET['emails'])) {
  $raw = $_GET['emails'];
  $parts = preg_split('/[\s,;]+/', $raw);
  foreach ($parts as $p) {
    $p = trim($p);
    if (!empty($p)) $list[] = $p;
  }
}
$list = array_values(array_unique($list));

if (empty($api)) {
  header('Content-Type: application/json');
  echo json_encode(array("valid" => array(), "removed" => $list, "message" => "API empty"));
  exit;
}

$endpoint = rtrim($api, "/") . "/validateEmails";
$payload = array(
  "emails" => $list,
  "excludeMajors" => ($excludeMajors === 'true' || $excludeMajors === true) ? true : false,
  "denylist" => $denylist
);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $endpoint);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
$result = curl_exec($ch);
curl_close($ch);

header('Content-Type: application/json');
echo $result ? $result : json_encode(array("valid" => array(), "removed" => $list));
?>
