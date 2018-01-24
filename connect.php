<?php
$dbserver = "localhost";
$dbusername = "id4198359_elan";
$dbpassword = "fjd7DF#Hfd9j";

try {
	$pdo = new PDO("mysql:host=$dbserver;dbname=id4198359_users", $dbusername, $dbpassword);
	
	// set the PDO error mode to exception
	$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
}
catch (PDOException $e) {
	echo "Connection failed: " . $e->getMessage();
}
?>