// App Configuration
export const GAS_URL = process.env.NEXT_PUBLIC_GAS_URL || '';
export const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true' || !process.env.NEXT_PUBLIC_GAS_URL;

function extractId(val?: string) {
  if (!val) return 'demo';
  const match = val.match(/folders\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : val;
}

// Google Drive folder IDs for Knowledge Repository
export const DRIVE_FOLDERS = {
  'มัธยมต้น': {
    'คณิตศาสตร์': extractId(process.env.NEXT_PUBLIC_DRIVE_MT_MATH),
    'ฟิสิกส์':    extractId(process.env.NEXT_PUBLIC_DRIVE_MT_PHY),
    'เคมี':       extractId(process.env.NEXT_PUBLIC_DRIVE_MT_CHEM),
    'ชีววิทยา':   extractId(process.env.NEXT_PUBLIC_DRIVE_MT_BIO),
    'ภาษาอังกฤษ': extractId(process.env.NEXT_PUBLIC_DRIVE_MT_ENG),
    'ภาษาไทย':    extractId(process.env.NEXT_PUBLIC_DRIVE_MT_THAI),
    'สังคมศึกษา': extractId(process.env.NEXT_PUBLIC_DRIVE_MT_SOC),
  },
  'มัธยมปลาย': {
    'คณิตศาสตร์': extractId(process.env.NEXT_PUBLIC_DRIVE_MP_MATH),
    'ฟิสิกส์':    extractId(process.env.NEXT_PUBLIC_DRIVE_MP_PHY),
    'เคมี':       extractId(process.env.NEXT_PUBLIC_DRIVE_MP_CHEM),
    'ชีววิทยา':   extractId(process.env.NEXT_PUBLIC_DRIVE_MP_BIO),
    'ภาษาอังกฤษ': extractId(process.env.NEXT_PUBLIC_DRIVE_MP_ENG),
    'ภาษาไทย':    extractId(process.env.NEXT_PUBLIC_DRIVE_MP_THAI),
    'สังคมศึกษา': extractId(process.env.NEXT_PUBLIC_DRIVE_MP_SOC),
  },
};

export const SUBJECTS = ['คณิตศาสตร์','ฟิสิกส์','เคมี','ชีววิทยา','ภาษาอังกฤษ','ภาษาไทย','สังคมศึกษา'];

export const CLASSES_JUNIOR  = ['ม.1/9','ม.2/9','ม.3/9'];
export const CLASSES_SENIOR  = ['ม.4/9','ม.5/9','ม.6/9'];
export const ALL_CLASSES     = [...CLASSES_JUNIOR, ...CLASSES_SENIOR];

export const RELIGIONS = ['พุทธ','คริสต์','อิสลาม','อื่น ๆ'];
export const BLOOD_TYPES = ['A','B','AB','O'];
export const EXAM_TYPES  = ['กลางภาค','ปลายภาค','สอบย่อย'];
export const TERMS = ['1','2'];
