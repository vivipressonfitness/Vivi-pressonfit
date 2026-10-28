/**
 * Utilidad para traducir y normalizar errores de Supabase Auth a español claro y accionable.
 */
export function formatAuthError(err: unknown): string {
  if (!err) return 'Ha ocurrido un error inesperado. Inténtalo de nuevo.';
  const message = err instanceof Error ? err.message : String(err);
  const lower = message.toLowerCase();

  if (lower.includes('invalid login credentials') || lower.includes('invalid_grant')) {
    return 'Correo o contraseña incorrectos. Por favor, verifica tus datos e intenta nuevamente.';
  }
  if (lower.includes('email not confirmed')) {
    return 'Tu correo electrónico aún no ha sido confirmado. Revisa tu bandeja de entrada o spam.';
  }
  if (lower.includes('already registered') || lower.includes('user already exists') || lower.includes('identity already exists')) {
    return 'Este correo electrónico ya está registrado en el programa. Inicia sesión con tu contraseña para continuar.';
  }
  if (lower.includes('password should be at least') || lower.includes('weak_password')) {
    return 'La contraseña es demasiado débil. Debe tener al menos 6 caracteres.';
  }
  if (lower.includes('rate limit') || lower.includes('over_email_send_rate_limit')) {
    return 'Demasiados intentos seguidos. Por favor, espera unos minutos antes de volver a intentar.';
  }
  if (lower.includes('network') || lower.includes('failed to fetch')) {
    return 'No se pudo conectar con el servidor. Por favor verifica tu conexión a internet.';
  }
  if (lower.includes('invalid email') || lower.includes('unable to validate email')) {
    return 'Por favor ingresa una dirección de correo electrónico válida.';
  }

  return message;
}
