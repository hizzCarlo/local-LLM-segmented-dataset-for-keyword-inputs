<script lang="ts">
    import Chat from '$lib/components/Chat.svelte';
</script>

<div class="min-h-screen bg-gray-100 py-6">
    <div class="max-w-4xl mx-auto px-4">
        <div class="flex items-center justify-center gap-4 mb-8">
            <div class="bg-black rounded-full p-2 border-2 border-white shadow-lg">
                <img 
                    src="/r1d2.png" 
                    alt="R1D2 Logo" 
                    class="w-12 h-12 object-contain"
                />
            </div>
            <h1 class="text-3xl font-bold text-center">R1D2 AI-Chatbot</h1>
        </div>
        <Chat />
    </div>
</div>
