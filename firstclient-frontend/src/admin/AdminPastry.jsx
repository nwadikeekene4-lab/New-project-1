import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import './AdminPastry.css'; 

export default function AdminPastry() {
  const [pastries, setPastries] = useState([]);
  const [activeTab, setActiveTab] = useState("Cakes");
  const [errorLog, setErrorLog] = useState(null);

  // FORM STATES
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newImageFile, setNewImageFile] = useState(null);

  useEffect(() => {
    console.log("DIAGNOSTIC: Pastry Component Mounted");
    fetchPastries();
  }, []);

  const fetchPastries = async () => {
    try {
      const res = await API.get("/products?category=pastry");
      console.log("DATABASE RESPONSE:", res.data);
      setPastries(res.data);
      if (res.data.length === 0) {
        setErrorLog("Warning: Database returned 0 pastries. Check if products have category='pastry'");
      }
    } catch (err) {
      setErrorLog(`API Error: ${err.message}`);
    }
  };

  return (
    <div className="pastry-admin-page">
      {/* 🚨 THE DIAGNOSTIC BOX - IF YOU DON'T SEE THIS, THE CODE IS NOT UPDATED ON THE SERVER */}
      <div style={{background: 'red', color: 'white', padding: '20px', textAlign: 'center', fontWeight: 'bold', fontSize: '20px', zIndex: 9999}}>
        DEBUG MODE ACTIVE: Update Time 6:45 PM <br/>
        Active Tab: {activeTab} | Items Found: {pastries.length} <br/>
        {errorLog && <span style={{color: 'yellow'}}>ERROR: {errorLog}</span>}
      </div>

      <div className="pastry-max-width">
        <header className="pastry-dashboard-header">
           <div className="pastry-title-row">
            <Link to="/admin" className="pastry-back-arrow">←</Link>
            <h1>Pastry Kitchen</h1>
          </div>

          <div className="pastry-tabs-nav">
            {["Cakes", "Breads", "Others"].map(tab => (
              <button 
                key={tab} 
                className={activeTab === tab ? "pastry-tab active" : "pastry-tab"}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
          {/* ... rest of your form ... */}
          <p style={{textAlign: 'center', color: '#1a2a6c'}}>Current View: {activeTab} Management</p>
        </header>
        
        <div className="pastry-inventory-grid">
            {pastries.filter(p => p.subCategory === activeTab).map(p => (
                <div key={p.id} className="pastry-card">
                    <img src={p.image} alt="" style={{width: '100%'}} />
                    <p>{p.name}</p>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
        }
