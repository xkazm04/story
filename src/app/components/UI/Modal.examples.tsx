'use client';

/**
 * Modal Component Examples
 *
 * This file contains comprehensive examples of the Modal system usage.
 * These examples demonstrate best practices and common patterns.
 */

import { useState } from 'react';
import { Modal, Button, Input, Textarea, Select, ConfirmationModal } from './index';
import { useModal, useModalWithData, useModals, useConfirmation } from '@/app/hooks/useModal';
import {
  Settings,
  User,
  Mail,
  Lock,
  HelpCircle,
  Trash2,
  Edit,
  Plus,
  Info,
  CheckCircle,
} from 'lucide-react';

// ============================================================================
// Example 1: Basic Modal with useModal Hook
// ============================================================================

export function BasicModalExample() {
  const { isOpen, open, close } = useModal();

  return (
    <div>
      <Button onClick={open} data-testid="open-basic-modal-btn">
        Open Basic Modal
      </Button>

      <Modal isOpen={isOpen} onClose={close} title="Welcome" size="md">
        <div className="space-y-4">
          <p className="text-gray-300">
            This is a basic modal example. It demonstrates the fundamental
            features like focus trapping, keyboard navigation, and animations.
          </p>
          <p className="text-sm text-gray-400">
            Try pressing <kbd className="px-2 py-1 bg-gray-700 rounded">Escape</kbd> to close,
            or click outside the modal.
          </p>
        </div>
      </Modal>
    </div>
  );
}

// ============================================================================
// Example 2: Modal with Icon and Subtitle
// ============================================================================

export function IconModalExample() {
  const { isOpen, open, close } = useModal();

  return (
    <div>
      <Button onClick={open} icon={<Settings />} data-testid="open-icon-modal-btn">
        Settings
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={close}
        title="Application Settings"
        subtitle="Customize your experience"
        icon={<Settings size={16} />}
        size="lg"
      >
        <div className="space-y-6">
          <section>
            <h3 className="text-sm font-semibold text-white mb-3">Appearance</h3>
            <div className="space-y-3">
              <Select label="Theme" fullWidth>
                <option>Dark (Default)</option>
                <option>Light</option>
                <option>Auto</option>
              </Select>
              <Select label="Accent Color" fullWidth>
                <option>Cyan (Default)</option>
                <option>Purple</option>
                <option>Green</option>
              </Select>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-white mb-3">Notifications</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked />
                <span className="text-sm text-gray-300">Email notifications</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked />
                <span className="text-sm text-gray-300">Push notifications</span>
              </label>
            </div>
          </section>
        </div>
      </Modal>
    </div>
  );
}

// ============================================================================
// Example 3: Form Modal with Footer Actions
// ============================================================================

export function FormModalExample() {
  const { isOpen, open, close } = useModal();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoading(false);
    close();
    // Reset form
    setName('');
    setEmail('');
  };

  const footer = (
    <div className="flex items-center justify-between w-full">
      <Button
        variant="ghost"
        onClick={close}
        disabled={loading}
        data-testid="form-cancel-btn"
      >
        Cancel
      </Button>
      <Button
        variant="primary"
        onClick={handleSubmit}
        disabled={loading || !name || !email}
        loading={loading}
        data-testid="form-submit-btn"
      >
        Create User
      </Button>
    </div>
  );

  return (
    <div>
      <Button onClick={open} icon={<Plus />} data-testid="open-form-modal-btn">
        Add User
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={close}
        title="Create New User"
        subtitle="Enter user details to create a new account"
        icon={<User size={16} />}
        size="md"
        footer={footer}
        closeOnBackdropClick={!loading}
      >
        <div className="space-y-4">
          <Input
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            icon={<User size={16} />}
            fullWidth
            required
            data-testid="user-name-input"
          />

          <Input
            type="email"
            label="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
            icon={<Mail size={16} />}
            fullWidth
            required
            data-testid="user-email-input"
          />

          <Input
            type="password"
            label="Password"
            placeholder="••••••••"
            icon={<Lock size={16} />}
            fullWidth
            required
            data-testid="user-password-input"
          />
        </div>
      </Modal>
    </div>
  );
}

// ============================================================================
// Example 4: Edit Modal with useModalWithData Hook
// ============================================================================

type Character = {
  id: string;
  name: string;
  description: string;
};

export function EditModalExample() {
  const { isOpen, data: character, openWith, close } = useModalWithData<Character>();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // Update form when character changes
  useState(() => {
    if (character) {
      setName(character.name);
      setDescription(character.description);
    }
  });

  const mockCharacters: Character[] = [
    { id: '1', name: 'Alice', description: 'Brave hero' },
    { id: '2', name: 'Bob', description: 'Wise mentor' },
    { id: '3', name: 'Charlie', description: 'Comic relief' },
  ];

  const handleSave = () => {
    console.log('Saving character:', character?.id, { name, description });
    close();
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {mockCharacters.map((char) => (
          <div
            key={char.id}
            className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700/50"
          >
            <div>
              <div className="font-medium text-white">{char.name}</div>
              <div className="text-sm text-gray-400">{char.description}</div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              icon={<Edit size={14} />}
              onClick={() => openWith(char)}
              data-testid={`edit-character-${char.id}-btn`}
            >
              Edit
            </Button>
          </div>
        ))}
      </div>

      {character && (
        <Modal
          isOpen={isOpen}
          onClose={close}
          title={`Edit ${character.name}`}
          icon={<Edit size={16} />}
          size="md"
          footer={
            <div className="flex gap-2 justify-end w-full">
              <Button variant="ghost" onClick={close}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <Input
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              data-testid="edit-name-input"
            />
            <Textarea
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              fullWidth
              data-testid="edit-description-input"
            />
          </div>
        </Modal>
      )}
    </div>
  );
}

// ============================================================================
// Example 5: Confirmation Modals (All Types)
// ============================================================================

export function ConfirmationModalExamples() {
  const danger = useModal();
  const warning = useModal();
  const info = useModal();
  const success = useModal();

  return (
    <div className="space-y-3">
      <Button
        variant="danger"
        onClick={danger.open}
        icon={<Trash2 />}
        data-testid="open-danger-confirmation-btn"
      >
        Delete (Danger)
      </Button>

      <Button
        variant="secondary"
        onClick={warning.open}
        data-testid="open-warning-confirmation-btn"
      >
        Warning Confirmation
      </Button>

      <Button
        variant="secondary"
        onClick={info.open}
        data-testid="open-info-confirmation-btn"
      >
        Info Confirmation
      </Button>

      <Button
        variant="primary"
        onClick={success.open}
        icon={<CheckCircle />}
        data-testid="open-success-confirmation-btn"
      >
        Success Confirmation
      </Button>

      <ConfirmationModal
        isOpen={danger.isOpen}
        onClose={danger.close}
        onConfirm={() => console.log('Deleted!')}
        title="Delete Character"
        message="Are you sure you want to delete this character? This action cannot be undone."
        type="danger"
        confirmText="Delete Forever"
        cancelText="Keep Character"
      />

      <ConfirmationModal
        isOpen={warning.isOpen}
        onClose={warning.close}
        onConfirm={() => console.log('Confirmed!')}
        title="Unsaved Changes"
        message="You have unsaved changes. Are you sure you want to leave?"
        type="warning"
        confirmText="Leave Anyway"
        cancelText="Stay"
      />

      <ConfirmationModal
        isOpen={info.isOpen}
        onClose={info.close}
        onConfirm={() => console.log('Confirmed!')}
        title="Feature Information"
        message="This feature requires a premium subscription. Would you like to upgrade?"
        type="info"
        confirmText="Upgrade Now"
        cancelText="Maybe Later"
      />

      <ConfirmationModal
        isOpen={success.isOpen}
        onClose={success.close}
        onConfirm={() => console.log('Confirmed!')}
        title="Export Complete"
        message="Your story has been successfully exported! Would you like to download it now?"
        type="success"
        confirmText="Download"
        cancelText="Close"
      />
    </div>
  );
}

// ============================================================================
// Example 6: Multi-Step Modal (Wizard)
// ============================================================================

export function WizardModalExample() {
  const { isOpen, open, close } = useModal();
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const handleNext = () => setStep(s => Math.min(s + 1, totalSteps));
  const handleBack = () => setStep(s => Math.max(s - 1, 1));

  const handleClose = () => {
    close();
    setTimeout(() => setStep(1), 300); // Reset after animation
  };

  const footer = (
    <div className="flex items-center justify-between w-full">
      <Button
        variant="ghost"
        onClick={handleBack}
        disabled={step === 1}
        data-testid="wizard-back-btn"
      >
        Back
      </Button>
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <span>Step {step} of {totalSteps}</span>
      </div>
      <Button
        variant="primary"
        onClick={step === totalSteps ? handleClose : handleNext}
        data-testid="wizard-next-btn"
      >
        {step === totalSteps ? 'Finish' : 'Next'}
      </Button>
    </div>
  );

  return (
    <div>
      <Button onClick={open} data-testid="open-wizard-modal-btn">
        Start Setup Wizard
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={`Project Setup - Step ${step}`}
        size="lg"
        footer={footer}
        closeOnBackdropClick={false}
      >
        <div className="space-y-4">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Basic Information</h3>
              <Input label="Project Name" placeholder="My Story" fullWidth />
              <Select label="Genre" fullWidth>
                <option>Fantasy</option>
                <option>Sci-Fi</option>
                <option>Mystery</option>
              </Select>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Story Settings</h3>
              <Textarea
                label="Story Concept"
                placeholder="Describe your story idea..."
                rows={6}
                fullWidth
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Review & Confirm</h3>
              <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Project Name:</span>
                  <span className="text-white font-medium">My Story</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Genre:</span>
                  <span className="text-white font-medium">Fantasy</span>
                </div>
              </div>
              <p className="text-sm text-gray-400">
                Click Finish to create your project with these settings.
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

// ============================================================================
// Example 7: Multiple Modals with useModals Hook
// ============================================================================

export function MultipleModalsExample() {
  const modals = useModals(['settings', 'help', 'profile'] as const);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Button
          variant="secondary"
          onClick={() => modals.open('settings')}
          icon={<Settings />}
          data-testid="open-settings-btn"
        >
          Settings
        </Button>
        <Button
          variant="secondary"
          onClick={() => modals.open('help')}
          icon={<HelpCircle />}
          data-testid="open-help-btn"
        >
          Help
        </Button>
        <Button
          variant="secondary"
          onClick={() => modals.open('profile')}
          icon={<User />}
          data-testid="open-profile-btn"
        >
          Profile
        </Button>
      </div>

      <Modal
        isOpen={modals.isOpen('settings')}
        onClose={() => modals.close('settings')}
        title="Settings"
        icon={<Settings size={16} />}
      >
        <p className="text-gray-300">Settings content goes here...</p>
      </Modal>

      <Modal
        isOpen={modals.isOpen('help')}
        onClose={() => modals.close('help')}
        title="Help & Support"
        icon={<HelpCircle size={16} />}
        size="lg"
      >
        <div className="space-y-4">
          <section>
            <h3 className="font-semibold text-white mb-2">Getting Started</h3>
            <p className="text-sm text-gray-300">
              Learn the basics of using the application...
            </p>
          </section>
        </div>
      </Modal>

      <Modal
        isOpen={modals.isOpen('profile')}
        onClose={() => modals.close('profile')}
        title="User Profile"
        icon={<User size={16} />}
      >
        <p className="text-gray-300">Profile content goes here...</p>
      </Modal>
    </div>
  );
}

// ============================================================================
// Example 8: Confirmation with useConfirmation Hook
// ============================================================================

export function ConfirmationHookExample() {
  const { confirm, ConfirmationModalProps } = useConfirmation({
    title: 'Delete Item',
    message: 'This action cannot be undone. Are you sure?',
    type: 'danger',
    confirmText: 'Delete',
    cancelText: 'Cancel',
  });

  const handleDelete = async () => {
    const confirmed = await confirm();
    if (confirmed) {
      console.log('User confirmed deletion');
      // Perform delete action
    } else {
      console.log('User cancelled');
    }
  };

  return (
    <div>
      <Button
        variant="danger"
        onClick={handleDelete}
        icon={<Trash2 />}
        data-testid="delete-with-confirm-btn"
      >
        Delete with Confirmation
      </Button>

      <ConfirmationModal {...ConfirmationModalProps} />
    </div>
  );
}

// ============================================================================
// Example 9: Scrollable Content Modal
// ============================================================================

export function ScrollableModalExample() {
  const { isOpen, open, close } = useModal();

  return (
    <div>
      <Button onClick={open} icon={<Info />} data-testid="open-scrollable-modal-btn">
        Terms & Conditions
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={close}
        title="Terms and Conditions"
        size="lg"
        footer={
          <Button variant="primary" onClick={close} fullWidth>
            I Accept
          </Button>
        }
      >
        <div className="space-y-4 text-sm text-gray-300">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((section) => (
            <section key={section}>
              <h3 className="font-semibold text-white mb-2">
                {section}. Section Title
              </h3>
              <p className="mb-2">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris.
              </p>
              <p>
                Duis aute irure dolor in reprehenderit in voluptate velit esse
                cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
                cupidatat non proident.
              </p>
            </section>
          ))}
        </div>
      </Modal>
    </div>
  );
}

// ============================================================================
// Demo Component (All Examples)
// ============================================================================

export function ModalExamplesDemo() {
  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Modal System Examples</h1>
        <p className="text-gray-400">
          Comprehensive examples demonstrating the Modal component and related hooks.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">1. Basic Modal</h2>
        <BasicModalExample />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">2. Modal with Icon</h2>
        <IconModalExample />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">3. Form Modal</h2>
        <FormModalExample />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">4. Edit Modal</h2>
        <EditModalExample />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">5. Confirmation Types</h2>
        <ConfirmationModalExamples />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">6. Wizard Modal</h2>
        <WizardModalExample />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">7. Multiple Modals</h2>
        <MultipleModalsExample />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">8. Confirmation Hook</h2>
        <ConfirmationHookExample />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">9. Scrollable Modal</h2>
        <ScrollableModalExample />
      </section>
    </div>
  );
}
