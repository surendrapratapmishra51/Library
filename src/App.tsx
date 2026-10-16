/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { LibraryProvider } from './context/LibraryContext';
import { AppRoutes } from './routes/AppRoutes';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <LibraryProvider>
        <ScrollToTop />
        <AppRoutes />
      </LibraryProvider>
    </BrowserRouter>
  );
}

