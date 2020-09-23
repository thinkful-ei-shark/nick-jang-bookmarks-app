const BASE_URL = 'https://thinkful-list-api.herokuapp.com/nick-jang';

const bookmarksFetch = function (...args) {
  let error;
  return fetch(...args)
    .then(res => {
      if (!res.ok) {
        error = { code: res.status };

        if (!res.headers.get('content-type').includes('json')) {
          error.message = res.statusText;
          return Promise.reject(error);
        }
      }

      return res.json();
    })
    .then(data => {
      if (error) {
        error.message = data.message;
        return Promise.reject(error);
      }

      return data;
    });
};

const getBookmarks = function () {
  return bookmarksFetch(`${BASE_URL}/bookmarks`);
};

const putBookmark = function (bookmark) {
  //let error = '';
  /**
  if (!bookmark.title && !bookmark.url) {
    error = 'Please include a title and url.';
  } else if (!bookmark.title) {
    error = 'Please include a title.';
  } else if (!bookmark.url) {
    error = 'Please include a url.';
  }

  if (error) return new Error(error);
  **/

  // api returns error

  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: bookmark
  };

  return bookmarksFetch(`${BASE_URL}/bookmarks`, options);
};

const patchBookmark = function (id, bookmarkData) {
  const options = {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: bookmarkData
  };

  return bookmarksFetch(`${BASE_URL}/bookmarks/${id}`, options);
};

const deleteBookmark = function (id) {
  return bookmarksFetch(`${BASE_URL}/bookmarks/${id}`, { method: 'DELETE' });
};

export default {
  getBookmarks,
  putBookmark,
  patchBookmark,
  deleteBookmark
};