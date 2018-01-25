<?php
$dbserver = "localhost";
$dbusername = "username";
$dbpassword = "password";

try {
	$pdo = new PDO("mysql:host=$dbserver;dbname=id4198359_users", $dbusername, $dbpassword);
	
	// set the PDO error mode to exception
	$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
}
catch (PDOException $e) {
	echo "Connection failed: " . $e->getMessage();
}
?>
