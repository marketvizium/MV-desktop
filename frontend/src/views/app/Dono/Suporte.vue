<template>
  <div class="support-container">
    <component :is="'style'">
      @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&display=swap');
    </component>

    <div class="support-content">
      <div class="info-section">
        <div class="content-wrapper">
          <div class="brand-tag">Market Vizium</div>
          <h1>Como podemos <span class="highlight">ajudar?</span></h1>
          <p class="description">
            Nossa equipe de especialistas está pronta para auxiliar você com operações, dúvidas técnicas ou suporte à plataforma.
          </p>

          <div class="contact-list">
            <div class="contact-item">
              <div class="icon-box">✉️</div>
              <div>
                <p class="label">E-mail oficial</p>
                <p class="value">marketvizium@gmail.com</p>
              </div>
            </div>

            <div class="contact-item">
              <div class="icon-box">💬</div>
              <div>
                <p class="label">WhatsApp Contato</p>
                <p class="value">+55 11 96302-0831</p>
              </div>
            </div>
          </div>

          <div class="status-badge">
            <span class="dot-ring">
              <span class="dot"></span>
            </span> 
            Atendimento rápido e especializado
          </div>
        </div>
      </div>

      <div class="form-section">
        <div class="form-card">
          <div class="form-header">
            <h3>Envie uma mensagem</h3>
            <p>Retornaremos o contato o mais breve possível.</p>
          </div>
          
          <form @submit.prevent="handleSubmit">
            <div class="input-row">
              <div class="input-group">
                <label for="user">Nome completo</label>
                <input type="text" id="user" v-model="form.user" placeholder="Seu nome" required />
              </div>

              <div class="input-group">
                <label for="email">E-mail de cadastro</label>
                <input type="email" id="email" v-model="form.email" placeholder="seu@email.com" required />
              </div>
            </div>

            <div class="input-group">
              <label for="message">Mensagem</label>
              <textarea id="message" v-model="form.message" rows="5" placeholder="Descreva como podemos ajudar..." required></textarea>
            </div>

            <button type="submit" class="btn-send">
              <span>Enviar Solicitação</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { api } from '@/services/api';
import exibeErro from '@/utils/ExibeErro';

export default {
  name: 'SuportePage',
  data() {
    return {
      form: {
        user: '',
        email: '',
        message: ''
      }
    }
  },
  methods: {
    async handleSubmit() {
      try{

        if(this.form.user == "" || this.form.email == "" || this.form.message == ""){
            this.$toast.success("Você precisa preencher todos os campos para prosseguir")
        }

        const payload = {
            remetente: this.form.email,
            destinatario: 'marketvizium@gmail.com',
            assunto: `${this.form.user} entrou em contato com o suporte`,
            texto: `A companhia MarketVizium preza pelo atendimento ao cliente de forma rápida e de qualidade, oferecendo a maior atenção necessária ao cliente.`,
            template: `
              <div style="background-color: #000000; padding: 40px 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; text-align: center;">
                <div style="max-width: 500px; margin: 0 auto; background-color: #121212; border-radius: 24px; padding: 40px; border: 1px solid #222222;">
                  
                  <div style="margin-bottom: 30px;">
                    <h1 style="color: #ffffff; font-size: 24px; letter-spacing: -1px; margin: 0;">Market<span style="color: #ff8049;">Vizium</span></h1>
                  </div>

                  <h2 style="color: #ffffff; font-size: 20px; font-weight: 600; margin-bottom: 10px;">Verifique seu e-mail</h2>
                  <p style="color: #94a3b8; font-size: 15px; line-height: 1.5; margin-bottom: 30px;">
                    Responda o cliente o mais rápido possível. Segue a mensagem abaixo
                  </p>

                  <p style="color: #FFF; font-size: 13px; margin-bottom: 30px;">
                    Mensagem: ${this.form.message}
                  </p>

                  <div style="border-top: 1px solid #222222; margin-bottom: 20px;"></div>

                  <p style="color: #475569; font-size: 11px; line-height: 1.4;">
                    © 2026 MarketVizium Tecnologia Ltda.<br>
                    Este é um email de suporte, responda o quanto antes.
                  </p>
                </div>
              </div>
            `
          }

          await api.post('/mvpu/usuario/enviarEmail/', payload)
          
          this.$toast.success("Solicitação enviada com sucesso!")

      
      }catch(e){
        exibeErro(e, this.$toast)
      }
    },

  }
}
</script>

<style scoped>
.support-container {
  width: 100%;
  min-height: calc(100vh - 80px);
  display: flex;
  background-color: #ffffff;
  font-family: 'Sora', sans-serif;
  color: #1a202c;
}

.support-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  width: 100%;
}

/* --- LADO ESQUERDO --- */
.info-section {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 80px;
}

.content-wrapper {
  max-width: 440px;
}

.brand-tag {
  color: #ff8049;
  font-weight: 700;
  font-size: 0.75rem;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  margin-bottom: 16px;
}

.info-section h1 {
  font-size: 2.2rem; /* Reduzido de 3.2rem */
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 16px;
  color: #0f172a;
}

.highlight {
  color: #ff8049;
}

.description {
  font-size: 1rem;
  color: #64748b;
  margin-bottom: 40px;
  line-height: 1.6;
}

.contact-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 40px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.icon-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: #f8f8f8;
  border-radius: 12px;
  font-size: 1.4rem;
}

.contact-item .label {
  font-size: 0.75rem;
  color: #94a3b8;
  margin: 0;
  font-weight: 500;
}

.contact-item .value {
  font-weight: 600;
  font-size: 0.95rem;
  color: #1e293b;
  margin: 0;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  background: #f0fdf4;
  color: #166534;
  padding: 8px 16px;
  border-radius: 100px;
  font-size: 0.85rem;
  font-weight: 600;
  border: 1px solid #dcfce7;
}

.dot-ring {
  position: relative;
  display: flex;
  width: 10px;
  height: 10px;
}

.dot {
  width: 10px;
  height: 10px;
  background-color: #22c55e;
  border-radius: 50%;
}

.dot-ring::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: #22c55e;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 0.6; }
  100% { transform: scale(2.5); opacity: 0; }
}

/* --- LADO DIREITO (VIVO) --- */
.form-section {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: linear-gradient(135deg, #e6a686 0%, #fa4c01 100%);
  position: relative;
}

.form-card {
  width: 100%;
  max-width: 520px;
  background: #ffffff;
  padding: 40px;
  border-radius: 24px;
  box-shadow: 0 25px 50px -12px rgba(255, 128, 73, 0.15);
}

.form-header {
  margin-bottom: 32px;
}

.form-header h3 {
  font-size: 1.4rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
}

.form-header p {
  color: #64748b;
  font-size: 0.9rem;
}

.input-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.input-group {
  margin-bottom: 20px;
}

.input-group label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #475569;
}

.input-group input, 
.input-group textarea {
  width: 100%;
  padding: 14px;
  border: 2px solid #f1f5f9;
  border-radius: 12px;
  background: #f8fafc;
  font-family: 'Sora', sans-serif;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  outline: none;
  box-sizing: border-box;
}

.input-group input:focus, 
.input-group textarea:focus {
  border-color: #ff8049;
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(255, 128, 73, 0.1);
}

.btn-send {
  width: 100%;
  padding: 16px;
  background: #ff8049;
  color: white;
  border: none;
  border-radius: 12px;
  font-family: 'Sora', sans-serif;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 10px;
}

.btn-send:hover {
  background-color: #fa6d2e;
  transform: translateY(-2px);
  box-shadow: 0 12px 20px -8px rgba(255, 128, 73, 0.4);
}

/* Responsividade */
@media (max-width: 1024px) {
  .support-content {
    grid-template-columns: 1fr;
  }
  
  .info-section {
    padding: 60px 24px;
    text-align: center;
  }

  .contact-item {
    justify-content: center;
    text-align: left;
  }

  .status-badge {
    margin-top: 10px;
  }

  .form-section {
    padding: 40px 20px;
  }

  .input-row {
    grid-template-columns: 1fr;
  }
}
</style>