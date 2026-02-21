import React, { createContext, useState, useContext, useEffect } from 'react';

const translations = {
  ar: {
    // Header
    contactMe: 'تواصل معي',
    habitTracker: 'متتبع العادات',
    subtitle: 'تابع عاداتك، طور حياتك',
    profile: 'الملف الشخصي',
    
    // Sidebar
    navigation: 'التنقل',
    home: 'الرئيسية',
    aboutMe: 'عني',
    lightMode: 'الوضع الفاتح',
    darkMode: 'الوضع الداكن',
    
    // Footer
    footer: 'متتبع العادات. جميع الحقوق محفوظة. | صنع بواسطة ممدوح',
    
    // Back to top
    backToTop: 'العودة للأعلى',
    showTutorial: 'عرض الشرح',
    
    // Login/Register
    createAccount: 'إنشاء حساب',
    login: 'تسجيل الدخول',
    username: 'اسم المستخدم',
    password: 'كلمة المرور',
    submit: 'إرسال',
    verifyCaptcha: 'الرجاء إكمال التحقق من أنك لست روبوت.',
    weakPassword: 'كلمة المرور ضعيفة جداً. استخدم 8 أحرف على الأقل مع أحرف كبيرة وصغيرة وأرقام ورموز.',
    passwordStrength: 'قوة كلمة المرور',
    passwordHint: 'استخدم 8 أحرف أو أكثر مع أحرف كبيرة وصغيرة وأرقام ورموز',
    weak: 'ضعيفة',
    fair: 'مقبولة',
    good: 'جيدة',
    strong: 'قوية',
    haveAccount: 'لديك حساب؟ تسجيل الدخول',
    noAccount: 'ليس لديك حساب؟ إنشاء حساب',
    
    // Habits
    yourHabits: 'عاداتك',
    logout: 'تسجيل الخروج',
    newHabit: 'عادة جديدة',
    add: 'إضافة',
    delete: 'حذف',
    completed: 'تم الإنجاز',
    addError: 'تعذر إضافة العادة',
    
    // Profile Dashboard
    yourProfile: 'ملفك الشخصي',
    close: 'إغلاق',
    account: 'الحساب',
    name: 'الاسم',
    avatarPreview: 'معاينة الصورة',
    changeAvatar: 'انقر لتغيير الصورة',
    save: 'حفظ',
    badges: 'شارات النجاح',
    badge7day: 'محارب 7 أيام',
    badge30day: 'سلسلة 30 يوم',
    history: 'السجل',
    editHistory: 'تعديل السجل',
    done: 'تم',
    loading: 'جاري التحميل...',
    noHistory: 'لا توجد سجلات.',
    
    // Tutorial
    tutorialStep: 'الخطوة',
    skip: 'تخطي',
    step1Title: 'اكتب عادة',
    step1Body: 'اكتب عادة في حقل الإدخال أدناه. جرّب "تنظيف الأسنان" كاقتراح!',
    step2Title: 'أضف العادة',
    step2Body: 'انقر على زر "إضافة" لحفظ عادتك.',
    step3Title: 'تم الإنجاز',
    step3Body: 'انقر على "تم الإنجاز" لإكمال العادة لهذا اليوم.',
    step4Title: 'احذف العادة',
    step4Body: 'انقر على "حذف" لإزالة العادة.',
    
    // Hero
    heroTitle: 'ابنِ عادات أفضل. عش بوعي.',
    heroSub: 'متتبع عادات مركّز مع مصادقة آمنة، تتبع سهل، وواجهة نظيفة ومستقبلية مصممة لمساعدتك على تحقيق إنجازات صغيرة كل يوم.',
    getStarted: 'ابدأ الآن',
    learnMore: 'اعرف المزيد',
    hideSection: 'إخفاء هذا القسم نهائياً',
    todayRoutine: 'روتين اليوم',
    morningMeditation: '🧘 تأمل صباحي',
    read20Pages: '📚 قراءة 20 صفحة',
    exercise20Min: '🏃 تمرين 20 دقيقة',
    
    // About Me
    aboutMeTitle: 'عني',
    nameLabel: 'الاسم:',
    position: 'المنصب:',
    positionValue: 'مهندس ومطور',
    education: 'التعليم:',
    educationValue: 'طالب في الجامعة الألمانية بالقاهرة (GUC)',
    aboutMeDesc: 'أنا شغوف ببناء حلول برمجية، وتعلم تقنيات جديدة، وحل المشكلات الحقيقية. كطالب في الجامعة الألمانية ومهندس، أسعى لإنشاء تطبيقات مؤثرة وتحسين مهاراتي باستمرار كمطور.',
    
    // Contact Me
    contactUs: 'تواصل معنا',
    contactTagline: 'دعنا نتواصل — بأسلوب سايبربانك!',
    emailPlaceholder: 'بريدك الإلكتروني (اختياري)',
    messagePlaceholder: 'رسالتك',
    send: 'إرسال',
    sending: 'جاري الإرسال...',
    sent: 'تم الإرسال!',
    messageSent: 'تم إرسال الرسالة!',
    takeAMoment: 'الرجاء خذ لحظة لكتابة رسالتك.',
    waitSeconds: 'الرجاء الانتظار {seconds} ثانية قبل إرسال رسالة أخرى.',
    writeMessage: 'الرجاء كتابة رسالة (10 أحرف على الأقل).',
    tooManyLinks: 'روابط كثيرة جداً في رسالتك.',
    sendFailed: 'فشل إرسال الرسالة. حاول مرة أخرى لاحقاً.',
    
    // Language
    language: 'اللغة',
    arabic: 'العربية',
    english: 'English',
    
    // Routines
    planRoutines: 'خطط روتينك',
    routines: 'الروتين',
    addRoutine: 'إضافة روتين',
    routineName: 'اسم الروتين',
    time: 'الوقت',
    category: 'الفئة',
    repeatOn: 'التكرار',
    todaysRoutines: 'روتين اليوم',
    noRoutinesToday: 'لا يوجد روتين مجدول لهذا اليوم',
    allRoutines: 'جميع الروتينات',
    weeklyTracking: 'تتبع أسبوعي',
    cancel: 'إلغاء',
  },
  en: {
    // Header
    contactMe: 'Contact Me',
    habitTracker: 'Habit Tracker',
    subtitle: 'Track your habits, transform your life',
    profile: 'Profile',
    
    // Sidebar
    navigation: 'Navigation',
    home: 'Home',
    aboutMe: 'About',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    
    // Footer
    footer: 'Habit Tracker. All rights reserved. | Made by Mamdouh',
    
    // Back to top
    backToTop: 'Back to Top',
    showTutorial: 'Show Tutorial',
    
    // Login/Register
    createAccount: 'Create Account',
    login: 'Login',
    username: 'Username',
    password: 'Password',
    submit: 'Submit',
    verifyCaptcha: 'Please complete the CAPTCHA verification.',
    weakPassword: 'Password is too weak. Use at least 8 characters with uppercase, lowercase, numbers, and symbols.',
    passwordStrength: 'Password Strength',
    passwordHint: 'Use 8+ characters with uppercase, lowercase, numbers, and symbols',
    weak: 'Weak',
    fair: 'Fair',
    good: 'Good',
    strong: 'Strong',
    haveAccount: 'Have an account? Login',
    noAccount: "Don't have an account? Create Account",
    
    // Habits
    yourHabits: 'Your Habits',
    logout: 'Logout',
    newHabit: 'New habit',
    add: 'Add',
    delete: 'Delete',
    completed: 'Completed',
    addError: 'Failed to add habit',
    
    // Profile Dashboard
    yourProfile: 'Your Profile',
    close: 'Close',
    account: 'Account',
    name: 'Name',
    avatarPreview: 'Avatar preview',
    changeAvatar: 'Click to change avatar',
    save: 'Save',
    badges: 'Achievement Badges',
    badge7day: '7-Day Warrior',
    badge30day: '30-Day Streak',
    history: 'History',
    editHistory: 'Edit History',
    done: 'Done',
    loading: 'Loading...',
    noHistory: 'No history yet.',
    
    // Tutorial
    tutorialStep: 'Step',
    skip: 'Skip',
    step1Title: 'Type a Habit',
    step1Body: 'Type a habit in the input field below. Try "Brush teeth" as a suggestion!',
    step2Title: 'Add the Habit',
    step2Body: 'Click the "Add" button to save your habit.',
    step3Title: 'Mark Completed',
    step3Body: 'Click "Completed" to mark the habit as done for today.',
    step4Title: 'Delete Habit',
    step4Body: 'Click "Delete" to remove the habit.',
    
    // Hero
    heroTitle: 'Build Better Habits. Live Mindfully.',
    heroSub: 'A focused habit tracker with secure authentication, easy tracking, and a clean, futuristic interface designed to help you achieve small wins every day.',
    getStarted: 'Get Started',
    learnMore: 'Learn More',
    hideSection: 'Hide this section permanently',
    todayRoutine: "Today's Routine",
    morningMeditation: '🧘 Morning meditation',
    read20Pages: '📚 Read 20 pages',
    exercise20Min: '🏃 Exercise 20 min',
    
    // About Me
    aboutMeTitle: 'About Me',
    nameLabel: 'Name:',
    position: 'Position:',
    positionValue: 'Engineer & Developer',
    education: 'Education:',
    educationValue: 'Student at German University in Cairo (GUC)',
    aboutMeDesc: 'I am passionate about building software solutions, learning new technologies, and solving real-world problems. As a GUC student and engineer, I strive to create impactful applications and continuously improve my skills as a developer.',
    
    // Contact Me
    contactUs: 'Contact Us',
    contactTagline: "Let's connect — cyberpunk style!",
    emailPlaceholder: 'Your email (optional)',
    messagePlaceholder: 'Your message',
    send: 'Send',
    sending: 'Sending...',
    sent: 'Sent!',
    messageSent: 'Message sent!',
    takeAMoment: 'Please take a moment to write your message.',
    waitSeconds: 'Please wait {seconds} seconds before sending another message.',
    writeMessage: 'Please write a message (at least 10 characters).',
    tooManyLinks: 'Too many links in your message.',
    sendFailed: 'Failed to send message. Please try again later.',
    
    // Language
    language: 'Language',
    arabic: 'العربية',
    english: 'English',
    
    // Routines
    planRoutines: 'Plan Your Routines',
    routines: 'Routines',
    addRoutine: 'Add Routine',
    routineName: 'Routine name',
    time: 'Time',
    category: 'Category',
    repeatOn: 'Repeat on',
    todaysRoutines: "Today's Routines",
    noRoutinesToday: 'No routines scheduled for today',
    allRoutines: 'All Routines',
    weeklyTracking: 'Weekly Tracking',
    cancel: 'Cancel',
  }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    try {
      return localStorage.getItem('language') || 'ar';
    } catch {
      return 'ar';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('language', language);
    } catch {}
    
    // Update HTML dir and lang attributes
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    
    // Update page title
    document.title = translations[language].habitTracker;
  }, [language]);

  const t = (key, params = {}) => {
    let text = translations[language][key] || translations['en'][key] || key;
    // Replace {param} placeholders
    Object.keys(params).forEach(param => {
      text = text.replace(`{${param}}`, params[param]);
    });
    return text;
  };

  const toggleLanguage = () => {
    setLanguage(lang => lang === 'ar' ? 'en' : 'ar');
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export default LanguageContext;
