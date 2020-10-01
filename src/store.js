import cuid from 'cuid';

let bookmarks = []; // {id: '', title: '', rating: 0, url: '', desc: '', expanded: false, selected: false, edits: {}}
let adding = [];    // { Same as above without expanded and edits} Save adding data to rerender on changes to store
let error = { code: '', message: '' }; // Errors from API
let filter = 0;     // Filter results by minimum rating
let selectAll = false;

const findById = function (id, type) {
  let foundBookmark = {};
  let searchList = bookmarks;
  if (type === 'adding') searchList = adding;

  searchList.forEach(bookmark => {
    if (bookmark.id === id) foundBookmark = bookmark;
  });
  return foundBookmark;
};

const addBookmark = function (tentativeId, bookmark) {
  if (tentativeId) findAndDelete(tentativeId, 'adding');
  bookmark.expanded = false;
  bookmark.edits = {};
  bookmarks.push(bookmark);
};

const findAndUpdate = function (id, updates) {
  let bookmark = findById(id, 'bookmark');

  toggleEditting(id);
  Object.assign(bookmark, updates);
};

const findAndDelete = function (id, type) {
  if (type === 'bookmark') {
    bookmarks = bookmarks.filter(bookmark => bookmark.id !== id);
  } else {
    adding = adding.filter(bookmark => bookmark.id !== id);
  }
};

const toggleExpand = function (id) {
  let bookmark = findById(id, 'bookmark');

  bookmark.expanded = !bookmark.expanded;
};

const toggleEditting = function (id) {
  let bookmark = findById(id, 'bookmark');
  if (Object.keys(bookmark.edits).length) {
    bookmark.edits = {};
  } else {
    bookmark.edits = {
      id: bookmark.id,
      title: bookmark.title,
      rating: bookmark.rating, url: bookmark.url,
      desc: bookmark.desc
    };
    bookmark.expanded = true;
  }
};

const toggleSelected = function (id) {
  let bookmark = findById(id, 'bookmark');
  bookmark.selected = !bookmark.selected;
};

const toggleSelectAll = function () {
  selectAll = !selectAll;
  bookmarks.forEach(bookmark => bookmark.selected = selectAll);
};

const setTentativeData = function (data, type) {
  let found = false;
  if (type === 'adding') {
    adding.forEach((bookmark, index) => {
      if (bookmark.id === data.id) {
        Object.assign(adding[index], data);
        found = true;
      }
    });
  } else if (type === 'edit') {
    bookmarks.forEach((bookmark, index) => {
      if (bookmark.id === data.id) {
        Object.assign(bookmarks[index].edits, data);
        found = true;
      }
    });
  }
  if (!found) throw new Error('Could not find bookmark.');
};

const addTentativeBookmark = function () {
  let newBookmark = {
    id: cuid(),
    title: '',
    rating: 0,
    url: '',
    desc: ''
  };
  adding.push(newBookmark);
};

const getBookmarks = function () {
  return bookmarks;
};

const getAdding = function () {
  return adding;
};

const getFilter = function () {
  return filter;
};

const getSelectAll = function () {
  return selectAll;
};

const setBookmark = function (id, type, bookmark) {
  if (type === 'bookmark') bookmarks.forEach((storeBookmark, index) => {
    if (storeBookmark.id === id) bookmarks[index] = bookmark;
  });

  if (type === 'adding') adding.forEach((storeBookmark, index) => {
    if (storeBookmark.id === id) bookmarks[index] = bookmark;
  });
};

const setFilter = function (fil) {
  filter = fil;
};

const setRating = function (id, headerType, rat) {
  let type = headerType;
  if (headerType === 'edit') type = 'bookmark';
  let bookmark = findById(id, type);

  if (headerType === 'edit') {
    bookmark.edits.rating = rat;
  } else {
    bookmark.rating = rat;
  }
};

const setError = function (e) {
  if (!e.code) {
    error.message = e;
  } else {
    Object.assign(error, e);
  }
};

const getError = function () {
  return error;
};

const resetError = function () {
  error.code = '';
  error.message = '';
};

export default {
  findById,
  addBookmark,
  findAndUpdate,
  findAndDelete,
  toggleExpand,
  toggleEditting,
  toggleSelected,
  toggleSelectAll,
  setTentativeData,
  addTentativeBookmark,
  getBookmarks,
  getAdding,
  getFilter,
  getError,
  getSelectAll,
  setBookmark,
  setFilter,
  setRating,
  setError,
  resetError,
};