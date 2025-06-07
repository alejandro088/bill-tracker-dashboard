import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import Assistant from '../../frontend/src/views/Assistant.vue';

vi.mock('../../frontend/src/api.js', () => ({
  default: {
    post: vi.fn().mockResolvedValue({ data: { answer: 'ok' } }),
    get: vi.fn()
  }
}));

describe('Assistant view', () => {
  it('resets conversation', async () => {
    const wrapper = mount(Assistant);
    await wrapper.find('button').trigger('click');
    expect(wrapper.vm.messages.length).toBe(1);
  });
});
