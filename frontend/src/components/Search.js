import React, { useState } from "react";
import { Link } from "react-router-dom";
import debounce from "lodash.debounce";
import "../css/search.css";

const defaultPicLink = "https://static.vecteezy.com/system/resources/thumbnails/002/318/271/small/user-profile-icon-free-vector.jpg";

const debouncedSearch = debounce(async (query, setLoading, setError, setSearchResults) => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
        const res = await fetch(`/searchUsers?q=${query}`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            }
        });

        if (!res.ok) {
            throw new Error(`Error: ${res.status} ${res.statusText}`);
        }

        const result = await res.json();
        // Filter results based on the query
        const filteredResults = result.filter(user =>
            user.name.toLowerCase().includes(query.toLowerCase()) || 
            user.userName.toLowerCase().includes(query.toLowerCase())
        );
        setSearchResults(filteredResults);
    } catch (err) {
        console.error('Error searching users:', err);
        setError('Error fetching search results. Please try again.');
    } finally {
        setLoading(false);
    }
}, 300);

export default function Search() {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSearchInputChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        debouncedSearch(query, setLoading, setError, setSearchResults);
    };

    return (
        <div className="search-container">
            <form className="search-form" onSubmit={(e) => e.preventDefault()}>
                <input 
                    type="text" 
                    placeholder="Search users..." 
                    value={searchQuery} 
                    onChange={handleSearchInputChange} 
                />
            </form>
            {loading && <p>Loading...</p>}
            {error && <p className="error-message">{error}</p>}
            {searchResults.length > 0 && (
                <div className="search-results">
                    {searchResults.map(user => (
                        <div className="search-result-item" key={user._id}>
                            <img src={user.Photo || defaultPicLink} alt="profile" />
                            <Link to={`/profile/${user._id}`} className="user-link">
                                {user.name}
                                <p>{user.userName}</p>
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
