<?php
/**
 * SOS Direct – contact.php
 * Traitement des formulaires de contact
 * Compatible hébergeur One.com (mail() natif PHP)
 */

header('Content-Type: application/json; charset=UTF-8');

// === CONFIGURATION ===
define('RECIPIENT_EMAIL', 'info@sosdirect.be');
define('SITE_NAME',       'SOS Direct');
define('SITE_URL',        'https://sosdirect.be');

// === SECURITY: Only accept POST ===
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

// === HONEYPOT ANTI-SPAM ===
if (!empty($_POST['website'])) {
    // Bot detected – silent success
    echo json_encode(['success' => true]);
    exit;
}

// === SANITIZE INPUTS ===
function sanitize(string $val): string {
    return htmlspecialchars(strip_tags(trim($val)), ENT_QUOTES, 'UTF-8');
}

$nom         = sanitize($_POST['nom']        ?? '');
$email       = sanitize($_POST['email']      ?? '');
$telephone   = sanitize($_POST['telephone']  ?? '');
$message     = sanitize($_POST['message']    ?? '');
$service     = sanitize($_POST['service']    ?? '');
$code_postal = sanitize($_POST['code_postal'] ?? '');
$origin      = sanitize($_POST['form_origin'] ?? 'contact');

// === VALIDATE REQUIRED ===
$errors = [];
if (empty($nom))     $errors[] = 'Nom manquant.';
if (empty($email))   $errors[] = 'Email manquant.';
if (empty($message)) $errors[] = 'Message manquant.';

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Email invalide.';
}

if (!empty($errors)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'errors' => $errors]);
    exit;
}

// === BUILD EMAIL ===
$subject = $origin === 'hero'
    ? '[SOS Direct] Demande de devis – ' . ($service ?: 'Non précisé')
    : '[SOS Direct] Nouveau message de contact';

$body  = "=== NOUVEAU MESSAGE VIA " . SITE_URL . " ===\n\n";
$body .= "Nom         : {$nom}\n";
$body .= "Email       : {$email}\n";
if ($telephone)   $body .= "Téléphone   : {$telephone}\n";
if ($code_postal) $body .= "Code postal : {$code_postal}\n";
if ($service)     $body .= "Service     : {$service}\n";
$body .= "\nMessage :\n---------\n{$message}\n\n";
$body .= "=== FIN DU MESSAGE ===\n";
$body .= "Formulaire  : {$origin}\n";
$body .= "Heure       : " . date('d/m/Y H:i:s') . "\n";

// === HEADERS ===
$boundary = md5(time());
$headers  = "From: " . SITE_NAME . " <noreply@sosdirect.be>\r\n";
$headers .= "Reply-To: {$email}\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";

// === SEND ===
$sent = mail(RECIPIENT_EMAIL, $subject, $body, $headers);

if ($sent) {
    echo json_encode(['success' => true]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Échec envoi email. Contactez-nous par téléphone.']);
}
exit;
