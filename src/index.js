import $ from 'jquery';
import api from './api';
import store from './store';
import bookmarks from './bookmarks';

//import 'normalize.css'; //<---------where is this located?
import './index.css';

const main = function () {
  //error handling; is this request still need?---------------------
  // ^ bind and add bookmarks.onload(api.getItems()) to bindeventlisteners instead
  /**api.getItems()
    .then((data) => {
      data.forEach((bookmark) => store.addBookmark(bookmark));
      bookmarks.render();
    });*/ //------want to run right away

  bookmarks.bindEventListeners();
  bookmarks.render();
};

$(main);
