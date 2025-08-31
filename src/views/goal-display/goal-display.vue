<template>
  <div class="goal-display">
    <!-- ヘッダー -->
    <v-app-bar 
      color="primary" 
      dark 
      elevation="0" 
      class="header" 
      height="auto"
      :extension-height="0"
      flat
      fixed
      app
    >
      <template v-slot:default>
        <v-container class="header-container" fluid>
          <v-row align="center">
            <v-col cols="12">
              <h1 class="space-title">{{ spaceName || 'スペース名' }}</h1>
              <p v-if="spaceDescription" class="space-description">{{ spaceDescription }}</p>
            </v-col>
            <!-- 進捗情報を一時的にコメントアウト -->
            <!--
            <v-col cols="12" sm="12" md="4" lg="4" class="text-md-right text-center">
              <div class="progress-info">
                <div class="progress-circle">
                  <v-progress-circular
                    :model-value="progressPercentage"
                    :size="$vuetify.display.xs ? 50 : $vuetify.display.sm ? 55 : 60"
                    :width="$vuetify.display.xs ? 5 : 6"
                    color="success"
                    class="progress-indicator"
                  >
                    {{ progressPercentage }}%
                  </v-progress-circular>
                </div>
                <div class="progress-text">
                  <span class="progress-label">完了率</span>
                  <span class="progress-value">{{ completedGoals }}/{{ totalGoals }}</span>
                </div>
              </div>
            </v-col>
            -->
          </v-row>
        </v-container>
      </template>
    </v-app-bar>

    <!-- メインコンテンツ -->
    <v-main class="main-content">
      <v-container class="content-container" fluid>
        <!-- ローディング状態 -->
        <div v-if="loading" class="loading-section">
          <v-row justify="center">
            <v-col cols="12" class="text-center">
              <v-progress-circular
                indeterminate
                color="primary"
                :size="$vuetify.display.xs ? 48 : 64"
              />
              <p class="mt-4">データを読み込み中...</p>
            </v-col>
          </v-row>
        </div>

        <!-- エラー状態 -->
        <div v-else-if="error" class="error-section">
          <v-row justify="center">
            <v-col cols="12" sm="10" md="8" class="text-center">
              <v-alert
                type="error"
                variant="tonal"
                class="mb-4"
              >
                {{ error }}
              </v-alert>
              <div class="d-flex flex-column flex-sm-row justify-center gap-2">
                <v-btn
                  color="primary"
                  @click="fetchGoals"
                >
                  再試行
                </v-btn>
                <v-btn
                  variant="outlined"
                  @click="fetchSpaceInfo"
                >
                  スペース情報を再取得
                </v-btn>
              </div>
            </v-col>
          </v-row>
        </div>

        <!-- 通常のコンテンツ -->
        <div v-else>
          <!-- フィルタ・ソート -->
          <div class="filters-section">
          <v-row align="center">
            <v-col cols="12" lg="8">
              <div class="filter-controls">
                <v-select
                  v-model="filters.assignee"
                  :items="assigneeOptions"
                  label="担当者で絞り込み"
                  variant="outlined"
                  density="compact"
                  class="filter-select assignee-filter"
                  clearable
                  prepend-icon="mdi-account"
                />
                <v-select
                  v-model="filters.status"
                  :items="statusOptions"
                  label="状態で絞り込み"
                  variant="outlined"
                  density="compact"
                  class="filter-select status-filter"
                  prepend-icon="mdi-check-circle"
                />
              </div>
            </v-col>
            <v-col cols="12" lg="4" class="text-lg-right text-center">
              <v-btn-toggle
                v-model="sortOrder"
                color="primary"
                class="sort-toggle"
                density="compact"
              >
                <v-btn value="createdAt" size="small">
                  <v-icon class="mr-1">mdi-clock-outline</v-icon>
                  <span class="d-none d-sm-inline">作成順</span>
                  <span class="d-inline d-sm-none">作成順</span>
                </v-btn>
                <v-btn value="dueDate" size="small">
                  <v-icon class="mr-1">mdi-calendar-outline</v-icon>
                  <span class="d-none d-sm-inline">期限順</span>
                  <span class="d-inline d-sm-none">期限順</span>
                </v-btn>
                <v-btn value="title" size="small">
                  <v-icon class="mr-1">mdi-text</v-icon>
                  <span class="d-none d-sm-inline">名前順</span>
                  <span class="d-inline d-sm-none">名前順</span>
                </v-btn>
              </v-btn-toggle>
            </v-col>
          </v-row>
        </div>



        <!-- 目標リスト -->
        <div class="goals-section">
          <!-- 目標が0件で追加フォームも表示されていない場合 -->
          <div v-if="filteredGoals.length === 0 && !isAddingGoal" class="empty-state">
            <v-icon size="80" color="grey" class="empty-icon">mdi-clipboard-text</v-icon>
            <h3 class="empty-title">まだ目標がありません</h3>
            <p class="empty-message">
              最初の目標を追加して、グループの活動を始めましょう
            </p>
            <v-btn
              color="primary"
              size="large"
              @click="startAddingGoal"
              class="mt-4"
            >
              <v-icon class="mr-2">mdi-plus</v-icon>
              TODO を追加
            </v-btn>
          </div>

          <!-- 目標がある場合または新規追加フォーム表示中の場合 -->
          <div v-else-if="filteredGoals.length > 0 || isAddingGoal" class="goals-list">
            <!-- TODO追加ボタン（目標がある場合） -->
            <v-card v-if="!isAddingGoal && filteredGoals.length > 0" class="goal-card add-goal-button-card" elevation="1">
              <v-card-text class="goal-content pa-3">
                <div class="add-goal-button-content">
                  <v-btn
                    color="primary"
                    size="large"
                    variant="outlined"
                    @click="startAddingGoal"
                    class="add-goal-btn"
                  >
                    <v-icon class="mr-2">mdi-plus</v-icon>
                    TODO を追加
                  </v-btn>
                </div>
              </v-card-text>
            </v-card>

            <!-- 新規作成フォーム -->
            <v-card v-if="isAddingGoal" class="goal-card new-goal-card" elevation="1">
              <v-card-text class="goal-content pa-3">
                <div class="goal-header">
                  <div class="goal-info">
                    <div class="goal-title-input mb-3">
                      <v-text-field
                        v-model="newGoal.title"
                        placeholder="新しい目標のタイトルを入力..."
                        variant="plain"
                        density="compact"
                        class="title-input"
                        hide-details
                      />
                    </div>
                    <v-row class="goal-meta">
                      <v-col cols="12" sm="6" class="goal-assignee-input">
                        <v-select
                          v-model="newGoal.assignee"
                          :items="assigneeOptions"
                          label="担当者を選択"
                          variant="outlined"
                          density="compact"
                          class="assignee-input"
                          hide-details
                        />
                      </v-col>
                      <v-col cols="12" sm="6" class="goal-due-date-input">
                        <v-text-field
                          v-model="newGoal.dueDate"
                          type="date"
                          label="期限日"
                          variant="outlined"
                          density="compact"
                          class="due-date-input"
                          hide-details
                        />
                      </v-col>
                    </v-row>
                    <div class="goal-description-input mt-3">
                      <v-textarea
                        v-model="newGoal.description"
                        placeholder="詳細説明を入力... (任意)"
                        variant="outlined"
                        density="compact"
                        :rows="2"
                        auto-grow
                        class="description-input"
                        hide-details
                      />
                    </div>
                  </div>
                  <div class="goal-actions mt-3">
                    <div class="d-flex flex-column flex-sm-row justify-end gap-2">
                      <v-btn
                        variant="outlined"
                        size="small"
                        @click="cancelAddingGoal"
                        class="cancel-button order-sm-1"
                      >
                        キャンセル
                      </v-btn>
                      <v-btn
                        color="primary"
                        size="small"
                        @click="addGoal"
                        :disabled="!newGoal.title.trim() || !newGoal.assignee?.trim() || !newGoal.dueDate"
                        class="save-button order-sm-2"
                      >
                        保存
                      </v-btn>
                    </div>
                  </div>
                </div>
              </v-card-text>
            </v-card>

            <!-- 既存の目標カード -->
            <v-card
              v-for="goal in filteredGoals"
              :key="goal.id"
              class="goal-card"
              :class="{ 'goal-completed': goal.isCompleted }"
              elevation="1"
            >
              <v-card-text class="goal-content pa-3">
                <div class="goal-header">
                  <div class="goal-title-row">
                    <div class="goal-checkbox">
                      <v-checkbox
                        :model-value="goal.isCompleted"
                        :color="goal.isCompleted ? 'success' : 'primary'"
                        @update:model-value="toggleGoalStatus(goal)"
                      />
                    </div>
                    <h3 class="goal-title" :class="{ 'completed': goal.isCompleted }">
                      {{ goal.title }}
                    </h3>
                    <div class="goal-actions">
                      <!-- コメント・ハートアイコンは一旦コメントアウト
                      <v-btn
                        icon="mdi-comment-outline"
                        variant="text"
                        size="small"
                        @click="showComments(goal)"
                        class="action-button"
                      />
                      <v-btn
                        icon="mdi-heart-outline"
                        variant="text"
                        size="small"
                        @click="toggleReaction(goal, 'heart')"
                        :class="{ 'reaction-active': hasReaction(goal, 'heart') }"
                        class="action-button"
                      />
                      -->
                    </div>
                  </div>
                  <div class="goal-info">
                    <div class="goal-meta">
                      <span v-if="goal.assignee" class="goal-assignee">
                        <v-icon size="16" class="mr-1">mdi-account</v-icon>
                        {{ goal.assignee }}
                      </span>
                      <span v-if="goal.dueDate" class="goal-due-date">
                        <v-icon size="16" class="mr-1">mdi-calendar</v-icon>
                        {{ formatDate(goal.dueDate) }}
                      </span>
                    </div>
                    <p v-if="goal.description" class="goal-description">
                      {{ goal.description }}
                    </p>
                  </div>
                </div>

                <!-- コメント・リアクションセクション（一旦コメントアウト）
                <div v-if="goal.showDetails" class="goal-details">
                  <div class="comments-section">
                    <h4 class="comments-title">コメント</h4>
                    <div class="comments-list">
                      <div
                        v-for="comment in goal.comments"
                        :key="comment.id"
                        class="comment-item"
                      >
                        <span class="comment-author">{{ comment.author }}</span>
                        <span class="comment-content">{{ comment.content }}</span>
                        <span class="comment-time">{{ formatTime(comment.createdAt) }}</span>
                      </div>
                    </div>
                    <div class="comment-input">
                      <v-text-field
                        v-model="goal.newComment"
                        placeholder="コメントを入力..."
                        variant="outlined"
                        density="compact"
                        @keyup.enter="addComment(goal)"
                      >
                        <template v-slot:append>
                          <v-btn
                            icon="mdi-send"
                            variant="text"
                            size="small"
                            @click="addComment(goal)"
                            :disabled="!goal.newComment?.trim()"
                          />
                        </template>
                      </v-text-field>
                    </div>
                  </div>
                </div>
                -->
              </v-card-text>
            </v-card>
          </div>
        </div>
        </div> <!-- 通常のコンテンツの終了 -->
      </v-container>
    </v-main>



    <!-- フッター -->
    <v-footer class="footer" color="dark">
      <v-container fluid>
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
import { useGoalDisplay } from './index'

const {
  // 状態
  isAddingGoal,
  sortOrder,
  filters,
  newGoal,
  spaceName,
  spaceDescription,
  loading,
  error,
  
  // 計算プロパティ
  assigneeOptions,
  statusOptions,
  filteredGoals,
  
  // メソッド
  toggleGoalStatus,
  addGoal,
  formatDate,
  startAddingGoal,
  cancelAddingGoal,
  
  // 再取得メソッド
  fetchGoals,
  fetchSpaceInfo
} = useGoalDisplay()
</script>

<style src="./goal-display.scss" lang="scss"></style>
