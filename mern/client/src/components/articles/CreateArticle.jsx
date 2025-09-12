import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CreateArticle() {
  const [articleNumber, setArticleNumber] = useState("");
  const [articleName, setArticleName] = useState("");
  const [unit, setUnit] = useState("");
  const [packageSize, setPackageSize] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [salesPrice, setSalesPrice] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch("http://localhost:5000/api/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articleNumber, articleName, unit, packageSize, purchasePrice, salesPrice }),
    });
    navigate("/articles");
  };

  return (
    <div className="form-card">
      <h2>Create Article</h2>
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
        <button type="submit" className="success">Create</button>
      </form>
    </div>
  );
}
