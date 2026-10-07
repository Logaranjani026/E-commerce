import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';

const CompareContext = createContext(null);

export const CompareProvider = ({ children }) => {
  const { showToast } = useToast();
  const [compareItems, setCompareItems] = useState(() => {
    const saved = localStorage.getItem('smartcart_compare_items');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('smartcart_compare_items', JSON.stringify(compareItems));
  }, [compareItems]);

  const isInCompare = (productId) => {
    return compareItems.some((item) => item.id === productId);
  };

  const addToCompare = (product) => {
    if (isInCompare(product.id)) {
      setCompareItems((prev) => prev.filter((item) => item.id !== product.id));
      showToast(`Removed "${product.name}" from comparison`, 'info');
      return;
    }

    if (compareItems.length >= 4) {
      showToast('You can compare a maximum of 4 products at a time', 'warning');
      return;
    }

    setCompareItems((prev) => [...prev, product]);
    showToast(`Added "${product.name}" to comparison list ⚖️`, 'success');
  };

  const removeFromCompare = (productId) => {
    setCompareItems((prev) => prev.filter((item) => item.id !== productId));
    showToast('Removed from comparison', 'info');
  };

  const clearCompare = () => {
    setCompareItems([]);
  };

  return (
    <CompareContext.Provider
      value={{
        compareItems,
        compareCount: compareItems.length,
        isInCompare,
        addToCompare,
        removeFromCompare,
        clearCompare,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
};
