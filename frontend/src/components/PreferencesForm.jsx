export default function PreferencesForm({ preferences, onChange, onNotificationChange, onSubmit }) {
  return (
    <form
      className="space-y-6 transition-colors duration-500"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      {/* Theme Selector */}
      <div className="flex flex-col gap-2">
        <label className="text-gray-700 dark:text-gray-200 font-medium">Theme</label>
        <select
          value={preferences.theme}
          onChange={(e) => onChange("theme", e.target.value)}
          className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 
                     bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 
                     focus:outline-none transition-colors duration-300"
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>

      {/* Currency Selector */}
      <div className="flex flex-col gap-2">
        <label className="text-gray-700 dark:text-gray-200 font-medium">Currency</label>
        <select
          value={preferences.currency}
          onChange={(e) => onChange("currency", e.target.value)}
          className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 
                     bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 
                     focus:outline-none transition-colors duration-300"
        >
          <option value="INR">INR – Indian Rupee</option>
          <option value="USD">USD – US Dollar</option>
          <option value="EUR">EUR – Euro</option>
          <option value="JPY">JPY – Japanese Yen</option>
          <option value="GBP">GBP – British Pound</option>
          <option value="CAD">CAD – Canadian Dollar</option>
          <option value="AUD">AUD – Australian Dollar</option>
          <option value="CHF">CHF – Swiss Franc</option>
          <option value="CNY">CNY – Chinese Yuan</option>
        </select>
      </div>

      {/* Notifications */}
      <div className="flex flex-col gap-2">
        <span className="text-gray-700 dark:text-gray-200 font-medium">Notifications</span>

        <label className="flex items-center gap-3 p-3 border border-gray-300 dark:border-gray-600 
                          rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300 cursor-pointer">
          <input
            type="checkbox"
            checked={preferences.notifications.email}
            onChange={() => onNotificationChange("email")}
            className="w-5 h-5 accent-[#f45a57]"
          />
          <span className="text-gray-700 dark:text-gray-200">Email Notifications</span>
        </label>

        <label className="flex items-center gap-3 p-3 border border-gray-300 dark:border-gray-600 
                          rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300 cursor-pointer">
          <input
            type="checkbox"
            checked={preferences.notifications.push}
            onChange={() => onNotificationChange("push")}
            className="w-5 h-5 accent-[#f45a57]"
          />
          <span className="text-gray-700 dark:text-gray-200">Push Notifications</span>
        </label>
      </div>

      {/* Save Button */}
      <button
        type="submit"
        className="w-full py-3 bg-black dark:bg-[#f45a57] text-white 
                   hover:bg-[#f45a57] dark:hover:bg-[#e14b48] 
                   font-semibold rounded-xl shadow-lg transition-colors duration-300"
      >
        Save Preferences
      </button>
    </form>
  );
}
