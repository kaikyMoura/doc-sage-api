<div align="center">

# 📄 DocSage API


**DocSage** is an intelligent backend API for analyzing and extracting structured information from documents (PDFs, images, and plain text), powered by LLMs and strict business validation rules.

</div>

<div align="center">
  
![GitHub top language](https://img.shields.io/github/languages/top/kaikyMoura/doc-sage-api)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/ce1f958181d743b98107dbc70dfac5ed)](https://app.codacy.com/gh/kaikyMoura/doc-sage-api/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)
![Repository size](https://img.shields.io/github/repo-size/kaikyMoura/doc-sage-api)
![Github last commit](https://img.shields.io/github/last-commit/kaikyMoura/doc-sage-api)
![License](https://img.shields.io/aur/license/LICENSE)
![Languages count](https://img.shields.io/github/languages/count/kaikyMoura/doc-sage-api)

</div>

## 1. About the Project

This project serves as the API implementation for DocSage, an intelligent document analysis system designed to streamline workflows in contexts like notary offices, city halls, and public services requiring document validation and processing.

Built with NestJS, Node.js, TypeScript, Tesseract.js, pdf-parse, Prisma, and Groq, the DocSage API enables efficient document processing by leveraging OCR and LLMs to extract and structure data from scanned images and PDF files.

Once text is extracted using Tesseract.js (for images) or pdf-parse (for PDFs), it is further processed and enriched by LLaMA 3 running on the Groq platform to identify and extract key fields (e.g., document type, issue date, names, numbers), providing structured and contextualized data for downstream usage.

---

## 2. Features

- 🔐 User Authentication (JWT-based)
- 📄 Document Upload (images and PDFs)
- 🧠 Text Extraction using:
  - `Tesseract.js` for image-based OCR
  - `pdf-parse` for PDF document parsing

- 🤖 LLM Integration via `Groq` + `LLaMA 3` to:
  - Identify relevant information from raw text
  - Return structured and categorized document data 

- 📂 Document Management (storage, metadata, status) (soon...)

- 🧪 Unit and Integration Testing with `Jest`

- ⚙️ Modular & Scalable Architecture using NestJS best practices

---

## 3. Technologies

<div style="display: inline-block">
  <img alt="typescript-logo" width="48" style="margin-right: 20px" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg" />
  <img alt="nest-logo" width="48" style="margin-right: 12px" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nestjs/nestjs-original-wordmark.svg" />
  <img alt="prisma-logo" width="48" style="margin-right: 12px" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/prisma/prisma-original.svg" />
  <img alt="groq-logo" width="48" style="margin-right: 12px" src="https://github.com/user-attachments/assets/5f3b415e-65e7-49e8-b769-855c4605af4c" />
  <img alt="nodejs-logo" width="48" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original-wordmark.svg" />
  
</div>

---

## 4. Installation
### Prerequisites:
Before running the project, ensure that **Node.js** is installed on your machine. If not, you can download it from the [official Node.js website](https://nodejs.org/en/) (LTS version recommended).

To verify your Node.js installation, run:

```console
node -v
npm -v
```

Clone the repository to your local machine

```console
git clone https://github.com/kaikyMoura/doc-sage-api.git
```

Navigate into the project directory

```bash
cd doc-sage-api
```
Install dependencies

```bash
npm install
# or
pnpm install
# or
yarn install
```

---

## 6.  Environment Setup

### Environment Variables
Create a .env file in the project root based on the example below:

```env
# You can ask chatgpt if you don't know how to generate
JWT_SECRET=your_jwt_secret_here

# PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/docsage_db?schema=public"

# Groq
GROQ_API_KEY=your_groq_api_key_here

```

### Groq Setup (LLaMA 3)
To use Groq's LLaMA 3 API for intelligent document structuring:
- Go to [https://console.groq.com](https://console.groq.com)
- Create a free account and generate an API key
- Copy your key and paste it into the `.env` file under `GROQ_API_KEY`

### PostgreSQL Database
You need a PostgreSQL database to run the project. You can create one in several ways:
- Install postgres sql locally: [https://www.postgresql.org/download/](https://www.postgresql.org/download/)
- Using `create db` [https://www.postgresql.org/docs/current/app-createdb.html](https://www.postgresql.org/docs/current/app-createdb.html)
- Or via Docker + postgres [https://hub.docker.com/_/postgres](https://hub.docker.com/_/postgres)

### Prisma Setup
After configuring your database and .env, initialize and generate the Prisma client:

```console
# Run the Prisma migration via npm
pnpm prisma migrate dev --name init

# Generate the Prisma client
pnpm prisma generate
```

You can use the Prisma CLI to inspect your DB or update schema as needed:

```console
pnpm prisma studio   # Open GUI to manage the DB
```

---

## 7. Running the Application:
Once the dependencies are installed, you can start the development server with:

```console
npm run dev
# or
pnpm run dev
# or
yarn dev
```

the application will be available on:

```console
http://localhost:5000
```

--- 

## 8. Deployment
Coming soon ...

---

## 9. Documentation
The API is fully documented and designed for easy integration. Each new endpoint is automatically included in the documentation.

### Pages Documentation
Each module in the codebase contains a corresponding `.md` file that serves as a usage guide and endpoint showcase.

### OpenApi (Swagger)
The project exposes a Swagger UI for exploring and testing endpoints.

Access it locally at:
```bash
http://localhost:5000/docs
```

---

### 10. 📝 Terms of Use
- **Non-commercial** project.
- All rights related to user data and privacy are respected.
- This project aims to serve as a learning and portfolio tool.

#### Author 👨‍💻
Kaiky Tupinambá - Fullstack developer
