import { useState } from 'react';
import {
  Button,
  Card,
  Input,
  Toggle,
  Modal,
  Dropdown,
  ToastProvider,
  useToast
} from './index';
import './ComponentShowcase.css';

/**
 * Component Showcase - Demo page for all UI components
 * This file demonstrates all features of the premium component library
 */
function ComponentShowcaseContent() {
  const toast = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [toggleValue, setToggleValue] = useState(false);
  const [dropdownValue, setDropdownValue] = useState('');
  const [multiSelectValue, setMultiSelectValue] = useState([]);

  const dropdownOptions = [
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' },
    { value: '3', label: 'Option 3' },
    { value: '4', label: 'Disabled Option', disabled: true },
    { value: '5', label: 'Option 5' },
  ];

  return (
    <div className="showcase">
      <div className="showcase__header">
        <h1>DeskButler UI Components</h1>
        <p>Premium React component library with smooth animations and glassmorphism</p>
      </div>

      <div className="showcase__grid">
        {/* Button Showcase */}
        <Card header="Button Component">
          <div className="showcase__section">
            <h3>Variants</h3>
            <div className="showcase__row">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
            </div>

            <h3>Sizes</h3>
            <div className="showcase__row">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>

            <h3>States</h3>
            <div className="showcase__row">
              <Button loading>Loading...</Button>
              <Button disabled>Disabled</Button>
              <Button 
                iconLeft={
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 2v12m-6-6h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                }
              >
                With Icon
              </Button>
            </div>
          </div>
        </Card>

        {/* Card Showcase */}
        <Card header="Card Component">
          <div className="showcase__section">
            <h3>Variants</h3>
            <div className="showcase__column">
              <Card variant="default">Default Card</Card>
              <Card variant="elevated">Elevated Card</Card>
              <Card variant="bordered">Bordered Card</Card>
              <Card 
                hoverable 
                footer={<small>With footer</small>}
              >
                Hoverable Card
              </Card>
            </div>
          </div>
        </Card>

        {/* Input Showcase */}
        <Card header="Input Component">
          <div className="showcase__section">
            <Input
              label="Floating Label"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              clearable
              placeholder="Enter text..."
            />
            <Input
              label="With Icon"
              icon={
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="2" />
                  <path d="M11 11l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              }
            />
            <Input
              label="With Counter"
              maxLength={50}
              showCounter
            />
            <Input
              label="Error State"
              error="This field is required"
            />
          </div>
        </Card>

        {/* Toggle Showcase */}
        <Card header="Toggle Component">
          <div className="showcase__section">
            <Toggle
              label="Label on Right"
              checked={toggleValue}
              onChange={setToggleValue}
            />
            <Toggle
              label="Label on Left"
              labelPosition="left"
              checked={toggleValue}
              onChange={setToggleValue}
            />
            <Toggle
              label="Disabled"
              disabled
            />
          </div>
        </Card>

        {/* Dropdown Showcase */}
        <Card header="Dropdown Component">
          <div className="showcase__section">
            <Dropdown
              options={dropdownOptions}
              value={dropdownValue}
              onChange={setDropdownValue}
              placeholder="Select an option..."
            />
            <Dropdown
              options={dropdownOptions}
              value={multiSelectValue}
              onChange={setMultiSelectValue}
              placeholder="Multi-select..."
              multiple
            />
            <Dropdown
              options={dropdownOptions}
              value={dropdownValue}
              onChange={setDropdownValue}
              placeholder="Searchable..."
              searchable
            />
          </div>
        </Card>

        {/* Modal Showcase */}
        <Card header="Modal Component">
          <div className="showcase__section">
            <Button onClick={() => setModalOpen(true)}>
              Open Modal
            </Button>
            <Modal
              isOpen={modalOpen}
              onClose={() => setModalOpen(false)}
              title="Premium Modal"
              size="md"
            >
              <p>This is a premium modal with glassmorphism backdrop, smooth animations, and focus trap.</p>
              <p>Try pressing ESC to close, or clicking outside the modal.</p>
              <div style={{ marginTop: 'var(--space-lg)', display: 'flex', gap: 'var(--space-sm)' }}>
                <Button onClick={() => setModalOpen(false)}>Close</Button>
                <Button variant="secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
              </div>
            </Modal>
          </div>
        </Card>

        {/* Toast Showcase */}
        <Card header="Toast Component">
          <div className="showcase__section">
            <h3>Toast Notifications</h3>
            <div className="showcase__row">
              <Button 
                size="sm" 
                variant="secondary"
                onClick={() => toast.success('Success message!')}
              >
                Success
              </Button>
              <Button 
                size="sm" 
                variant="secondary"
                onClick={() => toast.error('Error message!')}
              >
                Error
              </Button>
              <Button 
                size="sm" 
                variant="secondary"
                onClick={() => toast.warning('Warning message!')}
              >
                Warning
              </Button>
              <Button 
                size="sm" 
                variant="secondary"
                onClick={() => toast.info('Info message!')}
              >
                Info
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function ComponentShowcase() {
  return (
    <ToastProvider>
      <ComponentShowcaseContent />
    </ToastProvider>
  );
}
