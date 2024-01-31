import { ApiResponse } from '../utils.ApiResponse';

describe('ApiResponse', () => {
  describe('constructor', () => {
    it('should create an instance of ApiResponse', () => {
      const response = new ApiResponse(true, 'data', null, 'Success message');

      expect(response).toBeInstanceOf(ApiResponse);
      expect(response.success).toBe(true);
      expect(response.data).toBe('data');
      expect(response.error).toBe(null);
      expect(response.message).toBe('Success message');
    });
  });

  describe('success', () => {
    it('should create a successful ApiResponse instance', () => {
      const successResponse = ApiResponse.success('successData', 'Success message');

      expect(successResponse.success).toBe(true);
      expect(successResponse.data).toBe('successData');
      expect(successResponse.error).toBe(null);
      expect(successResponse.message).toBe('Success message');
    });
  });

  describe('error', () => {
    it('should create an error ApiResponse instance', () => {
      const errorResponse = ApiResponse.error(
        new Error('Error message'),
        'Failure message'
      );

      expect(errorResponse.success).toBe(false);
      expect(errorResponse.data).toBe(null);
      expect(errorResponse.error).toBeInstanceOf(Error);
      expect(errorResponse.error?.message).toBe('Error message');
      expect(errorResponse.message).toBe('Failure message');
    });
  });

  describe('fromException', () => {
    it('should create an ApiResponse instance from an exception', () => {
      const exceptionResponse = ApiResponse.fromException(new Error('Exception message'));

      expect(exceptionResponse.success).toBe(false);
      expect(exceptionResponse.data).toBe(null);
      expect(exceptionResponse.error).toBeInstanceOf(Error);
      expect(exceptionResponse.error?.message).toBe('Exception message');
      expect(exceptionResponse.message).toBe('Exception message');
    });

    it('should handle exceptions without a message', () => {
      const exceptionResponse = ApiResponse.fromException(new Error());

      expect(exceptionResponse.success).toBe(false);
      expect(exceptionResponse.data).toBe(null);
      expect(exceptionResponse.error).toBeInstanceOf(Error);
      expect(exceptionResponse.error?.message).toBe('');
      expect(exceptionResponse.message).toBe('');
    });
  });
});
