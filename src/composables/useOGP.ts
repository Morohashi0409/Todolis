import { ref, onMounted } from 'vue';
import { updateOGPTags, defaultOGPData, type OGPData } from '../utils/ogp';

/**
 * OGPタグを管理するComposable
 */
export function useOGP(initialData?: Partial<OGPData>) {
  const ogpData = ref<OGPData>({
    ...defaultOGPData,
    ...initialData
  });

  /**
   * OGPデータを更新する
   */
  const updateOGP = (data: Partial<OGPData>) => {
    ogpData.value = {
      ...ogpData.value,
      ...data
    };
    updateOGPTags(ogpData.value);
  };

  /**
   * デフォルトのOGPデータにリセットする
   */
  const resetOGP = () => {
    ogpData.value = { ...defaultOGPData };
    updateOGPTags(ogpData.value);
  };

  onMounted(() => {
    // 初期データでOGPタグを更新
    updateOGPTags(ogpData.value);
  });

  return {
    ogpData,
    updateOGP,
    resetOGP
  };
}
