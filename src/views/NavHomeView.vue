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
    <aside class="sidebar">
      <div class="logo-section">
        <img src="/logo.png" alt="logo" class="logo" />
        <h1 class="site-title">{{ title || '我的后花园' }}</h1>
        <button
          class="collapse-btn"
          @click="sidebarCollapsed = !sidebarCollapsed"
          :title="sidebarCollapsed ? '展开侧边栏' : '收起侧边栏'"
        >
          {{ sidebarCollapsed ? '»' : '«' }}
        </button>
      </div>

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

    <main class="main-content">
      <header class="search-header">
        <div class="search-container">
          <div class="search-engine-selector">
            <img :src="searchEngines[selectedEngine].icon" :alt="selectedEngine" class="engine-logo" />
            <select v-model="selectedEngine" class="engine-select">
              <option value="google">Google</option>
              <option value="baidu">Baidu</option>
              <option value="bing">Bing</option>
              <option value="duckduckgo">DuckDuckGo</option>
            </select>
          </div>
          <input
            type="text"
            v-model="searchQuery"
            :placeholder="searchEngines[selectedEngine].placeholder"
            class="search-input"
            @keyup.enter="handleSearch"
          />
        </div>

        <button class="theme-toggle-btn" @click="themeStore.toggleTheme" :title="themeStore.isDarkMode ? '切换到日间模式' : '切换到夜间模式'">
          <svg v-if="!themeStore.isDarkMode" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 18C8.68629 18 6 15.3137 6 12C6 8.68629 8.68629 6 12 6C15.3137 6 18 8.68629 18 12C18 15.3137 15.3137 18 12 18ZM12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16ZM11 1H13V4H11V1ZM11 20H13V23H11V20ZM3.51472 4.92893L4.92893 3.51472L7.05025 5.63604L5.63604 7.05025L3.51472 4.92893ZM16.9497 18.364L18.364 16.9497L20.4853 19.0711L19.0711 20.4853L16.9497 18.364ZM19.0711 3.51472L20.4853 4.92893L18.364 7.05025L16.9497 5.63604L19.0711 3.51472ZM5.63604 16.9497L7.05025 18.364L4.92893 20.4853L3.51472 19.0711L5.63604 16.9497ZM23 11V13H20V11H23ZM4 11V13H1V11H4Z"/>
          </svg>
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 7C10 10.866 13.134 14 17 14C18.9584 14 20.729 13.1957 21.9995 11.8995C22 11.933 22 11.9665 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C12.0335 2 12.067 2 12.1005 2.00049C10.8043 3.27098 10 5.04157 10 7ZM4 12C4 16.4183 7.58172 20 12 20C15.0583 20 17.7158 18.2839 19.062 15.7621C18.3945 15.9187 17.7035 16 17 16C12.0294 16 8 11.9706 8 7C8 6.29648 8.08133 5.60547 8.2379 4.938C5.71611 6.28423 4 8.9417 4 12Z"/>
          </svg>
        </button>

        <button class="mobile-menu-btn" @click="toggleMobileMenu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>

        <div class="mobile-menu" :class="{ active: showMobileMenu }">
          <div class="mobile-menu-header">
            <div class="header-left">
              <h3>分类导航</h3>
              <span class="header-home-icon" @click="openHome">🏡</span>
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
        </div>

        <div class="mobile-menu-overlay" :class="{ active: showMobileMenu }" @click="closeMobileMenu"></div>
      </header>

      <div class="content-area">
        <div v-if="loading" class="loading">
          <div class="loading-spinner"></div>
          <p>加载中...</p>
        </div>

        <div v-else-if="error" class="error">
          <p>{{ error }}</p>
          <button @click="fetchCategories" class="retry-btn">重试</button>
        </div>

        <div v-else class="categories-container">
          <section
            v-for="category in categories"
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
                    @error="handleImageError($event, site.name)" 
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
        </div>
      </div>

      <footer v-if="icpNumber" class="icp-footer">
        <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">
          {{ icpNumber }}
        </a>
      </footer>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
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

// 锁定功能（未配置 VITE_OPEN_LOCK 时自动跳过）
const isLocked = ref(false)
const isUnlocked = ref(false)
const unlockPassword = ref('')
const unlocking = ref(false)
const unlockError = ref('')

const searchEngines = {
  google: { url: 'https://www.google.com/search?q=', icon: googleLogo, placeholder: 'Google (点logo切换搜索引擎' },
  baidu: { url: 'https://www.baidu.com/s?wd=', icon: baiduLogo, placeholder: '百度一下(点logo切换搜索引擎' },
  bing: { url: 'https://www.bing.com/search?q=', icon: bingLogo, placeholder: 'Bing (点logo切换搜索引擎)' },
  duckduckgo: { url: 'https://duckduckgo.com/?q=', icon: duckLogo, placeholder: 'DuckDuckGo (点logo切换搜索引擎)' }
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

// 图标加载失败 → 显示站点名首字 + 彩色背景
const handleImageError = (event, name) => {
  const parent = event.target.parentElement
  // 避免重复添加
  if (parent.querySelector('.site-emoji')) {
    event.target.style.display = 'none'
    return
  }
  event.target.style.display = 'none'

  const first = (name || '?').charAt(0)
  const colors = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#34495e', '#16a085', '#c0392b']
  let hash = 0
  for (let i = 0; i < (name || '').length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const color = colors[Math.abs(hash) % colors.length]

  const span = document.createElement('span')
  span.className = 'site-emoji site-emoji-letter'
  span.textContent = first
  span.style.backgroundColor = color
  span.style.color = '#fff'
  span.style.width = '100%'
  span.style.height = '100%'
  span.style.display = 'flex'
  span.style.alignItems = 'center'
  span.style.justifyContent = 'center'
  span.style.fontSize = '22px'
  span.style.fontWeight = 'bold'
  span.style.borderRadius = '8px'
  parent.appendChild(span)
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

const openHome = () => {
  window.open('https://itboy.top', '_blank')
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

/* 左侧边栏底部：个人主页 */
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
.search-engine-selector {
  position: relative; display: flex; align-items: center;
  background: #f8f9fa; border-right: 1px solid #e9ecef; transition: background-color 0.2s ease;
}
.search-engine-selector:hover { background: #e9ecef; }
.engine-logo { width: 24px; height: 24px; margin: 8px; object-fit: contain; pointer-events: none; border-radius: 4px; }
.engine-select { position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; border: none; outline: none; background: transparent; }
.search-input { flex: 1; border: none; padding: 12px 16px; font-size: 16px; outline: none; background: white; }
.search-input::placeholder { color: #95a5a6; }

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
.header-home-icon {
  font-size: 22px;
  cursor: pointer;
  transition: transform 0.3s ease;
  display: inline-block;
}
.header-home-icon:hover { transform: scale(1.2); }
.close-btn {
  background: none; border: none; color: white; font-size: 24px;
  cursor: pointer; padding: 0; width: 30px; height: 30px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 4px; transition: background-color 0.2s ease;
}
.close-btn:hover { background: rgba(255, 255, 255, 0.1); }
.mobile-category-list { list-style: none; padding: 0; margin: 0; flex: 1; overflow-y: auto; padding-bottom: 160px; }
.mobile-category-item {
  display: flex; align-items: center; padding: 16px 20px;
  cursor: pointer; transition: background-color 0.2s ease; border-bottom: 1px solid #f8f9fa;
}
.mobile-category-item:hover { background: #f8f9fa; }
.mobile-category-item .category-icon { font-size: 20px; margin-right: 12px; width: 24px; text-align: center; }
.mobile-category-item .category-name { font-size: 16px; font-weight: 500; color: #2c3e50; }

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
.site-info { flex: 1; min-width: 0; overflow: hidden; position: relative; z-index: 1; }
.site-name { font-size: 18px; font-weight: 600; margin: 0 0 5px 0; color: #2c3e50; }
.site-description {
  font-size: 14px; color: #7f8c8d; margin: 0; line-height: 1.4;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

/* emoji 图标样式 */
.site-emoji {
  font-size: 28px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}
.site-emoji-letter {
  border-radius: 8px;
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
  .sites-grid { grid-template-columns: 1fr 1fr; gap: 12px; }
  .site-card { padding: 12px; flex-direction: column; text-align: center; }
  .site-card .site-icon { margin-right: 0; margin-bottom: 8px; }
  .site-card .site-name { font-size: 15px; }
  .site-card .site-description { font-size: 12px; }
  .category-title { font-size: 24px; margin-bottom: 20px; }
  .category-title .category-icon { font-size: 28px; margin-right: 12px; }
  .category-title .category-name { font-size: 22px; }
  .icp-footer { padding: 8px 15px; font-size: 12px; }
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
.dark .search-engine-selector { background: #374151; border-right: 1px solid #4b5563; }
.dark .search-engine-selector:hover { background: #4b5563; }
.dark .search-input { background: #374151; color: #e2e8f0; border: none; }
.dark .search-input::placeholder { color: #9ca3af; }
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
.dark .mobile-menu { background: #1e293b; box-shadow: -2px 0 10px rgba(0, 0, 0, 0.3); }
.dark .mobile-category-item { border-bottom: 1px solid #374151; }
.dark .mobile-category-item:hover { background: #374151; }
.dark .mobile-category-item .category-name { color: #e2e8f0; }
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
