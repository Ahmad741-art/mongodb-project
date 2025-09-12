import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function ArticleTable() {
  const [articles, setArticles] = useState([]);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("");

  const fetchArticles = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/articles");
      const data = await res.json();
      setArticles(data);
    } catch (err) {
      console.error("Error fetching articles:", err);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this article?")) return;
    await fetch(`http://localhost:5000/api/articles/${id}`, { method: "DELETE" });
    fetchArticles();
  };

  const filtered = articles
    .filter(article =>
      Object.values(article).some(val =>
        String(val).toLowerCase().includes(search.toLowerCase())
      )
    )
    .sort((a, b) => {
      if (!sortKey) return 0;
      return String(a[sortKey]).localeCompare(String(b[sortKey]));
    });

  return (
    <div className="table-container">
      <h2>Articles</h2>
      <Link to="/create-article"><button className="success">Add Article</button></Link>
      <input
        type="text"
        placeholder="Search..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ margin: "1rem 0", padding: "0.5rem", width: "100%" }}
      />
      <table>
        <thead>
          <tr>
            <th onClick={() => setSortKey("articleNumber")}>Number</th>
            <th onClick={() => setSortKey("articleName")}>Name</th>
            <th onClick={() => setSortKey("unit")}>Unit</th>
            <th onClick={() => setSortKey("packageSize")}>Package Size</th>
            <th onClick={() => setSortKey("purchasePrice")}>Purchase Price</th>
            <th onClick={() => setSortKey("salesPrice")}>Sales Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(article => (
            <tr key={article._id}>
              <td>{article.articleNumber}</td>
              <td>{article.articleName}</td>
              <td>{article.unit}</td>
              <td>{article.packageSize}</td>
              <td>{article.purchasePrice}</td>
              <td>{article.salesPrice}</td>
              <td className="action-buttons">
                <Link to={`/edit-article/${article._id}`}><button className="success">Edit</button></Link>
                <button className="danger" onClick={() => handleDelete(article._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
