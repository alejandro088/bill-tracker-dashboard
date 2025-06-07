import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import Assistant from '../../frontend/src/views/Assistant.vue';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { createRouter, createWebHistory } from 'vue-router';
vi.mock('vuetify/styles');

const vuetify = createVuetify({ components, directives });
const router = createRouter({ history: createWebHistory(), routes: [] });

vi.mock('../../frontend/src/api.js', () => ({
  default: {
    post: vi.fn().mockResolvedValue({ data: { answer: 'ok' } }),
    get: vi.fn()
  }
}));

describe.skip('Assistant view', () => {
  it('resets conversation', async () => {
    const wrapper = mount(Assistant, { global: { plugins: [router, vuetify] } });
    await wrapper.find('button').trigger('click');
    expect(wrapper.vm.messages.length).toBe(1);
  });
});
