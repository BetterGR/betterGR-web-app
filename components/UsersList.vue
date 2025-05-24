<template>
  <div>
    <h1>Users List</h1>
    
    <div v-if="loading" class="loading">
      Loading users...
    </div>
    
    <div v-else-if="error" class="error">
      Error: {{ error.message }}
    </div>
    
    <div v-else>
      <button @click="fetchUsers" class="refresh-btn">Refresh Users</button>
      
      <ul class="users-list">
        <li v-for="user in users" :key="user.id" class="user-item">
          <strong>{{ user.name }}</strong>
          <p>{{ user.email }}</p>
        </li>
      </ul>
      
      <div v-if="users.length === 0" class="no-users">
        No users found.
      </div>
    </div>
  </div>
</template>

<script setup>
// Import the users composable we created
const { users, loading, error, fetchUsers } = useUsers();

// Fetch users when the component is mounted
onMounted(() => {
  fetchUsers();
});
</script>

<style scoped>
.loading, .error, .no-users {
  padding: 1rem;
  margin: 1rem 0;
  border-radius: 4px;
}

.loading {
  background-color: #f0f0f0;
}

.error {
  background-color: #ffebee;
  color: #c62828;
}

.users-list {
  list-style: none;
  padding: 0;
}

.user-item {
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  border: 1px solid #eee;
  border-radius: 4px;
}

.refresh-btn {
  background-color: #1976d2;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 1rem;
}

.refresh-btn:hover {
  background-color: #1565c0;
}
</style> 