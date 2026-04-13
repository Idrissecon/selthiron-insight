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

      // ProblemSection
      problem1Title: 'Manual reconciliation is slow',
      problem1Desc: 'Hours spent cross-referencing bank statements with payment provider exports, line by line.',
      problem2Title: 'Spreadsheets cause errors',
      problem2Desc: 'Copy-paste mistakes, wrong formulas, and missed transactions lead to costly discrepancies.',
      problem3Title: 'Hard to track mismatches',
      problem3Desc: 'Finding which transactions don\'t match across systems is like searching for a needle in a haystack.',

      // BenefitsSection
      benefit1Title: 'Save hours',
      benefit1Desc: 'What used to take half a day now takes minutes.',
      benefit2Title: 'Reduce errors',
      benefit2Desc: 'Automated matching eliminates human mistakes.',
      benefit3Title: 'Instant clarity',
      benefit3Desc: 'See exactly which transactions match and which don\'t.',
      benefit4Title: 'No setup',
      benefit4Desc: 'No integrations, no onboarding. Just upload and go.',

      // SolutionSection
      solution1Title: 'Upload',
      solution1Desc: 'Drop your bank CSV and payment provider CSV into Selthiron.',
      solution2Title: 'Match',
      solution2Desc: 'Our engine normalizes and cross-references every transaction automatically.',
      solution3Title: 'Review',
      solution3Desc: 'See matched, unmatched, and flagged transactions in a clear report.',

      // Table headers
      date: 'Date',
      description: 'Description',
      amount: 'Amount',
      provider: 'Provider',
      status: 'Status',
      matchedLabel: 'Matched',
      unmatchedLabel: 'Unmatched',
      discrepancyLabel: 'Discrepancy',
      
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
      heroTitle: 'Cuadra tus datos bancarios y de pagos en minutos',
      heroSubtitle: 'Sube tus archivos y obtén un informe limpio y conciliado al instante.',
      heroCTA: 'Obtén un cuadre gratuito',
      heroPrivacy: 'No almacenamos tus datos. Nunca.',

      // ProblemSection
      problem1Title: 'El cuadre manual es lento',
      problem1Desc: 'Horas gastadas cruzando estados bancarios con exportaciones de proveedores de pagos, línea por línea.',
      problem2Title: 'Las hojas de cálculo causan errores',
      problem2Desc: 'Errores de copiar y pegar, fórmulas incorrectas y transacciones perdidas llevan a discrepancias costosas.',
      problem3Title: 'Difícil rastrear incoherencias',
      problem3Desc: 'Encontrar qué transacciones no coinciden entre sistemas es como buscar una aguja en un pajar.',

      // BenefitsSection
      benefit1Title: 'Ahorra horas',
      benefit1Desc: 'Lo que solía tomar medio día ahora toma minutos.',
      benefit2Title: 'Reduce errores',
      benefit2Desc: 'La conciliación automática elimina errores humanos.',
      benefit3Title: 'Claridad instantánea',
      benefit3Desc: 'Ve exactamente qué transacciones coinciden y cuáles no.',
      benefit4Title: 'Sin configuración',
      benefit4Desc: 'Sin integraciones, sin onboarding. Solo sube y listo.',

      // SolutionSection
      solution1Title: 'Subir',
      solution1Desc: 'Arrastra tu CSV bancario y el CSV del proveedor de pagos a Selthiron.',
      solution2Title: 'Cuadrar',
      solution2Desc: 'Nuestro motor normaliza y cruza cada transacción automáticamente.',
      solution3Title: 'Revisar',
      solution3Desc: 'Ve transacciones cuadradas, no cuadradas y marcadas en un informe claro.',

      // Table headers
      date: 'Fecha',
      description: 'Descripción',
      amount: 'Monto',
      provider: 'Proveedor',
      status: 'Estado',
      matchedLabel: 'Coincidente',
      unmatchedLabel: 'No coincidente',
      discrepancyLabel: 'Discrepancia',
      
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
      reconcile: 'Cuadrar pagos',
      noFileSelected: 'Ningún archivo seleccionado',
      uploadFile: 'Subir archivo',
      processingFiles: 'Procesando archivos...',
      privacyNotice: 'Privacidad',
      privacyNoticeDescription: 'Tus archivos se procesan localmente. Solo se guardan los resultados.',
      bankPaymentReconciliation: 'Cuadrar Pagos Bancarios y de Proveedores',
      
      // Results
      reconciliationResults: 'Resultados del Cuadre',
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
      newReconciliation: 'Nuevo cuadre',
      signInToSave: 'Inicia sesión para guardar',
      signInToSaveDesc: 'Inicia sesión para guardar este cuadre en tu historial.',
      close: 'Cerrar',
      
      // History
      reconciliationHistory: 'Historial de Cuadres',
      historyDesc: 'Visualiza tus cuadres pasados y descarga informes.',
      noHistory: 'Aún no hay historial de cuadres.',
      startFirst: 'Inicia tu primer cuadre para verlo aquí.',
      loadingHistory: 'Cargando historial...',
      reconciliationSaved: 'Cuadre guardado en tu historial.',
      
      // Footer
      copyright: 'Cuadre financiero con privacidad primero.',
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
