'use client';

import React from 'react';
import { Layout } from '@/components/Layout';

export default function Template({ children }: { children: React.ReactNode }) {
  return <Layout>{children}</Layout>;
} 