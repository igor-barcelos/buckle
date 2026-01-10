import { useState, useCallback, useMemo } from 'react';
import { useModel } from '../../model/Context';

type DialogName = 
  | 'settings'
  | 'results'
  | 'move'
  | 'draw'
  | 'docs'
  | 'sections'
  | 'loads'
  | 'supports'
  | 'materials'
  | 'copy'
  | null;

export function useActiveDialog() {
  const model = useModel();
  const [activeDialog, setActiveDialog] = useState<DialogName>(null);

  const open = useCallback((dialog: NonNullable<DialogName>) => {
    setActiveDialog(dialog);
  }, []);

  const close = useCallback(() => {
    const currentTool = model.toolsController.getCurrentTool();
    currentTool?.stop();
    setActiveDialog(null);
  }, [model]);

  const isOpen = useCallback((dialog: NonNullable<DialogName>) => {
    return activeDialog === dialog;
  }, [activeDialog]);

  // Memoized object with all dialog states for convenience
  const dialogs = useMemo(() => ({
    settings: activeDialog === 'settings',
    results: activeDialog === 'results',
    move: activeDialog === 'move',
    draw: activeDialog === 'draw',
    docs: activeDialog === 'docs',
    sections: activeDialog === 'sections',
    loads: activeDialog === 'loads',
    supports: activeDialog === 'supports',
    materials: activeDialog === 'materials',
    copy: activeDialog === 'copy',
  }), [activeDialog]);

  return { activeDialog, open, close, isOpen, dialogs };
}