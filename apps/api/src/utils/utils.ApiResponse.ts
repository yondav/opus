// src/utils/ApiResponse.ts

import type { Nullable } from './types.generic';

/**
 * ApiResponse class represents the structure of a response object.
 *
 * @template T - The type of the data payload.
 */
export class ApiResponse<T> {
  /**
   * Indicates whether the operation was successful.
   */
  readonly success: boolean;

  /**
   * The payload data of the response.
   */
  readonly data: Nullable<T>;

  /**
   * An optional error object in case the operation fails.
   */
  readonly error: Nullable<Error>;

  /**
   * A message describing the result of the operation.
   */
  readonly message: string;

  /**
   * Constructs an instance of the ApiResponse class.
   *
   * @param {boolean} success - Indicates whether the operation was successful.
   * @param {Nullable<T>} data - The payload data of the response.
   * @param {Nullable<Error>} error - An optional error object in case the operation fails.
   * @param {string} message - A message describing the result of the operation.
   */
  constructor(
    success: boolean,
    data: Nullable<T>,
    error: Nullable<Error>,
    message: string
  ) {
    this.success = success;
    this.data = data;
    this.error = error;
    this.message = message;
  }

  /**
   * Creates a successful ApiResponse instance with the provided data and message.
   *
   * @template T - The type of the data payload.
   * @param {T} data - The payload data of the response.
   * @param {string} message - A message describing the result of the operation.
   * @returns {ApiResponse<T>} - A successful ApiResponse instance.
   */
  static success<T>(data: T, message: string = 'Operation successful'): ApiResponse<T> {
    return new ApiResponse<T>(true, data, null, message);
  }

  /**
   * Creates an error ApiResponse instance with the provided error and message.
   *
   * @template T - The type of the data payload.
   * @param {Error} error - An optional error object in case the operation fails.
   * @param {string} message - A message describing the result of the operation.
   * @returns {ApiResponse<T>} - An error ApiResponse instance.
   */
  static error<T>(error: Error, message: string = 'Operation failed'): ApiResponse<T> {
    return new ApiResponse<T>(false, null, error, message);
  }

  /**
   * Creates an ApiResponse instance from an exception, extracting information from the exception object.
   *
   * @template T - The type of the data payload.
   * @param {Error} exception - An exception object.
   * @returns {ApiResponse<T>} - An ApiResponse instance representing the exception.
   */
  static fromException<T>(exception: Error): ApiResponse<T> {
    return new ApiResponse<T>(false, null, exception, exception.message ?? '');
  }
}
