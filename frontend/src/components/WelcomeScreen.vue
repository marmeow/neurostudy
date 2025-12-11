<script setup>
import { ref } from 'vue'

const emit = defineEmits(['start'])

const features = [
  {
    icon: '🧠',
    title: 'IA Adaptativa',
    description: 'Analitzem la teva forma d\'aprendre usant intel·ligència artificial'
  },
  {
    icon: '📊',
    title: '5 Perfils Cognitius',
    description: 'Descobreix quin dels 5 perfils d\'aprenentatge s\'adapta a tu'
  },
  {
    icon: '💬',
    title: 'Xat Personalitzat',
    description: 'Parla amb la IA adaptada al teu estil d\'aprenentatge'
  },
  {
    icon: '♿',
    title: 'Accessibilitat Total',
    description: 'La plataforma s\'adapta a les teves necessitats visuals, auditives i motores'
  }
]

const profiles = [
  { emoji: '🎨', name: 'Visualis', color: '#8b5cf6', description: 'Visual' },
  { emoji: '📖', name: 'Narra', color: '#22c55e', description: 'Narratiu' },
  { emoji: '🔢', name: 'Logika', color: '#3b82f6', description: 'Analític' },
  { emoji: '🔧', name: 'Prax', color: '#f97316', description: 'Pràctic' },
  { emoji: '💡', name: 'Kreo', color: '#ec4899', description: 'Creatiu' }
]
</script>

<template>
  <div class="welcome animate-slide-up">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-badge">
        <span>✨ Tecnologia amb empatia</span>
      </div>
      
      <h1 class="hero-title">
        Descobreix el teu <span class="text-gradient">Perfil d'Aprenentatge</span>
      </h1>
      
      <p class="hero-subtitle">
        Cada ment és única. La nostra IA analitza com processes la informació 
        per adaptar l'experiència d'aprenentatge a la teva forma de pensar.
      </p>

      <button class="btn btn-primary btn-lg hero-cta" @click="emit('start')">
        <span>Començar Avaluació</span>
        <span class="btn-arrow">→</span>
      </button>

      <p class="hero-time">
        <span class="time-icon">⏱️</span>
        Només 5-7 minuts · 12 preguntes
      </p>
    </section>

    <!-- Profiles Preview -->
    <section class="profiles-preview">
      <h3>Els 5 Perfils Cognitius</h3>
      <div class="profiles-grid">
        <div 
          v-for="profile in profiles" 
          :key="profile.name" 
          class="profile-chip"
          :style="{ '--profile-color': profile.color }"
        >
          <span class="profile-emoji">{{ profile.emoji }}</span>
          <div class="profile-info">
            <span class="profile-name">{{ profile.name }}</span>
            <span class="profile-desc">{{ profile.description }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Grid -->
    <section class="features">
      <div class="features-grid">
        <div v-for="feature in features" :key="feature.title" class="feature-card card">
          <span class="feature-icon">{{ feature.icon }}</span>
          <h4>{{ feature.title }}</h4>
          <p>{{ feature.description }}</p>
        </div>
      </div>
    </section>

    <!-- Info Box -->
    <section class="info-box card-glass">
      <div class="info-content">
        <span class="info-icon">💡</span>
        <div>
          <h4>Per què és important conèixer el teu perfil?</h4>
          <p>
            Les persones aprenem de formes molt diferents. Conèixer el teu perfil 
            t'ajudarà a triar els mètodes d'estudi més efectius per a tu, 
            estalviant temps i millorant la retenció de coneixements.
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.welcome {
  width: 100%;
}

/* Hero Section */
.hero {
  text-align: center;
  margin-bottom: var(--space-3xl);
}

.hero-badge {
  display: inline-block;
  padding: var(--space-sm) var(--space-lg);
  background: rgba(139, 92, 246, 0.2);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: var(--radius-full);
  font-size: 0.875rem;
  color: var(--accent-purple);
  margin-bottom: var(--space-xl);
}

.hero-title {
  font-size: 3rem;
  line-height: 1.1;
  margin-bottom: var(--space-lg);
}

.hero-subtitle {
  font-size: 1.125rem;
  color: var(--gray-300);
  max-width: 600px;
  margin: 0 auto var(--space-xl);
}

.hero-cta {
  margin-bottom: var(--space-lg);
}

.btn-arrow {
  transition: transform var(--transition-fast);
}

.hero-cta:hover .btn-arrow {
  transform: translateX(4px);
}

.hero-time {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  font-size: 0.875rem;
  color: var(--gray-400);
}

.time-icon {
  font-size: 1rem;
}

/* Profiles Preview */
.profiles-preview {
  text-align: center;
  margin-bottom: var(--space-3xl);
}

.profiles-preview h3 {
  font-size: 1rem;
  color: var(--gray-400);
  font-weight: 500;
  margin-bottom: var(--space-lg);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.profiles-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-md);
}

.profile-chip {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-lg);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  transition: all var(--transition-fast);
}

.profile-chip:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--profile-color);
  transform: translateY(-2px);
}

.profile-emoji {
  font-size: 1.5rem;
}

.profile-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.profile-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: white;
}

.profile-desc {
  font-size: 0.75rem;
  color: var(--gray-400);
}

/* Features Grid */
.features {
  margin-bottom: var(--space-3xl);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--space-lg);
}

.feature-card {
  text-align: center;
  padding: var(--space-xl);
}

.feature-icon {
  font-size: 2.5rem;
  display: block;
  margin-bottom: var(--space-md);
}

.feature-card h4 {
  margin-bottom: var(--space-sm);
  font-size: 1.125rem;
}

.feature-card p {
  font-size: 0.875rem;
  color: var(--gray-400);
}

/* Info Box */
.info-box {
  padding: var(--space-xl);
}

.info-content {
  display: flex;
  gap: var(--space-lg);
  align-items: flex-start;
}

.info-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.info-content h4 {
  margin-bottom: var(--space-sm);
  font-size: 1.125rem;
}

.info-content p {
  font-size: 0.9rem;
  color: var(--gray-400);
  line-height: 1.6;
}

/* Responsive */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .profiles-grid {
    gap: var(--space-sm);
  }

  .profile-chip {
    padding: var(--space-sm) var(--space-md);
  }

  .info-content {
    flex-direction: column;
    text-align: center;
  }
}
</style>