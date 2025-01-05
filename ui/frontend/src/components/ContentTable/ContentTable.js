import React, { useState } from 'react';
import './ContentTable.css';
import { useNavigate } from "react-router-dom";



const ContentTable = ({ data }) => {
    // States for sorting, filtering and data
    const [filteredData, setFilteredData] = useState(data);
    const [sortConfig, setSortConfig] = useState(null);
    const navigate = useNavigate();


    const [filters, setFilters] = useState({
        title: '',
        description: '',
        topics: '',
        tags: '',
        hash_tags: '',
        startDate: '',
        endDate: '',
    });

    const [visibleColumns, setVisibleColumns] = useState({
        id: false,
        title: true,
        description: false,
        published_at: true,
        views: true,
        likes: false,
        dislikes: false,
        comment_count: false,
        topics: true,
        tags: true,
        hash_tags: true,
    });

    // Handle sorting
    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const sortedData = React.useMemo(() => {
        let sortableItems = [...filteredData];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        console.log("filteredData")
        console.log(filteredData)

        return sortableItems;
    }, [filteredData, sortConfig]);

    // Handle filtering
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prevFilters) => {
            const updatedFilters = { ...prevFilters, [name]: value };
            applyFilters(updatedFilters);
            return updatedFilters;
        });
    };

    // Apply filters to data
    const applyFilters = (newFilters) => {
        const filtered = data.filter((item) => {
            const publishedAt = new Date(item.published_at);
            const startDate = newFilters.startDate ? new Date(newFilters.startDate) : null;
            const endDate = newFilters.endDate ? new Date(newFilters.endDate) : null;

            const isDateInRange =
                (!startDate || publishedAt >= startDate) && (!endDate || publishedAt <= endDate);

            return (
                item.title.toLowerCase().includes(newFilters.title.toLowerCase()) &&
                item.description.toLowerCase().includes(newFilters.description.toLowerCase()) &&
                item.topics.toLowerCase().includes(newFilters.topics.toLowerCase()) &&
                item.tags.toLowerCase().includes(newFilters.tags.toLowerCase()) &&
                item.hash_tags.toLowerCase().includes(newFilters.hash_tags.toLowerCase()) &&
                isDateInRange
            );
        });
        setFilteredData(filtered);
    };
    // Toggle visibility of column
    const toggleColumnVisibility = (column) => {
        setVisibleColumns((prevVisibility) => ({
            ...prevVisibility,
            [column]: !prevVisibility[column],
        }));
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-based, so we add 1
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    };

    const formatAsTags = (topics) => {
        return (topics || "").split(';').map((topic, index) => (
            <span key={index} className="tag">
      {topic.trim()}
    </span>
        ));
    };

    const handleNavigate = () => {
        navigate("/analysis", { state: { sortedData } });
    };

    return (
        <div className="content-table-container">
            <h3>Total Videos - {data.length}</h3>

            {/* Filter Inputs */}
            <div className="filters">
                <input
                    type="text"
                    name="title"
                    placeholder="Filter by Title"
                    value={filters.title}
                    onChange={handleFilterChange}
                />
                <input
                    type="text"
                    name="description"
                    placeholder="Filter by Description"
                    value={filters.description}
                    onChange={handleFilterChange}
                />
                <input
                    type="text"
                    name="topics"
                    placeholder="Filter by Topics"
                    value={filters.topics}
                    onChange={handleFilterChange}
                />
                <input
                    type="text"
                    name="tags"
                    placeholder="Filter by Tags"
                    value={filters.tags}
                    onChange={handleFilterChange}
                />
                <input
                    type="text"
                    name="hash_tags"
                    placeholder="Filter by HashTags"
                    value={filters.hash_tags}
                    onChange={handleFilterChange}
                />
                <input
                    type="date"
                    name="startDate"
                    value={filters.startDate}
                    onChange={handleFilterChange}
                />
                <input
                    type="date"
                    name="endDate"
                    value={filters.endDate}
                    onChange={handleFilterChange}
                />
            </div>
            <div>
                <h4>Filtered Videos - {sortedData.length}</h4>
                {/* Button to navigate to Analysis */}
                <button onClick={handleNavigate} style={{ padding: "10px 20px", cursor: "pointer" }}>
                    Open Analysis
                </button>
            </div>
            {/* Column Visibility Toggles */}
            <div className="column-visibility">
                <h4>Show/Hide Columns</h4>
                <label>
                    <input
                        type="checkbox"
                        checked={visibleColumns.id}
                        onChange={() => toggleColumnVisibility('id')}
                    />
                    ID
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={visibleColumns.title}
                        onChange={() => toggleColumnVisibility('title')}
                    />
                    Title
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={visibleColumns.description}
                        onChange={() => toggleColumnVisibility('description')}
                    />
                    Description
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={visibleColumns.published_at}
                        onChange={() => toggleColumnVisibility('published_at')}
                    />
                    Published At
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={visibleColumns.views}
                        onChange={() => toggleColumnVisibility('views')}
                    />
                    View Count
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={visibleColumns.likes}
                        onChange={() => toggleColumnVisibility('likes')}
                    />
                    Like Count
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={visibleColumns.dislikes}
                        onChange={() => toggleColumnVisibility('dislikes')}
                    />
                    Dislike Count
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={visibleColumns.comment_count}
                        onChange={() => toggleColumnVisibility('comment_count')}
                    />
                    Comment Count
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={visibleColumns.topics}
                        onChange={() => toggleColumnVisibility('topics')}
                    />
                    Topics
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={visibleColumns.tags}
                        onChange={() => toggleColumnVisibility('tags')}
                    />
                    Tags
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={visibleColumns.hash_tags}
                        onChange={() => toggleColumnVisibility('hash_tags')}
                    />
                    Hash Tags
                </label>
            </div>

            {/* Table */}
            <table className="content-table">
                <thead>
                <tr>
                    {visibleColumns.id && <th onClick={() => requestSort('id')}>ID</th>}
                    {visibleColumns.title && <th onClick={() => requestSort('title')}>Title</th>}
                    {visibleColumns.description && <th onClick={() => requestSort('description')}>Description</th>}
                    {visibleColumns.published_at && <th onClick={() => requestSort('published_at')}>Published at</th>}
                    {visibleColumns.views && <th onClick={() => requestSort('views')}>Views</th>}
                    {visibleColumns.likes && <th onClick={() => requestSort('Likes')}>Likes</th>}
                    {visibleColumns.dislikes && <th onClick={() => requestSort('Dislikes')}>Dislikes</th>}
                    {visibleColumns.comment_count &&
                        <th onClick={() => requestSort('comment_count')}>Comment count</th>}
                    {visibleColumns.topics && <th onClick={() => requestSort('topics')}>Topics</th>}
                    {visibleColumns.tags && <th onClick={() => requestSort('tags')}>Tags</th>}
                    {visibleColumns.hash_tags && <th onClick={() => requestSort('hash_tags')}>Hash Tags</th>}
                </tr>
                </thead>
                <tbody>
                {sortedData.map((item) => (
                    <tr key={item.id}>
                        {visibleColumns.id && <td>{item.id}</td>}
                        {visibleColumns.title && <td>{item.title}</td>}
                        {visibleColumns.description && <td>{item.description}</td>}
                        {visibleColumns.published_at && <td>{formatDate(item.published_at)}</td>}
                        {visibleColumns.views && <td>{item.views}</td>}
                        {visibleColumns.likes && <td>{item.likes}</td>}
                        {visibleColumns.dislikes && <td>{item.dislikes}</td>}
                        {visibleColumns.comment_count && <td>{item.comment_count}</td>}
                        {visibleColumns.topics && <td>{formatAsTags(item.topics)}</td>}
                        {visibleColumns.tags && <td>{formatAsTags(item.tags)}</td>}
                        {visibleColumns.hash_tags && <td>{formatAsTags(item.hash_tags)}</td>}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default ContentTable;
