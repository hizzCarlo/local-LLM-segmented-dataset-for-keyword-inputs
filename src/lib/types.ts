export interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export interface ChatResponse {
    response: string;
    error?: string;
}

export interface PetsData {
    dogs: {
        name: string;
        breed: string;
        color: string;
        details: string;
    }[];
}

export interface PersonalInfo {
    name: string;
    occupation: string;
    college: string;
    favoriteColor: string;
    about: string;
}

export interface EducationData {
    college: string;
    course: string;
    status: string;
    focus: string;
    interests: string[];
}

export interface ProjectsData {
    thesis: {
        name: string;
        description: string;
        focus: string;
    };
    other: (string | { name: string; type: string; description: string; })[];
}

export interface SkillsData {
    programming: string[];
    areas: string[];
    expertise: string[];
}

export interface HobbiesData {
    activities: string[];
    interests: string[];
}

export interface DataSegment {
    keywords: string[];
    data: PetsData | PersonalInfo | EducationData | ProjectsData | SkillsData | HobbiesData;
    contextPrompt: string;
} 