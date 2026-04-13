import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Detect language based on region
const detectLanguage = (): string => {
  const userLang = navigator.language || navigator.languages?.[0] || 'en';
  
  // Spanish-speaking regions
  const spanishRegions = ['es-ES', 'es-AR', 'es-BO', 'es-CL', 'es-CO', 'es-CR', 'es-CU', 
                          'es-DO', 'es-EC', 'es-GT', 'es-HN', 'es-MX', 'es-NI', 'es-PA', 
                          'es-PE', 'es-PR', 'es-PY', 'es-SV', 'es-UY', 'es-VE'];
  
  // Check if user is from Spanish-speaking region
  if (spanishRegions.includes(userLang) || userLang.startsWith('es')) {
    return 'es';
  }
  
  // Default to English for other regions
  return 'en';
};

const resources = {
  en: {
    translation: {
      // Common
      getStarted: 'Get started →',
      signIn: 'Sign in',
      signUp: 'Sign up',
      signOut: 'Sign out',
      
      // Navbar
      getStartedButton: 'Get started →',
      
      // Hero
      heroTitle: 'Reconcile your bank and payment data in minutes',
      heroSubtitle: 'Upload your files and get a clean, matched report instantly.',
      heroCTA: 'Get a free reconciliation',
      heroPrivacy: "We don't store your data. Ever.",
      
      // Access
      welcomeBack: 'Welcome back',
      createAccount: 'Create account',
      signInToAccess: 'Sign in to access your reconciliation tool.',
      signUpToStart: 'Sign up to get started with Selthiron.',
      name: 'Name',
      yourName: 'Your name',
      email: 'Email',
      emailPlaceholder: 'you@company.com',
      password: 'Password',
      passwordPlaceholder: '••••••••',
      processing: 'Processing...',
      dontHaveAccount: "Don't have an account? Sign up",
      alreadyHaveAccount: 'Already have an account? Sign in',
      yourDataSecure: 'Your data is secure and stored encrypted.',
      
      // Tool
      uploadBank: 'Upload bank file',
      uploadProvider: 'Upload payment provider file',
      bankFileLabel: 'Bank transactions (CSV/Excel)',
      providerFileLabel: 'Payment provider transactions (CSV/Excel)',
      reconcile: 'Reconcile',
      noFileSelected: 'No file selected',
      uploadFile: 'Upload file',
      processingFiles: 'Processing files...',
      privacyNotice: 'Privacy',
      privacyNoticeDescription: 'Your files are processed locally. Only reconciliation results are saved.',
      bankPaymentReconciliation: 'Bank & Payment Reconciliation',
      
      // Results
      reconciliationResults: 'Reconciliation Results',
      summary: 'Summary',
      totalBank: 'Total Bank Transactions',
      totalProvider: 'Total Provider Transactions',
      matched: 'Matched',
      unmatched: 'Unmatched',
      discrepancies: 'Discrepancies',
      matchRate: 'Match Rate',
      reconcilableBank: 'Reconcilable Bank',
      reconcilableProvider: 'Reconcilable Provider',
      downloadCSV: 'Download CSV',
      newReconciliation: 'New reconciliation',
      signInToSave: 'Sign in to save',
      signInToSaveDesc: 'Sign in to save this reconciliation to your history.',
      close: 'Close',
      
      // History
      reconciliationHistory: 'Reconciliation History',
      historyDesc: 'View your past reconciliations and download reports.',
      noHistory: 'No reconciliation history yet.',
      startFirst: 'Start your first reconciliation to see it here.',
      loadingHistory: 'Loading history...',
      reconciliationSaved: 'Reconciliation saved to your history.',
      
      // Footer
      copyright: 'Privacy-first financial reconciliation.',
    }
  },
  es: {
    translation: {
      // Common
      getStarted: 'Comenzar →',
      signIn: 'Iniciar sesión',
      signUp: 'Registrarse',
      signOut: 'Cerrar sesión',
      
      // Navbar
      getStartedButton: 'Comenzar →',
      
      // Hero
      heroTitle: 'Reconcilia tus datos bancarios y de pagos en minutos',
      heroSubtitle: 'Sube tus archivos y obtén un informe limpio y conciliado al instante.',
      heroCTA: 'Obtén una reconciliación gratuita',
      heroPrivacy: 'No almacenamos tus datos. Nunca.',
      
      // Access
      welcomeBack: 'Bienvenido de nuevo',
      createAccount: 'Crear cuenta',
      signInToAccess: 'Inicia sesión para acceder a tu herramienta de reconciliación.',
      signUpToStart: 'Regístrate para comenzar con Selthiron.',
      name: 'Nombre',
      yourName: 'Tu nombre',
      email: 'Correo electrónico',
      emailPlaceholder: 'tu@empresa.com',
      password: 'Contraseña',
      passwordPlaceholder: '••••••••',
      processing: 'Procesando...',
      dontHaveAccount: '¿No tienes cuenta? Regístrate',
      alreadyHaveAccount: '¿Ya tienes cuenta? Inicia sesión',
      yourDataSecure: 'Tus datos están seguros y almacenados encriptados.',
      
      // Tool
      uploadBank: 'Subir archivo bancario',
      uploadProvider: 'Subir archivo de proveedor de pagos',
      bankFileLabel: 'Transacciones bancarias (CSV/Excel)',
      providerFileLabel: 'Transacciones de proveedor de pagos (CSV/Excel)',
      reconcile: 'Reconciliar',
      noFileSelected: 'Ningún archivo seleccionado',
      uploadFile: 'Subir archivo',
      processingFiles: 'Procesando archivos...',
      privacyNotice: 'Privacidad',
      privacyNoticeDescription: 'Tus archivos se procesan localmente. Solo se guardan los resultados de la reconciliación.',
      bankPaymentReconciliation: 'Reconciliación Bancaria y de Pagos',
      
      // Results
      reconciliationResults: 'Resultados de Reconciliación',
      summary: 'Resumen',
      totalBank: 'Total Transacciones Bancarias',
      totalProvider: 'Total Transacciones del Proveedor',
      matched: 'Coincidentes',
      unmatched: 'No coincidentes',
      discrepancies: 'Discrepancias',
      matchRate: 'Tasa de Coincidencia',
      reconcilableBank: 'Bancarios Conciliables',
      reconcilableProvider: 'Proveedores Conciliables',
      downloadCSV: 'Descargar CSV',
      newReconciliation: 'Nueva reconciliación',
      signInToSave: 'Inicia sesión para guardar',
      signInToSaveDesc: 'Inicia sesión para guardar esta reconciliación en tu historial.',
      close: 'Cerrar',
      
      // History
      reconciliationHistory: 'Historial de Reconciliaciones',
      historyDesc: 'Visualiza tus reconciliaciones pasadas y descarga informes.',
      noHistory: 'Aún no hay historial de reconciliaciones.',
      startFirst: 'Inicia tu primera reconciliación para verla aquí.',
      loadingHistory: 'Cargando historial...',
      reconciliationSaved: 'Reconciliación guardada en tu historial.',
      
      // Footer
      copyright: 'Reconciliación financiera con privacidad primero.',
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: detectLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
