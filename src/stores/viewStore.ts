import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ViewID = 'chat' | 'workspace';

interface ViewState {
  currentView: ViewID;
}

interface ViewActions {
  setView: (view: ViewID) => void;
  toggleView: () => void;
}

export const useViewStore = create<ViewState & ViewActions>()(
  persist(
    (set, get) => ({
      currentView: 'chat',

      setView: (view: ViewID) => {
        set({ currentView: view });
      },

      toggleView: () => {
        const { currentView } = get();
        set({ currentView: currentView === 'chat' ? 'workspace' : 'chat' });
      },
    }),
    {
      name: 'claudecode-ui-view',
    }
  )
);
