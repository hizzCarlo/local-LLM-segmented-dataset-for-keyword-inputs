import { writable } from 'svelte/store';

// Model selection stores
export const availableModels = [
    { id: 'deepseek-r1:1.5b', name: 'Deepseek R1 (base)' },
    { id: 'deepseek-r1:latest', name: 'Deepseek R1 (trained)' },
    { id: 'hizola-assistant', name: 'Hizola Assistant' }
];

export const selectedModel = writable(availableModels[0].id); 