const bookmarks = []; // {id: '', title: '', rating: 0, url: '', description: '', expanded: false, edits: {}}
const adding = [];    // { Same as above } Save adding data to rerender on changes to store
let error = null;     // Errors from API
let filter = 0;       // Filter results by minimum rating

const findById = function (id, type) {
  let foundBookmark = {};
  let searchList = this.bookmarks;
  if (type === adding) searchList = this.adding;

  searchList.forEach(bookmark => {
    if (bookmark.id === id) foundBookmark = bookmark;
  });
  return foundBookmark;
};

const addBookmark = function (bookmark) {
  findAndDelete(bookmark.id, 'adding');
  this.bookmarks.push(bookmark);
};

const findAndUpdate = function (id, updates) {
  let bookmark = findById(id, 'bookmark');
  Object.assign(bookmark, updates);
};

const findAndDelete = function (id, type) {
  let searchList = this.bookmarks;
  if (type === adding) searchList = this.adding;

  searchList = searchList.filter(bookmark => bookmark.id !== id);
};

const setFilter = function (num) {
  this.filter = num;
};

const toggleEditting = function (id) {
  let bookmark = findById(id, 'bookmark');
  if (bookmark.edits) {
    bookmark.edits = { editting: false };
  } else {
    bookmark.edits = { editting: true };
  }
};

const saveTentativeData = function (type, data) {
  let bookmark = findById(data.id, type);
  if (type === 'adding') {
    if (bookmark) {
      Object.assign(bookmark, data);
    } else {
      this.adding.push(data);
    }
  } else if (type === 'bookmark') {
    Object.assign(bookmark, data);
  }
};

const setError = function (e) {
  Object.assign(error, e);
};

const resetError = function () {
  this.error.code = '';
  this.error.message = '';
};

export default {
  findById,
  addBookmark,
  findAndUpdate,
  findAndDelete,
  setFilter,
  toggleEditting,
  saveTentativeData,
  setError,
  resetError
};