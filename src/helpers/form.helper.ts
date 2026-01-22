import type { ActionState } from '../interaces';
import { z } from 'zod';

export const createInitialState = <T>(): ActionState<T> => {
  return {
    errors: {},
    message: '',
  };
};

export const handleZodError = <T>(error: unknown, rawData: Partial<T>) => {
  if (error instanceof z.ZodError) {
    // Convertir errores de Zod a formato más manejable
    const fielErrors: Partial<Record<keyof T, string>> = {};
    error.issues.forEach((issue) => {
      const field = issue.path[0] as keyof T;
      fielErrors[field] = issue.message;
    });

    return {
      errors: fielErrors,
      message: 'Por favor corregir los errores en el formulario',
      formData: rawData,
    };
  }
  return {
    errors: {},
    message: 'Por favor corregir los errores en el formulario',
    formData: rawData,
  };
};
