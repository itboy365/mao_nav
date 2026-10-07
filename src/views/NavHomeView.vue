<template>
  <!-- 锁定界面（未配置 VITE_OPEN_LOCK 时不会显示） -->
  <div v-if="isLocked && !isUnlocked" class="lock-container">
    <div class="lock-box">
      <h1>🔐 访问验证</h1>
      <p class="lock-description">此导航站已启用访问保护</p>
      <form @submit.prevent="handleUnlock">
        <div class="form-group">
          <label for="unlock-password">请输入访问密钥:</label>
          <input
            id="unlock-password"
            type="password"
            v-model="unlockPassword"
            placeholder="请输入访问密钥"
            required
            class="form-input"
          />
        </div>
        <button type="submit" class="unlock-btn" :disabled="unlocking">
          {{ unlocking ? '验证中...' : '进入导航' }}
        </button>
      </form>
      <div v-if="unlockError" class="error-message">
        {{ unlockError }}
      </div>
    </div>
  </div>

  <!-- 正常导航界面 -->
  <div v-else class="nav-home" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
    <!-- 左侧边栏（桌面端） -->
    <aside class="sidebar">
      <!-- Logo区域 -->
      <div class="logo-section">
        <img src="/logo.png" alt="logo" class="logo" />
        <h1 class="site-title">{{ title || '便民导航' }}</h1>
        <button
          class="collapse-btn"
          @click="sidebarCollapsed = !sidebarCollapsed"
          :title="sidebarCollapsed ? '展开侧边栏' : '收起侧边栏'"
        >
          {{ sidebarCollapsed ? '»' : '«' }}
        </button>
      </div>

      <!-- 分类导航 -->
      <nav class="category-nav">
        <h2 class="nav-title">分类导航</h2>
        <ul class="category-list">
          <li
            v-for="category in categories"
            :key="category.id"
            class="category-item"
            @click="scrollToCategory(category.id)"
          >
            <span class="category-icon">{{ category.icon }}</span>
            <span class="category-name">{{ category.name }}</span>
          </li>
        </ul>
      </nav>

      <!-- 桌面端底部：个人主页入口 -->
      <div class="sidebar-footer">
        <a
          href="https://itboy.top"
          target="_blank"
          rel="noopener noreferrer"
          class="github-link"
          title="访问我的个人主页"
        >
          <span class="home-text">我的后花园</span>
          <span class="home-icon">🏡</span>
        </a>
      </div>
    </aside>

    <!-- 右侧主内容区 -->
    <main class="main-content">
      <!-- 顶部搜索栏 -->
      <header class="search-header">
        <div class="search-container">
          <!-- PC端：站内/站外切换按钮 -->
          <div class="search-mode-tabs">
            <button
              class="search-mode-btn"
              :class="{ active: searchMode === 'inside' }"
              @click="switchMode('inside')"
            >站内</button>
            <button
              class="search-mode-btn"
              :class="{ active: searchMode === 'outside' }"
              @click="switchMode('outside')"
            >站外</button>
          </div>

          <div class="search-engine-selector">
            <img :src="searchEngines[selectedEngine].icon" :alt="selectedEngine" class="engine-logo" />
            <select v-model="selectedEngine" class="engine-select">
              <option value="bing">Bing</option>
              <option value="baidu">百度</option>
              <option value="duckduckgo">DuckDuckGo</option>
              <option value="google">Google</option>
            </select>
          </div>
          <input
            type="text"
            v-model="searchQuery"
            :placeholder="currentPlaceholder"
            class="search-input"
            @keyup.enter="handleSearch"
          />
          <button v-if="searchQuery" class="clear-btn" @click="clearSearch" title="清空">×</button>
        </div>

        <!-- 主题切换按钮 -->
        <button class="theme-toggle-btn" @click="themeStore.toggleTheme" :title="themeStore.isDarkMode ? '切换到日间模式' : '切换到夜间模式'">
          <svg v-if="!themeStore.isDarkMode" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 18C8.68629 18 6 15.3137 6 12C6 8.68629 8.68629 6 12 6C15.3137 6 18 8.68629 18 12C18 15.3137 15.3137 18 12 18ZM12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16ZM11 1H13V4H11V1ZM11 20H13V23H11V20ZM3.51472 4.92893L4.92893 3.51472L7.05025 5.63604L5.63604 7.05025L3.51472 4.92893ZM16.9497 18.364L18.364 16.9497L20.4853 19.0711L19.0711 20.4853L16.9497 18.364ZM19.0711 3.51472L20.4853 4.92893L18.364 7.05025L16.9497 5.63604L19.0711 3.51472ZM5.63604 16.9497L7.05025 18.364L4.92893 20.4853L3.51472 19.0711L5.63604 16.9497ZM23 11V13H20V11H23ZM4 11V13H1V11H4Z"/>
          </svg>
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 7C10 10.866 13.134 14 17 14C18.9584 14 20.729 13.1957 21.9995 11.8995C22 11.933 22 11.9665 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C12.0335 2 12.067 2 12.1005 2.00049C10.8043 3.27098 10 5.04157 10 7ZM4 12C4 16.4183 7.58172 20 12 20C15.0583 20 17.7158 18.2839 19.062 15.7621C18.3945 15.9187 17.7035 16 17 16C12.0294 16 8 11.9706 8 7C8 6.29648 8.08133 5.60547 8.2379 4.938C5.71611 6.28423 4 8.9417 4 12Z"/>
          </svg>
        </button>

        <!-- 移动端菜单按钮 -->
        <button class="mobile-menu-btn" @click="toggleMobileMenu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>

        <!-- 移动端分类菜单 -->
        <div class="mobile-menu" :class="{ active: showMobileMenu }">
          <div class="mobile-menu-header">
            <div class="header-left">
              <h3>分类导航</h3>
            </div>
            <button class="close-btn" @click="closeMobileMenu">×</button>
          </div>
          <ul class="mobile-category-list">
            <li
              v-for="category in categories"
              :key="category.id"
              class="mobile-category-item"
              @click="scrollToCategoryMobile(category.id)"
            >
              <span class="category-icon">{{ category.icon }}</span>
              <span class="category-name">{{ category.name }}</span>
            </li>
          </ul>

          <!-- 移动端底部：个人主页入口 -->
          <div class="mobile-footer">
            <a href="https://itboy.top" target="_blank" rel="noopener noreferrer" class="mobile-home-link">
              <span>我的后花园</span>
              <span class="home-icon">🏡</span>
            </a>
          </div>
        </div>

        <!-- 移动端菜单遮罩 -->
        <div class="mobile-menu-overlay" :class="{ active: showMobileMenu }" @click="closeMobileMenu"></div>
      </header>

      <!-- 导航内容区 -->
      <div class="content-area">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading">
          <div class="loading-spinner"></div>
          <p>加载中...</p>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="error" class="error">
          <p>{{ error }}</p>
          <button @click="fetchCategories" class="retry-btn">重试</button>
        </div>

        <!-- 分类内容 -->
        <div v-else class="categories-container">
          <!-- 无结果提示 -->
          <div v-if="searchQuery && searchMode === 'inside' && filteredCategories.length === 0" class="no-result">
            <div class="no-result-icon">🔍</div>
            <p class="no-result-text">没有找到「{{ searchQuery }}」相关的站点</p>
            <p class="no-result-tip">试试搜索「医保」「社保」「12306」「公积金」</p>
          </div>

          <!-- 有结果时显示 -->
          <template v-else>
            <div v-if="searchQuery && searchMode === 'inside'" class="search-result-count">
              找到 {{ filteredCategories.reduce((sum, c) => sum + c.sites.length, 0) }} 个相关站点
            </div>

            <section
              v-for="category in filteredCategories"
              :key="category.id"
              class="category-section"
              :id="`category-${category.id}`"
            >
              <h2 class="category-title">
                <span class="category-icon">{{ category.icon }}</span>
                <span class="category-name">{{ category.name }}</span>
              </h2>

              <div class="sites-grid">
                <a
                  v-for="site in category.sites"
                  :key="site.id"
                  :href="site.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="site-card"
                >
                  <div class="site-icon">
                    <img
                      v-if="site.icon && (site.icon.startsWith('http') || site.icon.startsWith('/'))"
                      :src="site.icon"
                      :alt="site.name"
                      @error="handleImageError"
                    />
                    <span v-else class="site-emoji">{{ site.icon }}</span>
                  </div>
                  <div class="site-info">
                    <h3 class="site-name">{{ site.name }}</h3>
                    <p class="site-description">{{ site.description }}</p>
                  </div>
                </a>
              </div>
            </section>
          </template>
        </div>
      </div>

      <!-- 备案号 -->
      <footer v-if="icpNumber" class="icp-footer">
        <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">
          {{ icpNumber }}
        </a>
      </footer>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useNavigation } from '@/apis/useNavigation.js'
import { useThemeStore } from '@/stores/counter.js'
import googleLogo from '@/assets/goolge.png'
import baiduLogo from '@/assets/baidu.png'
import bingLogo from '@/assets/bing.png'
import duckLogo from '@/assets/duck.png'

const { categories, title, icpNumber, defaultSearchEngine, loading, error, fetchCategories } = useNavigation()
const themeStore = useThemeStore()

const searchQuery = ref('')
const selectedEngine = ref('bing')
const showMobileMenu = ref(false)

// 侧边栏收起状态
const sidebarCollapsed = ref(false)

// 搜索模式：'inside' 站内筛选 | 'outside' 站外搜索
const searchMode = ref('inside')

// 锁定功能
const isLocked = ref(false)
const isUnlocked = ref(false)
const unlockPassword = ref('')
const unlocking = ref(false)
const unlockError = ref('')

const searchEngines = {
  bing: { url: 'https://www.bing.com/search?q=', icon: bingLogo, name: 'Bing' },
  baidu: { url: 'https://www.baidu.com/s?wd=', icon: baiduLogo, name: '百度' },
  duckduckgo: { url: 'https://duckduckgo.com/?q=', icon: duckLogo, name: 'DuckDuckGo' },
  google: { url: 'https://www.google.com/search?q=', icon: googleLogo, name: 'Google' }
}

// 动态 placeholder：跟随搜索模式
const currentPlaceholder = computed(() => {
  if (searchMode.value === 'inside') {
    return '搜索本站站点...'
  }
  return `在 ${searchEngines[selectedEngine.value].name} 搜索内容`
})

// 站内搜索：只在"站内"模式下筛选
const filteredCategories = computed(() => {
  if (searchMode.value !== 'inside') return categories.value
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return categories.value

  return categories.value
    .map(cat => {
      const matchedSites = cat.sites.filter(site =>
        site.name.toLowerCase().includes(q) ||
        (site.description && site.description.toLowerCase().includes(q)) ||
        (site.url && site.url.toLowerCase().includes(q))
      )
      return { ...cat, sites: matchedSites }
    })
    .filter(cat => cat.sites.length > 0)
})

// 切换搜索模式
const switchMode = (mode) => {
  if (searchMode.value === mode) return
  searchMode.value = mode
  // 切换模式时清空输入，避免混淆
  searchQuery.value = ''
}

const smoothScrollTo = (container, targetTop, duration = 600) => {
  const startTop = container.scrollTop
  const distance = targetTop - startTop
  let startTime = null
  const animateScroll = (currentTime) => {
    if (startTime === null) startTime = currentTime
    const timeElapsed = currentTime - startTime
    const progress = Math.min(timeElapsed / duration, 1)
    const ease = progress < 0.5
      ? 4 * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 3) / 2
    container.scrollTop = startTop + distance * ease
    if (progress < 1) requestAnimationFrame(animateScroll)
  }
  requestAnimationFrame(animateScroll)
}

const scrollToCategory = (categoryId) => {
  const element = document.getElementById(`category-${categoryId}`)
  const container = document.querySelector('.content-area')
  if (element && container) {
    const isMobile = window.innerWidth <= 768
    let targetTop = 0
    if (isMobile) {
      targetTop = element.offsetTop - 80
    } else {
      const searchHeader = document.querySelector('.search-header')
      const searchHeaderHeight = searchHeader ? searchHeader.offsetHeight + 20 : 100
      targetTop = element.offsetTop - searchHeaderHeight
    }
    smoothScrollTo(container, Math.max(0, targetTop), 600)
  }
}

const checkLockStatus = () => {
  const openLock = import.meta.env.VITE_OPEN_LOCK
  if (openLock && openLock.trim() !== '') {
    isLocked.value = true
    const savedUnlock = localStorage.getItem('nav_unlocked')
    if (savedUnlock === 'true') isUnlocked.value = true
  } else {
    isLocked.value = false
    isUnlocked.value = true
  }
}

const handleUnlock = async () => {
  unlocking.value = true
  unlockError.value = ''
  try {
    const response = await fetch('/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: unlockPassword.value }),
    })
    const result = await response.json()
    if (!result.success) throw new Error(result.error || '访问密钥错误，请重新输入')
    isUnlocked.value = true
    localStorage.setItem('nav_unlocked', 'true')
    unlockPassword.value = ''
  } catch (err) {
    unlockError.value = err.message
  } finally {
    unlocking.value = false
  }
}

const handleSearch = () => {
  if (!searchQuery.value.trim()) return
  const engine = searchEngines[selectedEngine.value]
  window.open(engine.url + encodeURIComponent(searchQuery.value), '_blank')
}

// 清空搜索框
const clearSearch = () => {
  searchQuery.value = ''
}

const handleImageError = (event) => {
  event.target.src = '/favicon.ico'
  event.target.onerror = null
}

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
  document.body.style.overflow = showMobileMenu.value ? 'hidden' : ''
}

const closeMobileMenu = () => {
  showMobileMenu.value = false
  document.body.style.overflow = ''
}

const scrollToCategoryMobile = (categoryId) => {
  closeMobileMenu()
  setTimeout(() => scrollToCategory(categoryId), 200)
}

onMounted(async () => {
  checkLockStatus()
  await fetchCategories()
  selectedEngine.value = defaultSearchEngine.value
})

onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>

<style scoped>
/* 锁定界面样式 */
.lock-container {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100vh;
  display: flex; align-items: center; justify-content: center;
  background: #2c3e50; padding: 20px; z-index: 9999;
}
.lock-box {
  background: white; padding: 40px; border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  width: 100%; max-width: 400px; text-align: center;
}
.lock-box h1 { color: #2d3748; margin-bottom: 8px; font-size: 28px; font-weight: 600; }
.lock-description { color: #718096; margin-bottom: 30px; font-size: 16px; }
.lock-box .form-group { margin-bottom: 20px; text-align: left; }
.lock-box .form-group label { display: block; margin-bottom: 8px; color: #4a5568; font-weight: 500; font-size: 14px; }
.lock-box .form-input {
  width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0;
  border-radius: 8px; font-size: 16px; transition: all 0.3s ease; background: #fff;
}
.lock-box .form-input:focus { outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1); }
.unlock-btn {
  width: 100%; padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white; border: none; border-radius: 8px;
  font-size: 16px; font-weight: 600; cursor: pointer;
  transition: all 0.3s ease; margin-top: 10px;
}
.unlock-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3); }
.unlock-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
.lock-box .error-message {
  margin-top: 15px; padding: 12px; background: #fed7d7;
  color: #c53030; border-radius: 8px; font-size: 14px; border: 1px solid #feb2b2;
}

.nav-home { display: flex; min-height: 100vh; background-color: #f5f7fa; }

/* 左侧边栏 */
.sidebar {
  width: 280px;
  background-color: #2c3e50;
  color: white;
  padding: 0;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  height: 100vh;
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
}

.logo-section {
  display: flex;
  align-items: center;
  padding-left: 20px;
  padding-right: 10px;
  padding-top: 13px;
  padding-bottom: 13px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo { width: 55px; height: 55px; border-radius: 12px; margin-right: 15px; }
.site-title { font-size: 24px; font-weight: 600; margin: 0; color: white; flex: 1; white-space: nowrap; overflow: hidden; }

/* 收起按钮 */
.collapse-btn {
  background: none;
  border: none;
  color: #bdc3c7;
  font-size: 22px;
  cursor: pointer;
  padding: 4px 10px;
  border-radius: 6px;
  transition: all 0.2s ease;
  flex-shrink: 0;
}
.collapse-btn:hover { background: rgba(255, 255, 255, 0.1); color: white; }

.category-nav { padding: 20px 0; flex: 1; overflow-y: auto; }
.nav-title {
  font-size: 16px; font-weight: 600; margin: 0 20px 15px;
  color: #bdc3c7; text-transform: uppercase; letter-spacing: 1px;
}
.category-list { list-style: none; padding: 0; margin: 0; }
.category-item {
  display: flex; align-items: center;
  padding: 12px 20px; cursor: pointer;
  transition: all 0.3s ease; position: relative;
}
.category-item:hover { background-color: rgba(255, 255, 255, 0.1); box-shadow: inset 4px 0 0 #3498db; }
.category-icon { font-size: 18px; margin-right: 12px; width: 20px; text-align: center; }
.category-name { font-size: 15px; font-weight: 500; white-space: nowrap; }

/* 桌面端底部：个人主页 */
.sidebar-footer {
  padding: 16px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.github-link {
  display: flex;
  align-items: center;
  color: #bdc3c7;
  text-decoration: none;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.3s ease;
  font-size: 14px;
  white-space: nowrap;
}

.github-link:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  transform: translateY(-1px);
}

.github-link .home-text {
  white-space: nowrap;
}

.github-link .home-icon {
  margin-left: 6px;
  font-size: 20px;
  line-height: 1;
  display: inline-block;
  transition: transform 0.3s ease;
}

.github-link:hover .home-icon {
  transform: scale(1.15);
}

/* 收起状态 */
.sidebar-collapsed .sidebar { width: 60px; }
.sidebar-collapsed .logo,
.sidebar-collapsed .site-title,
.sidebar-collapsed .nav-title,
.sidebar-collapsed .category-name {
  display: none;
}
.sidebar-collapsed .logo-section { justify-content: center; padding-left: 0; padding-right: 0; }
.sidebar-collapsed .collapse-btn { margin: 0; padding: 8px; }
.sidebar-collapsed .category-item { justify-content: center; padding: 14px 0; }
.sidebar-collapsed .category-icon { margin-right: 0; font-size: 20px; }
.sidebar-collapsed .sidebar-footer { padding: 12px 0; display: flex; justify-content: center; }
.sidebar-collapsed .github-link { justify-content: center; padding: 8px; }
.sidebar-collapsed .github-link .home-text { display: none; }
.sidebar-collapsed .github-link .home-icon { margin-left: 0; font-size: 22px; }

/* 右侧主内容区 */
.main-content { flex: 1; display: flex; flex-direction: column; height: 100vh; overflow: hidden; }
.search-header {
  background: white; padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  position: sticky; top: 0; z-index: 100;
  display: flex; align-items: center; gap: 15px;
}
.search-container {
  display: flex; max-width: 600px; margin: 0 auto; gap: 0;
  border-radius: 8px; overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); flex: 1;
}
@media (max-width: 768px) { .search-container { margin: 0; max-width: none; } }

/* 站内/站外切换按钮（仅PC端显示） */
.search-mode-tabs {
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border-right: 1px solid #e9ecef;
  padding: 0 4px;
  gap: 2px;
  flex-shrink: 0;
}
.search-mode-btn {
  background: none;
  border: none;
  padding: 6px 10px;
  font-size: 13px;
  color: #7f8c8d;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
  white-space: nowrap;
  font-family: inherit;
}
.search-mode-btn.active {
  background: white;
  color: #2c3e50;
  font-weight: 500;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}
.search-mode-btn:hover:not(.active) {
  color: #2c3e50;
}

.search-engine-selector {
  position: relative; display: flex; align-items: center;
  background: #f8f9fa; border-right: 1px solid #e9ecef; transition: background-color 0.2s ease;
}
.search-engine-selector:hover { background: #e9ecef; }
.engine-logo { width: 24px; height: 24px; margin: 8px; object-fit: contain; pointer-events: none; border-radius: 4px; }
.engine-select { position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; border: none; outline: none; background: transparent; }
.search-input { flex: 1; border: none; padding: 12px 16px; font-size: 16px; outline: none; background: white; min-width: 0; }
.search-input::placeholder { color: #95a5a6; }

/* 清空按钮 */
.clear-btn {
  background: none;
  border: none;
  padding: 0 16px;
  font-size: 20px;
  color: #95a5a6;
  cursor: pointer;
  line-height: 1;
  transition: color 0.2s ease;
  flex-shrink: 0;
}
.clear-btn:hover { color: #2c3e50; }

/* 无结果提示 */
.no-result {
  text-align: center;
  padding: 60px 20px;
  color: #7f8c8d;
}
.no-result-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}
.no-result-text {
  font-size: 18px;
  font-weight: 500;
  margin: 0 0 12px 0;
  color: #2c3e50;
}
.no-result-tip {
  font-size: 14px;
  color: #95a5a6;
  margin: 0;
}

/* 搜索结果统计 */
.search-result-count {
  font-size: 14px;
  color: #7f8c8d;
  margin-bottom: 20px;
  padding: 10px 16px;
  background: #f0f4f8;
  border-radius: 8px;
  display: inline-block;
}

.mobile-menu-btn {
  display: none; background: none; border: none;
  color: #2c3e50; cursor: pointer; padding: 8px; border-radius: 4px; transition: background-color 0.2s ease;
}
.mobile-menu-btn:hover { background: #f8f9fa; }

/* 移动端菜单 */
.mobile-menu {
  position: fixed; top: 0; right: -100%; width: 240px; height: 100vh;
  background: white; box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  z-index: 1001; transition: right 0.3s ease; overflow-y: auto; overflow-x: hidden;
  display: flex; flex-direction: column;
}
.mobile-menu.active { right: 0; }
.mobile-menu-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 20px; border-bottom: 1px solid #e9ecef; background: #2c3e50;
  color: white; flex-shrink: 0;
}
.header-left { display: flex; align-items: center; gap: 12px; }
.mobile-menu-header h3 { margin: 0; font-size: 18px; font-weight: 600; }
.close-btn {
  background: none; border: none; color: white; font-size: 24px;
  cursor: pointer; padding: 0; width: 30px; height: 30px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 4px; transition: background-color 0.2s ease;
}
.close-btn:hover { background: rgba(255, 255, 255, 0.1); }
.mobile-category-list { list-style: none; padding: 0; margin: 0; flex: 1; overflow-y: auto; padding-bottom: 20px; }
.mobile-category-item {
  display: flex; align-items: center; padding: 16px 20px;
  cursor: pointer; transition: background-color 0.2s ease; border-bottom: 1px solid #f8f9fa;
}
.mobile-category-item:hover { background: #f8f9fa; }
.mobile-category-item .category-icon { font-size: 20px; margin-right: 12px; width: 24px; text-align: center; }
.mobile-category-item .category-name { font-size: 16px; font-weight: 500; color: #2c3e50; }

/* 移动端底部：个人主页入口 */
.mobile-footer {
  flex-shrink: 0;
  padding: 16px 20px 20px;
  border-top: 1px solid #e9ecef;
  margin-top: 10px;
  background: #fafbfc;
}

.mobile-home-link {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2c3e50;
  text-decoration: none;
  padding: 14px 16px;
  border-radius: 10px;
  background: linear-gradient(135deg, #f0f4f8 0%, #e8eef5 100%);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  font-size: 15px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.mobile-home-link:hover {
  background: linear-gradient(135deg, #e8eef5 0%, #dce5ee 100%);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.mobile-home-link .home-icon {
  margin-left: 8px;
  font-size: 20px;
  line-height: 1;
}

.mobile-menu-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.5); z-index: 999;
  opacity: 0; visibility: hidden; transition: opacity 0.3s ease, visibility 0.3s ease;
}
.mobile-menu-overlay.active { opacity: 1; visibility: visible; }

/* 内容区域 */
.content-area { flex: 1; padding: 30px; padding-bottom: 400px; overflow-y: auto; }
.loading, .error { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 200px; color: #7f8c8d; }
.loading-spinner {
  width: 40px; height: 40px; border: 4px solid #ecf0f1;
  border-top: 4px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite;
}
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
.retry-btn { margin-top: 10px; padding: 8px 16px; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer; }
.categories-container { max-width: 1200px; margin: 0 auto; }
.category-section { margin-bottom: 50px; }
.category-title {
  font-size: 32px; font-weight: 600; margin-bottom: 25px; color: #2c3e50;
  display: flex; align-items: center;
}
.category-title .category-icon { font-size: 32px; margin-right: 16px; }
.category-title .category-name { margin-left: 10px; font-size: 26px; }
.sites-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
.site-card {
  display: flex; align-items: center; background: white; border-radius: 12px;
  padding: 20px; text-decoration: none; color: inherit;
  transition: all 0.3s ease; border: 1px solid #e9ecef;
  position: relative; overflow: hidden;
}
.site-card::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(135deg, rgba(52, 152, 219, 0.1), rgba(155, 89, 182, 0.1));
  opacity: 0; transition: opacity 0.3s ease;
}
.site-card:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15); }
.site-card:hover::before { opacity: 1; }
.site-icon {
  width: 48px; height: 48px; min-width: 48px; flex-shrink: 0; margin-right: 16px;
  border-radius: 8px; overflow: hidden; background: #f8f9fa;
  display: flex; align-items: center; justify-content: center;
  position: relative; z-index: 1;
}
.site-icon img { width: 32px; height: 32px; object-fit: contain; }
.site-emoji {
  font-size: 28px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.site-info { flex: 1; min-width: 0; overflow: hidden; position: relative; z-index: 1; }
.site-name { font-size: 18px; font-weight: 600; margin: 0 0 5px 0; color: #2c3e50; }
.site-description {
  font-size: 14px; color: #7f8c8d; margin: 0; line-height: 1.4;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

/* 备案信息 */
.icp-footer {
  flex-shrink: 0; padding: 10px 20px; text-align: center;
  background: white; border-top: 1px solid #e9ecef; font-size: 13px;
}
.icp-footer a { color: #7f8c8d; text-decoration: none; transition: color 0.2s ease; }
.icp-footer a:hover { color: #3498db; }

/* 响应式 */
@media (max-width: 768px) {
  .nav-home { flex-direction: column; height: 100vh; height: 100svh; overflow: hidden; }
  .sidebar { display: none; }
  .main-content { flex: 1; height: 100vh; height: 100svh; margin-left: 0; display: flex; flex-direction: column; overflow: hidden; }
  .search-header {
    padding: 15px 20px; position: fixed; top: 0; left: 0; right: 0;
    z-index: 500; background: white; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  .content-area { flex: 1; padding: 20px 15px; padding-top: 100px; padding-bottom: 300px; overflow-y: auto; -webkit-overflow-scrolling: touch; }
  .mobile-menu-btn { display: block; flex-shrink: 0; }

  /* 手机端隐藏"站内/站外"按钮 */
  .search-mode-tabs { display: none; }

  .sites-grid { grid-template-columns: 1fr 1fr; gap: 12px; }
  .site-card { padding: 12px; flex-direction: column; text-align: center; }
  .site-card .site-icon { margin-right: 0; margin-bottom: 8px; }
  .site-card .site-name { font-size: 15px; }
  .site-card .site-description { font-size: 12px; }
  .category-title { font-size: 24px; margin-bottom: 20px; }
  .category-title .category-icon { font-size: 28px; margin-right: 12px; }
  .category-title .category-name { font-size: 22px; }
  .icp-footer { padding: 8px 15px; font-size: 12px; }
  .search-input { font-size: 14px; padding: 10px 12px; }
  .clear-btn { padding: 0 12px; font-size: 18px; }
  .no-result { padding: 40px 15px; }
  .no-result-icon { font-size: 36px; }
  .no-result-text { font-size: 15px; }
  .search-result-count { font-size: 13px; padding: 8px 12px; }
}

/* 主题切换按钮 */
.theme-toggle-btn {
  background: none; border: none; color: #2c3e50; cursor: pointer;
  padding: 8px; border-radius: 6px; transition: all 0.3s ease;
  display: flex; align-items: center; justify-content: center; margin-right: 10px;
}
.theme-toggle-btn:hover { background: #f8f9fa; transform: scale(1.1); }

/* 暗色模式 */
.dark .nav-home { background-color: #1a1a1a; }
.dark .sidebar { background-color: #1e293b; box-shadow: 2px 0 10px rgba(0, 0, 0, 0.3); }
.dark .search-header { background: #1e293b; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3); }
.dark .theme-toggle-btn { color: #e2e8f0; }
.dark .theme-toggle-btn:hover { background: rgba(255, 255, 255, 0.1); }
.dark .mobile-menu-btn { color: #e2e8f0; }
.dark .mobile-menu-btn:hover { background: rgba(255, 255, 255, 0.1); }
.dark .search-container { box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3); }

/* 暗色模式：站内/站外按钮 */
.dark .search-mode-tabs { background: #374151; border-right-color: #4b5563; }
.dark .search-mode-btn { color: #9ca3af; }
.dark .search-mode-btn.active { background: #1e293b; color: #e2e8f0; }
.dark .search-mode-btn:hover:not(.active) { color: #e2e8f0; }

.dark .search-engine-selector { background: #374151; border-right: 1px solid #4b5563; }
.dark .search-engine-selector:hover { background: #4b5563; }
.dark .search-input { background: #374151; color: #e2e8f0; border: none; }
.dark .search-input::placeholder { color: #9ca3af; }
.dark .clear-btn { color: #9ca3af; }
.dark .clear-btn:hover { color: #e2e8f0; }
.dark .engine-select { background: #374151; color: #e2e8f0; }
.dark .engine-select option { background: #374151; color: #e2e8f0; }
.dark .content-area { background: #1a1a1a; }
.dark .site-card { background: #374151; border: 1px solid #4b5563; color: #e2e8f0; }
.dark .site-card:hover { box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4); }
.dark .site-card::before { background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.15)); }
.dark .site-name { color: #e2e8f0; }
.dark .site-description { color: #9ca3af; }
.dark .site-icon { background: #4b5563; }
.dark .category-title { color: #e2e8f0; }
.dark .no-result { color: #9ca3af; }
.dark .no-result-text { color: #e2e8f0; }
.dark .no-result-tip { color: #6b7280; }
.dark .search-result-count { background: #374151; color: #9ca3af; }
.dark .mobile-menu { background: #1e293b; box-shadow: -2px 0 10px rgba(0, 0, 0, 0.3); }
.dark .mobile-category-item { border-bottom: 1px solid #374151; }
.dark .mobile-category-item:hover { background: #374151; }
.dark .mobile-category-item .category-name { color: #e2e8f0; }
.dark .mobile-footer { background: #18202e; border-top-color: #374151; }
.dark .mobile-home-link {
  background: linear-gradient(135deg, #374151 0%, #2d3748 100%);
  color: #e2e8f0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}
.dark .mobile-home-link:hover {
  background: linear-gradient(135deg, #4b5563 0%, #374151 100%);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}
.dark .icp-footer { background: #1e293b; border-top-color: #374151; }
.dark .icp-footer a { color: #9ca3af; }
.dark .icp-footer a:hover { color: #60a5fa; }
.dark .loading, .dark .error { color: #9ca3af; }
.dark .retry-btn { background: #3b82f6; color: white; }
.dark .retry-btn:hover { background: #2563eb; }
.dark .lock-container { background: #0f172a; }
.dark .lock-box { background: #1e293b; color: #e2e8f0; }
.dark .lock-box h1 { color: #e2e8f0; }
.dark .lock-description { color: #94a3b8; }
.dark .lock-box .form-group label { color: #cbd5e1; }
.dark .lock-box .form-input { background: #374151; border: 2px solid #4b5563; color: #e2e8f0; }
.dark .lock-box .form-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
.dark .unlock-btn { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); }
.dark .unlock-btn:hover:not(:disabled) { box-shadow: 0 10px 30px rgba(59, 130, 246, 0.4); }
</style>
