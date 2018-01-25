<?php
// start the session
session_start();

// if not logged in, redirect to login page
if (!isset($_SESSION["user_id"]) || !isset($_SESSION["logged_in"])) {
	header("Location: login.php");
	exit;
}
?>
<!doctype html>
<html lang="en">
	<head>
		<title>WebCAD Account</title>
		<!-- Required meta tags -->
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
		
		<!-- Bootstrap CSS -->
		<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta.2/css/bootstrap.min.css" integrity="sha384-PsH8R72JQ3SOdhVi3uxftmaW6Vc51MKb0q5P2rRUpPvrszuE4W1povHYgTpBfshb" crossorigin="anonymous">
	</head>
	<body>
		<?php
		echo file_get_contents("navbar.php");
		?>
		
		<div class="container">
			<div class="row">
				<h1>WebCAD User Account</h1>
			</div>
			<ul class="nav flex-column">
				<li class="nav-item">
					<a class="nav-link" href="logout.php">Log Out</a>
				</li>
				<li class="nav-item">
					<a class="nav-link" href="reset.php">Reset Password</a>
				</li>
			</ul>
			<div class="row">
				<h2>My Designs</h2>
			</div>
		</div>
		
		<!-- Optional JavaScript -->
		<!-- jQuery first, then Popper.js, then Bootstrap JS -->
		<script src="https://code.jquery.com/jquery-3.2.1.min.js" integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN" crossorigin="anonymous"></script>
		<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.3/umd/popper.min.js" integrity="sha384-vFJXuSJphROIrBnz7yo7oB41mKfc8JzQZiCq4NCceLEaO4IHwicKwpJf9c9IpFgh" crossorigin="anonymous"></script>
		<script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta.2/js/bootstrap.min.js" integrity="sha384-alpBpkh1PFOepccYVYDB4do5UnbKysX5WZXm3XxPqe5iKTfUKjNkCk9SaVuEZflJ" crossorigin="anonymous"></script>
	</body>
</html>