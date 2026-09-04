import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { useToast } from "../components/ui/ToastProvider";
import api, { API_BASE_URL } from "../utils/axios";
import "../styles/gopal.css";
import "./animation/home.css";

export default function Home() {
  const navigate = useNavigate();
  const toast = useToast();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [activeCategory, setActiveCategory] = useState("All");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/category");
        setCategories(res.data.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load categories");
      }
    };

    fetchCategories();
  }, [toast]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoadingProducts(true);

        const category = categories.find(
          (item) => item.name === activeCategory
        );

        const url = category
          ? `/product?category_id=${category._id}`
          : "/product";

        const res = await api.get(url);
        setProducts(res.data.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load products");
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [activeCategory, categories, toast]);

  const handleAddToCart = (product) => {
    try {
      if (!user) {
        toast.warning("Please login first");
        navigate("/customer/login");
        return;
      }

      let cart = JSON.parse(localStorage.getItem("cart") || "[]");

      const existingIndex = cart.findIndex(
        (item) => item.product_id === product._id
      );

      if (existingIndex !== -1) {
        cart[existingIndex].quantity += 1;
      } else {
        cart.push({
          product_id: product._id,
          product_name: product.product_name,
          price: product.price,
          quantity: 1
        });
      }

      localStorage.setItem("cart", JSON.stringify(cart));
      toast.success(`${product.product_name} added to cart`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to add to cart");
    }
  };

  return (
    <div className="home home-page fade-in-page">
      <div className="category-navbar">
        <button
          className={`cat-btn ${activeCategory === "All" ? "active" : ""}`}
          onClick={() => setActiveCategory("All")}
        >
          All
        </button>

        {categories.map((cat) => (
          <button
            key={cat._id}
            className={`cat-btn ${activeCategory === cat.name ? "active" : ""}`}
            onClick={() => setActiveCategory(cat.name)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <section className="home-products-section">
        <h2 className="section-title text-center">Latest Products</h2>

        {loadingProducts ? (
          <LoadingSpinner centered label="Loading products..." />
        ) : (
          <div className="product-grid">
            {products.length === 0 ? (
              <p>No products available.</p>
            ) : (
              products.map((product) => (
                <div key={product._id} className="product-card">
                  <img
                    src={
                      product.image
                        ? `${API_BASE_URL.replace(/\/api$/, "")}${product.image}`
                        : "https://via.placeholder.com/200"
                    }
                    alt={product.product_name}
                    className="product-image"
                  />

                  <h3>{product.product_name}</h3>
                  <p>{product.description}</p>

                  <p className="summary-label">
                    Category: {product.category_id?.name || "Uncategorized"}
                  </p>

                  <p className="order-price">
                    Rs. {Number(product.price || 0).toLocaleString()}
                  </p>

                  <div className="cta-row">
                    <Link
                      to={`/products/${product._id}`}
                      className="btn btn-outline"
                    >
                      View
                    </Link>

                    {user?.role?.toUpperCase() === "CUSTOMER" ? (
                      <button
                        className="btn btn-primary"
                        onClick={() => handleAddToCart(product)}
                      >
                        Add to Cart
                      </button>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </section>
    </div>
  );
}
