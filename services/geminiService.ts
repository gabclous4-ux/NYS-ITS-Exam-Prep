import { GoogleGenAI, Type } from "@google/genai";
import type { QuizQuestion, StudyGuideResponse, Source, StudyTopic, Difficulty } from '../types';
import { getApiKey } from './apiKeyService';

const MODEL_NAME = 'gemini-2.5-flash';

const getAiClient = () => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("API Key not found. Please set it in the settings.");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateStudyGuide = async (topic: StudyTopic): Promise<StudyGuideResponse> => {
  try {
    const ai = getAiClient();

    let basePrompt = `
      You are an expert in Information Technology and career development, tasked with creating a study guide.

      Generate a comprehensive study guide for an aspiring **New York State Information Technology Specialist 3 and 4** on the topic of: **"${topic.title}"**.
    `;

    if (topic.officialDescription) {
      basePrompt += `
      
      The NYS examination board provides the following official description for this subject:
      _"${topic.officialDescription}"_

      Please ensure the study guide is strictly aligned with this official description.
      `;
    }

    let detailedInstructions = `

      The guide must be detailed, well-structured, and easy to understand. Structure the output in Markdown format and include the following sections:

      - ## Core Concepts
        - Explain the fundamental principles and key terminology. Use bullet points for clarity.

      - ## Key Responsibilities & Skills
        - Detail what a specialist at this level in NYS is expected to do and know regarding this topic.

      - ## Best Practices & Methodologies
        - Provide actionable advice, standard procedures, and proven methodologies relevant to NYS government IT.

      - ## Practical Scenarios/Examples
        - Give at least two real-world examples or scenarios to illustrate the concepts in a practical NYS IT environment.

      - ## Potential Interview Questions
        - List 3-5 relevant interview questions. For each question, provide a brief explanation of what a strong answer should cover.

      Ensure the language is professional and tailored to someone preparing for a senior technical specialist role within New York State. Use bold text for emphasis on key terms.
    `;
    
    if (topic.title === 'Logical Reasoning using Flowcharts') {
      detailedInstructions += `
        For the "Practical Scenarios/Examples" section, you MUST create flowchart diagrams for each example.
        Represent these diagrams using **Mermaid syntax** inside a markdown code block.
        **CRITICAL MERMAID RULES**:
        1. The graph definition (e.g., \`graph TD\`) MUST be on its own line.
        2. Use ONLY standard arrows \`-->\`.
        3. Enclose node text with special characters in double quotes (e.g., \`A["Node with > char"]\`).

        Example:
        \`\`\`mermaid
        graph TD
            A[Start] --> B{Is it a good idea?};
            B -->|Yes| C[Do it];
            B -->|No| D[Don't do it];
            C --> E[End];
            D --> E[End];
        \`\`\`
      `;
    }

    const prompt = basePrompt + detailedInstructions;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const sources: Source[] = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map(chunk => ({
        uri: chunk.web?.uri || '',
        title: chunk.web?.title || 'Untitled Source',
      }))
      .filter(source => source.uri) || [];

    return {
      content: response.text,
      sources,
    };

  } catch (error) {
    console.error("Error generating study guide:", error);
    if (error instanceof Error) {
        throw new Error(`An error occurred while generating the study guide: ${error.message}. Please check your API key and network connection.`);
    }
    throw new Error("An unknown error occurred while generating the study guide.");
  }
};


export const generateQuiz = async (topic: StudyTopic, difficulty: Difficulty): Promise<QuizQuestion[]> => {
  try {
    const ai = getAiClient();
    
    let difficultyInstruction = '';
    switch (difficulty) {
      case 'easy':
        difficultyInstruction = 'The questions should be **easy**, focusing on foundational concepts and definitions.';
        break;
      case 'medium':
        difficultyInstruction = 'The questions should be of **medium** difficulty, focusing on applying concepts to practical situations.';
        break;
      case 'hard':
        difficultyInstruction = 'The questions should be **hard**, presenting complex, multi-step scenarios that require deep analysis and synthesis of information.';
        break;
    }

    let prompt = `
      Create a multiple-choice quiz with 5 questions for a **New York State Information Technology Specialist 3 and 4** on the topic: **"${topic.title}"**.
      
      **Difficulty Level: ${difficulty.toUpperCase()}**. ${difficultyInstruction}
      
      ${topic.officialDescription ? `The questions must be strictly based on the following official examination subject description: "${topic.officialDescription}"` : ''}
      The questions should reflect scenarios and terminology relevant to a government IT environment.
      For each question, provide 4 distinct options.
      Indicate the correct answer and provide a brief, clear explanation for why it's correct.
    `;

    if (topic.title === 'Logical Reasoning using Flowcharts') {
      prompt += `
        \n**IMPORTANT INSTRUCTIONS FOR FLOWCHARTS**:
        1. For each question, you MUST generate a flowchart diagram to be analyzed.
        2. The diagram must be represented using valid **Mermaid syntax** for a Top-Down graph (\`graph TD\`).
        3. **CRITICAL STRUCTURE**: The graph definition (e.g., \`graph TD\`) MUST be on its own line. All node and link definitions must start on new lines following it.
        4. Embed the Mermaid syntax inside the 'question' field of the JSON output, enclosed in a markdown code block (\`\`\`mermaid ... \`\`\`).
        5. **CRITICAL SYNTAX - NODES**: Ensure all node text containing special characters (like \`>\`, \`<\`, \`=\`, \`(\`, \`)\`, \`-\`) is enclosed in double quotes. For example: \`A["Is X > 5?"] --> B\`.
        6. **CRITICAL SYNTAX - LINKS**: Use ONLY the standard arrow \`-->\` for links. Do NOT use elongated arrows like \`------>\`. Always use quotes for link text: \`C -->|"Valid"| E\`.
        7. The text of the question should precede the flowchart and ask the user to interpret it.
        
        Here is a good example of a question with a valid flowchart, pay close attention to the structure:
        "A process checks for software compatibility. Given the flowchart below, what happens if OS_Version is "Windows 11" and Required_Version is "Windows 10"?
        \`\`\`mermaid
        graph TD
            A[Start] --> B{"Check OS Version"};
            B -->|"OS_Version >= Required_Version"| C[Proceed with Installation];
            B -->|"OS_Version < Required_Version"| D[Show Compatibility Error];
            C --> E[End];
            D --> E[End];
        \`\`\`"
      `;
    }

    const quizSchema = {
      type: Type.OBJECT,
      properties: {
        quiz: {
          type: Type.ARRAY,
          description: "A list of quiz questions.",
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING, description: "The quiz question, which may include Mermaid syntax for flowcharts." },
              options: {
                type: Type.ARRAY,
                description: "An array of 4 possible answers.",
                items: { type: Type.STRING },
              },
              correctAnswerIndex: {
                type: Type.INTEGER,
                description: "The 0-based index of the correct answer in the 'options' array.",
              },
              explanation: {
                type: Type.STRING,
                description: "A brief explanation for the correct answer.",
              },
            },
            required: ["question", "options", "correctAnswerIndex", "explanation"],
          },
        },
      },
      required: ["quiz"],
    };

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: quizSchema,
      },
    });
    
    const jsonResponse = JSON.parse(response.text);
    return jsonResponse.quiz || [];
  } catch (error) {
     console.error("Error generating quiz:", error);
     throw new Error("Failed to generate the quiz. The AI model may be temporarily unavailable.");
  }
};
