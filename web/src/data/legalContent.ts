export interface LegalSection {
  id: string;
  title: string;
  shortTitle: string;
  lastUpdated: string;
  content: {
    heading?: string;
    text?: string;
    list?: string[];
  }[];
}

export const LEGAL_SECTIONS: Record<string, LegalSection> = {
  terminos: {
    id: 'terminos',
    title: 'Términos y Condiciones del Servicio',
    shortTitle: 'Condiciones',
    lastUpdated: '13 de octubre de 2026',
    content: [
      {
        heading: '1. Objeto y Aceptación',
        text: 'Bienvenida a VIVIPRESSONFIT. Al registrarte, acceder o suscribirte a nuestra plataforma web y contenidos de entrenamiento, aceptas cumplir de manera íntegra con los presentes Términos y Condiciones. Si no estás de acuerdo con alguna cláusula, te rogamos abstenerte de utilizar el servicio.',
      },
      {
        heading: '2. Descripción del Programa y Membresía',
        text: 'VIVIPRESSONFIT es una plataforma digital de acondicionamiento físico, entrenamiento y estilo de vida saludable que ofrece acceso a clases grabadas bajo demanda (Full Body, GAP, Cardio HIIT, Fuerza), programas de fuerza estructurados para casa o gimnasio, guías de educación alimentaria y soporte comunitario por canales oficiales.',
      },
      {
        heading: '3. Precio, Período de Prueba (Trial) y Facturación Recurrente',
        text: 'La suscripción al programa tiene un costo mensual establecido de USD 40 / mes (cuarenta dólares estadounidenses). Las condiciones de acceso y cobro se rigen por las siguientes cláusulas:',
        list: [
          'Período de prueba de 7 días: Las nuevas alumnas pueden acceder a un período de prueba gratuito de 7 días naturales ($0.00 hoy) para evaluar el método y los contenidos sin coste.',
          'Validación de método de pago: Durante el registro del trial, la pasarela de pagos Stripe solicita y valida un método de pago activo, sin realizar ningún cargo durante los primeros 7 días.',
          'Renovación automática: Si la usuaria no cancela la suscripción antes de cumplirse los 7 días de prueba, el sistema renovará automáticamente el plan a la tarifa regular de USD 40 / mes al inicio del día 8.',
          'Cobro recurrente mensual: La membresía se renueva cada 30 días naturales cargándose al método de pago registrado en Stripe.',
          'Pasarela segura y cifrada: Todos los cobros son procesados a través de Stripe Payments (PCI-DSS Nivel 1). VIVIPRESSONFIT no almacena ni tiene acceso a los datos de tu tarjeta bancaria.',
          'Modificación de precios: Cualquier actualización tarifaria será notificada con al menos 15 días de anticipación por correo electrónico o anuncio en la plataforma.',
        ],
      },
      {
        heading: '4. Política de Cancelación',
        text: 'Puedes cancelar la renovación automática de tu suscripción en cualquier momento y sin penalizaciones desde tu perfil en la sección "Membresía" o contactando a nuestro soporte oficial. Tras la cancelación, mantendrás acceso completo a todos los videos y materiales hasta que finalice el período mensual ya abonado. A partir de esa fecha, el acceso al área privada quedará suspendido y no se realizarán nuevos cargos.',
      },
      {
        heading: '5. Política de Reembolsos',
        text: 'Debido a la naturaleza de entrega inmediata del contenido digital audiovisual y recursos descargables:',
        list: [
          'No se emiten reembolsos parciales ni totales correspondientes al ciclo mensual ya iniciado una vez que el usuario ha tenido acceso a la plataforma.',
          'En caso de cobros duplicados por incidencia técnica comprobable, se procederá al reintegro inmediato del cargo duplicado previa verificación con la pasarela de pagos.',
        ],
      },
      {
        heading: '6. Descargo de Responsabilidad Médica y de Salud (Disclaimer)',
        text: 'ADVERTENCIA IMPORTANTE DE SALUD:',
        list: [
          'VIVIPRESSONFIT no es un centro de salud ni ofrece diagnóstico, prescripción médica o tratamiento clínico.',
          'La práctica de actividad física y ejercicios de fuerza conlleva riesgos inherentes de sobreesfuerzo, fatiga o lesión. Antes de comenzar el programa, es tu responsabilidad consultar con un profesional médico certificado para evaluar tu aptitud física.',
          'Al participar en las clases y ejecutar las rutinas, asumes voluntariamente la totalidad del riesgo y eximes a VIVIPRESSONFIT, su entrenadora y colaboradores de cualquier reclamo por lesiones, molestias o accidentes derivados de la ejecución de los ejercicios en tu domicilio o gimnasio.',
        ],
      },
      {
        heading: '7. Propiedad Intelectual y Uso de Cuenta',
        text: 'Todos los videos, audios, guías PDF, textos, marcas, logotipos y diseños son propiedad exclusiva de VIVIPRESSONFIT y están protegidos por las leyes internacionales de derechos de autor.',
        list: [
          'Uso personal e intransferible: El acceso a tu cuenta es exclusivamente personal. Queda estrictamente prohibido compartir tus credenciales de inicio de sesión con terceros.',
          'Prohibición de copia o redistribución: Queda prohibida la grabación de pantalla, descarga no autorizada, retransmisión pública, reventa o distribución de cualquier contenido de la plataforma.',
          'Cualquier uso indebido facultará a VIVIPRESSONFIT para rescindir la cuenta de forma inmediata sin derecho a reembolso.',
        ],
      },
    ],
  },
  privacidad: {
    id: 'privacidad',
    title: 'Política de Privacidad y Protección de Datos',
    shortTitle: 'Privacidad',
    lastUpdated: '13 de octubre de 2026',
    content: [
      {
        heading: '1. Compromiso de Confidencialidad',
        text: 'En VIVIPRESSONFIT respetamos profundamente tu privacidad y nos comprometemos a resguardar la seguridad de tus datos personales conforme a los estándares de protección de la información.',
      },
      {
        heading: '2. Información que Recopilamos',
        text: 'Para el funcionamiento de la plataforma y la prestación del servicio recopilamos únicamente los datos necesarios:',
        list: [
          'Datos de registro y perfil: Nombre completo, dirección de correo electrónico y contraseña (almacenada de forma irreversible mediante cifrado criptográfico seguro en Supabase).',
          'Datos de facturación: Historial de transacciones, identificador de cliente en Stripe y estado de suscripción. NO almacenamos números de tarjetas de crédito/débito ni códigos de seguridad CVV.',
          'Registros de actividad técnica: Información de inicio de sesión, fecha de acceso y progreso de visualización para garantizar la seguridad de la cuenta.',
        ],
      },
      {
        heading: '3. Finalidad del Tratamiento',
        text: 'Utilizamos tus datos exclusivamente para:',
        list: [
          'Gestionar tu alta, autenticación y sesión activa en la plataforma de alumnas.',
          'Habilitar el acceso a los videos de clases, planes mensuales y materiales exclusivos según tu estado de suscripción.',
          'Procesar los cobros mensuales a través de la pasarela Stripe.',
          'Brindarte soporte técnico y atención personalizada a través de WhatsApp o correo electrónico.',
          'Prevenir fraudes, accesos no autorizados y abusos en el sistema.',
        ],
      },
      {
        heading: '4. Pasarelas de Pago y Proveedores Externos',
        text: 'Tus datos se gestionan mediante proveedores de infraestructura de clase mundial bajo estrictos protocolos de seguridad:',
        list: [
          'Stripe: Pasarela de pagos con certificación PCI-DSS Nivel 1. Procesa de manera segura y confidencial tus transacciones bancarias.',
          'Supabase: Proveedor de base de datos en la nube con cifrado en reposo y en tránsito (TLS/SSL) y políticas de aislamiento a nivel de fila (Row Level Security - RLS).',
          'Vercel: Infraestructura de entrega global de la aplicación web con certificado de seguridad SSL/HTTPS.',
        ],
      },
      {
        heading: '5. Derechos del Usuario',
        text: 'Tienes derecho en todo momento a acceder, rectificar o solicitar la eliminación definitiva de tu cuenta y datos personales. Para ejercer estos derechos, puedes escribir a nuestro canal oficial de soporte.',
      },
    ],
  },
  cookies: {
    id: 'cookies',
    title: 'Política de Cookies',
    shortTitle: 'Cookies',
    lastUpdated: '13 de octubre de 2026',
    content: [
      {
        heading: '1. ¿Qué son las Cookies?',
        text: 'Una cookie es un pequeño archivo de texto que un sitio web almacena en tu dispositivo (ordenador, tablet o teléfono móvil) para recordar información sobre tu visita, facilitar tu navegación y garantizar el correcto funcionamiento de las funciones interactivas.',
      },
      {
        heading: '2. ¿Qué tipos de Cookies utilizamos?',
        text: 'En VIVIPRESSONFIT utilizamos un esquema estricto y minimalista orientado a la seguridad funcional:',
        list: [
          'Cookies Técnicas y de Autenticación (Estrictamente Necesarias): Mantienen tu sesión iniciada de manera segura en Supabase (token de sesión cifrado) para que no tengas que escribir tu contraseña en cada página interna.',
          'Cookies de Seguridad y Prevención de Fraude (Stripe): Utilizadas por los componentes de pago de Stripe para detectar navegación sospechosa y proteger tus compras contra clonaciones o fraudes bancarios.',
          'Almacenamiento Local (Local Storage): Guarda tus preferencias básicas, como el aviso de cookies aceptado o el volumen del reproductor de video.',
        ],
      },
      {
        heading: '3. Lo que NO hacemos',
        text: 'VIVIPRESSONFIT NO comercializa tus datos, NO instala cookies de rastreo publicitario intrusivo ni comparte tu historial de navegación con intermediarios o corredores de datos.',
      },
      {
        heading: '4. Cómo gestionar o desactivar las Cookies',
        text: 'Puedes permitir, bloquear o eliminar las cookies instaladas en tu dispositivo mediante la configuración de las opciones de tu navegador web (Google Chrome, Mozilla Firefox, Apple Safari, Microsoft Edge). Ten en cuenta que si bloqueas las cookies técnicas necesarias, la funcionalidad de inicio de sesión y acceso a clases podría no operar adecuadamente.',
      },
    ],
  },
  'aviso-legal': {
    id: 'aviso-legal',
    title: 'Aviso Legal e Información General',
    shortTitle: 'Aviso Legal',
    lastUpdated: '13 de octubre de 2026',
    content: [
      {
        heading: '1. Datos Identificativos',
        text: 'En cumplimiento del deber de información y transparencia para servicios de la sociedad de la información y comercio electrónico, se hace constar que:',
        list: [
          'Denominación del proyecto: VIVIPRESSONFIT — Programa de Entrenamiento y Estilo de Vida Saludable.',
          'Actividad: Plataforma de entrenamiento físico digital bajo demanda, planes de fuerza y bienestar.',
          'Canal oficial de atención al cliente y soporte: WhatsApp Soporte Oficial (+54 9 341 588-8117 o enlace directo habilitado en la web).',
          'Correo electrónico de soporte y privacidad: soporte@vivipressonfit.com',
          'Alojamiento web: Vercel Inc. (San Francisco, CA, USA).',
          'Procesamiento de pagos: Stripe Inc. / Stripe Payments Europe, Ltd.',
        ],
      },
      {
        heading: '2. Condiciones de Acceso y Uso',
        text: 'El acceso al portal público es libre y gratuito. El acceso a los videos de clases completas, rutinas estructuradas y áreas privadas está reservado en exclusiva para usuarios debidamente registrados con una suscripción activa o período de prueba válido.',
      },
      {
        heading: '3. Enlaces a Terceros',
        text: 'El sitio web puede contener enlaces a plataformas externas (como WhatsApp, Instagram o YouTube). VIVIPRESSONFIT no ejerce control sobre dichos sitios externos ni asume responsabilidad alguna por sus políticas de privacidad o contenidos.',
      },
      {
        heading: '4. Ley Aplicable y Resolución de Controversias',
        text: 'Las relaciones entre VIVIPRESSONFIT y los usuarios se regirán por el principio de buena fe y las normativas aplicables al comercio electrónico de bienes y servicios digitales. Para cualquier duda, aclaración o reclamación, las partes procurarán siempre una solución amistosa a través de nuestro canal de soporte directo.',
      },
    ],
  },
};

