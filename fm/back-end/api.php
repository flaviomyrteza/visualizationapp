<?php
require_once("config.php");

header("Content-Type: application/json");

$method = $_SERVER["REQUEST_METHOD"];

if ($method !== "GET") {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit;
}

$table_name = $_GET['station'];
if (!in_array($table_name, $TABLES_WHITE_LIST)) {
    http_response_code(403);
    echo json_encode(["error" => "Station not existing"]);
    exit;
}

$columns = isset($_GET['column']) ? $_GET['column'] : [];
$esc_cols = [];

foreach ($columns as $col) {
    if (!in_array($col, $COLUMNS_WHITE_LIST)) {
        http_response_code(403);
        echo json_encode(["error" => "Column not existing"]);
        exit;
    }
    $esc_cols[] = "`" . $m_anogia_monthly->real_escape_string($col) . "`";
}

$select_columns = $esc_cols ? "`entry_id`, `Date`, " . implode(", ", $esc_cols) : "*";

$query = "SELECT $select_columns FROM `" . $m_anogia_monthly->real_escape_string($table_name) . "`";
$result = $m_anogia_monthly->query($query);

if (!$result) {
    // Debugging output to understand the issue
    error_log("Query Error: " . $m_anogia_monthly->error);
    error_log("Query: " . $query);
    
    http_response_code(500);
    echo json_encode(["error" => "Failed to execute query"]);
    exit;
}

$rows = $result->fetch_all(MYSQLI_ASSOC);
echo json_encode($rows);
?>
