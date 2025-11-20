import React from 'react';
import { Card } from './Card';

export const Placeholder = ({ title }) => (
  <Card>
    <p className="text-sm text-gray-600">{title}</p>
  </Card>
);
