import ContainerController from '../../../';
import UserRepository from '../repositories/UserRepository';
import AuthentificatorService from '../../externals/services/AuthentificatorService';
import bcrypt from 'bcrypt';
import { Request, Response } from 'express';

// Mock UserRepository methods
jest.mock('../repositories/UserRepository', () => ({
  findByGrandLineId: jest.fn(),
  create: jest.fn(),
}));

// Mock AuthentificatorService methods
jest.mock('../../externals/services/AuthentificatorService', () => ({
  generateAuthToken: jest.fn(),
}));

describe('ContainerController', () => {
  let containerController: ContainerController;
  let request: Request;
  let response: Response;

  beforeEach(() => {
    containerController = new ContainerController();
    request = {} as Request; // Mock Request object
    response = {} as Response; // Mock Response object
    response.status = jest.fn().mockReturnThis(); // Mock response.status method
    response.json = jest.fn().mockReturnThis(); // Mock response.json method
  });

  describe('authenticator method', () => {
    it('should return an authentication token on successful authentication', async () => {
      const grandLineId = 'testUser';
      const password = 'testPassword';
      const hashedPassword = await bcrypt.hash(password, 10);

      UserRepository.findByGrandLineId.mockResolvedValueOnce({
        grandLineId,
        password: hashedPassword,
        id: 'userId',
      });

      AuthentificatorService.generateAuthToken.mockReturnValueOnce('token');

      request.body = { grandLineId, password };

      await containerController.authenticator(request, response);

      expect(response.status).toHaveBeenCalledWith(200);
      expect(response.json).toHaveBeenCalledWith({ message: 'token' });
    });

    it('should return a 400 error for missing fields', async () => {
      const grandLineId = 'testUser';

      request.body = { grandLineId }; // Missing password

      await containerController.authenticator(request, response);

      expect(response.status).toHaveBeenCalledWith(400);
      expect(response.json).toHaveBeenCalledWith({
        message: 'Both grandLineId and password are required.',
      });
    });

    // Add more test cases for error conditions, incorrect passwords, etc.
  });

  describe('registrator method', () => {
    it('should create a new user and return a 201 status on success', async () => {
      const lastname = 'Doe';
      const firstname = 'John';
      const grandLineId = 'johndoe';
      const password = 'testPassword';

      const hashedPassword = await bcrypt.hash(password, 10);

      UserRepository.create.mockResolvedValueOnce({ id: 'userId' });

      request.body = { lastname, firstname, grandLineId, password };

      await containerController.registrator(request, response);

      expect(response.status).toHaveBeenCalledWith(201);
      expect(response.json).toHaveBeenCalledWith({ message: { id: 'userId' } });
    });

    it('should return a 400 error for missing fields', async () => {
      const lastname = 'Doe';
      const firstname = 'John';

      request.body = { lastname, firstname }; // Missing grandLineId and password

      await containerController.registrator(request, response);

      expect(response.status).toHaveBeenCalledWith(400);
      expect(response.json).toHaveBeenCalledWith({
        message: 'All fields are required.',
      });
    });

    // Add more test cases for error conditions, password length, etc.
  });
});
