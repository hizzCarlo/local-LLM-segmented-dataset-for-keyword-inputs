import type { RequestHandler } from '@sveltejs/kit';
import * as segments from '$lib/data/segments';
import type { DataSegment } from '$lib/types';


const KEYWORD_MAP = {
    'john carlo': 'personal',
    'hizola': 'personal',
    'creator': 'personal',
    'favorite color': 'personal',

    'pets': 'pets',
    'dogs': 'pets',
    'jake': 'pets',
    'finn': 'pets',

    'education': 'education',
    'college': 'education',
    'gordon': 'education',
    'student': 'education',

    'projects': 'projects',
    'thesis': 'projects',
    'pokemon': 'projects',
    'pos': 'projects',

    'skills': 'skills',
    'programming': 'skills',
    'coding': 'skills',
    'development': 'skills',

    'hobbies': 'hobbies',
    'interests': 'hobbies',
    'gaming': 'hobbies',
    'art': 'hobbies'
};

const DATA_SEGMENTS: DataSegment[] = [
    {
        keywords: segments.PETS_KEYWORDS,
        data: segments.PETS_DATA,
        contextPrompt: "Here's information about John Carlo's pets:"
    },
    {
        keywords: segments.PERSONAL_KEYWORDS,
        data: segments.PERSONAL_INFO,
        contextPrompt: "Here's John Carlo's personal information:"
    },
    {
        keywords: segments.EDUCATION_KEYWORDS,
        data: segments.EDUCATION_DATA,
        contextPrompt: "Here's information about John Carlo's education:"
    },
    {
        keywords: segments.PROJECTS_KEYWORDS,
        data: segments.PROJECTS_DATA,
        contextPrompt: "Here's information about John Carlo's projects:"
    },
    {
        keywords: segments.SKILLS_KEYWORDS,
        data: segments.SKILLS_DATA,
        contextPrompt: "Here's information about John Carlo's skills and expertise:"
    },
    {
        keywords: segments.HOBBIES_KEYWORDS,
        data: segments.HOBBIES_DATA,
        contextPrompt: "Here's information about John Carlo's hobbies and interests:"
    }
];

export const POST: RequestHandler = async ({ request }) => {
    try {
        const { message, model } = await request.json();
        const lowercaseMessage = message.toLowerCase();
        
        // Check for matching keywords and get their categories
        const matchedCategories = Object.entries(KEYWORD_MAP)
            .filter(([keyword]) => lowercaseMessage.includes(keyword))
            .map(([, category]) => category);

        // If no keywords matched, return general response
        if (matchedCategories.length === 0) {
            const response = await fetch('http://localhost:11434/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: model,
                    prompt: `User: ${message}\nAssistant: Let me provide a general response.`,
                    stream: false
                })
            });

            const data = await response.json();
            const text = data.response.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

            return new Response(JSON.stringify({ response: text }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Get only the relevant segments based on matched categories
        const relevantSegments = DATA_SEGMENTS.filter(segment =>
            matchedCategories.includes(
                KEYWORD_MAP[segment.keywords[0] as keyof typeof KEYWORD_MAP]
            )
        );

        const context = relevantSegments
            .map(segment => `${segment.contextPrompt}\n${JSON.stringify(segment.data, null, 2)}`)
            .join('\n\n');

        const prompt = `Context about John Carlo:\n${context}\n\nUser: ${message}\nAssistant: Let me answer based on the relevant information about John Carlo.`;

        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: model,
                prompt: prompt,
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error(`Model API returned ${response.status}`);
        }

        const data = await response.json();
        const text = data.response.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

        return new Response(JSON.stringify({ response: text }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Chat API error:', error);
        return new Response(JSON.stringify({ 
            error: error instanceof Error ? error.message : 'Failed to process request' 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}; 
