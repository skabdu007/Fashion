import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuctionFlow } from "../../context/AuctionFlowContext";

export default function AuctionProductSelection() {
  const navigate = useNavigate();
  const { flow, createdCount } = useAuctionFlow();

  const selectedProducts = useMemo(
    () => flow.createdProducts || [],
    [flow.createdProducts]
  );

  return (
    <div className="shop-shell">
      <div className="shop-container">
        <section className="glass-card premium-panel">
          <div className="auction-card-heading">
            <div>
              <div className="premium-badge">Shadow Monarch</div>
              <h1>Select Auction Products</h1>
              <p>
                This page now reviews the newly added auction products. Product adding happens in the previous step and
                only the created auction queue is shown here for the dynamic room limit you entered.
              </p>
            </div>
            <span>{createdCount}/{flow.productLimit}</span>
          </div>

          {selectedProducts.length === 0 ? (
            <div className="empty-state">No auction products added yet. Start by adding products for the selected limit.</div>
          ) : (
            <>
              <div className="glass-card auction-create-preview">
                <div className="auction-card-heading">
                  <h3>Selected Queue</h3>
                  <span>{selectedProducts.length} ready</span>
                </div>

                <div className="auction-preview-list">
                  {selectedProducts.map((product, index) => (
                    <div key={product._id} className="line-item">
                      <div>
                        <div className="line-item-title">{index + 1}. {product.product_name}</div>
                        <div className="line-item-meta">
                          Rs. {Number(product.price || 0).toLocaleString()} | Stock {product.stock}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="cta-row">
                <button type="button" className="btn-secondary-modern" onClick={() => navigate("/admin/auction/add-product")}>
                  Back
                </button>
                <button
                  type="button"
                  className="btn-modern"
                  onClick={() => navigate("/admin/create-auction-room")}
                  disabled={createdCount !== flow.productLimit}
                >
                  Create Auction Room
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
