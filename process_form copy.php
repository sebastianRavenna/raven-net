<?php
// Configuración básica
$to_email = 'info@raven-net.com.ar';
$from_email = 'no-reply@raven-net.com.ar';

// Verificar que sea POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    die('Método no permitido');
}

// Obtener datos del formulario
$name = isset($_POST['name']) ? trim($_POST['name']) : '';
$email = isset($_POST['email']) ? trim($_POST['email']) : '';
$phone = isset($_POST['phone']) ? trim($_POST['phone']) : '';
$message = isset($_POST['message']) ? trim($_POST['message']) : '';

// Validación mínima
if (empty($name) || empty($email) || empty($phone) || empty($message)) {
    die('Todos los campos son obligatorios');
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
";

$headers = "From: $from_email\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

// Enviar email
if (mail($to_email, $subject, $email_body, $headers)) {
    echo '<script>alert("Mensaje enviado correctamente"); window.location.href="index.html";</script>';
} else {
    echo '<script>alert("Error al enviar mensaje"); window.history.back();</script>';
}
?>