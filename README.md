# Dynamic Content Frontend

A modern web application built with Nuxt.js that dynamically renders content from markdown files, allowing for a flexible, documentation-driven approach to content management.

## Features

- **Markdown-Powered Pages**: Automatically transforms markdown files (including READMEs) into fully styled web pages
- **Dynamic Routing**: Creates routes based on the structure of your markdown files

## Getting Started

### Prerequisites

- Node.js (v14.x or later)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/your-repo.git
   cd your-repo
   ```

2. Install dependencies:
   ```
   npm install
   # or
   yarn install
   ```

3. Configure environment variables:
   ```
   cp .env.example .env
   ```
   Edit the `.env` file with your configuration details.

4. Start the development server:
   ```
   npm run dev
   # or
   yarn dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

## How It Works

### Markdown to Page Conversion

This application dynamically converts markdown files (including README.md files) into web pages. 

1. Place markdown files in the `/content` directory
2. The application will automatically:
   - Parse the markdown structure
   - Extract metadata and headings
   - Generate dynamic routes
   - Apply styling and layout components

