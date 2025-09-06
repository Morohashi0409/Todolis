<template>
  <v-app-bar color="primary" dark elevation="0" class="header">
    <v-container class="header-container">
      <v-row align="center">
        <v-col cols="12" class="text-center">
          <div class="header-content">
            <h1 class="app-title" @click="triggerHeaderAnimation">Taskel</h1>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </v-app-bar>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { gsap } from 'gsap'

// ランダムなヘッダーアニメーション関数
const triggerHeaderAnimation = () => {
  const headerTitle = document.querySelector('.app-title')
  const header = document.querySelector('.header')
  
  if (!headerTitle || !header) return
  
  // アニメーションパターンの配列
  const animations = [
    // パターン1: 爆発効果
    () => {
      const text = headerTitle.textContent!
      headerTitle.innerHTML = text.split('').map(char => `<span class="char">${char}</span>`).join('')
      const chars = document.querySelectorAll('.char')
      
      gsap.timeline()
        .to(chars, {
          scale: 2,
          rotation: () => Math.random() * 360,
          x: () => (Math.random() - 0.5) * 200,
          y: () => (Math.random() - 0.5) * 200,
          opacity: 0.8,
          color: () => `hsl(${Math.random() * 360}, 100%, 60%)`,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.05
        })
        .to(chars, {
          scale: 1,
          rotation: 0,
          x: 0,
          y: 0,
          opacity: 1,
          color: 'white',
          duration: 1,
          ease: "elastic.out(1, 0.3)",
          stagger: 0.05
        })
        .call(() => {
          headerTitle.innerHTML = text
        })
    },
    
    // パターン2: 液体変形効果
    () => {
      gsap.timeline()
        .to(headerTitle, {
          scaleX: 0.3,
          scaleY: 2,
          filter: 'blur(3px)',
          color: '#00ffff',
          duration: 0.4,
          ease: "power2.inOut"
        })
        .to(headerTitle, {
          scaleX: 2,
          scaleY: 0.5,
          rotation: 10,
          color: '#ff00ff',
          duration: 0.3
        })
        .to(headerTitle, {
          scaleX: 1,
          scaleY: 1,
          rotation: 0,
          filter: 'blur(0px)',
          color: 'white',
          duration: 0.5,
          ease: "elastic.out(1, 0.5)"
        })
    },
    
    // パターン3: グリッチ効果
    () => {
      const tl = gsap.timeline()
      
      for (let i = 0; i < 5; i++) {
        tl.to(headerTitle, {
          x: () => (Math.random() - 0.5) * 20,
          y: () => (Math.random() - 0.5) * 10,
          filter: `hue-rotate(${Math.random() * 360}deg) saturate(${2 + Math.random() * 3})`,
          duration: 0.05,
          ease: "none"
        }, i * 0.1)
      }
      
      tl.to(headerTitle, {
        x: 0,
        y: 0,
        filter: 'none',
        duration: 0.3,
        ease: "power2.out"
      })
    },
    
    // パターン4: 万華鏡効果
    () => {
      gsap.timeline()
        .to(headerTitle, {
          rotationX: 180,
          rotationY: 180,
          rotationZ: 180,
          scale: 0.1,
          color: '#ffd700',
          duration: 1,
          ease: "power2.inOut"
        })
        .to(headerTitle, {
          rotationX: 360,
          rotationY: 360,
          rotationZ: 360,
          scale: 1,
          color: 'white',
          duration: 1,
          ease: "power2.out"
        })
    },
    
    // パターン5: 風船効果
    () => {
      gsap.timeline()
        .to(headerTitle, {
          scale: 3,
          rotation: 20,
          color: '#ff69b4',
          textShadow: '0 0 30px #ff69b4',
          filter: 'blur(2px)',
          duration: 0.6,
          ease: "power2.out"
        })
        .to(headerTitle, {
          scale: 0.1,
          rotation: 180,
          opacity: 0.3,
          duration: 0.3
        })
        .to(headerTitle, {
          scale: 1,
          rotation: 0,
          opacity: 1,
          color: 'white',
          textShadow: 'none',
          filter: 'blur(0px)',
          duration: 0.5,
          ease: "bounce.out"
        })
    },
    
    // パターン6: 分裂融合効果
    () => {
      const text = headerTitle.textContent!
      const chars = text.split('')
      headerTitle.innerHTML = chars.map(char => `<span class="split-char" style="display: inline-block;">${char}</span>`).join('')
      const charElements = document.querySelectorAll('.split-char')
      
      gsap.timeline()
        .to(charElements, {
          x: (i: number) => (i % 2 === 0 ? -100 : 100),
          y: (i: number) => Math.sin(i) * 50,
          rotation: (i: number) => i * 60,
          scale: 2,
          color: (i: number) => `hsl(${i * 60}, 100%, 60%)`,
          duration: 0.8,
          ease: "power2.out",
          stagger: 0.1
        })
        .to(charElements, {
          x: 0,
          y: 0,
          rotation: 0,
          scale: 1,
          color: 'white',
          duration: 1,
          ease: "elastic.out(1, 0.3)",
          stagger: 0.05
        })
        .call(() => {
          headerTitle.innerHTML = text
        })
    },
    
    // パターン7: ネオン効果
    () => {
      gsap.timeline()
        .to(headerTitle, {
          textShadow: '0 0 5px #ff6b35, 0 0 10px #ff6b35, 0 0 15px #ff6b35, 0 0 20px #ff6b35',
          color: '#ffffff',
          scale: 1.15,
          duration: 0.5,
          ease: "power2.out"
        })
        .to(headerTitle, {
          textShadow: '0 0 2px #ffab26, 0 0 5px #ffab26, 0 0 8px #ffab26',
          scale: 1,
          duration: 0.5
        })
        .to(headerTitle, {
          textShadow: 'none',
          duration: 0.3
        })
    },
    
    // パターン8: ワープ効果
    () => {
      gsap.timeline()
        .to(headerTitle, {
          scaleX: 10,
          scaleY: 0.1,
          opacity: 0.3,
          filter: 'blur(10px) brightness(2)',
          duration: 0.3,
          ease: "power2.in"
        })
        .to(headerTitle, {
          scaleX: 0.1,
          scaleY: 10,
          rotation: 90,
          duration: 0.2
        })
        .to(headerTitle, {
          scaleX: 1,
          scaleY: 1,
          rotation: 0,
          opacity: 1,
          filter: 'blur(0px) brightness(1)',
          duration: 0.5,
          ease: "elastic.out(1, 0.5)"
        })
    }
  ]
  
  // ランダムにアニメーションを選択
  const randomAnimation = animations[Math.floor(Math.random() * animations.length)]
  randomAnimation()
  
  // ヘッダー全体にも連動した効果を追加
  const headerEffects = [
    () => gsap.to(header, { rotationY: 5, duration: 0.3, yoyo: true, repeat: 1 }),
    () => gsap.to(header, { scale: 1.02, duration: 0.3, yoyo: true, repeat: 1 }),
    () => gsap.to(header, { skewX: 2, duration: 0.3, yoyo: true, repeat: 1 }),
    () => gsap.to(header, { filter: 'hue-rotate(30deg)', duration: 0.5, yoyo: true, repeat: 1 })
  ]
  
  const randomHeaderEffect = headerEffects[Math.floor(Math.random() * headerEffects.length)]
  randomHeaderEffect()
}

// 初期アニメーション
const initHeaderAnimation = () => {
  const headerTitle = document.querySelector('.app-title')
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
}

onMounted(() => {
  // DOMが完全に読み込まれた後にアニメーションを初期化
  setTimeout(() => {
    initHeaderAnimation()
  }, 100)
})
</script>

<style lang="scss" scoped>
@import "@/styles/variables.scss";

// ヘッダーアニメーション用キーフレーム
@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@keyframes headerGlow {
  0% {
    box-shadow: 
      0 8px 32px rgba(0, 0, 0, 0.1),
      0 2px 16px rgba(255, 171, 38, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }
  100% {
    box-shadow: 
      0 8px 32px rgba(0, 0, 0, 0.15),
      0 2px 16px rgba(255, 171, 38, 0.6),
      inset 0 1px 0 rgba(255, 255, 255, 0.4);
  }
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

// ヘッダー
.header {
  // 美しいグラデーション背景
  background: linear-gradient(
    135deg,
    $grace-orange 0%,
    #ff6b35 25%,
    #ff8c42 50%,
    #ffa726 75%,
    $grace-orange 100%
  ) !important;
  background-size: 200% 200%; // アニメーション用に大きくする
  position: fixed !important;
  top: 0;
  z-index: 1000;
  // ガラス効果
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.1),
    0 2px 16px rgba(255, 171, 38, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  
  // グラデーションアニメーション
  animation: gradientShift 8s ease infinite,
             headerGlow 4s ease-in-out infinite alternate;
  
  // ホバー効果
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 
      0 12px 40px rgba(0, 0, 0, 0.15),
      0 4px 20px rgba(255, 171, 38, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }
  
  // オーバーレイ効果
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.1) 50%,
      transparent 100%
    );
    transform: translateX(-100%);
    animation: shimmer 3s ease-in-out infinite;
  }

  .header-container {
    position: relative;
    z-index: 2;
    
    .header-content {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
    }
    
    .app-title {
      font-size: $font-size-xxl;
      font-weight: $font-weight-bold;
      margin: 0;
      color: $text-primary; // colors.scssの白を使用
      text-shadow: 
        0 2px 4px rgba(0, 0, 0, 0.3),
        0 0 20px rgba(255, 255, 255, 0.5);
      // タイトルアニメーション用の初期状態
      opacity: 0;
      transform: translateY(-30px);
      will-change: transform, opacity, scale, rotation, filter;
      perspective: 1000px;
      transform-style: preserve-3d;
      
      // アニメーション用クラス
      :deep(.char), :deep(.split-char), :deep(.dna-char) {
        display: inline-block;
        will-change: transform, color, opacity;
      }
      
      // ホバー効果
      transition: all 0.3s ease;
      cursor: pointer;
      user-select: none; // テキスト選択を無効化
      
      &:hover {
        filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.8));
        transform: scale(1.05); // 軽いホバー効果
      }
      
      &:active {
        transform: scale(0.98); // クリック時のフィードバック
      }
    }
  }
}
</style>
