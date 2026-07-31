import { AppModule } from './app.module';

describe('AppModule baseline', () => {
  it('should be defined', () => {
    expect(AppModule).toBeDefined();
  });

  it('should be a constructable class', () => {
    expect(typeof AppModule).toBe('function');
  });
});
