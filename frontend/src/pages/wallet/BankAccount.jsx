import { useEffect, useState } from "react";
import { useToast } from "../../components/ui/ToastProvider";
import useCurrentUser from "../../hooks/useCurrentUser";
import { getBankAccount, saveBankAccount } from "../../services/customerService";

const emptyForm = {
  account_holder_name: "",
  account_number: "",
  ifsc_code: "",
  bank_name: ""
};

export default function BankAccount() {
  const toast = useToast();
  const { userId, isAuthenticated } = useCurrentUser();
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!userId) {
        setLoading(false);
        setError("Please login to manage your bank account.");
        return;
      }

      try {
        const data = await getBankAccount(userId);
        setForm({ ...emptyForm, ...data });
      } catch (loadError) {
        setError(loadError.response?.data?.message || "Unable to load bank account.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [userId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      setSaving(true);
      const data = await saveBankAccount(userId, form);
      setForm({ ...emptyForm, ...data });
      toast.success("Bank account saved for future withdrawal support.");
    } catch (saveError) {
      const message = saveError.response?.data?.message || "Unable to save bank account.";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="shop-shell">
      <div className="shop-container">
        <section className="glass-card premium-panel">
          <div className="premium-badge">CrownCart Wallet</div>
          <h1>Add Bank Account</h1>
          <p>Bank details are stored securely in the database and kept ready for the future withdrawal feature.</p>

          {!isAuthenticated || error ? <div className="error-banner">{error}</div> : null}

          {!loading ? (
            <form className="bank-form" onSubmit={handleSubmit}>
              <input
                placeholder="Account Holder Name"
                value={form.account_holder_name}
                onChange={(event) => setForm((current) => ({ ...current, account_holder_name: event.target.value }))}
                required
              />
              <input
                placeholder="Account Number"
                value={form.account_number}
                onChange={(event) => setForm((current) => ({ ...current, account_number: event.target.value }))}
                required
              />
              <input
                placeholder="IFSC Code"
                value={form.ifsc_code}
                onChange={(event) => setForm((current) => ({ ...current, ifsc_code: event.target.value.toUpperCase() }))}
                required
              />
              <input
                placeholder="Bank Name"
                value={form.bank_name}
                onChange={(event) => setForm((current) => ({ ...current, bank_name: event.target.value }))}
                required
              />

              <div className="cta-row">
                <button type="submit" className="btn-modern" disabled={saving || !isAuthenticated}>
                  {saving ? "Saving..." : "Save Bank Account"}
                </button>
              </div>
            </form>
          ) : (
            <div className="info-banner">Loading bank account details...</div>
          )}
        </section>
      </div>
    </div>
  );
}
