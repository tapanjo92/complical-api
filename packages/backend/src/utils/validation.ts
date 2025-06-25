import { z } from 'zod';
import { DeadlineSchema, type Deadline } from '../types/deadline.js';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class DeadlineValidator {
  validate(deadline: unknown): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    try {
      // Validate schema
      const parsed = DeadlineSchema.parse(deadline);
      
      // Additional business logic validation
      const dateValidation = this.validateDates(parsed);
      errors.push(...dateValidation.errors);
      warnings.push(...dateValidation.warnings);
      
      // Check source URL is valid
      if (!this.isValidUrl(parsed.sourceUrl)) {
        errors.push(`Invalid source URL: ${parsed.sourceUrl}`);
      }
      
      // Ensure future dates for deadlines
      const dueDate = new Date(parsed.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (dueDate < today) {
        warnings.push(`Due date ${parsed.dueDate} is in the past`);
      }
      
      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        errors.push(...error.errors.map(e => `${e.path.join('.')}: ${e.message}`));
      } else {
        errors.push(`Validation error: ${error}`);
      }
      
      return {
        isValid: false,
        errors,
        warnings,
      };
    }
  }
  
  validateBatch(deadlines: unknown[]): {
    valid: Deadline[];
    invalid: Array<{ data: unknown; errors: string[] }>;
  } {
    const valid: Deadline[] = [];
    const invalid: Array<{ data: unknown; errors: string[] }> = [];
    
    for (const deadline of deadlines) {
      const result = this.validate(deadline);
      if (result.isValid) {
        valid.push(deadline as Deadline);
      } else {
        invalid.push({ data: deadline, errors: result.errors });
      }
    }
    
    return { valid, invalid };
  }
  
  private validateDates(deadline: Deadline): Omit<ValidationResult, 'isValid'> {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Validate date formats
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(deadline.dueDate)) {
      errors.push(`Invalid date format for dueDate: ${deadline.dueDate}`);
    }
    
    // Validate ISO datetime strings
    const isoDatetimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
    if (!isoDatetimeRegex.test(deadline.sourceVerifiedAt)) {
      errors.push(`Invalid datetime format for sourceVerifiedAt: ${deadline.sourceVerifiedAt}`);
    }
    if (!isoDatetimeRegex.test(deadline.lastUpdated)) {
      errors.push(`Invalid datetime format for lastUpdated: ${deadline.lastUpdated}`);
    }
    
    return { errors, warnings };
  }
  
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

export const deadlineValidator = new DeadlineValidator();