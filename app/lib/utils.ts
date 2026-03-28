/**
 * Converts common non-direct image URLs (like Google Drive share links) 
 * into direct image URLs that can be used in <img> tags.
 */
export function getDirectImageUrl(url: string | undefined): string | undefined {
  if (!url) return url;
  
  // Google Drive
  // https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  // https://drive.google.com/open?id=FILE_ID
  const gdMatch = url.match(/(?:\/d\/|id=)([\w-]+)/);
  if (url.includes('drive.google.com') && gdMatch && gdMatch[1]) {
    return `https://drive.google.com/uc?id=${gdMatch[1]}`;
  }
  
  // You can add logic for other providers (Dropbox, OneDrive, etc.) here if needed.
  
  return url;
}
