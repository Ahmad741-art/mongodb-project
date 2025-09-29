import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";

export default function EditEmployee() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Form states
  const [employee, setEmployee] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    job: ""
  });
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Popular job titles for autocomplete
  const jobSuggestions = [
    "Software Engineer", "Product Manager", "UX Designer", "Data Scientist",
    "Marketing Manager", "Sales Representative", "HR Manager", "DevOps Engineer",
    "Quality Assurance", "Business Analyst", "Project Manager", "Customer Success",
    "Finance Manager", "Operations Manager", "Content Writer", "Graphic Designer"
  ];

  const fetchEmployee = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/employees/${id}`);
      if (!res.ok) throw new Error('Employee not found');
      
      const data = await res.json();
      setEmployee(data);
      setFormData({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        job: data.job || ""
      });
    } catch (err) {
      console.error("Error fetching employee:", err);
      setErrors({ fetch: "Failed to load employee data" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployee();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Real-time validation
  const validateField = (name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'name':
        if (!value.trim()) {
          newErrors.name = 'Name is required';
        } else if (value.trim().length < 2) {
          newErrors.name = 'Name must be at least 2 characters';
        } else {
          delete newErrors.name;
        }
        break;
        
      case 'email': {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) {
          newErrors.email = 'Email is required';
        } else if (!emailRegex.test(value)) {
          newErrors.email = 'Please enter a valid email address';
        } else {
          delete newErrors.email;
        }
        break;
      }
        
      case 'phone': {
        const phoneRegex = /^[\d\s\-+().]{10,}$/;
        if (!value.trim()) {
          newErrors.phone = 'Phone number is required';
        } else if (!phoneRegex.test(value.replace(/\s/g, ''))) {
          newErrors.phone = 'Please enter a valid phone number';
        } else {
          delete newErrors.phone;
        }
        break;
      }
        
      case 'job':
        if (!value.trim()) {
          newErrors.job = 'Job title is required';
        } else if (value.trim().length < 2) {
          newErrors.job = 'Job title must be at least 2 characters';
        } else {
          delete newErrors.job;
        }
        break;
        
      default:
        break;
    }
    
    setErrors(newErrors);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Mark field as touched and validate
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
      name: true,
      email: true,
      phone: true,
      job: true
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
      const res = await fetch(`http://localhost:5000/api/employees/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to update employee');

      setShowSuccess(true);
      setTimeout(() => {
        navigate("/employees");
      }, 1500);
    } catch (err) {
      console.error("Error updating employee:", err);
      setErrors({ submit: "Failed to update employee. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  // Get department color for visual feedback
  const getDepartmentColor = (dept) => {
    const colors = {
      'Software Engineer': '#3b82f6',
      'Product Manager': '#10b981',
      'UX Designer': '#8b5cf6',
      'Data Scientist': '#f59e0b',
      'Marketing Manager': '#ef4444',
      'Sales Representative': '#06b6d4',
      'HR Manager': '#84cc16',
      'DevOps Engineer': '#f97316',
      'Quality Assurance': '#ec4899',
      'Business Analyst': '#14b8a6',
      'Project Manager': '#a855f7',
      'Customer Success': '#22c55e',
      'Finance Manager': '#eab308',
      'Operations Manager': '#f43f5e',
      'Content Writer': '#6366f1',
      'Graphic Designer': '#d946ef'
    };
    return colors[dept] || '#6b7280';
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
          <h3 style={{ color: '#94a3b8', margin: 0 }}>Loading Employee Data...</h3>
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
          <h3 style={{ color: '#ef4444', margin: '0 0 1rem 0' }}>⚠️ Error Loading Employee</h3>
          <p style={{ color: '#94a3b8', margin: '0 0 1rem 0' }}>{errors.fetch}</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button 
              onClick={fetchEmployee}
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
            <Link to="/employees">
              <button style={{
                background: 'rgba(75, 85, 99, 0.3)',
                border: '1px solid rgba(75, 85, 99, 0.5)',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                color: '#d1d5db',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}>
                ← Back to Employees
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Header Section */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(16, 185, 129, 0.1))',
        padding: '2rem',
        borderRadius: '1rem',
        marginBottom: '2rem',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        position: 'relative'
      }}>
        {/* Success Notification */}
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
            animation: 'slideIn 0.3s ease-out',
            boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)',
            zIndex: 10
          }}>
            ✅ Employee Updated Successfully!
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${getDepartmentColor(formData.job)}, ${getDepartmentColor(formData.job)}80)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: 'white',
            boxShadow: '0 8px 25px rgba(0,0,0,0.3)'
          }}>
            {formData.name ? formData.name.charAt(0).toUpperCase() : '👤'}
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
              ✏️ Edit Employee Profile
            </h2>
            <p style={{ margin: '0.5rem 0 0 0', color: '#94a3b8', fontSize: '1rem' }}>
              Update employee information and manage their profile
            </p>
          </div>
        </div>

        {/* Breadcrumb Navigation */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.9rem',
          color: '#6b7280'
        }}>
          <Link to="/employees" style={{ color: '#3b82f6', textDecoration: 'none' }}>
            👥 Employees
          </Link>
          <span>→</span>
          <span style={{ color: '#94a3b8' }}>Edit {employee?.name || 'Employee'}</span>
        </div>
      </div>

      {/* Form Card */}
      <div className="form-card" style={{ position: 'relative' }}>
        {/* Error Alert */}
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

        <form onSubmit={handleSubmit} style={{ position: 'relative' }}>
          {/* Form Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            {/* Name Field */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
                color: '#f3f4f6',
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                👤 Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="Enter employee's full name"
                style={{
                  width: '100%',
                  padding: '1rem',
                  border: `2px solid ${errors.name ? '#ef4444' : (touched.name && !errors.name) ? '#10b981' : 'rgba(59, 130, 246, 0.3)'}`,
                  borderRadius: '0.5rem',
                  background: 'rgba(17, 24, 39, 0.8)',
                  color: '#f3f4f6',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease',
                  marginBottom: '0.5rem'
                }}
                required
              />
              {errors.name && (
                <div style={{ color: '#ef4444', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  ⚠️ {errors.name}
                </div>
              )}
              {touched.name && !errors.name && formData.name && (
                <div style={{ color: '#10b981', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  ✅ Looks good!
                </div>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
                color: '#f3f4f6',
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                📧 Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="employee@company.com"
                style={{
                  width: '100%',
                  padding: '1rem',
                  border: `2px solid ${errors.email ? '#ef4444' : (touched.email && !errors.email) ? '#10b981' : 'rgba(59, 130, 246, 0.3)'}`,
                  borderRadius: '0.5rem',
                  background: 'rgba(17, 24, 39, 0.8)',
                  color: '#f3f4f6',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease',
                  marginBottom: '0.5rem'
                }}
                required
              />
              {errors.email && (
                <div style={{ color: '#ef4444', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  ⚠️ {errors.email}
                </div>
              )}
              {touched.email && !errors.email && formData.email && (
                <div style={{ color: '#10b981', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  ✅ Valid email format
                </div>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
                color: '#f3f4f6',
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                📱 Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="+1 (555) 123-4567"
                style={{
                  width: '100%',
                  padding: '1rem',
                  border: `2px solid ${errors.phone ? '#ef4444' : (touched.phone && !errors.phone) ? '#10b981' : 'rgba(59, 130, 246, 0.3)'}`,
                  borderRadius: '0.5rem',
                  background: 'rgba(17, 24, 39, 0.8)',
                  color: '#f3f4f6',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease',
                  marginBottom: '0.5rem'
                }}
                required
              />
              {errors.phone && (
                <div style={{ color: '#ef4444', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  ⚠️ {errors.phone}
                </div>
              )}
              {touched.phone && !errors.phone && formData.phone && (
                <div style={{ color: '#10b981', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  ✅ Valid phone number
                </div>
              )}
            </div>

            {/* Job Field with Autocomplete */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
                color: '#f3f4f6',
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                💼 Job Title / Department
              </label>
              <input
                type="text"
                name="job"
                value={formData.job}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="Enter job title or select from suggestions"
                list="job-suggestions"
                style={{
                  width: '100%',
                  padding: '1rem',
                  border: `2px solid ${errors.job ? '#ef4444' : (touched.job && !errors.job) ? '#10b981' : 'rgba(59, 130, 246, 0.3)'}`,
                  borderRadius: '0.5rem',
                  background: 'rgba(17, 24, 39, 0.8)',
                  color: '#f3f4f6',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease',
                  marginBottom: '0.5rem'
                }}
                required
              />
              <datalist id="job-suggestions">
                {jobSuggestions.map(job => (
                  <option key={job} value={job} />
                ))}
              </datalist>
              {errors.job && (
                <div style={{ color: '#ef4444', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  ⚠️ {errors.job}
                </div>
              )}
              {touched.job && !errors.job && formData.job && (
                <div style={{ 
                  color: getDepartmentColor(formData.job), 
                  fontSize: '0.8rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.25rem' 
                }}>
                  ✅ Department: {formData.job}
                </div>
              )}
            </div>
          </div>

          {/* Quick Job Suggestions */}
          <div style={{ marginTop: '2rem' }}>
            <div style={{ 
              fontSize: '0.9rem', 
              color: '#94a3b8', 
              marginBottom: '0.75rem',
              fontWeight: '600'
            }}>
              💡 Popular Roles:
            </div>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}>
              {jobSuggestions.slice(0, 8).map(job => (
                <button
                  key={job}
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, job }));
                    setTouched(prev => ({ ...prev, job: true }));
                    validateField('job', job);
                  }}
                  style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '1rem',
                    border: `1px solid ${getDepartmentColor(job)}40`,
                    background: formData.job === job 
                      ? getDepartmentColor(job) 
                      : `${getDepartmentColor(job)}20`,
                    color: formData.job === job ? 'white' : getDepartmentColor(job),
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {job}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            marginTop: '3rem',
            paddingTop: '2rem',
            borderTop: '1px solid rgba(75, 85, 99, 0.3)',
            flexWrap: 'wrap'
          }}>
            <button
              type="submit"
              disabled={saving || Object.keys(errors).length > 0}
              style={{
                flex: 1,
                minWidth: '200px',
                background: saving 
                  ? 'rgba(75, 85, 99, 0.5)' 
                  : Object.keys(errors).length > 0
                  ? 'rgba(75, 85, 99, 0.3)'
                  : 'linear-gradient(135deg, #16a34a, #10b981)',
                border: 'none',
                padding: '1rem 2rem',
                borderRadius: '0.5rem',
                color: 'white',
                fontSize: '1rem',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                cursor: saving || Object.keys(errors).length > 0 ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: Object.keys(errors).length === 0 && !saving ? '0 4px 20px rgba(16, 185, 129, 0.4)' : 'none'
              }}
            >
              {saving ? (
                <>
                  <div className="loading-spinner" style={{ width: '20px', height: '20px' }} />
                  Updating Employee...
                </>
              ) : (
                <>💾 Update Employee</>
              )}
            </button>

            <Link to="/employees" style={{ flex: '0 0 auto' }}>
              <button
                type="button"
                disabled={saving}
                style={{
                  background: 'rgba(75, 85, 99, 0.3)',
                  border: '1px solid rgba(75, 85, 99, 0.5)',
                  padding: '1rem 2rem',
                  borderRadius: '0.5rem',
                  color: saving ? '#6b7280' : '#d1d5db',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  opacity: saving ? 0.5 : 1
                }}
              >
                ← Cancel
              </button>
            </Link>
          </div>
        </form>

        {/* Form Progress Indicator */}
        <div style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          background: 'rgba(31, 41, 55, 0.9)',
          padding: '0.5rem 1rem',
          borderRadius: '0.5rem',
          border: '1px solid rgba(75, 85, 99, 0.3)',
          fontSize: '0.8rem',
          color: '#94a3b8'
        }}>
          {Object.keys(errors).length === 0 ? '✅' : '⚠️'} {
            Object.keys(touched).length > 0 
              ? `${Object.keys(formData).filter(key => formData[key] && !errors[key]).length}/4 fields valid`
              : 'Fill out the form'
          }
        </div>
      </div>
    </div>
  );
}