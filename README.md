<div align="center">

<!-- Header Visual Sofisticado (Tema Emerald / Dark Fintech) -->
<img src="https://capsule-render.vercel.app/api?type=rect&color=gradient&customColorList=4,26,20,6,78,59,16,185,129&height=230&section=header&text=Controle%20Financeiro%20App&fontSize=42&fontAlignY=38&desc=Gest%C3%A3o%20Financeira%20Pessoal%20Descomplicada%2C%20Reativa%20e%20Mobile-First&descSize=16&descAlignY=62&animation=fadeIn" width="100%" alt="Header Controle Financeiro" />

<!-- Typing SVG Dinâmico -->
<a href="https://git.io/typing-svg">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=18&duration=2800&pause=900&color=10B981&center=true&vCenter=true&width=620&lines=Gest%C3%A3o+de+Receitas%2C+Despesas+e+Saldo+em+Tempo+Real;React.js+%E2%80%A2+Tailwind+CSS+v4+%E2%80%A2+JavaScript%2FTypeScript;Persist%C3%AAncia+em+Nuvem+com+Firebase+(Firestore+%26+Auth);Progressive+Web+App+(PWA)+Instal%C3%A1vel+no+Smartphone" alt="Typing SVG" />
</a>

<br/><br/>

<!-- Badges de Acesso, Deploy e Arquitetura -->
<p align="center">
  <a href="https://controle-financeiro-app-umber.vercel.app/" target="_blank">
    <img src="https://img.shields.io/badge/Acessar_App-Online-10B981?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo Vercel" />
  </a>
  <a href="https://github.com/renanvieira-dev/controle-financeiro-app" target="_blank">
    <img src="https://img.shields.io/badge/C%C3%B3digo_Fonte-GitHub-111827?style=for-the-badge&logo=github&logoColor=white" alt="Repositório GitHub" />
  </a>
  <img src="https://img.shields.io/badge/Backend-Firebase_Serverless-FFA611?style=for-the-badge&logo=firebase&logoColor=white" alt="Firebase BaaS" />
  <img src="https://img.shields.io/badge/Ecossistema-PWA_Instal%C3%A1vel-047857?style=for-the-badge" alt="PWA" />
</p>

</div>

---

### 💵 Sobre o Projeto

O **Controle Financeiro App** é uma solução voltada para a gestão de finanças pessoais do dia a dia, construída para eliminar a barreira de entrada e a fricção que costumam afastar as pessoas do controle orçamentário.

Em vez de planilhas complexas e aplicativos bancários saturados de propaganda e passos desnecessários, o app oferece uma experiência direta: **abrir o app na hora da compra, registrar o valor, categorizar e visualizar imediatamente o impacto no saldo acumulado do mês**.

---

### 🧠 O Que Foi Pensado (Arquitetura e Experiência do Usuário)

#### 1. "Finanças de Bolso" via Progressive Web App (PWA)
* A maioria das pessoas desiste de registrar despesas porque o processo no celular é lento. O app foi pensado como um **PWA completo**: pode ser instalado com um toque direto no ecrã inicial do smartphone, sem precisar baixar megabytes em lojas de aplicativos.
* Carregamento quase instantâneo dos ativos locais com service workers, ideal para uso rápido na fila do supermercado ou no trânsito.

#### 2. Reatividade em Tempo Real com Firebase (Serverless)
* Integração direta com **Firebase (Cloud Firestore / Auth)**, permitindo sincronização em tempo real das transações cadastradas.
* Se o usuário registrar uma despesa no celular, qualquer outro dispositivo conectado reflete a alteração de saldo instantaneamente, sem necessidade de recarregar a página.

#### 3. Design Limpo com Tailwind CSS v4
* Paleta visual com inspiração fintech em tons escuros e acentos esmeralda/verde para receitas e rubi/vermelho para saídas.
* Hierarquia tipográfica que privilegia métricas de alto impacto (saldo total, total de entradas, total de saídas) logo no primeiro terço da tela.

---

### ⚡ Principais Funcionalidades

- 💰 **Dashboard Consolidado:** Balanço patrimonial com cards dinâmicos de Entradas, Saídas e Saldo Líquido atual.
- ➕ **Lançamento Rápido:** Formulário minimalista para registro veloz de transações (tipo, valor, descrição e categoria).
- 🏷️ **Categorização de Despesas:** Identificação visual para separar custos essenciais, lazer, alimentação, transporte e contas fixas.
- 🗑️ **Gestão e Histórico Completo:** Listagem das transações ordenadas cronologicamente com exclusão e edição sob demanda.
- 📱 **Instalação Nativa PWA:** Prompt inteligente de adição à tela inicial para Android e iOS.
- ☁️ **Sincronização em Nuvem:** Dados seguros e persistidos continuamente na nuvem.

---

### 🧰 Tecnologias Utilizadas

<div align="center">

| Camada | Tecnologia | Papel no Projeto |
| :--- | :--- | :--- |
| **Front-End Core** | `React.js` | Interface declarativa baseada em estados e componentes modulares |
| **Estilização** | `Tailwind CSS v4` | Classes utilitárias modernas para estilização ágil e responsiva |
| **Backend & BaaS** | `Firebase` (Firestore / Auth) | Banco de dados NoSQL reativo em tempo real e camada de autenticação |
| **Arquitetura Mobile** | `PWA Manifest & Service Workers` | Capacidade de instalação móvel e armazenamento local |
| **Build Tooling** | `Vite` | Empacotamento ultra-rápido e ambiente de desenvolvimento leve |
| **Hospedagem & CI/CD** | `Vercel` | Deploy contínuo com zero-configuration e CDN global de baixa latência |

<br/>

<p align="center">
  <img src="https://skillicons.dev/icons?i=react,js,tailwind,firebase,vite,vercel,git&perline=7&theme=dark" alt="Stack Icons" />
</p>

</div>

---

### 🚀 Como Executar o Projeto Localmente

#### Pré-requisitos
* **Node.js** (versão 18+ recomendada)
* Gerenciador de pacotes **npm**, **yarn** ou **pnpm**
* Um projeto criado no console do [Firebase](https://firebase.google.com/) com o **Firestore Database** ativado

#### Passo a Passo

1. **Clonar o Repositório:**
```bash
git clone [https://github.com/renanvieira-dev/controle-financeiro-app.git](https://github.com/renanvieira-dev/controle-financeiro-app.git)
cd controle-financeiro-app


2. **Instalar Dependências:**
```bash
npm install
# ou
pnpm install

```


3. **Configurar as Chaves do Firebase:**
Crie um arquivo `.env` (ou `.env.local`) na raiz do projeto com as credenciais do seu projeto Firebase:
```env
VITE_FIREBASE_API_KEY=sua_api_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto-id
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
VITE_FIREBASE_APP_ID=seu_app_id

```


4. **Iniciar o Servidor Local:**
```bash
npm run dev
# ou
pnpm dev

```


5. **Visualizar no Navegador:**
Acesse [http://localhost:5173](http://localhost:5173) (ou a porta informada pelo Vite no terminal).

---

### 📁 Estrutura do Projeto

```plaintext
controle-financeiro-app/
├── public/                 # Ícones do PWA, favicon e manifest.json
├── src/
│   ├── assets/             # Recursos visuais e SVGs
│   ├── components/         # Componentes de UI (Header, SummaryCards, TransactionList, Modal)
│   ├── services/           # Configuração e integração com Firebase (firebase.js)
│   ├── hooks/              # Custom hooks para cálculo de fluxo de caixa e estados
│   ├── styles/             # Diretivas do Tailwind CSS e estilos globais
│   ├── App.jsx             # Estrutura principal da tela e orquestração de estados
│   └── main.jsx            # Ponto de entrada da aplicação
├── index.html              # HTML base com tags de viewport e manifest PWA
├── package.json            # Scripts de build e dependências do projeto
└── vite.config.js          # Configuração do Vite e plugins PWA

```

---

### 👨‍💻 Autor

Desenvolvido por **Renan Vieira**

---
