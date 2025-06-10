import { defineNuxtConfig } from 'nuxt/config'
import { NuxtConfig } from '@nuxt/types'
import type Keycloak from 'keycloak-js'

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

  // Auto-imports configuration
  imports: {
    autoImport: true,
  },

  typescript: {
    strict: true,
    typeCheck: false,
    shim: true
  },

  runtimeConfig: {
    public: {
      isDev,
      keycloak: keycloakConfig,
      // GraphQL configuration
      GQL_HOST: process.env.NUXT_PUBLIC_GRAPHQL_HOST,
      // Other variables
      NUXT_PUBLIC_KEYCLOAK_URL: process.env.NUXT_PUBLIC_KEYCLOAK_URL,
      NUXT_PUBLIC_KEYCLOAK_REALM: process.env.NUXT_PUBLIC_KEYCLOAK_REALM,
      NUXT_PUBLIC_KEYCLOAK_CLIENT_ID: process.env.NUXT_PUBLIC_KEYCLOAK_CLIENT_ID,
      // Keep the old ones for backward compatibility
      keycloakUrl: process.env.NUXT_PUBLIC_KEYCLOAK_URL,
      keycloakRealm: process.env.NUXT_PUBLIC_KEYCLOAK_REALM,
      keycloakClientId: process.env.NUXT_PUBLIC_KEYCLOAK_CLIENT_ID,
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

  'graphql-client':{
    clients: {
      default: {
        host: '/api/graphql',
        introspectionHost: process.env.NUXT_PUBLIC_GRAPHQL_HOST,
        token: {
          type: 'Bearer',
          name: 'Authorization',
          value: (nuxtApp: any) => {
            // Add robust token handling with debug information
            try {
              // Get Keycloak instance from the Nuxt app
              const keycloak = nuxtApp?.$keycloak
              
              // Check if Keycloak exists and is authenticated
              if (!keycloak) {
                console.warn('[GraphQL] No Keycloak instance found')
                return ''
              }
              
              if (!keycloak.authenticated) {
                console.warn('[GraphQL] Keycloak not authenticated')
                return ''
              }
              
              // Force check token expiry to ensure we have fresh tokens
              if (keycloak.token) {
                try {
                  // Parse token to check expiry
                  const tokenParts = keycloak.token.split('.')
                  if (tokenParts.length === 3) {
                    const payload = JSON.parse(atob(tokenParts[1]))
                    const expiresIn = payload.exp * 1000 - Date.now()
                    
                    // If token expires in less than 30 seconds, the GraphQL wrapper should handle refresh
                    if (expiresIn < 30000 && process.env.NODE_ENV === 'development') {
                      console.warn('[GraphQL] Token expiring soon, GraphQL wrapper should refresh')
                    }
                  }
                } catch (e) {
                  console.warn('[GraphQL] Could not parse token expiry:', e)
                }
                
                return keycloak.token
              } else {
                console.warn('[GraphQL] Token is empty or undefined')
                return ''
              }
            } catch (error) {
              console.error('[GraphQL] Error getting token:', error)
              return ''
            }
          }
        },
        retainToken: false // Don't cache tokens, always get fresh ones
      }
    }
  },

  plugins: [
    '~/plugins/keycloak.client.ts',
  ],
} as any)