<?php
// Configuración básica
$to_email = 'info@raven-net.com.ar';
$from_email = 'no-reply@raven-net.com.ar';

// Configurar headers para respuesta JSON
header('Content-Type: application/json; charset=utf-8');

// Función para enviar respuesta JSON y terminar
function sendJsonResponse($success, $message) {
    echo json_encode([
        'success' => $success,
        'message' => $message
    ]);
    exit;
}

// Verificar que sea POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse(false, 'Método no permitido');
}

// Obtener datos del formulario
$name = isset($_POST['name']) ? trim($_POST['name']) : '';
$email = isset($_POST['email']) ? trim($_POST['email']) : '';
$phone = isset($_POST['phone']) ? trim($_POST['phone']) : '';
$message = isset($_POST['message']) ? trim($_POST['message']) : '';

// Validación mínima
if (empty($name) || empty($email) || empty($phone) || empty($message)) {
    sendJsonResponse(false, 'Todos los campos son obligatorios');
}

// Validación adicional de email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendJsonResponse(false, 'El email ingresado no es válido');
}

// Validación de longitud mínima
if (strlen($name) < 2) {
    sendJsonResponse(false, 'El nombre debe tener al menos 2 caracteres');
}

if (strlen($message) < 10) {
    sendJsonResponse(false, 'El mensaje debe tener al menos 10 caracteres');
}

// Preparar el email
$subject = 'Nuevo mensaje desde Raven-Net.com.ar';
$email_body = "
Nuevo mensaje de contacto:

Nombre: $name
Email: $email
Teléfono: $phone
Fecha: " . date('d/m/Y H:i:s') . "

Mensaje:
$message

---
Este mensaje fue enviado desde el formulario de contacto de raven-net.com.ar
";

$headers = "From: $from_email\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

// Enviar email
if (mail($to_email, $subject, $email_body, $headers)) {
    sendJsonResponse(true, 'Mensaje enviado correctamente. Te contactaremos pronto.');
} else {
    sendJsonResponse(false, 'Error al enviar el mensaje. Por favor, inténtalo de nuevo.');
}
?>

