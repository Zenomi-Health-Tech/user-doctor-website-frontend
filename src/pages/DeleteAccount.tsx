export default function DeleteAccount() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Delete Your Account</h1>

        <p className="text-gray-600 mb-6">
          We're sorry to see you go. If you'd like to delete your Zenomi account and all associated data, please follow the steps below.
        </p>

        <h2 className="text-lg font-semibold text-gray-900 mb-3">How to Request Account Deletion</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-600 mb-6">
          <li>Open the Zenomi app on your device</li>
          <li>Go to <strong>Profile</strong></li>
          <li>Tap <strong>Delete Account</strong></li>
          <li>Confirm your request</li>
        </ol>

        <p className="text-gray-600 mb-4">
          Alternatively, you can email us at{" "}
          <a href="mailto:support@zenomihealth.com" className="text-[#704180] font-medium underline">
            support@zenomihealth.com
          </a>{" "}
          with the subject line "Delete My Account" from your registered email address.
        </p>

        <h2 className="text-lg font-semibold text-gray-900 mb-3">What Data Will Be Deleted</h2>
        <ul className="list-disc list-inside space-y-1 text-gray-600 mb-6">
          <li>Your profile information (name, email, phone number)</li>
          <li>Assessment scores and test history</li>
          <li>Sleep tracker logs</li>
          <li>Appointment history</li>
          <li>Push notification tokens</li>
          <li>Course enrollment data</li>
        </ul>

        <h2 className="text-lg font-semibold text-gray-900 mb-3">Data Retention</h2>
        <p className="text-gray-600 mb-6">
          Your account and all associated data will be permanently deleted within 30 days of your request. Anonymized, aggregated data that cannot be linked back to you may be retained for analytics purposes.
        </p>

        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500">
            If you have any questions, contact us at{" "}
            <a href="mailto:support@zenomihealth.com" className="text-[#704180] font-medium">
              support@zenomihealth.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
