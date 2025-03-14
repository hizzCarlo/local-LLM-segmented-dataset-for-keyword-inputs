<script lang="ts">
    import Chat from '$lib/components/Chat.svelte';
    import { selectedModel, availableModels } from '$lib/stores';
</script>

<div class="py-6">
    <div class="max-w-4xl mx-auto px-4">
        <div class="flex items-center justify-between mb-8">
            <div class="flex items-center gap-4">
                <div class="bg-black rounded-full p-2 border-2 border-gray-200 dark:border-gray-800 shadow-lg">
                    <img 
                        src="/r1d2.png" 
                        alt="R1D2 Logo" 
                        class="w-12 h-12 object-contain"
                    />
                </div>
                <h1 class="text-3xl font-bold text-gray-900 dark:text-white">R1D2 AI-Chatbot</h1>
            </div>
            
            <div class="flex items-center gap-4">
                <select
                    bind:value={$selectedModel}
                    class="px-4 py-2 rounded-lg border bg-white dark:bg-black 
                           text-gray-900 dark:text-white border-gray-300 dark:border-gray-700"
                >
                    {#each availableModels as model}
                        <option value={model.id}>{model.name}</option>
                    {/each}
                </select>
            </div>
        </div>
        <Chat />
    </div>
</div>
