import { defineNuxtConfig } from 'nuxt/config'
import { NuxtConfig } from '@nuxt/types'

// Validate required environment variables
const requiredEnvVars = [
  'NUXT_PUBLIC_KEYCLOAK_URL',
  'NUXT_PUBLIC_KEYCLOAK_REALM',
  'NUXT_PUBLIC_KEYCLOAK_CLIENT_ID'
];

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    console.warn(`Warning: Environment variable ${varName} is not set`);
  }
});

// Create the Keycloak config object from environment variables
const keycloakConfig = {
  url: process.env.NUXT_PUBLIC_KEYCLOAK_URL,
  realm: process.env.NUXT_PUBLIC_KEYCLOAK_REALM,
  clientId: process.env.NUXT_PUBLIC_KEYCLOAK_CLIENT_ID
};

// Determine if we're in development mode
const isDev = process.env.NODE_ENV !== 'production';

export default defineNuxtConfig({
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
    '@nuxt/content',
    'nuxt-graphql-client',
    '@pinia/nuxt',
  ],

  typescript: {
    strict: true,
    typeCheck: false,
    shim: false
  },

  runtimeConfig: {
    public: {
      isDev,
      keycloak: keycloakConfig,
      // Make the environment variables directly accessible by the same name
      NUXT_PUBLIC_KEYCLOAK_URL: process.env.NUXT_PUBLIC_KEYCLOAK_URL,
      NUXT_PUBLIC_KEYCLOAK_REALM: process.env.NUXT_PUBLIC_KEYCLOAK_REALM,
      NUXT_PUBLIC_KEYCLOAK_CLIENT_ID: process.env.NUXT_PUBLIC_KEYCLOAK_CLIENT_ID,
      // Keep the old ones for backward compatibility
      keycloakUrl: process.env.NUXT_PUBLIC_KEYCLOAK_URL || 'http://localhost:8080',
      keycloakRealm: process.env.NUXT_PUBLIC_KEYCLOAK_REALM || 'master',
      keycloakClientId: process.env.NUXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'betterGR-web-app',
      content: {
        documentDriven: true,
        navigation: {
          fields: ['title', 'description', 'code', 'semester', '_path']
        },
        markdown: {
          toc: {
            depth: 3,
            searchDepth: 3
          },
          remarkPlugins: ['remark-emoji'],
          rehypePlugins: [],
          components: {
            'course-sidebar': 'components/course/CourseSidebar.vue'
          }
        },
        highlight: {
          theme: 'github-dark'
        },
        experimental: {
          clientDB: false,
          stripQueryParameters: false
        }
      },
    }
  },

  colorMode: {
    preference: 'system',
    fallback: 'light',
    hid: 'nuxt-color-mode-script',
    globalName: '__NUXT_COLOR_MODE__',
    componentName: 'ColorScheme',
    classPrefix: '',
    classSuffix: '',
    storageKey: 'nuxt-color-mode'
  },

  app: {
    head: {
      title: 'Technion Academic Portal',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Academic management system for Technion students and staff' },
        // Security headers
        { 'http-equiv': 'X-Content-Type-Options', content: 'nosniff' },
        { 'http-equiv': 'X-Frame-Options', content: 'DENY' },
        { 'http-equiv': 'X-XSS-Protection', content: '1; mode=block' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },

  css: [
    '~/assets/css/tailwind.css'
  ],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  compatibilityDate: '2025-04-23',

  devtools: {
    enabled: isDev
  },

  build: { 
    transpile: ['lucide-vue-next'] 
  },

  nitro: {
    externals: {
      inline: ['@nuxt/content']
    },
    // @ts-ignore - Property exists at runtime but not in types
    bundledDependencies: ['@nuxt/content'],
    headers: {
      // Content security policy
      'Content-Security-Policy': [
        `default-src 'self'`,
        `script-src 'self' 'unsafe-inline' 'unsafe-eval'`,
        `style-src 'self' 'unsafe-inline'`,
        `img-src 'self' data:`,
        `connect-src 'self' ${process.env.NUXT_PUBLIC_KEYCLOAK_URL || ''} ${process.env.NUXT_PUBLIC_GRAPHQL_HOST || ''}`,
        `frame-ancestors 'self' ${process.env.NUXT_PUBLIC_KEYCLOAK_URL || ''}`,
      ].join('; '),
      // Additional security headers
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
    }
  },

  components: {
    global: true,
    dirs: ['~/components']
  },

  graphqlClient: {
    clients: {
      default: {
        host: process.env.NUXT_PUBLIC_GRAPHQL_HOST,
        // Optional websocket endpoint if you need subscriptions
        wsHost: process.env.NUXT_PUBLIC_GRAPHQL_WS_HOST,
        retries: 3,
        // Add token to GraphQL requests
        tokenName: 'Authorization',
        tokenType: 'Bearer',
        tokenStorage: 'none', // Don't store in localStorage or cookies
      }
    },
    options: {
      persistedQueries: false,
      cache: true,
    },
  },

  plugins: [
    '~/plugins/keycloak.client.ts',
    '~/plugins/graphql-auth.client.ts',
  ],
} as any)