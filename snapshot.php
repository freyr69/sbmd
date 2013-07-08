<?php

define('UPLOAD_DIR', 'uploads/');
die(var_dump($_POST));
$payload = json_decode($_POST);
die($payload);
$img = $payload['imgData'];
$img = str_replace('data:image/png;base64,', '', $img);
$img = str_replace(' ', '+', $img);
$data = base64_decode($img);
$file = UPLOAD_DIR . uniqid() . '.png';
$success = file_put_contents($file, $data);
echo $success;
