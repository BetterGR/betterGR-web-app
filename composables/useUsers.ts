// This composable will use the generated GraphQL query
// Note: The imports may show errors until the GraphQL code is generated
// Nuxt will generate these files based on the queries in the 'queries' directory

import { ref } from 'vue';
import type { Ref } from 'vue';

// Define user types
interface User {
  id: string;
  name: string;
  email: string;
}

export function useUsers() {
  const users: Ref<User[]> = ref([]);
  const loading = ref(false);
  const error = ref<Error | null>(null);

  // This function will call the generated GraphQL query
  // It will only work once the code is generated
  async function fetchUsers() {
    try {
      loading.value = true;
      error.value = null;
      
      // This uses the auto-generated query from the GraphQL schema
      // The function will be available after running the app and generating the code
      // @ts-ignore - This will be available after code generation
      const { data } = await useGetUsersQuery();
      
      if (data.value?.users) {
        users.value = data.value.users;
      }
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Unknown error occurred');
      console.error('Error fetching users:', err);
    } finally {
      loading.value = false;
    }
  }

  // This function will fetch a single user by ID
  async function fetchUser(id: string) {
    try {
      loading.value = true;
      error.value = null;
      
      // @ts-ignore - This will be available after code generation
      const { data } = await useGetUserQuery({
        id
      });
      
      return data.value?.user || null;
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Unknown error occurred');
      console.error('Error fetching user:', err);
      return null;
    } finally {
      loading.value = false;
    }
  }

  return {
    users,
    loading,
    error,
    fetchUsers,
    fetchUser
  };
} 