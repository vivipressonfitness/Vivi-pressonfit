/**
 * Utilidad para traducir y normalizar errores de Supabase Auth a español claro y accionable (F-09).
 * Proporciona mensajes legibles y acciones de recuperación directas (ej: enlace para recuperar contraseña o iniciar sesión).
 */

export interface AuthErrorDetails {
  message: string;
  action?: {
    label: string;
    to: string;
    isExternal?: boolean;
  };
}

export function getAuthErrorDetails(err: unknown): AuthErrorDetails {
  if (!err) {
    return { message: 'Ha ocurrido un error inesperado. Inténtalo de nuevo.' };
  }

  const message = err instanceof Error ? err.message : String(err);
  const lower = message.toLowerCase();

  if (lower.includes('invalid login credentials') || lower.includes('invalid_grant')) {
    return {
      message: 'Correo o contraseña incorrectos. Por favor, verifica tus datos e intenta nuevamente.',
      action: {
        label: '¿Olvidaste tu contraseña? Recupérala aquí',
        to: '/recuperar',
      },
    };
  }

  if (lower.includes('email not confirmed')) {
    return {
      message: 'Tu correo electrónico aún no ha sido confirmado. Revisa tu bandeja de entrada o spam.',
      action: {
        label: 'Contactar a soporte por WhatsApp',
        to: 'https://wa.me/5493415888117?text=Hola%20Vivi,%20tengo%20un%20problema%20con%20la%20confirmación%20de%20mi%20correo',
        isExternal: true,
      },
    };
  }

  if (
    lower.includes('already registered') ||
    lower.includes('user already exists') ||
    lower.includes('identity already exists')
  ) {
    return {
      message: 'Este correo electrónico ya está registrado en el programa.',
      action: {
        label: 'Iniciar sesión con tu cuenta existente →',
        to: '/login',
      },
    };
  }

  if (lower.includes('password should be at least') || lower.includes('weak_password')) {
    return {
      message: 'La contraseña es demasiado corta. Debe tener al menos 6 caracteres.',
    };
  }

  if (lower.includes('rate limit') || lower.includes('over_email_send_rate_limit')) {
    return {
      message: 'Demasiados intentos seguidos. Por favor, espera unos minutos antes de volver a intentar.',
    };
  }

  if (lower.includes('network') || lower.includes('failed to fetch')) {
    return {
      message: 'No se pudo conectar con el servidor. Por favor verifica tu conexión a internet e intenta de nuevo.',
    };
  }

  if (lower.includes('invalid email') || lower.includes('unable to validate email')) {
    return {
      message: 'Por favor ingresa una dirección de correo electrónico válida.',
    };
  }

  return { message };
}

export function formatAuthError(err: unknown): string {
  return getAuthErrorDetails(err).message;
}
