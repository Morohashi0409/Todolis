import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

import App from './App.vue'
import router from './router'

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#DC4409', // ブランドカラー（オレンジ）
          secondary: '#00BCD4', // ブランドカラー（シアン）
          accent: '#FF9800',
          error: '#F44336',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FF9800',
        },
      },
    },
  },
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(vuetify)

app.mount('#app')

// GA4: SPA ページビュー計測
declare global {
  interface Window { gtag?: (...args: any[]) => void }
}

router.afterEach((to) => {
  // gtag が存在する場合のみ送信
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    // 推奨: page_view イベント
    window.gtag('event', 'page_view', {
      page_title: document.title,
      page_location: window.location.href,
      page_path: to.fullPath,
    })

    // 参考: 画面遷移カウント用途に screen_view も送信（GA4で集計可能）
    window.gtag('event', 'screen_view', {
      app_name: 'Taskel',
      screen_name: to.name || to.fullPath,
    })
  }
})
