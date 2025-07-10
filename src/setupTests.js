// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toBeInTheDocument()
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock do window.confirm para testes
global.confirm = jest.fn(() => true);

// Mock do navigator.clipboard para testes
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

// Mock do window.open para testes
global.open = jest.fn();

// Aumentar timeout global para testes assíncronos
jest.setTimeout(10000);

// Mock do console.log para reduzir ruído nos testes
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
};