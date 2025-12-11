<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  result: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['restart'])

// Profile color mapping for the new profiles
const profileColors = {
  'visualis': { primary: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)' },
  'narra': { primary: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)' },
  'logika': { primary: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' },
  'prax': { primary: '#f97316', bg: 'rgba(249, 115, 22, 0.15)' },
  'kreo': { primary: '#ec4899', bg: 'rgba(236, 72, 153, 0.15)' }
}

// Computed
const primaryProfile = computed(() => props.result.primaryProfileDetails)
const secondaryProfile = computed(() => props.result.secondaryProfileDetails)
const analysis = computed(() => props.result.analysis)
const confidence = computed(() => props.result.confidence)
const isHybrid = computed(() => props.result.isHybrid)
const strengths = computed(() => props.result.strengths || primaryProfile.value?.characteristics?.slice(0, 3) || [])
const recommendations = computed(() => props.result.recommendations || primaryProfile.value?.contentRecommendations?.slice(0, 3) || [])
const studyTips = computed(() => props.result.studyTips || primaryProfile.value?.learningStrategies?.slice(0, 3) || [])

const primaryColor = computed(() => {
  return profileColors[primaryProfile.value?.id]?.primary || '#0088ff'
})

const primaryBg = computed(() => {
  return profileColors[primaryProfile.value?.id]?.bg || 'rgba(0, 136, 255, 0.15)'
})

// Active tab for details
const activeTab = ref('overview')
const tabs = [
  { id: 'overview', label: 'Resum', icon: '📋' },
  { id: 'strengths', label: 'Fortaleses', icon: '💪' },
  { id: 'recommendations', label: 'Recomanacions', icon: '🎯' },
  { id: 'tips', label: 'Consells', icon: '💡' }
]
</script>

<template>
  <div class="profile-result animate-slide-up">
    <!-- Success Header -->
    <div class="result-header">
      <div class="success-icon">🎉</div>
      <h1>El teu Perfil d'Aprenentatge!</h1>
      <p class="result-subtitle">Basat en les teves respostes, hem identificat el teu estil d'aprenentatge únic</p>
    </div>

    <!-- Hybrid Badge -->
    <div v-if="isHybrid" class="hybrid-badge">
      <span>🔀</span>
      <span>Perfil Híbrid: Tens característiques de múltiples perfils</span>
    </div>

    <!-- Main Profile Card -->
    <div 
      class="primary-profile-card card-glass"
      :style="{ '--profile-color': primaryColor, '--profile-bg': primaryBg }"
    >
      <div class="profile-badge">
        <span class="profile-emoji">{{ primaryProfile?.emoji }}</span>
      </div>
      
      <h2 class="profile-name">{{ primaryProfile?.name }}</h2>
      <p class="profile-short">{{ primaryProfile?.shortDescription }}</p>
      <p class="profile-description">{{ primaryProfile?.description }}</p>
      
      <div class="confidence-meter">
        <div class="confidence-label">
          <span>Nivell de confiança</span>
          <span class="confidence-value">{{ Math.round(confidence) }}%</span>
        </div>
        <div class="confidence-bar">
          <div 
            class="confidence-fill" 
            :style="{ width: `${confidence}%`, background: primaryColor }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Secondary Profile -->
    <div class="secondary-profile" v-if="secondaryProfile">
      <p class="secondary-label">El teu perfil secundari:</p>
      <div class="secondary-badge" :style="{ borderColor: profileColors[secondaryProfile.id]?.primary }">
        <span>{{ secondaryProfile.emoji }}</span>
        <span>{{ secondaryProfile.name }} ({{ secondaryProfile.shortDescription }})</span>
      </div>
    </div>

    <!-- AI Analysis -->
    <div class="analysis-card card" v-if="analysis">
      <div class="analysis-header">
        <span class="ai-badge">🤖 Anàlisi</span>
      </div>
      <p class="analysis-text">{{ analysis }}</p>
    </div>

    <!-- Tabs Navigation -->
    <div class="tabs-nav">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="tab-btn"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        <span class="tab-label">{{ tab.label }}</span>
      </button>
    </div>

    <!-- Tab Content -->
    <div class="tab-content card">
      <!-- Overview Tab -->
      <div v-if="activeTab === 'overview'" class="tab-panel">
        <h3>Característiques del teu perfil</h3>
        <ul class="characteristics-list">
          <li v-for="(char, index) in primaryProfile?.characteristics" :key="index">
            <span class="check-icon" :style="{ color: primaryColor }">✓</span>
            {{ char }}
          </li>
        </ul>

        <h3 class="mt-xl">Contingut recomanat</h3>
        <div class="content-tags">
          <span 
            v-for="(content, index) in primaryProfile?.contentRecommendations" 
            :key="index"
            class="content-tag"
          >
            {{ content }}
          </span>
        </div>
      </div>

      <!-- Strengths Tab -->
      <div v-if="activeTab === 'strengths'" class="tab-panel">
        <h3>Les teves fortaleses d'aprenentatge</h3>
        <div class="strengths-grid" v-if="strengths.length">
          <div v-for="(strength, index) in strengths" :key="index" class="strength-card">
            <span class="strength-number" :style="{ background: primaryColor }">{{ index + 1 }}</span>
            <p>{{ strength }}</p>
          </div>
        </div>
        <p v-else class="empty-message">
          Les fortaleses específiques es generaran amb l'API d'IA.
        </p>
      </div>

      <!-- Recommendations Tab -->
      <div v-if="activeTab === 'recommendations'" class="tab-panel">
        <h3>Recomanacions personalitzades</h3>
        <div class="recommendations-list" v-if="recommendations.length">
          <div v-for="(rec, index) in recommendations" :key="index" class="recommendation-item">
            <span class="rec-icon">🎯</span>
            <p>{{ rec }}</p>
          </div>
        </div>
        <p v-else class="empty-message">
          Les recomanacions personalitzades es generaran amb l'API d'IA.
        </p>
      </div>

      <!-- Study Tips Tab -->
      <div v-if="activeTab === 'tips'" class="tab-panel">
        <h3>Consells d'estudi</h3>
        <div class="tips-list" v-if="studyTips.length">
          <div v-for="(tip, index) in studyTips" :key="index" class="tip-item">
            <span class="tip-icon">💡</span>
            <p>{{ tip }}</p>
          </div>
        </div>
        <div v-else class="default-tips">
          <div class="tip-item">
            <span class="tip-icon">💡</span>
            <p v-if="primaryProfile?.id === 'visualis'">
              Usa mapes mentals i diagrames per organitzar la informació
            </p>
            <p v-else-if="primaryProfile?.id === 'narra'">
              Connecta els conceptes nous amb experiències i històries reals
            </p>
            <p v-else-if="primaryProfile?.id === 'logika'">
              Crea llistes i taules comparatives per estructurar la informació
            </p>
            <p v-else-if="primaryProfile?.id === 'prax'">
              Divideix l'estudi en sessions curtes amb pràctica activa
            </p>
            <p v-else>
              Explora connexions entre temes diferents per inspirar-te
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="result-actions">
      <button class="btn btn-primary btn-lg" @click="emit('restart')">
        <span>Fer una altra avaluació</span>
      </button>
    </div>

    <!-- Share Section -->
    <div class="share-section">
      <p>Comparteix el teu resultat</p>
      <div class="share-badges">
        <span class="share-badge" :style="{ borderColor: primaryColor, color: primaryColor }">
          {{ primaryProfile?.emoji }} {{ primaryProfile?.name }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-result {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

/* Header */
.result-header {
  text-align: center;
  margin-bottom: var(--space-xl);
}

.success-icon {
  font-size: 4rem;
  margin-bottom: var(--space-lg);
  animation: float 2s ease-in-out infinite;
}

.result-header h1 {
  font-size: 2.5rem;
  margin-bottom: var(--space-md);
}

.result-subtitle {
  font-size: 1.125rem;
  color: var(--gray-400);
}

/* Hybrid Badge */
.hybrid-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-lg);
  background: rgba(139, 92, 246, 0.15);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: var(--radius-full);
  margin-bottom: var(--space-xl);
  font-size: 0.875rem;
  color: var(--accent-purple);
}

/* Primary Profile Card */
.primary-profile-card {
  text-align: center;
  padding: var(--space-2xl);
  margin-bottom: var(--space-xl);
  border: 2px solid var(--profile-color);
  background: var(--profile-bg) !important;
}

.profile-badge {
  width: 100px;
  height: 100px;
  margin: 0 auto var(--space-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--profile-bg);
  border: 3px solid var(--profile-color);
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

.profile-emoji {
  font-size: 3rem;
}

.profile-name {
  font-size: 2rem;
  margin-bottom: var(--space-xs);
  color: var(--profile-color);
}

.profile-short {
  font-size: 1rem;
  color: var(--gray-400);
  margin-bottom: var(--space-md);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.profile-description {
  font-size: 1.125rem;
  color: var(--gray-300);
  max-width: 500px;
  margin: 0 auto var(--space-xl);
}

/* Confidence Meter */
.confidence-meter {
  max-width: 300px;
  margin: 0 auto;
}

.confidence-label {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: var(--gray-400);
  margin-bottom: var(--space-sm);
}

.confidence-value {
  font-weight: 600;
  color: var(--profile-color);
}

.confidence-bar {
  height: 8px;
  background: var(--gray-700);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.confidence-fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width 1s ease-out;
}

/* Secondary Profile */
.secondary-profile {
  text-align: center;
  margin-bottom: var(--space-xl);
}

.secondary-label {
  font-size: 0.875rem;
  color: var(--gray-500);
  margin-bottom: var(--space-sm);
}

.secondary-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-lg);
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid;
  border-radius: var(--radius-full);
  font-size: 0.9rem;
  color: var(--gray-300);
}

/* Analysis Card */
.analysis-card {
  margin-bottom: var(--space-xl);
}

.analysis-header {
  margin-bottom: var(--space-md);
}

.ai-badge {
  display: inline-block;
  padding: var(--space-xs) var(--space-md);
  background: linear-gradient(135deg, var(--primary-500), var(--accent-purple));
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
}

.analysis-text {
  font-size: 1rem;
  line-height: 1.7;
  color: var(--gray-300);
}

/* Tabs */
.tabs-nav {
  display: flex;
  gap: var(--space-sm);
  margin-bottom: var(--space-lg);
  overflow-x: auto;
  padding-bottom: var(--space-sm);
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-lg);
  background: transparent;
  border: 1px solid var(--gray-700);
  border-radius: var(--radius-full);
  color: var(--gray-400);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.tab-btn:hover {
  border-color: var(--gray-500);
  color: white;
}

.tab-btn.active {
  background: var(--primary-500);
  border-color: var(--primary-500);
  color: white;
}

.tab-icon {
  font-size: 1rem;
}

/* Tab Content */
.tab-content {
  margin-bottom: var(--space-xl);
}

.tab-panel h3 {
  font-size: 1.125rem;
  margin-bottom: var(--space-lg);
  color: white;
}

/* Characteristics List */
.characteristics-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.characteristics-list li {
  display: flex;
  align-items: flex-start;
  gap: var(--space-md);
  color: var(--gray-300);
}

.check-icon {
  font-weight: bold;
  flex-shrink: 0;
}

/* Content Tags */
.content-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.content-tag {
  padding: var(--space-sm) var(--space-md);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  font-size: 0.875rem;
  color: var(--gray-300);
}

/* Strengths Grid */
.strengths-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-md);
}

.strength-card {
  display: flex;
  align-items: flex-start;
  gap: var(--space-md);
  padding: var(--space-lg);
  background: rgba(255, 255, 255, 0.03);
  border-radius: var(--radius-lg);
}

.strength-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
  flex-shrink: 0;
}

.strength-card p {
  color: var(--gray-300);
  font-size: 0.9rem;
}

/* Recommendations & Tips */
.recommendations-list,
.tips-list,
.default-tips {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.recommendation-item,
.tip-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-md);
  padding: var(--space-lg);
  background: rgba(255, 255, 255, 0.03);
  border-radius: var(--radius-lg);
}

.rec-icon,
.tip-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.recommendation-item p,
.tip-item p {
  color: var(--gray-300);
  font-size: 0.9rem;
  line-height: 1.6;
}

.empty-message {
  color: var(--gray-500);
  font-style: italic;
  text-align: center;
  padding: var(--space-xl);
}

/* Actions */
.result-actions {
  display: flex;
  justify-content: center;
  margin-bottom: var(--space-xl);
}

/* Share Section */
.share-section {
  text-align: center;
  padding-top: var(--space-xl);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.share-section p {
  font-size: 0.875rem;
  color: var(--gray-500);
  margin-bottom: var(--space-md);
}

.share-badges {
  display: flex;
  justify-content: center;
  gap: var(--space-md);
}

.share-badge {
  padding: var(--space-sm) var(--space-lg);
  border: 2px solid;
  border-radius: var(--radius-full);
  font-size: 0.9rem;
  font-weight: 600;
}

/* Animations */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* Responsive */
@media (max-width: 768px) {
  .result-header h1 {
    font-size: 1.75rem;
  }

  .profile-badge {
    width: 80px;
    height: 80px;
  }

  .profile-emoji {
    font-size: 2.5rem;
  }

  .profile-name {
    font-size: 1.5rem;
  }

  .tabs-nav {
    justify-content: flex-start;
  }

  .tab-label {
    display: none;
  }

  .tab-btn {
    padding: var(--space-sm) var(--space-md);
  }
}
</style>
