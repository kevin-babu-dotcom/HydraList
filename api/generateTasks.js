// api/generateTasks.js

// This is a serverless function that runs in a Node.js environment.

export default async function handler(req, res) {
  // We only want to handle POST requests to this endpoint.
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    // Get the completed task's context from the request body sent by our React app.
    const { fullTaskContext } = req.body;

    if (!fullTaskContext) {
      return res.status(400).json({ error: 'fullTaskContext is required' });
    }

    // Access the Hugging Face token from server-side environment variables.
    // NOTE: For this to work on platforms like Vercel, the variable name must NOT have the VITE_ prefix.
    const HF_TOKEN = process.env.HF_TOKEN;

    if (!HF_TOKEN) {
        return res.status(500).json({ error: 'HF_TOKEN is not configured on the server.' });
    }

    // Now, we securely call the Hugging Face API from our server.
    const response = await fetch(
      'https://api-inference.huggingface.co/models/google/gemma-7b-it',
      {
        headers: {
          'Authorization': `Bearer ${HF_TOKEN}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          inputs: `[INST]You just completed this task: "${fullTaskContext}"

Now generate exactly 2 new follow-up tasks that would naturally result from completing this task. 

Return the tasks in this exact format, and nothing else:
TASK 1:
TITLE: [brief task title]
DESCRIPTION: [detailed description of what needs to be done]

TASK 2:
TITLE: [brief task title] 
DESCRIPTION: [detailed description of what needs to be done][/INST]`,
          parameters: {
            max_new_tokens: 200,
            temperature: 0.7,
            return_full_text: false
          }
        }),
      }
    );

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Hugging Face API Error:", errorText);
        // Pass the error from Hugging Face back to our client
        return res.status(response.status).json({ error: `Hugging Face API failed: ${errorText}` });
    }

    const aiResult = await response.json();
    const generatedText = aiResult.generated_text || (Array.isArray(aiResult) && aiResult[0]?.generated_text) || '';

    // Send the successful result back to our React app.
    res.status(200).json({ generated_text: generatedText });

  } catch (error) {
    console.error('Error in generateTasks function:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}