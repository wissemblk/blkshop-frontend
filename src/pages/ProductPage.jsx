// frontend/src/pages/ProductsPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import productService from '../services/productService';

const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [searchParams, setSearchParams] = useSearchParams();
    
    const [filters, setFilters] = useState({
        category: searchParams.get('category') || '',
        search: searchParams.get('search') || '',
        minPrice: '',
        maxPrice: ''
    });

    useEffect(() => {
        loadProducts();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [products, filters]);

    const loadProducts = async () => {
        try {
            const data = await productService.getAll();
            setProducts(data);
            setFilteredProducts(data);
            
            // Extraire les catégories uniques
            const uniqueCategories = [...new Set(data.map(p => p.category))];
            setCategories(uniqueCategories);
        } catch (error) {
            console.error('Erreur chargement produits:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...products];

        if (filters.category) {
            filtered = filtered.filter(p => p.category === filters.category);
        }

        if (filters.search) {
            filtered = filtered.filter(p => 
                p.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                p.description?.toLowerCase().includes(filters.search.toLowerCase())
            );
        }

        if (filters.minPrice) {
            filtered = filtered.filter(p => p.price >= parseFloat(filters.minPrice));
        }

        if (filters.maxPrice) {
            filtered = filtered.filter(p => p.price <= parseFloat(filters.maxPrice));
        }

        setFilteredProducts(filtered);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        
        // Mettre à jour l'URL
        if (name === 'category' || name === 'search') {
            if (value) {
                searchParams.set(name, value);
            } else {
                searchParams.delete(name);
            }
            setSearchParams(searchParams);
        }
    };

    const clearFilters = () => {
        setFilters({
            category: '',
            search: '',
            minPrice: '',
            maxPrice: ''
        });
        setSearchParams({});
    };

    const styles = {
        container: {
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '20px',
            display: 'grid',
            gridTemplateColumns: '250px 1fr',
            gap: '30px'
        },
        sidebar: {
            backgroundColor: '#f8f9fa',
            padding: '20px',
            borderRadius: '8px',
            height: 'fit-content'
        },
        sidebarTitle: {
            fontSize: '1.3em',
            marginBottom: '20px',
            color: '#333'
        },
        filterGroup: {
            marginBottom: '20px'
        },
        filterLabel: {
            display: 'block',
            marginBottom: '8px',
            fontWeight: '500',
            color: '#555'
        },
        filterInput: {
            width: '100%',
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            marginBottom: '10px'
        },
        filterSelect: {
            width: '100%',
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px'
        },
        clearButton: {
            width: '100%',
            padding: '10px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '10px'
        },
        mainContent: {
            width: '100%'
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
        },
        resultsCount: {
            color: '#666'
        },
        productsGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px'
        },
        productCard: {
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '15px',
            transition: 'transform 0.3s, box-shadow 0.3s',
            cursor: 'pointer'
        },
        productImage: {
            width: '100%',
            height: '200px',
            objectFit: 'cover',
            borderRadius: '5px',
            marginBottom: '15px'
        },
        productName: {
            fontSize: '1.2em',
            fontWeight: 'bold',
            marginBottom: '10px',
            color: '#333'
        },
        productPrice: {
            fontSize: '1.3em',
            color: '#007bff',
            fontWeight: 'bold',
            marginBottom: '10px'
        },
        productStock: {
            color: '#28a745',
            marginBottom: '15px'
        },
        outOfStock: {
            color: '#dc3545'
        },
        productLink: {
            textDecoration: 'none'
        },
        viewButton: {
            width: '100%',
            padding: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
        },
        loading: {
            textAlign: 'center',
            padding: '50px',
            fontSize: '1.2em'
        },
        noResults: {
            textAlign: 'center',
            padding: '50px',
            color: '#666'
        }
    };

    if (loading) {
        return <div style={styles.loading}>Chargement des produits...</div>;
    }

    return (
        <div style={styles.container}>
            {/* Sidebar avec filtres */}
            <aside style={styles.sidebar}>
                <h3 style={styles.sidebarTitle}>Filtres</h3>
                
                <div style={styles.filterGroup}>
                    <label style={styles.filterLabel}>Recherche</label>
                    <input
                        type="text"
                        name="search"
                        value={filters.search}
                        onChange={handleFilterChange}
                        placeholder="Rechercher..."
                        style={styles.filterInput}
                    />
                </div>
                
                <div style={styles.filterGroup}>
                    <label style={styles.filterLabel}>Catégorie</label>
                    <select
                        name="category"
                        value={filters.category}
                        onChange={handleFilterChange}
                        style={styles.filterSelect}
                    >
                        <option value="">Toutes les catégories</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
                
                <div style={styles.filterGroup}>
                    <label style={styles.filterLabel}>Prix minimum (€)</label>
                    <input
                        type="number"
                        name="minPrice"
                        value={filters.minPrice}
                        onChange={handleFilterChange}
                        min="0"
                        style={styles.filterInput}
                    />
                </div>
                
                <div style={styles.filterGroup}>
                    <label style={styles.filterLabel}>Prix maximum (€)</label>
                    <input
                        type="number"
                        name="maxPrice"
                        value={filters.maxPrice}
                        onChange={handleFilterChange}
                        min="0"
                        style={styles.filterInput}
                    />
                </div>
                
                <button onClick={clearFilters} style={styles.clearButton}>
                    Effacer les filtres
                </button>
            </aside>

            {/* Liste des produits */}
            <main style={styles.mainContent}>
                <div style={styles.header}>
                    <h1>Nos produits</h1>
                    <span style={styles.resultsCount}>
                        {filteredProducts.length} produit(s) trouvé(s)
                    </span>
                </div>

                {filteredProducts.length === 0 ? (
                    <div style={styles.noResults}>
                        <h3>Aucun produit trouvé</h3>
                        <p>Essayez de modifier vos filtres</p>
                    </div>
                ) : (
                    <div style={styles.productsGrid}>
                        {filteredProducts.map(product => (
                            <Link 
                                to={`/products/${product.id}`} 
                                key={product.id} 
                                style={styles.productLink}
                            >
                                <div style={styles.productCard}>
                                    <img 
                                        src={product.image || 'https://via.placeholder.com/200'} 
                                        alt={product.name}
                                        style={styles.productImage}
                                    />
                                    <h3 style={styles.productName}>{product.name}</h3>
                                    <p style={styles.productPrice}>{product.price.toFixed(2)} €</p>
                                    <p style={product.stock > 0 ? styles.productStock : styles.outOfStock}>
                                        {product.stock > 0 ? `Stock: ${product.stock}` : 'Rupture de stock'}
                                    </p>
                                    <button style={styles.viewButton}>
                                        Voir détails
                                    </button>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default ProductsPage;