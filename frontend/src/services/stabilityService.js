import axios from 'axios';

const STABILITY_API_KEY = import.meta.env.VITE_STABILITY_API_KEY;
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 2000; // 2 seconds

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const generateImageWithRetry = async (prompt, retryCount = 0) => {
    try {
        const response = await axios.post(
            'https://api.stability.ai/v1/generation/stable-diffusion-v1-6/text-to-image',
            {
                text_prompts: [{ text: prompt }],
                cfg_scale: 7,
                height: 512,
                width: 512,
                steps: 30,
                samples: 1,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    Authorization: `Bearer ${STABILITY_API_KEY}`,
                },
            }
        );

        if (!response.data || !response.data.artifacts || !response.data.artifacts[0]) {
            throw new Error('Invalid response from Stability AI');
        }

        return `data:image/png;base64,${response.data.artifacts[0].base64}`;
    } catch (error) {
        if (error.response?.status === 429) {
            if (retryCount >= MAX_RETRIES) {
                throw new Error('Rate limit exceeded. Maximum retries reached.');
            }

            // Get retry delay from headers or use exponential backoff
            const retryAfter = error.response.headers['retry-after'];
            const delay = retryAfter ? retryAfter * 1000 : INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
            
            console.log(`Rate limit hit. Retrying in ${delay/1000} seconds... (Attempt ${retryCount + 1}/${MAX_RETRIES})`);
            await sleep(delay);
            
            return generateImageWithRetry(prompt, retryCount + 1);
        }

        if (error.response?.status === 401) {
            throw new Error('Invalid Stability AI API key. Please check your configuration.');
        }

        if (error.response?.status === 400) {
            throw new Error('Invalid prompt or parameters: ' + (error.response.data?.message || error.message));
        }

        console.error('Stability AI Error:', error.response?.data || error.message);
        throw new Error('Failed to generate image: ' + (error.response?.data?.message || error.message));
    }
};

export const generateImage = async (prompt) => {
    if (!STABILITY_API_KEY) {
        throw new Error('Stability AI API key not found. Please add VITE_STABILITY_API_KEY to your .env file');
    }

    if (!prompt) {
        throw new Error('Prompt is required');
    }

    try {
        return await generateImageWithRetry(prompt);
    } catch (error) {
        console.error('Image generation failed:', error);
        throw error;
    }
};