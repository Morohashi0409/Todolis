/**
 * OGP（Open Graph Protocol）関連のユーティリティ関数
 */

export interface OGPData {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: string;
}

/**
 * 動的にOGPタグを更新する
 */
export function updateOGPTags(data: OGPData) {
  // タイトルを更新
  document.title = data.title;
  
  // メタタグを更新
  updateMetaTag('og:title', data.title);
  updateMetaTag('og:description', data.description);
  updateMetaTag('twitter:title', data.title);
  updateMetaTag('twitter:description', data.description);
  
  if (data.image) {
    updateMetaTag('og:image', data.image);
    updateMetaTag('twitter:image', data.image);
  }
  
  if (data.url) {
    updateMetaTag('og:url', data.url);
    updateMetaTag('twitter:url', data.url);
  }
  
  if (data.type) {
    updateMetaTag('og:type', data.type);
  }
}

/**
 * メタタグを更新または作成する
 */
function updateMetaTag(property: string, content: string) {
  const selector = property.startsWith('og:') || property.startsWith('twitter:') 
    ? `meta[property="${property}"]` 
    : `meta[name="${property}"]`;
    
  let metaTag = document.querySelector(selector) as HTMLMetaElement;
  
  if (!metaTag) {
    metaTag = document.createElement('meta');
    if (property.startsWith('og:') || property.startsWith('twitter:')) {
      metaTag.setAttribute('property', property);
    } else {
      metaTag.setAttribute('name', property);
    }
    document.head.appendChild(metaTag);
  }
  
  metaTag.setAttribute('content', content);
}

/**
 * デフォルトのOGPデータ
 */
export const defaultOGPData: OGPData = {
  title: 'Taskel - 続ける力を、シェアしよう',
  description: 'Taskelは、友達や家族と目標を共有し、進捗を管理できるアプリです。会員登録不要で、すぐに利用できます。',
  image: 'https://taskel.app/icon.png',
  url: 'https://taskel.app/',
  type: 'website'
};
