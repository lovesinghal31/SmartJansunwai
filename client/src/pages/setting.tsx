export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* 🔐 Basic Profile Settings */}
      <section className="bg-white shadow rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block font-medium">Full Name</label>
            <input
              type="text"
              className="mt-1 w-full border rounded-lg p-2"
              placeholder="Enter your name"
            />
          </div>
          <div>
            <label className="block font-medium">Profile Photo</label>
            <input type="file" />
          </div>
          <div className="flex gap-4">
            <div>
              <label className="block font-medium">Gender</label>
              <select className="mt-1 border rounded-lg p-2">
                <option>Prefer not to say</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block font-medium">Date of Birth</label>
              <input type="date" className="mt-1 border rounded-lg p-2" />
            </div>
          </div>
          <div>
            <label className="block font-medium">Mobile Number (verified)</label>
            <input
              type="tel"
              className="mt-1 w-full border rounded-lg p-2"
              readOnly
              value="+91 9876543210"
            />
          </div>
          <div>
            <label className="block font-medium">Email ID (verified)</label>
            <input
              type="email"
              className="mt-1 w-full border rounded-lg p-2"
              readOnly
              value="example@email.com"
            />
          </div>
        </div>
      </section>

      {/* 📍 Location Details */}
      <section className="bg-white shadow rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4">Location Details</h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Current Address"
            className="w-full border rounded-lg p-2"
          />
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="State/District/City/Village"
              className="flex-1 border rounded-lg p-2"
            />
            <input
              type="text"
              placeholder="Pin Code"
              className="w-32 border rounded-lg p-2"
            />
          </div>
        </div>
      </section>

      {/* 🛠 Account Settings */}
      <section className="bg-white shadow rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4">Login & Security</h2>
        <div className="space-y-2">
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg">Change Password</button>
          <button className="px-4 py-2 bg-gray-200 rounded-lg">Enable 2FA</button>
          <button className="px-4 py-2 bg-gray-200 rounded-lg">Manage Linked Accounts</button>
        </div>
      </section>

      {/* 🌐 Language Preferences */}
      <section className="bg-white shadow rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4">Language Preferences</h2>
        <div className="space-y-4">
          <select className="border rounded-lg p-2">
            <option>English</option>
            <option>Hindi</option>
          </select>
          <label className="flex items-center gap-2">
            <input type="checkbox" /> Enable Multilingual UI
          </label>
        </div>
      </section>

      {/* 📄 My Submissions */}
      <section className="bg-white shadow rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4">My Submissions</h2>
        <button className="px-4 py-2 bg-blue-500 text-white rounded-lg">
          View All Complaints
        </button>
      </section>

      {/* 🔔 Notification Settings */}
      <section className="bg-white shadow rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4">Notification Settings</h2>
        <div className="space-y-2">
          <label><input type="checkbox" /> SMS Alerts</label>
          <label><input type="checkbox" /> Email Alerts</label>
          <label><input type="checkbox" /> Push Notifications</label>
        </div>
      </section>

      {/* 👨‍👩‍👧 Identification */}
      <section className="bg-white shadow rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4">Identification Details</h2>
        <div className="space-y-4">
          <input type="text" placeholder="Aadhaar (masked)" className="border rounded-lg p-2" />
          <input type="text" placeholder="Voter ID" className="border rounded-lg p-2" />
          <input type="text" placeholder="Role" className="border rounded-lg p-2" />
        </div>
      </section>

      {/* 📈 Feedback */}
      <section className="bg-white shadow rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4">Ratings & Feedback</h2>
        <button className="px-4 py-2 bg-blue-500 text-white rounded-lg">View Feedback History</button>
      </section>

      {/* 🧾 Export */}
      <section className="bg-white shadow rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4">Export My Data</h2>
        <button className="px-4 py-2 bg-green-500 text-white rounded-lg">Download PDF/CSV</button>
      </section>

      {/* 🗑 Danger Zone */}
      <section className="bg-white shadow rounded-2xl p-6 border border-red-300">
        <h2 className="text-xl font-semibold text-red-600 mb-4">Delete My Account</h2>
        <button className="px-4 py-2 bg-red-500 text-white rounded-lg">Request Deletion</button>
      </section>
    </div>
  );
}