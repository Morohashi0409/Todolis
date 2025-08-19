<template>
  <div class="service-intro">
    <!-- ヘッダー -->
    <v-app-bar color="primary" dark elevation="0" class="header">
      <v-container class="header-container">
        <v-row align="center">
          <v-col cols="12" class="text-center">
            <h1 class="app-title">Todolis</h1>
          </v-col>
        </v-row>
      </v-container>
    </v-app-bar>

    <!-- ヒーローセクション -->
    <section class="hero-section">
      <v-container class="hero-container">
        <v-row justify="center" align="center" class="hero-content">
          <v-col cols="12" md="8" class="text-center">
            <h1 class="hero-title">
              続ける力を、シェアしよう
            </h1>
            <p class="hero-subtitle">
              友達や家族と目標を共有すれば、<br>
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

    <!-- 特徴紹介セクション -->
    <section class="features-section">
      <v-container>
        <v-row justify="center">
          <v-col cols="12" md="10" class="text-center">
            <h2 class="section-title">Todolis</h2>
          </v-col>
        </v-row>
        
        <v-row>
          <v-col cols="12" md="6" class="text-center">
            <div class="feature-card">
              <div class="feature-image">
                <v-icon size="120" color="primary" class="feature-icon">
                  mdi-calculator
                </v-icon>
              </div>
              <h3 class="feature-title">もっとも簡単な割り勘清算方法を計算</h3>
              <p class="feature-description">
                グループページにお金の立替え記録を登録していけば、独自のアルゴリズムで、リアルタイムに最も簡単な清算方法を計算してくれます。
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
                アプリインストール不要で、お使いのブラウザから会員登録なしですぐに利用できます。一緒に旅行に行く友達にアプリをインストールしてもらう必要はありません。
              </p>
            </div>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" md="6" class="text-center">
            <div class="feature-card">
              <div class="feature-image">
                <v-icon size="120" color="primary" class="feature-icon">
                  mdi-currency-usd
                </v-icon>
              </div>
              <h3 class="feature-title">あらゆる国の外貨に対応</h3>
              <p class="feature-description">
                すべての外貨に対応しているため、海外旅行中に発生したお金の貸し借りもスムーズに日本円で清算できます。
              </p>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- ユースケースセクション -->
    <section class="usecases-section">
      <v-container>
        <h2 class="section-title text-center">旅行以外にも様々なシーンで活躍</h2>
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
        <h2 class="section-title text-center">Todolisの使い方</h2>
        <p class="howto-subtitle text-center">1分でグループが作成できます！</p>
        
        <v-row>
          <v-col cols="12" md="6">
            <v-card class="howto-card" elevation="2">
              <v-card-text class="text-center">
                <div class="step-number">1</div>
                <h3 class="howto-title">グループを作成する</h3>
                <div class="howto-image">
                  <v-icon size="80" color="primary">mdi-account-group</v-icon>
                </div>
                <p class="howto-description">
                  まずはグループページを作成します。イベントのタイトルとメンバーを入力しましょう。海外旅行に行く際は、グループで使用する外貨も選択できます。
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
                  グループページのURLをLINEなどでメンバーにシェアしましょう。グループページにはURLを知っている人のみがアクセスできます。
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
                <h3 class="howto-title">立替えを記録する</h3>
                <div class="howto-image">
                  <v-icon size="80" color="primary">mdi-currency-exchange</v-icon>
                </div>
                <p class="howto-description">
                  誰が誰に何の買い物で何円立替えたかを登録しましょう。メンバー全員が登録可能なので、幹事の負担を軽減できます。
                </p>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="6">
            <v-card class="howto-card" elevation="2">
              <v-card-text class="text-center">
                <div class="step-number">4</div>
                <h3 class="howto-title">清算方法を確認する</h3>
                <div class="howto-image">
                  <v-icon size="80" color="primary">mdi-check-circle</v-icon>
                </div>
                <p class="howto-description">
                  清算方法は「誰から誰に」「いくら」返済が必要か確認できます。清算はもっとも少ない回数で済むよう計算されています。
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

    <!-- パートナーアプリセクション -->
    <section class="partner-section">
      <v-container>
        <h3 class="partner-title text-center">パートナーアプリ</h3>
        <v-row justify="center">
          <v-col cols="12" md="8">
            <v-card class="partner-card" elevation="1" outlined>
              <v-card-text class="text-center">
                <div class="partner-logo">
                  <v-icon size="64" color="grey">mdi-account-group</v-icon>
                </div>
                <p class="partner-description">共同編集できる旅行計画アプリ</p>
              </v-card-text>
            </v-card>
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
              <a href="#" class="footer-link">よくある質問</a>
              <a href="#" class="footer-link">お問い合わせ</a>
              <a href="#" class="footer-link">広告掲載について</a>
              <a href="#" class="footer-link">アンケート</a>
            </div>
          </v-col>
          <v-col cols="12" md="6">
            <div class="footer-links">
              <a href="#" class="footer-link">プライバシーポリシー</a>
              <a href="#" class="footer-link">利用規約</a>
              <a href="#" class="footer-link">運営元情報</a>
              <a href="#" class="footer-link">関連サイト</a>
            </div>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" class="text-center">
            <p class="copyright">© 2025 Todolis</p>
          </v-col>
        </v-row>
      </v-container>
    </v-footer>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const usecaseTags = [
  'ホームパーティ',
  'サウナ',
  'ハウスシェア',
  'BBQ',
  'ディズニーランド',
  '夏フェス',
  'キャンプ'
]

const navigateToCreate = () => {
  router.push('/create')
}
</script>

<style src="./service-intro.scss" lang="scss" scoped></style>
