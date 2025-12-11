<!-- WelcomeScreen.vue - Pantalla de benvinguda -->
<script setup>
// Definim l'event que s'enviarà al component pare quan es faci clic a "Començar"
const emit = defineEmits(['start'])

// Llista de característiques principals de l'app
const caracteristiques = [
  {
    icona: '🧠',
    titol: 'IA que s\'adapta a tu',
    descripcio: 'Descobrim com aprens millor'
  },
  {
    icona: '📊',
    titol: '5 Perfils diferents',
    descripcio: 'Troba el teu estil d\'aprenentatge'
  },
  {
    icona: '💬',
    titol: 'Xat intel·ligent',
    descripcio: 'Parla amb una IA que t\'entén'
  },
  {
    icona: '♿',
    titol: 'Per a tothom',
    descripcio: 'Adaptat a les teves necessitats'
  }
]

// Els 5 tipus de perfils d'aprenentatge
const perfils = [
  { emoji: '🎨', nom: 'Visualis', color: '#8b5cf6', tipus: 'Visual' },
  { emoji: '📖', nom: 'Narra', color: '#22c55e', tipus: 'Narratiu' },
  { emoji: '🔢', nom: 'Logika', color: '#3b82f6', tipus: 'Analític' },
  { emoji: '🔧', nom: 'Prax', color: '#f97316', tipus: 'Pràctic' },
  { emoji: '💡', nom: 'Kreo', color: '#ec4899', tipus: 'Creatiu' }
]
</script>

<template>
  <div class="pantalla-benvinguda">
    
    <!-- Secció principal amb el títol i botó -->
    <section class="seccio-principal">
      <!-- Etiqueta decorativa -->
      <div class="etiqueta">
        <span>✨ Tecnologia amb empatia</span>
      </div>

      <!-- Títol principal -->
      <h1 class="titol-gran">
        Descobreix el teu <span class="text-gradient">Perfil d'Aprenentatge</span>
      </h1>

      <!-- Descripció -->
      <p class="subtitol">
        Cada ment és única. La nostra IA analitza com processes la informació 
        per adaptar l'experiència d'aprenentatge a la teva forma de pensar.
      </p>

      <!-- Botó per començar -->
      <button class="btn btn-primary btn-lg boto-gran" @click="emit('start')">
        <span>Començar Avaluació</span>
        <span class="fletxa">→</span>
      </button>

      <!-- Temps estimat -->
      <p class="temps">
        <span>⏱️</span>
        Només 5-7 minuts · 12 preguntes
      </p>
    </section>

    <!-- Mostra els 5 perfils -->
    <section class="seccio-perfils">
      <h3>Els 5 Perfils Cognitius</h3>
      
      <div class="llista-perfils">
        <div 
          v-for="perfil in perfils" 
          :key="perfil.nom" 
          class="targeta-perfil"
          :style="{ '--color-perfil': perfil.color }"
        >
          <span class="emoji-gran">{{ perfil.emoji }}</span>
          <div>
            <div class="nom-perfil">{{ perfil.nom }}</div>
            <div class="tipus-perfil">{{ perfil.tipus }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Característiques de l'app -->
    <section class="seccio-caracteristiques">
      <div class="graella">
        <div 
          v-for="car in caracteristiques" 
          :key="car.titol" 
          class="targeta card"
        >
          <span class="icona-gran">{{ car.icona }}</span>
          <h4>{{ car.titol }}</h4>
          <p>{{ car.descripcio }}</p>
        </div>
      </div>
    </section>

    <!-- Caixa informativa -->
    <section class="caixa-info card-glass">
      <span class="icona-info">💡</span>
      <div>
        <h4>Per què és important?</h4>
        <p>
          Les persones aprenem de formes molt diferents. Conèixer el teu perfil 
          t'ajudarà a triar els millors mètodes d'estudi per a tu.
        </p>
      </div>
    </section>

  </div>
</template>

<style scoped>
/* Contenidor principal */
.pantalla-benvinguda {
  width: 100%;
  animation: apareixer 0.5s ease-out;
}

/* Animació d'entrada */
@keyframes apareixer {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* === SECCIÓ PRINCIPAL === */
.seccio-principal {
  text-align: center;
  margin-bottom: 80px;
}

.etiqueta {
  display: inline-block;
  padding: 8px 24px;
  background: rgba(139, 92, 246, 0.2);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 50px;
  font-size: 14px;
  color: var(--accent-purple);
  margin-bottom: 32px;
}

.titol-gran {
  font-size: 3rem;
  line-height: 1.1;
  margin-bottom: 24px;
}

.subtitol {
  font-size: 1.125rem;
  color: var(--gray-300);
  max-width: 600px;
  margin: 0 auto 32px;
}

.boto-gran {
  margin-bottom: 24px;
}

.fletxa {
  transition: transform 0.2s;
}

.boto-gran:hover .fletxa {
  transform: translateX(4px);
}

.temps {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  color: var(--gray-400);
}

/* === PERFILS === */
.seccio-perfils {
  text-align: center;
  margin-bottom: 80px;
}

.seccio-perfils h3 {
  font-size: 1rem;
  color: var(--gray-400);
  margin-bottom: 24px;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.llista-perfils {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
}

.targeta-perfil {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  transition: all 0.2s;
  cursor: pointer;
}

.targeta-perfil:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--color-perfil);
  transform: translateY(-2px);
}

.emoji-gran {
  font-size: 1.5rem;
}

.nom-perfil {
  font-size: 0.9rem;
  font-weight: 600;
  color: white;
}

.tipus-perfil {
  font-size: 0.75rem;
  color: var(--gray-400);
}

/* === CARACTERÍSTIQUES === */
.seccio-caracteristiques {
  margin-bottom: 80px;
}

.graella {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 24px;
}

.targeta {
  text-align: center;
  padding: 32px;
}

.icona-gran {
  font-size: 2.5rem;
  display: block;
  margin-bottom: 16px;
}

.targeta h4 {
  margin-bottom: 8px;
  font-size: 1.125rem;
}

.targeta p {
  font-size: 0.875rem;
  color: var(--gray-400);
}

/* === CAIXA INFO === */
.caixa-info {
  display: flex;
  gap: 24px;
  padding: 32px;
}

.icona-info {
  font-size: 2rem;
  flex-shrink: 0;
}

.caixa-info h4 {
  margin-bottom: 8px;
  font-size: 1.125rem;
}

.caixa-info p {
  font-size: 0.9rem;
  color: var(--gray-400);
  line-height: 1.6;
}

/* === RESPONSIVE === */
@media (max-width: 768px) {
  .titol-gran {
    font-size: 2rem;
  }

  .subtitol {
    font-size: 1rem;
  }

  .llista-perfils {
    gap: 8px;
  }

  .targeta-perfil {
    padding: 8px 16px;
  }

  .caixa-info {
    flex-direction: column;
    text-align: center;
  }
}
</style>