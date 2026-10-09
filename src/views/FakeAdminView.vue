<template>
  <div class="fake-admin-container">
    <div class="login-box">
      <h2>🔐 系统管理后台</h2>
      <p class="subtitle">请登录以继续</p>
      
      <form @submit.prevent="handleFakeLogin">
        <div class="input-group">
          <label>管理员账号</label>
          <input type="text" v-model="username" placeholder="请输入账号" required />
        </div>
        <div class="input-group">
          <label>登录密码</label>
          <input type="password" v-model="password" placeholder="请输入密码" required />
        </div>
        <button type="submit" :disabled="loading">
          {{ loading ? '正在验证...' : '登录' }}
        </button>
      </form>

      <div v-if="errorMsg" class="error">{{ errorMsg }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const username = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

const handleFakeLogin = () => {
  loading.value = true
  errorMsg.value = ''
  
  // 假装在连接服务器，延迟 2 秒
  setTimeout(() => {
    loading.value = false
    errorMsg.value = '账号或密码错误，请重试'  // 无论输什么都报错
    // 这里绝对不要写任何 fetch 请求，不要暴露你的真实后端接口
  }, 2000)
}
</script>

<style scoped>
.fake-admin-container { display: flex; justify-content: center; align-items: center; height: 100vh; background: #f0f2f5; }
.login-box { background: #fff; padding: 40px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); width: 100%; max-width: 360px; }
h2 { text-align: center; color: #333; margin-bottom: 5px; }
.subtitle { text-align: center; color: #999; font-size: 14px; margin-bottom: 30px; }
.input-group { margin-bottom: 20px; }
.input-group label { display: block; margin-bottom: 6px; color: #555; font-size: 14px; }
.input-group input { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; box-sizing: border-box; }
button { width: 100%; padding: 12px; background: #1890ff; color: #fff; border: none; border-radius: 6px; font-size: 16px; cursor: pointer; }
button:disabled { background: #a0cfff; }
.error { margin-top: 15px; color: #ff4d4f; text-align: center; font-size: 14px; }
</style>
