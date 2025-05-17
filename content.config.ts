import { defineContentConfig, defineCollection } from '@nuxt/content'

// This file should only define collections
export default defineContentConfig({
  collections: {
    courses: defineCollection({
      // Type 'page' means 1-to-1 relationship between content files and pages
      type: 'page',
      // Match all markdown files in the courses directory
      source: 'courses/**/*.md'
    })
  }
}) 