import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function EditArticle() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [articleNumber, setArticleNumber] = useState("");
  const [articleName, setArticleName] = useState("");
  const [unit, setUnit] = useState("");
  const [packageSize, setPackageSize] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [salesPrice, setSalesPrice] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArticle = async () => {
      const res = await fetch(`http://localhost:5000/api/articles/${id}`);
      const data = await res.json();
      setArticle(data);
      setArticleNumber(data.articleNumber);
      setArticleName(data.articleName);
      setUnit(data.unit);
      setPackageSize(data.packageSize);
      setPurchasePrice(data.purchasePrice);
      setSalesPrice(data.salesPrice);
    };
    fetchArticle();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch(`http://localhost:5000/api/articles/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articleNumber, articleName, unit, packageSize, purchasePrice, salesPrice }),
    });
    navigate("/articles");
  };

  if (!article) return <h2>Loading...</h2>;

  return (
    <div className="form-card">
      <h2>Edit Article</h2>
      <form onSubmit={handleSubmit}>
        <label>Number</label>
        <input type="number" value={articleNumber} onChange={e => setArticleNumber(e.target.value)} required />
        <label>Name</label>
        <input value={articleName} onChange={e => setArticleName(e.target.value)} required />
        <label>Unit</label>
        <input value={unit} onChange={e => setUnit(e.target.value)} required />
        <label>Package Size</label>
        <input type="number" value={packageSize} onChange={e => setPackageSize(e.target.value)} required />
        <label>Purchase Price</label>
        <input type="number" value={purchasePrice} onChange={e => setPurchasePrice(e.target.value)} required />
        <label>Sales Price</label>
        <input type="number" value={salesPrice} onChange={e => setSalesPrice(e.target.value)} required />
        <button type="submit" className="success">Update</button>
      </form>
    </div>
  );
}
