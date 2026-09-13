import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'ar';

export const translations = {
  en: {
    // Navigation & Header
    appTitle: 'Simple Support Desk',
    incidentsMaster: 'All Tickets',
    employeePortal: 'Create Ticket',
    telemetry: 'Details',
    diagnostics: 'Updates',
    aiCopilot: 'AI Helper',
    analytics: 'Dashboard',
    automations: 'Automations',
    assets: 'Assets',
    userControl: 'Users & Roles',
    switchAccount: 'Switch User',
    logout: 'Log Out',
    login: 'Sign In',
    register: 'Create Account',
    forgotPassword: 'Forgot password?',
    searchPlaceholder: 'Search tickets...',
    approvalsNeeded: 'Approvals Needed',
    developerConsole: 'Support Portal',
    userPortal: 'Help Desk',
    developerTools: 'Menu',
    developerAdmin: 'Settings',
    systemSettings: 'System Settings',
    auditLogs: 'Audit Logs',
    similarIncidents: 'Similar Tickets',
    knowledgeBase: 'Help Articles',
    assetsDevices: 'Devices',
    dashboard: 'Dashboard',
    allTickets: 'All Tickets',
    raiseNewTicket: '+ Create New Ticket',

    // Ticket List & Tables
    activeIncidents: 'Support Tickets List',
    ticketNumber: 'Ticket #',
    title: 'Title / Issue',
    status: 'Status',
    severity: 'Priority',
    reporter: 'Created By',
    technician: 'Assigned To',
    actions: 'Actions',
    viewWorkstation: 'View Details',
    critical: 'Urgent',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    newStatus: 'Open',
    diagnosingStatus: 'In Progress',
    awaitingApprovalStatus: 'In Progress',
    resolvedStatus: 'Resolved',
    closedStatus: 'Closed',

    // Auth Modal
    authTitleLogin: 'Welcome to Support Desk',
    authTitleRegister: 'Create New Account',
    authTitleForgot: 'Reset Your Password',
    emailLabel: 'Email Address',
    passwordLabel: 'Password',
    newPasswordLabel: 'New Password',
    nameLabel: 'Full Name',
    roleLabel: 'Role',
    deptLabel: 'Department',
    developerRole: 'Support Agent / Tech',
    userRole: 'Regular User',
    submitLogin: 'Sign In',
    submitRegister: 'Create Account',
    submitReset: 'Reset Password',
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: 'Already have an account?',
    backToLogin: 'Back to Sign In',

    // Employee Portal
    employeePortalBanner: 'Create a New Support Ticket',
    reportNewIssue: 'Submit New Ticket',
    myReportedIncidents: 'My Open Tickets',
    problemTitle: 'What do you need help with?',
    category: 'Category',
    description: 'Describe the problem clearly...',
    deviceTelemetry: 'Device Info (Optional)',
    sentToDeveloper: 'Automatic',
    hostname: 'Device Name',
    ipAddress: 'IP Address',
    macAddress: 'MAC Address',
    submitTicket: 'Submit Ticket',
    cancel: 'Cancel',
    communicationStream: 'Ticket Updates & Replies',
    typeMessage: 'Type a message or reply...',
    send: 'Send Reply',
    noTickets: 'You have no open tickets at the moment.',

    // Diagnostics & AI Copilot
    stage1Grid: 'Ticket Overview',
    decisionTree: 'Troubleshooting Guide',
    passedRules: 'Normal Checks',
    warnings: 'Warnings',
    failedRules: 'Issues Detected',
    aiDiagnosis: '✨ AI Smart Solution',
    confidence: 'Confidence',
    reasoningChain: 'Recommended Solution Steps',
    evidenceCorrelated: 'Key Findings',
    recommendedAction: 'Quick Action',
    interactiveCopilot: '✨ AI Support Helper',
    askCopilotPlaceholder: 'Ask AI Helper e.g., "How do I fix this issue?"',
    ask: 'Ask AI',

    // Language Toggle
    langEn: 'English',
    langAr: 'العربية'
  },
  ar: {
    // Navigation & Header
    appTitle: 'مكتب الدعم البسيط',
    incidentsMaster: 'جميع التذاكر',
    employeePortal: 'إضافة تذكرة جديدة',
    telemetry: 'التفاصيل',
    diagnostics: 'التحديثات',
    aiCopilot: 'المساعد الذكي',
    analytics: 'لوحة التحكم',
    automations: 'الأتمتة',
    assets: 'الأصول',
    userControl: 'المستخدمين والأدوار',
    switchAccount: 'تبديل المستخدم',
    logout: 'تسجيل الخروج',
    login: 'تسجيل الدخول',
    register: 'إنشاء حساب',
    forgotPassword: 'نسيت كلمة المرور؟',
    searchPlaceholder: 'ابحث عن تذكرة...',
    approvalsNeeded: 'موافقات مطلوبة',
    developerConsole: 'بوابة الدعم',
    userPortal: 'مكتب المساعدة',
    developerTools: 'القائمة',
    developerAdmin: 'الإعدادات',
    systemSettings: 'إعدادات النظام',
    auditLogs: 'سجل العمليات',
    similarIncidents: 'تذاكر مشابهة',
    knowledgeBase: 'المقالات والتعليمات',
    assetsDevices: 'الأجهزة',
    dashboard: 'لوحة المؤشرات',
    allTickets: 'جميع التذاكر',
    raiseNewTicket: '+ إضافة تذكرة جديدة',

    // Ticket List & Tables
    activeIncidents: 'قائمة تذاكر الدعم الفني',
    ticketNumber: 'رقم التذكرة',
    title: 'العنوان / المشكلة',
    status: 'الحالة',
    severity: 'الأولوية',
    reporter: 'مقدم البلاغ',
    technician: 'المسؤول',
    actions: 'الإجراءات',
    viewWorkstation: 'عرض التفاصيل',
    critical: 'عاجل جداً',
    high: 'مرتفع',
    medium: 'متوسط',
    low: 'منخفض',
    newStatus: 'مفتوحة',
    diagnosingStatus: 'قيد التنفيذ',
    awaitingApprovalStatus: 'قيد التنفيذ',
    resolvedStatus: 'تم الحل',
    closedStatus: 'مغلقة',

    // Auth Modal
    authTitleLogin: 'مرحباً بك في مكتب الدعم',
    authTitleRegister: 'إنشاء حساب جديد',
    authTitleForgot: 'إعادة ضبط كلمة المرور',
    emailLabel: 'البريد الإلكتروني',
    passwordLabel: 'كلمة المرور',
    newPasswordLabel: 'كلمة المرور الجديدة',
    nameLabel: 'الاسم الكامل',
    roleLabel: 'نوع الحساب',
    deptLabel: 'القسم',
    developerRole: 'فني الدعم',
    userRole: 'مستخدم عادي',
    submitLogin: 'تسجيل الدخول',
    submitRegister: 'إنشاء الحساب',
    submitReset: 'تحديث كلمة المرور',
    dontHaveAccount: 'ليس لديك حساب؟',
    alreadyHaveAccount: 'لديك حساب بالفعل؟',
    backToLogin: 'العودة لتسجيل الدخول',

    // Employee Portal
    employeePortalBanner: 'إضافة تذكرة دعم جديدة',
    reportNewIssue: 'إرسال تذكرة جديدة',
    myReportedIncidents: 'تذاكري المفتوحة',
    problemTitle: 'ما هي المشكلة التي تحتاج مساعدة فيها؟',
    category: 'التصنيف',
    description: 'اشرح المشكلة بوضوح...',
    deviceTelemetry: 'معلومات الجهاز (اختياري)',
    sentToDeveloper: 'تلقائي',
    hostname: 'اسم الجهاز',
    ipAddress: 'عنوان IP',
    macAddress: 'عنوان MAC',
    submitTicket: 'إرسال التذكرة',
    cancel: 'إلغاء',
    communicationStream: 'المحادثة وتحديثات التذكرة',
    typeMessage: 'اكتب رداً أو رسالة جديدة...',
    send: 'إرسال الرد',
    noTickets: 'لا توجد لديك تذاكر مفتوحة حالياً.',

    // Diagnostics & AI Copilot
    stage1Grid: 'ملخص التذكرة',
    decisionTree: 'دليل حل المشكلة',
    passedRules: 'الفحوصات السليمة',
    warnings: 'التنبيهات',
    failedRules: 'المشاكل المكتشفة',
    aiDiagnosis: '✨ الحل الذكي الموصى به',
    confidence: 'نسبة الدقة',
    reasoningChain: 'خطوات الحل الموصى بها',
    evidenceCorrelated: 'النتائج الرئيسية',
    recommendedAction: 'إجراء سريع',
    interactiveCopilot: '✨ مساعد الدعم الذكي',
    askCopilotPlaceholder: 'اسأل المساعد الذكي مثلاً: "كيف أحل هذه المشكلة؟"',
    ask: 'اسأل الذكاء الإصطناعي',

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
    document.documentElement.dir = 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: keyof typeof translations['en']): string => {
    return translations[language][key] || translations['en'][key] || key;
  };

  const isRtl = false;

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
