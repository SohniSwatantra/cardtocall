import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { NeonAuthUIProvider } from '@neondatabase/auth/react/ui';
import '@neondatabase/auth/ui/css';
import { authClient } from './auth';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import HomePage from './pages/HomePage';
import ContactsPage from './pages/ContactsPage';
import ContactDetailPage from './pages/ContactDetailPage';

function AppRoutes() {
  return (
    <NeonAuthUIProvider authClient={authClient} redirectTo="/app">
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />

        {/* Protected app routes */}
        <Route path="/app" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="contacts" element={<ContactsPage />} />
          <Route path="contacts/:id" element={<ContactDetailPage />} />
        </Route>
      </Routes>
    </NeonAuthUIProvider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
