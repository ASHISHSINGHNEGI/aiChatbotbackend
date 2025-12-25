# Backend API

This repository contains the backend services for the project. Follow the instructions below to set up and run the environment locally.

## Prerequisites

Ensure you have the following installed on your system:

- **Language Runtime**: Node.js v18+
- **Package Manager**: npm
- **Database**: MongoDB

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd <project-folder>
```

### 2. Install Dependencies

```bash
# For Node.js
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory by copying the template:

```bash
cp envSample .env
```

Open `.env` and update the variables (Database URL, Secret Keys, Port, etc.) to match your local environment.

### 4. Database Setup
# Start MongoDB service
mongod


### 5. Running the Application

Start the server in development mode:

```bash
# For Node.js
npm run dev
```

The server will typically be available at `http://localhost:5000`.

## Frontend github link
https://github.com/ASHISHSINGHNEGI/aiChatbot
