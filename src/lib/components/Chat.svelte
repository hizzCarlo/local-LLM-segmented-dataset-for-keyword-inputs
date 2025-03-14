<script lang="ts">
    import type { Message } from '$lib/types';
    import { selectedModel } from '$lib/stores';

    let messages: Message[] = [];
    let userInput = '';
    let loading = false;
    let error: string | null = null;

    async function handleSubmit() {
        if (!userInput.trim()) return;

        const userMessage = userInput;
        messages = [...messages, { role: 'user', content: userMessage }];
        userInput = '';
        loading = true;
        error = null;

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    message: userMessage,
                    model: $selectedModel
                })
            });

            const data = await response.json();
            
            if (data.error) {
                error = data.error;
                return;
            }

            messages = [...messages, { role: 'assistant', content: data.response }];
        } catch (err) {
            error = 'Failed to send message. Please try again.';
            console.error('Failed to send message:', err);
        } finally {
            loading = false;
        }
    }
</script>

<div class="max-w-2xl mx-auto">
    <div class="bg-white dark:bg-black rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-800">
        <div class="space-y-4 h-[500px] overflow-y-auto mb-4 pr-2 
                    [&::-webkit-scrollbar]:w-2
                    [&::-webkit-scrollbar-track]:bg-transparent
                    [&::-webkit-scrollbar-thumb]:bg-gray-200
                    [&::-webkit-scrollbar-thumb]:rounded-full
                    [&::-webkit-scrollbar-thumb]:border-2
                    [&::-webkit-scrollbar-thumb]:border-transparent
                    hover:[&::-webkit-scrollbar-thumb]:bg-gray-300
                    dark:[&::-webkit-scrollbar-thumb]:bg-gray-800
                    dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-700">
            {#each messages as message}
                <div class={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div class={`p-3 rounded-lg ${
                        message.role === 'user' 
                            ? 'bg-blue-50 dark:bg-gray-900 text-gray-900 dark:text-white' 
                            : 'bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white'
                    } inline-block max-w-[80%]`}>
                        <p class="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                </div>
            {/each}
            
            {#if loading}
                <div class="flex justify-start">
                    <div class="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg inline-block">
                        <p class="text-sm text-gray-900 dark:text-white">Thinking...</p>
                    </div>
                </div>
            {/if}
            
            {#if error}
                <div class="flex justify-start">
                    <div class="bg-red-50 dark:bg-red-900 p-3 rounded-lg inline-block">
                        <p class="text-sm text-red-600 dark:text-red-300">{error}</p>
                    </div>
                </div>
            {/if}
        </div>
        
        <form on:submit|preventDefault={handleSubmit} class="flex gap-2">
            <input
                type="text"
                bind:value={userInput}
                placeholder="Type your message..."
                class="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 
                       bg-white dark:bg-black text-gray-900 dark:text-white 
                       border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400"
            />
            <button
                type="submit"
                disabled={loading}
                class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 
                       disabled:bg-blue-300 disabled:cursor-not-allowed
                       dark:disabled:bg-blue-800"
            >
                Send
            </button>
        </form>
    </div>
</div> 