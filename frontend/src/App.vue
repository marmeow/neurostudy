<script setup>
import { ref, computed, watch } from 'vue'
import WelcomeScreen from './components/WelcomeScreen.vue'
import AccessibilityForm from './components/AccessibilityForm.vue'
import Questionnaire from './components/Questionnaire.vue'
import ProfileResult from './components/ProfileResult.vue'
import Chat from './components/Chat.vue'

// App state
const currentView = ref('welcome') // 'welcome', 'accessibility', 'questionnaire', 'result'
const profileResult = ref(null)
const isLoading = ref(false)
const error = ref(null)
const showChat = ref(false)

// Accessibility state
const accessibilitySettings = ref({})
const activeAdaptations = ref([])

// API base URL
const API_URL = 'http://localhost:3000/api'

// Computed CSS classes for accessibility
const accessibilityClasses = computed(() => {
  const classes = []
  for (const adaptation of activeAdaptations.value) {
    if (adaptation.cssClass) {
      classes.push(adaptation.cssClass)
    }
  }
  return classes.join(' ')
})

// Navigation handlers
const startAssessment = () => {
  currentView.value = 'accessibility'
}

const handleAccessibilityComplete = (data) => {
  accessibilitySettings.value = data.answers || {}
  activeAdaptations.value = data.adaptations || []
  currentView.value = 'questionnaire'
}

const handleAccessibilitySkip = () => {
  currentView.value = 'questionnaire'
}

const handleQuestionnaireComplete = async (answers) => {
  isLoading.value = true
  error.value = null
  
  try {
    const response = await fetch(`${API_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ answers })
    })
    
    const data = await response.json()
    
    if (data.success) {
      profileResult.value = data.data
      currentView.value = 'result'
    } else {
      error.value = data.error || 'Error al analitzar les respostes'
    }
  } catch (err) {
    console.error('Error:', err)
    error.value = 'Error de connexió amb el servidor'
  } finally {
    isLoading.value = false
  }
}

const restartAssessment = () => {
  profileResult.value = null
  showChat.value = false
  currentView.value = 'welcome'
}

const openChat = () => {
  showChat.value = true
}

const closeChat = () => {
  showChat.value = false
}

// Text-to-Speech functionality
const speakText = (text) => {
  if ('speechSynthesis' in window && accessibilitySettings.value.textToSpeech) {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'ca-ES' // Catalan
    window.speechSynthesis.speak(utterance)
  }
}
</script>

<template>
  <div class="app" :class="accessibilityClasses">
    <!-- Skip to content link for accessibility -->

    <!-- Background decorations -->
    <div class="bg-decoration" aria-hidden="true">
      <div class="bg-circle bg-circle-1"></div>
      <div class="bg-circle bg-circle-2"></div>
      <div class="bg-circle bg-circle-3"></div>
    </div>
    
    <!-- Header -->
    <header class="header">
      <div class="container">
        <div class="header-content">
          <div class="logo" @click="restartAssessment" role="button" tabindex="0" @keydown.enter="restartAssessment">
            <span class="logo-icon" aria-hidden="true">🧠</span>
            <span class="logo-text">NeuroStudy<span class="logo-ai">AI</span></span>
          </div>
          
          <!-- Accessibility Quick Toggle -->
          <div class="header-actions">
            <button 
              v-if="activeAdaptations.length > 0"
              class="accessibility-indicator"
              title="Accessibilitat activa"
            >
              ♿ {{ activeAdaptations.length }}
            </button>
            <p class="tagline">Tecnologia amb empatia</p>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="main-content" id="main-content">
      <div class="container container-sm">
        <!-- Loading State -->
        <div v-if="isLoading" class="loading-state" role="status" aria-live="polite">
          <div class="loading-spinner" aria-hidden="true"></div>
          <p>Analitzant el teu perfil d'aprenentatge...</p>
          <p class="loading-subtext">La nostra IA està processant les teves respostes</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-state card" role="alert">
          <span class="error-icon" aria-hidden="true">⚠️</span>
          <h3>S'ha produït un error</h3>
          <p>{{ error }}</p>
          <button class="btn btn-primary mt-lg" @click="error = null; currentView = 'questionnaire'">
            Tornar a intentar
          </button>
        </div>

        <!-- Dynamic Views -->
        <Transition name="fade" mode="out-in">
          <WelcomeScreen 
            v-if="currentView === 'welcome' && !isLoading && !error" 
            :key="'welcome'"
            @start="startAssessment" 
          />
          
          <AccessibilityForm
            v-else-if="currentView === 'accessibility' && !isLoading && !error"
            :key="'accessibility'"
            @complete="handleAccessibilityComplete"
            @skip="handleAccessibilitySkip"
          />
          
          <Questionnaire 
            v-else-if="currentView === 'questionnaire' && !isLoading && !error" 
            :key="'questionnaire'"
            @complete="handleQuestionnaireComplete"
            @back="currentView = 'accessibility'"
          />
          
          <div 
            v-else-if="currentView === 'result' && !isLoading && !error"
            :key="'result'"
            class="result-container"
          >
            <ProfileResult 
              :result="profileResult"
              @restart="restartAssessment"
            />
            
            <!-- Chat Button -->
            <div class="chat-button-container" v-if="!showChat">
              <button class="chat-fab" @click="openChat" aria-label="Obrir xat amb IA">
                <span class="chat-fab-icon">💬</span>
                <span class="chat-fab-text">Xat amb IA</span>
              </button>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Chat Panel -->
      <Transition name="slide-up">
        <div v-if="showChat && profileResult" class="chat-panel">
          <Chat
            :profileId="profileResult.primaryProfile"
            :profileDetails="profileResult.primaryProfileDetails"
            :accessibilitySettings="accessibilitySettings"
            @close="closeChat"
          />
        </div>
      </Transition>
    </main>

    <!-- Footer -->
    <footer class="footer">
      <div class="container">
        <p>© 2024 NeuroStudy AI - Tecnologia amb empatia</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow-x: hidden;
}

/* Background Decorations */
.bg-decoration {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.bg-circle {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.3;
}

.bg-circle-1 {
  width: 600px;
  height: 600px;
  background: var(--primary-500);
  top: -200px;
  right: -200px;
  animation: float 8s ease-in-out infinite;
}

.bg-circle-2 {
  width: 400px;
  height: 400px;
  background: var(--accent-purple);
  bottom: -100px;
  left: -100px;
  animation: float 10s ease-in-out infinite reverse;
}

.bg-circle-3 {
  width: 300px;
  height: 300px;
  background: var(--accent-teal);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: pulse 5s ease-in-out infinite;
}

/* Header */
.header {
  position: relative;
  z-index: 10;
  padding: var(--space-lg) 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.accessibility-indicator {
  padding: var(--space-xs) var(--space-md);
  background: rgba(139, 92, 246, 0.2);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: var(--radius-full);
  color: var(--accent-purple);
  font-size: 0.75rem;
  cursor: pointer;
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  cursor: pointer;
  transition: transform var(--transition-fast);
}

.logo:hover {
  transform: scale(1.02);
}

.logo-icon {
  font-size: 2rem;
}

.logo-text {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
}

.logo-ai {
  background: linear-gradient(135deg, var(--primary-400), var(--accent-purple));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.tagline {
  font-size: 0.875rem;
  color: var(--gray-400);
  font-style: italic;
}

/* Main Content */
.main-content {
  flex: 1;
  position: relative;
  z-index: 10;
  padding: var(--space-2xl) 0;
  display: flex;
  align-items: center;
}

.result-container {
  width: 100%;
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: var(--space-3xl);
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid var(--gray-700);
  border-top-color: var(--primary-500);
  border-radius: 50%;
  margin: 0 auto var(--space-xl);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p {
  font-size: 1.25rem;
  color: white;
  margin-bottom: var(--space-sm);
}

.loading-subtext {
  font-size: 0.875rem !important;
  color: var(--gray-400) !important;
}

/* Error State */
.error-state {
  text-align: center;
  padding: var(--space-2xl);
}

.error-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: var(--space-lg);
}

/* Chat FAB */
.chat-button-container {
  position: fixed;
  bottom: var(--space-2xl);
  right: var(--space-2xl);
  z-index: 100;
}

.chat-fab {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md) var(--space-xl);
  background: linear-gradient(135deg, var(--primary-500), var(--accent-purple));
  border: none;
  border-radius: var(--radius-full);
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(139, 92, 246, 0.4);
  transition: all var(--transition-normal);
}

.chat-fab:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 30px rgba(139, 92, 246, 0.5);
}

.chat-fab-icon {
  font-size: 1.25rem;
}

/* Chat Panel */
.chat-panel {
  position: fixed;
  bottom: var(--space-lg);
  right: var(--space-lg);
  width: 400px;
  height: 600px;
  z-index: 200;
}

/* Footer */
.footer {
  position: relative;
  z-index: 10;
  padding: var(--space-lg) 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  text-align: center;
}

.footer p {
  font-size: 0.875rem;
  color: var(--gray-500);
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.4s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(100%);
}

/* Responsive */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: var(--space-sm);
    text-align: center;
  }
  
  .header-actions {
    flex-direction: column;
  }
  
  .tagline {
    display: none;
  }

  .chat-panel {
    width: calc(100% - var(--space-lg) * 2);
    height: 70vh;
    bottom: 0;
    right: 0;
    left: 0;
    margin: 0 auto;
  }

  .chat-button-container {
    bottom: var(--space-lg);
    right: var(--space-lg);
  }

  .chat-fab-text {
    display: none;
  }

  .chat-fab {
    padding: var(--space-md);
    border-radius: 50%;
    width: 60px;
    height: 60px;
    justify-content: center;
  }

  .chat-fab-icon {
    font-size: 1.5rem;
  }
}
</style>
