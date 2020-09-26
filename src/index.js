import $ from 'jquery';
import api from './api';
import store from './store';
import bookmarks from './bookmarks';

//import 'normalize.css'; //<---------where is this located?
import './index.css';

const main = function () {
  api.getBookmarks()
    .then((data) => {
      data.forEach((bookmark) => store.addBookmark('', bookmark));
      bookmarks.render();
      store.resetError();
    });

  bookmarks.bindEventListeners();
  bookmarks.render();
};

$(main);
