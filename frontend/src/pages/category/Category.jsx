import { useCallback, useEffect, useMemo, useState } from "react";
import AdminConsoleShell from "../../components/admin/AdminConsoleShell";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { useToast } from "../../components/ui/ToastProvider";
import { confirmAction } from "../../utils/alerts";
import api from "../../utils/axios";
import "../../styles/gopal.css";
import "../animation/categorie.css";

const initialForm = {
  name: "",
  description: "",
  parent_id: "",
  status: "ACTIVE"
};

export default function Category() {
  const toast = useToast();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [feedback, setFeedback] = useState({ type: "", text: "" });

  const loadCategories = useCallback(async () => {
      try {
        setLoading(true);
        const res = await api.get("/category");
        setCategories(res.data.data || []);
    } catch (error) {
      console.error("LOAD ERROR:", error);
      setFeedback({ type: "error", text: "Failed to load categories." });
      toast.error("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const filteredCategories = useMemo(() => {
    return categories.filter((cat) =>
      `${cat.name} ${cat.description || ""} ${cat.parent_id?.name || ""}`.toLowerCase().includes(search.toLowerCase())
    );
  }, [categories, search]);

  const parentCategoryOptions = useMemo(() => (
    categories.filter((cat) => !cat.parent_id && String(cat._id) !== String(editingId))
  ), [categories, editingId]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setFeedback({ type: "", text: "" });

      if (editingId) {
        await api.put(`/category/${editingId}`, form);
        setFeedback({ type: "success", text: "Category updated successfully." });
        toast.success("Category updated successfully.");
      } else {
        await api.post("/category", form);
        setFeedback({ type: "success", text: "Category created successfully." });
        toast.success("Category created successfully.");
      }

      resetForm();
      await loadCategories();
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.message || "Failed to save category.";
      setFeedback({
        type: "error",
        text: message
      });
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (category) => {
    setEditingId(category._id);
    setForm({
      name: category.name || "",
      description: category.description || "",
      parent_id: category.parent_id?._id || "",
      status: category.status || "ACTIVE"
    });
  };

  const handleDelete = async (id) => {
    try {
      const confirmation = await confirmAction({
        title: "Delete category?",
        text: "This category will be removed from the admin list.",
        confirmButtonText: "Delete category"
      });

      if (!confirmation.isConfirmed) {
        return;
      }

      await api.delete(`/category/${id}`);
      setCategories((prev) => prev.filter((cat) => cat._id !== id));
      setFeedback({ type: "success", text: "Category deleted successfully." });
      toast.success("Category deleted successfully.");
    } catch (error) {
      console.error("DELETE ERROR:", error);
      setFeedback({ type: "error", text: "Delete failed." });
      toast.error(error.response?.data?.message || "Delete failed.");
    }
  };

  return (
    <AdminConsoleShell
      activeKey="categories"
      title="Category Management"
      description="Create, update, search, and organize your catalog hierarchy from one cleaner admin workspace."
      badge="Catalog Structure"
      secondaryAction={{ label: "Admin Dashboard", path: "/admin/dashboard" }}
      primaryAction={{ label: "Open Products", path: "/admin/productDashboard" }}
    >
      <div className="category-admin-page">
        {feedback.text ? (
          <div className={`${feedback.type}-banner`} style={{ marginBottom: "18px" }}>
            {feedback.text}
          </div>
        ) : null}

        <div className="checkout-layout category-admin-page__layout">
          <section className="glass-card stack-card">
            <h2 className="section-title">
              {editingId ? "Edit Category" : "Create Category"}
            </h2>

            <form onSubmit={handleSubmit} className="form category-admin-page__form">
              <input
                type="text"
                name="name"
                placeholder="Category Name"
                value={form.name}
                onChange={handleChange}
                required
              />

              <textarea
                name="description"
                placeholder="Description"
                value={form.description}
                onChange={handleChange}
                rows={4}
              />

              <select name="parent_id" value={form.parent_id} onChange={handleChange}>
                <option value="">Main Category</option>
                {parentCategoryOptions.map((parent) => (
                  <option key={parent._id} value={parent._id}>
                    {parent.name}
                  </option>
                ))}
              </select>

              <select name="status" value={form.status} onChange={handleChange}>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>

              <div className="cta-row">
                <button type="submit" className="btn-modern hover-scale" disabled={saving}>
                  {saving ? "Saving..." : editingId ? "Update Category" : "Create Category"}
                </button>

                {editingId ? (
                  <button type="button" className="btn-secondary-modern hover-scale" onClick={resetForm}>
                    Cancel Edit
                  </button>
                ) : null}
              </div>
            </form>
          </section>

          <section className="glass-card stack-card">
            <div className="category-admin-page__toolbar">
              <h2 className="section-title" style={{ marginBottom: 0 }}>
                All Categories
              </h2>
              <input
                className="search category-admin-page__search"
                placeholder="Search categories..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            {loading ? (
              <LoadingSpinner centered label="Loading categories..." />
            ) : filteredCategories.length === 0 ? (
              <div className="empty-state">No categories found.</div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Parent</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCategories.map((cat) => (
                    <tr key={cat._id}>
                      <td>{cat.name}</td>
                      <td>{cat.parent_id ? "Subcategory" : "Main Category"}</td>
                      <td>{cat.parent_id?.name || "-"}</td>
                      <td>{cat.description || "-"}</td>
                      <td>
                        <span className={`status ${cat.status === "ACTIVE" ? "DELIVERED" : "CANCELLED"}`}>
                          {cat.status}
                        </span>
                      </td>
                      <td>
                        <div className="category-admin-page__actions">
                          <button className="btn edit hover-scale" onClick={() => startEdit(cat)}>
                            Edit
                          </button>
                          <button className="btn delete hover-scale" onClick={() => handleDelete(cat._id)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </div>
      </div>
    </AdminConsoleShell>
  );
}
