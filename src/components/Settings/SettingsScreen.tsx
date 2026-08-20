import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { initAndSeedDatabase, db } from '../../db';
import {
  Globe,
  KeyRound,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Sun,
  Moon,
  MessageCircle,
  FileSpreadsheet,
  Check,
  RefreshCw
} from 'lucide-react';

export const SettingsScreen: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  const { updatePinCode } = useAuth();
  const { theme, setTheme } = useTheme();

  const [currentPinInput, setCurrentPinInput] = useState<string>('');
  const [newPinInput, setNewPinInput] = useState<string>('');
  const [pinMsg, setPinMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [backupMsg, setBackupMsg] = useState<string | null>(null);

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    const storedPinSetting = await db.settings.get('pin_code');
    const actualPin = storedPinSetting ? storedPinSetting.value : '1234';

    if (currentPinInput !== actualPin) {
      setPinMsg({ text: 'رمز PIN الحالي غير صحيح', type: 'error' });
      return;
    }

    if (newPinInput.length !== 4 || !/^\d+$/.test(newPinInput)) {
      setPinMsg({ text: 'رمز PIN الجديد يجب أن يتكون من 4 أرقام exact', type: 'error' });
      return;
    }

    await updatePinCode(newPinInput);
    setPinMsg({ text: 'تم تغيير رمز PIN بنجاح! 🔒', type: 'success' });
    setCurrentPinInput('');
    setNewPinInput('');
  };

  // Comprehensive Rich Data WhatsApp Report + Attached JSON Database File
  const handleRichWhatsAppShare = async () => {
    const sales = await db.sales.toArray();
    const customers = await db.customers.toArray();
    const products = await db.products.toArray();
    const credit_payments = await db.credit_payments.toArray();
    const settings = await db.settings.toArray();

    // Raw Full Database Payload
    const backupData = {
      version: 1,
      exported_at: new Date().toISOString(),
      products,
      customers,
      sales,
      credit_payments,
      settings
    };

    const jsonString = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const dateTag = new Date().toISOString().slice(0, 10);
    const backupFile = new File([blob], `hanut-database-full-${dateTag}.json`, { type: 'application/json' });

    // 1. Calculate Summary Stats
    const totalSalesCount = sales.length;
    const totalRevenue = sales.reduce((sum, s) => sum + s.total_amount, 0);
    const totalDebtSum = customers.reduce((sum, c) => sum + c.total_owed, 0);
    const activeDebtors = customers.filter((c) => c.total_owed > 0);

    const dateStr = new Date().toLocaleString('ar-MA');

    // 2. Build Rich Itemized Report Body
    let reportText = `📋 *تقرير وتفاصيل حَانُوت الشاملة - ${dateStr}*\n\n`;
    reportText += `💵 *إجمالي المبيعات:* ${totalRevenue.toFixed(2)} MAD (${totalSalesCount} عملية)\n`;
    reportText += `💳 *مجموع الديون المعلقة:* ${totalDebtSum.toFixed(2)} MAD (${activeDebtors.length} زبون مدين)\n\n`;

    reportText += `--------------------------------\n`;
    reportText += `👤 *سجل الديون والزبناء:\n`;
    if (customers.length > 0) {
      customers.forEach((c) => {
        const phone = c.phone ? ` (📱 ${c.phone})` : '';
        reportText += `• ${c.name}${phone}: ${c.total_owed.toFixed(2)} MAD\n`;
      });
    } else {
      reportText += `لا يوجد زبناء مسجلون\n`;
    }

    reportText += `\n--------------------------------\n`;
    reportText += `📦 *سجل المنتجات والمخزون:\n`;
    products.forEach((p) => {
      reportText += `• ${p.name_ar} (${p.name}): ${p.price.toFixed(2)} MAD | المخزون: ${p.stock_quantity} | المباع: ${p.times_sold_total}\n`;
    });

    reportText += `\n--------------------------------\n`;
    reportText += `🧾 *آخر العمليات المسجلة:\n`;
    sales.slice(-8).reverse().forEach((s) => {
      const time = new Date(s.created_at).toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' });
      const itemsSummary = s.items.map(i => `${i.quantity}x ${i.product_name_ar}`).join(', ');
      reportText += `• [${time}] ${s.total_amount.toFixed(2)} MAD (${s.payment_method === 'paid' ? 'كاش' : 'دين'}) -> ${itemsSummary}\n`;
    });

    reportText += `\n📎 *مرفق مع هذا التقرير ملف قاعدة البيانات الكامل (JSON) للتحليل واسترجاعه على الحاسوب.*`;

    // 3. Try sending Attachment File directly via Mobile WhatsApp / Web Share
    if (navigator.canShare && navigator.canShare({ files: [backupFile] })) {
      try {
        await navigator.share({
          files: [backupFile],
          title: 'قاعدة بيانات حَانُوت الكاملة',
          text: reportText
        });
        setBackupMsg('تم إرسال الملف والتقرير الشامل بنجاح! 📤');
        setTimeout(() => setBackupMsg(null), 3000);
        return;
      } catch (e) {
        console.log('Native share canceled or unhandled');
      }
    }

    // Fallback direct WhatsApp link
    const encodedMsg = encodeURIComponent(reportText);
    const targetPhone = '212717393850';
    const waUrl = `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodedMsg}`;
    window.open(waUrl, '_blank');
  };

  const handleExportBackup = async () => {
    const products = await db.products.toArray();
    const customers = await db.customers.toArray();
    const sales = await db.sales.toArray();
    const credit_payments = await db.credit_payments.toArray();
    const settings = await db.settings.toArray();

    const backupData = {
      version: 1,
      exported_at: new Date().toISOString(),
      products,
      customers,
      sales,
      credit_payments,
      settings
    };

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(backupData, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute(
      'download',
      `hanut-backup-${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setBackupMsg('تم تصدير النسخة الاحتياطية بنجاح! 📁');
    setTimeout(() => setBackupMsg(null), 3000);
  };

  const handleExportExcel = async () => {
    const sales = await db.sales.toArray();
    const products = await db.products.toArray();
    const customers = await db.customers.toArray();

    let csvContent = "\uFEFF"; // UTF-8 BOM for Excel Arabic support
    
    // Sheet 1: Sales Summary
    csvContent += "--- مبيعات المحل ---\n";
    csvContent += "المعرف,التاريخ والوقت,نوع الدفع,العميل,المنتجات المشتراة,المبلغ الإجمالي (MAD)\n";

    sales.forEach((s) => {
      const dateStr = new Date(s.created_at).toLocaleString('ar-MA');
      const payment = s.payment_method === 'paid' ? 'دفع كاش' : 'دين (على الحساب)';
      const cust = s.customer_name || 'زبون عام';
      const items = s.items.map(i => `${i.quantity}x ${i.product_name_ar}`).join(' + ');
      csvContent += `"${s.id}","${dateStr}","${payment}","${cust}","${items}",${s.total_amount.toFixed(2)}\n`;
    });

    csvContent += "\n--- ديون الزبناء ---\n";
    csvContent += "اسم الزبون,رقم الهاتف,مجموع الدين المعلق (MAD),تاريخ آخر نشاط\n";
    customers.forEach((c) => {
      const dateStr = new Date(c.last_activity).toLocaleDateString('ar-MA');
      csvContent += `"${c.name}","${c.phone || ''}",${c.total_owed.toFixed(2)},"${dateStr}"\n`;
    });

    csvContent += "\n--- مخزون المنتجات ---\n";
    csvContent += "اسم المنتج,الفئة,السعر (MAD),الكمية بالمخزون,إجمالي المبيعات\n";
    products.forEach((p) => {
      csvContent += `"${p.name_ar}",${p.category},${p.price.toFixed(2)},${p.stock_quantity},${p.times_sold_total}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `تقرير_شامل_حَانُوت_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setBackupMsg('تم تصدير تقرير Excel الشامل بنجاح! 📊');
    setTimeout(() => setBackupMsg(null), 3000);
  };

  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = async (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.products && parsed.customers) {
            await db.products.clear();
            await db.customers.clear();
            await db.sales.clear();
            await db.credit_payments.clear();

            await db.products.bulkAdd(parsed.products);
            await db.customers.bulkAdd(parsed.customers);
            if (parsed.sales) await db.sales.bulkAdd(parsed.sales);
            if (parsed.credit_payments) await db.credit_payments.bulkAdd(parsed.credit_payments);

            setBackupMsg('تم استرجاع البيانات بنجاح! 🎉');
            setTimeout(() => setBackupMsg(null), 3000);
          }
        } catch (err) {
          alert('ملف غير صالح لاسترجاع البيانات');
        }
      };
    }
  };

  const handleResetDemoData = async () => {
    if (window.confirm(t.confirm_reset_demo)) {
      await db.products.clear();
      await db.customers.clear();
      await db.sales.clear();
      await db.credit_payments.clear();
      await initAndSeedDatabase();
      alert('تمت إعادة ضبط البيانات إلى الحالة الأولية بنجاح!');
    }
  };

  const handlePullFreshCloudData = async () => {
    try {
      const resProds = await fetch('https://hanut-server.vercel.app/api/products');
      const resCusts = await fetch('https://hanut-server.vercel.app/api/customers');
      const resSales = await fetch('https://hanut-server.vercel.app/api/sales');

      const cloudProds = await resProds.json();
      const cloudCusts = await resCusts.json();
      const cloudSales = await resSales.json();

      await db.products.clear();
      await db.customers.clear();
      await db.sales.clear();
      await db.credit_payments.clear();

      if (cloudProds && Array.isArray(cloudProds) && cloudProds.length > 0) {
        await db.products.bulkAdd(cloudProds.map(({ _id, __v, createdAt, updatedAt, ...p }: any) => p));
      }
      if (cloudCusts && Array.isArray(cloudCusts) && cloudCusts.length > 0) {
        await db.customers.bulkAdd(cloudCusts.map(({ _id, __v, createdAt, updatedAt, ...c }: any) => c));
      }
      if (cloudSales && Array.isArray(cloudSales) && cloudSales.length > 0) {
        await db.sales.bulkAdd(cloudSales.map(({ _id, __v, createdAt, updatedAt, ...s }: any) => s));
      }

      setBackupMsg('تمت مزامنة البيانات النظيفة من السحابة بنجاح! ☁️✨');
      setTimeout(() => setBackupMsg(null), 3000);
    } catch (err) {
      alert('خطأ في الاتصال بسحابة MongoDB');
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-6">
      
      {/* EXPORT & CLOUD SYNC SETTINGS */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">النسخ الاحتياطي والمزامنة السحابية</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">مزامنة سحابية وإرسال التقارير التلقائية إلى الواتساب</p>
            </div>
          </div>

          <span className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full font-bold flex items-center gap-1">
            <Check className="w-3.5 h-3.5" />
            <span>مفعل تلقائياً</span>
          </span>
        </div>

        {backupMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
            {backupMsg}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handlePullFreshCloudData}
            className="w-full py-3.5 px-4 rounded-2xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/30 font-bold text-xs flex items-center justify-center gap-2 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>مزامنة وجلب البيانات النظيفة من السحابة ☁️</span>
          </button>

          <button
            onClick={handleRichWhatsAppShare}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <MessageCircle className="w-4 h-4" />
            <span>تقرير WhatsApp شامل (0717393850) 📲</span>
          </button>
        </div>
      </div>

      {/* THEME SELECTION CARD */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Sun className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">مظهر التطبيق (Theme / Colors)</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">اختر مظهر الألوان المفضل لديك</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => setTheme('light')}
            className={`p-4 rounded-2xl border font-bold text-sm transition-all flex items-center justify-between ${
              theme === 'light'
                ? 'bg-amber-500/10 border-amber-500 text-amber-700 dark:text-amber-400 shadow-md'
                : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <span className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-500" />
              <span>المظهر الفاتح (Light Mode)</span>
            </span>
            {theme === 'light' && <CheckCircle2 className="w-4 h-4 text-amber-600" />}
          </button>

          <button
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-2xl border font-bold text-sm transition-all flex items-center justify-between ${
              theme === 'dark'
                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-md'
                : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <span className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-indigo-400" />
              <span>المظهر الداكن (Dark Mode)</span>
            </span>
            {theme === 'dark' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* LANGUAGE SELECTION CARD */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">{t.language_toggle}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">اختر لغة واجهة التطبيق (تنعكس التخطيطات RTL/LTR تلقائياً)</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => setLanguage('ar')}
            className={`p-4 rounded-2xl border font-bold text-sm transition-all flex items-center justify-between ${
              language === 'ar'
                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400 shadow-md'
                : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <span>العربية (Arabic - RTL)</span>
            {language === 'ar' && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
          </button>

          <button
            onClick={() => setLanguage('en')}
            className={`p-4 rounded-2xl border font-bold text-sm transition-all flex items-center justify-between ${
              language === 'en'
                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400 shadow-md'
                : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <span>English (LTR)</span>
            {language === 'en' && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* CHANGE PIN CARD */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">{t.change_pin}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">تغيير رمز PIN المكون من 4 أرقام لقفل التطبيق</p>
          </div>
        </div>

        {pinMsg && (
          <div
            className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
              pinMsg.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/30'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            <span>{pinMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleChangePin} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">{t.current_pin}</label>
            <input
              type="password"
              maxLength={4}
              required
              value={currentPinInput}
              onChange={(e) => setCurrentPinInput(e.target.value)}
              placeholder="••••"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">{t.new_pin}</label>
            <input
              type="password"
              maxLength={4}
              required
              value={newPinInput}
              onChange={(e) => setNewPinInput(e.target.value)}
              placeholder="••••"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="sm:col-span-2 pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-white dark:text-slate-950 font-bold text-xs shadow-md transition-all"
            >
              {t.change_pin}
            </button>
          </div>
        </form>
      </div>

      {/* DATA BACKUP & EXCEL REPORTS */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-600 dark:text-sky-400">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">{t.backup_data} واستخراج الملفات</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">تنزيل أو استرجاع بيانات المحل والديون للحفظ والأمان</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Export to Excel CSV */}
          <button
            onClick={handleExportExcel}
            className="p-4 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-sky-500/20"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>تقرير Excel شامل 📊</span>
          </button>

          {/* Download JSON Backup File */}
          <button
            onClick={handleExportBackup}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <Download className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span>تنزيل ملف (JSON)</span>
          </button>

          {/* Restore Data File */}
          <label className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer">
            <Upload className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>{t.restore_data}</span>
            <input type="file" accept=".json" onChange={handleRestoreBackup} className="hidden" />
          </label>
        </div>
      </div>

      {/* RESET SAMPLE DATA */}
      <div className="glass-panel p-6 rounded-3xl border border-rose-500/30 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">{t.reset_demo_data}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">إعادة تعيين المنتجات التجريبية وحسابات الديون الافتراضية</p>
            </div>
          </div>

          <button
            onClick={handleResetDemoData}
            className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/40 font-bold text-xs transition-all"
          >
            {t.reset_demo_data}
          </button>
        </div>
      </div>

    </div>
  );
};
