<template>
  <div class="service-intro">
    <!-- ヘッダー -->
    <AppHeader />

    <!-- ヒーローセクション -->
    <section class="hero-section">
      <v-container class="hero-container">
        <v-row justify="center" align="center" class="hero-content">
          <v-col cols="12" md="8" class="text-center">
            <h1 class="hero-title">
              続ける力を、シェアしよう
            </h1>
            <p class="hero-subtitle">
              友達や家族とタスクを共有すれば、<br>
              「どこまで進んだ？」がひと目でわかる。<br>
              コメントやリアクションで支え合えば、<br>
              ひとりでは続かないことも、一緒なら楽しみに変わります。
            </p>
            <v-btn
              color="white"
              variant="outlined"
              size="x-large"
              class="hero-button"
              @click="navigateToCreate"
            >
              はじめる
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- 最近のグループセクション -->
    <section v-if="recentGroups.length > 0" class="recent-groups-section">
      <v-container>
        <v-row justify="center">
          <v-col cols="12" md="10">
            <h2 class="section-title text-center">最近のグループ</h2>
            <p class="recent-groups-subtitle text-center">
              最近アクセスしたグループに戻ることができます
            </p>
            
            <v-row>
              <v-col 
                v-for="group in recentGroups" 
                :key="group.id"
                cols="12" 
                sm="6" 
                md="4"
              >
                <v-card 
                  class="recent-group-card" 
                  elevation="2"
                  @click="navigateToGroup(group)"
                  hover
                >
                  <v-card-text class="recent-group-content">
                    <div class="recent-group-icon">
                      <v-icon size="40" color="primary">mdi-account-group</v-icon>
                    </div>
                    <h3 class="recent-group-name">{{ group.name }}</h3>
                    <p class="recent-group-description">{{ group.description }}</p>
                    <div class="recent-group-meta">
                      <span class="recent-group-date">
                        {{ formatLastVisited(group.lastVisited) }}
                      </span>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
            
            <div class="text-center mt-4">
              <v-btn
                variant="outlined"
                color="primary"
                @click="clearRecentGroups"
                size="small"
              >
                履歴をクリア
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- 特徴紹介セクション -->
    <section class="features-section">
      <v-container>
        <v-row justify="center">
          <v-col cols="12" md="10" class="text-center">
            <h2 class="section-title">Taskel</h2>
          </v-col>
        </v-row>
        
        <v-row>
          <v-col cols="12" md="6" class="text-center">
            <div class="feature-card">
              <div class="feature-image">
                <v-icon size="120" color="primary" class="feature-icon">
                  mdi-format-list-checks
                </v-icon>
              </div>
              <h3 class="feature-title">タスク達成を仲間と一緒に管理</h3>
              <p class="feature-description">
                グループページにタスクや「やることリスト」を登録していけば、みんなの進み具合がリアルタイムにひと目でわかります。「あの作業、終わったっけ？」がなくなります。
              </p>
            </div>
          </v-col>
          <v-col cols="12" md="6" class="text-center">
            <div class="feature-card">
              <div class="feature-image">
                <v-icon size="120" color="primary" class="feature-icon">
                  mdi-account-check
                </v-icon>
              </div>
              <h3 class="feature-title">会員登録不要でかんたん利用</h3>
              <p class="feature-description">
                アプリインストール不要で、お使いのブラウザから会員登録なしですぐに利用できます。一緒にタスクを達成する仲間にアプリをインストールしてもらう必要はありません。
              </p>
            </div>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" md="6" class="text-center">
            <div class="feature-card">
              <div class="feature-image">
                <v-icon size="120" color="primary" class="feature-icon">
                  mdi-heart-multiple
                </v-icon>
              </div>
              <h3 class="feature-title">応援機能で継続をサポート</h3>
              <p class="feature-description">
                仲間の頑張りにスタンプやコメントで「がんばれ！」を送れます。応援があるから、ひとりでは続かないことも、みんなとなら楽しく継続できます。
              </p>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- ユースケースセクション -->
    <section class="usecases-section">
      <v-container>
        <h2 class="section-title text-center">様々なシーンでタスク達成をサポート</h2>
        <v-row justify="center">
          <v-col cols="12" md="10">
            <div class="tags-container">
              <v-chip
                v-for="tag in usecaseTags"
                :key="tag"
                color="white"
                variant="outlined"
                class="usecase-tag"
                size="large"
              >
                # {{ tag }}
              </v-chip>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- 使い方セクション -->
    <section class="howto-section">
      <v-container>
        <h2 class="section-title text-center">Taskelの使い方</h2>
        <p class="howto-subtitle text-center">1分でグループが作成できます！</p>
        
        <v-row>
          <v-col cols="12" md="6">
            <v-card class="howto-card" elevation="2">
              <v-card-text class="text-center">
                <div class="step-number">1</div>
                <h3 class="howto-title">グループを作成する</h3>
                <div class="howto-image">
                  <v-icon size="80" color="primary">mdi-folder-plus</v-icon>
                </div>
                <p class="howto-description">
                  まずはタスクグループページを作成します。プロジェクトのタイトルとメンバーを入力しましょう。秘密の計画には、PINコードも設定できます。
                </p>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="6">
            <v-card class="howto-card" elevation="2">
              <v-card-text class="text-center">
                <div class="step-number">2</div>
                <h3 class="howto-title">メンバーにシェアする</h3>
                <div class="howto-image">
                  <v-icon size="80" color="primary">mdi-share-variant</v-icon>
                </div>
                <p class="howto-description">
                  グループページのURLをLINEなどでメンバーにシェアしましょう。「見るだけ用」と「編集可能用」の2種類のリンクで安心です。
                </p>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" md="6">
            <v-card class="howto-card" elevation="2">
              <v-card-text class="text-center">
                <div class="step-number">3</div>
                <h3 class="howto-title">タスク・タスクを記録する</h3>
                <div class="howto-image">
                  <v-icon size="80" color="primary">mdi-clipboard-check</v-icon>
                </div>
                <p class="howto-description">
                  みんなの「やることリスト」を登録しましょう。誰がどの作業を担当するかも設定できるので、役割分担もスムーズです。
                </p>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="6">
            <v-card class="howto-card" elevation="2">
              <v-card-text class="text-center">
                <div class="step-number">4</div>
                <h3 class="howto-title">進捗を確認・応援する</h3>
                <div class="howto-image">
                  <v-icon size="80" color="primary">mdi-progress-check</v-icon>
                </div>
                <p class="howto-description">
                  完了したタスクはチェックして進捗を共有。仲間の頑張りにはスタンプやコメントで「おつかれさま！」を送りましょう。
                </p>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-row justify="center">
          <v-col cols="12" md="6" class="text-center">
            <v-btn
              color="primary"
              size="x-large"
              class="cta-button"
              @click="navigateToCreate"
            >
              はじめる
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- フッター -->
    <v-footer class="footer" color="dark">
      <v-container>
        <v-row>
          <v-col cols="12" md="6">
            <div class="footer-links">
              <!-- <a href="#" class="footer-link">よくある質問</a>
              <a href="#" class="footer-link">お問い合わせ</a>
              <a href="#" class="footer-link">広告掲載について</a>
              <a href="#" class="footer-link">アンケート</a> -->
            </div>
          </v-col>
          <v-col cols="12" md="6">
            <div class="footer-links">
              <!-- <a href="#" class="footer-link">プライバシーポリシー</a>
              <a href="#" class="footer-link">利用規約</a>
              <a href="#" class="footer-link">運営元情報</a>
              <a href="#" class="footer-link">関連サイト</a> -->
            </div>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" class="text-center">
            <p class="copyright">© 2025 Taskel</p>
          </v-col>
        </v-row>
      </v-container>
    </v-footer>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { onMounted, onUnmounted, ref } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import AppHeader from '@/components/AppHeader/AppHeader.vue'
import { getRecentGroups, clearRecentGroups as clearRecentGroupsStorage, type RecentGroup } from '@/utils/localStorage'

// GSAPプラグインを登録
gsap.registerPlugin(ScrollTrigger)

const router = useRouter()

// 最近のグループ
const recentGroups = ref<RecentGroup[]>([])

const usecaseTags = [
  '文化祭準備',
  '夏休みの宿題',
  '旅行計画',
  'テスト勉強',
  'グループ学習',
  '家族のお手伝い',
  'プロジェクト管理'
]

const navigateToCreate = () => {
  router.push('/create')
}

// 最近のグループに移動
const navigateToGroup = (group: RecentGroup) => {
  if (group.linkId) {
    router.push(`/link/${group.linkId}`)
  } else {
    router.push(`/space/${group.id}`)
  }
}

// 最近のグループをクリア
const clearRecentGroups = () => {
  clearRecentGroupsStorage()
  recentGroups.value = []
}

// 最後にアクセスした日時をフォーマット
const formatLastVisited = (date: Date) => {
  const now = new Date()
  const diffTime = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    return '今日'
  } else if (diffDays === 1) {
    return '昨日'
  } else if (diffDays < 7) {
    return `${diffDays}日前`
  } else {
    return date.toLocaleDateString('ja-JP')
  }
}

// アニメーション関数
const initAnimations = () => {
  // ヘッダーのアニメーション
  const headerTitle = document.querySelector('.app-title')
  const headerLogo = document.querySelector('.header-logo')
  const header = document.querySelector('.header')
  
  if (headerTitle && header) {
    // ヘッダーの登場アニメーション
    gsap.fromTo(header, {
      y: -100,
      opacity: 0
    }, {
      y: 0,
      opacity: 1,
      duration: 1.2,
      ease: "power3.out"
    })
    
    // ヘッダーロゴのアニメーション
    if (headerLogo) {
      gsap.fromTo(headerLogo, {
        opacity: 0,
        scale: 0,
        rotation: -180
      }, {
        opacity: 1,
        scale: 1,
        rotation: 0,
        duration: 1.2,
        ease: "back.out(1.7)",
        delay: 0.2
      })
    }
    
    // ヘッダータイトルのアニメーション
    gsap.fromTo(headerTitle, {
      opacity: 0,
      y: -30,
      scale: 0.8
    }, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 1.5,
      ease: "elastic.out(1, 0.8)",
      delay: 0.3
    })
  }
  
  // ヒーローセクションのアニメーション
  const heroTitle = document.querySelector('.hero-title')
  const heroSubtitle = document.querySelector('.hero-subtitle')
  const heroButton = document.querySelector('.hero-button')
  
  if (heroTitle && heroSubtitle && heroButton) {
    // 初期状態を設定
    gsap.set([heroTitle, heroSubtitle, heroButton], {
      opacity: 0,
      y: 50
    })
    
    // タイムラインを作成
    const heroTl = gsap.timeline({ delay: 0.8 }) // ヘッダーアニメーション後に開始
    
    heroTl
      .to(heroTitle, {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: "power3.out"
      })
      .to(heroSubtitle, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out"
      }, "-=0.8")
      .to(heroButton, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "back.out(1.7)"
      }, "-=0.5")
    
    // ボタンのパルスアニメーション
    gsap.to(heroButton, {
      scale: 1.05,
      duration: 2,
      ease: "power2.inOut",
      yoyo: true,
      repeat: -1,
      delay: 2
    })
  }
  
  // 特徴カードのスタッガーアニメーション
  const featureCards = document.querySelectorAll('.feature-card')
  if (featureCards.length > 0) {
    gsap.set(featureCards, {
      opacity: 0,
      scale: 0.8,
      y: 50
    })
    
    ScrollTrigger.create({
      trigger: '.features-section',
      start: 'top 80%',
      onEnter: () => {
        gsap.to(featureCards, {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.8,
          ease: "back.out(1.7)",
          stagger: 0.2
        })
      }
    })
  }
  
  // ユースケースタグの波状アニメーション
  const usecaseTags = document.querySelectorAll('.usecase-tag')
  if (usecaseTags.length > 0) {
    gsap.set(usecaseTags, {
      opacity: 0,
      y: 30,
      rotation: 5
    })
    
    ScrollTrigger.create({
      trigger: '.usecases-section',
      start: 'top 80%',
      onEnter: () => {
        gsap.to(usecaseTags, {
          opacity: 1,
          y: 0,
          rotation: 0,
          duration: 0.6,
          ease: "elastic.out(1, 0.5)",
          stagger: {
            amount: 1.5,
            from: "center"
          }
        })
        
        // タグのホバーアニメーション
        usecaseTags.forEach(tag => {
          tag.addEventListener('mouseenter', () => {
            gsap.to(tag, {
              scale: 1.1,
              rotation: 2,
              duration: 0.3,
              ease: "power2.out"
            })
          })
          
          tag.addEventListener('mouseleave', () => {
            gsap.to(tag, {
              scale: 1,
              rotation: 0,
              duration: 0.3,
              ease: "power2.out"
            })
          })
        })
      }
    })
  }
  
  // 使い方セクションのステップバイステップアニメーション
  const howtoCards = document.querySelectorAll('.howto-card')
  const stepNumbers = document.querySelectorAll('.step-number')
  
  if (howtoCards.length > 0) {
    gsap.set(howtoCards, {
      opacity: 0,
      x: -50,
      rotationY: 15
    })
    
    gsap.set(stepNumbers, {
      scale: 0,
      rotation: 180
    })
    
    ScrollTrigger.create({
      trigger: '.howto-section',
      start: 'top 70%',
      onEnter: () => {
        // カードのアニメーション
        gsap.to(howtoCards, {
          opacity: 1,
          x: 0,
          rotationY: 0,
          duration: 1,
          ease: "power3.out",
          stagger: 0.3
        })
        
        // ステップ番号のアニメーション
        gsap.to(stepNumbers, {
          scale: 1,
          rotation: 0,
          duration: 0.8,
          ease: "back.out(2)",
          stagger: 0.3,
          delay: 0.2
        })
      }
    })
  }
  
  // CTAボタンのアニメーション
  const ctaButton = document.querySelector('.cta-button')
  if (ctaButton) {
    ScrollTrigger.create({
      trigger: ctaButton,
      start: 'top 90%',
      onEnter: () => {
        gsap.fromTo(ctaButton, {
          opacity: 0,
          y: 50
        }, {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out"
        })
      }
    })
  }
  
  // パララックス効果
  gsap.to('.hero-section', {
    yPercent: -50,
    ease: "none",
    scrollTrigger: {
      trigger: '.hero-section',
      start: 'top bottom',
      end: 'bottom top',
      scrub: true
    }
  })
  
  // セクションタイトルのアニメーション
  const sectionTitles = document.querySelectorAll('.section-title')
  sectionTitles.forEach(title => {
    gsap.set(title, {
      opacity: 0,
      y: 30
    })
    
    ScrollTrigger.create({
      trigger: title,
      start: 'top 85%',
      onEnter: () => {
        gsap.to(title, {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out"
        })
      }
    })
  })
  
  // アイコンの回転アニメーション
  const featureIcons = document.querySelectorAll('.feature-icon')
  featureIcons.forEach(icon => {
    ScrollTrigger.create({
      trigger: icon,
      start: 'top 80%',
      onEnter: () => {
        gsap.fromTo(icon, {
          rotation: -180,
          scale: 0.5
        }, {
          rotation: 0,
          scale: 1,
          duration: 1.2,
          ease: "back.out(1.7)"
        })
      }
    })
  })
  
  // フロートアニメーション
  gsap.to('.feature-icon', {
    y: -10,
    duration: 3,
    ease: "power2.inOut",
    yoyo: true,
    repeat: -1,
    stagger: 0.5
  })
  
  gsap.to('.howto-image .v-icon', {
    y: -5,
    rotation: 5,
    duration: 4,
    ease: "power2.inOut",
    yoyo: true,
    repeat: -1,
    stagger: 0.8
  })
  
  // ヘッダーのスクロール効果
  const headerElement = document.querySelector('.header')
  if (headerElement) {
    ScrollTrigger.create({
      trigger: 'body',
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self: any) => {
        const progress = self.progress
        // スクロールに応じてヘッダーのブラー効果を変更
        gsap.to(headerElement, {
          backdropFilter: `blur(${10 + progress * 10}px)`,
          duration: 0.3
        })
      }
    })
    
    // スクロール時のヘッダー影効果
    ScrollTrigger.create({
      trigger: '.hero-section',
      start: 'top top',
      end: 'bottom top',
      onUpdate: (self: any) => {
        const shadowIntensity = self.progress
        gsap.to(headerElement, {
          boxShadow: `
            0 ${8 + shadowIntensity * 8}px ${32 + shadowIntensity * 16}px rgba(0, 0, 0, ${0.1 + shadowIntensity * 0.1}),
            0 ${2 + shadowIntensity * 4}px ${16 + shadowIntensity * 8}px rgba(255, 171, 38, ${0.3 + shadowIntensity * 0.3}),
            inset 0 1px 0 rgba(255, 255, 255, ${0.2 + shadowIntensity * 0.2})
          `,
          duration: 0.3
        })
      }
    })
  }
}

onMounted(() => {
  // 最近のグループを読み込み
  recentGroups.value = getRecentGroups()
  
  // DOMが完全に読み込まれた後にアニメーションを初期化
  setTimeout(() => {
    initAnimations()
  }, 100)
})

onUnmounted(() => {
  // ScrollTriggerをクリーンアップ
  ScrollTrigger.getAll().forEach((trigger: any) => trigger.kill())
})
</script>

<style src="./service-intro.scss" lang="scss" scoped></style>
