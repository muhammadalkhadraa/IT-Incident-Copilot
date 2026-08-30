import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'ar';

export const translations = {
  en: {
    // Navigation & Header
    appTitle: 'IT INCIDENT COPILOT',
    incidentsMaster: 'Incidents Master',
    employeePortal: 'Employee Self-Service',
    telemetry: 'Telemetry & Logs',
    diagnostics: 'Diagnostic Rules',
    aiCopilot: 'AI Copilot Diagnosis',
    analytics: 'Analytics & SLA',
    automations: 'Automations',
    assets: 'CMDB Assets',
    userControl: 'Developer User Control',
    switchAccount: 'Switch Persona',
    logout: 'Log Out',
    login: 'Sign In',
    register: 'Create Account',
    forgotPassword: 'Forgot password?',
    searchPlaceholder: 'Search tickets...',
    approvalsNeeded: 'Approvals Needed',
    developerConsole: 'Developer Console',
    userPortal: 'User Portal',
    developerTools: 'Developer Tools',
    developerAdmin: 'Developer Admin',
    systemSettings: 'System Settings',
    auditLogs: 'Audit Logs',
    similarIncidents: 'Similar Incidents',
    knowledgeBase: 'Knowledge Base',
    assetsDevices: 'Assets / Devices',
    dashboard: 'Dashboard',
    allTickets: 'All Tickets',
    raiseNewTicket: 'Raise New Ticket',

    // Incident List & Tables
    activeIncidents: 'Active IT Incidents & Telemetry',
    ticketNumber: 'Ticket #',
    title: 'Incident Title',
    status: 'Status',
    severity: 'Severity',
    reporter: 'Reporter',
    technician: 'Technician',
    actions: 'Actions',
    viewWorkstation: 'Open Workstation',
    critical: 'Critical',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    newStatus: 'New',
    diagnosingStatus: 'Diagnosing',
    awaitingApprovalStatus: 'Awaiting Approval',
    resolvedStatus: 'Resolved',
    closedStatus: 'Closed',

    // Auth Modal
    authTitleLogin: 'Enterprise Sign In',
    authTitleRegister: 'Create Enterprise Account',
    authTitleForgot: 'Reset Account Password',
    emailLabel: 'Work Email Address',
    passwordLabel: 'Password',
    newPasswordLabel: 'New Password',
    nameLabel: 'Full Name',
    roleLabel: 'Account Role',
    deptLabel: 'Department',
    developerRole: 'Developer / Technician',
    userRole: 'Standard Employee / User',
    submitLogin: 'Sign In to Workstation',
    submitRegister: 'Create Account & Access Portal',
    submitReset: 'Reset Password',
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: 'Already have an account?',
    backToLogin: 'Back to Sign In',

    // Employee Portal
    employeePortalBanner: 'EMPLOYEE SELF-SERVICE IT PORTAL',
    reportNewIssue: 'Report New IT Issue',
    myReportedIncidents: 'My Reported Incidents',
    problemTitle: 'Problem Title',
    category: 'Category',
    description: 'Detailed Description',
    deviceTelemetry: 'Your Device Telemetry',
    sentToDeveloper: 'Sent to Developer',
    hostname: 'Device Hostname',
    ipAddress: 'IP Address',
    macAddress: 'MAC Address',
    submitTicket: 'Submit Ticket',
    cancel: 'Cancel',
    communicationStream: 'COMMUNICATION STREAM WITH IT SERVICE DESK',
    typeMessage: 'Type a message to your assigned IT Technician...',
    send: 'Send',
    noTickets: 'You currently have no open IT tickets.',

    // Diagnostics & AI Copilot
    stage1Grid: 'STAGE 1 EMPIRICAL TECHNICAL TESTS & EVIDENCE GRID',
    decisionTree: 'DETERMINISTIC IF-THEN RULE ENGINE & CONDITION TRACER',
    passedRules: 'PASSED RULES',
    warnings: 'WARNINGS',
    failedRules: 'FAILED RULES',
    aiDiagnosis: 'AI ROOT CAUSE DIAGNOSIS & SYNTHESIS',
    confidence: 'Confidence',
    reasoningChain: 'AI REASONING CHAIN & INFERENCE STEPS',
    evidenceCorrelated: 'EVIDENCE CORRELATED FROM STAGE 1 RULES & TELEMETRY',
    recommendedAction: 'Recommended Action Playbook',
    interactiveCopilot: 'INTERACTIVE COPILOT ASSISTANT',
    askCopilotPlaceholder: 'Ask Copilot e.g., "Why did this happen?", "What is the safest fix?"',
    ask: 'Ask',

    // Language Toggle
    langEn: 'English',
    langAr: 'العربية'
  },
  ar: {
    // Navigation & Header
    appTitle: 'مساعد حوادث تقنية المعلومات',
    incidentsMaster: 'إدارة الحوادث والتذاكر',
    employeePortal: 'بوابة الموظفين الذاتية',
    telemetry: 'القياس والسجلات الفنية',
    diagnostics: 'قواعد التشخيص الخوارزمية',
    aiCopilot: 'تشخيص الذكاء الاصطناعي',
    analytics: 'التحليلات واتفاقية الخدمة',
    automations: 'الأتمتة والتشغيل الآلي',
    assets: 'إدارة الأصول والمعدات',
    userControl: 'إدارة المستخدمين والمطورين',
    switchAccount: 'تبديل الحساب',
    logout: 'تسجيل الخروج',
    login: 'تسجيل الدخول',
    register: 'إنشاء حساب جديد',
    forgotPassword: 'نسيت كلمة المرور؟',
    searchPlaceholder: 'البحث في التذاكر والبلاغات...',
    approvalsNeeded: 'موافقات مطلوبة',
    developerConsole: 'لوحة التحكم الفنية للمطورين',
    userPortal: 'بوابة المستخدم',
    developerTools: 'أدوات المطورين',
    developerAdmin: 'إدارة النظام والمطورين',
    systemSettings: 'إعدادات النظام',
    auditLogs: 'سجلات التدقيق والأمان',
    similarIncidents: 'الحوادث المشابهة',
    knowledgeBase: 'قاعدة المعرفة',
    assetsDevices: 'الأصول والأجهزة',
    dashboard: 'لوحة المؤشرات',
    allTickets: 'جميع التذاكر والبلاغات',
    raiseNewTicket: 'إضافة تذكرة بلاغ جديد',

    // Incident List & Tables
    activeIncidents: 'بلاغات وحوادث تقنية المعلومات النشطة',
    ticketNumber: 'رقم التذكرة',
    title: 'عنوان البلاغ / المشكلة',
    status: 'الحالة الحالية',
    severity: 'درجة الخطورة',
    reporter: 'المُبلّغ',
    technician: 'الفني المختص',
    actions: 'الإجراءات',
    viewWorkstation: 'فتح محطة العمل',
    critical: 'حرج جداً',
    high: 'مرتفع',
    medium: 'متوسط',
    low: 'منخفض',
    newStatus: 'جديد',
    diagnosingStatus: 'جاري التشخيص',
    awaitingApprovalStatus: 'بانتظار الموافقة',
    resolvedStatus: 'تم الحل',
    closedStatus: 'مغلق',

    // Auth Modal
    authTitleLogin: 'تسجيل الدخول للمؤسسة',
    authTitleRegister: 'إنشاء حساب مؤسسي جديد',
    authTitleForgot: 'إعادة ضبط كلمة المرور',
    emailLabel: 'البريد الإلكتروني للعمل',
    passwordLabel: 'كلمة المرور',
    newPasswordLabel: 'كلمة المرور الجديدة',
    nameLabel: 'الاسم الكامل',
    roleLabel: 'نوع الحساب / الصلاحية',
    deptLabel: 'القسم / الإدارة',
    developerRole: 'مطور / فني تقنية المعلومات',
    userRole: 'موظف عادي / مستخدم',
    submitLogin: 'تسجيل الدخول إلى محطة العمل',
    submitRegister: 'إنشاء الحساب ودخول البوابة',
    submitReset: 'تحديث كلمة المرور',
    dontHaveAccount: 'ليس لديك حساب؟',
    alreadyHaveAccount: 'لديك حساب بالفعل؟',
    backToLogin: 'العودة لتسجيل الدخول',

    // Employee Portal
    employeePortalBanner: 'بوابة الخدمة الذاتية للموظفين',
    reportNewIssue: 'إبلاغ عن مشكلة جديدة',
    myReportedIncidents: 'تذاكري وبلاغاتي السابقة',
    problemTitle: 'عنوان المشكلة',
    category: 'التصنيف',
    description: 'الوصف التفصيلي',
    deviceTelemetry: 'بيانات جهازك وشبكتك الحالية',
    sentToDeveloper: 'تُرسل تلقائياً للمطور',
    hostname: 'اسم الجهاز (الكمبيوتر)',
    ipAddress: 'عنوان الـ IP',
    macAddress: 'عنوان الـ MAC',
    submitTicket: 'إرسال التذكرة للمطور',
    cancel: 'إلغاء',
    communicationStream: 'محادثة وتواصل الدعم الفني',
    typeMessage: 'اكتب رسالة للفني المختص...',
    send: 'إرسال',
    noTickets: 'لا توجد لديك تذاكر مفتوحة حالياً.',

    // Diagnostics & AI Copilot
    stage1Grid: 'شبكة الاختبارات الفنية والأدلة التشخيصية - المرحلة 1',
    decisionTree: 'محرك القواعد التشخيصية والشجرة الشرطية',
    passedRules: 'القواعد الناجحة',
    warnings: 'التحذيرات',
    failedRules: 'القواعد الفاشلة',
    aiDiagnosis: 'تشخيص الذكاء الاصطناعي وسبب المشكلة',
    confidence: 'نسبة التأكد',
    reasoningChain: 'خطوات الاستنتاج والتحليل المنطقي',
    evidenceCorrelated: 'الأدلة المترابطة من قواعد التشخيص والقياس',
    recommendedAction: 'الإجراء والدليل الموصى به',
    interactiveCopilot: 'المساعد التفاعلي الذكي (Copilot)',
    askCopilotPlaceholder: 'اسأل المساعد الذكي مثلاً: "ما سبب المشكلة؟" أو "ما هو الحل الآمن؟"',
    ask: 'اسأل',

    // Language Toggle
    langEn: 'English',
    langAr: 'العربية'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: keyof typeof translations['en']) => string;
  isRtl: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (sessionStorage.getItem('copilot_language') as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    sessionStorage.setItem('copilot_language', lang);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: keyof typeof translations['en']): string => {
    return translations[language][key] || translations['en'][key] || key;
  };

  const isRtl = language === 'ar';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t, isRtl }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
