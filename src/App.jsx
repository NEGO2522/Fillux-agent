import { HashRouter, BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login          from './pages/Login';
import Home           from './pages/Home';
import Form           from './pages/Form';
import ExtensionPopup from './pages/ExtensionPopup';
import Contact        from './components/Contact';
import Privacy        from './pages/Privacy';

/**
 * Reliable extension detection:
 * chrome.runtime.id is only defined inside an actual extension context.
 * window.innerWidth is unreliable — the popup can be resized.
 */
const IS_EXTENSION =
  typeof chrome !== "undefined" &&
  typeof chrome.runtime !== "undefined" &&
  !!chrome.runtime.id;

function App() {
  // Extension always uses HashRouter — extensions have no server to handle clean URLs.
  if (IS_EXTENSION) {
    return (
      <AuthProvider>
        <HashRouter>
          <Routes>
            <Route path="/"        element={<ExtensionPopup />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="*"        element={<ExtensionPopup />} />
          </Routes>
        </HashRouter>
      </AuthProvider>
    );
  }

  // Web app uses BrowserRouter — Vercel rewrites handle clean URLs via vercel.json.
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"        element={<Login />}   />
          <Route path="/login"   element={<Login />}   />
          <Route path="/home"    element={<Home />}    />
          <Route path="/form"    element={<Form />}    />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
