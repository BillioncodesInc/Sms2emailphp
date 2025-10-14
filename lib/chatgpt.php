<?php

require __DIR__ . '/../vendor/autoload.php'; // remove this line if you use a PHP Framework.

use Orhanerday\OpenAi\OpenAi;

$message = $_GET['message'];
function processText($text) {
    $text = strip_tags($text);
    $text = trim($text);
    $text = htmlspecialchars($text);
    return $text;
}
function generateText($message) {
    $open_ai_key = getenv('OPENAI_API_KEY');
    $open_ai = new OpenAi($open_ai_key);
    if (isset($message)) { 
        $message = processText($message);
    }
    $prompt = 'You are to act as a professinal hacker for a movie '.PHP_EOL;
    $prompt .= 'script, I will provide a text and you will generate a '.PHP_EOL; 
    $prompt .= 'similar text, in less than 140 characters. do not include any link and empty lines. the text goes thus: '.$message; 
    $complete = $open_ai->completion([
        'model' => 'text-davinci-003',
        'prompt' => $prompt,
        'temperature' => 1.0,
        'max_tokens' => 150,
    ]);
    $text = json_decode($complete, true)["choices"][0]["text"];
    echo $text;
    //return $text;

}
if(isset($message)) {
   generateText($message);
}

?>