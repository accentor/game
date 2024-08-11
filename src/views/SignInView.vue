<script setup lang="ts">
import { useRouter } from 'vue-router';
import api from '../api';
import { useSettingsStore } from '../store';
import { ref } from 'vue';
const store = useSettingsStore();
const router = useRouter();
const error = ref<string | null>(null);

async function handleSubmit(event: Event) {
  event.preventDefault();

  const data = new FormData(event.target as HTMLFormElement);
  const name = data.get('session[name]') as string;
  const password = data.get('session[password]') as string;
  if (name.length === 0 || password.length === 0) {
    error.value = "Fill in username and password"
    return
  }
  try {
    const auth = await api.auth_tokens.create({ name, password });
    store.update({ auth });
    router.push("/");
  } catch {
    error.value = "Username and password don't match"
  }
}

</script>

<template>
  <form action="" class="page__contents form"
    @submit="handleSubmit"
  >
    <div class="form__input">
      <label for="session_name" class="form__label">Username</label>
      <input name="session[name]" type="text" class="form__field" id="session_name" autocomplete="username">
    </div>
    <div class="form__input">
      <label for="session_password" class="form__label">Password</label>
      <input name="session[password]" type="password" class="form__field" id="session_password" autocomplete="current-password">
    </div>
    <p class="form__error" v-if="error">
      {{  error  }}
    </p>
    <button type="submit" class="form__submit button">Sign in</button>
  </form>
</template>

