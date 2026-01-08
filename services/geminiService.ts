
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

export const analyzeMatch = async (
  jobDescription: string,
  resume: string,
  apiKey: string
): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analise a compatibilidade entre esta descrição de vaga e este currículo.
    
    Vaga:
    ${jobDescription}
    
    Currículo:
    ${resume}
    `,
    config: {
      systemInstruction: "Você é um especialista em Recrutamento e Seleção e Personal Branding. Analise o currículo contra a vaga. Além da análise técnica, gere um post de LinkedIn persuasivo para o candidato e uma query de busca de vagas ideal (ex: 'Desenvolvedor React Senior remoto'). Retorne sempre em formato JSON.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          strengths: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Pontos onde o currículo atende perfeitamente à vaga."
          },
          weaknesses: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Gaps técnicos ou comportamentais identificados."
          },
          improvementPlan: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Passos práticos para melhorar o perfil para essa vaga específica."
          },
          interviewTips: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Dicas de como se portar ou o que enfatizar em uma entrevista."
          },
          linkedinPost: {
            type: Type.STRING,
            description: "Um rascunho de post para o LinkedIn que destaque as habilidades do candidato para sua rede."
          },
          jobSearchQuery: {
            type: Type.STRING,
            description: "Uma string otimizada para busca de vagas no LinkedIn (ex: Cargo + Principais Skills)."
          }
        },
        required: ["strengths", "weaknesses", "improvementPlan", "interviewTips", "linkedinPost", "jobSearchQuery"],
        propertyOrdering: ["strengths", "weaknesses", "improvementPlan", "interviewTips", "linkedinPost", "jobSearchQuery"]
      }
    }
  });

  try {
    const data = JSON.parse(response.text);
    return data as AnalysisResult;
  } catch (error) {
    console.error("Erro ao processar resposta do Gemini:", error);
    throw new Error("Falha ao analisar os dados. Tente novamente.");
  }
};
