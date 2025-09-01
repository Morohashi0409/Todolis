<template>
  <div class="service-intro">
    <!-- ヘッダー -->
    <v-app-bar color="primary" dark elevation="0" class="header">
      <v-container class="header-container">
        <v-row align="center">
          <v-col cols="12" class="text-center">
            <h1 class="app-title">Taskel</h1>
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
              <h3 class="feature-title">目標達成を仲間と一緒に管理</h3>
              <p class="feature-description">
                グループページに目標や「やることリスト」を登録していけば、みんなの進み具合がリアルタイムにひと目でわかります。「あの作業、終わったっけ？」がなくなります。
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
                アプリインストール不要で、お使いのブラウザから会員登録なしですぐに利用できます。一緒に目標を達成する仲間にアプリをインストールしてもらう必要はありません。
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
        <h2 class="section-title text-center">様々なシーンで目標達成をサポート</h2>
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
                  <v-icon size="80" color="primary">mdi-folder-plus</v-icon>
                </div>
                <p class="howto-description">
                  まずは目標グループページを作成します。プロジェクトのタイトルとメンバーを入力しましょう。秘密の計画には、PINコードも設定できます。
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
                <h3 class="howto-title">目標・タスクを記録する</h3>
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

const router = useRouter()

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
</script>

<style src="./service-intro.scss" lang="scss" scoped></style>
