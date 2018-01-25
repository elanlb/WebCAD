<?php
// start the session
session_start();

// connect to the DB
require_once "connect.php";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
	// get the values from the form
	$email = trim($_POST["email"]);
	$username = trim($_POST["username"]);
	$password = trim($_POST["password"]);
	
	$sql = "SELECT userid FROM accounts WHERE email=:email";
	$statement = $pdo->prepare($sql);
	
	$statement->bindValue(":email", $email);
	
	$statement->execute();
	
	$row = $statement->fetch(PDO::FETCH_ASSOC);
	
	// check if account with email exists
	if ($row != null) {
		die("Account with that email already exists. Reset password?");
	}
	
	// this is how the password will be stored
	$passwordHash = password_hash($password, PASSWORD_DEFAULT);
	
	// prepare insert statement
	$sql = "INSERT INTO accounts (username, password, email) VALUES (:username, :password, :email)";
	$statement = $pdo->prepare($sql);
	
	$statement->bindValue(":username", $username);
	$statement->bindValue(":password", $passwordHash);
	$statement->bindValue(":email", $email);
	
	$result = $statement->execute();
	
	header("Location: login.php");
}
?>
<!doctype html>
<html lang="en">
	<head>
		<title>WebCAD Register</title>
		<!-- Required meta tags -->
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
		
		<!-- Bootstrap CSS -->
		<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta.2/css/bootstrap.min.css" integrity="sha384-PsH8R72JQ3SOdhVi3uxftmaW6Vc51MKb0q5P2rRUpPvrszuE4W1povHYgTpBfshb" crossorigin="anonymous">
	</head>
	<body>
		<div class="container">
			<div class="row">
				<h1>Register Account</h1>
			</div>
			<div class="row">
				<form action="register.php" method="post">
					<div class="form-group">
						<label for="email">Email</label>
						<input class="form-control" type="text" id="email" name="email" placeholder="elan@example.com" required>
					</div>
					<div class="form-group">
						<label for="username">Username</label>
						<input class="form-control" type="text" id="username" name="username" placeholder="elan" required>
					</div>
					<div class="form-group">
						<label for="password">Password</label>
						<input class="form-control" type="password" id="password" name="password" placeholder="password" required>
					</div>
					<button class="btn btn-primary" type="submit">Submit</button>
				</form>
			</div>
		</div>	
	</body>
</html>