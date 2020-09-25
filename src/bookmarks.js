import $ from 'jquery';
import api from './api';
import store from './store';

//import images;

// Allow conversion of form data to JSON
$.fn.extend({
  serializeJson: function () {
    const formData = new FormData(this[0]);
    const o = {};
    formData.forEach((val, name) => o[name] = val);
    return JSON.stringify(o);
  }
});

/********** TEMPLATE GENERATION FUNCTIONS **********/

const generateButton = function (type, version) {
  let parseType = '';
  let classes = '';
  let innerHTML = '';
  let alt = {
    edit: 'An image of a pencil that is an edit button to edit the bookmark.',
    editSubmit: 'An image of a checkmark that that submits edits made to the bookmark.',
    editCancel: 'An image of an x that cancels edits made to the bookmark.',
    editSubmitNew: 'An image of a checkmark that adds the new bookmark.',
    editCancelNew: 'An image of an x that cancels the new bookmark.',
    delete: 'An image of a trash can that deletes the bookmark.',
    deleteMultiple: 'An image of a trash can that deletes the bookmark.',
  };

  if (!type) throw new Error('Given falsy value for type');
  parseType = type.split('-');

  // Create edit button
  if (parseType[0] === 'edit') {
    let editAlt = '';

    if (!parseType[1]) {
      classes = 'class="edit-button js-edit-submit-button item"';
      editAlt = alt.edit;
    } else {
      classes = `class="edit-button js-edit-${parseType[1]}-button item"`;
      if (parseType[1] === 'submit') {
        if (version === 'bookmark') editAlt = alt.editSubmit;
        if (version === 'new-bookmark') editAlt = alt.editSubmitNew;
      } else if (parseType[1] === 'cancel') {
        if (version === 'bookmark') editAlt = alt.editCancel;
        if (version === 'new-bookmark') editAlt = alt.editCancelNew;
      }
    }

    innerHTML = `<img src="../images/edit-submit-button.svg" alt="${editAlt}" class="edit">`;
    // Create delete button
  } else if (parseType[0] === 'delete') {
    let deleteAlt = '';

    if (version === 'bookmark') deleteAlt = alt.delete;
    if (version === 'action-bar') deleteAlt = alt.deleteMultiple;

    classes = 'class="delete-button js-delete-button item"';
    innerHTML = `<img src="../images/delete-button.svg" alt="${deleteAlt}" class="delete">`;
    // Create star button
  } else if (parseType[0] === 'star') {
    let capitalizedStarNum = parseType[1].charAt(0).toUpperCase() + parseType[1].slice(1);

    classes = `class="js-star-${parseType[1]} ${version} item"`;
    innerHTML = `<img src="../images/star-button.svg" alt="${capitalizedStarNum} star rating."
      class="star"></button>`;
    // Create 'New' button
  } else if (parseType[0] === 'new') {
    classes = 'class="create-button js-create-button"';
    innerHTML = 'New';
  } else {
    throw new Error('Given invalid type for button creation.');
  }

  return `<button ${classes}>${innerHTML}</button>`;
};

const generateStarRating = function (rating) {
  let stars = '';

  ['star-one', 'star-two', 'star-three', 'star-four', 'star-five']
    .forEach((star, index) => {
      stars += generateButton(star, index < rating ? 'star-colored' : '');
    });

  return `
    <div class="stars group-row">
      ${stars}
    </div>`;
};

const generateNewBookmarkBody = function (id, url, description) {
  let savedURL = '';
  let savedDescription = '';
  let submitButton = generateButton('edit-submit', 'new-bookmark');
  let cancelButton = generateButton('edit-cancel', 'new-bookmark');

  if (url) savedURL = `value="${url}`;
  if (description) savedDescription = `value="${description}"`;

  return `
    <div class="bookmark-expanded">
      <div class="url group-row">
        <label for="new-url-${id}">URL:</label>
        <input type="text" name="new-url" id="new-url-${id}" placeholder="https://_______.___" 
          ${savedURL}>
      </div>
      <div class="description group-row">
        <label for="new-description-${id}" class="hidden">Enter a description:</label>
        <textarea id="new-description-${id}" name="new-description-${id}"
          placeholder="You can enter a description here." ${savedDescription}></textarea>
      </div>
      <div class="submit-cancel group-row">
        ${submitButton}
        ${cancelButton}
        </div>
    </div>
  `;
};

const generateNewBookmarkHeader = function (id, title, rating) {
  let stars = generateStarRating(rating);
  let savedTitle = '';

  if (title) savedTitle = `value="${title}"`;

  return `
  <div class="bookmark-header group-row">
    <div class="new-title group-row">
      <label for="new-title-${id}">Title:</label>
      <input type="text" name="new-title" ${savedTitle} id="new-title-${id}" class="title item">
    </div>
    ${stars}
  </div>`;
};

const generateNewBookmark = function (id, title, url, description, rating) {
  let header = generateNewBookmarkHeader(id, title, rating);
  let body = generateNewBookmarkBody(id, url, description);

  return `
    <form id="${id}" class="bookmark-wrapper js-edit-bookmark-form">
      ${header}
      ${body}
    </form>`;
};

const generateNewBookmarksSection = function (newBookmarkData) {
  let newBookmarks = '';
  let createButton = generateButton('new');

  newBookmarks = newBookmarkData.reduce((string, newBookmark) => {
    string += generateNewBookmark(newBookmark.id, newBookmark.title,
      newBookmark.url, newBookmark.description, newBookmark.rating);
  });

  return `
    <section id="new-bookmarks">
      <div class="group-row">
        <h2 class="item">Bookmarks you're adding:</h2>
        ${createButton}
      </div>
      ${newBookmarks}
    </section>`;
};

const generateActionsBar = function (newBookmarkExists) {
  let deleteButton = generateButton('delete', 'action-bar');
  let createButton = '';

  if (!newBookmarkExists) createButton = generateButton('new');

  return `
    <div class="group-row bookmarks-actions">
      <form class="js-select-all item">
        <label for="select-all" class="hidden">Select all:</label>
        <input type="checkbox" id="select-all" name="select-all" value="select-all">
      </form>
      ${deleteButton}
      ${createButton}
      <form class="filter item">
        <label for="filter" class="hidden">Filter by:</label>
        <select name="filter" id="filter">
          <option id="label-option" selected disabled>Filter by:</option>
          <option value="5">ooooo</option>
          <option value="4">oooo</option>
          <option value="3">ooo</option>
          <option value="2">oo</option>
          <option value="1">o</option>
        </select>
      </form>
    </div>`;
};

const generateBookmarkBody = function (url, description) {
  let descriptionValue = description;

  if (!description) descriptionValue = 'No description.';

  return `
    <div class="bookmark-expanded">
      <div class="visit-site group-row">
        <a href="${url}">Visit Site</a>
        <p>${url}</p>
      </div>
      <div class="description">
        <p class="description">${descriptionValue}</p>
      </div>
    </div>`;
};

const generateEditBookmarkBody = function (id, url, description) {
  let descriptionValue = '';
  let editSubmitButton = generateButton('edit-submit', 'bookmark');
  let editCancelButton = generateButton('edit-cancel', 'bookmark');
  let deleteButton = generateButton('delete', 'bookmark');

  if (description) descriptionValue = `value="${description}"`;

  return `
    <div class="bookmark-expanded">
      <div class="url group-row">
        <label for="url-${id}" class="hidden">URL:</label>
        <input type="text" name="url" id="url-${id}" placeholder="https://_______.___" 
          value="${url}">
      </div>
      <div class="description group-row">
        <label for="description-${id}" class="hidden">Enter a description:</label>
        <textarea id="description-${id}" name="description-${id}"
          placeholder="You can enter a description here." ${descriptionValue}"></textarea>
      </div>
      <div class="submit-cancel group-row">
        ${editSubmitButton}
        ${editCancelButton}
        ${deleteButton}
      </div>
    </div>`;
};

const generateBookmarkHeader = function (id, title, description, rating) {
  let stars = '';
  let preview = '';
  let hidePreview = '';
  let editButton = generateButton('edit');
  let deleteButton = generateButton('delete', 'bookmark');

  if (!rating) {
    stars = generateStarRating(0);
  } else {
    stars = generateStarRating(rating);
  }

  if (description) {
    preview = description.splice(0, 40);
  } else {
    hidePreview = 'hidden';
  }

  return `
    <div class="bookmark-header group-row">
      <div class="select-title group-row item">
        <input type="checkbox" id="select-${id}" name="select" value="select-${id}">
        <label for="select-${id}" class="hidden">Select bookmark: </label>
        <h3>${title}</h3>
      </div>
      <div class="preview item ${hidePreview}">
        <p>${preview}</p>
      </div>
      <div class="star-edit-delete group-row item">
        ${stars}
        ${editButton}
        ${deleteButton}
      </div>
    </div>`;
};

const generateEditBookmarkHeader = function (id, title, rating) {
  let stars = '';

  if (!rating) {
    stars = generateStarRating(0);
  } else {
    stars = generateStarRating(rating);
  }

  return `
    <div class="bookmark-header group-row">
      <div class="title-text-box group-row item">
        <label for="title-${id}" class="hidden">Title:</label>
        <input type="text" name="title" id="title-${id}" value="${title}" class="title item">
      </div>
      <div class="star-edit-delete group-row item">
        ${stars}
      </div>
    </div>`;
};

const generateBookmark = function (id, title, url, description, rating, expanded, edits) {
  let header = '';
  let body = '';

  if (!edits) {
    header = generateBookmarkHeader(id, title, description, rating);
    if (expanded) body = generateBookmarkBody(id, url, description);
  } else {
    header = generateEditBookmarkHeader(edits.title, edits.rating);
    body = generateEditBookmarkBody(edits.url, edits.description);
  }

  return `
    <div id="${id}" class="bookmark-wrapper">
      ${header}
      ${body}
    </div>`;
};

const generateBookmarksSection = function (bookmarkData, newBookmarkExists) {
  let actionBar = generateActionsBar(newBookmarkExists);
  let bookmarks = '';

  bookmarks = bookmarkData.reduce((string, bookmark) => {
    string += generateBookmark(bookmark.id, bookmark.title, bookmark.url, 
      bookmark.description, bookmark.rating, bookmark.expanded, bookmark.edits);
  }, '');

  return `
    <section id="bookmarks">
      <h2>Bookmarks:</h2>
      ${actionBar}
      <form class="select-bookmarks">
        ${bookmarks}
      </form>
    </section>`;
};

/********** RENDER FUNCTION(S) **********/

const render = function () {
  let bookmarkData = store.bookmarks;
  let newBookmarkData = store.adding;
  let bookmarksHTML = '';
  let newBookmarksHTML = '';

  if (newBookmarkData) {
    newBookmarksHTML = generateNewBookmarksSection(newBookmarkData);
  }

  bookmarksHTML = generateBookmarksSection(bookmarkData, !!(newBookmarkData));

  $('main').html(newBookmarksHTML + bookmarksHTML);
};

/********** EVENT HANDLER FUNCTIONS **********/

/**
 * Desktop: Edit and Deconstlete buttons appear
 * to the right side of the bookmark.
 */
const handleMouseHover = function () {

};

const handleToggleSelectAll = function () {

};

/**
 * Mobile
 */
const handleToggleSelectHold = function () {

};

/**
 * Desktop
 */
const handleToggleSelectClick = function () {

};

const handleFilterSelectClick = function () {

};

const handleVisitSiteClick = function () {

};

const handleStarsClick = function () {

};

const handleToggleExpand = function () {

};

const handleDeleteClick = function () {

};

const handleEditSubmit = function () {

};

const handleEditCancel = function () {

};

/**
 * Edit submit and Delete buttons stay
 * to the right of the bookmark.
 */
const handleEditClick = function () {

};

const handleNewSubmit = function () {

};

const handleNewCancel = function () {

};

const handleNewClick = function () {

};

const bindEventListeners = function () {
  
};

export default {
  render,
  bindEventListeners
};