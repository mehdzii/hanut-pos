export type Language = 'ar' | 'en';

export interface Translations {
  // Navigation & General
  app_name: string;
  app_subtitle: string;
  pos: string;
  credit: string;
  catalog: string;
  reports: string;
  settings: string;
  currency: string;
  close: string;
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  success: string;
  confirm: string;
  
  // POS Screen
  popular: string;
  all_categories: string;
  search_product: string;
  cart: string;
  empty_cart: string;
  undo: string;
  clear_cart: string;
  confirm_clear_cart: string;
  total: string;
  pay_cash: string;
  pay_credit: string;
  hold_cart: string;
  select_customer: string;
  quick_add_customer: string;
  sale_completed: string;
  out_of_stock: string;
  qty: string;
  
  // Category Names
  cat_all: string;
  cat_dairy: string;
  cat_bakery: string;
  cat_drinks: string;
  cat_pantry: string;
  cat_snacks: string;
  cat_hygiene: string;

  // Credit / Debt System
  customers: string;
  add_customer: string;
  customer_name: string;
  phone_number: string;
  total_debt: string;
  search_customer: string;
  sort_highest_debt: string;
  sort_name: string;
  overdue_badge: string;
  no_debt: string;
  visit_history: string;
  log_payment: string;
  enter_payment_amount: string;
  full_settlement: string;
  partial_payment: string;
  amount_paid: string;
  new_balance: string;
  payment_success: string;
  date_time: string;
  transaction_details: string;
  payment_history: string;
  
  // Catalog Management
  product_list: string;
  add_new_product: string;
  edit_product: string;
  product_name_en: string;
  product_name_ar: string;
  category: string;
  price_label: string;
  stock_quantity: string;
  image_url: string;
  sold_times: string;
  confirm_delete_product: string;

  // Reports
  today_summary: string;
  date_range: string;
  total_revenue: string;
  total_sales: string;
  cash_collected: string;
  new_credit_given: string;
  debt_recovered: string;
  items_sold: string;
  top_selling_today: string;

  // Auth & Settings
  enter_pin: string;
  enter_pin_desc: string;
  incorrect_pin: string;
  unlock: string;
  lock_app: string;
  change_pin: string;
  current_pin: string;
  new_pin: string;
  backup_data: string;
  backup_desc: string;
  restore_data: string;
  restore_desc: string;
  reset_demo_data: string;
  confirm_reset_demo: string;
  language_toggle: string;
}

export const translations: Record<Language, Translations> = {
  ar: {
    app_name: 'حَانُوت',
    app_subtitle: 'نظام البيع السريع وإدارة الديون',
    pos: 'نقطة البيع',
    credit: 'صفحة الديون',
    catalog: 'المنتجات',
    reports: 'التقارير',
    settings: 'الإعدادات',
    currency: 'د.م',
    close: 'إغلاق',
    save: 'حفظ',
    cancel: 'إلغاء',
    delete: 'حذف',
    edit: 'تعديل',
    success: 'تمت العملية بنجاح',
    confirm: 'تأكيد',

    popular: 'الأكثر مبيعاً ⭐',
    all_categories: 'الكل',
    search_product: 'بحث عن منتج بالاسم...',
    cart: 'سلة المشتريات',
    empty_cart: 'السلة فارغة. انقر على المنتجات لإضافتها',
    undo: 'تراجع',
    clear_cart: 'مسح',
    confirm_clear_cart: 'هل أنت أصل من تفريغ السلة؟',
    total: 'المجموع الكلي',
    pay_cash: 'دفع نقداً (كاش)',
    pay_credit: 'تسجيل دين (بالدين)',
    hold_cart: 'تعليق / تغيير السلة',
    select_customer: 'اختر الزبون لتسجيل الدين',
    quick_add_customer: '+ زبون جديد',
    sale_completed: 'تمت عملية البيع بنجاح! 🎉',
    out_of_stock: 'نفد من المخزون',
    qty: 'الكمية',

    cat_all: 'الكل',
    cat_dairy: 'مأكولات الحليب',
    cat_bakery: 'المخبوزات',
    cat_drinks: 'المشروبات',
    cat_pantry: 'المواد الغذائية',
    cat_snacks: 'الحلويات والمقرمشات',
    cat_hygiene: 'النظافة والمنظفات',

    customers: 'قائمة الزبناء والديون',
    add_customer: 'إضافة زبون جديد',
    customer_name: 'اسم الزبون',
    phone_number: 'رقم الهاتف (اختياري)',
    total_debt: 'إجمالي الدين المستحق',
    search_customer: 'بحث باسم الزبون أو الهاتف...',
    sort_highest_debt: 'الأعلى ديناً أولاً',
    sort_name: 'حسب الاسم',
    overdue_badge: 'متأخر ⚠️ (+30 يوم)',
    no_debt: 'لا يوجد دين مستحق',
    visit_history: 'سجل الزيارات والديون القديمة',
    log_payment: 'تسجيل سداد دين',
    enter_payment_amount: 'أدخل المبلغ المدفوع (د.م)',
    full_settlement: 'سداد كامل الدين',
    partial_payment: 'سداد جزئي',
    amount_paid: 'المبلغ المدفوع',
    new_balance: 'الدين المتبقي',
    payment_success: 'تم تسجيل السداد وتحديث الحساب بنجاح! 💸',
    date_time: 'التاريخ والتوقيت',
    transaction_details: 'تفاصيل المشتريات',
    payment_history: 'سجل التسديدات المقبوضة',

    product_list: 'إدارة قائمة المنتجات والمخزون',
    add_new_product: 'إضافة منتج جديد',
    edit_product: 'تعديل المنتج',
    product_name_en: 'الاسم بالإنجليزي',
    product_name_ar: 'الاسم بالعربي',
    category: 'الفئة',
    price_label: 'السعر (د.م)',
    stock_quantity: 'الكمية بالمخزون',
    image_url: 'رابط الصورة (URL)',
    sold_times: 'مرات البيع',
    confirm_delete_product: 'هل أنت متأكد من حذف هذا المنتج؟',

    today_summary: 'ملخص مبيعات اليوم والديون',
    date_range: 'الفترة الزمانية',
    total_revenue: 'إجمالي المبيعات',
    total_sales: 'عدد العمليات',
    cash_collected: 'المقبوضات نقداً',
    new_credit_given: 'الديون الجديدة',
    debt_recovered: 'الديون المحصلة',
    items_sold: 'قطع مبيعة',
    top_selling_today: 'الأكثر مبيعاً اليوم',

    enter_pin: 'رمز الدخول (PIN)',
    enter_pin_desc: 'أدخل رمز PIN المكون من 4 أرقام لفتح التطبيق',
    incorrect_pin: 'رمز PIN غير صحيح. حاول مجدداً',
    unlock: 'فتح التطبيق',
    lock_app: 'قفل التطبيق',
    change_pin: 'تغيير رمز PIN',
    current_pin: 'الرمز الحالي',
    new_pin: 'الرمز الجديد',
    backup_data: 'تصدير نسخة احتياطية (JSON)',
    backup_desc: 'تحميل كافة البيانات والديون في ملف للنسخ الاحتياطي',
    restore_data: 'استرجاع البيانات من ملف',
    restore_desc: 'رفع ملف نسخة احتياطية لاستعادة الحسابات والمنتجات',
    reset_demo_data: 'إعادة ضبط البيانات التجريبية',
    confirm_reset_demo: 'هل أنت متأكد من إعادة ضبط البيانات إلى الحالة الأولية؟',
    language_toggle: 'Language / اللغة'
  },
  en: {
    app_name: 'HANUT',
    app_subtitle: 'Fast Shop POS & Credit Tracker',
    pos: 'Point of Sale',
    credit: 'Debt Tracker',
    catalog: 'Products',
    reports: 'Reports',
    settings: 'Settings',
    currency: 'MAD',
    close: 'Close',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    success: 'Operation completed successfully',
    confirm: 'Confirm',

    popular: 'Popular Items ⭐',
    all_categories: 'All',
    search_product: 'Search product by name...',
    cart: 'Current Cart',
    empty_cart: 'Cart is empty. Tap products to add items',
    undo: 'Undo',
    clear_cart: 'Clear',
    confirm_clear_cart: 'Are you sure you want to clear the cart?',
    total: 'Grand Total',
    pay_cash: 'Pay Cash',
    pay_credit: 'On Credit (Debt)',
    hold_cart: 'Hold / Switch Cart',
    select_customer: 'Select Customer for Credit',
    quick_add_customer: '+ New Customer',
    sale_completed: 'Sale completed successfully! 🎉',
    out_of_stock: 'Out of stock',
    qty: 'Qty',

    cat_all: 'All',
    cat_dairy: 'Dairy',
    cat_bakery: 'Bakery',
    cat_drinks: 'Drinks',
    cat_pantry: 'Pantry',
    cat_snacks: 'Snacks & Sweets',
    cat_hygiene: 'Hygiene',

    customers: 'Customer Debt Profiles',
    add_customer: 'Add New Customer',
    customer_name: 'Customer Name',
    phone_number: 'Phone Number (Optional)',
    total_debt: 'Total Balance Owed',
    search_customer: 'Search customer name or phone...',
    sort_highest_debt: 'Highest Debt First',
    sort_name: 'By Name',
    overdue_badge: 'Overdue ⚠️ (+30 Days)',
    no_debt: 'No outstanding debt',
    visit_history: 'Visit & Credit History',
    log_payment: 'Log Debt Payment',
    enter_payment_amount: 'Enter amount paid (MAD)',
    full_settlement: 'Full Settlement',
    partial_payment: 'Partial Payment',
    amount_paid: 'Amount Paid',
    new_balance: 'Remaining Debt',
    payment_success: 'Payment recorded and account updated! 💸',
    date_time: 'Date & Time',
    transaction_details: 'Purchase Details',
    payment_history: 'Payment Received Log',

    product_list: 'Product Catalog & Inventory',
    add_new_product: 'Add New Product',
    edit_product: 'Edit Product',
    product_name_en: 'Name (English)',
    product_name_ar: 'Name (Arabic)',
    category: 'Category',
    price_label: 'Price (MAD)',
    stock_quantity: 'Stock Quantity',
    image_url: 'Image URL',
    sold_times: 'Times Sold',
    confirm_delete_product: 'Are you sure you want to delete this product?',

    today_summary: 'Today\'s Sales & Debt Summary',
    date_range: 'Date Period',
    total_revenue: 'Total Revenue',
    total_sales: 'Total Orders',
    cash_collected: 'Cash Collected',
    new_credit_given: 'New Credit Issued',
    debt_recovered: 'Debt Recovered',
    items_sold: 'Items Sold',
    top_selling_today: 'Top 5 Products Today',

    enter_pin: 'Access PIN Code',
    enter_pin_desc: 'Enter 4-digit PIN code to unlock app',
    incorrect_pin: 'Incorrect PIN. Try again',
    unlock: 'Unlock App',
    lock_app: 'Lock App',
    change_pin: 'Change PIN',
    current_pin: 'Current PIN',
    new_pin: 'New PIN',
    backup_data: 'Export JSON Backup',
    backup_desc: 'Download all shop catalog and customer debt data',
    restore_data: 'Restore Backup File',
    restore_desc: 'Upload a backup JSON file to restore your data',
    reset_demo_data: 'Reset Sample Data',
    confirm_reset_demo: 'Are you sure you want to reset data to initial demo state?',
    language_toggle: 'اللغة / Language'
  }
};
