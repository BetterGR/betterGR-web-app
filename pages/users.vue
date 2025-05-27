<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-6">Users Management</h1>
    <UsersList />
  </div>
</template>

<script setup>
// We use the UsersList component from components directory
// which uses the useUsers composable that calls our GraphQL API
definePageMeta({
  middleware: 'auth', // If you have auth middleware
  layout: 'default'
});
</script>

<style scoped>
.users-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.description {
  color: #666;
  margin-bottom: 2rem;
}

.content {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}
</style> 