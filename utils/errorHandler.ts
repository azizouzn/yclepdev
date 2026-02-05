/**
 * Centralized Error Handling & Validation Module
 * Provides structured error responses, validation helpers, and logging
 */

import { logger } from './logger';

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  statusCode: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: string;
}

export class ValidationError extends Error {
  constructor(
    public field: string,
    message: string,
    public statusCode = 400
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(resource: string, id: unknown) {
    super(`${resource} with id ${id} not found`);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized access') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

/**
 * Standardized error response builder
 */
export function buildErrorResponse(error: unknown): ApiResponse<null> {
  let apiError: ApiError;

  if (error instanceof ValidationError) {
    apiError = {
      code: 'VALIDATION_ERROR',
      message: error.message,
      details: { field: error.field },
      statusCode: error.statusCode
    };
  } else if (error instanceof NotFoundError) {
    apiError = {
      code: 'NOT_FOUND',
      message: error.message,
      statusCode: 404
    };
  } else if (error instanceof UnauthorizedError) {
    apiError = {
      code: 'UNAUTHORIZED',
      message: error.message,
      statusCode: 401
    };
  } else if (error instanceof Error) {
    apiError = {
      code: 'INTERNAL_ERROR',
      message: error.message,
      statusCode: 500
    };
    logger.error(`Unhandled error: ${error.message}`, error);
  } else {
    apiError = {
      code: 'UNKNOWN_ERROR',
      message: 'An unknown error occurred',
      statusCode: 500
    };
    logger.error('Unknown error type caught', error);
  }

  return {
    success: false,
    error: apiError,
    timestamp: new Date().toISOString()
  };
}

/**
 * Success response builder
 */
export function buildSuccessResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString()
  };
}

/**
 * Input validation helpers
 */
export const validators = {
  isString: (val: unknown): val is string => typeof val === 'string' && val.length > 0,
  isNumber: (val: unknown): val is number => typeof val === 'number' && !isNaN(val),
  isEmail: (val: unknown): val is string => {
    if (!validators.isString(val)) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  },
  isUrl: (val: unknown): val is string => {
    if (!validators.isString(val)) return false;
    try {
      new URL(val);
      return true;
    } catch {
      return false;
    }
  },
  isArray: (val: unknown): val is unknown[] => Array.isArray(val),
  isObject: (val: unknown): val is Record<string, unknown> => typeof val === 'object' && val !== null && !Array.isArray(val)
};

/**
 * Safe JSON parse with error handling
 */
export function safeJsonParse(json: string): Record<string, unknown> | null {
  try {
    return JSON.parse(json) as Record<string, unknown>;
  } catch (error) {
    logger.error('Failed to parse JSON', { error, json: json.substring(0, 100) });
    return null;
  }
}

/**
 * Assert-like helper for runtime type checking
 */
export function assertType<T>(
  value: unknown,
  guard: (val: unknown) => val is T,
  fieldName: string
): T {
  if (!guard(value)) {
    throw new ValidationError(fieldName, `Invalid type for field: ${fieldName}`);
  }
  return value;
}
