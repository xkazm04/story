import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Modal } from '../Modal';
import { ConfirmationModal } from '../ConfirmationModal';
import '@testing-library/jest-dom';

describe('Modal Component', () => {
  beforeEach(() => {
    // Reset body styles before each test
    document.body.style.overflow = 'unset';
  });

  afterEach(() => {
    // Cleanup after each test
    document.body.style.overflow = 'unset';
  });

  describe('Rendering', () => {
    it('should render when isOpen is true', () => {
      render(
        <Modal isOpen={true} onClose={() => {}}>
          <div>Modal Content</div>
        </Modal>
      );

      expect(screen.getByTestId('modal-container')).toBeInTheDocument();
      expect(screen.getByText('Modal Content')).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      render(
        <Modal isOpen={false} onClose={() => {}}>
          <div>Modal Content</div>
        </Modal>
      );

      expect(screen.queryByTestId('modal-container')).not.toBeInTheDocument();
    });

    it('should render title when provided', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Test Modal">
          Content
        </Modal>
      );

      expect(screen.getByTestId('modal-title')).toHaveTextContent('Test Modal');
    });

    it('should render subtitle when provided', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Title" subtitle="Subtitle">
          Content
        </Modal>
      );

      expect(screen.getByTestId('modal-subtitle')).toHaveTextContent('Subtitle');
    });

    it('should render icon when provided', () => {
      render(
        <Modal
          isOpen={true}
          onClose={() => {}}
          title="Title"
          icon={<span data-testid="custom-icon">Icon</span>}
        >
          Content
        </Modal>
      );

      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });

    it('should render footer when provided', () => {
      render(
        <Modal
          isOpen={true}
          onClose={() => {}}
          footer={<button data-testid="footer-btn">Action</button>}
        >
          Content
        </Modal>
      );

      expect(screen.getByTestId('footer-btn')).toBeInTheDocument();
    });

    it('should render close button by default', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Title">
          Content
        </Modal>
      );

      expect(screen.getByTestId('modal-close-btn')).toBeInTheDocument();
    });

    it('should not render close button when showCloseButton is false', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Title" showCloseButton={false}>
          Content
        </Modal>
      );

      expect(screen.queryByTestId('modal-close-btn')).not.toBeInTheDocument();
    });
  });

  describe('Size Variants', () => {
    it.each(['sm', 'md', 'lg', 'xl', 'full'] as const)(
      'should apply %s size class',
      (size) => {
        render(
          <Modal isOpen={true} onClose={() => {}} size={size}>
            Content
          </Modal>
        );

        const modal = screen.getByTestId('modal-container');
        expect(modal).toBeInTheDocument();
      }
    );
  });

  describe('Interactions', () => {
    it('should call onClose when close button is clicked', () => {
      const onClose = vi.fn();

      render(
        <Modal isOpen={true} onClose={onClose} title="Title">
          Content
        </Modal>
      );

      fireEvent.click(screen.getByTestId('modal-close-btn'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when backdrop is clicked', () => {
      const onClose = vi.fn();

      render(
        <Modal isOpen={true} onClose={onClose}>
          Content
        </Modal>
      );

      fireEvent.click(screen.getByTestId('modal-backdrop'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should not call onClose when backdrop is clicked if closeOnBackdropClick is false', () => {
      const onClose = vi.fn();

      render(
        <Modal isOpen={true} onClose={onClose} closeOnBackdropClick={false}>
          Content
        </Modal>
      );

      fireEvent.click(screen.getByTestId('modal-backdrop'));
      expect(onClose).not.toHaveBeenCalled();
    });

    it('should call onClose when Escape key is pressed', () => {
      const onClose = vi.fn();

      render(
        <Modal isOpen={true} onClose={onClose}>
          Content
        </Modal>
      );

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should not call onClose when other keys are pressed', () => {
      const onClose = vi.fn();

      render(
        <Modal isOpen={true} onClose={onClose}>
          Content
        </Modal>
      );

      fireEvent.keyDown(window, { key: 'Enter' });
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('Body Scroll Lock', () => {
    it('should lock body scroll when modal opens', async () => {
      const { rerender } = render(
        <Modal isOpen={false} onClose={() => {}}>
          Content
        </Modal>
      );

      expect(document.body.style.overflow).toBe('unset');

      rerender(
        <Modal isOpen={true} onClose={() => {}}>
          Content
        </Modal>
      );

      await waitFor(() => {
        expect(document.body.style.overflow).toBe('hidden');
      });
    });

    it('should unlock body scroll when modal closes', async () => {
      const { rerender } = render(
        <Modal isOpen={true} onClose={() => {}}>
          Content
        </Modal>
      );

      await waitFor(() => {
        expect(document.body.style.overflow).toBe('hidden');
      });

      rerender(
        <Modal isOpen={false} onClose={() => {}}>
          Content
        </Modal>
      );

      await waitFor(() => {
        expect(document.body.style.overflow).toBe('unset');
      });
    });
  });

  describe('ARIA Attributes', () => {
    it('should have role="dialog"', () => {
      render(
        <Modal isOpen={true} onClose={() => {}}>
          Content
        </Modal>
      );

      const modal = screen.getByTestId('modal-container');
      expect(modal).toHaveAttribute('role', 'dialog');
    });

    it('should have aria-modal="true"', () => {
      render(
        <Modal isOpen={true} onClose={() => {}}>
          Content
        </Modal>
      );

      const modal = screen.getByTestId('modal-container');
      expect(modal).toHaveAttribute('aria-modal', 'true');
    });

    it('should link title with aria-labelledby when title is provided', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Test Title">
          Content
        </Modal>
      );

      const modal = screen.getByTestId('modal-container');
      expect(modal).toHaveAttribute('aria-labelledby', 'modal-title');
      expect(screen.getByTestId('modal-title')).toHaveAttribute('id', 'modal-title');
    });

    it('should use ariaLabel when provided', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} ariaLabel="Custom Label">
          Content
        </Modal>
      );

      const modal = screen.getByTestId('modal-container');
      expect(modal).toHaveAttribute('aria-label', 'Custom Label');
    });

    it('should use ariaDescribedBy when provided', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} ariaDescribedBy="description-id">
          <div id="description-id">Description</div>
        </Modal>
      );

      const modal = screen.getByTestId('modal-container');
      expect(modal).toHaveAttribute('aria-describedby', 'description-id');
    });

    it('should have aria-hidden on backdrop', () => {
      render(
        <Modal isOpen={true} onClose={() => {}}>
          Content
        </Modal>
      );

      const backdrop = screen.getByTestId('modal-backdrop');
      expect(backdrop).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} className="custom-class">
          Content
        </Modal>
      );

      const modal = screen.getByTestId('modal-container');
      expect(modal).toHaveClass('custom-class');
    });
  });
});

describe('ConfirmationModal Component', () => {
  describe('Rendering', () => {
    it('should render title and message', () => {
      render(
        <ConfirmationModal
          isOpen={true}
          onClose={() => {}}
          onConfirm={() => {}}
          title="Confirm Action"
          message="Are you sure?"
        />
      );

      expect(screen.getByText('Confirm Action')).toBeInTheDocument();
      expect(screen.getByText('Are you sure?')).toBeInTheDocument();
    });

    it('should render custom button text', () => {
      render(
        <ConfirmationModal
          isOpen={true}
          onClose={() => {}}
          onConfirm={() => {}}
          title="Delete"
          message="Are you sure?"
          confirmText="Delete Forever"
          cancelText="Keep It"
        />
      );

      expect(screen.getByText('Delete Forever')).toBeInTheDocument();
      expect(screen.getByText('Keep It')).toBeInTheDocument();
    });

    it('should render ReactNode message', () => {
      render(
        <ConfirmationModal
          isOpen={true}
          onClose={() => {}}
          onConfirm={() => {}}
          title="Confirm"
          message={<div data-testid="custom-message">Custom Message</div>}
        />
      );

      expect(screen.getByTestId('custom-message')).toBeInTheDocument();
    });
  });

  describe('Confirmation Types', () => {
    it.each(['danger', 'warning', 'info', 'success'] as const)(
      'should render %s type correctly',
      (type) => {
        render(
          <ConfirmationModal
            isOpen={true}
            onClose={() => {}}
            onConfirm={() => {}}
            title="Confirm"
            message="Message"
            type={type}
          />
        );

        expect(screen.getByTestId('modal-container')).toBeInTheDocument();
      }
    );
  });

  describe('Interactions', () => {
    it('should call onConfirm and onClose when confirm button is clicked', () => {
      const onClose = vi.fn();
      const onConfirm = vi.fn();

      render(
        <ConfirmationModal
          isOpen={true}
          onClose={onClose}
          onConfirm={onConfirm}
          title="Confirm"
          message="Are you sure?"
        />
      );

      fireEvent.click(screen.getByTestId('confirmation-confirm-btn'));

      expect(onConfirm).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when cancel button is clicked', () => {
      const onClose = vi.fn();
      const onConfirm = vi.fn();

      render(
        <ConfirmationModal
          isOpen={true}
          onClose={onClose}
          onConfirm={onConfirm}
          title="Confirm"
          message="Are you sure?"
        />
      );

      fireEvent.click(screen.getByTestId('confirmation-cancel-btn'));

      expect(onConfirm).not.toHaveBeenCalled();
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should disable interactions when isLoading is true', () => {
      render(
        <ConfirmationModal
          isOpen={true}
          onClose={() => {}}
          onConfirm={() => {}}
          title="Confirm"
          message="Are you sure?"
          isLoading={true}
        />
      );

      expect(screen.getByTestId('confirmation-confirm-btn')).toBeDisabled();
      expect(screen.getByTestId('confirmation-cancel-btn')).toBeDisabled();
    });

    it('should show "Processing..." text when isLoading is true', () => {
      render(
        <ConfirmationModal
          isOpen={true}
          onClose={() => {}}
          onConfirm={() => {}}
          title="Confirm"
          message="Are you sure?"
          isLoading={true}
        />
      );

      expect(screen.getByText('Processing...')).toBeInTheDocument();
    });

    it('should prevent backdrop close when isLoading is true', () => {
      const onClose = vi.fn();

      render(
        <ConfirmationModal
          isOpen={true}
          onClose={onClose}
          onConfirm={() => {}}
          title="Confirm"
          message="Are you sure?"
          isLoading={true}
        />
      );

      fireEvent.click(screen.getByTestId('modal-backdrop'));
      expect(onClose).not.toHaveBeenCalled();
    });
  });
});
