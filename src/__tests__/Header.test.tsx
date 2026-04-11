import { render, screen, fireEvent } from '@testing-library/react';
import Header from '../components/Header';
import { expect, test, vi } from 'vitest';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    header: ({ children, ...props }: any) => <header {...props}>{children}</header>,
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    nav: ({ children, ...props }: any) => <nav {...props}>{children}</nav>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

test('renders header with burger menu and desktop reserve button', () => {
  render(<Header />);
  
  // Check for the burger menu icon (button by aria-label)
  expect(screen.getByLabelText(/Open navigation menu/i)).toBeInTheDocument();
  
  // Check for the "Reserve" button on desktop
  const reserveButtons = screen.getAllByText(/Reserve/i);
  expect(reserveButtons.length).toBeGreaterThan(0);
});

test('opens mobile menu when hamburger is clicked', () => {
  render(<Header />);
  
  const burger = screen.getByLabelText(/Open navigation menu/i);
  fireEvent.click(burger);
  
  // Now navigation items should be visible
  expect(screen.getByText(/Food/i)).toBeInTheDocument();
  expect(screen.getByText(/Happy Hour/i)).toBeInTheDocument();
  expect(screen.getByText(/Sushi Bar/i)).toBeInTheDocument();
});
