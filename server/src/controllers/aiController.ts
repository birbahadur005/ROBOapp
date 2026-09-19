import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { GeminiService } from '../services/geminiService';

const askAiSchema = z.object({
  question: z.string().min(1, 'Question cannot be empty').max(500, 'Question too long'),
  language: z.enum(['en', 'hi']).default('en')
});

export class AIController {
  public static async ask(req: Request, res: Response, next: NextFunction) {
    try {
      const { question, language } = askAiSchema.parse(req.body);

      const answer = await GeminiService.askAssistant(question, language);

      res.json({
        success: true,
        answer
      });
    } catch (err) {
      next(err);
    }
  }
}
