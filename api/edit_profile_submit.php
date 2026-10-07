<?php
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}
require __DIR__ . "/../includes/database_connect.php";

header("Content-Type: application/json");

if (!isset($_SESSION["user_id"])) {
    echo json_encode(array("success" => false, "message" => "Please log in to edit your profile."));
    exit;
}

$user_id = (int)$_SESSION['user_id'];

if (!isset($_POST['full_name']) || !isset($_POST['phone']) || !isset($_POST['email']) || !isset($_POST['college_name']) || !isset($_POST['gender'])) {
    echo json_encode(array("success" => false, "message" => "Please fill in all required fields."));
    exit;
}

$full_name = trim($_POST['full_name']);
$phone = trim($_POST['phone']);
$email = trim($_POST['email']);
$college_name = trim($_POST['college_name']);
$gender = trim($_POST['gender']);
$password = isset($_POST['password']) ? trim($_POST['password']) : '';

if (empty($full_name) || empty($phone) || empty($email) || empty($college_name) || empty($gender)) {
    echo json_encode(array("success" => false, "message" => "Please fill in all required fields."));
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(array("success" => false, "message" => "Please enter a valid email address."));
    exit;
}

if (!preg_match('/^[0-9]{10}$/', $phone)) {
    echo json_encode(array("success" => false, "message" => "Phone number must be exactly 10 digits."));
    exit;
}

if (!in_array($gender, array('male', 'female'))) {
    echo json_encode(array("success" => false, "message" => "Invalid gender selected."));
    exit;
}

// Check if email already belongs to another user
$escaped_email = mysqli_real_escape_string($conn, $email);
$sql_check = "SELECT id FROM users WHERE email = '$escaped_email' AND id != $user_id";
$result_check = mysqli_query($conn, $sql_check);
if (!$result_check) {
    echo json_encode(array("success" => false, "message" => "Database query failed."));
    exit;
}

if (mysqli_num_rows($result_check) > 0) {
    echo json_encode(array("success" => false, "message" => "This email address is already in use by another account."));
    exit;
}

$escaped_name = mysqli_real_escape_string($conn, $full_name);
$escaped_phone = mysqli_real_escape_string($conn, $phone);
$escaped_college = mysqli_real_escape_string($conn, $college_name);
$escaped_gender = mysqli_real_escape_string($conn, $gender);

if (!empty($password)) {
    if (strlen($password) < 6) {
        echo json_encode(array("success" => false, "message" => "Password must be at least 6 characters long."));
        exit;
    }
    $hashed_password = sha1($password);
    $sql_update = "UPDATE users SET full_name = '$escaped_name', phone = '$escaped_phone', email = '$escaped_email', college_name = '$escaped_college', gender = '$escaped_gender', password = '$hashed_password' WHERE id = $user_id";
} else {
    $sql_update = "UPDATE users SET full_name = '$escaped_name', phone = '$escaped_phone', email = '$escaped_email', college_name = '$escaped_college', gender = '$escaped_gender' WHERE id = $user_id";
}

$result_update = mysqli_query($conn, $sql_update);
if (!$result_update) {
    echo json_encode(array("success" => false, "message" => "Something went wrong while updating your profile."));
    exit;
}

// Update session data
$_SESSION['full_name'] = $full_name;
$_SESSION['email'] = $email;

echo json_encode(array(
    "success" => true,
    "message" => "Profile updated successfully!",
    "user" => array(
        "full_name" => $full_name,
        "phone" => $phone,
        "email" => $email,
        "college_name" => $college_name,
        "gender" => $gender
    )
));
mysqli_close($conn);
