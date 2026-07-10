<div align="center">
  <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Sun%20Behind%20Large%20Cloud.png" alt="Weather AI Animation" width="120" />
  
  <h1 align="center">🌤️ AI Weather Assistant</h1>

  <p align="center">
    <strong>A next-generation, AI-powered intelligent weather forecasting application.</strong>
    <br />
    <br />
    <a href="https://ai-weather-assistant-two.vercel.app"><strong>View Live Demo</strong></a>
    ·
    <a href="https://github.com/pratikkad10/AI-Weather-Assistant">Explore the Docs</a>
    ·
    <a href="https://github.com/pratikkad10/AI-Weather-Assistant/issues">Report Bug</a>
    ·
    <a href="https://github.com/pratikkad10/AI-Weather-Assistant/issues">Request Feature</a>
  </p>

  <p align="center">
    <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" /></a>
    <a href="https://reactjs.org/"><img src="https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react&logoColor=white" alt="React" /></a>
    <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" /></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  </p>
</div>

<hr />

## ✨ Overview

**AI Weather Assistant** is a production-ready web application designed to bring intelligent, conversational weather insights to users. Instead of just looking at raw metrics, users can ask natural language questions like *"Will I need an umbrella tomorrow in London?"* and receive precise, AI-driven responses alongside beautiful, interactive visualizations.

Built on top of the **Next.js App Router**, this application prioritizes edge-performance, modern UI/UX principles, and a highly scalable architecture.

<div align="center">
  <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Umbrella%20with%20Rain%20Drops.png" alt="Rain Animation" width="60" align="right"/>
</div>

## 🚀 Key Features

* 🤖 **Conversational AI Interface:** Query weather conditions using natural language via advanced LLMs.
* 🌍 **Global Real-Time Data:** Accurate, up-to-the-minute weather metrics fetched via leading weather APIs.
* 🎨 **Stunning UI/UX:** A highly responsive, accessible, and beautifully animated interface built with Tailwind CSS.
* 🌗 **Dynamic Theming:** Seamless Dark/Light mode transitions adaptive to the time of day.
* ⚡ **Optimized Performance:** Server-Side Rendering (SSR) and aggressive caching strategies for instant load times.
* 🛡️ **Type Safety:** End-to-end type safety with TypeScript and Zod validation.

## 🛠️ Tech Stack

| Category | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | [Next.js](https://nextjs.org/) | React framework for production (App Router) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | Strictly typed JavaScript |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | Utility-first CSS framework |
| **Components** | [Radix UI](https://www.radix-ui.com/) / Shadcn | Accessible UI primitives |
| **AI Engine**| Mistral AI | Natural language processing |
| **Weather Data** | OpenWeatherMap | High-fidelity meteorological data source |
| **Deployment** | [Vercel Live App](https://ai-weather-assistant-two.vercel.app) | Deployed on Vercel Edge Network |

## 🏗️ Architecture Flow

1. **User Input:** User submits a natural language query via the interactive frontend.
2. **Intent Parsing:** The AI extracts geographical and temporal intents from the query.
3. **Data Aggregation:** The Next.js backend securely queries external Weather APIs using the extracted parameters.
4. **Insight Generation:** Raw weather data is fed back into the AI to formulate a human-friendly, contextual response.
5. **Streaming Response:** Data and AI insights are streamed back to the client using React Suspense, ensuring a snappy, non-blocking UI experience.

## 🚦 Getting Started

Follow these instructions to set up the project locally for development and testing.

### Prerequisites

Ensure you have the following installed on your local machine:
* [Node.js](https://nodejs.org/en/) (v18.17.0 or higher recommended)
* Your preferred package manager (`npm`, `yarn`, `pnpm`, or `bun`)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/pratikkad10/AI-Weather-Assistant.git
   cd ai-weather-application
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or yarn install / pnpm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory. Use `.env.example` as a template if available.
   ```env
   # .env.local
   NEXT_PUBLIC_WEATHER_API_KEY="your_weather_api_key"
   AI_SERVICE_API_KEY="your_ai_api_key"
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Explore:** Open [http://localhost:3000](http://localhost:3000) in your browser to see the application running.

## 📂 Project Structure

```text
ai-weather-application/
├── app/               # Next.js App Router (Pages, Layouts, API routes)
├── components/        # Reusable, atomic UI components
├── lib/               # Utility functions, API clients, schema validations
├── hooks/             # Custom React hooks for shared logic
├── public/            # Static assets (images, fonts, icons)
├── types/             # Global TypeScript interfaces and definitions
└── ...config files
```

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🛡️ License

Distributed under the MIT License. See `LICENSE` for more information.

---

