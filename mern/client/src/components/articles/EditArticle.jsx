import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";

export default function EditArticle() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Form states
  const [article, setArticle] = useState(null);
  const [formData, setFormData] = useState({
    articleNumber: "",
    articleName: "",
    unit: "",
    packageSize: "",
    purchasePrice: "",
    salesPrice: ""
  });
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [priceAnalysis, setPriceAnalysis] = useState({});
  
  // Common units for autocomplete
  const unitSuggestions = [
    "pcs", "kg", "lbs", "g", "oz", "L", "ml", "gal", "ft", "m", "cm", "in",
    "box", "pack", "bottle", "can", "bag", "roll", "sheet", "pair", "dozen", "case"
  ];

  const fetchArticle = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/articles/${id}`);
      if (!res.ok) throw new Error('Article not found');
      
      const data = await res.json();
      setArticle(data);
      setFormData({
        articleNumber: data.articleNumber?.toString() || "",
        articleName: data.articleName || "",
        unit: data.unit || "",
        packageSize: data.packageSize?.toString() || "",
        purchasePrice: data.purchasePrice?.toString() || "",
        salesPrice: data.salesPrice?.toString() || ""
      });
    } catch (err) {
      console.error("Error fetching article:", err);
      setErrors({ fetch: "Failed to load article data" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticle();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Calculate price analysis when prices change
    if (formData.purchasePrice && formData.salesPrice) {
      const purchase = parseFloat(formData.purchasePrice);
      const sales = parseFloat(formData.salesPrice);
      const packageSize = parseFloat(formData.packageSize) || 1;
      
      if (purchase > 0 && sales > 0) {
        const profit = sales - purchase;
        const profitMargin = (profit / sales) * 100;
        const markup = (profit / purchase) * 100;
        const totalValue = sales * packageSize;
        
        setPriceAnalysis({
          profit,
          profitMargin,
          markup,
          totalValue,
          isHealthy: profitMargin >= 20
        });
      }
    } else {
      setPriceAnalysis({});
    }
  }, [formData.purchasePrice, formData.salesPrice, formData.packageSize]);

  // Real-time validation
  const validateField = (name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'articleNumber': {
        const num = parseFloat(value);
        if (!value.trim()) {
          newErrors.articleNumber = 'Article number is required';
        } else if (isNaN(num) || num <= 0) {
          newErrors.articleNumber = 'Must be a positive number';
        } else {
          delete newErrors.articleNumber;
        }
        break;
      }
        
      case 'articleName':
        if (!value.trim()) {
          newErrors.articleName = 'Article name is required';
        } else if (value.trim().length < 2) {
          newErrors.articleName = 'Article name must be at least 2 characters';
        } else {
          delete newErrors.articleName;
        }
        break;
        
      case 'unit':
        if (!value.trim()) {
          newErrors.unit = 'Unit is required';
        } else if (value.trim().length < 1) {
          newErrors.unit = 'Unit must be specified';
        } else {
          delete newErrors.unit;
        }
        break;
        
      case 'packageSize': {
        const size = parseFloat(value);
        if (!value.trim()) {
          newErrors.packageSize = 'Package size is required';
        } else if (isNaN(size) || size <= 0) {
          newErrors.packageSize = 'Must be a positive number';
        } else {
          delete newErrors.packageSize;
        }
        break;
      }
        
      case 'purchasePrice': {
        const purchasePrice = parseFloat(value);
        if (!value.trim()) {
          newErrors.purchasePrice = 'Purchase price is required';
        } else if (isNaN(purchasePrice) || purchasePrice < 0) {
          newErrors.purchasePrice = 'Must be a valid price (≥ 0)';
        } else {
          delete newErrors.purchasePrice;
        }
        break;
      }
        
      case 'salesPrice': {
        const salesPrice = parseFloat(value);
        if (!value.trim()) {
          newErrors.salesPrice = 'Sales price is required';
        } else if (isNaN(salesPrice) || salesPrice < 0) {
          newErrors.salesPrice = 'Must be a valid price (≥ 0)';
        } else if (formData.purchasePrice && salesPrice < parseFloat(formData.purchasePrice)) {
          newErrors.salesPrice = 'Sales price should be higher than purchase price';
        } else {
          delete newErrors.salesPrice;
        }
        break;
      }
        
      default:
        break;
    }
    
    setErrors(newErrors);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      validateField(name, value);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const validateForm = () => {
    Object.keys(formData).forEach(key => {
      validateField(key, formData[key]);
    });
    
    setTouched({
      articleNumber: true,
      articleName: true,
      unit: true,
      packageSize: true,
      purchasePrice: true,
      salesPrice: true
    });
    
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      const submissionData = {
        articleNumber: parseFloat(formData.articleNumber),
        articleName: formData.articleName.trim(),
        unit: formData.unit.trim(),
        packageSize: parseFloat(formData.packageSize),
        purchasePrice: parseFloat(formData.purchasePrice),
        salesPrice: parseFloat(formData.salesPrice)
      };

      const res = await fetch(`http://localhost:5000/api/articles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });

      if (!res.ok) throw new Error('Failed to update article');

      setShowSuccess(true);
      setTimeout(() => {
        navigate("/articles");
      }, 1500);
    } catch (err) {
      console.error("Error updating article:", err);
      setErrors({ submit: "Failed to update article. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };



  if (loading) {
    return (
      <div className="form-card" style={{ textAlign: 'center', padding: '4rem' }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div className="loading-spinner" style={{ width: '40px', height: '40px' }} />
          <h3 style={{ color: '#94a3b8', margin: 0 }}>Loading Article Data...</h3>
          <p style={{ color: '#6b7280', margin: 0 }}>Please wait while we fetch the details</p>
        </div>
      </div>
    );
  }

  if (errors.fetch) {
    return (
      <div className="form-card" style={{ textAlign: 'center' }}>
        <div style={{
          padding: '2rem',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '0.5rem',
          marginBottom: '2rem'
        }}>
          <h3 style={{ color: '#ef4444', margin: '0 0 1rem 0' }}>⚠️ Error Loading Article</h3>
          <p style={{ color: '#94a3b8', margin: '0 0 1rem 0' }}>{errors.fetch}</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button 
              onClick={fetchArticle}
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                color: 'white',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              🔄 Try Again
            </button>
            <Link to="/articles">
              <button style={{
                background: 'rgba(75, 85, 99, 0.3)',
                border: '1px solid rgba(75, 85, 99, 0.5)',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                color: '#d1d5db',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}>
                ← Back to Articles
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(16, 185, 129, 0.1))',
        padding: '2rem',
        borderRadius: '1rem',
        marginBottom: '2rem',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        position: 'relative'
      }}>
        {showSuccess && (
          <div style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'linear-gradient(135deg, #16a34a, #10b981)',
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            color: 'white',
            fontWeight: 'bold',
            boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)',
            zIndex: 10
          }}>
            ✅ Article Updated Successfully!
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            color: 'white',
            boxShadow: '0 8px 25px rgba(59, 130, 246, 0.4)',
            fontWeight: 'bold'
          }}>
            #{formData.articleNumber || '?'}
          </div>
          <div>
            <h2 style={{
              margin: 0,
              background: 'linear-gradient(135deg, #3b82f6, #10b981)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontSize: '2rem',
              fontWeight: 'bold'
            }}>
              ✏️ Edit Article Details
            </h2>
            <p style={{ margin: '0.5rem 0 0 0', color: '#94a3b8', fontSize: '1rem' }}>
              Update product information, pricing, and inventory details
            </p>
          </div>
        </div>

        {priceAnalysis.profit !== undefined && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem',
            marginTop: '1.5rem'
          }}>
            <div style={{
              padding: '1rem',
              background: priceAnalysis.profit >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${priceAnalysis.profit >= 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              borderRadius: '0.5rem',
              textAlign: 'center'
            }}>
              <div style={{ 
                fontSize: '1.2rem', 
                fontWeight: 'bold', 
                color: priceAnalysis.profit >= 0 ? '#10b981' : '#ef4444' 
              }}>
                {formatCurrency(priceAnalysis.profit)}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Profit per Unit</div>
            </div>
            
            <div style={{
              padding: '1rem',
              background: priceAnalysis.isHealthy ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
              border: `1px solid ${priceAnalysis.isHealthy ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
              borderRadius: '0.5rem',
              textAlign: 'center'
            }}>
              <div style={{ 
                fontSize: '1.2rem', 
                fontWeight: 'bold', 
                color: priceAnalysis.isHealthy ? '#10b981' : '#f59e0b' 
              }}>
                {priceAnalysis.profitMargin.toFixed(1)}%
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Profit Margin</div>
            </div>
            
            <div style={{
              padding: '1rem',
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '0.5rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#3b82f6' }}>
                {priceAnalysis.markup.toFixed(1)}%
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Markup</div>
            </div>
            
            <div style={{
              padding: '1rem',
              background: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '0.5rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#8b5cf6' }}>
                {formatCurrency(priceAnalysis.totalValue)}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Total Package Value</div>
            </div>
          </div>
        )}

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.9rem',
          color: '#6b7280',
          marginTop: '1rem'
        }}>
          <Link to="/articles" style={{ color: '#3b82f6', textDecoration: 'none' }}>
            📦 Articles
          </Link>
          <span>→</span>
          <span style={{ color: '#94a3b8' }}>Edit {article?.articleName || 'Article'}</span>
        </div>
      </div>

      <div className="form-card" style={{ position: 'relative' }}>
        {errors.submit && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '0.5rem',
            padding: '1rem',
            marginBottom: '2rem',
            color: '#ef4444'
          }}>
            <strong>⚠️ Update Failed:</strong> {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            <div>
              <label>🔢 Article Number</label>
              <input
                type="number"
                name="articleNumber"
                value={formData.articleNumber}
                onChange={handleInputChange}
                onBlur={handleBlur}
                required
              />
              {errors.articleNumber && <div style={{ color: '#ef4444', fontSize: '0.8rem' }}>⚠️ {errors.articleNumber}</div>}
            </div>

            <div>
              <label>📦 Article Name</label>
              <input
                type="text"
                name="articleName"
                value={formData.articleName}
                onChange={handleInputChange}
                onBlur={handleBlur}
                required
              />
              {errors.articleName && <div style={{ color: '#ef4444', fontSize: '0.8rem' }}>⚠️ {errors.articleName}</div>}
            </div>

            <div>
              <label>📏 Unit</label>
              <input
                type="text"
                name="unit"
                value={formData.unit}
                onChange={handleInputChange}
                onBlur={handleBlur}
                list="unit-suggestions"
                required
              />
              <datalist id="unit-suggestions">
                {unitSuggestions.map(unit => <option key={unit} value={unit} />)}
              </datalist>
              {errors.unit && <div style={{ color: '#ef4444', fontSize: '0.8rem' }}>⚠️ {errors.unit}</div>}
            </div>

            <div>
              <label>📊 Package Size</label>
              <input
                type="number"
                name="packageSize"
                value={formData.packageSize}
                onChange={handleInputChange}
                onBlur={handleBlur}
                min="0"
                step="any"
                required
              />
              {errors.packageSize && <div style={{ color: '#ef4444', fontSize: '0.8rem' }}>⚠️ {errors.packageSize}</div>}
            </div>

            <div>
              <label>💰 Purchase Price</label>
              <input
                type="number"
                name="purchasePrice"
                value={formData.purchasePrice}
                onChange={handleInputChange}
                onBlur={handleBlur}
                min="0"
                step="0.01"
                required
              />
              {errors.purchasePrice && <div style={{ color: '#ef4444', fontSize: '0.8rem' }}>⚠️ {errors.purchasePrice}</div>}
            </div>

            <div>
              <label>💵 Sales Price</label>
              <input
                type="number"
                name="salesPrice"
                value={formData.salesPrice}
                onChange={handleInputChange}
                onBlur={handleBlur}
                min="0"
                step="0.01"
                required
              />
              {errors.salesPrice && <div style={{ color: '#ef4444', fontSize: '0.8rem' }}>⚠️ {errors.salesPrice}</div>}
            </div>
          </div>

          <div style={{
            display: 'flex',
            gap: '1rem',
            marginTop: '2rem',
            paddingTop: '2rem',
            borderTop: '1px solid rgba(75, 85, 99, 0.3)'
          }}>
            <button
              type="submit"
              disabled={saving || Object.keys(errors).length > 0}
              className="success"
            >
              {saving ? 'Updating...' : '💾 Update Article'}
            </button>
            <Link to="/articles">
              <button type="button" className="button-secondary">← Cancel</button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}