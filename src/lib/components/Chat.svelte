<script lang="ts">
    import type { Message } from '$lib/types';

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
                body: JSON.stringify({ message: userMessage })
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

<div class="max-w-2xl mx-auto p-4">
    <div class="bg-white rounded-lg shadow-lg p-6">
        <div class="space-y-4 h-[500px] overflow-y-auto mb-4">
            {#each messages as message}
                <div class={`p-3 rounded-lg ${message.role === 'user' ? 'bg-blue-100 ml-auto' : 'bg-gray-100'} max-w-[80%]`}>
                    <p class="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
            {/each}
            {#if loading}
                <div class="bg-gray-100 p-3 rounded-lg max-w-[80%]">
                    <p class="text-sm">Thinking...</p>
                </div>
            {/if}
            {#if error}
                <div class="bg-red-100 p-3 rounded-lg max-w-[80%] text-red-700">
                    <p class="text-sm">{error}</p>
                </div>
            {/if}
        </div>
        
        <form on:submit|preventDefault={handleSubmit} class="flex gap-2">
            <input
                type="text"
                bind:value={userInput}
                placeholder="Type your message..."
                class="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
                type="submit"
                disabled={loading}
                class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
            >
                Send
            </button>
        </form>
    </div>
</div> 