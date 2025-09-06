<template>
  <div class="group-creation">
    <!-- ヘッダー -->
    <AppHeader :onNavigate="navigateToServiceIntro" :skipAnimation="true" />

    <!-- メインコンテンツ -->
    <v-main class="main-content">
      <v-container class="form-container">
        <v-row justify="center">
          <v-col cols="12" md="8" lg="6">
            <div class="form-header">
              <h2 class="form-title">グループ作成</h2>
            </div>
            
            <v-form @submit.prevent="handleSubmit" class="creation-form">
              <div class="form-field">
                <label class="field-label">グループ名</label>
                <v-textarea
                  v-model="formData.title"
                  placeholder="計画2025"
                  variant="filled"
                  density="compact"
                  :rows="1"
                  auto-grow
                  hide-details
                  class="input-field"
                />
              </div>

              <div class="form-field">
                <label class="field-label">メンバー名</label>
                <div class="member-input-container">
                  <v-textarea
                    v-model="currentMemberInput"
                    placeholder="田中太郎"
                    variant="filled"
                    density="compact"
                    :rows="1"
                    auto-grow
                    hide-details
                    class="input-field member-input"
                  />
                  <v-btn
                    color="primary"
                    variant="flat"
                    class="add-button"
                    @click="addMember"
                    :disabled="!currentMemberInput.trim()"
                  >
                    追加
                  </v-btn>
                </div>
                <div class="help-text">
                  メンバー名を入力して「追加」ボタンを押してください
                </div>
              </div>

              <!-- 追加されたメンバー一覧 -->
              <div v-if="memberList.length > 0" class="member-list-container">
                <div class="member-list">
                  <div 
                    v-for="(member, index) in memberList" 
                    :key="index"
                    class="member-tag"
                  >
                    <span class="member-name">{{ member }}</span>
                    <v-btn
                      icon="mdi-close"
                      size="x-small"
                      variant="text"
                      color="error"
                      @click="removeMember(index)"
                      class="remove-button"
                    >
                      <v-icon>mdi-close</v-icon>
                    </v-btn>
                  </div>
                </div>
              </div>

              <div class="form-actions">
                <v-btn
                  type="submit"
                  color="primary"
                  size="large"
                  :loading="loading"
                  :disabled="!formData.title.trim() || memberList.length < 2"
                  class="submit-button"
                >
                  グループを作成
                </v-btn>
                <div v-if="memberList.length < 2" class="validation-message">
                  ※ グループには最低2人のメンバーが必要です
                </div>
              </div>
            </v-form>
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <!-- エラーダイアログ -->
    <v-dialog v-model="showError" max-width="400">
      <v-card>
        <v-card-title class="text-h6 text-error">
          エラーが発生しました
        </v-card-title>
        <v-card-text>
          {{ errorMessage }}
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="showError = false">
            閉じる
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- フッター -->
    <v-footer class="footer" color="dark">
      <v-container>
        <v-row>
          <v-col cols="12" md="6">
            <!-- <div class="footer-links">
              <a href="#" class="footer-link">よくある質問</a>
              <a href="#" class="footer-link">お問い合わせ</a>
              <a href="#" class="footer-link">広告掲載について</a>
              <a href="#" class="footer-link">アンケート</a>
            </div> -->
          </v-col>
          <v-col cols="12" md="6">
            <!-- <div class="footer-links">
              <a href="#" class="footer-link">プライバシーポリシー</a>
              <a href="#" class="footer-link">利用規約</a>
              <a href="#" class="footer-link">運営元情報</a>
              <a href="#" class="footer-link">関連サイト</a>
            </div> -->
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
import AppHeader from '@/components/AppHeader/AppHeader.vue'
import { useRouter } from 'vue-router'
import { useGroupCreation } from './index'

const router = useRouter()

// service-introページに戻る関数
const navigateToServiceIntro = () => {
  router.push('/')
}

const {
  loading,
  showError,
  errorMessage,
  formData,
  addMember,
  handleSubmit,
  memberList,
  currentMemberInput,
  removeMember
} = useGroupCreation()
</script>

<style src="./group-creation.scss" lang="scss" scoped></style>
