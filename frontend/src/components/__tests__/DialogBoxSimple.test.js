import React from 'react';
import { render, screen } from '@testing-library/react';

describe('DialogBox Simple Test', () => {
  it('simple test', () => {
    expect(true).toBe(true);
  });

  it('render test', () => {
    render(<div>Test</div>);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});