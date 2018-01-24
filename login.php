<?php
// start the session
session_start();

// include config file to connect to DB
require_once "connect.php";

// define variables and initialize empty
$username = "";
$password = "";
$username_err = "";
$password_err = "";

// process data when form is submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
	$username = trim($_POST["username"]);
	$password = trim($_POST["password"]);
	
	// validate credentials
	if (empty($username_err) && empty($password_err)) {
		// prepare the query
		$sql = "SELECT userid, username, password FROM accounts WHERE username = :username";
		$statement = $pdo->prepare($sql);
		
		// attach the username to the statement
		$statement->bindValue(":username", $username);
		
		$statement->execute();
		
		// fetch row
		$user = $statement->fetch(PDO::FETCH_ASSOC);
		
		if ($user === false) {
			// could not find the user
			die("Couldn't find username in database.");
		}
		else {
			// user found, check if password matches hash
			$validPassword = password_verify($password, $user["password"]);
			
			if ($validPassword) {
				// password is correct, login
				$_SESSION["user_id"] = $user["username"];
				$_SESSION["logged_in"] = time();
				
				// redirect to profile page
				header("Location: account.php");
				exit;
			}
			else {
				// validPassword was false, passwords do not match
				die("Incorrect password for that username.");
			}
		}
	}
}
?>
<!doctype html>
<html lang="en">
	<head>
		<title>WebCAD Login</title>
		<!-- Required meta tags -->
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
		
		<!-- Bootstrap CSS -->
		<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta.2/css/bootstrap.min.css" integrity="sha384-PsH8R72JQ3SOdhVi3uxftmaW6Vc51MKb0q5P2rRUpPvrszuE4W1povHYgTpBfshb" crossorigin="anonymous">
	</head>
	<body>
		<div class="container">
			<div class="row">
				<h1>User Login</h1>
			</div>
			<div class="row">
				<form action="login.php" method="post">
					<div class="form-group">
						<label for="username">Username</label>
						<input class="form-control" type="text" id="username" name="username" placeholder="elan" required>
					</div>
					<div class="form-group">
						<label for="password">Password</label>
						<input class="form-control" type="password" id="password" name="password" placeholder="password" required>
					</div>
					<div class="form-group">
						<a class="form-text" href="reset.php">Reset Password</a>
					</div>
					<div class="form-group">
						<a class="form-text" href="register.php">Create Account</a>
					</div>
					<button class="btn btn-primary" type="submit">Submit</button>
				</form>
			</div>
		</div>
	</body>
</html>