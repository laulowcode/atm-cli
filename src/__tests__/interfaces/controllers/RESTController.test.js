import { jest } from '@jest/globals';
import { RESTController } from '../../../interfaces/controllers/RESTController.js';

describe('RESTController', () => {
  let controller;
  let mockPresenter;
  let mockSessionManager;
  let mockUseCases;
  let mockRequest;
  let mockResponse;

  beforeEach(() => {
    // Mock dependencies
    mockPresenter = {
      formatDeposit: jest.fn(),
      formatWithdraw: jest.fn(),
      formatTransfer: jest.fn(),
      formatLogin: jest.fn(),
      formatLogout: jest.fn(),
      formatError: jest.fn()
    };

    mockSessionManager = {
      getCurrentUser: jest.fn(),
      login: jest.fn(),
      logout: jest.fn()
    };

    mockUseCases = {
      depositMoney: { execute: jest.fn() },
      withdrawMoney: { execute: jest.fn() },
      transferMoney: { execute: jest.fn() },
      loginUser: { execute: jest.fn() },
      logoutUser: { execute: jest.fn() }
    };

    controller = new RESTController(mockPresenter, mockSessionManager, mockUseCases);

    // Mock Express request/response
    mockRequest = {
      body: {},
      params: {},
      query: {}
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  describe('deposit', () => {
    test('should call depositMoney use case and return formatted response', () => {
      mockRequest.body = { amount: 100 };
      mockSessionManager.getCurrentUser.mockReturnValue('Alice');
      mockUseCases.depositMoney.execute.mockReturnValue({ balance: 100, logs: [], remainingDebts: [] });
      mockPresenter.formatDeposit.mockReturnValue({ balance: 100 });

      controller.deposit(mockRequest, mockResponse);

      expect(mockSessionManager.getCurrentUser).toHaveBeenCalled();
      expect(mockUseCases.depositMoney.execute).toHaveBeenCalledWith('Alice', 100);
      expect(mockPresenter.formatDeposit).toHaveBeenCalledWith({ 
        balance: 100,
        logs: [],
        remainingDebts: []
      });      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ balance: 100 });
    });
  });

  describe('withdraw', () => {
    test('should call withdrawMoney use case and return formatted response', () => {
      mockRequest.body = { amount: 50 };
      mockSessionManager.getCurrentUser.mockReturnValue('Bob');
      mockUseCases.withdrawMoney.execute.mockReturnValue({ balance: 50 });
      mockPresenter.formatWithdraw.mockReturnValue({ balance: 50 });

      controller.withdraw(mockRequest, mockResponse);

      expect(mockUseCases.withdrawMoney.execute).toHaveBeenCalledWith('Bob', 50);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalled();
    });
  });

  describe('transfer', () => {
    test('should call transferMoney use case and return formatted response', () => {
      mockRequest.body = { receiverName: 'Charlie', amount: 30 };
      mockSessionManager.getCurrentUser.mockReturnValue('Alice');
      mockUseCases.transferMoney.execute.mockReturnValue({ 
        senderNewBalance: 70 
      });
      mockPresenter.formatTransfer.mockReturnValue({ 
        message: 'Transfer successful' 
      });

      controller.transfer(mockRequest, mockResponse);

      expect(mockUseCases.transferMoney.execute).toHaveBeenCalledWith(
        'Alice', 
        'Charlie', 
        30
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    test('should call loginUser use case and return formatted response', () => {
      mockRequest.body = { name: 'Alice' };
      mockUseCases.loginUser.execute.mockReturnValue({ 
        name: 'Alice', 
        balance: 0 
      });
      mockPresenter.formatLogin.mockReturnValue({ 
        message: 'Hello, Alice!' 
      });

      controller.login(mockRequest, mockResponse);

      expect(mockUseCases.loginUser.execute).toHaveBeenCalledWith('Alice');
      expect(mockPresenter.formatLogin).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });

  describe('logout', () => {
    test('should call logoutUser use case and return formatted response', () => {
      mockSessionManager.getCurrentUser.mockReturnValue('Alice');
      mockPresenter.formatLogout.mockReturnValue({ message: 'Goodbye!' });

      controller.logout(mockRequest, mockResponse);

      expect(mockUseCases.logoutUser.execute).toHaveBeenCalledWith('Alice');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });
});