import type { RequestHandler } from '@sveltejs/kit';
import * as segments from '$lib/data/segments';
import type { DataSegment } from '$lib/types';
import natural from 'natural';
import { SYNONYMS } from '$lib/data/synonyms';


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


const tokenizer = new natural.WordTokenizer();
const lemmatizer = natural.LancasterStemmer;


function levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];

    
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

   
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            const cost = a[j - 1] === b[i - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,      // deletion
                matrix[i][j - 1] + 1,      // insertion
                matrix[i - 1][j - 1] + cost // substitution
            );
        }
    }

    return matrix[b.length][a.length];
}

// Calculate similarity score (0-1) based on Levenshtein distance
function stringSimilarity(a: string, b: string): number {
    if (a.length === 0 || b.length === 0) return 0;
    const distance = levenshteinDistance(a, b);
    const maxLength = Math.max(a.length, b.length);
    return 1 - distance / maxLength;
}

function tokenizeAndLemmatize(text: string): string[] {
    const tokens = tokenizer.tokenize(text) || [];
    return tokens.map(token => lemmatizer.stem(token.toLowerCase()));
}

function findSimilarKeywords(input: string, keywords: string[]): string[] {
    const inputTokens = tokenizeAndLemmatize(input);
    const matches = new Set<string>();

    // Expand input tokens with synonyms
    const expandedInputTokens = [...inputTokens];
    inputTokens.forEach(token => {
        // Check if the token is a synonym of any word in our dictionary
        Object.entries(SYNONYMS).forEach(([word, synonyms]) => {
            if (synonyms.some(synonym => 
                stringSimilarity(token, synonym) > 0.8 || 
                token.includes(synonym) || 
                synonym.includes(token)
            )) {
                expandedInputTokens.push(word);
            }
        });
    });

    // Direct matching with lemmatization using expanded tokens
    keywords.forEach(keyword => {
        const keywordTokens = tokenizeAndLemmatize(keyword);
        
       
        if (expandedInputTokens.some(inputToken => 
            keywordTokens.some(keywordToken => 
              
                inputToken === keywordToken || 
                stringSimilarity(inputToken, keywordToken) > 0.8
            )
        )) {
            matches.add(keyword);
        }
    });

    // Fuzzy matching for multi-word keywords
    keywords.forEach(keyword => {
        
        const keywordSynonyms = Object.entries(SYNONYMS)
            .filter(([word]) => keyword.includes(word))
            .flatMap(([, synonyms]) => synonyms);
        
      
        const similarity = stringSimilarity(input.toLowerCase(), keyword.toLowerCase());
        if (similarity > 0.8) {
            matches.add(keyword);
        }
        
   
        keywordSynonyms.forEach(synonym => {
            const synSimilarity = stringSimilarity(input.toLowerCase(), synonym.toLowerCase());
            if (synSimilarity > 0.8) {
                matches.add(keyword);
            }
        });
    });

    return Array.from(matches);
}

export const POST: RequestHandler = async ({ request }) => {
    try {
        const { message, model } = await request.json();
        const lowercaseMessage = message.toLowerCase();
        
    
        const allKeywords = Object.keys(KEYWORD_MAP);
        
     
        const similarKeywords = findSimilarKeywords(lowercaseMessage, allKeywords);
        
      
        const matchedCategories = similarKeywords
            .map(keyword => KEYWORD_MAP[keyword as keyof typeof KEYWORD_MAP])
            .filter((category): category is string => category !== undefined);

      
        const uniqueCategories = Array.from(new Set(matchedCategories));
        
       
        if (uniqueCategories.length === 0) {
           
            const allSegmentKeywords: string[] = [];
            DATA_SEGMENTS.forEach(segment => {
                allSegmentKeywords.push(...segment.keywords);
            });
            
           
            const similarSegmentKeywords = findSimilarKeywords(lowercaseMessage, allSegmentKeywords);
            
       
            similarSegmentKeywords.forEach(keyword => {
                DATA_SEGMENTS.forEach(segment => {
                    if (segment.keywords.includes(keyword)) {
                        const category = KEYWORD_MAP[segment.keywords[0] as keyof typeof KEYWORD_MAP];
                        if (category) {
                            uniqueCategories.push(category);
                        }
                    }
                });
            });
        }
        
        console.log('User message:', message);
        console.log('Matched keywords:', similarKeywords);
        console.log('Matched categories:', Array.from(new Set(uniqueCategories)));

 
        if (uniqueCategories.length === 0) {
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

       
        const relevantSegments = DATA_SEGMENTS.filter(segment => {
            const segmentCategory = KEYWORD_MAP[segment.keywords[0] as keyof typeof KEYWORD_MAP];
            return uniqueCategories.includes(segmentCategory);
        });

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