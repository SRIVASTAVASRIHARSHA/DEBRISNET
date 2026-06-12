let searchQuery = '';
let selectedNoradId = null;
export const setSearchQuery = (q) => { searchQuery = q; };
export const getSearchQuery = () => searchQuery;
export const setSelectedNoradId = (id) => { selectedNoradId = id; };
export const getSelectedNoradId = () => selectedNoradId;
