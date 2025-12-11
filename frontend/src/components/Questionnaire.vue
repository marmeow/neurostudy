<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  // Nothing needed from parent for now
})

const emit = defineEmits(['complete', 'back'])

// API URL
const API_URL = 'http://localhost:3000/api'

// State
const questionnaire = ref(null)
const isLoading = ref(true)
const loadError = ref(null)
const currentSectionIndex = ref(0)
const currentQuestionIndex = ref(0)
const answers = ref([])
const selectedOption = ref(null)

// Load questionnaire from API
onMounted(async () => {
  try {
    const response = await fetch(`${API_URL}/questionnaire`)
    const data = await response.json()
    
    if (data.success) {
      questionnaire.value = data.data
    } else {
      loadError.value = 'Error al carregar el qüestionari'
    }
  } catch (err) {
    console.error('Error loading questionnaire:', err)
    loadError.value = 'Error de connexió amb el servidor'
  } finally {
    isLoading.value = false
  }
})

// Computed
const allQuestions = computed(() => {
  if (!questionnaire.value) return []
  return questionnaire.value.sections.flatMap(s => s.questions)
})

const totalQuestions = computed(() => allQuestions.value.length)

const currentGlobalIndex = computed(() => {
  if (!questionnaire.value) return 0
  let index = 0
  for (let i = 0; i < currentSectionIndex.value; i++) {
    index += questionnaire.value.sections[i].questions.length
  }
  return index + currentQuestionIndex.value
})

const progress = computed(() => {
  if (totalQuestions.value === 0) return 0
  return ((currentGlobalIndex.value + 1) / totalQuestions.value) * 100
})

const currentSection = computed(() => {
  if (!questionnaire.value) return null
  return questionnaire.value.sections[currentSectionIndex.value]
})

const currentQuestion = computed(() => {
  return currentSection.value?.questions[currentQuestionIndex.value]
})

const isFirstQuestion = computed(() => {
  return currentSectionIndex.value === 0 && currentQuestionIndex.value === 0
})

const isLastQuestion = computed(() => {
  return currentGlobalIndex.value === totalQuestions.value - 1
})

// Methods
const selectOption = (option) => {
  selectedOption.value = option
}

const nextQuestion = () => {
  if (!selectedOption.value) return

  // Save answer
  answers.value.push({
    questionId: currentQuestion.value.id,
    optionId: selectedOption.value.id,
    profiles: selectedOption.value.profiles
  })

  selectedOption.value = null

  if (isLastQuestion.value) {
    // Submit all answers
    emit('complete', answers.value)
  } else {
    // Move to next question
    if (currentQuestionIndex.value < currentSection.value.questions.length - 1) {
      currentQuestionIndex.value++
    } else {
      // Move to next section
      currentSectionIndex.value++
      currentQuestionIndex.value = 0
    }
  }
}

const previousQuestion = () => {
  if (isFirstQuestion.value) {
    emit('back')
    return
  }

  // Remove last answer
  answers.value.pop()
  selectedOption.value = null

  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
  } else {
    // Move to previous section
    currentSectionIndex.value--
    currentQuestionIndex.value = questionnaire.value.sections[currentSectionIndex.value].questions.length - 1
  }
}

const getOptionLabel = (index) => {
  return String.fromCharCode(65 + index) // A, B, C, D, E
}
</script>

<template>
  <div class="questionnaire animate-slide-up">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Carregant qüestionari...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="loadError" class="error-state card">
      <span class="error-icon">⚠️</span>
      <h3>Error</h3>
      <p>{{ loadError }}</p>
      <button class="btn btn-primary mt-lg" @click="emit('back')">
        Tornar
      </button>
    </div>

    <!-- Questionnaire -->
    <template v-else-if="questionnaire && currentQuestion">
      <!-- Progress Header -->
      <div class="questionnaire-header">
        <button class="back-btn" @click="previousQuestion">
          <span>←</span>
          <span>{{ isFirstQuestion ? 'Tornar' : 'Anterior' }}</span>
        </button>
        
        <div class="progress-info">
          <span class="progress-text">
            Pregunta {{ currentGlobalIndex + 1 }} de {{ totalQuestions }}
          </span>
          <div class="progress-bar">
            <div class="progress-bar-fill" :style="{ width: `${progress}%` }"></div>
          </div>
        </div>
      </div>

      <!-- Section Indicator -->
      <div class="section-indicator">
        <span class="section-badge">{{ currentSection.title }}</span>
      </div>

      <!-- Question Card -->
      <div class="question-card card-glass">
        <h2 class="question-text">{{ currentQuestion.text }}</h2>

        <!-- Options -->
        <div class="options-list">
          <button
            v-for="(option, index) in currentQuestion.options"
            :key="option.id"
            class="option-btn"
            :class="{ selected: selectedOption?.id === option.id }"
            @click="selectOption(option)"
          >
            <span class="option-label">{{ getOptionLabel(index) }}</span>
            <span class="option-text">{{ option.text }}</span>
            <span class="option-check" v-if="selectedOption?.id === option.id">✓</span>
          </button>
        </div>
      </div>

      <!-- Action Button -->
      <div class="question-actions">
        <button 
          class="btn btn-primary btn-lg"
          :disabled="!selectedOption"
          @click="nextQuestion"
        >
          {{ isLastQuestion ? 'Veure el meu perfil' : 'Següent' }}
          <span class="btn-arrow">→</span>
        </button>
      </div>

      <!-- Keyboard Hint -->
      <p class="keyboard-hint">
        💡 Consell: Tria l'opció que millor et representi
      </p>
    </template>
  </div>
</template>

<style scoped>
.questionnaire {
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: var(--space-3xl);
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid var(--gray-700);
  border-top-color: var(--primary-500);
  border-radius: 50%;
  margin: 0 auto var(--space-lg);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p {
  color: var(--gray-400);
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

/* Header */
.questionnaire-header {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  margin-bottom: var(--space-xl);
}

.back-btn {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  background: transparent;
  border: 1px solid var(--gray-600);
  border-radius: var(--radius-lg);
  color: var(--gray-400);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.back-btn:hover {
  border-color: var(--gray-400);
  color: white;
}

.progress-info {
  flex: 1;
}

.progress-text {
  font-size: 0.875rem;
  color: var(--gray-400);
  display: block;
  margin-bottom: var(--space-sm);
}

/* Section Indicator */
.section-indicator {
  text-align: center;
  margin-bottom: var(--space-lg);
}

.section-badge {
  display: inline-block;
  padding: var(--space-xs) var(--space-lg);
  background: rgba(139, 92, 246, 0.15);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  color: var(--accent-purple);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Question Card */
.question-card {
  padding: var(--space-2xl);
  margin-bottom: var(--space-xl);
}

.question-text {
  font-size: 1.5rem;
  line-height: 1.4;
  margin-bottom: var(--space-2xl);
  text-align: center;
}

/* Options */
.options-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.option-btn {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  width: 100%;
  padding: var(--space-lg);
  background: rgba(255, 255, 255, 0.03);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  color: var(--gray-300);
  font-size: 1rem;
  text-align: left;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.option-btn:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.2);
}

.option-btn.selected {
  background: rgba(0, 136, 255, 0.1);
  border-color: var(--primary-500);
  color: white;
}

.option-label {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 0.875rem;
  flex-shrink: 0;
  transition: all var(--transition-fast);
}

.option-btn.selected .option-label {
  background: var(--primary-500);
  color: white;
}

.option-text {
  flex: 1;
}

.option-check {
  font-size: 1.25rem;
  color: var(--primary-400);
  animation: fadeIn 0.2s ease-out;
}

/* Actions */
.question-actions {
  display: flex;
  justify-content: center;
  margin-bottom: var(--space-lg);
}

.question-actions .btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.question-actions .btn:disabled:hover {
  transform: none;
  box-shadow: var(--shadow-md);
}

.btn-arrow {
  transition: transform var(--transition-fast);
}

.question-actions .btn:not(:disabled):hover .btn-arrow {
  transform: translateX(4px);
}

/* Keyboard Hint */
.keyboard-hint {
  text-align: center;
  font-size: 0.875rem;
  color: var(--gray-500);
}

/* Responsive */
@media (max-width: 768px) {
  .questionnaire-header {
    flex-direction: column;
    align-items: stretch;
  }

  .back-btn {
    align-self: flex-start;
  }

  .question-card {
    padding: var(--space-lg);
  }

  .question-text {
    font-size: 1.25rem;
  }

  .option-btn {
    padding: var(--space-md);
    font-size: 0.9rem;
  }
}
</style>
