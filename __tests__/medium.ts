import { createMedium } from '../src';

describe('medium', () => {
  const tick = () => new Promise((resolve) => setTimeout(resolve, 10));

  it('set/read', () => {
    const medium = createMedium(42);
    expect(medium.read()).toBe(42);
    medium.useMedium(24);
    expect(medium.read()).toBe(24);
    medium.useMedium(100);
    expect(medium.read()).toBe(100);
  });

  it('set/use - async', async () => {
    const medium = createMedium<number>();
    medium.useMedium(42);
    medium.useMedium(24);

    const spy = jest.fn();
    const result: number[] = [];

    medium.assignMedium((arg) => {
      spy(arg);
      result.push(arg);

      if (arg === 42) {
        medium.useMedium(100);
      }
    });

    expect(spy).toHaveBeenCalledWith(42);
    expect(spy).toHaveBeenCalledWith(24);

    expect(result).toEqual([42, 24]);

    await tick();

    expect(result).toEqual([42, 24, 100]);
  });

  it('set/use - sync', () => {
    const medium = createMedium<number>();
    medium.useMedium(42);
    medium.useMedium(24);

    const spy = jest.fn();
    const result: number[] = [];

    medium.assignSyncMedium((arg) => {
      spy(arg);
      result.push(arg);

      if (arg === 42) {
        medium.useMedium(100);
      }
    });

    expect(spy).toHaveBeenCalledWith(42);
    expect(spy).toHaveBeenCalledWith(24);

    expect(result).toEqual([42, 24, 100]);
  });

  it('Push new values', async () => {
    const medium = createMedium<number>();
    medium.useMedium(42);

    const spy = jest.fn();
    const result: number[] = [];

    medium.assignMedium((arg) => {
      spy(arg);
      result.push(arg);
    });

    medium.useMedium(24);

    expect(spy).toHaveBeenCalledWith(42);
    expect(spy).not.toHaveBeenCalledWith(24);
    expect(result).toEqual([42]);

    await tick();

    expect(spy).toHaveBeenCalledWith(24);

    expect(result).toEqual([42, 24]);
  });

  it('Push new values sync', async () => {
    const medium = createMedium<number>();
    medium.useMedium(42);

    const spy = jest.fn();
    const result: number[] = [];

    medium.assignSyncMedium((arg) => {
      spy(arg);
      result.push(arg);
    });

    medium.useMedium(24);

    expect(spy).toHaveBeenCalledWith(42);
    expect(spy).toHaveBeenCalledWith(24);
    expect(result).toEqual([42, 24]);

    await tick();

    expect(result).toEqual([42, 24]);
  });

  it('ts test for import', () => {
    const utilMedium = createMedium<(cb: typeof import('../src/hoc')) => void>();

    utilMedium.useMedium((test) => {
      expect(test.sidecar(42 as any)).toBe(42);
    });

    const spy = jest.fn().mockImplementation((a) => a);
    utilMedium.assignMedium((cb) => cb({ sidecar: spy }));

    expect(spy).toHaveBeenCalledWith(42);
  });
});
