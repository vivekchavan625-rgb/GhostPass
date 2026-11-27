import React, { createContext, useContext, useEffect, useState } from 'react';

export type RoutePath =
  | 'home'
  | 'workspace'
  | 'insights'
  | 'privacy'
  | 'audit'
  | 'evaluate'
  | 'about';

interface RouterContextType {
  currentRoute: RoutePath;
  navigate: (route: RoutePath) => void;
}

const RouterContext = createContext<RouterContextType>({
  currentRoute: 'home',
  navigate: () => {},
});

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const getRouteFromHash = (): RoutePath => {
    const hash = window.location.hash.replace('#', '').trim().toLowerCase();
    const validRoutes: RoutePath[] = [
      'home',
      'workspace',
      'insights',
      'privacy',
      'audit',
      'evaluate',
      'about',
    ];
    return validRoutes.includes(hash as RoutePath) ? (hash as RoutePath) : 'home';
  };

  const [currentRoute, setCurrentRoute] = useState<RoutePath>(getRouteFromHash);

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentRoute(getRouteFromHash());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (route: RoutePath) => {
    window.location.hash = `#${route}`;
  };

  return (
    <RouterContext.Provider value={{ currentRoute, navigate }}>
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = () => useContext(RouterContext);
