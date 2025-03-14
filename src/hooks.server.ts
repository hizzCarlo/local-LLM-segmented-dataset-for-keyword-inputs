import { TRAINING_DATA } from '$lib/data/training-data';

async function trainModel() {
    try {
        const response = await fetch('http://localhost:11434/api/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: "deepseek-r1:1.5b",
                system: `You are an AI assistant trained to represent John Carlo. Here's what you know about him:\n${TRAINING_DATA}`,
                template: "{{ .System }}\n\nUser: {{ .Prompt }}\nAssistant: "
            })
        });

        if (!response.ok) {
            console.error('Failed to train model:', await response.text());
        }
    } catch (error) {
        console.error('Error training model:', error);
    }
}

export async function handle({ event, resolve }) {
    await trainModel();
    return resolve(event);
} 