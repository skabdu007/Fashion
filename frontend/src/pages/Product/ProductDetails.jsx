import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import api, { API_BASE_URL } from "../../utils/axios";
import { getProductImageUrl, handleImageError } from "../../utils/image";
import useCurrentUser from "../../hooks/useCurrentUser";
import { createProductReview, getProductReviews } from "../../services/reviewService";
import { getUserOrders } from "../../services/orderService";
import { useToast } from "../../components/ui/ToastProvider";

const reviewFormDefault = {
  rating: 5,
  comment: ""
};

export default function ProductDetails() {
  const { id } = useParams();
  const toast = useToast();
  const { userId } = useCurrentUser();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState(reviewFormDefault);
  const [canReview, setCanReview] = useState(false);
  const [loading, setLoading] = useState(true);

  const averageRating = useMemo(() => {
    if (!reviews.length) return 0;
    const total = reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0);
    return total / reviews.length;
  }, [reviews]);

  useEffect(() => {
    const load = async () => {
      try {
        const [productResponse, reviewItems] = await Promise.all([
          api.get(`/product/${id}`),
          getProductReviews(id)
        ]);

        setProduct(productResponse.data.data);
        setReviews(reviewItems);

        if (userId) {
          const orders = await getUserOrders(userId);
          const deliveredOrder = orders.find((order) =>
            order.status === "DELIVERED" &&
            order.items.some((item) => String(item.product_id?._id || item.product_id) === String(id))
          );
          setCanReview(Boolean(deliveredOrder));
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Unable to load product details.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, toast, userId]);

  const submitReview = async (event) => {
    event.preventDefault();

    try {
      await createProductReview({
        product_id: id,
        user_id: userId,
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment
      });
      const updatedReviews = await getProductReviews(id);
      setReviews(updatedReviews);
      setReviewForm(reviewFormDefault);
      toast.success("Review submitted successfully.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to submit review.");
    }
  };

  if (loading) {
    return <div className="shop-shell"><div className="shop-container"><div className="glass-card premium-panel">Loading product details...</div></div></div>;
  }

  if (!product) {
    return <div className="shop-shell"><div className="shop-container"><div className="glass-card premium-panel">Product not found.</div></div></div>;
  }

  return (
    <div className="shop-shell">
      <div className="shop-container">
        <section className="glass-card premium-panel product-detail-layout">
          <div className="product-detail-media">
            <img
              src={getProductImageUrl(product.image)}
              alt={product.product_name}
              onError={handleImageError}
            />
          </div>

          <div className="product-detail-copy">
            <div className="premium-badge">CrownCart</div>
            <h1>{product.product_name}</h1>
            <p>{product.description}</p>
            <div className="summary-grid">
              <div className="summary-tile">
                <div className="summary-label">Price</div>
                <div className="summary-value">Rs. {Number(product.price || 0).toLocaleString()}</div>
              </div>
              <div className="summary-tile">
                <div className="summary-label">Average Rating</div>
                <div className="summary-value">{averageRating.toFixed(1)} / 5</div>
              </div>
              <div className="summary-tile">
                <div className="summary-label">Reviews</div>
                <div className="summary-value">{reviews.length}</div>
              </div>
            </div>
          </div>
        </section>

        <section className="glass-card premium-panel">
          <div className="auction-card-heading">
            <h2>Ratings & Reviews</h2>
            <span>{reviews.length}</span>
          </div>

          {canReview ? (
            <form className="review-form" onSubmit={submitReview}>
              <select
                value={reviewForm.rating}
                onChange={(event) => setReviewForm((current) => ({ ...current, rating: event.target.value }))}
              >
                {[5, 4, 3, 2, 1].map((star) => (
                  <option key={star} value={star}>{star} Stars</option>
                ))}
              </select>
              <textarea
                placeholder="Share your feedback"
                value={reviewForm.comment}
                onChange={(event) => setReviewForm((current) => ({ ...current, comment: event.target.value }))}
                rows={4}
                required
              />
              <button type="submit" className="btn-modern">Submit Review</button>
            </form>
          ) : (
            <div className="info-banner">Reviews unlock after the product is delivered.</div>
          )}

          <div className="review-list">
            {reviews.length ? reviews.map((review) => (
              <div key={review._id} className="line-item">
                <div>
                  <div className="line-item-title">
                    {(review.user_id?.nickname || review.user_id?.username || "Customer")} | {Number(review.rating || 0)} / 5
                  </div>
                  <div className="line-item-meta">{review.comment || "No written feedback"}</div>
                </div>
              </div>
            )) : <div className="empty-state">No reviews yet.</div>}
          </div>
        </section>
      </div>
    </div>
  );
}
