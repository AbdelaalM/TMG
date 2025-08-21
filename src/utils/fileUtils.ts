/**
 * أدوات إدارة الملفات والمجلدات
 * نظام إدارة مصلحة الري - وزارة الموارد المائية والري
 */

// إنشاء مجلد في النظام
export const createFolder = (folderName: string): void => {
  try {
    // في بيئة المتصفح، نستخدم IndexedDB لمحاكاة نظام الملفات
    const folders = JSON.parse(localStorage.getItem('systemFolders') || '[]');
    if (!folders.includes(folderName)) {
      folders.push(folderName);
      localStorage.setItem('systemFolders', JSON.stringify(folders));
    }
  } catch (error) {
    console.error('خطأ في إنشاء المجلد:', error);
  }
};

// حفظ ملف في مجلد محدد
export const saveFileToFolder = (folderName: string, fileName: string, fileData: any): void => {
  try {
    createFolder(folderName);
    const folderKey = `folder_${folderName}`;
    const folderFiles = JSON.parse(localStorage.getItem(folderKey) || '{}');
    folderFiles[fileName] = {
      data: fileData,
      createdAt: new Date().toISOString(),
      size: JSON.stringify(fileData).length
    };
    localStorage.setItem(folderKey, JSON.stringify(folderFiles));
  } catch (error) {
    console.error('خطأ في حفظ الملف:', error);
  }
};

// قراءة ملف من مجلد
export const readFileFromFolder = (folderName: string, fileName: string): any => {
  try {
    const folderKey = `folder_${folderName}`;
    const folderFiles = JSON.parse(localStorage.getItem(folderKey) || '{}');
    return folderFiles[fileName]?.data || null;
  } catch (error) {
    console.error('خطأ في قراءة الملف:', error);
    return null;
  }
};

// الحصول على قائمة الملفات في مجلد
export const getFilesInFolder = (folderName: string): string[] => {
  try {
    const folderKey = `folder_${folderName}`;
    const folderFiles = JSON.parse(localStorage.getItem(folderKey) || '{}');
    return Object.keys(folderFiles);
  } catch (error) {
    console.error('خطأ في قراءة المجلد:', error);
    return [];
  }
};

// حذف ملف من مجلد
export const deleteFileFromFolder = (folderName: string, fileName: string): void => {
  try {
    const folderKey = `folder_${folderName}`;
    const folderFiles = JSON.parse(localStorage.getItem(folderKey) || '{}');
    delete folderFiles[fileName];
    localStorage.setItem(folderKey, JSON.stringify(folderFiles));
  } catch (error) {
    console.error('خطأ في حذف الملف:', error);
  }
};

// تنسيق حجم الملف
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 بايت';
  
  const k = 1024;
  const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// تحميل ملف للمستخدم
export const downloadFile = (fileName: string, data: any, mimeType: string = 'application/json'): void => {
  try {
    const blob = new Blob([typeof data === 'string' ? data : JSON.stringify(data, null, 2)], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('خطأ في تحميل الملف:', error);
  }
};

// إنشاء المجلدات الأساسية للنظام
export const initializeSystemFolders = (): void => {
  const systemFolders = [
    'exports',
    'imports', 
    'attachments',
    'backups',
    'reports',
    'templates',
    'logs',
    'temp'
  ];

  systemFolders.forEach(folder => createFolder(folder));
};