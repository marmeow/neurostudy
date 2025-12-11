<script setup>
import { ref, computed, onMounted } from 'vue'

const emit = defineEmits(['complete', 'skip'])

const API_URL = 'http://localhost:3000/api'

// State
const accessibilityData = ref(null)
const isLoading = ref(true)
const answers = ref({})
const currentCategory = ref(0)

// Load accessibility questions
onMounted(async () => {
  try {
    const response = await fetch(`${API_URL}/accessibility`)
    const data = await response.json()
    
    if (data.success) {
      accessibilityData.value = data.data
    }
  } catch (err) {
    console.error('Error loading accessibility:', err)
  } finally {
    isLoading.value = false
  }
})

// Computed
const categories = computed(() => {
  if (!accessibilityData.value) return []
  return Object.values(accessibilityData.value.categories)
})

const currentCategoryData = computed(() => {
  return categories.value[currentCategory.value]
})

const isLastCategory = computed(() => {
  return currentCategory.value >= categories.value.length - 1
})

const progress = computed(() => {
  if (categories.value.length === 0) return 0
  return ((currentCategory.value + 1) / categories.value.length) * 100
})

// Methods
const toggleAnswer = (questionId) => {
  answers.value[questionId] = !answers.value[questionId]
}

const nextCategory = () => {
  if (isLastCategory.value) {
    submitAnswers()
  } else {
    currentCategory.value++
  }
}

const previousCategory = () => {
  if (currentCategory.value > 0) {
    currentCategory.value--
  }
}

const submitAnswers = async () => {
  try {
    const formattedAnswers = Object.entries(answers.value).map(([questionId, value]) => ({
      questionId,
      value
    }))

    const response = await fetch(`${API_URL}/accessibility/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers: formattedAnswers })
    })

    const data = await response.json()

    if (data.success) {
      emit('complete', {
        answers: answers.value,
        adaptations: data.data.adaptations
      })
    }
  } catch (err) {
    console.error('Error processing accessibility:', err)
    // Continue anyway with the raw answers
    emit('complete', { answers: answers.value, adaptations: [] })
  }
}
</script>

<template>
  <div class="accessibility-form animate-slide-up">
    <!-- Header -->
    <div class="form-header">
      <div class="header-icon">♿</div>
      <h2>Personalitza la teva experiència</h2>
      <p>Marca les opcions que s'apliquin a tu perquè puguem adaptar la plataforma.</p>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Carregant...</p>
    </div>

    <!-- Form Content -->
    <template v-else-if="accessibilityData && currentCategoryData">
      <!-- Progress -->
      <div class="progress-section">
        <div class="progress-info">
          <span>{{ currentCategoryData.icon }} {{ currentCategoryData.name }}</span>
          <span>{{ currentCategory + 1 }} / {{ categories.length }}</span>
        </div>
        <div class="progress-bar">
          <div class="progress-bar-fill" :style="{ width: `${progress}%` }"></div>
        </div>
      </div>

      <!-- Questions -->
      <div class="questions-container card-glass">
        <div 
          v-for="question in currentCategoryData.questions"
          :key="question.id"
          class="question-item"
          :class="{ active: answers[question.id] }"
          @click="toggleAnswer(question.id)"
        >
          <div class="question-checkbox">
            <span v-if="answers[question.id]">✓</span>
          </div>
          <span class="question-text">{{ question.text }}</span>
        </div>
      </div>

      <!-- Navigation -->
      <div class="form-navigation">
        <button 
          v-if="currentCategory > 0"
          class="btn btn-secondary"
          @click="previousCategory"
        >
          ← Anterior
        </button>
        <div v-else></div>

        <button 
          class="btn btn-primary"
          @click="nextCategory"
        >
          {{ isLastCategory ? 'Finalitzar' : 'Següent →' }}
        </button>
      </div>

      <!-- Skip option -->
      <button class="skip-btn" @click="emit('skip')">
        Saltar aquest pas →
      </button>
    </template>
  </div>
</template>

<style scoped>
.accessibility-form {
  max-width: 600px;
  margin: 0 auto;
  padding: var(--space-lg);
}

/* Header */
.form-header {
  text-align: center;
  margin-bottom: var(--space-2xl);
}

.header-icon {
  font-size: 3rem;
  margin-bottom: var(--space-md);
}

.form-header h2 {
  font-size: 1.75rem;
  margin-bottom: var(--space-sm);
}

.form-header p {
  color: var(--gray-400);
}

/* Loading */
.loading-state {
  text-align: center;
  padding: var(--space-3xl);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--gray-700);
  border-top-color: var(--primary-500);
  border-radius: 50%;
  margin: 0 auto var(--space-md);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Progress */
.progress-section {
  margin-bottom: var(--space-xl);
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--space-sm);
  font-size: 0.875rem;
  color: var(--gray-400);
}

/* Questions */
.questions-container {
  padding: var(--space-md);
  margin-bottom: var(--space-xl);
}

.question-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-lg);
  margin-bottom: var(--space-sm);
  background: rgba(255, 255, 255, 0.03);
  border: 2px solid transparent;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.question-item:hover {
  background: rgba(255, 255, 255, 0.06);
}

.question-item.active {
  border-color: var(--primary-500);
  background: rgba(0, 136, 255, 0.1);
}

.question-checkbox {
  width: 28px;
  height: 28px;
  border: 2px solid var(--gray-600);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all var(--transition-fast);
}

.question-item.active .question-checkbox {
  background: var(--primary-500);
  border-color: var(--primary-500);
  color: white;
}

.question-text {
  color: var(--gray-300);
  font-size: 0.95rem;
}

/* Navigation */
.form-navigation {
  display: flex;
  justify-content: space-between;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

/* Skip Button */
.skip-btn {
  display: block;
  width: 100%;
  padding: var(--space-md);
  background: transparent;
  border: none;
  color: var(--gray-500);
  font-size: 0.875rem;
  cursor: pointer;
  transition: color var(--transition-fast);
}

.skip-btn:hover {
  color: var(--gray-300);
}
</style>
