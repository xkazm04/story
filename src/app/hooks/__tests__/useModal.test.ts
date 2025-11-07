import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useModal,
  useModalWithData,
  useModals,
  useConfirmation,
} from '../useModal';

describe('useModal', () => {
  it('should initialize with default closed state', () => {
    const { result } = renderHook(() => useModal());

    expect(result.current.isOpen).toBe(false);
  });

  it('should initialize with provided initial state', () => {
    const { result } = renderHook(() => useModal(true));

    expect(result.current.isOpen).toBe(true);
  });

  it('should open modal', () => {
    const { result } = renderHook(() => useModal());

    act(() => {
      result.current.open();
    });

    expect(result.current.isOpen).toBe(true);
  });

  it('should close modal', () => {
    const { result } = renderHook(() => useModal(true));

    act(() => {
      result.current.close();
    });

    expect(result.current.isOpen).toBe(false);
  });

  it('should toggle modal state', () => {
    const { result } = renderHook(() => useModal());

    act(() => {
      result.current.toggle();
    });
    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.toggle();
    });
    expect(result.current.isOpen).toBe(false);
  });

  it('should set modal state directly', () => {
    const { result } = renderHook(() => useModal());

    act(() => {
      result.current.setIsOpen(true);
    });
    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.setIsOpen(false);
    });
    expect(result.current.isOpen).toBe(false);
  });
});

describe('useModalWithData', () => {
  type TestData = { id: string; name: string };

  it('should initialize with no data', () => {
    const { result } = renderHook(() => useModalWithData<TestData>());

    expect(result.current.isOpen).toBe(false);
    expect(result.current.data).toBeUndefined();
  });

  it('should initialize with provided data', () => {
    const initialData: TestData = { id: '1', name: 'Test' };
    const { result } = renderHook(() => useModalWithData<TestData>(initialData));

    expect(result.current.data).toEqual(initialData);
  });

  it('should open modal with data', () => {
    const { result } = renderHook(() => useModalWithData<TestData>());
    const testData: TestData = { id: '1', name: 'Test' };

    act(() => {
      result.current.openWith(testData);
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.data).toEqual(testData);
  });

  it('should close modal', () => {
    const { result } = renderHook(() => useModalWithData<TestData>());
    const testData: TestData = { id: '1', name: 'Test' };

    act(() => {
      result.current.openWith(testData);
    });

    act(() => {
      result.current.close();
    });

    expect(result.current.isOpen).toBe(false);
    // Data persists after close (useful for animations)
    expect(result.current.data).toEqual(testData);
  });

  it('should update data', () => {
    const { result } = renderHook(() => useModalWithData<TestData>());
    const initialData: TestData = { id: '1', name: 'Initial' };
    const updatedData: TestData = { id: '1', name: 'Updated' };

    act(() => {
      result.current.openWith(initialData);
    });

    act(() => {
      result.current.updateData(updatedData);
    });

    expect(result.current.data).toEqual(updatedData);
  });

  it('should update data using function', () => {
    const { result } = renderHook(() => useModalWithData<TestData>());
    const initialData: TestData = { id: '1', name: 'Initial' };

    act(() => {
      result.current.openWith(initialData);
    });

    act(() => {
      result.current.updateData((prev) => ({
        ...prev!,
        name: 'Updated',
      }));
    });

    expect(result.current.data?.name).toBe('Updated');
  });
});

describe('useModals', () => {
  const modalIds = ['modal1', 'modal2', 'modal3'] as const;

  it('should initialize with all modals closed', () => {
    const { result } = renderHook(() => useModals(modalIds));

    expect(result.current.isOpen('modal1')).toBe(false);
    expect(result.current.isOpen('modal2')).toBe(false);
    expect(result.current.isOpen('modal3')).toBe(false);
    expect(result.current.openModals.size).toBe(0);
  });

  it('should open a specific modal', () => {
    const { result } = renderHook(() => useModals(modalIds));

    act(() => {
      result.current.open('modal1');
    });

    expect(result.current.isOpen('modal1')).toBe(true);
    expect(result.current.isOpen('modal2')).toBe(false);
  });

  it('should open multiple modals', () => {
    const { result } = renderHook(() => useModals(modalIds));

    act(() => {
      result.current.open('modal1');
      result.current.open('modal2');
    });

    expect(result.current.isOpen('modal1')).toBe(true);
    expect(result.current.isOpen('modal2')).toBe(true);
    expect(result.current.openModals.size).toBe(2);
  });

  it('should close a specific modal', () => {
    const { result } = renderHook(() => useModals(modalIds));

    act(() => {
      result.current.open('modal1');
      result.current.open('modal2');
    });

    act(() => {
      result.current.close('modal1');
    });

    expect(result.current.isOpen('modal1')).toBe(false);
    expect(result.current.isOpen('modal2')).toBe(true);
  });

  it('should close all modals', () => {
    const { result } = renderHook(() => useModals(modalIds));

    act(() => {
      result.current.open('modal1');
      result.current.open('modal2');
      result.current.open('modal3');
    });

    act(() => {
      result.current.closeAll();
    });

    expect(result.current.isOpen('modal1')).toBe(false);
    expect(result.current.isOpen('modal2')).toBe(false);
    expect(result.current.isOpen('modal3')).toBe(false);
    expect(result.current.openModals.size).toBe(0);
  });

  it('should toggle a modal', () => {
    const { result } = renderHook(() => useModals(modalIds));

    act(() => {
      result.current.toggle('modal1');
    });
    expect(result.current.isOpen('modal1')).toBe(true);

    act(() => {
      result.current.toggle('modal1');
    });
    expect(result.current.isOpen('modal1')).toBe(false);
  });
});

describe('useConfirmation', () => {
  it('should initialize with closed state', () => {
    const { result } = renderHook(() => useConfirmation());

    expect(result.current.isOpen).toBe(false);
  });

  it('should provide default ConfirmationModalProps', () => {
    const { result } = renderHook(() => useConfirmation());

    expect(result.current.ConfirmationModalProps).toEqual({
      isOpen: false,
      onClose: expect.any(Function),
      onConfirm: expect.any(Function),
      title: 'Confirm',
      message: 'Are you sure?',
      confirmText: undefined,
      cancelText: undefined,
      type: 'warning',
    });
  });

  it('should use custom options', () => {
    const { result } = renderHook(() =>
      useConfirmation({
        title: 'Delete Item',
        message: 'This cannot be undone',
        confirmText: 'Delete',
        cancelText: 'Keep',
        type: 'danger',
      })
    );

    expect(result.current.ConfirmationModalProps.title).toBe('Delete Item');
    expect(result.current.ConfirmationModalProps.message).toBe('This cannot be undone');
    expect(result.current.ConfirmationModalProps.confirmText).toBe('Delete');
    expect(result.current.ConfirmationModalProps.cancelText).toBe('Keep');
    expect(result.current.ConfirmationModalProps.type).toBe('danger');
  });

  it('should resolve with true when confirmed', async () => {
    const { result } = renderHook(() => useConfirmation());

    let confirmationResult: boolean | undefined;

    // Start confirmation
    act(() => {
      result.current.confirm().then((value) => {
        confirmationResult = value;
      });
    });

    // Modal should be open
    expect(result.current.isOpen).toBe(true);

    // Confirm
    act(() => {
      result.current.ConfirmationModalProps.onConfirm();
    });

    // Wait for promise to resolve
    await vi.waitFor(() => {
      expect(confirmationResult).toBe(true);
    });

    expect(result.current.isOpen).toBe(false);
  });

  it('should resolve with false when cancelled', async () => {
    const { result } = renderHook(() => useConfirmation());

    let confirmationResult: boolean | undefined;

    // Start confirmation
    act(() => {
      result.current.confirm().then((value) => {
        confirmationResult = value;
      });
    });

    // Modal should be open
    expect(result.current.isOpen).toBe(true);

    // Cancel
    act(() => {
      result.current.cancel();
    });

    // Wait for promise to resolve
    await vi.waitFor(() => {
      expect(confirmationResult).toBe(false);
    });

    expect(result.current.isOpen).toBe(false);
  });

  it('should handle multiple confirmations sequentially', async () => {
    const { result } = renderHook(() => useConfirmation());

    // First confirmation - confirm
    let result1: boolean | undefined;
    act(() => {
      result.current.confirm().then((value) => {
        result1 = value;
      });
    });

    act(() => {
      result.current.ConfirmationModalProps.onConfirm();
    });

    await vi.waitFor(() => {
      expect(result1).toBe(true);
    });

    // Second confirmation - cancel
    let result2: boolean | undefined;
    act(() => {
      result.current.confirm().then((value) => {
        result2 = value;
      });
    });

    act(() => {
      result.current.cancel();
    });

    await vi.waitFor(() => {
      expect(result2).toBe(false);
    });
  });
});
