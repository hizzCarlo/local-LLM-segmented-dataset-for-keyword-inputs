interface Pet {
    name: string;
    breed: string;
    color: string;
    details: string;
}

export const PETS_DATA = {
    dogs: [
        {
            name: 'Jake',
            breed: 'Mixed',
            color: 'Brown',
            details: 'One of John Carlo\'s beloved pets'
        },
        {
            name: 'Finn',
            breed: 'Mixed',
            color: 'White',
            details: 'John Carlo\'s second dog'
        }
    ] as Pet[]
};

export const PETS_KEYWORDS = [
    'pets', 
    'dogs', 
    'jake', 
    'finn', 
    'animal',
    'dog',
    'pet',
    'companion animal',
    'furry friend',
    'puppy'
]; 