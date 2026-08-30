import React, { useEffect, useState } from 'react';
import { FiSave, FiBell, FiMoon, FiGlobe } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../context/LanguageContext';

import Input from '../components/common/Input';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';

export const Settings = () => {
  const { user } = useAuth();
  const { language, setLanguage, t, languageOptions } = useLanguage();
  const [settings, setSettings] = useState({
    name: user?.name || user?.username || '',
    email: user?.email || '',
    language,
    notifications: true,
    darkMode: false
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings((prev) => ({ ...prev, language }));
  }, [language]);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('settingsPage.title')}</h1>

      {saved && (
        <Alert variant="success" onClose={() => setSaved(false)}>
          {t('common.saveSuccess')}
        </Alert>
      )}

      <Card className="mb-4">
        <h3 className="font-bold text-lg mb-4">{t('settingsPage.profile')}</h3>
        <Input
          label={t('settingsPage.name')}
          value={settings.name}
          onChange={(e) => setSettings({ ...settings, name: e.target.value })}
        />
        <Input
          label={t('settingsPage.email')}
          type="email"
          value={settings.email}
          onChange={(e) => setSettings({ ...settings, email: e.target.value })}
        />
      </Card>

      <Card className="mb-6">
        <h3 className="font-bold text-lg mb-4">{t('settingsPage.preferences')}</h3>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 flex items-center gap-2">
            <FiGlobe /> {t('settingsPage.language')}
          </label>
          <select
            value={settings.language}
            onChange={(e) => {
              setSettings({ ...settings, language: e.target.value });
              setLanguage(e.target.value);
            }}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:border-primary"
          >
            {languageOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <FiBell className="text-gray-600" />
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.notifications}
              onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })}
              className="w-4 h-4"
            />
            {t('settingsPage.notifications')}
          </label>
        </div>

        <div className="flex items-center gap-3">
          <FiMoon className="text-gray-600" />
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.darkMode}
              onChange={(e) => setSettings({ ...settings, darkMode: e.target.checked })}
              className="w-4 h-4"
            />
            {t('settingsPage.darkMode')}
          </label>
        </div>
      </Card>

      <Button onClick={handleSave} className="flex items-center gap-2">
        <FiSave /> {t('common.save')}
      </Button>
    </div>
  );
};

export default Settings;