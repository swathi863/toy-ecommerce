import React from 'react';

export default function CategoryNavBar({ categories, selectedCategoryId, onSelectCategory }) {
  return (
    <div className="category-nav">
      <div className="category-nav-inner">
        {/* All Toys */}
        <button
          className={`category-btn ${selectedCategoryId === null ? 'active' : ''}`}
          onClick={() => onSelectCategory(null)}
        >
          All Toys
        </button>

        {/* Dynamic Categories from DB */}
        {categories.map((category) => (
          <button
            key={category.categoryId}
            className={`category-btn ${selectedCategoryId === category.categoryId ? 'active' : ''}`}
            onClick={() => onSelectCategory(category.categoryId)}
          >
            {category.categoryName}
          </button>
        ))}
      </div>
    </div>
  );
}
