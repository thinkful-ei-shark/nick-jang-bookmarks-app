import cuid from 'cuid';

const bookmarks = []; // {id: '', title: '', rating: 0, url: '', description: '', expanded: false, edits: {}}
const adding = [];    // { Same as above without expanded and edits} Save adding data to rerender on changes to store
let error = null;     // Errors from API
let filter = 0;       // Filter results by minimum rating

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
  findAndDelete(tentativeId, 'adding');
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
    bookmarks.forEach((bookmark, index) => {
      if (bookmark.id === id) delete bookmarks[index];
    });
  } else {
    adding.forEach((bookmark, index) => {
      if (bookmark.id === id) delete adding[index];
    });
  }
};

const setFilter = function (num) {
  this.filter = num;
};

const toggleEditting = function (id) {
  let bookmark = findById(id, 'bookmark');
  if (Object.keys(bookmark.edits).length) {
    bookmark.edits = {};
  } else {
    console.log('edit start', bookmarks[0].edits);
    bookmark.edits = {
      id: bookmark.id,
      title: bookmark.title,
      rating: bookmark.rating, url: bookmark.url,
      desc: bookmark.desc
    };
    bookmark.expanded = true;
    console.log('edit end', bookmarks[0].expanded);
  }
};

const saveTentativeData = function (type, data) {
  let bookmark = findById(data.id, type);
  if (type === 'adding') {
    if (bookmark) {
      Object.assign(bookmark, data);
    } else {
      adding.push(data);
    }
  } else if (type === 'bookmark') {
    Object.assign(bookmark.edits, data);
  }
};

const addTentativeBookmark = function () {
  let newBookmark = {
    id: cuid(),
    title: '',
    rating: 0,
    url: '',
    description: ''
  };
  adding.push(newBookmark);
};

const setError = function (e) {
  Object.assign(error, e);
};

const resetError = function () {
  this.error.code = '';
  this.error.message = '';
};

export default {
  bookmarks,
  adding,
  filter,
  findById,
  addBookmark,
  findAndUpdate,
  findAndDelete,
  setFilter,
  toggleEditting,
  saveTentativeData,
  addTentativeBookmark,
  setError,
  resetError
};