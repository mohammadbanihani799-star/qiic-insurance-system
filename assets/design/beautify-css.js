const fs = require('fs');
const path = require('path');

// قراءة الملف المُصغّر
const minifiedCSS = fs.readFileSync(path.join(__dirname, 'FULL_MINIFIED.css'), 'utf8');

// دالة لتنسيق CSS
function beautifyCSS(css) {
  let beautified = css;
  
  // إضافة سطر جديد بعد }
  beautified = beautified.replace(/\}/g, '}\n');
  
  // إضافة سطر جديد بعد ;
  beautified = beautified.replace(/;/g, ';\n  ');
  
  // إضافة سطر جديد قبل {
  beautified = beautified.replace(/\{/g, ' {\n  ');
  
  // إضافة سطر جديد بعد media queries
  beautified = beautified.replace(/@media/g, '\n\n@media');
  
  // إضافة سطر جديد بعد keyframes
  beautified = beautified.replace(/@keyframes/g, '\n\n@keyframes');
  
  // إضافة سطر جديد بعد font-face
  beautified = beautified.replace(/@font-face/g, '\n\n@font-face');
  
  // إضافة سطر جديد بعد :root
  beautified = beautified.replace(/:root/g, '\n\n:root');
  
  // تنظيف المسافات الزائدة
  beautified = beautified.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  // إضافة تعليقات للأقسام الرئيسية
  beautified = beautified.replace(/\.header-flow/g, '\n/* ========== HEADER FLOW ========== */\n.header-flow');
  beautified = beautified.replace(/\.flow\[/g, '\n/* ========== FLOW LAYOUT ========== */\n.flow[');
  beautified = beautified.replace(/\.base-card/g, '\n/* ========== BASE CARD ========== */\n.base-card');
  beautified = beautified.replace(/\.preapproval-policy/g, '\n/* ========== PREAPPROVAL POLICY ========== */\n.preapproval-policy');
  beautified = beautified.replace(/\.visitor-form/g, '\n/* ========== VISITOR FORM ========== */\n.visitor-form');
  beautified = beautified.replace(/\.display-hero/g, '\n/* ========== TYPOGRAPHY ========== */\n.display-hero');
  beautified = beautified.replace(/--colorRoyalPurple50/g, '\n/* ========== COLOR SYSTEM - ROYAL PURPLE ========== */\n  --colorRoyalPurple50');
  beautified = beautified.replace(/--colorChaosBlack50/g, '\n/* ========== COLOR SYSTEM - CHAOS BLACK ========== */\n  --colorChaosBlack50');
  beautified = beautified.replace(/--colorSilverKen50/g, '\n/* ========== COLOR SYSTEM - SILVER KEN ========== */\n  --colorSilverKen50');
  
  return beautified;
}

// تنسيق الملف
const beautified = beautifyCSS(minifiedCSS);

// حفظ النتيجة
fs.writeFileSync(path.join(__dirname, 'BEAUTIFIED_FULL_CSS.css'), beautified, 'utf8');

console.log('✅ تم فك تشفير الملف بنجاح!');
console.log('📄 الملف: BEAUTIFIED_FULL_CSS.css');
console.log(`📊 الحجم الأصلي: ${(minifiedCSS.length / 1024).toFixed(2)} KB`);
console.log(`📊 الحجم بعد التنسيق: ${(beautified.length / 1024).toFixed(2)} KB`);
