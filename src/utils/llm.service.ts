import { InternalServerErrorException } from '@nestjs/common';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const askLLM = async (
  text: string,
): Promise<Record<string, string> | undefined> => {
  const prompt = `Given the contract text below, extract and return a JSON object with the following **exact fields**. 
  Do not include any additional fields, and use the property names and structure **exactly as shown**. 
  If any optional data is not present in the text, return the field with null or empty string. 
  Return a valid JSON object only.
  
  Field schema:
  {
    "parts_involved": {
      "contractor": {
        "name": "string",
        "identifier": "string" // CPF or CNPJ
      },
      "contracted": {
        "name": "string",
        "identifier": "string" // CPF or CNPJ
      }
    },
    "contract_value": {
      "value": "string",
      "payment_schedule": [
        {
          "percentage": "string",
          "payment_due": "string"
        }
      ]
    },
    "signature_data": [
      {
        "name": "string",
        "role": "string", // contractor, contracted, or witness
        "identifier": "string", // CPF or CNPJ
        "date": "string"
      }
    ],
    "clause_fine": {
      "clause": "string",
      "value": "string"
    },
    "clause_prize": {
      "clause": "string",
      "value": "string",
      "details": "string"
    },
    "clause_duration": {
      "clause": "string",
      "duration": "string",
      "start_date": "string"
    },
    "created_at": "string" // format: YYYY-MM-DD
  }
  // Return only a JSON object. Do not include explanations, notes, or formatting outside the JSON.Document: 

  // """${text}"""`;

  const response = await groq.chat.completions.create(
    {
      model: 'llama3-70b-8192',
      messages: [
        {
          role: 'system',
          content:
            'You are a juridical expert assistant. Respond only in JSON.',
        },
        { role: 'user', content: prompt },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
    },
  );

  const message = response.choices[0]?.message?.content;

  if (!message) {
    throw new InternalServerErrorException('No message returned from LLM');
  }

  try {
    return JSON.parse(message || '{}') as Record<string, string>;
  } catch (err) {
    console.error('Unexpected error parsing LLM response', err);
  }
};
