<?php
// Define the whitelist of allowed table names
$TABLES_WHITE_LIST = ["m_anogia_monthly"]; 

// Define the whitelist of allowed column names
$COLUMNS_WHITE_LIST = [
    "Date",
    "Time",
    "M01WINDSPEED",
    "Pyranometer",
    "Precipitation",
    "DailyETo",
    "RainDuration",
    "BarometricPressure",
    "Temperature",
    "RelativeHumidity",
    "WINDDIRECTION"
];

// Database connection details
$DB_HOST = 'localhost';
$DB_USERNAME = 'root';
$DB_PASSWORD = '';
$DB_NAME = 'm_anogia_monthly';

// Establish a connection to the database
$m_anogia_monthly = new mysqli($DB_HOST, $DB_USERNAME, $DB_PASSWORD, $DB_NAME);

// Check the connection
if ($m_anogia_monthly->connect_error) {
    die("Connection failed: " . $m_anogia_monthly->connect_error);
}
?>
